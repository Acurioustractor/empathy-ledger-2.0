import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugStoriesTable() {
  console.log('🔍 Debugging Stories Table Structure and Data...\n');

  try {
    // First, let's see what columns exist in the stories table
    console.log('📋 STEP 1: Checking table structure by attempting to select all columns...');
    
    const { data: structureTest, error: structureError } = await supabase
      .from('stories')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Error accessing stories table:', structureError.message);
      return;
    }

    if (structureTest && structureTest.length > 0) {
      console.log('✅ Stories table exists! Sample record structure:');
      console.log('Available columns:', Object.keys(structureTest[0]));
      console.log('Sample record:', structureTest[0]);
    } else {
      console.log('⚠️  Stories table exists but is empty');
    }

    // Count total records
    const { count, error: countError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📊 STEP 2: Total records in stories table: ${count}`);
    }

    // Check what's in the stories table with basic fields
    console.log('\n📖 STEP 3: Attempting to fetch stories with basic fields...');
    
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        summary,
        privacy_level,
        status,
        created_at,
        updated_at
      `)
      .limit(5);

    if (storiesError) {
      console.log('❌ Error fetching basic story fields:', storiesError.message);
    } else {
      console.log(`✅ Successfully fetched ${stories?.length || 0} stories with basic fields`);
      if (stories && stories.length > 0) {
        stories.forEach((story, index) => {
          console.log(`\nStory ${index + 1}:`);
          console.log(`- ID: ${story.id}`);
          console.log(`- Title: ${story.title}`);
          console.log(`- Privacy: ${story.privacy_level}`);
          console.log(`- Status: ${story.status}`);
          console.log(`- Content length: ${story.content?.length || 0} chars`);
          console.log(`- Has summary: ${!!story.summary}`);
        });
      }
    }

    // Try to fetch with storyteller relationship
    console.log('\n👥 STEP 4: Checking storyteller relationships...');
    
    const { data: storiesWithStorytellerTest, error: storytellerError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        storyteller_id,
        storytellers(id, full_name)
      `)
      .limit(3);

    if (storytellerError) {
      console.log('❌ Error with storyteller relationship:', storytellerError.message);
      
      // Try alternative field names
      console.log('\n🔍 Trying alternative field names...');
      const { data: altTest, error: altError } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          contributor_id,
          author_name,
          story_type
        `)
        .limit(3);
        
      if (altError) {
        console.log('❌ Alternative fields error:', altError.message);
      } else {
        console.log('✅ Alternative fields found:');
        console.log(altTest);
      }
    } else {
      console.log('✅ Storyteller relationship works');
      console.log(storiesWithStorytellerTest);
    }

    // Check what privacy levels exist
    console.log('\n🔒 STEP 5: Checking privacy levels in data...');
    const { data: privacyCheck, error: privacyError } = await supabase
      .from('stories')
      .select('privacy_level')
      .not('privacy_level', 'is', null);

    if (!privacyError && privacyCheck) {
      const privacyLevels = [...new Set(privacyCheck.map(s => s.privacy_level))];
      console.log('Privacy levels found:', privacyLevels);
    }

    // Check for public stories specifically
    console.log('\n🌍 STEP 6: Checking for public stories...');
    const { data: publicStories, error: publicError } = await supabase
      .from('stories')
      .select('id, title, privacy_level')
      .eq('privacy_level', 'public')
      .limit(5);

    if (!publicError) {
      console.log(`Found ${publicStories?.length || 0} public stories`);
      if (publicStories?.length > 0) {
        publicStories.forEach(story => {
          console.log(`- ${story.title} (${story.privacy_level})`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugStoriesTable();