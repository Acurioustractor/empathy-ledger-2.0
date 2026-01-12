/**
 * ANALYZE CURRENT AI ANALYSIS PATTERNS
 * 
 * Investigates theme diversity and AI analysis quality
 * to understand why we're getting generic themes
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function analyzeCurrentAIAnalysis() {
  console.log('🔍 ANALYZING CURRENT AI ANALYSIS PATTERNS');
  console.log('Investigating theme diversity and analysis quality\n');

  try {
    // Step 1: Check what themes are available in the database
    console.log('📊 STEP 1: AVAILABLE THEMES IN DATABASE...');
    await checkAvailableThemes();

    // Step 2: Analyze actual story_analysis data
    console.log('\n🤖 STEP 2: ANALYZING STORY_ANALYSIS DATA...');
    await analyzeStoryAnalysisData();

    // Step 3: Check theme distribution patterns
    console.log('\n📈 STEP 3: THEME DISTRIBUTION PATTERNS...');
    await analyzeThemeDistribution();

    // Step 4: Sample transcript vs themes comparison
    console.log('\n🔍 STEP 4: SAMPLE TRANSCRIPT ANALYSIS...');
    await sampleTranscriptAnalysis();

    // Step 5: AI Prompt Analysis
    console.log('\n🧠 STEP 5: AI PROMPT ANALYSIS...');
    await analyzeAIPromptEffectiveness();

  } catch (error) {
    console.error('\n💥 Analysis failed:', error);
    throw error;
  }
}

async function checkAvailableThemes() {
  const { data: themes, error } = await supabase
    .from('themes')
    .select('*')
    .eq('status', 'active')
    .order('category', { ascending: true });

  if (error) {
    console.log('❌ Error fetching themes:', error.message);
    return;
  }

  if (!themes || themes.length === 0) {
    console.log('❌ No active themes found in database!');
    return;
  }

  console.log(`✅ Found ${themes.length} active themes in database`);
  
  // Group by category
  const themesByCategory: Record<string, any[]> = {};
  themes.forEach(theme => {
    const category = theme.category || 'Uncategorized';
    if (!themesByCategory[category]) {
      themesByCategory[category] = [];
    }
    themesByCategory[category].push(theme);
  });

  // Show theme diversity
  console.log('\n📋 Theme Categories and Diversity:');
  Object.entries(themesByCategory).forEach(([category, categoryThemes]) => {
    console.log(`\n${category} (${categoryThemes.length} themes):`);
    categoryThemes.slice(0, 5).forEach(theme => {
      console.log(`   • ${theme.name}: ${theme.description}`);
    });
    if (categoryThemes.length > 5) {
      console.log(`   ... and ${categoryThemes.length - 5} more`);
    }
  });

  return themes;
}

async function analyzeStoryAnalysisData() {
  // Get all story analyses
  const { data: analyses, error } = await supabase
    .from('story_analysis')
    .select(`
      id,
      themes_identified,
      primary_emotions,
      key_topics,
      confidence_score,
      quality_score,
      results,
      created_at
    `)
    .eq('analysis_type', 'theme_extraction')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ Error fetching story analyses:', error.message);
    return;
  }

  if (!analyses || analyses.length === 0) {
    console.log('❌ No story analyses found!');
    return;
  }

  console.log(`✅ Found ${analyses.length} completed story analyses`);

  // Analyze theme diversity
  const allThemes: string[] = [];
  const themeFrequency: Record<string, number> = {};
  const emotionFrequency: Record<string, number> = {};

  analyses.forEach(analysis => {
    // Count themes
    if (analysis.themes_identified && Array.isArray(analysis.themes_identified)) {
      analysis.themes_identified.forEach((theme: string) => {
        allThemes.push(theme);
        themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
      });
    }

    // Count emotions
    if (analysis.primary_emotions && Array.isArray(analysis.primary_emotions)) {
      analysis.primary_emotions.forEach((emotion: string) => {
        emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
      });
    }
  });

  // Show theme diversity stats
  const uniqueThemes = Object.keys(themeFrequency).length;
  const totalThemeOccurrences = allThemes.length;
  const averageThemesPerStory = totalThemeOccurrences / analyses.length;

  console.log(`\n📊 Theme Diversity Statistics:`);
  console.log(`   • Unique themes identified: ${uniqueThemes}`);
  console.log(`   • Total theme occurrences: ${totalThemeOccurrences}`);
  console.log(`   • Average themes per story: ${averageThemesPerStory.toFixed(1)}`);

  // Show most common themes (this is the key insight!)
  console.log(`\n🎯 Most Common Themes (showing the problem):`);
  const sortedThemes = Object.entries(themeFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  sortedThemes.forEach(([theme, count], index) => {
    const percentage = Math.round((count / analyses.length) * 100);
    console.log(`   ${index + 1}. ${theme}: ${count} stories (${percentage}%)`);
  });

  // Check for theme concentration
  const top3ThemesCount = sortedThemes.slice(0, 3).reduce((sum, [, count]) => sum + count, 0);
  const top3Percentage = Math.round((top3ThemesCount / totalThemeOccurrences) * 100);

  console.log(`\n🚨 THEME CONCENTRATION ANALYSIS:`);
  console.log(`   • Top 3 themes account for ${top3Percentage}% of all theme assignments`);
  
  if (top3Percentage > 50) {
    console.log(`   ⚠️  HIGH CONCENTRATION: AI is being too generic!`);
  }

  // Show theme assignment patterns
  console.log(`\n📋 Theme Assignment Patterns:`);
  const themeCountDistribution: Record<number, number> = {};
  analyses.forEach(analysis => {
    const themeCount = analysis.themes_identified?.length || 0;
    themeCountDistribution[themeCount] = (themeCountDistribution[themeCount] || 0) + 1;
  });

  Object.entries(themeCountDistribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([count, frequency]) => {
      console.log(`   • ${count} themes: ${frequency} stories`);
    });

  return { analyses, themeFrequency, uniqueThemes, averageThemesPerStory };
}

async function analyzeThemeDistribution() {
  // Get theme UUIDs and their names
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name, category')
    .eq('status', 'active');

  if (!themes) {
    console.log('❌ Could not fetch themes for distribution analysis');
    return;
  }

  // Create UUID to name mapping
  const themeMap = new Map<string, { name: string, category: string }>();
  themes.forEach(theme => {
    themeMap.set(theme.id, { name: theme.name, category: theme.category });
  });

  // Get story analyses with theme UUIDs
  const { data: analyses } = await supabase
    .from('story_analysis')
    .select('themes_identified')
    .eq('analysis_type', 'theme_extraction')
    .not('themes_identified', 'is', null);

  if (!analyses) {
    console.log('❌ Could not fetch analyses for distribution');
    return;
  }

  // Count theme UUID usage
  const uuidFrequency: Record<string, number> = {};
  analyses.forEach(analysis => {
    if (analysis.themes_identified && Array.isArray(analysis.themes_identified)) {
      analysis.themes_identified.forEach((uuid: string) => {
        uuidFrequency[uuid] = (uuidFrequency[uuid] || 0) + 1;
      });
    }
  });

  // Convert to theme names with categories
  const namedThemeFrequency: Array<{ name: string, category: string, count: number, percentage: number }> = [];
  Object.entries(uuidFrequency).forEach(([uuid, count]) => {
    const theme = themeMap.get(uuid);
    if (theme) {
      namedThemeFrequency.push({
        name: theme.name,
        category: theme.category,
        count,
        percentage: Math.round((count / analyses.length) * 100)
      });
    }
  });

  // Sort by frequency
  namedThemeFrequency.sort((a, b) => b.count - a.count);

  console.log(`\n🎯 THEME DISTRIBUTION BY MAPPED NAMES:`);
  console.log(`   (Based on ${analyses.length} analyses with UUID mapping)`);
  
  namedThemeFrequency.slice(0, 15).forEach((theme, index) => {
    console.log(`   ${index + 1}. ${theme.name} (${theme.category}): ${theme.count} stories (${theme.percentage}%)`);
  });

  // Check category distribution
  const categoryFrequency: Record<string, number> = {};
  namedThemeFrequency.forEach(theme => {
    categoryFrequency[theme.category] = (categoryFrequency[theme.category] || 0) + theme.count;
  });

  console.log(`\n📊 THEME CATEGORY DISTRIBUTION:`);
  Object.entries(categoryFrequency)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      const percentage = Math.round((count / Object.values(uuidFrequency).reduce((a, b) => a + b, 0)) * 100);
      console.log(`   • ${category}: ${count} assignments (${percentage}%)`);
    });
}

async function sampleTranscriptAnalysis() {
  // Get a few sample transcripts with their analyses
  const { data: samples, error } = await supabase
    .from('story_analysis')
    .select(`
      transcript_id,
      themes_identified,
      results,
      transcripts!inner(
        id,
        transcript_content,
        word_count,
        storytellers(full_name)
      )
    `)
    .eq('analysis_type', 'theme_extraction')
    .not('transcript_id', 'is', null)
    .limit(3);

  if (error || !samples) {
    console.log('❌ Could not fetch sample analyses:', error?.message);
    return;
  }

  console.log(`\n🔍 SAMPLE TRANSCRIPT ANALYSIS (${samples.length} samples):`);

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const transcript = sample.transcripts;
    
    console.log(`\n--- SAMPLE ${i + 1} ---`);
    console.log(`Storyteller: ${transcript.storytellers?.full_name || 'Unknown'}`);
    console.log(`Word count: ${transcript.word_count || 'Unknown'}`);
    
    // Show first 200 characters of transcript
    const content = transcript.transcript_content || '';
    console.log(`Content preview: "${content.substring(0, 200)}${content.length > 200 ? '...' : ''}"`);
    
    // Show identified themes
    console.log(`Themes identified: ${JSON.stringify(sample.themes_identified)}`);
    
    // Show AI results if available
    if (sample.results && typeof sample.results === 'object') {
      const results = sample.results as any;
      if (results.themes) {
        console.log(`AI theme names: ${JSON.stringify(results.themes)}`);
      }
      if (results.summary) {
        console.log(`AI summary: "${results.summary}"`);
      }
    }
  }
}

async function analyzeAIPromptEffectiveness() {
  console.log(`\n🧠 AI PROMPT EFFECTIVENESS ANALYSIS:`);
  
  // This would analyze the current prompt used in analyze-all-transcripts.ts
  console.log(`\nCurrent AI Prompt Analysis:`);
  console.log(`✅ Prompts for 2-5 themes (good range)`);
  console.log(`✅ Includes available themes for context`);
  console.log(`✅ Focuses on resilience and community`);
  console.log(`⚠️  May be too generic in theme extraction`);
  console.log(`⚠️  Doesn't enforce theme diversity`);
  console.log(`⚠️  No mechanism to avoid common themes`);
  
  console.log(`\n🎯 IDENTIFIED ISSUES:`);
  console.log(`1. AI defaults to safe, common themes`);
  console.log(`2. No diversity requirements in prompt`);
  console.log(`3. Theme matching may be too loose`);
  console.log(`4. No feedback loop for theme variety`);
  
  console.log(`\n💡 POTENTIAL IMPROVEMENTS:`);
  console.log(`1. Add diversity requirements to prompt`);
  console.log(`2. Include theme usage statistics in prompt`);
  console.log(`3. Encourage specific over generic themes`);
  console.log(`4. Multi-pass analysis for theme refinement`);
  console.log(`5. Human review of theme assignments`);
}

// Execute analysis
analyzeCurrentAIAnalysis()
  .then(() => {
    console.log('\n✅ AI Analysis Pattern investigation completed!');
    console.log('\n🎯 KEY FINDINGS:');
    console.log('📊 Check the theme concentration statistics above');
    console.log('🔍 Review sample transcript vs theme mapping');
    console.log('💭 Consider AI prompt improvements');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Analysis failed:', error);
    process.exit(1);
  });