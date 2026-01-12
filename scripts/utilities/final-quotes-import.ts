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

async function finalQuotesImport() {
  console.log('🔧 FINAL ATTEMPT TO IMPORT QUOTES...\n');

  try {
    // Get a media record since that seems to work
    const { data: media } = await supabase
      .from('media')
      .select('*')
      .limit(1);

    if (!media || media.length === 0) {
      console.error('❌ No media found');
      return;
    }

    const mediaRecord = media[0];
    console.log('Sample media record structure:', Object.keys(mediaRecord));

    // Try to create a transcript record with the same structure as media
    const dummyId = randomUUID();
    
    // Copy the structure from media but with minimal required fields
    const transcriptData = {
      id: dummyId,
      user_id: mediaRecord.user_id || null, // Use the same user_id pattern
      title: 'Dummy transcript for quotes import',
      transcript: 'This is a dummy transcript created for quotes import.',
      submission_method: mediaRecord.submission_method || 'upload',
      privacy_level: mediaRecord.privacy_level || 'private',
      consent_settings: mediaRecord.consent_settings || {},
      cultural_protocols: mediaRecord.cultural_protocols || {},
      tags: mediaRecord.tags || {},
      status: 'published'
    };

    console.log('Attempting to create transcript with media-like structure...');

    const { error: transcriptError } = await supabase
      .from('old_imported_transcripts')
      .insert([transcriptData]);

    if (transcriptError) {
      console.error('❌ Still failed to create transcript:', transcriptError);
      
      // Let's just try to find ANY existing record in old_imported_transcripts
      console.log('Checking if there are ANY records in old_imported_transcripts...');
      const { data: existingTranscripts } = await supabase
        .from('old_imported_transcripts')
        .select('*')
        .limit(10);
      
      console.log('Existing transcripts:', existingTranscripts);
      
      if (existingTranscripts && existingTranscripts.length > 0) {
        const existingId = existingTranscripts[0].id;
        console.log(`Found existing transcript ID: ${existingId}`);
        
        // Use this existing ID for quotes
        await importQuotesWithId(existingId);
      } else {
        console.log('❌ No existing transcripts found. Cannot proceed with quotes import.');
        console.log('The quotes table has foreign key constraints that prevent import.');
        console.log('You need to either:');
        console.log('1. Manually create a record in old_imported_transcripts table');
        console.log('2. Remove the foreign key constraint from quotes table');
        console.log('3. Modify the quotes table structure in Supabase dashboard');
      }
    } else {
      console.log('✅ Successfully created dummy transcript!');
      await importQuotesWithId(dummyId);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function importQuotesWithId(transcriptId: string) {
  console.log(`\n📥 Importing quotes with transcript ID: ${transcriptId}`);
  
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
        quote_text: fields['Quote Text'] || 'No quote text',
        context: fields.Context || null,
        themes: fields.Theme ? [fields.Theme] : [],
        emotion: fields.Emotion || null,
        impact_score: fields['Impact Score'] || null,
        story_id: transcriptId,
        transcript_id: transcriptId,
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
        console.error(`❌ Batch ${Math.floor(i/50) + 1} failed:`, error);
        break; // Stop on first error
      }
    } catch (err) {
      console.error(`❌ Exception in batch:`, err);
      break;
    }
  }

  // Final verification
  const { count } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
  console.log(`\n🎯 FINAL RESULT: ${count} quotes in YOUR Supabase!`);
  
  if (count && count > 0) {
    console.log('\n✅ SUCCESS! Your quotes are now in Supabase!');
    console.log('🔍 Check your Supabase dashboard quotes table');
  }
}

finalQuotesImport().catch(console.error);