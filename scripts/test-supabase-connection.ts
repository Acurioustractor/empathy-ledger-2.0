/**
 * Test Supabase connection and check data
 */

import { createClient } from '@supabase/supabase-js';

console.log('🔍 Testing Supabase connection...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📊 Testing storytellers table...');
    const { data, error, count } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact' })
      .limit(3);

    if (error) {
      console.error('❌ Error querying storytellers:', error);
      return;
    }

    console.log(`✅ Found ${count} total storytellers`);
    console.log('Sample records:');
    data?.forEach((s, i) => {
      console.log(`  ${i + 1}. ID: ${s.id}, Columns: ${Object.keys(s).join(', ')}`);
    });

    // Test stories table
    console.log('\n📖 Testing stories table...');
    const { data: stories, error: storiesError, count: storiesCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .limit(1);

    // Test transcripts table
    console.log('\n📝 Testing transcripts table...');
    const { data: transcripts, error: transcriptsError, count: transcriptsCount } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact' })
      .limit(1);

    if (storiesError) {
      console.error('❌ Error querying stories:', storiesError);
      return;
    }

    console.log(`✅ Found ${storiesCount} total stories`);
    if (stories && stories.length > 0) {
      console.log('Sample story columns:', Object.keys(stories[0]).join(', '));
    }

    if (transcriptsError) {
      console.error('❌ Error querying transcripts:', transcriptsError);
      return;
    }

    console.log(`\n✅ Found ${transcriptsCount} total transcripts`);
    if (transcripts && transcripts.length > 0) {
      console.log('Sample transcript columns:', Object.keys(transcripts[0]).join(', '));
    } else {
      console.log('📋 Transcripts table is empty - ready for data migration');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();