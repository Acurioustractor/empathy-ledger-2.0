-- =====================================================================
-- COMPLETE DATABASE INSPECTION
-- Show everything in one result set
-- =====================================================================

-- Create a comprehensive view of what exists
WITH table_info AS (
  SELECT 'Tables: ' || string_agg(table_name, ', ' ORDER BY table_name) as info
  FROM information_schema.tables 
  WHERE table_schema = 'public'
),
type_info AS (
  SELECT 'Custom Types: ' || COALESCE(string_agg(typname, ', ' ORDER BY typname), 'None') as info
  FROM pg_type 
  WHERE typname IN ('story_category', 'privacy_level', 'story_status', 'user_role')
),
stories_columns AS (
  SELECT 'Stories Columns: ' || COALESCE(string_agg(column_name || '(' || data_type || ')', ', ' ORDER BY ordinal_position), 'Table does not exist') as info
  FROM information_schema.columns 
  WHERE table_name = 'stories'
),
policy_info AS (
  SELECT 'Policies: ' || COALESCE(string_agg(tablename || '.' || policyname, ', '), 'None') as info
  FROM pg_policies 
  WHERE schemaname = 'public'
)
SELECT 
  table_info.info as tables,
  type_info.info as types,
  stories_columns.info as stories_structure,
  policy_info.info as policies
FROM table_info, type_info, stories_columns, policy_info;