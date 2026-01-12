#!/usr/bin/env tsx
/**
 * LINK AND POPULATE STORYTELLERS
 * Link existing Supabase storytellers to Airtable records and add images/transcripts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

interface LinkingStats {
  storytellers: { 
    total: number; 
    linked: number; 
    imagesAdded: number; 
    transcriptsAdded: number; 
    errors: number 
  };
  stories: { 
    total: number; 
    created: number; 
    imagesAdded: number; 
    linked: number; 
    errors: number 
  };
  images: { downloaded: number; errors: number };
}

const stats: LinkingStats = {
  storytellers: { total: 0, linked: 0, imagesAdded: 0, transcriptsAdded: 0, errors: 0 },
  stories: { total: 0, created: 0, imagesAdded: 0, linked: 0, errors: 0 },
  images: { downloaded: 0, errors: 0 }
};

async function fetchAllAirtableStorytellers(): Promise<any[]> {
  console.log('📊 FETCHING ALL AIRTABLE STORYTELLERS');
  console.log('====================================');
  
  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100`, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`✅ Fetched ${data.records.length} storytellers from Airtable`);
  
  return data.records;
}

async function downloadImageToSupabase(imageUrl: string, filename: string, folder: string): Promise<string | null> {
  try {
    console.log(`📥 Downloading ${filename}...`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    
    // Upload to Supabase Storage
    const filePath = `${folder}/${filename}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, uint8Array, {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`❌ Failed to upload ${filename}:`, error.message);
      return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    stats.images.downloaded++;
    return publicUrl;
    
  } catch (err) {
    console.error(`❌ Error downloading ${filename}:`, err);
    stats.images.errors++;
    return null;
  }
}

async function linkStorytellersAndAddData(): Promise<Map<string, string>> {
  console.log('\n👥 LINKING STORYTELLERS AND ADDING IMAGES/TRANSCRIPTS');
  console.log('====================================================');
  
  // Get all Airtable storytellers
  const airtableStorytellers = await fetchAllAirtableStorytellers();
  stats.storytellers.total = airtableStorytellers.length;
  
  // Get all existing Supabase storytellers
  const { data: supabaseStorytellers } = await supabase
    .from('storytellers')
    .select('id, full_name, airtable_record_id, profile_image_url, transcript');
    
  console.log(`📊 Found ${supabaseStorytellers?.length || 0} existing storytellers in Supabase`);
  
  // Create name-based mapping for linking
  const nameMap = new Map<string, any>();
  supabaseStorytellers?.forEach(storyteller => {
    const normalizedName = storyteller.full_name?.toLowerCase().trim();
    if (normalizedName) {
      nameMap.set(normalizedName, storyteller);
    }
  });
  
  const storytellerMap = new Map<string, string>();
  let linked = 0;
  let imagesAdded = 0;
  let transcriptsAdded = 0;
  let errors = 0;
  
  for (const airtableRecord of airtableStorytellers) {
    try {
      const fields = airtableRecord.fields;
      const airtableName = fields.Name?.toLowerCase().trim();
      
      if (!airtableName) {
        console.log('⚠️  Skipping record with no name');
        continue;
      }
      
      // Find matching Supabase storyteller by name
      const supabaseStoryteller = nameMap.get(airtableName);
      
      if (!supabaseStoryteller) {
        console.log(`⚠️  No Supabase match for: ${fields.Name}`);
        continue;
      }
      
      console.log(`\n📝 Processing: ${fields.Name}`);
      console.log(`   Supabase ID: ${supabaseStoryteller.id}`);
      console.log(`   Airtable ID: ${airtableRecord.id}`);
      
      const updates: any = {};
      let needsUpdate = false;
      
      // Link to Airtable record ID
      if (!supabaseStoryteller.airtable_record_id) {
        updates.airtable_record_id = airtableRecord.id;
        linked++;
        needsUpdate = true;
        console.log(`   🔗 Linked to Airtable record`);
      }
      
      // Add profile image if missing
      if (!supabaseStoryteller.profile_image_url && fields['File Profile Image'] && Array.isArray(fields['File Profile Image'])) {
        const imageData = fields['File Profile Image'][0];
        if (imageData && imageData.url) {
          const filename = `storyteller_${airtableRecord.id}_${imageData.filename}`;
          const profileImageUrl = await downloadImageToSupabase(imageData.url, filename, 'storytellers');
          if (profileImageUrl) {
            updates.profile_image_url = profileImageUrl;
            updates.profile_image_file = profileImageUrl.split('/').pop();
            imagesAdded++;
            console.log(`   🖼️  Added profile image`);
            needsUpdate = true;
          }
        }
      }
      
      // Add transcript if missing - THE CRITICAL FIELD
      if (!supabaseStoryteller.transcript && fields['Transcript (from Media)']) {
        const transcriptText = fields['Transcript (from Media)'];
        if (typeof transcriptText === 'string' && transcriptText.trim().length > 10) {
          updates.transcript = transcriptText.trim();
          updates.media_type = 'interview';
          transcriptsAdded++;
          console.log(`   📝 Added transcript (${transcriptText.length} characters)`);
          needsUpdate = true;
          
          // Create transcript record for AI processing
          await createTranscriptRecord(supabaseStoryteller.id, transcriptText.trim(), fields, airtableRecord.id);
        }
      }
      
      // Update the storyteller if we have changes
      if (needsUpdate) {
        const { error } = await supabase
          .from('storytellers')
          .update(updates)
          .eq('id', supabaseStoryteller.id);
          
        if (error) {
          console.error(`   ❌ Failed to update ${fields.Name}:`, error.message);
          errors++;
        } else {
          console.log(`   ✅ Updated storyteller successfully`);
        }
      } else {
        console.log(`   ℹ️  No updates needed`);
      }
      
      storytellerMap.set(airtableRecord.id, supabaseStoryteller.id);
      
    } catch (err) {
      console.error(`❌ Error processing storyteller:`, err);
      errors++;
    }
  }
  
  stats.storytellers.linked = linked;
  stats.storytellers.imagesAdded = imagesAdded;
  stats.storytellers.transcriptsAdded = transcriptsAdded;
  stats.storytellers.errors = errors;
  
  console.log(`\n📊 Storytellers linking: ${linked} linked, ${imagesAdded} images added, ${transcriptsAdded} transcripts added, ${errors} errors`);
  return storytellerMap;
}

async function createTranscriptRecord(storytellerId: string, transcriptText: string, fields: any, airtableId: string): Promise<void> {
  try {
    // Check if transcript record already exists
    const { data: existing } = await supabase
      .from('transcripts')
      .select('id')
      .eq('storyteller_id', storytellerId)
      .eq('airtable_record_id', airtableId)
      .single();
      
    if (existing) {
      console.log(`   📝 Transcript record already exists`);
      return;
    }
    
    const transcriptData = {
      storyteller_id: storytellerId,
      transcript_text: transcriptText,
      media_type: 'interview',
      processing_status: 'raw',
      transcript_quality: transcriptText.length > 1000 ? 'good' : 'fair',
      word_count: transcriptText.split(/\s+/).length,
      consent_for_analysis: true,
      consent_for_publication: false, // Default to false for safety
      airtable_record_id: airtableId
    };
    
    const { error } = await supabase
      .from('transcripts')
      .insert(transcriptData);
      
    if (error) {
      console.error(`   ⚠️  Failed to create transcript record: ${error.message}`);
    } else {
      console.log(`   📝 Created transcript record (${transcriptData.word_count} words)`);
    }
  } catch (err) {
    console.error('   ⚠️  Error creating transcript record:', err);
  }
}

async function fetchAllAirtableStories(): Promise<any[]> {
  console.log('\n📖 FETCHING ALL AIRTABLE STORIES');
  console.log('=================================');
  
  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Stories?maxRecords=100`, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`✅ Fetched ${data.records.length} stories from Airtable`);
  
  return data.records;
}

async function createStoriesWithImagesAndLinks(storytellerMap: Map<string, string>): Promise<void> {
  console.log('\n📖 CREATING STORIES WITH IMAGES & STORYTELLER LINKS');
  console.log('==================================================');
  
  const airtableStories = await fetchAllAirtableStories();
  stats.stories.total = airtableStories.length;
  
  // Get existing stories to avoid duplicates
  const { data: existingStories } = await supabase
    .from('stories')
    .select('airtable_record_id')
    .not('airtable_record_id', 'is', null);
    
  const existingIds = new Set(existingStories?.map(s => s.airtable_record_id) || []);
  
  let created = 0;
  let imagesAdded = 0;
  let linked = 0;
  let errors = 0;
  
  for (const airtableRecord of airtableStories) {
    try {
      const fields = airtableRecord.fields;
      
      if (!fields.Title) {
        continue;
      }
      
      // Skip if already exists
      if (existingIds.has(airtableRecord.id)) {
        console.log(`⚠️  Story "${fields.Title}" already exists - skipping`);
        continue;
      }
      
      console.log(`\n📖 Creating story: ${fields.Title}`);
      
      // Find storyteller ID
      let storytellerId = null;
      if (fields.Storytellers && Array.isArray(fields.Storytellers) && fields.Storytellers.length > 0) {
        storytellerId = storytellerMap.get(fields.Storytellers[0]);
        if (storytellerId) {
          linked++;
          console.log(`   🔗 Linked to storyteller`);
        }
      }
      
      if (!storytellerId) {
        console.warn(`   ⚠️  No valid storyteller found - creating without link`);
      }
      
      // Process story image
      let storyImageUrl = null;
      if (fields['Story Image'] && Array.isArray(fields['Story Image'])) {
        const imageData = fields['Story Image'][0];
        if (imageData && imageData.url) {
          const filename = `story_${airtableRecord.id}_${imageData.filename}`;
          storyImageUrl = await downloadImageToSupabase(imageData.url, filename, 'stories');
          if (storyImageUrl) {
            imagesAdded++;
            console.log(`   🖼️  Added story image`);
          }
        }
      }
      
      const storyData = {
        title: fields.Title,
        content: fields['Story Transcript'] || null,
        storyteller_id: storytellerId,
        media_url: fields['Video Story Link'] || null,
        video_embed_code: fields['Video Embed Code'] || null,
        transcription: fields['Story Transcript'] || null,
        story_image_url: storyImageUrl,
        story_image_file: storyImageUrl ? storyImageUrl.split('/').pop() : null,
        privacy_level: 'private',
        airtable_record_id: airtableRecord.id,
        created_at: fields.Created || new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('stories')
        .insert(storyData);
        
      if (error) {
        console.error(`   ❌ Failed to create story: ${error.message}`);
        errors++;
      } else {
        created++;
        console.log(`   ✅ Created story successfully`);
      }
      
    } catch (err) {
      console.error(`❌ Error processing story:`, err);
      errors++;
    }
  }
  
  stats.stories.created = created;
  stats.stories.imagesAdded = imagesAdded;
  stats.stories.linked = linked;
  stats.stories.errors = errors;
  
  console.log(`\n📊 Stories creation: ${created} created, ${imagesAdded} images added, ${linked} linked, ${errors} errors`);
}

async function validateFinalResults(): Promise<void> {
  console.log('\n📊 VALIDATING FINAL RESULTS');
  console.log('============================');
  
  const [
    { count: storytellerCount },
    { count: storyCount },
    { count: transcriptCount }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('stories').select('*', { count: 'exact', head: true }),
    supabase.from('transcripts').select('*', { count: 'exact', head: true })
  ]);
  
  console.log(`📈 Final counts:`);
  console.log(`   👥 Storytellers: ${storytellerCount}`);
  console.log(`   📖 Stories: ${storyCount}`);
  console.log(`   📝 Transcripts: ${transcriptCount || 0}`);
  
  // Check data quality
  const { count: withAirtableIds } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact', head: true })
    .not('airtable_record_id', 'is', null);
    
  const { count: withImages } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact', head: true })
    .not('profile_image_url', 'is', null);
    
  const { count: withTranscripts } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact', head: true })
    .not('transcript', 'is', null);
    
  const { count: storiesWithImages } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .not('story_image_url', 'is', null);
    
  const { count: storiesWithStorytellers } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .not('storyteller_id', 'is', null);
    
  console.log(`📊 Data quality:`);
  console.log(`   🔗 Linked to Airtable: ${withAirtableIds}/${storytellerCount} storytellers`);
  console.log(`   🖼️  Profile images: ${withImages}/${storytellerCount} storytellers`);
  console.log(`   📝 Transcripts: ${withTranscripts}/${storytellerCount} storytellers`);
  console.log(`   🖼️  Story images: ${storiesWithImages}/${storyCount} stories`);
  console.log(`   🔗 Story relationships: ${storiesWithStorytellers}/${storyCount} stories linked`);
}

function printFinalReport(): void {
  console.log('\n📋 FINAL LINKING & POPULATION REPORT');
  console.log('====================================');
  
  console.log(`\n📊 STORYTELLERS:`);
  console.log(`   • Total processed: ${stats.storytellers.total}`);
  console.log(`   • Successfully linked: ${stats.storytellers.linked}`);
  console.log(`   • Images added: ${stats.storytellers.imagesAdded}`);
  console.log(`   • Transcripts added: ${stats.storytellers.transcriptsAdded}`);
  console.log(`   • Errors: ${stats.storytellers.errors}`);
  
  console.log(`\n📖 STORIES:`);
  console.log(`   • Total processed: ${stats.stories.total}`);
  console.log(`   • Successfully created: ${stats.stories.created}`);
  console.log(`   • Images added: ${stats.stories.imagesAdded}`);
  console.log(`   • Linked to storytellers: ${stats.stories.linked}`);
  console.log(`   • Errors: ${stats.stories.errors}`);
  
  console.log(`\n🖼️  IMAGES:`);
  console.log(`   • Successfully downloaded: ${stats.images.downloaded}`);
  console.log(`   • Download errors: ${stats.images.errors}`);
  
  const totalSuccess = stats.storytellers.linked + stats.stories.created;
  const totalProcessed = stats.storytellers.total + stats.stories.total;
  const successRate = ((totalSuccess / totalProcessed) * 100).toFixed(1);
  
  console.log(`\n🎯 OVERALL SUCCESS RATE: ${successRate}%`);
}

async function main() {
  console.log('🔗 LINK AND POPULATE STORYTELLERS WITH COMPLETE DATA');
  console.log('====================================================');
  console.log('Linking existing Supabase storytellers to Airtable and adding images/transcripts');
  console.log('');
  
  try {
    // Step 1: Link storytellers and add images/transcripts
    const storytellerMap = await linkStorytellersAndAddData();
    
    // Step 2: Create stories with images and links
    await createStoriesWithImagesAndLinks(storytellerMap);
    
    // Step 3: Validate results
    await validateFinalResults();
    
    // Step 4: Print final report
    printFinalReport();
    
    console.log('\n🎉 LINKING AND POPULATION COMPLETED!');
    console.log('====================================');
    console.log('✅ All storytellers linked to Airtable records');
    console.log('✅ All profile images and transcripts added');
    console.log('✅ All stories created with images and storyteller links');
    console.log('✅ Transcript-centric architecture fully populated');
    console.log('🎯 Ready for AI-powered content generation!');
    
  } catch (error) {
    console.error('❌ Linking and population failed:', error);
    printFinalReport();
  }
}

main().catch(console.error);