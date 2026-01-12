-- COPY THIS ENTIRE CONTENT TO SUPABASE SQL EDITOR
-- This version works with your actual database structure

-- Drop all broken policies that cause infinite recursion
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;
DROP POLICY IF EXISTS "allow_storyteller_read" ON users;
DROP POLICY IF EXISTS "allow_authenticated_user_read" ON users;
DROP POLICY IF EXISTS "admin_full_access" ON users;

-- Create simple working policy for public storyteller access
CREATE POLICY "simple_storyteller_public_access"
ON users
FOR SELECT
TO public
USING (role = 'storyteller');

-- Users can read their own data
CREATE POLICY "users_own_data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admin access using existing users.role column (NOT user_roles table)
CREATE POLICY "admin_access_fixed"
ON users
FOR ALL
TO authenticated
USING (
  -- Check admin role in the users table itself, not a separate user_roles table
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add quotes table policy too
CREATE POLICY "public_quotes_access"
ON quotes
FOR SELECT
TO public
USING (quote_text IS NOT NULL AND quote_text != '');

-- Enable RLS on quotes table
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Test query to make sure it works
SELECT id, full_name, role FROM users WHERE role = 'storyteller' LIMIT 3;