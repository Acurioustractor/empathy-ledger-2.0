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

async function createDummyTranscriptAndImport() {
  console.log('📝 CREATING DUMMY TRANSCRIPT AND IMPORTING QUOTES...\n');

  try {
    // Get a valid storyteller ID
    const { data: storyteller } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'storyteller')
      .limit(1);

    if (!storyteller || storyteller.length === 0) {
      console.error('❌ No storytellers found');
      return;
    }

    const storytellerId = storyteller[0].id;
    console.log(`Using storyteller ID: ${storytellerId}`);

    // Create a dummy transcript record
    const dummyTranscriptId = randomUUID();
    
    const { error: transcriptError } = await supabase
      .from('old_imported_transcripts')
      .insert([{
        id: dummyTranscriptId,
        title: 'Dummy transcript for quotes import',
        storyteller_id: storytellerId,
        transcript: 'This is a dummy transcript created to satisfy foreign key constraints for quotes import.',
        status: 'published',
        created_at: new Date().toISOString()
      }]);

    if (transcriptError) {
      console.error('❌ Failed to create dummy transcript:', transcriptError);
      return;
    }

    console.log(`✅ Created dummy transcript: ${dummyTranscriptId}`);

    // Now import quotes using this transcript ID
    console.log('\n📥 Importing quotes from Airtable...');

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

    let quotesImported = 0;

    // Import in batches of 100
    for (let i = 0; i < allQuotes.length; i += 100) {
      const batch = allQuotes.slice(i, i + 100);
      
      const quotesToInsert = batch.map(record => {
        const fields = record.fields;
        return {
          quote_text: fields['Quote Text'] || fields.Quote || 'No quote text',
          context: fields.Context || null,
          themes: fields.Theme ? [fields.Theme] : [],
          emotion: fields.Emotion || null,
          impact_score: fields['Impact Score'] || null,
          story_id: dummyTranscriptId, // Use the dummy transcript ID
          transcript_id: dummyTranscriptId,
          created_at: new Date().toISOString(),
          extracted_by: 'airtable_import'
        };
      });

      try {
        const { error } = await supabase
          .from('quotes')
          .insert(quotesToInsert);

        if (!error) {
          quotesImported += batch.length;
          console.log(`✅ Batch ${Math.floor(i/100) + 1}: Imported ${quotesImported} total quotes`);
        } else {
          console.error(`❌ Batch ${Math.floor(i/100) + 1} failed:`, error);
        }
      } catch (err) {
        console.error(`❌ Exception in batch ${Math.floor(i/100) + 1}:`, err);
      }
    }

    // Final verification
    const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true });

    console.log(`\n🎯 IMPORT COMPLETE!`);
    console.log(`✅ Successfully imported: ${quotesImported}/${allQuotes.length} quotes`);
    console.log(`📊 Total quotes in YOUR Supabase: ${count}`);
    console.log(`\n✅ CHECK YOUR SUPABASE DASHBOARD NOW!`);

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

createDummyTranscriptAndImport().catch(console.error);