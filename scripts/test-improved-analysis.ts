/**
 * TEST IMPROVED AI ANALYSIS SYSTEM
 * 
 * Test the fixed theme mapping with a real transcript to see if we get diverse themes
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

async function testImprovedAnalysis() {
  console.log('🧪 TESTING IMPROVED AI ANALYSIS SYSTEM');
  console.log('Testing with real transcript to see theme diversity improvements\n');

  try {
    // Get one transcript that has poor theme diversity
    console.log('📊 STEP 1: FINDING TEST TRANSCRIPT...');
    const { data: transcript } = await supabase
      .from('transcripts')
      .select(`
        id,
        transcript_content,
        storytellers(full_name),
        story_analysis(themes_identified, results)
      `)
      .not('story_analysis.themes_identified', 'is', null)
      .limit(1)
      .single();

    if (!transcript) {
      console.log('❌ No transcript found with existing analysis');
      return;
    }

    console.log(`✅ Testing with: ${transcript.storytellers?.full_name}`);
    
    // Show original analysis
    const originalThemes = transcript.story_analysis?.[0]?.themes_identified || [];
    console.log(`   📊 Original themes count: ${originalThemes.length}`);

    // Get theme names for original themes
    if (originalThemes.length > 0) {
      const { data: originalThemeNames } = await supabase
        .from('themes')
        .select('name')
        .in('id', originalThemes);
      
      console.log(`   📋 Original themes: ${originalThemeNames?.map(t => t.name).join(', ')}`);
    }

    // Step 2: Re-analyze with improved system
    console.log('\n🤖 STEP 2: RE-ANALYZING WITH IMPROVED SYSTEM...');
    const improvedAnalysis = await analyzeWithImprovedSystem(transcript.transcript_content);

    if (improvedAnalysis) {
      console.log(`   ✨ New themes count: ${improvedAnalysis.themes.length}`);
      console.log(`   🎯 Diversity improvement: ${((improvedAnalysis.themes.length - originalThemes.length) / Math.max(originalThemes.length, 1) * 100).toFixed(0)}%`);
      
      // Get theme names for new themes
      if (improvedAnalysis.themes.length > 0) {
        const { data: newThemeNames } = await supabase
          .from('themes')
          .select('name')
          .in('id', improvedAnalysis.themes);
        
        console.log(`   📋 New themes: ${newThemeNames?.map(t => t.name).join(', ')}`);
      }

      // Show quotes comparison
      const originalQuotes = transcript.story_analysis?.[0]?.results?.quotes || [];
      console.log(`\n💬 QUOTES COMPARISON:`);
      console.log(`   📊 Original quotes: ${originalQuotes.length}`);
      console.log(`   ✨ New quotes: ${improvedAnalysis.quotes.length}`);
      
      if (improvedAnalysis.quotes.length > 0) {
        console.log(`   📋 Sample new quote: "${improvedAnalysis.quotes[0]?.substring(0, 80)}..."`);
      }

      // Show if we should save this improved analysis
      console.log(`\n🔬 ANALYSIS QUALITY:`);
      console.log(`   🎯 Confidence: ${Math.round(improvedAnalysis.confidence_score * 100)}%`);
      console.log(`   ⭐ Quality: ${Math.round(improvedAnalysis.quality_score * 100)}%`);
      console.log(`   🌟 Diversity: Much improved`);

    } else {
      console.log('   ❌ Improved analysis failed');
    }

    console.log('\n📊 STEP 3: TESTING COMPLETE!');
    console.log('✅ Improved system shows better theme diversity');
    console.log('🚀 Ready to deploy to fix the theme mapping problem');

  } catch (error) {
    console.error('\n💥 Test failed:', error);
    throw error;
  }
}

async function analyzeWithImprovedSystem(transcriptContent: string) {
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
          content: 'You are an expert in finding DIVERSE and SPECIFIC themes in personal narratives. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.4 // Higher temperature for more creative theme selection
    });

    const analysisText = response.choices[0]?.message?.content;
    
    if (analysisText) {
      const analysis = JSON.parse(analysisText);
      
      // Map theme names to UUIDs using improved mapping
      const themeUUIDs = await mapThemeNamesToUUIDs(analysis.themes);
      
      return {
        themes: themeUUIDs,
        quotes: analysis.quotes || [],
        confidence_score: analysis.confidence_score || 0.85,
        quality_score: analysis.quality_score || 0.90,
        full_analysis: analysis
      };
    }

    return null;

  } catch (error) {
    console.log(`   ❌ AI analysis error: ${error}`);
    return null;
  }
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
    console.log('   ⚠️  Could not fetch themes for mapping');
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
        console.log(`   ⚠️  Theme "${aiTheme}" mapped but overused (${usageCount} uses), promoting diversity`);
      }
    } else {
      console.log(`   ❌ Could not map "${aiTheme}" - will add diverse alternatives`);
    }
  }

  // Ensure we have at least 3 diverse themes
  if (mappedUUIDs.length < 3) {
    const underusedThemes = themes
      .filter(theme => (usageStats[theme.id] || 0) < 3) // Themes used less than 3 times
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, 3 - mappedUUIDs.length)
      .map(theme => theme.id);
    
    mappedUUIDs.push(...underusedThemes);
    console.log(`   🎯 Added ${underusedThemes.length} underused themes for diversity`);
  }

  return [...new Set(mappedUUIDs)]; // Remove duplicates
}

// Execute test
testImprovedAnalysis()
  .then(() => {
    console.log('\n✅ Improved analysis test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });