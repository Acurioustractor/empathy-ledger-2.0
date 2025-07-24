-- Fix quotes table to allow NULL story_id and transcript_id

ALTER TABLE quotes ALTER COLUMN story_id DROP NOT NULL;
ALTER TABLE quotes ALTER COLUMN transcript_id DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
  AND column_name IN ('story_id', 'transcript_id');