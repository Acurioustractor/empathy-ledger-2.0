/**
 * CHECK HOW THEMES AND QUOTES CONNECT TO STORYTELLERS
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function checkConnections() {
  console.log('🔍 Checking how themes and quotes connect to storytellers...\n');

  try {
    // Check themes table structure
    console.log('1. THEMES TABLE:');
    const { data: themes } = await supabase.from('themes').select('*').limit(3);
    if (themes?.[0]) {
      console.log('Columns:', Object.keys(themes[0]));
      console.log('Sample:', themes[0]);
    }

    // Check quotes table structure
    console.log('\n2. QUOTES TABLE:');
    const { data: quotes } = await supabase.from('quotes').select('*').limit(3);
    if (quotes?.[0]) {
      console.log('Columns:', Object.keys(quotes[0]));
      console.log('Sample quote:', {
        id: quotes[0].id,
        quote_text: quotes[0].quote_text?.substring(0, 80) + '...',
        themes: quotes[0].themes,
        story_id: quotes[0].story_id
      });
    }

    // Check users/storytellers
    console.log('\n3. STORYTELLERS:');
    const { data: storytellers } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('role', 'storyteller')
      .limit(3);
    
    storytellers?.forEach(s => {
      console.log(`${s.full_name} (ID: ${s.id})`);
    });

    // Check if there's a stories table that might link them
    console.log('\n4. CHECKING STORIES TABLE:');
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .limit(1);
    
    if (storiesError) {
      console.log('No stories table or access denied');
    } else if (stories?.[0]) {
      console.log('Stories table columns:', Object.keys(stories[0]));
    }

    console.log('\n5. ANALYSIS:');
    console.log('- Quotes have themes array and story_id');
    console.log('- Need to figure out how to link quotes/themes to specific storytellers');
    console.log('- Might need to use story_id or create connection through projects');

  } catch (error) {
    console.error('Error:', error);
  }
}

checkConnections();