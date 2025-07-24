-- SIMPLE TRANSCRIPTS TABLE (No dependencies on missing tables)
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- CORE CONTENT (Raw wisdom for AI analysis)
  transcript_content TEXT NOT NULL,
  transcript_type TEXT DEFAULT 'interview' CHECK (
    transcript_type IN ('interview', 'written-submission', 'audio-recording', 'video-recording', 'workshop', 'conversation')
  ),
  
  -- SOURCE INFORMATION
  collection_date TIMESTAMPTZ,
  collection_method TEXT,
  duration_minutes INTEGER,
  language TEXT DEFAULT 'en',
  interviewer_name TEXT,
  location TEXT,
  
  -- METADATA (Auto-calculated)
  word_count INTEGER GENERATED ALWAYS AS (
    array_length(string_to_array(transcript_content, ' '), 1)
  ) STORED,
  character_count INTEGER GENERATED ALWAYS AS (
    length(transcript_content)
  ) STORED,
  
  -- STORYTELLER CONSENT & CONTROL
  storyteller_approved_content BOOLEAN DEFAULT FALSE,
  consent_for_ai_analysis BOOLEAN DEFAULT FALSE,
  consent_for_quote_extraction BOOLEAN DEFAULT FALSE,
  consent_for_theme_analysis BOOLEAN DEFAULT FALSE,
  consent_for_story_creation BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  consent_notes TEXT,
  
  -- PRIVACY CONTROLS (Most restrictive by default)
  privacy_level TEXT DEFAULT 'private' CHECK (
    privacy_level IN ('private', 'organization-only', 'research-approved', 'public-approved')
  ),
  access_restrictions TEXT[] DEFAULT '{}',
  
  -- AI ANALYSIS STATUS
  ready_for_analysis BOOLEAN DEFAULT FALSE,
  analysis_requested_date TIMESTAMPTZ,
  analysis_completed_date TIMESTAMPTZ,
  analysis_quality_score DECIMAL(3,2),
  
  -- CONTENT SAFETY & SENSITIVITY
  content_warnings TEXT[] DEFAULT '{}',
  requires_cultural_review BOOLEAN DEFAULT FALSE,
  cultural_considerations TEXT,
  safety_review_status TEXT DEFAULT 'pending' CHECK (
    safety_review_status IN ('pending', 'approved', 'needs-support', 'requires-cultural-review', 'archived')
  ),
  safety_notes TEXT,
  trauma_informed_considerations TEXT,
  
  -- PROCESSING STATUS
  processing_status TEXT DEFAULT 'raw' CHECK (
    processing_status IN ('raw', 'reviewed', 'cleaned', 'analyzed', 'approved-for-stories', 'archived')
  ),
  last_processed_date TIMESTAMPTZ,
  processing_notes TEXT,
  
  -- RELATIONSHIP TO STORIES
  stories_created_count INTEGER DEFAULT 0,
  last_story_creation_date TIMESTAMPTZ,
  
  -- TECHNICAL METADATA
  original_file_format TEXT,
  original_file_size_mb DECIMAL(10,2),
  transcription_method TEXT DEFAULT 'manual',
  transcription_confidence_score DECIMAL(3,2),
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- CONSTRAINTS
  UNIQUE(storyteller_id)
);

-- Create performance indexes
CREATE INDEX idx_transcripts_storyteller ON transcripts(storyteller_id);
CREATE INDEX idx_transcripts_ready_analysis ON transcripts(ready_for_analysis);
CREATE INDEX idx_transcripts_consent ON transcripts(consent_for_ai_analysis);
CREATE INDEX idx_transcripts_privacy ON transcripts(privacy_level);
CREATE INDEX idx_transcripts_processing_status ON transcripts(processing_status);
CREATE INDEX idx_transcripts_safety_status ON transcripts(safety_review_status);
CREATE INDEX idx_transcripts_created_date ON transcripts(created_at);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_transcripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transcripts_updated_at 
    BEFORE UPDATE ON transcripts
    FOR EACH ROW EXECUTE FUNCTION update_transcripts_updated_at();