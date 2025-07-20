-- =====================================================================
-- EMPATHY LEDGER SCHEMA COMPLETION CHECK
-- Safely complete any missing database components
-- =====================================================================

-- First, let's check what already exists
DO $$
BEGIN
    RAISE NOTICE 'Checking existing database structure...';
END $$;

-- Check if custom types exist, create if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_category') THEN
        CREATE TYPE story_category AS ENUM (
          'healthcare', 'education', 'housing', 'youth', 'elder_care',
          'policy', 'community', 'environment', 'employment', 'social_services'
        );
        RAISE NOTICE 'Created story_category type';
    ELSE
        RAISE NOTICE 'story_category type already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_level') THEN
        CREATE TYPE privacy_level AS ENUM ('public', 'community', 'organization', 'private');
        RAISE NOTICE 'Created privacy_level type';
    ELSE
        RAISE NOTICE 'privacy_level type already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_status') THEN
        CREATE TYPE story_status AS ENUM ('draft', 'pending', 'approved', 'featured', 'archived');
        RAISE NOTICE 'Created story_status type';
    ELSE
        RAISE NOTICE 'story_status type already exists';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('storyteller', 'organization_admin', 'community_moderator', 'platform_admin', 'researcher');
        RAISE NOTICE 'Created user_role type';
    ELSE
        RAISE NOTICE 'user_role type already exists';
    END IF;
END $$;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
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

-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
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

-- Create communities table if not exists
CREATE TABLE IF NOT EXISTS communities (
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

-- Check if stories table has correct structure
DO $$
BEGIN
    -- Try to add missing columns to stories table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stories') THEN
        RAISE NOTICE 'Stories table exists, checking structure...';
        
        -- Add missing columns if they don't exist
        BEGIN
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}';
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS privacy_level privacy_level DEFAULT 'private';
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS can_be_shared BOOLEAN DEFAULT FALSE;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS allow_research_use BOOLEAN DEFAULT FALSE;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS allow_ai_analysis BOOLEAN DEFAULT FALSE;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS audio_url TEXT;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS video_url TEXT;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS transcription TEXT;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS impact_score FLOAT DEFAULT 0;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS cited_in_reports INTEGER DEFAULT 0;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS sentiment_score FLOAT;
            ALTER TABLE stories ADD COLUMN IF NOT EXISTS emotion_scores JSONB DEFAULT '{}';
            RAISE NOTICE 'Added missing columns to stories table';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Some columns may already exist in stories table';
        END;
    ELSE
        -- Create stories table from scratch
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
        RAISE NOTICE 'Created stories table';
    END IF;
END $$;

-- Create community members table if not exists
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(community_id, user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON profiles
          FOR ALL USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view public profile info') THEN
        CREATE POLICY "Users can view public profile info" ON profiles
          FOR SELECT USING (true);
    END IF;
    
    -- Organizations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Organizations are viewable by all') THEN
        CREATE POLICY "Organizations are viewable by all" ON organizations
          FOR SELECT USING (is_active = true);
    END IF;
    
    -- Communities policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communities' AND policyname = 'Public communities are viewable') THEN
        CREATE POLICY "Public communities are viewable" ON communities
          FOR SELECT USING (privacy_level = 'public' AND is_active = true);
    END IF;
    
    -- Stories policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Users can manage own stories') THEN
        CREATE POLICY "Users can manage own stories" ON stories
          FOR ALL USING (auth.uid() = contributor_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Public stories are viewable') THEN
        CREATE POLICY "Public stories are viewable" ON stories
          FOR SELECT USING (privacy_level = 'public' AND status = 'approved');
    END IF;
    
    -- Community members policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_members' AND policyname = 'Users can view their memberships') THEN
        CREATE POLICY "Users can view their memberships" ON community_members
          FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    RAISE NOTICE 'Row Level Security policies configured';
END $$;

-- Create or replace the profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_stories_contributor ON stories(contributor_id);
CREATE INDEX IF NOT EXISTS idx_stories_community ON stories(community_id);
CREATE INDEX IF NOT EXISTS idx_stories_privacy_status ON stories(privacy_level, status);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);

-- Insert test organization if it doesn't exist
INSERT INTO organizations (name, slug, description, website, contact_email) 
VALUES (
    'Melbourne Community Network',
    'melbourne-community',
    'Supporting diverse communities across Melbourne through storytelling and advocacy',
    'https://melbournecommunity.org.au',
    'stories@melbournecommunity.org.au'
)
ON CONFLICT (slug) DO NOTHING;

-- Get the organization ID and create a test community
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'melbourne-community';
    
    IF org_id IS NOT NULL THEN
        INSERT INTO communities (organization_id, name, slug, description, privacy_level, membership_type)
        VALUES (
            org_id,
            'Inner Melbourne Families',
            'inner-melbourne-families',
            'A safe space for families in inner Melbourne to share experiences and support each other',
            'public',
            'open'
        )
        ON CONFLICT (organization_id, slug) DO NOTHING;
        
        RAISE NOTICE 'Test organization and community created successfully';
    END IF;
END $$;

-- Final status check
SELECT 
    'Database schema completion successful! Ready for user journey testing.' as status,
    (SELECT COUNT(*) FROM organizations) as organizations_count,
    (SELECT COUNT(*) FROM communities) as communities_count,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM stories) as stories_count;