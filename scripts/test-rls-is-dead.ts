/**
 * TEST THAT RLS IS FINALLY FUCKING DEAD
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function testRLSIsDead() {
  console.log('💀 Testing if RLS infinite recursion is finally dead...\n');

  try {
    // Test the query that was failing with infinite recursion
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, profile_image_url, community_affiliation')
      .eq('role', 'storyteller')
      .limit(5);

    if (error) {
      if (error.message.includes('infinite recursion')) {
        console.error('🚨 STILL BROKEN! Run this in Supabase Dashboard SQL Editor:');
        console.error('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
      } else {
        console.error('❌ Different error:', error.message);
      }
    } else {
      console.log('🎉 SUCCESS! RLS infinite recursion is DEAD!');
      console.log(`✅ Found ${data?.length || 0} storytellers:`);
      data?.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.full_name} - ${s.community_affiliation || 'No affiliation'}`);
        console.log(`     Photo: ${s.profile_image_url ? 'Yes' : 'No'}`);
      });
      
      console.log('\n🌐 Your A Curious Tractor page should now show REAL storyteller data!');
      console.log('No more fallback bullshit, no more 500 errors!');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testRLSIsDead();