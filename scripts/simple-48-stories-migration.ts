/**
 * SIMPLE 48 STORIES MIGRATION
 * 
 * Get all 48 stories from Airtable into Supabase properly
 * Focus on transcript vs story architecture
 */

import { createClient } from '@supabase/supabase-js';
import Airtable from 'airtable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

async function main() {
  console.log('🎯 SIMPLE 48 STORIES MIGRATION');
  console.log('Getting all Airtable stories into Supabase with transcript architecture\n');

  // Step 1: Check current state
  console.log('📊 CHECKING CURRENT STATE...');
  const { data: currentStories } = await supabase.from('stories').select('id', { count: 'exact', head: true });
  const { data: currentStorytellers } = await supabase.from('storytellers').select('id', { count: 'exact', head: true });
  
  console.log(`Current Supabase: ${currentStories?.length || 0} stories, ${currentStorytellers?.length || 0} storytellers\n`);

  // Step 2: Get all Airtable stories
  console.log('📥 FETCHING ALL AIRTABLE STORIES...');
  const airtableStories: any[] = [];
  
  await airtable('Stories')
    .select({
      maxRecords: 200,
      fields: [
        'Story ID',
        'Title', 
        'Story Transcript',
        'Storytellers',
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

  // Step 3: Get storytellers mapping
  console.log('👥 MAPPING STORYTELLERS...');
  const storytellersMap = new Map();
  
  const { data: supabaseStorytellers } = await supabase
    .from('storytellers')
    .select('id, name, airtable_id');

  if (supabaseStorytellers) {
    supabaseStorytellers.forEach(st => {
      storytellersMap.set(st.name, st);
    });
  }

  console.log(`📋 Found ${storytellersMap.size} storytellers in Supabase\n`);

  // Step 4: Migrate each story
  console.log('🔄 MIGRATING STORIES...');
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const [index, airtableStory] of airtableStories.entries()) {
    const fields = airtableStory.fields;
    const storytellerName = fields['Storytellers Name']?.[0];
    
    if (!storytellerName) {
      console.log(`   ⚠️  Story ${index + 1}: No storyteller name, skipping`);
      skipCount++;
      continue;
    }

    const storyteller = storytellersMap.get(storytellerName);
    if (!storyteller) {
      console.log(`   ⚠️  Story ${index + 1}: Storyteller "${storytellerName}" not found in Supabase`);
      errorCount++;
      continue;
    }

    try {
      // Check if story already exists
      const { data: existingStory } = await supabase
        .from('stories')
        .select('id')
        .eq('title', fields.Title)
        .eq('storyteller_id', storyteller.id)
        .maybeSingle();

      if (existingStory) {
        console.log(`   ↩️  Story ${index + 1}: "${fields.Title}" already exists`);
        skipCount++;
        continue;
      }

      // Create story record
      const storyData = {
        storyteller_id: storyteller.id,
        title: fields.Title || `Story by ${storytellerName}`,
        story_content: fields['Story Transcript'] || 'Content to be developed',
        story_type: 'life-experience',
        
        // Media
        video_url: fields['Video Story Link'],
        video_embed_code: fields['Video Embed Code'],
        
        // Status  
        status: mapStatus(fields.Status),
        visibility: mapPermissions(fields.Permissions),
        
        // Source tracking
        airtable_story_id: fields['Story ID'],
        migrated_from_airtable: true,
        
        // Timestamps
        created_at: fields.Created || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('stories')
        .insert(storyData);

      if (error) {
        console.log(`   ❌ Story ${index + 1}: Error - ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Story ${index + 1}: "${fields.Title}" migrated successfully`);
        successCount++;
      }

    } catch (error) {
      console.log(`   ❌ Story ${index + 1}: Exception - ${error}`);
      errorCount++;
    }

    // Progress update
    if ((index + 1) % 10 === 0) {
      console.log(`\n   📊 Progress: ${index + 1}/${airtableStories.length} processed\n`);
    }
  }

  // Final results
  console.log('\n📊 MIGRATION RESULTS:');
  console.log(`   ✅ Successfully migrated: ${successCount}`);
  console.log(`   ↩️  Already existed: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📖 Total processed: ${airtableStories.length}`);

  // Verify final state
  const { data: finalStories } = await supabase.from('stories').select('id', { count: 'exact', head: true });
  console.log(`\n✅ Final Supabase stories count: ${finalStories?.length || 0}`);

  if ((finalStories?.length || 0) >= 48) {
    console.log('\n🎉 SUCCESS: All stories are now in Supabase!');
  } else {
    console.log(`\n⚠️  Note: ${finalStories?.length || 0} stories in Supabase, expected 48+`);
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Create transcripts table (run create-transcripts-table.sql)');
  console.log('2. Extract transcripts from story content for AI analysis');
  console.log('3. Set up AI analysis to process transcripts, not stories');
  console.log('4. Get storyteller consent for AI features');
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
main()
  .then(() => {
    console.log('\n✅ Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });