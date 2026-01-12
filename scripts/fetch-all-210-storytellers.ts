#!/usr/bin/env tsx
/**
 * FETCH ALL 210 STORYTELLERS - CORRECTED
 * Using the specific view that contains all 210 storytellers
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

// The specific view ID from the user's link that shows all 210 storytellers
const ALL_STORYTELLERS_VIEW_ID = 'viwtGaott2mxFI1nD';

async function fetchAll210StorytellersFromCorrectView(): Promise<any[]> {
  console.log('📊 FETCHING ALL 210 STORYTELLERS FROM CORRECT VIEW');
  console.log('=================================================');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`Table ID: tbl9zxLsGOd3fjWXp`);
  console.log(`View ID: ${ALL_STORYTELLERS_VIEW_ID}`);
  console.log('');
  
  const allRecords: any[] = [];
  let offset = '';
  let pageCount = 0;
  
  try {
    do {
      pageCount++;
      
      // Use the specific view that shows all 210 storytellers
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${ALL_STORYTELLERS_VIEW_ID}&maxRecords=100${offset ? `&offset=${offset}` : ''}`;
      
      console.log(`📄 Page ${pageCount}: Fetching from view ${ALL_STORYTELLERS_VIEW_ID}...`);
      console.log(`   URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'User-Agent': 'Empathy-Ledger-Corrected/1.0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        console.error(`   Error details: ${errorText}`);
        break;
      }
      
      const data = await response.json();
      
      console.log(`   📊 Records in response: ${data.records?.length || 0}`);
      console.log(`   📋 Has offset: ${data.offset ? 'Yes' : 'No'}`);
      
      if (data.records && data.records.length > 0) {
        allRecords.push(...data.records);
        
        console.log(`   📈 Total records so far: ${allRecords.length}`);
        console.log(`   📋 First record this page: ${data.records[0]?.fields?.Name || 'No name'}`);
        console.log(`   📋 Last record this page: ${data.records[data.records.length - 1]?.fields?.Name || 'No name'}`);
      }
      
      offset = data.offset || '';
      console.log(`   ⏭️  Next offset: ${offset || 'NONE'}`);
      console.log('');
      
      // Safety check
      if (pageCount > 10) {
        console.log('⚠️  Safety break at 10 pages (should have all 210 by now)');
        break;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } while (offset);
    
  } catch (error) {
    console.error('❌ Failed to fetch from correct view:', error);
  }
  
  console.log(`✅ FETCH COMPLETE FROM CORRECT VIEW`);
  console.log(`📊 Total storytellers found: ${allRecords.length}`);
  
  return allRecords;
}

async function analyzeAll210Storytellers(records: any[]): Promise<void> {
  console.log('\n📊 ANALYZING ALL 210 STORYTELLERS');
  console.log('=================================');
  
  if (records.length === 0) {
    console.log('❌ No records to analyze');
    return;
  }
  
  console.log(`📈 Total storytellers: ${records.length}`);
  
  // Check field completeness for the expected fields
  const withNames = records.filter(r => r.fields?.Name).length;
  const withImages = records.filter(r => r.fields['File Profile Image'] && Array.isArray(r.fields['File Profile Image']) && r.fields['File Profile Image'].length > 0).length;
  const withTranscripts = records.filter(r => {
    const transcript = r.fields['Transcript (from Media)'];
    return transcript && Array.isArray(transcript) && transcript.length > 0 && transcript[0].length > 50;
  }).length;
  const withProjects = records.filter(r => r.fields?.Project).length;
  const withLocations = records.filter(r => r.fields?.Location).length;
  
  console.log('\n📋 FIELD COMPLETENESS:');
  console.log(`   Names: ${withNames}/${records.length} (${((withNames/records.length)*100).toFixed(1)}%)`);
  console.log(`   Profile Images: ${withImages}/${records.length} (${((withImages/records.length)*100).toFixed(1)}%)`);
  console.log(`   Transcripts: ${withTranscripts}/${records.length} (${((withTranscripts/records.length)*100).toFixed(1)}%)`);
  console.log(`   Projects: ${withProjects}/${records.length} (${((withProjects/records.length)*100).toFixed(1)}%)`);
  console.log(`   Locations: ${withLocations}/${records.length} (${((withLocations/records.length)*100).toFixed(1)}%)`);
  
  // Show sample of the records
  console.log('\n📋 SAMPLE RECORDS (first 10):');
  records.slice(0, 10).forEach((record, i) => {
    const hasImage = record.fields['File Profile Image'] && Array.isArray(record.fields['File Profile Image']) && record.fields['File Profile Image'].length > 0;
    const hasTranscript = record.fields['Transcript (from Media)'] && Array.isArray(record.fields['Transcript (from Media)']) && record.fields['Transcript (from Media)'].length > 0;
    
    console.log(`   ${i+1}. ${record.fields?.Name || 'No name'} (${record.id})`);
    console.log(`      Image: ${hasImage ? 'Yes' : 'No'}, Transcript: ${hasTranscript ? 'Yes' : 'No'}`);
  });
  
  console.log('\n📋 SAMPLE RECORDS (last 10):');
  records.slice(-10).forEach((record, i) => {
    const index = records.length - 10 + i + 1;
    const hasImage = record.fields['File Profile Image'] && Array.isArray(record.fields['File Profile Image']) && record.fields['File Profile Image'].length > 0;
    const hasTranscript = record.fields['Transcript (from Media)'] && Array.isArray(record.fields['Transcript (from Media)']) && record.fields['Transcript (from Media)'].length > 0;
    
    console.log(`   ${index}. ${record.fields?.Name || 'No name'} (${record.id})`);
    console.log(`      Image: ${hasImage ? 'Yes' : 'No'}, Transcript: ${hasTranscript ? 'Yes' : 'No'}`);
  });
}

async function validateCorrectViewAccess(): Promise<void> {
  console.log('\n🔍 VALIDATING CORRECT VIEW ACCESS');
  console.log('=================================');
  
  // Test different approaches to make sure we're getting the right data
  const testUrls = [
    // Direct table access (what we were doing wrong)
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers`,
    // Specific view access (correct approach)
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${ALL_STORYTELLERS_VIEW_ID}`,
    // Using table name with view
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?view=${ALL_STORYTELLERS_VIEW_ID}`
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    try {
      console.log(`\n🧪 Test ${i+1}: ${i === 0 ? 'Default (wrong)' : i === 1 ? 'Table ID + View (best)' : 'Table Name + View'}`);
      
      const response = await fetch(`${testUrls[i]}&maxRecords=5`, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success: ${data.records?.length || 0} records in first page`);
        console.log(`   📋 Has offset: ${data.offset ? 'Yes' : 'No'}`);
        if (data.records?.[0]) {
          console.log(`   📋 First record: ${data.records[0].fields?.Name || 'No name'}`);
        }
      } else {
        console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.log(`   💥 Error: ${err}`);
    }
  }
}

async function main() {
  console.log('🎯 CORRECTED: FETCH ALL 210 STORYTELLERS');
  console.log('========================================');
  console.log('Using the correct view that you confirmed contains all 210 storytellers');
  console.log('View URL: https://airtable.com/app7G3Ae65pBblJke/tbl9zxLsGOd3fjWXp/viwtGaott2mxFI1nD');
  console.log('');
  
  try {
    // First validate our approach
    await validateCorrectViewAccess();
    
    // Then fetch all 210 storytellers
    const all210Storytellers = await fetchAll210StorytellersFromCorrectView();
    
    // Analyze the results
    await analyzeAll210Storytellers(all210Storytellers);
    
    console.log('\n🎯 RESULTS SUMMARY');
    console.log('==================');
    
    if (all210Storytellers.length >= 210) {
      console.log(`🎉 SUCCESS! Found ${all210Storytellers.length} storytellers (≥210 expected)`);
      console.log('✅ Ready to proceed with complete migration of all storytellers');
    } else if (all210Storytellers.length >= 200) {
      console.log(`⚠️  CLOSE: Found ${all210Storytellers.length} storytellers (close to 210 expected)`);
      console.log('🔍 Might need to check for a few missing records');
    } else {
      console.log(`❌ STILL MISSING: Found ${all210Storytellers.length} storytellers (210 expected)`);
      console.log('🔧 Need to investigate further or try different API approaches');
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch all 210 storytellers:', error);
  }
}

main().catch(console.error);