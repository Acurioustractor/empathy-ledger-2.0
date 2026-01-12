/**
 * MIGRATE AIRTABLE DATA TO STORYTELLER-CENTRIC SCHEMA
 * Imports Storytellers and Stories tables with proper relationships
 */

import { createClient } from '@supabase/supabase-js';
import Airtable from 'airtable';

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://tednluwflfhxyucgwigh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Airtable setup
const airtableApiKey = process.env.AIRTABLE_API_KEY || '';
const airtableBaseId = process.env.AIRTABLE_BASE_ID || '';

if (!airtableApiKey || !airtableBaseId) {
  console.error('❌ Missing Airtable credentials. Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID');
  process.exit(1);
}

const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId);

// Track mappings for relationships
const storytellerMap = new Map<string, string>(); // Airtable ID -> Supabase ID
const organisationMap = new Map<string, string>();
const locationMap = new Map<string, string>();
const projectMap = new Map<string, string>();

// Migration statistics
const stats = {
  organisations: { total: 0, migrated: 0, failed: 0 },
  locations: { total: 0, migrated: 0, failed: 0 },
  storytellers: { total: 0, migrated: 0, failed: 0 },
  stories: { total: 0, migrated: 0, failed: 0 },
  transcripts: { total: 0, migrated: 0, failed: 0 }
};

async function migrateFromAirtable() {
  console.log('🚀 STARTING STORYTELLER-CENTRIC MIGRATION FROM AIRTABLE');
  console.log('='.repeat(80));
  console.log('Philosophy: Every piece of data traces back to a real person');
  console.log('='.repeat(80));

  try {
    // Step 1: Extract unique organisations
    await extractOrganisations();

    // Step 2: Extract unique projects
    await extractProjects();

    // Step 3: Extract unique locations
    await extractLocations();

    // Step 4: Migrate Storytellers (CRITICAL)
    await migrateStorytellers();

    // Step 5: Migrate Stories (linked to Storytellers)
    await migrateStories();

    // Step 6: Process transcripts from Media field
    await processTranscripts();

    // Step 7: Validate migration
    await validateMigration();

    // Step 8: Generate migration report
    await generateReport();

  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
    throw error;
  }
}

async function extractOrganisations() {
  console.log('\n🏢 EXTRACTING ORGANISATIONS');
  console.log('-'.repeat(50));

  try {
    // Get all unique organisations from Storytellers
    const storytellers = await base('Storytellers').select({
      fields: ['Organisation']
    }).all();

    const uniqueOrgs = new Set<string>();
    storytellers.forEach(record => {
      if (record.fields.Organisation) {
        uniqueOrgs.add(record.fields.Organisation as string);
      }
    });

    stats.organisations.total = uniqueOrgs.size;

    for (const orgName of uniqueOrgs) {
      const { data, error } = await supabase
        .from('organisations')
        .upsert({
          name: orgName,
          description: `Imported from Airtable`,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'name'
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create organisation "${orgName}":`, error.message);
        stats.organisations.failed++;
      } else {
        organisationMap.set(orgName, data.id);
        stats.organisations.migrated++;
        console.log(`✅ Organisation: ${orgName}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to extract organisations:', error);
  }
}

async function extractProjects() {
  console.log('\n📁 EXTRACTING PROJECTS');
  console.log('-'.repeat(50));

  try {
    // Get all unique projects from Storytellers
    const storytellers = await base('Storytellers').select({
      fields: ['Project']
    }).all();

    const uniqueProjects = new Set<string>();
    storytellers.forEach(record => {
      if (record.fields.Project) {
        uniqueProjects.add(record.fields.Project as string);
      }
    });

    stats.locations.total += uniqueProjects.size; // Using locations stats temporarily

    for (const projectName of uniqueProjects) {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: `Imported from Airtable`,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create project "${projectName}":`, error.message);
      } else {
        projectMap.set(projectName, data.id);
        console.log(`✅ Project: ${projectName}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to extract projects:', error);
  }
}

async function extractLocations() {
  console.log('\n📍 EXTRACTING LOCATIONS');
  console.log('-'.repeat(50));

  try {
    // Get all unique locations from Storytellers
    const storytellers = await base('Storytellers').select({
      fields: ['Location']
    }).all();

    const uniqueLocations = new Set<string>();
    storytellers.forEach(record => {
      if (record.fields.Location) {
        uniqueLocations.add(record.fields.Location as string);
      }
    });

    stats.locations.total = uniqueLocations.size;

    for (const locationName of uniqueLocations) {
      // Parse location (assuming format: "City, State" or just "City")
      const parts = locationName.split(',').map(p => p.trim());
      const city = parts[0];
      const state = parts[1] || null;

      const { data, error } = await supabase
        .from('locations')
        .insert({
          name: city,
          city: city,
          state: state,
          country: 'Australia',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create location "${locationName}":`, error.message);
        stats.locations.failed++;
      } else {
        locationMap.set(locationName, data.id);
        stats.locations.migrated++;
        console.log(`✅ Location: ${locationName}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to extract locations:', error);
  }
}

async function migrateStorytellers() {
  console.log('\n👥 MIGRATING STORYTELLERS (CRITICAL STEP)');
  console.log('-'.repeat(50));
  console.log('Only migrating storytellers with assumed consent (being in Airtable)');

  try {
    const storytellers = await base('Storytellers').select().all();
    stats.storytellers.total = storytellers.length;

    for (const record of storytellers) {
      const fields = record.fields;

      // Get related IDs
      const orgId = fields.Organisation ? organisationMap.get(fields.Organisation as string) : null;
      const projectId = fields.Project ? projectMap.get(fields.Project as string) : null;
      const locationId = fields.Location ? locationMap.get(fields.Location as string) : null;

      // Extract profile image URL
      const profileImageUrl = fields['File Profile Image'] && Array.isArray(fields['File Profile Image']) 
        ? (fields['File Profile Image'][0] as any)?.url 
        : null;

      // Create storyteller
      const { data, error } = await supabase
        .from('storytellers')
        .insert({
          full_name: fields.Name,
          email: fields.Email || null,
          phone_number: fields['Phone Number'] || null,
          role: fields.Role || null,
          profile_image_url: profileImageUrl,
          organisation_id: orgId,
          project_id: projectId,
          location_id: locationId,
          consent_given: true, // Assuming consent if they're in Airtable
          consent_date: fields.Created || new Date().toISOString(),
          privacy_preferences: {
            public_display: true,
            show_photo: !!profileImageUrl,
            show_location: !!fields.Location,
            show_organisation: !!fields.Organisation
          },
          airtable_record_id: record.id,
          created_at: fields.Created || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to migrate ${fields.Name}:`, error.message);
        stats.storytellers.failed++;
      } else {
        storytellerMap.set(record.id, data.id);
        stats.storytellers.migrated++;
        console.log(`✅ Storyteller: ${fields.Name} (${fields.Organisation || 'No org'})`);

        // Process transcripts if Media field exists
        if (fields.Media && Array.isArray(fields.Media)) {
          for (const mediaId of fields.Media) {
            await processMediaTranscript(data.id, mediaId as string);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to migrate storytellers:', error);
  }
}

async function processMediaTranscript(storytellerId: string, mediaId: string) {
  try {
    // In a real implementation, you would fetch the media/transcript from Airtable
    // For now, we'll create a placeholder
    const { error } = await supabase
      .from('transcripts')
      .insert({
        storyteller_id: storytellerId,
        title: `Transcript from Airtable Media`,
        transcript_text: '', // Would be populated from actual media
        media_url: '', // Would be the actual media URL
        airtable_media_id: mediaId,
        processed: false,
        created_at: new Date().toISOString()
      });

    if (!error) {
      stats.transcripts.migrated++;
    }
  } catch (error) {
    console.error(`❌ Failed to process media transcript:`, error);
  }
}

async function migrateStories() {
  console.log('\n📖 MIGRATING STORIES');
  console.log('-'.repeat(50));
  console.log('CRITICAL: Every story must link to a storyteller');

  try {
    const stories = await base('Stories').select().all();
    stats.stories.total = stories.length;

    for (const record of stories) {
      const fields = record.fields;

      // CRITICAL: Must have a storyteller
      if (!fields.Storytellers || !Array.isArray(fields.Storytellers) || fields.Storytellers.length === 0) {
        console.warn(`⚠️  Skipping story "${fields.Title}" - no storyteller linked`);
        stats.stories.failed++;
        continue;
      }

      // Get the primary storyteller (first one)
      const airtableStorytellerId = fields.Storytellers[0] as string;
      const storytellerId = storytellerMap.get(airtableStorytellerId);

      if (!storytellerId) {
        console.error(`❌ No storyteller found for story "${fields.Title}"`);
        stats.stories.failed++;
        continue;
      }

      // Extract story image URL
      const storyImageUrl = fields['Story Image'] && Array.isArray(fields['Story Image'])
        ? (fields['Story Image'][0] as any)?.url
        : null;

      // Create story
      const { error } = await supabase
        .from('stories')
        .insert({
          storyteller_id: storytellerId, // CRITICAL LINK
          title: fields.Title || 'Untitled Story',
          story_copy: fields['Story Copy'] || null,
          story_transcript: fields['Story Transcript'] || null,
          story_image_url: storyImageUrl,
          video_story_link: fields['Video Story Link'] || null,
          video_embed_code: fields['Video Embed Code'] || null,
          is_published: true, // Assuming published if in Airtable
          published_at: fields.Created || new Date().toISOString(),
          airtable_story_id: fields['Story ID'] || record.id,
          created_at: fields.Created || new Date().toISOString()
        });

      if (error) {
        console.error(`❌ Failed to migrate story "${fields.Title}":`, error.message);
        stats.stories.failed++;
      } else {
        stats.stories.migrated++;
        
        // Get storyteller name for logging
        const { data: storyteller } = await supabase
          .from('storytellers')
          .select('full_name')
          .eq('id', storytellerId)
          .single();
        
        console.log(`✅ Story: "${fields.Title}" → ${storyteller?.full_name || 'Unknown'}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to migrate stories:', error);
  }
}

async function processTranscripts() {
  console.log('\n📝 PROCESSING TRANSCRIPTS');
  console.log('-'.repeat(50));
  console.log('Would extract themes and quotes from transcripts...');
  // This would be implemented with actual NLP processing
}

async function validateMigration() {
  console.log('\n🔍 VALIDATING MIGRATION');
  console.log('-'.repeat(50));

  // Check for orphaned stories
  const { count: orphanedStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact' })
    .is('storyteller_id', null);

  if (orphanedStories && orphanedStories > 0) {
    console.error(`❌ CRITICAL: Found ${orphanedStories} orphaned stories!`);
  } else {
    console.log('✅ No orphaned stories');
  }

  // Check consent status
  const { data: consentStats } = await supabase
    .from('storytellers')
    .select('consent_given');

  const withConsent = consentStats?.filter(s => s.consent_given).length || 0;
  const withoutConsent = consentStats?.filter(s => !s.consent_given).length || 0;

  console.log(`✅ ${withConsent} storytellers with consent`);
  if (withoutConsent > 0) {
    console.log(`⚠️  ${withoutConsent} storytellers without explicit consent`);
  }

  // Check public display preferences
  const { data: publicStorytellers } = await supabase
    .from('storytellers')
    .select('privacy_preferences')
    .eq('consent_given', true)
    .eq('privacy_preferences->public_display', 'true');

  console.log(`✅ ${publicStorytellers?.length || 0} storytellers with public display enabled`);
}

async function generateReport() {
  console.log('\n📊 MIGRATION REPORT');
  console.log('='.repeat(80));

  console.log('\nORGANISATIONS:');
  console.log(`  Total: ${stats.organisations.total}`);
  console.log(`  Migrated: ${stats.organisations.migrated}`);
  console.log(`  Failed: ${stats.organisations.failed}`);

  console.log('\nLOCATIONS:');
  console.log(`  Total: ${stats.locations.total}`);
  console.log(`  Migrated: ${stats.locations.migrated}`);
  console.log(`  Failed: ${stats.locations.failed}`);

  console.log('\nSTORYTELLERS:');
  console.log(`  Total: ${stats.storytellers.total}`);
  console.log(`  Migrated: ${stats.storytellers.migrated}`);
  console.log(`  Failed: ${stats.storytellers.failed}`);

  console.log('\nSTORIES:');
  console.log(`  Total: ${stats.stories.total}`);
  console.log(`  Migrated: ${stats.stories.migrated}`);
  console.log(`  Failed: ${stats.stories.failed}`);

  console.log('\nTRANSCRIPTS:');
  console.log(`  Created: ${stats.transcripts.migrated}`);

  const successRate = ((stats.storytellers.migrated + stats.stories.migrated) / 
                      (stats.storytellers.total + stats.stories.total) * 100).toFixed(1);

  console.log(`\n✅ Overall Success Rate: ${successRate}%`);

  if (stats.storytellers.failed > 0 || stats.stories.failed > 0) {
    console.log('\n⚠️  ATTENTION: Some records failed to migrate.');
    console.log('Please check the error logs above for details.');
  }

  console.log('\n🎉 MIGRATION COMPLETE!');
  console.log('Next steps:');
  console.log('1. Verify data in Supabase dashboard');
  console.log('2. Test CMS integration');
  console.log('3. Process transcripts for themes and quotes');
}

// Run the migration
migrateFromAirtable().catch(console.error);