-- =====================================================
-- EMPATHY LEDGER DATABASE OPTIMIZATION
-- Focus: Scalable transcript management & storyteller workflow
-- =====================================================

-- 1. FIX RLS POLICIES FIRST (CRITICAL!)
-- =====================================================

-- Drop all existing policies to start fresh
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.stories;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.stories;
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.stories;
    DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.stories;
    
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
    
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_members;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create simple, non-recursive policies
CREATE POLICY "stories_read_public" ON public.stories
    FOR SELECT USING (
        privacy_level = 'public' 
        OR auth.uid() = storyteller_id
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "stories_write_own" ON public.stories
    FOR ALL USING (
        auth.uid() = storyteller_id
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "users_read_public" ON public.users
    FOR SELECT USING (
        role = 'storyteller'
        OR id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "users_write_own" ON public.users
    FOR ALL USING (
        id = auth.uid()
        OR auth.jwt()->>'role' = 'service_role'
    );

-- 2. CREATE TRANSCRIPT MANAGEMENT SYSTEM
-- =====================================================

-- Create transcripts table for scalable storage
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    
    -- Transcript versions (for editing history)
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    
    -- Content
    raw_transcript TEXT, -- Original from AI/manual
    edited_transcript TEXT, -- Human-edited version
    
    -- Metadata
    source TEXT, -- 'ai_generated', 'manual', 'imported'
    ai_service TEXT, -- 'assemblyai', 'whisper', 'claude', etc.
    confidence_score FLOAT,
    duration_seconds INTEGER,
    word_count INTEGER,
    
    -- Timestamps and speakers
    timestamps JSONB, -- [{start: 0, end: 5, text: "Hello", speaker: "Speaker 1"}]
    speakers JSONB, -- [{id: "speaker_1", name: "John Doe", segments: 15}]
    
    -- Processing status
    processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_error TEXT,
    
    -- Quality checks
    has_profanity BOOLEAN DEFAULT false,
    requires_review BOOLEAN DEFAULT false,
    review_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Ensure only one current version per story
    CONSTRAINT unique_current_transcript UNIQUE (story_id, is_current) WHERE is_current = true
);

-- Create quotes extraction table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
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
    extracted_by TEXT -- 'ai' or 'human'
);

-- 3. IMPROVE STORYTELLER MANAGEMENT
-- =====================================================

-- Add storyteller-specific fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS storyteller_profile JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_interview_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_stories INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_transcript_minutes INTEGER DEFAULT 0;

-- Create storyteller onboarding tracking
CREATE TABLE IF NOT EXISTS storyteller_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Onboarding steps
    profile_completed BOOLEAN DEFAULT false,
    first_story_submitted BOOLEAN DEFAULT false,
    consent_form_signed BOOLEAN DEFAULT false,
    training_completed BOOLEAN DEFAULT false,
    
    -- Preferences
    interview_preferences JSONB,
    topic_interests TEXT[],
    privacy_preferences JSONB,
    
    -- Support
    assigned_mentor_id UUID REFERENCES users(id),
    onboarding_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. CREATE MEDIA PROCESSING QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS media_processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    
    -- Media details
    media_type TEXT NOT NULL, -- 'audio', 'video'
    source_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    
    -- Processing
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
    attempts INTEGER DEFAULT 0,
    
    -- Results
    transcript_id UUID REFERENCES transcripts(id),
    processed_url TEXT, -- Optimized media URL
    thumbnail_url TEXT,
    
    -- Tracking
    queued_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Ensure one active job per story
    CONSTRAINT unique_active_processing UNIQUE (story_id, status) WHERE status IN ('pending', 'processing')
);

-- 5. CREATE THEMES MANAGEMENT
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
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
    
    -- Relevance scoring
    relevance_score FLOAT DEFAULT 1.0,
    assigned_by TEXT, -- 'ai', 'storyteller', 'moderator'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (story_id, theme_id)
);

-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Transcript search
CREATE INDEX IF NOT EXISTS idx_transcripts_story_id ON transcripts(story_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_current ON transcripts(story_id) WHERE is_current = true;

-- Full text search on transcripts
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_transcript_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.edited_transcript, NEW.raw_transcript, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_transcript_search_vector 
    BEFORE INSERT OR UPDATE OF raw_transcript, edited_transcript 
    ON transcripts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_transcript_search_vector();

CREATE INDEX IF NOT EXISTS idx_transcript_search ON transcripts USING gin(search_vector);

-- Story indexes
CREATE INDEX IF NOT EXISTS idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_submitted ON stories(submitted_at DESC);

-- Theme indexes
CREATE INDEX IF NOT EXISTS idx_story_themes_story ON story_themes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_theme ON story_themes(theme_id);

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
    v_word_count := array_length(string_to_array(p_transcript_text, ' '), 1);
    
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
        v_word_count,
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
INSERT INTO transcripts (story_id, raw_transcript, edited_transcript, source, processing_status, word_count)
SELECT 
    id,
    transcript,
    transcript,
    'imported',
    'completed',
    array_length(string_to_array(transcript, ' '), 1)
FROM stories
WHERE transcript IS NOT NULL
ON CONFLICT DO NOTHING;

-- 9. CREATE VIEWS FOR EASY ACCESS
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
GROUP BY u.id;

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

-- Enable RLS on new tables
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_themes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "transcripts_access" ON transcripts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = transcripts.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
        OR auth.jwt()->>'role' = 'service_role'
    );

CREATE POLICY "quotes_access" ON quotes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stories 
            WHERE stories.id = quotes.story_id 
            AND (stories.privacy_level = 'public' OR stories.storyteller_id = auth.uid())
        )
        OR auth.jwt()->>'role' = 'service_role'
    );

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final check
SELECT 'Schema optimization complete!' as message;