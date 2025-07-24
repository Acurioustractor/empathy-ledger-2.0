-- =====================================================
-- EMPATHY LEDGER: PHILOSOPHY-ALIGNED DATABASE SCHEMA
-- =====================================================
-- 
-- CORE PRINCIPLES:
-- 1. DIGNITY FIRST: Every data point honors storyteller dignity
-- 2. CONSENT CENTRAL: Granular control over every piece of data
-- 3. STRENGTHS-BASED: Focus on assets, resilience, growth
-- 4. COMMUNITY CONNECTION: Enable meaningful mutual support
-- 5. CULTURAL HUMILITY: Respect diverse ways of sharing stories
-- 6. TRAUMA-INFORMED: Safe, predictable, choice-driven experience
--
-- Built for: Healthcare, Education, Community, Nonprofit Organizations
-- =====================================================

-- =====================================================
-- 1. ORGANIZATIONS: Multi-tenant foundation
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
    organization_type TEXT NOT NULL CHECK (
        organization_type IN ('healthcare', 'education', 'community', 'nonprofit', 'government', 'research')
    ),
    
    -- Mission alignment
    mission_statement TEXT,
    values TEXT[],
    focus_areas TEXT[] DEFAULT '{}', -- mental health, education, community development
    
    -- Cultural context
    primary_languages TEXT[] DEFAULT '{"en"}',
    cultural_context TEXT, -- Indigenous, refugee, urban, rural, etc.
    geographic_scope TEXT, -- local, regional, national, international
    
    -- Philosophy settings
    storytelling_approach TEXT DEFAULT 'strengths-based' CHECK (
        storytelling_approach IN ('strengths-based', 'trauma-informed', 'narrative-therapy', 'participatory')
    ),
    privacy_philosophy TEXT DEFAULT 'storyteller-controlled' CHECK (
        privacy_philosophy IN ('storyteller-controlled', 'organization-managed', 'community-governed')
    ),
    
    -- Compliance & privacy
    privacy_requirements JSONB DEFAULT '{
        "dataRetention": 1095,
        "geographicRestrictions": [],
        "complianceFrameworks": ["GDPR"],
        "consentRequirements": ["explicit", "informed", "revocable"]
    }'::jsonb,
    
    -- Contact & support
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    support_contact_info JSONB DEFAULT '{}'::jsonb,
    
    -- Platform settings
    branding_config JSONB DEFAULT '{
        "primaryColor": "#6366f1",
        "logoUrl": null,
        "customCSS": null
    }'::jsonb,
    
    -- Status & lifecycle
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'archived')),
    onboarding_stage TEXT DEFAULT 'setup' CHECK (
        onboarding_stage IN ('setup', 'configuration', 'training', 'pilot', 'production')
    ),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', name || ' ' || COALESCE(mission_statement, ''))
    ) STORED
);

-- =====================================================
-- 2. STORYTELLERS: People at the center
-- =====================================================

CREATE TABLE IF NOT EXISTS storytellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Identity (storyteller-controlled)
    preferred_name TEXT NOT NULL, -- How they want to be known
    full_name TEXT, -- Legal name if needed/consented
    pronouns TEXT DEFAULT 'they/them',
    name_format TEXT DEFAULT 'western' CHECK (
        name_format IN ('western', 'eastern', 'indigenous', 'cultural-specific', 'chosen')
    ),
    
    -- Cultural identity (optional, storyteller-controlled)
    cultural_identifiers TEXT[] DEFAULT '{}', -- Indigenous, refugee, etc.
    languages_spoken TEXT[] DEFAULT '{}',
    preferred_language TEXT DEFAULT 'en',
    country_of_origin TEXT,
    current_location TEXT,
    
    -- Story context
    life_stage TEXT CHECK (
        life_stage IN ('child', 'youth', 'young-adult', 'adult', 'elder', 'not-specified')
    ),
    story_themes TEXT[] DEFAULT '{}', -- Self-identified themes
    story_context TEXT, -- What brings them to share their story
    
    -- Strengths & assets (always positive framing)
    personal_strengths TEXT[] DEFAULT '{}',
    support_networks TEXT[] DEFAULT '{}', -- family, friends, community, professional
    achievements TEXT[] DEFAULT '{}', -- What they're proud of
    aspirations TEXT[] DEFAULT '{}', -- What they're working toward
    
    -- Accessibility & communication
    accessibility_needs TEXT[] DEFAULT '{}',
    communication_preferences JSONB DEFAULT '{
        "preferredContact": "email",
        "timezone": "UTC",
        "bestTimeToContact": "any",
        "advocateContact": null
    }'::jsonb,
    
    -- Privacy & consent (granular control)
    privacy_settings JSONB DEFAULT '{
        "profileVisibility": "private",
        "storyVisibility": "private", 
        "photoSharing": false,
        "nameSharing": "first-name-only",
        "locationSharing": "country-only",
        "themeSharing": true,
        "quoteSharing": false,
        "connectionSharing": false
    }'::jsonb,
    
    -- Consent tracking (detailed & revocable)
    consent_record JSONB DEFAULT '{
        "aiAnalysis": null,
        "storySharing": null,
        "researchParticipation": null,
        "publicQuotes": null,
        "communityConnections": null,
        "mediaStorage": null
    }'::jsonb,
    
    -- Contact info (encrypted)
    contact_info JSONB DEFAULT '{}'::jsonb, -- Encrypted email, phone if consented
    
    -- Onboarding & relationship
    onboarding_stage TEXT DEFAULT 'consent' CHECK (
        onboarding_stage IN ('consent', 'story-sharing', 'analysis-review', 'community-connection', 'complete')
    ),
    relationship_to_org TEXT, -- client, member, participant, volunteer, staff
    referral_source TEXT,
    
    -- Story collection metadata
    stories_shared INTEGER DEFAULT 0,
    last_story_date TIMESTAMPTZ,
    total_story_time INTERVAL, -- Total duration of all stories
    
    -- Platform engagement (for support, not metrics)
    last_login TIMESTAMPTZ,
    platform_preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Safety & wellbeing
    safety_notes TEXT, -- Trauma-informed considerations for staff
    support_person_contact TEXT, -- Emergency or advocacy contact
    crisis_support_plan TEXT, -- If applicable
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (
        status IN ('active', 'taking-break', 'completed-program', 'archived')
    ),
    archive_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contact_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Search (respects privacy)
    search_vector tsvector GENERATED ALWAYS AS (
        CASE 
            WHEN (privacy_settings->>'profileVisibility')::text = 'public' THEN
                to_tsvector('english', preferred_name || ' ' || COALESCE(story_context, ''))
            ELSE to_tsvector('english', '')
        END
    ) STORED,
    
    -- Constraints
    CONSTRAINT valid_privacy_settings CHECK (
        privacy_settings ? 'profileVisibility' AND 
        privacy_settings ? 'storyVisibility'
    )
);

-- =====================================================
-- 3. STORIES: The heart of the platform
-- =====================================================

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Story metadata
    title TEXT, -- Storyteller-chosen title
    story_type TEXT DEFAULT 'life-experience' CHECK (
        story_type IN ('life-experience', 'healing-journey', 'community-impact', 'wisdom-sharing', 'challenge-overcome')
    ),
    collection_method TEXT CHECK (
        collection_method IN ('video', 'audio', 'written', 'interview', 'workshop', 'digital-storytelling')
    ),
    
    -- Content (encrypted and access-controlled)
    transcript_content TEXT, -- Full transcript
    key_moments JSONB DEFAULT '[]'::jsonb, -- Timestamped significant moments
    emotional_journey JSONB DEFAULT '[]'::jsonb, -- Emotional arc if tracked
    
    -- Story context
    story_prompt TEXT, -- What question/prompt initiated this story
    setting_context TEXT, -- Where/when/how was this shared
    duration_minutes INTEGER,
    language_spoken TEXT DEFAULT 'en',
    
    -- Strengths-based framing
    resilience_factors TEXT[] DEFAULT '{}', -- What helped them through
    support_systems TEXT[] DEFAULT '{}', -- Who/what supported them
    growth_insights TEXT[] DEFAULT '{}', -- What they learned/gained
    community_wisdom TEXT[] DEFAULT '{}', -- Wisdom they want to share
    
    -- Media files (secure storage)
    media_files JSONB DEFAULT '[]'::jsonb, -- Array of {type, url, duration, etc}
    thumbnail_url TEXT,
    
    -- Privacy & sharing (inherits from storyteller but can be more restrictive)
    visibility_level TEXT DEFAULT 'private' CHECK (
        visibility_level IN ('private', 'organization', 'community', 'public')
    ),
    sharing_permissions JSONB DEFAULT '{
        "allowAnalysis": null,
        "allowQuotes": null,
        "allowThemes": null,
        "allowConnections": null,
        "allowResearch": null
    }'::jsonb,
    
    -- Quality & safety
    content_warnings TEXT[] DEFAULT '{}', -- Trauma-informed content notes
    safety_review_status TEXT DEFAULT 'pending' CHECK (
        safety_review_status IN ('pending', 'approved', 'needs-support', 'archived')
    ),
    safety_reviewer_notes TEXT,
    
    -- Analysis readiness
    ready_for_analysis BOOLEAN DEFAULT FALSE,
    analysis_consent_date TIMESTAMPTZ,
    
    -- Story lifecycle
    collection_date TIMESTAMPTZ NOT NULL,
    review_date TIMESTAMPTZ,
    publication_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Full-text search (privacy-aware)
    search_vector tsvector GENERATED ALWAYS AS (
        CASE 
            WHEN visibility_level != 'private' THEN
                to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(story_context, ''))
            ELSE to_tsvector('english', '')
        END
    ) STORED
);

-- =====================================================
-- 4. AI ANALYSIS: Research-backed insights
-- =====================================================

CREATE TABLE IF NOT EXISTS storyteller_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Analysis framework used
    analysis_framework TEXT DEFAULT 'empathy-centered' CHECK (
        analysis_framework IN ('empathy-centered', 'trauma-informed', 'strengths-based', 'narrative-therapy', 'cultural-specific')
    ),
    ai_model_version TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    
    -- Core analysis results (all strengths-based)
    life_themes JSONB DEFAULT '[]'::jsonb, -- 3-5 key themes with dignity
    resilience_patterns JSONB DEFAULT '[]'::jsonb, -- How they navigate challenges
    wisdom_insights JSONB DEFAULT '[]'::jsonb, -- Learning and growth
    community_connections JSONB DEFAULT '[]'::jsonb, -- Potential mutual support
    strength_narrative TEXT, -- Overarching strengths-based biography
    
    -- Curated content (storyteller-approved)
    meaningful_quotes JSONB DEFAULT '[]'::jsonb, -- Quotes that honor their voice
    story_highlights JSONB DEFAULT '[]'::jsonb, -- Key moments/insights
    
    -- Quality & ethics
    quality_metrics JSONB DEFAULT '{
        "culturalSensitivity": 0,
        "traumaInformed": 0,
        "strengthsBased": 0,
        "dignityPreserving": 0,
        "biasDetection": {"detected": false, "types": []}
    }'::jsonb,
    
    overall_quality_score DECIMAL(3,2), -- 0.00 to 1.00
    ethical_review_status TEXT DEFAULT 'pending' CHECK (
        ethical_review_status IN ('pending', 'approved', 'needs-revision', 'rejected')
    ),
    
    -- Storyteller control
    storyteller_review_status TEXT DEFAULT 'pending' CHECK (
        storyteller_review_status IN ('pending', 'reviewing', 'approved', 'requested-changes', 'rejected')
    ),
    storyteller_feedback TEXT,
    storyteller_edits JSONB DEFAULT '{}'::jsonb, -- Their modifications
    
    -- Research value (anonymous/aggregated only)
    research_insights JSONB DEFAULT '{}'::jsonb,
    contributes_to_knowledge BOOLEAN DEFAULT FALSE,
    
    -- Processing metadata
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    processing_time_seconds INTEGER,
    
    -- Approval workflow
    reviewed_by_staff UUID, -- References staff table if exists
    staff_review_notes TEXT,
    final_approval_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one analysis per storyteller (can be updated)
    UNIQUE(storyteller_id)
);

-- =====================================================
-- 5. THEMES: Community wisdom patterns
-- =====================================================

CREATE TABLE IF NOT EXISTS story_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES storyteller_ai_analysis(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Theme details (always strengths-based)
    theme_name TEXT NOT NULL,
    theme_category TEXT CHECK (
        theme_category IN ('resilience', 'community', 'growth', 'wisdom', 'healing', 'connection', 'achievement', 'hope')
    ),
    significance_level TEXT NOT NULL CHECK (
        significance_level IN ('primary', 'secondary', 'emerging')
    ),
    
    -- Empathy-centered descriptions
    theme_description TEXT NOT NULL, -- How this theme appears in their story
    strength_narrative TEXT NOT NULL, -- How this theme demonstrates strength
    community_relevance TEXT, -- How this connects to others
    wisdom_element TEXT, -- What insight this offers
    
    -- Emotional context (strengths-focused)
    emotional_tone TEXT CHECK (
        emotional_tone IN ('hopeful', 'reflective', 'empowering', 'healing', 'connecting', 'inspiring', 'courageous')
    ),
    growth_aspect TEXT, -- How this theme shows growth/learning
    
    -- Community connections
    related_storytellers UUID[] DEFAULT '{}', -- Others with similar themes
    cross_cultural_relevance BOOLEAN DEFAULT FALSE,
    universal_elements TEXT[] DEFAULT '{}', -- Aspects that transcend specific context
    
    -- Privacy & sharing
    sharing_approved BOOLEAN DEFAULT FALSE,
    visibility_level TEXT DEFAULT 'private' CHECK (
        visibility_level IN ('private', 'organization', 'community', 'research', 'public')
    ),
    
    -- Quality metrics
    confidence_score DECIMAL(3,2),
    cultural_sensitivity_score DECIMAL(3,2),
    dignity_preserving_score DECIMAL(3,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexing for theme discovery (privacy-aware)
    UNIQUE(storyteller_id, theme_name)
);

-- =====================================================
-- 6. QUOTES: Voices of wisdom (consent-driven)
-- =====================================================

CREATE TABLE IF NOT EXISTS story_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES storyteller_ai_analysis(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Quote content
    quote_text TEXT NOT NULL,
    context_before TEXT, -- What came before this quote
    context_after TEXT, -- What came after
    story_moment_description TEXT, -- When/why this was said
    
    -- Significance (always positive framing)
    impact_type TEXT NOT NULL CHECK (
        impact_type IN ('wisdom', 'inspiration', 'resilience', 'hope', 'insight', 'connection', 'healing', 'strength')
    ),
    why_meaningful TEXT NOT NULL, -- Why this quote captures something important
    universal_relevance TEXT, -- How this might resonate with others
    
    -- Themes this quote represents
    related_themes TEXT[] DEFAULT '{}',
    emotional_resonance TEXT[] DEFAULT '{}', -- hopeful, empowering, etc.
    
    -- Consent & privacy (extremely careful)
    storyteller_consent_status TEXT DEFAULT 'pending' CHECK (
        storyteller_consent_status IN ('pending', 'approved', 'approved-with-edits', 'declined')
    ),
    storyteller_edits TEXT, -- Their preferred version
    attribution_preference TEXT DEFAULT 'anonymous' CHECK (
        attribution_preference IN ('full-name', 'first-name', 'initials', 'anonymous', 'community-member')
    ),
    
    -- Safety & sensitivity
    requires_content_warning BOOLEAN DEFAULT FALSE,
    content_warnings TEXT[] DEFAULT '{}',
    cultural_sensitivity_notes TEXT,
    trauma_informed_considerations TEXT,
    
    -- Sharing controls
    approved_for_sharing BOOLEAN DEFAULT FALSE,
    sharing_contexts TEXT[] DEFAULT '{}', -- website, research, presentations, etc.
    geographic_restrictions TEXT[] DEFAULT '{}',
    
    -- Quality metrics
    authenticity_score DECIMAL(3,2), -- How well it represents their voice
    dignity_preserving_score DECIMAL(3,2),
    cultural_appropriateness_score DECIMAL(3,2),
    
    -- Usage tracking (for consent compliance)
    times_shared INTEGER DEFAULT 0,
    last_shared_date TIMESTAMPTZ,
    sharing_contexts_used TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicates
    UNIQUE(storyteller_id, quote_text),
    
    -- Full-text search (only if approved for sharing)
    search_vector tsvector GENERATED ALWAYS AS (
        CASE 
            WHEN approved_for_sharing = TRUE THEN
                to_tsvector('english', quote_text || ' ' || COALESCE(why_meaningful, ''))
            ELSE to_tsvector('english', '')
        END
    ) STORED
);

-- =====================================================
-- 7. COMMUNITY CONNECTIONS: Mutual support facilitation
-- =====================================================

CREATE TABLE IF NOT EXISTS community_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    connected_storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Connection basis (always strengths-based)
    connection_type TEXT NOT NULL CHECK (
        connection_type IN ('shared-resilience', 'complementary-strengths', 'mutual-healing', 'wisdom-exchange', 'shared-experience', 'support-network')
    ),
    
    -- What connects them (empathy-centered)
    shared_themes TEXT[] NOT NULL DEFAULT '{}',
    complementary_strengths TEXT[] DEFAULT '{}',
    mutual_support_potential TEXT NOT NULL,
    connection_insight TEXT NOT NULL, -- Why this connection could be meaningful
    
    -- Strength of connection
    connection_strength DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0.00 to 1.00
    compatibility_score DECIMAL(3,2), -- How well they might connect
    mutual_benefit_potential DECIMAL(3,2), -- Likelihood of mutual support
    
    -- Support potential
    what_they_could_offer_each_other TEXT,
    shared_resources TEXT[] DEFAULT '{}',
    similar_challenges_overcome TEXT[] DEFAULT '{}',
    complementary_wisdom TEXT[] DEFAULT '{}',
    
    -- Privacy & consent (both must consent)
    primary_storyteller_consent TEXT DEFAULT 'pending' CHECK (
        primary_storyteller_consent IN ('pending', 'interested', 'approved', 'declined', 'not-ready')
    ),
    connected_storyteller_consent TEXT DEFAULT 'pending' CHECK (
        connected_storyteller_consent IN ('pending', 'interested', 'approved', 'declined', 'not-ready')
    ),
    
    -- Connection facilitation
    connection_facilitated BOOLEAN DEFAULT FALSE,
    facilitation_method TEXT CHECK (
        facilitation_method IN ('introduction-email', 'group-setting', 'mentorship', 'peer-support', 'virtual-meetup')
    ),
    facilitator_notes TEXT,
    
    -- Outcome tracking (for program improvement)
    connection_outcome TEXT CHECK (
        connection_outcome IN ('meaningful-ongoing', 'helpful-brief', 'neutral', 'not-pursued', 'needs-support')
    ),
    outcome_notes TEXT,
    follow_up_date TIMESTAMPTZ,
    
    -- Safety considerations
    safety_considerations TEXT,
    requires_facilitation BOOLEAN DEFAULT TRUE,
    
    -- Quality metrics
    cultural_compatibility_score DECIMAL(3,2),
    trauma_informed_appropriateness DECIMAL(3,2),
    
    -- Timestamps
    identified_date TIMESTAMPTZ DEFAULT NOW(),
    first_contact_date TIMESTAMPTZ,
    last_interaction_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate connections
    UNIQUE(primary_storyteller_id, connected_storyteller_id),
    
    -- Ensure both storytellers are different
    CHECK (primary_storyteller_id != connected_storyteller_id)
);

-- =====================================================
-- 8. CONSENT TRACKING: Granular privacy control
-- =====================================================

CREATE TABLE IF NOT EXISTS consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- What consent is for
    consent_type TEXT NOT NULL CHECK (
        consent_type IN ('story-collection', 'ai-analysis', 'quote-sharing', 'theme-extraction', 'community-connections', 'research-participation', 'media-storage', 'public-sharing')
    ),
    consent_scope TEXT NOT NULL, -- Specific details of what they're consenting to
    
    -- Consent details
    consent_status TEXT NOT NULL CHECK (
        consent_status IN ('given', 'withdrawn', 'modified', 'expired')
    ),
    consent_method TEXT NOT NULL CHECK (
        consent_method IN ('verbal', 'written', 'digital', 'advocate-assisted', 'video-recorded')
    ),
    
    -- Legal/ethical compliance
    informed_consent_provided BOOLEAN NOT NULL DEFAULT TRUE,
    consent_document_version TEXT,
    language_of_consent TEXT DEFAULT 'en',
    capacity_confirmed BOOLEAN DEFAULT TRUE,
    advocate_involved BOOLEAN DEFAULT FALSE,
    advocate_details TEXT,
    
    -- Specific permissions granted
    permissions_granted JSONB NOT NULL DEFAULT '{}'::jsonb,
    restrictions_specified JSONB DEFAULT '{}'::jsonb,
    duration_specified INTERVAL, -- How long this consent is valid
    expiration_date TIMESTAMPTZ,
    
    -- Revocation details (if applicable)
    withdrawal_reason TEXT,
    withdrawal_method TEXT,
    data_deletion_requested BOOLEAN DEFAULT FALSE,
    data_deletion_completed BOOLEAN DEFAULT FALSE,
    
    -- Compliance tracking
    gdpr_compliant BOOLEAN DEFAULT TRUE,
    other_compliance_frameworks TEXT[] DEFAULT '{}',
    
    -- Who recorded this consent
    recorded_by TEXT, -- Staff member or system
    witness_present BOOLEAN DEFAULT FALSE,
    witness_details TEXT,
    
    -- Timestamps
    consent_given_date TIMESTAMPTZ NOT NULL,
    consent_recorded_date TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed_date TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE (Privacy-aware)
-- =====================================================

-- Organizations
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_search ON organizations USING GIN(search_vector);

-- Storytellers
CREATE INDEX idx_storytellers_org ON storytellers(organization_id);
CREATE INDEX idx_storytellers_status ON storytellers(status);
CREATE INDEX idx_storytellers_onboarding ON storytellers(onboarding_stage);
CREATE INDEX idx_storytellers_privacy_visibility ON storytellers((privacy_settings->>'profileVisibility'));
CREATE INDEX idx_storytellers_search ON storytellers USING GIN(search_vector);

-- Stories
CREATE INDEX idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX idx_stories_org ON stories(organization_id);
CREATE INDEX idx_stories_visibility ON stories(visibility_level);
CREATE INDEX idx_stories_ready_analysis ON stories(ready_for_analysis);
CREATE INDEX idx_stories_collection_date ON stories(collection_date);
CREATE INDEX idx_stories_search ON stories USING GIN(search_vector);

-- AI Analysis
CREATE INDEX idx_analysis_storyteller ON storyteller_ai_analysis(storyteller_id);
CREATE INDEX idx_analysis_org ON storyteller_ai_analysis(organization_id);
CREATE INDEX idx_analysis_quality ON storyteller_ai_analysis(overall_quality_score);
CREATE INDEX idx_analysis_review_status ON storyteller_ai_analysis(storyteller_review_status);

-- Themes
CREATE INDEX idx_themes_storyteller ON story_themes(storyteller_id);
CREATE INDEX idx_themes_category ON story_themes(theme_category);
CREATE INDEX idx_themes_significance ON story_themes(significance_level);
CREATE INDEX idx_themes_visibility ON story_themes(visibility_level);
CREATE INDEX idx_themes_org ON story_themes(organization_id);

-- Quotes
CREATE INDEX idx_quotes_storyteller ON story_quotes(storyteller_id);
CREATE INDEX idx_quotes_approved ON story_quotes(approved_for_sharing);
CREATE INDEX idx_quotes_consent ON story_quotes(storyteller_consent_status);
CREATE INDEX idx_quotes_impact ON story_quotes(impact_type);
CREATE INDEX idx_quotes_search ON story_quotes USING GIN(search_vector);
CREATE INDEX idx_quotes_org ON story_quotes(organization_id);

-- Community Connections
CREATE INDEX idx_connections_primary ON community_connections(primary_storyteller_id);
CREATE INDEX idx_connections_connected ON community_connections(connected_storyteller_id);
CREATE INDEX idx_connections_type ON community_connections(connection_type);
CREATE INDEX idx_connections_strength ON community_connections(connection_strength);
CREATE INDEX idx_connections_facilitated ON community_connections(connection_facilitated);
CREATE INDEX idx_connections_org ON community_connections(organization_id);

-- Consent Logs
CREATE INDEX idx_consent_storyteller ON consent_logs(storyteller_id);
CREATE INDEX idx_consent_type ON consent_logs(consent_type);
CREATE INDEX idx_consent_status ON consent_logs(consent_status);
CREATE INDEX idx_consent_expiration ON consent_logs(expiration_date);
CREATE INDEX idx_consent_org ON consent_logs(organization_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Organization access policy
CREATE POLICY "organization_access" ON organizations
    FOR ALL USING (
        -- Organization members can access their org
        id IN (
            SELECT organization_id FROM storytellers 
            WHERE storytellers.id = auth.uid()
        )
        OR
        -- Admin access
        auth.jwt() ->> 'role' = 'admin'
    );

-- Storyteller privacy policy (storyteller controls their own data)
CREATE POLICY "storyteller_privacy" ON storytellers
    FOR ALL USING (
        -- Storytellers can access their own data
        id = auth.uid()
        OR
        -- Organization staff can access with proper role
        (organization_id IN (
            SELECT organization_id FROM staff_members 
            WHERE staff_members.user_id = auth.uid() 
            AND staff_members.role IN ('admin', 'staff', 'counselor')
        ))
        OR
        -- Public visibility for public profiles only
        (privacy_settings->>'profileVisibility' = 'public')
    );

-- Stories privacy policy (very restrictive)
CREATE POLICY "stories_privacy" ON stories
    FOR ALL USING (
        -- Storytellers can access their own stories
        storyteller_id = auth.uid()
        OR
        -- Organization staff with appropriate access
        (organization_id IN (
            SELECT organization_id FROM staff_members 
            WHERE staff_members.user_id = auth.uid() 
            AND staff_members.role IN ('admin', 'staff', 'counselor')
        ) AND visibility_level != 'private')
        OR
        -- Public stories for public access
        visibility_level = 'public'
    );

-- Analysis privacy policy (storyteller must approve)
CREATE POLICY "analysis_privacy" ON storyteller_ai_analysis
    FOR ALL USING (
        -- Storytellers can access their own analysis
        storyteller_id = auth.uid()
        OR
        -- Organization staff only if approved by storyteller
        (organization_id IN (
            SELECT organization_id FROM staff_members 
            WHERE staff_members.user_id = auth.uid() 
            AND staff_members.role IN ('admin', 'staff')
        ) AND storyteller_review_status = 'approved')
    );

-- Theme privacy policy
CREATE POLICY "themes_privacy" ON story_themes
    FOR ALL USING (
        -- Storytellers can access their own themes
        storyteller_id = auth.uid()
        OR
        -- Approved themes for organization access
        (organization_id IN (
            SELECT organization_id FROM staff_members 
            WHERE staff_members.user_id = auth.uid()
        ) AND visibility_level != 'private')
        OR
        -- Public themes
        visibility_level = 'public'
    );

-- Quote privacy policy (highest protection)
CREATE POLICY "quotes_privacy" ON story_quotes
    FOR ALL USING (
        -- Storytellers can access their own quotes
        storyteller_id = auth.uid()
        OR
        -- Only approved quotes for organization access
        (organization_id IN (
            SELECT organization_id FROM staff_members 
            WHERE staff_members.user_id = auth.uid()
        ) AND approved_for_sharing = TRUE)
    );

-- Connection privacy policy (both parties must consent)
CREATE POLICY "connections_privacy" ON community_connections
    FOR ALL USING (
        -- Storytellers can see their own connections
        primary_storyteller_id = auth.uid() 
        OR connected_storyteller_id = auth.uid()
        OR
        -- Organization staff only if both parties consented
        (organization_id IN (
            SELECT organization_id FROM staff_members 
            WHERE staff_members.user_id = auth.uid()
        ) AND primary_storyteller_consent = 'approved' 
        AND connected_storyteller_consent = 'approved')
    );

-- Consent logs policy (very secure)
CREATE POLICY "consent_privacy" ON consent_logs
    FOR ALL USING (
        -- Storytellers can access their own consent records
        storyteller_id = auth.uid()
        OR
        -- Organization admins for compliance
        (organization_id IN (
            SELECT organization_id FROM staff_members 
            WHERE staff_members.user_id = auth.uid() 
            AND staff_members.role = 'admin'
        ))
    );

-- =====================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storytellers_updated_at BEFORE UPDATE ON storytellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_updated_at BEFORE UPDATE ON storyteller_ai_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON story_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON story_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON community_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA & CONFIGURATION
-- =====================================================

-- Default theme taxonomy (strengths-based)
CREATE TABLE IF NOT EXISTS theme_taxonomy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    theme_name TEXT NOT NULL,
    description TEXT NOT NULL,
    cultural_considerations TEXT,
    research_basis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, theme_name)
);

-- Insert default empathy-centered themes
INSERT INTO theme_taxonomy (category, theme_name, description, research_basis) VALUES 
('resilience', 'Adaptive Strength', 'Ability to navigate challenges while maintaining core identity', 'Masten, A.S. (2001). Ordinary magic'),
('resilience', 'Community Connection', 'Drawing strength from relationships and belonging', 'Norris, F.H. et al. (2008). Community resilience'),
('resilience', 'Meaning-Making', 'Finding purpose and significance in experiences', 'Frankl, V. (1946). Mans Search for Meaning'),
('healing', 'Post-Traumatic Growth', 'Positive change following adversity', 'Tedeschi, R.G. & Calhoun, L.G. (2004)'),
('healing', 'Cultural Healing', 'Reconnection with cultural identity and practices', 'Duran, E. (2006). Healing the Soul Wound'),
('healing', 'Somatic Wisdom', 'Body-based knowledge and healing', 'Van der Kolk, B. (2014). The Body Keeps the Score'),
('community', 'Collective Care', 'Mutual support and shared responsibility', 'Brown, A.M. (2017). Emergent Strategy'),
('community', 'Intergenerational Wisdom', 'Knowledge passed between generations', 'Traditional Indigenous Knowledge Systems'),
('community', 'Solidarity', 'Standing together in shared struggle and support', 'Critical Community Psychology'),
('growth', 'Self-Advocacy', 'Speaking up for own needs and rights', 'Disability Rights Movement'),
('growth', 'Leadership Development', 'Growing capacity to guide and inspire others', 'Adaptive Leadership Theory'),
('growth', 'Boundary Setting', 'Learning to protect energy and wellbeing', 'Trauma-Informed Practice'),
('wisdom', 'Lived Experience Knowledge', 'Deep understanding gained through direct experience', 'Participatory Action Research'),
('wisdom', 'Practical Wisdom', 'Application of knowledge in daily life', 'Aristotelian Phronesis'),
('wisdom', 'Spiritual Insight', 'Connection to transcendent meaning and purpose', 'Various Spiritual Traditions')
ON CONFLICT (category, theme_name) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE organizations IS 'Multi-tenant organizations using the Empathy Ledger platform';
COMMENT ON TABLE storytellers IS 'People sharing their stories - always centered and in control';
COMMENT ON TABLE stories IS 'The heart of the platform - individual stories shared with dignity';
COMMENT ON TABLE storyteller_ai_analysis IS 'AI-generated insights that honor storyteller wisdom';
COMMENT ON TABLE story_themes IS 'Patterns of resilience and wisdom across stories';
COMMENT ON TABLE story_quotes IS 'Meaningful quotes shared with explicit consent';
COMMENT ON TABLE community_connections IS 'Facilitated connections for mutual support';
COMMENT ON TABLE consent_logs IS 'Granular tracking of all consent decisions';
COMMENT ON TABLE theme_taxonomy IS 'Research-backed framework for empathy-centered themes';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Empathy Ledger schema deployed successfully! 🌟' as message;
SELECT 'Tables created with dignity, consent, and community at the center.' as philosophy;
SELECT 'Ready for organizations to honor storyteller wisdom.' as status;