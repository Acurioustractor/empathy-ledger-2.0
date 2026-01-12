-- ===============================================================
-- EMPATHY LEDGER - FOUNDATION SCHEMA DEPLOYMENT
-- ===============================================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- 🔗 https://supabase.com/dashboard/project/tednluwflfhxyucgwigh/sql/new
-- ===============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================================
-- 1. ORGANIZATIONS TABLE
-- ===============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  location TEXT,
  contact_email TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- ===============================================================
-- 2. LOCATIONS TABLE  
-- ===============================================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  state_province TEXT,
  city TEXT,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- ===============================================================
-- 3. PROJECTS TABLE
-- ===============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id),
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ===============================================================
-- 4. STORYTELLERS TABLE (Core of the architecture)
-- ===============================================================
CREATE TABLE IF NOT EXISTS storytellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  profile_image_url TEXT,
  bio TEXT,
  
  -- Affiliations
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  location_id UUID REFERENCES locations(id),
  
  -- Privacy & Consent
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  privacy_preferences JSONB DEFAULT '{
    "public_display": false,
    "show_photo": false,
    "show_location": false,
    "show_organization": false
  }'::jsonb,
  
  -- Contact & Professional
  role TEXT,
  phone_number TEXT,
  
  -- Cultural Context
  cultural_background TEXT,
  preferred_pronouns TEXT,
  
  -- Platform Integration
  user_id UUID,
  
  -- Migration tracking
  airtable_record_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storytellers_organization ON storytellers(organization_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_project ON storytellers(project_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_location ON storytellers(location_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_consent ON storytellers(consent_given);
CREATE INDEX IF NOT EXISTS idx_storytellers_airtable ON storytellers(airtable_record_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_email ON storytellers(email);

-- ===============================================================
-- 5. STORIES TABLE (Linked to storytellers)
-- ===============================================================
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Story Data
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  
  -- Storyteller Connection (CRITICAL - every story must have a storyteller)
  storyteller_id UUID REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Privacy & Content
  privacy_level TEXT DEFAULT 'private',
  themes TEXT[] DEFAULT '{}',
  
  -- Media & Transcription
  media_url TEXT,
  transcription TEXT,
  video_embed_code TEXT,
  
  -- Migration Data
  airtable_record_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_privacy ON stories(privacy_level);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_themes ON stories USING GIN(themes);
CREATE INDEX IF NOT EXISTS idx_stories_airtable ON stories(airtable_record_id);

-- ===============================================================
-- 6. CMS TABLES (For site-wide content management)
-- ===============================================================

-- CMS Pages Table
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  page_type VARCHAR(50) DEFAULT 'content',
  status VARCHAR(20) DEFAULT 'draft',
  content JSONB DEFAULT '{}',
  seo_title VARCHAR(500),
  seo_description TEXT,
  seo_keywords TEXT,
  meta_data JSONB DEFAULT '{}',
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- CMS Content Blocks Table
CREATE TABLE IF NOT EXISTS cms_content_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  block_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  schema JSONB DEFAULT '{}',
  default_content JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMS Media Library Table
CREATE TABLE IF NOT EXISTS cms_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  category VARCHAR(100),
  tags TEXT[],
  usage TEXT,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CMS indexes
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_project_id ON cms_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_content_blocks_type ON cms_content_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_cms_media_category ON cms_media(category);

-- ===============================================================
-- 7. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ===============================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all relevant tables
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storytellers_updated_at 
  BEFORE UPDATE ON storytellers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at 
  BEFORE UPDATE ON stories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at 
  BEFORE UPDATE ON cms_pages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_content_blocks_updated_at 
  BEFORE UPDATE ON cms_content_blocks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;

-- Basic read policies (can be refined later)
CREATE POLICY "Public read access for organizations" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Public read access for locations" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Public read access for projects" ON projects
  FOR SELECT USING (true);

-- Storytellers privacy-respecting policies
CREATE POLICY "Public read for consenting storytellers" ON storytellers
  FOR SELECT USING (
    consent_given = true AND 
    (privacy_preferences->>'public_display')::boolean = true
  );

-- Stories privacy policies
CREATE POLICY "Public read for public stories" ON stories
  FOR SELECT USING (privacy_level = 'public');

-- CMS public read policies
CREATE POLICY "Public read access for published pages" ON cms_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read for active blocks" ON cms_content_blocks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read for media" ON cms_media
  FOR SELECT USING (true);

-- ===============================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ===============================================================

COMMENT ON TABLE organizations IS 'Organizations in the Empathy Ledger multi-tenant system';
COMMENT ON TABLE projects IS 'Projects within organizations - location-based groupings';
COMMENT ON TABLE locations IS 'Geographic locations for storytellers and projects';
COMMENT ON TABLE storytellers IS 'Core storyteller-centric table - every story must link to a storyteller';
COMMENT ON TABLE stories IS 'Stories linked to storytellers with privacy controls';
COMMENT ON TABLE cms_pages IS 'Site-wide content management pages';
COMMENT ON TABLE cms_content_blocks IS 'Reusable content blocks for CMS';
COMMENT ON TABLE cms_media IS 'Media library for images, videos, and documents';

-- ===============================================================
-- 10. INITIAL DATA (Optional)
-- ===============================================================

-- Insert initial global settings for CMS
INSERT INTO cms_pages (slug, title, description, status, content) VALUES
('home', 'Home', 'Main homepage content', 'published', '{}'),
('about', 'About Us', 'About Empathy Ledger', 'published', '{}'),
('privacy', 'Privacy Policy', 'Privacy policy page', 'published', '{}')
ON CONFLICT (slug) DO NOTHING;

-- ===============================================================
-- DEPLOYMENT COMPLETE!
-- ===============================================================
-- All foundation tables for Empathy Ledger have been created
-- Ready for Phase 2: Airtable Migration
-- ===============================================================