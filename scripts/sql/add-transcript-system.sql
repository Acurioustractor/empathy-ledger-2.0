-- =====================================================
-- ADD SCALABLE TRANSCRIPT MANAGEMENT SYSTEM
-- Run this AFTER fixing RLS policies
-- =====================================================

-- 1. CREATE TRANSCRIPTS TABLE FOR SCALABLE STORAGE
-- =====================================================

CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    
    -- Transcript versions (for editing history)
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    
    -- Content
    raw_transcript TEXT, -- Original from AI/manual
    edited_transcript TEXT, -- Human-edited version
    
    -- Metadata
    source TEXT DEFAULT 'manual', -- 'ai_generated', 'manual', 'imported'
    ai_service TEXT, -- 'assemblyai', 'whisper', 'claude', etc.
    confidence_score FLOAT,
    duration_seconds INTEGER,
    word_count INTEGER,
    
    -- Timestamps and speakers
    timestamps JSONB, -- [{start: 0, end: 5, text: "Hello", speaker: "Speaker 1"}]
    speakers JSONB, -- [{id: "speaker_1", name: "John Doe", segments: 15}]
    
    -- Processing status
    processing_status TEXT DEFAULT 'completed', -- pending, processing, completed, failed
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ DEFAULT NOW(),
    processing_error TEXT,
    
    -- Quality checks
    has_profanity BOOLEAN DEFAULT false,
    requires_review BOOLEAN DEFAULT false,
    review_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create unique index instead of constraint (PostgreSQL compatible)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_current_transcript 
ON transcripts(story_id) 
WHERE is_current = true;

-- 2. CREATE QUOTES EXTRACTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
    
    -- Quote content
    quote_text TEXT NOT NULL,
    context TEXT, -- Surrounding text for context
    
    -- Location in transcript
    start_time FLOAT,
    end_time FLOAT,
    word_position INTEGER,
    
    -- Categorization
    themes TEXT[],
    emotion TEXT,
    impact_score FLOAT,
    
    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    used_in_reports TEXT[], -- Report IDs where quoted
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    extracted_by TEXT DEFAULT 'human' -- 'ai' or 'human'
);

-- 3. IMPROVE STORYTELLER MANAGEMENT
-- =====================================================

-- Add storyteller-specific fields to users table (safely)
ALTER TABLE users ADD COLUMN IF NOT EXISTS storyteller_profile JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_interview_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_stories INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_transcript_minutes INTEGER DEFAULT 0;

-- Create storyteller onboarding tracking
CREATE TABLE IF NOT EXISTS storyteller_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Onboarding steps
    profile_completed BOOLEAN DEFAULT false,
    first_story_submitted BOOLEAN DEFAULT false,
    consent_form_signed BOOLEAN DEFAULT false,
    training_completed BOOLEAN DEFAULT false,
    
    -- Preferences
    interview_preferences JSONB DEFAULT '{}',
    topic_interests TEXT[] DEFAULT '{}',
    privacy_preferences JSONB DEFAULT '{}',
    
    -- Support
    assigned_mentor_id UUID REFERENCES users(id),
    onboarding_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. CREATE THEMES MANAGEMENT SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Hierarchy
    parent_theme_id UUID REFERENCES themes(id),
    theme_level INTEGER DEFAULT 1, -- 1=top, 2=sub, 3=specific
    
    -- Usage
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    
    -- Display
    color_hex TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story-theme relationships
CREATE TABLE IF NOT EXISTS story_themes (
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    
    -- Relevance scoring
    relevance_score FLOAT DEFAULT 1.0,
    assigned_by TEXT DEFAULT 'storyteller', -- 'ai', 'storyteller', 'moderator'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (story_id, theme_id)
);

-- 5. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Transcript indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_story_id ON transcripts(story_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_current ON transcripts(story_id) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(processing_status);

-- Story indexes
CREATE INDEX IF NOT EXISTS idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_privacy ON stories(privacy_level);
CREATE INDEX IF NOT EXISTS idx_stories_submitted ON stories(submitted_at DESC);

-- Theme indexes
CREATE INDEX IF NOT EXISTS idx_story_themes_story ON story_themes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_theme ON story_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_usage ON themes(usage_count DESC);

-- Quote indexes
CREATE INDEX IF NOT EXISTS idx_quotes_story ON quotes(story_id);
CREATE INDEX IF NOT EXISTS idx_quotes_transcript ON quotes(transcript_id);

-- 6. ADD FULL-TEXT SEARCH
-- =====================================================

-- Add search vector column
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_transcript_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.edited_transcript, NEW.raw_transcript, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS trig_update_transcript_search_vector ON transcripts;
CREATE TRIGGER trig_update_transcript_search_vector 
    BEFORE INSERT OR UPDATE OF raw_transcript, edited_transcript 
    ON transcripts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_transcript_search_vector();

-- Create search index
CREATE INDEX IF NOT EXISTS idx_transcript_search ON transcripts USING gin(search_vector);

-- 7. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to add a new storyteller
CREATE OR REPLACE FUNCTION add_new_storyteller(
    p_email TEXT,
    p_full_name TEXT,
    p_community TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Insert into users table
    INSERT INTO users (
        email, 
        full_name, 
        community_affiliation, 
        bio, 
        role,
        created_at
    ) VALUES (
        p_email,
        p_full_name,
        p_community,
        p_bio,
        'storyteller',
        NOW()
    ) RETURNING id INTO v_user_id;
    
    -- Create onboarding record
    INSERT INTO storyteller_onboarding (user_id) VALUES (v_user_id);
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process new transcript
CREATE OR REPLACE FUNCTION process_new_transcript(
    p_story_id UUID,
    p_transcript_text TEXT,
    p_source TEXT DEFAULT 'manual'
) RETURNS UUID AS $$
DECLARE
    v_transcript_id UUID;
    v_word_count INTEGER;
BEGIN
    -- Calculate word count
    v_word_count := array_length(string_to_array(trim(p_transcript_text), ' '), 1);
    
    -- Mark any existing transcripts as non-current
    UPDATE transcripts 
    SET is_current = false 
    WHERE story_id = p_story_id AND is_current = true;
    
    -- Insert new transcript
    INSERT INTO transcripts (
        story_id,
        raw_transcript,
        edited_transcript,
        source,
        word_count,
        processing_status,
        processing_completed_at
    ) VALUES (
        p_story_id,
        p_transcript_text,
        p_transcript_text, -- Initially same as raw
        p_source,
        COALESCE(v_word_count, 0),
        'completed',
        NOW()
    ) RETURNING id INTO v_transcript_id;
    
    -- Update story transcript field for backward compatibility
    UPDATE stories 
    SET transcript = p_transcript_text 
    WHERE id = p_story_id;
    
    RETURN v_transcript_id;
END;
$$ LANGUAGE plpgsql;

-- 8. MIGRATE EXISTING DATA
-- =====================================================

-- Migrate existing transcripts to new table
INSERT INTO transcripts (story_id, raw_transcript, edited_transcript, source, processing_status, word_count, created_at)
SELECT 
    id,
    transcript,
    transcript,
    'imported',
    'completed',
    COALESCE(array_length(string_to_array(trim(transcript), ' '), 1), 0),
    submitted_at
FROM stories
WHERE transcript IS NOT NULL 
  AND transcript != ''
  AND NOT EXISTS (
      SELECT 1 FROM transcripts t WHERE t.story_id = stories.id
  );

-- 9. CREATE USEFUL VIEWS
-- =====================================================

-- View for storyteller dashboard
CREATE OR REPLACE VIEW storyteller_dashboard AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.community_affiliation,
    COUNT(DISTINCT s.id) as total_stories,
    COUNT(DISTINCT t.id) as total_transcripts,
    SUM(t.word_count) as total_words,
    MAX(s.submitted_at) as last_story_date
FROM users u
LEFT JOIN stories s ON s.storyteller_id = u.id
LEFT JOIN transcripts t ON t.story_id = s.id AND t.is_current = true
WHERE u.role = 'storyteller'
GROUP BY u.id, u.full_name, u.email, u.community_affiliation;

-- View for stories with current transcripts
CREATE OR REPLACE VIEW stories_with_transcripts AS
SELECT 
    s.*,
    t.edited_transcript as current_transcript,
    t.word_count,
    t.confidence_score,
    t.processing_status
FROM stories s
LEFT JOIN transcripts t ON t.story_id = s.id AND t.is_current = true;

-- 10. SET UP SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_themes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transcripts
CREATE POLICY "transcripts_read" ON transcripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = transcripts.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "transcripts_write" ON transcripts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = transcripts.story_id 
            AND stories.storyteller_id = auth.uid()
        )
        OR auth.jwt()->>'role' = 'service_role'
    );

-- Create RLS policies for other tables
CREATE POLICY "quotes_read" ON quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = quotes.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "themes_read" ON themes
    FOR SELECT USING (true); -- Themes are public

CREATE POLICY "story_themes_read" ON story_themes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_themes.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
        OR auth.jwt()->>'role' = 'service_role'
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Test the new system
SELECT 'Transcript system added successfully!' as message;

-- Show summary
SELECT 
    'stories' as table_name,
    COUNT(*) as record_count
FROM stories
UNION ALL
SELECT 
    'transcripts',
    COUNT(*)
FROM transcripts
UNION ALL
SELECT 
    'users (storytellers)',
    COUNT(*)
FROM users
WHERE role = 'storyteller';