#!/usr/bin/env tsx
/**
 * CHECK SUPABASE DATA
 * Examine what's actually in the database and why linking isn't working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function examineSupabaseData() {
  console.log('🔍 EXAMINING SUPABASE DATABASE CONTENTS');
  console.log('======================================');
  
  try {
    // Check storytellers table
    const { data: storytellers, error: storytellersError } = await supabase
      .from('storytellers')
      .select('id, full_name, airtable_record_id, profile_image_url, transcript')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (storytellersError) {
      console.error('❌ Error fetching storytellers:', storytellersError);
      return;
    }
    
    console.log(`📊 STORYTELLERS TABLE (first 10 records):`);
    console.log(`   Total records in sample: ${storytellers?.length || 0}`);
    
    storytellers?.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.full_name || 'No name'}`);
      console.log(`      ID: ${s.id}`);
      console.log(`      Airtable ID: ${s.airtable_record_id || 'NOT SET'}`);
      console.log(`      Has image: ${s.profile_image_url ? 'Yes' : 'No'}`);
      console.log(`      Has transcript: ${s.transcript ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Check overall counts
    const { count: totalStorytellers } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true });
      
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
    
    console.log(`📊 STORYTELLERS SUMMARY:`);
    console.log(`   Total storytellers: ${totalStorytellers}`);
    console.log(`   With Airtable IDs: ${withAirtableIds}`);
    console.log(`   With profile images: ${withImages}`);
    console.log(`   With transcripts: ${withTranscripts}`);
    
    // Check stories table
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, airtable_record_id, storyteller_id, story_image_url')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!storiesError && stories) {
      console.log(`\n📖 STORIES TABLE (first 5 records):`);
      stories.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.title || 'No title'}`);
        console.log(`      ID: ${s.id}`);
        console.log(`      Airtable ID: ${s.airtable_record_id || 'NOT SET'}`);
        console.log(`      Storyteller ID: ${s.storyteller_id || 'NOT SET'}`);
        console.log(`      Has image: ${s.story_image_url ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });
      
    const { count: storiesWithAirtableIds } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .not('airtable_record_id', 'is', null);
      
    const { count: storiesWithStorytellers } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .not('storyteller_id', 'is', null);
    
    console.log(`📊 STORIES SUMMARY:`);
    console.log(`   Total stories: ${totalStories}`);
    console.log(`   With Airtable IDs: ${storiesWithAirtableIds}`);
    console.log(`   With storyteller links: ${storiesWithStorytellers}`);
    
    // Check if transcript table exists
    try {
      const { count: transcriptCount } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true });
      console.log(`\n📝 TRANSCRIPTS TABLE:`);
      console.log(`   Total transcripts: ${transcriptCount}`);
    } catch (err) {
      console.log(`\n📝 TRANSCRIPTS TABLE:`);
      console.log(`   ❌ Table doesn't exist or error: ${err}`);
    }
    
  } catch (error) {
    console.error('💥 Error examining database:', error);
  }
}

async function checkTableStructure() {
  console.log('\n🏗️  CHECKING TABLE STRUCTURE');
  console.log('============================');
  
  try {
    // Check storytellers table structure
    const { data, error } = await supabase
      .from('storytellers')
      .select('*')
      .limit(1);
      
    if (!error && data && data.length > 0) {
      console.log('📋 STORYTELLERS TABLE COLUMNS:');
      Object.keys(data[0]).forEach((column, i) => {
        const value = data[0][column];
        const hasValue = value !== null && value !== undefined && value !== '';
        console.log(`   ${i+1}. ${column} ${hasValue ? '✅' : '❌'}`);
      });
    }
  } catch (err) {
    console.error('❌ Error checking table structure:', err);
  }
}

async function main() {
  console.log('🔍 SUPABASE DATABASE INVESTIGATION');
  console.log('===================================');
  console.log('Understanding why storytellers are not linking to Airtable data');
  console.log('');
  
  await examineSupabaseData();
  await checkTableStructure();
  
  console.log('\n🎯 INVESTIGATION COMPLETE');
  console.log('==========================');
  console.log('Review the data above to understand the linking issue.');
}

main().catch(console.error);