import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkActualSchema() {
  console.log('🔍 CHECKING ACTUAL DATABASE SCHEMA')
  console.log('=================================')
  
  // Check if communities table exists
  console.log('📊 Checking communities table...')
  try {
    const { data: communities, error: communitiesError } = await client
      .from('communities')
      .select('*')
      .limit(5)

    if (communitiesError) {
      console.log(`❌ Communities table error: ${communitiesError.message}`)
    } else {
      console.log(`✅ Communities table exists with ${communities?.length || 0} sample records`)
      
      // Show structure
      if (communities && communities.length > 0) {
        console.log(`📋 Communities table columns:`)
        Object.keys(communities[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof communities[0][key]}`)
        })
        
        console.log(`\n📄 Sample communities:`)
        communities.forEach(community => {
          console.log(`  - ${community.name || community.id} (ID: ${community.id})`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ Communities table exception: ${error}`)
  }

  // Check organizations table
  console.log('\n🏢 Checking organizations table...')
  try {
    const { data: organizations, error: orgsError } = await client
      .from('organizations')
      .select('*')
      .limit(5)

    if (orgsError) {
      console.log(`❌ Organizations table error: ${orgsError.message}`)
    } else {
      console.log(`✅ Organizations table exists with ${organizations?.length || 0} records`)
    }
  } catch (error) {
    console.log(`❌ Organizations table exception: ${error}`)
  }

  // Check what the users table foreign key actually references
  console.log('\n👤 Checking users table structure...')
  const { data: sampleUser } = await client
    .from('users')
    .select('*')
    .eq('role', 'storyteller')
    .limit(1)
    .single()

  if (sampleUser) {
    console.log(`📋 Users table relevant columns:`)
    console.log(`  - organization_id: ${sampleUser.organization_id}`)
    console.log(`  - community_affiliation: ${sampleUser.community_affiliation}`)
    console.log(`  - project_id: ${sampleUser.project_id}`)
    console.log(`  - primary_location_id: ${sampleUser.primary_location_id}`)
  }

  // Check if we can get communities that match storyteller community_affiliations
  console.log('\n🔍 Checking community-storyteller matches...')
  
  const { data: storytellers } = await client
    .from('users')
    .select('community_affiliation')
    .eq('role', 'storyteller')
    .not('community_affiliation', 'is', null)

  const uniqueCommunities = [...new Set(storytellers?.map(s => s.community_affiliation))]
  console.log(`Found ${uniqueCommunities.length} unique community affiliations:`)
  uniqueCommunities.slice(0, 10).forEach(community => {
    console.log(`  - ${community}`)
  })

  // Try to find matching communities in communities table
  try {
    const { data: existingCommunities } = await client
      .from('communities')
      .select('*')

    console.log(`\n🎯 Communities table has ${existingCommunities?.length || 0} records`)
    
    if (existingCommunities) {
      console.log(`📄 Existing communities:`)
      existingCommunities.slice(0, 10).forEach(community => {
        console.log(`  - ${community.name} (ID: ${community.id})`)
      })

      // Check matches
      const matches = uniqueCommunities.filter(uc => 
        existingCommunities.some(ec => 
          ec.name?.toLowerCase() === uc?.toLowerCase() ||
          ec.name?.toLowerCase().includes(uc?.toLowerCase()) ||
          uc?.toLowerCase().includes(ec.name?.toLowerCase())
        )
      )
      
      console.log(`\n🔗 Matching communities: ${matches.length}/${uniqueCommunities.length}`)
      matches.forEach(match => console.log(`  ✅ ${match}`))
    }
  } catch (error) {
    console.log(`Communities table lookup failed: ${error}`)
  }

  return {
    uniqueCommunityAffiliations: uniqueCommunities.length,
    storytellers: storytellers?.length || 0
  }
}

checkActualSchema().catch(console.error)