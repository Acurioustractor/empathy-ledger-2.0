import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkCreateOrgsTable() {
  console.log('🔍 CHECKING ORGANIZATIONS TABLE')
  console.log('==============================')
  
  // 1. Try different approaches to check/create organizations
  console.log('Testing table access...')
  
  try {
    // Try to select from organizations
    const { data: orgs, error: selectError } = await client
      .from('organizations')
      .select('*')
      .limit(1)
      
    console.log(`Select result: ${orgs?.length || 0} rows`)
    if (selectError) {
      console.log(`Select error: ${selectError.message}`)
    }
  } catch (error) {
    console.log(`Select exception: ${error}`)
  }

  // 2. Try to insert a test organization
  console.log('\nTrying to insert test organization...')
  
  try {
    const { data: newOrg, error: insertError } = await client
      .from('organizations')
      .insert({
        name: 'Test Organization',
        description: 'Test organization for migration fix',
        organization_type: 'Community',
        status: 'active'
      })
      .select()
      .single()

    if (insertError) {
      console.log(`Insert error: ${insertError.message}`)
      console.log(`Error details:`, insertError)
    } else {
      console.log(`✅ Successfully created test org: ${newOrg?.id}`)
      
      // Delete the test org
      await client.from('organizations').delete().eq('id', newOrg.id)
      console.log('🗑️ Cleaned up test organization')
    }
  } catch (error) {
    console.log(`Insert exception: ${error}`)
  }

  // 3. Check if we need to create organizations based on existing projects
  console.log('\n📊 ALTERNATIVE: Use projects as organizations...')
  
  const { data: projects } = await client.from('projects').select('*')
  const { data: storytellers } = await client
    .from('users')
    .select('community_affiliation, project_id, projects(name)')
    .eq('role', 'storyteller')

  console.log(`\nProjects available: ${projects?.length}`)
  projects?.forEach(project => {
    const storytellerCount = storytellers?.filter(s => s.project_id === project.id).length || 0
    console.log(`  - ${project.name}: ${storytellerCount} storytellers`)
  })

  // 4. Try using community_affiliation as organization names directly
  console.log('\n🏢 CREATING ORGANIZATIONS FROM COMMUNITIES:')
  
  const communities = [...new Set(storytellers?.map(s => s.community_affiliation).filter(Boolean))]
  console.log(`Found ${communities.length} unique communities`)
  
  let successCount = 0
  let errorCount = 0
  const createdOrgs = []

  for (const community of communities.slice(0, 3)) { // Test with first 3
    try {
      const { data: org, error } = await client
        .from('organizations')
        .insert({
          name: community,
          description: `${community} community organization`,
          organization_type: 'Community',
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.log(`  ❌ ${community}: ${error.message}`)
        errorCount++
      } else {
        console.log(`  ✅ ${community}: Created (ID: ${org.id})`)
        createdOrgs.push(org)
        successCount++
      }
    } catch (error) {
      console.log(`  ❌ ${community}: Exception ${error}`)
      errorCount++
    }
  }

  console.log(`\n📈 TEST RESULTS:`)
  console.log(`✅ Created: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)

  if (createdOrgs.length > 0) {
    console.log(`\n🔗 Testing storyteller linking...`)
    
    const testOrg = createdOrgs[0]
    const { data: matchingStorytellers } = await client
      .from('users')
      .select('id, full_name')
      .eq('role', 'storyteller')
      .eq('community_affiliation', testOrg.name)
      .limit(2)

    for (const storyteller of matchingStorytellers || []) {
      const { error } = await client
        .from('users')
        .update({ organization_id: testOrg.id })
        .eq('id', storyteller.id)

      if (error) {
        console.log(`  ❌ Link error for ${storyteller.full_name}: ${error.message}`)
      } else {
        console.log(`  ✅ Linked ${storyteller.full_name} to ${testOrg.name}`)
      }
    }
  }

  return {
    organizationsCreated: successCount,
    errors: errorCount
  }
}

checkCreateOrgsTable().catch(console.error)