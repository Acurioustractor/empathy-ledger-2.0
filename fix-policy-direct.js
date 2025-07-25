import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrgMembersPolicy() {
  try {
    console.log('🔧 Attempting to fix organization_members RLS policy...');
    console.log('📡 Connecting to:', supabaseUrl);
    
    // First, let's check if we can connect and see current policies
    console.log('\n🔍 Checking current database connection...');
    
    const { data, error } = await supabase
      .from('organization_members')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Cannot connect to organization_members table:', error.message);
      console.log('\n📋 Please run this SQL manually in your Supabase SQL Editor:');
      console.log(`
-- Fix infinite recursion in organization_members RLS policy

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "org_members_access" ON organization_members;

-- Step 2: Create new non-recursive policies
CREATE POLICY "org_members_basic_access" ON organization_members
    FOR ALL USING (
        user_id = auth.uid()
    );

CREATE POLICY "org_members_admin_access" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'super_admin')
        )
    );
      `);
      return;
    }
    
    console.log('✅ Successfully connected to database');
    console.log(`📊 organization_members table has ${data} records`);
    
    console.log('\n⚠️  Since we cannot execute DDL statements directly through the client,');
    console.log('please run the following SQL in your Supabase SQL Editor:');
    
    console.log('\n=== COPY THIS SQL TO SUPABASE SQL EDITOR ===');
    console.log(`
-- Fix infinite recursion in organization_members RLS policy
-- Run this in: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

-- Step 1: Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "org_members_access" ON organization_members;

-- Step 2: Create new non-recursive policies
-- Users can see their own memberships
CREATE POLICY "org_members_basic_access" ON organization_members
    FOR ALL USING (
        user_id = auth.uid()
    );

-- Admins can see all memberships
CREATE POLICY "org_members_admin_access" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'super_admin')
        )
    );
    `);
    console.log('=== END SQL ===\n');
    
    console.log('🎯 After running the SQL:');
    console.log('1. Go to http://localhost:3005/analytics');
    console.log('2. The infinite recursion error should be resolved');
    console.log('3. The analytics should load properly');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixOrgMembersPolicy();