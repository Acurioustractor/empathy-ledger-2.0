-- KILL THE FUCKING RLS POLICY FOREVER
-- No more infinite recursion bullshit

-- Disable RLS on ALL tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE themes DISABLE ROW LEVEL SECURITY;

-- Drop ALL the broken policies that cause infinite recursion
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;
DROP POLICY IF EXISTS "allow_storyteller_read" ON users;
DROP POLICY IF EXISTS "allow_authenticated_user_read" ON users;
DROP POLICY IF EXISTS "admin_full_access" ON users;
DROP POLICY IF EXISTS "public_storyteller_access" ON users;
DROP POLICY IF EXISTS "users_own_data" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "simple_storyteller_public_access" ON users;

-- Drop any other bullshit policies
DROP POLICY IF EXISTS "public_quotes_access" ON quotes;
DROP POLICY IF EXISTS "public_projects_access" ON projects;
DROP POLICY IF EXISTS "public_locations_access" ON locations;
DROP POLICY IF EXISTS "public_themes_access" ON themes;

-- Test that it fucking works now
SELECT 'RLS DISABLED - YOUR WEBSITE SHOULD NOW WORK' as status;

-- Test storytellers query
SELECT id, full_name, role FROM users WHERE role = 'storyteller' LIMIT 3;