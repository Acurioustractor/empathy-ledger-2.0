-- Enhanced Sovereignty Schema for Empathy Ledger
-- This schema implements world-class data sovereignty, cultural protocols, and community ownership

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Custom types for sovereignty
CREATE TYPE privacy_level AS ENUM ('private', 'community', 'organization', 'public');
CREATE TYPE consent_type AS ENUM ('explicit', 'implicit', 'withdrawn');
CREATE TYPE cultural_sensitivity AS ENUM ('sacred', 'restricted', 'ceremonial', 'general');
CREATE TYPE value_type AS ENUM ('monetary', 'social', 'cultural', 'research', 'educational');

-- =====================================================
-- CORE TABLES WITH SOVEREIGNTY FEATURES
-- =====================================================

-- Enhanced Stories Table with Full Sovereignty
DROP TABLE IF EXISTS stories CASCADE;
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Core Story Data
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  language_code VARCHAR(10) DEFAULT 'en',
  
  -- Multi-modal Support
  media_attachments JSONB DEFAULT '[]'::jsonb,
  transcription TEXT,
  audio_waveform JSONB,
  video_timestamps JSONB,
  
  -- Sovereignty & Ownership
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  community_ids UUID[] DEFAULT '{}',
  privacy_level privacy_level DEFAULT 'private',
  ownership_type TEXT DEFAULT 'individual', -- 'individual', 'community', 'shared'
  
  -- Granular Consent Management
  consent_settings JSONB DEFAULT '{
    "public_display": false,
    "research_use": false,
    "ai_analysis": false,
    "cross_community": false,
    "commercial_use": false,
    "government_use": false,
    "media_use": false,
    "educational_use": true,
    "attribution_required": true,
    "notification_required": true,
    "consent_expiry": null,
    "consent_type": "explicit"
  }'::jsonb NOT NULL,
  
  -- Cultural Protocols
  cultural_protocols JSONB DEFAULT '[]'::jsonb,
  cultural_sensitivity cultural_sensitivity DEFAULT 'general',
  cultural_review_status TEXT DEFAULT 'pending',
  elder_approval UUID REFERENCES profiles(id),
  restricted_until TIMESTAMPTZ,
  seasonal_restrictions JSONB,
  
  -- AI Analysis (with consent)
  ai_analysis JSONB DEFAULT '{
    "performed": false,
    "consent_checked": false,
    "model_version": null,
    "analysis_date": null
  }'::jsonb,
  embeddings vector(1536),
  themes TEXT[] DEFAULT '{}',
  sentiment_score FLOAT,
  content_warnings TEXT[] DEFAULT '{}',
  extracted_entities JSONB,
  
  -- Engagement & Impact Metrics
  view_count INTEGER DEFAULT 0,
  unique_viewers UUID[] DEFAULT '{}',
  share_count INTEGER DEFAULT 0,
  reaction_counts JSONB DEFAULT '{}'::jsonb,
  impact_metrics JSONB DEFAULT '{
    "community_benefit": 0,
    "policy_influence": 0,
    "research_value": 0,
    "cultural_preservation": 0
  }'::jsonb,
  
  -- Value Tracking
  value_generated DECIMAL(10,2) DEFAULT 0,
  value_distributed DECIMAL(10,2) DEFAULT 0,
  value_distribution_log JSONB DEFAULT '[]'::jsonb,
  
  -- Version Control
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES stories(id),
  edit_history JSONB DEFAULT '[]'::jsonb,
  change_summary TEXT,
  
  -- Lifecycle Management
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deletion_requested_at TIMESTAMPTZ,
  deletion_reason TEXT,
  
  -- Data Sovereignty
  data_location VARCHAR(50) DEFAULT 'australia',
  backup_locations TEXT[] DEFAULT '{}'::text[],
  export_history JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  location_data JSONB,
  custom_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_consent CHECK (jsonb_typeof(consent_settings) = 'object'),
  CONSTRAINT valid_protocols CHECK (jsonb_typeof(cultural_protocols) = 'array'),
  CONSTRAINT valid_privacy CHECK (
    CASE 
      WHEN privacy_level = 'private' THEN consent_settings->>'public_display' = 'false'
      ELSE true
    END
  )
);

-- Performance Indexes
CREATE INDEX idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX idx_stories_communities ON stories USING GIN(community_ids);
CREATE INDEX idx_stories_privacy ON stories(privacy_level);
CREATE INDEX idx_stories_created ON stories(created_at DESC);
CREATE INDEX idx_stories_themes ON stories USING GIN(themes);
CREATE INDEX idx_stories_embeddings ON stories USING ivfflat (embeddings vector_cosine_ops);
CREATE INDEX idx_stories_fulltext ON stories USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(summary, ''))
);
CREATE INDEX idx_stories_cultural_sensitivity ON stories(cultural_sensitivity);
CREATE INDEX idx_stories_consent_public ON stories((consent_settings->>'public_display'));

-- =====================================================
-- KNOWLEDGE GRAPH & CONNECTIONS
-- =====================================================

CREATE TABLE knowledge_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  target_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Connection Metadata
  connection_type TEXT NOT NULL, -- 'theme', 'narrative', 'temporal', 'causal', 'cultural'
  connection_strength FLOAT DEFAULT 0.5 CHECK (connection_strength BETWEEN 0 AND 1),
  bidirectional BOOLEAN DEFAULT false,
  
  -- Discovery & Validation
  discovered_by TEXT NOT NULL, -- 'ai', 'community', 'storyteller', 'researcher'
  discovered_at TIMESTAMPTZ DEFAULT now(),
  discovery_metadata JSONB,
  
  -- Community Validation
  verified_by UUID[] DEFAULT '{}',
  verification_count INTEGER DEFAULT 0,
  disputed_by UUID[] DEFAULT '{}',
  dispute_reason TEXT,
  
  -- Cultural Context
  cultural_significance JSONB DEFAULT '{
    "sacred_connection": false,
    "ceremonial_link": false,
    "seasonal_relevance": null,
    "elder_notes": null
  }'::jsonb,
  
  -- Consent for Connection
  connection_consent JSONB DEFAULT '{
    "source_consent": false,
    "target_consent": false,
    "public_display": false
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_connection UNIQUE(source_story_id, target_story_id, connection_type),
  CONSTRAINT different_stories CHECK (source_story_id != target_story_id)
);

CREATE INDEX idx_connections_source ON knowledge_connections(source_story_id);
CREATE INDEX idx_connections_target ON knowledge_connections(target_story_id);
CREATE INDEX idx_connections_type ON knowledge_connections(connection_type);
CREATE INDEX idx_connections_strength ON knowledge_connections(connection_strength DESC);

-- =====================================================
-- COMMUNITY INSIGHTS WITH SOVEREIGNTY
-- =====================================================

CREATE TABLE community_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  
  -- Insight Details
  insight_type TEXT NOT NULL, -- 'theme', 'trend', 'need', 'success', 'challenge', 'opportunity'
  title TEXT NOT NULL,
  description TEXT,
  significance_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  -- Data Sources & Evidence
  supporting_stories UUID[] DEFAULT '{}',
  supporting_evidence JSONB DEFAULT '[]'::jsonb,
  data_points JSONB DEFAULT '[]'::jsonb,
  statistical_confidence FLOAT,
  methodology TEXT,
  
  -- Community Validation
  community_validated BOOLEAN DEFAULT false,
  validation_method TEXT, -- 'vote', 'consensus', 'elder_review', 'workshop'
  validation_participants UUID[] DEFAULT '{}',
  validation_date TIMESTAMPTZ,
  elder_endorsed BOOLEAN DEFAULT false,
  elder_notes TEXT,
  
  -- Impact & Action
  action_items JSONB DEFAULT '[]'::jsonb,
  impact_potential TEXT DEFAULT 'medium',
  resources_needed JSONB DEFAULT '{
    "funding": null,
    "volunteers": null,
    "expertise": [],
    "timeline": null
  }'::jsonb,
  implementation_status TEXT DEFAULT 'identified',
  
  -- Sovereignty & Sharing
  ownership_type TEXT DEFAULT 'community', -- 'community', 'shared', 'public'
  sharing_permissions JSONB DEFAULT '{
    "public": false,
    "cross_community": false,
    "government": false,
    "research": false,
    "media": false,
    "requires_attribution": true,
    "requires_context": true
  }'::jsonb NOT NULL,
  
  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  review_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  related_insights UUID[] DEFAULT '{}',
  external_references JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_insights_community ON community_insights(community_id);
CREATE INDEX idx_insights_type ON community_insights(insight_type);
CREATE INDEX idx_insights_validated ON community_insights(community_validated);
CREATE INDEX idx_insights_stories ON community_insights USING GIN(supporting_stories);

-- =====================================================
-- VALUE DISTRIBUTION & TRACKING
-- =====================================================

CREATE TABLE value_distribution (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Source of Value
  source_type TEXT NOT NULL, -- 'story', 'insight', 'research', 'collaboration'
  source_id UUID NOT NULL,
  story_id UUID REFERENCES stories(id),
  community_id UUID REFERENCES communities(id),
  
  -- Value Details
  value_type value_type NOT NULL,
  value_amount DECIMAL(10,2) NOT NULL,
  value_currency VARCHAR(3) DEFAULT 'AUD',
  value_description TEXT NOT NULL,
  value_calculation JSONB,
  
  -- Distribution Details
  distributed_to JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of recipients with amounts
  distribution_date TIMESTAMPTZ,
  distribution_method TEXT, -- 'direct_payment', 'community_fund', 'in_kind', 'service'
  distribution_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Verification & Transparency
  verified_by UUID REFERENCES profiles(id),
  verification_date TIMESTAMPTZ,
  verification_evidence JSONB,
  blockchain_hash TEXT, -- For immutable record
  public_receipt_url TEXT,
  
  -- Impact Tracking
  impact_report JSONB DEFAULT '{
    "beneficiaries": 0,
    "community_feedback": null,
    "success_metrics": {}
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT positive_value CHECK (value_amount > 0)
);

CREATE INDEX idx_value_dist_story ON value_distribution(story_id);
CREATE INDEX idx_value_dist_community ON value_distribution(community_id);
CREATE INDEX idx_value_dist_status ON value_distribution(distribution_status);
CREATE INDEX idx_value_dist_date ON value_distribution(distribution_date DESC);

-- =====================================================
-- CULTURAL PROTOCOLS REGISTRY
-- =====================================================

CREATE TABLE cultural_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  protocol_type TEXT NOT NULL, -- 'access', 'seasonal', 'ceremonial', 'gender', 'age'
  
  -- Ownership & Authority
  community_id UUID REFERENCES communities(id),
  custodian_id UUID REFERENCES profiles(id),
  authority_type TEXT, -- 'elder', 'council', 'traditional_owner'
  
  -- Protocol Rules (Detailed)
  rules JSONB NOT NULL DEFAULT '{
    "access_restrictions": {},
    "time_restrictions": {},
    "person_restrictions": {},
    "usage_restrictions": {},
    "modification_restrictions": {}
  }'::jsonb,
  
  -- Requirements
  required_approvals JSONB DEFAULT '{
    "elder_approval": false,
    "council_approval": false,
    "custodian_approval": true,
    "community_consensus": false
  }'::jsonb,
  
  -- Time-based Restrictions
  restricted_periods JSONB DEFAULT '[]'::jsonb, -- Array of date ranges
  seasonal_calendar JSONB,
  
  -- Application Scope
  applies_to TEXT[] DEFAULT '{}', -- 'stories', 'images', 'audio', 'video', 'sacred_knowledge'
  applicable_themes TEXT[] DEFAULT '{}',
  enforcement_level TEXT NOT NULL, -- 'mandatory', 'strongly_recommended', 'recommended', 'optional'
  
  -- Documentation
  documentation_url TEXT,
  examples JSONB DEFAULT '[]'::jsonb,
  violation_consequences TEXT,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES cultural_protocols(id)
);

CREATE INDEX idx_protocols_community ON cultural_protocols(community_id);
CREATE INDEX idx_protocols_active ON cultural_protocols(active);
CREATE INDEX idx_protocols_type ON cultural_protocols(protocol_type);
CREATE INDEX idx_protocols_applies ON cultural_protocols USING GIN(applies_to);

-- =====================================================
-- COLLABORATION & REAL-TIME FEATURES
-- =====================================================

CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Session Management
  session_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  session_type TEXT DEFAULT 'edit', -- 'edit', 'review', 'translate', 'annotate'
  
  -- Participants
  creator_id UUID REFERENCES profiles(id),
  participants JSONB DEFAULT '[]'::jsonb, -- Array with roles and permissions
  active_editors UUID[] DEFAULT '{}',
  observers UUID[] DEFAULT '{}',
  
  -- Collaboration State
  current_version INTEGER DEFAULT 1,
  content_snapshots JSONB DEFAULT '[]'::jsonb,
  change_queue JSONB DEFAULT '[]'::jsonb,
  cursor_positions JSONB DEFAULT '{}'::jsonb,
  
  -- Permissions
  edit_permissions JSONB DEFAULT '{}'::jsonb,
  can_invite_others BOOLEAN DEFAULT false,
  max_participants INTEGER DEFAULT 10,
  
  -- Cultural Considerations
  requires_elder_presence BOOLEAN DEFAULT false,
  cultural_guidelines JSONB,
  
  -- Lifecycle
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now(),
  scheduled_end TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  end_reason TEXT,
  
  -- Metadata
  session_recording JSONB DEFAULT '[]'::jsonb, -- For replay
  chat_history JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_collab_story ON collaboration_sessions(story_id);
CREATE INDEX idx_collab_active ON collaboration_sessions(ended_at) WHERE ended_at IS NULL;
CREATE INDEX idx_collab_token ON collaboration_sessions(session_token);

-- =====================================================
-- AUDIT & COMPLIANCE
-- =====================================================

CREATE TABLE sovereignty_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event Details
  event_type TEXT NOT NULL, -- 'access', 'consent_change', 'value_distribution', 'export', 'deletion'
  event_timestamp TIMESTAMPTZ DEFAULT now(),
  event_details JSONB NOT NULL,
  
  -- Actor Information
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  actor_community UUID REFERENCES communities(id),
  actor_ip_hash TEXT, -- Hashed for privacy
  
  -- Resource Information
  resource_type TEXT NOT NULL, -- 'story', 'insight', 'profile', 'community'
  resource_id UUID NOT NULL,
  resource_community UUID REFERENCES communities(id),
  
  -- Compliance
  consent_verified BOOLEAN DEFAULT false,
  cultural_protocol_checked BOOLEAN DEFAULT false,
  sovereignty_score FLOAT, -- 0-100 compliance score
  
  -- Outcome
  action_permitted BOOLEAN NOT NULL,
  denial_reason TEXT,
  warnings_issued TEXT[],
  
  -- Immutability
  previous_hash TEXT,
  current_hash TEXT NOT NULL
);

CREATE INDEX idx_audit_timestamp ON sovereignty_audit_log(event_timestamp DESC);
CREATE INDEX idx_audit_actor ON sovereignty_audit_log(actor_id);
CREATE INDEX idx_audit_resource ON sovereignty_audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_compliance ON sovereignty_audit_log(sovereignty_score);

-- =====================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Community Dashboard View
CREATE MATERIALIZED VIEW community_dashboard AS
SELECT 
  c.id as community_id,
  c.name as community_name,
  
  -- Story Metrics
  COUNT(DISTINCT s.id) FILTER (WHERE s.archived_at IS NULL) as active_stories,
  COUNT(DISTINCT s.storyteller_id) as unique_storytellers,
  COUNT(DISTINCT s.id) FILTER (WHERE s.created_at > now() - interval '30 days') as recent_stories,
  
  -- Engagement Metrics
  COALESCE(SUM(s.view_count), 0) as total_views,
  COALESCE(AVG(s.sentiment_score), 0) as avg_sentiment,
  
  -- Theme Analysis
  array_agg(DISTINCT theme) as all_themes
    FROM unnest(
      array_agg(s.themes)
    ) as theme,
  
  -- Value Metrics
  COALESCE(SUM(s.value_generated), 0) as total_value_generated,
  COALESCE(SUM(s.value_distributed), 0) as total_value_distributed,
  
  -- Consent Metrics
  COUNT(DISTINCT s.id) FILTER (WHERE s.consent_settings->>'public_display' = 'true') as public_stories,
  COUNT(DISTINCT s.id) FILTER (WHERE s.consent_settings->>'research_use' = 'true') as research_available,
  
  -- Time Patterns
  date_trunc('month', now()) as report_month
  
FROM communities c
LEFT JOIN stories s ON c.id = ANY(s.community_ids)
GROUP BY c.id, c.name;

CREATE UNIQUE INDEX idx_community_dashboard ON community_dashboard(community_id, report_month);

-- Story Connections Graph View
CREATE MATERIALIZED VIEW story_connection_graph AS
SELECT 
  kc.source_story_id,
  kc.target_story_id,
  kc.connection_type,
  kc.connection_strength,
  kc.cultural_significance,
  s1.title as source_title,
  s2.title as target_title,
  s1.themes as source_themes,
  s2.themes as target_themes,
  s1.community_ids as source_communities,
  s2.community_ids as target_communities
FROM knowledge_connections kc
JOIN stories s1 ON kc.source_story_id = s1.id
JOIN stories s2 ON kc.target_story_id = s2.id
WHERE 
  kc.connection_consent->>'public_display' = 'true'
  AND s1.privacy_level != 'private'
  AND s2.privacy_level != 'private';

CREATE INDEX idx_connection_graph_source ON story_connection_graph(source_story_id);
CREATE INDEX idx_connection_graph_target ON story_connection_graph(target_story_id);

-- =====================================================
-- TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON community_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON cultural_protocols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sovereignty compliance check
CREATE OR REPLACE FUNCTION check_sovereignty_compliance()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if public display requires community consent
  IF NEW.privacy_level = 'public' AND NEW.consent_settings->>'public_display' != 'true' THEN
    RAISE EXCEPTION 'Cannot make story public without consent';
  END IF;
  
  -- Check cultural protocol compliance
  IF EXISTS (
    SELECT 1 FROM cultural_protocols cp
    WHERE cp.community_id = ANY(NEW.community_ids)
    AND cp.enforcement_level = 'mandatory'
    AND cp.active = true
  ) THEN
    -- Verify protocols are followed
    IF NEW.cultural_review_status != 'approved' THEN
      RAISE EXCEPTION 'Story requires cultural protocol review before publishing';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_sovereignty_compliance
  BEFORE INSERT OR UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION check_sovereignty_compliance();

-- Audit logging trigger
CREATE OR REPLACE FUNCTION log_sovereignty_event()
RETURNS TRIGGER AS $$
DECLARE
  event_data JSONB;
  event_type TEXT;
BEGIN
  -- Determine event type
  CASE TG_OP
    WHEN 'INSERT' THEN event_type := 'create';
    WHEN 'UPDATE' THEN event_type := 'update';
    WHEN 'DELETE' THEN event_type := 'delete';
  END CASE;
  
  -- Build event data
  event_data := jsonb_build_object(
    'table_name', TG_TABLE_NAME,
    'operation', TG_OP,
    'user_id', current_setting('app.current_user_id', true),
    'timestamp', now(),
    'old_data', to_jsonb(OLD),
    'new_data', to_jsonb(NEW)
  );
  
  -- Insert audit log
  INSERT INTO sovereignty_audit_log (
    event_type,
    event_details,
    actor_id,
    resource_type,
    resource_id,
    action_permitted,
    current_hash
  ) VALUES (
    event_type,
    event_data,
    current_setting('app.current_user_id', true)::uuid,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    true,
    encode(sha256(event_data::text::bytea), 'hex')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS FOR SOVEREIGNTY OPERATIONS
-- =====================================================

-- Check story access with full sovereignty rules
CREATE OR REPLACE FUNCTION check_story_access_sovereign(
  p_story_id UUID,
  p_user_id UUID,
  p_access_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_story RECORD;
  v_user_communities UUID[];
  v_has_permission BOOLEAN := false;
  v_cultural_clearance BOOLEAN := true;
BEGIN
  -- Get story details
  SELECT * INTO v_story FROM stories WHERE id = p_story_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Storyteller always has access to own stories
  IF v_story.storyteller_id = p_user_id THEN
    RETURN true;
  END IF;
  
  -- Get user's communities
  SELECT array_agg(community_id) INTO v_user_communities
  FROM community_members 
  WHERE user_id = p_user_id AND status = 'active';
  
  -- Check cultural restrictions
  IF v_story.cultural_sensitivity != 'general' THEN
    -- Check if user has cultural clearance
    SELECT EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = p_user_id
      AND p.cultural_clearances @> ARRAY[v_story.cultural_sensitivity]
    ) INTO v_cultural_clearance;
  END IF;
  
  -- Check seasonal restrictions
  IF v_story.restricted_until IS NOT NULL AND now() < v_story.restricted_until THEN
    RETURN false;
  END IF;
  
  -- Check access based on privacy level
  CASE v_story.privacy_level
    WHEN 'private' THEN
      v_has_permission := false;
      
    WHEN 'community' THEN
      v_has_permission := v_user_communities && v_story.community_ids;
      
    WHEN 'organization' THEN
      v_has_permission := EXISTS (
        SELECT 1 FROM organization_members om
        JOIN stories s ON s.organization_id = om.organization_id
        WHERE om.user_id = p_user_id AND s.id = p_story_id
      );
      
    WHEN 'public' THEN
      v_has_permission := v_story.consent_settings->>'public_display' = 'true';
  END CASE;
  
  -- Apply cultural clearance
  v_has_permission := v_has_permission AND v_cultural_clearance;
  
  -- Check specific access type permissions
  IF v_has_permission AND p_access_type != 'view' THEN
    CASE p_access_type
      WHEN 'edit' THEN
        v_has_permission := v_story.storyteller_id = p_user_id OR 
          EXISTS (
            SELECT 1 FROM story_editors 
            WHERE story_id = p_story_id AND editor_id = p_user_id
          );
          
      WHEN 'share' THEN
        v_has_permission := v_story.consent_settings->>'cross_community' = 'true' OR
          v_story.storyteller_id = p_user_id;
          
      WHEN 'analyze' THEN
        v_has_permission := v_story.consent_settings->>'ai_analysis' = 'true' OR
          v_story.consent_settings->>'research_use' = 'true';
    END CASE;
  END IF;
  
  -- Log access attempt
  INSERT INTO sovereignty_audit_log (
    event_type,
    event_details,
    actor_id,
    resource_type,
    resource_id,
    action_permitted,
    current_hash
  ) VALUES (
    'access',
    jsonb_build_object(
      'access_type', p_access_type,
      'privacy_level', v_story.privacy_level,
      'cultural_sensitivity', v_story.cultural_sensitivity
    ),
    p_user_id,
    'story',
    p_story_id,
    v_has_permission,
    encode(sha256((p_story_id::text || p_user_id::text || now()::text)::bytea), 'hex')
  );
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate and distribute value
CREATE OR REPLACE FUNCTION distribute_story_value(
  p_story_id UUID,
  p_value_amount DECIMAL,
  p_value_type value_type,
  p_description TEXT
) RETURNS UUID AS $$
DECLARE
  v_distribution_id UUID;
  v_story RECORD;
  v_community_share DECIMAL;
  v_storyteller_share DECIMAL;
  v_platform_share DECIMAL;
BEGIN
  -- Get story details
  SELECT * INTO v_story FROM stories WHERE id = p_story_id;
  
  -- Calculate distribution (configurable)
  v_storyteller_share := p_value_amount * 0.6; -- 60% to storyteller
  v_community_share := p_value_amount * 0.3;   -- 30% to community
  v_platform_share := p_value_amount * 0.1;    -- 10% platform sustainability
  
  -- Create distribution record
  INSERT INTO value_distribution (
    source_type,
    source_id,
    story_id,
    community_id,
    value_type,
    value_amount,
    value_description,
    distributed_to,
    distribution_status
  ) VALUES (
    'story',
    p_story_id,
    p_story_id,
    v_story.community_ids[1], -- Primary community
    p_value_type,
    p_value_amount,
    p_description,
    jsonb_build_array(
      jsonb_build_object(
        'recipient_type', 'storyteller',
        'recipient_id', v_story.storyteller_id,
        'amount', v_storyteller_share
      ),
      jsonb_build_object(
        'recipient_type', 'community',
        'recipient_id', v_story.community_ids[1],
        'amount', v_community_share
      ),
      jsonb_build_object(
        'recipient_type', 'platform',
        'recipient_id', 'platform',
        'amount', v_platform_share
      )
    ),
    'pending'
  )
  RETURNING id INTO v_distribution_id;
  
  -- Update story value tracking
  UPDATE stories 
  SET 
    value_generated = value_generated + p_value_amount,
    value_distribution_log = value_distribution_log || 
      jsonb_build_object(
        'distribution_id', v_distribution_id,
        'amount', p_value_amount,
        'date', now()
      )
  WHERE id = p_story_id;
  
  RETURN v_distribution_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULED MAINTENANCE FUNCTIONS
-- =====================================================

-- Refresh materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY community_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY story_connection_graph;
END;
$$ LANGUAGE plpgsql;

-- Schedule hourly refresh
SELECT cron.schedule(
  'refresh-materialized-views',
  '0 * * * *',
  'SELECT refresh_all_materialized_views()'
);

-- Clean up old audit logs (keep 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM sovereignty_audit_log 
  WHERE event_timestamp < now() - interval '2 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly cleanup
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 0 1 * *',
  'SELECT cleanup_old_audit_logs()'
);

-- =====================================================
-- INITIAL DATA & CONFIGURATION
-- =====================================================

-- Insert default cultural protocols
INSERT INTO cultural_protocols (name, description, protocol_type, rules, enforcement_level) VALUES
('General Respectful Use', 'Basic protocol for respectful story sharing', 'access', 
 '{"access_restrictions": {"minimum_age": null}, "usage_restrictions": {"commercial_use": false}}'::jsonb,
 'mandatory'),
('Sacred Knowledge Protection', 'Protocol for sacred or ceremonial knowledge', 'access',
 '{"access_restrictions": {"requires_initiation": true, "gender_specific": true}, "time_restrictions": {"ceremony_periods": true}}'::jsonb,
 'mandatory'),
('Sorry Business Protocol', 'Restrictions during mourning periods', 'seasonal',
 '{"time_restrictions": {"mourning_period": true}, "usage_restrictions": {"no_images": true, "no_names": true}}'::jsonb,
 'mandatory');

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Enable RLS on all tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sovereignty_audit_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for common queries
CREATE INDEX idx_stories_recent ON stories(created_at DESC) WHERE archived_at IS NULL;
CREATE INDEX idx_stories_high_value ON stories(value_generated DESC) WHERE value_generated > 0;
CREATE INDEX idx_insights_actionable ON community_insights(impact_potential) WHERE community_validated = true;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE stories IS 'Core table for community stories with full sovereignty and consent management';
COMMENT ON COLUMN stories.consent_settings IS 'Granular consent controls for story usage - all default to restrictive';
COMMENT ON COLUMN stories.cultural_protocols IS 'Array of applicable cultural protocols that must be respected';
COMMENT ON COLUMN stories.value_generated IS 'Total value generated by this story (monetary, social, research, etc)';

COMMENT ON TABLE knowledge_connections IS 'Graph of connections between stories for knowledge mapping';
COMMENT ON TABLE community_insights IS 'Community-validated insights derived from collective stories';
COMMENT ON TABLE value_distribution IS 'Transparent tracking of value distribution back to communities';
COMMENT ON TABLE cultural_protocols IS 'Registry of cultural protocols to be respected across the platform';

COMMENT ON FUNCTION check_story_access_sovereign IS 'Comprehensive access control checking sovereignty, consent, and cultural protocols';
COMMENT ON FUNCTION distribute_story_value IS 'Fair distribution of value generated from stories back to communities';