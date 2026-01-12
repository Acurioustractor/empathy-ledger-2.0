#!/usr/bin/env tsx

/**
 * Create Organizations and Projects Structure
 * 
 * Transforms existing Communities table into Organizations system
 * and creates Projects table with proper relationships
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

// Airtable API configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing admin credentials')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

interface AirtableStoryteller {
  id: string
  fields: {
    Name: string
    Project?: string
    Organisation?: string
    Location?: string
    [key: string]: any
  }
}

async function fetchAirtableStorytellers(): Promise<AirtableStoryteller[]> {
  console.log('📥 Fetching storytellers from Airtable for project analysis...')
  
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Missing Airtable credentials')
  }
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers`
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
  
  let allRecords: AirtableStoryteller[] = []
  let offset = ''
  
  do {
    const fetchUrl = offset ? `${url}?offset=${offset}` : url
    
    const response = await fetch(fetchUrl, { headers })
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    allRecords = allRecords.concat(data.records)
    offset = data.offset || ''
    
  } while (offset)
  
  console.log(`✅ Fetched ${allRecords.length} storytellers from Airtable`)
  return allRecords
}

async function createProjectsTable(supabase: any): Promise<boolean> {
  console.log('📋 Creating projects table...')
  
  // Check if projects table exists
  try {
    const { data } = await supabase.from('projects').select('id').limit(1)
    console.log('✅ Projects table already exists')
    return true
  } catch (error) {
    console.log('📋 Projects table does not exist - needs to be created with SQL')
    
    const createProjectsSQL = `
-- =====================================================
-- PROJECTS TABLE CREATION
-- =====================================================
-- Run this SQL in your Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  project_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  website VARCHAR(500),
  contact_email VARCHAR(255),
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(active);

-- Add RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active projects
CREATE POLICY "Public can view active projects"
  ON projects FOR SELECT
  USING (active = true);

-- Allow authenticated users to view all projects
CREATE POLICY "Authenticated users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- Add project_id to users table for user-project relationships
ALTER TABLE users ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_users_project_id ON users(project_id);

-- Add project_id to stories table for story-project relationships
ALTER TABLE stories ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_stories_project_id ON stories(project_id);

-- Add organization_id to users table for direct organization relationships
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES communities(id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Success message
SELECT 'Projects table and relationships created! 🚀' as result;
    `
    
    console.log('\n🔧 MANUAL SQL REQUIRED:')
    console.log('Copy and paste this SQL into your Supabase Dashboard > SQL Editor:')
    console.log('\n' + '='.repeat(60))
    console.log(createProjectsSQL)
    console.log('='.repeat(60))
    console.log('\nAfter running the SQL, execute this script again.')
    
    return false
  }
}

async function analyzeAirtableProjects(storytellers: AirtableStoryteller[]) {
  console.log('\n📊 Analyzing Airtable Projects and Organizations...')
  
  const projectCounts = new Map<string, number>()
  const organizationCounts = new Map<string, number>()
  const projectToOrg = new Map<string, string>()
  
  storytellers.forEach(storyteller => {
    const project = storyteller.fields.Project
    const organization = storyteller.fields.Organisation
    
    if (project) {
      projectCounts.set(project, (projectCounts.get(project) || 0) + 1)
      if (organization) {
        projectToOrg.set(project, organization)
      }
    }
    
    if (organization) {
      organizationCounts.set(organization, (organizationCounts.get(organization) || 0) + 1)
    }
  })
  
  console.log('\n📈 PROJECT DISTRIBUTION:')
  Array.from(projectCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([project, count]) => {
      const org = projectToOrg.get(project) || 'Unknown'
      console.log(`   ${project}: ${count} storytellers (${org})`)
    })
  
  console.log('\n🏢 ORGANIZATION DISTRIBUTION:')
  Array.from(organizationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([org, count]) => {
      console.log(`   ${org}: ${count} storytellers`)
    })
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`   Total unique projects: ${projectCounts.size}`)
  console.log(`   Total unique organizations: ${organizationCounts.size}`)
  console.log(`   Total storytellers: ${storytellers.length}`)
  
  return { projectCounts, organizationCounts, projectToOrg }
}

async function createOrganizationsAndProjects() {
  console.log('🏢 Starting Organizations and Projects Setup...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Step 1: Analyze existing Communities table (organizations)
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('*')
    
    if (communitiesError) throw communitiesError
    
    console.log(`\n📋 EXISTING ORGANIZATIONS (Communities Table):`)
    communities.forEach((community: any, index: number) => {
      console.log(`   ${index + 1}. ${community.name} (ID: ${community.id})`)
    })
    
    // Step 2: Check/Create projects table
    const projectsReady = await createProjectsTable(supabase)
    if (!projectsReady) return
    
    // Step 3: Analyze Airtable data for project structure
    const storytellers = await fetchAirtableStorytellers()
    const analysis = await analyzeAirtableProjects(storytellers)
    
    // Step 4: Generate projects creation plan
    console.log('\n🚀 NEXT PHASE: Project Creation Strategy')
    console.log('=' .repeat(60))
    
    const topProjects = Array.from(analysis.projectCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    
    console.log('\n📋 TOP 10 PROJECTS TO CREATE:')
    topProjects.forEach(([project, count], index) => {
      const org = analysis.projectToOrg.get(project) || 'Unknown'
      console.log(`   ${index + 1}. "${project}" - ${count} storytellers (${org})`)
    })
    
    console.log('\n✅ Organizations and Projects analysis complete!')
    console.log('\n🚀 Next Steps:')
    console.log('1. Run the SQL above to create projects table')
    console.log('2. Create actual project records based on Airtable data')
    console.log('3. Link storytellers to their projects')
    console.log('4. Update CMS to support project/organization context')
    
    return { communities, analysis, storytellers }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    throw error
  }
}

// Run setup
createOrganizationsAndProjects().catch(console.error)