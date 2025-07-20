-- Empathy Ledger Multi-Tenant Projects Schema
-- Enables "Built on Empathy Ledger" ecosystem with sovereignty preservation

-- =====================================================
-- PROJECTS TABLE - Organization Spaces with Sovereignty
-- =====================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for URLs like stories.empathyledger.org/project-slug
  organization_name TEXT NOT NULL,
  organization_email TEXT NOT NULL,
  
  -- Custom domain support (e.g., stories.nativeyouthalliance.org)
  custom_domain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT FALSE,
  
  -- Sovereignty framework inherited by all project content
  sovereignty_framework JSONB DEFAULT '{
    "cultural_protocols_required": true,
    "consent_granularity": "story_level",
    "community_ownership": true,
    "value_sharing": true,
    "indigenous_data_sovereignty": true
  }',
  
  -- Project-specific cultural protocols
  cultural_protocols JSONB DEFAULT '{}',
  
  -- Branding and customization
  branding_config JSONB DEFAULT '{
    "primary_color": "#B85C38",
    "secondary_color": "#7A9B76", 
    "logo_url": null,
    "font_family": "Inter",
    "custom_css": null
  }',
  
  -- API and integration configuration
  api_configuration JSONB DEFAULT '{
    "public_api_enabled": true,
    "webhook_endpoints": [],
    "allowed_origins": [],
    "rate_limits": {
      "requests_per_hour": 1000,
      "stories_per_day": 100
    }
  }',
  
  -- Project settings and permissions
  settings JSONB DEFAULT '{
    "story_submission_enabled": true,
    "public_story_display": true,
    "community_insights_enabled": true,
    "cross_project_collaboration": false,
    "analytics_sharing": "project_only"
  }',
  
  -- Subscription and billing
  subscription_tier TEXT DEFAULT 'community' CHECK (
    subscription_tier IN ('community', 'organization', 'enterprise')
  ),
  billing_email TEXT,
  
  -- Project lifecycle
  status TEXT DEFAULT 'active' CHECK (
    status IN ('pending', 'active', 'suspended', 'archived')
  ),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Sovereignty compliance tracking
  sovereignty_compliance_score INTEGER DEFAULT 100,
  last_compliance_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  launched_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics
  total_stories INTEGER DEFAULT 0,
  total_storytellers INTEGER DEFAULT 0,
  last_story_submitted TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_organization ON projects(organization_name);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_subscription_tier ON projects(subscription_tier);
CREATE INDEX idx_projects_domain ON projects(custom_domain) WHERE custom_domain IS NOT NULL;

-- =====================================================
-- PROJECT MEMBERS - Role-Based Access Control
-- =====================================================

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Project-specific roles
  role TEXT DEFAULT 'storyteller' CHECK (
    role IN ('owner', 'admin', 'editor', 'storyteller', 'viewer')
  ),
  
  -- Granular permissions
  permissions JSONB DEFAULT '{
    "can_submit_stories": true,
    "can_edit_own_stories": true,
    "can_view_analytics": false,
    "can_manage_settings": false,
    "can_invite_members": false,
    "can_export_data": false
  }',
  
  -- Cultural protocol responsibilities
  cultural_responsibilities JSONB DEFAULT '{}',
  
  -- Member status
  status TEXT DEFAULT 'active' CHECK (
    status IN ('pending', 'active', 'suspended', 'removed')
  ),
  
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);

-- =====================================================
-- EXTEND EXISTING TABLES FOR PROJECT SUPPORT
-- =====================================================

-- Add project reference to stories
ALTER TABLE stories ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_stories_project ON stories(project_id);

-- Add project reference to story analysis
ALTER TABLE story_analysis ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_story_analysis_project ON story_analysis(project_id);

-- Add project reference to community insights
ALTER TABLE community_insights ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_community_insights_project ON community_insights(project_id);

-- Add project reference to value events
ALTER TABLE value_events ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_value_events_project ON value_events(project_id);

-- =====================================================
-- PROJECT ANALYTICS - Cross-Project Insights
-- =====================================================

CREATE TABLE project_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Time period for analytics
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Story metrics
  stories_submitted INTEGER DEFAULT 0,
  stories_analyzed INTEGER DEFAULT 0,
  stories_published INTEGER DEFAULT 0,
  
  -- Community metrics
  active_storytellers INTEGER DEFAULT 0,
  new_storytellers INTEGER DEFAULT 0,
  community_engagement_score NUMERIC,
  
  -- Sovereignty metrics
  consent_adherence_rate NUMERIC DEFAULT 100.0,
  cultural_protocol_compliance NUMERIC DEFAULT 100.0,
  value_returned_to_community NUMERIC DEFAULT 0,
  
  -- Content metrics
  themes_identified TEXT[],
  languages_used TEXT[],
  geographic_regions TEXT[],
  
  -- Cross-project collaboration (with consent)
  cross_project_connections INTEGER DEFAULT 0,
  shared_insights_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_analytics_project_period ON project_analytics(project_id, period_type, period_start);

-- =====================================================
-- PROJECT INVITATIONS - Onboarding Flow
-- =====================================================

CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Invitation details
  email TEXT NOT NULL,
  role TEXT DEFAULT 'storyteller',
  permissions JSONB DEFAULT '{}',
  
  -- Invitation lifecycle
  invited_by UUID NOT NULL REFERENCES users(id),
  invitation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'declined', 'expired')
  ),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES users(id),
  
  -- Cultural onboarding
  cultural_training_required BOOLEAN DEFAULT TRUE,
  cultural_training_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_invitations_project ON project_invitations(project_id);
CREATE INDEX idx_project_invitations_email ON project_invitations(email);
CREATE INDEX idx_project_invitations_token ON project_invitations(invitation_token);

-- =====================================================
-- PROJECT TEMPLATES - Reusable Configurations
-- =====================================================

CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template categories
  category TEXT NOT NULL CHECK (
    category IN ('indigenous_communities', 'youth_justice', 'health_sovereignty', 
                'environmental_justice', 'community_development', 'research_partnership')
  ),
  
  -- Template configuration
  default_sovereignty_framework JSONB NOT NULL,
  default_cultural_protocols JSONB DEFAULT '{}',
  default_settings JSONB NOT NULL,
  default_branding JSONB NOT NULL,
  
  -- Template content
  welcome_message TEXT,
  story_submission_prompts JSONB DEFAULT '[]',
  cultural_guidelines TEXT,
  
  -- Template lifecycle
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_templates_category ON project_templates(category);
CREATE INDEX idx_project_templates_active ON project_templates(is_active);

-- =====================================================
-- CROSS-PROJECT CONNECTIONS - Collaborative Features
-- =====================================================

CREATE TABLE cross_project_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Connected projects
  project_a UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  project_b UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Connection details
  connection_type TEXT NOT NULL CHECK (
    connection_type IN ('storyteller_exchange', 'insight_sharing', 'joint_analysis', 'collaboration')
  ),
  
  -- Mutual consent required
  consent_project_a BOOLEAN DEFAULT FALSE,
  consent_project_b BOOLEAN DEFAULT FALSE,
  
  -- Connection configuration
  sharing_settings JSONB DEFAULT '{
    "share_aggregated_insights": false,
    "share_storyteller_connections": false,
    "share_best_practices": true,
    "cross_project_analytics": false
  }',
  
  -- Cultural protocol considerations
  cultural_protocols_respected JSONB DEFAULT '{}',
  
  -- Connection lifecycle
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'suspended', 'terminated')
  ),
  
  initiated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure no self-connections
  CHECK (project_a != project_b)
);

-- Unique bidirectional connections
CREATE UNIQUE INDEX idx_cross_project_connections_unique ON cross_project_connections(
  LEAST(project_a, project_b), 
  GREATEST(project_a, project_b)
);

-- =====================================================
-- ROW LEVEL SECURITY FOR MULTI-TENANT ISOLATION
-- =====================================================

-- Enable RLS on all project-related tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_project_connections ENABLE ROW LEVEL SECURITY;

-- Projects are visible to their members and admins
CREATE POLICY "Project visibility" ON projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR
    -- Admins can see all projects
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Project members can see their own membership
CREATE POLICY "Project member visibility" ON project_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Update existing story policies for project isolation
DROP POLICY IF EXISTS "Users can read their own stories" ON stories;
DROP POLICY IF EXISTS "Users can read public stories" ON stories;
DROP POLICY IF EXISTS "Users can read community stories from same community" ON stories;

CREATE POLICY "Project story access" ON stories FOR SELECT
  USING (
    -- Own stories
    storyteller_id = auth.uid() OR
    
    -- Project member access with proper privacy levels
    (project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) AND (
      privacy_level = 'public' OR
      (privacy_level = 'community' AND storyteller_id IN (
        SELECT user_id FROM project_members 
        WHERE project_id = stories.project_id AND status = 'active'
      ))
    )) OR
    
    -- Public stories from any project
    (privacy_level = 'public' AND project_id IN (
      SELECT id FROM projects WHERE status = 'active'
    ))
  );

-- =====================================================
-- FUNCTIONS FOR PROJECT MANAGEMENT
-- =====================================================

-- Function to create a new project with sovereignty defaults
CREATE OR REPLACE FUNCTION create_empathy_project(
  project_name TEXT,
  organization_name TEXT,
  organization_email TEXT,
  creator_user_id UUID,
  template_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_project_id UUID;
  project_slug TEXT;
  template_config RECORD;
BEGIN
  -- Generate unique slug
  project_slug := lower(regexp_replace(project_name, '[^a-zA-Z0-9]+', '-', 'g'));
  project_slug := trim(project_slug, '-');
  
  -- Make slug unique if needed
  WHILE EXISTS (SELECT 1 FROM projects WHERE slug = project_slug) LOOP
    project_slug := project_slug || '-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 8);
  END LOOP;
  
  -- Get template configuration if provided
  IF template_id IS NOT NULL THEN
    SELECT * INTO template_config FROM project_templates WHERE id = template_id;
  END IF;
  
  -- Create the project
  INSERT INTO projects (
    name,
    slug,
    organization_name,
    organization_email,
    sovereignty_framework,
    cultural_protocols,
    settings,
    branding_config
  ) VALUES (
    project_name,
    project_slug,
    organization_name,
    organization_email,
    COALESCE(template_config.default_sovereignty_framework, '{
      "cultural_protocols_required": true,
      "consent_granularity": "story_level",
      "community_ownership": true,
      "value_sharing": true,
      "indigenous_data_sovereignty": true
    }'::jsonb),
    COALESCE(template_config.default_cultural_protocols, '{}'::jsonb),
    COALESCE(template_config.default_settings, '{
      "story_submission_enabled": true,
      "public_story_display": true,
      "community_insights_enabled": true,
      "cross_project_collaboration": false,
      "analytics_sharing": "project_only"
    }'::jsonb),
    COALESCE(template_config.default_branding, '{
      "primary_color": "#B85C38",
      "secondary_color": "#7A9B76",
      "logo_url": null,
      "font_family": "Inter",
      "custom_css": null
    }'::jsonb)
  ) RETURNING id INTO new_project_id;
  
  -- Add creator as project owner
  INSERT INTO project_members (
    project_id,
    user_id,
    role,
    permissions,
    status,
    joined_at
  ) VALUES (
    new_project_id,
    creator_user_id,
    'owner',
    '{
      "can_submit_stories": true,
      "can_edit_own_stories": true,
      "can_view_analytics": true,
      "can_manage_settings": true,
      "can_invite_members": true,
      "can_export_data": true
    }'::jsonb,
    'active',
    NOW()
  );
  
  RETURN new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate project sovereignty compliance score
CREATE OR REPLACE FUNCTION calculate_project_sovereignty_score(target_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  compliance_score INTEGER := 100;
  total_stories INTEGER;
  stories_with_consent INTEGER;
  stories_with_cultural_protocols INTEGER;
  active_storytellers INTEGER;
BEGIN
  -- Get project statistics
  SELECT COUNT(*) INTO total_stories 
  FROM stories WHERE project_id = target_project_id;
  
  SELECT COUNT(*) INTO stories_with_consent
  FROM stories 
  WHERE project_id = target_project_id 
  AND consent_settings != '{}';
  
  SELECT COUNT(*) INTO stories_with_cultural_protocols
  FROM stories 
  WHERE project_id = target_project_id 
  AND cultural_protocols != '{}';
  
  SELECT COUNT(DISTINCT storyteller_id) INTO active_storytellers
  FROM stories 
  WHERE project_id = target_project_id 
  AND submitted_at > NOW() - INTERVAL '30 days';
  
  -- Calculate compliance deductions
  IF total_stories > 0 THEN
    -- Deduct for stories without proper consent
    IF stories_with_consent::FLOAT / total_stories < 0.9 THEN
      compliance_score := compliance_score - 20;
    END IF;
    
    -- Deduct for stories without cultural protocol consideration
    IF stories_with_cultural_protocols::FLOAT / total_stories < 0.7 THEN
      compliance_score := compliance_score - 15;
    END IF;
  END IF;
  
  -- Deduct for inactive projects
  IF active_storytellers = 0 AND total_stories > 0 THEN
    compliance_score := compliance_score - 10;
  END IF;
  
  -- Update project compliance score
  UPDATE projects 
  SET sovereignty_compliance_score = compliance_score,
      last_compliance_check = NOW()
  WHERE id = target_project_id;
  
  RETURN compliance_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR PROJECT MANAGEMENT
-- =====================================================

-- Project dashboard view
CREATE VIEW project_dashboard AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.organization_name,
  p.status,
  p.subscription_tier,
  p.sovereignty_compliance_score,
  
  -- Story metrics
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT CASE WHEN s.status = 'published' THEN s.id END) as published_stories,
  COUNT(DISTINCT CASE WHEN s.submitted_at > NOW() - INTERVAL '30 days' THEN s.id END) as recent_stories,
  
  -- Member metrics
  COUNT(DISTINCT pm.user_id) as total_members,
  COUNT(DISTINCT CASE WHEN pm.role = 'storyteller' THEN pm.user_id END) as storytellers,
  COUNT(DISTINCT s.storyteller_id) as active_storytellers,
  
  -- Analytics
  MAX(s.submitted_at) as last_story_submitted,
  p.created_at,
  p.launched_at

FROM projects p
LEFT JOIN stories s ON p.id = s.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.status = 'active'
GROUP BY p.id, p.name, p.slug, p.organization_name, p.status, p.subscription_tier, 
         p.sovereignty_compliance_score, p.created_at, p.launched_at;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update project statistics when stories are added/removed
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects 
    SET total_stories = total_stories + 1,
        last_story_submitted = NEW.submitted_at
    WHERE id = NEW.project_id;
    
    -- Update storyteller count
    UPDATE projects 
    SET total_storytellers = (
      SELECT COUNT(DISTINCT storyteller_id) 
      FROM stories 
      WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects 
    SET total_stories = GREATEST(0, total_stories - 1)
    WHERE id = OLD.project_id;
    
    -- Update storyteller count
    UPDATE projects 
    SET total_storytellers = (
      SELECT COUNT(DISTINCT storyteller_id) 
      FROM stories 
      WHERE project_id = OLD.project_id
    )
    WHERE id = OLD.project_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_stats
  AFTER INSERT OR DELETE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_project_stats();

-- Update project updated_at timestamp
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at BEFORE UPDATE ON project_members
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- SAMPLE PROJECT TEMPLATES
-- =====================================================

-- Insert default project templates
INSERT INTO project_templates (
  name,
  description,
  category,
  default_sovereignty_framework,
  default_cultural_protocols,
  default_settings,
  default_branding,
  welcome_message,
  story_submission_prompts,
  cultural_guidelines
) VALUES 
(
  'Indigenous Community Storytelling',
  'A template designed for Indigenous communities to collect and share stories while maintaining cultural protocols and sovereignty.',
  'indigenous_communities',
  '{
    "cultural_protocols_required": true,
    "consent_granularity": "story_level",
    "community_ownership": true,
    "value_sharing": true,
    "indigenous_data_sovereignty": true,
    "seasonal_restrictions_supported": true,
    "elder_review_process": true
  }',
  '{
    "seasonal_restrictions": false,
    "gender_specific": false,
    "ceremonial_content": false,
    "requires_elder_review": true,
    "sharing_protocols": ["respect_cultural_protocols", "honor_storyteller_ownership"]
  }',
  '{
    "story_submission_enabled": true,
    "public_story_display": false,
    "community_insights_enabled": true,
    "cross_project_collaboration": false,
    "analytics_sharing": "community_only",
    "elder_review_required": true
  }',
  '{
    "primary_color": "#8B4513",
    "secondary_color": "#228B22",
    "font_family": "Inter",
    "cultural_design_elements": true
  }',
  'Welcome to our community storytelling space. Here, your stories are sacred and remain yours. Share your wisdom, connect with others, and help strengthen our collective voice.',
  '[
    "Share a story about how traditional knowledge has helped you or your community",
    "Tell us about a time when community connection made a difference",
    "What wisdom would you want to pass on to future generations?"
  ]',
  'Please remember that some stories may contain sacred or ceremonial knowledge. Always consider whether your story requires elder review or has seasonal sharing restrictions. Your consent and cultural protocols will always be respected.'
),
(
  'Youth Justice Initiative',
  'A template for organizations working with youth affected by the justice system, emphasizing privacy and empowerment.',
  'youth_justice',
  '{
    "cultural_protocols_required": true,
    "consent_granularity": "story_level",
    "community_ownership": true,
    "value_sharing": true,
    "privacy_protection": "maximum",
    "empowerment_focus": true
  }',
  '{
    "anonymization_available": true,
    "trauma_informed": true,
    "strength_based_analysis": true
  }',
  '{
    "story_submission_enabled": true,
    "public_story_display": false,
    "community_insights_enabled": true,
    "cross_project_collaboration": false,
    "analytics_sharing": "project_only",
    "anonymization_default": true
  }',
  '{
    "primary_color": "#4A6B7C",
    "secondary_color": "#7A9B76",
    "font_family": "Inter"
  }',
  'Your voice matters. Share your experience to help others and create positive change. You control how your story is used and shared.',
  '[
    "Share an experience that shows your strength and resilience",
    "Tell us about a time when someone believed in you",
    "What support or resources made a difference in your journey?"
  ]',
  'Your privacy and safety are our top priorities. All stories are kept confidential unless you explicitly choose to share them. You can change your sharing preferences at any time.'
);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Multi-tenant Empathy Ledger ecosystem ready!';
  RAISE NOTICE 'Organizations can now create "Built on Empathy Ledger" projects';
  RAISE NOTICE 'All sovereignty principles maintained across projects';
END $$;