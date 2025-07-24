#!/usr/bin/env tsx
/**
 * COMPLETE REMAINING DATA
 * Fast focused script to add remaining transcripts and images without timeouts
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

interface CompletionStats {
  transcripts: { added: number; skipped: number; errors: number };
  images: { added: number; skipped: number; errors: number };
}

const stats: CompletionStats = {
  transcripts: { added: 0, skipped: 0, errors: 0 },
  images: { added: 0, skipped: 0, errors: 0 }
};

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

async function downloadImageToSupabase(imageUrl: string, filename: string, folder: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    const imageBuffer = await response.arrayBuffer();
    const filePath = `${folder}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, new Uint8Array(imageBuffer), {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        upsert: true
      });
    
    if (error) return null;
    
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch {
    return null;
  }
}

async function addMissingTranscripts(): Promise<void> {
  console.log('📝 ADDING MISSING TRANSCRIPTS');
  console.log('=============================');
  
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
  
  for (const storyteller of needingTranscripts) {
    try {
      const airtableRecord = airtableMap.get(storyteller.airtable_record_id);
      if (!airtableRecord) {
        console.log(`⚠️  No Airtable data for ${storyteller.full_name}`);
        stats.transcripts.skipped++;
        continue;
      }
      
      const transcriptText = airtableRecord.fields['Transcript (from Media)'];
      if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim().length < 10) {
        console.log(`⚠️  No transcript for ${storyteller.full_name}`);
        stats.transcripts.skipped++;
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
        stats.transcripts.errors++;
        continue;
      }
      
      // Create transcript record
      await createTranscriptRecord(storyteller.id, transcriptText.trim(), airtableRecord.fields, storyteller.airtable_record_id);
      
      stats.transcripts.added++;
      
    } catch (err) {
      console.error(`❌ Error processing ${storyteller.full_name}:`, err);
      stats.transcripts.errors++;
    }
  }
  
  console.log(`📊 Transcripts: ${stats.transcripts.added} added, ${stats.transcripts.skipped} skipped, ${stats.transcripts.errors} errors`);
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
      consent_for_publication: false,
      airtable_record_id: airtableId
    };
    
    const { error } = await supabase
      .from('transcripts')
      .insert(transcriptData);
      
    if (error) {
      console.error(`   ⚠️  Failed to create transcript record: ${error.message}`);
    }
  } catch (err) {
    console.error('   ⚠️  Error creating transcript record:', err);
  }
}

async function addMissingImages(): Promise<void> {
  console.log('\n🖼️  ADDING MISSING IMAGES');
  console.log('=========================');
  
  // Get storytellers missing images but linked to Airtable
  const { data: needingImages } = await supabase
    .from('storytellers')
    .select('id, full_name, airtable_record_id')
    .not('airtable_record_id', 'is', null)
    .is('profile_image_url', null)
    .limit(20); // Process in smaller batches to avoid timeout
    
  console.log(`📊 Found ${needingImages?.length || 0} storytellers needing images (batch of 20)`);
  
  if (!needingImages || needingImages.length === 0) {
    console.log('✅ All storytellers in this batch have images');
    return;
  }
  
  // Get Airtable data
  const airtableRecords = await fetchAirtableStorytellers();
  const airtableMap = new Map(airtableRecords.map(r => [r.id, r]));
  
  for (const storyteller of needingImages) {
    try {
      const airtableRecord = airtableMap.get(storyteller.airtable_record_id);
      if (!airtableRecord) {
        stats.images.skipped++;
        continue;
      }
      
      const imageField = airtableRecord.fields['File Profile Image'];
      if (!imageField || !Array.isArray(imageField) || imageField.length === 0) {
        console.log(`⚠️  No image for ${storyteller.full_name}`);
        stats.images.skipped++;
        continue;
      }
      
      const imageData = imageField[0];
      if (!imageData || !imageData.url) {
        stats.images.skipped++;
        continue;
      }
      
      console.log(`🖼️  Adding image for ${storyteller.full_name}`);
      
      // Clean filename for safe storage
      const safeFilename = imageData.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `storyteller_${storyteller.airtable_record_id}_${safeFilename}`;
      
      const imageUrl = await downloadImageToSupabase(imageData.url, filename, 'storytellers');
      
      if (imageUrl) {
        const { error } = await supabase
          .from('storytellers')
          .update({
            profile_image_url: imageUrl,
            profile_image_file: imageUrl.split('/').pop()
          })
          .eq('id', storyteller.id);
          
        if (error) {
          console.error(`❌ Failed to update ${storyteller.full_name}:`, error.message);
          stats.images.errors++;
        } else {
          stats.images.added++;
        }
      } else {
        stats.images.errors++;
      }
      
    } catch (err) {
      console.error(`❌ Error processing image for ${storyteller.full_name}:`, err);
      stats.images.errors++;
    }
  }
  
  console.log(`📊 Images: ${stats.images.added} added, ${stats.images.skipped} skipped, ${stats.images.errors} errors`);
}

async function validateCompletion(): Promise<void> {
  console.log('\n📊 VALIDATION RESULTS');
  console.log('=====================');
  
  const [
    { count: totalStorytellers },
    { count: linkedStorytellers },
    { count: withImages },
    { count: withTranscripts },
    { count: transcriptRecords }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('storytellers').select('*', { count: 'exact', head: true }).not('airtable_record_id', 'is', null),
    supabase.from('storytellers').select('*', { count: 'exact', head: true }).not('profile_image_url', 'is', null),
    supabase.from('storytellers').select('*', { count: 'exact', head: true }).not('transcript', 'is', null),
    supabase.from('transcripts').select('*', { count: 'exact', head: true })
  ]);
  
  console.log(`📈 FINAL STATUS:`);
  console.log(`   👥 Total storytellers: ${totalStorytellers}`);
  console.log(`   🔗 Linked to Airtable: ${linkedStorytellers}/${totalStorytellers}`);
  console.log(`   🖼️  With images: ${withImages}/${totalStorytellers}`);
  console.log(`   📝 With transcripts: ${withTranscripts}/${totalStorytellers}`);
  console.log(`   📋 Transcript records: ${transcriptRecords}`);
  
  // Calculate success rates
  const linkRate = ((linkedStorytellers / totalStorytellers) * 100).toFixed(1);
  const imageRate = ((withImages / totalStorytellers) * 100).toFixed(1);
  const transcriptRate = ((withTranscripts / totalStorytellers) * 100).toFixed(1);
  
  console.log(`\n📊 SUCCESS RATES:`);
  console.log(`   🔗 Linking: ${linkRate}%`);
  console.log(`   🖼️  Images: ${imageRate}%`);
  console.log(`   📝 Transcripts: ${transcriptRate}%`);
}

async function main() {
  console.log('⚡ COMPLETE REMAINING DATA (FAST)');
  console.log('=================================');
  console.log('Adding remaining transcripts and images efficiently');
  console.log('');
  
  try {
    await addMissingTranscripts();
    await addMissingImages();
    await validateCompletion();
    
    console.log('\n🎉 COMPLETION PROCESS FINISHED!');
    console.log('===============================');
    console.log('✅ Transcripts and images processing complete');
    console.log('📊 Check validation results above for final status');
    
  } catch (error) {
    console.error('❌ Completion failed:', error);
  }
}

main().catch(console.error);