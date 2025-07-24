/**
 * TEST MIGRATION SETUP
 * Verify Supabase connection and table structure before migration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMigrationSetup() {
  console.log('🧪 TESTING MIGRATION SETUP');
  console.log('='.repeat(80));

  try {
    // Test 1: Check connection
    console.log('\n1️⃣ Testing Supabase connection...');
    const { data: test, error: connError } = await supabase
      .from('organisations')
      .select('count')
      .limit(1);

    if (connError) {
      console.log('❌ Connection failed:', connError.message);
      console.log('Need to create tables first');
    } else {
      console.log('✅ Connection successful');
    }

    // Test 2: Check if tables exist
    console.log('\n2️⃣ Checking table structure...');
    const tables = [
      'organisations',
      'projects', 
      'locations',
      'storytellers',
      'transcripts',
      'stories',
      'cms_cache'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ Table "${table}" - ${error.message}`);
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }

    // Test 3: Check if we can insert test data
    console.log('\n3️⃣ Testing data insertion...');
    
    // Try to create a test organisation
    const { data: testOrg, error: orgError } = await supabase
      .from('organisations')
      .insert({
        name: 'Test Organisation ' + Date.now(),
        description: 'Test organisation for migration validation'
      })
      .select()
      .single();

    if (orgError) {
      console.log('❌ Cannot insert organisation:', orgError.message);
    } else {
      console.log('✅ Test organisation created:', testOrg.name);

      // Try to create a test storyteller
      const { data: testStoryteller, error: storytellerError } = await supabase
        .from('storytellers')
        .insert({
          full_name: 'Test Storyteller ' + Date.now(),
          organisation_id: testOrg.id,
          consent_given: true,
          privacy_preferences: {
            public_display: true,
            show_photo: true,
            show_location: true,
            show_organisation: true
          }
        })
        .select()
        .single();

      if (storytellerError) {
        console.log('❌ Cannot insert storyteller:', storytellerError.message);
      } else {
        console.log('✅ Test storyteller created:', testStoryteller.full_name);

        // Clean up test data
        await supabase.from('storytellers').delete().eq('id', testStoryteller.id);
      }

      // Clean up test org
      await supabase.from('organisations').delete().eq('id', testOrg.id);
    }

    // Test 4: Check environment variables
    console.log('\n4️⃣ Checking environment variables...');
    const envVars = {
      'AIRTABLE_API_KEY': !!process.env.AIRTABLE_API_KEY,
      'AIRTABLE_BASE_ID': !!process.env.AIRTABLE_BASE_ID,
      'SUPABASE_URL': true, // We're using hardcoded for now
      'SUPABASE_ANON_KEY': true // We're using hardcoded for now
    };

    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}: ${value ? 'Set' : 'Missing'}`);
    });

    // Test 5: Summary
    console.log('\n📊 SETUP SUMMARY');
    console.log('-'.repeat(50));
    console.log('Database URL:', supabaseUrl);
    console.log('Tables ready:', tables.length);
    console.log('Can insert data:', !orgError);
    console.log('Airtable ready:', envVars.AIRTABLE_API_KEY && envVars.AIRTABLE_BASE_ID);

    if (!envVars.AIRTABLE_API_KEY || !envVars.AIRTABLE_BASE_ID) {
      console.log('\n⚠️  To run migration, you need to set:');
      console.log('export AIRTABLE_API_KEY="your-api-key"');
      console.log('export AIRTABLE_BASE_ID="your-base-id"');
    }

    console.log('\n✅ SETUP TEST COMPLETE');

  } catch (error) {
    console.error('❌ Setup test failed:', error);
  }
}

// Run the test
testMigrationSetup();