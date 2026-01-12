#!/usr/bin/env tsx
/**
 * FIND MISSING PROFILE IMAGES
 * User says almost all people should have photos - let's find what we're missing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

async function getStorytellersWithoutImages(): Promise<any[]> {
  console.log('🔍 GETTING STORYTELLERS WITHOUT IMAGES');
  console.log('=====================================');
  
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select('id, full_name, airtable_record_id')
    .is('profile_image_url', null);
    
  if (error) {
    throw new Error(`Failed to get storytellers: ${error.message}`);
  }
  
  console.log(`📊 Found ${storytellers.length} storytellers without profile images in our database`);
  return storytellers;
}

async function checkAirtableForMissingImages(storytellers: any[]): Promise<void> {
  console.log('\n🔍 CHECKING AIRTABLE FOR MISSING IMAGES');
  console.log('======================================');
  
  let foundImages = 0;
  let stillMissing = 0;
  let errors = 0;
  
  for (let i = 0; i < storytellers.length; i++) {
    const storyteller = storytellers[i];
    
    console.log(`\n📋 ${i + 1}/${storytellers.length}: ${storyteller.full_name}`);
    
    if (!storyteller.airtable_record_id) {
      console.log(`   ❌ No Airtable record ID`);
      stillMissing++;
      continue;
    }
    
    try {
      // Get the specific record from Airtable
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp/${storyteller.airtable_record_id}`,
        { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
      );
      
      if (!response.ok) {
        console.log(`   ❌ Failed to fetch from Airtable: ${response.status}`);
        errors++;
        continue;
      }
      
      const data = await response.json();
      const fields = data.fields;
      
      // Check all possible image field variations
      const imageFields = [
        'File Profile Image',
        'Profile Image', 
        'Image',
        'Photo',
        'Picture',
        'File Image',
        'Profile Photo',
        'Attachments',
        'Media',
        'File'
      ];
      
      let foundImageField = false;
      let imageUrl = null;
      let imageFilename = null;
      
      for (const fieldName of imageFields) {
        const value = fields[fieldName];
        if (value && Array.isArray(value) && value.length > 0 && value[0].url) {
          foundImageField = true;
          imageUrl = value[0].url;
          imageFilename = value[0].filename || `${storyteller.full_name}_${fieldName}.jpg`;
          
          console.log(`   ✅ Found image in "${fieldName}": ${imageFilename}`);
          console.log(`       URL: ${imageUrl.substring(0, 60)}...`);
          
          // Update our database with the found image
          await updateStoryteller(storyteller.id, imageUrl, imageFilename);
          foundImages++;
          break;
        }
      }
      
      if (!foundImageField) {
        console.log(`   ❌ No image found in any field`);
        console.log(`   📋 Available fields: ${Object.keys(fields).join(', ')}`);
        stillMissing++;
      }
      
    } catch (err) {
      console.log(`   💥 Error checking record: ${err}`);
      errors++;
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n📊 MISSING IMAGE CHECK COMPLETE`);
  console.log(`✅ Found images: ${foundImages}`);
  console.log(`❌ Still missing: ${stillMissing}`);
  console.log(`💥 Errors: ${errors}`);
}

async function updateStoryteller(id: string, imageUrl: string, imageFilename: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('storytellers')
      .update({
        profile_image_url: imageUrl,
        profile_image_file: imageFilename
      })
      .eq('id', id);
      
    if (error) {
      console.log(`   ⚠️  Failed to update database: ${error.message}`);
    } else {
      console.log(`   🎯 Updated database with image URL`);
    }
  } catch (err) {
    console.log(`   💥 Error updating database: ${err}`);
  }
}

async function checkAlternativeImageFields(): Promise<void> {
  console.log('\n🔍 CHECKING ALTERNATIVE IMAGE FIELDS IN AIRTABLE');
  console.log('===============================================');
  
  try {
    // Get a sample of records to see all available fields
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbl9zxLsGOd3fjWXp?maxRecords=20`,
      { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        console.log(`\n📋 Analyzing fields in ${data.records.length} sample records for image opportunities:`);
        
        // Collect all unique fields that might contain images
        const allFields = new Set<string>();
        const imageRelatedFields = new Set<string>();
        const attachmentFields = new Set<string>();
        
        data.records.forEach((record: any) => {
          Object.keys(record.fields).forEach(fieldName => {
            allFields.add(fieldName);
            
            const value = record.fields[fieldName];
            
            // Check if it's an attachment field
            if (Array.isArray(value) && value.length > 0 && value[0].url) {
              attachmentFields.add(fieldName);
            }
            
            // Check if field name suggests images
            if (fieldName.toLowerCase().includes('image') ||
                fieldName.toLowerCase().includes('photo') ||
                fieldName.toLowerCase().includes('picture') ||
                fieldName.toLowerCase().includes('file') ||
                fieldName.toLowerCase().includes('attachment') ||
                fieldName.toLowerCase().includes('media')) {
              imageRelatedFields.add(fieldName);
            }
          });
        });
        
        console.log(`\n📷 Image-related field names found:`);
        Array.from(imageRelatedFields).forEach(field => {
          const hasAttachments = attachmentFields.has(field);
          console.log(`   ${field} ${hasAttachments ? '✅ (has attachments)' : '❌ (no attachments)'}`);
        });
        
        console.log(`\n📎 All attachment fields found:`);
        Array.from(attachmentFields).forEach(field => {
          console.log(`   ${field}`);
        });
        
        console.log(`\n📋 Total unique fields: ${allFields.size}`);
        console.log(`📷 Image-related fields: ${imageRelatedFields.size}`);
        console.log(`📎 Attachment fields: ${attachmentFields.size}`);
      }
    }
  } catch (err) {
    console.log(`❌ Error checking alternative fields: ${err}`);
  }
}

async function validateCurrentImageStatus(): Promise<void> {
  console.log('\n📊 CURRENT IMAGE STATUS VALIDATION');
  console.log('==================================');
  
  const [
    { count: totalStorytellers },
    { count: withImages },
    { count: withoutImages }
  ] = await Promise.all([
    supabase.from('storytellers').select('*', { count: 'exact', head: true }),
    supabase.from('storytellers').select('*', { count: 'exact', head: true }).not('profile_image_url', 'is', null),
    supabase.from('storytellers').select('*', { count: 'exact', head: true }).is('profile_image_url', null)
  ]);
  
  const imagePercentage = ((withImages / totalStorytellers) * 100).toFixed(1);
  
  console.log(`\n📈 CURRENT STATUS:`);
  console.log(`   👥 Total storytellers: ${totalStorytellers}`);
  console.log(`   📷 With images: ${withImages}/${totalStorytellers} (${imagePercentage}%)`);
  console.log(`   ❌ Without images: ${withoutImages}/${totalStorytellers} (${((withoutImages/totalStorytellers)*100).toFixed(1)}%)`);
  
  if (imagePercentage < 90) {
    console.log(`\n⚠️  Only ${imagePercentage}% have images - user expects almost all to have photos`);
    console.log(`🔍 Need to investigate further for missing images`);
  } else {
    console.log(`\n✅ ${imagePercentage}% coverage is excellent!`);
  }
}

async function main(): Promise<void> {
  console.log('🔍 FINDING MISSING PROFILE IMAGES');
  console.log('==================================');
  console.log('User says almost all people should have photos');
  console.log('Let\'s find what we\'re missing in Airtable');
  console.log('');
  
  try {
    await validateCurrentImageStatus();
    await checkAlternativeImageFields();
    
    const storytellersWithoutImages = await getStorytellersWithoutImages();
    
    if (storytellersWithoutImages.length > 0) {
      await checkAirtableForMissingImages(storytellersWithoutImages);
    }
    
    await validateCurrentImageStatus();
    
    console.log('\n🎯 MISSING IMAGE INVESTIGATION COMPLETE');
    console.log('=======================================');
    console.log('This should reveal any images we missed in our original migration');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

main().catch(console.error);