#!/usr/bin/env tsx
/**
 * INVESTIGATE PAGINATION DEEPER
 * The view access works but only returns 100 records with no offset
 * This suggests the view might be filtered or paginated differently
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const ALL_STORYTELLERS_VIEW_ID = 'viwtGaott2mxFI1nD';

async function testDifferentPaginationApproaches(): Promise<void> {
  console.log('🔍 TESTING DIFFERENT PAGINATION APPROACHES');
  console.log('==========================================');
  
  // Test 1: Force larger maxRecords
  console.log('\n📊 Test 1: Larger maxRecords (500)');
  try {
    const response1 = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${ALL_STORYTELLERS_VIEW_ID}&maxRecords=500`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`   Records: ${data1.records?.length || 0}`);
      console.log(`   Has offset: ${data1.offset ? 'Yes' : 'No'}`);
    } else {
      console.log(`   Failed: ${response1.status} ${response1.statusText}`);
    }
  } catch (err) {
    console.log(`   Error: ${err}`);
  }
  
  // Test 2: Manual offset with fake offset
  console.log('\n📊 Test 2: Force offset from record 100');
  try {
    // Try to get the view metadata to understand its structure
    const metaResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const storytellersTable = metaData.tables?.find((t: any) => t.id === 'tbl9zxLsGOd3fjWXp');
      
      console.log(`   Table name: ${storytellersTable?.name}`);
      console.log(`   Total views: ${storytellersTable?.views?.length || 0}`);
      
      const targetView = storytellersTable?.views?.find((v: any) => v.id === ALL_STORYTELLERS_VIEW_ID);
      console.log(`   View name: "${targetView?.name || 'Not found'}"`);
      console.log(`   View type: ${targetView?.type || 'Unknown'}`);
    }
  } catch (err) {
    console.log(`   Error getting metadata: ${err}`);
  }
  
  // Test 3: Try without view to see total records
  console.log('\n📊 Test 3: All records without view filter');
  try {
    let totalWithoutView = 0;
    let offset = '';
    let pages = 0;
    
    do {
      pages++;
      const response3 = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?maxRecords=100${offset ? `&offset=${offset}` : ''}`,
        { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
      );
      
      if (!response3.ok) {
        console.log(`   Page ${pages} failed: ${response3.status}`);
        break;
      }
      
      const data3 = await response3.json();
      totalWithoutView += data3.records?.length || 0;
      offset = data3.offset || '';
      
      console.log(`   Page ${pages}: ${data3.records?.length || 0} records (Total: ${totalWithoutView})`);
      
      if (pages > 10) break; // Safety
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } while (offset);
    
    console.log(`   TOTAL WITHOUT VIEW: ${totalWithoutView} records`);
  } catch (err) {
    console.log(`   Error: ${err}`);
  }
  
  // Test 4: Try different sort orders within the view
  console.log('\n📊 Test 4: View with different sort orders');
  const sortOrders = [
    'Created',
    'Name', 
    'Last modified',
    'Record ID'
  ];
  
  for (const sortField of sortOrders) {
    try {
      const response4 = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${ALL_STORYTELLERS_VIEW_ID}&sort[0][field]=${encodeURIComponent(sortField)}&sort[0][direction]=asc&maxRecords=200`,
        { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
      );
      
      if (response4.ok) {
        const data4 = await response4.json();
        console.log(`   Sort by ${sortField}: ${data4.records?.length || 0} records, offset: ${data4.offset ? 'Yes' : 'No'}`);
        
        if (data4.records?.length > 0) {
          console.log(`     First: ${data4.records[0]?.fields?.Name || 'No name'}`);
          console.log(`     Last: ${data4.records[data4.records.length - 1]?.fields?.Name || 'No name'}`);
        }
      } else {
        console.log(`   Sort by ${sortField}: Failed ${response4.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.log(`   Sort by ${sortField}: Error ${err}`);
    }
  }
}

async function testViewByName(): Promise<void> {
  console.log('\n🔍 TESTING VIEW ACCESS BY NAME');
  console.log('==============================');
  
  // Get the actual view name from metadata
  try {
    const metaResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const storytellersTable = metaData.tables?.find((t: any) => t.id === 'tbl9zxLsGOd3fjWXp');
      
      if (storytellersTable?.views) {
        console.log(`\n📋 All available views in Storytellers table:`);
        
        for (const view of storytellersTable.views) {
          console.log(`\n   View: "${view.name}" (${view.id})`);
          console.log(`   Type: ${view.type}`);
          
          // Test each view to see how many records it returns
          try {
            const viewResponse = await fetch(
              `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${encodeURIComponent(view.name)}&maxRecords=300`,
              { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
            );
            
            if (viewResponse.ok) {
              const viewData = await viewResponse.json();
              console.log(`   Records: ${viewData.records?.length || 0}`);
              console.log(`   Has offset: ${viewData.offset ? 'Yes' : 'No'}`);
              
              if (viewData.records?.length >= 200) {
                console.log(`   🎯 POTENTIAL WINNER! This view has ${viewData.records.length} records`);
              }
            } else {
              console.log(`   Failed: ${viewResponse.status}`);
            }
          } catch (err) {
            console.log(`   Error: ${err}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
  } catch (err) {
    console.log(`Error getting view metadata: ${err}`);
  }
}

async function main(): Promise<void> {
  console.log('🕵️ DEEP PAGINATION INVESTIGATION');
  console.log('=================================');
  console.log('The user confirmed 210 storytellers exist in the specific view');
  console.log('But we only get 100 with no offset. Need to understand why.');
  console.log('');
  
  await testDifferentPaginationApproaches();
  await testViewByName();
  
  console.log('\n🎯 INVESTIGATION COMPLETE');
  console.log('=========================');
  console.log('This should help us understand the pagination limitation');
}

main().catch(console.error);