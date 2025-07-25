import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testStoriesQuery() {
  console.log('🧪 Testing the new stories query...\n');

  try {
    // Test the exact query from the updated stories page
    const { data: storiesData, error } = await supabase
      .from('transcripts')
      .select(`
        id,
        transcript_content,
        word_count,
        privacy_level,
        processing_status,
        created_at,
        updated_at,
        storytellers(
          id,
          full_name,
          profile_image_url,
          organization_id,
          location_id
        )
      `)
      .gte('word_count', 100)
      .limit(5) // Just test first 5
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log(`✅ Query successful! Found ${storiesData?.length || 0} stories`);

    if (storiesData && storiesData.length > 0) {
      storiesData.forEach((transcript, index) => {
        const storyteller = Array.isArray(transcript.storytellers) ? transcript.storytellers[0] : transcript.storytellers;
        
        // Extract title logic
        const contentLines = transcript.transcript_content?.split('\\n') || [];
        let title = 'Story by ' + (storyteller?.full_name || 'Unknown');
        
        for (const line of contentLines) {
          const cleanLine = line.replace(/[#*_=\\-\\[\\]\\d:]/g, '').trim();
          if (cleanLine.length > 10 && cleanLine.length < 100 && !cleanLine.includes('Speaker')) {
            title = cleanLine;
            break;
          }
        }
        
        // Generate summary
        const sentences = transcript.transcript_content?.split(/[.!?]+/) || [];
        const summary = sentences.slice(0, 2).join('. ').trim() + (sentences.length > 2 ? '...' : '');
        
        console.log(`\\n📖 Story ${index + 1}:`);
        console.log(`- ID: ${transcript.id}`);
        console.log(`- Title: "${title}"`);
        console.log(`- Storyteller: ${storyteller?.full_name || 'Unknown'}`);
        console.log(`- Word count: ${transcript.word_count}`);
        console.log(`- Privacy: ${transcript.privacy_level}`);
        console.log(`- Summary: "${summary.substring(0, 100)}..."`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testStoriesQuery();