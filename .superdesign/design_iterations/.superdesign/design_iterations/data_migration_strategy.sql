-- ======================================================
-- SOVEREIGNTY-ALIGNED DATA MIGRATION STRATEGY
-- ======================================================
-- This script handles migrating existing Supabase data
-- to align with Indigenous Data Sovereignty principles
-- ======================================================

-- Step 1: Audit existing consent state
-- Create audit table to track migration progress
CREATE TABLE IF NOT EXISTS migration_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action_taken TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    migration_date TIMESTAMPTZ DEFAULT NOW(),
    migrated_by UUID REFERENCES users(id)
);

-- Step 2: Sovereignty Consent Overlay for existing stories
-- Add enhanced consent settings with sovereignty defaults
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS sovereignty_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sovereignty_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sovereignty_verified_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS community_approval_status TEXT CHECK (community_approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS benefit_distribution_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_retention_preference TEXT CHECK (data_retention_preference IN ('permanent', 'community_lifecycle', 'specific_period')) DEFAULT 'community_lifecycle';

-- Step 3: Enhanced consent settings with sovereignty defaults
-- Update existing stories with sovereignty-aligned defaults
UPDATE stories 
SET consent_settings = jsonb_set(
    COALESCE(consent_settings, '{}'),
    '{sovereignty_acknowledged}',
    'true',
    true
)
WHERE consent_settings IS NULL 
   OR NOT (consent_settings ? 'sovereignty_acknowledged');

-- Step 4: Community benefit tracking initialization
-- Ensure all stories have benefit tracking records
INSERT INTO value_events (
    story_id, 
    event_type, 
    value_amount, 
    storyteller_share, 
    community_share,
    description,
    occurred_at
)
SELECT 
    s.id,
    'initialization' as event_type,
    0 as value_amount,
    0 as storyteller_share,
    0 as community_share,
    'Sovereignty-aligned initialization' as description,
    NOW() as occurred_at
FROM stories s
LEFT JOIN value_events ve ON s.id = ve.story_id
WHERE ve.id IS NULL;

-- Step 5: Community sovereignty verification
-- Create community governance records
CREATE TABLE IF NOT EXISTS community_sovereignty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id TEXT NOT NULL,
    community_name TEXT NOT NULL,
    sovereignty_declaration TEXT,
    verified_by UUID REFERENCES users(id),
    verified_date TIMESTAMPTZ DEFAULT NOW(),
    cultural_protocols JSONB DEFAULT '{}',
    benefit_distribution_agreement JSONB DEFAULT '{