/**
 * Supabase Connection Test Script
 * Tests if the Supabase project is accessible and healthy
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Basic connectivity
    console.log('\n1️⃣ Testing basic connectivity...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('⚠️  Database schema not yet created');
        return 'schema_missing';
      } else if (
        error.message.includes('timeout') ||
        error.message.includes('connection')
      ) {
        console.log('❌ Project appears to be paused or unreachable');
        console.log('Error:', error.message);
        return 'paused';
      } else {
        console.log('❌ Database error:', error.message);
        return 'error';
      }
    }

    // Test 2: Health check
    console.log('✅ Basic connectivity successful');
    console.log('\n2️⃣ Testing health endpoint...');

    const healthCheck = await fetch(`${supabaseUrl}/health`);
    if (healthCheck.ok) {
      console.log('✅ Health check passed');
    } else {
      console.log('⚠️  Health endpoint not accessible');
    }

    // Test 3: Auth functionality
    console.log('\n3️⃣ Testing auth functionality...');
    const { data: authData, error: authError } =
      await supabase.auth.getSession();
    if (!authError) {
      console.log('✅ Auth system accessible');
    } else {
      console.log('⚠️  Auth error:', authError.message);
    }

    return 'healthy';
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return 'failed';
  }
}

async function checkTables() {
  console.log('\n4️⃣ Checking database schema...');

  const expectedTables = [
    'profiles',
    'stories',
    'communities',
    'organizations',
    'community_members',
    'consent_records',
    'audit_logs',
  ];

  const results = {};

  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        results[table] = '✅ Exists';
      } else if (error.message.includes('does not exist')) {
        results[table] = '❌ Missing';
      } else {
        results[table] = `⚠️  Error: ${error.message}`;
      }
    } catch (err) {
      results[table] = `❌ Failed: ${err.message}`;
    }
  }

  console.log('\nTable Status:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`  ${table}: ${status}`);
  });

  return results;
}

async function main() {
  const status = await testConnection();

  console.log('\n📊 CONNECTION SUMMARY');
  console.log('='.repeat(50));

  switch (status) {
    case 'healthy':
      console.log('🟢 Project Status: HEALTHY');
      console.log('✅ Ready for walkthrough testing');
      await checkTables();
      break;

    case 'paused':
      console.log('🟡 Project Status: PAUSED');
      console.log('📋 Action needed: Go to https://supabase.com/dashboard');
      console.log('   1. Find your Empathy Ledger project');
      console.log('   2. Click "Restart Project"');
      console.log('   3. Wait 2-3 minutes for restart');
      console.log('   4. Run this test again');
      break;

    case 'schema_missing':
      console.log('🟡 Project Status: NO SCHEMA');
      console.log('📋 Action needed: Set up database schema');
      console.log('   1. Go to SQL Editor in Supabase dashboard');
      console.log('   2. Run the schema.sql file contents');
      console.log('   3. Run privacy-schema.sql and organization-schema.sql');
      break;

    default:
      console.log('🔴 Project Status: ERROR');
      console.log('📋 Action needed: Check project configuration');
  }

  console.log(
    '\n🔗 Project Dashboard:',
    `https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}`
  );
}

main().catch(console.error);
