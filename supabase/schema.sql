-- =====================================================================
-- EMPATHY LEDGER SUPABASE SCHEMA
-- Complete database design for story-powered community platform
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================================
-- CUSTOM TYPES
-- =====================================================================

CREATE TYPE story_category AS ENUM (
  'healthcare',
  'education', 
  'housing',
  'youth',
  'elder_care',
  'policy',
  'community',
  'environment',
  'employment',
  'social_services'
);

CREATE TYPE privacy_level AS ENUM (
  'public',
  'community',
  'organization',
  'private'
);

CREATE TYPE story_status AS ENUM (
  'draft',
  'pending',
  'approved',
  'featured',
  'archived'
);

CREATE TYPE user_role AS ENUM (
  'storyteller',
  'organization_admin',
  'community_moderator',
  'platform_admin',
  'researcher'
);

CREATE TYPE organization_type AS ENUM (
  'nonprofit',
  'government',
  'healthcare',
  'education',
  'research',
  'community_group',
  'private_sector'
);

-- =====================================================================
-- CORE USER MANAGEMENT
-- =====================================================================

-- Profiles: Extended user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  
  -- Demographics (optional, for insights)
  age_range TEXT,
  location_general TEXT, -- City/State level only
  languages_spoken TEXT[],
  
  -- Platform preferences
  role user_role DEFAULT 'storyteller',
  privacy_settings JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  
  -- Engagement tracking
  stories_contributed INTEGER DEFAULT 0,
  communities_joined INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  
  -- Account status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ORGANIZATION MANAGEMENT
-- =====================================================================

-- Organizations: Companies, nonprofits, government agencies
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  
  -- Classification
  organization_type organization_type NOT NULL,
  sector TEXT,
  size_category TEXT, -- small, medium, large, enterprise
  
  -- Location
  headquarters_location TEXT,
  service_areas TEXT[],
  
  -- Platform integration
  subscription_tier TEXT DEFAULT 'basic',
  api_access_level TEXT DEFAULT 'standard',
  custom_branding JSONB DEFAULT '{}',
  
  -- Contact information
  primary_contact_id UUID REFERENCES profiles(id),
  support_email TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members and permissions
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL DEFAULT 'member', -- admin, moderator, member, viewer
  permissions JSONB DEFAULT '{}',
  
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- =====================================================================
-- COMMUNITY MANAGEMENT
-- =====================================================================

-- Communities: Geographic or thematic groups
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  
  -- Geographic scope
  geographic_level TEXT, -- neighborhood, city, region, state, national
  location_data JSONB, -- coordinates, boundaries, etc.
  
  -- Thematic focus
  primary_themes TEXT[],
  categories story_category[],
  
  -- Community settings
  privacy_level privacy_level DEFAULT 'public',
  requires_approval BOOLEAN DEFAULT TRUE,
  moderation_settings JSONB DEFAULT '{}',
  
  -- Ownership
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES profiles(id),
  
  -- Stats
  member_count INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community membership
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  role TEXT DEFAULT 'member', -- moderator, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(community_id, user_id)
);

-- =====================================================================
-- STORY SYSTEM
-- =====================================================================

-- Stories: The heart of the platform
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- AI-generated or user-provided
  
  -- Media attachments
  audio_url TEXT,
  video_url TEXT,
  image_urls TEXT[],
  transcription TEXT,
  transcription_confidence FLOAT,
  
  -- Classification
  category story_category NOT NULL,
  themes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Privacy & Access Control
  privacy_level privacy_level DEFAULT 'private',
  can_be_shared BOOLEAN DEFAULT FALSE,
  allow_research_use BOOLEAN DEFAULT FALSE,
  allow_ai_analysis BOOLEAN DEFAULT TRUE,
  
  -- Ownership & Attribution
  contributor_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  community_id UUID REFERENCES communities(id),
  
  -- Optional demographic context (anonymized)
  contributor_age_range TEXT,
  contributor_location TEXT, -- General location only
  contributor_background JSONB, -- Optional demographic context
  
  -- Content analysis (AI-powered)
  sentiment_score FLOAT CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  emotion_scores JSONB, -- joy, sadness, anger, fear, etc.
  topic_scores JSONB, -- topic modeling results
  language_detected TEXT,
  content_warnings TEXT[],
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  
  -- Impact tracking
  impact_score FLOAT DEFAULT 0,
  cited_in_reports INTEGER DEFAULT 0,
  policy_influence_score FLOAT DEFAULT 0,
  
  -- Workflow status
  status story_status DEFAULT 'draft',
  moderation_notes TEXT,
  flagged_content BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Publishing
  published_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Search vector for full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || array_to_string(themes, ' '))
  ) STORED
);

-- Story reactions (likes, hearts, etc.)
CREATE TABLE story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- like, heart, care, helpful, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(story_id, user_id, reaction_type)
);

-- Story comments and responses
CREATE TABLE story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES story_comments(id),
  
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INSIGHTS & ANALYTICS
-- =====================================================================

-- Community insights generated from story patterns
CREATE TABLE community_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Scope
  community_id UUID REFERENCES communities(id),
  organization_id UUID REFERENCES organizations(id),
  geographic_scope TEXT,
  
  -- Data source
  story_count INTEGER NOT NULL,
  date_range_start DATE,
  date_range_end DATE,
  categories_included story_category[],
  
  -- Findings
  key_findings TEXT[] NOT NULL,
  recommendations TEXT[],
  supporting_quotes JSONB, -- Selected anonymized quotes
  
  -- Impact potential
  affected_population INTEGER,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  urgency_level TEXT, -- low, medium, high, critical
  
  -- Policy relevance
  policy_areas TEXT[],
  stakeholders TEXT[],
  potential_interventions TEXT[],
  
  -- Visualization data
  chart_data JSONB,
  map_data JSONB,
  
  -- Publication
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  generated_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site-wide metrics for dashboard display
CREATE TABLE site_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL, -- story_count, community_count, etc.
  
  description TEXT,
  display_format TEXT DEFAULT 'number', -- number, currency, percentage
  
  -- Context
  scope TEXT, -- global, community, organization
  scope_id UUID, -- references communities or organizations
  
  -- Display settings
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Temporal tracking
  date_recorded DATE DEFAULT CURRENT_DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(metric_name, metric_type, scope, scope_id, date_recorded)
);

-- =====================================================================
-- MEDIA MANAGEMENT
-- =====================================================================

-- Media files (images, audio, video)
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Media metadata
  width INTEGER,
  height INTEGER,
  duration FLOAT, -- for audio/video
  
  -- Processing status
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  processed_variants JSONB DEFAULT '{}', -- thumbnails, compressed versions, etc.
  
  -- Access control
  uploaded_by UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  privacy_level privacy_level DEFAULT 'private',
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- RESEARCH & COLLABORATION
-- =====================================================================

-- Research projects using platform data
CREATE TABLE research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Research details
  principal_investigator UUID REFERENCES profiles(id),
  institution TEXT,
  ethics_approval_number TEXT,
  
  -- Data access parameters
  data_scope JSONB, -- which stories, time ranges, etc.
  anonymization_level TEXT,
  access_duration INTERVAL,
  
  -- Status
  status TEXT DEFAULT 'proposed', -- proposed, approved, active, completed
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Value sharing
  revenue_share_percentage FLOAT,
  community_benefit_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Value distribution tracking
CREATE TABLE value_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL, -- research_project, insight_report, etc.
  source_id UUID NOT NULL,
  
  -- Distribution
  total_amount DECIMAL(10,2),
  storyteller_amount DECIMAL(10,2),
  community_amount DECIMAL(10,2),
  platform_amount DECIMAL(10,2),
  
  -- Recipients
  recipient_id UUID REFERENCES profiles(id),
  distribution_method TEXT, -- direct_payment, community_fund, etc.
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PLATFORM CONTENT MANAGEMENT
-- =====================================================================

-- Dynamic content blocks for CMS
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_name TEXT NOT NULL,
  
  content_type TEXT NOT NULL, -- text, media, story_collection, metric, insight
  content_data JSONB NOT NULL,
  
  -- Display settings
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Targeting
  audience_filter JSONB, -- who sees this content
  geo_filter JSONB, -- geographic targeting
  
  -- Schedule
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Ownership
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Stories indexes
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_privacy_level ON stories(privacy_level);
CREATE INDEX idx_stories_contributor ON stories(contributor_id);
CREATE INDEX idx_stories_organization ON stories(organization_id);
CREATE INDEX idx_stories_community ON stories(community_id);
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_stories_published_at ON stories(published_at);
CREATE INDEX idx_stories_search_vector ON stories USING gin(search_vector);

-- Community indexes
CREATE INDEX idx_communities_organization ON communities(organization_id);
CREATE INDEX idx_communities_privacy ON communities(privacy_level);

-- Insights indexes
CREATE INDEX idx_insights_community ON community_insights(community_id);
CREATE INDEX idx_insights_organization ON community_insights(organization_id);
CREATE INDEX idx_insights_published ON community_insights(is_published, published_at);

-- Metrics indexes
CREATE INDEX idx_metrics_featured ON site_metrics(is_featured, display_order);
CREATE INDEX idx_metrics_scope ON site_metrics(scope, scope_id);
CREATE INDEX idx_metrics_date ON site_metrics(date_recorded);

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view public profiles, edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Stories: Complex privacy-based access control
CREATE POLICY "Public stories are viewable by everyone" ON stories
  FOR SELECT USING (privacy_level = 'public' AND status = 'approved');

CREATE POLICY "Community stories viewable by community members" ON stories
  FOR SELECT USING (
    privacy_level = 'community' AND 
    status = 'approved' AND
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization stories viewable by organization members" ON stories
  FOR SELECT USING (
    privacy_level = 'organization' AND 
    status = 'approved' AND
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own stories" ON stories
  FOR SELECT USING (contributor_id = auth.uid());

CREATE POLICY "Users can insert their own stories" ON stories
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "Users can update their own stories" ON stories
  FOR UPDATE USING (contributor_id = auth.uid());

-- Site metrics: Public metrics visible to all, private to organizations
CREATE POLICY "Public metrics are viewable by everyone" ON site_metrics
  FOR SELECT USING (scope = 'global' OR is_featured = true);

CREATE POLICY "Organization metrics viewable by members" ON site_metrics
  FOR SELECT USING (
    scope = 'organization' AND
    scope_id::uuid IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- =====================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON community_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update story counts when stories are added/removed
CREATE OR REPLACE FUNCTION update_story_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update contributor story count
    UPDATE profiles 
    SET stories_contributed = stories_contributed + 1 
    WHERE id = NEW.contributor_id;
    
    -- Update community story count
    IF NEW.community_id IS NOT NULL THEN
      UPDATE communities 
      SET story_count = story_count + 1 
      WHERE id = NEW.community_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update contributor story count
    UPDATE profiles 
    SET stories_contributed = stories_contributed - 1 
    WHERE id = OLD.contributor_id;
    
    -- Update community story count
    IF OLD.community_id IS NOT NULL THEN
      UPDATE communities 
      SET story_count = story_count - 1 
      WHERE id = OLD.community_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_story_counts_trigger
  AFTER INSERT OR DELETE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_story_counts();

-- =====================================================================
-- INITIAL DATA SETUP
-- =====================================================================

-- Insert default site metrics
INSERT INTO site_metrics (metric_name, metric_value, metric_type, description, display_format, is_featured, scope)
VALUES 
  ('total_stories', 0, 'story_count', 'Total stories shared on the platform', 'number', true, 'global'),
  ('total_communities', 0, 'community_count', 'Communities using the platform', 'number', true, 'global'),
  ('policy_changes', 0, 'policy_changes', 'Policy changes influenced by stories', 'number', true, 'global'),
  ('value_returned', 0, 'value_created', 'Value returned to storytellers', 'currency', true, 'global');

-- Create default community (for migration)
INSERT INTO communities (name, slug, description, geographic_level, privacy_level)
VALUES (
  'Global Community',
  'global',
  'The main community for all Empathy Ledger stories',
  'global',
  'public'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================================

-- Public stories with engagement metrics
CREATE VIEW public_stories_with_metrics AS
SELECT 
  s.*,
  p.display_name as contributor_name,
  c.name as community_name,
  o.name as organization_name,
  (SELECT COUNT(*) FROM story_reactions sr WHERE sr.story_id = s.id) as total_reactions,
  (SELECT COUNT(*) FROM story_comments sc WHERE sc.story_id = s.id) as total_comments
FROM stories s
LEFT JOIN profiles p ON s.contributor_id = p.id
LEFT JOIN communities c ON s.community_id = c.id  
LEFT JOIN organizations o ON s.organization_id = o.id
WHERE s.privacy_level = 'public' AND s.status = 'approved';

-- Community statistics
CREATE VIEW community_stats AS
SELECT 
  c.*,
  (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count,
  (SELECT COUNT(*) FROM stories s WHERE s.community_id = c.id AND s.status = 'approved') as approved_story_count,
  (SELECT AVG(s.sentiment_score) FROM stories s WHERE s.community_id = c.id AND s.sentiment_score IS NOT NULL) as avg_sentiment
FROM communities c;

-- Organization dashboard metrics
CREATE VIEW organization_metrics AS
SELECT 
  o.*,
  (SELECT COUNT(*) FROM organization_members om WHERE om.organization_id = o.id) as member_count,
  (SELECT COUNT(*) FROM stories s WHERE s.organization_id = o.id) as total_stories,
  (SELECT COUNT(*) FROM community_insights ci WHERE ci.organization_id = o.id) as insights_generated
FROM organizations o;