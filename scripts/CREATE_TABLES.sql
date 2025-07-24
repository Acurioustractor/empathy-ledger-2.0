-- =====================================================
-- ORGANIZATIONS AND PROJECTS TABLES CREATION
-- =====================================================
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Organization Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  website_url VARCHAR(500),
  
  -- Contact Information
  primary_contact_email VARCHAR(255),
  primary_contact_name VARCHAR(255),
  phone VARCHAR(50),
  
  -- Address/Location
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Organization Type & Status
  organization_type VARCHAR(50) DEFAULT 'nonprofit',
  status VARCHAR(20) DEFAULT 'active',
  
  -- Sovereignty & Cultural Context
  cultural_context TEXT[],
  sovereignty_status VARCHAR(50),
  cultural_protocols JSONB DEFAULT '{}',
  
  -- Platform Settings
  subscription_tier VARCHAR(20) DEFAULT 'community',
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  
  -- Branding & Customization
  logo_url VARCHAR(500),
  brand_colors JSONB DEFAULT '{}',
  custom_domain VARCHAR(255),
  
  -- Platform Features
  enabled_modules TEXT[] DEFAULT ARRAY['storytelling'],
  feature_flags JSONB DEFAULT '{}',
  
  -- Compliance & Sovereignty
  sovereignty_compliance_score INTEGER DEFAULT 85,
  data_retention_policy JSONB DEFAULT '{}',
  consent_framework JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Create indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization Relationship
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Basic Project Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  mission_statement TEXT,
  
  -- Project Configuration
  project_type VARCHAR(50) DEFAULT 'storytelling',
  status VARCHAR(20) DEFAULT 'active',
  visibility VARCHAR(20) DEFAULT 'public',
  
  -- Storytelling Configuration
  story_collection_methods TEXT[] DEFAULT ARRAY['web'],
  story_approval_required BOOLEAN DEFAULT TRUE,
  story_moderation_enabled BOOLEAN DEFAULT TRUE,
  
  -- Cultural & Sovereignty Settings
  cultural_sensitivity VARCHAR(20) DEFAULT 'general',
  requires_elder_review BOOLEAN DEFAULT FALSE,
  cultural_protocols JSONB DEFAULT '{}',
  community_consent_required BOOLEAN DEFAULT TRUE,
  
  -- Geographic/Community Scope
  geographic_scope VARCHAR(100),
  target_communities TEXT[],
  primary_language VARCHAR(10) DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  
  -- Project Lifecycle
  launched_at TIMESTAMPTZ DEFAULT NOW(),
  planned_end_date TIMESTAMPTZ,
  actual_end_date TIMESTAMPTZ,
  
  -- Capacity & Limits
  max_storytellers INTEGER DEFAULT 1000,
  max_stories INTEGER DEFAULT 10000,
  max_administrators INTEGER DEFAULT 10,
  
  -- Public Interface
  custom_subdomain VARCHAR(100),
  custom_domain VARCHAR(255),
  public_description TEXT,
  
  -- Branding
  logo_url VARCHAR(500),
  brand_colors JSONB DEFAULT '{}',
  custom_styling JSONB DEFAULT '{}',
  
  -- Analytics & Metrics
  total_stories INTEGER DEFAULT 0,
  total_storytellers INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.0,
  impact_score DECIMAL(5,2) DEFAULT 0.0,
  sovereignty_compliance_score INTEGER DEFAULT 85,
  
  -- Last Activity Tracking
  last_story_submitted TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Settings & Configuration
  settings JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Ensure slug is unique within organization
  UNIQUE(organization_id, slug)
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_projects_activity ON projects(last_activity_at DESC);

-- 3. Add project_id columns to existing tables
ALTER TABLE stories ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
ALTER TABLE media ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_project ON stories(project_id);
CREATE INDEX IF NOT EXISTS idx_media_project ON media(project_id);

-- 4. Enable RLS on new tables (optional - for security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policies (allow read access for now)
CREATE POLICY "organizations_read_access" ON organizations FOR SELECT USING (true);
CREATE POLICY "projects_read_access" ON projects FOR SELECT USING (true);

-- Success message
SELECT 'Organizations and Projects tables created successfully!' as result;