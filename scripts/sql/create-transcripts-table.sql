-- Create transcripts table for AI analysis
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Transcript content (source for AI analysis)
  transcript_content TEXT NOT NULL,
  transcript_type TEXT DEFAULT 'interview' CHECK (
    transcript_type IN ('interview', 'written-submission', 'audio-recording', 'video-recording', 'workshop')
  ),
  
  -- Source information
  original_source TEXT, -- Where this came from (Airtable, direct input, etc.)
  collection_method TEXT,
  collection_date TIMESTAMPTZ,
  language TEXT DEFAULT 'en',
  
  -- Content metadata
  word_count INTEGER GENERATED ALWAYS AS (
    array_length(string_to_array(transcript_content, ' '), 1)
  ) STORED,
  character_count INTEGER GENERATED ALWAYS AS (
    length(transcript_content)
  ) STORED,
  
  -- AI analysis readiness
  ready_for_analysis BOOLEAN DEFAULT FALSE,
  analysis_consent_given BOOLEAN DEFAULT FALSE,
  analysis_consent_date TIMESTAMPTZ,
  
  -- Privacy and consent
  privacy_level TEXT DEFAULT 'private' CHECK (
    privacy_level IN ('private', 'organization', 'research', 'public')
  ),
  consent_for_ai_analysis BOOLEAN DEFAULT FALSE,
  consent_for_quote_extraction BOOLEAN DEFAULT FALSE,
  consent_for_theme_analysis BOOLEAN DEFAULT FALSE,
  
  -- Quality and safety
  content_warnings TEXT[] DEFAULT '{}',
  safety_review_status TEXT DEFAULT 'pending' CHECK (
    safety_review_status IN ('pending', 'approved', 'needs-support', 'archived')
  ),
  safety_notes TEXT,
  
  -- Processing status
  processing_status TEXT DEFAULT 'raw' CHECK (
    processing_status IN ('raw', 'cleaned', 'analyzed', 'approved', 'published')
  ),
  last_processed_date TIMESTAMPTZ,
  
  -- Relationships
  related_story_ids UUID[] DEFAULT '{}', -- Stories created FROM this transcript
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one transcript per storyteller (can be updated)
  UNIQUE(storyteller_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transcripts_storyteller ON transcripts(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_ready_analysis ON transcripts(ready_for_analysis);
CREATE INDEX IF NOT EXISTS idx_transcripts_consent ON transcripts(consent_for_ai_analysis);
CREATE INDEX IF NOT EXISTS idx_transcripts_privacy ON transcripts(privacy_level);
CREATE INDEX IF NOT EXISTS idx_transcripts_processing ON transcripts(processing_status);

-- Update trigger
CREATE OR REPLACE FUNCTION update_transcripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transcripts_updated_at ON transcripts;
CREATE TRIGGER update_transcripts_updated_at 
  BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_transcripts_updated_at();