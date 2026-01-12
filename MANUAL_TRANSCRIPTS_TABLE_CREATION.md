# 📝 MANUAL TRANSCRIPTS TABLE CREATION

Since we cannot execute SQL directly through the API, please create the transcripts table manually:

## 🔗 **STEP 1: Go to Supabase Dashboard**

1. Open: https://supabase.com/dashboard/project/tednluwflfhxyucgwigh
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

## 📋 **STEP 2: Copy and Paste This SQL**

```sql
-- Create transcripts table for AI analysis
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

-- Row Level Security
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Privacy policy (MOST RESTRICTIVE - raw content)
CREATE POLICY "transcripts_access" ON transcripts
    FOR ALL USING (
        -- Storytellers can access their own transcripts
        storyteller_id = auth.uid()
        OR
        -- Organization staff with explicit consent only
        (EXISTS (
            SELECT 1 FROM storytellers 
            WHERE storytellers.id = transcripts.storyteller_id 
            AND storytellers.organization_id IN (
                SELECT organization_id FROM staff_members 
                WHERE staff_members.user_id = auth.uid() 
                AND staff_members.role IN ('admin', 'staff', 'counselor')
            )
        ) AND consent_for_ai_analysis = TRUE)
    );

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
```

## ▶️ **STEP 3: Run the Query**

1. Click "Run" button in the SQL Editor
2. You should see "Success. No rows returned" 
3. The transcripts table is now created!

## ✅ **STEP 4: Verify Creation**

Run this verification query:

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'transcripts' 
ORDER BY ordinal_position;
```

You should see all the transcript table columns listed.

## 🔄 **STEP 5: Ready for Data Migration**

Once the table is created, run:

```bash
npx tsx scripts/migrate-transcript-data.ts
```

This will move all the transcript data from the storytellers table into the new transcripts table with proper structure for AI analysis.

---

## 🎯 **WHY THIS ARCHITECTURE MATTERS**

- **TRANSCRIPTS**: Raw wisdom source for AI analysis (private, secure)
- **STORIES**: Polished content created FROM transcripts (shareable)
- **CLEAR SEPARATION**: AI works on transcripts, public sees stories
- **STORYTELLER CONTROL**: Consent required for every use of their transcripts

This creates the foundation for world-class AI analysis while preserving storyteller dignity and control!