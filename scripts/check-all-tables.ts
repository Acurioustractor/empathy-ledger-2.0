#!/usr/bin/env tsx
/**
 * CHECK ALL TABLES IN BASE
 * Look for other tables that might contain storyteller data
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function getAllTablesInBase(): Promise<void> {
  console.log('📋 CHECKING ALL TABLES IN BASE');
  console.log('==============================');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log('');
  
  try {
    const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    });
    
    if (!metaResponse.ok) {
      console.log(`❌ Failed to get base metadata: ${metaResponse.status}`);
      return;
    }
    
    const metaData = await metaResponse.json();
    
    if (!metaData.tables) {
      console.log('❌ No tables found in metadata');
      return;
    }
    
    console.log(`📊 Found ${metaData.tables.length} tables in base:`);
    console.log('');
    
    for (const table of metaData.tables) {
      console.log(`📋 TABLE: ${table.name}`);
      console.log(`   ID: ${table.id}`);
      console.log(`   Fields: ${table.fields?.length || 0}`);
      console.log(`   Views: ${table.views?.length || 0}`);
      
      // Check if this might contain storytellers
      const mightHaveStorytellers = 
        table.name.toLowerCase().includes('storyteller') ||
        table.name.toLowerCase().includes('person') ||
        table.name.toLowerCase().includes('people') ||
        table.name.toLowerCase().includes('participant') ||
        table.name.toLowerCase().includes('interview') ||
        table.name.toLowerCase().includes('user') ||
        table.name.toLowerCase().includes('member');
        
      if (mightHaveStorytellers) {
        console.log(`   🎯 POTENTIAL STORYTELLER TABLE!`);
        
        // Try to fetch a few records to see what's in it
        try {
          const sampleResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table.name)}?maxRecords=5`, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
          });
          
          if (sampleResponse.ok) {
            const sampleData = await sampleResponse.json();
            console.log(`   📊 Sample records: ${sampleData.records?.length || 0}`);
            
            if (sampleData.records && sampleData.records.length > 0) {
              const sampleRecord = sampleData.records[0];
              console.log(`   📋 Sample fields: ${Object.keys(sampleRecord.fields || {}).join(', ')}`);
              
              // Check if it has name-like fields
              const nameFields = Object.keys(sampleRecord.fields || {}).filter(field => 
                field.toLowerCase().includes('name') ||
                field.toLowerCase().includes('title') ||
                field === 'Name'
              );
              
              if (nameFields.length > 0) {
                console.log(`   👤 Name fields: ${nameFields.join(', ')}`);
                nameFields.forEach(field => {
                  const value = sampleRecord.fields[field];
                  if (value) {
                    console.log(`     ${field}: ${value}`);
                  }
                });
              }
            }
          }
        } catch (err) {
          console.log(`   ❌ Could not sample records: ${err}`);
        }
      }
      
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Now check the main tables for record counts
    console.log('📊 RECORD COUNTS IN KEY TABLES:');
    console.log('===============================');
    
    const tablesToCheck = metaData.tables.filter((t: any) => 
      t.name === 'Storytellers' ||
      t.name.toLowerCase().includes('storyteller') ||
      t.name.toLowerCase().includes('people') ||
      t.name === 'Stories' ||
      t.name === 'Media' ||
      t.name === 'Interviews'
    );
    
    for (const table of tablesToCheck) {
      try {
        const countResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table.name)}?maxRecords=1`, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
        });
        
        if (countResponse.ok) {
          // We can't get exact counts easily, but let's try a different approach
          let totalCount = 0;
          let offset = '';
          let pages = 0;
          
          do {
            pages++;
            const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table.name)}?maxRecords=100${offset ? `&offset=${offset}` : ''}`;
            
            const response = await fetch(url, {
              headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
            });
            
            if (!response.ok) break;
            
            const data = await response.json();
            totalCount += data.records?.length || 0;
            offset = data.offset || '';
            
            if (pages > 20) break; // Safety
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } while (offset);
          
          console.log(`📊 ${table.name}: ${totalCount} records`);
        }
      } catch (err) {
        console.log(`❌ Could not count records in ${table.name}: ${err}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check tables:', error);
  }
}

async function checkEnvironmentVariables(): Promise<void> {
  console.log('\n🔧 ENVIRONMENT VARIABLES CHECK');
  console.log('==============================');
  
  console.log(`AIRTABLE_BASE_ID: ${AIRTABLE_BASE_ID}`);
  console.log(`AIRTABLE_API_KEY: ${AIRTABLE_API_KEY ? AIRTABLE_API_KEY.substring(0, 15) + '...' : 'NOT SET'}`);
  
  // Check if there might be multiple base IDs
  const envContent = process.env;
  const airtableKeys = Object.keys(envContent).filter(key => 
    key.includes('AIRTABLE') || key.includes('BASE')
  );
  
  if (airtableKeys.length > 0) {
    console.log('\n📋 All Airtable-related environment variables:');
    airtableKeys.forEach(key => {
      const value = envContent[key];
      if (value) {
        console.log(`   ${key}: ${value.substring(0, 15)}...`);
      }
    });
  }
}

async function main() {
  console.log('🔍 COMPREHENSIVE BASE INVESTIGATION');
  console.log('===================================');
  console.log('Looking for all tables that might contain the 210 storytellers');
  console.log('');
  
  await checkEnvironmentVariables();
  await getAllTablesInBase();
  
  console.log('\n🎯 INVESTIGATION SUMMARY');
  console.log('========================');
  console.log('If the main Storytellers table only has 100 records but you');
  console.log('know there are 210, they might be in:');
  console.log('1. A different table in this base');
  console.log('2. A different Airtable base entirely');
  console.log('3. Archived/filtered records not accessible via API');
  console.log('4. Multiple projects combined');
}

main().catch(console.error);