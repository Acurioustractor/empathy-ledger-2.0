/**
 * MIGRATE REMAINING STORIES
 * Focus: Get 48 Airtable stories into Supabase stories table
 * Match with existing 211 storytellers in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import Airtable from 'airtable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

async function migrateRemainingStories() {
  console.log('📖 MIGRATE REMAINING STORIES');
  console.log('Getting 48 Airtable stories into Supabase\n');

  // Step 1: Get all Supabase storytellers for matching
  console.log('👥 Loading Supabase storytellers...');
  const { data: storytellers } = await supabase
    .from('storytellers')
    .select('id, full_name, airtable_record_id');

  if (!storytellers) {
    console.error('❌ Could not load storytellers from Supabase');
    return;
  }

  // Create mapping by name and Airtable ID
  const storytellersByName = new Map();
  const storytellersByAirtableId = new Map();
  
  storytellers.forEach(st => {
    storytellersByName.set(st.full_name, st);
    if (st.airtable_record_id) {
      storytellersByAirtableId.set(st.airtable_record_id, st);
    }
  });

  console.log(`✅ Loaded ${storytellers.length} storytellers for matching\n`);

  // Step 2: Get current stories to avoid duplicates
  console.log('📖 Checking existing stories...');
  const { data: existingStories } = await supabase
    .from('stories')
    .select('title, storyteller_id, airtable_record_id');

  const existingTitles = new Set();
  const existingAirtableIds = new Set();

  if (existingStories) {
    existingStories.forEach(story => {
      existingTitles.add(story.title);
      if (story.airtable_record_id) {
        existingAirtableIds.add(story.airtable_record_id);
      }
    });
  }

  console.log(`📊 Found ${existingStories?.length || 0} existing stories in Supabase\n`);

  // Step 3: Get all Airtable stories
  console.log('📥 Fetching Airtable stories...');
  const airtableStories: any[] = [];
  
  await airtable('Stories')
    .select({
      maxRecords: 200,
      fields: [
        'Story ID',
        'Title', 
        'Story Transcript',
        'Storytellers', // This is the Airtable ID reference
        'Storytellers Name',
        'Story Image',
        'Video Story Link',
        'Video Embed Code', 
        'Status',
        'Permissions',
        'Created'
      ]
    })
    .eachPage((records, fetchNextPage) => {
      records.forEach(record => {
        airtableStories.push({
          id: record.id,
          fields: record.fields
        });
      });
      fetchNextPage();
    });

  console.log(`✅ Found ${airtableStories.length} stories in Airtable\n`);

  // Step 4: Migrate each story
  console.log('🔄 Migrating stories...');
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const [index, airtableStory] of airtableStories.entries()) {
    const fields = airtableStory.fields;
    const storyId = fields['Story ID'];
    const title = fields['Title'];
    
    console.log(`\n📖 Story ${index + 1}: "${title}"`);

    // Skip if already exists
    if (existingAirtableIds.has(storyId) || existingTitles.has(title)) {
      console.log(`   ↩️  Already exists in Supabase`);
      skipCount++;
      continue;
    }

    // Find storyteller by Airtable ID first, then by name
    let storyteller = null;
    
    if (fields['Storytellers']?.[0]) {
      storyteller = storytellersByAirtableId.get(fields['Storytellers'][0]);
    }
    
    if (!storyteller && fields['Storytellers Name']?.[0]) {
      storyteller = storytellersByName.get(fields['Storytellers Name'][0]);
    }

    if (!storyteller) {
      console.log(`   ❌ Storyteller not found: "${fields['Storytellers Name']?.[0]}"`);
      errorCount++;
      continue;
    }

    console.log(`   👤 Matched with: ${storyteller.full_name}`);

    try {
      // Create story record matching actual table structure
      const storyData = {
        storyteller_id: storyteller.id,
        title: title || `Story by ${storyteller.full_name}`,
        content: fields['Story Transcript'] || 'Story content available',
        summary: title || `Story by ${storyteller.full_name}`,
        
        // Media
        media_url: fields['Video Story Link'],
        video_embed_code: fields['Video Embed Code'],
        
        // Privacy (map from Airtable permissions)
        privacy_level: mapPermissions(fields['Permissions']),
        
        // Source tracking
        airtable_record_id: storyId,
        
        // Timestamps
        created_at: fields['Created'] || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('stories')
        .insert(storyData);

      if (error) {
        console.log(`   ❌ Database error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Successfully migrated`);
        successCount++;
      }

    } catch (error) {
      console.log(`   ❌ Exception: ${error}`);
      errorCount++;
    }
  }

  // Final results
  console.log('\n📊 MIGRATION RESULTS:');
  console.log(`   ✅ Successfully migrated: ${successCount}`);
  console.log(`   ↩️  Already existed: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📖 Total processed: ${airtableStories.length}`);

  // Verify final state
  const { data: finalStories } = await supabase
    .from('stories')
    .select('id', { count: 'exact', head: true });

  console.log(`\n✅ Final stories count in Supabase: ${finalStories?.length || 0}`);

  if (successCount > 0) {
    console.log(`\n🎉 SUCCESS: Migrated ${successCount} new stories!`);
  }

  if ((finalStories?.length || 0) >= 48) {
    console.log('🎯 GOAL ACHIEVED: 48+ stories now in Supabase!');
  } else {
    console.log(`🎯 PROGRESS: ${finalStories?.length || 0}/48+ stories in Supabase`);
  }
}

function mapStatus(airtableStatus: string): string {
  switch (airtableStatus?.toLowerCase()) {
    case 'published':
    case 'live':
      return 'published';
    case 'draft':
      return 'draft';
    case 'review':
      return 'review';
    default:
      return 'draft';
  }
}

function mapPermissions(airtablePermissions: string): string {
  switch (airtablePermissions?.toLowerCase()) {
    case 'public':
      return 'public';
    case 'community':
      return 'community'; 
    case 'private':
      return 'private';
    default:
      return 'private';
  }
}

// Run the migration
migrateRemainingStories()
  .then(() => {
    console.log('\n✅ Story migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });