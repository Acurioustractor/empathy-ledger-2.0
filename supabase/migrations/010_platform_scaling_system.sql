-- Sprint 3 Week 3: Platform Scaling Infrastructure
-- Multi-tenant architecture, feature toggles, organization dashboards, and API management

-- Feature Toggle System for Modular Platform Control
CREATE TABLE IF NOT EXISTS feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Feature Identification
  feature_key TEXT UNIQUE NOT NULL, -- e.g., 'ai_analytics', 'community_collaboration', 'story_reader'
  feature_name TEXT NOT NULL,
  feature_description TEXT,
  feature_category TEXT CHECK (feature_category IN ('core', 'analytics', 'community', 'storytelling', 'organization', 'mobile')) NOT NULL,
  
  -- Environment and Rollout Control
  enabled_globally BOOLEAN DEFAULT false,
  enabled_in_production BOOLEAN DEFAULT false,
  enabled_in_development BOOLEAN DEFAULT true,
  rollout_percentage DECIMAL(5,2) DEFAULT 0.0, -- 0-100% rollout for gradual release
  
  -- Access Control
  requires_subscription BOOLEAN DEFAULT false,
  requires_organization_membership BOOLEAN DEFAULT false,
  requires_cultural_competency_level TEXT CHECK (requires_cultural_competency_level IN ('none', 'developing', 'intermediate', 'advanced', 'expert')),
  
  -- Feature Dependencies
  depends_on_features TEXT[], -- Array of feature_keys this feature depends on
  conflicts_with_features TEXT[], -- Features that cannot be enabled simultaneously
  
  -- Organizational Control
  organization_override_allowed BOOLEAN DEFAULT true, -- Can organizations enable/disable this feature
  organization_customization_level TEXT DEFAULT 'basic' CHECK (organization_customization_level IN ('none', 'basic', 'advanced', 'full')),
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_rollout_change TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Management and Multi-Tenant Architecture
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization Identity
  organization_name TEXT NOT NULL,
  organization_slug TEXT UNIQUE NOT NULL, -- for custom subdomains/paths
  organization_type TEXT CHECK (organization_type IN ('nonprofit', 'corporate', 'government', 'educational', 'community', 'indigenous', 'healthcare')) NOT NULL,
  
  -- Contact and Branding
  primary_contact_email TEXT NOT NULL,
  organization_website TEXT,
  organization_logo_url TEXT,
  brand_color_primary TEXT DEFAULT '#1E40AF', -- for UI customization
  brand_color_secondary TEXT DEFAULT '#10B981',
  
  -- Aboriginal and Cultural Context
  indigenous_organization BOOLEAN DEFAULT false,
  cultural_protocols_required BOOLEAN DEFAULT false,
  aboriginal_advisory_council_member BOOLEAN DEFAULT false,
  cultural_competency_requirements TEXT[],
  
  -- Subscription and Access
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise', 'community_partner')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  trial_end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  
  -- Platform Configuration
  max_storytellers INTEGER DEFAULT 10,
  max_stories_per_storyteller INTEGER DEFAULT 25,
  custom_domain_enabled BOOLEAN DEFAULT false,
  custom_domain TEXT,
  api_access_enabled BOOLEAN DEFAULT false,
  whitelisted_domains TEXT[], -- For CORS and API access
  
  -- Revenue and Community Contribution
  revenue_sharing_percentage DECIMAL(5,2) DEFAULT 70.0, -- % that goes to storytellers
  community_contribution_percentage DECIMAL(5,2) DEFAULT 10.0, -- % that goes to community fund
  platform_fee_percentage DECIMAL(5,2) DEFAULT 20.0, -- % retained by platform
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Feature Configuration
CREATE TABLE IF NOT EXISTS organization_feature_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES feature_toggles(feature_key) ON DELETE CASCADE,
  
  -- Feature State for Organization
  enabled BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}'::jsonb, -- Custom configuration for this feature
  customization_settings JSONB DEFAULT '{}'::jsonb, -- UI/UX customizations
  
  -- Access Control within Organization
  available_to_roles TEXT[] DEFAULT ARRAY['admin', 'storyteller', 'viewer'], -- Which roles can access
  requires_approval BOOLEAN DEFAULT false, -- Does feature usage require admin approval
  
  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  usage_limit INTEGER, -- Optional usage limits per billing period
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, feature_key)
);

-- Organization Members and Roles
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Member Role and Permissions
  role TEXT DEFAULT 'storyteller' CHECK (role IN ('admin', 'storyteller', 'viewer', 'cultural_advisor', 'community_representative')),
  permissions JSONB DEFAULT '{
    "can_invite_members": false,
    "can_configure_features": false,
    "can_manage_storytellers": false,
    "can_view_analytics": true,
    "can_export_data": false
  }'::jsonb,
  
  -- Cultural and Community Context
  cultural_competency_level TEXT CHECK (cultural_competency_level IN ('developing', 'intermediate', 'advanced', 'expert')),
  aboriginal_community_connection BOOLEAN DEFAULT false,
  community_representative_for TEXT[], -- Which communities they represent
  
  -- Membership Status
  membership_status TEXT DEFAULT 'active' CHECK (membership_status IN ('pending', 'active', 'suspended', 'left')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- Platform Roadmap and Feature Voting System
CREATE TABLE IF NOT EXISTS platform_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Feature Proposal
  feature_title TEXT NOT NULL,
  feature_description TEXT NOT NULL,
  feature_category TEXT CHECK (feature_category IN ('core', 'analytics', 'community', 'storytelling', 'organization', 'mobile', 'cultural')) NOT NULL,
  
  -- Development Status
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'under_review', 'planned', 'in_development', 'in_testing', 'released', 'rejected')),
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Community Engagement
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  community_interest_score DECIMAL(5,2) DEFAULT 0.0,
  
  -- Development Planning
  estimated_effort_weeks INTEGER,
  estimated_release_quarter TEXT, -- e.g., 'Q2 2024'
  technical_complexity TEXT CHECK (technical_complexity IN ('low', 'medium', 'high', 'very_high')),
  requires_aboriginal_advisor_review BOOLEAN DEFAULT false,
  
  -- Organizational Support
  organization_sponsors TEXT[], -- Organizations that specifically want this feature
  potential_revenue_impact DECIMAL(10,2) DEFAULT 0.0,
  community_value_impact DECIMAL(3,2) DEFAULT 0.0,
  
  -- Metadata
  proposed_by UUID REFERENCES profiles(id),
  proposed_by_organization UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Votes on Roadmap Features
CREATE TABLE IF NOT EXISTS roadmap_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_item_id UUID NOT NULL REFERENCES platform_roadmap(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Vote Details
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote', 'priority_high', 'priority_medium', 'priority_low')) NOT NULL,
  vote_weight DECIMAL(3,2) DEFAULT 1.0, -- Different user types might have different vote weights
  comment TEXT,
  
  -- Community Context
  voting_as TEXT CHECK (voting_as IN ('individual', 'organization_representative', 'cultural_advisor', 'community_member')) DEFAULT 'individual',
  cultural_impact_consideration TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(roadmap_item_id, user_id)
);

-- API Access Management for Organizations
CREATE TABLE IF NOT EXISTS organization_api_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- API Configuration
  api_key_name TEXT NOT NULL,
  api_key_hash TEXT NOT NULL, -- Hashed API key for security
  api_permissions JSONB DEFAULT '{
    "read_storytellers": true,
    "read_stories": true,
    "write_stories": false,
    "manage_members": false,
    "access_analytics": true
  }'::jsonb,
  
  -- Access Control
  allowed_origins TEXT[], -- CORS origins for web apps
  allowed_ips TEXT[], -- IP whitelist if needed
  rate_limit_requests_per_minute INTEGER DEFAULT 60,
  rate_limit_requests_per_hour INTEGER DEFAULT 1000,
  
  -- Usage Tracking
  total_requests INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  requests_this_month INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  expires_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Environment Configuration
CREATE TABLE IF NOT EXISTS environment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Environment Identification
  environment_name TEXT UNIQUE NOT NULL, -- 'production', 'development', 'staging'
  is_production BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- Is this environment publicly accessible
  
  -- Feature Defaults
  default_features_enabled TEXT[], -- Default feature keys enabled in this environment
  restricted_features TEXT[], -- Features that cannot be enabled in this environment
  
  -- Access Control
  requires_authentication BOOLEAN DEFAULT true,
  allows_organization_signup BOOLEAN DEFAULT false,
  allows_public_story_viewing BOOLEAN DEFAULT true,
  
  -- Configuration
  base_url TEXT NOT NULL,
  api_base_url TEXT NOT NULL,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'Platform is under maintenance. Please try again later.',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Platform Scaling Performance
CREATE INDEX IF NOT EXISTS idx_feature_toggles_category ON feature_toggles(feature_category);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON feature_toggles(enabled_globally, enabled_in_production);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(organization_slug);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON organizations(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_organization_features_org ON organization_feature_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_features_enabled ON organization_feature_config(organization_id, enabled);
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_role ON organization_members(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_roadmap_status ON platform_roadmap(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_votes_item ON roadmap_votes(roadmap_item_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_votes_user ON roadmap_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_api_access_org ON organization_api_access(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_access_status ON organization_api_access(status);

-- Row Level Security for Multi-Tenant Architecture
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_feature_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_api_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Platform Scaling

-- Feature toggles viewable by all, manageable by admins
CREATE POLICY "feature_toggles_view_all" ON feature_toggles
  FOR SELECT USING (true);

CREATE POLICY "feature_toggles_manage_admins" ON feature_toggles
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Organizations manageable by their members
CREATE POLICY "organizations_manage_members" ON organizations
  FOR ALL USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Organization feature config manageable by org admins
CREATE POLICY "org_features_manage_admins" ON organization_feature_config
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Organization members viewable and manageable by org members/admins
CREATE POLICY "org_members_view_members" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_manage_admins" ON organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Roadmap viewable by all, votable by authenticated users
CREATE POLICY "roadmap_view_all" ON platform_roadmap
  FOR SELECT USING (true);

CREATE POLICY "roadmap_propose_authenticated" ON platform_roadmap
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Votes manageable by vote owners
CREATE POLICY "roadmap_votes_manage_own" ON roadmap_votes
  FOR ALL USING (user_id = auth.uid());

-- API access manageable by org admins
CREATE POLICY "api_access_manage_org_admins" ON organization_api_access
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Environment config viewable by all, manageable by platform admins
CREATE POLICY "env_config_view_all" ON environment_config
  FOR SELECT USING (true);

CREATE POLICY "env_config_manage_platform_admins" ON environment_config
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'platform_admin')
  );

-- Functions for Platform Scaling

-- Function to check if a feature is enabled for a user/organization
CREATE OR REPLACE FUNCTION is_feature_enabled(
  feature_key_param TEXT,
  user_id_param UUID DEFAULT NULL,
  organization_id_param UUID DEFAULT NULL,
  environment_name_param TEXT DEFAULT 'production'
)
RETURNS BOOLEAN AS $$
DECLARE
  feature_enabled BOOLEAN := false;
  org_override BOOLEAN := false;
BEGIN
  -- Check global feature toggle
  SELECT 
    CASE 
      WHEN environment_name_param = 'production' THEN enabled_in_production
      WHEN environment_name_param = 'development' THEN enabled_in_development
      ELSE enabled_globally
    END
  INTO feature_enabled
  FROM feature_toggles 
  WHERE feature_key = feature_key_param;
  
  -- If feature is globally disabled, return false
  IF NOT COALESCE(feature_enabled, false) THEN
    RETURN false;
  END IF;
  
  -- Check organization override if organization is specified
  IF organization_id_param IS NOT NULL THEN
    SELECT enabled INTO org_override
    FROM organization_feature_config 
    WHERE organization_id = organization_id_param 
    AND feature_key = feature_key_param;
    
    -- If organization has explicit setting, use that
    IF org_override IS NOT NULL THEN
      RETURN org_override;
    END IF;
  END IF;
  
  -- Default to global setting
  RETURN COALESCE(feature_enabled, false);
END;
$$ LANGUAGE plpgsql;

-- Function to get organization's available features
CREATE OR REPLACE FUNCTION get_organization_features(org_id UUID)
RETURNS TABLE (
  feature_key TEXT,
  feature_name TEXT,
  enabled BOOLEAN,
  configuration JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ft.feature_key,
    ft.feature_name,
    COALESCE(ofc.enabled, false) as enabled,
    COALESCE(ofc.configuration, '{}'::jsonb) as configuration
  FROM feature_toggles ft
  LEFT JOIN organization_feature_config ofc ON ft.feature_key = ofc.feature_key AND ofc.organization_id = org_id
  WHERE ft.organization_override_allowed = true
  ORDER BY ft.feature_category, ft.feature_name;
END;
$$ LANGUAGE plpgsql;

-- Insert initial feature toggles
INSERT INTO feature_toggles (feature_key, feature_name, feature_description, feature_category, enabled_globally, enabled_in_production, enabled_in_development) VALUES
('storyteller_profiles', 'Storyteller Profiles', 'Enhanced storyteller profiles with three-tier privacy', 'core', true, true, true),
('story_reader', 'Interactive Story Reader', 'Advanced story reading with engagement tracking', 'storytelling', true, true, true),
('ai_analytics', 'AI-Powered Analytics', 'Professional theme analysis and storyteller intelligence', 'analytics', false, false, true),
('community_collaboration', 'Community Collaboration', 'Storyteller collaboration hub and cross-pollination', 'community', false, false, true),
('organization_dashboard', 'Organization Dashboard', 'Multi-tenant organization management and customization', 'organization', false, false, true),
('mobile_app', 'Mobile Application', 'Native iOS/Android app with offline capabilities', 'mobile', false, false, false),
('story_discovery', 'Story Discovery System', 'Advanced search, filtering, and recommendations', 'storytelling', true, true, true),
('payment_integration', 'Payment Processing', 'Stripe integration for subscriptions and revenue sharing', 'core', true, true, true),
('cultural_protocols', 'Aboriginal Protocol Integration', 'Cultural competency and advisor oversight features', 'cultural', true, true, true),
('api_access', 'Organization API Access', 'API endpoints for custom front-end development', 'organization', false, false, true)
ON CONFLICT (feature_key) DO NOTHING;

-- Insert initial environment configurations
INSERT INTO environment_config (environment_name, is_production, is_public, base_url, api_base_url, default_features_enabled) VALUES
('production', true, true, 'https://empathyledger.com', 'https://api.empathyledger.com', ARRAY['storyteller_profiles', 'story_reader', 'story_discovery', 'payment_integration', 'cultural_protocols']),
('development', false, false, 'http://localhost:3005', 'http://localhost:3005/api', ARRAY['storyteller_profiles', 'story_reader', 'ai_analytics', 'community_collaboration', 'organization_dashboard', 'story_discovery', 'payment_integration', 'cultural_protocols', 'api_access']),
('staging', false, false, 'https://staging.empathyledger.com', 'https://staging-api.empathyledger.com', ARRAY['storyteller_profiles', 'story_reader', 'story_discovery', 'payment_integration', 'cultural_protocols'])
ON CONFLICT (environment_name) DO NOTHING;

COMMENT ON TABLE feature_toggles IS 'Feature toggle system for modular platform control and gradual rollout';
COMMENT ON TABLE organizations IS 'Multi-tenant organization management with customization capabilities';
COMMENT ON TABLE organization_feature_config IS 'Organization-specific feature configuration and customization';
COMMENT ON TABLE organization_members IS 'Organization membership and role management';
COMMENT ON TABLE platform_roadmap IS 'Community-driven feature roadmap with voting and prioritization';
COMMENT ON TABLE roadmap_votes IS 'User votes on platform roadmap features';
COMMENT ON TABLE organization_api_access IS 'API access management for organization custom front-ends';
COMMENT ON TABLE environment_config IS 'Environment-specific configuration and feature defaults';