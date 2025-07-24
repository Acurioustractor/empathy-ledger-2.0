/**
 * SIMPLE CREATE TRANSCRIPTS TABLE
 * 
 * Just create the core transcripts table we need to get started
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTranscriptsTable() {
  console.log('📝 CREATING TRANSCRIPTS TABLE');
  console.log('Simple approach: just get the core table created\n');

  try {
    // First, let's test if we can create a simple table using Supabase admin API
    console.log('🔍 Testing table creation capability...');
    
    // Check if table already exists
    const { data: existingData, error: checkError } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true });

    if (!checkError) {
      console.log('✅ Transcripts table already exists!');
      console.log(`📊 Current records: ${existingData?.length || 0}`);
      return;
    }

    console.log('🔄 Table does not exist, creating...');

    // Since we can't use exec_sql, let's try creating through Supabase admin
    // For now, we'll manually guide the user to create the table
    
    console.log('\n📋 TABLE CREATION REQUIRED');
    console.log('Since automated SQL execution is not available, please create the transcripts table manually:');
    console.log('\n🔗 Go to your Supabase dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}`);
    console.log('\n📝 In the SQL Editor, run this command:');
    
    const createTableSQL = `
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Core content
  transcript_content TEXT NOT NULL,
  transcript_type TEXT DEFAULT 'interview',
  
  -- Source info
  collection_date TIMESTAMPTZ,
  collection_method TEXT,
  duration_minutes INTEGER,
  language TEXT DEFAULT 'en',
  
  -- Metadata
  word_count INTEGER GENERATED ALWAYS AS (
    array_length(string_to_array(transcript_content, ' '), 1)
  ) STORED,
  
  -- Consent
  consent_for_ai_analysis BOOLEAN DEFAULT FALSE,
  consent_for_quote_extraction BOOLEAN DEFAULT FALSE,
  consent_for_theme_analysis BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  
  -- Privacy
  privacy_level TEXT DEFAULT 'private',
  
  -- AI Analysis
  ready_for_analysis BOOLEAN DEFAULT FALSE,
  analysis_quality_score DECIMAL(3,2),
  
  -- Safety
  content_warnings TEXT[] DEFAULT '{}',
  safety_review_status TEXT DEFAULT 'pending',
  
  -- Processing
  processing_status TEXT DEFAULT 'raw',
  
  -- Stories relationship
  stories_created_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(storyteller_id)
);

-- Create indexes
CREATE INDEX idx_transcripts_storyteller ON transcripts(storyteller_id);
CREATE INDEX idx_transcripts_ready_analysis ON transcripts(ready_for_analysis);
CREATE INDEX idx_transcripts_consent ON transcripts(consent_for_ai_analysis);
`;

    console.log('\n' + '='.repeat(80));
    console.log(createTableSQL);
    console.log('='.repeat(80));
    
    console.log('\n✅ After creating the table, we can:');
    console.log('1. Extract transcripts from existing storyteller data');
    console.log('2. Set up AI analysis workflow'); 
    console.log('3. Create the story → transcript connection system');

    // Meanwhile, let's extract the transcript data we already have
    console.log('\n🔄 EXTRACTING EXISTING TRANSCRIPT DATA...');
    await extractExistingTranscripts();

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function extractExistingTranscripts() {
  console.log('\n📊 Checking existing storyteller transcript data...');

  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select('id, full_name, transcript, airtable_record_id')
    .not('transcript', 'is', null);

  if (error) {
    console.error('❌ Error fetching storytellers:', error);
    return;
  }

  console.log(`✅ Found ${storytellers?.length || 0} storytellers with transcript data`);

  if (storytellers && storytellers.length > 0) {
    console.log('\n📋 Sample storytellers with transcripts:');
    storytellers.slice(0, 5).forEach((st, index) => {
      const wordCount = st.transcript ? st.transcript.split(' ').length : 0;
      console.log(`   ${index + 1}. ${st.full_name}: ${wordCount} words`);
    });

    console.log('\n🎯 TRANSCRIPT MIGRATION READY');
    console.log(`   📝 ${storytellers.length} transcripts ready to migrate`);
    console.log('   📊 Average length: ' + Math.round(storytellers.reduce((sum, st) => sum + (st.transcript?.split(' ').length || 0), 0) / storytellers.length) + ' words');
    
    console.log('\n📋 AFTER TABLE CREATION, RUN:');
    console.log('   npx tsx scripts/migrate-transcripts-from-storytellers.ts');
  }
}

// Execute
createTranscriptsTable()
  .then(() => {
    console.log('\n✅ Transcripts table setup guidance completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });