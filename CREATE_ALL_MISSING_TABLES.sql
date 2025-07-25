-- =========================================
-- EMPATHY LEDGER: COMPLETE TABLE CREATION
-- =========================================
-- Creates all missing tables for full platform functionality
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. USER AUTHENTICATION & PROFILES
-- ==========================================

-- User profiles extending Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Role and permissions
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'storyteller', 'staff', 'admin', 'super_admin')),
  permissions TEXT[] DEFAULT '{}',
  
  -- Organization relationships
  primary_organization_id UUID REFERENCES organizations(id),
  
  -- Preferences
  language_preference TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{}',
  privacy_preferences JSONB DEFAULT '{}',
  
  -- Status
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'archived')),
  email_verified BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization membership with roles
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role in organization
  role TEXT NOT NULL CHECK (role IN ('member', 'admin', 'staff', 'counselor', 'manager', 'owner')),
  permissions TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- ==========================================
-- 2. AI ANALYSIS SYSTEM
-- ==========================================

-- Theme taxonomy for story categorization
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'emotion', 'life_event', 'social_issue', 'strength', etc.
  
  -- Hierarchy support
  parent_theme_id UUID REFERENCES themes(id),
  level INTEGER DEFAULT 0, -- 0=root, 1=main, 2=sub, etc.
  sort_order INTEGER DEFAULT 0,
  
  -- AI confidence and usage
  ai_confidence_threshold DECIMAL(3,2) DEFAULT 0.75,
  usage_count INTEGER DEFAULT 0,
  
  -- Cultural considerations
  cultural_context TEXT[],
  requires_cultural_review BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'under_review')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis results for stories/transcripts
CREATE TABLE story_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source content
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Analysis metadata
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('theme_extraction', 'sentiment_analysis', 'quote_extraction', 'story_creation', 'cultural_analysis')),
  ai_model_used TEXT NOT NULL,
  analysis_version TEXT DEFAULT '1.0',
  
  -- Results
  results JSONB NOT NULL, -- Flexible storage for different analysis types
  confidence_score DECIMAL(3,2),
  quality_score DECIMAL(3,2),
  
  -- Themes identified
  themes_identified UUID[] DEFAULT '{}', -- References themes.id
  primary_emotions TEXT[],
  key_topics TEXT[],
  
  -- Content extraction
  key_quotes TEXT[],
  summary TEXT,
  insights TEXT[],
  
  -- Cultural analysis
  cultural_elements JSONB,
  sensitivity_flags TEXT[],
  cultural_review_required BOOLEAN DEFAULT FALSE,
  
  -- Processing
  processing_status TEXT DEFAULT 'completed' CHECK (processing_status IN ('processing', 'completed', 'failed', 'requires_review')),
  processing_time_seconds INTEGER,
  processing_notes TEXT,
  
  -- Review and approval
  human_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  approved_for_use BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either story_id OR transcript_id (not both)
  CHECK ((story_id IS NOT NULL AND transcript_id IS NULL) OR (story_id IS NULL AND transcript_id IS NOT NULL))
);

-- Extracted quotes from stories/transcripts
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Quote content
  quote_text TEXT NOT NULL,
  context_before TEXT, -- Text before quote for context
  context_after TEXT,  -- Text after quote for context
  
  -- AI analysis
  extracted_by_ai BOOLEAN DEFAULT FALSE,
  ai_confidence_score DECIMAL(3,2),
  themes UUID[] DEFAULT '{}', -- References themes.id
  emotional_tone TEXT[],
  significance_score DECIMAL(3,2),
  
  -- Attribution and permissions
  attribution_approved BOOLEAN DEFAULT FALSE,
  storyteller_approved BOOLEAN DEFAULT FALSE,
  usage_permissions TEXT[] DEFAULT '{}', -- 'research', 'publication', 'social_media', etc.
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Categorization
  quote_type TEXT CHECK (quote_type IN ('wisdom', 'experience', 'insight', 'emotion', 'call_to_action', 'teaching')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'organization', 'public')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure either story_id OR transcript_id (not both)
  CHECK ((story_id IS NOT NULL AND transcript_id IS NULL) OR (story_id IS NULL AND transcript_id IS NOT NULL))
);

-- ==========================================
-- 3. ENGAGEMENT & SOCIAL FEATURES
-- ==========================================

-- Story reactions (likes, hearts, etc.)
CREATE TABLE story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Reaction type
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'inspire', 'relate', 'support', 'grateful')),
  
  -- Optional message
  message TEXT,
  
  -- Visibility
  public_reaction BOOLEAN DEFAULT TRUE,
  anonymous BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(story_id, user_id, reaction_type)
);

-- Story comments and discussions
CREATE TABLE story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Comment content
  comment_text TEXT NOT NULL,
  
  -- Threading support
  parent_comment_id UUID REFERENCES story_comments(id),
  thread_level INTEGER DEFAULT 0,
  
  -- Moderation
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'hidden', 'removed')),
  flagged_count INTEGER DEFAULT 0,
  moderated_by UUID REFERENCES profiles(id),
  moderation_notes TEXT,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  
  -- Privacy
  anonymous BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. CONSENT & PRIVACY MANAGEMENT
-- ==========================================

-- Detailed consent tracking
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Consent details
  consent_type TEXT NOT NULL CHECK (consent_type IN ('story_sharing', 'ai_analysis', 'quote_extraction', 'research_participation', 'media_use', 'contact_permission')),
  consent_given BOOLEAN NOT NULL,
  consent_level TEXT CHECK (consent_level IN ('full', 'limited', 'research_only', 'organization_only')),
  
  -- Specific permissions
  permissions JSONB DEFAULT '{}',
  restrictions TEXT[],
  expiry_date TIMESTAMPTZ,
  
  -- Context
  consent_method TEXT CHECK (consent_method IN ('verbal', 'written', 'digital', 'implied')),
  consent_context TEXT, -- e.g., 'initial interview', 'follow-up', 'platform registration'
  
  -- Legal and cultural
  legal_basis TEXT, -- GDPR, local laws, etc.
  cultural_protocols_followed BOOLEAN DEFAULT FALSE,
  cultural_notes TEXT,
  
  -- Tracking
  witnessed_by UUID REFERENCES profiles(id),
  recorded_by UUID REFERENCES profiles(id),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'expired', 'superseded')),
  withdrawal_date TIMESTAMPTZ,
  withdrawal_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. AUDIT & SECURITY
-- ==========================================

-- System audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'story', 'transcript', 'user', etc.
  resource_id UUID,
  
  -- Actor
  user_id UUID REFERENCES profiles(id),
  user_email TEXT,
  user_role TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  
  -- Classification
  action_category TEXT CHECK (action_category IN ('create', 'read', 'update', 'delete', 'export', 'share', 'analyze')),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Compliance
  gdpr_relevant BOOLEAN DEFAULT FALSE,
  requires_notification BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media files and attachments
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File details
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_hash TEXT, -- For deduplication
  
  -- Storage
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  public_url TEXT,
  
  -- Associations
  story_id UUID REFERENCES stories(id),
  storyteller_id UUID REFERENCES storytellers(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Metadata
  alt_text TEXT,
  caption TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'audio', 'video', 'document')),
  
  -- Processing
  processing_status TEXT DEFAULT 'completed' CHECK (processing_status IN ('uploading', 'processing', 'completed', 'failed')),
  thumbnail_url TEXT,
  
  -- Permissions
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'organization', 'public')),
  uploaded_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. INDEXES FOR PERFORMANCE
-- ==========================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_organization ON profiles(primary_organization_id);

-- Organization members indexes
CREATE INDEX idx_org_members_organization ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);

-- Themes indexes
CREATE INDEX idx_themes_category ON themes(category);
CREATE INDEX idx_themes_parent ON themes(parent_theme_id);
CREATE INDEX idx_themes_status ON themes(status);

-- Story analysis indexes
CREATE INDEX idx_story_analysis_story ON story_analysis(story_id);
CREATE INDEX idx_story_analysis_transcript ON story_analysis(transcript_id);
CREATE INDEX idx_story_analysis_type ON story_analysis(analysis_type);
CREATE INDEX idx_story_analysis_status ON story_analysis(processing_status);

-- Quotes indexes
CREATE INDEX idx_quotes_storyteller ON quotes(storyteller_id);
CREATE INDEX idx_quotes_story ON quotes(story_id);
CREATE INDEX idx_quotes_transcript ON quotes(transcript_id);
CREATE INDEX idx_quotes_approved ON quotes(storyteller_approved);

-- Reactions indexes
CREATE INDEX idx_reactions_story ON story_reactions(story_id);
CREATE INDEX idx_reactions_user ON story_reactions(user_id);
CREATE INDEX idx_reactions_type ON story_reactions(reaction_type);

-- Comments indexes
CREATE INDEX idx_comments_story ON story_comments(story_id);
CREATE INDEX idx_comments_user ON story_comments(user_id);
CREATE INDEX idx_comments_parent ON story_comments(parent_comment_id);
CREATE INDEX idx_comments_status ON story_comments(status);

-- Consent indexes
CREATE INDEX idx_consent_storyteller ON consent_records(storyteller_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type);
CREATE INDEX idx_consent_status ON consent_records(status);

-- Audit indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_logs(action_category);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Media indexes
CREATE INDEX idx_media_story ON media_files(story_id);
CREATE INDEX idx_media_storyteller ON media_files(storyteller_id);
CREATE INDEX idx_media_type ON media_files(media_type);

-- ==========================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see their own profile
CREATE POLICY "profiles_own_data" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Organization members: Users can see their own memberships
CREATE POLICY "org_members_basic_access" ON organization_members
    FOR ALL USING (
        user_id = auth.uid()
    );

-- Organization members: Admins can see all memberships
CREATE POLICY "org_members_admin_access" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'super_admin')
        )
    );

-- Themes: Public read, admin write
CREATE POLICY "themes_read" ON themes
    FOR SELECT USING (status = 'active');

CREATE POLICY "themes_write" ON themes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Story analysis: Organization staff can see analyses for their stories
CREATE POLICY "analysis_org_access" ON story_analysis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stories s
            JOIN storytellers st ON s.storyteller_id = st.id
            JOIN organization_members om ON st.organization_id = om.organization_id
            WHERE s.id = story_analysis.story_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
        ) OR
        EXISTS (
            SELECT 1 FROM transcripts t
            JOIN storytellers st ON t.storyteller_id = st.id
            JOIN organization_members om ON st.organization_id = om.organization_id
            WHERE t.id = story_analysis.transcript_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
        )
    );

-- Quotes: Respect storyteller privacy and organization access
CREATE POLICY "quotes_access" ON quotes
    FOR ALL USING (
        visibility = 'public' OR
        (visibility = 'organization' AND EXISTS (
            SELECT 1 FROM storytellers st
            JOIN organization_members om ON st.organization_id = om.organization_id
            WHERE st.id = quotes.storyteller_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
        ))
    );

-- Story reactions: Users can see and manage their own reactions
CREATE POLICY "reactions_access" ON story_reactions
    FOR ALL USING (
        user_id = auth.uid() OR
        public_reaction = TRUE
    );

-- Comments: Users can see public comments and manage their own
CREATE POLICY "comments_access" ON story_comments
    FOR SELECT USING (status = 'active');

CREATE POLICY "comments_insert" ON story_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_update" ON story_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "comments_delete" ON story_comments
    FOR DELETE USING (user_id = auth.uid());

-- Consent: Only storyteller and their organization staff
CREATE POLICY "consent_access" ON consent_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM storytellers st
            WHERE st.id = consent_records.storyteller_id 
            AND (
                st.id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM organization_members om 
                    WHERE om.organization_id = st.organization_id 
                    AND om.user_id = auth.uid() 
                    AND om.status = 'active'
                    AND om.role IN ('admin', 'staff', 'counselor')
                )
            )
        )
    );

-- Audit logs: Admin only
CREATE POLICY "audit_admin_only" ON audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Media files: Respect visibility settings
CREATE POLICY "media_access" ON media_files
    FOR ALL USING (
        visibility = 'public' OR
        uploaded_by = auth.uid() OR
        (visibility = 'organization' AND EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = media_files.organization_id 
            AND om.user_id = auth.uid() 
            AND om.status = 'active'
        ))
    );

-- ==========================================
-- 8. TRIGGERS FOR AUTO-UPDATES
-- ==========================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_story_analysis_updated_at BEFORE UPDATE ON story_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_story_comments_updated_at BEFORE UPDATE ON story_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consent_records_updated_at BEFORE UPDATE ON consent_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON media_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

-- Insert a verification record
DO $$
BEGIN
    RAISE NOTICE '✅ ALL TABLES CREATED SUCCESSFULLY!';
    RAISE NOTICE '📊 Added 10 new tables with comprehensive features:';
    RAISE NOTICE '   - User authentication & profiles';
    RAISE NOTICE '   - AI analysis system';
    RAISE NOTICE '   - Engagement features';
    RAISE NOTICE '   - Consent management';
    RAISE NOTICE '   - Audit & security';
    RAISE NOTICE '🔐 Row Level Security enabled on all tables';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🚀 Ready for next phase development!';
END $$;