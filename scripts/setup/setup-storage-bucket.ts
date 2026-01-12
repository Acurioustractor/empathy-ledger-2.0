#!/usr/bin/env ts-node

/**
 * SETUP SUPABASE STORAGE BUCKET
 * 
 * Creates the storyteller-media bucket for image storage
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

async function setupStorageBucket() {
  console.log('🗄️ Setting up Supabase Storage bucket...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Create the storyteller-media bucket
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('storyteller-media', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    console.log('✅ Storage bucket "storyteller-media" ready');
    console.log('📁 Bucket is public for storyteller image access');

  } catch (error) {
    console.error('❌ Storage setup failed:', error);
    throw error;
  }
}

setupStorageBucket();