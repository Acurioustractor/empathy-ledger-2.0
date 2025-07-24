import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function linkToCommunitiesFixed() {
  console.log('🔗 LINKING STORYTELLERS TO COMMUNITIES TABLE')
  console.log('===========================================')
  
  // Get all communities
  const { data: allCommunities } = await client
    .from('communities')
    .select('*')

  console.log(`📊 Found ${allCommunities?.length} communities in database`)

  // Get all storytellers
  const { data: allStorytellers } = await client
    .from('users')
    .select('id, full_name, community_affiliation, organization_id')
    .eq('role', 'storyteller')

  console.log(`👥 Found ${allStorytellers?.length} storytellers to link`)

  // Create community name to ID mapping
  const communityMap = new Map()
  allCommunities?.forEach(community => {
    communityMap.set(community.name, community.id)
  })

  console.log(`\n🗺️ Community mapping:`)
  communityMap.forEach((id, name) => {
    console.log(`  ${name} -> ${id}`)
  })

  // Link storytellers to communities
  console.log(`\n🔗 Linking storytellers to communities:`)
  
  let linkedCount = 0
  let alreadyLinkedCount = 0
  let errorCount = 0
  let noMatchCount = 0

  for (const storyteller of allStorytellers || []) {
    // Skip if already linked
    if (storyteller.organization_id) {
      alreadyLinkedCount++
      continue
    }

    const communityId = communityMap.get(storyteller.community_affiliation)
    
    if (!communityId) {
      console.log(`  ❌ No community match for: ${storyteller.full_name} (${storyteller.community_affiliation})`)
      noMatchCount++
      continue
    }

    // Update storyteller with community ID
    const { error } = await client
      .from('users')
      .update({ organization_id: communityId })
      .eq('id', storyteller.id)

    if (error) {
      console.log(`  ❌ Error linking ${storyteller.full_name}: ${error.message}`)
      errorCount++
    } else {
      console.log(`  ✅ ${storyteller.full_name} -> ${storyteller.community_affiliation}`)
      linkedCount++
    }
  }

  // Verify results
  const { data: finalCheck } = await client
    .from('users')
    .select(`
      id, full_name, community_affiliation, organization_id
    `)
    .eq('role', 'storyteller')
    .not('organization_id', 'is', null)

  console.log(`\n📈 LINKING RESULTS:`)
  console.log(`✅ Successfully linked: ${linkedCount}`)
  console.log(`🔄 Already linked: ${alreadyLinkedCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`❓ No match: ${noMatchCount}`)
  console.log(`📊 Total with community links: ${finalCheck?.length}/${allStorytellers?.length}`)

  // Show sample linked storytellers
  console.log(`\n👤 SAMPLE LINKED STORYTELLERS:`)
  finalCheck?.slice(0, 8).forEach(storyteller => {
    console.log(`  - ${storyteller.full_name}`)
    console.log(`    Community Affiliation: ${storyteller.community_affiliation}`)
    console.log(`    Organization ID: ${storyteller.organization_id}`)
  })

  // Show community distribution
  console.log(`\n📊 COMMUNITY DISTRIBUTION:`)
  const communityCount = new Map()
  
  for (const storyteller of finalCheck || []) {
    // Get community name by ID
    const communityName = Array.from(communityMap.entries())
      .find(([name, id]) => id === storyteller.organization_id)?.[0] || 'Unknown'
    
    communityCount.set(communityName, (communityCount.get(communityName) || 0) + 1)
  }

  Array.from(communityCount.entries())
    .sort(([,a], [,b]) => b - a)
    .forEach(([community, count]) => {
      console.log(`  ${community}: ${count} storytellers`)
    })

  return {
    linked: linkedCount,
    alreadyLinked: alreadyLinkedCount,
    errors: errorCount,
    noMatch: noMatchCount,
    totalLinked: finalCheck?.length || 0,
    totalStorytellers: allStorytellers?.length || 0
  }
}

linkToCommunitiesFixed().catch(console.error)