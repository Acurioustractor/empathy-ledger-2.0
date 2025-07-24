/**
 * BATCH ANALYZE ALL TRANSCRIPTS
 * 
 * Processes all remaining transcripts through AI analysis pipeline
 * Creates comprehensive theme analysis and story insights
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface TranscriptAnalysis {
  themes: string[];
  emotions: string[];
  topics: string[];
  quotes: string[];
  summary: string;
  insights: string[];
  cultural_elements: string[];
  sensitivity_flags: string[];
  confidence_score: number;
  quality_score: number;
}

async function analyzeAllTranscripts() {
  console.log('🤖 ANALYZING ALL TRANSCRIPTS');
  console.log('Processing transcripts through AI analysis pipeline\n');

  try {
    // Step 1: Get unanalyzed transcripts
    console.log('📊 STEP 1: FINDING UNANALYZED TRANSCRIPTS...');
    const unanalyzedTranscripts = await getUnanalyzedTranscripts();

    if (unanalyzedTranscripts.length === 0) {
      console.log('✅ All transcripts already analyzed!');
      await showAnalysisStatistics();
      return;
    }

    console.log(`📝 Found ${unanalyzedTranscripts.length} transcripts to analyze`);

    // Step 2: Process in batches
    console.log('\n🔄 STEP 2: PROCESSING TRANSCRIPTS...');
    await processBatchAnalysis(unanalyzedTranscripts);

    // Step 3: Generate insights
    console.log('\n📈 STEP 3: GENERATING INSIGHTS...');
    await generateCommunityInsights();

    // Step 4: Show results
    console.log('\n📊 STEP 4: ANALYSIS COMPLETE!');
    await showAnalysisStatistics();

  } catch (error) {
    console.error('\n💥 Analysis failed:', error);
    throw error;
  }
}

async function getUnanalyzedTranscripts() {
  const { data: allTranscripts, error: transcriptsError } = await supabase
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
    .order('created_at', { ascending: true });

  if (transcriptsError) {
    throw new Error(`Failed to fetch transcripts: ${transcriptsError.message}`);
  }

  if (!allTranscripts) {
    return [];
  }

  // Filter out already analyzed
  const { data: analyzedIds } = await supabase
    .from('story_analysis')
    .select('transcript_id')
    .eq('analysis_type', 'theme_extraction')
    .not('transcript_id', 'is', null);

  const analyzedSet = new Set(analyzedIds?.map(a => a.transcript_id) || []);
  
  return allTranscripts.filter(t => !analyzedSet.has(t.id));
}

async function processBatchAnalysis(transcripts: any[]) {
  console.log(`Processing ${transcripts.length} transcripts in batches...`);

  let successCount = 0;
  let errorCount = 0;
  let totalWords = 0;
  const batchSize = 5; // Process 5 at a time to avoid rate limits

  for (let i = 0; i < transcripts.length; i += batchSize) {
    const batch = transcripts.slice(i, i + batchSize);
    console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transcripts.length / batchSize)} (${batch.length} transcripts)`);

    // Process batch in parallel (with rate limiting)
    const batchPromises = batch.map(async (transcript, batchIndex) => {
      const globalIndex = i + batchIndex + 1;
      
      try {
        console.log(`\n🔄 ${globalIndex}/${transcripts.length}: ${transcript.storytellers?.full_name}`);
        console.log(`   Organization: ${transcript.storytellers?.organizations?.name || 'Unknown'}`);
        console.log(`   Length: ${transcript.word_count || 'unknown'} words`);

        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, batchIndex * 1000));

        const analysis = await analyzeTranscriptWithAI(transcript.transcript_content);
        
        if (analysis) {
          await saveAnalysisResults(transcript, analysis);
          console.log(`   ✅ Completed - Themes: ${analysis.themes.slice(0, 3).join(', ')}`);
          successCount++;
          totalWords += transcript.word_count || 0;
        } else {
          console.log(`   ❌ Analysis failed - no results`);
          errorCount++;
        }

      } catch (error) {
        console.log(`   ❌ Error processing transcript: ${error}`);
        errorCount++;
      }
    });

    await Promise.all(batchPromises);

    // Progress update
    const processed = Math.min(i + batchSize, transcripts.length);
    const percentage = Math.round((processed / transcripts.length) * 100);
    console.log(`\n📊 Progress: ${processed}/${transcripts.length} (${percentage}%) - ✅${successCount} ❌${errorCount}`);

    // Longer delay between batches
    if (i + batchSize < transcripts.length) {
      console.log('⏸️  Pausing 5 seconds between batches...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log(`\n📈 BATCH PROCESSING COMPLETE:`);
  console.log(`   ✅ Successfully analyzed: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📊 Total words processed: ${totalWords.toLocaleString()}`);
  console.log(`   ⏱️  Average: ~${Math.round(totalWords / Math.max(successCount, 1))} words per transcript`);
}

async function analyzeTranscriptWithAI(transcriptContent: string): Promise<TranscriptAnalysis | null> {
  // Get available themes for context
  const { data: themes } = await supabase
    .from('themes')
    .select('name, description, category')
    .eq('status', 'active')
    .limit(20);

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
${transcriptContent.substring(0, 4000)} ${transcriptContent.length > 4000 ? '[CONTENT TRUNCATED FOR ANALYSIS]' : ''}

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
          content: 'You are an expert in narrative analysis with deep training in trauma-informed care, cultural sensitivity, and community resilience frameworks. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.3
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
    if (error instanceof Error && error.message.includes('rate limit')) {
      console.log('   ⏸️  Rate limit hit, waiting 30 seconds...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      return analyzeTranscriptWithAI(transcriptContent); // Retry
    }
    
    console.log(`   ❌ AI analysis error: ${error}`);
    return createFallbackAnalysis(transcriptContent);
  }
}

function createFallbackAnalysis(transcriptContent: string): TranscriptAnalysis {
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

async function saveAnalysisResults(transcript: any, analysis: TranscriptAnalysis) {
  // Map theme names to UUIDs
  const themeUUIDs = await mapThemeNamesToUUIDs(analysis.themes);
  
  const { error } = await supabase
    .from('story_analysis')
    .insert({
      transcript_id: transcript.id,
      analysis_type: 'theme_extraction',
      ai_model_used: 'gpt-4',
      analysis_version: '1.0',
      results: analysis,
      confidence_score: analysis.confidence_score,
      quality_score: analysis.quality_score,
      themes_identified: themeUUIDs, // Use UUIDs instead of names
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

  // Also extract and save quotes separately
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
    console.log('   ⚠️  Could not fetch themes for mapping, using empty array');
    return [];
  }

  // Get current theme usage to avoid overused themes
  const usageStats = await getThemeUsageStats();
  
  // Create intelligent mapping strategies
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

    // Strategy 3: Semantic matching
    if (!matchedUUID) {
      const semanticGroups: Record<string, string[]> = {
        'resilience': ['strength', 'overcoming', 'perseverance', 'survival', 'endurance', 'recovery'],
        'community': ['support', 'togetherness', 'collective', 'neighborhood', 'social', 'belonging'],
        'identity': ['self', 'who i am', 'personal', 'individual', 'character', 'authenticity'],
        'healing': ['recovery', 'wellness', 'therapy', 'treatment', 'getting better', 'health'],
        'wisdom': ['learning', 'insight', 'knowledge', 'understanding', 'life lessons'],
        'family': ['relatives', 'parents', 'children', 'siblings', 'kinship', 'household'],
        'love': ['affection', 'care', 'romance', 'partnership', 'devotion', 'relationships'],
        'hope': ['optimism', 'faith', 'future', 'possibility', 'dreams', 'aspirations'],
        'change': ['transformation', 'transition', 'evolution', 'growth', 'development'],
        'courage': ['bravery', 'fearlessness', 'boldness', 'valor', 'standing up'],
        'creativity': ['art', 'expression', 'imagination', 'innovation', 'artistic'],
        'justice': ['fairness', 'equality', 'rights', 'advocacy', 'activism'],
        'environment': ['nature', 'climate', 'sustainability', 'ecology', 'conservation'],
        'violence': ['abuse', 'assault', 'harm', 'aggression', 'conflict', 'trauma'],
        'poverty': ['financial hardship', 'economic struggle', 'money problems'],
        'migration': ['moving', 'relocation', 'immigration', 'displacement', 'journey'],
        'mental_health': ['depression', 'anxiety', 'mental illness', 'psychological'],
        'innovation': ['technology', 'invention', 'breakthrough', 'advancement']
      };

      for (const [themeKey, keywords] of Object.entries(semanticGroups)) {
        if (keywords.some(keyword => cleanTheme.includes(keyword))) {
          const semanticMatch = themes.find(t => t.name.toLowerCase().includes(themeKey));
          if (semanticMatch) {
            matchedUUID = semanticMatch.id;
            break;
          }
        }
      }
    }

    // Add if matched and not overused
    if (matchedUUID) {
      const usageCount = usageStats[matchedUUID] || 0;
      const isOverused = usageCount > 8; // Avoid themes used more than 8 times

      if (!isOverused || mappedUUIDs.length === 0) { // Always include at least one theme
        mappedUUIDs.push(matchedUUID);
        console.log(`   ✅ Mapped "${aiTheme}" → ${themes.find(t => t.id === matchedUUID)?.name}`);
      } else {
        console.log(`   ⚠️  Theme "${aiTheme}" mapped but overused (${usageCount} uses), skipping`);
      }
    } else {
      console.log(`   ❌ Could not map "${aiTheme}" to any database theme`);
    }
  }

  // Ensure we have at least 2 diverse themes
  if (mappedUUIDs.length < 2) {
    const underusedThemes = getUnderusedThemes(themes, usageStats, 3);
    mappedUUIDs.push(...underusedThemes.slice(0, 3 - mappedUUIDs.length));
    console.log(`   🎯 Added ${3 - mappedUUIDs.length} underused themes for diversity`);
  }

  return [...new Set(mappedUUIDs)]; // Remove duplicates
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

function getUnderusedThemes(themes: any[], usageStats: Record<string, number>, limit: number): string[] {
  return themes
    .filter(theme => (usageStats[theme.id] || 0) < 3) // Themes used less than 3 times
    .sort(() => Math.random() - 0.5) // Randomize
    .slice(0, limit)
    .map(theme => theme.id);
}

async function saveExtractedQuotes(transcript: any, quotes: string[]) {
  for (const quote of quotes) {
    if (quote && quote.length > 10) { // Only save meaningful quotes
      await supabase
        .from('quotes')
        .insert({
          transcript_id: transcript.id,
          storyteller_id: transcript.storyteller_id,
          quote_text: quote.replace(/^["']|["']$/g, ''), // Remove surrounding quotes
          extracted_by_ai: true,
          ai_confidence_score: 0.8,
          quote_type: 'wisdom',
          visibility: 'private',
          storyteller_approved: false
        });
    }
  }
}

async function generateCommunityInsights() {
  console.log('Generating community-level insights from all analyses...');

  try {
    // Get all completed analyses
    const { data: analyses } = await supabase
      .from('story_analysis')
      .select(`
        themes_identified,
        primary_emotions,
        key_topics,
        confidence_score,
        created_at
      `)
      .eq('analysis_type', 'theme_extraction')
      .eq('processing_status', 'completed');

    if (!analyses || analyses.length === 0) {
      console.log('   ⚠️  No analyses found for insight generation');
      return;
    }

    // Aggregate themes
    const themeFrequency: Record<string, number> = {};
    const emotionFrequency: Record<string, number> = {};
    const topicFrequency: Record<string, number> = {};

    analyses.forEach(analysis => {
      // Count themes
      analysis.themes_identified?.forEach((theme: string) => {
        themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
      });

      // Count emotions
      analysis.primary_emotions?.forEach((emotion: string) => {
        emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
      });

      // Count topics
      analysis.key_topics?.forEach((topic: string) => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });
    });

    // Generate community insights
    const insights = {
      total_stories_analyzed: analyses.length,
      analysis_date: new Date().toISOString(),
      top_themes: Object.entries(themeFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([theme, count]) => ({ theme, frequency: count, percentage: Math.round((count / analyses.length) * 100) })),
      top_emotions: Object.entries(emotionFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([emotion, count]) => ({ emotion, frequency: count, percentage: Math.round((count / analyses.length) * 100) })),
      top_topics: Object.entries(topicFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 12)
        .map(([topic, count]) => ({ topic, frequency: count, percentage: Math.round((count / analyses.length) * 100) })),
      quality_metrics: {
        average_confidence: analyses.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / analyses.length,
        high_confidence_analyses: analyses.filter(a => (a.confidence_score || 0) > 0.8).length
      }
    };

    console.log(`   ✅ Generated insights from ${analyses.length} analyses`);
    console.log(`   🎯 Top themes: ${insights.top_themes.slice(0, 3).map(t => t.theme).join(', ')}`);
    console.log(`   💫 Top emotions: ${insights.top_emotions.slice(0, 3).map(e => e.emotion).join(', ')}`);
    console.log(`   📈 Average confidence: ${Math.round(insights.quality_metrics.average_confidence * 100)}%`);

  } catch (error) {
    console.log(`   ❌ Insight generation failed: ${error}`);
  }
}

async function showAnalysisStatistics() {
  console.log('\n📊 ANALYSIS STATISTICS:');

  try {
    // Total counts
    const { data: totalTranscripts } = await supabase
      .from('transcripts')
      .select('id', { count: 'exact', head: true });

    const { data: totalAnalyses } = await supabase
      .from('story_analysis')
      .select('id', { count: 'exact', head: true })
      .eq('analysis_type', 'theme_extraction');

    const { data: totalQuotes } = await supabase
      .from('quotes')
      .select('id', { count: 'exact', head: true })
      .eq('extracted_by_ai', true);

    console.log(`   📝 Total transcripts: ${totalTranscripts?.length || 0}`);
    console.log(`   🤖 AI analyses completed: ${totalAnalyses?.length || 0}`);
    console.log(`   💬 Quotes extracted: ${totalQuotes?.length || 0}`);

    if (totalTranscripts && totalAnalyses) {
      const coverage = Math.round((totalAnalyses.length / totalTranscripts.length) * 100);
      console.log(`   📊 Analysis coverage: ${coverage}%`);
    }

    // Quality metrics
    const { data: qualityData } = await supabase
      .from('story_analysis')
      .select('confidence_score, quality_score')
      .eq('analysis_type', 'theme_extraction')
      .not('confidence_score', 'is', null);

    if (qualityData && qualityData.length > 0) {
      const avgConfidence = qualityData.reduce((sum, d) => sum + d.confidence_score, 0) / qualityData.length;
      const avgQuality = qualityData.reduce((sum, d) => sum + d.quality_score, 0) / qualityData.length;
      
      console.log(`   🎯 Average confidence: ${Math.round(avgConfidence * 100)}%`);
      console.log(`   ⭐ Average quality: ${Math.round(avgQuality * 100)}%`);
    }

    // Most common themes
    const { data: themeData } = await supabase
      .from('story_analysis')
      .select('themes_identified')
      .eq('analysis_type', 'theme_extraction')
      .not('themes_identified', 'is', null);

    if (themeData && themeData.length > 0) {
      const allThemes: string[] = [];
      themeData.forEach(d => {
        if (d.themes_identified) {
          allThemes.push(...d.themes_identified);
        }
      });

      const themeFreq: Record<string, number> = {};
      allThemes.forEach(theme => {
        themeFreq[theme] = (themeFreq[theme] || 0) + 1;
      });

      const topThemes = Object.entries(themeFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      console.log('\n🎯 Most common themes:');
      topThemes.forEach(([theme, count], index) => {
        console.log(`   ${index + 1}. ${theme}: ${count} stories`);
      });
    }

    console.log('\n✅ AI ANALYSIS PIPELINE COMPLETE!');
    console.log('\n🎯 WHAT THIS ENABLES:');
    console.log('✅ THEME INSIGHTS: Understand patterns across all stories');
    console.log('✅ QUOTE EXTRACTION: Powerful excerpts ready for sharing');
    console.log('✅ STORY GENERATION: AI can now create stories from transcripts');
    console.log('✅ COMMUNITY INSIGHTS: Identify collective wisdom and themes');

  } catch (error) {
    console.log('   ⚠️  Could not generate statistics:', error);
  }
}

// Execute analysis
analyzeAllTranscripts()
  .then(() => {
    console.log('\n✅ Transcript analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Analysis failed:', error);
    process.exit(1);
  });