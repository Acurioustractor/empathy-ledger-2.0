-- FIX THE FUCKING RLS POLICY THAT'S BLOCKING SITE CONTENT
-- This removes the infinite recursion and allows public read access to storyteller data

-- First, let's see what policies are currently causing problems
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Drop any existing problematic policies on users table
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;

-- Create a simple, non-recursive policy that allows reading storyteller data
CREATE POLICY "allow_storyteller_read" ON users
    FOR SELECT
    TO public
    USING (role = 'storyteller' OR role IS NULL);

-- Also allow reading user profiles for authenticated users
CREATE POLICY "allow_authenticated_user_read" ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- Make sure RLS is enabled but with working policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Test the policy by running a simple query
SELECT id, full_name, role FROM users WHERE role = 'storyteller' LIMIT 3;

-- Verify no infinite recursion
EXPLAIN (ANALYZE, BUFFERS) SELECT id, full_name, profile_image_url 
FROM users 
WHERE role = 'storyteller' 
LIMIT 3;