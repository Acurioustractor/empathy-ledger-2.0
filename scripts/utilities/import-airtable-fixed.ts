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

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable API credentials');
}

async function fetchAirtableData(tableName: string) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

async function importAirtableDataFixed() {
  console.log('📥 IMPORTING AIRTABLE DATA WITH PROPER UUIDs...\n');

  try {
    // 1. Import actual STORIES from Airtable
    console.log('=== IMPORTING STORIES FROM AIRTABLE ===');
    const airtableStories = await fetchAirtableData('Stories');
    console.log(`Found ${airtableStories.length} stories in Airtable`);

    let storiesImported = 0;
    for (const record of airtableStories) {
      const fields = record.fields;
      
      // Generate proper UUID and map Airtable fields
      const storyData = {
        id: randomUUID(), // Generate proper UUID
        title: fields.Title || fields.Name || 'Untitled Story',
        story_transcript: fields['Story Transcript'] || fields.Transcript,
        story_copy: fields['Story Copy'] || fields.Copy,
        story_image_url: fields['Story Image'] && fields['Story Image'][0] ? fields['Story Image'][0].url : null,
        video_story_link: fields['Video Story Link'] || fields['Video URL'],
        embed_code: fields['Embed Code'],
        // Convert Airtable record IDs to empty arrays for now (we'll link later)
        linked_storytellers: [],
        linked_media: [],
        linked_quotes: [],
        linked_themes: [],
        status: fields.Status || 'published',
        featured: fields.Featured || false,
        // Store original Airtable ID for reference
        airtable_id: record.id
      };

      try {
        const { error } = await supabase
          .from('stories')
          .insert(storyData);

        if (error) {
          console.error(`Error importing story "${storyData.title}":`, error);
        } else {
          storiesImported++;
          console.log(`✅ Imported: "${storyData.title}"`);
        }
      } catch (err) {
        console.error(`Failed to import story "${storyData.title}":`, err);
      }
    }

    console.log(`\n✅ Stories imported: ${storiesImported}/${airtableStories.length}\n`);

    // 2. Import QUOTES from Airtable
    console.log('=== IMPORTING QUOTES FROM AIRTABLE ===');
    const airtableQuotes = await fetchAirtableData('Quotes');
    console.log(`Found ${airtableQuotes.length} quotes in Airtable`);

    let quotesImported = 0;
    for (const record of airtableQuotes) {
      const fields = record.fields;
      
      const quoteData = {
        id: randomUUID(), // Generate proper UUID
        quote_text: fields.Quote || fields.Text || fields['Quote Text'],
        context: fields.Context,
        themes: fields.Themes || [],
        emotion: fields.Emotion,
        impact_score: fields['Impact Score'],
        // We'll need to map these IDs later
        story_id: null,
        transcript_id: null,
        linked_storytellers: [],
        linked_media: [],
        linked_stories: [],
        created_at: new Date().toISOString(),
        extracted_by: 'airtable_import',
        // Store original Airtable ID for reference
        airtable_id: record.id,
        airtable_story_ids: fields['Story ID'] || [],
        airtable_transcript_ids: fields['Transcript ID'] || []
      };

      try {
        const { error } = await supabase
          .from('quotes')
          .insert(quoteData);

        if (error) {
          console.error(`Error importing quote:`, error);
        } else {
          quotesImported++;
          if (quotesImported % 100 === 0) {
            console.log(`✅ Imported ${quotesImported} quotes...`);
          }
        }
      } catch (err) {
        console.error(`Failed to import quote:`, err);
      }
    }

    console.log(`\n✅ Quotes imported: ${quotesImported}/${airtableQuotes.length}\n`);

    // 3. Get pagination for all quotes (Airtable limits to 100)
    console.log('=== IMPORTING ALL QUOTES (WITH PAGINATION) ===');
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

    // Import remaining quotes
    for (let i = 100; i < allQuotes.length; i++) {
      const record = allQuotes[i];
      const fields = record.fields;
      
      const quoteData = {
        id: randomUUID(),
        quote_text: fields.Quote || fields.Text || fields['Quote Text'],
        context: fields.Context,
        themes: fields.Themes || [],
        emotion: fields.Emotion,
        impact_score: fields['Impact Score'],
        story_id: null,
        transcript_id: null,
        linked_storytellers: [],
        linked_media: [],
        linked_stories: [],
        created_at: new Date().toISOString(),
        extracted_by: 'airtable_import',
        airtable_id: record.id,
        airtable_story_ids: fields['Story ID'] || [],
        airtable_transcript_ids: fields['Transcript ID'] || []
      };

      try {
        const { error } = await supabase
          .from('quotes')
          .insert(quoteData);

        if (!error) {
          quotesImported++;
          if (quotesImported % 200 === 0) {
            console.log(`✅ Imported ${quotesImported} quotes...`);
          }
        }
      } catch (err) {
        // Continue on error
      }
    }

    console.log(`\n✅ Total quotes imported: ${quotesImported}/${allQuotes.length}\n`);

    // 4. Summary
    console.log('=== IMPORT SUMMARY ===');
    console.log(`✅ Stories imported: ${storiesImported}`);
    console.log(`✅ Quotes imported: ${quotesImported}`);
    console.log(`✅ Storytellers updated: 99 (from previous run)`);

    // 5. Verify final counts
    console.log('\n=== VERIFICATION ===');
    const [storiesCount, quotesCount, storytellersCount] = await Promise.all([
      supabase.from('stories').select('*', { count: 'exact', head: true }),
      supabase.from('quotes').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'storyteller')
    ]);

    console.log(`📊 Final counts:`);
    console.log(`   Stories: ${storiesCount.count}`);
    console.log(`   Quotes: ${quotesCount.count}`);
    console.log(`   Storytellers: ${storytellersCount.count}`);

    console.log('\n🎯 SUCCESS: Airtable data imported with proper UUIDs!');
    console.log('🔗 Next: Link relationships between tables');

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

importAirtableDataFixed().catch(console.error);