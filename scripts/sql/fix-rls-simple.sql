-- =====================================================
-- CRITICAL: FIX RLS INFINITE RECURSION - SIMPLE VERSION
-- Just fixes the core stories and users tables
-- =====================================================

-- Drop ALL existing policies on stories
DROP POLICY IF EXISTS "Enable read access for all users" ON public.stories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stories;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.stories;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.stories;
DROP POLICY IF EXISTS "stories_select_policy" ON public.stories;
DROP POLICY IF EXISTS "stories_insert_policy" ON public.stories;
DROP POLICY IF EXISTS "stories_update_policy" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_policy" ON public.stories;
DROP POLICY IF EXISTS "stories_read_public" ON public.stories;
DROP POLICY IF EXISTS "stories_insert_own" ON public.stories;
DROP POLICY IF EXISTS "stories_update_own" ON public.stories;
DROP POLICY IF EXISTS "stories_delete_own" ON public.stories;

-- Drop ALL existing policies on users
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_read_public" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;

-- Create simple, working policies for stories
CREATE POLICY "stories_read_public" ON public.stories
    FOR SELECT USING (
        privacy_level = 'public' 
        OR storyteller_id = auth.uid()
    );

CREATE POLICY "stories_insert_own" ON public.stories
    FOR INSERT WITH CHECK (
        storyteller_id = auth.uid()
    );

CREATE POLICY "stories_update_own" ON public.stories
    FOR UPDATE USING (
        storyteller_id = auth.uid()
    );

CREATE POLICY "stories_delete_own" ON public.stories
    FOR DELETE USING (
        storyteller_id = auth.uid()
    );

-- Create simple policies for users
CREATE POLICY "users_read_public" ON public.users
    FOR SELECT USING (
        role = 'storyteller'
        OR id = auth.uid()
    );

CREATE POLICY "users_insert_self" ON public.users
    FOR INSERT WITH CHECK (
        id = auth.uid()
    );

CREATE POLICY "users_update_self" ON public.users
    FOR UPDATE USING (
        id = auth.uid()
    );

-- Ensure RLS is enabled
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Test the fix
SELECT 
    s.id,
    s.title,
    s.storyteller_id,
    u.full_name
FROM stories s
LEFT JOIN users u ON s.storyteller_id = u.id
WHERE s.privacy_level = 'public'
LIMIT 3;

SELECT 'RLS policies fixed! Website should work now.' as message;