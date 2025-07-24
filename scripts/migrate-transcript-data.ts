/**
 * MIGRATE TRANSCRIPT DATA
 * 
 * Move transcript content from storytellers table to new transcripts table
 * This separates raw transcripts (for AI analysis) from storyteller profiles
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateTranscriptData() {
  console.log('📝 MIGRATING TRANSCRIPT DATA');
  console.log('Moving transcripts from storytellers table to dedicated transcripts table\n');

  try {
    // Step 1: Check current state
    console.log('📊 CHECKING CURRENT STATE...');
    
    const { data: currentTranscripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true });

    if (transcriptsError) {
      console.error('❌ Error checking transcripts table:', transcriptsError);
      return;
    }

    console.log(`✅ Transcripts table exists with ${currentTranscripts?.length || 0} records`);

    // Step 2: Get storytellers with transcript data
    console.log('\n👥 FINDING STORYTELLERS WITH TRANSCRIPT DATA...');
    
    const { data: storytellersWithTranscripts, error: storytellersError } = await supabase
      .from('storytellers')
      .select('id, full_name, transcript, airtable_record_id, created_at')
      .not('transcript', 'is', null)
      .neq('transcript', '');

    if (storytellersError) {
      console.error('❌ Error fetching storytellers:', storytellersError);
      return;
    }

    console.log(`✅ Found ${storytellersWithTranscripts?.length || 0} storytellers with transcript data`);

    if (!storytellersWithTranscripts || storytellersWithTranscripts.length === 0) {
      console.log('ℹ️  No transcript data to migrate');
      return;
    }

    // Step 3: Show sample data
    console.log('\n📋 SAMPLE TRANSCRIPT DATA:');
    storytellersWithTranscripts.slice(0, 3).forEach((st, index) => {
      const wordCount = st.transcript ? st.transcript.split(' ').length : 0;
      const preview = st.transcript ? st.transcript.substring(0, 100) + '...' : '';
      console.log(`   ${index + 1}. ${st.full_name}: ${wordCount} words`);
      console.log(`      Preview: "${preview}"`);
    });

    // Step 4: Migrate each transcript
    console.log('\n🔄 MIGRATING TRANSCRIPTS...');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const [index, storyteller] of storytellersWithTranscripts.entries()) {
      try {
        console.log(`\n📝 Transcript ${index + 1}/${storytellersWithTranscripts.length}: ${storyteller.full_name}`);

        // Check if transcript already exists
        const { data: existingTranscript } = await supabase
          .from('transcripts')
          .select('id')
          .eq('storyteller_id', storyteller.id)
          .maybeSingle();

        if (existingTranscript) {
          console.log(`   ↩️  Already exists`);
          skipCount++;
          continue;
        }

        // Prepare transcript data
        const wordCount = storyteller.transcript.split(' ').length;
        
        const transcriptData = {
          storyteller_id: storyteller.id,
          transcript_content: storyteller.transcript,
          transcript_type: 'interview', // Default assumption
          
          // Source information
          collection_date: storyteller.created_at, // Use storyteller creation date as best guess
          collection_method: 'interview', // Default assumption
          language: 'en', // Default assumption
          
          // Set conservative defaults for consent (will need to be updated later)
          storyteller_approved_content: false, // They'll need to review and approve
          consent_for_ai_analysis: false, // Requires new consent
          consent_for_quote_extraction: false, // Requires new consent
          consent_for_theme_analysis: false, // Requires new consent
          consent_for_story_creation: false, // Requires new consent
          
          // Privacy (most restrictive by default)
          privacy_level: 'private',
          
          // Processing status
          processing_status: 'raw',
          safety_review_status: 'pending',
          
          // Analysis status
          ready_for_analysis: false, // Will be set to true after consent
          
          // Technical metadata
          transcription_method: 'manual', // Assume manual transcription
          
          created_at: storyteller.created_at,
          updated_at: new Date().toISOString()
        };

        // Insert transcript
        const { error } = await supabase
          .from('transcripts')
          .insert(transcriptData);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Migrated (${wordCount} words)`);
          successCount++;
        }

        // Progress indicator
        if ((index + 1) % 10 === 0) {
          console.log(`\n📊 Progress: ${index + 1}/${storytellersWithTranscripts.length} processed`);
        }

      } catch (error) {
        console.log(`   ❌ Exception: ${error}`);
        errorCount++;
      }
    }

    // Step 5: Final results
    console.log('\n📊 MIGRATION RESULTS:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ↩️  Already existed: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${storytellersWithTranscripts.length}`);

    // Step 6: Verify final state
    const { data: finalTranscripts } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✅ Final transcripts count: ${finalTranscripts?.length || 0}`);

    if (successCount > 0) {
      console.log('\n🎉 TRANSCRIPT MIGRATION SUCCESSFUL!');
      
      console.log('\n🎯 WHAT THIS ENABLES:');
      console.log('✅ TRANSCRIPTS: Raw wisdom ready for AI analysis');
      console.log('✅ STORIES: Clean separation from source material');
      console.log('✅ PRIVACY: Granular consent controls for each transcript');
      console.log('✅ AI READY: Ready to process transcripts (not stories) for insights');
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Get storyteller consent for AI analysis features');
      console.log('2. Set up AI analysis workflow for transcripts');
      console.log('3. Create story → transcript connection system');
      console.log('4. Test full transcript → analysis → story creation flow');
    }

    // Step 7: Show some sample statistics
    await showTranscriptStatistics();

  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    throw error;
  }
}

async function showTranscriptStatistics() {
  console.log('\n📊 TRANSCRIPT STATISTICS:');
  
  try {
    // Get word count distribution
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('word_count, transcript_type, processing_status');

    if (transcripts && transcripts.length > 0) {
      const totalWords = transcripts.reduce((sum, t) => sum + (t.word_count || 0), 0);
      const avgWords = Math.round(totalWords / transcripts.length);
      const maxWords = Math.max(...transcripts.map(t => t.word_count || 0));
      const minWords = Math.min(...transcripts.map(t => t.word_count || 0));

      console.log(`   📝 Total transcripts: ${transcripts.length}`);
      console.log(`   📊 Total words: ${totalWords.toLocaleString()}`);
      console.log(`   📈 Average length: ${avgWords} words`);
      console.log(`   📏 Range: ${minWords} - ${maxWords} words`);
      
      // Processing status breakdown
      const statusCounts = transcripts.reduce((acc, t) => {
        acc[t.processing_status] = (acc[t.processing_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('\n📋 Processing Status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} transcripts`);
      });
    }
  } catch (error) {
    console.log('   ⚠️  Could not generate statistics');
  }
}

// Execute migration
migrateTranscriptData()
  .then(() => {
    console.log('\n✅ Transcript migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });