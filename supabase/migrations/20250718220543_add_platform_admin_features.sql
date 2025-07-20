-- Add Platform Admin Features
-- This migration adds the infrastructure for platform-level administration
-- while maintaining compatibility with existing project-based functionality

BEGIN;

-- Add platform roles to users (note: using 'users' table, not 'profiles')
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS platform_role TEXT DEFAULT 'user' CHECK (platform_role IN ('user', 'platform_manager', 'super_admin')),
ADD COLUMN IF NOT EXISTS is_platform_team BOOLEAN DEFAULT FALSE;

-- Create index for platform role queries
CREATE INDEX IF NOT EXISTS idx_users_platform_role ON users(platform_role) WHERE platform_role != 'user';

-- Platform audit log for tracking admin actions
CREATE TABLE IF NOT EXISTS platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT, -- 'project', 'user', 'module', 'system'
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient audit log queries
CREATE INDEX idx_platform_audit_log_actor ON platform_audit_log(actor_id, created_at DESC);
CREATE INDEX idx_platform_audit_log_target ON platform_audit_log(target_type, target_id, created_at DESC);
CREATE INDEX idx_platform_audit_log_action ON platform_audit_log(action, created_at DESC);

-- Platform modules registry
CREATE TABLE IF NOT EXISTS platform_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('core', 'standard', 'specialized', 'experimental')),
    
    -- Configuration
    config_schema JSONB DEFAULT '{}',
    default_config JSONB DEFAULT '{}',
    
    -- Dependencies and requirements
    requires_modules TEXT[] DEFAULT '{}',
    minimum_tier TEXT DEFAULT 'community' CHECK (minimum_tier IN ('community', 'organization', 'enterprise')),
    
    -- Module metadata
    version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    is_beta BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for module queries
CREATE INDEX idx_platform_modules_category ON platform_modules(category, is_active);
CREATE INDEX idx_platform_modules_active ON platform_modules(is_active, minimum_tier);

-- Project modules junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_modules (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    module_key TEXT NOT NULL REFERENCES platform_modules(key) ON DELETE CASCADE,
    
    -- Module state
    enabled BOOLEAN DEFAULT FALSE,
    configuration JSONB DEFAULT '{}',
    
    -- Usage tracking
    first_activated TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (project_id, module_key)
);

-- Indexes for project modules
CREATE INDEX idx_project_modules_project ON project_modules(project_id, enabled);
CREATE INDEX idx_project_modules_module ON project_modules(module_key, enabled);
CREATE INDEX idx_project_modules_usage ON project_modules(last_used DESC) WHERE enabled = TRUE;

-- Enhanced projects table for multi-tenant features
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'community' CHECK (subscription_tier IN ('community', 'organization', 'enterprise')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial')),
ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{
    "max_users": 10,
    "max_stories_per_month": 100,
    "storage_gb": 10,
    "api_calls_per_day": 1000
}',
ADD COLUMN IF NOT EXISTS white_label_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS platform_metadata JSONB DEFAULT '{}';

-- Add indexes for tenant management queries
CREATE INDEX IF NOT EXISTS idx_projects_subscription ON projects(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(subscription_status, created_at DESC);

-- Insert core platform modules
INSERT INTO platform_modules (key, name, description, category, config_schema, default_config, requires_modules) VALUES
('story_core', 'Story Collection', 'Multi-modal story collection and management', 'core', 
 '{"submission_methods": {"type": "array"}, "consent_flow": {"type": "string"}}',
 '{"submission_methods": ["web", "sms", "whatsapp"], "consent_flow": "standard", "auto_transcribe": true}',
 ARRAY[]::TEXT[]),

('consent_privacy', 'Consent & Privacy', 'Granular consent and privacy management', 'core',
 '{"consent_granularity": {"type": "string"}, "default_privacy": {"type": "string"}}',
 '{"consent_granularity": "detailed", "default_privacy": "community", "track_usage": true}',
 ARRAY[]::TEXT[]),

('user_management', 'User Management', 'Role-based access control and user administration', 'core',
 '{"roles": {"type": "array"}, "require_cultural_training": {"type": "boolean"}}',
 '{"roles": ["owner", "admin", "editor", "storyteller", "viewer"], "require_cultural_training": true, "multi_project_users": true}',
 ARRAY[]::TEXT[]),

('community_analytics', 'Community Analytics', 'Community-centered insights and analytics', 'standard',
 '{"analysis_types": {"type": "array"}, "community_centered_metrics": {"type": "boolean"}}',
 '{"analysis_types": ["themes", "sentiment", "patterns"], "community_centered_metrics": true, "cross_project_insights": false}',
 ARRAY['story_core', 'consent_privacy']),

('cultural_protocols', 'Cultural Protocols', 'Sacred knowledge protection and cultural safety', 'standard',
 '{"require_elder_review": {"type": "boolean"}, "seasonal_restrictions": {"type": "boolean"}}',
 '{"require_elder_review": false, "seasonal_restrictions": false, "cultural_warnings": [], "protocol_training_required": true}',
 ARRAY['consent_privacy', 'user_management']),

('value_distribution', 'Economic Justice', 'Value tracking and benefit distribution', 'standard',
 '{"enable_payments": {"type": "boolean"}, "distribution_model": {"type": "string"}}',
 '{"enable_payments": false, "distribution_model": "community_first", "transparency_level": "full"}',
 ARRAY['story_core', 'consent_privacy'])

ON CONFLICT (key) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    config_schema = EXCLUDED.config_schema,
    default_config = EXCLUDED.default_config,
    requires_modules = EXCLUDED.requires_modules,
    updated_at = NOW();

-- Enable RLS on new tables
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for platform admin access
CREATE POLICY "Platform admins can view all projects" ON projects
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.platform_role IN ('super_admin', 'platform_manager')
    )
);

-- Platform audit log policies
CREATE POLICY "Platform team can view audit logs" ON platform_audit_log
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND (users.platform_role IN ('super_admin', 'platform_manager') 
             OR users.is_platform_team = TRUE)
    )
);

CREATE POLICY "Authenticated users can create audit logs" ON platform_audit_log
FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

-- Module management policies
CREATE POLICY "Everyone can view active modules" ON platform_modules
FOR SELECT TO authenticated
USING (is_active = TRUE);

CREATE POLICY "Platform admins can manage modules" ON platform_modules
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.platform_role = 'super_admin'
    )
);

-- Project modules policies
CREATE POLICY "Project members can view project modules" ON project_modules
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = project_modules.project_id
        AND pm.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.platform_role IN ('super_admin', 'platform_manager')
    )
);

CREATE POLICY "Project admins can manage project modules" ON project_modules
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = project_modules.project_id
        AND pm.user_id = auth.uid()
        AND pm.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.platform_role = 'super_admin'
    )
);

-- Populate existing projects with core modules
INSERT INTO project_modules (project_id, module_key, enabled, configuration, first_activated)
SELECT 
    p.id,
    m.key,
    TRUE,
    m.default_config,
    NOW()
FROM projects p
CROSS JOIN platform_modules m
WHERE m.category = 'core'
ON CONFLICT (project_id, module_key) DO NOTHING;

COMMIT;