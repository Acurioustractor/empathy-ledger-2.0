-- =====================================================================
-- SIMPLE DATABASE INSPECTION
-- Just check what exists without making changes
-- =====================================================================

-- Check what tables exist
SELECT 'EXISTING TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check what types exist
SELECT 'EXISTING CUSTOM TYPES:' as info;
SELECT typname 
FROM pg_type 
WHERE typname IN ('story_category', 'privacy_level', 'story_status', 'user_role');

-- If stories table exists, show its structure
SELECT 'STORIES TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'stories' 
ORDER BY ordinal_position;

-- Check existing policies
SELECT 'EXISTING POLICIES:' as info;
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Show what we have so far
SELECT 'DATABASE SUMMARY:' as summary;