import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function useProjectsAsOrganizations() {
  console.log('🔧 ALTERNATIVE: USING PROJECTS AS ORGANIZATIONS')
  console.log('===============================================')
  
  // Since organizations table doesn't exist, let's update users.organization_id 
  // to point to their project_id (treating projects as organizations)
  
  console.log('📊 Current state check...')
  
  const { data: storytellers } = await client
    .from('users')
    .select('id, full_name, project_id, organization_id, community_affiliation')
    .eq('role', 'storyteller')

  const withProject = storytellers?.filter(s => s.project_id).length || 0
  const withOrganization = storytellers?.filter(s => s.organization_id).length || 0

  console.log(`Storytellers with project_id: ${withProject}/${storytellers?.length}`)
  console.log(`Storytellers with organization_id: ${withOrganization}/${storytellers?.length}`)

  // Update organization_id to match project_id for all storytellers
  console.log(`\n🔗 Setting organization_id = project_id for all storytellers...`)
  
  let updatedCount = 0
  let errorCount = 0

  for (const storyteller of storytellers || []) {
    if (storyteller.project_id && !storyteller.organization_id) {
      const { error } = await client
        .from('users')
        .update({ organization_id: storyteller.project_id })
        .eq('id', storyteller.id)

      if (error) {
        console.log(`  ❌ Error updating ${storyteller.full_name}: ${error.message}`)
        errorCount++
      } else {
        updatedCount++
        if (updatedCount <= 5) {
          console.log(`  ✅ ${storyteller.full_name} -> project: ${storyteller.project_id}`)
        }
      }
    }
  }

  console.log(`\n📈 UPDATE RESULTS:`)
  console.log(`✅ Updated: ${updatedCount}`)
  console.log(`❌ Errors: ${errorCount}`)

  // Verify final state
  const { data: finalCheck } = await client
    .from('users')
    .select(`
      id, full_name, community_affiliation,
      project_id, organization_id, primary_location_id,
      projects(name, project_type)
    `)
    .eq('role', 'storyteller')
    .not('organization_id', 'is', null)

  console.log(`\n📊 FINAL VERIFICATION:`)
  console.log(`Storytellers with organization links: ${finalCheck?.length}/${storytellers?.length}`)

  // Show sample with complete links
  console.log(`\n👤 SAMPLE STORYTELLERS WITH COMPLETE LINKS:`)
  finalCheck?.slice(0, 5).forEach(storyteller => {
    console.log(`  - ${storyteller.full_name}`)
    console.log(`    Community: ${storyteller.community_affiliation}`)
    console.log(`    Project/Organization: ${storyteller.projects?.name} (${storyteller.projects?.project_type})`)
    console.log(`    Project ID: ${storyteller.project_id}`)
    console.log(`    Organization ID: ${storyteller.organization_id}`)
    console.log(`    Location ID: ${storyteller.primary_location_id || 'Missing'}`)
  })

  return {
    storytellersUpdated: updatedCount,
    finalLinkedCount: finalCheck?.length || 0,
    errors: errorCount
  }
}

useProjectsAsOrganizations().catch(console.error)