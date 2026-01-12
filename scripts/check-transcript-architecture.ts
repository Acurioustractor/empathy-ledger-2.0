#!/usr/bin/env tsx
/**
 * CHECK TRANSCRIPT ARCHITECTURE
 * Verify if transcript tables and columns exist
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTranscriptArchitecture() {
  console.log('🔍 CHECKING TRANSCRIPT ARCHITECTURE');
  console.log('===================================');
  
  // Check if transcript column exists in storytellers
  try {
    const { data, error } = await supabase
      .from('storytellers')
      .select('transcript, profile_image_file, media_url, media_type')
      .limit(1);
      
    if (error) {
      console.log('❌ Transcript columns missing in storytellers table');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('✅ Transcript columns exist in storytellers table');
    }
  } catch (err) {
    console.log('❌ Error checking storytellers columns:', err);
  }
  
  // Check if story image columns exist
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('story_image_url, story_image_file')
      .limit(1);
      
    if (error) {
      console.log('❌ Story image columns missing in stories table');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('✅ Story image columns exist in stories table');
    }
  } catch (err) {
    console.log('❌ Error checking stories columns:', err);
  }
  
  // Check if transcripts table exists
  try {
    const { count, error } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log('❌ Transcripts table does not exist');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`✅ Transcripts table exists (${count} records)`);
    }
  } catch (err) {
    console.log('❌ Error checking transcripts table:', err);
  }
  
  // Check if quotes table exists
  try {
    const { count, error } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log('❌ Quotes table does not exist');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`✅ Quotes table exists (${count} records)`);
    }
  } catch (err) {
    console.log('❌ Error checking quotes table:', err);
  }
  
  // Check if themes table exists
  try {
    const { count, error } = await supabase
      .from('themes')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log('❌ Themes table does not exist');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`✅ Themes table exists (${count} records)`);
    }
  } catch (err) {
    console.log('❌ Error checking themes table:', err);
  }
}

async function main() {
  console.log('🏗️  TRANSCRIPT ARCHITECTURE CHECK');
  console.log('=================================');
  console.log('Verifying if the transcript-centric architecture was deployed correctly');
  console.log('');
  
  await checkTranscriptArchitecture();
  
  console.log('\n🎯 ARCHITECTURE CHECK COMPLETE');
  console.log('===============================');
  console.log('If any tables/columns are missing, re-execute the transcript architecture SQL.');
}

main().catch(console.error);