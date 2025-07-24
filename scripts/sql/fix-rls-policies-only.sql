-- =====================================================
-- CRITICAL: FIX RLS INFINITE RECURSION
-- Run this FIRST to fix the website display issues
-- =====================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON public.stories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stories;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.stories;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.stories;
DROP POLICY IF EXISTS "stories_select_policy" ON public.stories;
DROP POLICY IF EXISTS "stories_insert_policy" ON public.stories;
DROP POLICY IF EXISTS "stories_update_policy" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_policy" ON public.stories;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_members;
DROP POLICY IF EXISTS "project_members_select_policy" ON public.project_members;

-- Create simple, non-recursive policies for stories
CREATE POLICY "stories_read_public" ON public.stories
    FOR SELECT USING (
        privacy_level = 'public' 
        OR storyteller_id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "stories_insert_own" ON public.stories
    FOR INSERT WITH CHECK (
        storyteller_id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "stories_update_own" ON public.stories
    FOR UPDATE USING (
        storyteller_id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "stories_delete_own" ON public.stories
    FOR DELETE USING (
        storyteller_id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

-- Create simple policies for users
CREATE POLICY "users_read_public" ON public.users
    FOR SELECT USING (
        role = 'storyteller'
        OR id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "users_insert_self" ON public.users
    FOR INSERT WITH CHECK (
        id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "users_update_self" ON public.users
    FOR UPDATE USING (
        id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

-- Create simple policies for project_members (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_members') THEN
        EXECUTE 'CREATE POLICY "project_members_read_own" ON public.project_members
            FOR SELECT USING (
                user_id = auth.uid()
                OR auth.jwt()''->''role'' = ''service_role''
            )';
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Test the fix - this should work without infinite recursion
SELECT 
    s.id,
    s.title,
    s.storyteller_id,
    u.full_name
FROM stories s
LEFT JOIN users u ON s.storyteller_id = u.id
WHERE s.privacy_level = 'public'
LIMIT 5;

SELECT 'RLS policies fixed successfully!' as message;