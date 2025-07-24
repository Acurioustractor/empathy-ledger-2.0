#!/usr/bin/env tsx
/**
 * VALIDATE IMAGE MIGRATION STATUS
 * Check how many images have been migrated so far
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function validateImageMigrationStatus(): Promise<void> {
  console.log('📊 VALIDATING IMAGE MIGRATION STATUS');
  console.log('===================================');
  
  const [
    { count: totalStorytellers },
    { count: withAirtableImages },
    { count: withSupabaseImages },
    { count: withNoImages }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('storytellers').select('*', { count: 'exact', head: true })
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%airtable%'),
    supabase.from('storytellers').select('*', { count: 'exact', head: true })
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%supabase%'),
    supabase.from('storytellers').select('*', { count: 'exact', head: true })
      .is('profile_image_url', null)
  ]);
  
  console.log(`\n📈 CURRENT STATUS:`);
  console.log(`   👥 Total storytellers: ${totalStorytellers}`);
  console.log(`   🏠 Migrated to Supabase: ${withSupabaseImages}`);
  console.log(`   📷 Still using Airtable URLs: ${withAirtableImages}`);
  console.log(`   ❌ No images: ${withNoImages}`);
  
  const totalWithImages = withAirtableImages + withSupabaseImages;
  const imagePercentage = ((totalWithImages / totalStorytellers) * 100).toFixed(1);
  const supabasePercentage = ((withSupabaseImages / totalStorytellers) * 100).toFixed(1);
  
  console.log(`\n📊 PERCENTAGES:`);
  console.log(`   Total with images: ${totalWithImages}/${totalStorytellers} (${imagePercentage}%)`);
  console.log(`   Migrated to Supabase: ${withSupabaseImages}/${totalStorytellers} (${supabasePercentage}%)`);
  
  // Show sample of remaining Airtable URLs
  if (withAirtableImages > 0) {
    console.log(`\n🔍 SAMPLE OF REMAINING AIRTABLE IMAGES:`);
    
    const { data: airtableImages } = await supabase
      .from('storytellers')
      .select('full_name, profile_image_url')
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%airtable%')
      .limit(10);
      
    airtableImages?.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.full_name}`);
    });
  }
  
  // Show sample of Supabase URLs
  if (withSupabaseImages > 0) {
    console.log(`\n✅ SAMPLE OF MIGRATED SUPABASE IMAGES:`);
    
    const { data: supabaseImages } = await supabase
      .from('storytellers')
      .select('full_name, profile_image_url')
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%supabase%')
      .limit(5);
      
    supabaseImages?.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.full_name}`);
      console.log(`      URL: ${s.profile_image_url.substring(0, 80)}...`);
    });
  }
  
  if (withAirtableImages === 0) {
    console.log(`\n🎉 ALL IMAGES MIGRATED TO SUPABASE!`);
  } else {
    console.log(`\n📋 MIGRATION PROGRESS: ${withSupabaseImages}/${totalWithImages} images migrated (${((withSupabaseImages/totalWithImages)*100).toFixed(1)}%)`);
  }
}

async function main(): Promise<void> {
  console.log('🎯 IMAGE MIGRATION STATUS CHECK');
  console.log('===============================');
  
  try {
    await validateImageMigrationStatus();
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
  }
}

main().catch(console.error);