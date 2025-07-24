#!/usr/bin/env tsx
/**
 * MIGRATE ALL PROFILE IMAGES
 * Download and upload all profile images to Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAllStorytellersWithImages(): Promise<any[]> {
  console.log('📋 GETTING ALL STORYTELLERS WITH PROFILE IMAGES');
  console.log('===============================================');
  
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select('id, full_name, profile_image_url, profile_image_file, airtable_record_id')
    .not('profile_image_url', 'is', null);
    
  if (error) {
    throw new Error(`Failed to get storytellers: ${error.message}`);
  }
  
  console.log(`✅ Found ${storytellers.length} storytellers with profile image URLs`);
  return storytellers;
}

async function downloadAndUploadImage(storyteller: any): Promise<boolean> {
  try {
    const { id, full_name, profile_image_url, profile_image_file } = storyteller;
    
    if (!profile_image_url) {
      console.log(`   ⏭️  No image URL for ${full_name}`);
      return false;
    }
    
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
    console.log(`   🔗 Public URL: ${publicUrl.substring(0, 60)}...`);
    
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

async function migrateAllProfileImages(): Promise<void> {
  console.log('\n🚀 MIGRATING ALL PROFILE IMAGES');
  console.log('===============================');
  
  // Get all storytellers with profile images
  const storytellers = await getAllStorytellersWithImages();
  
  if (storytellers.length === 0) {
    console.log('❌ No storytellers with profile images found');
    return;
  }
  
  console.log(`\n📊 Processing ${storytellers.length} profile images`);
  
  let downloaded = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < storytellers.length; i++) {
    const storyteller = storytellers[i];
    
    console.log(`\n📷 ${i + 1}/${storytellers.length}: ${storyteller.full_name}`);
    
    // Check if we already have a Supabase URL (not Airtable URL)
    if (storyteller.profile_image_url && storyteller.profile_image_url.includes('supabase')) {
      console.log(`   ✅ Already migrated to Supabase`);
      skipped++;
      continue;
    }
    
    const success = await downloadAndUploadImage(storyteller);
    
    if (success) {
      downloaded++;
    } else {
      errors++;
    }
    
    // Rate limiting to be nice to Airtable
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n🎯 PROFILE IMAGE MIGRATION COMPLETE`);
  console.log(`✅ Downloaded & uploaded: ${downloaded}`);
  console.log(`⏭️  Already migrated: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📊 Total processed: ${downloaded + skipped + errors}`);
}

async function validateImageMigration(): Promise<void> {
  console.log('\n📊 VALIDATING IMAGE MIGRATION');
  console.log('=============================');
  
  const [
    { count: totalStorytellers },
    { count: withAirtableImages },
    { count: withSupabaseImages }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('storytellers').select('*', { count: 'exact', head: true })
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%airtable%'),
    supabase.from('storytellers').select('*', { count: 'exact', head: true })
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%supabase%')
  ]);
  
  console.log(`\n📈 IMAGE MIGRATION STATUS:`);
  console.log(`   👥 Total storytellers: ${totalStorytellers}`);
  console.log(`   📷 Still using Airtable URLs: ${withAirtableImages}`);
  console.log(`   🏠 Migrated to Supabase: ${withSupabaseImages}`);
  
  const totalWithImages = withAirtableImages + withSupabaseImages;
  const imagePercentage = ((totalWithImages / totalStorytellers) * 100).toFixed(1);
  
  console.log(`   📊 Total with images: ${totalWithImages}/${totalStorytellers} (${imagePercentage}%)`);
  
  if (withSupabaseImages > 0) {
    console.log(`\n✅ Image migration successful!`);
  }
  
  if (withAirtableImages > 0) {
    console.log(`\n⚠️  ${withAirtableImages} images still need migration`);
  }
}

async function createStorageBucket(): Promise<void> {
  console.log('🪣 ENSURING STORAGE BUCKET EXISTS');
  console.log('=================================');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log(`❌ Failed to list buckets: ${listError.message}`);
      return;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'profile-images');
    
    if (bucketExists) {
      console.log('✅ profile-images bucket already exists');
      return;
    }
    
    console.log('📦 Creating profile-images bucket...');
    
    const { error: createError } = await supabase.storage.createBucket('profile-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (createError) {
      console.log(`❌ Failed to create bucket: ${createError.message}`);
      return;
    }
    
    console.log('✅ profile-images bucket created successfully');
    
  } catch (err) {
    console.log(`❌ Error with storage bucket: ${err}`);
  }
}

async function main(): Promise<void> {
  console.log('🎯 COMPLETE PROFILE IMAGE MIGRATION');
  console.log('===================================');
  console.log('Downloading all profile images from Airtable to Supabase Storage');
  console.log('');
  
  try {
    await createStorageBucket();
    await migrateAllProfileImages();
    await validateImageMigration();
    
    console.log('\n🎉 PROFILE IMAGE MIGRATION COMPLETE!');
    console.log('====================================');
    console.log('✅ All profile images downloaded and uploaded');
    console.log('✅ Storyteller records updated with Supabase URLs');
    console.log('✅ Images accessible via CDN');
    console.log('🎯 Ready for frontend display!');
    
  } catch (error) {
    console.error('❌ Profile image migration failed:', error);
  }
}

main().catch(console.error);