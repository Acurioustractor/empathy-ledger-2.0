-- ===============================================================
-- TRANSCRIPT-CENTRIC ARCHITECTURE FIX
-- ===============================================================
-- The transcript is the CORE of everything - redesigning around this truth
-- ===============================================================

-- First, let's add the missing fields to storytellers table
ALTER TABLE storytellers 
ADD COLUMN IF NOT EXISTS profile_image_file TEXT,
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT; -- 'audio', 'video', 'text'

-- Add Story Image to stories table  
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS story_image_url TEXT,
ADD COLUMN IF NOT EXISTS story_image_file TEXT;

-- ===============================================================
-- TRANSCRIPTS TABLE - The Heart of Content Generation
-- ===============================================================
-- This is where ALL content analysis and generation starts from
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to storyteller
  storyteller_id UUID REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Core transcript data
  transcript_text TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT, -- 'audio', 'video', 'interview', 'written'
  
  -- Source information
  interview_date TIMESTAMPTZ,
  interviewer TEXT,
  location TEXT,
  duration_minutes INTEGER,
  
  -- Processing status
  processing_status TEXT DEFAULT 'raw', -- 'raw', 'processed', 'analyzed', 'published'
  
  -- AI Analysis Results (generated from transcript)
  themes TEXT[] DEFAULT '{}',
  key_quotes JSONB DEFAULT '[]'::jsonb,
  sentiment_analysis JSONB DEFAULT '{}'::jsonb,
  entities_extracted JSONB DEFAULT '[]'::jsonb,
  
  -- Content generated from this transcript
  generated_stories UUID[] DEFAULT '{}', -- Links to stories table
  generated_content JSONB DEFAULT '{}'::jsonb,
  
  -- Quality and completeness
  transcript_quality TEXT DEFAULT 'good', -- 'excellent', 'good', 'fair', 'poor'
  word_count INTEGER,
  confidence_score FLOAT, -- If auto-transcribed
  
  -- Cultural and sovereignty
  cultural_sensitivity cultural_sensitivity DEFAULT 'general',
  consent_for_analysis BOOLEAN DEFAULT false,
  consent_for_publication BOOLEAN DEFAULT false,
  
  -- Migration tracking
  airtable_record_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  last_analyzed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transcripts_storyteller ON transcripts(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(processing_status);
CREATE INDEX IF NOT EXISTS idx_transcripts_themes ON transcripts USING GIN(themes);
CREATE INDEX IF NOT EXISTS idx_transcripts_quality ON transcripts(transcript_quality);
CREATE INDEX IF NOT EXISTS idx_transcripts_consent ON transcripts(consent_for_analysis, consent_for_publication);

-- ===============================================================
-- QUOTES TABLE - Extracted from Transcripts
-- ===============================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source linking
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Quote content
  quote_text TEXT NOT NULL,
  context TEXT, -- Surrounding context for understanding
  
  -- Classification
  quote_type TEXT, -- 'wisdom', 'experience', 'advice', 'reflection', 'challenge'
  themes TEXT[] DEFAULT '{}',
  emotional_tone TEXT, -- 'hopeful', 'reflective', 'urgent', 'celebratory'
  
  -- Usage and impact
  impact_level TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  shareability_score INTEGER DEFAULT 5, -- 1-10 scale
  used_in_stories UUID[] DEFAULT '{}',
  
  -- Timestamp in original transcript
  transcript_timestamp INTEGER, -- Seconds into the recording
  
  -- AI confidence and human validation
  extraction_confidence FLOAT,
  human_validated BOOLEAN DEFAULT false,
  validated_by UUID,
  
  -- Publishing permissions
  approved_for_sharing BOOLEAN DEFAULT false,
  storyteller_approved BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_transcript ON quotes(transcript_id);
CREATE INDEX IF NOT EXISTS idx_quotes_storyteller ON quotes(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_quotes_themes ON quotes USING GIN(themes);
CREATE INDEX IF NOT EXISTS idx_quotes_approved ON quotes(approved_for_sharing);
CREATE INDEX IF NOT EXISTS idx_quotes_impact ON quotes(impact_level);

-- ===============================================================
-- THEMES TABLE - Extracted from Transcripts
-- ===============================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Theme identification
  theme_name TEXT NOT NULL,
  theme_description TEXT,
  category TEXT, -- 'challenge', 'solution', 'experience', 'wisdom', 'community'
  
  -- Source tracking
  discovered_in_transcripts UUID[] DEFAULT '{}',
  mentioned_by_storytellers UUID[] DEFAULT '{}',
  
  -- Analysis
  frequency_count INTEGER DEFAULT 1,
  emotional_weight TEXT, -- 'heavy', 'neutral', 'uplifting'
  community_significance TEXT, -- 'individual', 'local', 'widespread', 'systemic'
  
  -- Related themes
  parent_theme_id UUID REFERENCES themes(id),
  related_themes UUID[] DEFAULT '{}',
  
  -- Content generation
  used_in_stories UUID[] DEFAULT '{}',
  generated_content JSONB DEFAULT '{}'::jsonb,
  
  -- Validation
  community_validated BOOLEAN DEFAULT false,
  storyteller_validated BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(theme_name);
CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category);
CREATE INDEX IF NOT EXISTS idx_themes_frequency ON themes(frequency_count DESC);
CREATE INDEX IF NOT EXISTS idx_themes_transcripts ON themes USING GIN(discovered_in_transcripts);

-- ===============================================================
-- Update Stories table to link back to transcripts
-- ===============================================================
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS source_transcript_id UUID REFERENCES transcripts(id),
ADD COLUMN IF NOT EXISTS generated_from_quotes UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'original'; -- 'original', 'generated', 'curated'

-- ===============================================================
-- CONTENT GENERATION WORKFLOW TABLE
-- ===============================================================
CREATE TABLE IF NOT EXISTS content_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  storyteller_id UUID REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Job details
  job_type TEXT NOT NULL, -- 'theme_extraction', 'quote_extraction', 'story_generation', 'full_analysis'
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Processing details
  ai_model_used TEXT,
  processing_parameters JSONB DEFAULT '{}'::jsonb,
  
  -- Results
  results JSONB DEFAULT '{}'::jsonb,
  generated_content_ids UUID[] DEFAULT '{}',
  
  -- Quality metrics
  processing_time_seconds INTEGER,
  confidence_score FLOAT,
  human_review_required BOOLEAN DEFAULT true,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_jobs_transcript ON content_generation_jobs(transcript_id);
CREATE INDEX IF NOT EXISTS idx_content_jobs_status ON content_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_content_jobs_type ON content_generation_jobs(job_type);

-- ===============================================================
-- TRIGGERS FOR AUTOMATED PROCESSING
-- ===============================================================

-- Trigger to automatically start content generation when transcript is added
CREATE OR REPLACE FUNCTION trigger_content_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if transcript is substantial and has consent
  IF LENGTH(NEW.transcript_text) > 100 AND NEW.consent_for_analysis = true THEN
    
    -- Create theme extraction job
    INSERT INTO content_generation_jobs (transcript_id, storyteller_id, job_type, status)
    VALUES (NEW.id, NEW.storyteller_id, 'theme_extraction', 'pending');
    
    -- Create quote extraction job
    INSERT INTO content_generation_jobs (transcript_id, storyteller_id, job_type, status)
    VALUES (NEW.id, NEW.storyteller_id, 'quote_extraction', 'pending');
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_content_generation
  AFTER INSERT OR UPDATE ON transcripts
  FOR EACH ROW
  WHEN (NEW.transcript_text IS NOT NULL AND LENGTH(NEW.transcript_text) > 100)
  EXECUTE FUNCTION trigger_content_generation();

-- ===============================================================
-- COMMENTS FOR DOCUMENTATION
-- ===============================================================

COMMENT ON TABLE transcripts IS 'Core transcript data - the foundation for all content generation';
COMMENT ON COLUMN transcripts.transcript_text IS 'The raw transcript text - most important field in the entire system';
COMMENT ON COLUMN transcripts.themes IS 'AI-extracted themes from the transcript';
COMMENT ON COLUMN transcripts.key_quotes IS 'AI-extracted key quotes with context';

COMMENT ON TABLE quotes IS 'Individual quotes extracted from transcripts with impact scoring';
COMMENT ON TABLE themes IS 'Themes discovered across transcripts with frequency tracking';
COMMENT ON TABLE content_generation_jobs IS 'Queue for automated content processing from transcripts';

-- ===============================================================
-- ENABLE RLS
-- ===============================================================

ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Basic read policies (will be refined)
CREATE POLICY "Public read for approved quotes" ON quotes
  FOR SELECT USING (approved_for_sharing = true);

CREATE POLICY "Public read for validated themes" ON themes
  FOR SELECT USING (community_validated = true OR storyteller_validated = true);

-- ===============================================================
-- TRANSCRIPT-CENTRIC ARCHITECTURE COMPLETE
-- ===============================================================
-- This structure makes transcripts the heart of content generation:
-- Storyteller → Transcript → Themes/Quotes → Stories → Publications
-- ===============================================================