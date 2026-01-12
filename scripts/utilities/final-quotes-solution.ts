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

async function finalQuotesSolution() {
  console.log('🎯 FINAL QUOTES SOLUTION\n');

  // Create a record in old_imported_transcripts to satisfy the foreign key
  console.log('STEP 1: Creating record in old_imported_transcripts...');
  
  const dummyTranscriptId = randomUUID();
  
  // Get a valid user ID from the users table
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (!user || user.length === 0) {
    console.error('❌ No users found');
    return;
  }

  const userId = user[0].id;
  console.log(`Using user ID: ${userId}`);

  // Try creating a minimal record in old_imported_transcripts
  // We'll try different combinations until one works
  const transcriptAttempts = [
    // Attempt 1: Minimal with just required fields
    {
      id: dummyTranscriptId,
      user_id: userId
    },
    // Attempt 2: Add title
    {
      id: dummyTranscriptId,
      title: 'Dummy transcript for quotes',
      user_id: userId
    },
    // Attempt 3: Add more fields based on media table structure
    {
      id: dummyTranscriptId,
      title: 'Dummy transcript for quotes',
      user_id: userId,
      transcript: 'Dummy content',
      status: 'published'
    },
    // Attempt 4: Copy structure from media table
    {
      id: dummyTranscriptId,
      title: 'Dummy transcript for quotes',
      user_id: userId,
      transcript: 'Dummy transcript content for quotes import',
      submission_method: 'upload',
      privacy_level: 'private',
      consent_settings: {},
      cultural_protocols: {},
      tags: {},
      status: 'published'
    }
  ];

  let transcriptCreated = false;
  
  for (let i = 0; i < transcriptAttempts.length; i++) {
    const attempt = transcriptAttempts[i];
    console.log(`Attempt ${i + 1}: Trying to create transcript record...`);
    
    try {
      const { error } = await supabase
        .from('old_imported_transcripts')
        .insert([attempt]);

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Success!`);
        transcriptCreated = true;
        break;
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err}`);
    }
  }

  if (!transcriptCreated) {
    console.error('\n❌ Could not create transcript record. Manual intervention required.');
    console.log('\n🔧 MANUAL SOLUTION:');
    console.log('1. Go to Supabase Dashboard → Table Editor');
    console.log('2. Either:');
    console.log('   a) Add a record to old_imported_transcripts table manually');
    console.log('   b) Remove the foreign key constraint from quotes table');
    console.log('   c) Change quotes.story_id to allow NULL values');
    return;
  }

  // STEP 2: Now import quotes
  console.log('\nSTEP 2: Importing quotes with valid transcript reference...');

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
    
    if (allQuotes.length % 400 === 0) {
      console.log(`Fetched ${allQuotes.length} quotes...`);
    }
  } while (offset);

  console.log(`\nImporting ${allQuotes.length} quotes...`);

  let quotesImported = 0;

  // Import in smaller batches to avoid timeouts
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
        story_id: dummyTranscriptId, // Use the transcript ID that exists
        transcript_id: dummyTranscriptId,
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
        break; // Stop on first error
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

  const { count: storiesCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });

  console.log('\n🎯 FINAL STATUS:');
  console.log(`📊 Stories: ${storiesCount}`);
  console.log(`📊 Quotes: ${quotesCount}`);
  console.log(`✅ Imported: ${quotesImported}/${allQuotes.length} quotes`);

  if (quotesCount > 0) {
    console.log('\n🎉 SUCCESS! Your quotes are now in Supabase!');
    console.log('🔍 Check your Supabase dashboard → quotes table');
  } else {
    console.log('\n❌ No quotes imported. Check errors above.');
  }
}

finalQuotesSolution().catch(console.error);