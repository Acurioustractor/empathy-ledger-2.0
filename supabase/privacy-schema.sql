-- =====================================================================
-- EMPATHY LEDGER PRIVACY & COMPLIANCE SCHEMA
-- Tables for consent management, audit logging, and GDPR compliance
-- =====================================================================

-- Consent Records Table
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'data_collection',
    'ai_analysis', 
    'research_participation',
    'marketing',
    'sharing'
  )),
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent_version TEXT NOT NULL DEFAULT '1.0.0',
  withdrawal_date TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for consent records
CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX idx_consent_records_date ON consent_records(consent_date);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Data Export Requests Table
CREATE TABLE data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing', 
    'completed',
    'failed'
  )),
  export_format TEXT NOT NULL DEFAULT 'json',
  file_url TEXT,
  file_size_bytes BIGINT,
  expires_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Indexes for data export requests
CREATE INDEX idx_data_export_user_id ON data_export_requests(user_id);
CREATE INDEX idx_data_export_status ON data_export_requests(status);

-- Deletion Requests Table
CREATE TABLE deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'cancelled'
  )),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  retention_period_days INTEGER DEFAULT 30,
  metadata JSONB
);

-- Indexes for deletion requests
CREATE INDEX idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX idx_deletion_requests_scheduled ON deletion_requests(scheduled_for);

-- Privacy Violations Table (for tracking and monitoring)
CREATE TABLE privacy_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  detected_by TEXT, -- 'system' or 'user_report' or user_id
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'investigating',
    'resolved',
    'dismissed'
  )),
  resolution_notes TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB
);

-- Indexes for privacy violations
CREATE INDEX idx_privacy_violations_user_id ON privacy_violations(user_id);
CREATE INDEX idx_privacy_violations_type ON privacy_violations(violation_type);
CREATE INDEX idx_privacy_violations_severity ON privacy_violations(severity);
CREATE INDEX idx_privacy_violations_status ON privacy_violations(status);

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================

-- Enable RLS on all privacy tables
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_violations ENABLE ROW LEVEL SECURITY;

-- Consent Records Policies
CREATE POLICY "Users can view their own consent records" ON consent_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent records" ON consent_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent records" ON consent_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'platform_admin'
    )
  );

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'platform_admin'
    )
  );

-- Data Export Requests Policies
CREATE POLICY "Users can manage their own export requests" ON data_export_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all export requests" ON data_export_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'platform_admin'
    )
  );

-- Deletion Requests Policies
CREATE POLICY "Users can manage their own deletion requests" ON deletion_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all deletion requests" ON deletion_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'platform_admin'
    )
  );

-- Privacy Violations Policies
CREATE POLICY "Users can view violations about them" ON privacy_violations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can report violations" ON privacy_violations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all violations" ON privacy_violations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'platform_admin'
    )
  );

-- =====================================================================
-- PRIVACY UTILITY FUNCTIONS
-- =====================================================================

-- Function to check latest consent for a user and type
CREATE OR REPLACE FUNCTION get_latest_consent(p_user_id UUID, p_consent_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  latest_consent BOOLEAN;
BEGIN
  SELECT consent_given INTO latest_consent
  FROM consent_records
  WHERE user_id = p_user_id 
    AND consent_type = p_consent_type
    AND withdrawal_date IS NULL
  ORDER BY consent_date DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_consent, false);
END;
$$;

-- Function to log privacy actions
CREATE OR REPLACE FUNCTION log_privacy_action(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profile to anonymized state
  UPDATE profiles SET
    email = 'anonymized_' || p_user_id || '@empathyledger.local',
    full_name = 'Anonymous User',
    display_name = 'Anonymous',
    bio = NULL,
    avatar_url = NULL,
    location_general = NULL,
    languages_spoken = NULL,
    is_active = false,
    anonymized_at = NOW(),
    anonymization_reason = COALESCE(p_reason, 'User requested')
  WHERE id = p_user_id;
  
  -- Anonymize stories (keep content for community value)
  UPDATE stories SET
    contributor_age_range = NULL,
    contributor_location = NULL,
    contributor_background = NULL,
    anonymized_at = NOW()
  WHERE contributor_id = p_user_id;
  
  -- Delete personal interactions
  DELETE FROM story_reactions WHERE user_id = p_user_id;
  DELETE FROM story_comments WHERE user_id = p_user_id;
  
  -- Log the anonymization
  PERFORM log_privacy_action(
    p_user_id,
    'user_anonymized',
    'profile',
    p_user_id,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN true;
END;
$$;

-- =====================================================================
-- UPDATE EXISTING TABLES FOR PRIVACY
-- =====================================================================

-- Add privacy-related columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymization_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Add privacy-related columns to stories table  
ALTER TABLE stories ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- =====================================================================
-- TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- =====================================================================

-- Function to automatically log profile changes
CREATE OR REPLACE FUNCTION trigger_log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log privacy settings changes
    IF OLD.privacy_settings IS DISTINCT FROM NEW.privacy_settings THEN
      PERFORM log_privacy_action(
        NEW.id,
        'privacy_settings_updated',
        'profile',
        NEW.id,
        jsonb_build_object(
          'old_settings', OLD.privacy_settings,
          'new_settings', NEW.privacy_settings
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS trigger_profile_privacy_changes ON profiles;
CREATE TRIGGER trigger_profile_privacy_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_profile_changes();

-- Grant necessary permissions
GRANT SELECT, INSERT ON consent_records TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT ALL ON data_export_requests TO authenticated;
GRANT ALL ON deletion_requests TO authenticated;
GRANT SELECT, INSERT ON privacy_violations TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION get_latest_consent(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_privacy_action(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION anonymize_user_data(UUID, TEXT) TO authenticated;