/**
 * Debug script to test failing Supabase queries
 * 
 * This script will:
 * 1. Check what tables and columns actually exist
 * 2. Test the exact queries that are failing from the browser console
 * 3. Provide detailed error analysis and recommendations
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugSupabaseQueries() {
  console.log('🔍 Starting Supabase query debugging...\n');
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('Looking for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully\n');

    // 1. Check database schema - list all tables
    console.log('📋 Checking available tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('⚠️  Could not query information_schema, trying alternative approach...');
      console.log('Error:', tablesError.message);
    } else {
      console.log('Available tables:', tables?.map(t => t.table_name) || []);
    }

    // 2. Check users table structure
    console.log('\n🔍 Checking users table...');
    const { data: usersTest, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table accessible');
      if (usersTest && usersTest.length > 0) {
        console.log('Users table columns:', Object.keys(usersTest[0]));
      }
    }

    // 3. Check quotes table structure  
    console.log('\n🔍 Checking quotes table...');
    const { data: quotesTest, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);

    if (quotesError) {
      console.log('❌ Quotes table error:', quotesError);
    } else {
      console.log('✅ Quotes table accessible');
      if (quotesTest && quotesTest.length > 0) {
        console.log('Quotes table columns:', Object.keys(quotesTest[0]));
      }
    }

    // 4. Check locations table structure
    console.log('\n🔍 Checking locations table...');
    const { data: locationsTest, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .limit(1);

    if (locationsError) {
      console.log('❌ Locations table error:', locationsError);
    } else {
      console.log('✅ Locations table accessible');
      if (locationsTest && locationsTest.length > 0) {
        console.log('Locations table columns:', Object.keys(locationsTest[0]));
      }
    }

    // 5. Test the exact failing query 1 - Users with storyteller role
    console.log('\n🧪 Testing failing users query...');
    console.log('Query: users?select=id,full_name,profile_image_url,bio,community_affiliation,primary_location_id,project_id,locations!primary_location_id(id,name,state,country)&role=eq.storyteller&profile_image_url=not.is.null&limit=3');
    
    const { data: usersQuery, error: usersQueryError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        profile_image_url,
        bio,
        community_affiliation,
        primary_location_id,
        project_id,
        locations!primary_location_id(
          id,
          name,
          state,
          country
        )
      `)
      .eq('role', 'storyteller')
      .not('profile_image_url', 'is', null)
      .limit(3);

    if (usersQueryError) {
      console.log('❌ Users query failed:', usersQueryError);
    } else {
      console.log('✅ Users query successful, returned', usersQuery?.length || 0, 'records');
    }

    // 6. Test the exact failing query 2 - Quotes with themes
    console.log('\n🧪 Testing failing quotes query...');
    console.log('Query: quotes?select=id,quote,context,themes&limit=3&themes=ov.{innovation}');
    
    const { data: quotesQuery, error: quotesQueryError } = await supabase
      .from('quotes')
      .select('id, quote, context, themes')
      .overlaps('themes', ['innovation'])
      .limit(3);

    if (quotesQueryError) {
      console.log('❌ Quotes query failed:', quotesQueryError);
    } else {
      console.log('✅ Quotes query successful, returned', quotesQuery?.length || 0, 'records');
    }

    // 7. Check if 'role' column exists in users table
    console.log('\n🔍 Checking for role column in users table...');
    const { data: roleCheck, error: roleCheckError } = await supabase
      .from('users')
      .select('role')
      .limit(1);

    if (roleCheckError) {
      console.log('❌ Role column check failed:', roleCheckError);
      console.log('💡 This suggests the role column may not exist in the users table');
    } else {
      console.log('✅ Role column exists in users table');
    }

    // 8. Check if 'themes' column exists and its structure in quotes table
    console.log('\n🔍 Checking themes column in quotes table...');
    const { data: themesCheck, error: themesCheckError } = await supabase
      .from('quotes')
      .select('themes')
      .limit(1);

    if (themesCheckError) {
      console.log('❌ Themes column check failed:', themesCheckError);
      console.log('💡 This suggests the themes column may not exist in the quotes table');
    } else {
      console.log('✅ Themes column exists in quotes table');
      if (themesCheck && themesCheck.length > 0) {
        console.log('Sample themes value:', themesCheck[0].themes);
        console.log('Themes data type:', typeof themesCheck[0].themes);
      }
    }

    console.log('\n🎯 Debug session completed!');

  } catch (error) {
    console.error('💥 Unexpected error during debugging:', error);
  }
}

// Helper function to check specific columns exist
async function checkColumnExists(supabase: any, tableName: string, columnName: string) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

// Run the debug script
debugSupabaseQueries().catch(console.error);

export { debugSupabaseQueries };