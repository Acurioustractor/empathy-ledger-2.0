-- =====================================================
-- FIX RLS INFINITE RECURSION
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('stories', 'users', 'project_members')
ORDER BY tablename, policyname;

-- 2. Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Enable read access for all users" ON public.stories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stories;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.stories;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.stories;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.project_members;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.project_members;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.project_members;

-- 3. Create simple, non-recursive policies for stories
CREATE POLICY "stories_select_public" ON public.stories
    FOR SELECT USING (
        privacy_level = 'public'
        OR auth.uid() = storyteller_id
    );

CREATE POLICY "stories_insert_authenticated" ON public.stories
    FOR INSERT WITH CHECK (
        auth.uid() = storyteller_id
    );

CREATE POLICY "stories_update_own" ON public.stories
    FOR UPDATE USING (
        auth.uid() = storyteller_id
    );

CREATE POLICY "stories_delete_own" ON public.stories
    FOR DELETE USING (
        auth.uid() = storyteller_id
    );

-- 4. Create simple policies for users
CREATE POLICY "users_select_storytellers" ON public.users
    FOR SELECT USING (
        role = 'storyteller'
        OR id = auth.uid()
    );

CREATE POLICY "users_insert_self" ON public.users
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

CREATE POLICY "users_update_self" ON public.users
    FOR UPDATE USING (
        auth.uid() = id
    );

-- 5. Create simple policies for project_members
CREATE POLICY "project_members_select_own" ON public.project_members
    FOR SELECT USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.project_members pm2
            WHERE pm2.project_id = project_members.project_id
            AND pm2.user_id = auth.uid()
            AND pm2.role IN ('owner', 'admin')
        )
    );

-- 6. Add service role bypass for all tables
CREATE POLICY "service_role_all_stories" ON public.stories
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_users" ON public.users
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "service_role_all_project_members" ON public.project_members
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 7. Verify RLS is enabled
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 8. Test the fix
-- This should work without infinite recursion
SELECT 
    s.id,
    s.title,
    u.full_name
FROM stories s
LEFT JOIN users u ON s.storyteller_id = u.id
LIMIT 5;