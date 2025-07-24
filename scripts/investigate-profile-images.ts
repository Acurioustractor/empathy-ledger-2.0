#!/usr/bin/env tsx
/**
 * INVESTIGATE PROFILE IMAGES
 * Check why we're only seeing 77% with images when almost all should have them
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function investigateProfileImages(): Promise<void> {
  console.log('🔍 INVESTIGATING PROFILE IMAGE SITUATION');
  console.log('=======================================');
  
  // Get a sample of storytellers from different views to check image fields
  const testViews = ['Migration', 'Grid view', 'Gallery', 'Orange Sky'];
  
  for (const viewName of testViews) {
    console.log(`\n📊 Checking view: "${viewName}"`);
    
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?view=${encodeURIComponent(viewName)}&maxRecords=10`,
        { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        console.log(`   Records in sample: ${data.records?.length || 0}`);
        
        if (data.records) {
          let withImages = 0;
          let withOtherImageFields = 0;
          
          data.records.forEach((record: any, i: number) => {
            const fields = record.fields;
            const name = fields.Name || 'Unknown';
            
            console.log(`\n   ${i + 1}. ${name}:`);
            
            // Check all possible image field variations
            const imageFields = [
              'File Profile Image',
              'Profile Image',
              'Image',
              'Photo',
              'Picture',
              'File Image',
              'Profile Photo',
              'Attachments'
            ];
            
            let hasMainImage = false;
            let hasOtherImage = false;
            
            imageFields.forEach(fieldName => {
              const value = fields[fieldName];
              if (value) {
                if (fieldName === 'File Profile Image') {
                  hasMainImage = true;
                  if (Array.isArray(value) && value.length > 0) {
                    console.log(`     ✅ ${fieldName}: ${value.length} files`);
                    console.log(`        URL: ${value[0].url?.substring(0, 60)}...`);
                    console.log(`        Filename: ${value[0].filename || 'No filename'}`);
                  } else {
                    console.log(`     ⚠️  ${fieldName}: ${typeof value} (not array)`);
                  }
                } else {
                  hasOtherImage = true;
                  console.log(`     📋 ${fieldName}: ${Array.isArray(value) ? `${value.length} files` : typeof value}`);
                }
              }
            });
            
            if (hasMainImage) withImages++;
            if (hasOtherImage) withOtherImageFields++;
            
            if (!hasMainImage && !hasOtherImage) {
              console.log(`     ❌ No image fields found`);
              
              // Show all available fields to see what we might be missing
              console.log(`     📋 Available fields: ${Object.keys(fields).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('photo') || k.toLowerCase().includes('file')).join(', ') || 'None with image/photo/file'}`);
            }
          });
          
          console.log(`\n   📊 Summary for "${viewName}":`);
          console.log(`     Main images: ${withImages}/${data.records.length} (${((withImages/data.records.length)*100).toFixed(1)}%)`);
          console.log(`     Other image fields: ${withOtherImageFields}/${data.records.length}`);
        }
      } else {
        console.log(`   ❌ Failed to fetch: ${response.status}`);
      }
    } catch (err) {
      console.log(`   💥 Error: ${err}`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
}

async function checkAllFieldsInFirstRecord(): Promise<void> {
  console.log('\n🔍 CHECKING ALL FIELDS IN SAMPLE RECORDS');
  console.log('========================================');
  
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?maxRecords=5`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const record = data.records[0];
        console.log(`\n📋 All fields in record "${record.fields.Name || 'Unknown'}"`);
        
        // Group fields by type
        const imageRelatedFields: string[] = [];
        const textFields: string[] = [];
        const otherFields: string[] = [];
        
        Object.keys(record.fields).forEach(fieldName => {
          const value = record.fields[fieldName];
          const isImageRelated = fieldName.toLowerCase().includes('image') || 
                                 fieldName.toLowerCase().includes('photo') || 
                                 fieldName.toLowerCase().includes('picture') ||
                                 fieldName.toLowerCase().includes('file') ||
                                 Array.isArray(value) && value[0]?.url;
          
          if (isImageRelated) {
            imageRelatedFields.push(fieldName);
          } else if (typeof value === 'string') {
            textFields.push(fieldName);
          } else {
            otherFields.push(fieldName);
          }
        });
        
        console.log(`\n📷 Image/File related fields (${imageRelatedFields.length}):`);
        imageRelatedFields.forEach(field => {
          const value = record.fields[field];
          if (Array.isArray(value)) {
            console.log(`   ${field}: ${value.length} items`);
            if (value[0]?.url) {
              console.log(`     URL: ${value[0].url.substring(0, 60)}...`);
            }
          } else {
            console.log(`   ${field}: ${typeof value}`);
          }
        });
        
        console.log(`\n📝 Text fields (${textFields.length}):`);
        textFields.slice(0, 10).forEach(field => {
          console.log(`   ${field}`);
        });
        
        console.log(`\n📋 Other fields (${otherFields.length}):`);
        otherFields.slice(0, 10).forEach(field => {
          console.log(`   ${field}`);
        });
      }
    }
  } catch (err) {
    console.log(`❌ Error checking fields: ${err}`);
  }
}

async function main(): Promise<void> {
  console.log('🔍 PROFILE IMAGE INVESTIGATION');
  console.log('==============================');
  console.log('User says almost all storytellers should have profile images');
  console.log('Currently showing 77% - let\'s find the missing ones');
  console.log('');
  
  await investigateProfileImages();
  await checkAllFieldsInFirstRecord();
  
  console.log('\n🎯 INVESTIGATION COMPLETE');
  console.log('=========================');
  console.log('This should reveal if we\'re missing image fields or processing them wrong');
}

main().catch(console.error);