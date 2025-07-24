-- =====================================================
-- WORLD-CLASS TRANSCRIPT & STORY ARCHITECTURE
-- =====================================================
-- 
-- PHILOSOPHY:
-- - TRANSCRIPTS = Raw wisdom source for AI analysis
-- - STORIES = Curated content created FROM transcripts
-- - STORYTELLER = Always in control of both
-- 
-- FLOW: Storyteller → Transcript → AI Analysis → Story Creation → Publication
-- =====================================================

-- =====================================================
-- 1. TRANSCRIPTS TABLE: Raw wisdom for AI analysis
-- =====================================================

CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- CONTENT (Raw, authentic material)
  transcript_content TEXT NOT NULL,
  transcript_type TEXT DEFAULT 'interview' CHECK (
    transcript_type IN ('interview', 'written-submission', 'audio-recording', 'video-recording', 'workshop', 'conversation')
  ),
  
  -- SOURCE INFORMATION
  collection_date TIMESTAMPTZ,
  collection_method TEXT CHECK (
    collection_method IN ('in-person-interview', 'phone-interview', 'video-call', 'audio-recording', 'written-form', 'workshop-session', 'email-exchange')
  ),
  duration_minutes INTEGER, -- Length of interview/recording
  language TEXT DEFAULT 'en',
  interviewer_name TEXT, -- Who conducted the interview
  location TEXT, -- Where it was recorded
  
  -- CONTENT METADATA (Automatically generated)
  word_count INTEGER GENERATED ALWAYS AS (
    array_length(string_to_array(transcript_content, ' '), 1)
  ) STORED,
  character_count INTEGER GENERATED ALWAYS AS (
    length(transcript_content)
  ) STORED,
  
  -- STORYTELLER CONSENT & CONTROL
  storyteller_approved_content BOOLEAN DEFAULT FALSE, -- Did they approve the transcript accuracy?
  consent_for_ai_analysis BOOLEAN DEFAULT FALSE,
  consent_for_quote_extraction BOOLEAN DEFAULT FALSE,
  consent_for_theme_analysis BOOLEAN DEFAULT FALSE,
  consent_for_story_creation BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  consent_notes TEXT, -- Any specific instructions from storyteller
  
  -- PRIVACY CONTROLS (Most restrictive by default)
  privacy_level TEXT DEFAULT 'private' CHECK (
    privacy_level IN ('private', 'organization-only', 'research-approved', 'public-approved')
  ),
  access_restrictions TEXT[], -- Specific people/roles who can access
  geographic_restrictions TEXT[], -- Countries/regions where this can be used
  
  -- AI ANALYSIS STATUS
  ready_for_analysis BOOLEAN DEFAULT FALSE,
  analysis_requested_date TIMESTAMPTZ,
  analysis_completed_date TIMESTAMPTZ,
  analysis_quality_score DECIMAL(3,2), -- Quality of AI analysis (0.00 to 1.00)
  
  -- CONTENT SAFETY & SENSITIVITY
  content_warnings TEXT[] DEFAULT '{}', -- Trauma, sensitive topics, etc.
  requires_cultural_review BOOLEAN DEFAULT FALSE,
  cultural_considerations TEXT,
  safety_review_status TEXT DEFAULT 'pending' CHECK (
    safety_review_status IN ('pending', 'approved', 'needs-support', 'requires-cultural-review', 'archived')
  ),
  safety_reviewer_notes TEXT,
  trauma_informed_considerations TEXT,
  
  -- PROCESSING STATUS
  processing_status TEXT DEFAULT 'raw' CHECK (
    processing_status IN ('raw', 'reviewed', 'cleaned', 'analyzed', 'approved-for-stories', 'archived')
  ),
  last_processed_date TIMESTAMPTZ,
  processing_notes TEXT,
  
  -- RELATIONSHIP TO STORIES
  stories_created_count INTEGER DEFAULT 0, -- How many stories have been created from this transcript
  last_story_creation_date TIMESTAMPTZ,
  
  -- TECHNICAL METADATA
  original_file_format TEXT, -- mp3, mp4, docx, etc.
  original_file_size_mb DECIMAL(10,2),
  transcription_method TEXT CHECK (
    transcription_method IN ('manual', 'ai-assisted', 'professional-service', 'storyteller-written')
  ),
  transcription_confidence_score DECIMAL(3,2), -- If AI transcribed
  
  -- BACKUP & PRESERVATION
  backup_stored BOOLEAN DEFAULT FALSE,
  backup_location TEXT,
  preservation_priority TEXT DEFAULT 'standard' CHECK (
    preservation_priority IN ('critical', 'high', 'standard', 'low')
  ),
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- CONSTRAINTS
  UNIQUE(storyteller_id), -- One transcript per storyteller (can be updated)
  
  -- CONTENT VALIDATION
  CONSTRAINT valid_transcript_content CHECK (char_length(transcript_content) >= 10),
  CONSTRAINT valid_consent_dates CHECK (
    consent_date IS NULL OR consent_date <= NOW()
  )
);

-- =====================================================
-- 2. ENHANCE STORIES TABLE: Curated content FROM transcripts
-- =====================================================

-- Add new columns to existing stories table for transcript relationship
ALTER TABLE stories ADD COLUMN IF NOT EXISTS transcript_id UUID REFERENCES transcripts(id) ON DELETE SET NULL;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_format TEXT DEFAULT 'blog-post' CHECK (
  story_format IN ('blog-post', 'video-story', 'social-media-post', 'article', 'newsletter', 'presentation', 'infographic', 'podcast', 'quote-card')
);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'general' CHECK (
  target_audience IN ('general', 'community', 'professionals', 'researchers', 'media', 'funders', 'policy-makers')
);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS editorial_status TEXT DEFAULT 'draft' CHECK (
  editorial_status IN ('draft', 'in-review', 'storyteller-review', 'storyteller-approved', 'published', 'archived')
);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS word_count INTEGER GENERATED ALWAYS AS (
  array_length(string_to_array(content, ' '), 1)
) STORED;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER GENERATED ALWAYS AS (
  GREATEST(1, ROUND(array_length(string_to_array(content, ' '), 1) / 200.0))
) STORED;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS storyteller_approval_date TIMESTAMPTZ;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS storyteller_approval_notes TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS editor_notes TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS publication_scheduled_date TIMESTAMPTZ;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE stories ADD COLUMN IF NOT EXISTS social_media_preview TEXT;

-- =====================================================
-- 3. AI ANALYSIS RESULTS: Insights FROM transcripts
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- ANALYSIS METADATA
  analysis_version TEXT NOT NULL, -- Version of AI analysis system used
  ai_model_used TEXT NOT NULL, -- GPT-4, Claude, etc.
  analysis_date TIMESTAMPTZ DEFAULT NOW(),
  processing_time_seconds INTEGER,
  
  -- CORE ANALYSIS RESULTS (JSON format for flexibility)
  themes_extracted JSONB DEFAULT '[]'::jsonb, -- Array of theme objects
  quotes_curated JSONB DEFAULT '[]'::jsonb, -- Array of quote objects
  insights_generated JSONB DEFAULT '[]'::jsonb, -- Key insights about storyteller
  strength_narrative TEXT, -- Overarching strengths-based summary
  community_connections JSONB DEFAULT '[]'::jsonb, -- Potential connections to others
  
  -- QUALITY METRICS
  overall_quality_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  cultural_sensitivity_score DECIMAL(3,2),
  trauma_informed_score DECIMAL(3,2),
  strengths_based_score DECIMAL(3,2),
  dignity_preservation_score DECIMAL(3,2),
  bias_detection_results JSONB DEFAULT '{}'::jsonb,
  
  -- STORYTELLER REVIEW STATUS
  storyteller_review_status TEXT DEFAULT 'pending' CHECK (
    storyteller_review_status IN ('pending', 'reviewing', 'approved', 'requested-changes', 'rejected')
  ),
  storyteller_feedback TEXT,
  storyteller_edits JSONB DEFAULT '{}'::jsonb, -- Their modifications to AI results
  storyteller_approval_date TIMESTAMPTZ,
  
  -- STAFF REVIEW
  staff_review_status TEXT DEFAULT 'pending' CHECK (
    staff_review_status IN ('pending', 'approved', 'needs-revision', 'escalated')
  ),
  staff_reviewer_id UUID, -- Reference to staff member
  staff_review_notes TEXT,
  staff_review_date TIMESTAMPTZ,
  
  -- USAGE TRACKING
  themes_used_in_stories INTEGER DEFAULT 0,
  quotes_used_in_stories INTEGER DEFAULT 0,
  last_used_for_story_creation TIMESTAMPTZ,
  
  -- RESEARCH VALUE (Anonymized)
  contributes_to_research BOOLEAN DEFAULT FALSE,
  research_insights JSONB DEFAULT '{}'::jsonb,
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- CONSTRAINTS
  UNIQUE(transcript_id), -- One analysis per transcript
  CONSTRAINT valid_quality_scores CHECK (
    overall_quality_score >= 0.0 AND overall_quality_score <= 1.0 AND
    (cultural_sensitivity_score IS NULL OR (cultural_sensitivity_score >= 0.0 AND cultural_sensitivity_score <= 1.0)) AND
    (trauma_informed_score IS NULL OR (trauma_informed_score >= 0.0 AND trauma_informed_score <= 1.0))
  )
);

-- =====================================================
-- 4. STORY CREATION WORKFLOW: Track story development
-- =====================================================

CREATE TABLE IF NOT EXISTS story_creation_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE, -- NULL until story is created
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- STORY CONCEPT
  story_concept TEXT NOT NULL, -- What story will be created
  story_format TEXT NOT NULL CHECK (
    story_format IN ('blog-post', 'video-story', 'social-media-post', 'article', 'newsletter', 'presentation', 'infographic', 'podcast', 'quote-card')
  ),
  target_audience TEXT DEFAULT 'general',
  story_purpose TEXT, -- Why this story is being created
  key_messages TEXT[], -- Main messages to convey
  
  -- CREATION PROCESS
  workflow_status TEXT DEFAULT 'concept' CHECK (
    workflow_status IN ('concept', 'outlined', 'drafted', 'storyteller-review', 'revisions', 'approved', 'published', 'archived')
  ),
  assigned_creator TEXT, -- Staff member or volunteer creating the story
  creation_deadline TIMESTAMPTZ,
  
  -- STORYTELLER INVOLVEMENT
  storyteller_collaboration_level TEXT DEFAULT 'review-only' CHECK (
    storyteller_collaboration_level IN ('review-only', 'collaborative-editing', 'co-creation', 'storyteller-led')
  ),
  storyteller_preferences TEXT, -- Any specific requests from storyteller
  storyteller_availability TEXT, -- When they're available for collaboration
  
  -- CONTENT ELEMENTS (From AI analysis)
  themes_to_include TEXT[], -- Which themes from AI analysis to feature
  quotes_to_include TEXT[], -- Which quotes to potentially use
  insights_to_highlight TEXT[], -- Key insights to emphasize
  
  -- REVIEW & APPROVAL TRACKING
  draft_submitted_date TIMESTAMPTZ,
  storyteller_review_requested_date TIMESTAMPTZ,
  storyteller_feedback_received_date TIMESTAMPTZ,
  revisions_completed_date TIMESTAMPTZ,
  final_approval_date TIMESTAMPTZ,
  
  -- PUBLICATION PLANNING
  publication_channel TEXT[], -- Where will this be published
  publication_timing TEXT, -- When to publish
  promotional_plan TEXT,
  success_metrics TEXT[], -- How will success be measured
  
  -- NOTES & COMMUNICATION
  creator_notes TEXT,
  storyteller_communication_log TEXT[],
  internal_notes TEXT,
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. STORY-TRANSCRIPT RELATIONSHIPS: Clear connections
-- =====================================================

CREATE TABLE IF NOT EXISTS story_transcript_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- CONNECTION DETAILS
  connection_type TEXT DEFAULT 'created-from' CHECK (
    connection_type IN ('created-from', 'inspired-by', 'references', 'updates')
  ),
  content_used_percentage DECIMAL(5,2), -- What % of transcript was used in story
  
  -- SPECIFIC CONTENT USAGE
  themes_used TEXT[], -- Which specific themes from transcript
  quotes_used TEXT[], -- Which specific quotes
  sections_referenced TEXT[], -- Which parts of transcript
  
  -- TRANSFORMATION NOTES
  editorial_changes_made TEXT,
  storyteller_input_incorporated TEXT,
  creative_liberties_taken TEXT,
  
  -- APPROVAL TRACKING
  storyteller_approved_usage BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMPTZ,
  usage_restrictions TEXT[],
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- CONSTRAINTS
  UNIQUE(story_id, transcript_id) -- Each story-transcript pair tracked once
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Transcripts indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_storyteller ON transcripts(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_ready_analysis ON transcripts(ready_for_analysis);
CREATE INDEX IF NOT EXISTS idx_transcripts_consent_analysis ON transcripts(consent_for_ai_analysis);
CREATE INDEX IF NOT EXISTS idx_transcripts_privacy ON transcripts(privacy_level);
CREATE INDEX IF NOT EXISTS idx_transcripts_processing_status ON transcripts(processing_status);
CREATE INDEX IF NOT EXISTS idx_transcripts_safety_status ON transcripts(safety_review_status);
CREATE INDEX IF NOT EXISTS idx_transcripts_created_date ON transcripts(created_at);

-- Stories enhancement indexes
CREATE INDEX IF NOT EXISTS idx_stories_transcript ON stories(transcript_id);
CREATE INDEX IF NOT EXISTS idx_stories_format ON stories(story_format);
CREATE INDEX IF NOT EXISTS idx_stories_editorial_status ON stories(editorial_status);
CREATE INDEX IF NOT EXISTS idx_stories_target_audience ON stories(target_audience);

-- AI Analysis indexes
CREATE INDEX IF NOT EXISTS idx_ai_analysis_transcript ON ai_analysis_results(transcript_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_storyteller ON ai_analysis_results(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_quality ON ai_analysis_results(overall_quality_score);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_storyteller_status ON ai_analysis_results(storyteller_review_status);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_staff_status ON ai_analysis_results(staff_review_status);

-- Story creation workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflow_transcript ON story_creation_workflow(transcript_id);
CREATE INDEX IF NOT EXISTS idx_workflow_story ON story_creation_workflow(story_id);
CREATE INDEX IF NOT EXISTS idx_workflow_storyteller ON story_creation_workflow(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_workflow_status ON story_creation_workflow(workflow_status);
CREATE INDEX IF NOT EXISTS idx_workflow_deadline ON story_creation_workflow(creation_deadline);

-- Story-transcript connections indexes
CREATE INDEX IF NOT EXISTS idx_connections_story ON story_transcript_connections(story_id);
CREATE INDEX IF NOT EXISTS idx_connections_transcript ON story_transcript_connections(transcript_id);
CREATE INDEX IF NOT EXISTS idx_connections_storyteller ON story_transcript_connections(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_connections_type ON story_transcript_connections(connection_type);

-- =====================================================
-- TRIGGERS FOR AUTOMATED WORKFLOWS
-- =====================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analysis_updated_at BEFORE UPDATE ON ai_analysis_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_updated_at BEFORE UPDATE ON story_creation_workflow
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON story_transcript_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically update story count when stories are created from transcripts
CREATE OR REPLACE FUNCTION update_transcript_story_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.transcript_id IS NOT NULL THEN
        UPDATE transcripts 
        SET stories_created_count = stories_created_count + 1,
            last_story_creation_date = NOW()
        WHERE id = NEW.transcript_id;
    ELSIF TG_OP = 'DELETE' AND OLD.transcript_id IS NOT NULL THEN
        UPDATE transcripts 
        SET stories_created_count = GREATEST(0, stories_created_count - 1)
        WHERE id = OLD.transcript_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_story_count_on_transcript_link
    AFTER INSERT OR DELETE ON story_transcript_connections
    FOR EACH ROW EXECUTE FUNCTION update_transcript_story_count();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_creation_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_transcript_connections ENABLE ROW LEVEL SECURITY;

-- Transcripts policy (MOST RESTRICTIVE - raw content)
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
        OR
        -- System admin access
        auth.jwt() ->> 'role' = 'admin'
    );

-- AI Analysis policy (Storyteller must approve)
CREATE POLICY "ai_analysis_access" ON ai_analysis_results
    FOR ALL USING (
        -- Storytellers can access their own analysis
        storyteller_id = auth.uid()
        OR
        -- Organization staff only if storyteller approved
        (EXISTS (
            SELECT 1 FROM storytellers 
            WHERE storytellers.id = ai_analysis_results.storyteller_id 
            AND storytellers.organization_id IN (
                SELECT organization_id FROM staff_members 
                WHERE staff_members.user_id = auth.uid()
            )
        ) AND storyteller_review_status = 'approved')
        OR
        -- System admin
        auth.jwt() ->> 'role' = 'admin'
    );

-- Story creation workflow policy
CREATE POLICY "workflow_access" ON story_creation_workflow
    FOR ALL USING (
        -- Storytellers can see workflows for their content
        storyteller_id = auth.uid()
        OR
        -- Organization staff can access
        EXISTS (
            SELECT 1 FROM storytellers 
            WHERE storytellers.id = story_creation_workflow.storyteller_id 
            AND storytellers.organization_id IN (
                SELECT organization_id FROM staff_members 
                WHERE staff_members.user_id = auth.uid()
            )
        )
        OR
        -- System admin
        auth.jwt() ->> 'role' = 'admin'
    );

-- Story-transcript connections policy
CREATE POLICY "connections_access" ON story_transcript_connections
    FOR ALL USING (
        -- Storytellers can see connections for their content
        storyteller_id = auth.uid()
        OR
        -- Organization staff can access
        EXISTS (
            SELECT 1 FROM storytellers 
            WHERE storytellers.id = story_transcript_connections.storyteller_id 
            AND storytellers.organization_id IN (
                SELECT organization_id FROM staff_members 
                WHERE staff_members.user_id = auth.uid()
            )
        )
        OR
        -- System admin
        auth.jwt() ->> 'role' = 'admin'
    );

-- =====================================================
-- HELPFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Storytellers with their transcript and story status
CREATE OR REPLACE VIEW storyteller_content_overview AS
SELECT 
    s.id as storyteller_id,
    s.full_name,
    s.airtable_record_id,
    
    -- Transcript status
    t.id as transcript_id,
    t.transcript_content IS NOT NULL as has_transcript,
    t.consent_for_ai_analysis,
    t.ready_for_analysis,
    t.processing_status as transcript_status,
    t.word_count as transcript_word_count,
    
    -- AI Analysis status
    ai.id as analysis_id,
    ai.overall_quality_score,
    ai.storyteller_review_status as analysis_review_status,
    
    -- Stories created
    t.stories_created_count,
    (SELECT COUNT(*) FROM stories st WHERE st.storyteller_id = s.id) as total_stories,
    
    -- Latest activity
    GREATEST(s.updated_at, t.updated_at, ai.updated_at) as last_activity
    
FROM storytellers s
LEFT JOIN transcripts t ON s.id = t.storyteller_id
LEFT JOIN ai_analysis_results ai ON t.id = ai.transcript_id
ORDER BY s.full_name;

-- View: Stories with their source transcripts
CREATE OR REPLACE VIEW stories_with_source AS
SELECT 
    st.id as story_id,
    st.title,
    st.story_format,
    st.editorial_status,
    st.word_count,
    st.reading_time_minutes,
    
    -- Storyteller info
    s.id as storyteller_id,
    s.full_name as storyteller_name,
    
    -- Source transcript
    t.id as transcript_id,
    t.transcript_content IS NOT NULL as has_source_transcript,
    t.word_count as source_word_count,
    
    -- Connection details
    stc.content_used_percentage,
    stc.storyteller_approved_usage,
    
    st.created_at,
    st.updated_at
    
FROM stories st
JOIN storytellers s ON st.storyteller_id = s.id
LEFT JOIN story_transcript_connections stc ON st.id = stc.story_id
LEFT JOIN transcripts t ON stc.transcript_id = t.id
ORDER BY st.created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'World-class transcript and story architecture deployed! 🌟' as message;
SELECT 'TRANSCRIPTS: Raw wisdom for AI analysis' as transcripts_purpose;
SELECT 'STORIES: Curated content created FROM transcripts' as stories_purpose;
SELECT 'STORYTELLER: Always in complete control of both' as control_principle;