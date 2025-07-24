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

async function fixQuotesConstraintAndImport() {
  console.log('🔧 FIXING QUOTES CONSTRAINT AND IMPORTING QUOTES\n');

  // APPROACH: Create a dummy story record to satisfy the foreign key constraint
  console.log('STEP 1: Creating dummy story for quotes constraint...');
  
  const dummyStoryId = randomUUID();
  
  try {
    const { error: storyError } = await supabase
      .from('stories')
      .insert([{
        id: dummyStoryId,
        title: '[DUMMY] Quotes Container Story',
        story_transcript: 'This is a dummy story created to hold imported quotes.',
        status: 'draft', // Mark as draft so it doesn't appear in public lists
        featured: false
      }]);

    if (storyError) {
      console.error('❌ Could not create dummy story:', storyError);
      console.log('\n🚨 MANUAL FIX REQUIRED:');
      console.log('In your Supabase dashboard, you need to:');
      console.log('1. Go to Table Editor → quotes');
      console.log('2. Edit the table schema');
      console.log('3. Remove the NOT NULL constraint from story_id column');
      console.log('4. Or remove the foreign key constraint');
      console.log('\nAfter fixing, re-run this script.');
      return;
    }

    console.log(`✅ Created dummy story: ${dummyStoryId}`);

    // STEP 2: Import all quotes from Airtable
    console.log('\nSTEP 2: Importing quotes from Airtable...');

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

    console.log(`\nFound ${allQuotes.length} quotes to import`);

    let quotesImported = 0;
    let quotesWithErrors = 0;

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
          story_id: dummyStoryId, // Use dummy story to satisfy constraint
          transcript_id: dummyStoryId,
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
          if (quotesImported % 200 === 0) {
            console.log(`✅ Imported ${quotesImported} quotes...`);
          }
        } else {
          console.error(`❌ Batch ${Math.floor(i/100) + 1} failed:`, error);
          quotesWithErrors += batch.length;
          break; // Stop on first error
        }
      } catch (err) {
        console.error(`❌ Exception in batch ${Math.floor(i/100) + 1}:`, err);
        quotesWithErrors += batch.length;
        break;
      }
    }

    // STEP 3: Verify and clean up
    console.log('\nSTEP 3: Verification...');
    
    const { count: finalQuotesCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true });

    const { count: finalStoriesCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });

    console.log('\n🎯 IMPORT RESULTS:');
    console.log(`✅ Quotes imported: ${quotesImported}/${allQuotes.length}`);
    console.log(`❌ Quotes with errors: ${quotesWithErrors}`);
    console.log(`📊 Total quotes in Supabase: ${finalQuotesCount}`);
    console.log(`📊 Total stories in Supabase: ${finalStoriesCount}`);

    if (finalQuotesCount > 0) {
      console.log('\n🎉 SUCCESS! Quotes are now in your Supabase!');
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Check your Supabase dashboard → quotes table');
      console.log('2. The quotes are linked to a dummy story for now');
      console.log('3. You can later update the linking as needed');
      console.log(`4. Consider removing dummy story: ${dummyStoryId}`);
    }

  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

fixQuotesConstraintAndImport().catch(console.error);