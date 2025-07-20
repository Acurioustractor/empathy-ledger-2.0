-- =====================================================================
-- EMPATHY LEDGER - SAFE MIGRATION PLAN
-- This script ensures ZERO data loss while creating the best multi-project setup
-- =====================================================================

-- IMPORTANT: This script should be run in phases with backups between each phase
-- DO NOT run this all at once - we'll do it step by step

-- =====================================================================
-- PHASE 1: DATA PROTECTION & BACKUP
-- =====================================================================

-- Step 1.1: Create backup tables for all existing data
-- (This preserves your data before any changes)

CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS backup_stories AS SELECT * FROM stories;
-- Add more backup tables for any other existing tables

-- Step 1.2: Create audit trail for migration
CREATE TABLE IF NOT EXISTS migration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name TEXT NOT NULL,
    phase TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'rolled_back')),
    affected_tables TEXT[],
    row_count INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    rollback_script TEXT
);

-- =====================================================================
-- PHASE 2: CREATE NEW MULTI-PROJECT ARCHITECTURE
-- =====================================================================

-- Step 2.1: Create shared schema for cross-project data
CREATE SCHEMA IF NOT EXISTS shared;

-- Step 2.2: Create new profiles table in shared schema
CREATE TABLE IF NOT EXISTS shared.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    age_range TEXT,
    location_general TEXT,
    languages_spoken TEXT[] DEFAULT '{}',
    role TEXT DEFAULT 'storyteller' CHECK (role IN ('storyteller', 'organization_admin', 'community_moderator', 'platform_admin', 'researcher')),
    privacy_settings JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    stories_contributed INTEGER DEFAULT 0,
    communities_joined INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2.3: Create projects schema for project-specific data
CREATE SCHEMA IF NOT EXISTS projects;

-- Step 2.4: Create project management table
CREATE TABLE IF NOT EXISTS shared.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    organization_id UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    custom_domain TEXT UNIQUE,
    branding_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES shared.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2.5: Create project-specific stories table
CREATE TABLE IF NOT EXISTS projects.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES shared.projects(id) ON DELETE CASCADE,
    storyteller_id UUID NOT NULL REFERENCES shared.profiles(id),
    title TEXT NOT NULL,
    content TEXT,
    transcript TEXT,
    audio_url TEXT,
    video_url TEXT,
    media_content JSONB,
    story_themes TEXT[],
    tags TEXT[],
    privacy_level TEXT DEFAULT 'community' CHECK (privacy_level IN ('private', 'community', 'public')),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'archived')),
    submission_method TEXT DEFAULT 'web' CHECK (submission_method IN ('web', 'sms', 'whatsapp', 'voice')),
    cultural_protocols JSONB,
    consent_settings JSONB,
    location JSONB,
    geographic_region TEXT,
    personal_quotes TEXT[],
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PHASE 3: DATA MIGRATION (SAFE APPROACH)
-- =====================================================================

-- Step 3.1: Migrate users to profiles (if they don't exist)
INSERT INTO shared.profiles (id, email, full_name, display_name, bio, avatar_url, role, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.display_name,
    u.bio,
    u.avatar_url,
    COALESCE(u.role, 'storyteller'),
    u.created_at,
    u.updated_at
FROM users u
ON CONFLICT (id) DO NOTHING;

-- Step 3.2: Create default project for existing data
INSERT INTO shared.projects (id, name, slug, description, status, created_by)
VALUES (
    gen_random_uuid(),
    'Legacy Project',
    'legacy-project',
    'Default project for existing data',
    'active',
    (SELECT id FROM shared.profiles LIMIT 1)
);

-- Step 3.3: Migrate stories to new structure
INSERT INTO projects.stories (
    id, project_id, storyteller_id, title, content, transcript,
    audio_url, video_url, media_content, story_themes, tags,
    privacy_level, status, submission_method, cultural_protocols,
    consent_settings, location, geographic_region, personal_quotes,
    submitted_at, created_at, updated_at
)
SELECT 
    s.id,
    (SELECT id FROM shared.projects WHERE slug = 'legacy-project'),
    s.storyteller_id,
    s.title,
    s.content,
    s.transcript,
    s.audio_url,
    s.video_url,
    s.media_content,
    s.story_themes,
    s.tags,
    COALESCE(s.privacy_level, 'community'),
    COALESCE(s.status, 'submitted'),
    COALESCE(s.submission_method, 'web'),
    s.cultural_protocols,
    s.consent_settings,
    s.location,
    s.geographic_region,
    s.personal_quotes,
    COALESCE(s.submitted_at, s.created_at),
    s.created_at,
    s.updated_at
FROM stories s
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- PHASE 4: SETUP ROW LEVEL SECURITY
-- =====================================================================

-- Step 4.1: Enable RLS on all tables
ALTER TABLE shared.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.stories ENABLE ROW LEVEL SECURITY;

-- Step 4.2: Create RLS policies
-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON shared.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON shared.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON shared.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: Project members can access their projects
CREATE POLICY "Project visibility" ON shared.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm 
            WHERE pm.project_id = id AND pm.user_id = auth.uid()
        )
    );

-- Stories: Project members can access stories in their projects
CREATE POLICY "Project story access" ON projects.stories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members pm 
            WHERE pm.project_id = project_id AND pm.user_id = auth.uid()
        )
    );

-- =====================================================================
-- PHASE 5: CREATE INDEXES FOR PERFORMANCE
-- =====================================================================

-- Step 5.1: Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON shared.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON shared.profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON shared.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON shared.projects(status);
CREATE INDEX IF NOT EXISTS idx_stories_project ON projects.stories(project_id);
CREATE INDEX IF NOT EXISTS idx_stories_storyteller ON projects.stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON projects.stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_privacy ON projects.stories(privacy_level);

-- =====================================================================
-- PHASE 6: VERIFICATION & CLEANUP
-- =====================================================================

-- Step 6.1: Verify data migration
-- (These queries will be run to verify data integrity)

-- Check profile migration
-- SELECT COUNT(*) as profiles_count FROM shared.profiles;
-- SELECT COUNT(*) as users_count FROM users;

-- Check stories migration
-- SELECT COUNT(*) as stories_count FROM projects.stories;
-- SELECT COUNT(*) as old_stories_count FROM stories;

-- Step 6.2: Create rollback script
-- (This will be created separately to allow rollback if needed)

-- =====================================================================
-- NOTES FOR IMPLEMENTATION
-- =====================================================================

-- 1. Run this script in phases with verification between each phase
-- 2. Create full backups before each phase
-- 3. Test in development environment first
-- 4. Update application code to use new table names
-- 5. Only drop old tables after thorough testing

-- This approach ensures ZERO data loss while creating the best multi-project architecture 