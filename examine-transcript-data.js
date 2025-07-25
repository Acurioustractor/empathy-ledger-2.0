import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function examineTranscriptData() {
  console.log('🔍 Examining transcript data in detail...\n');

  try {
    // Get sample transcripts with storyteller info
    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select(`
        id,
        transcript_content,
        storyteller_id,
        privacy_level,
        consent_for_story_creation,
        processing_status,
        word_count,
        created_at,
        storytellers(
          id,
          full_name,
          profile_image_url
        )
      `)
      .limit(5);

    if (error) {
      console.log('❌ Error fetching transcripts:', error.message);
      return;
    }

    console.log(`✅ Found ${transcripts.length} sample transcripts`);
    
    transcripts.forEach((transcript, index) => {
      console.log(`\n📖 Transcript ${index + 1}:`);
      console.log(`- ID: ${transcript.id}`);
      console.log(`- Storyteller: ${transcript.storytellers?.[0]?.full_name || 'Unknown'}`);
      console.log(`- Word count: ${transcript.word_count}`);
      console.log(`- Privacy: ${transcript.privacy_level}`);
      console.log(`- Consent for story creation: ${transcript.consent_for_story_creation}`);
      console.log(`- Processing status: ${transcript.processing_status}`);
      console.log(`- Content preview: "${transcript.transcript_content?.substring(0, 150)}..."`);
    });

    // Check privacy levels and consent status
    console.log('\n📊 PRIVACY & CONSENT ANALYSIS:');
    
    const { data: privacyStats } = await supabase
      .from('transcripts')
      .select('privacy_level, consent_for_story_creation, processing_status');

    if (privacyStats) {
      const privacyLevels = {};
      const consentStats = { true: 0, false: 0, null: 0 };
      const processingStats = {};

      privacyStats.forEach(t => {
        privacyLevels[t.privacy_level] = (privacyLevels[t.privacy_level] || 0) + 1;
        consentStats[t.consent_for_story_creation] = (consentStats[t.consent_for_story_creation] || 0) + 1;
        processingStats[t.processing_status] = (processingStats[t.processing_status] || 0) + 1;
      });

      console.log('Privacy levels:', privacyLevels);
      console.log('Story creation consent:', consentStats);
      console.log('Processing status:', processingStats);
    }

    // Look for transcripts that could become public stories
    console.log('\n🌍 TRANSCRIPTS SUITABLE FOR PUBLIC STORIES:');
    
    const { data: suitableTranscripts, error: suitableError } = await supabase
      .from('transcripts')
      .select(`
        id,
        storyteller_id,
        word_count,
        storytellers(full_name)
      `)
      .in('privacy_level', ['public-approved', 'research-approved'])
      .eq('consent_for_story_creation', true)
      .gte('word_count', 100)
      .limit(10);

    if (!suitableError && suitableTranscripts) {
      console.log(`Found ${suitableTranscripts.length} transcripts suitable for public stories:`);
      suitableTranscripts.forEach(t => {
        console.log(`- ${t.storytellers?.[0]?.full_name}: ${t.word_count} words`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

examineTranscriptData();