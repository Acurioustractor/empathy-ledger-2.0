/**
 * Database schema analysis script
 * Checks actual table structures and RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function analyzeDatabase() {
  console.log('🔍 Analyzing database schema...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase service role key for admin access');
    console.log('Need SUPABASE_SERVICE_ROLE_KEY to bypass RLS policies');
    return;
  }
  
  // Use service role key to bypass RLS policies
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('✅ Admin Supabase client created\n');

  try {
    // 1. Check users table structure with admin privileges
    console.log('🔍 Checking users table with admin access...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Users table still has issues:', usersError);
    } else {
      console.log('✅ Users table accessible with admin privileges');
      if (usersData && usersData.length > 0) {
        console.log('Users table columns:', Object.keys(usersData[0]));
      } else {
        console.log('Users table is empty, checking structure...');
        
        // Try to get table structure from PostgreSQL system catalogs
        const { data: userColumns, error: columnsError } = await supabase
          .rpc('get_table_columns', { table_name: 'users' });
        
        if (columnsError) {
          console.log('Could not get column info:', columnsError);
        } else {
          console.log('User table structure:', userColumns);
        }
      }
    }

    // 2. Check quotes table structure 
    console.log('\n🔍 Checking quotes table structure...');
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);

    if (quotesError) {
      console.log('❌ Quotes table error:', quotesError);
    } else {
      console.log('✅ Quotes table accessible');
      if (quotesData && quotesData.length > 0) {
        console.log('Quotes table columns:', Object.keys(quotesData[0]));
      }
    }

    // 3. Test corrected queries
    console.log('\n🧪 Testing corrected queries...');
    
    // Test quotes query with correct column name
    console.log('\nTesting quotes query with quote_text instead of quote...');
    const { data: correctQuotesQuery, error: correctQuotesError } = await supabase
      .from('quotes')
      .select('id, quote_text, context, themes')
      .overlaps('themes', ['Innovation'])
      .limit(3);

    if (correctQuotesError) {
      console.log('❌ Corrected quotes query failed:', correctQuotesError);
    } else {
      console.log('✅ Corrected quotes query successful!');
      console.log(`Found ${correctQuotesQuery?.length || 0} records`);
      if (correctQuotesQuery && correctQuotesQuery.length > 0) {
        console.log('Sample result:', correctQuotesQuery[0]);
      }
    }

    // Test users query if we can determine the correct structure
    console.log('\nTesting users query if accessible...');
    if (usersData && usersData.length > 0) {
      const userColumns = Object.keys(usersData[0]);
      
      // Build a safe select query with available columns
      const safeColumns = ['id'];
      const desiredColumns = ['full_name', 'profile_image_url', 'bio', 'community_affiliation', 'primary_location_id', 'project_id'];
      
      desiredColumns.forEach(col => {
        if (userColumns.includes(col)) {
          safeColumns.push(col);
        }
      });

      console.log('Testing with available columns:', safeColumns);
      
      const { data: safeUsersQuery, error: safeUsersError } = await supabase
        .from('users')
        .select(safeColumns.join(', '))
        .not('profile_image_url', 'is', null)
        .limit(3);

      if (safeUsersError) {
        console.log('❌ Safe users query failed:', safeUsersError);
      } else {
        console.log('✅ Safe users query successful!');
        console.log(`Found ${safeUsersQuery?.length || 0} records`);
      }
    }

    // 4. Check for RLS policies on users table
    console.log('\n🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users');

    if (policiesError) {
      console.log('Could not check policies:', policiesError);
    } else {
      console.log('Found', policies?.length || 0, 'RLS policies on users table');
      policies?.forEach((policy, index) => {
        console.log(`Policy ${index + 1}: ${policy.policyname} - ${policy.cmd}`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the analysis
analyzeDatabase().catch(console.error);