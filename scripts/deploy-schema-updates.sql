-- Empathy Ledger Schema Updates
-- Deploy this to your existing Supabase instance to add missing tables and fix constraints

-- Fix the user role constraint to include our sovereignty roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('storyteller', 'admin', 'researcher', 'community_lead'));

-- Ensure users table has all sovereignty columns
DO $$ 
BEGIN
  -- Add cultural_protocols column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'cultural_protocols') THEN
    ALTER TABLE users ADD COLUMN cultural_protocols JSONB DEFAULT '{}';
  END IF;
  
  -- Add preferred_pronouns column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'preferred_pronouns') THEN
    ALTER TABLE users ADD COLUMN preferred_pronouns TEXT;
  END IF;
  
  -- Add community_affiliation column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'community_affiliation') THEN
    ALTER TABLE users ADD COLUMN community_affiliation TEXT;
  END IF;
  
  -- Add contact_preferences column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'contact_preferences') THEN
    ALTER TABLE users ADD COLUMN contact_preferences JSONB DEFAULT '{}';
  END IF;
  
  -- Add bio column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;
  
  -- Add languages_spoken column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'languages_spoken') THEN
    ALTER TABLE users ADD COLUMN languages_spoken TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add profile_image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
    ALTER TABLE users ADD COLUMN profile_image_url TEXT;
  END IF;
END $$;

-- Ensure stories table has all sovereignty columns
DO $$ 
BEGIN
  -- Add consent_settings column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stories' AND column_name = 'consent_settings') THEN
    ALTER TABLE stories ADD COLUMN consent_settings JSONB NOT NULL DEFAULT '{
      "allowAnalysis": false,
      "allowCommunitySharing": false,
      "allowPublicSharing": false,
      "allowResearch": false,
      "allowValueCreation": false,
      "allowCrossCommunityConnection": false,
      "allowPolicyUse": false,
      "allowMediaUse": false
    }';
  END IF;
  
  -- Add cultural_protocols column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stories' AND column_name = 'cultural_protocols') THEN
    ALTER TABLE stories ADD COLUMN cultural_protocols JSONB DEFAULT '{}';
  END IF;
  
  -- Add story_themes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stories' AND column_name = 'story_themes') THEN
    ALTER TABLE stories ADD COLUMN story_themes TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add personal_quotes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stories' AND column_name = 'personal_quotes') THEN
    ALTER TABLE stories ADD COLUMN personal_quotes TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add geographic_region column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stories' AND column_name = 'geographic_region') THEN
    ALTER TABLE stories ADD COLUMN geographic_region TEXT;
  END IF;
  
  -- Add media_content column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stories' AND column_name = 'media_content') THEN
    ALTER TABLE stories ADD COLUMN media_content JSONB DEFAULT '{}';
  END IF;
  
  -- Add video_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'stories' AND column_name = 'video_url') THEN
    ALTER TABLE stories ADD COLUMN video_url TEXT;
  END IF;
END $$;

-- Create missing content_calendar table
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  insight_id UUID REFERENCES community_insights(id) ON DELETE SET NULL,
  platform TEXT CHECK (platform IN ('website', 'facebook', 'instagram', 'twitter', 'linkedin', 'newsletter')),
  content_type TEXT CHECK (content_type IN ('quote', 'summary', 'full_story', 'insight', 'community_wisdom')),
  content_data JSONB DEFAULT '{}',
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

-- Create missing storyteller_connections table
CREATE TABLE IF NOT EXISTS storyteller_connections (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_community_affiliation ON users(community_affiliation);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_stories_storyteller_id ON stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_privacy_level ON stories(privacy_level);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_submitted_at ON stories(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_story_analysis_story_id ON story_analysis(story_id);
CREATE INDEX IF NOT EXISTS idx_story_analysis_validated ON story_analysis(validated_by_community);

CREATE INDEX IF NOT EXISTS idx_community_insights_community_id ON community_insights(community_id);
CREATE INDEX IF NOT EXISTS idx_community_insights_type ON community_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_community_insights_visibility ON community_insights(visibility);

CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date ON content_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);

-- Create unique index for storyteller connections (bidirectional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_storyteller_connections_unique ON storyteller_connections(
  LEAST(storyteller_a, storyteller_b), 
  GREATEST(storyteller_a, storyteller_b)
);

-- Update RLS policies for new tables
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_connections ENABLE ROW LEVEL SECURITY;

-- Content calendar policies
CREATE POLICY IF NOT EXISTS "Users can see content for their stories" ON content_calendar FOR SELECT
  USING (
    story_id IN (
      SELECT id FROM stories WHERE storyteller_id = auth.uid()
    ) OR
    created_by = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Users can create content calendar entries" ON content_calendar FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Storyteller connections policies
CREATE POLICY IF NOT EXISTS "Users can see their own connections" ON storyteller_connections FOR SELECT
  USING (
    (storyteller_a = auth.uid() OR storyteller_b = auth.uid()) AND
    consent_status = 'approved'
  );

-- Create community dashboard view if it doesn't exist
CREATE OR REPLACE VIEW community_dashboard AS
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

-- Create storyteller profiles view if it doesn't exist
CREATE OR REPLACE VIEW storyteller_profiles AS
SELECT 
  u.id as storyteller_id,
  u.full_name,
  u.community_affiliation,
  COUNT(CASE WHEN s.privacy_level IN ('public', 'community') THEN 1 END) as public_story_count,
  ARRAY_AGG(DISTINCT themes.theme) FILTER (WHERE themes.theme IS NOT NULL) as shared_themes,
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

-- Create sovereignty functions if they don't exist
CREATE OR REPLACE FUNCTION can_access_story(story_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  story_privacy TEXT;
  story_storyteller_id UUID;
  user_community TEXT;
  storyteller_community TEXT;
BEGIN
  SELECT privacy_level, storyteller_id INTO story_privacy, story_storyteller_id
  FROM stories WHERE id = story_id;
  
  IF story_privacy IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF story_storyteller_id = user_id THEN
    RETURN TRUE;
  END IF;
  
  IF story_privacy = 'public' THEN
    RETURN TRUE;
  END IF;
  
  IF story_privacy = 'community' THEN
    SELECT community_affiliation INTO user_community
    FROM users WHERE id = user_id;
    
    SELECT community_affiliation INTO storyteller_community
    FROM users WHERE id = story_storyteller_id;
    
    RETURN user_community IS NOT NULL 
           AND storyteller_community IS NOT NULL 
           AND user_community = storyteller_community;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_empowerment_score(analysis_data JSONB)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 50;
  assets_count INTEGER;
  cultural_awareness INTEGER;
BEGIN
  assets_count := (
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'strengths_mentioned'), 0) +
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'innovations_described'), 0) +
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'expertise_demonstrated'), 0) +
    COALESCE(jsonb_array_length(analysis_data->'community_assets'->'support_systems'), 0)
  );
  
  score := score + LEAST(assets_count * 5, 30);
  
  cultural_awareness := COALESCE(jsonb_array_length(analysis_data->'cultural_considerations'->'protocols_noted'), 0);
  score := score + LEAST(cultural_awareness * 10, 20);
  
  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_calendar_updated_at ON content_calendar;
CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON content_calendar
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_storyteller_connections_updated_at ON storyteller_connections;
CREATE TRIGGER update_storyteller_connections_updated_at BEFORE UPDATE ON storyteller_connections
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE content_calendar IS 'Community-controlled content publishing with cultural review processes';
COMMENT ON TABLE storyteller_connections IS 'Consent-based networking between community storytellers';
COMMENT ON FUNCTION can_access_story IS 'Enforces community sovereignty and privacy preferences for story access';
COMMENT ON FUNCTION calculate_empowerment_score IS 'Measures community empowerment vs extraction in AI analysis';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Empathy Ledger schema updates deployed successfully! Your platform now supports full community sovereignty features.';
END $$;