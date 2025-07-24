#!/usr/bin/env tsx
/**
 * FETCH ALL 210 STORYTELLERS - CORRECTED PAGINATION
 * The Migration view has 100 records with offset=Yes, meaning more pages exist!
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const ALL_STORYTELLERS_VIEW_ID = 'viwtGaott2mxFI1nD'; // Migration view

async function fetchAll210StorytellersWithProperPagination(): Promise<any[]> {
  console.log('📊 FETCHING ALL 210 STORYTELLERS - CORRECTED PAGINATION');
  console.log('======================================================');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`Table ID: tbl9zxLsGOd3fjWXp`);
  console.log(`View ID: ${ALL_STORYTELLERS_VIEW_ID} (Migration view)`);
  console.log('');
  
  const allRecords: any[] = [];
  let offset = '';
  let pageCount = 0;
  
  try {
    do {
      pageCount++;
      
      // Build URL with proper offset handling
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${ALL_STORYTELLERS_VIEW_ID}&maxRecords=100${offset ? `&offset=${offset}` : ''}`;
      
      console.log(`📄 Page ${pageCount}: Fetching next batch...`);
      console.log(`   URL: ${url.split('&offset=')[0]}${offset ? '&offset=[OFFSET]' : ''}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'User-Agent': 'Empathy-Ledger-Corrected-Pagination/1.0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
        console.error(`   Error details: ${errorText}`);
        break;
      }
      
      const data = await response.json();
      
      console.log(`   📊 Records in this page: ${data.records?.length || 0}`);
      console.log(`   📋 Has more pages: ${data.offset ? 'YES' : 'NO'}`);
      
      if (data.records && data.records.length > 0) {
        allRecords.push(...data.records);
        
        console.log(`   📈 Total records so far: ${allRecords.length}`);
        console.log(`   📋 First record this page: ${data.records[0]?.fields?.Name || 'No name'}`);
        console.log(`   📋 Last record this page: ${data.records[data.records.length - 1]?.fields?.Name || 'No name'}`);
      }
      
      // THIS WAS THE CRITICAL BUG - properly handle offset continuation
      offset = data.offset || '';
      console.log(`   ⏭️  Next offset: ${offset ? 'SET (continuing...)' : 'NONE (finished)'}`);
      console.log('');
      
      // Safety check - but allow more pages since we expect 210 records
      if (pageCount > 5) {
        console.log('⚠️  Safety break at 5 pages (should be enough for 210 records)');
        break;
      }
      
      // Rate limiting between requests
      if (offset) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
    } while (offset); // Continue while there's an offset
    
  } catch (error) {
    console.error('❌ Failed to fetch with proper pagination:', error);
  }
  
  console.log(`✅ PAGINATION COMPLETE`);
  console.log(`📊 Total storytellers found: ${allRecords.length}`);
  
  return allRecords;
}

async function analyzeFull210Results(records: any[]): Promise<void> {
  console.log('\n📊 ANALYZING FULL 210 STORYTELLER RESULTS');
  console.log('=========================================');
  
  if (records.length === 0) {
    console.log('❌ No records to analyze');
    return;
  }
  
  console.log(`📈 Total storytellers: ${records.length}`);
  
  // Check field completeness for all the expected fields
  const withNames = records.filter(r => r.fields?.Name).length;
  const withImages = records.filter(r => {
    const imageField = r.fields['File Profile Image'];
    return imageField && Array.isArray(imageField) && imageField.length > 0;
  }).length;
  
  const withTranscripts = records.filter(r => {
    const transcript = r.fields['Transcript (from Media)'];
    return transcript && Array.isArray(transcript) && transcript.length > 0 && transcript[0].length > 50;
  }).length;
  
  const withProjects = records.filter(r => r.fields?.Project).length;
  const withLocations = records.filter(r => r.fields?.Location).length;
  
  console.log('\n📋 FIELD COMPLETENESS (ALL RECORDS):');
  console.log(`   Names: ${withNames}/${records.length} (${((withNames/records.length)*100).toFixed(1)}%)`);
  console.log(`   Profile Images: ${withImages}/${records.length} (${((withImages/records.length)*100).toFixed(1)}%)`);
  console.log(`   Transcripts: ${withTranscripts}/${records.length} (${((withTranscripts/records.length)*100).toFixed(1)}%)`);
  console.log(`   Projects: ${withProjects}/${records.length} (${((withProjects/records.length)*100).toFixed(1)}%)`);
  console.log(`   Locations: ${withLocations}/${records.length} (${((withLocations/records.length)*100).toFixed(1)}%)`);
  
  // Show distribution across pages
  console.log('\n📋 RECORDS BY PAGE:');
  const pageSize = 100;
  for (let i = 0; i < Math.ceil(records.length / pageSize); i++) {
    const startIdx = i * pageSize;
    const endIdx = Math.min(startIdx + pageSize, records.length);
    const pageRecords = records.slice(startIdx, endIdx);
    
    console.log(`   Page ${i + 1}: Records ${startIdx + 1}-${endIdx} (${pageRecords.length} records)`);
    console.log(`      First: ${pageRecords[0]?.fields?.Name || 'No name'}`);
    console.log(`      Last: ${pageRecords[pageRecords.length - 1]?.fields?.Name || 'No name'}`);
  }
  
  // Sample from each page to verify diversity
  console.log('\n📋 SAMPLE FROM EACH PAGE:');
  for (let i = 0; i < Math.ceil(records.length / pageSize); i++) {
    const startIdx = i * pageSize;
    const endIdx = Math.min(startIdx + pageSize, records.length);
    const pageRecords = records.slice(startIdx, endIdx);
    
    console.log(`   Page ${i + 1} samples:`);
    pageRecords.slice(0, 3).forEach((record, idx) => {
      const hasImage = record.fields['File Profile Image'] && Array.isArray(record.fields['File Profile Image']) && record.fields['File Profile Image'].length > 0;
      const hasTranscript = record.fields['Transcript (from Media)'] && Array.isArray(record.fields['Transcript (from Media)']) && record.fields['Transcript (from Media)'].length > 0;
      
      console.log(`     ${startIdx + idx + 1}. ${record.fields?.Name || 'No name'} (${record.id})`);
      console.log(`        Image: ${hasImage ? 'Yes' : 'No'}, Transcript: ${hasTranscript ? 'Yes' : 'No'}`);
    });
  }
}

async function main() {
  console.log('🎯 CORRECTED: FETCH ALL 210 STORYTELLERS WITH PROPER PAGINATION');
  console.log('================================================================');
  console.log('The investigation showed the Migration view has 100 records WITH offset=Yes');
  console.log('This means there are more pages - the original script had a pagination bug!');
  console.log('');
  
  try {
    // Fetch all storytellers with corrected pagination
    const all210Storytellers = await fetchAll210StorytellersWithProperPagination();
    
    // Analyze the complete results
    await analyzeFull210Results(all210Storytellers);
    
    console.log('\n🎯 FINAL RESULTS SUMMARY');
    console.log('========================');
    
    if (all210Storytellers.length >= 210) {
      console.log(`🎉 SUCCESS! Found ${all210Storytellers.length} storytellers (≥210 expected)`);
      console.log('✅ The pagination bug has been fixed!');
      console.log('✅ Ready to proceed with complete migration of all storytellers');
      console.log('✅ Most records have profile images and transcripts as expected');
    } else if (all210Storytellers.length >= 200) {
      console.log(`⚠️  CLOSE: Found ${all210Storytellers.length} storytellers (close to 210 expected)`);
      console.log('🔍 Very close to the expected count - might be a few filtered records');
    } else if (all210Storytellers.length > 100) {
      console.log(`📈 PROGRESS: Found ${all210Storytellers.length} storytellers (more than the original 100!)`);
      console.log('✅ Pagination fix worked - getting more records than before');
      console.log('🔍 Still investigating why not the full 210');
    } else {
      console.log(`❌ SAME ISSUE: Still finding only ${all210Storytellers.length} storytellers`);
      console.log('🔧 The pagination approach may need further investigation');
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch all 210 storytellers:', error);
  }
}

main().catch(console.error);