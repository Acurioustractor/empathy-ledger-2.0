#!/usr/bin/env tsx
/**
 * FIX TRANSCRIPT ARRAYS
 * Process transcripts correctly - they're stored as arrays, not strings!
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function fetchAirtableStorytellers(): Promise<any[]> {
  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100`, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.records;
}

async function fixTranscriptArrays(): Promise<void> {
  console.log('📝 FIXING TRANSCRIPT ARRAY PROCESSING');
  console.log('====================================');
  
  // Get storytellers missing transcripts but linked to Airtable
  const { data: needingTranscripts } = await supabase
    .from('storytellers')
    .select('id, full_name, airtable_record_id')
    .not('airtable_record_id', 'is', null)
    .is('transcript', null);
    
  console.log(`📊 Found ${needingTranscripts?.length || 0} storytellers needing transcripts`);
  
  if (!needingTranscripts || needingTranscripts.length === 0) {
    console.log('✅ All storytellers already have transcripts');
    return;
  }
  
  // Get Airtable data
  const airtableRecords = await fetchAirtableStorytellers();
  const airtableMap = new Map(airtableRecords.map(r => [r.id, r]));
  
  let added = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const storyteller of needingTranscripts) {
    try {
      const airtableRecord = airtableMap.get(storyteller.airtable_record_id);
      if (!airtableRecord) {
        skipped++;
        continue;
      }
      
      // CRITICAL FIX: Handle transcript as array
      const transcriptField = airtableRecord.fields['Transcript (from Media)'];
      let transcriptText = null;
      
      if (Array.isArray(transcriptField) && transcriptField.length > 0) {
        // It's an array - take the first element
        transcriptText = transcriptField[0];
      } else if (typeof transcriptField === 'string') {
        // It's already a string
        transcriptText = transcriptField;
      }
      
      if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim().length < 50) {
        console.log(`⚠️  No valid transcript for ${storyteller.full_name}`);
        skipped++;
        continue;
      }
      
      console.log(`📝 Adding transcript for ${storyteller.full_name} (${transcriptText.length} chars)`);
      
      // Update storyteller with transcript
      const { error: updateError } = await supabase
        .from('storytellers')
        .update({
          transcript: transcriptText.trim(),
          media_type: 'interview'
        })
        .eq('id', storyteller.id);
        
      if (updateError) {
        console.error(`❌ Failed to update ${storyteller.full_name}:`, updateError.message);
        errors++;
        continue;
      }
      
      // Create transcript record
      await createTranscriptRecord(storyteller.id, transcriptText.trim(), airtableRecord.fields, storyteller.airtable_record_id);
      
      added++;
      
    } catch (err) {
      console.error(`❌ Error processing ${storyteller.full_name}:`, err);
      errors++;
    }
  }
  
  console.log(`📊 Transcripts: ${added} added, ${skipped} skipped, ${errors} errors`);
}

async function createTranscriptRecord(storytellerId: string, transcriptText: string, fields: any, airtableId: string): Promise<void> {
  try {
    // Check if transcript record already exists
    const { data: existing } = await supabase
      .from('transcripts')
      .select('id')
      .eq('storyteller_id', storytellerId)
      .single();
      
    if (existing) {
      return; // Already exists
    }
    
    const transcriptData = {
      storyteller_id: storytellerId,
      transcript_text: transcriptText,
      media_type: 'interview',
      processing_status: 'raw',
      transcript_quality: transcriptText.length > 1000 ? 'good' : 'fair',
      word_count: transcriptText.split(/\s+/).length,
      consent_for_analysis: true,
      consent_for_publication: false,
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

async function validateTranscriptResults(): Promise<void> {
  console.log('\n📊 TRANSCRIPT VALIDATION');
  console.log('========================');
  
  const [
    { count: totalStorytellers },
    { count: withTranscripts },
    { count: transcriptRecords }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('storytellers').select('*', { count: 'exact', head: true }).not('transcript', 'is', null),
    supabase.from('transcripts').select('*', { count: 'exact', head: true })
  ]);
  
  console.log(`📈 TRANSCRIPT STATUS:`);
  console.log(`   👥 Total storytellers: ${totalStorytellers}`);
  console.log(`   📝 With transcripts: ${withTranscripts}/${totalStorytellers}`);
  console.log(`   📋 Transcript records: ${transcriptRecords}`);
  
  const transcriptRate = ((withTranscripts / totalStorytellers) * 100).toFixed(1);
  console.log(`   📊 Success rate: ${transcriptRate}%`);
  
  // Show some sample transcript records
  const { data: sampleTranscripts } = await supabase
    .from('storytellers')
    .select('full_name, transcript')
    .not('transcript', 'is', null)
    .limit(3);
    
  console.log(`\n📋 SAMPLE TRANSCRIPT RECORDS:`);
  sampleTranscripts?.forEach((s, i) => {
    console.log(`   ${i+1}. ${s.full_name}: ${s.transcript.length} characters`);
  });
}

async function main() {
  console.log('🔧 FIX TRANSCRIPT ARRAY PROCESSING');
  console.log('===================================');
  console.log('Properly handling transcript data stored as arrays in Airtable');
  console.log('');
  
  try {
    await fixTranscriptArrays();
    await validateTranscriptResults();
    
    console.log('\n🎉 TRANSCRIPT FIXING COMPLETED!');
    console.log('==============================');
    console.log('✅ Transcripts processed correctly as arrays');
    console.log('✅ Transcript records created for AI processing');
    console.log('🎯 Ready for content generation!');
    
  } catch (error) {
    console.error('❌ Transcript fixing failed:', error);
  }
}

main().catch(console.error);