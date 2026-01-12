import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function fixMissingOrganizations() {
  console.log('🔧 FIXING MISSING ORGANIZATIONS')
  console.log('==============================')
  
  // 1. Confirm organizations table is empty
  const { data: existingOrgs } = await client.from('organizations').select('*')
  console.log(`📊 Current organizations: ${existingOrgs?.length || 0}`)
  
  // 2. Get all unique community affiliations from storytellers
  const { data: storytellers } = await client
    .from('users')
    .select('community_affiliation, project_id, projects(name)')
    .eq('role', 'storyteller')
    .not('community_affiliation', 'is', null)

  // Group by community to understand what organizations we need
  const communityGroups = storytellers?.reduce((acc, storyteller) => {
    const community = storyteller.community_affiliation
    if (!acc[community]) {
      acc[community] = {
        count: 0,
        project: storyteller.projects?.name,
        project_id: storyteller.project_id
      }
    }
    acc[community].count++
    return acc
  }, {} as Record<string, any>)

  console.log(`\n📊 COMMUNITY GROUPS TO CREATE AS ORGANIZATIONS:`)
  Object.entries(communityGroups || {}).forEach(([community, data]) => {
    console.log(`  - ${community}: ${data.count} storytellers (Project: ${data.project})`)
  })

  // 3. Create organizations based on community affiliations
  console.log(`\n🏢 CREATING MISSING ORGANIZATIONS:`)
  
  const organizationsToCreate = Object.entries(communityGroups || {}).map(([community, data]) => ({
    name: community,
    description: `Organization for ${community} community storytellers`,
    organization_type: 'Community',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  let createdOrgs = []
  if (organizationsToCreate.length > 0) {
    console.log(`Creating ${organizationsToCreate.length} organizations...`)
    
    for (const org of organizationsToCreate) {
      const { data: newOrg, error } = await client
        .from('organizations')
        .insert(org)
        .select()
        .single()

      if (error) {
        console.log(`  ❌ Error creating ${org.name}: ${error.message}`)
      } else {
        console.log(`  ✅ Created: ${org.name} (ID: ${newOrg.id})`)
        createdOrgs.push(newOrg)
      }
    }
  }

  // 4. Link storytellers to their matching organizations
  console.log(`\n🔗 LINKING STORYTELLERS TO ORGANIZATIONS:`)
  
  let linkedCount = 0
  let errorCount = 0

  for (const org of createdOrgs) {
    // Find storytellers with matching community affiliation
    const { data: matchingStorytellers } = await client
      .from('users')
      .select('id, full_name, community_affiliation')
      .eq('role', 'storyteller')
      .eq('community_affiliation', org.name)

    console.log(`\n📍 Linking ${matchingStorytellers?.length} storytellers to ${org.name}:`)

    for (const storyteller of matchingStorytellers || []) {
      const { error } = await client
        .from('users')
        .update({ organization_id: org.id })
        .eq('id', storyteller.id)

      if (error) {
        console.log(`  ❌ Error linking ${storyteller.full_name}: ${error.message}`)
        errorCount++
      } else {
        console.log(`  ✅ Linked: ${storyteller.full_name}`)
        linkedCount++
      }
    }
  }

  // 5. Verify final state
  const { data: finalCheck } = await client
    .from('users')
    .select('id, organization_id')
    .eq('role', 'storyteller')
    .not('organization_id', 'is', null)

  console.log(`\n📈 FINAL RESULTS:`)
  console.log(`✅ Organizations created: ${createdOrgs.length}`)
  console.log(`✅ Storytellers linked: ${linkedCount}`)
  console.log(`❌ Link errors: ${errorCount}`)
  console.log(`📊 Total storytellers with organizations: ${finalCheck?.length}/206`)

  // 6. Show sample of fixed storytellers
  const { data: sampleFixed } = await client
    .from('users')
    .select(`
      full_name, community_affiliation, 
      organizations(name),
      projects(name),
      locations(name, state)
    `)
    .eq('role', 'storyteller')
    .not('organization_id', 'is', null)
    .limit(5)

  console.log(`\n👤 SAMPLE FIXED STORYTELLERS:`)
  sampleFixed?.forEach(storyteller => {
    console.log(`  - ${storyteller.full_name}`)
    console.log(`    Community: ${storyteller.community_affiliation}`)
    console.log(`    Organization: ${storyteller.organizations?.name}`)
    console.log(`    Project: ${storyteller.projects?.name}`)
    console.log(`    Location: ${storyteller.locations?.name}, ${storyteller.locations?.state}`)
  })

  return {
    organizationsCreated: createdOrgs.length,
    storytellersLinked: linkedCount,
    errors: errorCount,
    finalLinkedCount: finalCheck?.length || 0
  }
}

fixMissingOrganizations().catch(console.error)