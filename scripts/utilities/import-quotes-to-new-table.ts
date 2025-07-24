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

async function importQuotesToNewTable() {
  console.log('📥 IMPORTING QUOTES TO NEW TABLE...\n');

  // Create new table with different name
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS airtable_quotes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      quote_text TEXT NOT NULL,
      context TEXT,
      theme VARCHAR,
      transcript_reference VARCHAR[],
      project VARCHAR[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add RLS
    ALTER TABLE airtable_quotes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all for airtable_quotes" ON airtable_quotes USING (true) WITH CHECK (true);
  `;

  console.log('Creating new table...');
  
  try {
    await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({ sql: createTableSQL })
    });
  } catch (err) {
    console.log('SQL execution via API failed, continuing...');
  }

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

    let quotesImported = 0;

    for (let i = 0; i < allQuotes.length; i++) {
      const record = allQuotes[i];
      const fields = record.fields;
      
      const quoteData = {
        id: randomUUID(),
        quote_text: fields['Quote Text'] || fields.Quote || 'No quote text',
        context: fields.Context || null,
        theme: fields.Theme || null,
        transcript_reference: fields['Transcript Reference'] || [],
        project: fields['Project (from Transcript Reference)'] || []
      };

      try {
        const { error } = await supabase
          .from('airtable_quotes')
          .insert(quoteData);

        if (!error) {
          quotesImported++;
          if (quotesImported % 200 === 0) {
            console.log(`✅ Imported ${quotesImported} quotes...`);
          }
        } else {
          console.error(`Error importing quote ${i+1}:`, error);
        }
      } catch (err) {
        console.error(`Exception importing quote ${i+1}:`, err);
      }
    }

    console.log(`\n✅ Total quotes imported: ${quotesImported}/${allQuotes.length}\n`);

    // Check current count
    const { count } = await supabase.from('airtable_quotes').select('*', { count: 'exact', head: true });
    console.log(`📊 Total quotes in airtable_quotes table: ${count}`);

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

importQuotesToNewTable().catch(console.error);