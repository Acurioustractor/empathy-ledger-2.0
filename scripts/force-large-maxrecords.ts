#!/usr/bin/env tsx
/**
 * FORCE LARGE MAXRECORDS
 * Try to get all records by forcing a very large maxRecords value
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const ALL_STORYTELLERS_VIEW_ID = 'viwtGaott2mxFI1nD'; // Migration view

async function forceLargeMaxRecords(): Promise<void> {
  console.log('🚀 FORCING LARGE MAXRECORDS TO GET ALL 210');
  console.log('==========================================');
  
  const testSizes = [200, 300, 500, 1000];
  
  for (const maxRecords of testSizes) {
    console.log(`\n📊 Testing maxRecords=${maxRecords}:`);
    
    try {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${ALL_STORYTELLERS_VIEW_ID}&maxRecords=${maxRecords}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'User-Agent': 'Empathy-Ledger-Force-Large/1.0'
        }
      });
      
      if (!response.ok) {
        console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`   ✅ Success: ${data.records?.length || 0} records returned`);
      console.log(`   📋 Has offset: ${data.offset ? 'Yes' : 'No'}`);
      
      if (data.records && data.records.length > 0) {
        console.log(`   📋 First record: ${data.records[0]?.fields?.Name || 'No name'} (${data.records[0]?.id})`);
        console.log(`   📋 Last record: ${data.records[data.records.length - 1]?.fields?.Name || 'No name'} (${data.records[data.records.length - 1]?.id})`);
        
        // If we get more than 100, this is the winner!
        if (data.records.length > 100) {
          console.log(`   🎉 BREAKTHROUGH! Got ${data.records.length} records (more than 100)!`);
          
          // Quick analysis of the extra records
          const batch1 = data.records.slice(0, 100);
          const batch2 = data.records.slice(100);
          
          console.log(`   📊 Records 1-100: ${batch1[0]?.fields?.Name} to ${batch1[batch1.length - 1]?.fields?.Name}`);
          console.log(`   📊 Records 101+: ${batch2[0]?.fields?.Name} to ${batch2[batch2.length - 1]?.fields?.Name}`);
          
          // Check for transcripts and images in the additional records
          const extraWithImages = batch2.filter(r => {
            const imageField = r.fields['File Profile Image'];
            return imageField && Array.isArray(imageField) && imageField.length > 0;
          }).length;
          
          const extraWithTranscripts = batch2.filter(r => {
            const transcript = r.fields['Transcript (from Media)'];
            return transcript && Array.isArray(transcript) && transcript.length > 0 && transcript[0].length > 50;
          }).length;
          
          console.log(`   📊 Extra records (101+): ${extraWithImages}/${batch2.length} have images, ${extraWithTranscripts}/${batch2.length} have transcripts`);
          
          return; // We found what we need!
        }
      }
      
    } catch (err) {
      console.log(`   💥 Error: ${err}`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function testEveryView(): Promise<void> {
  console.log('\n🔍 TESTING EVERY VIEW FOR 200+ RECORDS');
  console.log('======================================');
  
  try {
    // Get all views
    const metaResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (!metaResponse.ok) {
      console.log('❌ Could not get metadata');
      return;
    }
    
    const metaData = await metaResponse.json();
    const storytellersTable = metaData.tables?.find((t: any) => t.id === 'tbl9zxLsGOd3fjWXp');
    
    if (!storytellersTable?.views) {
      console.log('❌ No views found');
      return;
    }
    
    console.log(`Found ${storytellersTable.views.length} views to test`);
    
    for (const view of storytellersTable.views) {
      try {
        console.log(`\n📊 Testing "${view.name}" (${view.id}):`);
        
        const response = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${encodeURIComponent(view.name)}&maxRecords=300`,
          { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
        );
        
        if (response.ok) {
          const data = await response.json();
          const count = data.records?.length || 0;
          console.log(`   Records: ${count}, Offset: ${data.offset ? 'Yes' : 'No'}`);
          
          if (count >= 200) {
            console.log(`   🎯 POTENTIAL WINNER! "${view.name}" has ${count} records`);
            
            // Show some details
            if (data.records && data.records.length > 0) {
              console.log(`   First: ${data.records[0]?.fields?.Name || 'No name'}`);
              console.log(`   100th: ${data.records[99]?.fields?.Name || 'No name'}`);
              if (data.records[200]) {
                console.log(`   200th: ${data.records[199]?.fields?.Name || 'No name'}`);
              }
            }
          }
        } else {
          console.log(`   ❌ Failed: ${response.status}`);
        }
        
      } catch (err) {
        console.log(`   💥 Error: ${err}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
  } catch (err) {
    console.log(`❌ Error testing views: ${err}`);
  }
}

async function main(): Promise<void> {
  console.log('🔥 FORCING DISCOVERY OF ALL 210 STORYTELLERS');
  console.log('==============================================');
  console.log('User confirmed 210 exist - we need to find the right approach');
  console.log('');
  
  await forceLargeMaxRecords();
  await testEveryView();
  
  console.log('\n🎯 FORCE INVESTIGATION COMPLETE');
  console.log('===============================');
}

main().catch(console.error);