-- Check RLS policies on story_analysis table

-- Enable public access to story_analysis for reading analytics
CREATE POLICY "story_analysis_public_read" ON story_analysis
    FOR SELECT USING (
        processing_status = 'completed' 
        AND approved_for_use = true
    );

-- Alternative: Allow all read access for analytics (less restrictive)
-- CREATE POLICY "story_analysis_analytics_read" ON story_analysis
--     FOR SELECT USING (true);