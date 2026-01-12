/**
 * MIGRATION STRATEGY: Current Supabase → Philosophy-Aligned Schema
 * 
 * This script migrates your existing storyteller data to the new empathy-centered schema
 * while preserving all data and enhancing it with dignity-focused structure.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MigrationPlan {
  phase: string;
  description: string;
  tables: string[];
  preserveData: boolean;
  requiredConsent: boolean;
}

const MIGRATION_PHASES: MigrationPlan[] = [
  {
    phase: "1-foundation",
    description: "Create new schema alongside existing tables",
    tables: ["organizations", "theme_taxonomy"],
    preserveData: true,
    requiredConsent: false
  },
  {
    phase: "2-storytellers",
    description: "Migrate storyteller profiles with privacy controls",
    tables: ["storytellers"],
    preserveData: true,
    requiredConsent: true
  },
  {
    phase: "3-stories",
    description: "Migrate story content with enhanced consent tracking",
    tables: ["stories", "consent_logs"],
    preserveData: true,
    requiredConsent: true
  },
  {
    phase: "4-analysis",
    description: "Create AI analysis structure (new analyses only)",
    tables: ["storyteller_ai_analysis", "story_themes", "story_quotes"],
    preserveData: false,
    requiredConsent: true
  },
  {
    phase: "5-connections",
    description: "Enable community connections (opt-in only)",
    tables: ["community_connections"],
    preserveData: false,
    requiredConsent: true
  }
];

export class EmpathySchemaMigration {
  
  constructor() {
    console.log('🌟 Empathy Ledger Schema Migration Tool');
    console.log('Migrating with dignity, consent, and community at center');
  }

  async runFullMigration(): Promise<void> {
    console.log('\n📋 MIGRATION PLAN:');
    MIGRATION_PHASES.forEach((phase, index) => {
      console.log(`${index + 1}. ${phase.phase}: ${phase.description}`);
    });

    console.log('\n🚀 Starting migration...\n');

    for (const phase of MIGRATION_PHASES) {
      await this.runPhase(phase);
    }

    console.log('\n✅ Migration completed successfully!');
    await this.generateMigrationReport();
  }

  async runPhase(phase: MigrationPlan): Promise<void> {
    console.log(`\n🔄 PHASE: ${phase.phase.toUpperCase()}`);
    console.log(`📝 ${phase.description}`);

    try {
      switch (phase.phase) {
        case '1-foundation':
          await this.migrateFoundation();
          break;
        case '2-storytellers':
          await this.migrateStorytellers();
          break;
        case '3-stories':
          await this.migrateStories();
          break;
        case '4-analysis':
          await this.setupAnalysisStructure();
          break;
        case '5-connections':
          await this.setupCommunityConnections();
          break;
      }
      console.log(`✅ Phase ${phase.phase} completed successfully`);
    } catch (error) {
      console.error(`❌ Phase ${phase.phase} failed:`, error);
      throw error;
    }
  }

  /**
   * PHASE 1: Foundation - Organizations & Taxonomy
   */
  async migrateFoundation(): Promise<void> {
    console.log('🏗️  Creating foundation tables...');

    // Deploy the new schema
    await this.deploySchema();

    // Create default organization for existing data
    const defaultOrg = await this.createDefaultOrganization();
    console.log(`✅ Created default organization: ${defaultOrg.id}`);

    console.log('✅ Foundation migration complete');
  }

  async deploySchema(): Promise<void> {
    // Read and execute the schema file
    const fs = require('fs').promises;
    const path = require('path');
    
    const schemaPath = path.join(process.cwd(), 'scripts/sql/empathy-centered-schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    
    // Execute schema in chunks to handle large SQL file
    const statements = schemaSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error && !error.message.includes('already exists')) {
          console.error('Schema deployment error:', error);
          throw error;
        }
      }
    }
    
    console.log('✅ Schema deployed successfully');
  }

  async createDefaultOrganization(): Promise<any> {
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: 'Empathy Ledger Community',
        slug: 'empathy-ledger-community',
        organization_type: 'community',
        mission_statement: 'Honoring storyteller wisdom through empathy-centered digital storytelling',
        values: ['dignity', 'consent', 'community', 'empowerment', 'cultural-humility'],
        focus_areas: ['storytelling', 'community-connection', 'healing', 'wisdom-sharing'],
        storytelling_approach: 'strengths-based',
        privacy_philosophy: 'storyteller-controlled',
        status: 'active',
        onboarding_stage: 'production'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * PHASE 2: Migrate Storytellers with Enhanced Privacy
   */
  async migrateStorytellers(): Promise<void> {
    console.log('👥 Migrating storytellers with dignity...');

    // Get default organization
    const { data: defaultOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'empathy-ledger-community')
      .single();

    if (!defaultOrg) throw new Error('Default organization not found');

    // Get existing storytellers
    const { data: existingStorytellers, error } = await supabase
      .from('storytellers')
      .select('*');

    if (error) throw error;

    console.log(`📊 Found ${existingStorytellers?.length || 0} existing storytellers`);

    if (!existingStorytellers?.length) {
      console.log('ℹ️  No existing storytellers to migrate');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const storyteller of existingStorytellers) {
      try {
        await this.migrateIndividualStoryteller(storyteller, defaultOrg.id);
        migratedCount++;
        
        if (migratedCount % 10 === 0) {
          console.log(`📈 Migrated ${migratedCount}/${existingStorytellers.length} storytellers`);
        }
      } catch (error) {
        console.error(`❌ Failed to migrate storyteller ${storyteller.id}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Storyteller migration complete: ${migratedCount} succeeded, ${errorCount} errors`);
  }

  async migrateIndividualStoryteller(oldStoryteller: any, organizationId: string): Promise<void> {
    // Check if already migrated (new schema has different structure)
    const { data: existing } = await supabase
      .from('storytellers')
      .select('id')
      .eq('id', oldStoryteller.id)
      .maybeSingle();

    // If this ID exists in new schema format, skip
    if (existing && 'organization_id' in existing) {
      return;
    }

    // Map old schema to new empathy-centered schema
    const newStoryteller = {
      id: oldStoryteller.id, // Preserve existing ID
      organization_id: organizationId,
      preferred_name: oldStoryteller.name || oldStoryteller.first_name || 'Community Member',
      full_name: oldStoryteller.full_name || null,
      pronouns: oldStoryteller.pronouns || 'they/them',
      
      // Preserve existing location data
      country_of_origin: oldStoryteller.country,
      current_location: oldStoryteller.location,
      
      // Map existing story context
      story_context: oldStoryteller.bio || 'Sharing wisdom through storytelling',
      
      // Enhanced privacy settings (default to most private)
      privacy_settings: {
        profileVisibility: 'private',
        storyVisibility: 'private',
        photoSharing: false,
        nameSharing: 'first-name-only',
        locationSharing: 'country-only',
        themeSharing: false, // Will require new consent
        quoteSharing: false, // Will require new consent
        connectionSharing: false // Will require new consent
      },
      
      // Default consent status (will need to re-consent for new features)
      consent_record: {
        aiAnalysis: null, // Will need new consent
        storySharing: oldStoryteller.consent_given ? 'given' : null,
        researchParticipation: null,
        publicQuotes: null,
        communityConnections: null,
        mediaStorage: oldStoryteller.media_files ? 'given' : null
      },
      
      // Map existing metadata
      stories_shared: oldStoryteller.stories_count || 0,
      last_story_date: oldStoryteller.last_story_date,
      
      // Default to active status
      status: 'active',
      onboarding_stage: 'complete', // They've already been through old process
      
      // Preserve creation date
      created_at: oldStoryteller.created_at,
      updated_at: new Date().toISOString()
    };

    // Insert into new schema
    const { error } = await supabase
      .from('storytellers')
      .upsert(newStoryteller);

    if (error) throw error;

    // Log consent requirement for new features
    await this.logConsentRequirement(oldStoryteller.id, organizationId, [
      'ai-analysis',
      'quote-sharing', 
      'community-connections'
    ]);
  }

  async logConsentRequirement(storytellerId: string, organizationId: string, consentTypes: string[]): Promise<void> {
    const consentLogs = consentTypes.map(type => ({
      storyteller_id: storytellerId,
      organization_id: organizationId,
      consent_type: type,
      consent_status: 'pending',
      consent_method: 'digital',
      consent_scope: `New feature consent required for enhanced ${type.replace('-', ' ')} capabilities`,
      permissions_granted: {},
      restrictions_specified: {},
      informed_consent_provided: false,
      consent_given_date: new Date().toISOString(),
      consent_recorded_date: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('consent_logs')
      .upsert(consentLogs);

    if (error) {
      console.warn(`Warning: Could not log consent requirements for ${storytellerId}:`, error);
    }
  }

  /**
   * PHASE 3: Migrate Stories with Enhanced Consent
   */
  async migrateStories(): Promise<void> {
    console.log('📖 Migrating stories with enhanced consent tracking...');

    // Get existing stories
    const { data: existingStories, error } = await supabase
      .from('stories')
      .select('*');

    if (error) throw error;

    console.log(`📊 Found ${existingStories?.length || 0} existing stories`);

    if (!existingStories?.length) {
      console.log('ℹ️  No existing stories to migrate');
      return;
    }

    let migratedCount = 0;

    for (const story of existingStories) {
      try {
        await this.migrateIndividualStory(story);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Failed to migrate story ${story.id}:`, error);
      }
    }

    console.log(`✅ Story migration complete: ${migratedCount} stories enhanced`);
  }

  async migrateIndividualStory(oldStory: any): Promise<void> {
    // Get storyteller's organization
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select('organization_id')
      .eq('id', oldStory.storyteller_id)
      .single();

    if (!storyteller) {
      console.warn(`Warning: Storyteller ${oldStory.storyteller_id} not found for story ${oldStory.id}`);
      return;
    }

    // Enhance story with empathy-centered structure
    const enhancedStory = {
      ...oldStory, // Preserve existing data
      organization_id: storyteller.organization_id,
      
      // Enhance with strengths-based framing
      story_type: 'life-experience', // Default type
      collection_method: oldStory.audio_url ? 'audio' : 'written',
      
      // Map existing content
      transcript_content: oldStory.transcript || oldStory.story_text,
      story_prompt: 'Share your story in your own words',
      
      // Default to private until new consent given
      visibility_level: 'private',
      sharing_permissions: {
        allowAnalysis: null, // Requires new consent
        allowQuotes: null,   // Requires new consent
        allowThemes: null,   // Requires new consent
        allowConnections: null, // Requires new consent
        allowResearch: null  // Requires new consent
      },
      
      // Safety and review
      safety_review_status: 'approved', // Assume existing stories were reviewed
      ready_for_analysis: false, // Will require new consent
      
      // Preserve timestamps
      collection_date: oldStory.created_at,
      updated_at: new Date().toISOString()
    };

    // Update story with enhanced structure
    const { error } = await supabase
      .from('stories')
      .upsert(enhancedStory);

    if (error) throw error;
  }

  /**
   * PHASE 4: Setup AI Analysis Structure (New Analyses Only)
   */
  async setupAnalysisStructure(): Promise<void> {
    console.log('🧠 Setting up AI analysis structure...');
    
    // The tables are already created by schema deployment
    // This phase ensures the structure is ready for new analyses
    
    console.log('✅ AI analysis structure ready for new analyses');
    console.log('ℹ️  Existing analyses will be regenerated with storyteller consent');
  }

  /**
   * PHASE 5: Setup Community Connections (Opt-in Only)
   */
  async setupCommunityConnections(): Promise<void> {
    console.log('🤝 Setting up community connections framework...');
    
    // Community connections are entirely opt-in and require new consent
    // No migration of existing data needed
    
    console.log('✅ Community connections ready for opt-in participation');
  }

  /**
   * Generate Migration Report
   */
  async generateMigrationReport(): Promise<void> {
    console.log('\n📊 GENERATING MIGRATION REPORT...\n');

    // Count migrated data
    const { data: orgCount } = await supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true });

    const { data: storytellerCount } = await supabase
      .from('storytellers')
      .select('id', { count: 'exact', head: true });

    const { data: storyCount } = await supabase
      .from('stories')
      .select('id', { count: 'exact', head: true });

    const { data: consentCount } = await supabase
      .from('consent_logs')
      .select('id', { count: 'exact', head: true });

    console.log('📈 MIGRATION RESULTS:');
    console.log(`   Organizations: ${orgCount?.length || 0}`);
    console.log(`   Storytellers: ${storytellerCount?.length || 0}`);
    console.log(`   Stories: ${storyCount?.length || 0}`);
    console.log(`   Consent logs: ${consentCount?.length || 0}`);
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. ✅ Reach out to storytellers for new feature consent');
    console.log('2. ✅ Begin AI analysis for consenting storytellers');
    console.log('3. ✅ Enable community connections for interested members');
    console.log('4. ✅ Train staff on new dignity-centered workflows');
    
    console.log('\n🌟 Your Empathy Ledger is now philosophy-aligned!');
    console.log('Every feature puts storyteller dignity and consent first.');
  }
}

// For direct execution
if (require.main === module) {
  const migration = new EmpathySchemaMigration();
  migration.runFullMigration()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export default EmpathySchemamigration;