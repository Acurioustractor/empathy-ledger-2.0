#!/usr/bin/env tsx
/**
 * MIGRATE FINAL 2 IMAGES
 * Complete the migration of the last 2 storyteller images
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createHash } from 'crypto';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable API credentials');
}

function getImageExtension(url: string): string {
  try {
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath);
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    if (validExtensions.includes(extension.toLowerCase())) {
      return extension.toLowerCase();
    }
    
    return '.jpg';
  } catch {
    return '.jpg';
  }
}

async function migrateFinalTwoImages(): Promise<void> {
  console.log('🎯 MIGRATING FINAL 2 STORYTELLER IMAGES');
  console.log('=====================================');
  
  try {
    // Get storytellers that still have Airtable URLs 
    const { data: unmigrated, error } = await supabase
      .from('storytellers')
      .select('id, full_name, profile_image_url')
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%airtable%');
      
    if (error) {
      throw new Error(`Failed to fetch unmigrated storytellers: ${error.message}`);
    }
    
    if (!unmigrated || unmigrated.length === 0) {
      console.log('✅ All images already migrated!');
      return;
    }
    
    console.log(`📸 Found ${unmigrated.length} storytellers to migrate:`);
    unmigrated.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.full_name} (${s.id})`);
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const storyteller of unmigrated) {
      console.log(`\n👤 Processing: ${storyteller.full_name}`);
      console.log(`   🆔 ID: ${storyteller.id}`);
      console.log(`   🔗 Current URL: ${storyteller.profile_image_url.substring(0, 80)}...`);
      
      try {
        // Generate filename for storage
        const urlHash = createHash('md5').update(storyteller.profile_image_url).digest('hex');
        const extension = getImageExtension(storyteller.profile_image_url);
        const fileName = `storyteller-images/${storyteller.id}-${urlHash}${extension}`;
        
        // Download image from Airtable
        console.log('   📥 Downloading image...');
        const response = await fetch(storyteller.profile_image_url);
        
        if (!response.ok) {
          console.log(`   ❌ Failed to download: ${response.status} ${response.statusText}`);
          errorCount++;
          continue;
        }
        
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        console.log(`   📏 Downloaded ${Math.round(imageBuffer.byteLength / 1024)}KB`);
        
        // Upload to Supabase storage
        console.log('   📤 Uploading to Supabase storage...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageBuffer, {
            contentType,
            upsert: true
          });
          
        if (uploadError) {
          console.log(`   ❌ Upload failed: ${uploadError.message}`);
          errorCount++;
          continue;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);
          
        if (!publicUrlData.publicUrl) {
          console.log('   ❌ Failed to get public URL');
          errorCount++;
          continue;
        }
        
        // Update storyteller with new profile image URL
        console.log('   💾 Updating storyteller profile...');
        const { error: updateError } = await supabase
          .from('storytellers')
          .update({ 
            profile_image_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', storyteller.id);
          
        if (updateError) {
          console.log(`   ❌ Failed to update storyteller: ${updateError.message}`);
          errorCount++;
          continue;
        }
        
        console.log(`   ✅ Successfully migrated!`);
        console.log(`   🔗 New URL: ${publicUrlData.publicUrl.substring(0, 80)}...`);
        successCount++;
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Error processing storyteller: ${error instanceof Error ? error.message : error}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 FINAL MIGRATION SUMMARY:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${unmigrated.length}`);
    
    if (successCount === unmigrated.length && errorCount === 0) {
      console.log(`\n🎉 PERFECT! ALL STORYTELLER IMAGES NOW IN SUPABASE!`);
      console.log(`   📈 100% complete migration achieved`);
    } else if (successCount > 0) {
      console.log(`\n✅ Progress: ${successCount} more images successfully migrated`);
      if (errorCount > 0) {
        console.log(`   ⚠️  ${errorCount} images still need attention`);
      }
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting migration of final images...\n');
  
  await migrateFinalTwoImages();
}

main().catch(console.error);