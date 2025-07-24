#!/usr/bin/env tsx
/**
 * MIGRATE FINAL MISSING IMAGES
 * Migrate images for Drew Nicholls and Nicholas Marchesi
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

interface AirtableStorytellerRecord {
  id: string;
  fields: {
    Name?: string;
    'File Profile Image'?: Array<{
      id: string;
      url: string;
      filename: string;
      size: number;
      type: string;
    }>;
  };
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

async function fetchSpecificAirtableStorytellers(): Promise<AirtableStorytellerRecord[]> {
  console.log('📥 Fetching storytellers from Airtable...');
  
  const allRecords: AirtableStorytellerRecord[] = [];
  let offset: string | undefined;

  do {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers${offset ? `?offset=${offset}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Storytellers: ${response.statusText}`);
    }

    const data = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } while (offset);

  // Filter for our specific storytellers with images
  const targetStorytellers = allRecords.filter(s => {
    const name = s.fields.Name;
    const hasImages = s.fields['File Profile Image'] && s.fields['File Profile Image'].length > 0;
    
    return hasImages && name && (
      name.includes('Drew Nicholls') || 
      name.includes('Nicholas Marchesi')
    );
  });
  
  console.log(`📊 Found ${targetStorytellers.length} target storytellers with images`);
  return targetStorytellers;
}

async function migrateSpecificImages(): Promise<void> {
  console.log('🎯 MIGRATING SPECIFIC MISSING IMAGES');
  console.log('===================================');
  
  try {
    // Get target storytellers from Airtable
    const airtableStorytellers = await fetchSpecificAirtableStorytellers();
    
    if (airtableStorytellers.length === 0) {
      console.log('❌ No target storytellers found in Airtable');
      return;
    }
    
    // Get the specific Supabase storytellers
    const { data: supabaseStorytellers, error } = await supabase
      .from('storytellers')
      .select('id, full_name, profile_image_url')
      .or('full_name.ilike.%Drew Nicholls%,full_name.ilike.%Nicholas Marchesi%');
      
    if (error) {
      throw new Error(`Failed to fetch Supabase storytellers: ${error.message}`);
    }
    
    console.log(`📊 Found ${supabaseStorytellers?.length || 0} matching Supabase storytellers\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const airtableStoryteller of airtableStorytellers) {
      const airtableName = airtableStoryteller.fields.Name || 'Unknown';
      const images = airtableStoryteller.fields['File Profile Image'] || [];
      
      console.log(`👤 Processing: "${airtableName}"`);
      console.log(`   🆔 Airtable ID: ${airtableStoryteller.id}`);
      console.log(`   📸 Images: ${images.length}`);
      
      // Find matching Supabase storyteller
      const supabaseMatch = supabaseStorytellers?.find(s => {
        if (!s.full_name) return false;
        const cleanAirtable = airtableName.toLowerCase().trim().replace(/\s+/g, ' ');
        const cleanSupabase = s.full_name.toLowerCase().trim().replace(/\s+/g, ' ');
        return cleanAirtable.includes('drew nicholls') && cleanSupabase.includes('drew nicholls') ||
               cleanAirtable.includes('nicholas marchesi') && cleanSupabase.includes('nicholas marchesi');
      });
      
      if (!supabaseMatch) {
        console.log(`   ❌ No matching Supabase storyteller found`);
        errorCount++;
        continue;
      }
      
      console.log(`   ✅ Found match: "${supabaseMatch.full_name}" (${supabaseMatch.id})`);
      
      // Check if already has image
      if (supabaseMatch.profile_image_url) {
        console.log(`   ⏭️  Already has image, skipping...`);
        continue;
      }
      
      try {
        const mainImage = images[0];
        console.log(`   📥 Processing image: ${mainImage.filename} (${Math.round(mainImage.size / 1024)}KB)`);
        
        // Generate filename for storage
        const urlHash = createHash('md5').update(mainImage.url).digest('hex');
        const extension = getImageExtension(mainImage.url);
        const fileName = `storyteller-images/${supabaseMatch.id}-${urlHash}${extension}`;
        
        // Download image
        console.log('   📥 Downloading...');
        const response = await fetch(mainImage.url);
        
        if (!response.ok) {
          console.log(`   ❌ Download failed: ${response.status} ${response.statusText}`);
          errorCount++;
          continue;
        }
        
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || mainImage.type || 'image/jpeg';
        
        console.log(`   📤 Uploading to Supabase storage...`);
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
        
        // Update storyteller
        console.log('   💾 Updating storyteller profile...');
        const { error: updateError } = await supabase
          .from('storytellers')
          .update({ 
            profile_image_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', supabaseMatch.id);
          
        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`);
          errorCount++;
          continue;
        }
        
        console.log(`   ✅ Successfully migrated!`);
        console.log(`   🔗 New URL: ${publicUrlData.publicUrl.substring(0, 80)}...`);
        successCount++;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
        errorCount++;
      }
      
      console.log(''); // Empty line
    }
    
    console.log(`📊 MIGRATION SUMMARY:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 Successfully migrated ${successCount} additional images!`);
      console.log(`   📈 Total images in Supabase should now be: ${196 + successCount}`);
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function main(): Promise<void> {
  await migrateSpecificImages();
}

main().catch(console.error);