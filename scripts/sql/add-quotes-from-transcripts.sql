-- =====================================================
-- ADD QUOTES FROM EXISTING TRANSCRIPTS
-- Simple approach without complex functions
-- =====================================================

-- Extract basic quotes by manually inserting good sentences from transcripts
-- This approach avoids the function language issues

-- Get some example quotes from the first few transcripts
WITH transcript_sentences AS (
  SELECT 
    t.story_id,
    s.title,
    unnest(string_to_array(
      COALESCE(t.edited_transcript, t.raw_transcript), 
      '. '
    )) as sentence
  FROM transcripts t
  JOIN stories s ON s.id = t.story_id
  WHERE t.is_current = true 
    AND COALESCE(t.edited_transcript, t.raw_transcript) IS NOT NULL
    AND length(COALESCE(t.edited_transcript, t.raw_transcript)) > 100
  LIMIT 10
),
meaningful_quotes AS (
  SELECT 
    story_id,
    trim(sentence) || '.' as quote_text
  FROM transcript_sentences
  WHERE length(trim(sentence)) BETWEEN 30 AND 200
    AND sentence NOT LIKE '%?%'
    AND sentence NOT LIKE 'Um %'
    AND sentence NOT LIKE 'Uh %'
    AND (
      sentence ILIKE '%I %' OR 
      sentence ILIKE '%we %' OR 
      sentence ILIKE '%my %' OR
      sentence ILIKE '%feel%' OR
      sentence ILIKE '%experience%' OR
      sentence ILIKE '%learned%'
    )
)
INSERT INTO quotes (story_id, quote_text, extracted_by)
SELECT 
  story_id,
  quote_text,
  'auto_extraction'
FROM meaningful_quotes
LIMIT 50; -- Limit to avoid too many quotes

-- Show results
SELECT COUNT(*) as quotes_added FROM quotes;