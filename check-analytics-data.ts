#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAnalyticsData() {
  console.log('🔍 CHECKING ANALYTICS DATA AVAILABILITY');
  console.log('=====================================\n');

  // Check transcript analysis results
  const { data: analyses } = await supabase
    .from('story_analysis')
    .select('id, transcript_id, themes_identified, primary_emotions, confidence_score, created_at')
    .order('created_at', { ascending: false });

  console.log('📊 AI ANALYSIS RESULTS:');
  console.log(`   Total analyses: ${analyses?.length || 0}`);
  
  if (analyses && analyses.length > 0) {
    console.log(`   Latest analysis: ${analyses[0].created_at}`);
    console.log(`   Average confidence: ${Math.round((analyses.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / analyses.length) * 100)}%`);
    
    // Theme distribution
    const allThemes: string[] = [];
    analyses.forEach(a => {
      if (a.themes_identified) {
        allThemes.push(...a.themes_identified);
      }
    });
    
    const themeFreq: Record<string, number> = {};
    allThemes.forEach(theme => {
      themeFreq[theme] = (themeFreq[theme] || 0) + 1;
    });
    
    console.log(`   Unique themes identified: ${Object.keys(themeFreq).length}`);
    console.log(`   Most common themes: ${Object.entries(themeFreq).sort(([,a], [,b]) => b - a).slice(0, 3).map(([theme, count]) => `${theme}(${count})`).join(', ')}`);
  }

  // Check quotes extracted
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, extracted_by_ai')
    .eq('extracted_by_ai', true);

  console.log(`\n💬 AI-EXTRACTED QUOTES: ${quotes?.length || 0}`);

  // Check themes table
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name, category')
    .eq('status', 'active')
    .order('name');

  console.log(`\n🎯 AVAILABLE THEMES: ${themes?.length || 0}`);
  if (themes && themes.length > 0) {
    const categories = [...new Set(themes.map(t => t.category))].filter(Boolean);
    console.log(`   Categories: ${categories.join(', ')}`);
  }

  console.log('\n✅ Data ready for analytics dashboard showcase!');
}

checkAnalyticsData().catch(console.error);