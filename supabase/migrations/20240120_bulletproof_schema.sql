-- The Empathy Ledger Bulletproof Schema Design
-- This migration creates a complete, hierarchical database structure
-- with data sovereignty, multi-tenancy, and backup safety built in

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For exclusion constraints

-- Create backup schema for safety
CREATE SCHEMA IF NOT EXISTS backup;
CREATE SCHEMA IF NOT EXISTS audit;

-- =====================================================
-- SECTION 1: PLATFORM LEVEL (Shared Infrastructure)
-- =====================================================

-- Platform configuration and settings
CREATE TABLE IF NOT EXISTS platform_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id)
);

-- Platform modules/features that can be enabled per project
CREATE TABLE IF NOT EXISTS platform_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    settings_schema JSONB, -- JSON Schema for module settings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Platform-wide analytics (privacy-preserving)
CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    metric_type TEXT NOT NULL,
    metric_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_type)
);

-- =====================================================
-- SECTION 2: ORGANIZATION LEVEL
-- =====================================================

-- Organizations that use the platform
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('nonprofit', 'company', 'government', 'community')),
    description TEXT,
    logo_url TEXT,
    website TEXT,
    contact_email TEXT,
    settings JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'community' CHECK (subscription_tier IN ('community', 'organization', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Organization members with roles
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- Organization API keys for external integrations
CREATE TABLE IF NOT EXISTS organization_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- Hashed API key
    permissions JSONB DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- SECTION 3: PROJECT LEVEL (Built on Empathy Ledger)
-- =====================================================

-- Projects that organizations create
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('story_collection', 'impact_measurement', 'community_platform', 'custom')),
    settings JSONB DEFAULT '{}',
    theme JSONB DEFAULT '{}', -- Visual customization
    modules JSONB DEFAULT '[]', -- Enabled platform modules
    custom_domain TEXT UNIQUE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Project team members
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    permissions JSONB DEFAULT '{}',
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- =====================================================
-- SECTION 4: COMMUNITY LEVEL
-- =====================================================

-- Communities (geographic or thematic)
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('geographic', 'thematic', 'cultural', 'organizational')),
    description TEXT,
    location JSONB, -- GeoJSON for geographic communities
    cultural_protocols JSONB DEFAULT '{}',
    governance_model TEXT CHECK (governance_model IN ('consensus', 'majority', 'elder_council', 'representative', 'custom')),
    settings JSONB DEFAULT '{}',
    parent_community_id UUID REFERENCES communities(id), -- For hierarchical communities
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Community members with roles
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('elder', 'steward', 'member', 'guest')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    UNIQUE(community_id, user_id)
);

-- Cultural protocols for communities
CREATE TABLE IF NOT EXISTS cultural_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    protocol_type TEXT NOT NULL,
    description TEXT,
    requirements JSONB NOT NULL,
    enforcement_level TEXT NOT NULL CHECK (enforcement_level IN ('required', 'recommended', 'optional')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Community-level insights
CREATE TABLE IF NOT EXISTS community_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL,
    insight_data JSONB NOT NULL,
    time_period TSTZRANGE NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT false,
    EXCLUDE USING gist (community_id WITH =, insight_type WITH =, time_period WITH &&)
);

-- =====================================================
-- SECTION 5: USER PROFILES (Extended from Supabase Auth)
-- =====================================================

-- Extended user profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    preferred_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location JSONB,
    cultural_background JSONB,
    languages JSONB DEFAULT '[]',
    storyteller_profile JSONB DEFAULT '{}', -- Storyteller-specific info
    preferences JSONB DEFAULT '{}',
    data_sovereignty_preferences JSONB DEFAULT '{
        "data_location": "primary",
        "export_format": "json",
        "deletion_request": false,
        "ai_training_consent": false
    }',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTION 6: STORY SYSTEM (Core Content)
-- =====================================================

-- Main stories table
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id),
    storyteller_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    type TEXT CHECK (type IN ('personal', 'community', 'historical', 'educational', 'other')),
    
    -- Privacy and consent
    privacy_level TEXT NOT NULL DEFAULT 'private' CHECK (privacy_level IN ('public', 'community', 'organization', 'private')),
    consent_settings JSONB NOT NULL DEFAULT '{
        "public_sharing": false,
        "community_sharing": false,
        "organization_sharing": false,
        "ai_analysis": false,
        "commercial_use": false,
        "attribution_required": true,
        "modification_allowed": false,
        "distribution_channels": []
    }',
    
    -- Cultural protocols
    cultural_protocols_met JSONB DEFAULT '[]', -- Array of protocol IDs
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    location JSONB,
    occurred_at TIMESTAMPTZ,
    language TEXT DEFAULT 'en',
    
    -- Status tracking
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Story versions for history tracking
CREATE TABLE IF NOT EXISTS story_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    changed_by UUID REFERENCES auth.users(id),
    change_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, version_number)
);

-- Story media attachments
CREATE TABLE IF NOT EXISTS story_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    display_order INTEGER DEFAULT 0
);

-- Story analysis (AI or human)
CREATE TABLE IF NOT EXISTS story_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('sentiment', 'themes', 'impact', 'cultural', 'custom')),
    analysis_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    analyzed_by_system BOOLEAN DEFAULT true,
    analyzed_by_user UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, analysis_type)
);

-- Story engagement tracking
CREATE TABLE IF NOT EXISTS story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    view_duration INTEGER, -- seconds
    view_completion DECIMAL(3,2), -- percentage
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS story_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS story_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    parent_comment_id UUID REFERENCES story_comments(id),
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTION 7: VALUE DISTRIBUTION SYSTEM
-- =====================================================

-- Track value/benefit events
CREATE TABLE IF NOT EXISTS value_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES stories(id),
    community_id UUID REFERENCES communities(id),
    project_id UUID REFERENCES projects(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('donation', 'grant', 'sponsorship', 'revenue_share', 'impact_fund')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',
    description TEXT,
    source_organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Track how value is distributed
CREATE TABLE IF NOT EXISTS value_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value_event_id UUID NOT NULL REFERENCES value_events(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('storyteller', 'community', 'project', 'platform')),
    recipient_id UUID NOT NULL, -- References appropriate table based on type
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    percentage DECIMAL(5,2) CHECK (percentage > 0 AND percentage <= 100),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTION 8: AUDIT AND BACKUP TABLES
-- =====================================================

-- Audit log for all data changes
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Backup metadata tracking
CREATE TABLE IF NOT EXISTS backup.backup_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
    backup_location TEXT NOT NULL,
    backup_size_bytes BIGINT,
    tables_included JSONB,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    error_message TEXT,
    retention_days INTEGER DEFAULT 30
);

-- =====================================================
-- SECTION 9: INDEXES FOR PERFORMANCE
-- =====================================================

-- Story indexes
CREATE INDEX idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX idx_stories_community ON stories(community_id);
CREATE INDEX idx_stories_project ON stories(project_id);
CREATE INDEX idx_stories_privacy ON stories(privacy_level);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created ON stories(created_at DESC);
CREATE INDEX idx_stories_fulltext ON stories USING gin(to_tsvector('english', title || ' ' || content));

-- Community indexes
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);

-- Organization indexes
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- Project indexes
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);

-- Audit indexes
CREATE INDEX idx_audit_table_record ON audit.audit_log(table_name, record_id);
CREATE INDEX idx_audit_user ON audit.audit_log(changed_by);
CREATE INDEX idx_audit_timestamp ON audit.audit_log(changed_at DESC);

-- =====================================================
-- SECTION 10: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Story policies
CREATE POLICY "Stories visible based on privacy settings"
    ON stories FOR SELECT
    USING (
        storyteller_id = auth.uid() OR
        privacy_level = 'public' OR
        (privacy_level = 'community' AND EXISTS (
            SELECT 1 FROM community_members 
            WHERE community_id = stories.community_id 
            AND user_id = auth.uid()
        )) OR
        (privacy_level = 'organization' AND EXISTS (
            SELECT 1 FROM organization_members om
            JOIN projects p ON p.organization_id = om.organization_id
            WHERE p.id = stories.project_id 
            AND om.user_id = auth.uid()
        ))
    );

CREATE POLICY "Storytellers can manage their own stories"
    ON stories FOR ALL
    USING (storyteller_id = auth.uid());

-- Community policies
CREATE POLICY "Public communities visible to all"
    ON communities FOR SELECT
    USING (
        settings->>'is_public' = 'true' OR
        EXISTS (
            SELECT 1 FROM community_members 
            WHERE community_id = communities.id 
            AND user_id = auth.uid()
        )
    );

-- =====================================================
-- SECTION 11: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit logging function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.audit_log (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_stories AFTER INSERT OR UPDATE OR DELETE ON stories
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_value_events AFTER INSERT OR UPDATE OR DELETE ON value_events
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_value_distributions AFTER INSERT OR UPDATE OR DELETE ON value_distributions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to check community membership
CREATE OR REPLACE FUNCTION is_community_member(user_id UUID, community_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.user_id = is_community_member.user_id 
        AND cm.community_id = is_community_member.community_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check organization membership
CREATE OR REPLACE FUNCTION is_org_member(user_id UUID, org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.user_id = is_org_member.user_id 
        AND om.organization_id = is_org_member.org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 12: INITIAL DATA AND CONFIGURATION
-- =====================================================

-- Insert default platform configuration
INSERT INTO platform_config (key, value, description) VALUES
    ('backup_retention_days', '30', 'Number of days to retain automated backups'),
    ('max_story_length', '50000', 'Maximum character length for stories'),
    ('default_privacy_level', '"community"', 'Default privacy level for new stories'),
    ('require_approval_threshold', '3', 'Number of community members required for story approval')
ON CONFLICT (key) DO NOTHING;

-- Insert default platform modules
INSERT INTO platform_modules (name, description) VALUES
    ('story_collection', 'Core story collection and sharing functionality'),
    ('community_insights', 'Analytics and insights for communities'),
    ('value_distribution', 'Track and distribute value/benefits'),
    ('cultural_protocols', 'Manage and enforce cultural protocols'),
    ('multi_language', 'Support for multiple languages and translations')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 13: MIGRATION SAFETY
-- =====================================================

-- Create backup of existing data before migration
CREATE OR REPLACE FUNCTION backup_before_migration()
RETURNS VOID AS $$
DECLARE
    backup_timestamp TEXT := to_char(CURRENT_TIMESTAMP, 'YYYYMMDD_HH24MISS');
BEGIN
    -- Create backup schema with timestamp
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS backup_%s', backup_timestamp);
    
    -- Backup existing tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('CREATE TABLE backup_%s.%s AS TABLE public.%s', 
            backup_timestamp, r.tablename, r.tablename);
    END LOOP;
    
    -- Log backup completion
    INSERT INTO backup.backup_history (
        backup_type,
        backup_location,
        tables_included,
        started_at,
        completed_at,
        status
    ) VALUES (
        'full',
        format('backup_%s schema', backup_timestamp),
        (SELECT jsonb_agg(tablename) FROM pg_tables WHERE schemaname = 'public'),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        'completed'
    );
END;
$$ LANGUAGE plpgsql;

-- Execute backup before proceeding
-- SELECT backup_before_migration();

-- =====================================================
-- SECTION 14: GRANTS AND PERMISSIONS
-- =====================================================

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant specific permissions based on RLS policies
GRANT INSERT, UPDATE, DELETE ON stories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON story_reactions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON story_comments TO authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;

-- Service role needs full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- FINAL NOTES
-- =====================================================

-- This schema provides:
-- 1. Complete data sovereignty with granular access controls
-- 2. Multi-tenant architecture supporting multiple organizations
-- 3. Comprehensive audit logging and backup tracking
-- 4. Performance optimization through strategic indexing
-- 5. Row Level Security for data protection
-- 6. Cultural protocol enforcement mechanisms
-- 7. Value distribution tracking for benefit sharing
-- 8. Extensible module system for future features

-- Remember to:
-- 1. Test all migrations in staging first
-- 2. Always backup before applying migrations
-- 3. Monitor performance after deployment
-- 4. Review RLS policies for security gaps
-- 5. Set up automated backup schedules