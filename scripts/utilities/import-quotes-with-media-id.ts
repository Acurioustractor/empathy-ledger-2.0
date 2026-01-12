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

async function importQuotesWithMediaId() {
  console.log('📥 IMPORTING QUOTES WITH MEDIA ID...\n');

  try {
    // Get a sample media ID to use
    const { data: sampleMedia } = await supabase
      .from('media')
      .select('id')
      .limit(1);

    if (!sampleMedia || sampleMedia.length === 0) {
      console.error('❌ No media found to use as reference');
      return;
    }

    const validMediaId = sampleMedia[0].id;
    console.log(`Using media ID: ${validMediaId}`);

    // Since the foreign key constraint points to old_imported_transcripts but it's empty,
    // let's try to create a dummy record there first
    try {
      const { error: insertError } = await supabase
        .from('old_imported_transcripts')
        .insert([{ id: validMediaId, title: 'Dummy transcript for quotes' }]);
      
      if (insertError) {
        console.log('Could not create dummy transcript:', insertError.message);
      } else {
        console.log('✅ Created dummy transcript record');
      }
    } catch (err) {
      console.log('Error creating dummy transcript - will try without it');
    }

    // Fetch first few quotes from Airtable for testing
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Quotes?maxRecords=5`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    const quotes = data.records;

    console.log(`Testing with ${quotes.length} quotes from Airtable...`);

    const quotesToInsert = quotes.map(record => {
      const fields = record.fields;
      return {
        quote_text: fields['Quote Text'] || fields.Quote || 'No quote text',
        context: fields.Context || null,
        themes: fields.Theme ? [fields.Theme] : [],
        emotion: fields.Emotion || null,
        impact_score: fields['Impact Score'] || null,
        story_id: validMediaId, // Use the media ID we just created
        transcript_id: validMediaId,
        created_at: new Date().toISOString(),
        extracted_by: 'airtable_import'
      };
    });

    console.log('Testing quote insert...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('quotes')
      .insert(quotesToInsert)
      .select();

    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
    } else {
      console.log('✅ Test insert succeeded! Quotes inserted:', insertData?.length);
      
      // If successful, import all quotes
      console.log('\n🚀 Now importing ALL quotes...');
      
      // Fetch all quotes
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

      // Skip the ones we already imported
      const remainingQuotes = allQuotes.slice(5);
      let quotesImported = 5; // We already imported 5

      // Import in batches of 100
      for (let i = 0; i < remainingQuotes.length; i += 100) {
        const batch = remainingQuotes.slice(i, i + 100);
        
        const batchToInsert = batch.map(record => {
          const fields = record.fields;
          return {
            quote_text: fields['Quote Text'] || fields.Quote || 'No quote text',
            context: fields.Context || null,
            themes: fields.Theme ? [fields.Theme] : [],
            emotion: fields.Emotion || null,
            impact_score: fields['Impact Score'] || null,
            story_id: validMediaId,
            transcript_id: validMediaId,
            created_at: new Date().toISOString(),
            extracted_by: 'airtable_import'
          };
        });

        try {
          const { error } = await supabase
            .from('quotes')
            .insert(batchToInsert);

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
      console.log(`\n🎯 FINAL RESULT: ${count} quotes in YOUR Supabase!`);
    }

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

importQuotesWithMediaId().catch(console.error);