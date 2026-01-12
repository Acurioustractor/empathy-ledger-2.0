#!/usr/bin/env tsx
/**
 * UPDATE EXISTING STORYTELLERS WITH IMAGES AND TRANSCRIPTS
 * Add missing images and transcripts to already migrated storytellers
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

interface UpdateStats {
  storytellers: { total: number; imagesAdded: number; transcriptsAdded: number; errors: number };
  stories: { total: number; imagesAdded: number; linked: number; errors: number };
  images: { downloaded: number; errors: number };
}

const stats: UpdateStats = {
  storytellers: { total: 0, imagesAdded: 0, transcriptsAdded: 0, errors: 0 },
  stories: { total: 0, imagesAdded: 0, linked: 0, errors: 0 },
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

async function updateStorytellersWithImagesAndTranscripts(): Promise<Map<string, string>> {
  console.log('\n👥 UPDATING EXISTING STORYTELLERS WITH IMAGES & TRANSCRIPTS');
  console.log('=========================================================');
  
  // Get all Airtable storytellers
  const airtableStorytellers = await fetchAllAirtableStorytellers();
  stats.storytellers.total = airtableStorytellers.length;
  
  // Get existing storytellers from Supabase
  const { data: existingStorytellers } = await supabase
    .from('storytellers')
    .select('id, full_name, airtable_record_id, profile_image_url, transcript')
    .not('airtable_record_id', 'is', null);
    
  console.log(`📊 Found ${existingStorytellers?.length || 0} existing storytellers in Supabase`);
  
  const existingMap = new Map(existingStorytellers?.map(s => [s.airtable_record_id, s]) || []);
  const storytellerMap = new Map<string, string>();
  
  let imagesAdded = 0;
  let transcriptsAdded = 0;
  let errors = 0;
  
  for (const airtableRecord of airtableStorytellers) {
    try {
      const fields = airtableRecord.fields;
      const existingStoryteller = existingMap.get(airtableRecord.id);
      
      if (!existingStoryteller) {
        console.log(`⚠️  Skipping ${fields.Name} - not found in Supabase`);
        continue;
      }
      
      console.log(`\n📝 Processing: ${fields.Name} (${existingStoryteller.id})`);
      
      const updates: any = {};
      let needsUpdate = false;
      
      // Process profile image if missing
      if (!existingStoryteller.profile_image_url && fields['File Profile Image'] && Array.isArray(fields['File Profile Image'])) {
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
      
      // Process transcript if missing - THE CRITICAL FIELD
      if (!existingStoryteller.transcript && fields['Transcript (from Media)']) {
        const transcriptText = fields['Transcript (from Media)'];
        if (typeof transcriptText === 'string' && transcriptText.trim().length > 10) {
          updates.transcript = transcriptText.trim();
          updates.media_type = 'interview';
          transcriptsAdded++;
          console.log(`   📝 Added transcript (${transcriptText.length} characters)`);
          needsUpdate = true;
          
          // Create transcript record for AI processing
          await createTranscriptRecord(existingStoryteller.id, transcriptText.trim(), fields, airtableRecord.id);
        }
      }
      
      // Update the storyteller if we have changes
      if (needsUpdate) {
        const { error } = await supabase
          .from('storytellers')
          .update(updates)
          .eq('id', existingStoryteller.id);
          
        if (error) {
          console.error(`   ❌ Failed to update ${fields.Name}:`, error.message);
          errors++;
        } else {
          console.log(`   ✅ Updated storyteller successfully`);
        }
      } else {
        console.log(`   ℹ️  No updates needed`);
      }
      
      storytellerMap.set(airtableRecord.id, existingStoryteller.id);
      
    } catch (err) {
      console.error(`❌ Error processing storyteller:`, err);
      errors++;
    }
  }
  
  stats.storytellers.imagesAdded = imagesAdded;
  stats.storytellers.transcriptsAdded = transcriptsAdded;
  stats.storytellers.errors = errors;
  
  console.log(`\n📊 Storytellers update: ${imagesAdded} images added, ${transcriptsAdded} transcripts added, ${errors} errors`);
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

async function updateStoriesWithImagesAndLinks(storytellerMap: Map<string, string>): Promise<void> {
  console.log('\n📖 UPDATING STORIES WITH IMAGES & STORYTELLER LINKS');
  console.log('==================================================');
  
  const airtableStories = await fetchAllAirtableStories();
  stats.stories.total = airtableStories.length;
  
  // Get existing stories
  const { data: existingStories } = await supabase
    .from('stories')
    .select('id, title, airtable_record_id, story_image_url, storyteller_id')
    .not('airtable_record_id', 'is', null);
    
  const existingStoriesMap = new Map(existingStories?.map(s => [s.airtable_record_id, s]) || []);
  
  let imagesAdded = 0;
  let linked = 0;
  let errors = 0;
  
  for (const airtableRecord of airtableStories) {
    try {
      const fields = airtableRecord.fields;
      const existingStory = existingStoriesMap.get(airtableRecord.id);
      
      if (!existingStory) {
        // This is a new story - create it
        console.log(`\n📖 Creating new story: ${fields.Title}`);
        
        // Find storyteller ID
        let storytellerId = null;
        if (fields.Storytellers && Array.isArray(fields.Storytellers) && fields.Storytellers.length > 0) {
          storytellerId = storytellerMap.get(fields.Storytellers[0]);
        }
        
        if (!storytellerId) {
          console.warn(`   ⚠️  No valid storyteller found - skipping`);
          continue;
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
          linked++;
          console.log(`   ✅ Created story successfully`);
        }
        
      } else {
        // Update existing story if needed
        console.log(`\n📖 Checking existing story: ${fields.Title}`);
        
        const updates: any = {};
        let needsUpdate = false;
        
        // Add image if missing
        if (!existingStory.story_image_url && fields['Story Image'] && Array.isArray(fields['Story Image'])) {
          const imageData = fields['Story Image'][0];
          if (imageData && imageData.url) {
            const filename = `story_${airtableRecord.id}_${imageData.filename}`;
            const storyImageUrl = await downloadImageToSupabase(imageData.url, filename, 'stories');
            if (storyImageUrl) {
              updates.story_image_url = storyImageUrl;
              updates.story_image_file = storyImageUrl.split('/').pop();
              imagesAdded++;
              needsUpdate = true;
              console.log(`   🖼️  Added story image`);
            }
          }
        }
        
        // Link to storyteller if missing
        if (!existingStory.storyteller_id && fields.Storytellers && Array.isArray(fields.Storytellers)) {
          const storytellerId = storytellerMap.get(fields.Storytellers[0]);
          if (storytellerId) {
            updates.storyteller_id = storytellerId;
            linked++;
            needsUpdate = true;
            console.log(`   🔗 Linked to storyteller`);
          }
        }
        
        if (needsUpdate) {
          const { error } = await supabase
            .from('stories')
            .update(updates)
            .eq('id', existingStory.id);
            
          if (error) {
            console.error(`   ❌ Failed to update story: ${error.message}`);
            errors++;
          } else {
            console.log(`   ✅ Updated story successfully`);
          }
        } else {
          console.log(`   ℹ️  No updates needed`);
        }
      }
      
    } catch (err) {
      console.error(`❌ Error processing story:`, err);
      errors++;
    }
  }
  
  stats.stories.imagesAdded = imagesAdded;
  stats.stories.linked = linked;
  stats.stories.errors = errors;
  
  console.log(`\n📊 Stories update: ${imagesAdded} images added, ${linked} linked, ${errors} errors`);
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
  const { data: withImages } = await supabase
    .from('storytellers')
    .select('id')
    .not('profile_image_url', 'is', null);
    
  const { data: withTranscripts } = await supabase
    .from('storytellers')
    .select('id')
    .not('transcript', 'is', null);
    
  const { data: storiesWithImages } = await supabase
    .from('stories')
    .select('id')
    .not('story_image_url', 'is', null);
    
  const { data: storiesWithStorytellers } = await supabase
    .from('stories')
    .select('id')
    .not('storyteller_id', 'is', null);
    
  console.log(`📊 Data quality:`);
  console.log(`   🖼️  Profile images: ${withImages?.length || 0}/${storytellerCount} storytellers`);
  console.log(`   📝 Transcripts: ${withTranscripts?.length || 0}/${storytellerCount} storytellers`);
  console.log(`   🖼️  Story images: ${storiesWithImages?.length || 0}/${storyCount} stories`);
  console.log(`   🔗 Story relationships: ${storiesWithStorytellers?.length || 0}/${storyCount} stories linked`);
}

function printFinalReport(): void {
  console.log('\n📋 FINAL UPDATE REPORT');
  console.log('=======================');
  
  console.log(`\n📊 STORYTELLERS:`);
  console.log(`   • Total processed: ${stats.storytellers.total}`);
  console.log(`   • Images added: ${stats.storytellers.imagesAdded}`);
  console.log(`   • Transcripts added: ${stats.storytellers.transcriptsAdded}`);
  console.log(`   • Errors: ${stats.storytellers.errors}`);
  
  console.log(`\n📖 STORIES:`);
  console.log(`   • Total processed: ${stats.stories.total}`);
  console.log(`   • Images added: ${stats.stories.imagesAdded}`);
  console.log(`   • Stories linked: ${stats.stories.linked}`);
  console.log(`   • Errors: ${stats.stories.errors}`);
  
  console.log(`\n🖼️  IMAGES:`);
  console.log(`   • Successfully downloaded: ${stats.images.downloaded}`);
  console.log(`   • Download errors: ${stats.images.errors}`);
}

async function main() {
  console.log('🔄 UPDATE EXISTING RECORDS WITH IMAGES & TRANSCRIPTS');
  console.log('====================================================');
  console.log('Adding missing images and transcripts to existing storytellers and stories');
  console.log('');
  
  try {
    // Step 1: Update storytellers with images and transcripts
    const storytellerMap = await updateStorytellersWithImagesAndTranscripts();
    
    // Step 2: Update stories with images and links
    await updateStoriesWithImagesAndLinks(storytellerMap);
    
    // Step 3: Validate results
    await validateFinalResults();
    
    // Step 4: Print final report
    printFinalReport();
    
    console.log('\n🎉 UPDATE COMPLETED!');
    console.log('====================');
    console.log('✅ All existing storytellers updated with images and transcripts');
    console.log('✅ All stories updated with images and storyteller links');
    console.log('✅ Transcript-centric architecture fully populated');
    console.log('🎯 Ready for AI-powered content generation!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    printFinalReport();
  }
}

main().catch(console.error);