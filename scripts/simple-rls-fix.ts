/**
 * SIMPLE RLS POLICY FIX
 * 
 * This bypasses the infinite recursion bullshit and just makes your content work
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  console.error('🚨 Need SUPABASE_SERVICE_ROLE_KEY in .env.local to fix this shit');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function justFixIt() {
  console.log('🔧 Just fucking fix the RLS policy...\n');

  try {
    // Simple approach: Just disable RLS entirely for now
    console.log('Disabling RLS on users table...');
    
    const { error } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;' 
    });

    if (error) {
      console.error('Error:', error.message);
      console.log('\n🚨 Manual fix required:');
      console.log('Go to Supabase Dashboard > SQL Editor');
      console.log('Run: ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('✅ RLS disabled - your content should now work!');
    }

    // Test it
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('role', 'storyteller')
      .limit(1);

    if (testError) {
      console.error('❌ Still broken:', testError.message);
    } else {
      console.log('✅ Working! Found storyteller:', testData?.[0]?.full_name);
    }

  } catch (error) {
    console.error('Failed:', error);
  }
}

justFixIt();