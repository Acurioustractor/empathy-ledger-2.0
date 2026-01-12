-- =====================================================
-- ADD SCALABLE TRANSCRIPT MANAGEMENT SYSTEM - CLEAN
-- Handles existing objects properly
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

-- Create unique index (safe if exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_current_transcript 
ON transcripts(story_id) 
WHERE is_current = true;

-- 2. CREATE OTHER TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
    
    quote_text TEXT NOT NULL,
    context TEXT,
    start_time FLOAT,
    end_time FLOAT,
    word_position INTEGER,
    themes TEXT[],
    emotion TEXT,
    impact_score FLOAT,
    times_used INTEGER DEFAULT 0,
    used_in_reports TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    extracted_by TEXT DEFAULT 'human'
);

CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_theme_id UUID REFERENCES themes(id),
    theme_level INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    color_hex TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_themes (
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    relevance_score FLOAT DEFAULT 1.0,
    assigned_by TEXT DEFAULT 'storyteller',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (story_id, theme_id)
);

-- Add columns to users table (safe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS storyteller_profile JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_interview_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_stories INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_transcript_minutes INTEGER DEFAULT 0;

-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transcripts_story_id ON transcripts(story_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_current ON transcripts(story_id) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_quotes_story ON quotes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_story ON story_themes(story_id);
CREATE INDEX IF NOT EXISTS idx_themes_usage ON themes(usage_count DESC);

-- 4. ADD SEARCH FUNCTIONALITY
-- =====================================================

-- Add search vector column
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create or replace search function
CREATE OR REPLACE FUNCTION update_transcript_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.edited_transcript, NEW.raw_transcript, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger (safe)
DROP TRIGGER IF EXISTS trig_update_transcript_search_vector ON transcripts;
CREATE TRIGGER trig_update_transcript_search_vector 
    BEFORE INSERT OR UPDATE OF raw_transcript, edited_transcript 
    ON transcripts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_transcript_search_vector();

CREATE INDEX IF NOT EXISTS idx_transcript_search ON transcripts USING gin(search_vector);

-- 5. CREATE HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION add_new_storyteller(
    p_email TEXT,
    p_full_name TEXT,
    p_community TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
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
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_new_transcript(
    p_story_id UUID,
    p_transcript_text TEXT,
    p_source TEXT DEFAULT 'manual'
) RETURNS UUID AS $$
DECLARE
    v_transcript_id UUID;
    v_word_count INTEGER;
BEGIN
    v_word_count := array_length(string_to_array(trim(p_transcript_text), ' '), 1);
    
    -- Mark existing as non-current
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
        p_transcript_text,
        p_source,
        COALESCE(v_word_count, 0),
        'completed',
        NOW()
    ) RETURNING id INTO v_transcript_id;
    
    -- Update story for backward compatibility
    UPDATE stories 
    SET transcript = p_transcript_text 
    WHERE id = p_story_id;
    
    RETURN v_transcript_id;
END;
$$ LANGUAGE plpgsql;

-- 6. MIGRATE EXISTING DATA
-- =====================================================

-- Migrate existing transcripts (safe - won't duplicate)
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

-- 7. CREATE VIEWS
-- =====================================================

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

CREATE OR REPLACE VIEW stories_with_transcripts AS
SELECT 
    s.*,
    t.edited_transcript as current_transcript,
    t.word_count,
    t.confidence_score,
    t.processing_status
FROM stories s
LEFT JOIN transcripts t ON t.story_id = s.id AND t.is_current = true;

-- 8. SET UP SECURITY (Drop and recreate policies)
-- =====================================================

-- Enable RLS
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_themes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "transcripts_read" ON transcripts;
DROP POLICY IF EXISTS "transcripts_write" ON transcripts;
DROP POLICY IF EXISTS "quotes_read" ON quotes;
DROP POLICY IF EXISTS "themes_read" ON themes;
DROP POLICY IF EXISTS "story_themes_read" ON story_themes;

-- Create clean policies
CREATE POLICY "transcripts_read" ON transcripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = transcripts.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
    );

CREATE POLICY "quotes_read" ON quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = quotes.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
    );

CREATE POLICY "themes_read" ON themes FOR SELECT USING (true);

CREATE POLICY "story_themes_read" ON story_themes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = story_themes.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final summary
SELECT 
    'transcripts' as table_name,
    COUNT(*) as record_count
FROM transcripts
UNION ALL
SELECT 
    'stories',
    COUNT(*)
FROM stories
UNION ALL
SELECT 
    'users (storytellers)',
    COUNT(*)
FROM users
WHERE role = 'storyteller';

SELECT 'Transcript system added successfully! 🎉' as message;