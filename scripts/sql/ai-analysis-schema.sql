-- AI STORYTELLER ANALYSIS SCHEMA
-- Database support for empathy-centered transcript analysis

-- Main analysis results table
CREATE TABLE IF NOT EXISTS storyteller_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    
    -- Core analysis data
    themes JSONB NOT NULL DEFAULT '[]'::jsonb,
    quotes JSONB NOT NULL DEFAULT '[]'::jsonb,
    biography JSONB NOT NULL DEFAULT '{}'::jsonb,
    community_connections JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Privacy and consent
    privacy_level TEXT NOT NULL DEFAULT 'private' CHECK (privacy_level IN ('public', 'community', 'private')),
    consent_given BOOLEAN NOT NULL DEFAULT false,
    storyteller_approved BOOLEAN DEFAULT null, -- null = pending, true = approved, false = rejected
    
    -- Metadata
    analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ai_model_version TEXT,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one analysis per storyteller (can be updated)
    UNIQUE(storyteller_id)
);

-- Thematic insights extraction
CREATE TABLE IF NOT EXISTS story_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES storyteller_analysis(id) ON DELETE CASCADE,
    
    -- Theme details
    theme_name TEXT NOT NULL,
    significance TEXT NOT NULL CHECK (significance IN ('primary', 'secondary', 'emerging')),
    description TEXT NOT NULL,
    community_relevance TEXT NOT NULL,
    emotional_tone TEXT CHECK (emotional_tone IN ('hopeful', 'reflective', 'challenging', 'transformative', 'resilient')),
    
    -- Connections
    related_stories TEXT[], -- Array of story IDs
    related_storytellers UUID[], -- Array of storyteller IDs with similar themes
    
    -- Metadata
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexing for theme discovery
    UNIQUE(storyteller_id, theme_name)
);

-- Curated quotes from stories
CREATE TABLE IF NOT EXISTS story_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES storyteller_analysis(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    
    -- Quote content
    quote_text TEXT NOT NULL,
    context_description TEXT,
    
    -- Classification
    impact_type TEXT NOT NULL CHECK (impact_type IN ('inspiring', 'wisdom', 'vulnerability', 'strength', 'connection')),
    themes TEXT[] NOT NULL DEFAULT '{}',
    
    -- Privacy and approval
    public_safe BOOLEAN NOT NULL DEFAULT false,
    storyteller_approved BOOLEAN DEFAULT null,
    sensitive_content BOOLEAN DEFAULT false,
    
    -- Metadata
    character_count INTEGER GENERATED ALWAYS AS (length(quote_text)) STORED,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate quotes
    UNIQUE(storyteller_id, quote_text)
);

-- Community connection insights
CREATE TABLE IF NOT EXISTS community_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    connected_storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    
    -- Connection details
    connection_type TEXT NOT NULL CHECK (connection_type IN ('shared_experience', 'complementary_perspective', 'similar_challenges', 'resource_sharing')),
    connection_strength DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0.00 to 1.00
    insight_description TEXT NOT NULL,
    potential_support TEXT,
    
    -- Mutual analysis
    mutual_benefit BOOLEAN DEFAULT true,
    both_consented BOOLEAN DEFAULT false,
    
    -- Metadata
    discovered_date TIMESTAMPTZ DEFAULT NOW(),
    last_validated TIMESTAMPTZ,
    
    -- Prevent duplicate connections
    UNIQUE(primary_storyteller_id, connected_storyteller_id, connection_type),
    
    -- Prevent self-connections
    CHECK (primary_storyteller_id != connected_storyteller_id)
);

-- Analysis processing queue for batch operations
CREATE TABLE IF NOT EXISTS analysis_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    
    -- Queue status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority INTEGER NOT NULL DEFAULT 5, -- 1 = highest, 10 = lowest
    
    -- Processing details
    requested_by UUID, -- Admin or system user
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storyteller feedback on AI analysis
CREATE TABLE IF NOT EXISTS analysis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES storyteller_analysis(id) ON DELETE CASCADE,
    
    -- Feedback details
    overall_satisfaction INTEGER CHECK (overall_satisfaction BETWEEN 1 AND 5),
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    
    -- Specific feedback
    approved_themes UUID[] DEFAULT '{}', -- Array of theme IDs they approve
    rejected_themes UUID[] DEFAULT '{}', -- Array of theme IDs they reject
    approved_quotes UUID[] DEFAULT '{}', -- Array of quote IDs they approve
    rejected_quotes UUID[] DEFAULT '{}', -- Array of quote IDs they reject
    
    -- Text feedback
    general_feedback TEXT,
    requested_changes TEXT,
    privacy_concerns TEXT,
    
    -- Status
    review_completed BOOLEAN DEFAULT false,
    needs_revision BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One feedback per analysis
    UNIQUE(storyteller_id, analysis_id)
);

-- Theme taxonomy for consistency
CREATE TABLE IF NOT EXISTS theme_taxonomy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- e.g., 'mental_health', 'relationships', 'work', 'growth'
    description TEXT NOT NULL,
    parent_theme_id UUID REFERENCES theme_taxonomy(id),
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    community_relevance DECIMAL(3,2) DEFAULT 0.5,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_storyteller_analysis_storyteller ON storyteller_analysis(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_analysis_consent ON storyteller_analysis(consent_given, storyteller_approved);
CREATE INDEX IF NOT EXISTS idx_story_themes_theme_name ON story_themes(theme_name);
CREATE INDEX IF NOT EXISTS idx_story_themes_significance ON story_themes(significance);
CREATE INDEX IF NOT EXISTS idx_story_quotes_impact ON story_quotes(impact_type);
CREATE INDEX IF NOT EXISTS idx_story_quotes_approved ON story_quotes(storyteller_approved, public_safe);
CREATE INDEX IF NOT EXISTS idx_community_connections_type ON community_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_community_connections_strength ON community_connections(connection_strength);
CREATE INDEX IF NOT EXISTS idx_analysis_queue_status ON analysis_queue(status, priority);

-- RLS Policies for privacy
ALTER TABLE storyteller_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_feedback ENABLE ROW LEVEL SECURITY;

-- Storytellers can only see their own analysis
CREATE POLICY "storytellers_own_analysis" ON storyteller_analysis
    FOR ALL USING (
        storyteller_id IN (
            SELECT id FROM storytellers WHERE auth.uid()::text = ANY(user_ids)
        )
    );

-- Public can see approved public analysis
CREATE POLICY "public_approved_analysis" ON storyteller_analysis
    FOR SELECT USING (
        consent_given = true 
        AND storyteller_approved = true 
        AND privacy_level = 'public'
    );

-- Similar policies for related tables
CREATE POLICY "storytellers_own_themes" ON story_themes
    FOR ALL USING (
        storyteller_id IN (
            SELECT id FROM storytellers WHERE auth.uid()::text = ANY(user_ids)
        )
    );

CREATE POLICY "public_approved_themes" ON story_themes
    FOR SELECT USING (
        storyteller_id IN (
            SELECT storyteller_id FROM storyteller_analysis 
            WHERE consent_given = true 
            AND storyteller_approved = true 
            AND privacy_level = 'public'
        )
    );

-- Functions for analysis management
CREATE OR REPLACE FUNCTION update_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE TRIGGER update_storyteller_analysis_timestamp
    BEFORE UPDATE ON storyteller_analysis
    FOR EACH ROW EXECUTE FUNCTION update_analysis_timestamp();

CREATE TRIGGER update_analysis_queue_timestamp
    BEFORE UPDATE ON analysis_queue
    FOR EACH ROW EXECUTE FUNCTION update_analysis_timestamp();

-- Function to calculate theme popularity
CREATE OR REPLACE FUNCTION update_theme_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE theme_taxonomy 
        SET usage_count = usage_count + 1 
        WHERE theme_name = NEW.theme_name;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE theme_taxonomy 
        SET usage_count = GREATEST(0, usage_count - 1) 
        WHERE theme_name = OLD.theme_name;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to track theme usage
CREATE TRIGGER track_theme_usage
    AFTER INSERT OR DELETE ON story_themes
    FOR EACH ROW EXECUTE FUNCTION update_theme_usage_count();

-- View for community insights dashboard
CREATE OR REPLACE VIEW community_theme_insights AS
SELECT 
    t.theme_name,
    t.category,
    COUNT(*) as storyteller_count,
    AVG(st.confidence_score) as avg_confidence,
    ARRAY_AGG(DISTINCT st.emotional_tone) as emotional_tones,
    ARRAY_AGG(DISTINCT s.full_name) FILTER (WHERE sa.privacy_level = 'public') as public_storytellers
FROM story_themes st
JOIN storyteller_analysis sa ON st.analysis_id = sa.id
JOIN storytellers s ON st.storyteller_id = s.id
LEFT JOIN theme_taxonomy t ON st.theme_name = t.theme_name
WHERE sa.consent_given = true
GROUP BY t.theme_name, t.category
ORDER BY storyteller_count DESC;

-- Initial theme taxonomy data
INSERT INTO theme_taxonomy (theme_name, category, description) VALUES
('Mental Health Recovery', 'wellness', 'Journey through mental health challenges and healing'),
('Career Transition', 'work', 'Changing careers or professional growth'),
('Family Relationships', 'relationships', 'Connections with family members'),
('Community Support', 'community', 'Finding and giving support in community'),
('Personal Growth', 'growth', 'Self-development and transformation'),
('Resilience Building', 'strength', 'Developing ability to overcome challenges'),
('Cultural Identity', 'identity', 'Connection to cultural background and heritage'),
('Financial Challenges', 'resources', 'Managing economic difficulties'),
('Health Journey', 'wellness', 'Physical health challenges and recovery'),
('Education Access', 'opportunity', 'Pursuing learning and skill development')
ON CONFLICT (theme_name) DO NOTHING;

COMMENT ON TABLE storyteller_analysis IS 'AI-generated insights from storyteller transcripts with privacy controls';
COMMENT ON TABLE story_themes IS 'Thematic analysis of stories for community connection';
COMMENT ON TABLE story_quotes IS 'Curated meaningful quotes from stories';
COMMENT ON TABLE community_connections IS 'AI-identified connections between storytellers';
COMMENT ON TABLE analysis_feedback IS 'Storyteller feedback and approval of AI analysis';