#!/usr/bin/env tsx

/**
 * Simple Organizations and Projects Migration
 * 
 * Creates organizations and projects tables and populates with data
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

// Simplified organization data
const ORGANIZATIONS = [
  {
    name: 'Orange Sky',
    slug: 'orange-sky',
    description: 'Community laundry and conversation service providing dignity and connection to people experiencing homelessness',
    organization_type: 'nonprofit',
    country: 'Australia'
  },
  {
    name: 'Goods.',
    slug: 'goods',
    description: 'Community organization focused on social good and community development',
    organization_type: 'community',
    country: 'Australia'
  },
  {
    name: 'Diagrama',
    slug: 'diagrama',
    description: 'Spain-based organization working in community development and social services',
    organization_type: 'nonprofit',
    country: 'Spain'
  },
  {
    name: 'PICC',
    slug: 'picc',
    description: 'Community organization',
    organization_type: 'community',
    country: 'Australia'
  },
  {
    name: 'Empathy Ledger',
    slug: 'empathy-ledger',
    description: 'Default organization for platform administration and general projects',
    organization_type: 'platform',
    country: 'Australia'
  }
]

async function createOrganizationsTable(supabase: any) {
  console.log('📋 Creating organizations table...')
  
  // Check if table exists first
  const { data: tableCheck } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
  
  if (tableCheck !== null) {
    console.log('✅ Organizations table already exists')
    return true
  }
  
  // Table doesn't exist, we'll need to create it manually
  console.log('⚠️  Organizations table needs to be created manually in Supabase dashboard')
  console.log('   Go to: Database > Tables > Create new table')
  console.log('   Use the SQL from /docs/DEPLOYMENT_GUIDE.md')
  
  return false
}

async function createProjectsTable(supabase: any) {
  console.log('📋 Creating projects table...')
  
  // Check if table exists first
  const { data: tableCheck } = await supabase
    .from('projects')
    .select('id')
    .limit(1)
  
  if (tableCheck !== null) {
    console.log('✅ Projects table already exists')
    return true
  }
  
  console.log('⚠️  Projects table needs to be created manually in Supabase dashboard')
  return false
}

async function populateOrganizations(supabase: any) {
  console.log('\n🏢 Populating organizations...')
  
  for (const org of ORGANIZATIONS) {
    try {
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', org.slug)
        .single()
      
      if (existing) {
        console.log(`✅ ${org.name} already exists`)
        continue
      }
      
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: org.name,
          slug: org.slug,
          description: org.description,
          organization_type: org.organization_type,
          country: org.country,
          status: 'active',
          enabled_modules: ['storytelling'],
          sovereignty_compliance_score: 85
        })
        .select('id, name')
        .single()
      
      if (error) throw error
      
      console.log(`✅ Created: ${org.name}`)
      
    } catch (error) {
      console.error(`❌ Failed to create ${org.name}:`, error)
    }
  }
}

async function createBasicProjects(supabase: any) {
  console.log('\n📋 Creating basic projects...')
  
  // Get organization IDs
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, slug, name')
  
  if (!orgs || orgs.length === 0) {
    console.log('❌ No organizations found - create organizations first')
    return
  }
  
  // Create one main project per organization
  for (const org of orgs) {
    try {
      const projectSlug = `${org.slug}-main`
      
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectSlug)
        .eq('organization_id', org.id)
        .single()
      
      if (existing) {
        console.log(`✅ ${org.name} main project already exists`)
        continue
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          organization_id: org.id,
          name: `${org.name} Stories`,
          slug: projectSlug,
          description: `Main storytelling project for ${org.name}`,
          project_type: 'storytelling',
          status: 'active',
          visibility: 'public',
          geographic_scope: org.slug === 'diagrama' ? 'Spain' : 'Australia',
          target_communities: ['community members'],
          story_collection_methods: ['web', 'sms'],
          cultural_sensitivity: 'general',
          max_storytellers: 500,
          max_stories: 5000,
          launched_at: new Date().toISOString()
        })
        .select('id, name')
        .single()
      
      if (error) throw error
      
      console.log(`✅ Created project: ${data.name}`)
      
    } catch (error) {
      console.error(`❌ Failed to create project for ${org.name}:`, error)
    }
  }
}

async function addProjectColumnsToExistingTables(supabase: any) {
  console.log('\n🔄 Adding project_id columns to existing tables...')
  
  // Check if columns already exist by trying to select them
  const tablesToUpdate = ['stories', 'media']
  
  for (const table of tablesToUpdate) {
    try {
      // Try to select project_id to see if column exists
      const { data } = await supabase
        .from(table)
        .select('project_id')
        .limit(1)
      
      console.log(`✅ ${table} already has project_id column`)
      
    } catch (error) {
      console.log(`⚠️  ${table} needs project_id column - add manually in Supabase dashboard`)
      console.log(`   SQL: ALTER TABLE ${table} ADD COLUMN project_id UUID REFERENCES projects(id);`)
    }
  }
}

async function migrateFoundation() {
  console.log('🚀 Starting Foundation Migration...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Step 1: Check/create organizations table
    const orgsTableExists = await createOrganizationsTable(supabase)
    
    // Step 2: Check/create projects table  
    const projectsTableExists = await createProjectsTable(supabase)
    
    if (!orgsTableExists || !projectsTableExists) {
      console.log('\n⚠️  MANUAL SETUP REQUIRED:')
      console.log('1. Go to your Supabase Dashboard')
      console.log('2. Navigate to Database > SQL Editor')
      console.log('3. Run the table creation SQL from /docs/DEPLOYMENT_GUIDE.md')
      console.log('4. Then run this script again')
      return
    }
    
    // Step 3: Populate organizations
    await populateOrganizations(supabase)
    
    // Step 4: Create basic projects
    await createBasicProjects(supabase)
    
    // Step 5: Update existing table structure
    await addProjectColumnsToExistingTables(supabase)
    
    // Step 6: Summary
    console.log('\n🎉 Foundation Migration Complete!')
    console.log('=' .repeat(60))
    
    const { data: orgCount } = await supabase
      .from('organizations')
      .select('id', { count: 'exact' })
    
    const { data: projectCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
    
    console.log(`✅ Organizations created: ${orgCount?.length || 0}`)
    console.log(`✅ Projects created: ${projectCount?.length || 0}`)
    
    console.log('\n🚀 Next Steps:')
    console.log('1. Link existing users to projects based on Airtable data')
    console.log('2. Update existing stories with project_id')
    console.log('3. Update CMS integration to use projects')
    console.log('4. Test multi-organization functionality')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
migrateFoundation().catch(console.error)