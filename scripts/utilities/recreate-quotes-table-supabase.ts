import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

async function recreateQuotesTable() {
  console.log('🔧 RECREATING QUOTES TABLE AND IMPORTING DATA...\n');

  try {
    // First check what we currently have
    const { count: oldCount } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
    console.log(`Current quotes in table: ${oldCount}`);

    // Try to create a new quotes table with a different name first
    console.log('Creating new quotes table with proper structure...');

    // Since we can't modify the table directly, let's try inserting with explicit NULL values
    console.log('Attempting to insert quotes with explicit NULL values...');

    // Fetch quotes from Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Quotes?maxRecords=10`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    const quotes = data.records;

    console.log(`Testing with ${quotes.length} quotes from Airtable...`);

    // Try a single insert first
    const testQuote = quotes[0];
    const fields = testQuote.fields;
    
    const quoteData = {
      quote_text: fields['Quote Text'] || 'Test quote',
      context: fields.Context || null,
      themes: fields.Theme ? [fields.Theme] : null,
      emotion: fields.Emotion || null,
      impact_score: fields['Impact Score'] || null,
      created_at: new Date().toISOString(),
      extracted_by: 'airtable_import'
      // Deliberately omitting story_id and transcript_id to see if they default to NULL
    };

    console.log('Testing single quote insert:', quoteData);

    const { data: insertData, error: insertError } = await supabase
      .from('quotes')
      .insert([quoteData])
      .select();

    if (insertError) {
      console.error('❌ Single insert failed:', insertError);
      
      // Let's check the table structure
      const { data: tableData, error: tableError } = await supabase
        .from('quotes')
        .select('*')
        .limit(1);
      
      console.log('Table access test:', { tableData, tableError });
      
    } else {
      console.log('✅ Single insert succeeded:', insertData);
      
      // If successful, check current count
      const { count: newCount } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
      console.log(`New quotes count: ${newCount}`);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

recreateQuotesTable().catch(console.error);