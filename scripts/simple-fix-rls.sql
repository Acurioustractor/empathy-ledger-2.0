-- SIMPLE FIX: Just stop the infinite recursion and allow public storyteller access

-- Drop all the broken policies that cause infinite recursion
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;
DROP POLICY IF EXISTS "allow_storyteller_read" ON users;
DROP POLICY IF EXISTS "allow_authenticated_user_read" ON users;

-- Create ONE simple policy that works
CREATE POLICY "simple_storyteller_public_access"
ON users
FOR SELECT
TO public
USING (role = 'storyteller');

-- Make sure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Test it works:
SELECT id, full_name, role FROM users WHERE role = 'storyteller' LIMIT 3;