import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

async function importQuotesOnly() {
  console.log('📥 IMPORTING QUOTES FROM AIRTABLE...\n');

  try {
    let allQuotes = [];
    let offset = null;
    
    do {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Quotes${offset ? `?offset=${offset}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      allQuotes = allQuotes.concat(data.records);
      offset = data.offset;
      
      console.log(`Fetched ${data.records.length} quotes (total: ${allQuotes.length})`);
    } while (offset);

    // Show first quote structure
    if (allQuotes.length > 0) {
      console.log('\nSample quote structure:');
      console.log('Fields:', Object.keys(allQuotes[0].fields));
      console.log('Sample quote:', allQuotes[0].fields);
    }

    let quotesImported = 0;
    let quotesWithErrors = 0;

    for (let i = 0; i < Math.min(10, allQuotes.length); i++) {
      const record = allQuotes[i];
      const fields = record.fields;
      
      const quoteData = {
        id: randomUUID(),
        quote_text: fields.Quote || fields.Text || fields['Quote Text'] || 'No quote text',
        context: fields.Context || null,
        themes: Array.isArray(fields.Themes) ? fields.Themes : [],
        emotion: fields.Emotion || null,
        impact_score: fields['Impact Score'] || null,
        story_id: null,
        transcript_id: null,
        linked_storytellers: [],
        linked_media: [],
        linked_stories: [],
        created_at: new Date().toISOString(),
        extracted_by: 'airtable_import'
      };

      console.log(`\nTrying to import quote ${i+1}:`, {
        quote_text: quoteData.quote_text.substring(0, 50) + '...',
        themes: quoteData.themes,
        emotion: quoteData.emotion
      });

      try {
        const { data, error } = await supabase
          .from('quotes')
          .insert(quoteData)
          .select();

        if (error) {
          console.error(`Error importing quote ${i+1}:`, error);
          quotesWithErrors++;
        } else {
          console.log(`✅ Successfully imported quote ${i+1}`);
          quotesImported++;
        }
      } catch (err) {
        console.error(`Exception importing quote ${i+1}:`, err);
        quotesWithErrors++;
      }
    }

    console.log(`\n=== TEST IMPORT RESULTS ===`);
    console.log(`✅ Quotes imported: ${quotesImported}/10`);
    console.log(`❌ Quotes with errors: ${quotesWithErrors}/10`);

    // Check current quotes count
    const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
    console.log(`📊 Total quotes in database: ${count}`);

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

importQuotesOnly().catch(console.error);