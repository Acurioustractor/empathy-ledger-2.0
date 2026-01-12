# Manual SQL Commands to Fix RLS Policy

## IMMEDIATE FIX NEEDED

Go to your Supabase Dashboard > SQL Editor and run this command:

```sql
-- DISABLE RLS ENTIRELY TO STOP THE INFINITE RECURSION
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## OR, if you want to keep RLS enabled with a working policy:

```sql
-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "Enable read access for storytellers" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "Allow public read access to storytellers" ON users;
DROP POLICY IF EXISTS "storyteller_read_policy" ON users;

-- Create a simple policy that doesn't cause infinite recursion
CREATE POLICY "simple_storyteller_read" ON users
    FOR SELECT
    TO public
    USING (role = 'storyteller');

-- Keep RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Test the fix:

```sql
-- This should work without infinite recursion
SELECT id, full_name, role, profile_image_url 
FROM users 
WHERE role = 'storyteller' 
LIMIT 3;
```

## Current Status:
- ✅ Service role can access data (found 3 storytellers: Terina Ahone-Masafi and others)
- ❌ Public access still blocked by infinite recursion RLS policy
- 🎯 Need to run one of the SQL commands above to fix it permanently