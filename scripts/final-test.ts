/**
 * FINAL TEST - MAKE SURE EVERYTHING IS WORKING
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function finalTest() {
  console.log('🏁 FINAL TEST - A Curious Tractor Storyteller Cards\n');

  try {
    // Test the exact query your component uses
    const { data: storytellers, error } = await supabase
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

    if (error) {
      console.error('❌ STILL BROKEN:', error.message);
    } else {
      console.log('🎉 SUCCESS! Your A Curious Tractor page will show:');
      console.log('='.repeat(60));
      
      storytellers?.forEach((s, i) => {
        console.log(`\n📱 CARD ${i + 1}:`);
        console.log(`   Name: ${s.full_name}`);
        console.log(`   Organization: ${s.community_affiliation || 'None'}`);
        console.log(`   Location: ${(s as any).locations?.name || 'No location'} ${(s as any).locations?.state ? `, ${(s as any).locations.state}` : ''}`);
        console.log(`   Photo: ${s.profile_image_url ? '✅ Yes' : '❌ No'}`);
        console.log(`   Bio: ${s.bio ? s.bio.substring(0, 50) + '...' : 'No bio'}`);
      });

      console.log('\n' + '='.repeat(60));
      console.log('🌐 GO CHECK YOUR WEBSITE NOW:');
      console.log('   http://localhost:3006/case-studies/a-curious-tractor');
      console.log('\n✅ You should see REAL storyteller data, not fallback!');
      console.log('✅ No more 500 errors in browser console!');
      console.log('✅ Real photos, names, and organizations!');
    }

  } catch (error) {
    console.error('💥 Final test failed:', error);
  }
}

finalTest();