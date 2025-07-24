#!/usr/bin/env tsx
/**
 * FIND ALL 210 STORYTELLERS
 * Try different views and fix offset handling to get all storytellers
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function fetchWithView(viewName?: string): Promise<any[]> {
  console.log(`\n📊 FETCHING WITH VIEW: ${viewName || 'Default'}`);
  console.log('================================');
  
  const records: any[] = [];
  let offset = '';
  let pageCount = 0;

  try {
    do {
      pageCount++;
      
      const params = new URLSearchParams();
      params.append('maxRecords', '100');
      if (offset) {
        params.append('offset', offset);
      }
      if (viewName) {
        params.append('view', viewName);
      }
      
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?${params.toString()}`;
      
      console.log(`📄 Page ${pageCount}:`);
      console.log(`   URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error: ${response.status} - ${errorText}`);
        break;
      }
      
      const data = await response.json();
      
      console.log(`   Records: ${data.records?.length || 0}`);
      console.log(`   Offset: ${data.offset || 'none'}`);
      
      // CRITICAL FIX: Check data.offset, not offset variable
      records.push(...(data.records || []));
      offset = data.offset || '';
      
      console.log(`   Total so far: ${records.length}`);
      
      // Safety break
      if (pageCount > 15) {
        console.log('⚠️  Safety break at 15 pages');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } while (offset);
    
    console.log(`✅ COMPLETE: ${records.length} records from ${pageCount} pages`);
    
    return records;
    
  } catch (error) {
    console.error(`❌ Error with view ${viewName}:`, error);
    return records;
  }
}

async function tryAllApproaches() {
  console.log('🔍 FINDING ALL 210 STORYTELLERS');
  console.log('===============================');
  
  const results: { [key: string]: number } = {};
  
  // 1. Try default view with better offset handling
  console.log('\n1️⃣  TRYING DEFAULT VIEW (Fixed Offset)');
  const defaultRecords = await fetchWithView();
  results['Default'] = defaultRecords.length;
  
  // 2. Try specific views that might have all records
  const viewsToTry = [
    'Grid view',
    'Migration', 
    'Storyteller details',
    'Recent',
    'Most recent',
    'Add Storyteller view',
    'Storyteller LLM download'
  ];
  
  for (const viewName of viewsToTry) {
    console.log(`\n${viewsToTry.indexOf(viewName) + 2}️⃣  TRYING VIEW: ${viewName}`);
    const records = await fetchWithView(viewName);
    results[viewName] = records.length;
    
    // If we found 210, we're done!
    if (records.length >= 210) {
      console.log(`\n🎉 FOUND ALL 210+ STORYTELLERS IN VIEW: ${viewName}!`);
      
      // Quick analysis
      const withTranscripts = records.filter(r => r.fields['Transcript (from Media)']).length;
      const withImages = records.filter(r => r.fields['File Profile Image']).length;
      
      console.log(`📊 Analysis of ${viewName} view:`);
      console.log(`   Total records: ${records.length}`);
      console.log(`   With transcripts: ${withTranscripts}`);
      console.log(`   With images: ${withImages}`);
      
      return { viewName, records };
    }
  }
  
  // 3. Try with no maxRecords and follow offsets manually
  console.log('\n🔄 TRYING MANUAL OFFSET FOLLOWING');
  const manualRecords = await fetchManualOffset();
  results['Manual Offset'] = manualRecords.length;
  
  // Report all results
  console.log('\n📊 RESULTS SUMMARY:');
  console.log('==================');
  Object.entries(results).forEach(([method, count]) => {
    const status = count >= 210 ? '✅' : count >= 150 ? '⚠️' : '❌';
    console.log(`${status} ${method}: ${count} records`);
  });
  
  // Find best result
  const bestMethod = Object.entries(results).reduce((a, b) => b[1] > a[1] ? b : a);
  console.log(`\n🏆 BEST RESULT: ${bestMethod[0]} with ${bestMethod[1]} records`);
  
  return null;
}

async function fetchManualOffset(): Promise<any[]> {
  console.log('Manual offset following...');
  
  const allRecords: any[] = [];
  let offset = '';
  let pageCount = 0;
  
  do {
    pageCount++;
    
    // Build URL without maxRecords to see what happens
    const url = offset 
      ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?offset=${offset}`
      : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers`;
    
    console.log(`   Manual page ${pageCount}: ${allRecords.length} records so far`);
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    });
    
    if (!response.ok) break;
    
    const data = await response.json();
    allRecords.push(...(data.records || []));
    offset = data.offset || '';
    
    if (pageCount > 20) break; // Safety
    await new Promise(resolve => setTimeout(resolve, 400));
    
  } while (offset);
  
  return allRecords;
}

async function main() {
  const result = await tryAllApproaches();
  
  if (result && result.records.length >= 210) {
    console.log(`\n🎯 SUCCESS! Found ${result.records.length} storytellers in view: ${result.viewName}`);
    console.log('\nNext step: Update migration script to use this view for complete data capture.');
  } else {
    console.log('\n⚠️  Still investigating... Check the results above to understand the data structure.');
  }
}

main().catch(console.error);