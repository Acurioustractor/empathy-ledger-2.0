import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { createHash } from 'crypto';
import path from 'path';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable API credentials');
}

// Specific mappings we found from the comprehensive search
const EXACT_MATCHES = [
  { supabase: ' Cheryl Ann Mara', airtable: ' Cheryl Ann Mara' },
  { supabase: ' Nicholas Marchesi', airtable: 'Nicholas Marchesi' },
  { supabase: 'Abby', airtable: 'Abby' },
  { supabase: 'Aunty Evie', airtable: 'Aunty Evie' },
  { supabase: 'Aunty Maureen', airtable: 'Aunty Maureen' },
  { supabase: 'Ben', airtable: 'Benjamin Knight' },
  { supabase: 'Bob and Julie - Hamilton', airtable: 'Bob and Julie - Hamilton' },
  { supabase: 'Brian Edwards', airtable: 'Brian Edwards' },
  { supabase: 'Brigit Perry', airtable: 'Brigit Perry' },
  { supabase: 'Brodie Germaine', airtable: 'Brodie Germaine' },
  { supabase: 'Catherine Plant', airtable: 'Catherine Plant' },
  { supabase: 'Ethel and  Iris Ferdies', airtable: 'Ethel and  Iris Ferdies' },
  { supabase: 'Felicity Davis-Smith', airtable: 'Felicity Davis-Smith' },
  { supabase: 'Henry Doyle', airtable: 'Henry Doyle' },
  { supabase: 'Ivy', airtable: 'Ivy' },
  { supabase: 'Jacqui', airtable: 'Jacqui' },
  { supabase: 'Jesús Teruel', airtable: 'Jesús Teruel' },
  { supabase: 'Keeda Zilm', airtable: 'Keeda Zilm' },
  { supabase: 'Keiron Lander', airtable: 'Keiron Lander' },
  { supabase: 'Luke Napier', airtable: 'Luke Napier' },
  { supabase: 'Matthew Neill', airtable: 'Matthew Neill' },
  { supabase: 'Melissa Legg', airtable: 'Melissa Legg' },
  { supabase: 'Migrant Home group', airtable: 'Migrant Home group' },
  { supabase: 'Pam Ramsay', airtable: 'Pam Ramsay' },
  { supabase: 'Paul Morris', airtable: 'Paul Morris' },
  { supabase: 'Phil Barton', airtable: 'Phil Barton' },
  { supabase: 'Ranbir Chanhan', airtable: 'Ranbir Chanhan' },
  { supabase: 'Ray  Kirkman', airtable: 'Ray  Kirkman' },
  { supabase: 'Richard Calligan', airtable: 'Richard Calligan' },
  { supabase: 'TOMNET meeting discussion', airtable: 'TOMNET meeting discussion' },
  { supabase: 'Vicki Sorenson', airtable: 'Vicki Sorenson' }
];

async function fetchAllAirtableStorytellers() {
  const allRecords: any[] = [];
  let offset: string | undefined;

  do {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers${offset ? `?offset=${offset}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Storytellers: ${response.statusText}`);
    }

    const data = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

function getImageExtension(url: string): string {
  try {
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath);
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    if (validExtensions.includes(extension.toLowerCase())) {
      return extension.toLowerCase();
    }
    
    return '.jpg';
  } catch {
    return '.jpg';
  }
}

async function migrateRemainingImages() {
  console.log('🖼️  FINAL PROFILE IMAGE MIGRATION - TARGETING REMAINING MATCHES\n');
  
  try {
    // Get all Airtable storytellers
    console.log('📥 Fetching all Airtable storytellers...');
    const airtableStorytellers = await fetchAllAirtableStorytellers();
    console.log(`📊 Found ${airtableStorytellers.length} total storytellers in Airtable\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    
    for (const mapping of EXACT_MATCHES) {
      console.log(`\n👤 Processing: "${mapping.supabase}" → "${mapping.airtable}"`);
      
      try {
        // Find the Airtable record
        const airtableRecord = airtableStorytellers.find(record => 
          record.fields.Name === mapping.airtable
        );
        
        if (!airtableRecord) {
          console.log(`   ❌ Airtable record not found for "${mapping.airtable}"`);
          notFoundCount++;
          continue;
        }
        
        const profileImages = airtableRecord.fields['File Profile Image'] || [];
        if (profileImages.length === 0) {
          console.log(`   ❌ No profile images in Airtable record`);
          notFoundCount++;
          continue;
        }
        
        // Find the Supabase user
        const { data: supabaseUsers, error: userError } = await supabase
          .from('users')
          .select('id, full_name, profile_image_url')
          .eq('full_name', mapping.supabase);
        
        if (userError || !supabaseUsers || supabaseUsers.length === 0) {
          console.log(`   ❌ Supabase user not found for "${mapping.supabase}"`);
          notFoundCount++;
          continue;
        }
        
        const supabaseUser = supabaseUsers[0];
        
        // Check if user already has a profile image
        if (supabaseUser.profile_image_url) {
          console.log(`   ⏭️  User already has profile image, skipping...`);
          skippedCount++;
          continue;
        }
        
        // Use the first profile image
        const mainImage = profileImages[0];
        console.log(`   📥 Downloading image: ${mainImage.filename}`);
        
        // Generate filename for storage
        const urlHash = createHash('md5').update(mainImage.url).digest('hex');
        const extension = getImageExtension(mainImage.url);
        const fileName = `profile-images/${supabaseUser.id}-${urlHash}${extension}`;
        
        // Download image from Airtable
        const response = await fetch(mainImage.url);
        
        if (!response.ok) {
          console.log(`   ❌ Failed to download: ${response.status} ${response.statusText}`);
          errorCount++;
          continue;
        }
        
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || mainImage.type || 'image/jpeg';
        
        // Upload to Supabase storage
        console.log('   📤 Uploading to Supabase storage...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, imageBuffer, {
            contentType,
            upsert: true
          });
        
        if (uploadError) {
          console.log(`   ❌ Upload failed: ${uploadError.message}`);
          errorCount++;
          continue;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);
        
        if (!publicUrlData.publicUrl) {
          console.log('   ❌ Failed to get public URL');
          errorCount++;
          continue;
        }
        
        // Update user with new profile image URL
        console.log('   💾 Updating user profile...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            profile_image_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', supabaseUser.id);
        
        if (updateError) {
          console.log(`   ❌ Failed to update user: ${updateError.message}`);
          errorCount++;
          continue;
        }
        
        console.log(`   ✅ Successfully migrated profile image`);
        console.log(`   🔗 New URL: ${publicUrlData.publicUrl.substring(0, 60)}...`);
        successCount++;
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Error processing mapping: ${error instanceof Error ? error.message : error}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 FINAL MIGRATION SUMMARY:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ❓ Not found in Airtable/Supabase: ${notFoundCount}`);
    console.log(`   ⏭️  Already had images (skipped): ${skippedCount}`);
    console.log(`   📝 Total attempted: ${EXACT_MATCHES.length}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 FINAL RESULTS:`);
      console.log(`   📈 Profile image coverage: ${165 + successCount}/207 = ${Math.round(((165 + successCount) / 207) * 100)}%`);
      console.log(`   🚀 NEW TOTAL: ${165 + successCount} users with profile images!`);
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function main() {
  console.log('🚀 Starting final profile image migration...\n');
  
  await migrateRemainingImages();
}

main().catch(console.error);