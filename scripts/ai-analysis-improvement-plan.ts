/**
 * AI ANALYSIS IMPROVEMENT PLAN
 * 
 * Comprehensive solution to fix theme diversity and sophistication issues
 * Based on investigation findings
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

/**
 * IMPROVED AI ANALYSIS WITH DIVERSITY FOCUS
 */
export async function improvedAIAnalysis(transcriptContent: string, storytellerName: string): Promise<any> {
  // Get current theme usage statistics for diversity prompting
  const themeStats = await getThemeUsageStatistics();
  
  // Get available themes with full context
  const availableThemes = await getAvailableThemesWithContext();
  
  // Create sophisticated analysis prompt
  const analysisPrompt = createSophisticatedAnalysisPrompt(
    transcriptContent, 
    storytellerName, 
    availableThemes, 
    themeStats
  );

  // Multi-pass analysis for better results
  return await multiPassAnalysis(analysisPrompt, transcriptContent);
}

async function getThemeUsageStatistics() {
  const { data: analyses } = await supabase
    .from('story_analysis')
    .select('themes_identified')
    .eq('analysis_type', 'theme_extraction')
    .not('themes_identified', 'is', null);

  if (!analyses) return {};

  // Count theme usage
  const themeFrequency: Record<string, number> = {};
  analyses.forEach(analysis => {
    if (analysis.themes_identified && Array.isArray(analysis.themes_identified)) {
      analysis.themes_identified.forEach((themeId: string) => {
        themeFrequency[themeId] = (themeFrequency[themeId] || 0) + 1;
      });
    }
  });

  // Get theme names for the statistics
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name, category')
    .eq('status', 'active');

  const themeStats: Record<string, { count: number, percentage: number, category: string }> = {};
  
  if (themes) {
    themes.forEach(theme => {
      const count = themeFrequency[theme.id] || 0;
      const percentage = analyses.length > 0 ? Math.round((count / analyses.length) * 100) : 0;
      themeStats[theme.name] = {
        count,
        percentage,
        category: theme.category
      };
    });
  }

  return themeStats;
}

async function getAvailableThemesWithContext() {
  const { data: themes } = await supabase
    .from('themes')
    .select('*')
    .eq('status', 'active')
    .order('category');

  if (!themes) return [];

  // Group themes by category for better context
  const themesByCategory: Record<string, any[]> = {};
  themes.forEach(theme => {
    const category = theme.category || 'Other';
    if (!themesByCategory[category]) {
      themesByCategory[category] = [];
    }
    themesByCategory[category].push(theme);
  });

  return themesByCategory;
}

function createSophisticatedAnalysisPrompt(
  content: string, 
  storytellerName: string, 
  availableThemes: any, 
  themeStats: any
) {
  // Identify overused themes to discourage
  const overusedThemes = Object.entries(themeStats)
    .filter(([_, stats]: [string, any]) => stats.percentage > 30)
    .map(([theme]) => theme);

  // Identify underused themes to encourage
  const underusedThemes = Object.entries(themeStats)
    .filter(([_, stats]: [string, any]) => stats.percentage < 10)
    .map(([theme]) => theme);

  const themeContext = Object.entries(availableThemes)
    .map(([category, themes]: [string, any[]]) => {
      const themeList = themes.map(t => `${t.name}: ${t.description}`).join('\n   ');
      return `${category.toUpperCase()}:\n   ${themeList}`;
    })
    .join('\n\n');

  return `You are an expert narrative analyst specializing in community storytelling, cultural sensitivity, and thematic diversity. Your goal is to identify the MOST SPECIFIC and DIVERSE themes that capture the unique aspects of this person's story.

CRITICAL INSTRUCTIONS FOR THEME DIVERSITY:
1. AVOID OVERUSED THEMES: These themes are used too frequently and should only be chosen if they are absolutely central to the story: ${overusedThemes.join(', ')}
2. PRIORITIZE SPECIFIC THEMES: Look for specific life experiences, cultural elements, professional contexts, or unique circumstances
3. ENCOURAGE UNDERUSED THEMES: Consider these less common but valuable themes: ${underusedThemes.slice(0, 10).join(', ')}
4. SEEK SOPHISTICATION: Move beyond generic themes to capture the storyteller's unique experience

STORYTELLER: ${storytellerName}

AVAILABLE THEMES TO CHOOSE FROM:
${themeContext}

TRANSCRIPT TO ANALYZE:
${content.substring(0, 6000)}${content.length > 6000 ? '\n[CONTENT CONTINUES...]' : ''}

ANALYSIS INSTRUCTIONS:
1. Read the entire transcript carefully for specific details, contexts, and unique experiences
2. Look for:
   - Specific life circumstances or challenges
   - Cultural, ethnic, or community identity markers
   - Professional or educational contexts
   - Unique personal experiences or journeys
   - Specific social issues or advocacy areas
   - Health, family, or relationship dynamics
   - Creative, artistic, or innovative aspects
   - Environmental or geographic influences

3. Select 3-5 themes that are:
   - SPECIFIC to this storyteller's unique experience
   - DIVERSE across different categories
   - MEANINGFUL to their particular story
   - UNDERREPRESENTED in our current analysis collection

4. For each theme, explain WHY it was chosen and HOW it specifically relates to the storyteller's unique experience

RESPONSE FORMAT (JSON only):
{
  "themes": ["2-5 specific theme names that best capture unique aspects"],
  "theme_justifications": ["For each theme, explain why it was chosen and how it specifically relates to this story"],
  "emotions": ["3-6 specific emotions expressed, avoid generic terms"],
  "topics": ["4-8 specific topics/events discussed, not general categories"],
  "quotes": ["2-4 most powerful and specific quotes that capture unique insights"],
  "summary": "2-3 sentences focusing on what makes this story UNIQUE and specific",
  "insights": ["3-5 specific insights or wisdom unique to this storyteller's experience"],
  "cultural_elements": ["any specific cultural, ethnic, geographic, or community references"],
  "sensitivity_flags": ["specific content requiring careful handling"],
  "sophistication_score": 0.85,
  "diversity_score": 0.90
}

REMEMBER: Your goal is to capture the UNIQUE aspects of this person's story, not generic human experiences. Look for what makes this storyteller's experience distinctive and valuable to the community.`;
}

async function multiPassAnalysis(prompt: string, content: string) {
  try {
    // First pass: Initial analysis
    const firstPass = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert narrative analyst focused on diversity and specificity in theme identification. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.2 // Lower temperature for more focused analysis
    });

    const firstResult = JSON.parse(firstPass.choices[0]?.message?.content || '{}');

    // Second pass: Diversity check and refinement
    const diversityCheckPrompt = `Review and refine this thematic analysis for greater diversity and specificity:

ORIGINAL ANALYSIS: ${JSON.stringify(firstResult)}

DIVERSITY IMPROVEMENT INSTRUCTIONS:
1. Are the themes sufficiently diverse across categories?
2. Are any themes too generic and could be made more specific?
3. Are there unique aspects of the story that weren't captured?
4. Could any themes be replaced with more specific alternatives?

Provide an improved analysis with more diverse and specific themes. Same JSON format.`;

    const secondPass = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are refining a thematic analysis for maximum diversity and specificity. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: diversityCheckPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    const finalResult = JSON.parse(secondPass.choices[0]?.message?.content || JSON.stringify(firstResult));
    
    return finalResult;

  } catch (error) {
    console.error('Multi-pass analysis failed:', error);
    return createFallbackAnalysis(content);
  }
}

function createFallbackAnalysis(content: string) {
  return {
    themes: ['Content requires manual review'],
    theme_justifications: ['AI analysis failed, human review needed'],
    emotions: ['Complex emotions present'],
    topics: ['Multiple topics discussed'],
    quotes: [],
    summary: 'Story contains rich content requiring manual analysis for proper theme identification.',
    insights: ['Story contains valuable insights requiring human review'],
    cultural_elements: [],
    sensitivity_flags: ['Requires manual review for theme assignment'],
    sophistication_score: 0.3,
    diversity_score: 0.3
  };
}

/**
 * IMPROVED THEME MAPPING FUNCTION
 */
export async function improvedThemeMapping(aiThemes: string[]): Promise<string[]> {
  if (!aiThemes || aiThemes.length === 0) {
    return [];
  }

  // Get all available themes
  const { data: themes, error } = await supabase
    .from('themes')
    .select('id, name, description, category')
    .eq('status', 'active');

  if (error || !themes) {
    console.log('Could not fetch themes for mapping');
    return [];
  }

  // Create comprehensive mapping strategies
  const mappedUUIDs: string[] = [];
  
  for (const aiTheme of aiThemes) {
    const uuid = findBestThemeMatch(aiTheme, themes);
    if (uuid) {
      mappedUUIDs.push(uuid);
    } else {
      console.log(`⚠️  Could not map theme: "${aiTheme}"`);
      // Consider creating new theme or manual review flag
    }
  }

  return mappedUUIDs;
}

function findBestThemeMatch(aiTheme: string, themes: any[]): string | null {
  const cleanAITheme = aiTheme.toLowerCase().trim();
  
  // Strategy 1: Exact name match
  for (const theme of themes) {
    if (theme.name.toLowerCase() === cleanAITheme) {
      return theme.id;
    }
  }

  // Strategy 2: Contains match
  for (const theme of themes) {
    if (cleanAITheme.includes(theme.name.toLowerCase()) || 
        theme.name.toLowerCase().includes(cleanAITheme)) {
      return theme.id;
    }
  }

  // Strategy 3: Description match
  for (const theme of themes) {
    if (theme.description && 
        (theme.description.toLowerCase().includes(cleanAITheme) ||
         cleanAITheme.includes(theme.description.toLowerCase().substring(0, 20)))) {
      return theme.id;
    }
  }

  // Strategy 4: Keyword mapping
  const keywordMappings = {
    'retirement': 'Work',
    'transition': 'Transformation',
    'service': 'Community',
    'homelessness': 'Poverty',
    'growth': 'Wisdom',
    'support': 'Community',
    'strength': 'Resilience',
    'recovery': 'Healing',
    'volunteerism': 'Community'
  };

  for (const [keyword, themeName] of Object.entries(keywordMappings)) {
    if (cleanAITheme.includes(keyword)) {
      const theme = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
      if (theme) {
        return theme.id;
      }
    }
  }

  return null;
}

/**
 * ANALYSIS QUALITY IMPROVEMENT SYSTEM
 */
export async function improveAnalysisQuality() {
  console.log('🔧 AI ANALYSIS IMPROVEMENT SYSTEM');
  console.log('Implementing sophisticated theme analysis\n');

  // Test the improved system on a sample
  console.log('📊 TESTING IMPROVED ANALYSIS...');
  await testImprovedAnalysis();

  console.log('\n💡 IMPROVEMENT RECOMMENDATIONS:');
  console.log('1. Deploy improved AI prompts with diversity focus');
  console.log('2. Implement multi-pass analysis system');
  console.log('3. Fix theme mapping to preserve AI specificity');
  console.log('4. Add theme usage statistics to prevent overuse');
  console.log('5. Create human review workflow for theme quality');
  console.log('6. Monitor theme diversity metrics over time');
}

async function testImprovedAnalysis() {
  // Get a sample transcript to test improved analysis
  const { data: sample } = await supabase
    .from('transcripts')
    .select(`
      id,
      transcript_content,
      storytellers(full_name)
    `)
    .gte('word_count', 1000)
    .limit(1)
    .single();

  if (!sample) {
    console.log('❌ No sample transcript found for testing');
    return;
  }

  console.log(`Testing improved analysis on: ${sample.storytellers?.full_name}`);
  
  try {
    const improvedResult = await improvedAIAnalysis(
      sample.transcript_content, 
      sample.storytellers?.full_name || 'Unknown'
    );

    console.log('\n✅ IMPROVED ANALYSIS RESULT:');
    console.log(`Themes: ${JSON.stringify(improvedResult.themes)}`);
    console.log(`Diversity Score: ${improvedResult.diversity_score}`);
    console.log(`Sophistication Score: ${improvedResult.sophistication_score}`);
    console.log(`Theme Justifications: ${JSON.stringify(improvedResult.theme_justifications)}`);

  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Execute improvement analysis
if (require.main === module) {
  improveAnalysisQuality()
    .then(() => {
      console.log('\n✅ AI Analysis improvement plan completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Improvement plan failed:', error);
      process.exit(1);
    });
}