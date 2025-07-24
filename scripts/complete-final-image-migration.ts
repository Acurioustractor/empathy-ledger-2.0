#!/usr/bin/env tsx
/**
 * COMPLETE FINAL IMAGE MIGRATION
 * Migrate the remaining 8 storytellers with Airtable URLs to Supabase
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

async function migrateRemainingImages(): Promise<void> {
  console.log('🎯 COMPLETING FINAL IMAGE MIGRATION');
  console.log('==================================');
  
  try {
    // Get all storytellers with Airtable URLs
    const { data: storytellersWithAirtableUrls, error } = await supabase
      .from('storytellers')
      .select('id, full_name, profile_image_url')
      .not('profile_image_url', 'is', null)
      .like('profile_image_url', '%airtable%');
      
    if (error) {
      throw new Error(`Failed to fetch storytellers: ${error.message}`);
    }
    
    if (!storytellersWithAirtableUrls || storytellersWithAirtableUrls.length === 0) {
      console.log('✅ All images already migrated to Supabase!');
      return;
    }
    
    console.log(`📸 Found ${storytellersWithAirtableUrls.length} storytellers with Airtable URLs to migrate:`);
    storytellersWithAirtableUrls.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.full_name} (ID: ${s.id})`);
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const storyteller of storytellersWithAirtableUrls) {
      console.log(`\n👤 Processing: ${storyteller.full_name}`);
      console.log(`   🆔 ID: ${storyteller.id}`);
      console.log(`   🔗 Current URL: ${storyteller.profile_image_url.substring(0, 60)}...`);
      
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
        console.log(`   🔗 New URL: ${publicUrlData.publicUrl.substring(0, 60)}...`);
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
    console.log(`   📝 Total processed: ${storytellersWithAirtableUrls.length}`);
    
    if (successCount === storytellersWithAirtableUrls.length) {
      console.log(`\n🎉 ALL IMAGES SUCCESSFULLY MIGRATED TO SUPABASE!`);
      console.log(`   📈 100% migration complete - all ${successCount + 188} images now in Supabase`);
    } else if (successCount > 0) {
      console.log(`\n✅ Partial success: ${successCount} additional images migrated`);
      console.log(`   📋 ${errorCount} images still need manual attention`);
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting final image migration...\n');
  
  await migrateRemainingImages();
}

main().catch(console.error);