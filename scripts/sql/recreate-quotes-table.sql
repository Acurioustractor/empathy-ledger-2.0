-- Drop and recreate quotes table to fix constraints

DROP TABLE IF EXISTS quotes CASCADE;

-- Create quotes table with proper nullable columns
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_text TEXT NOT NULL,
  context TEXT,
  themes TEXT[],
  emotion VARCHAR,
  impact_score INTEGER,
  story_id UUID,
  transcript_id UUID,
  linked_storytellers UUID[],
  linked_media UUID[],
  linked_stories UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extracted_by VARCHAR DEFAULT 'manual'
);

-- Add indexes
CREATE INDEX idx_quotes_story_id ON quotes(story_id);
CREATE INDEX idx_quotes_transcript_id ON quotes(transcript_id);

-- Add Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy (allow read for everyone)
CREATE POLICY "Public quotes are viewable by everyone" ON quotes
  FOR SELECT USING (true);

-- Comment
COMMENT ON TABLE quotes IS 'Extracted quotes linked to stories and media';

-- Verify table structure
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;