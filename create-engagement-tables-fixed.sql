-- Create engagement tables for story reactions and comments (FIXED VERSION)
-- Apply this in Supabase SQL Editor

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS story_reactions CASCADE;
DROP TABLE IF EXISTS story_comments CASCADE;

-- Create story_reactions table
CREATE TABLE story_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'inspire', 'support', 'empathy')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id, reaction_type)
);

-- Create story_comments table  
CREATE TABLE story_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true, -- Default to approved for demo
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies (simpler version)
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reactions" ON story_reactions FOR SELECT USING (true);
CREATE POLICY "Public insert reactions" ON story_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete reactions" ON story_reactions FOR DELETE USING (true);

ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON story_comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON story_comments FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX idx_story_comments_story_id ON story_comments(story_id);

-- Verification
SELECT 'Engagement tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('story_reactions', 'story_comments');