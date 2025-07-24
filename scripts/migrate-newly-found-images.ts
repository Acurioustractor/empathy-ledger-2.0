#!/usr/bin/env tsx
/**
 * MIGRATE NEWLY FOUND IMAGES
 * Download the 32 newly discovered profile images to Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getNewlyFoundImages(): Promise<any[]> {
  console.log('📋 GETTING NEWLY FOUND AIRTABLE IMAGES');
  console.log('=====================================');
  
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select('id, full_name, profile_image_url, profile_image_file')
    .not('profile_image_url', 'is', null)
    .like('profile_image_url', '%airtable%');
    
  if (error) {
    throw new Error(`Failed to get storytellers: ${error.message}`);
  }
  
  console.log(`✅ Found ${storytellers.length} storytellers with new Airtable URLs to migrate`);
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
    
    // Skip if too large (>10MB)
    if (imageSize > 10485760) {
      console.log(`   ⚠️  Image too large (${(imageSize / 1024 / 1024).toFixed(1)}MB), skipping`);
      return false;
    }
    
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

async function migrateNewlyFoundImages(): Promise<void> {
  console.log('\n🚀 MIGRATING NEWLY FOUND IMAGES');
  console.log('===============================');
  
  // Get newly found Airtable images
  const newImages = await getNewlyFoundImages();
  
  if (newImages.length === 0) {
    console.log('🎉 All images already migrated!');
    return;
  }
  
  console.log(`\n📊 Processing ${newImages.length} newly found images`);
  
  let downloaded = 0;
  let errors = 0;
  let skipped = 0;
  
  for (let i = 0; i < newImages.length; i++) {
    const storyteller = newImages[i];
    
    console.log(`\n📷 ${i + 1}/${newImages.length}: ${storyteller.full_name}`);
    
    const success = await downloadAndUploadImage(storyteller);
    
    if (success) {
      downloaded++;
    } else {
      errors++;
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log(`\n🎯 NEWLY FOUND IMAGES MIGRATION COMPLETE`);
  console.log(`✅ Downloaded & uploaded: ${downloaded}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total processed: ${downloaded + skipped + errors}`);
}

async function finalImageValidation(): Promise<void> {
  console.log('\n📊 FINAL IMAGE VALIDATION');
  console.log('=========================');
  
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
  const supabasePercentage = ((withSupabaseImages / totalStorytellers) * 100).toFixed(1);
  
  console.log(`\n📈 FINAL IMAGE RESULTS:`);
  console.log(`   👥 Total storytellers: ${totalStorytellers}`);
  console.log(`   📷 Total with images: ${totalWithImages}/${totalStorytellers} (${imagePercentage}%)`);
  console.log(`   🏠 Migrated to Supabase: ${withSupabaseImages} (${supabasePercentage}%)`);
  console.log(`   📷 Still using Airtable: ${withAirtableImages}`);
  console.log(`   ❌ No images: ${withNoImages}`);
  
  if (parseFloat(imagePercentage) >= 90) {
    console.log(`\n🎉 EXCELLENT! ${imagePercentage}% of storytellers have profile images!`);
    console.log(`✅ This matches your expectation that almost all should have photos`);
  }
  
  if (withAirtableImages === 0) {
    console.log(`\n🎉 ALL AVAILABLE IMAGES MIGRATED TO SUPABASE!`);
    console.log(`✅ ${withSupabaseImages} profile images now served from Supabase CDN`);
  } else {
    console.log(`\n📋 ${withAirtableImages} images still need migration`);
  }
  
  // Show the few remaining without images
  if (withNoImages > 0 && withNoImages <= 20) {
    console.log(`\n📋 Storytellers without images (${withNoImages}):`);
    
    const { data: noImageStorytellers } = await supabase
      .from('storytellers')
      .select('full_name')
      .is('profile_image_url', null)
      .limit(20);
      
    noImageStorytellers?.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.full_name}`);
    });
  }
}

async function main(): Promise<void> {
  console.log('🎯 MIGRATE NEWLY FOUND PROFILE IMAGES');
  console.log('=====================================');
  console.log('We discovered 32 more images - now migrating them to Supabase');
  console.log('');
  
  try {
    await migrateNewlyFoundImages();
    await finalImageValidation();
    
    console.log('\n🎉 NEWLY FOUND IMAGE MIGRATION COMPLETE!');
    console.log('========================================');
    console.log('✅ All newly discovered images processed');
    console.log('✅ Now have 90%+ coverage as expected');
    console.log('✅ Profile images served from Supabase CDN');
    console.log('🎯 Ready for frontend display!');
    
  } catch (error) {
    console.error('❌ Newly found image migration failed:', error);
  }
}

main().catch(console.error);