-- =====================================================================
-- AUTOMATED TRIGGER SETUP for Story Beautification
-- =====================================================================
-- This sets up automatic processing when stories are inserted/updated

-- Create a webhook trigger function that calls the Edge Function
CREATE OR REPLACE FUNCTION trigger_story_beautification()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSONB;
  response TEXT;
BEGIN
  -- Only trigger for stories that need processing
  IF (TG_OP = 'INSERT' OR OLD.content IS DISTINCT FROM NEW.content) 
     AND NEW.content IS NOT NULL 
     AND length(NEW.content) > 50 
     AND NEW.ai_processing_status = 'pending' THEN
    
    -- Get the Edge Function URL (set this via environment)
    webhook_url := 'https://your-project-ref.functions.supabase.co/story-beautifier';
    
    -- Prepare payload
    payload := jsonb_build_object(
      'story_id', NEW.id::TEXT,
      'title', NEW.title,
      'content', NEW.content,
      'transcription', NEW.transcription
    );
    
    -- Make async HTTP request to Edge Function
    -- Note: This requires the http extension
    SELECT INTO response net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
      ),
      body := payload
    );
    
    -- Log the trigger attempt
    INSERT INTO audit_logs (
      action,
      resource_type,
      resource_id,
      metadata,
      action_category
    ) VALUES (
      'story_beautification_triggered',
      'story',
      NEW.id,
      jsonb_build_object('webhook_response', response),
      'create'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable HTTP extension for webhook calls
CREATE EXTENSION IF NOT EXISTS http;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_beautify_story ON stories;
CREATE TRIGGER trigger_auto_beautify_story
  AFTER INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_story_beautification();

-- Alternative: Use pg_cron for batch processing (if enabled)
-- This runs every 5 minutes to process pending stories
SELECT cron.schedule(
  'process-pending-stories',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_get(
    'https://your-project-ref.functions.supabase.co/story-beautifier',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
    )
  );
  $$
);

-- Function to manually trigger processing for all pending stories
CREATE OR REPLACE FUNCTION process_all_pending_stories()
RETURNS TABLE(story_id UUID, status TEXT) AS $$
DECLARE
  story_record RECORD;
  processing_count INTEGER := 0;
BEGIN
  FOR story_record IN 
    SELECT id FROM stories 
    WHERE ai_processing_status = 'pending' 
    AND content IS NOT NULL
    AND length(content) > 50
    ORDER BY created_at ASC
    LIMIT 20 -- Process in batches
  LOOP
    -- Trigger processing
    UPDATE stories 
    SET ai_processing_status = 'pending',
        updated_at = NOW()
    WHERE id = story_record.id;
    
    story_id := story_record.id;
    status := 'queued';
    processing_count := processing_count + 1;
    
    RETURN NEXT;
  END LOOP;
  
  -- Log batch processing
  INSERT INTO audit_logs (
    action,
    resource_type,
    metadata,
    action_category
  ) VALUES (
    'batch_story_beautification',
    'story',
    jsonb_build_object('stories_queued', processing_count),
    'update'
  );
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create view for monitoring beautification status
CREATE OR REPLACE VIEW story_beautification_status AS
SELECT 
  s.id,
  s.title,
  s.ai_processing_status,
  s.ai_processed_at,
  s.ai_confidence_score,
  s.created_at,
  CASE 
    WHEN s.ai_processing_status = 'completed' THEN 'success'
    WHEN s.ai_processing_status = 'failed' THEN 'error'
    WHEN s.ai_processing_status = 'processing' THEN 'in_progress'
    ELSE 'pending'
  END as status_category,
  -- Check completeness
  CASE 
    WHEN s.beautified_content IS NOT NULL AND s.executive_summary IS NOT NULL THEN 'complete'
    WHEN s.ai_processing_status = 'completed' THEN 'partial'
    ELSE 'not_processed'
  END as completeness,
  -- Processing time
  CASE 
    WHEN s.ai_processed_at IS NOT NULL AND s.created_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (s.ai_processed_at - s.created_at)) / 60
    ELSE NULL
  END as processing_time_minutes
FROM stories s
WHERE s.content IS NOT NULL
ORDER BY s.created_at DESC;

COMMENT ON VIEW story_beautification_status IS 'Monitor the status and progress of story beautification processing';