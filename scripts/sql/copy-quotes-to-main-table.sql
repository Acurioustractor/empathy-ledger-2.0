-- Copy all quotes from airtable_quotes to quotes table

INSERT INTO quotes (id, quote_text, context, themes, created_at, extracted_by)
SELECT 
  gen_random_uuid(),
  quote_text,
  context,
  CASE 
    WHEN theme IS NOT NULL AND theme != '' 
    THEN ARRAY[theme] 
    ELSE ARRAY[]::text[] 
  END,
  created_at,
  'airtable_import'
FROM airtable_quotes;

-- Check the result
SELECT COUNT(*) as quotes_in_main_table FROM quotes;

-- Show sample quotes
SELECT id, quote_text, themes, created_at 
FROM quotes 
WHERE extracted_by = 'airtable_import' 
LIMIT 5;