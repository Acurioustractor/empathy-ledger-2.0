-- Add airtable_id columns to stories and quotes tables for reference tracking

-- Add airtable_id to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS airtable_id VARCHAR;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS airtable_story_ids VARCHAR[];
ALTER TABLE stories ADD COLUMN IF NOT EXISTS airtable_transcript_ids VARCHAR[];

-- Add airtable_id to quotes table  
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS airtable_id VARCHAR;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS airtable_story_ids VARCHAR[];
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS airtable_transcript_ids VARCHAR[];

-- Add indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_stories_airtable_id ON stories(airtable_id);
CREATE INDEX IF NOT EXISTS idx_quotes_airtable_id ON quotes(airtable_id);

-- Verify the additions
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'stories' AND column_name LIKE '%airtable%';

SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'quotes' AND column_name LIKE '%airtable%';