-- =====================================================================
-- EMPATHY LEDGER QUICK SETUP
-- Essential tables for immediate testing
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE story_category AS ENUM (
  'healthcare', 'education', 'housing', 'youth', 'elder_care',
  'policy', 'community', 'environment', 'employment', 'social_services'
);

CREATE TYPE privacy_level AS ENUM ('public', 'community', 'organization', 'private');
CREATE TYPE story_status AS ENUM ('draft', 'pending', 'approved', 'featured', 'archived');
CREATE TYPE user_role AS ENUM ('storyteller', 'organization_admin', 'community_moderator', 'platform_admin', 'researcher');

-- =====================================================================
-- CORE TABLES
-- =====================================================================

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  age_range TEXT,
  location_general TEXT,
  role user_role DEFAULT 'storyteller',
  privacy_settings JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  website TEXT,
  contact_email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  privacy_level privacy_level DEFAULT 'public',
  membership_type TEXT DEFAULT 'open',
  member_count INTEGER DEFAULT 0,
  story_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category story_category NOT NULL,
  themes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  privacy_level privacy_level DEFAULT 'private',
  can_be_shared BOOLEAN DEFAULT FALSE,
  allow_research_use BOOLEAN DEFAULT FALSE,
  allow_ai_analysis BOOLEAN DEFAULT FALSE,
  contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  image_urls TEXT[] DEFAULT '{}',
  audio_url TEXT,
  video_url TEXT,
  transcription TEXT,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  impact_score FLOAT DEFAULT 0,
  cited_in_reports INTEGER DEFAULT 0,
  status story_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sentiment_score FLOAT,
  emotion_scores JSONB DEFAULT '{}'
);

-- Community members table
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(community_id, user_id)
);

-- =====================================================================
-- ROW LEVEL SECURITY SETUP
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view public profile info" ON profiles
  FOR SELECT USING (true);

-- Basic RLS policies for organizations  
CREATE POLICY "Organizations are viewable by all" ON organizations
  FOR SELECT USING (is_active = true);

-- Basic RLS policies for communities
CREATE POLICY "Public communities are viewable" ON communities
  FOR SELECT USING (privacy_level = 'public' AND is_active = true);

-- Basic RLS policies for stories
CREATE POLICY "Users can manage own stories" ON stories
  FOR ALL USING (auth.uid() = contributor_id);

CREATE POLICY "Public stories are viewable" ON stories
  FOR SELECT USING (privacy_level = 'public' AND status = 'approved');

-- Basic RLS policies for community members
CREATE POLICY "Users can view their memberships" ON community_members
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================================
-- FUNCTIONS FOR PROFILE MANAGEMENT
-- =====================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX idx_stories_contributor ON stories(contributor_id);
CREATE INDEX idx_stories_community ON stories(community_id);
CREATE INDEX idx_stories_privacy_status ON stories(privacy_level, status);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_created ON stories(created_at);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_community ON community_members(community_id);

-- =====================================================================
-- SUCCESS CONFIRMATION
-- =====================================================================

-- Insert a test record to confirm setup
INSERT INTO organizations (name, slug, description) VALUES 
('Test Organization', 'test-org', 'A test organization for validating setup')
ON CONFLICT (slug) DO NOTHING;

-- Return success message
SELECT 'Database setup completed successfully! Ready for user testing.' as setup_status;