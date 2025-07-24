-- =====================================================
-- FIX USERS TABLE RLS FOR HOMEPAGE
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Drop any problematic policies on users table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
DROP POLICY IF EXISTS "users_select_storytellers" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;
DROP POLICY IF EXISTS "service_role_all_users" ON public.users;

-- 2. Create a simple, non-recursive policy for public storyteller access
CREATE POLICY "public_storytellers_read" ON public.users
    FOR SELECT USING (
        role = 'storyteller'
    );

-- 3. Allow users to read/update their own data
CREATE POLICY "users_own_data" ON public.users
    FOR ALL USING (
        auth.uid()::text = id::text
    );

-- 4. Service role bypass (for server-side queries)
CREATE POLICY "service_role_users_all" ON public.users
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.jwt()->>'role' = 'service_role'
    );

-- 5. Make sure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Test query that should work with anon key
-- This simulates the homepage query
SELECT 
    id,
    full_name,
    community_affiliation,
    bio,
    profile_image_url,
    shared_themes
FROM public.users 
WHERE role = 'storyteller' 
    AND bio IS NOT NULL
ORDER BY created_at DESC
LIMIT 6;