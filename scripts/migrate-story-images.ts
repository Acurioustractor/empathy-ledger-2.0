/**
 * MIGRATE STORY IMAGES FROM AIRTABLE
 * 
 * Download and save all story images from Airtable to Supabase storage
 * Update stories table with local image URLs
 */

import { createClient } from '@supabase/supabase-js';
import Airtable from 'airtable';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

async function migrateStoryImages() {
  console.log('🖼️  MIGRATING STORY IMAGES FROM AIRTABLE');
  console.log('Downloading and saving story images to Supabase storage\n');

  try {
    // Step 1: Check current state
    console.log('📊 CHECKING CURRENT STATE...');
    
    const { data: currentStories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, story_image_url, airtable_record_id')
      .not('airtable_record_id', 'is', null);

    if (storiesError) {
      console.error('❌ Error fetching stories:', storiesError);
      return;
    }

    console.log(`✅ Found ${currentStories?.length || 0} stories with Airtable IDs`);

    // Count stories that already have images
    const storiesWithImages = currentStories?.filter(s => s.story_image_url) || [];
    console.log(`📸 Stories with images: ${storiesWithImages.length}`);
    console.log(`📋 Stories needing images: ${(currentStories?.length || 0) - storiesWithImages.length}`);

    // Step 2: Get Airtable stories with images
    console.log('\n📥 FETCHING AIRTABLE STORY IMAGES...');
    
    const airtableStories: any[] = [];
    await airtable('Stories')
      .select({
        maxRecords: 200,
        fields: [
          'Story ID',
          'Title',
          'Story Image',
          'Storytellers Name'
        ]
      })
      .eachPage((records, fetchNextPage) => {
        records.forEach(record => {
          if (record.fields['Story Image'] && record.fields['Story Image'].length > 0) {
            airtableStories.push({
              id: record.id,
              fields: record.fields
            });
          }
        });
        fetchNextPage();
      });

    console.log(`✅ Found ${airtableStories.length} Airtable stories with images`);

    if (airtableStories.length === 0) {
      console.log('ℹ️  No story images to migrate');
      return;
    }

    // Step 3: Show sample data
    console.log('\n📋 SAMPLE STORY IMAGES:');
    airtableStories.slice(0, 3).forEach((story, index) => {
      const image = story.fields['Story Image'][0];
      console.log(`   ${index + 1}. "${story.fields.Title}"`);
      console.log(`      Image: ${image.filename} (${Math.round(image.size / 1024)}KB)`);
      console.log(`      Storyteller: ${story.fields['Storytellers Name']?.[0] || 'Unknown'}`);
    });

    // Step 4: Migrate each story image
    console.log('\n🔄 MIGRATING STORY IMAGES...');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const [index, airtableStory] of airtableStories.entries()) {
      try {
        const fields = airtableStory.fields;
        const storyId = fields['Story ID'];
        const title = fields['Title'];
        const storytellerName = fields['Storytellers Name']?.[0] || 'Unknown';

        console.log(`\n🖼️  Image ${index + 1}/${airtableStories.length}: "${title}"`);

        // Find corresponding Supabase story
        const supabaseStory = currentStories?.find(s => 
          s.airtable_record_id === airtableStory.id || 
          s.title === title
        );

        if (!supabaseStory) {
          console.log(`   ⚠️  No matching Supabase story found`);
          errorCount++;
          continue;
        }

        // Check if story already has image
        if (supabaseStory.story_image_url) {
          console.log(`   ↩️  Already has image: ${supabaseStory.story_image_url}`);
          skipCount++;
          continue;
        }

        // Get the image attachment
        const imageAttachment = fields['Story Image'][0];
        console.log(`   📁 Downloading: ${imageAttachment.filename} (${Math.round(imageAttachment.size / 1024)}KB)`);

        // Download and upload image
        const imageUrl = await downloadAndUploadStoryImage(
          imageAttachment,
          supabaseStory.id,
          storytellerName,
          title
        );

        if (imageUrl) {
          // Update story with image URL
          const { error: updateError } = await supabase
            .from('stories')
            .update({ 
              story_image_url: imageUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', supabaseStory.id);

          if (updateError) {
            console.log(`   ❌ Failed to update story: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`   ✅ Image migrated and story updated`);
            successCount++;
          }
        } else {
          console.log(`   ❌ Failed to upload image`);
          errorCount++;
        }

        // Progress indicator
        if ((index + 1) % 10 === 0) {
          console.log(`\n📊 Progress: ${index + 1}/${airtableStories.length} processed`);
        }

        // Rate limiting - be nice to Airtable/Supabase
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`   ❌ Exception: ${error}`);
        errorCount++;
      }
    }

    // Step 5: Final results
    console.log('\n📊 STORY IMAGE MIGRATION RESULTS:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ↩️  Already had images: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   🖼️  Total processed: ${airtableStories.length}`);

    // Step 6: Verify final state
    const { data: finalStories } = await supabase
      .from('stories')
      .select('id, title, story_image_url')
      .not('story_image_url', 'is', null);

    console.log(`\n✅ Final stories with images: ${finalStories?.length || 0}`);

    if (successCount > 0) {
      console.log('\n🎉 STORY IMAGES MIGRATION SUCCESSFUL!');
      
      console.log('\n🖼️  WHAT THIS ENABLES:');
      console.log('✅ VISUAL STORIES: Each story now has its featured image');
      console.log('✅ CONSISTENT MEDIA: All images stored in Supabase storage');
      console.log('✅ FAST LOADING: Images served from CDN');
      console.log('✅ COMPLETE STORIES: Visual + text content ready for publication');

      // Show some statistics
      await showImageStatistics();
    }

  } catch (error) {
    console.error('\n💥 Story image migration failed:', error);
    throw error;
  }
}

async function downloadAndUploadStoryImage(
  imageAttachment: any,
  storyId: string,
  storytellerName: string,
  storyTitle: string
): Promise<string | null> {
  try {
    // Create a clean filename
    const originalFilename = imageAttachment.filename || 'story-image.jpg';
    const extension = originalFilename.split('.').pop() || 'jpg';
    const cleanTitle = storyTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
    const cleanStoryteller = storytellerName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 20);
    const filename = `${cleanStoryteller}-${cleanTitle}-${storyId.substring(0, 8)}.${extension}`;

    // Download image from Airtable
    console.log(`     📥 Downloading from: ${imageAttachment.url}`);
    const response = await fetch(imageAttachment.url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    console.log(`     📦 Downloaded: ${Math.round(imageBuffer.byteLength / 1024)}KB`);

    // Upload to Supabase Storage in story-images bucket
    const storagePath = `stories/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('story-images')
      .upload(storagePath, imageBuffer, {
        contentType: imageAttachment.type || 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.log(`     ❌ Storage upload failed: ${error.message}`);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('story-images')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log(`     🔗 Uploaded to: ${publicUrl}`);

    return publicUrl;

  } catch (error) {
    console.log(`     ❌ Image processing failed: ${error}`);
    return null;
  }
}

async function showImageStatistics() {
  console.log('\n📊 STORY IMAGE STATISTICS:');
  
  try {
    // Get updated stories with images
    const { data: storiesWithImages } = await supabase
      .from('stories')
      .select('id, title, story_image_url')
      .not('story_image_url', 'is', null);

    const { data: allStories } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true });

    if (storiesWithImages && allStories) {
      const coveragePercentage = Math.round((storiesWithImages.length / allStories.length) * 100);
      
      console.log(`   🖼️  Stories with images: ${storiesWithImages.length}`);
      console.log(`   📖 Total stories: ${allStories.length}`);
      console.log(`   📊 Image coverage: ${coveragePercentage}%`);
      
      if (storiesWithImages.length > 0) {
        console.log('\n📋 Sample stories with images:');
        storiesWithImages.slice(0, 5).forEach((story, index) => {
          console.log(`   ${index + 1}. "${story.title}"`);
          console.log(`      🔗 ${story.story_image_url}`);
        });
      }
    }
  } catch (error) {
    console.log('   ⚠️  Could not generate image statistics');
  }
}

// Execute migration
migrateStoryImages()
  .then(() => {
    console.log('\n✅ Story image migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Story image migration failed:', error);
    process.exit(1);
  });