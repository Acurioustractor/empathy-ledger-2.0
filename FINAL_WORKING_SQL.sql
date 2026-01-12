-- FINAL WORKING SQL FOR YOUR ACTUAL DATABASE
-- This matches your real table structure exactly

-- =====================================================================
-- STEP 1: Clean up all broken policies
-- =====================================================================

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;
DROP POLICY IF EXISTS "allow_storyteller_read" ON users;
DROP POLICY IF EXISTS "allow_authenticated_user_read" ON users;
DROP POLICY IF EXISTS "admin_full_access" ON users;
DROP POLICY IF EXISTS "public_quotes_access" ON quotes;

-- =====================================================================
-- STEP 2: Create working policies based on your actual table structure
-- =====================================================================

-- Users table policies
CREATE POLICY "public_storyteller_access"
ON users
FOR SELECT
TO public
USING (role = 'storyteller');

CREATE POLICY "users_own_data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Quotes table policy (using actual column names)
CREATE POLICY "public_quotes_access"
ON quotes
FOR SELECT
TO public
USING (quote_text IS NOT NULL AND quote_text != '');

-- =====================================================================
-- STEP 3: Enable RLS
-- =====================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 4: Add performance indexes
-- =====================================================================

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_id_role ON users(id, role);

-- Indexes for quotes table (using actual columns)
CREATE INDEX IF NOT EXISTS idx_quotes_themes ON quotes USING gin(themes);
CREATE INDEX IF NOT EXISTS idx_quotes_text ON quotes(quote_text);

-- =====================================================================
-- STEP 5: Test queries that should work
-- =====================================================================

-- Test storytellers
SELECT id, full_name, role, profile_image_url 
FROM users 
WHERE role = 'storyteller' 
LIMIT 3;

-- Test quotes
SELECT id, quote_text, context, themes
FROM quotes 
WHERE quote_text IS NOT NULL
LIMIT 3;