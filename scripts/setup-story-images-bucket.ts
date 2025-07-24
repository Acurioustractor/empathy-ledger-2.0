/**
 * SETUP STORY IMAGES BUCKET
 * 
 * Create the storage bucket for story images if it doesn't exist
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupStoryImagesBucket() {
  console.log('🪣 SETTING UP STORY IMAGES BUCKET');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const storyImagesBucket = buckets?.find(bucket => bucket.name === 'story-images');
    
    if (storyImagesBucket) {
      console.log('✅ story-images bucket already exists');
      
      // Test upload permissions
      const testPath = 'test/test.txt';
      const { error: uploadError } = await supabase.storage
        .from('story-images')
        .upload(testPath, 'test content', { upsert: true });
        
      if (uploadError) {
        console.log('⚠️  Upload test failed:', uploadError.message);
      } else {
        console.log('✅ Bucket is writable');
        // Clean up test file
        await supabase.storage.from('story-images').remove([testPath]);
      }
      
    } else {
      console.log('📝 Creating story-images bucket...');
      
      const { data, error } = await supabase.storage.createBucket('story-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        
        if (error.message.includes('already exists')) {
          console.log('✅ Bucket already exists (race condition)');
        } else {
          throw error;
        }
      } else {
        console.log('✅ story-images bucket created successfully');
      }
    }

    // Show all available buckets
    console.log('\n📋 Available storage buckets:');
    buckets?.forEach(bucket => {
      console.log(`   📁 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

  } catch (error) {
    console.error('💥 Bucket setup failed:', error);
    throw error;
  }
}

// Execute setup
setupStoryImagesBucket()
  .then(() => {
    console.log('\n✅ Story images bucket setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Bucket setup failed:', error);
    process.exit(1);
  });