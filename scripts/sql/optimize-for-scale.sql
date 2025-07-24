-- Empathy Ledger Performance Optimization for Scale
-- Run these optimizations as your community grows

-- =====================================================
-- PERFORMANCE INDEXES FOR COMMUNITY QUERIES
-- =====================================================

-- Community-specific story queries (most common pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_community_privacy_date 
ON stories (storyteller_id, privacy_level, submitted_at DESC)
WHERE privacy_level IN ('community', 'public');

-- Story analysis performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_story_analysis_community_validated 
ON story_analysis (story_id, validated_by_community, analyzed_at DESC);

-- Community insights by type and visibility
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_community_type_visibility 
ON community_insights (community_id, insight_type, visibility, generated_at DESC);

-- Value events for community benefit tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_value_events_community_date 
ON value_events (community_id, occurred_at DESC)
WHERE community_id IS NOT NULL;

-- User search and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_community_role_active 
ON users (community_affiliation, role, created_at DESC)
WHERE community_affiliation IS NOT NULL;

-- Story search and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_themes_gin 
ON stories USING GIN (story_themes)
WHERE story_themes IS NOT NULL AND array_length(story_themes, 1) > 0;

-- Cultural protocols filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_cultural_protocols_gin 
ON stories USING GIN (cultural_protocols)
WHERE cultural_protocols != '{}';

-- =====================================================
-- ADVANCED QUERY OPTIMIZATION
-- =====================================================

-- Materialized view for community dashboard (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_community_dashboard AS
SELECT 
  u.community_affiliation as community_id,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT CASE WHEN sa.id IS NOT NULL THEN s.id END) as analyzed_stories,
  COUNT(DISTINCT CASE WHEN s.privacy_level = 'public' THEN s.id END) as public_stories,
  COUNT(DISTINCT s.storyteller_id) as total_storytellers,
  ARRAY_AGG(DISTINCT unnest(s.story_themes)) FILTER (WHERE s.story_themes IS NOT NULL) as recent_themes,
  COALESCE(SUM((ve.event_data->>'value_amount')::NUMERIC), 0) as value_generated,
  MAX(s.submitted_at) as last_activity,
  NOW() as last_updated
FROM users u
LEFT JOIN stories s ON s.storyteller_id = u.id
LEFT JOIN story_analysis sa ON sa.story_id = s.id
LEFT JOIN value_events ve ON ve.story_id = s.id
WHERE u.community_affiliation IS NOT NULL
GROUP BY u.community_affiliation;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_community_dashboard_community 
ON mv_community_dashboard (community_id);

-- Function to refresh community dashboard (call periodically)
CREATE OR REPLACE FUNCTION refresh_community_dashboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_community_dashboard;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTITIONING FOR LARGE SCALE (10K+ stories)
-- =====================================================

-- Create partitioned table for story analysis (when you have 10K+ analyses)
-- Note: Only implement when you reach significant scale
/*
CREATE TABLE story_analysis_partitioned (
  LIKE story_analysis INCLUDING ALL
) PARTITION BY RANGE (analyzed_at);

-- Create partitions by month
CREATE TABLE story_analysis_2024_01 PARTITION OF story_analysis_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
    
-- Add more partitions as needed...
*/

-- =====================================================
-- ARCHIVAL STRATEGY FOR OLD CONTENT
-- =====================================================

-- Function to archive old stories (respecting cultural protocols)
CREATE OR REPLACE FUNCTION archive_old_stories(archive_threshold_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER := 0;
  story_record RECORD;
BEGIN
  -- Only archive stories that are older than threshold and have no cultural restrictions
  FOR story_record IN 
    SELECT id FROM stories 
    WHERE submitted_at < (NOW() - INTERVAL '1 day' * archive_threshold_days)
    AND status = 'published'
    AND (cultural_protocols->>'seasonal_restrictions')::boolean = false
    AND (cultural_protocols->>'ceremonial_content')::boolean = false
    AND privacy_level = 'public'
  LOOP
    -- Update status to archived instead of deleting (sovereignty principle)
    UPDATE stories 
    SET status = 'archived', 
        updated_at = NOW() 
    WHERE id = story_record.id;
    
    archived_count := archived_count + 1;
  END LOOP;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CACHE WARMING FUNCTIONS
-- =====================================================

-- Function to warm commonly accessed community data
CREATE OR REPLACE FUNCTION warm_community_cache(target_community TEXT)
RETURNS void AS $$
BEGIN
  -- Pre-load community insights
  PERFORM * FROM community_insights 
  WHERE community_id = target_community 
  AND visibility IN ('community', 'public')
  ORDER BY generated_at DESC 
  LIMIT 50;
  
  -- Pre-load recent community stories
  PERFORM s.* FROM stories s
  JOIN users u ON s.storyteller_id = u.id
  WHERE u.community_affiliation = target_community
  AND s.privacy_level IN ('community', 'public')
  ORDER BY s.submitted_at DESC 
  LIMIT 100;
  
  -- Pre-load storyteller profiles
  PERFORM * FROM storyteller_profiles
  WHERE community_affiliation = target_community
  ORDER BY contribution_score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MONITORING & ALERTING
-- =====================================================

-- Function to check sovereignty compliance
CREATE OR REPLACE FUNCTION check_sovereignty_compliance()
RETURNS TABLE (
  issue_type TEXT,
  affected_records INTEGER,
  description TEXT
) AS $$
BEGIN
  -- Check for stories without proper consent settings
  RETURN QUERY
  SELECT 
    'missing_consent'::TEXT,
    COUNT(*)::INTEGER,
    'Stories without proper consent settings'::TEXT
  FROM stories 
  WHERE consent_settings = '{}' OR consent_settings IS NULL;
  
  -- Check for users without community affiliation (potential data quality issue)
  RETURN QUERY
  SELECT 
    'missing_community'::TEXT,
    COUNT(*)::INTEGER,
    'Active users without community affiliation'::TEXT
  FROM users 
  WHERE community_affiliation IS NULL 
  AND role = 'storyteller'
  AND created_at > NOW() - INTERVAL '30 days';
  
  -- Check for analysis without cultural consideration
  RETURN QUERY
  SELECT 
    'missing_cultural_analysis'::TEXT,
    COUNT(*)::INTEGER,
    'Story analyses missing cultural considerations'::TEXT
  FROM story_analysis sa
  JOIN stories s ON sa.story_id = s.id
  WHERE (sa.analysis_data->'cultural_considerations') IS NULL
  OR (sa.analysis_data->'cultural_considerations') = '{}'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance metrics
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_unit TEXT
) AS $$
BEGIN
  -- Average query time for story fetching
  RETURN QUERY
  SELECT 
    'stories_per_second'::TEXT,
    (COUNT(*) / EXTRACT(EPOCH FROM (MAX(submitted_at) - MIN(submitted_at))))::NUMERIC,
    'stories/second'::TEXT
  FROM stories 
  WHERE submitted_at > NOW() - INTERVAL '24 hours';
  
  -- Community engagement rate
  RETURN QUERY
  SELECT 
    'community_engagement_rate'::TEXT,
    (COUNT(DISTINCT s.storyteller_id)::NUMERIC / COUNT(DISTINCT u.id) * 100),
    'percentage'::TEXT
  FROM users u
  LEFT JOIN stories s ON u.id = s.storyteller_id AND s.submitted_at > NOW() - INTERVAL '30 days'
  WHERE u.role = 'storyteller';
  
  -- Average stories per community
  RETURN QUERY
  SELECT 
    'avg_stories_per_community'::TEXT,
    AVG(story_count)::NUMERIC,
    'stories'::TEXT
  FROM (
    SELECT u.community_affiliation, COUNT(s.id) as story_count
    FROM users u
    LEFT JOIN stories s ON u.id = s.storyteller_id
    WHERE u.community_affiliation IS NOT NULL
    GROUP BY u.community_affiliation
  ) community_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATED MAINTENANCE JOBS
-- =====================================================

-- Create a maintenance log table
CREATE TABLE IF NOT EXISTS maintenance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  records_affected INTEGER,
  status TEXT DEFAULT 'success',
  notes TEXT
);

-- Function to log maintenance activities
CREATE OR REPLACE FUNCTION log_maintenance(
  job_name TEXT,
  duration_ms INTEGER,
  records_affected INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  notes TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO maintenance_log (job_name, duration_ms, records_affected, status, notes)
  VALUES (job_name, duration_ms, records_affected, status, notes);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCALING CONFIGURATION RECOMMENDATIONS
-- =====================================================

-- Set optimal Postgres configuration for community platform
-- Note: These should be set in your Supabase dashboard or via SQL

-- Increase work_mem for complex community queries
-- SET work_mem = '256MB';  -- Adjust based on your plan

-- Optimize for read-heavy workload
-- SET random_page_cost = 1.1;  -- SSD optimization

-- Enable query plan caching
-- SET shared_preload_libraries = 'pg_stat_statements';

-- =====================================================
-- SUCCESS MESSAGE AND NEXT STEPS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Empathy Ledger scaling optimizations deployed!';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS FOR SCALE:';
  RAISE NOTICE '1. Set up automated refresh of mv_community_dashboard (hourly)';
  RAISE NOTICE '2. Schedule sovereignty compliance checks (daily)';
  RAISE NOTICE '3. Monitor performance metrics (real-time)';
  RAISE NOTICE '4. Configure archival process (monthly)';
  RAISE NOTICE '5. Set up alerts for sovereignty violations';
  RAISE NOTICE '';
  RAISE NOTICE 'Your platform is optimized for community sovereignty at scale!';
END $$;