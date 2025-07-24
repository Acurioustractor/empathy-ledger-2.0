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

interface AirtableStorytellerRecord {
  id: string;
  fields: {
    Name?: string;
    'File Profile Image'?: Array<{
      id: string;
      url: string;
      filename: string;
      size: number;
      type: string;
      width: number;
      height: number;
    }>;
    'Unique Storyteller ID'?: string;
    Project?: string;
    Organisation?: string;
    Role?: string;
    Location?: string;
  };
}

async function fetchAllAirtableStorytellers(): Promise<AirtableStorytellerRecord[]> {
  const allRecords: AirtableStorytellerRecord[] = [];
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
    
    console.log(`📥 Fetched ${data.records.length} storytellers (total: ${allRecords.length})`);
  } while (offset);

  return allRecords;
}

async function findMatchingSupabaseUser(storytellerName: string) {
  if (!storytellerName) {
    return null;
  }

  try {
    // Try to find by exact name match first
    let { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, profile_image_url')
      .eq('full_name', storytellerName);

    if (error) {
      console.log(`   ⚠️  Error querying users: ${error.message}`);
      return null;
    }

    if (users && users.length > 0) {
      return users[0];
    }

    // Try fuzzy matching by cleaning up names
    const cleanName = storytellerName.toLowerCase().trim().replace(/\s+/g, ' ');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, full_name, profile_image_url');

    if (allUsersError) {
      console.log(`   ⚠️  Error querying all users: ${allUsersError.message}`);
      return null;
    }

    if (allUsers) {
      for (const user of allUsers) {
        if (!user.full_name) continue;
        
        const userCleanName = user.full_name.toLowerCase().trim().replace(/\s+/g, ' ');
        
        // Check for exact match after cleaning
        if (userCleanName === cleanName) {
          return user;
        }
      }
    }

    return null;
  } catch (error) {
    console.log(`   ❌ Error in findMatchingSupabaseUser: ${error instanceof Error ? error.message : error}`);
    return null;
  }
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

async function migrateBatchProfileImages() {
  console.log('🖼️  MIGRATING ALL STORYTELLER PROFILE IMAGES FROM AIRTABLE\n');
  
  try {
    // 1. Fetch all storytellers from Airtable
    console.log('📥 Fetching all storytellers from Airtable...');
    const airtableStorytellers = await fetchAllAirtableStorytellers();
    
    console.log(`📊 Found ${airtableStorytellers.length} storytellers in Airtable\n`);
    
    // 2. Filter storytellers with profile images
    const storytellersWithImages = airtableStorytellers.filter(storyteller => 
      storyteller.fields['File Profile Image'] && storyteller.fields['File Profile Image'].length > 0
    );
    
    console.log(`🖼️  Storytellers with profile images: ${storytellersWithImages.length}`);
    console.log(`❌ Storytellers without profile images: ${airtableStorytellers.length - storytellersWithImages.length}\n`);

    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;

    // 3. Process each storyteller with images
    for (const storyteller of storytellersWithImages) {
      const storytellerName = storyteller.fields.Name || 'Unknown';
      const profileImages = storyteller.fields['File Profile Image'] || [];
      
      console.log(`\n👤 Processing: ${storytellerName}`);

      try {
        // Find matching user in Supabase
        const supabaseUser = await findMatchingSupabaseUser(storytellerName);
        
        if (!supabaseUser) {
          console.log(`   ❌ No matching user found in Supabase for "${storytellerName}"`);
          notFoundCount++;
          continue;
        }

        console.log(`   ✅ Found matching user: ${supabaseUser.full_name} (ID: ${supabaseUser.id})`);

        // Check if user already has a profile image
        if (supabaseUser.profile_image_url) {
          console.log(`   ⏭️  User already has profile image, skipping...`);
          skippedCount++;
          continue;
        }

        // Use the first (main) profile image
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
        successCount++;

        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`   ❌ Error processing storyteller: ${error instanceof Error ? error.message : error}`);
        errorCount++;
      }
    }

    console.log(`\n📊 BATCH MIGRATION SUMMARY:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ❓ No matching user found: ${notFoundCount}`);
    console.log(`   ⏭️  Already had images (skipped): ${skippedCount}`);
    console.log(`   📝 Total storytellers with images: ${storytellersWithImages.length}`);

    if (successCount > 0) {
      console.log(`\n🎉 Profile images successfully migrated from Airtable to Supabase!`);
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function main() {
  console.log('🚀 Starting complete storyteller profile image migration...\n');
  
  await migrateBatchProfileImages();
}

main().catch(console.error);