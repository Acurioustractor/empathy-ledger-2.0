/**
 * DEEP THEME ANALYSIS
 * 
 * Examines specific transcript content vs AI-identified themes
 * to understand the sophistication gap
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deepThemeAnalysis() {
  console.log('🔬 DEEP THEME ANALYSIS');
  console.log('Examining transcript richness vs AI theme identification\n');

  try {
    // Get samples with full content
    console.log('📖 STEP 1: ANALYZING RICH TRANSCRIPT CONTENT...');
    await analyzeRichTranscripts();

    // Check the theme mapping issue
    console.log('\n🔗 STEP 2: INVESTIGATING THEME MAPPING ISSUES...');
    await investigateThemeMapping();

    // Look at actual content patterns
    console.log('\n📝 STEP 3: CONTENT PATTERN ANALYSIS...');
    await analyzeContentPatterns();

  } catch (error) {
    console.error('\n💥 Deep analysis failed:', error);
    throw error;
  }
}

async function analyzeRichTranscripts() {
  // Get transcripts with substantial content
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      id,
      transcript_content,
      word_count,
      storytellers(full_name, organization_id, organizations(name)),
      story_analysis!transcript_id(
        themes_identified,
        results,
        confidence_score
      )
    `)
    .gte('word_count', 1000)
    .order('word_count', { ascending: false })
    .limit(5);

  if (error || !transcripts) {
    console.log('❌ Could not fetch rich transcripts:', error?.message);
    return;
  }

  console.log(`✅ Analyzing ${transcripts.length} substantial transcripts\n`);

  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i];
    console.log(`\n=== TRANSCRIPT ${i + 1} ===`);
    console.log(`Storyteller: ${transcript.storytellers?.full_name || 'Unknown'}`);
    console.log(`Organization: ${transcript.storytellers?.organizations?.name || 'Unknown'}`);
    console.log(`Word count: ${transcript.word_count}`);

    // Extract key content patterns
    const content = transcript.transcript_content || '';
    console.log(`\n📝 Content Analysis:`);
    
    // Look for specific themes that might be missed
    const themeIndicators = analyzeContentForThemes(content);
    console.log(`Potential themes in content:`, themeIndicators);

    // Show what AI actually identified
    const analysis = transcript.story_analysis?.[0];
    if (analysis) {
      console.log(`\n🤖 AI Identified:`);
      console.log(`   Themes: ${JSON.stringify(analysis.themes_identified)}`);
      console.log(`   Confidence: ${analysis.confidence_score}`);
      
      if (analysis.results && typeof analysis.results === 'object') {
        const results = analysis.results as any;
        if (results.themes) {
          console.log(`   AI Theme Names: ${JSON.stringify(results.themes)}`);
        }
      }
    } else {
      console.log(`\n❌ No AI analysis found for this transcript`);
    }

    // Compare richness
    console.log(`\n📊 Richness vs AI Themes:`);
    console.log(`   Content indicators found: ${themeIndicators.length}`);
    console.log(`   AI themes assigned: ${analysis?.themes_identified?.length || 0}`);
    
    if (themeIndicators.length > (analysis?.themes_identified?.length || 0)) {
      console.log(`   ⚠️  Potential themes missed: ${themeIndicators.length - (analysis?.themes_identified?.length || 0)}`);
    }
  }
}

function analyzeContentForThemes(content: string): string[] {
  const indicators: string[] = [];
  const lowerContent = content.toLowerCase();

  // Look for specific theme indicators that might be missed
  const themePatterns = {
    'Cultural Heritage': ['culture', 'tradition', 'heritage', 'ancestors', 'cultural identity'],
    'Innovation/Technology': ['technology', 'innovation', 'digital', 'startup', 'invention'],
    'Environmental Consciousness': ['environment', 'climate', 'nature', 'sustainability', 'earth'],
    'Mental Health': ['depression', 'anxiety', 'mental health', 'therapy', 'counseling'],
    'Entrepreneurship': ['business', 'entrepreneur', 'startup', 'company', 'venture'],
    'Artistic Expression': ['art', 'music', 'creative', 'painting', 'writing', 'poetry'],
    'Disability Rights': ['disability', 'accessibility', 'wheelchair', 'blind', 'deaf'],
    'Gender/LGBTQ+': ['gender', 'transgender', 'gay', 'lesbian', 'sexuality', 'identity'],
    'Immigrant Experience': ['immigrant', 'migration', 'refugee', 'visa', 'citizenship'],
    'Substance Recovery': ['addiction', 'recovery', 'alcohol', 'drugs', 'rehabilitation'],
    'Domestic Violence': ['abuse', 'domestic violence', 'shelter', 'escape', 'survivor'],
    'Chronic Illness': ['chronic', 'illness', 'disease', 'diagnosis', 'medical'],
    'Parenting Challenges': ['parenting', 'children', 'single parent', 'custody', 'daycare'],
    'Financial Hardship': ['money', 'debt', 'poverty', 'unemployment', 'financial'],
    'Educational Journey': ['school', 'university', 'education', 'learning', 'student'],
    'Career Transition': ['career', 'job', 'work', 'employment', 'promotion', 'retirement'],
    'Spiritual Journey': ['faith', 'religion', 'spiritual', 'god', 'prayer', 'church'],
    'Loss/Bereavement': ['death', 'died', 'funeral', 'grief', 'loss', 'bereavement'],
    'Rural/Remote Life': ['rural', 'farm', 'remote', 'country', 'isolated'],
    'Social Justice': ['justice', 'activism', 'protest', 'rights', 'equality', 'discrimination']
  };

  Object.entries(themePatterns).forEach(([theme, patterns]) => {
    const found = patterns.some(pattern => lowerContent.includes(pattern));
    if (found) {
      indicators.push(theme);
    }
  });

  return indicators;
}

async function investigateThemeMapping() {
  // Check how AI theme names are being mapped to UUIDs
  const { data: analyses, error } = await supabase
    .from('story_analysis')
    .select(`
      id,
      themes_identified,
      results
    `)
    .eq('analysis_type', 'theme_extraction')
    .not('results', 'is', null)
    .limit(10);

  if (error || !analyses) {
    console.log('❌ Could not fetch analyses for mapping investigation');
    return;
  }

  console.log(`🔍 Investigating theme mapping for ${analyses.length} analyses\n`);

  // Get theme database for reference
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name, category')
    .eq('status', 'active');

  const themeMap = new Map<string, { name: string, category: string }>();
  themes?.forEach(theme => {
    themeMap.set(theme.id, { name: theme.name, category: theme.category });
  });

  analyses.forEach((analysis, index) => {
    console.log(`\n--- MAPPING ANALYSIS ${index + 1} ---`);
    
    const results = analysis.results as any;
    if (results && results.themes) {
      console.log(`AI Generated Themes: ${JSON.stringify(results.themes)}`);
    }
    
    console.log(`Mapped UUIDs: ${JSON.stringify(analysis.themes_identified)}`);
    
    if (analysis.themes_identified && Array.isArray(analysis.themes_identified)) {
      console.log(`Mapped Theme Names:`);
      analysis.themes_identified.forEach((uuid: string) => {
        const theme = themeMap.get(uuid);
        if (theme) {
          console.log(`   • ${uuid} → ${theme.name} (${theme.category})`);
        } else {
          console.log(`   • ${uuid} → UNKNOWN THEME`);
        }
      });
    }

    // Check for mapping issues
    if (results && results.themes && analysis.themes_identified) {
      const aiThemeCount = results.themes.length;
      const mappedThemeCount = analysis.themes_identified.length;
      
      if (aiThemeCount !== mappedThemeCount) {
        console.log(`   ⚠️  MAPPING ISSUE: AI generated ${aiThemeCount} themes but only ${mappedThemeCount} were mapped`);
      }
    }
  });
}

async function analyzeContentPatterns() {
  // Look for patterns in successful vs unsuccessful theme detection
  const { data: richAnalyses, error } = await supabase
    .from('story_analysis')
    .select(`
      id,
      themes_identified,
      results,
      confidence_score,
      transcripts!inner(
        transcript_content,
        word_count
      )
    `)
    .eq('analysis_type', 'theme_extraction')
    .gte('confidence_score', 0.8)
    .limit(5);

  if (error || !richAnalyses) {
    console.log('❌ Could not fetch high-confidence analyses');
    return;
  }

  console.log(`\n📈 Analyzing ${richAnalyses.length} high-confidence analyses\n`);

  richAnalyses.forEach((analysis, index) => {
    console.log(`\n--- HIGH-CONFIDENCE ANALYSIS ${index + 1} ---`);
    console.log(`Confidence Score: ${analysis.confidence_score}`);
    console.log(`Word Count: ${analysis.transcripts.word_count}`);
    console.log(`Themes Count: ${analysis.themes_identified?.length || 0}`);

    const content = analysis.transcripts.transcript_content || '';
    const indicators = analyzeContentForThemes(content);
    
    console.log(`Content Theme Indicators: ${indicators.slice(0, 5).join(', ')}`);
    
    const results = analysis.results as any;
    if (results && results.themes) {
      console.log(`AI Detected Themes: ${results.themes.join(', ')}`);
    }

    // Check sophistication
    const sophisticatedThemes = indicators.filter(theme => 
      !['Personal Story', 'Life Experience', 'Resilience', 'Community', 'Identity'].includes(theme)
    );
    
    console.log(`Sophisticated Themes Available: ${sophisticatedThemes.length}`);
    if (sophisticatedThemes.length > 0) {
      console.log(`   Examples: ${sophisticatedThemes.slice(0, 3).join(', ')}`);
    }
  });

  // Summary insights
  console.log(`\n💡 CONTENT PATTERN INSIGHTS:`);
  console.log(`1. Transcripts contain rich, diverse thematic content`);
  console.log(`2. AI is defaulting to generic themes despite available variety`);
  console.log(`3. Theme mapping may be losing AI-generated specificity`);
  console.log(`4. Need better prompt engineering to encourage diversity`);
  console.log(`5. Consider multi-pass analysis for theme refinement`);
}

// Execute analysis
deepThemeAnalysis()
  .then(() => {
    console.log('\n✅ Deep theme analysis completed!');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Improve AI prompts to encourage theme diversity');
    console.log('2. Fix theme mapping to preserve AI specificity');
    console.log('3. Add theme usage statistics to prompt context');
    console.log('4. Consider human review workflow for themes');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Deep analysis failed:', error);
    process.exit(1);
  });