import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAnalyticsData() {
  try {
    console.log('🔍 Debugging analytics data processing...\n');

    // Get the exact same data the component uses
    const { data: analyses, error: analysesError } = await supabase
      .from('story_analysis')
      .select(`
        themes_identified,
        primary_emotions,
        confidence_score,
        quality_score,
        processing_status,
        results
      `)
      .eq('analysis_type', 'theme_extraction')
      .eq('processing_status', 'completed');

    if (analysesError) {
      console.error('❌ Error querying analyses:', analysesError);
      return;
    }

    console.log(`📊 Found ${analyses?.length || 0} completed theme extraction analyses`);

    // Get theme data
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('id, name, category')
      .eq('status', 'active');

    if (themesError) {
      console.error('❌ Error querying themes:', themesError);
      return;
    }

    console.log(`🏷️ Found ${themes?.length || 0} active themes`);

    if (!analyses || !themes) {
      console.log('❌ Missing data - stopping analysis');
      return;
    }

    // Simulate the component's data processing
    const themeMap = new Map(themes.map(t => [t.id, { name: t.name, category: t.category }]));
    const themeFrequency = new Map();
    const emotionFrequency = new Map();
    
    let totalConfidence = 0;
    let confidenceCount = 0;
    let recordsWithThemes = 0;
    let recordsWithEmotions = 0;

    console.log('\n🔄 Processing each analysis record...');
    
    analyses.forEach((analysis, index) => {
      console.log(`\n--- Record ${index + 1} ---`);
      console.log('themes_identified:', analysis.themes_identified);
      console.log('primary_emotions:', analysis.primary_emotions);
      console.log('confidence_score:', analysis.confidence_score);
      
      // Check themes_identified array
      if (analysis.themes_identified && analysis.themes_identified.length > 0) {
        console.log(`✅ Has ${analysis.themes_identified.length} themes_identified`);
        recordsWithThemes++;
        analysis.themes_identified.forEach((themeId) => {
          const themeInfo = themeMap.get(themeId);
          if (themeInfo) {
            console.log(`  - Found theme: ${themeInfo.name} (${themeInfo.category})`);
            const existing = themeFrequency.get(themeId) || { ...themeInfo, count: 0 };
            existing.count += 1;
            themeFrequency.set(themeId, existing);
          } else {
            console.log(`  - Theme ID ${themeId} not found in themes table`);
          }
        });
      } else {
        console.log('❌ No themes_identified');
        
        // Check results.themes as fallback
        if (analysis.results?.themes) {
          console.log('🔍 Checking results.themes:', analysis.results.themes);
          
          const resultThemes = analysis.results.themes.map((t) => {
            if (typeof t === 'string') return t;
            if (t.name) return t.name;
            if (t.theme) return t.theme;
            return null;
          }).filter(Boolean);
          
          if (resultThemes.length > 0) {
            console.log(`📝 Found ${resultThemes.length} themes in results:`, resultThemes);
            recordsWithThemes++;
            
            resultThemes.forEach((themeName) => {
              const matchingTheme = themes.find(t => 
                t.name.toLowerCase() === themeName.toLowerCase() ||
                themeName.toLowerCase().includes(t.name.toLowerCase())
              );
              
              if (matchingTheme) {
                console.log(`  ✅ Matched "${themeName}" to "${matchingTheme.name}"`);
                const existing = themeFrequency.get(matchingTheme.id) || { 
                  name: matchingTheme.name, 
                  category: matchingTheme.category, 
                  count: 0 
                };
                existing.count += 1;
                themeFrequency.set(matchingTheme.id, existing);
              } else {
                console.log(`  ❓ No match for theme: "${themeName}"`);
                // Create synthetic theme
                const syntheticId = `synthetic_${themeName.toLowerCase().replace(/\\s+/g, '_')}`;
                const existing = themeFrequency.get(syntheticId) || { 
                  name: themeName, 
                  category: 'uncategorized', 
                  count: 0 
                };
                existing.count += 1;
                themeFrequency.set(syntheticId, existing);
                console.log(`  📝 Created synthetic theme: "${themeName}"`);
              }
            });
          }
        }
      }

      // Process emotions
      if (analysis.primary_emotions && analysis.primary_emotions.length > 0) {
        console.log(`✅ Has ${analysis.primary_emotions.length} emotions`);
        recordsWithEmotions++;
        analysis.primary_emotions.forEach((emotion) => {
          const count = emotionFrequency.get(emotion) || 0;
          emotionFrequency.set(emotion, count + 1);
        });
      } else {
        console.log('❌ No primary_emotions');
      }

      // Process confidence
      if (analysis.confidence_score !== null) {
        totalConfidence += analysis.confidence_score;
        confidenceCount += 1;
      }
    });

    console.log('\n📈 SUMMARY:');
    console.log(`Total analyses processed: ${analyses.length}`);
    console.log(`Records with themes: ${recordsWithThemes}`);
    console.log(`Records with emotions: ${recordsWithEmotions}`);
    console.log(`Unique themes found: ${themeFrequency.size}`);
    console.log(`Unique emotions found: ${emotionFrequency.size}`);
    console.log(`Average confidence: ${confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 100) : 0}%`);

    console.log('\n🎯 TOP THEMES:');
    const topThemes = Array.from(themeFrequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    topThemes.forEach((theme, i) => {
      console.log(`${i + 1}. ${theme.name} (${theme.category}): ${theme.count} times`);
    });

    console.log('\n💫 TOP EMOTIONS:');
    const topEmotions = Array.from(emotionFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    topEmotions.forEach(([emotion, count], i) => {
      console.log(`${i + 1}. ${emotion}: ${count} times`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAnalyticsData();