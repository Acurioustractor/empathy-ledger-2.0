#!/usr/bin/env tsx

/**
 * Populate Projects Table
 * 
 * Creates project records and links storytellers to their projects
 * based on Airtable data analysis
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

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

interface ProjectData {
  name: string
  organization_name: string
  organization_id: string | null
  storyteller_count: number
  project_type: string
  description: string
}

// Project mapping based on our analysis
const PROJECT_DEFINITIONS: { [key: string]: Partial<ProjectData> } = {
  'Orange Sky': {
    project_type: 'Community Outreach',
    description: 'Mobile laundry and shower services for people experiencing homelessness'
  },
  'Goods.': {
    project_type: 'Community Marketplace',
    description: 'Community-driven marketplace and social impact platform'
  },
  'Diagrama': {
    project_type: 'Social Services',
    description: 'Supporting vulnerable youth and families through comprehensive social programs'
  },
  'PICC': {
    project_type: 'Community Center',
    description: 'Palm Island Community Company providing local services and support'
  },
  'TOMNET': {
    project_type: 'Youth Services',
    description: 'Supporting young people through mentorship and community programs'
  },
  'MMEIC': {
    project_type: 'Indigenous Services',
    description: 'Community services and support for Indigenous communities'
  },
  'Global Laundry Alliance': {
    project_type: 'Network Initiative',
    description: 'International network of mobile laundry services'
  },
  'MingaMinga Rangers': {
    project_type: 'Environmental',
    description: 'Community rangers protecting environment and cultural heritage'
  },
  'Young Guns': {
    project_type: 'Youth Development',
    description: 'Youth development and mentorship programs'
  },
  'Oonchiumpa': {
    project_type: 'Cultural',
    description: 'Cultural preservation and community connection initiatives'
  },
  'Beyond Shadows': {
    project_type: 'Mental Health',
    description: 'Mental health and wellness support programs'
  },
  'JusticeHub': {
    project_type: 'Legal Aid',
    description: 'Community legal aid and justice advocacy'
  }
}

async function fetchAirtableStorytellers(): Promise<AirtableStoryteller[]> {
  console.log('📥 Fetching storytellers from Airtable...')
  
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

function generateUserEmail(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-') + '@empathyledger.migration'
}

async function createProjects(supabase: any, storytellers: AirtableStoryteller[]) {
  console.log('🚀 Creating projects...')
  
  // Get organizations map
  const { data: communities, error: communitiesError } = await supabase
    .from('communities')
    .select('id, name')
  
  if (communitiesError) throw communitiesError
  
  const organizationsMap = new Map(
    communities.map((c: any) => [c.name, c.id])
  )
  
  // Analyze projects from Airtable
  const projectCounts = new Map<string, number>()
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
  })
  
  // Create projects
  const createdProjects = new Map<string, string>() // name -> id
  
  for (const [projectName, count] of projectCounts.entries()) {
    const organizationName = projectToOrg.get(projectName)
    const organizationId = organizationName ? organizationsMap.get(organizationName) : null
    
    const projectDef = PROJECT_DEFINITIONS[projectName] || {}
    
    const projectData = {
      name: projectName,
      description: projectDef.description || `Community project with ${count} storytellers`,
      organization_id: organizationId,
      project_type: projectDef.project_type || 'Community Initiative',
      status: 'active',
      metadata: {
        storyteller_count: count,
        organization_name: organizationName,
        imported_from: 'airtable',
        import_date: new Date().toISOString()
      }
    }
    
    try {
      // Check if project already exists
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('name', projectName)
        .single()
      
      if (existing) {
        console.log(`✅ Project "${projectName}" already exists`)
        createdProjects.set(projectName, existing.id)
        continue
      }
      
      const { data: created, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select('id')
        .single()
      
      if (error) throw error
      
      createdProjects.set(projectName, created.id)
      console.log(`✅ Created project: "${projectName}" (${count} storytellers, ${organizationName || 'No org'})`)
      
    } catch (error) {
      console.error(`❌ Failed to create project "${projectName}":`, error)
    }
  }
  
  return createdProjects
}

async function linkStorytellersToProjects(supabase: any, storytellers: AirtableStoryteller[], projectsMap: Map<string, string>) {
  console.log('\n🔗 Linking storytellers to projects...')
  
  let linkedCount = 0
  let notFoundCount = 0
  let noProjectCount = 0
  
  for (const storyteller of storytellers) {
    const name = storyteller.fields.Name
    const projectName = storyteller.fields.Project
    const organizationName = storyteller.fields.Organisation
    
    if (!name) continue
    
    // If no project, skip but count
    if (!projectName) {
      noProjectCount++
      continue
    }
    
    const projectId = projectsMap.get(projectName)
    if (!projectId) {
      console.log(`⚠️  Project "${projectName}" not found for ${name}`)
      continue
    }
    
    // Find user in Supabase
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', `%${name.split(' ')[0].toLowerCase()}%`)
      .ilike('email', '%@empathyledger.migration')
    
    if (userError) {
      console.error(`❌ User lookup error for ${name}:`, userError.message)
      continue
    }
    
    if (!users || users.length === 0) {
      notFoundCount++
      continue
    }
    
    // Find best match
    let targetUser = users[0]
    if (users.length > 1) {
      const exactMatch = users.find(u => 
        u.email.includes(name.toLowerCase().replace(/[^a-z0-9]/g, '-'))
      )
      if (exactMatch) targetUser = exactMatch
    }
    
    // Update user with project and organization
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        project_id: projectId,
        organization_id: organizationName ? null : null // We'll handle org linking separately
      })
      .eq('id', targetUser.id)
    
    if (updateError) {
      console.error(`❌ Failed to link ${name} to project:`, updateError.message)
      continue
    }
    
    linkedCount++
    
    if (linkedCount % 25 === 0) {
      console.log(`   ✅ Linked ${linkedCount} storytellers to projects...`)
    }
  }
  
  console.log(`\n📊 PROJECT LINKING SUMMARY:`)
  console.log(`✅ Successfully linked: ${linkedCount}`)
  console.log(`❌ Users not found: ${notFoundCount}`)
  console.log(`📭 No project data: ${noProjectCount}`)
}

async function populateProjectsAndLink() {
  console.log('🚀 Starting Projects Population and Linking...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Step 1: Verify projects table exists
    try {
      const { data } = await supabase.from('projects').select('id').limit(1)
      console.log('✅ Projects table verified')
    } catch (error) {
      console.error('❌ Projects table does not exist!')
      console.log('Run CREATE_PROJECTS_TABLE.sql in Supabase Dashboard first')
      return
    }
    
    // Step 2: Get Airtable data
    const storytellers = await fetchAirtableStorytellers()
    
    // Step 3: Create projects
    const projectsMap = await createProjects(supabase, storytellers)
    
    // Step 4: Link storytellers to projects
    await linkStorytellersToProjects(supabase, storytellers, projectsMap)
    
    // Step 5: Summary
    console.log('\n🎉 Projects Population Complete!')
    console.log('=' .repeat(60))
    
    const { data: projectCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })
    
    const { data: linkedUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .not('project_id', 'is', null)
    
    console.log(`✅ Total projects created: ${projectCount?.length || 0}`)
    console.log(`✅ Users linked to projects: ${linkedUsers?.length || 0}`)
    
    console.log('\n🚀 Next Steps:')
    console.log('1. ✅ Projects and user-project relationships established')
    console.log('2. Update CMS services to support project context')
    console.log('3. Modify content blocks to respect project boundaries')
    console.log('4. Test multi-tenant functionality')
    
  } catch (error) {
    console.error('❌ Population failed:', error)
    throw error
  }
}

// Run population
populateProjectsAndLink().catch(console.error)