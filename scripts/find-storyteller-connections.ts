/**
 * FIND ACTUAL CONNECTIONS BETWEEN STORYTELLERS, QUOTES, AND THEMES
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function findConnections() {
  console.log('🔗 Finding actual connections for storytellers...\n');

  try {
    // Get our 3 main storytellers
    const storytellers = [
      { name: 'Terina Ahone-Masafi', id: '2408a7dc-ee69-49a3-beea-b1afbdfac92a' },
      { name: 'Bernie Moran', id: '5801c5b2-bfbe-406f-971c-f12ddec6e57e' },
      { name: 'Pam Wellham', id: '0c625620-c061-4113-9e44-53ae740bde7a' }
    ];

    for (const storyteller of storytellers) {
      console.log(`\n📱 ${storyteller.name.toUpperCase()}:`);
      console.log('='.repeat(50));

      // Find stories linked to this storyteller
      const { data: stories } = await supabase
        .from('stories')
        .select('id, title, linked_storytellers, linked_quotes, linked_themes')
        .contains('linked_storytellers', [storyteller.id]);

      if (stories && stories.length > 0) {
        console.log(`✅ Found ${stories.length} linked stories`);
        
        for (const story of stories) {
          console.log(`\n  📖 Story: ${story.title || 'Untitled'}`);
          
          // Get quotes from this story
          if (story.linked_quotes && story.linked_quotes.length > 0) {
            const { data: quotes } = await supabase
              .from('quotes')
              .select('quote_text, themes')
              .in('id', story.linked_quotes)
              .limit(2);

            quotes?.forEach((quote, i) => {
              console.log(`    💬 Quote ${i + 1}: "${quote.quote_text?.substring(0, 60)}..."`);
              console.log(`       Themes: ${quote.themes?.join(', ') || 'None'}`);
            });
          }

          // Get themes from this story
          if (story.linked_themes && story.linked_themes.length > 0) {
            const { data: themes } = await supabase
              .from('themes')
              .select('name, description')
              .in('id', story.linked_themes)
              .limit(3);

            console.log(`    🏷️  Themes: ${themes?.map(t => t.name).join(', ') || 'None'}`);
          }
        }
      } else {
        console.log('❌ No stories directly linked');
        
        // Try to find quotes by matching themes or other connections
        const { data: allQuotes } = await supabase
          .from('quotes')
          .select('quote_text, themes')
          .limit(50);

        // For now, let's assign quotes based on themes that might relate to their organizations
        const orgThemes = storyteller.name === 'Terina Ahone-Masafi' ? ['Community Support', 'Social Impact'] :
                         storyteller.name === 'Bernie Moran' ? ['Innovation', 'Technology'] :
                         ['Community Support', 'Sustainability'];

        const relatedQuotes = allQuotes?.filter(q => 
          q.themes?.some(theme => orgThemes.some(orgTheme => 
            theme.toLowerCase().includes(orgTheme.toLowerCase()) ||
            orgTheme.toLowerCase().includes(theme.toLowerCase())
          ))
        ).slice(0, 2);

        console.log(`🔍 Found ${relatedQuotes?.length || 0} potentially related quotes by theme matching`);
        relatedQuotes?.forEach((quote, i) => {
          console.log(`    💬 Quote ${i + 1}: "${quote.quote_text?.substring(0, 60)}..."`);
          console.log(`       Themes: ${quote.themes?.join(', ') || 'None'}`);
        });
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log('- Stories table has linked_storytellers, linked_quotes, linked_themes arrays');
    console.log('- Need to use these arrays to connect storytellers to their content');
    console.log('- Can fall back to theme-based matching if no direct links exist');

  } catch (error) {
    console.error('Error:', error);
  }
}

findConnections();