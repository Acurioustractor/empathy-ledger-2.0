import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { createHash } from 'crypto';
import path from 'path';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Story {
  id: string;
  title: string;
  story_image_url?: string;
}

async function migrateAirtableImages() {
  console.log('🖼️  MIGRATING AIRTABLE IMAGES TO SUPABASE STORAGE');
  
  try {
    // Get all stories with Airtable image URLs
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, title, story_image_url')
      .not('story_image_url', 'is', null)
      .like('story_image_url', '%airtableusercontent.com%');

    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }

    if (!stories || stories.length === 0) {
      console.log('✅ No Airtable images found to migrate');
      return;
    }

    console.log(`📊 Found ${stories.length} stories with Airtable images`);

    let successCount = 0;
    let errorCount = 0;

    for (const story of stories) {
      try {
        console.log(`\n📷 Processing: ${story.title.substring(0, 50)}...`);
        
        if (!story.story_image_url) continue;

        // Generate a consistent filename
        const urlHash = createHash('md5').update(story.story_image_url).digest('hex');
        const originalExtension = getImageExtension(story.story_image_url);
        const fileName = `story-images/${story.id}-${urlHash}${originalExtension}`;

        // Check if image already exists in storage
        const { data: existingFile } = await supabase.storage
          .from('media')
          .list('story-images', {
            search: `${story.id}-${urlHash}`
          });

        if (existingFile && existingFile.length > 0) {
          console.log('   ⏭️  Image already migrated, skipping...');
          continue;
        }

        // Download image from Airtable
        console.log('   📥 Downloading from Airtable...');
        const response = await fetch(story.story_image_url);
        
        if (!response.ok) {
          console.log(`   ❌ Failed to download: ${response.status} ${response.statusText}`);
          errorCount++;
          continue;
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/jpeg';

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

        // Update story with new URL
        console.log('   💾 Updating story record...');
        const { error: updateError } = await supabase
          .from('stories')
          .update({ 
            story_image_url: publicUrlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', story.id);

        if (updateError) {
          console.log(`   ❌ Failed to update story: ${updateError.message}`);
          errorCount++;
          continue;
        }

        console.log(`   ✅ Successfully migrated image`);
        successCount++;

        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`   ❌ Error processing story: ${error instanceof Error ? error.message : error}`);
        errorCount++;
      }
    }

    console.log(`\n📊 MIGRATION COMPLETE:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${successCount + errorCount}`);

    if (successCount > 0) {
      console.log(`\n🎉 Images are now hosted on Supabase and won't expire!`);
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

function getImageExtension(url: string): string {
  try {
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath);
    
    // Common image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    if (validExtensions.includes(extension.toLowerCase())) {
      return extension.toLowerCase();
    }
    
    // Default to .jpg if no valid extension found
    return '.jpg';
  } catch {
    return '.jpg';
  }
}

// Check if storage bucket exists and create if needed
async function ensureStorageBucket() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      return false;
    }

    const mediaBucket = buckets?.find(bucket => bucket.name === 'media');
    
    if (!mediaBucket) {
      console.log('📦 Creating media storage bucket...');
      const { data, error: createError } = await supabase.storage.createBucket('media', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }

      console.log('✅ Media bucket created successfully');
    }

    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Airtable image migration...\n');
  
  const bucketReady = await ensureStorageBucket();
  if (!bucketReady) {
    console.error('❌ Failed to ensure storage bucket exists');
    process.exit(1);
  }

  await migrateAirtableImages();
}

main().catch(console.error);