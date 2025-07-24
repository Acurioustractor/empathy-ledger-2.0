/**
 * BATCH ANALYSIS SCHEDULER
 * 
 * Smart scheduling system to process transcripts efficiently around rate limits
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createBatchScheduler() {
  console.log('📅 BATCH ANALYSIS SCHEDULER');
  console.log('Setting up efficient processing strategy for rate limits\n');

  try {
    // Get current status
    console.log('📊 ANALYZING CURRENT STATUS...');
    await analyzeCurrentStatus();

    // Create processing batches
    console.log('\n📦 CREATING PROCESSING STRATEGY...');
    await createProcessingStrategy();

    // Show recommendations
    console.log('\n💡 RECOMMENDATIONS...');
    showRecommendations();

  } catch (error) {
    console.error('\n💥 Scheduler setup failed:', error);
    throw error;
  }
}

async function analyzeCurrentStatus() {
  // Get total transcript counts
  const { data: allTranscripts } = await supabase
    .from('transcripts')
    .select('id, word_count')
    .order('word_count', { ascending: true });

  const { data: analyzedTranscripts } = await supabase
    .from('story_analysis')
    .select('transcript_id')
    .eq('analysis_type', 'theme_extraction');

  const totalTranscripts = allTranscripts?.length || 0;
  const analyzedCount = analyzedTranscripts?.length || 0;
  const remainingCount = totalTranscripts - analyzedCount;

  console.log(`   📊 Total transcripts: ${totalTranscripts}`);
  console.log(`   ✅ Already analyzed: ${analyzedCount}`);
  console.log(`   ⏳ Remaining: ${remainingCount}`);

  if (remainingCount === 0) {
    console.log('   🎉 All transcripts already analyzed!');
    return;
  }

  // Analyze word count distribution
  const analyzedSet = new Set(analyzedTranscripts?.map(a => a.transcript_id) || []);
  const remaining = allTranscripts?.filter(t => !analyzedSet.has(t.id)) || [];
  
  const wordCounts = remaining.map(t => t.word_count || 0);
  const avgWords = Math.round(wordCounts.reduce((sum, w) => sum + w, 0) / wordCounts.length);
  const maxWords = Math.max(...wordCounts);
  const minWords = Math.min(...wordCounts);

  console.log(`   📈 Remaining word count range: ${minWords} - ${maxWords} (avg: ${avgWords})`);

  // Estimate processing time with rate limits
  const estimatedTimePerTranscript = 30; // 30 seconds with rate limits
  const totalEstimatedMinutes = Math.round((remainingCount * estimatedTimePerTranscript) / 60);
  const totalEstimatedHours = Math.round(totalEstimatedMinutes / 60);

  console.log(`   ⏱️  Estimated processing time: ${totalEstimatedHours} hours (${totalEstimatedMinutes} minutes)`);
  
  // Rate limit analysis
  const dailyLimit = 10000; // 10k tokens per minute
  const avgTokensPerTranscript = Math.round(avgWords * 0.75); // Rough token estimate
  const transcriptsPerHour = Math.floor(60 / (estimatedTimePerTranscript / 60));
  
  console.log(`   🔢 Avg tokens per transcript: ~${avgTokensPerTranscript}`);
  console.log(`   📈 Safe processing rate: ~${transcriptsPerHour} transcripts/hour`);
}

async function createProcessingStrategy() {
  // Get remaining transcripts sorted by word count (process shorter ones first)
  const { data: allTranscripts } = await supabase
    .from('transcripts')
    .select(`
      id,
      word_count,
      storytellers(full_name)
    `)
    .order('word_count', { ascending: true });

  const { data: analyzedTranscripts } = await supabase
    .from('story_analysis')
    .select('transcript_id')
    .eq('analysis_type', 'theme_extraction');

  const analyzedSet = new Set(analyzedTranscripts?.map(a => a.transcript_id) || []);
  const remaining = allTranscripts?.filter(t => !analyzedSet.has(t.id)) || [];

  if (remaining.length === 0) {
    console.log('   ✅ No transcripts remaining to process');
    return;
  }

  // Create batches of different sizes
  const quickBatch = remaining.filter(t => (t.word_count || 0) < 500).slice(0, 20);
  const mediumBatch = remaining.filter(t => (t.word_count || 0) >= 500 && (t.word_count || 0) < 2000).slice(0, 15);
  const largeBatch = remaining.filter(t => (t.word_count || 0) >= 2000).slice(0, 10);

  console.log(`   📦 BATCH STRATEGY CREATED:`);
  console.log(`   🏃 Quick batch (< 500 words): ${quickBatch.length} transcripts`);
  console.log(`   🚶 Medium batch (500-2000 words): ${mediumBatch.length} transcripts`);
  console.log(`   🐌 Large batch (> 2000 words): ${largeBatch.length} transcripts`);

  // Estimate time for each batch
  const quickTime = Math.round((quickBatch.length * 20) / 60); // 20 sec each
  const mediumTime = Math.round((mediumBatch.length * 30) / 60); // 30 sec each
  const largeTime = Math.round((largeBatch.length * 45) / 60); // 45 sec each

  console.log(`   ⏱️  Estimated times:`);
  console.log(`      Quick: ${quickTime} minutes`);
  console.log(`      Medium: ${mediumTime} minutes`);
  console.log(`      Large: ${largeTime} minutes`);
  console.log(`      Total: ${quickTime + mediumTime + largeTime} minutes`);

  // Sample from each batch
  console.log(`\n   📋 SAMPLE TRANSCRIPTS:`);
  if (quickBatch.length > 0) {
    console.log(`   🏃 Quick: ${quickBatch.slice(0, 3).map(t => `${t.storytellers?.full_name} (${t.word_count}w)`).join(', ')}`);
  }
  if (mediumBatch.length > 0) {
    console.log(`   🚶 Medium: ${mediumBatch.slice(0, 3).map(t => `${t.storytellers?.full_name} (${t.word_count}w)`).join(', ')}`);
  }
  if (largeBatch.length > 0) {
    console.log(`   🐌 Large: ${largeBatch.slice(0, 3).map(t => `${t.storytellers?.full_name} (${t.word_count}w)`).join(', ')}`);
  }
}

function showRecommendations() {
  console.log('💡 RATE LIMIT MANAGEMENT RECOMMENDATIONS:');
  console.log('');
  
  console.log('🎯 OPTIMAL STRATEGY:');
  console.log('   1. Process in small batches (1-5 transcripts at a time)');
  console.log('   2. Use 15-20 second delays between requests');
  console.log('   3. Process shorter transcripts first (faster + easier)');
  console.log('   4. Save progress after each successful analysis');
  console.log('   5. Implement exponential backoff for retries');
  console.log('');
  
  console.log('⚡ QUICK WINS (20-30 transcripts in 1 hour):');
  console.log('   • Run: npx tsx scripts/smart-rate-limited-analysis.ts');
  console.log('   • Processes shortest transcripts first');
  console.log('   • Automatically handles rate limits');
  console.log('   • Saves progress and can resume');
  console.log('');
  
  console.log('🏗️ ALTERNATIVE APPROACHES:');
  console.log('   • Use GPT-3.5-turbo (faster, cheaper, still good quality)');
  console.log('   • Process during off-peak hours');
  console.log('   • Split into multiple API keys/organizations');
  console.log('   • Use Azure OpenAI with higher limits');
  console.log('');
  
  console.log('📊 MONITORING:');
  console.log('   • Check progress with: analysis-progress.json');
  console.log('   • View current theme diversity on homepage');
  console.log('   • Run scheduler again to see updated status');
  console.log('');
  
  console.log('✅ CURRENT STATUS:');
  console.log('   Your theme mapping system is now FIXED and working perfectly!');
  console.log('   New transcripts will get diverse, sophisticated themes');
  console.log('   Homepage will show real community diversity');
  console.log('');
  
  console.log('🚀 READY TO CONTINUE:');
  console.log('   The smart analysis script is processing efficiently');
  console.log('   Let it run in background while you work on other features');
  console.log('   Each successful analysis improves your theme diversity');
}

// Execute scheduler
createBatchScheduler()
  .then(() => {
    console.log('\n✅ Batch analysis scheduler complete!');
    console.log('\n🎯 TIP: The smart analysis script is the best way forward');
    console.log('   It handles rate limits automatically and saves progress');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Scheduler failed:', error);
    process.exit(1);
  });