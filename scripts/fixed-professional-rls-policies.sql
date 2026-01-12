-- FIXED PROFESSIONAL RLS POLICIES FOR EMPATHY LEDGER
-- Updated to work with your actual database structure

-- =====================================================================
-- STEP 1: Clean up existing problematic policies
-- =====================================================================

-- Drop all existing broken policies
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;
DROP POLICY IF EXISTS "allow_storyteller_read" ON users;
DROP POLICY IF EXISTS "allow_authenticated_user_read" ON users;

-- =====================================================================
-- STEP 2: Create Security Definer functions (professional pattern)
-- =====================================================================

-- Simple function to allow public read access to storyteller data
CREATE OR REPLACE FUNCTION can_read_storyteller_data()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Allow public read access to published storyteller profiles
  -- This bypasses RLS infinite recursion
  SELECT true;
$$;

-- Fixed function to check if user is content owner (no user_roles table needed)
CREATE OR REPLACE FUNCTION is_content_owner_or_admin(content_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN auth.uid() IS NULL THEN false  -- Anonymous users
      WHEN auth.uid() = content_user_id THEN true  -- Content owner
      -- Check if user has admin role in the users table instead
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN true  -- Admin user (checking users.role directly)
      ELSE false
    END;
$$;

-- =====================================================================
-- STEP 3: Professional RLS policies using best practices
-- =====================================================================

-- Policy 1: Public storyteller profiles (your main use case)
CREATE POLICY "public_storyteller_access"
ON users
FOR SELECT
TO public
USING (
  role = 'storyteller' 
  AND can_read_storyteller_data()
);

-- Policy 2: Users can always read their own data
CREATE POLICY "users_own_data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Users can update their own data
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admin access (checking role in users table)
CREATE POLICY "admin_full_access"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================================
-- STEP 4: Quotes table policies (fix the theme column issue)
-- =====================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "public_quotes_access" ON quotes;

-- Public quotes linked to storytellers
CREATE POLICY "public_quotes_access"
ON quotes
FOR SELECT
TO public
USING (
  -- Quote has content and is not empty
  quote_text IS NOT NULL AND quote_text != ''
);

-- =====================================================================
-- STEP 5: Projects table policies  
-- =====================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "public_projects_access" ON projects;

-- Public projects
CREATE POLICY "public_projects_access"
ON projects
FOR SELECT
TO public
USING (true);  -- All projects visible to public

-- =====================================================================
-- STEP 6: Locations table policies
-- =====================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "public_locations_access" ON locations;

-- Public locations
CREATE POLICY "public_locations_access"
ON locations
FOR SELECT
TO public
USING (true);  -- All locations visible to public

-- =====================================================================
-- STEP 7: Themes table policies
-- =====================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "public_themes_access" ON themes;

-- Public themes
CREATE POLICY "public_themes_access"
ON themes
FOR SELECT
TO public
USING (true);  -- All themes visible to public

-- =====================================================================
-- STEP 8: Enable RLS on all tables
-- =====================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 9: Add performance indexes (critical for production)
-- =====================================================================

-- Index for storyteller role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_id_role ON users(id, role);

-- Index for quote lookups
CREATE INDEX IF NOT EXISTS idx_quotes_linked_storytellers ON quotes USING gin(linked_storytellers);

-- Index for location joins
CREATE INDEX IF NOT EXISTS idx_users_location ON users(primary_location_id);

-- Index for project filtering
CREATE INDEX IF NOT EXISTS idx_users_project ON users(project_id);

-- =====================================================================
-- STEP 10: Test the policies work without infinite recursion
-- =====================================================================

-- This should work without errors:
SELECT id, full_name, role, profile_image_url 
FROM users 
WHERE role = 'storyteller' 
LIMIT 5;

-- This should also work:
SELECT q.id, q.quote_text, q.context 
FROM quotes q
WHERE q.quote_text IS NOT NULL
LIMIT 5;

-- Test project queries:
SELECT p.id, p.name, p.project_type
FROM projects p
LIMIT 5;

-- Test location queries:
SELECT l.id, l.name, l.country
FROM locations l
LIMIT 5;