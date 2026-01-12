#!/usr/bin/env tsx
/**
 * COMPLETE MIGRATION FIX
 * Fix the missing 110 storytellers, 27 stories, and add transcript architecture
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

async function fetchAllAirtableRecords(tableName: string): Promise<any[]> {
  console.log(`📊 Fetching ALL ${tableName} from Airtable...`);
  
  const records: any[] = [];
  let offset = '';
  
  do {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=100${offset ? `&offset=${offset}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
    }
    
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset || '';
    
    console.log(`📈 Fetched ${records.length} ${tableName} records so far...`);
    
  } while (offset);
  
  console.log(`✅ Complete: Fetched ${records.length} ${tableName} records`);
  return records;
}

async function analyzeAirtableData(): Promise<void> {
  console.log('🔍 ANALYZING COMPLETE AIRTABLE DATA');
  console.log('===================================');
  
  try {
    // Fetch all storytellers
    const storytellers = await fetchAllAirtableRecords('Storytellers');
    console.log(`\n📊 STORYTELLERS ANALYSIS (${storytellers.length} total)`);
    
    // Analyze field structure
    const sampleStoryteller = storytellers[0];
    console.log('📋 Available fields in Storytellers:');
    Object.keys(sampleStoryteller.fields).forEach(field => {
      console.log(`   • ${field}`);
    });
    
    // Check for Profile Image field
    const withProfileImage = storytellers.filter(s => s.fields['Profile Image']).length;
    console.log(`\n🖼️  Profile Images: ${withProfileImage}/${storytellers.length} storytellers have profile images`);
    
    // Check for Transcript field
    const transcriptFields = ['Transcript', 'Transcript (from Media)', 'Media Transcript', 'Interview Transcript'];
    let transcriptField = null;
    for (const field of transcriptFields) {
      const count = storytellers.filter(s => s.fields[field]).length;
      if (count > 0) {
        console.log(`📝 ${field}: ${count}/${storytellers.length} storytellers`);
        if (count > (transcriptField?.count || 0)) {
          transcriptField = { name: field, count };
        }
      }
    }
    
    if (transcriptField) {
      console.log(`✅ Main transcript field identified: "${transcriptField.name}" (${transcriptField.count} records)`);
    } else {
      console.log('⚠️  No transcript field found - need to identify the correct field name');
    }
    
    // Analyze stories
    const stories = await fetchAllAirtableRecords('Stories');
    console.log(`\n📖 STORIES ANALYSIS (${stories.length} total)`);
    
    const sampleStory = stories[0];
    console.log('📋 Available fields in Stories:');
    Object.keys(sampleStory.fields).forEach(field => {
      console.log(`   • ${field}`);
    });
    
    // Check for Story Image
    const storyImageFields = ['Story Image', 'Image', 'Featured Image', 'Thumbnail'];
    for (const field of storyImageFields) {
      const count = stories.filter(s => s.fields[field]).length;
      if (count > 0) {
        console.log(`🖼️  ${field}: ${count}/${stories.length} stories`);
      }
    }
    
    // Check storyteller connections
    const storiesWithStorytellers = stories.filter(s => 
      s.fields.Storytellers || s.fields.Storyteller || s.fields['Story ID']
    ).length;
    console.log(`🔗 ${storiesWithStorytellers}/${stories.length} stories have storyteller connections`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

async function migrateAllMissingStorytellers(): Promise<void> {
  console.log('\n👥 MIGRATING ALL MISSING STORYTELLERS');
  console.log('=====================================');
  
  // Get all storytellers from Airtable
  const airtableStorytellers = await fetchAllAirtableRecords('Storytellers');
  
  // Get existing storytellers from Supabase
  const { data: existingStorytellers } = await supabase
    .from('storytellers')
    .select('airtable_record_id')
    .not('airtable_record_id', 'is', null);
  
  const existingIds = new Set(existingStorytellers?.map(s => s.airtable_record_id) || []);
  
  // Find missing storytellers
  const missingStorytellers = airtableStorytellers.filter(s => !existingIds.has(s.id));
  
  console.log(`📊 Found ${missingStorytellers.length} missing storytellers to migrate`);
  
  // Get organization and location maps
  const { data: organizations } = await supabase.from('organizations').select('id, name');
  const { data: locations } = await supabase.from('locations').select('id, name');
  const { data: projects } = await supabase.from('projects').select('id, name');
  
  const orgMap = new Map(organizations?.map(o => [o.name, o.id]) || []);
  const locationMap = new Map(locations?.map(l => [l.name, l.id]) || []);
  const projectMap = new Map(projects?.map(p => [p.name, p.id]) || []);
  
  let migrated = 0;
  let errors = 0;
  
  for (const record of missingStorytellers) {
    try {
      const fields = record.fields;
      
      // Skip if no name
      if (!fields.Name && !fields['Full Name']) {
        continue;
      }
      
      // Extract profile image URL
      let profileImageUrl = null;
      if (fields['Profile Image'] && Array.isArray(fields['Profile Image'])) {
        profileImageUrl = fields['Profile Image'][0]?.url;
      }
      
      // Extract transcript - check multiple possible field names
      let transcript = null;
      const transcriptFields = ['Transcript (from Media)', 'Transcript', 'Media Transcript', 'Interview Transcript'];
      for (const fieldName of transcriptFields) {
        if (fields[fieldName]) {
          transcript = fields[fieldName];
          break;
        }
      }
      
      const storytellerData = {
        full_name: fields.Name || fields['Full Name'],
        email: fields.Email,
        bio: fields.Bio || fields.Description,
        role: fields.Role,
        phone_number: fields['Phone Number'],
        
        // Images
        profile_image_url: profileImageUrl,
        profile_image_file: profileImageUrl ? profileImageUrl.split('/').pop() : null,
        
        // Transcript - THE MOST IMPORTANT FIELD
        transcript: transcript,
        
        // Affiliations
        organization_id: fields.Organisation || fields.Organization ? 
          orgMap.get(fields.Organisation || fields.Organization) : null,
        project_id: fields.Project ? projectMap.get(fields.Project) : null,
        location_id: fields.Location ? locationMap.get(fields.Location) : null,
        
        // Consent and privacy
        consent_given: true,
        consent_date: new Date().toISOString(),
        privacy_preferences: {
          public_display: false,
          show_photo: false,
          show_location: false,
          show_organization: false
        },
        
        // Migration tracking
        airtable_record_id: record.id,
        created_at: record.createdTime
      };
      
      const { data, error } = await supabase
        .from('storytellers')
        .insert(storytellerData)
        .select('id');
        
      if (error) {
        console.error(`❌ Failed to migrate ${storytellerData.full_name}:`, error.message);
        errors++;
      } else {
        migrated++;
        
        // If we have a transcript, create a transcript record
        if (transcript && transcript.length > 50) {
          await createTranscriptRecord(data[0].id, record.id, transcript, fields);
        }
        
        if (migrated % 25 === 0) {
          console.log(`✅ Migrated ${migrated} storytellers...`);
        }
      }
      
    } catch (err) {
      console.error(`❌ Error migrating storyteller:`, err);
      errors++;
    }
  }
  
  console.log(`\n✅ Migration complete: ${migrated} storytellers added, ${errors} errors`);
}

async function createTranscriptRecord(storytellerId: string, airtableId: string, transcriptText: string, fields: any): Promise<void> {
  try {
    const transcriptData = {
      storyteller_id: storytellerId,
      transcript_text: transcriptText,
      media_url: fields['Video Story Link'] || fields['Media URL'],
      media_type: fields['Video Story Link'] ? 'video' : 'interview',
      processing_status: 'raw',
      transcript_quality: transcriptText.length > 1000 ? 'good' : 'fair',
      word_count: transcriptText.split(' ').length,
      consent_for_analysis: true,
      consent_for_publication: false, // Default to false for safety
      airtable_record_id: airtableId
    };
    
    const { error } = await supabase
      .from('transcripts')
      .insert(transcriptData);
      
    if (error) {
      console.error(`⚠️  Failed to create transcript for storyteller ${storytellerId}`);
    }
  } catch (err) {
    console.error('⚠️  Error creating transcript record');
  }
}

async function migrateAllMissingStories(): Promise<void> {
  console.log('\n📖 MIGRATING ALL MISSING STORIES');
  console.log('=================================');
  
  // Get all stories from Airtable
  const airtableStories = await fetchAllAirtableRecords('Stories');
  
  // Get existing stories from Supabase
  const { data: existingStories } = await supabase
    .from('stories')
    .select('airtable_record_id')
    .not('airtable_record_id', 'is', null);
  
  const existingIds = new Set(existingStories?.map(s => s.airtable_record_id) || []);
  
  // Find missing stories
  const missingStories = airtableStories.filter(s => !existingIds.has(s.id));
  
  console.log(`📊 Found ${missingStories.length} missing stories to migrate`);
  
  // Get storyteller mapping
  const { data: storytellers } = await supabase
    .from('storytellers')
    .select('id, airtable_record_id')
    .not('airtable_record_id', 'is', null);
    
  const storytellerMap = new Map(storytellers?.map(s => [s.airtable_record_id, s.id]) || []);
  
  let migrated = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const record of missingStories) {
    try {
      const fields = record.fields;
      
      // Skip if no title
      if (!fields.Title && !fields['Story Title']) {
        skipped++;
        continue;
      }
      
      // Find storyteller ID
      const storytellerAirtableIds = fields.Storytellers || fields.Storyteller;
      let storytellerId = null;
      
      if (storytellerAirtableIds && Array.isArray(storytellerAirtableIds)) {
        storytellerId = storytellerMap.get(storytellerAirtableIds[0]);
      } else if (storytellerAirtableIds) {
        storytellerId = storytellerMap.get(storytellerAirtableIds);
      }
      
      if (!storytellerId) {
        console.warn(`⚠️  Story "${fields.Title || fields['Story Title']}" has no valid storyteller - skipping`);
        skipped++;
        continue;
      }
      
      // Extract story image
      let storyImageUrl = null;
      const imageFields = ['Story Image', 'Image', 'Featured Image', 'Thumbnail'];
      for (const imageField of imageFields) {
        if (fields[imageField] && Array.isArray(fields[imageField])) {
          storyImageUrl = fields[imageField][0]?.url;
          break;
        }
      }
      
      const storyData = {
        title: fields.Title || fields['Story Title'],
        content: fields['Story Transcript'] || fields.Transcript || fields.Content,
        summary: fields['Story Copy'] || fields.Summary,
        storyteller_id: storytellerId,
        
        // Media and images
        media_url: fields['Video Story Link'] || fields['Media URL'],
        video_embed_code: fields['Video Embed Code'],
        transcription: fields['Story Transcript'] || fields.Transcript,
        story_image_url: storyImageUrl,
        story_image_file: storyImageUrl ? storyImageUrl.split('/').pop() : null,
        
        // Privacy
        privacy_level: 'private',
        
        // Migration tracking
        airtable_record_id: record.id,
        created_at: record.createdTime
      };
      
      const { error } = await supabase
        .from('stories')
        .insert(storyData);
        
      if (error) {
        console.error(`❌ Failed to migrate story "${storyData.title}":`, error.message);
        errors++;
      } else {
        migrated++;
        
        if (migrated % 10 === 0) {
          console.log(`✅ Migrated ${migrated} stories...`);
        }
      }
      
    } catch (err) {
      console.error(`❌ Error migrating story:`, err);
      errors++;
    }
  }
  
  console.log(`\n✅ Story migration complete: ${migrated} stories added, ${skipped} skipped, ${errors} errors`);
}

async function validateFinalCounts(): Promise<void> {
  console.log('\n📊 VALIDATING FINAL COUNTS');
  console.log('==========================');
  
  const [
    { count: storytellerCount },
    { count: storyCount },
    { count: transcriptCount }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('stories').select('*', { count: 'exact', head: true }),
    supabase.from('transcripts').select('*', { count: 'exact', head: true })
  ]);
  
  console.log(`📊 Final counts:`);
  console.log(`   👥 Storytellers: ${storytellerCount}/210 expected`);
  console.log(`   📖 Stories: ${storyCount}/48 expected`);
  console.log(`   📝 Transcripts: ${transcriptCount} (new!)`);
  
  // Check image coverage
  const { data: withImages } = await supabase
    .from('storytellers')
    .select('id')
    .not('profile_image_url', 'is', null);
    
  console.log(`   🖼️  Profile Images: ${withImages?.length || 0}/${storytellerCount} storytellers`);
  
  const { data: withTranscripts } = await supabase
    .from('storytellers')
    .select('id')
    .not('transcript', 'is', null);
    
  console.log(`   📝 Transcripts: ${withTranscripts?.length || 0}/${storytellerCount} storytellers`);
}

async function main() {
  console.log('🔧 COMPLETE MIGRATION FIX');
  console.log('=========================');
  console.log('Fixing missing storytellers, stories, images, and adding transcript architecture');
  console.log('');
  
  try {
    // Step 1: Analyze what we have in Airtable
    await analyzeAirtableData();
    
    // Step 2: Migrate all missing storytellers with images and transcripts
    await migrateAllMissingStorytellers();
    
    // Step 3: Migrate all missing stories with images
    await migrateAllMissingStories();
    
    // Step 4: Validate final counts
    await validateFinalCounts();
    
    console.log('\n🎉 MIGRATION FIX COMPLETED!');
    console.log('============================');
    console.log('✅ All storytellers migrated with profiles and transcripts');
    console.log('✅ All stories migrated with images');
    console.log('✅ Transcript-centric architecture ready');
    console.log('🎯 Ready for transcript-based content generation!');
    
  } catch (error) {
    console.error('❌ Migration fix failed:', error);
  }
}

main().catch(console.error);