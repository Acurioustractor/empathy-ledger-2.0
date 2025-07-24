/**
 * TEST THE QUICK FIX
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function testQuickFix() {
  console.log('🧪 Testing if RLS fix worked...\n');

  try {
    // Test storyteller query that was failing
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, profile_image_url')
      .eq('role', 'storyteller')
      .limit(3);

    if (error) {
      console.error('❌ Still broken:', error.message);
      if (error.message.includes('infinite recursion')) {
        console.log('\n🚨 You need to run the SQL fix first:');
        console.log('Go to Supabase Dashboard > SQL Editor');
        console.log('Run the contents of: scripts/simple-fix-rls.sql');
      }
    } else {
      console.log('✅ SUCCESS! RLS policy is fixed.');
      console.log('Found', data?.length || 0, 'storytellers');
      if (data?.[0]) {
        console.log('Sample:', data[0].full_name);
      }
      console.log('\n🎉 Your website should now work without 500 errors!');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testQuickFix();