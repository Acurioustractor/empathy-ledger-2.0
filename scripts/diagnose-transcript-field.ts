#!/usr/bin/env tsx
/**
 * DIAGNOSE TRANSCRIPT FIELD
 * Examine actual transcript field data to understand why none are being found
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function examineTranscriptFields() {
  console.log('🔍 DIAGNOSING TRANSCRIPT FIELD DATA');
  console.log('===================================');
  
  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=10`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`📊 Examining ${data.records.length} records for transcript fields`);
    
    data.records.forEach((record: any, i: number) => {
      const fields = record.fields;
      const name = fields.Name || 'No name';
      
      console.log(`\n${i+1}. ${name} (${record.id})`);
      
      // Check all possible transcript field variations
      const transcriptFields = [
        'Transcript (from Media)',
        'Transcript',
        'Media Transcript', 
        'Interview Transcript',
        'Transcript (from Media) (from Videos)',
        'transcript',
        'TRANSCRIPT'
      ];
      
      console.log('   Transcript fields:');
      let hasTranscript = false;
      
      transcriptFields.forEach(fieldName => {
        const value = fields[fieldName];
        if (value !== undefined) {
          const preview = typeof value === 'string' ? 
            `"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"` :
            JSON.stringify(value);
          console.log(`     ${fieldName}: ${preview}`);
          if (typeof value === 'string' && value.trim().length > 10) {
            hasTranscript = true;
          }
        }
      });
      
      if (!hasTranscript) {
        console.log('     ❌ No substantial transcript found');
      }
      
      // Show ALL fields for first few records to understand structure
      if (i < 2) {
        console.log('   All fields:');
        Object.keys(fields).sort().forEach(key => {
          const value = fields[key];
          if (key.toLowerCase().includes('transcript') || key.toLowerCase().includes('media')) {
            const preview = typeof value === 'string' ? 
              `"${value.substring(0, 30)}..."` :
              JSON.stringify(value);
            console.log(`     📋 ${key}: ${preview}`);
          }
        });
      }
    });
    
    // Get counts of transcript fields across all records
    console.log('\n📊 TRANSCRIPT FIELD ANALYSIS ACROSS ALL RECORDS:');
    
    const allRecordsResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=100`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    });
    
    if (allRecordsResponse.ok) {
      const allData = await allRecordsResponse.json();
      
      const fieldCounts = new Map();
      
      allData.records.forEach((record: any) => {
        Object.keys(record.fields).forEach(key => {
          if (key.toLowerCase().includes('transcript') || key.toLowerCase().includes('media')) {
            const value = record.fields[key];
            if (typeof value === 'string' && value.trim().length > 10) {
              fieldCounts.set(key, (fieldCounts.get(key) || 0) + 1);
            }
          }
        });
      });
      
      console.log('Field usage counts:');
      Array.from(fieldCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([field, count]) => {
          console.log(`   ${field}: ${count}/${allData.records.length} records`);
        });
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

async function main() {
  console.log('🩺 TRANSCRIPT FIELD DIAGNOSTIC');
  console.log('==============================');
  console.log('Finding out why no transcripts are being detected');
  console.log('');
  
  await examineTranscriptFields();
  
  console.log('\n🎯 DIAGNOSTIC COMPLETE');
  console.log('=======================');
}

main().catch(console.error);