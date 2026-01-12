#!/usr/bin/env tsx
/**
 * FIND MISSING STORYTELLERS
 * Compare Airtable vs Supabase to find missing storytellers with images
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
    }>;
    'Unique Storyteller ID'?: string;
  };
}

async function fetchAllAirtableStorytellers(): Promise<AirtableStorytellerRecord[]> {
  const allRecords: AirtableStorytellerRecord[] = [];
  let offset: string | undefined;

  console.log('📥 Fetching ALL storytellers from Airtable...');

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
    
    console.log(`   📄 Fetched ${data.records.length} records (total: ${allRecords.length})`);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } while (offset);

  console.log(`📊 Total Airtable storytellers: ${allRecords.length}\n`);
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

function cleanName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
}

function findSupabaseMatch(airtableName: string, supabaseStorytellers: any[]) {
  if (!airtableName) return null;
  
  const cleanAirtableName = cleanName(airtableName);
  
  // Try exact match
  let match = supabaseStorytellers.find(s => 
    s.full_name && cleanName(s.full_name) === cleanAirtableName
  );
  
  if (match) return match;
  
  // Try partial match
  match = supabaseStorytellers.find(s => {
    if (!s.full_name) return false;
    const cleanSupabaseName = cleanName(s.full_name);
    return cleanSupabaseName.includes(cleanAirtableName) || cleanAirtableName.includes(cleanSupabaseName);
  });
  
  return match;
}

async function findMissingStorytellers(): Promise<void> {
  console.log('🔍 FINDING MISSING STORYTELLERS');
  console.log('==============================\n');
  
  try {
    const [airtableStorytellers, supabaseStorytellers] = await Promise.all([
      fetchAllAirtableStorytellers(),
      getSupabaseStorytellers()
    ]);
    
    // Filter Airtable storytellers with images
    const airtableWithImages = airtableStorytellers.filter(s => 
      s.fields['File Profile Image'] && s.fields['File Profile Image'].length > 0
    );
    
    console.log(`📊 COUNTS:`);
    console.log(`   📝 Airtable total: ${airtableStorytellers.length}`);
    console.log(`   🖼️  Airtable with images: ${airtableWithImages.length}`);
    console.log(`   🏠 Supabase total: ${supabaseStorytellers.length}`);
    
    const supabaseWithImages = supabaseStorytellers.filter(s => s.profile_image_url);
    console.log(`   🖼️  Supabase with images: ${supabaseWithImages.length}\n`);
    
    // Find storytellers in Airtable with images that don't exist in Supabase
    const missingInSupabase: AirtableStorytellerRecord[] = [];
    const matchedButNoImage: { airtable: AirtableStorytellerRecord, supabase: any }[] = [];
    const perfectMatches: { airtable: AirtableStorytellerRecord, supabase: any }[] = [];
    
    console.log('🔍 ANALYZING MATCHES:\n');
    
    for (const airtableStoryteller of airtableWithImages) {
      const airtableName = airtableStoryteller.fields.Name || 'Unknown';
      const supabaseMatch = findSupabaseMatch(airtableName, supabaseStorytellers);
      
      if (!supabaseMatch) {
        console.log(`❌ NOT IN SUPABASE: "${airtableName}" (${airtableStoryteller.id})`);
        missingInSupabase.push(airtableStoryteller);
      } else if (!supabaseMatch.profile_image_url) {
        console.log(`⚠️  NO IMAGE: "${airtableName}" → "${supabaseMatch.full_name}" (has Airtable image but no Supabase image)`);
        matchedButNoImage.push({ airtable: airtableStoryteller, supabase: supabaseMatch });
      } else {
        perfectMatches.push({ airtable: airtableStoryteller, supabase: supabaseMatch });
      }
    }
    
    console.log(`\n📊 ANALYSIS RESULTS:`);
    console.log(`   ✅ Perfect matches (has image): ${perfectMatches.length}`);
    console.log(`   ⚠️  Matched but missing image: ${matchedButNoImage.length}`);
    console.log(`   ❌ Not in Supabase at all: ${missingInSupabase.length}`);
    
    const totalMigratableImages = matchedButNoImage.length + missingInSupabase.length;
    console.log(`\n🎯 MIGRATION OPPORTUNITIES:`);
    console.log(`   📸 Additional images to migrate: ${totalMigratableImages}`);
    
    if (matchedButNoImage.length > 0) {
      console.log(`\n⚠️  STORYTELLERS WITH MISSING IMAGES:`);
      matchedButNoImage.slice(0, 10).forEach((pair, i) => {
        console.log(`   ${i + 1}. "${pair.airtable.fields.Name}" → "${pair.supabase.full_name}"`);
        console.log(`      Supabase ID: ${pair.supabase.id}`);
        console.log(`      Images in Airtable: ${pair.airtable.fields['File Profile Image']?.length || 0}`);
      });
      if (matchedButNoImage.length > 10) {
        console.log(`   ... and ${matchedButNoImage.length - 10} more`);
      }
    }
    
    if (missingInSupabase.length > 0) {
      console.log(`\n❌ STORYTELLERS NOT IN SUPABASE:`);
      missingInSupabase.slice(0, 10).forEach((storyteller, i) => {
        console.log(`   ${i + 1}. "${storyteller.fields.Name}" (${storyteller.id})`);
        console.log(`      Images: ${storyteller.fields['File Profile Image']?.length || 0}`);
      });
      if (missingInSupabase.length > 10) {
        console.log(`   ... and ${missingInSupabase.length - 10} more`);
      }
    }
    
    // Check the math
    const expectedSupabaseWithImages = perfectMatches.length + matchedButNoImage.length;
    console.log(`\n🧮 MATH CHECK:`);
    console.log(`   Expected Supabase with images: ${expectedSupabaseWithImages}`);
    console.log(`   Actual Supabase with images: ${supabaseWithImages.length}`);
    console.log(`   Difference: ${supabaseWithImages.length - expectedSupabaseWithImages}`);
    
    if (supabaseWithImages.length - expectedSupabaseWithImages > 0) {
      console.log(`   ℹ️  This suggests ${supabaseWithImages.length - expectedSupabaseWithImages} storytellers in Supabase have images but no Airtable match`);
    }
    
  } catch (error) {
    console.error('💥 Analysis failed:', error);
  }
}

async function main(): Promise<void> {
  await findMissingStorytellers();
}

main().catch(console.error);