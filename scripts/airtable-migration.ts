#!/usr/bin/env ts-node

/**
 * EMPATHY LEDGER AIRTABLE TO SUPABASE MIGRATION
 *
 * This script handles the complete migration of data from Airtable to Supabase
 * while preserving relationships, cleaning data, and maintaining privacy.
 */

import { createClient } from '@supabase/supabase-js';
import Airtable from 'airtable';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Types for migration
interface AirtableStory {
  id: string;
  fields: {
    Title?: string;
    Content?: string;
    Category?: string;
    'Story Type'?: string;
    'Date Submitted'?: string;
    'Contributor Email'?: string;
    'Contributor Name'?: string;
    Location?: string;
    'Age Range'?: string;
    Organization?: string[];
    Themes?: string[];
    Status?: string;
    'Privacy Level'?: string;
    'Audio URL'?: string;
    'Video URL'?: string;
    Transcription?: string;
    'Sentiment Score'?: number;
    'Impact Score'?: number;
    'View Count'?: number;
    Featured?: boolean;
    [key: string]: any;
  };
}

interface AirtableOrganization {
  id: string;
  fields: {
    'Organization Name'?: string;
    'Organization Type'?: string;
    Website?: string;
    'Primary Contact Email'?: string;
    'Contact Name'?: string;
    Description?: string;
    Location?: string;
    Active?: boolean;
    [key: string]: any;
  };
}

interface AirtableCommunity {
  id: string;
  fields: {
    'Community Name'?: string;
    Description?: string;
    Location?: string;
    'Geographic Level'?: string;
    Organization?: string[];
    Active?: boolean;
    [key: string]: any;
  };
}

interface MigrationStats {
  profiles: { processed: number; created: number; errors: number };
  organizations: { processed: number; created: number; errors: number };
  communities: { processed: number; created: number; errors: number };
  stories: { processed: number; created: number; errors: number };
  totalDuration: number;
}

class EmpathyLedgerMigration {
  private supabase: any;
  private airtable: any;
  private stats: MigrationStats;
  private migrationLog: string[] = [];
  private errorLog: string[] = [];

  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize Airtable
    this.airtable = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY!,
    }).base(process.env.AIRTABLE_BASE_ID!);

    this.stats = {
      profiles: { processed: 0, created: 0, errors: 0 },
      organizations: { processed: 0, created: 0, errors: 0 },
      communities: { processed: 0, created: 0, errors: 0 },
      stories: { processed: 0, created: 0, errors: 0 },
      totalDuration: 0,
    };
  }

  private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;

    console.log(logMessage);
    this.migrationLog.push(logMessage);

    if (type === 'error') {
      this.errorLog.push(logMessage);
    }
  }

  private async saveLogs() {
    const logsDir = path.join(__dirname, 'migration-logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save migration log
    fs.writeFileSync(
      path.join(logsDir, `migration-${timestamp}.log`),
      this.migrationLog.join('\n')
    );

    // Save error log if there are errors
    if (this.errorLog.length > 0) {
      fs.writeFileSync(
        path.join(logsDir, `errors-${timestamp}.log`),
        this.errorLog.join('\n')
      );
    }

    // Save stats
    fs.writeFileSync(
      path.join(logsDir, `stats-${timestamp}.json`),
      JSON.stringify(this.stats, null, 2)
    );
  }

  private normalizeCategory(category?: string): string {
    if (!category) return 'community';

    const categoryMap: { [key: string]: string } = {
      Health: 'healthcare',
      Healthcare: 'healthcare',
      Medical: 'healthcare',
      Education: 'education',
      Housing: 'housing',
      Youth: 'youth',
      'Young People': 'youth',
      'Elder Care': 'elder_care',
      Seniors: 'elder_care',
      Policy: 'policy',
      Government: 'policy',
      Community: 'community',
      Environment: 'environment',
      Employment: 'employment',
      Jobs: 'employment',
      'Social Services': 'social_services',
    };

    return categoryMap[category] || 'community';
  }

  private normalizePrivacyLevel(level?: string): string {
    if (!level) return 'private';

    const privacyMap: { [key: string]: string } = {
      Public: 'public',
      Community: 'community',
      Organization: 'organization',
      Private: 'private',
    };

    return privacyMap[level] || 'private';
  }

  private normalizeStatus(status?: string): string {
    if (!status) return 'pending';

    const statusMap: { [key: string]: string } = {
      Draft: 'draft',
      Submitted: 'pending',
      Approved: 'approved',
      Published: 'approved',
      Featured: 'featured',
      Archived: 'archived',
    };

    return statusMap[status] || 'pending';
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async migrateOrganizations(): Promise<Map<string, string>> {
    this.log('Starting organizations migration...');
    const airtableToSupabaseMap = new Map<string, string>();

    try {
      const records = await this.airtable('Organizations').select().all();

      for (const record of records) {
        this.stats.organizations.processed++;

        try {
          const org = record as AirtableOrganization;
          const name =
            org.fields['Organization Name'] ||
            `Organization ${this.stats.organizations.processed}`;

          const organizationData = {
            id: uuidv4(),
            name,
            slug: this.slugify(name),
            description: org.fields['Description'] || null,
            website_url: org.fields['Website'] || null,
            organization_type: this.normalizeOrganizationType(
              org.fields['Organization Type']
            ),
            headquarters_location: org.fields['Location'] || null,
            support_email: org.fields['Primary Contact Email'] || null,
            is_active: org.fields['Active'] !== false,
          };

          const { error } = await this.supabase
            .from('organizations')
            .insert(organizationData);

          if (error) {
            throw error;
          }

          airtableToSupabaseMap.set(org.id, organizationData.id);
          this.stats.organizations.created++;

          this.log(`Created organization: ${name}`, 'success');
        } catch (error) {
          this.stats.organizations.errors++;
          this.log(
            `Error migrating organization ${record.id}: ${error}`,
            'error'
          );
        }
      }
    } catch (error) {
      this.log(`Error fetching organizations from Airtable: ${error}`, 'error');
    }

    this.log(
      `Organizations migration complete. Created: ${this.stats.organizations.created}, Errors: ${this.stats.organizations.errors}`
    );
    return airtableToSupabaseMap;
  }

  async migrateCommunities(
    organizationMap: Map<string, string>
  ): Promise<Map<string, string>> {
    this.log('Starting communities migration...');
    const airtableToSupabaseMap = new Map<string, string>();

    try {
      const records = await this.airtable('Communities').select().all();

      for (const record of records) {
        this.stats.communities.processed++;

        try {
          const community = record as AirtableCommunity;
          const name =
            community.fields['Community Name'] ||
            `Community ${this.stats.communities.processed}`;

          // Map organization if it exists
          let organizationId = null;
          if (
            community.fields['Organization'] &&
            community.fields['Organization'].length > 0
          ) {
            organizationId =
              organizationMap.get(community.fields['Organization'][0]) || null;
          }

          const communityData = {
            id: uuidv4(),
            name,
            slug: this.slugify(name),
            description: community.fields['Description'] || null,
            geographic_level: community.fields['Geographic Level'] || 'city',
            location_data: community.fields['Location']
              ? { location: community.fields['Location'] }
              : {},
            organization_id: organizationId,
            is_active: community.fields['Active'] !== false,
          };

          const { error } = await this.supabase
            .from('communities')
            .insert(communityData);

          if (error) {
            throw error;
          }

          airtableToSupabaseMap.set(community.id, communityData.id);
          this.stats.communities.created++;

          this.log(`Created community: ${name}`, 'success');
        } catch (error) {
          this.stats.communities.errors++;
          this.log(`Error migrating community ${record.id}: ${error}`, 'error');
        }
      }
    } catch (error) {
      this.log(`Error fetching communities from Airtable: ${error}`, 'error');
    }

    this.log(
      `Communities migration complete. Created: ${this.stats.communities.created}, Errors: ${this.stats.communities.errors}`
    );
    return airtableToSupabaseMap;
  }

  async migrateProfiles(): Promise<Map<string, string>> {
    this.log('Starting profiles migration...');
    const emailToIdMap = new Map<string, string>();

    try {
      // Get unique contributors from stories
      const storyRecords = await this.airtable('Stories')
        .select({
          fields: [
            'Contributor Email',
            'Contributor Name',
            'Age Range',
            'Location',
          ],
        })
        .all();

      const uniqueContributors = new Map<string, any>();

      for (const record of storyRecords) {
        const email = record.fields['Contributor Email'];
        if (email && !uniqueContributors.has(email)) {
          uniqueContributors.set(email, {
            email,
            name: record.fields['Contributor Name'],
            ageRange: record.fields['Age Range'],
            location: record.fields['Location'],
          });
        }
      }

      for (const [email, contributor] of uniqueContributors) {
        this.stats.profiles.processed++;

        try {
          const profileData = {
            id: uuidv4(),
            email,
            full_name: contributor.name || null,
            display_name: contributor.name?.split(' ')[0] || 'Anonymous',
            age_range: contributor.ageRange || null,
            location_general: contributor.location || null,
            role: 'storyteller' as const,
            is_verified: false,
            is_active: true,
          };

          const { error } = await this.supabase
            .from('profiles')
            .insert(profileData);

          if (error) {
            throw error;
          }

          emailToIdMap.set(email, profileData.id);
          this.stats.profiles.created++;

          this.log(`Created profile for: ${email}`, 'success');
        } catch (error) {
          this.stats.profiles.errors++;
          this.log(`Error migrating profile ${email}: ${error}`, 'error');
        }
      }
    } catch (error) {
      this.log(`Error processing profiles: ${error}`, 'error');
    }

    this.log(
      `Profiles migration complete. Created: ${this.stats.profiles.created}, Errors: ${this.stats.profiles.errors}`
    );
    return emailToIdMap;
  }

  async migrateStories(
    profileMap: Map<string, string>,
    organizationMap: Map<string, string>,
    communityMap: Map<string, string>
  ): Promise<void> {
    this.log('Starting stories migration...');

    try {
      const records = await this.airtable('Stories').select().all();

      for (const record of records) {
        this.stats.stories.processed++;

        try {
          const story = record as AirtableStory;

          // Get contributor ID
          const contributorEmail = story.fields['Contributor Email'];
          const contributorId = contributorEmail
            ? profileMap.get(contributorEmail)
            : null;

          if (!contributorId && contributorEmail) {
            this.log(
              `Warning: Could not find profile for email ${contributorEmail}`,
              'error'
            );
          }

          // Map organization
          let organizationId = null;
          if (
            story.fields['Organization'] &&
            story.fields['Organization'].length > 0
          ) {
            organizationId =
              organizationMap.get(story.fields['Organization'][0]) || null;
          }

          // For now, assign all stories to the global community
          // TODO: Implement proper community assignment logic
          const globalCommunityResult = await this.supabase
            .from('communities')
            .select('id')
            .eq('slug', 'global')
            .single();

          const communityId = globalCommunityResult.data?.id || null;

          const storyData = {
            id: uuidv4(),
            title: story.fields['Title'] || 'Untitled Story',
            content: story.fields['Content'] || '',
            category: this.normalizeCategory(story.fields['Category']),
            themes: story.fields['Themes'] || [],
            privacy_level: this.normalizePrivacyLevel(
              story.fields['Privacy Level']
            ),
            contributor_id: contributorId,
            organization_id: organizationId,
            community_id: communityId,
            contributor_age_range: story.fields['Age Range'] || null,
            contributor_location: story.fields['Location'] || null,
            audio_url: story.fields['Audio URL'] || null,
            video_url: story.fields['Video URL'] || null,
            transcription: story.fields['Transcription'] || null,
            sentiment_score: story.fields['Sentiment Score'] || null,
            impact_score: story.fields['Impact Score'] || 0,
            view_count: story.fields['View Count'] || 0,
            status: story.fields['Featured']
              ? 'featured'
              : this.normalizeStatus(story.fields['Status']),
            created_at: story.fields['Date Submitted']
              ? new Date(story.fields['Date Submitted']).toISOString()
              : new Date().toISOString(),
            published_at:
              this.normalizeStatus(story.fields['Status']) === 'approved'
                ? story.fields['Date Submitted']
                  ? new Date(story.fields['Date Submitted']).toISOString()
                  : new Date().toISOString()
                : null,
          };

          const { error } = await this.supabase
            .from('stories')
            .insert(storyData);

          if (error) {
            throw error;
          }

          this.stats.stories.created++;
          this.log(`Created story: ${storyData.title}`, 'success');
        } catch (error) {
          this.stats.stories.errors++;
          this.log(`Error migrating story ${record.id}: ${error}`, 'error');
        }
      }
    } catch (error) {
      this.log(`Error fetching stories from Airtable: ${error}`, 'error');
    }

    this.log(
      `Stories migration complete. Created: ${this.stats.stories.created}, Errors: ${this.stats.stories.errors}`
    );
  }

  async updateMetrics(): Promise<void> {
    this.log('Updating site metrics...');

    try {
      // Count total stories
      const { count: storyCount } = await this.supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Count communities
      const { count: communityCount } = await this.supabase
        .from('communities')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Update metrics
      await this.supabase
        .from('site_metrics')
        .update({ metric_value: storyCount || 0 })
        .eq('metric_name', 'total_stories');

      await this.supabase
        .from('site_metrics')
        .update({ metric_value: communityCount || 0 })
        .eq('metric_name', 'total_communities');

      this.log('Site metrics updated successfully', 'success');
    } catch (error) {
      this.log(`Error updating metrics: ${error}`, 'error');
    }
  }

  private normalizeOrganizationType(type?: string): string {
    if (!type) return 'community_group';

    const typeMap: { [key: string]: string } = {
      'Non-profit': 'nonprofit',
      Nonprofit: 'nonprofit',
      NGO: 'nonprofit',
      Government: 'government',
      Healthcare: 'healthcare',
      Education: 'education',
      Research: 'research',
      'Community Group': 'community_group',
      Private: 'private_sector',
      Corporate: 'private_sector',
    };

    return typeMap[type] || 'community_group';
  }

  async runFullMigration(): Promise<void> {
    const startTime = Date.now();
    this.log('🚀 Starting Empathy Ledger migration from Airtable to Supabase');

    try {
      // Step 1: Migrate organizations
      const organizationMap = await this.migrateOrganizations();

      // Step 2: Migrate communities
      const communityMap = await this.migrateCommunities(organizationMap);

      // Step 3: Migrate profiles
      const profileMap = await this.migrateProfiles();

      // Step 4: Migrate stories
      await this.migrateStories(profileMap, organizationMap, communityMap);

      // Step 5: Update metrics
      await this.updateMetrics();

      this.stats.totalDuration = Date.now() - startTime;

      this.log('✅ Migration completed successfully!', 'success');
      this.log(`📊 Final Stats:
        - Organizations: ${this.stats.organizations.created} created, ${this.stats.organizations.errors} errors
        - Communities: ${this.stats.communities.created} created, ${this.stats.communities.errors} errors  
        - Profiles: ${this.stats.profiles.created} created, ${this.stats.profiles.errors} errors
        - Stories: ${this.stats.stories.created} created, ${this.stats.stories.errors} errors
        - Total Duration: ${this.stats.totalDuration}ms`);
    } catch (error) {
      this.log(`❌ Migration failed: ${error}`, 'error');
      throw error;
    } finally {
      await this.saveLogs();
    }
  }
}

// CLI execution
async function main() {
  const migration = new EmpathyLedgerMigration();

  try {
    await migration.runFullMigration();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  main();
}

export default EmpathyLedgerMigration;
