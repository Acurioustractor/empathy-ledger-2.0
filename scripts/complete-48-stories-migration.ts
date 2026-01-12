/**
 * COMPLETE 48 STORIES MIGRATION
 * 
 * Migrates ALL 48 Airtable stories to Supabase with proper transcript vs story separation
 * Fixes the missing 26 stories issue and sets up correct AI analysis architecture
 */

import { createClient } from '@supabase/supabase-js';
import Airtable from 'airtable';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

interface AirtableStory {
  id: string;
  fields: {
    'Story ID': string;
    'Title': string;
    'Story Transcript': string;
    'Storytellers': string[];
    'Storytellers Name': string[];
    'Story Image': any[];
    'Video Story Link': string;
    'Video Embed Code': string;
    'Status': string;
    'Permissions': string;
    'Project (from Storytellers)': string[];
    'Location (from Media)': string[];
    'Transcript (from Media)': string;
    'Created': string;
  };
}

export class Complete48StoriesMigration {
  
  constructor() {
    console.log('🎯 COMPLETE 48 STORIES MIGRATION');
    console.log('Fixing missing stories and setting up correct transcript architecture');
  }

  async runCompleteMigration(): Promise<void> {
    console.log('\n📊 CURRENT STATE CHECK...');
    await this.checkCurrentState();

    console.log('\n🔄 STEP 1: Fetch ALL 48 Airtable Stories...');
    const allStories = await this.fetchAllAirtableStories();

    console.log('\n🔄 STEP 2: Create Transcripts Table...');
    await this.createTranscriptsTable();

    console.log('\n🔄 STEP 3: Migrate Stories with Transcript Separation...');
    await this.migrateStoriesWithTranscripts(allStories);

    console.log('\n🔄 STEP 4: Verify Migration Success...');
    await this.verifyMigration();

    console.log('\n✅ MIGRATION COMPLETE!');
  }

  async checkCurrentState(): Promise<void> {
    // Check current Supabase state
    const { data: currentStories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title', { count: 'exact', head: true });

    const { data: currentStorytellers, error: storytellersError } = await supabase
      .from('storytellers')
      .select('id, name', { count: 'exact', head: true });

    if (storiesError) console.error('Stories error:', storiesError);
    if (storytellersError) console.error('Storytellers error:', storytellersError);

    console.log(`📊 Current Supabase state:`);
    console.log(`   Stories: ${currentStories?.length || 0}`);
    console.log(`   Storytellers: ${currentStorytellers?.length || 0}`);
  }

  async fetchAllAirtableStories(): Promise<AirtableStory[]> {
    console.log('📥 Fetching ALL Airtable stories with proper pagination...');
    
    const allStories: AirtableStory[] = [];
    let pageCount = 0;

    await airtable('Stories')
      .select({
        maxRecords: 200, // Ensure we get all records
        pageSize: 100,
        sort: [{ field: 'Created', direction: 'asc' }],
        fields: [
          'Story ID',
          'Title', 
          'Story Transcript',
          'Storytellers',
          'Storytellers Name',
          'Story Image',
          'Video Story Link',
          'Video Embed Code', 
          'Status',
          'Permissions',
          'Project (from Storytellers)',
          'Location (from Media)',
          'Transcript (from Media)',
          'Created'
        ]
      })
      .eachPage((records, fetchNextPage) => {
        pageCount++;
        console.log(`   📄 Processing page ${pageCount} (${records.length} records)`);
        
        records.forEach(record => {
          allStories.push({
            id: record.id,
            fields: record.fields as any
          });
        });
        
        console.log(`   📈 Total stories so far: ${allStories.length}`);
        fetchNextPage();
      });

    console.log(`✅ COMPLETE: ${allStories.length} stories fetched from Airtable`);
    
    // Verify we got all 48
    if (allStories.length !== 48) {
      console.warn(`⚠️  WARNING: Expected 48 stories, got ${allStories.length}`);
    }

    return allStories;
  }

  async createTranscriptsTable(): Promise<void> {
    console.log('🏗️  Creating transcripts table for AI analysis...');

    const createTranscriptsSQL = `
      CREATE TABLE IF NOT EXISTS transcripts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
        
        -- Transcript content (source for AI analysis)
        transcript_content TEXT NOT NULL,
        transcript_type TEXT DEFAULT 'interview' CHECK (
          transcript_type IN ('interview', 'written-submission', 'audio-recording', 'video-recording', 'workshop')
        ),
        
        -- Source information
        original_source TEXT, -- Where this came from (Airtable, direct input, etc.)
        collection_method TEXT,
        collection_date TIMESTAMPTZ,
        language TEXT DEFAULT 'en',
        
        -- Content metadata
        word_count INTEGER GENERATED ALWAYS AS (
          array_length(string_to_array(transcript_content, ' '), 1)
        ) STORED,
        character_count INTEGER GENERATED ALWAYS AS (
          length(transcript_content)
        ) STORED,
        
        -- AI analysis readiness
        ready_for_analysis BOOLEAN DEFAULT FALSE,
        analysis_consent_given BOOLEAN DEFAULT FALSE,
        analysis_consent_date TIMESTAMPTZ,
        
        -- Privacy and consent
        privacy_level TEXT DEFAULT 'private' CHECK (
          privacy_level IN ('private', 'organization', 'research', 'public')
        ),
        consent_for_ai_analysis BOOLEAN DEFAULT FALSE,
        consent_for_quote_extraction BOOLEAN DEFAULT FALSE,
        consent_for_theme_analysis BOOLEAN DEFAULT FALSE,
        
        -- Quality and safety
        content_warnings TEXT[] DEFAULT '{}',
        safety_review_status TEXT DEFAULT 'pending' CHECK (
          safety_review_status IN ('pending', 'approved', 'needs-support', 'archived')
        ),
        safety_notes TEXT,
        
        -- Processing status
        processing_status TEXT DEFAULT 'raw' CHECK (
          processing_status IN ('raw', 'cleaned', 'analyzed', 'approved', 'published')
        ),
        last_processed_date TIMESTAMPTZ,
        
        -- Relationships
        related_story_ids UUID[] DEFAULT '{}', -- Stories created FROM this transcript
        
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Ensure one transcript per storyteller (can be updated)
        UNIQUE(storyteller_id)
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_transcripts_storyteller ON transcripts(storyteller_id);
      CREATE INDEX IF NOT EXISTS idx_transcripts_ready_analysis ON transcripts(ready_for_analysis);
      CREATE INDEX IF NOT EXISTS idx_transcripts_consent ON transcripts(consent_for_ai_analysis);
      CREATE INDEX IF NOT EXISTS idx_transcripts_privacy ON transcripts(privacy_level);
      CREATE INDEX IF NOT EXISTS idx_transcripts_processing ON transcripts(processing_status);

      -- Full-text search (privacy-aware)
      ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS search_vector tsvector 
      GENERATED ALWAYS AS (
        CASE 
          WHEN privacy_level != 'private' THEN
            to_tsvector('english', COALESCE(transcript_content, ''))
          ELSE to_tsvector('english', '')
        END
      ) STORED;

      CREATE INDEX IF NOT EXISTS idx_transcripts_search ON transcripts USING GIN(search_vector);

      -- Row Level Security
      ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

      -- Privacy policy (most restrictive)
      DROP POLICY IF EXISTS "transcripts_privacy" ON transcripts;
      CREATE POLICY "transcripts_privacy" ON transcripts
        FOR ALL USING (
          -- Storytellers can access their own transcripts
          storyteller_id = auth.uid()
          OR
          -- Organization staff only with explicit consent
          (EXISTS (
            SELECT 1 FROM storytellers 
            WHERE storytellers.id = transcripts.storyteller_id 
            AND storytellers.organization_id IN (
              SELECT organization_id FROM staff_members 
              WHERE staff_members.user_id = auth.uid() 
              AND staff_members.role IN ('admin', 'staff')
            )
          ) AND consent_for_ai_analysis = TRUE)
        );

      -- Update trigger
      CREATE OR REPLACE FUNCTION update_transcripts_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_transcripts_updated_at ON transcripts;
      CREATE TRIGGER update_transcripts_updated_at 
        BEFORE UPDATE ON transcripts
        FOR EACH ROW EXECUTE FUNCTION update_transcripts_updated_at();
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createTranscriptsSQL });
    
    if (error && !error.message.includes('already exists')) {
      console.error('❌ Error creating transcripts table:', error);
      throw error;
    }

    console.log('✅ Transcripts table created successfully');
  }

  async migrateStoriesWithTranscripts(airtableStories: AirtableStory[]): Promise<void> {
    console.log(`🔄 Migrating ${airtableStories.length} stories with transcript separation...`);

    let successCount = 0;
    let errorCount = 0;
    let transcriptCount = 0;

    for (const [index, airtableStory] of airtableStories.entries()) {
      try {
        console.log(`\n📖 Processing story ${index + 1}/${airtableStories.length}: "${airtableStory.fields.Title}"`);
        
        // Find the storyteller
        const storyteller = await this.findStoryteller(airtableStory);
        if (!storyteller) {
          console.warn(`⚠️  Storyteller not found for story: ${airtableStory.fields.Title}`);
          errorCount++;
          continue;
        }

        // Create or update transcript
        if (airtableStory.fields['Story Transcript'] || airtableStory.fields['Transcript (from Media)']) {
          await this.createTranscript(airtableStory, storyteller.id);
          transcriptCount++;
          console.log(`   ✅ Transcript created for ${storyteller.name}`);
        }

        // Create or update story
        await this.createStory(airtableStory, storyteller);
        successCount++;
        console.log(`   ✅ Story migrated: "${airtableStory.fields.Title}"`);

        // Progress update
        if ((index + 1) % 10 === 0) {
          console.log(`\n📊 Progress: ${index + 1}/${airtableStories.length} stories processed`);
        }

      } catch (error) {
        console.error(`❌ Error migrating story "${airtableStory.fields.Title}":`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 MIGRATION RESULTS:`);
    console.log(`   ✅ Stories migrated: ${successCount}`);
    console.log(`   📝 Transcripts created: ${transcriptCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
  }

  async findStoryteller(airtableStory: AirtableStory): Promise<any> {
    const storytellerName = airtableStory.fields['Storytellers Name']?.[0];
    
    if (!storytellerName) {
      return null;
    }

    // Try to find by name
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('*')
      .eq('name', storytellerName)
      .maybeSingle();

    return storyteller;
  }

  async createTranscript(airtableStory: AirtableStory, storytellerId: string): Promise<void> {
    const transcriptContent = airtableStory.fields['Story Transcript'] || 
                             airtableStory.fields['Transcript (from Media)'];

    if (!transcriptContent || transcriptContent.trim().length === 0) {
      return;
    }

    const transcriptData = {
      storyteller_id: storytellerId,
      transcript_content: transcriptContent.trim(),
      transcript_type: 'interview', // Default type
      original_source: `Airtable Story: ${airtableStory.fields['Story ID']}`,
      collection_date: airtableStory.fields.Created,
      language: 'en', // Default to English
      
      // Default to requiring new consent for AI analysis
      ready_for_analysis: false,
      analysis_consent_given: false,
      consent_for_ai_analysis: false,
      consent_for_quote_extraction: false,
      consent_for_theme_analysis: false,
      
      privacy_level: 'private', // Most restrictive by default
      processing_status: 'raw',
      
      // Safety
      safety_review_status: 'pending',
      
      created_at: airtableStory.fields.Created,
      updated_at: new Date().toISOString()
    };

    // Insert or update transcript
    const { error } = await supabase
      .from('transcripts')
      .upsert(transcriptData, { 
        onConflict: 'storyteller_id',
        ignoreDuplicates: false 
      });

    if (error) {
      throw new Error(`Failed to create transcript: ${error.message}`);
    }
  }

  async createStory(airtableStory: AirtableStory, storyteller: any): Promise<void> {
    // Check if story already exists
    const { data: existingStory } = await supabase
      .from('stories')
      .select('id')
      .eq('title', airtableStory.fields.Title)
      .eq('storyteller_id', storyteller.id)
      .maybeSingle();

    if (existingStory) {
      console.log(`   ℹ️  Story already exists: "${airtableStory.fields.Title}"`);
      return;
    }

    // Download and upload story image if exists
    let imageUrl = null;
    if (airtableStory.fields['Story Image']?.[0]) {
      try {
        imageUrl = await this.uploadStoryImage(
          airtableStory.fields['Story Image'][0], 
          storyteller.id,
          airtableStory.fields['Story ID']
        );
      } catch (error) {
        console.warn(`   ⚠️  Failed to upload image for story "${airtableStory.fields.Title}":`, error);
      }
    }

    const storyData = {
      storyteller_id: storyteller.id,
      title: airtableStory.fields.Title,
      
      // Content (this is the PUBLISHED content, not the raw transcript)
      story_content: airtableStory.fields['Story Transcript'] || 'Story content to be developed from transcript',
      story_type: 'life-experience',
      
      // Media
      featured_image_url: imageUrl,
      video_url: airtableStory.fields['Video Story Link'],
      video_embed_code: airtableStory.fields['Video Embed Code'],
      
      // Status and permissions  
      status: this.mapStatus(airtableStory.fields.Status),
      visibility: this.mapPermissions(airtableStory.fields.Permissions),
      
      // Metadata
      location: airtableStory.fields['Location (from Media)']?.[0] || storyteller.location,
      project: airtableStory.fields['Project (from Storytellers)']?.[0],
      
      // Source tracking
      airtable_story_id: airtableStory.fields['Story ID'],
      migrated_from_airtable: true,
      
      // Timestamps
      created_at: airtableStory.fields.Created,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('stories')
      .insert(storyData);

    if (error) {
      throw new Error(`Failed to create story: ${error.message}`);
    }
  }

  async uploadStoryImage(imageAttachment: any, storytellerId: string, storyId: string): Promise<string> {
    const imageUrl = imageAttachment.url;
    const filename = imageAttachment.filename || `story-${storyId}-image.jpg`;
    
    // Download image from Airtable
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    
    // Upload to Supabase Storage
    const storagePath = `stories/${storytellerId}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('story-images')
      .upload(storagePath, imageBuffer, {
        contentType: imageAttachment.type || 'image/jpeg',
        upsert: true
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('story-images')
      .getPublicUrl(storagePath);

    return publicUrl.publicUrl;
  }

  mapStatus(airtableStatus: string): string {
    switch (airtableStatus?.toLowerCase()) {
      case 'published':
      case 'live':
        return 'published';
      case 'draft':
        return 'draft';
      case 'review':
        return 'review';
      default:
        return 'draft';
    }
  }

  mapPermissions(airtablePermissions: string): string {
    switch (airtablePermissions?.toLowerCase()) {
      case 'public':
        return 'public';
      case 'community':
        return 'community';
      case 'private':
        return 'private';
      default:
        return 'private'; // Default to most restrictive
    }
  }

  async verifyMigration(): Promise<void> {
    console.log('🔍 Verifying migration success...');

    // Count final results
    const { data: finalStories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, storyteller_id', { count: 'exact', head: true });

    const { data: finalTranscripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('id, storyteller_id', { count: 'exact', head: true });

    if (storiesError) console.error('Stories verification error:', storiesError);
    if (transcriptsError) console.error('Transcripts verification error:', transcriptsError);

    console.log(`\n📊 FINAL STATE:`);
    console.log(`   📖 Stories in Supabase: ${finalStories?.length || 0} (should be 48+)`);
    console.log(`   📝 Transcripts in Supabase: ${finalTranscripts?.length || 0}`);

    if ((finalStories?.length || 0) >= 48) {
      console.log('✅ SUCCESS: All 48+ stories successfully migrated!');
    } else {
      console.warn(`⚠️  WARNING: Only ${finalStories?.length || 0} stories found, expected 48+`);
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. ✅ Review transcript privacy settings');
    console.log('2. ✅ Set up AI analysis to process transcripts (not stories)');
    console.log('3. ✅ Get storyteller consent for AI analysis of transcripts');
    console.log('4. ✅ Create themes/quotes FROM transcripts');
    console.log('5. ✅ Enable story creation FROM transcript insights');
  }
}

// For direct execution
const migration = new Complete48StoriesMigration();
migration.runCompleteMigration()
  .then(() => {
    console.log('\n🎉 Complete 48 Stories Migration finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

export default Complete48StoriesMigration;