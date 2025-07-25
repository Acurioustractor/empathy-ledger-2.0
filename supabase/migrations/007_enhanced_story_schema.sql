-- Enhanced Story Schema for Sprint 2: Story Integration & Content Management
-- Building on Sprint 1's enhanced profile foundation for comprehensive storytelling features

-- Enhanced story table for full content management
ALTER TABLE stories ADD COLUMN IF NOT EXISTS
  -- Content Structure
  story_type TEXT CHECK (story_type IN ('primary', 'supporting', 'insight', 'quote_collection', 'case_study')),
  content_structure JSONB DEFAULT '{
    "sections": [],
    "word_count": 0,
    "reading_time_minutes": 0,
    "multimedia_elements": []
  }'::jsonb,
  
  -- Rich Content
  full_content TEXT, -- Complete story content
  content_preview TEXT, -- First 300 words for previews
  key_quotes TEXT[], -- Extracted quotes for highlighting
  
  -- Multimedia Support
  featured_image_url TEXT,
  audio_url TEXT,
  video_url TEXT,
  gallery_images TEXT[],
  
  -- Engagement & Analytics
  view_count INTEGER DEFAULT 0,
  read_completion_rate DECIMAL(5,2) DEFAULT 0.0,
  engagement_score DECIMAL(5,2) DEFAULT 0.0,
  
  -- Content Management
  content_status TEXT DEFAULT 'draft' CHECK (content_status IN ('draft', 'review', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  social_share_image TEXT,
  
  -- Professional Context
  professional_outcomes TEXT[], -- What outcomes this story demonstrates
  collaboration_opportunities TEXT[], -- What this story suggests for partnerships
  methodology_insights TEXT[]; -- Key professional insights from this story

-- Story sections for structured content
CREATE TABLE IF NOT EXISTS story_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Section Structure
  section_order INTEGER NOT NULL,
  section_type TEXT CHECK (section_type IN ('introduction', 'narrative', 'insight', 'outcome', 'methodology', 'reflection')),
  section_title TEXT,
  section_content TEXT NOT NULL,
  
  -- Rich Content Elements
  multimedia_elements JSONB DEFAULT '[]'::jsonb,
  key_quotes TEXT[],
  professional_insights TEXT[],
  
  -- Engagement Tracking
  engagement_hotspots JSONB DEFAULT '[]'::jsonb, -- Where readers spend time
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story engagement tracking
CREATE TABLE IF NOT EXISTS story_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  reader_id UUID REFERENCES profiles(id), -- NULL for anonymous readers
  
  -- Reading Session
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  reading_progress DECIMAL(5,2) DEFAULT 0.0, -- Percentage read
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Engagement Actions
  highlights_made INTEGER DEFAULT 0,
  quotes_saved INTEGER DEFAULT 0,
  insights_bookmarked INTEGER DEFAULT 0,
  social_shares INTEGER DEFAULT 0,
  
  -- Reader Context
  access_level TEXT CHECK (access_level IN ('public', 'paywall', 'organizational')),
  referral_source TEXT,
  device_type TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story analytics aggregation table
CREATE TABLE IF NOT EXISTS story_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Time Period
  period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- View Metrics
  total_views INTEGER DEFAULT 0,
  unique_readers INTEGER DEFAULT 0,
  public_views INTEGER DEFAULT 0,
  premium_views INTEGER DEFAULT 0,
  organizational_views INTEGER DEFAULT 0,
  
  -- Engagement Metrics
  average_reading_time DECIMAL(5,2) DEFAULT 0.0,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,
  highlights_count INTEGER DEFAULT 0,
  quotes_saved_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Revenue Metrics
  revenue_generated DECIMAL(10,2) DEFAULT 0.0,
  new_subscribers INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storyteller content management metadata
CREATE TABLE IF NOT EXISTS storyteller_content_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content Portfolio Stats
  total_stories INTEGER DEFAULT 0,
  published_stories INTEGER DEFAULT 0,
  draft_stories INTEGER DEFAULT 0,
  total_word_count INTEGER DEFAULT 0,
  
  -- Engagement Overview
  total_views INTEGER DEFAULT 0,
  total_unique_readers INTEGER DEFAULT 0,
  average_completion_rate DECIMAL(5,2) DEFAULT 0.0,
  total_highlights INTEGER DEFAULT 0,
  total_quotes_saved INTEGER DEFAULT 0,
  
  -- Revenue Overview
  total_revenue_generated DECIMAL(10,2) DEFAULT 0.0,
  active_subscribers INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  
  -- Professional Impact
  professional_inquiries INTEGER DEFAULT 0,
  partnership_opportunities INTEGER DEFAULT 0,
  speaking_engagements INTEGER DEFAULT 0,
  
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_content_status ON stories(content_status);
CREATE INDEX IF NOT EXISTS idx_stories_story_type ON stories(story_type);
CREATE INDEX IF NOT EXISTS idx_stories_storyteller_published ON stories(storyteller_id, content_status) WHERE content_status = 'published';
CREATE INDEX IF NOT EXISTS idx_story_sections_story_order ON story_sections(story_id, section_order);
CREATE INDEX IF NOT EXISTS idx_story_engagement_story ON story_engagement(story_id);
CREATE INDEX IF NOT EXISTS idx_story_engagement_reader ON story_engagement(reader_id);
CREATE INDEX IF NOT EXISTS idx_story_engagement_session ON story_engagement(story_id, session_start);
CREATE INDEX IF NOT EXISTS idx_story_analytics_story_period ON story_analytics(story_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_storyteller_content_stats_storyteller ON storyteller_content_stats(storyteller_id);

-- Row Level Security Policies
ALTER TABLE story_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_content_stats ENABLE ROW LEVEL SECURITY;

-- Story sections policy - storytellers can manage their own story sections
CREATE POLICY "storytellers_manage_story_sections" ON story_sections
  FOR ALL USING (
    story_id IN (
      SELECT id FROM stories WHERE storyteller_id = auth.uid()
    )
  );

-- Story engagement policy - readers can create engagement records, storytellers can view their story engagement
CREATE POLICY "readers_create_engagement" ON story_engagement
  FOR INSERT WITH CHECK (true);

CREATE POLICY "storytellers_view_story_engagement" ON story_engagement
  FOR SELECT USING (
    story_id IN (
      SELECT id FROM stories WHERE storyteller_id = auth.uid()
    )
  );

-- Story analytics policy - storytellers can view their own analytics
CREATE POLICY "storytellers_view_analytics" ON story_analytics
  FOR SELECT USING (storyteller_id = auth.uid());

-- Content stats policy - storytellers can view and update their own stats
CREATE POLICY "storytellers_manage_content_stats" ON storyteller_content_stats
  FOR ALL USING (storyteller_id = auth.uid());

-- Functions for analytics aggregation
CREATE OR REPLACE FUNCTION update_storyteller_content_stats(storyteller_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO storyteller_content_stats (storyteller_id, total_stories, published_stories, draft_stories, total_word_count, total_views, last_updated)
  SELECT 
    storyteller_uuid,
    COUNT(*) as total_stories,
    COUNT(*) FILTER (WHERE content_status = 'published') as published_stories,
    COUNT(*) FILTER (WHERE content_status = 'draft') as draft_stories,
    COALESCE(SUM((content_structure->>'word_count')::integer), 0) as total_word_count,
    COALESCE(SUM(view_count), 0) as total_views,
    NOW()
  FROM stories 
  WHERE storyteller_id = storyteller_uuid
  ON CONFLICT (storyteller_id) 
  DO UPDATE SET
    total_stories = EXCLUDED.total_stories,
    published_stories = EXCLUDED.published_stories,
    draft_stories = EXCLUDED.draft_stories,
    total_word_count = EXCLUDED.total_word_count,
    total_views = EXCLUDED.total_views,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update content stats when stories change
CREATE OR REPLACE FUNCTION trigger_update_content_stats()
RETURNS trigger AS $$
BEGIN
  PERFORM update_storyteller_content_stats(NEW.storyteller_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_update_content_stats
  AFTER INSERT OR UPDATE OR DELETE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_content_stats();

-- Insert initial story content for Ben Knight demo
INSERT INTO stories (
  id,
  storyteller_id,
  title,
  summary,
  story_type,
  content_status,
  full_content,
  content_preview,
  key_quotes,
  professional_outcomes,
  collaboration_opportunities,
  methodology_insights,
  content_structure,
  featured_image_url,
  themes
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM profiles WHERE slug = 'ben-knight-demo'),
  'From Muswellbrook to Global Platform: A Journey in Community-Centered Innovation',
  'Growing up in Muswellbrook taught me that authentic relationships matter more than credentials. This small-town foundation led me through youth work with Aboriginal communities, international teaching experiences, and roles with Orange Sky and AIME—each teaching me how technology could amplify community wisdom rather than extract from it.',
  'primary',
  'published',
  'The complete story content will be integrated from BEN_KNIGHT_PRIMARY_STORY.md...',
  'Growing up in Muswellbrook taught me that authentic relationships matter more than credentials. This small-town foundation led me through youth work with Aboriginal communities, international teaching experiences, and roles with Orange Sky and AIME—each teaching me how technology could amplify community wisdom rather than extract from it. The most profound professional lesson came not from any university...',
  ARRAY[
    'Authentic relationships matter more than credentials',
    'Technology should amplify community wisdom rather than extract from it',
    'The most important professional networks form around shared values and approaches'
  ],
  ARRAY[
    'Community-centered platform development and technology ethics consultation',
    'Aboriginal community engagement and cultural protocol training',
    'Professional storytelling and authentic networking strategy development'
  ],
  ARRAY[
    'Speaking engagements on the future of professional networking',
    'Partnership opportunities for ethical technology development',
    'Collaboration with organizations building community-owned platforms'
  ],
  ARRAY[
    'Relationship-building protocols learned from Aboriginal communities',
    'Community-centered technology development principles',
    'Authentic professional networking through storytelling'
  ],
  '{
    "sections": [
      {"id": "intro", "type": "introduction", "order": 1},
      {"id": "foundation", "type": "narrative", "order": 2},
      {"id": "evolution", "type": "narrative", "order": 3},
      {"id": "platform", "type": "outcome", "order": 4},
      {"id": "future", "type": "reflection", "order": 5}
    ],
    "word_count": 2500,
    "reading_time_minutes": 12,
    "multimedia_elements": [
      {"type": "featured_image", "url": "/story-images/ben-muswellbrook.jpg"},
      {"type": "video", "url": "/story-videos/ben-primary-story.mp4"}
    ]
  }'::jsonb,
  '/story-images/ben-muswellbrook-hero.jpg',
  ARRAY['Community Relationships', 'Professional Evolution', 'Platform Building', 'Aboriginal Wisdom', 'Ethical Technology']
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE story_sections IS 'Structured sections within stories for rich content organization';
COMMENT ON TABLE story_engagement IS 'Detailed tracking of reader engagement with stories';
COMMENT ON TABLE story_analytics IS 'Aggregated analytics for storyteller insights and platform metrics';
COMMENT ON TABLE storyteller_content_stats IS 'Overall content and performance statistics for storytellers';