-- =====================================================================
-- EMPATHY LEDGER ORGANIZATION INSIGHTS SCHEMA
-- Tables for storing analytics, insights, and value tracking
-- =====================================================================

-- Organization Insights Table
CREATE TABLE organization_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  insights_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID REFERENCES profiles(id),
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'superseded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for organization insights
CREATE INDEX idx_org_insights_org_id ON organization_insights(organization_id);
CREATE INDEX idx_org_insights_period ON organization_insights(period_start, period_end);
CREATE INDEX idx_org_insights_generated ON organization_insights(generated_at);

-- Value Tracking Table
CREATE TABLE value_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  story_id UUID REFERENCES stories(id),
  contributor_id UUID REFERENCES profiles(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'research_compensation',
    'policy_influence', 
    'media_licensing',
    'consulting_insights',
    'platform_fee'
  )),
  amount_cents BIGINT NOT NULL, -- Store in cents to avoid decimal issues
  currency TEXT NOT NULL DEFAULT 'AUD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
  )),
  source_reference TEXT, -- External transaction ID
  distribution_percentage DECIMAL(5,2) DEFAULT 70.0, -- % that goes to storyteller
  platform_fee_percentage DECIMAL(5,2) DEFAULT 15.0,
  organization_fee_percentage DECIMAL(5,2) DEFAULT 15.0,
  metadata JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for value transactions
CREATE INDEX idx_value_trans_org_id ON value_transactions(organization_id);
CREATE INDEX idx_value_trans_story_id ON value_transactions(story_id);
CREATE INDEX idx_value_trans_contributor ON value_transactions(contributor_id);
CREATE INDEX idx_value_trans_type ON value_transactions(transaction_type);
CREATE INDEX idx_value_trans_status ON value_transactions(status);
CREATE INDEX idx_value_trans_date ON value_transactions(created_at);

-- Policy Impact Tracking Table
CREATE TABLE policy_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  policy_name TEXT NOT NULL,
  policy_description TEXT,
  government_level TEXT CHECK (government_level IN ('federal', 'state', 'local', 'international')),
  status TEXT NOT NULL CHECK (status IN (
    'proposed',
    'under_review',
    'implemented',
    'rejected',
    'modified'
  )),
  stories_cited INTEGER DEFAULT 0,
  influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
  outcome_description TEXT,
  monetary_impact_cents BIGINT, -- Economic impact in cents
  social_impact_score DECIMAL(3,2), -- 0-1 scale
  implementation_date DATE,
  documentation_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for policy impacts
CREATE INDEX idx_policy_impacts_org_id ON policy_impacts(organization_id);
CREATE INDEX idx_policy_impacts_status ON policy_impacts(status);
CREATE INDEX idx_policy_impacts_level ON policy_impacts(influence_level);
CREATE INDEX idx_policy_impacts_date ON policy_impacts(implementation_date);

-- Story Policy Connections Table (Many-to-Many)
CREATE TABLE story_policy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  policy_impact_id UUID REFERENCES policy_impacts(id) ON DELETE CASCADE,
  connection_type TEXT CHECK (connection_type IN ('direct_citation', 'thematic_influence', 'supporting_evidence')),
  citation_details TEXT,
  influence_weight DECIMAL(3,2) DEFAULT 1.0, -- How much this story influenced this policy
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for story policy connections
CREATE INDEX idx_story_policy_story_id ON story_policy_connections(story_id);
CREATE INDEX idx_story_policy_policy_id ON story_policy_connections(policy_impact_id);

-- Research Partnerships Table
CREATE TABLE research_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  researcher_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  research_title TEXT NOT NULL,
  research_description TEXT,
  ethics_approval_reference TEXT,
  data_usage_terms TEXT NOT NULL,
  compensation_model TEXT CHECK (compensation_model IN ('fixed_fee', 'per_story', 'percentage_based', 'in_kind')),
  total_compensation_cents BIGINT,
  stories_included INTEGER DEFAULT 0,
  anonymization_level TEXT CHECK (anonymization_level IN ('none', 'basic', 'advanced', 'complete')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN (
    'proposed',
    'approved',
    'active',
    'completed',
    'terminated'
  )),
  start_date DATE,
  end_date DATE,
  publications_expected INTEGER DEFAULT 0,
  publications_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for research partnerships
CREATE INDEX idx_research_partnerships_org_id ON research_partnerships(organization_id);
CREATE INDEX idx_research_partnerships_status ON research_partnerships(status);
CREATE INDEX idx_research_partnerships_dates ON research_partnerships(start_date, end_date);

-- Story Research Connections Table (Many-to-Many)
CREATE TABLE story_research_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  research_partnership_id UUID REFERENCES research_partnerships(id) ON DELETE CASCADE,
  inclusion_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  compensation_cents BIGINT,
  anonymization_applied TEXT NOT NULL,
  contributor_consent_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for story research connections
CREATE INDEX idx_story_research_story_id ON story_research_connections(story_id);
CREATE INDEX idx_story_research_partnership_id ON story_research_connections(research_partnership_id);

-- Analytics Cache Table for Performance
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  organization_id UUID,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics cache
CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_org_id ON analytics_cache(organization_id);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================

-- Enable RLS on all organization tables
ALTER TABLE organization_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_policy_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_research_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Organization Insights Policies
CREATE POLICY "Organization admins can view insights" ON organization_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

CREATE POLICY "Organization admins can insert insights" ON organization_insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

-- Value Transactions Policies
CREATE POLICY "Users can view their own transactions" ON value_transactions
  FOR SELECT USING (auth.uid() = contributor_id);

CREATE POLICY "Organization admins can view org transactions" ON value_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

CREATE POLICY "Platform can insert transactions" ON value_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'platform_admin'
    )
  );

-- Policy Impacts Policies
CREATE POLICY "Organization admins can manage policy impacts" ON policy_impacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

-- Research Partnerships Policies
CREATE POLICY "Organization admins can manage research partnerships" ON research_partnerships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

-- Story connections follow the same pattern
CREATE POLICY "Admins can manage story policy connections" ON story_policy_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

CREATE POLICY "Admins can manage story research connections" ON story_research_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

-- Analytics Cache Policies
CREATE POLICY "Users can view relevant cache" ON analytics_cache
  FOR SELECT USING (true); -- Cache is generally accessible for performance

CREATE POLICY "Admins can manage cache" ON analytics_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'platform_admin' OR role = 'organization_admin')
    )
  );

-- =====================================================================
-- ORGANIZATION UTILITY FUNCTIONS
-- =====================================================================

-- Function to calculate organization value metrics
CREATE OR REPLACE FUNCTION calculate_org_value_metrics(p_org_id UUID, p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_value BIGINT := 0;
  distributed_value BIGINT := 0;
  transaction_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Calculate totals from value_transactions
  SELECT 
    COALESCE(SUM(amount_cents), 0),
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount_cents * distribution_percentage / 100 ELSE 0 END), 0),
    COUNT(*)
  INTO total_value, distributed_value, transaction_count
  FROM value_transactions
  WHERE organization_id = p_org_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date;

  result := jsonb_build_object(
    'total_value_cents', total_value,
    'distributed_value_cents', distributed_value,
    'transaction_count', transaction_count,
    'average_per_transaction', CASE WHEN transaction_count > 0 THEN total_value / transaction_count ELSE 0 END
  );

  RETURN result;
END;
$$;

-- Function to update story impact scores based on policy influence
CREATE OR REPLACE FUNCTION update_story_impact_scores()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update impact scores for stories based on policy connections
  UPDATE stories SET
    impact_score = COALESCE((
      SELECT AVG(pi.social_impact_score * spc.influence_weight)
      FROM story_policy_connections spc
      JOIN policy_impacts pi ON pi.id = spc.policy_impact_id
      WHERE spc.story_id = stories.id
    ), 0),
    policy_influence_score = COALESCE((
      SELECT COUNT(*)
      FROM story_policy_connections spc
      JOIN policy_impacts pi ON pi.id = spc.policy_impact_id
      WHERE spc.story_id = stories.id
        AND pi.status IN ('implemented', 'modified')
    ), 0)
  WHERE EXISTS (
    SELECT 1 FROM story_policy_connections
    WHERE story_id = stories.id
  );
END;
$$;

-- Function to cache analytics data
CREATE OR REPLACE FUNCTION cache_analytics_data(
  p_cache_key TEXT,
  p_org_id UUID,
  p_data JSONB,
  p_ttl_hours INTEGER DEFAULT 24
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics_cache (cache_key, organization_id, data, expires_at)
  VALUES (p_cache_key, p_org_id, p_data, NOW() + (p_ttl_hours || ' hours')::INTERVAL)
  ON CONFLICT (cache_key) 
  DO UPDATE SET 
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW();
END;
$$;

-- Function to get cached analytics data
CREATE OR REPLACE FUNCTION get_cached_analytics(p_cache_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cached_data JSONB;
BEGIN
  SELECT data INTO cached_data
  FROM analytics_cache
  WHERE cache_key = p_cache_key
    AND expires_at > NOW();
    
  RETURN cached_data;
END;
$$;

-- =====================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================================

-- Function to update story counts when policy connections change
CREATE OR REPLACE FUNCTION trigger_update_policy_story_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE policy_impacts 
    SET stories_cited = stories_cited + 1
    WHERE id = NEW.policy_impact_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE policy_impacts 
    SET stories_cited = stories_cited - 1
    WHERE id = OLD.policy_impact_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for policy story count updates
CREATE TRIGGER trigger_policy_story_counts
  AFTER INSERT OR DELETE ON story_policy_connections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_policy_story_counts();

-- Function to update research story counts
CREATE OR REPLACE FUNCTION trigger_update_research_story_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE research_partnerships 
    SET stories_included = stories_included + 1
    WHERE id = NEW.research_partnership_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE research_partnerships 
    SET stories_included = stories_included - 1
    WHERE id = OLD.research_partnership_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for research story count updates
CREATE TRIGGER trigger_research_story_counts
  AFTER INSERT OR DELETE ON story_research_connections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_research_story_counts();

-- Grant necessary permissions
GRANT SELECT, INSERT ON organization_insights TO authenticated;
GRANT SELECT ON value_transactions TO authenticated;
GRANT ALL ON policy_impacts TO authenticated;
GRANT ALL ON story_policy_connections TO authenticated;
GRANT ALL ON research_partnerships TO authenticated;
GRANT ALL ON story_research_connections TO authenticated;
GRANT ALL ON analytics_cache TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION calculate_org_value_metrics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION update_story_impact_scores() TO authenticated;
GRANT EXECUTE ON FUNCTION cache_analytics_data(TEXT, UUID, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cached_analytics(TEXT) TO authenticated;