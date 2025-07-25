-- =====================================================================
-- BEAUTIFICATION SYSTEM: Add AI-enhanced content columns
-- =====================================================================
-- This migration adds columns for AI-beautified content to the stories table

-- Add beautified content columns
ALTER TABLE stories ADD COLUMN IF NOT EXISTS 
  -- Core beautified content
  beautified_title TEXT,
  beautified_content TEXT, -- Clean content without timestamps/formatting
  executive_summary TEXT, -- Professional summary for stakeholders
  key_quotes TEXT[], -- Extracted meaningful quotes
  emotional_tone VARCHAR(50), -- happy, thoughtful, urgent, etc.
  readability_score INTEGER, -- Flesch-Kincaid reading level
  
  -- AI processing metadata
  ai_processing_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  ai_processed_at TIMESTAMPTZ,
  ai_model_version VARCHAR(50),
  ai_confidence_score DECIMAL(3,2),
  ai_processing_notes TEXT, -- Error messages or processing details
  
  -- Enhanced auto-classification
  auto_generated_themes TEXT[], -- AI-detected themes
  content_categories TEXT[], -- healthcare, policy, community, etc.
  sensitivity_flags TEXT[], -- cultural, trauma, medical, etc.
  topic_tags TEXT[], -- Granular topic classification
  
  -- Engagement optimization
  social_share_text TEXT, -- Optimized for social media (280 chars)
  newsletter_excerpt TEXT, -- Perfect for email campaigns
  search_keywords TEXT[], -- SEO-optimized keywords
  
  -- Content quality metrics
  content_completeness_score DECIMAL(3,2), -- How complete/detailed the story is
  narrative_coherence_score DECIMAL(3,2), -- How well the story flows
  impact_potential_score DECIMAL(3,2); -- Predicted engagement/impact

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_ai_status ON stories(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_stories_ai_processed ON stories(ai_processed_at);
CREATE INDEX IF NOT EXISTS idx_stories_beautified_themes ON stories USING GIN(auto_generated_themes);
CREATE INDEX IF NOT EXISTS idx_stories_categories ON stories USING GIN(content_categories);
CREATE INDEX IF NOT EXISTS idx_stories_keywords ON stories USING GIN(search_keywords);

-- Add trigger to automatically queue stories for AI processing
CREATE OR REPLACE FUNCTION queue_story_for_ai_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if content has changed and we have content to process  
  IF (TG_OP = 'INSERT' OR OLD.content IS DISTINCT FROM NEW.content) 
     AND NEW.content IS NOT NULL 
     AND length(NEW.content) > 50 -- Minimum content length
     AND NEW.ai_processing_status = 'pending' THEN
    
    -- Update processing status
    NEW.ai_processing_status = 'pending';
    NEW.updated_at = NOW();
    
    -- Call Edge Function asynchronously (via webhook or queue)
    -- This will be handled by the Edge Function setup
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new stories and updates
DROP TRIGGER IF EXISTS trigger_queue_story_ai_processing ON stories;
CREATE TRIGGER trigger_queue_story_ai_processing
  BEFORE INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION queue_story_for_ai_processing();

-- Create function to manually trigger AI processing for existing stories
CREATE OR REPLACE FUNCTION trigger_ai_processing_for_story(story_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE stories 
  SET ai_processing_status = 'pending',
      updated_at = NOW()
  WHERE id = story_id
    AND (ai_processing_status IS NULL OR ai_processing_status IN ('failed', 'pending'));
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to get stories needing AI processing
CREATE OR REPLACE FUNCTION get_stories_needing_ai_processing(batch_size INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  transcription TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.content, s.transcription, s.created_at
  FROM stories s
  WHERE s.ai_processing_status = 'pending'
    AND s.content IS NOT NULL
    AND length(s.content) > 50
  ORDER BY s.created_at ASC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql;

-- Create function to update story with AI results
CREATE OR REPLACE FUNCTION update_story_ai_results(
  story_id UUID,
  results JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  processing_successful BOOLEAN DEFAULT FALSE;
BEGIN
  UPDATE stories SET
    -- Core beautified content
    beautified_title = COALESCE((results->>'beautified_title')::TEXT, title),
    beautified_content = (results->>'beautified_content')::TEXT,
    executive_summary = (results->>'executive_summary')::TEXT,
    key_quotes = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(results->'key_quotes'))), 
      '{}'
    ),
    emotional_tone = (results->>'emotional_tone')::TEXT,
    readability_score = (results->>'readability_score')::INTEGER,
    
    -- Enhanced themes (merge with existing)
    auto_generated_themes = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(results->'themes'))), 
      '{}'
    ),
    themes = COALESCE(themes, '{}') || COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(results->'themes'))), 
      '{}'
    ),
    content_categories = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(results->'categories'))), 
      '{}'
    ),
    sensitivity_flags = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(results->'sensitivity_flags'))), 
      '{}'
    ),
    topic_tags = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(results->'topic_tags'))), 
      '{}'
    ),
    
    -- Engagement content
    social_share_text = (results->>'social_share_text')::TEXT,
    newsletter_excerpt = (results->>'newsletter_excerpt')::TEXT,
    search_keywords = COALESCE(
      (SELECT ARRAY(SELECT jsonb_array_elements_text(results->'keywords'))), 
      '{}'
    ),
    
    -- Quality scores
    content_completeness_score = (results->>'completeness_score')::DECIMAL(3,2),
    narrative_coherence_score = (results->>'coherence_score')::DECIMAL(3,2),
    impact_potential_score = (results->>'impact_score')::DECIMAL(3,2),
    
    -- Processing metadata
    ai_processing_status = 'completed',
    ai_processed_at = NOW(),
    ai_model_version = COALESCE((results->>'model_version')::TEXT, 'gpt-4'),
    ai_confidence_score = (results->>'confidence_score')::DECIMAL(3,2),
    ai_processing_notes = (results->>'processing_notes')::TEXT,
    updated_at = NOW()
    
  WHERE id = story_id;
  
  GET DIAGNOSTICS processing_successful = ROW_COUNT;
  RETURN processing_successful > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE stories IS 'Stories table with AI beautification columns added';
COMMENT ON COLUMN stories.ai_processing_status IS 'Status of AI beautification processing';
COMMENT ON COLUMN stories.beautified_content IS 'AI-cleaned content without timestamps and formatting artifacts';
COMMENT ON COLUMN stories.executive_summary IS 'Professional summary suitable for stakeholders and reports';