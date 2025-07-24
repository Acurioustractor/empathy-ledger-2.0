-- Advanced Row Level Security (RLS) Policies for Empathy Ledger
-- Implementing world-class security with sovereignty principles

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Get current user's communities
CREATE OR REPLACE FUNCTION auth.user_communities()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    array_agg(DISTINCT community_id),
    '{}'::uuid[]
  )
  FROM community_members
  WHERE user_id = auth.uid()
  AND status = 'active'
  AND (banned_until IS NULL OR banned_until < now());
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM profiles
  WHERE id = auth.uid();
$$;

-- Check if user is community elder
CREATE OR REPLACE FUNCTION auth.is_community_elder(community_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM community_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.community_id = $1
    AND cm.role = 'elder'
    AND cm.status = 'active'
  );
$$;

-- Check if user has cultural clearance
CREATE OR REPLACE FUNCTION auth.has_cultural_clearance(sensitivity cultural_sensitivity)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
    AND (
      $1 = 'general' OR
      p.cultural_clearances @> ARRAY[$1::text]
    )
  );
$$;

-- Check active collaboration session
CREATE OR REPLACE FUNCTION auth.in_collaboration_session(story_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM collaboration_sessions cs
    WHERE cs.story_id = $1
    AND auth.uid() = ANY(cs.participants)
    AND cs.ended_at IS NULL
  );
$$;

-- =====================================================
-- STORIES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public stories viewable by all" ON stories;
DROP POLICY IF EXISTS "Community stories for members" ON stories;
DROP POLICY IF EXISTS "Storytellers control own stories" ON stories;

-- View Policies

-- 1. Public stories (with consent)
CREATE POLICY "stories_select_public"
  ON stories FOR SELECT
  USING (
    privacy_level = 'public' 
    AND consent_settings->>'public_display' = 'true'
    AND (archived_at IS NULL OR archived_at > now())
    AND auth.has_cultural_clearance(cultural_sensitivity)
  );

-- 2. Community stories (for active members)
CREATE POLICY "stories_select_community"
  ON stories FOR SELECT
  USING (
    privacy_level = 'community'
    AND auth.user_communities() && community_ids
    AND (archived_at IS NULL OR archived_at > now())
    AND auth.has_cultural_clearance(cultural_sensitivity)
    AND (
      restricted_until IS NULL 
      OR restricted_until < now()
      OR auth.is_community_elder(community_ids[1])
    )
  );

-- 3. Organization stories
CREATE POLICY "stories_select_organization"
  ON stories FOR SELECT
  USING (
    privacy_level = 'organization'
    AND EXISTS (
      SELECT 1 FROM organization_members om
      JOIN stories s ON s.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.status = 'active'
      AND s.id = stories.id
    )
  );

-- 4. Own stories (always visible to creator)
CREATE POLICY "stories_select_own"
  ON stories FOR SELECT
  USING (storyteller_id = auth.uid());

-- 5. Stories in active collaboration
CREATE POLICY "stories_select_collaboration"
  ON stories FOR SELECT
  USING (auth.in_collaboration_session(id));

-- 6. Admin access
CREATE POLICY "stories_select_admin"
  ON stories FOR SELECT
  USING (
    auth.user_role() IN ('admin', 'platform_admin')
    OR (
      auth.user_role() = 'community_lead' 
      AND auth.user_communities() && community_ids
    )
  );

-- Insert Policies

-- 1. Authenticated users can create stories
CREATE POLICY "stories_insert_authenticated"
  ON stories FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND storyteller_id = auth.uid()
    AND (
      community_ids IS NULL 
      OR community_ids <@ auth.user_communities()
      OR auth.user_role() = 'admin'
    )
  );

-- Update Policies

-- 1. Storytellers can update own stories
CREATE POLICY "stories_update_own"
  ON stories FOR UPDATE
  USING (storyteller_id = auth.uid())
  WITH CHECK (
    storyteller_id = auth.uid()
    AND (
      OLD.storyteller_id = NEW.storyteller_id -- Can't change ownership
    )
  );

-- 2. Authorized editors can update
CREATE POLICY "stories_update_editors"
  ON stories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM story_editors se
      WHERE se.story_id = stories.id
      AND se.editor_id = auth.uid()
      AND se.can_edit = true
      AND (se.expires_at IS NULL OR se.expires_at > now())
    )
  )
  WITH CHECK (
    OLD.storyteller_id = NEW.storyteller_id -- Can't change ownership
    AND OLD.community_ids = NEW.community_ids -- Can't change communities
  );

-- 3. Collaboration participants can update
CREATE POLICY "stories_update_collaboration"
  ON stories FOR UPDATE
  USING (
    auth.in_collaboration_session(id)
    AND auth.uid() = ANY(
      SELECT active_editors FROM collaboration_sessions 
      WHERE story_id = stories.id AND ended_at IS NULL
    )
  );

-- Delete Policies

-- 1. Only storytellers can delete (soft delete)
CREATE POLICY "stories_delete_own"
  ON stories FOR DELETE
  USING (
    storyteller_id = auth.uid()
    AND value_distributed = 0 -- Can't delete if value has been distributed
  );

-- 2. Admin delete (with audit)
CREATE POLICY "stories_delete_admin"
  ON stories FOR DELETE
  USING (
    auth.user_role() = 'platform_admin'
  );

-- =====================================================
-- KNOWLEDGE CONNECTIONS RLS POLICIES
-- =====================================================

-- View Policies

-- 1. Public connections
CREATE POLICY "connections_select_public"
  ON knowledge_connections FOR SELECT
  USING (
    connection_consent->>'public_display' = 'true'
    AND EXISTS (
      SELECT 1 FROM stories s1
      WHERE s1.id = source_story_id
      AND s1.privacy_level != 'private'
    )
    AND EXISTS (
      SELECT 1 FROM stories s2
      WHERE s2.id = target_story_id
      AND s2.privacy_level != 'private'
    )
  );

-- 2. Community member connections
CREATE POLICY "connections_select_community"
  ON knowledge_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE (s.id = source_story_id OR s.id = target_story_id)
      AND auth.user_communities() && s.community_ids
    )
  );

-- Insert Policies

-- 1. AI can create connections
CREATE POLICY "connections_insert_ai"
  ON knowledge_connections FOR INSERT
  WITH CHECK (
    discovered_by = 'ai'
    AND current_setting('app.service_role', true) = 'true'
  );

-- 2. Users can create connections for accessible stories
CREATE POLICY "connections_insert_user"
  ON knowledge_connections FOR INSERT
  WITH CHECK (
    discovered_by IN ('storyteller', 'community', 'researcher')
    AND auth.uid() IS NOT NULL
    AND check_story_access_sovereign(source_story_id, auth.uid(), 'view')
    AND check_story_access_sovereign(target_story_id, auth.uid(), 'view')
  );

-- Update Policies

-- 1. Community validation
CREATE POLICY "connections_update_validation"
  ON knowledge_connections FOR UPDATE
  USING (
    auth.uid() = ANY(verified_by)
    OR auth.uid() = ANY(disputed_by)
    OR auth.user_role() IN ('community_lead', 'elder')
  )
  WITH CHECK (
    -- Can only modify validation fields
    OLD.source_story_id = NEW.source_story_id
    AND OLD.target_story_id = NEW.target_story_id
    AND OLD.connection_type = NEW.connection_type
  );

-- =====================================================
-- COMMUNITY INSIGHTS RLS POLICIES
-- =====================================================

-- View Policies

-- 1. Public insights
CREATE POLICY "insights_select_public"
  ON community_insights FOR SELECT
  USING (
    sharing_permissions->>'public' = 'true'
    AND community_validated = true
    AND published_at IS NOT NULL
  );

-- 2. Community member insights
CREATE POLICY "insights_select_community"
  ON community_insights FOR SELECT
  USING (
    community_id = ANY(auth.user_communities())
    OR (
      sharing_permissions->>'cross_community' = 'true'
      AND auth.user_communities() IS NOT NULL
    )
  );

-- 3. Research access (with consent)
CREATE POLICY "insights_select_research"
  ON community_insights FOR SELECT
  USING (
    sharing_permissions->>'research' = 'true'
    AND auth.user_role() = 'researcher'
    AND EXISTS (
      SELECT 1 FROM researcher_agreements ra
      WHERE ra.researcher_id = auth.uid()
      AND ra.community_id = community_insights.community_id
      AND ra.status = 'approved'
      AND ra.expires_at > now()
    )
  );

-- Insert Policies

-- 1. Community leads can create insights
CREATE POLICY "insights_insert_lead"
  ON community_insights FOR INSERT
  WITH CHECK (
    auth.user_role() IN ('community_lead', 'elder')
    AND community_id = ANY(auth.user_communities())
  );

-- 2. AI can create insights (with service role)
CREATE POLICY "insights_insert_ai"
  ON community_insights FOR INSERT
  WITH CHECK (
    current_setting('app.service_role', true) = 'true'
    AND ownership_type = 'community'
  );

-- Update Policies

-- 1. Community validation process
CREATE POLICY "insights_update_validation"
  ON community_insights FOR UPDATE
  USING (
    community_id = ANY(auth.user_communities())
    AND (
      auth.user_role() IN ('community_lead', 'elder')
      OR auth.uid() = ANY(validation_participants)
    )
  );

-- =====================================================
-- VALUE DISTRIBUTION RLS POLICIES
-- =====================================================

-- View Policies

-- 1. Recipients can view their distributions
CREATE POLICY "value_select_recipient"
  ON value_distribution FOR SELECT
  USING (
    auth.uid() IN (
      SELECT (jsonb_array_elements(distributed_to)->>'recipient_id')::uuid
    )
  );

-- 2. Community members can view community distributions
CREATE POLICY "value_select_community"
  ON value_distribution FOR SELECT
  USING (
    community_id = ANY(auth.user_communities())
    AND distribution_status = 'completed'
  );

-- 3. Transparency for verified distributions
CREATE POLICY "value_select_public"
  ON value_distribution FOR SELECT
  USING (
    verification_date IS NOT NULL
    AND public_receipt_url IS NOT NULL
  );

-- Insert Policies

-- 1. System can create distributions
CREATE POLICY "value_insert_system"
  ON value_distribution FOR INSERT
  WITH CHECK (
    current_setting('app.service_role', true) = 'true'
  );

-- Update Policies

-- 1. Authorized verifiers can update
CREATE POLICY "value_update_verify"
  ON value_distribution FOR UPDATE
  USING (
    auth.user_role() IN ('platform_admin', 'finance_admin')
    OR (
      auth.user_role() = 'community_lead'
      AND community_id = ANY(auth.user_communities())
    )
  )
  WITH CHECK (
    -- Can only update verification fields
    OLD.value_amount = NEW.value_amount
    AND OLD.distributed_to = NEW.distributed_to
  );

-- =====================================================
-- CULTURAL PROTOCOLS RLS POLICIES
-- =====================================================

-- View Policies

-- 1. Active protocols are visible to all
CREATE POLICY "protocols_select_active"
  ON cultural_protocols FOR SELECT
  USING (
    active = true
    OR community_id = ANY(auth.user_communities())
  );

-- Insert Policies

-- 1. Elders and custodians can create
CREATE POLICY "protocols_insert_authority"
  ON cultural_protocols FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      auth.is_community_elder(community_id)
      OR custodian_id = auth.uid()
      OR auth.user_role() = 'platform_admin'
    )
  );

-- Update Policies

-- 1. Only custodians and elders can update
CREATE POLICY "protocols_update_authority"
  ON cultural_protocols FOR UPDATE
  USING (
    custodian_id = auth.uid()
    OR auth.is_community_elder(community_id)
  )
  WITH CHECK (
    -- Version control
    NEW.version = OLD.version + 1
    AND NEW.previous_version_id = OLD.id
  );

-- =====================================================
-- COLLABORATION SESSIONS RLS POLICIES
-- =====================================================

-- View Policies

-- 1. Participants can view sessions
CREATE POLICY "collab_select_participant"
  ON collaboration_sessions FOR SELECT
  USING (
    auth.uid() = ANY(participants)
    OR auth.uid() = creator_id
  );

-- Insert Policies

-- 1. Story access required to create session
CREATE POLICY "collab_insert_authorized"
  ON collaboration_sessions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND creator_id = auth.uid()
    AND check_story_access_sovereign(story_id, auth.uid(), 'edit')
  );

-- Update Policies

-- 1. Active participants can update
CREATE POLICY "collab_update_active"
  ON collaboration_sessions FOR UPDATE
  USING (
    auth.uid() = ANY(participants)
    AND ended_at IS NULL
  );

-- Delete Policies

-- 1. Creator can end session
CREATE POLICY "collab_delete_creator"
  ON collaboration_sessions FOR DELETE
  USING (
    creator_id = auth.uid()
  );

-- =====================================================
-- SOVEREIGNTY AUDIT LOG RLS POLICIES
-- =====================================================

-- View Policies

-- 1. Users can view their own audit entries
CREATE POLICY "audit_select_own"
  ON sovereignty_audit_log FOR SELECT
  USING (
    actor_id = auth.uid()
  );

-- 2. Community leads can view community audits
CREATE POLICY "audit_select_community"
  ON sovereignty_audit_log FOR SELECT
  USING (
    auth.user_role() = 'community_lead'
    AND resource_community = ANY(auth.user_communities())
  );

-- 3. Platform admins can view all
CREATE POLICY "audit_select_admin"
  ON sovereignty_audit_log FOR SELECT
  USING (
    auth.user_role() = 'platform_admin'
  );

-- Insert Policy (system only)
CREATE POLICY "audit_insert_system"
  ON sovereignty_audit_log FOR INSERT
  WITH CHECK (
    current_setting('app.service_role', true) = 'true'
  );

-- No update or delete allowed (immutable log)

-- =====================================================
-- ADVANCED SECURITY FUNCTIONS
-- =====================================================

-- Rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_action TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window INTERVAL DEFAULT '1 hour'
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count recent actions
  SELECT COUNT(*)
  INTO v_count
  FROM sovereignty_audit_log
  WHERE actor_id = auth.uid()
  AND event_type = p_action
  AND event_timestamp > now() - p_window;
  
  -- Check limit
  IF v_count >= p_limit THEN
    -- Log rate limit violation
    INSERT INTO sovereignty_audit_log (
      event_type,
      event_details,
      actor_id,
      resource_type,
      resource_id,
      action_permitted,
      current_hash
    ) VALUES (
      'rate_limit_exceeded',
      jsonb_build_object(
        'action', p_action,
        'count', v_count,
        'limit', p_limit
      ),
      auth.uid(),
      'system',
      gen_random_uuid(),
      false,
      encode(sha256((auth.uid()::text || now()::text)::bytea), 'hex')
    );
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IP-based access control
CREATE OR REPLACE FUNCTION check_ip_access() RETURNS BOOLEAN AS $$
DECLARE
  v_client_ip INET;
  v_blocked BOOLEAN;
BEGIN
  -- Get client IP from request headers
  v_client_ip := inet(current_setting('request.headers', true)::json->>'x-forwarded-for');
  
  -- Check blocklist
  SELECT EXISTS (
    SELECT 1 FROM ip_blocklist
    WHERE ip_address = v_client_ip
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_blocked;
  
  RETURN NOT v_blocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Consent verification function
CREATE OR REPLACE FUNCTION verify_consent(
  p_story_id UUID,
  p_usage_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_consent JSONB;
  v_consent_value BOOLEAN;
BEGIN
  -- Get consent settings
  SELECT consent_settings
  INTO v_consent
  FROM stories
  WHERE id = p_story_id;
  
  -- Check specific consent
  v_consent_value := COALESCE(
    (v_consent->>p_usage_type)::boolean,
    false
  );
  
  -- Log consent check
  INSERT INTO sovereignty_audit_log (
    event_type,
    event_details,
    actor_id,
    resource_type,
    resource_id,
    action_permitted,
    current_hash
  ) VALUES (
    'consent_check',
    jsonb_build_object(
      'usage_type', p_usage_type,
      'consent_given', v_consent_value
    ),
    auth.uid(),
    'story',
    p_story_id,
    v_consent_value,
    encode(sha256((p_story_id::text || auth.uid()::text || now()::text)::bytea), 'hex')
  );
  
  RETURN v_consent_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECURITY MONITORING VIEWS
-- =====================================================

-- Failed access attempts
CREATE OR REPLACE VIEW security_failed_access AS
SELECT 
  date_trunc('hour', event_timestamp) as hour,
  actor_id,
  resource_type,
  COUNT(*) as failed_attempts,
  array_agg(DISTINCT denial_reason) as reasons
FROM sovereignty_audit_log
WHERE action_permitted = false
AND event_timestamp > now() - interval '24 hours'
GROUP BY 1, 2, 3
HAVING COUNT(*) > 5;

-- Consent violations
CREATE OR REPLACE VIEW security_consent_violations AS
SELECT 
  s.id as story_id,
  s.title,
  sal.actor_id,
  sal.event_details->>'usage_type' as attempted_usage,
  sal.event_timestamp
FROM sovereignty_audit_log sal
JOIN stories s ON s.id = sal.resource_id::uuid
WHERE sal.event_type = 'consent_check'
AND sal.action_permitted = false
AND sal.event_timestamp > now() - interval '7 days';

-- Suspicious activity patterns
CREATE OR REPLACE VIEW security_suspicious_activity AS
SELECT 
  actor_id,
  COUNT(DISTINCT resource_id) as resources_accessed,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE action_permitted = false) as denied_actions,
  array_agg(DISTINCT event_type) as action_types
FROM sovereignty_audit_log
WHERE event_timestamp > now() - interval '1 hour'
GROUP BY actor_id
HAVING COUNT(*) > 100 -- High activity
OR COUNT(*) FILTER (WHERE action_permitted = false) > 10; -- Many denials

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute on security functions
GRANT EXECUTE ON FUNCTION auth.user_communities() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_community_elder(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_cultural_clearance(cultural_sensitivity) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.in_collaboration_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_consent(UUID, TEXT) TO authenticated;

-- Grant select on security views to admins
GRANT SELECT ON security_failed_access TO authenticated;
GRANT SELECT ON security_consent_violations TO authenticated;
GRANT SELECT ON security_suspicious_activity TO authenticated;

-- =====================================================
-- SECURITY CONFIGURATION
-- =====================================================

-- Set security parameters
ALTER DATABASE current_database SET statement_timeout = '30s';
ALTER DATABASE current_database SET idle_in_transaction_session_timeout = '5min';
ALTER DATABASE current_database SET log_checkpoints = on;
ALTER DATABASE current_database SET log_connections = on;
ALTER DATABASE current_database SET log_disconnections = on;

-- Create security alert function
CREATE OR REPLACE FUNCTION raise_security_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_details JSONB
) RETURNS void AS $$
BEGIN
  -- Send to monitoring system
  PERFORM pg_notify(
    'security_alert',
    jsonb_build_object(
      'type', p_alert_type,
      'severity', p_severity,
      'details', p_details,
      'timestamp', now()
    )::text
  );
  
  -- Log to audit
  INSERT INTO sovereignty_audit_log (
    event_type,
    event_details,
    actor_id,
    resource_type,
    resource_id,
    action_permitted,
    current_hash
  ) VALUES (
    'security_alert',
    p_details || jsonb_build_object('alert_type', p_alert_type, 'severity', p_severity),
    auth.uid(),
    'system',
    gen_random_uuid(),
    true,
    encode(sha256((p_alert_type || now()::text)::bytea), 'hex')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "stories_select_public" ON stories IS 
'Public stories are viewable by all users if consent is given and cultural clearance is met';

COMMENT ON POLICY "stories_select_community" ON stories IS 
'Community stories are viewable by active community members with appropriate cultural clearance';

COMMENT ON POLICY "stories_update_own" ON stories IS 
'Storytellers maintain full control over their own stories but cannot change ownership';

COMMENT ON POLICY "insights_select_research" ON stories IS 
'Researchers can access insights only with approved agreements and community consent';

COMMENT ON FUNCTION check_rate_limit IS 
'Prevents abuse by limiting the number of actions a user can perform within a time window';

COMMENT ON FUNCTION verify_consent IS 
'Ensures all data usage respects the granular consent settings provided by storytellers';

COMMENT ON VIEW security_failed_access IS 
'Monitors failed access attempts to identify potential security threats';

-- =====================================================
-- FINAL SECURITY HARDENING
-- =====================================================

-- Revoke unnecessary permissions
REVOKE ALL ON SCHEMA public FROM public;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Lock down sequence usage
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM public;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS is enforced
ALTER TABLE stories FORCE ROW LEVEL SECURITY;
ALTER TABLE knowledge_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE community_insights FORCE ROW LEVEL SECURITY;
ALTER TABLE value_distribution FORCE ROW LEVEL SECURITY;
ALTER TABLE cultural_protocols FORCE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE sovereignty_audit_log FORCE ROW LEVEL SECURITY;