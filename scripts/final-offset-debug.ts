#!/usr/bin/env tsx
/**
 * FINAL OFFSET DEBUG
 * Examine the exact response structure to understand offset issue
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function examineExactResponse() {
  console.log('🔍 EXAMINING EXACT API RESPONSES');
  console.log('=================================');
  
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100`;
    
    console.log(`📡 Making request to: ${url}`);
    console.log(`🔑 Using API key: ${AIRTABLE_API_KEY.substring(0, 15)}...`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'User-Agent': 'Empathy-Ledger-Final-Debug/1.0'
      }
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response headers:`);
    
    // Log all response headers
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error response: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log(`\n📄 Response structure:`);
    console.log(`   Records count: ${data.records?.length || 0}`);
    console.log(`   Offset present: ${data.hasOwnProperty('offset')}`);
    console.log(`   Offset value: "${data.offset}"`);
    console.log(`   Offset type: ${typeof data.offset}`);
    console.log(`   Offset length: ${data.offset?.length || 0}`);
    
    // Log the complete structure (truncated)
    const structureInfo = {
      records: `Array of ${data.records?.length || 0} items`,
      offset: data.offset,
      otherKeys: Object.keys(data).filter(k => k !== 'records' && k !== 'offset')
    };
    
    console.log(`   Complete structure: ${JSON.stringify(structureInfo, null, 2)}`);
    
    // If we have an offset, try using it
    if (data.offset && data.offset.length > 0) {
      console.log(`\n🔄 TESTING WITH RECEIVED OFFSET`);
      await testWithOffset(data.offset);
    }
    
    // Show some sample record IDs to verify data
    if (data.records && data.records.length > 0) {
      console.log(`\n📋 First 5 record IDs:`);
      data.records.slice(0, 5).forEach((record: any, i: number) => {
        console.log(`   ${i+1}. ${record.id} - ${record.fields?.Name || 'No name'}`);
      });
      
      console.log(`\n📋 Last 5 record IDs:`);
      data.records.slice(-5).forEach((record: any, i: number) => {
        console.log(`   ${data.records.length - 4 + i}. ${record.id} - ${record.fields?.Name || 'No name'}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Request failed:', error);
  }
}

async function testWithOffset(offset: string) {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100&offset=${offset}`;
    
    console.log(`📡 Making request with offset: ${url}`);
    console.log(`🎯 Offset value: "${offset}"`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Offset request failed: ${response.status}`);
      const errorText = await response.text();
      console.log(`📝 Error: ${errorText.substring(0, 200)}`);
      return;
    }
    
    const data = await response.json();
    
    console.log(`   ✅ Success with offset!`);
    console.log(`   📊 Records: ${data.records?.length || 0}`);
    console.log(`   📋 New offset: "${data.offset || 'none'}"`);
    
    if (data.records && data.records.length > 0) {
      console.log(`   📝 First record: ${data.records[0].fields?.Name || 'No name'} (${data.records[0].id})`);
    }
    
  } catch (error) {
    console.error('💥 Offset request failed:', error);
  }
}

async function trySmallBatchTest() {
  console.log('\n🧪 SMALL BATCH TEST (10 records at a time)');
  console.log('===========================================');
  
  let totalRecords = 0;
  let offset = '';
  let pageCount = 0;
  const allIds = new Set();
  
  try {
    do {
      pageCount++;
      
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=10${offset ? `&offset=${offset}` : ''}`;
      
      console.log(`📄 Page ${pageCount} (10 records): offset="${offset}"`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });
      
      if (!response.ok) {
        console.log(`❌ Page ${pageCount} failed: ${response.status}`);
        break;
      }
      
      const data = await response.json();
      
      console.log(`   📊 Got: ${data.records?.length || 0} records`);
      console.log(`   📋 Next offset: "${data.offset || 'none'}"`);
      
      if (data.records) {
        data.records.forEach((record: any) => allIds.add(record.id));
        totalRecords += data.records.length;
      }
      
      offset = data.offset || '';
      console.log(`   📈 Running total: ${totalRecords} records, ${allIds.size} unique IDs`);
      
      if (pageCount > 25) {
        console.log('   ⚠️  Safety break at 25 pages (250 records max)');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } while (offset);
    
    console.log(`\n📊 SMALL BATCH RESULTS:`);
    console.log(`   Total pages: ${pageCount}`);
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Unique IDs: ${allIds.size}`);
    
    if (totalRecords >= 200) {
      console.log(`🎉 SUCCESS! Found ${totalRecords} records with small batches!`);
    }
    
  } catch (error) {
    console.error('💥 Small batch test failed:', error);
  }
}

async function main() {
  console.log('🔬 FINAL AIRTABLE OFFSET DEBUG');
  console.log('==============================');
  console.log('Examining exact API responses to solve the 210 storyteller mystery');
  console.log('');
  
  await examineExactResponse();
  await trySmallBatchTest();
  
  console.log('\n🎯 FINAL DEBUG COMPLETE');
  console.log('========================');
}

main().catch(console.error);