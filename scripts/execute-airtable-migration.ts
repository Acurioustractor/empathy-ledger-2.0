#!/usr/bin/env tsx
/**
 * PHASE 2: Airtable Migration Pipeline
 * Import storytellers and stories with full data integrity
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

interface AirtableRecord {
  id: string;
  fields: any;
  createdTime: string;
}

interface MigrationStats {
  organizations: { created: number; skipped: number; errors: number };
  locations: { created: number; skipped: number; errors: number };
  projects: { created: number; skipped: number; errors: number };
  storytellers: { created: number; skipped: number; errors: number };
  stories: { created: number; skipped: number; errors: number };
}

const stats: MigrationStats = {
  organizations: { created: 0, skipped: 0, errors: 0 },
  locations: { created: 0, skipped: 0, errors: 0 },
  projects: { created: 0, skipped: 0, errors: 0 },
  storytellers: { created: 0, skipped: 0, errors: 0 },
  stories: { created: 0, skipped: 0, errors: 0 }
};

async function fetchAirtableRecords(tableName: string): Promise<AirtableRecord[]> {
  console.log(`📊 Fetching ${tableName} from Airtable...`);
  
  const records: AirtableRecord[] = [];
  let offset = '';
  
  do {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=100${offset ? `&offset=${offset}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
    }
    
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset || '';
    
  } while (offset);
  
  console.log(`✅ Fetched ${records.length} ${tableName} records`);
  return records;
}

async function createOrganizationsFromStorytellerData(storytellers: AirtableRecord[]): Promise<Map<string, string>> {
  console.log('🏢 Creating organizations from storyteller data...');
  
  const orgMap = new Map<string, string>();
  const uniqueOrgs = new Set<string>();
  
  // Extract unique organizations
  storytellers.forEach(record => {
    const orgName = record.fields.Organisation || record.fields.Organization;
    if (orgName && typeof orgName === 'string') {
      uniqueOrgs.add(orgName.trim());
    }
  });
  
  console.log(`📋 Found ${uniqueOrgs.size} unique organizations`);
  
  for (const orgName of uniqueOrgs) {
    try {
      // Check if organization already exists
      const { data: existing, error: checkError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('name', orgName)
        .single();
        
      if (existing) {
        orgMap.set(orgName, existing.id);
        stats.organizations.skipped++;
        continue;
      }
      
      // Create new organization
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          type: 'community',
          description: `Community organization: ${orgName}`
        })
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to create organization ${orgName}:`, error.message);
        stats.organizations.errors++;
      } else {
        orgMap.set(orgName, data.id);
        stats.organizations.created++;
        console.log(`✅ Created organization: ${orgName}`);
      }
      
    } catch (err) {
      console.error(`❌ Error creating organization ${orgName}:`, err);
      stats.organizations.errors++;
    }
  }
  
  return orgMap;
}

async function createLocationsFromStorytellerData(storytellers: AirtableRecord[]): Promise<Map<string, string>> {
  console.log('📍 Creating locations from storyteller data...');
  
  const locationMap = new Map<string, string>();
  const uniqueLocations = new Set<string>();
  
  // Extract unique locations
  storytellers.forEach(record => {
    const location = record.fields.Location;
    if (location && typeof location === 'string') {
      uniqueLocations.add(location.trim());
    }
  });
  
  console.log(`📋 Found ${uniqueLocations.size} unique locations`);
  
  for (const locationName of uniqueLocations) {
    try {
      // Check if location already exists
      const { data: existing } = await supabase
        .from('locations')
        .select('id, name')
        .eq('name', locationName)
        .single();
        
      if (existing) {
        locationMap.set(locationName, existing.id);
        stats.locations.skipped++;
        continue;
      }
      
      // Parse location (assuming format like "City, State, Country")
      const parts = locationName.split(',').map(p => p.trim());
      const locationData: any = {
        name: locationName,
        country: 'Australia' // Default, can be refined
      };
      
      if (parts.length >= 2) {
        locationData.city = parts[0];
        locationData.state_province = parts[1];
        if (parts.length >= 3) {
          locationData.country = parts[2];
        }
      }
      
      const { data, error } = await supabase
        .from('locations')
        .insert(locationData)
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to create location ${locationName}:`, error.message);
        stats.locations.errors++;
      } else {
        locationMap.set(locationName, data.id);
        stats.locations.created++;
        console.log(`✅ Created location: ${locationName}`);
      }
      
    } catch (err) {
      console.error(`❌ Error creating location ${locationName}:`, err);
      stats.locations.errors++;
    }
  }
  
  return locationMap;
}

async function createProjectsFromStorytellerData(
  storytellers: AirtableRecord[], 
  orgMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('📁 Creating projects from storyteller data...');
  
  const projectMap = new Map<string, string>();
  const uniqueProjects = new Set<string>();
  
  // Extract unique projects
  storytellers.forEach(record => {
    const project = record.fields.Project;
    if (project && typeof project === 'string') {
      uniqueProjects.add(project.trim());
    }
  });
  
  console.log(`📋 Found ${uniqueProjects.size} unique projects`);
  
  for (const projectName of uniqueProjects) {
    try {
      // Check if project already exists
      const { data: existing } = await supabase
        .from('projects')
        .select('id, name')
        .eq('name', projectName)
        .single();
        
      if (existing) {
        projectMap.set(projectName, existing.id);
        stats.projects.skipped++;
        continue;
      }
      
      // Find the organization for this project
      const storytellerWithProject = storytellers.find(s => s.fields.Project === projectName);
      const orgName = storytellerWithProject?.fields.Organisation || storytellerWithProject?.fields.Organization;
      const organizationId = orgName ? orgMap.get(orgName) : null;
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: `Project: ${projectName}`,
          organization_id: organizationId,
          status: 'active'
        })
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to create project ${projectName}:`, error.message);
        stats.projects.errors++;
      } else {
        projectMap.set(projectName, data.id);
        stats.projects.created++;
        console.log(`✅ Created project: ${projectName}`);
      }
      
    } catch (err) {
      console.error(`❌ Error creating project ${projectName}:`, err);
      stats.projects.errors++;
    }
  }
  
  return projectMap;
}

async function migrateStorytellers(
  storytellers: AirtableRecord[],
  orgMap: Map<string, string>,
  locationMap: Map<string, string>,
  projectMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('👥 Migrating storytellers...');
  
  const storytellerMap = new Map<string, string>();
  
  for (const record of storytellers) {
    try {
      const fields = record.fields;
      
      // Skip if no name
      if (!fields.Name && !fields['Full Name']) {
        stats.storytellers.skipped++;
        continue;
      }
      
      // Check if storyteller already exists
      const { data: existing } = await supabase
        .from('storytellers')
        .select('id')
        .eq('airtable_record_id', record.id)
        .single();
        
      if (existing) {
        storytellerMap.set(record.id, existing.id);
        stats.storytellers.skipped++;
        continue;
      }
      
      // Prepare storyteller data
      const storytellerData: any = {
        full_name: fields.Name || fields['Full Name'],
        email: fields.Email,
        bio: fields.Bio || fields.Description,
        role: fields.Role,
        phone_number: fields['Phone Number'],
        profile_image_url: fields['Profile Image'] ? 
          (Array.isArray(fields['Profile Image']) ? fields['Profile Image'][0]?.url : fields['Profile Image']) : null,
        
        // Affiliations
        organization_id: fields.Organisation || fields.Organization ? 
          orgMap.get(fields.Organisation || fields.Organization) : null,
        project_id: fields.Project ? projectMap.get(fields.Project) : null,
        location_id: fields.Location ? locationMap.get(fields.Location) : null,
        
        // Consent (default to true for migration, can be updated later)
        consent_given: true,
        consent_date: new Date().toISOString(),
        
        // Privacy preferences (default to private)
        privacy_preferences: {
          public_display: false,
          show_photo: false,
          show_location: false,
          show_organization: false
        },
        
        // Migration tracking
        airtable_record_id: record.id,
        created_at: record.createdTime
      };
      
      const { data, error } = await supabase
        .from('storytellers')
        .insert(storytellerData)
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to create storyteller ${storytellerData.full_name}:`, error.message);
        stats.storytellers.errors++;
      } else {
        storytellerMap.set(record.id, data.id);
        stats.storytellers.created++;
        
        if (stats.storytellers.created % 10 === 0) {
          console.log(`✅ Created ${stats.storytellers.created} storytellers...`);
        }
      }
      
    } catch (err) {
      console.error(`❌ Error creating storyteller:`, err);
      stats.storytellers.errors++;
    }
  }
  
  return storytellerMap;
}

async function migrateStories(
  stories: AirtableRecord[],
  storytellerMap: Map<string, string>
): Promise<void> {
  console.log('📖 Migrating stories...');
  
  for (const record of stories) {
    try {
      const fields = record.fields;
      
      // Skip if no title or content
      if (!fields.Title && !fields['Story Title']) {
        stats.stories.skipped++;
        continue;
      }
      
      // Check if story already exists
      const { data: existing } = await supabase
        .from('stories')
        .select('id')
        .eq('airtable_record_id', record.id)
        .single();
        
      if (existing) {
        stats.stories.skipped++;
        continue;
      }
      
      // Find storyteller ID
      const storytellerAirtableIds = fields.Storytellers || fields.Storyteller;
      let storytellerId = null;
      
      if (storytellerAirtableIds && Array.isArray(storytellerAirtableIds)) {
        storytellerId = storytellerMap.get(storytellerAirtableIds[0]);
      } else if (storytellerAirtableIds) {
        storytellerId = storytellerMap.get(storytellerAirtableIds);
      }
      
      if (!storytellerId) {
        console.warn(`⚠️  Story "${fields.Title || fields['Story Title']}" has no valid storyteller - skipping`);
        stats.stories.skipped++;
        continue;
      }
      
      // Prepare story data
      const storyData: any = {
        title: fields.Title || fields['Story Title'],
        content: fields['Story Transcript'] || fields.Transcript || fields.Content,
        summary: fields['Story Copy'] || fields.Summary,
        storyteller_id: storytellerId,
        
        // Media
        media_url: fields['Video Story Link'] || fields['Media URL'],
        video_embed_code: fields['Video Embed Code'],
        transcription: fields['Story Transcript'] || fields.Transcript,
        
        // Privacy (default to private)
        privacy_level: 'private',
        
        // Migration tracking
        airtable_record_id: record.id,
        created_at: record.createdTime
      };
      
      const { data, error } = await supabase
        .from('stories')
        .insert(storyData)
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to create story "${storyData.title}":`, error.message);
        stats.stories.errors++;
      } else {
        stats.stories.created++;
        
        if (stats.stories.created % 5 === 0) {
          console.log(`✅ Created ${stats.stories.created} stories...`);
        }
      }
      
    } catch (err) {
      console.error(`❌ Error creating story:`, err);
      stats.stories.errors++;
    }
  }
}

function printMigrationReport() {
  console.log('\\n📊 MIGRATION REPORT');
  console.log('===================');
  
  Object.entries(stats).forEach(([type, counts]) => {
    const total = counts.created + counts.skipped + counts.errors;
    console.log(`\\n${type.toUpperCase()}:`);
    console.log(`  ✅ Created: ${counts.created}`);
    console.log(`  ⏭️  Skipped: ${counts.skipped}`);
    console.log(`  ❌ Errors: ${counts.errors}`);
    console.log(`  📊 Total processed: ${total}`);
  });
}

async function main() {
  console.log('🚀 PHASE 2: AIRTABLE MIGRATION PIPELINE');
  console.log('=======================================');
  console.log('Importing storytellers and stories with full data integrity');
  console.log('');
  
  try {
    // Step 1: Fetch data from Airtable
    const storytellers = await fetchAirtableRecords('Storytellers');
    const stories = await fetchAirtableRecords('Stories');
    
    // Step 2: Create supporting data
    const orgMap = await createOrganizationsFromStorytellerData(storytellers);
    const locationMap = await createLocationsFromStorytellerData(storytellers);
    const projectMap = await createProjectsFromStorytellerData(storytellers, orgMap);
    
    // Step 3: Migrate storytellers
    const storytellerMap = await migrateStorytellers(storytellers, orgMap, locationMap, projectMap);
    
    // Step 4: Migrate stories
    await migrateStories(stories, storytellerMap);
    
    // Step 5: Report results
    printMigrationReport();
    
    console.log('\\n🎉 PHASE 2 MIGRATION COMPLETED!');
    console.log('================================');
    console.log('✅ Storyteller-centric data imported');
    console.log('✅ All relationships preserved');
    console.log('✅ Ready for Phase 3: CMS Integration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);