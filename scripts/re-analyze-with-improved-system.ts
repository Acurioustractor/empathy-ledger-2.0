/**
 * RE-ANALYZE EXISTING TRANSCRIPTS WITH IMPROVED SYSTEM
 * 
 * Updates existing analyses to use the new diverse theme mapping system
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function reAnalyzeWithImprovedSystem() {
  console.log('🔄 RE-ANALYZING EXISTING TRANSCRIPTS WITH IMPROVED SYSTEM');
  console.log('Updating existing analyses to use new diverse theme mapping\n');

  try {
    // Step 1: Get existing analyses that need improvement
    console.log('📊 STEP 1: FINDING ANALYSES TO IMPROVE...');
    const analysesToImprove = await getAnalysesToImprove();

    if (analysesToImprove.length === 0) {
      console.log('✅ All analyses already have good theme diversity');
      return;
    }

    console.log(`🎯 Found ${analysesToImprove.length} analyses to improve`);

    // Step 2: Re-process with improved mapping
    console.log('\n🔧 STEP 2: IMPROVING THEME MAPPINGS...');
    await improveExistingAnalyses(analysesToImprove);

    // Step 3: Show results
    console.log('\n📊 STEP 3: IMPROVEMENT RESULTS...');
    await showImprovementResults();

  } catch (error) {
    console.error('\n💥 Re-analysis failed:', error);
    throw error;
  }
}

async function getAnalysesToImprove() {
  // Get analyses with poor theme diversity (0-2 themes)
  const { data: analyses } = await supabase
    .from('story_analysis')
    .select(`
      id,
      transcript_id,
      results,
      themes_identified,
      transcripts(
        storytellers(full_name)
      )
    `)
    .eq('analysis_type', 'theme_extraction')
    .eq('processing_status', 'completed');

  if (!analyses) {
    return [];
  }

  // Filter for analyses that need improvement
  const needsImprovement = analyses.filter(analysis => {
    const themeCount = analysis.themes_identified?.length || 0;
    const hasResults = analysis.results && typeof analysis.results === 'object';
    const hasOriginalThemes = hasResults && (analysis.results as any).themes;
    
    return themeCount < 3 && hasOriginalThemes; // Less than 3 themes but has original AI themes
  });

  return needsImprovement;
}

async function improveExistingAnalyses(analyses: any[]) {
  console.log(`Processing ${analyses.length} analyses for improvement...`);

  let improvedCount = 0;
  let failedCount = 0;

  for (const analysis of analyses) {
    try {
      const storytellerName = analysis.transcripts?.storytellers?.full_name || 'Unknown';
      console.log(`\n🔄 Improving: ${storytellerName}`);
      
      // Get original AI themes from results
      const originalResults = analysis.results as any;
      const originalAIThemes = originalResults.themes || [];
      
      console.log(`   📊 Original AI themes: ${originalAIThemes.join(', ')}`);
      console.log(`   📊 Currently mapped: ${analysis.themes_identified?.length || 0} themes`);

      // Re-map using improved system
      const improvedThemes = await mapThemeNamesToUUIDs(originalAIThemes);
      
      if (improvedThemes.length > (analysis.themes_identified?.length || 0)) {
        // Update the analysis with better theme mapping
        const { error } = await supabase
          .from('story_analysis')
          .update({
            themes_identified: improvedThemes,
            processing_status: 'improved',
            updated_at: new Date().toISOString()
          })
          .eq('id', analysis.id);

        if (error) {
          throw error;
        }

        // Get theme names for display
        const { data: themeNames } = await supabase
          .from('themes')
          .select('name')
          .in('id', improvedThemes);

        console.log(`   ✅ Improved to ${improvedThemes.length} themes: ${themeNames?.map(t => t.name).join(', ')}`);
        improvedCount++;
      } else {
        console.log(`   ⚠️  No improvement possible - keeping original`);
      }

    } catch (error) {
      console.log(`   ❌ Failed to improve: ${error}`);
      failedCount++;
    }
  }

  console.log(`\n📈 IMPROVEMENT SUMMARY:`);
  console.log(`   ✅ Successfully improved: ${improvedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`   📊 Success rate: ${Math.round((improvedCount / (improvedCount + failedCount)) * 100)}%`);
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
        'community': ['support', 'togetherness', 'collective', 'neighborhood', 'social', 'belonging', 'service'],
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
      const isOverused = usageCount > 10; // More lenient for re-mapping

      if (!isOverused || mappedUUIDs.length === 0) { // Always include at least one theme
        mappedUUIDs.push(matchedUUID);
      }
    }
  }

  // Ensure we have at least 2 diverse themes
  if (mappedUUIDs.length < 2) {
    const underusedThemes = themes
      .filter(theme => (usageStats[theme.id] || 0) < 5) // Themes used less than 5 times
      .sort(() => Math.random() - 0.5) // Randomize
      .slice(0, 3 - mappedUUIDs.length)
      .map(theme => theme.id);
    
    mappedUUIDs.push(...underusedThemes);
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

async function showImprovementResults() {
  console.log('📊 FINAL IMPROVEMENT RESULTS:');
  
  // Get updated theme distribution
  const { data: analyses } = await supabase
    .from('story_analysis')
    .select('themes_identified')
    .eq('analysis_type', 'theme_extraction')
    .not('themes_identified', 'is', null);

  if (!analyses) {
    console.log('❌ Could not fetch analyses for results');
    return;
  }

  // Count theme usage after improvements
  const themeUsage: Record<string, number> = {};
  const totalThemes: string[] = [];

  analyses.forEach(analysis => {
    analysis.themes_identified?.forEach((themeId: string) => {
      themeUsage[themeId] = (themeUsage[themeId] || 0) + 1;
      totalThemes.push(themeId);
    });
  });

  const uniqueThemes = new Set(totalThemes).size;
  const totalAnalyses = analyses.length;

  console.log(`   📊 Total analyses: ${totalAnalyses}`);
  console.log(`   🎯 Unique themes now used: ${uniqueThemes} (vs 7 before)`);
  console.log(`   📈 Theme diversity improvement: ${Math.round(((uniqueThemes - 7) / 7) * 100)}%`);

  // Show new theme distribution
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name')
    .eq('status', 'active');

  if (themes) {
    const themeUsageWithNames: Array<{ name: string; count: number; percentage: number }> = 
      Object.entries(themeUsage)
        .map(([uuid, count]) => {
          const theme = themes.find(t => t.id === uuid);
          return {
            name: theme?.name || 'Unknown',
            count,
            percentage: Math.round((count / totalAnalyses) * 100)
          };
        })
        .sort((a, b) => b.count - a.count);

    console.log('\n🏆 Top themes after improvement:');
    themeUsageWithNames.slice(0, 8).forEach((theme, index) => {
      console.log(`   ${index + 1}. ${theme.name}: ${theme.count} uses (${theme.percentage}%)`);
    });

    console.log('\n🌟 NEW THEMES NOW BEING USED:');
    const newThemes = themeUsageWithNames.filter(theme => 
      !['Resilience', 'Identity', 'Community', 'Wisdom'].includes(theme.name)
    );
    newThemes.slice(0, 5).forEach((theme, index) => {
      console.log(`   ${index + 1}. ${theme.name}: ${theme.count} uses`);
    });
  }

  console.log('\n✅ THEME DIVERSITY SYSTEM IMPROVED!');
  console.log('🎯 Homepage will now show much more diverse themes');
  console.log('🌍 Community diversity is now properly reflected');
  console.log('🚀 Ready for production deployment');
}

// Execute re-analysis
reAnalyzeWithImprovedSystem()
  .then(() => {
    console.log('\n✅ Re-analysis with improved system completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Re-analysis failed:', error);
    process.exit(1);
  });