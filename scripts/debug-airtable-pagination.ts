#!/usr/bin/env tsx
/**
 * DEBUG AIRTABLE PAGINATION ISSUE
 * Find out why we're only getting 100 storytellers when there should be 210
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function debugAirtablePagination() {
  console.log('🔍 DEBUGGING AIRTABLE PAGINATION');
  console.log('================================');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`API Key: ${AIRTABLE_API_KEY ? 'Present' : 'Missing'}`);
  console.log('');

  const records: any[] = [];
  let offset = '';
  let pageCount = 0;

  try {
    do {
      pageCount++;
      
      // Build URL with detailed logging
      const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers`;
      const params = new URLSearchParams();
      params.append('maxRecords', '100');
      if (offset) {
        params.append('offset', offset);
      }
      
      const fullUrl = `${baseUrl}?${params.toString()}`;
      
      console.log(`📄 PAGE ${pageCount} REQUEST:`);
      console.log(`   URL: ${fullUrl}`);
      console.log(`   Offset: ${offset || 'none'}`);
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'User-Agent': 'Empathy-Ledger-Migration/1.0'
        }
      });
      
      console.log(`   Response Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log(`   Records in this page: ${data.records?.length || 0}`);
      console.log(`   Next offset: ${data.offset || 'none'}`);
      
      // Log a sample record from this page
      if (data.records && data.records.length > 0) {
        const sample = data.records[0];
        console.log(`   Sample record ID: ${sample.id}`);
        console.log(`   Sample record name: ${sample.fields?.Name || 'No name'}`);
        console.log(`   Sample fields: ${Object.keys(sample.fields || {}).length} fields`);
      }
      
      records.push(...(data.records || []));
      offset = data.offset || '';
      
      console.log(`   📊 TOTAL RECORDS SO FAR: ${records.length}`);
      console.log('');
      
      // Safety break to avoid infinite loops
      if (pageCount > 10) {
        console.log('⚠️  SAFETY BREAK: More than 10 pages, stopping to investigate');
        break;
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } while (offset);
    
    console.log('✅ PAGINATION COMPLETE');
    console.log(`📊 FINAL COUNT: ${records.length} storytellers`);
    
    // Analyze the data we got
    console.log('\n🔍 DATA ANALYSIS:');
    console.log(`   Pages fetched: ${pageCount}`);
    console.log(`   Records per page average: ${Math.round(records.length / pageCount)}`);
    
    // Check for duplicate records
    const uniqueIds = new Set(records.map(r => r.id));
    console.log(`   Unique record IDs: ${uniqueIds.size}`);
    console.log(`   Duplicate records: ${records.length - uniqueIds.size}`);
    
    // Check field completeness
    const withNames = records.filter(r => r.fields?.Name).length;
    const withTranscripts = records.filter(r => r.fields['Transcript (from Media)']).length;
    const withImages = records.filter(r => r.fields['File Profile Image']).length;
    
    console.log(`   Records with names: ${withNames}/${records.length}`);
    console.log(`   Records with transcripts: ${withTranscripts}/${records.length}`);
    console.log(`   Records with images: ${withImages}/${records.length}`);
    
    // Show date range to understand if we're missing recent/old records
    const dates = records
      .map(r => r.createdTime || r.fields?.Created)
      .filter(d => d)
      .sort();
      
    if (dates.length > 0) {
      console.log(`   Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
    }
    
  } catch (error) {
    console.error('❌ PAGINATION DEBUG FAILED:', error);
    console.log(`📊 Records retrieved before error: ${records.length}`);
  }
}

async function tryAlternativeAPICalls() {
  console.log('\n🔄 TRYING ALTERNATIVE API APPROACHES');
  console.log('====================================');
  
  // Try without maxRecords parameter
  try {
    console.log('📝 Testing without maxRecords limit...');
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Default request returned: ${data.records?.length || 0} records`);
      console.log(`   Has offset: ${data.offset ? 'Yes' : 'No'}`);
    } else {
      console.log(`   Default request failed: ${response.status}`);
    }
  } catch (err) {
    console.log('   Default request error:', err);
  }
  
  // Try with different maxRecords values
  for (const maxRecords of [50, 200, 500]) {
    try {
      console.log(`📝 Testing with maxRecords=${maxRecords}...`);
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=${maxRecords}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Returned: ${data.records?.length || 0} records`);
        console.log(`   Has offset: ${data.offset ? 'Yes' : 'No'}`);
      } else {
        console.log(`   Failed: ${response.status}`);
      }
    } catch (err) {
      console.log(`   Error with maxRecords=${maxRecords}:`, err);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function checkAirtableViews() {
  console.log('\n👁️  CHECKING AIRTABLE VIEWS');
  console.log('============================');
  
  // Try to get the table schema to see available views
  try {
    const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      console.log('📋 Base metadata retrieved successfully');
      
      const storytellersTable = metaData.tables?.find((t: any) => t.name === 'Storytellers');
      if (storytellersTable) {
        console.log(`   Storytellers table ID: ${storytellersTable.id}`);
        console.log(`   Available views: ${storytellersTable.views?.length || 0}`);
        
        if (storytellersTable.views) {
          storytellersTable.views.forEach((view: any, index: number) => {
            console.log(`     ${index + 1}. ${view.name} (${view.type})`);
          });
        }
      }
    } else {
      console.log('⚠️  Could not retrieve base metadata');
    }
  } catch (err) {
    console.log('⚠️  Metadata request failed:', err);
  }
}

async function main() {
  console.log('🚨 AIRTABLE PAGINATION INVESTIGATION');
  console.log('====================================');
  console.log('Expected: 210 storytellers');
  console.log('Currently getting: 100 storytellers');
  console.log('Need to find the missing 110 storytellers!');
  console.log('');
  
  await debugAirtablePagination();
  await tryAlternativeAPICalls();
  await checkAirtableViews();
  
  console.log('\n🎯 INVESTIGATION COMPLETE');
  console.log('==========================');
  console.log('Review the output above to identify why pagination is stopping at 100 records.');
}

main().catch(console.error);