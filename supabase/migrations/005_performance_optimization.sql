-- Performance Optimization Migration
-- Enhancing indexing strategy and query performance

-- =====================================================
-- ADVANCED INDEXING FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_storyteller_privacy_status 
ON stories(storyteller_id, privacy_level, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_location_submitted 
ON stories(location, submitted_at DESC) WHERE privacy_level IN ('community', 'public');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_themes_gin 
ON stories USING gin(story_themes) WHERE privacy_level IN ('community', 'public');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_tags_gin 
ON stories USING gin(tags) WHERE privacy_level IN ('community', 'public');

-- Geographic region performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_geographic_region 
ON stories(geographic_region, submitted_at DESC);

-- User community queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_community_role 
ON users(community_affiliation, role);

-- Story analysis performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_story_analysis_cultural_status 
ON story_analysis(cultural_review_status, analyzed_at DESC);

-- =====================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- =====================================================

-- Community story summary (refreshed hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS community_story_summary AS
SELECT 
  u.community_affiliation,
  COUNT(s.id) as total_stories,
  COUNT(CASE WHEN s.privacy_level = 'public' THEN 1 END) as public_stories,
  COUNT(CASE WHEN s.privacy_level = 'community' THEN 1 END) as community_stories,
  COUNT(CASE WHEN s.status = 'published' THEN 1 END) as published_stories,
  COUNT(DISTINCT s.storyteller_id) as unique_storytellers,
  array_agg(DISTINCT unnest(s.story_themes)) FILTER (WHERE s.story_themes IS NOT NULL) as common_themes,
  MAX(s.submitted_at) as latest_story_date,
  MIN(s.submitted_at) as first_story_date
FROM users u
LEFT JOIN stories s ON u.id = s.storyteller_id
WHERE u.community_affiliation IS NOT NULL
GROUP BY u.community_affiliation;

-- Index for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_story_summary_community 
ON community_story_summary(community_affiliation);

-- Recent story activity view (refreshed every 15 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS recent_story_activity AS
SELECT 
  s.id,
  s.title,
  s.storyteller_id,
  u.full_name as storyteller_name,
  u.community_affiliation,
  s.submission_method,
  s.privacy_level,
  s.status,
  s.story_themes,
  s.location,
  s.geographic_region,
  s.submitted_at,
  sa.validated_by_community,
  sa.cultural_review_status
FROM stories s
JOIN users u ON s.storyteller_id = u.id
LEFT JOIN story_analysis sa ON s.id = sa.story_id
WHERE s.submitted_at >= NOW() - INTERVAL '30 days'
  AND s.privacy_level IN ('community', 'public')
ORDER BY s.submitted_at DESC;

-- Index for recent activity
CREATE INDEX IF NOT EXISTS idx_recent_story_activity_submitted 
ON recent_story_activity(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_recent_story_activity_community 
ON recent_story_activity(community_affiliation, submitted_at DESC);

-- =====================================================
-- QUERY PERFORMANCE FUNCTIONS
-- =====================================================

-- Function to refresh materialized views (called by cron job)
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY community_story_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY recent_story_activity;
END;
$$;

-- Function to get community insights with performance optimization
CREATE OR REPLACE FUNCTION get_community_insights(
  target_community TEXT,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_stories BIGINT,
  active_storytellers BIGINT,
  common_themes TEXT[],
  story_locations TEXT[],
  recent_activity_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(s.id)::BIGINT as total_stories,
    COUNT(DISTINCT s.storyteller_id)::BIGINT as active_storytellers,
    array_agg(DISTINCT unnest(s.story_themes)) FILTER (WHERE s.story_themes IS NOT NULL) as common_themes,
    array_agg(DISTINCT s.location) FILTER (WHERE s.location IS NOT NULL) as story_locations,
    COUNT(CASE WHEN s.submitted_at >= NOW() - INTERVAL '1 day' * days_back THEN 1 END)::BIGINT as recent_activity_count
  FROM stories s
  JOIN users u ON s.storyteller_id = u.id
  WHERE u.community_affiliation = target_community
    AND s.privacy_level IN ('community', 'public');
END;
$$;

-- =====================================================
-- CONNECTION POOLING OPTIMIZATION
-- =====================================================

-- Set recommended PostgreSQL settings for Supabase
-- These are applied as database-level configurations

-- Optimize for concurrent connections
-- (These would be set via Supabase dashboard or CLI)
-- max_connections = 100
-- shared_buffers = 256MB
-- effective_cache_size = 1GB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100

-- Enable query plan caching
-- plan_cache_mode = auto

-- =====================================================
-- ROW LEVEL SECURITY PERFORMANCE
-- =====================================================

-- Optimize RLS policies for performance
-- Create index to support privacy-based RLS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stories_rls_performance 
ON stories(storyteller_id, privacy_level) 
WHERE privacy_level IN ('private', 'community');

-- =====================================================
-- MONITORING AND MAINTENANCE
-- =====================================================

-- Function to analyze table performance
CREATE OR REPLACE FUNCTION analyze_table_performance()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  table_size TEXT,
  index_size TEXT,
  total_size TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    t.n_tup_ins - t.n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(t.schemaname||'.'||t.tablename)) as index_size,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename) + pg_indexes_size(t.schemaname||'.'||t.tablename)) as total_size
  FROM pg_stat_user_tables t
  WHERE t.schemaname = 'public'
  ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;
END;
$$;

-- =====================================================
-- CLEANUP AND ARCHIVAL
-- =====================================================

-- Function to archive old story analysis
CREATE OR REPLACE FUNCTION archive_old_analysis(days_old INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Move old analysis to archive table (to be created separately)
  -- This is a placeholder for future archival strategy
  
  -- For now, just return count of records that would be archived
  SELECT COUNT(*)::INTEGER INTO archived_count
  FROM story_analysis
  WHERE analyzed_at < NOW() - INTERVAL '1 day' * days_old
    AND cultural_review_status = 'approved';
    
  RETURN archived_count;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION refresh_analytics_views() TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_insights(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_table_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION archive_old_analysis(INTEGER) TO authenticated;

-- Grant read access to materialized views
GRANT SELECT ON community_story_summary TO authenticated;
GRANT SELECT ON recent_story_activity TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON MATERIALIZED VIEW community_story_summary IS 'Aggregated community statistics refreshed hourly via cron job';
COMMENT ON MATERIALIZED VIEW recent_story_activity IS 'Recent story activity for dashboard display, refreshed every 15 minutes';
COMMENT ON FUNCTION get_community_insights IS 'Optimized function to retrieve community insights with configurable time range';
COMMENT ON FUNCTION refresh_analytics_views IS 'Maintenance function to refresh all materialized views';
COMMENT ON FUNCTION analyze_table_performance IS 'Monitoring function to check table and index sizes';