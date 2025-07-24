#!/usr/bin/env tsx
/**
 * FOLLOW ACTUAL OFFSET
 * The API says "Has offset: Yes" but then the offset doesn't work in subsequent requests
 * Let's capture the actual offset string and follow it
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function followActualOffset(viewId: string, viewName: string): Promise<void> {
  console.log(`\n🎯 FOLLOWING ACTUAL OFFSET FOR VIEW: "${viewName}"`);
  console.log('='.repeat(60));
  
  let allRecords: any[] = [];
  let offset = '';
  let pageCount = 0;
  
  do {
    pageCount++;
    
    // Build the URL with the actual offset
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${viewId}&maxRecords=100${offset ? `&offset=${offset}` : ''}`;
    
    console.log(`\n📄 Page ${pageCount}:`);
    console.log(`   View: ${viewName} (${viewId})`);
    console.log(`   Current offset: ${offset || 'NONE'}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'User-Agent': 'Empathy-Ledger-Follow-Offset/1.0'
        }
      });
      
      if (!response.ok) {
        console.log(`   ❌ Request failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
        break;
      }
      
      const data = await response.json();
      
      console.log(`   📊 Records returned: ${data.records?.length || 0}`);
      console.log(`   📋 Next offset provided: ${data.offset ? 'YES' : 'NO'}`);
      
      if (data.offset) {
        console.log(`   📋 Offset value: ${data.offset.substring(0, 50)}${data.offset.length > 50 ? '...' : ''}`);
      }
      
      if (data.records && data.records.length > 0) {
        allRecords.push(...data.records);
        
        console.log(`   📈 Total records collected: ${allRecords.length}`);
        console.log(`   📋 First record this page: ${data.records[0]?.fields?.Name || 'No name'}`);
        console.log(`   📋 Last record this page: ${data.records[data.records.length - 1]?.fields?.Name || 'No name'}`);
        
        // Show some record IDs to verify we're getting different records
        console.log(`   📋 Record IDs this page: ${data.records.slice(0, 3).map(r => r.id).join(', ')}...`);
      }
      
      // Update offset for next iteration
      offset = data.offset || '';
      
      // Safety break
      if (pageCount > 5) {
        console.log('   ⚠️  Safety break at 5 pages');
        break;
      }
      
      // Rate limiting
      if (offset) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
    } catch (err) {
      console.log(`   💥 Error: ${err}`);
      break;
    }
    
  } while (offset);
  
  console.log(`\n✅ OFFSET FOLLOWING COMPLETE FOR "${viewName}"`);
  console.log(`📊 Total unique records collected: ${allRecords.length}`);
  
  // Check for duplicates
  const uniqueIds = new Set(allRecords.map(r => r.id));
  console.log(`📊 Unique record IDs: ${uniqueIds.size}`);
  
  if (uniqueIds.size !== allRecords.length) {
    console.log(`⚠️  Found ${allRecords.length - uniqueIds.size} duplicate records`);
  }
  
  return;
}

async function testMultipleViewOffsets(): Promise<void> {
  console.log('🔍 TESTING OFFSET FOLLOWING ON MULTIPLE VIEWS');
  console.log('==============================================');
  
  // Test the key views that showed "Offset: Yes"
  const viewsToTest = [
    { id: 'viwtGaott2mxFI1nD', name: 'Migration' },
    { id: 'viwdR0kulgXeQzyHm', name: 'Grid view' },
    { id: 'viwJ3U1zwMICpNhGk', name: 'Gallery' },
    { id: 'viwg6ywnfdCd4lgj4', name: 'Orange Sky' },
    { id: 'viwXWF7ZZrBlotfGE', name: 'Storyteller details' }
  ];
  
  for (const view of viewsToTest) {
    await followActualOffset(view.id, view.name);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rest between views
  }
}

async function investigateOffsetStructure(): Promise<void> {
  console.log('\n🔬 INVESTIGATING OFFSET STRUCTURE');
  console.log('=================================');
  
  try {
    // Get the first page and examine the offset structure
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=viwtGaott2mxFI1nD&maxRecords=100`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      console.log(`📊 Response structure:`);
      console.log(`   Records count: ${data.records?.length || 0}`);
      console.log(`   Has offset: ${data.offset ? 'Yes' : 'No'}`);
      
      if (data.offset) {
        console.log(`   Offset type: ${typeof data.offset}`);
        console.log(`   Offset length: ${data.offset.length}`);
        console.log(`   Offset preview: ${data.offset.substring(0, 100)}${data.offset.length > 100 ? '...' : ''}`);
        
        // Try to parse the offset to understand its structure
        try {
          const decodedOffset = decodeURIComponent(data.offset);
          console.log(`   Decoded offset: ${decodedOffset.substring(0, 100)}${decodedOffset.length > 100 ? '...' : ''}`);
        } catch (decodeErr) {
          console.log(`   Could not decode offset: ${decodeErr}`);
        }
      }
      
      // Show the actual JSON response structure (truncated)
      const responseString = JSON.stringify(data, null, 2);
      console.log(`\n📋 Raw response (first 500 chars):`);
      console.log(responseString.substring(0, 500) + '...');
      
    } else {
      console.log(`❌ Failed to get response for offset investigation: ${response.status}`);
    }
  } catch (err) {
    console.log(`❌ Error investigating offset structure: ${err}`);
  }
}

async function main(): Promise<void> {
  console.log('🕵️ FOLLOWING ACTUAL OFFSETS TO FIND ALL 210 STORYTELLERS');
  console.log('=========================================================');
  console.log('Multiple views report "Has offset: Yes" but we never get past 100 records');
  console.log('Let\'s follow the actual offset strings to see what happens');
  console.log('');
  
  await investigateOffsetStructure();
  await testMultipleViewOffsets();
  
  console.log('\n🎯 OFFSET INVESTIGATION COMPLETE');
  console.log('================================');
  console.log('This should reveal whether the offsets actually lead to more records');
}

main().catch(console.error);