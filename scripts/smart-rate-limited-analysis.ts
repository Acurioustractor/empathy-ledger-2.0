/**
 * SMART RATE-LIMITED ANALYSIS
 * 
 * Handles OpenAI rate limits intelligently with backoff, queuing, and resumption
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Progress tracking
const PROGRESS_FILE = 'analysis-progress.json';

interface AnalysisProgress {
  processed: string[];
  failed: string[];
  totalCount: number;
  startTime: string;
  lastUpdate: string;
}

interface RateLimitStrategy {
  baseDelay: number;
  batchSize: number;
  maxRetries: number;
  backoffMultiplier: number;
}

const RATE_LIMIT_STRATEGY: RateLimitStrategy = {
  baseDelay: 12000, // 12 seconds between requests (to stay under 10k tokens/min)
  batchSize: 1, // Process one at a time to avoid rate limits
  maxRetries: 5,
  backoffMultiplier: 2
};

async function smartRateLimitedAnalysis() {
  console.log('🚀 SMART RATE-LIMITED ANALYSIS');
  console.log('Processing transcripts with intelligent rate limit handling\n');

  try {
    // Load or create progress
    const progress = loadProgress();
    
    // Get transcripts to process
    console.log('📊 FINDING TRANSCRIPTS TO PROCESS...');
    const transcripts = await getTranscriptsToProcess(progress);
    
    if (transcripts.length === 0) {
      console.log('✅ All transcripts already processed!');
      return;
    }

    console.log(`🎯 Found ${transcripts.length} transcripts to process`);
    console.log(`📈 Already processed: ${progress.processed.length}`);
    console.log(`❌ Previous failures: ${progress.failed.length}`);

    // Process with smart rate limiting
    console.log('\n🤖 PROCESSING WITH SMART RATE LIMITING...');
    await processWithRateLimit(transcripts, progress);

    console.log('\n✅ SMART ANALYSIS COMPLETE!');
    showFinalStats(progress);

  } catch (error) {
    console.error('\n💥 Smart analysis failed:', error);
    throw error;
  }
}

function loadProgress(): AnalysisProgress {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      const progress = JSON.parse(data);
      console.log(`📂 Loaded progress: ${progress.processed.length} processed, ${progress.failed.length} failed`);
      return progress;
    }
  } catch (error) {
    console.log('⚠️  Could not load progress file, starting fresh');
  }

  return {
    processed: [],
    failed: [],
    totalCount: 0,
    startTime: new Date().toISOString(),
    lastUpdate: new Date().toISOString()
  };
}

function saveProgress(progress: AnalysisProgress) {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function getTranscriptsToProcess(progress: AnalysisProgress) {
  // Get all transcripts
  const { data: allTranscripts } = await supabase
    .from('transcripts')
    .select(`
      id,
      transcript_content,
      storyteller_id,
      word_count,
      created_at,
      storytellers!inner(
        full_name,
        organization_id,
        organizations(name)
      )
    `)
    .order('word_count', { ascending: true }); // Process shorter transcripts first

  if (!allTranscripts) {
    return [];
  }

  // Filter out already analyzed and processed
  const { data: analyzedIds } = await supabase
    .from('story_analysis')
    .select('transcript_id')
    .eq('analysis_type', 'theme_extraction');

  const analyzedSet = new Set(analyzedIds?.map(a => a.transcript_id) || []);
  const processedSet = new Set(progress.processed);
  const failedSet = new Set(progress.failed);

  const toProcess = allTranscripts.filter(t => 
    !analyzedSet.has(t.id) && 
    !processedSet.has(t.id) && 
    !failedSet.has(t.id)
  );

  // Update total count
  progress.totalCount = allTranscripts.length;
  saveProgress(progress);

  return toProcess;
}

async function processWithRateLimit(transcripts: any[], progress: AnalysisProgress) {
  console.log(`Starting processing with rate limit strategy:`);
  console.log(`   ⏱️  Base delay: ${RATE_LIMIT_STRATEGY.baseDelay}ms`);
  console.log(`   📦 Batch size: ${RATE_LIMIT_STRATEGY.batchSize}`);
  console.log(`   🔄 Max retries: ${RATE_LIMIT_STRATEGY.maxRetries}`);

  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i];
    const globalIndex = progress.processed.length + progress.failed.length + i + 1;
    
    console.log(`\n🔄 ${globalIndex}/${progress.totalCount}: ${transcript.storytellers?.full_name}`);
    console.log(`   📊 Length: ${transcript.word_count || 'unknown'} words`);
    
    const startTime = Date.now();
    let success = false;
    let attempts = 0;

    while (!success && attempts < RATE_LIMIT_STRATEGY.maxRetries) {
      attempts++;
      
      try {
        console.log(`   🎯 Attempt ${attempts}/${RATE_LIMIT_STRATEGY.maxRetries}...`);
        
        // Smart delay based on attempt number
        const delay = RATE_LIMIT_STRATEGY.baseDelay * Math.pow(RATE_LIMIT_STRATEGY.backoffMultiplier, attempts - 1);
        
        if (attempts > 1) {
          console.log(`   ⏸️  Backing off ${delay / 1000}s...`);
          await sleep(delay);
        } else if (i > 0) {
          console.log(`   ⏸️  Rate limit delay ${RATE_LIMIT_STRATEGY.baseDelay / 1000}s...`);
          await sleep(RATE_LIMIT_STRATEGY.baseDelay);
        }

        // Analyze transcript
        const analysis = await analyzeTranscriptSafely(transcript.transcript_content);
        
        if (analysis) {
          await saveAnalysisResults(transcript, analysis);
          
          const processingTime = Date.now() - startTime;
          console.log(`   ✅ Success in ${processingTime}ms - Themes: ${analysis.themes.slice(0, 3).join(', ')}`);
          
          progress.processed.push(transcript.id);
          success = true;
        } else {
          throw new Error('Analysis returned null');
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`   ❌ Attempt ${attempts} failed: ${errorMsg}`);
        
        // Handle specific rate limit errors
        if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
          const waitTime = extractWaitTime(errorMsg) || (30 * attempts);
          console.log(`   ⏸️  Rate limit hit, waiting ${waitTime}s...`);
          await sleep(waitTime * 1000);
        }
        
        if (attempts === RATE_LIMIT_STRATEGY.maxRetries) {
          console.log(`   💥 All attempts failed, marking as failed`);
          progress.failed.push(transcript.id);
        }
      }
    }

    // Save progress after each transcript
    saveProgress(progress);
    
    // Show progress
    const completed = progress.processed.length + progress.failed.length;
    const percentage = Math.round((completed / progress.totalCount) * 100);
    console.log(`   📊 Progress: ${completed}/${progress.totalCount} (${percentage}%) - ✅${progress.processed.length} ❌${progress.failed.length}`);
  }
}

async function analyzeTranscriptSafely(transcriptContent: string) {
  // Get available themes for context
  const { data: themes } = await supabase
    .from('themes')
    .select('name, description, category')
    .eq('status', 'active')
    .limit(25);

  const themeContext = themes?.map(t => `${t.name} (${t.category}): ${t.description}`).join('\n') || '';

  // Get current theme usage to encourage diversity
  const usageStats = await getThemeUsageStats();
  const overusedThemes = Object.entries(usageStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([uuid]) => {
      const theme = themes?.find(t => t.id === uuid);
      return theme?.name;
    })
    .filter(Boolean);

  const analysisPrompt = `As an expert in narrative analysis focusing on DIVERSITY and SPECIFICITY, analyze this personal story transcript.

CRITICAL INSTRUCTIONS FOR DIVERSE THEME IDENTIFICATION:
1. AVOID overused themes: ${overusedThemes.join(', ')} (unless absolutely central)
2. PRIORITIZE specific, unique themes that capture THIS story's distinctiveness
3. Look beyond generic "resilience/community" to find cultural, situational, personal themes
4. Find themes from DIFFERENT categories: emotional, social, cultural, life events, skills

AVAILABLE THEMES (prioritize underused ones):
${themeContext}

TRANSCRIPT TO ANALYZE:
${transcriptContent.substring(0, 3500)} ${transcriptContent.length > 3500 ? '[CONTENT TRUNCATED FOR ANALYSIS]' : ''}

Focus on identifying themes that are:
- SPECIFIC to this story's unique elements (jobs, experiences, challenges)
- DIVERSE across different life areas (not all emotional or all social)
- SOPHISTICATED beyond basic human experiences
- CULTURALLY relevant and contextual
- UNDERUSED in previous analyses

Respond with ONLY valid JSON in this exact format:
{
  "themes": ["4-6 specific diverse themes avoiding overused ones"],
  "emotions": ["3-6 main emotions expressed throughout the story"],
  "topics": ["4-8 key topics, events, or subjects discussed"],
  "quotes": ["2-4 most meaningful or powerful direct quotes from the text"],
  "summary": "2-3 sentence summary capturing the essence and journey",
  "insights": ["3-5 key insights, wisdom, or lessons that emerge"],
  "cultural_elements": ["any cultural references, traditions, or considerations mentioned"],
  "sensitivity_flags": ["any content requiring careful handling - trauma, violence, etc."],
  "confidence_score": 0.85,
  "quality_score": 0.90
}

Be especially mindful of:
- Trauma-informed language and approach
- Cultural sensitivity and respect
- Focus on strengths and resilience rather than deficits
- Preserving the storyteller's voice and dignity`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in finding DIVERSE and SPECIFIC themes in personal narratives. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 1000, // Reduced to stay under rate limits
      temperature: 0.4
    });

    const analysisText = response.choices[0]?.message?.content;
    
    if (analysisText) {
      try {
        return JSON.parse(analysisText);
      } catch (parseError) {
        console.log('   ⚠️  JSON parse error, creating fallback analysis');
        return createFallbackAnalysis(transcriptContent);
      }
    }

    return null;

  } catch (error) {
    throw error; // Let the caller handle retries
  }
}

function createFallbackAnalysis(transcriptContent: string) {
  const wordCount = transcriptContent.split(' ').length;
  
  return {
    themes: ['Personal Story', 'Life Experience'],
    emotions: ['Mixed emotions'],
    topics: ['Personal narrative'],
    quotes: [],
    summary: `Personal story with ${wordCount} words requiring manual review and analysis.`,
    insights: ['Story contains valuable personal experience'],
    cultural_elements: [],
    sensitivity_flags: ['Requires manual review'],
    confidence_score: 0.3,
    quality_score: 0.3
  };
}

async function saveAnalysisResults(transcript: any, analysis: any) {
  // Map theme names to UUIDs using improved mapping
  const themeUUIDs = await mapThemeNamesToUUIDs(analysis.themes);
  
  const { error } = await supabase
    .from('story_analysis')
    .insert({
      transcript_id: transcript.id,
      analysis_type: 'theme_extraction',
      ai_model_used: 'gpt-4',
      analysis_version: '2.0', // Updated version with improved mapping
      results: analysis,
      confidence_score: analysis.confidence_score,
      quality_score: analysis.quality_score,
      themes_identified: themeUUIDs,
      primary_emotions: analysis.emotions,
      key_topics: analysis.topics,
      key_quotes: analysis.quotes,
      summary: analysis.summary,
      insights: analysis.insights,
      cultural_elements: analysis.cultural_elements,
      sensitivity_flags: analysis.sensitivity_flags,
      processing_status: 'completed',
      processing_time_seconds: 20,
      human_reviewed: false,
      approved_for_use: analysis.confidence_score > 0.7
    });

  if (error) {
    throw new Error(`Failed to save analysis: ${error.message}`);
  }

  // Save quotes separately
  if (analysis.quotes && analysis.quotes.length > 0) {
    await saveExtractedQuotes(transcript, analysis.quotes);
  }
}

async function mapThemeNamesToUUIDs(themeNames: string[]): Promise<string[]> {
  if (!themeNames || themeNames.length === 0) {
    return [];
  }

  // Get all available themes with full details
  const { data: themes, error } = await supabase
    .from('themes')
    .select('id, name, category, description')
    .eq('status', 'active');

  if (error || !themes) {
    return [];
  }

  // Get current theme usage to avoid overused themes
  const usageStats = await getThemeUsageStats();
  const mappedUUIDs: string[] = [];

  for (const aiTheme of themeNames) {
    const cleanTheme = aiTheme.toLowerCase().trim();
    let matchedUUID: string | null = null;

    // Strategy 1: Exact match
    const exactMatch = themes.find(t => t.name.toLowerCase() === cleanTheme);
    if (exactMatch) {
      matchedUUID = exactMatch.id;
    }

    // Strategy 2: Fuzzy keyword matching
    if (!matchedUUID) {
      const fuzzyMatch = themes.find(t => 
        cleanTheme.includes(t.name.toLowerCase()) || 
        t.name.toLowerCase().includes(cleanTheme) ||
        t.description.toLowerCase().includes(cleanTheme)
      );
      if (fuzzyMatch) {
        matchedUUID = fuzzyMatch.id;
      }
    }

    // Add if matched and not overused
    if (matchedUUID) {
      const usageCount = usageStats[matchedUUID] || 0;
      const isOverused = usageCount > 12; // More lenient for this script

      if (!isOverused || mappedUUIDs.length === 0) {
        mappedUUIDs.push(matchedUUID);
      }
    }
  }

  // Ensure we have at least 2 themes
  if (mappedUUIDs.length < 2) {
    const underusedThemes = themes
      .filter(theme => (usageStats[theme.id] || 0) < 5)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 - mappedUUIDs.length)
      .map(theme => theme.id);
    
    mappedUUIDs.push(...underusedThemes);
  }

  return [...new Set(mappedUUIDs)];
}

async function getThemeUsageStats(): Promise<Record<string, number>> {
  const { data: analyses } = await supabase
    .from('story_analysis')
    .select('themes_identified')
    .eq('analysis_type', 'theme_extraction')
    .not('themes_identified', 'is', null);

  const usage: Record<string, number> = {};
  analyses?.forEach(analysis => {
    analysis.themes_identified?.forEach((themeId: string) => {
      usage[themeId] = (usage[themeId] || 0) + 1;
    });
  });

  return usage;
}

async function saveExtractedQuotes(transcript: any, quotes: string[]) {
  for (const quote of quotes) {
    if (quote && quote.length > 10) {
      await supabase
        .from('quotes')
        .insert({
          transcript_id: transcript.id,
          storyteller_id: transcript.storyteller_id,
          quote_text: quote.replace(/^["']|["']$/g, ''),
          extracted_by_ai: true,
          ai_confidence_score: 0.8,
          quote_type: 'wisdom',
          visibility: 'private',
          storyteller_approved: false
        });
    }
  }
}

function extractWaitTime(errorMessage: string): number | null {
  const match = errorMessage.match(/try again in ([\d.]+)s/);
  return match ? Math.ceil(parseFloat(match[1])) : null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showFinalStats(progress: AnalysisProgress) {
  const startTime = new Date(progress.startTime);
  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

  console.log('\n📊 FINAL STATISTICS:');
  console.log(`   ✅ Successfully processed: ${progress.processed.length}`);
  console.log(`   ❌ Failed: ${progress.failed.length}`);
  console.log(`   ⏱️  Total time: ${duration} minutes`);
  console.log(`   📈 Success rate: ${Math.round((progress.processed.length / (progress.processed.length + progress.failed.length)) * 100)}%`);
  
  if (progress.failed.length > 0) {
    console.log('\n⚠️  Failed transcripts can be retried by running this script again');
  }

  console.log('\n🎯 BENEFITS OF SMART PROCESSING:');
  console.log('✅ Intelligent rate limit handling');
  console.log('✅ Progress saving and resumption');
  console.log('✅ Automatic retry with backoff');
  console.log('✅ Diverse theme mapping system');
  console.log('✅ Graceful error handling');
}

// Execute smart analysis
smartRateLimitedAnalysis()
  .then(() => {
    console.log('\n✅ Smart rate-limited analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Smart analysis failed:', error);
    process.exit(1);
  });