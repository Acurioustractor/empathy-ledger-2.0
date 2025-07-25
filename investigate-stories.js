import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateStories() {
  try {
    console.log('🔍 Investigating Stories table...\n');

    // Get total count of stories
    const { count: totalCount, error: countError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting story count:', countError);
      return;
    }

    console.log(`📊 Total stories in database: ${totalCount}\n`);

    // Get all stories with key information
    const { data: allStories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        storyteller_id,
        created_at,
        updated_at,
        privacy_level,
        themes,
        airtable_record_id,
        summary,
        media_url,
        transcription,
        video_embed_code,
        story_image_url
      `)
      .order('created_at', { ascending: true });

    if (storiesError) {
      console.error('❌ Error fetching stories:', storiesError);
      return;
    }

    console.log(`📚 Retrieved ${allStories.length} stories\n`);

    // Show all story titles for identification
    console.log('📖 All story titles:');
    console.log('=' .repeat(80));
    allStories.forEach((story, index) => {
      const privacy = story.privacy_level || 'unknown';
      const hasAirtableId = story.airtable_record_id ? '🔗' : '❌';
      const hasMedia = story.media_url || story.video_embed_code || story.story_image_url ? '📷' : '⚪';
      console.log(`${index + 1}. ${hasAirtableId}${hasMedia} [${privacy}] "${story.title || 'NO TITLE'}" (ID: ${story.id.substring(0, 8)}...)`);
    });

    // Check for potential issues
    console.log('\n🔍 Potential Issues Analysis:');
    console.log('=' .repeat(50));

    // Check for null or empty titles
    const noTitleStories = allStories.filter(story => !story.title || story.title.trim() === '');
    if (noTitleStories.length > 0) {
      console.log(`❗ Stories with no title: ${noTitleStories.length}`);
      noTitleStories.forEach(story => {
        console.log(`   - ID: ${story.id.substring(0, 8)}..., Storyteller: ${story.storyteller_id?.substring(0, 8) || 'NO STORYTELLER'}, Created: ${story.created_at}`);
      });
    }

    // Check for duplicate titles
    const titleMap = {};
    allStories.forEach(story => {
      if (story.title) {
        const normalizedTitle = story.title.toLowerCase().trim();
        if (!titleMap[normalizedTitle]) {
          titleMap[normalizedTitle] = [];
        }
        titleMap[normalizedTitle].push(story);
      }
    });

    const duplicateTitles = Object.entries(titleMap).filter(([title, stories]) => stories.length > 1);
    if (duplicateTitles.length > 0) {
      console.log(`\n❗ Duplicate titles found: ${duplicateTitles.length}`);
      duplicateTitles.forEach(([title, stories]) => {
        console.log(`   - "${title}" appears ${stories.length} times:`);
        stories.forEach(story => {
          console.log(`     * ID: ${story.id.substring(0, 8)}..., Created: ${story.created_at}`);
        });
      });
    }

    // Check for test-like titles
    const testKeywords = ['test', 'demo', 'sample', 'example', 'debug', 'temp'];
    const potentialTestStories = allStories.filter(story => {
      if (!story.title) return false;
      const lowerTitle = story.title.toLowerCase();
      return testKeywords.some(keyword => lowerTitle.includes(keyword));
    });

    if (potentialTestStories.length > 0) {
      console.log(`\n❗ Potential test stories: ${potentialTestStories.length}`);
      potentialTestStories.forEach(story => {
        console.log(`   - "${story.title}" (ID: ${story.id.substring(0, 8)}...)`);
      });
    }

    // Check by privacy level
    const privacyLevels = {};
    allStories.forEach(story => {
      const privacy = story.privacy_level || 'unknown';
      privacyLevels[privacy] = (privacyLevels[privacy] || 0) + 1;
    });

    console.log(`\n📋 Stories by privacy level:`);
    Object.entries(privacyLevels).forEach(([privacy, count]) => {
      console.log(`   - ${privacy}: ${count} stories`);
    });

    // Check for Airtable connections
    const withAirtable = allStories.filter(story => story.airtable_record_id).length;
    const withoutAirtable = allStories.length - withAirtable;

    console.log(`\n📋 Airtable connections:`);
    console.log(`   - With Airtable ID: ${withAirtable} stories`);
    console.log(`   - Without Airtable ID: ${withoutAirtable} stories`);

    // Check for stories with media
    const withMedia = allStories.filter(story => 
      story.media_url || story.video_embed_code || story.story_image_url
    ).length;

    console.log(`\n📋 Media attachments:`);
    console.log(`   - With media: ${withMedia} stories`);
    console.log(`   - Without media: ${allStories.length - withMedia} stories`);

    // Check for recently created stories (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentStories = allStories.filter(story => new Date(story.created_at) > sevenDaysAgo);

    if (recentStories.length > 0) {
      console.log(`\n📅 Recently created stories (last 7 days): ${recentStories.length}`);
      recentStories.forEach(story => {
        console.log(`   - "${story.title}" created on ${new Date(story.created_at).toLocaleDateString()}`);
      });
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`Total stories: ${totalCount}`);
    console.log(`Expected: 49`);
    console.log(`Difference: ${totalCount - 49}`);
    console.log(`Stories with no title: ${noTitleStories.length}`);
    console.log(`Duplicate titles: ${duplicateTitles.length}`);
    console.log(`Potential test stories: ${potentialTestStories.length}`);
    console.log(`Recent stories (7 days): ${recentStories.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

investigateStories();