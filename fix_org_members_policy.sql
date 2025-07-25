-- Fix infinite recursion in organization_members RLS policy
-- This script drops the problematic policy and creates non-recursive replacements

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "org_members_access" ON organization_members;

-- Create new non-recursive policies
-- Policy 1: Users can see their own memberships
CREATE POLICY "org_members_basic_access" ON organization_members
    FOR ALL USING (
        user_id = auth.uid()
    );

-- Policy 2: Admins can see all memberships
CREATE POLICY "org_members_admin_access" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'super_admin')
        )
    );