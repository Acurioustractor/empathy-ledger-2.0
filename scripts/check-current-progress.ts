#!/usr/bin/env tsx
/**
 * CHECK CURRENT PROGRESS
 * See what was accomplished in the linking/population process
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkProgress() {
  console.log('📊 CHECKING CURRENT PROGRESS');
  console.log('============================');
  
  try {
    // Check overall counts
    const [
      { count: totalStorytellers },
      { count: totalStories },
      { count: totalTranscripts }
    ] = await Promise.all([
      supabase.from('storytellers').select('*', { count: 'exact', head: true }),
      supabase.from('stories').select('*', { count: 'exact', head: true }),
      supabase.from('transcripts').select('*', { count: 'exact', head: true })
    ]);
    
    console.log(`📈 OVERALL COUNTS:`);
    console.log(`   👥 Storytellers: ${totalStorytellers}`);
    console.log(`   📖 Stories: ${totalStories}`);
    console.log(`   📝 Transcripts: ${totalTranscripts || 0}`);
    
    // Check linking progress
    const { count: linkedStorytellers } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .not('airtable_record_id', 'is', null);
      
    console.log(`\n🔗 LINKING PROGRESS:`);
    console.log(`   Linked to Airtable: ${linkedStorytellers}/${totalStorytellers} storytellers`);
    
    // Check image progress
    const { count: withImages } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .not('profile_image_url', 'is', null);
      
    console.log(`\n🖼️  IMAGE PROGRESS:`);
    console.log(`   Profile images: ${withImages}/${totalStorytellers} storytellers`);
    
    // Check transcript progress
    const { count: withTranscripts } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .not('transcript', 'is', null);
      
    console.log(`\n📝 TRANSCRIPT PROGRESS:`);
    console.log(`   Transcripts: ${withTranscripts}/${totalStorytellers} storytellers`);
    
    // Sample some successful records
    const { data: sampleLinked } = await supabase
      .from('storytellers')
      .select('full_name, airtable_record_id, profile_image_url, transcript')
      .not('airtable_record_id', 'is', null)
      .limit(5);
      
    console.log(`\n📋 SAMPLE SUCCESSFUL RECORDS:`);
    sampleLinked?.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.full_name}`);
      console.log(`      Airtable ID: ${s.airtable_record_id}`);
      console.log(`      Has image: ${s.profile_image_url ? 'Yes' : 'No'}`);
      console.log(`      Has transcript: ${s.transcript ? 'Yes (' + s.transcript.length + ' chars)' : 'No'}`);
      console.log('');
    });
    
    // Check what still needs work
    const { data: needsWork } = await supabase
      .from('storytellers')
      .select('full_name, airtable_record_id, profile_image_url, transcript')
      .or('airtable_record_id.is.null,profile_image_url.is.null,transcript.is.null')
      .limit(10);
      
    console.log(`📋 RECORDS NEEDING WORK (first 10):`);
    needsWork?.forEach((s, i) => {
      const missing = [];
      if (!s.airtable_record_id) missing.push('Airtable link');
      if (!s.profile_image_url) missing.push('Image');
      if (!s.transcript) missing.push('Transcript');
      
      console.log(`   ${i+1}. ${s.full_name}: Missing ${missing.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking progress:', error);
  }
}

async function main() {
  console.log('🔍 CURRENT PROGRESS CHECK');
  console.log('=========================');
  console.log('Checking what was accomplished in the linking process');
  console.log('');
  
  await checkProgress();
  
  console.log('\n🎯 PROGRESS CHECK COMPLETE');
  console.log('===========================');
}

main().catch(console.error);