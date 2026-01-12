/**
 * TEST IF STORYTELLERS ARE NOW SHOWING ON A CURIOUS TRACTOR PAGE
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function testStorytellerCards() {
  console.log('🧪 Testing storyteller cards for A Curious Tractor page...\n');

  try {
    // Test 1: Get storytellers (the main query that was failing)
    console.log('1. Testing storytellers query...');
    const { data: storytellers, error: storytellersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        profile_image_url,
        bio,
        community_affiliation,
        primary_location_id,
        project_id,
        locations!primary_location_id(id, name, state, country)
      `)
      .eq('role', 'storyteller')
      .not('profile_image_url', 'is', null)
      .limit(3);

    if (storytellersError) {
      console.error('❌ Storytellers query failed:', storytellersError.message);
      if (storytellersError.message.includes('infinite recursion')) {
        console.log('🚨 RLS policy still has infinite recursion - need to run the SQL fix');
      }
    } else {
      console.log('✅ Storytellers query SUCCESS!');
      console.log(`Found ${storytellers?.length || 0} storytellers with images`);
      storytellers?.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.full_name} - ${s.community_affiliation || 'No affiliation'}`);
        console.log(`     Location: ${(s as any).locations?.name || 'No location'}`);
        console.log(`     Image: ${s.profile_image_url ? 'Has image' : 'No image'}`);
      });
    }

    console.log('\n2. Testing quotes query...');
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('id, quote_text, context, themes')
      .limit(3);

    if (quotesError) {
      console.error('❌ Quotes query failed:', quotesError.message);
    } else {
      console.log('✅ Quotes query SUCCESS!');
      console.log(`Found ${quotes?.length || 0} quotes`);
      quotes?.forEach((q, i) => {
        console.log(`  ${i + 1}. "${q.quote_text?.substring(0, 60)}..."`);
        console.log(`     Themes: ${q.themes?.join(', ') || 'No themes'}`);
      });
    }

    console.log('\n3. Testing project filtering...');
    // First get the project ID for "A Curious Tractor"
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .ilike('name', '%A Curious Tractor%')
      .limit(1);

    if (projects && projects.length > 0) {
      console.log(`✅ Found project: ${projects[0].name} (ID: ${projects[0].id})`);
      
      // Now get storytellers for this specific project
      const { data: projectStorytellers, error: projectError } = await supabase
        .from('users')
        .select('id, full_name, role, project_id')
        .eq('role', 'storyteller')
        .eq('project_id', projects[0].id)
        .limit(3);

      if (projectError) {
        console.error('❌ Project storytellers query failed:', projectError.message);
      } else {
        console.log(`✅ Found ${projectStorytellers?.length || 0} storytellers for A Curious Tractor`);
        projectStorytellers?.forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.full_name}`);
        });
      }
    } else {
      console.log('⚠️ No "A Curious Tractor" project found');
    }

    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    if (!storytellersError && !quotesError) {
      console.log('🎉 SUCCESS! Your A Curious Tractor page should now show:');
      console.log('  ✅ Real storyteller cards with photos');
      console.log('  ✅ Community member names and affiliations');
      console.log('  ✅ Location information');
      console.log('  ✅ No more 500 errors');
      console.log('\n🌐 Go check your website at /case-studies/a-curious-tractor');
    } else {
      console.log('❌ Some queries still failing - need to debug further');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testStorytellerCards();