-- Create quotes table without foreign key to media (since it doesn't exist in this schema)

CREATE TABLE IF NOT EXISTS quotes (
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
  extracted_by VARCHAR DEFAULT 'manual',
  airtable_id VARCHAR,
  airtable_story_ids VARCHAR[],
  airtable_transcript_ids VARCHAR[]
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quotes_story_id ON quotes(story_id);
CREATE INDEX IF NOT EXISTS idx_quotes_transcript_id ON quotes(transcript_id);
CREATE INDEX IF NOT EXISTS idx_quotes_airtable_id ON quotes(airtable_id);

-- Add Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy (allow read for everyone)
DROP POLICY IF EXISTS "Public quotes are viewable by everyone" ON quotes;
CREATE POLICY "Public quotes are viewable by everyone" ON quotes
  FOR SELECT USING (true);

-- Comment
COMMENT ON TABLE quotes IS 'Extracted quotes linked to stories and media';

-- Verify table was created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'quotes') as column_count
FROM information_schema.tables
WHERE table_name = 'quotes'
  AND table_schema = 'public';