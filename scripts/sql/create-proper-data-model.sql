-- EMPATHY LEDGER PROPER DATA MODEL
-- Based on platform philosophy: Stories vs Storytellers

-- 1. STORYTELLERS TABLE (already exists as 'users' with role='storyteller')
-- These are people with transcripts, quotes, themes - raw material

-- 2. RAW MATERIAL TABLES (already exist)
-- transcripts: 47 records - storyteller interview transcripts
-- quotes: 1135 records - extracted quotes from storytellers  
-- themes: 836 records - thematic analysis from storyteller content

-- 3. ACTUAL STORIES TABLE (needs to be created/restructured)
-- Self-contained narrative pieces: photos, videos, logs, curated content

-- First, let's rename the current 'stories' table to 'imported_transcripts'
-- since that's what it actually contains
ALTER TABLE stories RENAME TO imported_transcripts;

-- Create the REAL stories table for self-contained narrative pieces
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT, -- Main story content (for written stories)
  content_type VARCHAR NOT NULL CHECK (content_type IN ('written', 'photo', 'video', 'audio', 'mixed')),
  media_urls TEXT[], -- Array of media URLs (photos, videos, etc.)
  author_id UUID REFERENCES users(id), -- Who created this story
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  privacy_level VARCHAR DEFAULT 'public' CHECK (privacy_level IN ('public', 'community', 'private')),
  location VARCHAR,
  tags TEXT[],
  story_themes TEXT[],
  
  -- Story metadata
  excerpt TEXT, -- Short description/preview
  featured_image_url VARCHAR,
  reading_time_minutes INTEGER,
  
  -- Community engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX idx_stories_author_id ON stories(author_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_privacy_level ON stories(privacy_level);
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_stories_content_type ON stories(content_type);

-- Create generated stories table for stories built from storyteller transcripts/quotes
CREATE TABLE generated_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  storyteller_id UUID REFERENCES users(id), -- Which storyteller this is built from
  source_type VARCHAR NOT NULL CHECK (source_type IN ('transcript', 'quotes', 'themes', 'mixed')),
  source_ids UUID[], -- IDs of the transcripts/quotes/themes used
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Generation metadata
  generation_method VARCHAR, -- How this was created (AI, manual curation, etc.)
  curator_id UUID REFERENCES users(id), -- Who curated/approved this
  
  -- Story metadata
  excerpt TEXT,
  tags TEXT[],
  themes TEXT[]
);

-- Create indexes
CREATE INDEX idx_generated_stories_storyteller_id ON generated_stories(storyteller_id);
CREATE INDEX idx_generated_stories_status ON generated_stories(status);
CREATE INDEX idx_generated_stories_generated_at ON generated_stories(generated_at);

-- Update the imported transcripts table to be clearer about what it contains
ALTER TABLE imported_transcripts 
ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'airtable_import',
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comment to clarify
COMMENT ON TABLE imported_transcripts IS 'Imported transcript data from Airtable - NOT actual stories';
COMMENT ON TABLE stories IS 'Self-contained narrative pieces: photos, videos, written stories, etc.';
COMMENT ON TABLE generated_stories IS 'Stories generated/curated from storyteller transcripts and quotes';

-- Create a view for easy access to all story content
CREATE VIEW all_stories AS
SELECT 
  id,
  title,
  content,
  'original' as story_type,
  author_id as creator_id,
  created_at,
  status,
  privacy_level,
  content_type,
  tags,
  story_themes as themes
FROM stories
WHERE status = 'published'

UNION ALL

SELECT 
  id,
  title,
  content,
  'generated' as story_type,
  storyteller_id as creator_id,
  generated_at as created_at,
  status,
  'public' as privacy_level,
  'generated' as content_type,
  tags,
  themes
FROM generated_stories
WHERE status = 'published';

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_stories ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be refined later)
CREATE POLICY "Stories are viewable by everyone" ON stories
  FOR SELECT USING (privacy_level = 'public' OR privacy_level = 'community');

CREATE POLICY "Generated stories are viewable by everyone" ON generated_stories
  FOR SELECT USING (status = 'published');

-- Insert some sample actual stories to test
INSERT INTO stories (title, content, content_type, author_id, status, privacy_level, excerpt) VALUES 
('Welcome to Empathy Ledger', 'This is our first self-contained story about building a platform where storytellers own their narratives...', 'written', (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1), 'published', 'public', 'The beginning of our journey'),
('Community Guidelines', 'How we ensure every voice is heard with respect and dignity...', 'written', (SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1), 'published', 'public', 'Building safe spaces for storytelling');