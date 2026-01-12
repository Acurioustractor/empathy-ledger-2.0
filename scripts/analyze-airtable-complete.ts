#!/usr/bin/env tsx
/**
 * COMPLETE AIRTABLE ANALYSIS
 * Get the full picture of what's actually in Airtable
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function fetchAllRecordsWithPagination(tableName: string): Promise<any[]> {
  console.log(`📊 Fetching ALL ${tableName} with complete pagination...`);
  
  const records: any[] = [];
  let offset = '';
  let pageCount = 0;
  
  do {
    pageCount++;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=100${offset ? `&offset=${offset}` : ''}`;
    
    console.log(`   📄 Fetching page ${pageCount}...`);
    
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
    
    console.log(`   📈 Total ${tableName} so far: ${records.length}`);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } while (offset);
  
  console.log(`✅ COMPLETE: ${records.length} ${tableName} records fetched across ${pageCount} pages`);
  return records;
}

async function analyzeStorytellers(): Promise<void> {
  console.log('👥 ANALYZING STORYTELLERS');
  console.log('========================');
  
  const storytellers = await fetchAllRecordsWithPagination('Storytellers');
  
  console.log(`\n📊 TOTAL STORYTELLERS: ${storytellers.length}`);
  
  // Analyze field structure
  if (storytellers.length > 0) {
    const sampleRecord = storytellers[0];
    console.log('\n📋 ALL FIELDS IN STORYTELLERS:');
    Object.keys(sampleRecord.fields).sort().forEach((field, index) => {
      const count = storytellers.filter(s => s.fields[field]).length;
      console.log(`   ${(index + 1).toString().padStart(2)}. ${field} (${count}/${storytellers.length} records)`);
    });
  }
  
  // Analyze profile images
  const imageFields = ['File Profile Image', 'Profile Image', 'Image', 'Photo'];
  let profileImageField = null;
  
  console.log('\n🖼️  PROFILE IMAGE ANALYSIS:');
  for (const field of imageFields) {
    const withImages = storytellers.filter(s => {
      const fieldValue = s.fields[field];
      return fieldValue && (
        (Array.isArray(fieldValue) && fieldValue.length > 0) ||
        (typeof fieldValue === 'string' && fieldValue.length > 0)
      );
    });
    
    if (withImages.length > 0) {
      console.log(`   ✅ ${field}: ${withImages.length}/${storytellers.length} storytellers have images`);
      
      // Show sample image structure
      const sampleImage = withImages[0].fields[field];
      console.log(`   📋 Sample structure:`, JSON.stringify(sampleImage, null, 2));
      
      if (withImages.length > (profileImageField?.count || 0)) {
        profileImageField = { name: field, count: withImages.length };
      }
    } else {
      console.log(`   ❌ ${field}: No images found`);
    }
  }
  
  // Analyze transcripts
  const transcriptFields = ['Transcript (from Media)', 'Transcript', 'Media Transcript', 'Interview'];
  let transcriptField = null;
  
  console.log('\n📝 TRANSCRIPT ANALYSIS:');
  for (const field of transcriptFields) {
    const withTranscripts = storytellers.filter(s => {
      const fieldValue = s.fields[field];
      return fieldValue && typeof fieldValue === 'string' && fieldValue.length > 50;
    });
    
    if (withTranscripts.length > 0) {
      console.log(`   ✅ ${field}: ${withTranscripts.length}/${storytellers.length} storytellers`);
      
      // Show sample transcript length
      const sampleTranscript = withTranscripts[0].fields[field];
      console.log(`   📊 Sample length: ${sampleTranscript.length} characters`);
      
      if (withTranscripts.length > (transcriptField?.count || 0)) {
        transcriptField = { name: field, count: withTranscripts.length };
      }
    }
  }
  
  if (profileImageField) {
    console.log(`\n🎯 MAIN PROFILE IMAGE FIELD: "${profileImageField.name}" (${profileImageField.count} records)`);
  }
  
  if (transcriptField) {
    console.log(`🎯 MAIN TRANSCRIPT FIELD: "${transcriptField.name}" (${transcriptField.count} records)`);
  }
}

async function analyzeStories(): Promise<void> {
  console.log('\n\n📖 ANALYZING STORIES');
  console.log('====================');
  
  const stories = await fetchAllRecordsWithPagination('Stories');
  
  console.log(`\n📊 TOTAL STORIES: ${stories.length}`);
  
  // Analyze field structure
  if (stories.length > 0) {
    const sampleRecord = stories[0];
    console.log('\n📋 ALL FIELDS IN STORIES:');
    Object.keys(sampleRecord.fields).sort().forEach((field, index) => {
      const count = stories.filter(s => s.fields[field]).length;
      console.log(`   ${(index + 1).toString().padStart(2)}. ${field} (${count}/${stories.length} records)`);
    });
  }
  
  // Analyze storyteller connections
  const storytellerFields = ['Storytellers', 'Storyteller', 'Storytellers Name'];
  
  console.log('\n🔗 STORYTELLER CONNECTION ANALYSIS:');
  for (const field of storytellerFields) {
    const connected = stories.filter(s => {
      const fieldValue = s.fields[field];
      return fieldValue && (
        (Array.isArray(fieldValue) && fieldValue.length > 0) ||
        (typeof fieldValue === 'string' && fieldValue.length > 0)
      );
    });
    
    if (connected.length > 0) {
      console.log(`   ✅ ${field}: ${connected.length}/${stories.length} stories connected`);
      
      // Show sample connection structure
      const sampleConnection = connected[0].fields[field];
      console.log(`   📋 Sample structure:`, JSON.stringify(sampleConnection, null, 2));
    }
  }
  
  // Analyze story images
  const imageFields = ['Story Image', 'Image', 'Featured Image', 'Thumbnail'];
  let storyImageField = null;
  
  console.log('\n🖼️  STORY IMAGE ANALYSIS:');
  for (const field of imageFields) {
    const withImages = stories.filter(s => {
      const fieldValue = s.fields[field];
      return fieldValue && (
        (Array.isArray(fieldValue) && fieldValue.length > 0) ||
        (typeof fieldValue === 'string' && fieldValue.length > 0)
      );
    });
    
    if (withImages.length > 0) {
      console.log(`   ✅ ${field}: ${withImages.length}/${stories.length} stories have images`);
      
      // Show sample image structure
      const sampleImage = withImages[0].fields[field];
      console.log(`   📋 Sample structure:`, JSON.stringify(sampleImage, null, 2));
      
      if (withImages.length > (storyImageField?.count || 0)) {
        storyImageField = { name: field, count: withImages.length };
      }
    }
  }
  
  if (storyImageField) {
    console.log(`\n🎯 MAIN STORY IMAGE FIELD: "${storyImageField.name}" (${storyImageField.count} records)`);
  }
}

async function checkCurrentSupabaseState(): Promise<void> {
  console.log('\n\n📊 CURRENT SUPABASE STATE');
  console.log('=========================');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const [
    { count: storytellerCount },
    { count: storyCount },
    { count: transcriptCount }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('stories').select('*', { count: 'exact', head: true }),
    supabase.from('transcripts').select('*', { count: 'exact', head: true })
  ]);
  
  console.log(`📊 Current Supabase counts:`);
  console.log(`   👥 Storytellers: ${storytellerCount}`);
  console.log(`   📖 Stories: ${storyCount}`);
  console.log(`   📝 Transcripts: ${transcriptCount || 0}`);
  
  // Get sample of existing storytellers to check airtable IDs
  const { data: existingStorytellers } = await supabase
    .from('storytellers')
    .select('id, full_name, airtable_record_id')
    .limit(5);
    
  console.log('\n📋 Sample existing storytellers:');
  existingStorytellers?.forEach(s => {
    console.log(`   • ${s.full_name} (Airtable ID: ${s.airtable_record_id || 'missing'})`);
  });
}

async function generateMigrationPlan(): Promise<void> {
  console.log('\n\n📋 MIGRATION PLAN');
  console.log('=================');
  
  console.log('Based on the analysis above, here\'s what we need to do:');
  console.log('');
  console.log('1. 📊 STORYTELLERS:');
  console.log('   - Fetch all storytellers with proper pagination');
  console.log('   - Download and store profile images');
  console.log('   - Extract transcripts and store directly in storytellers table');
  console.log('   - Create transcript records for AI processing');
  console.log('');
  console.log('2. 📖 STORIES:');
  console.log('   - Fetch all stories with proper pagination');
  console.log('   - Download and store story images');
  console.log('   - Link to storytellers using the Storytellers field');
  console.log('');
  console.log('3. 🖼️  IMAGES:');
  console.log('   - Download images from Airtable URLs');
  console.log('   - Store in Supabase Storage or CDN');
  console.log('   - Update records with local URLs');
  console.log('');
  console.log('4. 📝 TRANSCRIPTS:');
  console.log('   - Link transcripts directly to storytellers');
  console.log('   - Ensure transcript table is populated');
  console.log('   - Enable AI processing pipeline');
}

async function main() {
  console.log('🔍 COMPLETE AIRTABLE ANALYSIS');
  console.log('==============================');
  console.log('Getting the FULL picture of Airtable data');
  console.log('');
  
  try {
    await analyzeStorytellers();
    await analyzeStories();
    await checkCurrentSupabaseState();
    await generateMigrationPlan();
    
    console.log('\n✅ ANALYSIS COMPLETE!');
    console.log('=====================');
    console.log('Now we have the complete picture and can fix the migration properly.');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

main().catch(console.error);