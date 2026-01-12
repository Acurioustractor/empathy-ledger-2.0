import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function analyzeMigrationFailure() {
  console.log('🔍 ANALYZING AIRTABLE MIGRATION FAILURE')
  console.log('====================================')
  
  // 1. Check current state of storytellers/users
  const { data: allStorytellers } = await client
    .from('users')
    .select('id, full_name, email, project_id, organization_id, primary_location_id, community_affiliation')
    .eq('role', 'storyteller')

  console.log(`👥 CURRENT STORYTELLER STATE (${allStorytellers?.length}):`)
  
  let hasProject = 0
  let hasOrganization = 0
  let hasLocation = 0
  let hasCommunity = 0

  allStorytellers?.forEach(storyteller => {
    if (storyteller.project_id) hasProject++
    if (storyteller.organization_id) hasOrganization++
    if (storyteller.primary_location_id) hasLocation++
    if (storyteller.community_affiliation) hasCommunity++
  })

  console.log(`  ✅ Have project_id: ${hasProject}/${allStorytellers?.length}`)
  console.log(`  ✅ Have organization_id: ${hasOrganization}/${allStorytellers?.length}`)
  console.log(`  ✅ Have primary_location_id: ${hasLocation}/${allStorytellers?.length}`)
  console.log(`  ✅ Have community_affiliation: ${hasCommunity}/${allStorytellers?.length}`)

  // 2. Check what organizations exist
  const { data: organizations } = await client.from('organizations').select('*')
  console.log(`\n🏢 ORGANIZATIONS TABLE (${organizations?.length}):`)
  organizations?.forEach(org => {
    console.log(`  - ${org.name} (ID: ${org.id})`)
    console.log(`    Description: ${org.description || 'None'}`)
  })

  // 3. Check what locations exist
  const { data: locations } = await client.from('locations').select('*')
  console.log(`\n📍 LOCATIONS TABLE (${locations?.length}):`)
  locations?.slice(0, 10).forEach(loc => {
    console.log(`  - ${loc.name}, ${loc.state}, ${loc.country} (ID: ${loc.id})`)
  })

  // 4. Check what projects exist
  const { data: projects } = await client.from('projects').select('*')
  console.log(`\n📊 PROJECTS TABLE (${projects?.length}):`)
  projects?.forEach(project => {
    console.log(`  - ${project.name} (${project.project_type}) - ID: ${project.id}`)
  })

  // 5. Sample storytellers to see what data they have
  console.log(`\n👤 SAMPLE STORYTELLERS WITH MISSING LINKS:`)
  const sampleStorytellers = allStorytellers?.slice(0, 5) || []
  
  for (const storyteller of sampleStorytellers) {
    console.log(`\nStoryteller: ${storyteller.full_name}`)
    console.log(`  Email: ${storyteller.email}`)
    console.log(`  Community: ${storyteller.community_affiliation}`)
    console.log(`  Project ID: ${storyteller.project_id || '❌ MISSING'}`)
    console.log(`  Organization ID: ${storyteller.organization_id || '❌ MISSING'}`)
    console.log(`  Location ID: ${storyteller.primary_location_id || '❌ MISSING'}`)
    
    // Try to find matching organization by community name
    if (storyteller.community_affiliation && !storyteller.organization_id) {
      const matchingOrg = organizations?.find(org => 
        org.name?.toLowerCase().includes(storyteller.community_affiliation?.toLowerCase()) ||
        storyteller.community_affiliation?.toLowerCase().includes(org.name?.toLowerCase())
      )
      if (matchingOrg) {
        console.log(`  🎯 POTENTIAL ORG MATCH: ${matchingOrg.name}`)
      }
    }
  }

  // 6. Check if email patterns reveal migration data
  console.log(`\n📧 EMAIL PATTERNS IN MIGRATION:`)
  const emailPatterns = new Set()
  allStorytellers?.forEach(s => {
    if (s.email?.includes('@empathyledger.migration')) {
      const parts = s.email.split('@')[0].split('---')
      if (parts.length > 1) {
        emailPatterns.add(parts[parts.length - 1])
      }
    }
  })
  
  console.log(`Migration email patterns found: ${[...emailPatterns].slice(0, 10).join(', ')}`)

  // 7. Check if there are unmapped organizations/locations
  console.log(`\n🔍 CHECKING FOR UNMAPPED DATA:`)
  
  // Find organizations not linked to any storytellers
  const linkedOrgIds = new Set(allStorytellers?.map(s => s.organization_id).filter(Boolean))
  const unlinkedOrgs = organizations?.filter(org => !linkedOrgIds.has(org.id))
  
  console.log(`📊 Unlinked organizations: ${unlinkedOrgs?.length}`)
  unlinkedOrgs?.slice(0, 5).forEach(org => {
    console.log(`  - ${org.name}`)
  })

  // Find locations not linked to any storytellers
  const linkedLocationIds = new Set(allStorytellers?.map(s => s.primary_location_id).filter(Boolean))
  const unlinkedLocations = locations?.filter(loc => !linkedLocationIds.has(loc.id))
  
  console.log(`📍 Unlinked locations: ${unlinkedLocations?.length}`)
  unlinkedLocations?.slice(0, 10).forEach(loc => {
    console.log(`  - ${loc.name}, ${loc.state}`)
  })

  console.log(`\n💥 MIGRATION FAILURE ANALYSIS:`)
  console.log(`❌ ${allStorytellers?.length - hasProject} storytellers missing project links`)
  console.log(`❌ ${allStorytellers?.length - hasOrganization} storytellers missing organization links`) 
  console.log(`❌ ${allStorytellers?.length - hasLocation} storytellers missing location links`)
  console.log(`✅ ${organizations?.length} organizations exist but mostly unlinked`)
  console.log(`✅ ${locations?.length} locations exist but mostly unlinked`)
  console.log(`🎯 Need to match storytellers to orgs/locations by community_affiliation and other data`)

  return {
    storytellers: allStorytellers?.length || 0,
    missingProjects: (allStorytellers?.length || 0) - hasProject,
    missingOrganizations: (allStorytellers?.length || 0) - hasOrganization,
    missingLocations: (allStorytellers?.length || 0) - hasLocation,
    availableOrganizations: organizations?.length || 0,
    availableLocations: locations?.length || 0,
    unlinkedOrganizations: unlinkedOrgs?.length || 0,
    unlinkedLocations: unlinkedLocations?.length || 0
  }
}

analyzeMigrationFailure().catch(console.error)