-- Empathy Ledger Database Schema
-- Community Knowledge Sovereignty Platform
-- 
-- Philosophy: Every table, column, and policy reflects our commitment to
-- community ownership, cultural protocols, and empowerment over extraction.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search on stories

-- =====================================================
-- USERS TABLE - Community Identity & Sovereignty
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  community_affiliation TEXT,
  cultural_protocols JSONB DEFAULT '{}', -- Cultural access restrictions and protocols
  preferred_pronouns TEXT,
  contact_preferences JSONB DEFAULT '{}', -- Communication preferences
  role TEXT DEFAULT 'storyteller' CHECK (role IN ('storyteller', 'admin', 'researcher', 'community_lead')),
  profile_image_url TEXT,
  bio TEXT,
  languages_spoken TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for community affiliation for efficient community queries
CREATE INDEX idx_users_community_affiliation ON users(community_affiliation);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- STORIES TABLE - Narrative Sovereignty
-- =====================================================

CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  transcript TEXT NOT NULL,
  audio_url TEXT,
  video_url TEXT,
  submission_method TEXT CHECK (submission_method IN ('web', 'whatsapp', 'sms', 'voice', 'video')),
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'community', 'public')),
  consent_settings JSONB NOT NULL DEFAULT '{
    "allowAnalysis": false,
    "allowCommunitySharing": false,
    "allowPublicSharing": false,
    "allowResearch": false,
    "allowValueCreation": false,
    "allowCrossCommunityConnection": false,
    "allowPolicyUse": false,
    "allowMediaUse": false
  }',
  cultural_protocols JSONB DEFAULT '{}', -- Cultural restrictions and protocols
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  geographic_region TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'published', 'archived')),
  media_content JSONB DEFAULT '{}', -- Photos, documents, additional media
  story_themes TEXT[] DEFAULT '{}', -- Community-identified themes
  personal_quotes TEXT[] DEFAULT '{}' -- Meaningful quotes selected by storyteller
);

-- Indexes for efficient querying while respecting privacy
CREATE INDEX idx_stories_storyteller_id ON stories(storyteller_id);
CREATE INDEX idx_stories_privacy_level ON stories(privacy_level);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_community ON stories(storyteller_id, privacy_level) WHERE privacy_level IN ('community', 'public');
CREATE INDEX idx_stories_submitted_at ON stories(submitted_at DESC);

-- Full-text search index for story content (respects privacy)
CREATE INDEX idx_stories_transcript_fts ON stories USING GIN(to_tsvector('english', transcript)) 
  WHERE privacy_level = 'public';

-- =====================================================
-- STORY ANALYSIS TABLE - Community-Centered Intelligence
-- =====================================================

CREATE TABLE story_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL, -- Structured analysis preserving community language
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_version TEXT DEFAULT '1.0',
  community_feedback JSONB DEFAULT '{}', -- Corrections and validations from community
  validated_by_community BOOLEAN DEFAULT FALSE,
  cultural_review_status TEXT DEFAULT 'pending' CHECK (
    cultural_review_status IN ('pending', 'approved', 'requires_revision', 'restricted')
  )
);

-- Ensure one analysis per story per version
CREATE UNIQUE INDEX idx_story_analysis_unique ON story_analysis(story_id, analysis_version);
CREATE INDEX idx_story_analysis_story_id ON story_analysis(story_id);
CREATE INDEX idx_story_analysis_validated ON story_analysis(validated_by_community);

-- =====================================================
-- COMMUNITY INSIGHTS TABLE - Collective Intelligence
-- =====================================================

CREATE TABLE community_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id TEXT NOT NULL, -- Community identifier
  insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'trend', 'recommendation', 'innovation', 'wisdom')),
  title TEXT NOT NULL,
  description TEXT,
  supporting_stories UUID[] NOT NULL DEFAULT '{}', -- Array of story IDs
  confidence_level NUMERIC CHECK (confidence_level >= 0 AND confidence_level <= 1),
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'community' CHECK (visibility IN ('community', 'public', 'restricted')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  community_validated BOOLEAN DEFAULT FALSE,
  value_created JSONB DEFAULT '{}', -- Tracking grants, policy influence, etc.
  cultural_protocols JSONB DEFAULT '{}' -- Community-specific protocols for this insight
);

CREATE INDEX idx_community_insights_community_id ON community_insights(community_id);
CREATE INDEX idx_community_insights_type ON community_insights(insight_type);
CREATE INDEX idx_community_insights_visibility ON community_insights(visibility);
CREATE INDEX idx_community_insights_validated ON community_insights(community_validated);

-- =====================================================
-- VALUE EVENTS TABLE - Benefit Distribution
-- =====================================================

CREATE TABLE value_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  insight_id UUID REFERENCES community_insights(id) ON DELETE SET NULL,
  storyteller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  community_id TEXT,
  event_data JSONB NOT NULL, -- ValueEvent structure with all details
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure at least one reference (story or insight)
ALTER TABLE value_events ADD CONSTRAINT check_value_reference 
  CHECK (story_id IS NOT NULL OR insight_id IS NOT NULL);

CREATE INDEX idx_value_events_story_id ON value_events(story_id);
CREATE INDEX idx_value_events_insight_id ON value_events(insight_id);
CREATE INDEX idx_value_events_storyteller_id ON value_events(storyteller_id);
CREATE INDEX idx_value_events_community_id ON value_events(community_id);
CREATE INDEX idx_value_events_occurred_at ON value_events(occurred_at DESC);

-- =====================================================
-- CONTENT CALENDAR TABLE - Community-Controlled Publishing
-- =====================================================

CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  insight_id UUID REFERENCES community_insights(id) ON DELETE SET NULL,
  platform TEXT CHECK (platform IN ('website', 'facebook', 'instagram', 'twitter', 'linkedin', 'newsletter')),
  content_type TEXT CHECK (content_type IN ('quote', 'summary', 'full_story', 'insight', 'community_wisdom')),
  content_data JSONB DEFAULT '{}', -- Generated content with attributions
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (
    status IN ('draft', 'community_review', 'approved', 'scheduled', 'published', 'cancelled')
  ),
  engagement_metrics JSONB DEFAULT '{}',
  community_approval BOOLEAN DEFAULT FALSE,
  cultural_review_needed BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);
CREATE INDEX idx_content_calendar_status ON content_calendar(status);
CREATE INDEX idx_content_calendar_story_id ON content_calendar(story_id);
CREATE INDEX idx_content_calendar_insight_id ON content_calendar(insight_id);

-- =====================================================
-- STORYTELLER CONNECTIONS TABLE - Consent-Based Networking
-- =====================================================

CREATE TABLE storyteller_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storyteller_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL CHECK (
    connection_type IN ('mutual_themes', 'geographic_proximity', 'community_collaboration', 'mentorship')
  ),
  connection_strength INTEGER DEFAULT 0 CHECK (connection_strength >= 0 AND connection_strength <= 100),
  shared_themes TEXT[] DEFAULT '{}',
  consent_status TEXT DEFAULT 'pending' CHECK (consent_status IN ('pending', 'approved', 'declined')),
  cultural_protocols_respected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure no duplicate connections (bidirectional)
CREATE UNIQUE INDEX idx_storyteller_connections_unique ON storyteller_connections(
  LEAST(storyteller_a, storyteller_b), 
  GREATEST(storyteller_a, storyteller_b)
);

CREATE INDEX idx_storyteller_connections_status ON storyteller_connections(consent_status);
CREATE INDEX idx_storyteller_connections_type ON storyteller_connections(connection_type);

-- =====================================================
-- VIEWS FOR COMMUNITY DASHBOARDS
-- =====================================================

-- Community Dashboard View - Aggregated community insights
CREATE VIEW community_dashboard AS
SELECT 
  u.community_affiliation as community_id,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT CASE WHEN sa.id IS NOT NULL THEN s.id END) as analyzed_stories,
  COUNT(DISTINCT CASE WHEN s.privacy_level = 'public' THEN s.id END) as public_stories,
  COUNT(DISTINCT s.storyteller_id) as total_storytellers,
  ARRAY_AGG(DISTINCT themes.theme) FILTER (WHERE themes.theme IS NOT NULL) as recent_themes,
  COALESCE(SUM((ve.event_data->>'value_amount')::NUMERIC), 0) as value_generated,
  MAX(s.submitted_at) as last_activity
FROM users u
LEFT JOIN stories s ON s.storyteller_id = u.id
LEFT JOIN story_analysis sa ON sa.story_id = s.id
LEFT JOIN value_events ve ON ve.story_id = s.id
LEFT JOIN LATERAL (
  SELECT jsonb_array_elements_text(sa.analysis_data->'themes') as theme
) themes ON true
WHERE u.community_affiliation IS NOT NULL
GROUP BY u.community_affiliation;

-- Storyteller Profile View - Privacy-respecting public profiles
CREATE VIEW storyteller_profiles AS
SELECT 
  u.id as storyteller_id,
  u.full_name,
  u.community_affiliation,
  COUNT(CASE WHEN s.privacy_level IN ('public', 'community') THEN 1 END) as public_story_count,
  ARRAY_AGG(DISTINCT themes.theme) FILTER (WHERE themes.theme IS NOT NULL) as shared_themes,
  -- Contribution score based on community engagement and value creation
  (
    COUNT(CASE WHEN s.privacy_level = 'public' THEN 1 END) * 10 +
    COUNT(CASE WHEN sa.validated_by_community THEN 1 END) * 20 +
    COALESCE(SUM((ve.event_data->>'storyteller_share')::NUMERIC), 0) / 100
  )::INTEGER as contribution_score,
  u.profile_image_url,
  u.bio,
  u.languages_spoken
FROM users u
LEFT JOIN stories s ON s.storyteller_id = u.id AND s.privacy_level IN ('public', 'community')
LEFT JOIN story_analysis sa ON sa.story_id = s.id
LEFT JOIN value_events ve ON ve.storyteller_id = u.id
LEFT JOIN LATERAL (
  SELECT jsonb_array_elements_text(sa.analysis_data->'themes') as theme
) themes ON true
WHERE u.role = 'storyteller'
GROUP BY u.id, u.full_name, u.community_affiliation, u.profile_image_url, u.bio, u.languages_spoken;

-- =====================================================
-- COMMUNITY SOVEREIGNTY FUNCTIONS
-- =====================================================

-- Function to check if user can access specific story
CREATE OR REPLACE FUNCTION can_access_story(story_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  story_privacy TEXT;
  story_storyteller_id UUID;
  user_community TEXT;
  storyteller_community TEXT;
BEGIN
  -- Get story details
  SELECT privacy_level, storyteller_id INTO story_privacy, story_storyteller_id
  FROM stories WHERE id = story_id;
  
  -- If story doesn't exist, no access
  IF story_privacy IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Storyteller always has access to their own stories
  IF story_storyteller_id = user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Public stories are accessible to everyone
  IF story_privacy = 'public' THEN
    RETURN TRUE;
  END IF;
  
  -- Community stories are accessible to same community members
  IF story_privacy = 'community' THEN
    SELECT community_affiliation INTO user_community
    FROM users WHERE id = user_id;
    
    SELECT community_affiliation INTO storyteller_community
    FROM users WHERE id = story_storyteller_id;
    
    RETURN user_community IS NOT NULL 
           AND storyteller_community IS NOT NULL 
           AND user_community = storyteller_community;
  END IF;
  
  -- Private stories are only accessible to storyteller
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate empowerment score for analysis
CREATE OR REPLACE FUNCTION calculate_empowerment_score(analysis_data JSONB)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 50; -- Base score
  assets_count INTEGER;
  cultural_awareness INTEGER;
BEGIN
  -- Add points for community assets identified
  assets_count := (
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'strengths_mentioned'), 0) +
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'innovations_described'), 0) +
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'expertise_demonstrated'), 0) +
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'support_systems'), 0)
  );
  
  score := score + LEAST(assets_count * 5, 30); -- Max 30 points for assets
  
  -- Add points for cultural awareness
  cultural_awareness := COALESCE(jsonb_array_length(analysis_data->'cultural_considerations'->'protocols_noted'), 0);
  score := score + LEAST(cultural_awareness * 10, 20); -- Max 20 points for cultural awareness
  
  -- Ensure score is within bounds
  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_connections ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and public profiles of storytellers in their community
CREATE POLICY "Users can read own profile" ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read community storytellers" ON users FOR SELECT
  USING (
    role = 'storyteller' AND
    community_affiliation IN (
      SELECT community_affiliation FROM users WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Story access policies based on privacy levels and community membership
CREATE POLICY "Users can read their own stories" ON stories FOR SELECT
  USING (storyteller_id = auth.uid());

CREATE POLICY "Users can read public stories" ON stories FOR SELECT
  USING (privacy_level = 'public');

CREATE POLICY "Users can read community stories from same community" ON stories FOR SELECT
  USING (
    privacy_level = 'community' AND
    storyteller_id IN (
      SELECT id FROM users 
      WHERE community_affiliation = (
        SELECT community_affiliation FROM users WHERE id = auth.uid()
      )
    )
  );

-- Users can create and update their own stories
CREATE POLICY "Users can create own stories" ON stories FOR INSERT
  WITH CHECK (storyteller_id = auth.uid());

CREATE POLICY "Users can update own stories" ON stories FOR UPDATE
  USING (storyteller_id = auth.uid())
  WITH CHECK (storyteller_id = auth.uid());

-- Analysis access follows story access permissions
CREATE POLICY "Analysis access follows story permissions" ON story_analysis FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM stories WHERE can_access_story(id, auth.uid())
    )
  );

-- Community insights are visible based on visibility settings and community membership
CREATE POLICY "Community insights visibility" ON community_insights FOR SELECT
  USING (
    visibility = 'public' OR
    (visibility = 'community' AND community_id = (
      SELECT community_affiliation FROM users WHERE id = auth.uid()
    ))
  );

-- Value events are visible to storytellers and community members
CREATE POLICY "Value events visibility" ON value_events FOR SELECT
  USING (
    storyteller_id = auth.uid() OR
    community_id = (SELECT community_affiliation FROM users WHERE id = auth.uid())
  );

-- Storyteller connections require consent
CREATE POLICY "Storyteller connections consent" ON storyteller_connections FOR SELECT
  USING (
    (storyteller_a = auth.uid() OR storyteller_b = auth.uid()) AND
    consent_status = 'approved'
  );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_value_events_updated_at BEFORE UPDATE ON value_events
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON content_calendar
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_storyteller_connections_updated_at BEFORE UPDATE ON storyteller_connections
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Create default admin user (will be updated with real credentials)
INSERT INTO users (
  email, 
  full_name, 
  role, 
  community_affiliation,
  bio
) VALUES (
  'admin@empathyledger.org',
  'Platform Administrator',
  'admin',
  'Empathy Ledger Team',
  'Platform administrator supporting community knowledge sovereignty.'
) ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments documenting the sovereignty philosophy
COMMENT ON TABLE users IS 'Community members with respect for cultural identity and protocols';
COMMENT ON TABLE stories IS 'Community narratives owned by storytellers with granular consent controls';
COMMENT ON TABLE story_analysis IS 'AI analysis that preserves community language and identifies assets first';
COMMENT ON TABLE community_insights IS 'Collective intelligence belonging to communities';
COMMENT ON TABLE value_events IS 'Tracking value creation to ensure benefits flow back to communities';
COMMENT ON FUNCTION can_access_story IS 'Enforces community sovereignty and privacy preferences for story access';
COMMENT ON FUNCTION calculate_empowerment_score IS 'Measures community empowerment vs extraction in AI analysis';