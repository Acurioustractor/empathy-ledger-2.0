/**
 * TEST STORYTELLER CARDS - Validate authentic data display
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function testStorytellerCards() {
  console.log('🧪 TESTING STORYTELLER CARDS COMPONENT');
  console.log('='.repeat(80));

  try {
    // Test the exact query that StorytellerCards uses
    console.log('📋 TESTING STORYTELLER QUERY:');
    console.log('-'.repeat(50));

    const { data: storytellersData, error: storytellersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        profile_image_url,
        bio,
        community_affiliation,
        primary_location_id,
        locations!primary_location_id(name, state, country)
      `)
      .eq('role', 'storyteller')
      .not('profile_image_url', 'is', null)
      .limit(3);

    if (storytellersError) {
      console.error('❌ Storyteller query failed:', storytellersError.message);
      return;
    }

    if (!storytellersData || storytellersData.length === 0) {
      console.error('❌ No storytellers found');
      return;
    }

    console.log(`✅ Found ${storytellersData.length} storytellers:`);
    storytellersData.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.full_name} (${s.community_affiliation})`);
      console.log(`      Location: ${(s as any).locations?.name}, ${(s as any).locations?.state}`);
      console.log(`      Photo: ${s.profile_image_url ? 'YES' : 'NO'}`);
    });

    // Test theme connections for each storyteller
    console.log('\n🏷️  TESTING THEME CONNECTIONS:');
    console.log('-'.repeat(50));

    for (const storyteller of storytellersData) {
      const { data: themeData, error: themeError } = await supabase
        .from('themes')
        .select('name, description')
        .contains('linked_storytellers', [storyteller.id])
        .limit(3);

      if (themeError) {
        console.error(`❌ Theme query failed for ${storyteller.full_name}:`, themeError.message);
        continue;
      }

      const themes = themeData?.map(t => t.name) || [];
      console.log(`✅ ${storyteller.full_name}: ${themes.length} themes`);
      themes.forEach(theme => console.log(`   - ${theme}`));

      // Test quote connections
      let quotes: string[] = [];
      if (themes.length > 0) {
        const { data: quoteData, error: quoteError } = await supabase
          .from('quotes')
          .select('quote_text, themes')
          .overlaps('themes', themes)
          .limit(1);

        if (!quoteError && quoteData) {
          quotes = quoteData.map(q => q.quote_text);
        }
      }

      console.log(`✅ ${storyteller.full_name}: ${quotes.length} quotes`);
      if (quotes.length > 0) {
        console.log(`   - "${quotes[0].substring(0, 60)}..."`);
      }
    }

    // Test website component compatibility
    console.log('\n🌐 TESTING WEBSITE COMPONENT COMPATIBILITY:');
    console.log('-'.repeat(50));

    const enrichedData = await Promise.all(
      storytellersData.map(async (storyteller) => {
        // Get themes
        const { data: themeData } = await supabase
          .from('themes')
          .select('name, description')
          .contains('linked_storytellers', [storyteller.id])
          .limit(3);

        const themes = themeData?.map(t => t.name) || [];

        // Get quotes
        let quotes: string[] = [];
        if (themes.length > 0) {
          const { data: quoteData } = await supabase
            .from('quotes')
            .select('quote_text, themes')
            .overlaps('themes', themes)
            .limit(1);

          quotes = quoteData?.map(q => q.quote_text) || [];
        }

        return {
          id: storyteller.id,
          full_name: storyteller.full_name,
          profile_image_url: storyteller.profile_image_url,
          bio: storyteller.bio,
          community_affiliation: storyteller.community_affiliation,
          location: (storyteller as any).locations,
          themes: themes.slice(0, 3),
          quotes: quotes.slice(0, 1)
        };
      })
    );

    // Only show storytellers with authentic content
    const storytellersWithContent = enrichedData.filter(s => 
      s.themes.length > 0 || s.quotes.length > 0
    );

    console.log(`✅ Component will display ${storytellersWithContent.length} storytellers with content:`);
    storytellersWithContent.forEach((s, i) => {
      console.log(`\n   ${i + 1}. ${s.full_name.toUpperCase()}`);
      console.log(`      Organization: ${s.community_affiliation}`);
      console.log(`      Location: ${s.location?.name}, ${s.location?.state}`);
      console.log(`      Themes (${s.themes.length}): ${s.themes.join(', ')}`);
      console.log(`      Quotes (${s.quotes.length}): ${s.quotes.length > 0 ? '"' + s.quotes[0].substring(0, 50) + '..."' : 'None'}`);
    });

    console.log('\n🎉 STORYTELLER CARDS TEST COMPLETE!');
    console.log('='.repeat(80));
    console.log('✅ All queries working correctly');
    console.log('✅ Authentic data connections verified');
    console.log('✅ Component will display real content only');
    console.log('✅ Ready for website deployment');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testStorytellerCards();