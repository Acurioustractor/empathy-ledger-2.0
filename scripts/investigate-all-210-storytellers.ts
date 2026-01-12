#!/usr/bin/env tsx
/**
 * INVESTIGATE ALL 210 STORYTELLERS
 * Comprehensive investigation to find all 210 storytellers in Airtable
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function fetchAllRecordsExhaustively(tableName: string): Promise<any[]> {
  console.log(`🔍 EXHAUSTIVE FETCH OF ALL ${tableName} RECORDS`);
  console.log('='.repeat(50));
  
  const allRecords: any[] = [];
  let pageCount = 0;
  let offset = '';
  
  try {
    do {
      pageCount++;
      
      // Try different approaches to get all records
      const urls = [
        // Standard approach without view
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=100${offset ? `&offset=${offset}` : ''}`,
        
        // Try with different sort orders if first page
        ...(pageCount === 1 ? [
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=100&sort[0][field]=Created&sort[0][direction]=desc`,
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=100&sort[0][field]=Name&sort[0][direction]=asc`,
        ] : [])
      ];
      
      for (const url of urls) {
        console.log(`📄 Page ${pageCount}, URL variant ${urls.indexOf(url) + 1}: ${url.split('?')[0]}`);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'User-Agent': 'Empathy-Ledger-Exhaustive/1.0'
          }
        });
        
        if (!response.ok) {
          console.log(`❌ Request failed: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        console.log(`   📊 Response: ${data.records?.length || 0} records, offset: ${data.offset ? 'YES' : 'NO'}`);
        console.log(`   📋 First record: ${data.records?.[0]?.fields?.Name || 'N/A'}`);
        console.log(`   📋 Last record: ${data.records?.[data.records?.length - 1]?.fields?.Name || 'N/A'}`);
        
        if (data.records && data.records.length > 0) {
          // Check for duplicates before adding
          const existingIds = new Set(allRecords.map(r => r.id));
          const newRecords = data.records.filter((r: any) => !existingIds.has(r.id));
          
          console.log(`   📈 New unique records: ${newRecords.length}`);
          allRecords.push(...newRecords);
          
          // Update offset from this successful request
          offset = data.offset || '';
          console.log(`   🎯 Total unique records so far: ${allRecords.length}`);
          console.log(`   ⏭️  Next offset: ${offset || 'NONE'}`);
          
          break; // Move to next page
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Safety check
      if (pageCount > 20) {
        console.log('⚠️  Safety break at 20 pages');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } while (offset && pageCount <= 20);
    
  } catch (error) {
    console.error('❌ Exhaustive fetch failed:', error);
  }
  
  console.log(`\n✅ EXHAUSTIVE FETCH COMPLETE`);
  console.log(`📊 Total unique records found: ${allRecords.length}`);
  
  return allRecords;
}

async function tryDifferentViews(): Promise<{ [key: string]: number }> {
  console.log(`\n👁️  TRYING ALL AVAILABLE VIEWS`);
  console.log('='.repeat(40));
  
  const viewResults: { [key: string]: number } = {};
  
  // First get all available views
  try {
    const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    });
    
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      const storytellersTable = metaData.tables?.find((t: any) => t.name === 'Storytellers');
      
      if (storytellersTable?.views) {
        console.log(`📋 Found ${storytellersTable.views.length} views to test`);
        
        for (const view of storytellersTable.views) {
          try {
            console.log(`\n🔍 Testing view: "${view.name}"`);
            
            let totalInView = 0;
            let offset = '';
            let pages = 0;
            
            do {
              pages++;
              const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?view=${encodeURIComponent(view.name)}&maxRecords=100${offset ? `&offset=${offset}` : ''}`;
              
              const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
              });
              
              if (!response.ok) {
                console.log(`   ❌ View "${view.name}" failed: ${response.status}`);
                break;
              }
              
              const data = await response.json();
              totalInView += data.records?.length || 0;
              offset = data.offset || '';
              
              console.log(`   📄 Page ${pages}: ${data.records?.length || 0} records (Total: ${totalInView})`);
              
              if (pages > 10) break; // Safety
              await new Promise(resolve => setTimeout(resolve, 200));
              
            } while (offset);
            
            viewResults[view.name] = totalInView;
            console.log(`   📊 View "${view.name}": ${totalInView} total records`);
            
          } catch (err) {
            console.log(`   💥 Error testing view "${view.name}": ${err}`);
            viewResults[view.name] = 0;
          }
        }
      }
    }
  } catch (err) {
    console.log('❌ Could not fetch view metadata:', err);
  }
  
  return viewResults;
}

async function analyzeRecordDistribution(records: any[]): Promise<void> {
  console.log(`\n📊 ANALYZING RECORD DISTRIBUTION`);
  console.log('='.repeat(35));
  
  if (records.length === 0) {
    console.log('❌ No records to analyze');
    return;
  }
  
  // Analyze creation dates
  const dates = records
    .map(r => {
      const created = r.createdTime || r.fields?.Created;
      return created ? new Date(created) : null;
    })
    .filter(d => d)
    .sort((a, b) => a!.getTime() - b!.getTime());
    
  if (dates.length > 0) {
    console.log(`📅 Date range:`);
    console.log(`   Earliest: ${dates[0]!.toISOString().split('T')[0]}`);
    console.log(`   Latest: ${dates[dates.length - 1]!.toISOString().split('T')[0]}`);
    
    // Group by month to see distribution
    const monthCounts = new Map<string, number>();
    dates.forEach(date => {
      const monthKey = `${date!.getFullYear()}-${String(date!.getMonth() + 1).padStart(2, '0')}`;
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    });
    
    console.log(`📈 Records by month (top 10):`);
    Array.from(monthCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([month, count]) => {
        console.log(`   ${month}: ${count} records`);
      });
  }
  
  // Analyze field completeness
  console.log(`\n📋 FIELD COMPLETENESS ANALYSIS:`);
  
  const fieldStats = new Map<string, number>();
  records.forEach(record => {
    Object.keys(record.fields || {}).forEach(field => {
      const value = record.fields[field];
      if (value !== null && value !== undefined && value !== '' && 
          !(Array.isArray(value) && value.length === 0)) {
        fieldStats.set(field, (fieldStats.get(field) || 0) + 1);
      }
    });
  });
  
  // Show key fields
  const keyFields = ['Name', 'File Profile Image', 'Transcript (from Media)', 'Project', 'Location'];
  keyFields.forEach(field => {
    const count = fieldStats.get(field) || 0;
    const percentage = ((count / records.length) * 100).toFixed(1);
    console.log(`   ${field}: ${count}/${records.length} (${percentage}%)`);
  });
  
  // Show sample record IDs
  console.log(`\n📋 SAMPLE RECORD IDs (first 10):`);
  records.slice(0, 10).forEach((record, i) => {
    console.log(`   ${i + 1}. ${record.id} - ${record.fields?.Name || 'No name'}`);
  });
  
  console.log(`\n📋 SAMPLE RECORD IDs (last 10):`);
  records.slice(-10).forEach((record, i) => {
    const index = records.length - 10 + i + 1;
    console.log(`   ${index}. ${record.id} - ${record.fields?.Name || 'No name'}`);
  });
}

async function compareWithExpectedCount(): Promise<void> {
  console.log(`\n🎯 COMPARISON WITH EXPECTED 210 STORYTELLERS`);
  console.log('='.repeat(45));
  
  console.log('Based on your assertion that there are 210 storytellers:');
  console.log('- You mentioned "just about all will have profile images"');
  console.log('- You mentioned "most if not all will have transcripts"');
  console.log('');
  console.log('This suggests:');
  console.log('- Expected: ~210 storytellers');
  console.log('- Expected: ~200+ with profile images');
  console.log('- Expected: ~180+ with transcripts');
  console.log('');
  console.log('If we\'re only finding 100, possible reasons:');
  console.log('1. Records are in different views/filters');
  console.log('2. Records are in a different table');
  console.log('3. API permissions are limiting access');
  console.log('4. Records are archived/deleted');
  console.log('5. Different base or table structure');
}

async function main() {
  console.log('🕵️  COMPREHENSIVE 210 STORYTELLERS INVESTIGATION');
  console.log('='.repeat(55));
  console.log('Finding all 210 storytellers as user confirmed they exist');
  console.log('');
  
  try {
    // Method 1: Exhaustive fetch with different approaches
    const allRecords = await fetchAllRecordsExhaustively('Storytellers');
    
    // Method 2: Try all available views
    const viewResults = await tryDifferentViews();
    
    // Method 3: Analyze what we found
    await analyzeRecordDistribution(allRecords);
    
    // Method 4: Compare with expectations
    await compareWithExpectedCount();
    
    console.log(`\n📊 INVESTIGATION SUMMARY`);
    console.log('='.repeat(25));
    console.log(`Exhaustive fetch: ${allRecords.length} records`);
    
    const maxViewRecords = Math.max(...Object.values(viewResults));
    const bestView = Object.entries(viewResults).find(([_, count]) => count === maxViewRecords);
    
    console.log(`Best view result: ${maxViewRecords} records ${bestView ? `(${bestView[0]})` : ''}`);
    
    if (allRecords.length >= 200) {
      console.log('🎉 SUCCESS: Found close to expected 210 storytellers!');
    } else if (allRecords.length >= 150) {
      console.log('⚠️  PARTIAL: Found more than 100 but less than expected 210');
    } else {
      console.log('❌ ISSUE: Still finding significantly fewer than expected 210');
      console.log('');
      console.log('🔍 NEXT STEPS TO INVESTIGATE:');
      console.log('1. Verify the correct Airtable base ID');
      console.log('2. Check if records are in a different table name');
      console.log('3. Verify API key has full access permissions');
      console.log('4. Check if there are multiple bases with storyteller data');
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

main().catch(console.error);