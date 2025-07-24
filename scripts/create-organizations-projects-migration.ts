#!/usr/bin/env tsx

/**
 * Organizations and Projects Migration Script
 * 
 * Creates proper Organizations and Projects tables and migrates
 * data from Airtable storytellers analysis to establish the
 * multi-tenant foundation for Empathy Ledger
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing admin credentials')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Organization data extracted from Airtable analysis
const ORGANIZATIONS = [
  {
    name: 'Orange Sky',
    slug: 'orange-sky',
    description: 'Community laundry and conversation service providing dignity and connection to people experiencing homelessness',
    organization_type: 'nonprofit',
    website_url: 'https://orangesky.org.au',
    primary_contact_email: 'hello@orangesky.org.au',
    country: 'Australia',
    storyteller_count: 107,
    locations: ['Palm Island', 'Mackay', 'Hobart', 'Kalgoorlie', 'Brisbane', 'Tennent Creek', 'Newcastle', 'Perth', 'Central Coast', 'Gold Coast', 'Alice Springs', 'Mt Isa', 'Rockhampton', 'Cairns', 'Darwin', 'Adelaide', 'Melbourne', 'Sydney', 'Bundaberg', 'Townsville', 'Geelong', 'Ballarat', 'Toowoomba']
  },
  {
    name: 'Goods.',
    slug: 'goods',
    description: 'Community organization focused on social good and community development',
    organization_type: 'community',
    storyteller_count: 22,
    locations: ['Alice Springs', 'Brisbane', 'Central Coast', 'Gold Coast']
  },
  {
    name: 'Diagrama',
    slug: 'diagrama',
    description: 'Spain-based organization working in community development and social services',
    organization_type: 'nonprofit',
    country: 'Spain',
    storyteller_count: 15,
    locations: ['Spain']
  },
  {
    name: 'PICC',
    slug: 'picc',
    description: 'Community organization',
    organization_type: 'community',
    storyteller_count: 13,
    locations: ['Multiple']
  },
  {
    name: 'TOMNET',
    slug: 'tomnet',
    description: 'Community network organization',
    organization_type: 'network',
    storyteller_count: 9,
    locations: ['Multiple']
  },
  {
    name: 'MMEIC',
    slug: 'mmeic',
    description: 'Community organization',
    organization_type: 'community',
    storyteller_count: 8,
    locations: ['Multiple']
  },
  {
    name: 'Global Laundry Alliance',
    slug: 'global-laundry-alliance',
    description: 'International network supporting laundry and community services',
    organization_type: 'network',
    storyteller_count: 7,
    locations: ['International']
  },
  {
    name: 'MingaMinga Rangers',
    slug: 'mingaminga-rangers',
    description: 'Community rangers organization',
    organization_type: 'community',
    storyteller_count: 7,
    locations: ['Multiple']
  },
  {
    name: 'Young Guns',
    slug: 'young-guns',
    description: 'Youth-focused community organization',
    organization_type: 'community',
    storyteller_count: 5,
    locations: ['Multiple']
  },
  {
    name: 'Oonchiumpa',
    slug: 'oonchiumpa',
    description: 'Community organization',
    organization_type: 'community',
    storyteller_count: 4,
    locations: ['Multiple']
  },
  {
    name: 'Beyond Shadows',
    slug: 'beyond-shadows',
    description: 'Community organization',
    organization_type: 'community',
    storyteller_count: 3,
    locations: ['Multiple']
  },
  {
    name: 'JusticeHub',
    slug: 'justicehub',
    description: 'Social justice and advocacy organization',
    organization_type: 'advocacy',
    storyteller_count: 2,
    locations: ['Multiple']
  }
]

// Project templates based on location analysis
function generateProjectsForOrganization(org: typeof ORGANIZATIONS[0]) {
  const projects = []
  
  if (org.slug === 'orange-sky') {
    // Create location-based projects for Orange Sky
    for (const location of org.locations) {
      projects.push({
        organization_slug: org.slug,
        name: `Orange Sky ${location}`,
        slug: `orange-sky-${location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        description: `Orange Sky community storytelling project in ${location}`,
        project_type: 'storytelling',
        geographic_scope: location,
        target_communities: ['people experiencing homelessness', 'volunteers', 'service providers'],
        story_collection_methods: ['web', 'sms', 'phone'],
        cultural_sensitivity: 'general',
        visibility: 'public',
        max_storytellers: 100,
        max_stories: 1000
      })
    }
  } else if (org.slug === 'goods') {
    // Create location-based projects for Goods
    const goodsLocations = ['Alice Springs', 'Brisbane', 'Central Coast', 'Gold Coast']
    for (const location of goodsLocations) {
      projects.push({
        organization_slug: org.slug,
        name: `Goods. ${location}`,
        slug: `goods-${location.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        description: `Community storytelling project in ${location}`,
        project_type: 'storytelling',
        geographic_scope: location,
        target_communities: ['community members'],
        story_collection_methods: ['web', 'sms'],
        cultural_sensitivity: 'general',
        visibility: 'public',
        max_storytellers: 50,
        max_stories: 500
      })
    }
  } else if (org.slug === 'diagrama') {
    // Spain-specific project
    projects.push({
      organization_slug: org.slug,
      name: 'Diagrama Spain',
      slug: 'diagrama-spain',
      description: 'Community storytelling project in Spain',
      project_type: 'storytelling',
      geographic_scope: 'Spain',
      target_communities: ['community members'],
      story_collection_methods: ['web', 'sms'],
      cultural_sensitivity: 'general',
      visibility: 'public',
      primary_language: 'es',
      supported_languages: ['es', 'en'],
      max_storytellers: 50,
      max_stories: 500
    })
  } else {
    // Create general project for other organizations
    projects.push({
      organization_slug: org.slug,
      name: `${org.name} Stories`,
      slug: `${org.slug}-stories`,
      description: `Community storytelling project for ${org.name}`,
      project_type: 'storytelling',
      geographic_scope: 'Multiple',
      target_communities: ['community members'],
      story_collection_methods: ['web', 'sms'],
      cultural_sensitivity: 'general',
      visibility: 'public',
      max_storytellers: Math.max(org.storyteller_count * 2, 20),
      max_stories: Math.max(org.storyteller_count * 10, 100)
    })
  }
  
  return projects
}

class OrganizationProjectMigrator {
  private organizations: Map<string, string> = new Map() // slug -> id
  private projects: Map<string, string> = new Map() // slug -> id

  async migrateAll() {
    console.log('🚀 Starting Organizations and Projects Migration...')
    console.log('=' .repeat(60))

    try {
      // Step 1: Create database schema
      await this.createDatabaseSchema()
      
      // Step 2: Create organizations
      await this.createOrganizations()
      
      // Step 3: Create projects
      await this.createProjects()
      
      // Step 4: Update existing table structure
      await this.updateExistingTables()
      
      this.printSummary()
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    }
  }

  private async createDatabaseSchema() {
    console.log('\n📋 Creating database schema...')
    
    const supabase = await createAdminClient()
    
    // Create organizations table
    const organizationsSchema = `
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        -- Basic Organization Info
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        website_url VARCHAR(500),
        
        -- Contact Information
        primary_contact_email VARCHAR(255),
        primary_contact_name VARCHAR(255),
        phone VARCHAR(50),
        
        -- Address/Location
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state_province VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        
        -- Organization Type & Status
        organization_type VARCHAR(50) DEFAULT 'nonprofit',
        status VARCHAR(20) DEFAULT 'active',
        
        -- Sovereignty & Cultural Context
        cultural_context TEXT[],
        sovereignty_status VARCHAR(50),
        cultural_protocols JSONB DEFAULT '{}',
        
        -- Platform Settings
        subscription_tier VARCHAR(20) DEFAULT 'community',
        subscription_status VARCHAR(20) DEFAULT 'active',
        subscription_expires_at TIMESTAMPTZ,
        
        -- Branding & Customization
        logo_url VARCHAR(500),
        brand_colors JSONB DEFAULT '{}',
        custom_domain VARCHAR(255),
        
        -- Platform Features
        enabled_modules TEXT[] DEFAULT ARRAY['storytelling'],
        feature_flags JSONB DEFAULT '{}',
        
        -- Compliance & Sovereignty
        sovereignty_compliance_score INTEGER DEFAULT 85,
        data_retention_policy JSONB DEFAULT '{}',
        consent_framework JSONB DEFAULT '{}',
        
        -- Metadata
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Soft delete
        deleted_at TIMESTAMPTZ
      );
      
      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
      CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);
    `

    // Create projects table
    const projectsSchema = `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        -- Organization Relationship
        organization_id UUID NOT NULL REFERENCES organizations(id),
        
        -- Basic Project Info
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description TEXT,
        mission_statement TEXT,
        
        -- Project Configuration
        project_type VARCHAR(50) DEFAULT 'storytelling',
        status VARCHAR(20) DEFAULT 'active',
        visibility VARCHAR(20) DEFAULT 'public',
        
        -- Storytelling Configuration
        story_collection_methods TEXT[] DEFAULT ARRAY['web'],
        story_approval_required BOOLEAN DEFAULT TRUE,
        story_moderation_enabled BOOLEAN DEFAULT TRUE,
        
        -- Cultural & Sovereignty Settings
        cultural_sensitivity VARCHAR(20) DEFAULT 'general',
        requires_elder_review BOOLEAN DEFAULT FALSE,
        cultural_protocols JSONB DEFAULT '{}',
        community_consent_required BOOLEAN DEFAULT TRUE,
        
        -- Geographic/Community Scope
        geographic_scope VARCHAR(100),
        target_communities TEXT[],
        primary_language VARCHAR(10) DEFAULT 'en',
        supported_languages TEXT[] DEFAULT ARRAY['en'],
        
        -- Project Lifecycle
        launched_at TIMESTAMPTZ DEFAULT NOW(),
        planned_end_date TIMESTAMPTZ,
        actual_end_date TIMESTAMPTZ,
        
        -- Capacity & Limits
        max_storytellers INTEGER DEFAULT 1000,
        max_stories INTEGER DEFAULT 10000,
        max_administrators INTEGER DEFAULT 10,
        
        -- Public Interface
        custom_subdomain VARCHAR(100),
        custom_domain VARCHAR(255),
        public_description TEXT,
        
        -- Branding
        logo_url VARCHAR(500),
        brand_colors JSONB DEFAULT '{}',
        custom_styling JSONB DEFAULT '{}',
        
        -- Analytics & Metrics
        total_stories INTEGER DEFAULT 0,
        total_storytellers INTEGER DEFAULT 0,
        total_interactions INTEGER DEFAULT 0,
        engagement_score DECIMAL(5,2) DEFAULT 0.0,
        impact_score DECIMAL(5,2) DEFAULT 0.0,
        sovereignty_compliance_score INTEGER DEFAULT 85,
        
        -- Last Activity Tracking
        last_story_submitted TIMESTAMPTZ,
        last_activity_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Settings & Configuration
        settings JSONB DEFAULT '{}',
        notification_settings JSONB DEFAULT '{}',
        privacy_settings JSONB DEFAULT '{}',
        
        -- Metadata
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- Soft delete
        deleted_at TIMESTAMPTZ,
        
        -- Ensure slug is unique within organization
        UNIQUE(organization_id, slug)
      );
      
      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(organization_id, slug);
      CREATE INDEX IF NOT EXISTS idx_projects_activity ON projects(last_activity_at DESC);
    `

    // Execute schema creation
    const { error: orgError } = await supabase.rpc('exec_sql', { sql: organizationsSchema })
    if (orgError) throw orgError

    const { error: projectError } = await supabase.rpc('exec_sql', { sql: projectsSchema })
    if (projectError) throw projectError

    console.log('✅ Database schema created successfully')
  }

  private async createOrganizations() {
    console.log('\n🏢 Creating organizations...')
    
    const supabase = await createAdminClient()
    
    for (const org of ORGANIZATIONS) {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .insert({
            name: org.name,
            slug: org.slug,
            description: org.description,
            organization_type: org.organization_type,
            website_url: org.website_url,
            primary_contact_email: org.primary_contact_email,
            country: org.country,
            status: 'active',
            enabled_modules: ['storytelling'],
            sovereignty_compliance_score: 85
          })
          .select('id, slug')
          .single()

        if (error) {
          if (error.code === '23505') { // Duplicate key
            console.log(`⚠️  Organization '${org.name}' already exists, skipping...`)
            const { data: existing } = await supabase
              .from('organizations')
              .select('id, slug')
              .eq('slug', org.slug)
              .single()
            if (existing) {
              this.organizations.set(org.slug, existing.id)
            }
            continue
          }
          throw error
        }

        this.organizations.set(org.slug, data.id)
        console.log(`✅ Created organization: ${org.name} (${org.storyteller_count} storytellers)`)
        
      } catch (error) {
        console.error(`❌ Failed to create organization ${org.name}:`, error)
        throw error
      }
    }

    console.log(`\n📊 Created ${this.organizations.size} organizations`)
  }

  private async createProjects() {
    console.log('\n📋 Creating projects...')
    
    const supabase = await createAdminClient()
    let totalProjects = 0
    
    for (const org of ORGANIZATIONS) {
      const orgId = this.organizations.get(org.slug)
      if (!orgId) {
        console.warn(`⚠️  Organization ${org.slug} not found, skipping projects`)
        continue
      }

      const projects = generateProjectsForOrganization(org)
      
      for (const project of projects) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .insert({
              organization_id: orgId,
              name: project.name,
              slug: project.slug,
              description: project.description,
              project_type: project.project_type,
              geographic_scope: project.geographic_scope,
              target_communities: project.target_communities,
              story_collection_methods: project.story_collection_methods,
              cultural_sensitivity: project.cultural_sensitivity,
              visibility: project.visibility,
              primary_language: project.primary_language || 'en',
              supported_languages: project.supported_languages || ['en'],
              max_storytellers: project.max_storytellers,
              max_stories: project.max_stories,
              status: 'active',
              launched_at: new Date().toISOString()
            })
            .select('id, slug')
            .single()

          if (error) {
            if (error.code === '23505') { // Duplicate key
              console.log(`⚠️  Project '${project.name}' already exists, skipping...`)
              continue
            }
            throw error
          }

          this.projects.set(project.slug, data.id)
          totalProjects++
          console.log(`✅ Created project: ${project.name}`)
          
        } catch (error) {
          console.error(`❌ Failed to create project ${project.name}:`, error)
          throw error
        }
      }
    }

    console.log(`\n📊 Created ${totalProjects} projects across ${this.organizations.size} organizations`)
  }

  private async updateExistingTables() {
    console.log('\n🔄 Updating existing tables with project references...')
    
    const supabase = await createAdminClient()
    
    // Add project_id column to existing tables (if not exists)
    const updateQueries = [
      'ALTER TABLE stories ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);',
      'ALTER TABLE media ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);',
      'CREATE INDEX IF NOT EXISTS idx_stories_project ON stories(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_media_project ON media(project_id);'
    ]

    for (const query of updateQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        if (error && !error.message.includes('already exists')) {
          throw error
        }
      } catch (error) {
        console.warn(`⚠️  Query warning: ${query}`, error)
      }
    }

    console.log('✅ Updated existing table structure')
  }

  private printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 Organizations & Projects Migration Summary')
    console.log('='.repeat(60))
    
    console.log(`✅ Organizations created: ${this.organizations.size}`)
    console.log(`✅ Projects created: ${this.projects.size}`)
    
    console.log('\n🏢 Organizations:')
    for (const [slug] of this.organizations) {
      const org = ORGANIZATIONS.find(o => o.slug === slug)
      console.log(`   ${org?.name} (${org?.storyteller_count} storytellers)`)
    }

    console.log('\n📋 Next Steps:')
    console.log('1. Run storyteller migration script to link users to projects')
    console.log('2. Update existing stories and media with project_id')
    console.log('3. Test project-based access controls')
    console.log('4. Deploy CMS with project integration')
    console.log('\n🎉 Foundation migration complete!')
  }
}

// Main execution
async function main() {
  try {
    const migrator = new OrganizationProjectMigrator()
    await migrator.migrateAll()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run if called directly (ES module compatible)
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main()
}

export { OrganizationProjectMigrator }