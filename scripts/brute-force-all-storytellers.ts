#!/usr/bin/env tsx
/**
 * BRUTE FORCE ALL STORYTELLERS
 * The API is being a pain. Let's try every possible approach to get all 210.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function bruteForceApproach1_FilterlessAccess(): Promise<any[]> {
  console.log('🔥 APPROACH 1: FILTERLESS ACCESS');
  console.log('===============================');
  
  let allRecords: any[] = [];
  
  try {
    // Try accessing the table directly without any view filters
    let offset = '';
    let page = 0;
    
    do {
      page++;
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100${offset ? `&offset=${offset}` : ''}`;
      
      console.log(`Page ${page}: ${url.split('?')[0]}`);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.records) {
          allRecords.push(...data.records);
          console.log(`  Got ${data.records.length} records (Total: ${allRecords.length})`);
        }
        offset = data.offset || '';
      } else {
        console.log(`  Failed: ${response.status}`);
        break;
      }
      
      if (page > 10) break;
      await new Promise(r => setTimeout(r, 200));
      
    } while (offset);
    
  } catch (err) {
    console.log(`Error: ${err}`);
  }
  
  console.log(`APPROACH 1 RESULT: ${allRecords.length} records`);
  return allRecords;
}

async function bruteForceApproach2_TableIDDirect(): Promise<any[]> {
  console.log('\n🔥 APPROACH 2: TABLE ID DIRECT ACCESS');
  console.log('====================================');
  
  let allRecords: any[] = [];
  
  try {
    // Use the table ID directly
    let offset = '';
    let page = 0;
    
    do {
      page++;
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?maxRecords=100${offset ? `&offset=${offset}` : ''}`;
      
      console.log(`Page ${page}: Using table ID directly`);
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.records) {
          allRecords.push(...data.records);
          console.log(`  Got ${data.records.length} records (Total: ${allRecords.length})`);
        }
        offset = data.offset || '';
      } else {
        console.log(`  Failed: ${response.status}`);
        break;
      }
      
      if (page > 10) break;
      await new Promise(r => setTimeout(r, 200));
      
    } while (offset);
    
  } catch (err) {
    console.log(`Error: ${err}`);
  }
  
  console.log(`APPROACH 2 RESULT: ${allRecords.length} records`);
  return allRecords;
}

async function bruteForceApproach3_ChunkByDate(): Promise<any[]> {
  console.log('\n🔥 APPROACH 3: CHUNK BY CREATION DATE');
  console.log('====================================');
  
  let allRecords: any[] = [];
  
  try {
    // Try filtering by different date ranges to get around limits
    const dateRanges = [
      'IS_BEFORE(Created, "2024-01-01")',
      'AND(IS_AFTER(Created, "2024-01-01"), IS_BEFORE(Created, "2024-07-01"))',
      'IS_AFTER(Created, "2024-07-01")',
    ];
    
    for (const formula of dateRanges) {
      console.log(`Trying date filter: ${formula}`);
      
      let offset = '';
      let page = 0;
      
      do {
        page++;
        const encodedFormula = encodeURIComponent(formula);
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100&filterByFormula=${encodedFormula}${offset ? `&offset=${offset}` : ''}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.records) {
            // Check for duplicates
            const existingIds = new Set(allRecords.map(r => r.id));
            const newRecords = data.records.filter(r => !existingIds.has(r.id));
            
            allRecords.push(...newRecords);
            console.log(`    Page ${page}: ${newRecords.length} new records (Total: ${allRecords.length})`);
          }
          offset = data.offset || '';
        } else {
          console.log(`    Page ${page}: Failed ${response.status}`);
          break;
        }
        
        if (page > 5) break;
        await new Promise(r => setTimeout(r, 200));
        
      } while (offset);
    }
    
  } catch (err) {
    console.log(`Error: ${err}`);
  }
  
  console.log(`APPROACH 3 RESULT: ${allRecords.length} records`);
  return allRecords;
}

async function bruteForceApproach4_AllViews(): Promise<any[]> {
  console.log('\n🔥 APPROACH 4: EXHAUST ALL VIEWS');
  console.log('================================');
  
  let allRecords: any[] = [];
  const recordIds = new Set<string>();
  
  try {
    // Get metadata for all views
    const metaResponse = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const storytellersTable = metaData.tables?.find((t: any) => t.id === 'tbl9zxLsGOd3fjWXp');
      
      if (storytellersTable?.views) {
        console.log(`Testing ${storytellersTable.views.length} views`);
        
        for (const view of storytellersTable.views) {
          console.log(`\nTesting view: "${view.name}"`);
          
          let offset = '';
          let page = 0;
          
          do {
            page++;
            const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${encodeURIComponent(view.name)}&maxRecords=100${offset ? `&offset=${offset}` : ''}`;
            
            const response = await fetch(url, {
              headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.records) {
                let newCount = 0;
                data.records.forEach((record: any) => {
                  if (!recordIds.has(record.id)) {
                    recordIds.add(record.id);
                    allRecords.push(record);
                    newCount++;
                  }
                });
                
                console.log(`    Page ${page}: ${newCount} new records (Total unique: ${allRecords.length})`);
              }
              offset = data.offset || '';
            } else {
              console.log(`    Page ${page}: Failed ${response.status}`);
              break;
            }
            
            if (page > 3) break;
            await new Promise(r => setTimeout(r, 100));
            
          } while (offset);
        }
      }
    }
    
  } catch (err) {
    console.log(`Error: ${err}`);
  }
  
  console.log(`APPROACH 4 RESULT: ${allRecords.length} unique records`);
  return allRecords;
}

async function main(): Promise<void> {
  console.log('🔥 BRUTE FORCE ATTACK ON AIRTABLE API');
  console.log('=====================================');
  console.log('USER SEES 210 STORYTELLERS - WE WILL FIND THEM ALL');
  console.log('');
  
  const approaches = [
    bruteForceApproach1_FilterlessAccess,
    bruteForceApproach2_TableIDDirect,
    bruteForceApproach3_ChunkByDate,
    bruteForceApproach4_AllViews
  ];
  
  let bestResult: any[] = [];
  let bestCount = 0;
  
  for (const approach of approaches) {
    try {
      const result = await approach();
      if (result.length > bestCount) {
        bestCount = result.length;
        bestResult = result;
      }
      
      if (result.length >= 200) {
        console.log('\n🎉 BREAKTHROUGH! Found 200+ records!');
        break;
      }
      
    } catch (err) {
      console.log(`Approach failed: ${err}`);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n🎯 BRUTE FORCE RESULTS');
  console.log('======================');
  console.log(`Best result: ${bestCount} storytellers found`);
  
  if (bestCount >= 200) {
    console.log('🎉 SUCCESS! Found most/all storytellers');
  } else if (bestCount > 100) {
    console.log('📈 PROGRESS! Found more than the original 100');
  } else {
    console.log('❌ STILL STUCK AT 100 - API/PERMISSION ISSUE');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Check if API key has full permissions');
    console.log('2. Verify the correct base ID');
    console.log('3. Consider exporting from Airtable directly');
    console.log('4. Check if records are in a different table/base');
  }
}

main().catch(console.error);