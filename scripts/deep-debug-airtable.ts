#!/usr/bin/env tsx
/**
 * DEEP DEBUG AIRTABLE API 
 * Investigate why we can't get all 210 storytellers
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function testDifferentAPIMethods() {
  console.log('🔬 DEEP AIRTABLE API DEBUG');
  console.log('===========================');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`API Key: ${AIRTABLE_API_KEY.substring(0, 10)}...`);
  console.log('');

  // Method 1: Try different base URLs and approaches
  const testUrls = [
    // Standard approach
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers`,
    
    // Try with different parameters
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=200`,
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?pageSize=100`,
    
    // Try with different sort orders
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?sort[0][field]=Created&sort[0][direction]=asc`,
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?sort[0][field]=Name&sort[0][direction]=asc`,
    
    // Try with specific fields
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?fields[]=Name&fields[]=Created`,
  ];

  for (const url of testUrls) {
    try {
      console.log(`\n🧪 Testing: ${url.split('?')[0]}${url.includes('?') ? ' with params' : ''}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'User-Agent': 'Empathy-Ledger-Debug/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success: ${data.records?.length || 0} records`);
        console.log(`   📄 Has offset: ${data.offset ? 'Yes (' + data.offset.substring(0, 20) + '...)' : 'No'}`);
        
        if (data.records && data.records.length > 0) {
          const sample = data.records[0];
          console.log(`   📋 Sample: ${sample.fields?.Name || 'No name'} (${sample.id})`);
        }
      } else {
        console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   📝 Details: ${errorText.substring(0, 100)}`);
      }
      
    } catch (err) {
      console.log(`   💥 Exception: ${err}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function manualPaginationTest() {
  console.log('\n🔄 MANUAL PAGINATION TEST');
  console.log('=========================');
  
  let totalRecords = 0;
  let offset = '';
  let pageCount = 0;
  const allRecordIds = new Set();
  const allNames = new Set();

  try {
    do {
      pageCount++;
      
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers` + 
        `?maxRecords=100${offset ? `&offset=${offset}` : ''}`;
      
      console.log(`\n📄 PAGE ${pageCount}:`);
      console.log(`   URL: ${url}`);
      console.log(`   Offset: ${offset || 'none'}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });
      
      if (!response.ok) {
        console.log(`   ❌ HTTP Error: ${response.status}`);
        break;
      }
      
      const data = await response.json();
      
      console.log(`   📊 Records in response: ${data.records?.length || 0}`);
      console.log(`   📋 Next offset in response: ${data.offset ? 'Present' : 'None'}`);
      
      if (data.records) {
        data.records.forEach((record: any) => {
          allRecordIds.add(record.id);
          if (record.fields?.Name) {
            allNames.add(record.fields.Name);
          }
        });
        totalRecords += data.records.length;
      }
      
      console.log(`   📈 RUNNING TOTALS:`);
      console.log(`      Total records so far: ${totalRecords}`);
      console.log(`      Unique IDs: ${allRecordIds.size}`);
      console.log(`      Unique names: ${allNames.size}`);
      
      // CRITICAL: This is where the issue might be
      offset = data.offset || '';
      console.log(`   🎯 Setting next offset to: "${offset}"`);
      
      if (pageCount > 10) {
        console.log('   ⚠️  Safety break at 10 pages');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } while (offset);
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   Pages processed: ${pageCount}`);
    console.log(`   Total records: ${totalRecords}`);
    console.log(`   Unique record IDs: ${allRecordIds.size}`);
    console.log(`   Unique names: ${allNames.size}`);
    
    // Show a sample of names to verify data
    const nameArray = Array.from(allNames).slice(0, 10);
    console.log(`   Sample names: ${nameArray.join(', ')}`);
    
  } catch (error) {
    console.error('💥 Pagination test failed:', error);
  }
}

async function testTableMetadata() {
  console.log('\n📋 TABLE METADATA TEST');
  console.log('======================');
  
  try {
    // Try to get the schema
    const metaUrl = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;
    const response = await fetch(metaUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (response.ok) {
      const meta = await response.json();
      console.log('✅ Base metadata retrieved');
      
      const storytellersTable = meta.tables?.find((t: any) => t.name === 'Storytellers');
      if (storytellersTable) {
        console.log(`📊 Storytellers table:`);
        console.log(`   ID: ${storytellersTable.id}`);
        console.log(`   Name: ${storytellersTable.name}`);
        console.log(`   Primary field: ${storytellersTable.primaryFieldId}`);
        console.log(`   Fields count: ${storytellersTable.fields?.length || 0}`);
        console.log(`   Views count: ${storytellersTable.views?.length || 0}`);
        
        if (storytellersTable.views) {
          console.log(`   Views:`);
          storytellersTable.views.slice(0, 5).forEach((view: any, i: number) => {
            console.log(`     ${i+1}. ${view.name} (${view.type})`);
          });
        }
      }
    } else {
      console.log(`❌ Metadata request failed: ${response.status}`);
    }
  } catch (err) {
    console.log(`💥 Metadata error: ${err}`);
  }
}

async function testSpecificViewsForAll210() {
  console.log('\n👁️  TESTING SPECIFIC VIEWS FOR ALL 210');
  console.log('======================================');
  
  // List of views that might contain all records
  const viewsToTest = [
    'Grid view',
    'Storyteller details', 
    'TOMNET',
    'Orange Sky',
    'Goods.',
    'Migration'
  ];
  
  const results: { [key: string]: number } = {};
  
  for (const viewName of viewsToTest) {
    try {
      console.log(`\n📋 Testing view: ${viewName}`);
      
      let totalInView = 0;
      let offset = '';
      let pages = 0;
      
      do {
        pages++;
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers` +
          `?view=${encodeURIComponent(viewName)}&maxRecords=100${offset ? `&offset=${offset}` : ''}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        });
        
        if (!response.ok) {
          console.log(`   ❌ Error: ${response.status}`);
          break;
        }
        
        const data = await response.json();
        totalInView += data.records?.length || 0;
        offset = data.offset || '';
        
        console.log(`   📄 Page ${pages}: ${data.records?.length || 0} records (Total: ${totalInView})`);
        
        if (pages > 5) break; // Safety
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } while (offset);
      
      results[viewName] = totalInView;
      console.log(`   📊 ${viewName}: ${totalInView} total records`);
      
    } catch (err) {
      console.log(`   💥 Error testing ${viewName}: ${err}`);
    }
  }
  
  console.log(`\n📈 VIEW RESULTS SUMMARY:`);
  Object.entries(results).forEach(([view, count]) => {
    const status = count >= 200 ? '✅' : count >= 150 ? '⚠️' : '❌';
    console.log(`${status} ${view}: ${count} records`);
  });
}

async function main() {
  console.log('🚨 COMPREHENSIVE AIRTABLE API INVESTIGATION');
  console.log('===========================================');
  console.log('Finding out why we can only get 100 of 210 storytellers');
  console.log('');
  
  await testDifferentAPIMethods();
  await manualPaginationTest();
  await testTableMetadata();
  await testSpecificViewsForAll210();
  
  console.log('\n🎯 INVESTIGATION COMPLETE');
  console.log('==========================');
  console.log('Review the results above to determine the cause of the pagination limitation.');
}

main().catch(console.error);