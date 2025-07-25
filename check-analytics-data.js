import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAnalyticsData() {
  try {
    console.log('🔍 Checking analytics data...\n');

    // Check story_analysis table
    const { data: analyses, error: analysesError } = await supabase
      .from('story_analysis')
      .select('*')
      .limit(5);

    if (analysesError) {
      console.error('❌ Error querying story_analysis:', analysesError);
    } else {
      console.log(`📊 story_analysis table has ${analyses?.length || 0} records (showing first 5):`);
      console.log(analyses);
    }

    // Check specific query that the component uses
    const { data: themeAnalyses, error: themeError } = await supabase
      .from('story_analysis')
      .select(`
        themes_identified,
        primary_emotions,
        confidence_score,
        quality_score,
        processing_status,
        analysis_type
      `)
      .eq('analysis_type', 'theme_extraction')
      .eq('processing_status', 'completed');

    if (themeError) {
      console.error('❌ Error querying theme analyses:', themeError);
    } else {
      console.log(`\n🎯 Theme extraction analyses: ${themeAnalyses?.length || 0} records`);
      if (themeAnalyses && themeAnalyses.length > 0) {
        console.log('Sample record:', themeAnalyses[0]);
      }
    }

    // Check themes table
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('*')
      .eq('status', 'active')
      .limit(5);

    if (themesError) {
      console.error('❌ Error querying themes:', themesError);
    } else {
      console.log(`\n🏷️ Active themes: ${themes?.length || 0} records (showing first 5):`);
      console.log(themes);
    }

    // Check what analysis types exist
    const { data: analysisTypes, error: typesError } = await supabase
      .from('story_analysis')
      .select('analysis_type, processing_status')
      .neq('analysis_type', null);

    if (!typesError && analysisTypes) {
      const typeCount = analysisTypes.reduce((acc, item) => {
        const key = `${item.analysis_type}_${item.processing_status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      console.log('\n📈 Analysis type/status breakdown:');
      console.log(typeCount);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAnalyticsData();