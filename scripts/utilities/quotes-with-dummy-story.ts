import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

async function quotesWithDummyStory() {
  console.log('📥 QUOTES IMPORT WITH DUMMY STORY\n');

  // Find existing dummy story or use first available story
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title')
    .limit(5);

  if (!stories || stories.length === 0) {
    console.error('❌ No stories found in database');
    return;
  }

  // Use the first story as our dummy story ID
  const dummyStoryId = stories[0].id;
  console.log(`Using story ID: ${dummyStoryId} ("${stories[0].title}")`);

  // Fetch all quotes from Airtable
  console.log('\nFetching quotes from Airtable...');
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
    
    if (allQuotes.length % 300 === 0) {
      console.log(`Fetched ${allQuotes.length} quotes...`);
    }
  } while (offset);

  console.log(`\nImporting ${allQuotes.length} quotes...`);

  let quotesImported = 0;

  // Import in batches of 50
  for (let i = 0; i < allQuotes.length; i += 50) {
    const batch = allQuotes.slice(i, i + 50);
    
    const quotesToInsert = batch.map(record => {
      const fields = record.fields;
      return {
        quote_text: fields['Quote Text'] || fields.Quote || 'No quote text',
        context: fields.Context || null,
        themes: fields.Theme ? [fields.Theme] : [],
        emotion: fields.Emotion || null,
        impact_score: fields['Impact Score'] || null,
        story_id: dummyStoryId, // Use existing story ID
        transcript_id: dummyStoryId, // Use same ID for transcript
        extracted_by: 'airtable_import'
      };
    });

    try {
      const { error } = await supabase
        .from('quotes')
        .insert(quotesToInsert);

      if (!error) {
        quotesImported += batch.length;
        if (quotesImported % 250 === 0) {
          console.log(`✅ Imported ${quotesImported} quotes...`);
        }
      } else {
        console.error(`❌ Batch failed:`, error);
        break;
      }
    } catch (err) {
      console.error(`❌ Exception:`, err);
      break;
    }
  }

  // Final verification
  const { count: quotesCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true });

  console.log('\n🎯 FINAL STATUS:');
  console.log(`📊 Quotes imported: ${quotesImported}/${allQuotes.length}`);
  console.log(`📊 Total quotes in Supabase: ${quotesCount}`);

  if (quotesCount > 0) {
    console.log('\n🎉 SUCCESS! Your quotes are now in Supabase!');
    console.log(`📝 Note: All quotes are linked to story: "${stories[0].title}"`);
  }
}

quotesWithDummyStory().catch(console.error);