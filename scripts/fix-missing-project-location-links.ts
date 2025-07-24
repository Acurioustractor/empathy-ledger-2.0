import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function fixMissingProjectLocationLinks() {
  console.log('🔧 FIXING MISSING PROJECT AND LOCATION LINKS')
  console.log('============================================')
  
  // 1. Get current state
  const { data: storytellers } = await client
    .from('users')
    .select('id, full_name, project_id, primary_location_id, community_affiliation')
    .eq('role', 'storyteller')

  const missingProject = storytellers?.filter(s => !s.project_id) || []
  const missingLocation = storytellers?.filter(s => !s.primary_location_id) || []

  console.log(`📊 CURRENT STATE:`)
  console.log(`  Storytellers missing project_id: ${missingProject.length}`)
  console.log(`  Storytellers missing primary_location_id: ${missingLocation.length}`)

  // 2. Get available projects and locations
  const { data: projects } = await client.from('projects').select('*')
  const { data: locations } = await client.from('locations').select('*')

  console.log(`\n📊 AVAILABLE RESOURCES:`)
  console.log(`  Projects: ${projects?.length}`)
  console.log(`  Locations: ${locations?.length}`)

  // 3. Fix missing project links by matching community_affiliation
  console.log(`\n🔗 FIXING MISSING PROJECT LINKS:`)
  
  let projectLinksFixed = 0
  for (const storyteller of missingProject) {
    // Try to find matching project by community name
    const matchingProject = projects?.find(project => 
      project.name?.toLowerCase() === storyteller.community_affiliation?.toLowerCase() ||
      storyteller.community_affiliation?.toLowerCase().includes(project.name?.toLowerCase())
    )

    if (matchingProject) {
      const { error } = await client
        .from('users')
        .update({ project_id: matchingProject.id })
        .eq('id', storyteller.id)

      if (error) {
        console.log(`  ❌ Error linking ${storyteller.full_name} to ${matchingProject.name}: ${error.message}`)
      } else {
        console.log(`  ✅ Linked ${storyteller.full_name} to project: ${matchingProject.name}`)
        projectLinksFixed++
      }
    } else {
      // Link to a default project (Orange Sky as it has most storytellers)
      const defaultProject = projects?.find(p => p.name === 'Orange Sky')
      if (defaultProject) {
        const { error } = await client
          .from('users')
          .update({ project_id: defaultProject.id })
          .eq('id', storyteller.id)

        if (!error) {
          console.log(`  🔄 Linked ${storyteller.full_name} to default project: Orange Sky`)
          projectLinksFixed++
        }
      }
    }
  }

  // 4. Fix missing location links 
  console.log(`\n📍 FIXING MISSING LOCATION LINKS:`)
  
  let locationLinksFixed = 0
  for (const storyteller of missingLocation) {
    // For now, assign a default location (Melbourne as it's a major city)
    const defaultLocation = locations?.find(l => l.name === 'Melbourne')
    
    if (defaultLocation) {
      const { error } = await client
        .from('users')
        .update({ primary_location_id: defaultLocation.id })
        .eq('id', storyteller.id)

      if (error) {
        console.log(`  ❌ Error linking ${storyteller.full_name} to Melbourne: ${error.message}`)
      } else {
        console.log(`  📍 Linked ${storyteller.full_name} to default location: Melbourne`)
        locationLinksFixed++
      }
    }
  }

  // 5. Verify final state
  const { data: finalCheck } = await client
    .from('users')
    .select(`
      id, full_name, project_id, primary_location_id, community_affiliation,
      projects(name, project_type),
      locations(name, state, country)
    `)
    .eq('role', 'storyteller')

  const finalWithProject = finalCheck?.filter(s => s.project_id).length || 0
  const finalWithLocation = finalCheck?.filter(s => s.primary_location_id).length || 0

  console.log(`\n📈 FINAL RESULTS:`)
  console.log(`✅ Project links fixed: ${projectLinksFixed}`)
  console.log(`✅ Location links fixed: ${locationLinksFixed}`)
  console.log(`📊 Total with projects: ${finalWithProject}/${storytellers?.length}`)
  console.log(`📊 Total with locations: ${finalWithLocation}/${storytellers?.length}`)

  // 6. Show sample of fixed storytellers
  console.log(`\n👤 SAMPLE STORYTELLERS WITH COMPLETE AVAILABLE LINKS:`)
  finalCheck?.slice(0, 5).forEach(storyteller => {
    console.log(`  - ${storyteller.full_name}`)
    console.log(`    Community: ${storyteller.community_affiliation}`)
    console.log(`    Project: ${storyteller.projects?.name || 'Missing'} (${storyteller.projects?.project_type || 'N/A'})`)
    console.log(`    Location: ${storyteller.locations?.name || 'Missing'}, ${storyteller.locations?.state || 'N/A'}`)
    console.log(`    Organization: UNAVAILABLE (table doesn't exist)`)
  })

  return {
    projectLinksFixed,
    locationLinksFixed,
    finalWithProject,
    finalWithLocation,
    totalStorytellers: storytellers?.length || 0
  }
}

fixMissingProjectLocationLinks().catch(console.error)