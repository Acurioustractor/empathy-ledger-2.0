#!/usr/bin/env tsx
/**
 * DIAGNOSE AIRTABLE PROFILE IMAGES
 * Check all storytellers in Airtable for "File Profile Image" and identify download issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
      width?: number;
      height?: number;
    }>;
    'Unique Storyteller ID'?: string;
  };
}

async function fetchAllAirtableStorytellersWithImages(): Promise<AirtableStorytellerRecord[]> {
  const allRecords: AirtableStorytellerRecord[] = [];
  let offset: string | undefined;
  let pageCount = 0;

  console.log('📥 Fetching ALL storytellers from Airtable...');

  do {
    pageCount++;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers${offset ? `?offset=${offset}` : ''}`;
    
    console.log(`   📄 Fetching page ${pageCount}...`);
    
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
    
    console.log(`   ✅ Page ${pageCount}: ${data.records.length} records (total: ${allRecords.length})`);
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } while (offset);

  console.log(`📊 Total storytellers fetched: ${allRecords.length}\n`);
  return allRecords;
}

async function getSupabaseStorytellers(): Promise<any[]> {
  console.log('📥 Fetching storytellers from Supabase...');
  
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select('id, full_name, profile_image_url');
    
  if (error) {
    throw new Error(`Failed to fetch Supabase storytellers: ${error.message}`);
  }
  
  console.log(`📊 Supabase storytellers: ${storytellers?.length || 0}\n`);
  return storytellers || [];
}

async function testImageDownload(imageUrl: string, imageName: string): Promise<{success: boolean, error?: string, size?: number}> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' }); // Just get headers first
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    console.log(`     📏 Size: ${contentLength ? `${Math.round(parseInt(contentLength) / 1024)}KB` : 'unknown'}`);
    console.log(`     🎭 Type: ${contentType || 'unknown'}`);
    
    // Try actual download if headers look good
    const fullResponse = await fetch(imageUrl);
    if (!fullResponse.ok) {
      return { success: false, error: `Download failed: HTTP ${fullResponse.status}` };
    }
    
    const buffer = await fullResponse.arrayBuffer();
    return { 
      success: true, 
      size: buffer.byteLength 
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function findMatchingSupabaseStoryteller(airtableName: string, supabaseStorytellers: any[]) {
  if (!airtableName) return null;
  
  const cleanName = airtableName.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Try exact match first
  let match = supabaseStorytellers.find(s => 
    s.full_name && s.full_name.toLowerCase().trim().replace(/\s+/g, ' ') === cleanName
  );
  
  if (match) return match;
  
  // Try partial match
  match = supabaseStorytellers.find(s => {
    if (!s.full_name) return false;
    const supabaseName = s.full_name.toLowerCase().trim().replace(/\s+/g, ' ');
    return supabaseName.includes(cleanName) || cleanName.includes(supabaseName);
  });
  
  return match;
}

async function diagnoseProfileImages(): Promise<void> {
  console.log('🔍 DIAGNOSING AIRTABLE PROFILE IMAGES');
  console.log('====================================\n');
  
  try {
    // Fetch data from both sources
    const [airtableStorytellers, supabaseStorytellers] = await Promise.all([
      fetchAllAirtableStorytellersWithImages(),
      getSupabaseStorytellers()
    ]);
    
    // Filter Airtable storytellers with images
    const storytellersWithImages = airtableStorytellers.filter(s => 
      s.fields['File Profile Image'] && s.fields['File Profile Image'].length > 0
    );
    
    console.log(`📊 ANALYSIS:`);
    console.log(`   📝 Total Airtable storytellers: ${airtableStorytellers.length}`);
    console.log(`   🖼️  Airtable storytellers with images: ${storytellersWithImages.length}`);
    console.log(`   🏠 Supabase storytellers: ${supabaseStorytellers.length}\n`);
    
    let matchedCount = 0;
    let unmatchedCount = 0;
    let downloadableCount = 0;
    let downloadErrorsCount = 0;
    let alreadyMigratedCount = 0;
    
    const downloadErrors: string[] = [];
    const unmatchedStorytellers: string[] = [];
    
    console.log('🔍 DETAILED ANALYSIS:\n');
    
    for (const airtableStoryteller of storytellersWithImages) {
      const name = airtableStoryteller.fields.Name || 'Unknown';
      const images = airtableStoryteller.fields['File Profile Image'] || [];
      
      console.log(`👤 ${name} (${airtableStoryteller.id})`);
      console.log(`   📸 Images: ${images.length}`);
      
      // Check if we have this storyteller in Supabase
      const supabaseMatch = await findMatchingSupabaseStoryteller(name, supabaseStorytellers);
      
      if (!supabaseMatch) {
        console.log(`   ❌ No match found in Supabase`);
        unmatchedCount++;
        unmatchedStorytellers.push(name);
        continue;
      }
      
      console.log(`   ✅ Matched: ${supabaseMatch.full_name} (${supabaseMatch.id})`);
      matchedCount++;
      
      // Check if already has image in Supabase
      if (supabaseMatch.profile_image_url && supabaseMatch.profile_image_url.includes('supabase')) {
        console.log(`   ⏭️  Already migrated to Supabase`);
        alreadyMigratedCount++;
        continue;
      }
      
      // Test downloading the first image
      const mainImage = images[0];
      console.log(`   🔗 Testing image: ${mainImage.filename}`);
      console.log(`   📏 Original size: ${Math.round(mainImage.size / 1024)}KB`);
      
      const downloadTest = await testImageDownload(mainImage.url, mainImage.filename);
      
      if (downloadTest.success) {
        console.log(`   ✅ Download successful (${Math.round((downloadTest.size || 0) / 1024)}KB)`);
        downloadableCount++;
      } else {
        console.log(`   ❌ Download failed: ${downloadTest.error}`);
        downloadErrorsCount++;
        downloadErrors.push(`${name}: ${downloadTest.error}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log(`📊 FINAL DIAGNOSIS:`);
    console.log(`   ✅ Matched to Supabase: ${matchedCount}`);
    console.log(`   ❌ No Supabase match: ${unmatchedCount}`);
    console.log(`   🏠 Already migrated: ${alreadyMigratedCount}`);
    console.log(`   📥 Downloadable: ${downloadableCount}`);
    console.log(`   💥 Download errors: ${downloadErrorsCount}`);
    
    if (downloadErrors.length > 0) {
      console.log(`\n💥 DOWNLOAD ERRORS:`);
      downloadErrors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (unmatchedStorytellers.length > 0) {
      console.log(`\n❓ UNMATCHED STORYTELLERS:`);
      unmatchedStorytellers.slice(0, 10).forEach(name => console.log(`   - ${name}`));
      if (unmatchedStorytellers.length > 10) {
        console.log(`   ... and ${unmatchedStorytellers.length - 10} more`);
      }
    }
    
    const totalMigratableImages = downloadableCount;
    console.log(`\n🎯 MIGRATION POTENTIAL:`);
    console.log(`   📸 Images ready to migrate: ${totalMigratableImages}`);
    console.log(`   ⚠️  Images with issues: ${downloadErrorsCount + unmatchedCount}`);
    
  } catch (error) {
    console.error('💥 Diagnosis failed:', error);
  }
}

async function main(): Promise<void> {
  await diagnoseProfileImages();
}

main().catch(console.error);