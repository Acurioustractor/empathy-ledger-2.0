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

async function importQuotesToRealSupabase() {
  console.log('📥 IMPORTING QUOTES TO YOUR ACTUAL SUPABASE...\n');

  try {
    // Fetch all quotes from Airtable
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

    console.log(`\n📋 Importing ${allQuotes.length} quotes to YOUR Supabase...\n`);

    let quotesImported = 0;
    let quotesWithErrors = 0;

    // Import in batches of 50
    for (let i = 0; i < allQuotes.length; i += 50) {
      const batch = allQuotes.slice(i, i + 50);
      
      const quotesToInsert = batch.map(record => {
        const fields = record.fields;
        return {
          id: randomUUID(),
          quote_text: fields['Quote Text'] || fields.Quote || 'No quote text',
          context: fields.Context || null,
          themes: fields.Theme ? [fields.Theme] : [],
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
      });

      try {
        const { data, error } = await supabase
          .from('quotes')
          .insert(quotesToInsert);

        if (error) {
          console.error(`❌ Batch ${Math.floor(i/50) + 1} failed:`, error);
          quotesWithErrors += batch.length;
        } else {
          quotesImported += batch.length;
          console.log(`✅ Batch ${Math.floor(i/50) + 1}: Imported ${quotesImported} total quotes`);
        }
      } catch (err) {
        console.error(`❌ Exception in batch ${Math.floor(i/50) + 1}:`, err);
        quotesWithErrors += batch.length;
      }
    }

    // Final verification
    const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true });

    console.log(`\n🎯 IMPORT COMPLETE!`);
    console.log(`✅ Successfully imported: ${quotesImported}/${allQuotes.length} quotes`);
    console.log(`❌ Quotes with errors: ${quotesWithErrors}`);
    console.log(`📊 Total quotes in YOUR Supabase: ${count}`);

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

importQuotesToRealSupabase().catch(console.error);