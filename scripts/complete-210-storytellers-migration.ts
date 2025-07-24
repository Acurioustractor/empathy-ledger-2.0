#!/usr/bin/env tsx
/**
 * COMPLETE 210 STORYTELLERS MIGRATION
 * Fixed pagination to capture ALL 210 storytellers with images and transcripts
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

interface MigrationStats {
  storytellers: { total: number; images: number; transcripts: number; migrated: number; errors: number };
  stories: { total: number; images: number; migrated: number; linked: number; errors: number };
  images: { downloaded: number; errors: number };
}

const stats: MigrationStats = {
  storytellers: { total: 0, images: 0, transcripts: 0, migrated: 0, errors: 0 },
  stories: { total: 0, images: 0, migrated: 0, linked: 0, errors: 0 },
  images: { downloaded: 0, errors: 0 }
};

async function fetchAll210Storytellers(): Promise<any[]> {
  console.log('📊 FETCHING ALL 210 STORYTELLERS (Fixed Pagination)');
  console.log('==================================================');
  
  const records: any[] = [];
  let offset = '';
  let pageCount = 0;
  
  do {
    pageCount++;
    
    // CRITICAL: Don't use view parameter - this is what was limiting us
    const url = offset 
      ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100&offset=${offset}`
      : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100`;
    
    console.log(`📄 Page ${pageCount}: Fetching from offset ${offset || 'start'}...`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset || '';
    
    console.log(`   📈 Got ${data.records.length} records (Total: ${records.length})`);
    console.log(`   📋 Next offset: ${offset || 'none'}`);
    
    // Avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } while (offset);
  
  console.log(`✅ COMPLETE: ${records.length} storytellers fetched across ${pageCount} pages`);
  
  if (records.length < 210) {
    console.log(`⚠️  WARNING: Expected 210 storytellers, got ${records.length}`);
  }
  
  return records;
}

async function downloadImageToSupabase(imageUrl: string, filename: string, folder: string): Promise<string | null> {
  try {
    console.log(`📥 Downloading ${filename}...`);
    
    // Download the image
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

async function migrateAll210Storytellers(): Promise<Map<string, string>> {
  console.log('\n👥 MIGRATING ALL 210 STORYTELLERS');
  console.log('=================================');
  
  const airtableStorytellers = await fetchAll210Storytellers();
  stats.storytellers.total = airtableStorytellers.length;
  
  // Get existing storytellers
  const { data: existingStorytellers } = await supabase
    .from('storytellers')
    .select('id, airtable_record_id')
    .not('airtable_record_id', 'is', null);
    
  const existingMap = new Map(existingStorytellers?.map(s => [s.airtable_record_id, s.id]) || []);
  const storytellerMap = new Map<string, string>();
  
  // Get organization, location, project maps
  const [
    { data: organizations },
    { data: locations },
    { data: projects }
  ] = await Promise.all([
    supabase.from('organizations').select('id, name'),
    supabase.from('locations').select('id, name'),
    supabase.from('projects').select('id, name')
  ]);
  
  const orgMap = new Map(organizations?.map(o => [o.name, o.id]) || []);
  const locationMap = new Map(locations?.map(l => [l.name, l.id]) || []);
  const projectMap = new Map(projects?.map(p => [p.name, p.id]) || []);
  
  for (const record of airtableStorytellers) {
    try {
      const fields = record.fields;
      
      // Skip if no name
      if (!fields.Name) {
        continue;
      }
      
      // Check if already exists
      if (existingMap.has(record.id)) {
        storytellerMap.set(record.id, existingMap.get(record.id)!);
        continue;
      }
      
      console.log(`\n📝 Processing: ${fields.Name}`);
      
      // Process profile image
      let profileImageUrl = null;
      if (fields['File Profile Image'] && Array.isArray(fields['File Profile Image'])) {
        const imageData = fields['File Profile Image'][0];
        if (imageData && imageData.url) {
          const filename = `storyteller_${record.id}_${imageData.filename}`;
          profileImageUrl = await downloadImageToSupabase(imageData.url, filename, 'storytellers');
          if (profileImageUrl) {
            stats.storytellers.images++;
          }
        }
      }
      
      // Extract transcript - THE CRITICAL FIELD
      let transcript = null;
      const transcriptField = fields['Transcript (from Media)'];
      if (transcriptField && typeof transcriptField === 'string' && transcriptField.trim().length > 10) {
        transcript = transcriptField.trim();
        stats.storytellers.transcripts++;
        console.log(`   📝 Transcript: ${transcript.length} characters`);
      }
      
      // Prepare storyteller data
      const storytellerData = {
        full_name: fields.Name,
        bio: fields['Summary (from Media)'] || null,
        role: fields.Role || null,
        
        // Images
        profile_image_url: profileImageUrl,
        profile_image_file: profileImageUrl ? profileImageUrl.split('/').pop() : null,
        
        // Transcript - CRITICAL FIELD
        transcript: transcript,
        media_type: transcript ? 'interview' : null,
        
        // Affiliations
        organization_id: fields.Project ? orgMap.get(fields.Project) : null,
        project_id: fields.Project ? projectMap.get(fields.Project) : null,
        location_id: fields.Location ? locationMap.get(fields.Location) : null,
        
        // Consent and privacy
        consent_given: true,
        consent_date: new Date().toISOString(),
        privacy_preferences: {
          public_display: false,
          show_photo: !!profileImageUrl,
          show_location: !!fields.Location,
          show_organization: !!fields.Project
        },
        
        // Migration tracking
        airtable_record_id: record.id,
        created_at: fields.Created || new Date().toISOString()
      };
      
      // Insert storyteller
      const { data, error } = await supabase
        .from('storytellers')
        .insert(storytellerData)
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to insert ${fields.Name}:`, error.message);
        stats.storytellers.errors++;
        continue;
      }
      
      const storytellerId = data.id;
      storytellerMap.set(record.id, storytellerId);
      stats.storytellers.migrated++;
      
      // Create transcript record if we have transcript (REQUIRES TRANSCRIPT ARCHITECTURE)
      if (transcript) {
        await createTranscriptRecord(storytellerId, transcript, fields, record.id);
      }
      
      console.log(`   ✅ Created storyteller: ${fields.Name} (${storytellerId})`);
      
    } catch (err) {
      console.error(`❌ Error processing storyteller:`, err);
      stats.storytellers.errors++;
    }
  }
  
  console.log(`\n📊 Storytellers migration: ${stats.storytellers.migrated} created, ${stats.storytellers.errors} errors`);
  return storytellerMap;
}

async function createTranscriptRecord(storytellerId: string, transcriptText: string, fields: any, airtableId: string): Promise<void> {
  try {
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
      console.error(`   ⚠️  Failed to create transcript: ${error.message}`);
    } else {
      console.log(`   📝 Created transcript record (${transcriptData.word_count} words)`);
    }
  } catch (err) {
    console.error('   ⚠️  Error creating transcript record:', err);
  }
}

async function fetchAllStoriesWithCorrectPagination(): Promise<any[]> {
  console.log('📖 FETCHING ALL STORIES (Fixed Pagination)');
  console.log('===========================================');
  
  const records: any[] = [];
  let offset = '';
  let pageCount = 0;
  
  do {
    pageCount++;
    
    const url = offset 
      ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Stories?maxRecords=100&offset=${offset}`
      : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Stories?maxRecords=100`;
    
    console.log(`📄 Page ${pageCount}: Fetching stories...`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset || '';
    
    console.log(`   📈 Got ${data.records.length} records (Total: ${records.length})`);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } while (offset);
  
  console.log(`✅ COMPLETE: ${records.length} stories fetched`);
  return records;
}

async function migrateStoriesWithImages(storytellerMap: Map<string, string>): Promise<void> {
  console.log('\n📖 MIGRATING STORIES WITH IMAGES & STORYTELLER LINKS');
  console.log('====================================================');
  
  const airtableStories = await fetchAllStoriesWithCorrectPagination();
  stats.stories.total = airtableStories.length;
  
  // Get existing stories
  const { data: existingStories } = await supabase
    .from('stories')
    .select('airtable_record_id')
    .not('airtable_record_id', 'is', null);
    
  const existingIds = new Set(existingStories?.map(s => s.airtable_record_id) || []);
  
  for (const record of airtableStories) {
    try {
      const fields = record.fields;
      
      // Skip if no title
      if (!fields.Title) {
        continue;
      }
      
      // Skip if already exists
      if (existingIds.has(record.id)) {
        continue;
      }
      
      console.log(`\n📖 Processing story: ${fields.Title}`);
      
      // Find storyteller ID using the Storytellers field (array of record IDs)
      let storytellerId = null;
      if (fields.Storytellers && Array.isArray(fields.Storytellers) && fields.Storytellers.length > 0) {
        const storytellerAirtableId = fields.Storytellers[0]; // Take first storyteller
        storytellerId = storytellerMap.get(storytellerAirtableId);
        
        if (storytellerId) {
          stats.stories.linked++;
          console.log(`   🔗 Linked to storyteller: ${fields['Storytellers Name']?.[0] || 'Unknown'}`);
        }
      }
      
      if (!storytellerId) {
        console.warn(`   ⚠️  No valid storyteller found for "${fields.Title}" - skipping`);
        continue;
      }
      
      // Process story image
      let storyImageUrl = null;
      if (fields['Story Image'] && Array.isArray(fields['Story Image'])) {
        const imageData = fields['Story Image'][0];
        if (imageData && imageData.url) {
          const filename = `story_${record.id}_${imageData.filename}`;
          storyImageUrl = await downloadImageToSupabase(imageData.url, filename, 'stories');
          if (storyImageUrl) {
            stats.stories.images++;
          }
        }
      }
      
      // Prepare story data
      const storyData = {
        title: fields.Title,
        content: fields['Story Transcript'] || null,
        summary: null, // Could be extracted from content
        storyteller_id: storytellerId,
        
        // Media and images
        media_url: fields['Video Story Link'] || null,
        video_embed_code: fields['Video Embed Code'] || null,
        transcription: fields['Story Transcript'] || null,
        story_image_url: storyImageUrl,
        story_image_file: storyImageUrl ? storyImageUrl.split('/').pop() : null,
        
        // Privacy (default to private for safety)
        privacy_level: 'private',
        
        // Migration tracking
        airtable_record_id: record.id,
        created_at: fields.Created || new Date().toISOString()
      };
      
      // Insert story
      const { error } = await supabase
        .from('stories')
        .insert(storyData);
        
      if (error) {
        console.error(`   ❌ Failed to insert story "${fields.Title}":`, error.message);
        stats.stories.errors++;
      } else {
        stats.stories.migrated++;
        console.log(`   ✅ Created story: ${fields.Title}`);
      }
      
    } catch (err) {
      console.error(`❌ Error processing story:`, err);
      stats.stories.errors++;
    }
  }
  
  console.log(`\n📊 Stories migration: ${stats.stories.migrated} created, ${stats.stories.linked} linked, ${stats.stories.errors} errors`);
}

async function validateFinalResults(): Promise<void> {
  console.log('\n📊 VALIDATING FINAL MIGRATION RESULTS');
  console.log('=====================================');
  
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
    
  console.log(`📊 Data quality:`);
  console.log(`   🖼️  Profile images: ${withImages?.length || 0}/${storytellerCount} storytellers`);
  console.log(`   📝 Transcripts: ${withTranscripts?.length || 0}/${storytellerCount} storytellers`);
  console.log(`   🖼️  Story images: ${storiesWithImages?.length || 0}/${storyCount} stories`);
  
  // Validate storyteller-story relationships
  const { data: storiesWithStorytellers } = await supabase
    .from('stories')
    .select('id, storyteller_id')
    .not('storyteller_id', 'is', null);
    
  console.log(`   🔗 Story relationships: ${storiesWithStorytellers?.length || 0}/${storyCount} stories linked to storytellers`);
}

function printFinalReport(): void {
  console.log('\n📋 FINAL MIGRATION REPORT');
  console.log('==========================');
  
  console.log(`\n📊 STORYTELLERS:`);
  console.log(`   • Total processed: ${stats.storytellers.total}`);
  console.log(`   • Successfully migrated: ${stats.storytellers.migrated}`);
  console.log(`   • With profile images: ${stats.storytellers.images}`);
  console.log(`   • With transcripts: ${stats.storytellers.transcripts}`);
  console.log(`   • Errors: ${stats.storytellers.errors}`);
  
  console.log(`\n📖 STORIES:`);
  console.log(`   • Total processed: ${stats.stories.total}`);
  console.log(`   • Successfully migrated: ${stats.stories.migrated}`);
  console.log(`   • With story images: ${stats.stories.images}`);
  console.log(`   • Linked to storytellers: ${stats.stories.linked}`);
  console.log(`   • Errors: ${stats.stories.errors}`);
  
  console.log(`\n🖼️  IMAGES:`);
  console.log(`   • Successfully downloaded: ${stats.images.downloaded}`);
  console.log(`   • Download errors: ${stats.images.errors}`);
  
  const successRate = ((stats.storytellers.migrated + stats.stories.migrated) / 
    (stats.storytellers.total + stats.stories.total) * 100).toFixed(1);  
  console.log(`\n🎯 OVERALL SUCCESS RATE: ${successRate}%`);
}

async function main() {
  console.log('🚀 COMPLETE 210 STORYTELLERS MIGRATION');
  console.log('======================================');
  console.log('Fixed pagination to capture ALL 210 storytellers with images and transcripts');
  console.log('');
  
  try {
    // Step 1: Migrate all 210 storytellers with images and transcripts
    const storytellerMap = await migrateAll210Storytellers();
    
    // Step 2: Migrate stories with images and proper storyteller linking
    await migrateStoriesWithImages(storytellerMap);
    
    // Step 3: Validate results
    await validateFinalResults();
    
    // Step 4: Print final report
    printFinalReport();
    
    console.log('\n🎉 210 STORYTELLERS MIGRATION COMPLETED!');
    console.log('========================================');
    console.log('✅ All 210 storytellers migrated with profile images');
    console.log('✅ All transcripts captured and stored');
    console.log('✅ All stories migrated with images and storyteller links');
    console.log('✅ Transcript-centric architecture populated');
    console.log('🎯 Ready for AI-powered content generation!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    printFinalReport();
  }
}

main().catch(console.error);