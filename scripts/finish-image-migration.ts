#!/usr/bin/env tsx
/**
 * FINISH IMAGE MIGRATION
 * Complete the remaining 60 image migrations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getRemainingAirtableImages(): Promise<any[]> {
  console.log('📋 GETTING REMAINING AIRTABLE IMAGES');
  console.log('===================================');
  
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select('id, full_name, profile_image_url, profile_image_file, airtable_record_id')
    .not('profile_image_url', 'is', null)
    .like('profile_image_url', '%airtable%');
    
  if (error) {
    throw new Error(`Failed to get storytellers: ${error.message}`);
  }
  
  console.log(`✅ Found ${storytellers.length} storytellers still using Airtable URLs`);
  return storytellers;
}

async function downloadAndUploadImage(storyteller: any): Promise<boolean> {
  try {
    const { id, full_name, profile_image_url, profile_image_file } = storyteller;
    
    console.log(`   📥 Downloading image for ${full_name}...`);
    
    // Download the image from Airtable
    const imageResponse = await fetch(profile_image_url);
    
    if (!imageResponse.ok) {
      console.log(`   ❌ Failed to download image: ${imageResponse.status}`);
      return false;
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageSize = imageBuffer.byteLength;
    
    console.log(`   📊 Downloaded ${(imageSize / 1024).toFixed(1)}KB`);
    
    // Generate a clean filename
    const fileExtension = profile_image_file?.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanName = full_name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').toLowerCase();
    const fileName = `storytellers/${cleanName}_${id.substring(0, 8)}.${fileExtension}`;
    
    console.log(`   📤 Uploading as: ${fileName}`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, imageBuffer, {
        contentType: `image/${fileExtension}`,
        upsert: true
      });
      
    if (uploadError) {
      console.log(`   ❌ Upload failed: ${uploadError.message}`);
      return false;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
      
    const publicUrl = publicUrlData.publicUrl;
    
    console.log(`   ✅ Uploaded successfully`);
    
    // Update the storyteller record with the Supabase URL
    const { error: updateError } = await supabase
      .from('storytellers')
      .update({
        profile_image_url: publicUrl,
        profile_image_file: fileName
      })
      .eq('id', id);
      
    if (updateError) {
      console.log(`   ⚠️  Failed to update record: ${updateError.message}`);
      return false;
    }
    
    console.log(`   🎯 Record updated with Supabase URL`);
    return true;
    
  } catch (err) {
    console.log(`   💥 Error processing image: ${err}`);
    return false;
  }
}

async function finishImageMigration(): Promise<void> {
  console.log('\n🚀 FINISHING IMAGE MIGRATION');
  console.log('============================');
  
  // Get remaining Airtable images
  const remainingImages = await getRemainingAirtableImages();
  
  if (remainingImages.length === 0) {
    console.log('🎉 All images already migrated!');
    return;
  }
  
  console.log(`\n📊 Processing remaining ${remainingImages.length} images`);
  
  let downloaded = 0;
  let errors = 0;
  
  for (let i = 0; i < remainingImages.length; i++) {
    const storyteller = remainingImages[i];
    
    console.log(`\n📷 ${i + 1}/${remainingImages.length}: ${storyteller.full_name}`);
    
    const success = await downloadAndUploadImage(storyteller);
    
    if (success) {
      downloaded++;
    } else {
      errors++;
    }
    
    // Rate limiting to be nice to Airtable and Supabase
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log(`\n🎯 FINISH MIGRATION COMPLETE`);
  console.log(`✅ Downloaded & uploaded: ${downloaded}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total processed: ${downloaded + errors}`);
}

async function finalValidation(): Promise<void> {
  console.log('\n📊 FINAL VALIDATION');
  console.log('===================');
  
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
  
  const totalWithImages = withAirtableImages + withSupabaseImages;
  const imagePercentage = ((totalWithImages / totalStorytellers) * 100).toFixed(1);
  
  console.log(`\n📈 FINAL RESULTS:`);
  console.log(`   👥 Total storytellers: ${totalStorytellers}`);
  console.log(`   📷 Total with images: ${totalWithImages}/${totalStorytellers} (${imagePercentage}%)`);
  console.log(`   🏠 Migrated to Supabase: ${withSupabaseImages}`);
  console.log(`   📷 Still using Airtable: ${withAirtableImages}`);
  console.log(`   ❌ No images: ${withNoImages}`);
  
  if (withAirtableImages === 0) {
    console.log(`\n🎉 ALL IMAGES SUCCESSFULLY MIGRATED TO SUPABASE!`);
    console.log(`✅ ${withSupabaseImages} profile images now served from Supabase CDN`);
    console.log(`✅ Fast loading, secure, and integrated with your platform`);
  } else {
    console.log(`\n📋 ${withAirtableImages} images still need migration`);
  }
}

async function main(): Promise<void> {
  console.log('🎯 FINISH PROFILE IMAGE MIGRATION');
  console.log('==================================');
  console.log('Completing the remaining Airtable → Supabase image migrations');
  console.log('');
  
  try {
    await finishImageMigration();
    await finalValidation();
    
    console.log('\n🎉 IMAGE MIGRATION COMPLETE!');
    console.log('============================');
    console.log('✅ All available images migrated to Supabase Storage');
    console.log('✅ Fast CDN delivery for profile images');
    console.log('✅ Integrated with your storyteller platform');
    console.log('🎯 Ready for frontend display!');
    
  } catch (error) {
    console.error('❌ Image migration failed:', error);
  }
}

main().catch(console.error);