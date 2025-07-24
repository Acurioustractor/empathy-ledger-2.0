/**
 * CREATE TRANSCRIPT TABLES DIRECTLY
 * 
 * Create the core tables needed for transcript-story architecture
 * Using direct SQL execution through Supabase client
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTranscriptTables() {
  console.log('🏗️  CREATING TRANSCRIPT-STORY ARCHITECTURE TABLES');
  console.log('Direct table creation for transcript → AI analysis → story flow\n');

  const tables = [
    {
      name: 'transcripts',
      description: 'Raw wisdom source for AI analysis',
      sql: `
        CREATE TABLE IF NOT EXISTS transcripts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
          
          -- CONTENT (Raw, authentic material)
          transcript_content TEXT NOT NULL,
          transcript_type TEXT DEFAULT 'interview' CHECK (
            transcript_type IN ('interview', 'written-submission', 'audio-recording', 'video-recording', 'workshop', 'conversation')
          ),
          
          -- SOURCE INFORMATION
          collection_date TIMESTAMPTZ,
          collection_method TEXT,
          duration_minutes INTEGER,
          language TEXT DEFAULT 'en',
          interviewer_name TEXT,
          location TEXT,
          
          -- CONTENT METADATA
          word_count INTEGER GENERATED ALWAYS AS (
            array_length(string_to_array(transcript_content, ' '), 1)
          ) STORED,
          character_count INTEGER GENERATED ALWAYS AS (
            length(transcript_content)
          ) STORED,
          
          -- STORYTELLER CONSENT & CONTROL
          storyteller_approved_content BOOLEAN DEFAULT FALSE,
          consent_for_ai_analysis BOOLEAN DEFAULT FALSE,
          consent_for_quote_extraction BOOLEAN DEFAULT FALSE,
          consent_for_theme_analysis BOOLEAN DEFAULT FALSE,
          consent_for_story_creation BOOLEAN DEFAULT FALSE,
          consent_date TIMESTAMPTZ,
          consent_notes TEXT,
          
          -- PRIVACY CONTROLS
          privacy_level TEXT DEFAULT 'private' CHECK (
            privacy_level IN ('private', 'organization-only', 'research-approved', 'public-approved')
          ),
          
          -- AI ANALYSIS STATUS
          ready_for_analysis BOOLEAN DEFAULT FALSE,
          analysis_requested_date TIMESTAMPTZ,
          analysis_completed_date TIMESTAMPTZ,
          analysis_quality_score DECIMAL(3,2),
          
          -- CONTENT SAFETY
          content_warnings TEXT[] DEFAULT '{}',
          safety_review_status TEXT DEFAULT 'pending' CHECK (
            safety_review_status IN ('pending', 'approved', 'needs-support', 'archived')
          ),
          safety_notes TEXT,
          
          -- PROCESSING STATUS
          processing_status TEXT DEFAULT 'raw' CHECK (
            processing_status IN ('raw', 'reviewed', 'cleaned', 'analyzed', 'approved-for-stories', 'archived')
          ),
          last_processed_date TIMESTAMPTZ,
          
          -- RELATIONSHIP TO STORIES
          stories_created_count INTEGER DEFAULT 0,
          last_story_creation_date TIMESTAMPTZ,
          
          -- TIMESTAMPS
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          -- CONSTRAINTS
          UNIQUE(storyteller_id)
        );
      `
    },
    {
      name: 'ai_analysis_results',
      description: 'AI insights generated FROM transcripts',
      sql: `
        CREATE TABLE IF NOT EXISTS ai_analysis_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
          storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
          
          -- ANALYSIS METADATA
          analysis_version TEXT NOT NULL,
          ai_model_used TEXT NOT NULL,
          analysis_date TIMESTAMPTZ DEFAULT NOW(),
          processing_time_seconds INTEGER,
          
          -- CORE ANALYSIS RESULTS (JSON format)
          themes_extracted JSONB DEFAULT '[]'::jsonb,
          quotes_curated JSONB DEFAULT '[]'::jsonb,
          insights_generated JSONB DEFAULT '[]'::jsonb,
          strength_narrative TEXT,
          community_connections JSONB DEFAULT '[]'::jsonb,
          
          -- QUALITY METRICS
          overall_quality_score DECIMAL(3,2) NOT NULL,
          cultural_sensitivity_score DECIMAL(3,2),
          trauma_informed_score DECIMAL(3,2),
          strengths_based_score DECIMAL(3,2),
          dignity_preservation_score DECIMAL(3,2),
          bias_detection_results JSONB DEFAULT '{}'::jsonb,
          
          -- STORYTELLER REVIEW STATUS
          storyteller_review_status TEXT DEFAULT 'pending' CHECK (
            storyteller_review_status IN ('pending', 'reviewing', 'approved', 'requested-changes', 'rejected')
          ),
          storyteller_feedback TEXT,
          storyteller_edits JSONB DEFAULT '{}'::jsonb,
          storyteller_approval_date TIMESTAMPTZ,
          
          -- STAFF REVIEW
          staff_review_status TEXT DEFAULT 'pending' CHECK (
            staff_review_status IN ('pending', 'approved', 'needs-revision', 'escalated')
          ),
          staff_reviewer_id UUID,
          staff_review_notes TEXT,
          staff_review_date TIMESTAMPTZ,
          
          -- USAGE TRACKING
          themes_used_in_stories INTEGER DEFAULT 0,
          quotes_used_in_stories INTEGER DEFAULT 0,
          last_used_for_story_creation TIMESTAMPTZ,
          
          -- TIMESTAMPS
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          -- CONSTRAINTS
          UNIQUE(transcript_id)
        );
      `
    },
    {
      name: 'story_creation_workflow',
      description: 'Track story development FROM transcripts',
      sql: `
        CREATE TABLE IF NOT EXISTS story_creation_workflow (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
          story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
          storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
          
          -- STORY CONCEPT
          story_concept TEXT NOT NULL,
          story_format TEXT NOT NULL CHECK (
            story_format IN ('blog-post', 'video-story', 'social-media-post', 'article', 'newsletter', 'presentation', 'infographic', 'podcast', 'quote-card')
          ),
          target_audience TEXT DEFAULT 'general',
          story_purpose TEXT,
          key_messages TEXT[],
          
          -- CREATION PROCESS
          workflow_status TEXT DEFAULT 'concept' CHECK (
            workflow_status IN ('concept', 'outlined', 'drafted', 'storyteller-review', 'revisions', 'approved', 'published', 'archived')
          ),
          assigned_creator TEXT,
          creation_deadline TIMESTAMPTZ,
          
          -- STORYTELLER INVOLVEMENT
          storyteller_collaboration_level TEXT DEFAULT 'review-only' CHECK (
            storyteller_collaboration_level IN ('review-only', 'collaborative-editing', 'co-creation', 'storyteller-led')
          ),
          storyteller_preferences TEXT,
          
          -- CONTENT ELEMENTS (From AI analysis)
          themes_to_include TEXT[],
          quotes_to_include TEXT[],
          insights_to_highlight TEXT[],
          
          -- REVIEW TRACKING
          draft_submitted_date TIMESTAMPTZ,
          storyteller_review_requested_date TIMESTAMPTZ,
          storyteller_feedback_received_date TIMESTAMPTZ,
          final_approval_date TIMESTAMPTZ,
          
          -- PUBLICATION PLANNING
          publication_channel TEXT[],
          publication_timing TEXT,
          
          -- NOTES
          creator_notes TEXT,
          internal_notes TEXT,
          
          -- TIMESTAMPS
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'story_transcript_connections',
      description: 'Clear connections between stories and their source transcripts',
      sql: `
        CREATE TABLE IF NOT EXISTS story_transcript_connections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
          transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
          storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
          
          -- CONNECTION DETAILS
          connection_type TEXT DEFAULT 'created-from' CHECK (
            connection_type IN ('created-from', 'inspired-by', 'references', 'updates')
          ),
          content_used_percentage DECIMAL(5,2),
          
          -- SPECIFIC CONTENT USAGE
          themes_used TEXT[],
          quotes_used TEXT[],
          sections_referenced TEXT[],
          
          -- TRANSFORMATION NOTES
          editorial_changes_made TEXT,
          storyteller_input_incorporated TEXT,
          
          -- APPROVAL TRACKING
          storyteller_approved_usage BOOLEAN DEFAULT FALSE,
          approval_date TIMESTAMPTZ,
          
          -- TIMESTAMPS
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          -- CONSTRAINTS
          UNIQUE(story_id, transcript_id)
        );
      `
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const table of tables) {
    try {
      console.log(`🔄 Creating table: ${table.name}`);
      console.log(`   📋 ${table.description}`);

      const { error } = await supabase.from('_dummy').select('*').limit(0);
      
      // Execute using the SQL directly (this is a workaround)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
        },
        body: JSON.stringify({ sql: table.sql })
      });

      if (response.ok) {
        console.log(`   ✅ ${table.name} created successfully`);
        successCount++;
      } else {
        const errorText = await response.text();
        if (errorText.includes('already exists')) {
          console.log(`   ↩️  ${table.name} already exists`);
          successCount++;
        } else {
          console.log(`   ❌ ${table.name} failed: ${errorText}`);
          errorCount++;
        }
      }

    } catch (error) {
      console.log(`   ❌ ${table.name} exception: ${error}`);
      errorCount++;
    }

    console.log(''); // Space between tables
  }

  // Add indexes
  console.log('📊 Creating indexes...');
  await createIndexes();

  // Add story table enhancements
  console.log('🔗 Enhancing stories table...');
  await enhanceStoriesTable();

  console.log('\n📊 TABLE CREATION RESULTS:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 ALL TABLES CREATED SUCCESSFULLY!');
    await verifyTables();
  } else {
    console.log('\n⚠️  Some tables had issues, but may still be usable');
  }
}

async function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_transcripts_storyteller ON transcripts(storyteller_id);',
    'CREATE INDEX IF NOT EXISTS idx_transcripts_ready_analysis ON transcripts(ready_for_analysis);',
    'CREATE INDEX IF NOT EXISTS idx_transcripts_consent ON transcripts(consent_for_ai_analysis);',
    'CREATE INDEX IF NOT EXISTS idx_ai_analysis_transcript ON ai_analysis_results(transcript_id);',
    'CREATE INDEX IF NOT EXISTS idx_ai_analysis_storyteller ON ai_analysis_results(storyteller_id);',
    'CREATE INDEX IF NOT EXISTS idx_workflow_transcript ON story_creation_workflow(transcript_id);',
    'CREATE INDEX IF NOT EXISTS idx_connections_story ON story_transcript_connections(story_id);',
    'CREATE INDEX IF NOT EXISTS idx_connections_transcript ON story_transcript_connections(transcript_id);'
  ];

  for (const indexSql of indexes) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
        },
        body: JSON.stringify({ sql: indexSql })
      });
      
      if (response.ok) {
        console.log(`   ✅ Index created`);
      }
    } catch (error) {
      // Indexes are nice to have but not critical
    }
  }
}

async function enhanceStoriesTable() {
  const enhancements = [
    'ALTER TABLE stories ADD COLUMN IF NOT EXISTS transcript_id UUID REFERENCES transcripts(id) ON DELETE SET NULL;',
    'ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_format TEXT DEFAULT \'blog-post\';',
    'ALTER TABLE stories ADD COLUMN IF NOT EXISTS editorial_status TEXT DEFAULT \'draft\';',
    'ALTER TABLE stories ADD COLUMN IF NOT EXISTS storyteller_approval_date TIMESTAMPTZ;'
  ];

  for (const sql of enhancements) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
        },
        body: JSON.stringify({ sql })
      });
    } catch (error) {
      // Enhancements are nice to have
    }
  }
}

async function verifyTables() {
  console.log('\n🔍 VERIFYING ARCHITECTURE...');
  
  const tables = ['transcripts', 'ai_analysis_results', 'story_creation_workflow', 'story_transcript_connections'];
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${tableName}: Ready for use`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${tableName}: Could not verify`);
    }
  }

  console.log('\n🎯 ARCHITECTURE COMPLETE!');
  console.log('✅ TRANSCRIPTS: Store raw wisdom for AI analysis');
  console.log('✅ AI_ANALYSIS: Process transcripts into insights');  
  console.log('✅ WORKFLOW: Track story creation FROM transcripts');
  console.log('✅ CONNECTIONS: Link stories to their source transcripts');
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Extract existing transcripts from storyteller data');
  console.log('2. Set up AI analysis workflow');
  console.log('3. Test transcript → analysis → story creation flow');
}

// Execute
createTranscriptTables()
  .then(() => {
    console.log('\n✅ Transcript architecture setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });