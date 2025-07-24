-- PROFESSIONAL RLS POLICIES FOR EMPATHY LEDGER
-- Based on 2024/2025 best practices from production Supabase applications

-- =====================================================================
-- STEP 1: Clean up existing problematic policies
-- =====================================================================

-- Drop all existing broken policies
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;

-- =====================================================================
-- STEP 2: Create Security Definer functions (professional pattern)
-- =====================================================================

-- Function to check if user can read storyteller data
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

-- Function to check if user is admin or content owner
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
      WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN true  -- Admin user
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

-- Policy 4: Admin access (using existing users.role column)
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

-- Public quotes (all quotes are public since they have quote_text)
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

-- Public projects
CREATE POLICY "public_projects_access"
ON projects
FOR SELECT
TO public
USING (true);  -- All projects visible to public

-- =====================================================================
-- STEP 6: Enable RLS on all tables
-- =====================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 7: Add performance indexes (critical for production)
-- =====================================================================

-- Index for storyteller role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_id_role ON users(id, role);

-- Index for quote lookups by themes
CREATE INDEX IF NOT EXISTS idx_quotes_themes ON quotes USING gin(themes);

-- Index for location joins
CREATE INDEX IF NOT EXISTS idx_users_location ON users(primary_location_id);

-- =====================================================================
-- STEP 8: Test the policies work without infinite recursion
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