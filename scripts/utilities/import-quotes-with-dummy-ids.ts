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

async function importQuotesWithDummyIds() {
  console.log('📥 IMPORTING QUOTES WITH DUMMY STORY IDs...\n');

  try {
    // Get a sample story ID to use as default
    const { data: sampleStory } = await supabase
      .from('stories')
      .select('id')
      .limit(1);

    if (!sampleStory || sampleStory.length === 0) {
      console.error('❌ No stories found to use as dummy reference');
      return;
    }

    const dummyStoryId = sampleStory[0].id;
    console.log(`Using dummy story ID: ${dummyStoryId}`);

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

    console.log(`\n📋 Importing ${allQuotes.length} quotes with dummy story ID...\n`);

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
          story_id: dummyStoryId, // Use dummy story ID to satisfy NOT NULL constraint
          transcript_id: dummyStoryId, // Use same dummy ID for transcript
          created_at: new Date().toISOString(),
          extracted_by: 'airtable_import'
        };
      });

      try {
        const { error } = await supabase
          .from('quotes')
          .insert(quotesToInsert);

        if (error) {
          console.error(`❌ Batch ${Math.floor(i/100) + 1} failed:`, error);
        } else {
          quotesImported += batch.length;
          console.log(`✅ Batch ${Math.floor(i/100) + 1}: Imported ${quotesImported} total quotes`);
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
    console.log(`\n⚠️  NOTE: All quotes use dummy story_id: ${dummyStoryId}`);
    console.log(`⚠️  You can fix the linking later if needed`);

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

importQuotesWithDummyIds().catch(console.error);