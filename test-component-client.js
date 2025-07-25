// Test using the same client as the component
import { createClient } from './src/lib/supabase.ts';

async function testComponentClient() {
  const supabase = createClient();
  
  console.log('🧪 Testing with component client...');
  
  // Test story_analysis access
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
    console.error('❌ Error accessing story_analysis:', analysesError);
  } else {
    console.log(`✅ Found ${analyses?.length || 0} story_analysis records`);
  }
  
  // Test themes access
  const { data: themes, error: themesError } = await supabase
    .from('themes')
    .select('id, name, category')
    .eq('status', 'active');

  if (themesError) {
    console.error('❌ Error accessing themes:', themesError);
  } else {
    console.log(`✅ Found ${themes?.length || 0} themes records`);
  }
  
  // Test basic auth
  const { data: { user } } = await supabase.auth.getUser();
  console.log('👤 Current user:', user ? 'Authenticated' : 'Anonymous');
}

testComponentClient();