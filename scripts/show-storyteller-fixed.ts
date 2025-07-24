import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function showStorytellerFixed() {
  console.log('🔍 Finding storyteller with story connections...')
  
  // Get a connected story and show one of its storytellers
  const { data: connectedStory } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .not('linked_storytellers', 'is', null)
    .limit(1)
    .single()

  if (!connectedStory?.linked_storytellers?.length) {
    console.error('❌ No connected stories found')
    return
  }

  const storytellerId = connectedStory.linked_storytellers[0]
  console.log(`🎯 Looking for storyteller: ${storytellerId}`)
  console.log(`📚 From story: "${connectedStory.title}"`)

  // Get basic storyteller info first
  const { data: storyteller, error: storytellerError } = await serviceClient
    .from('users')
    .select('*')
    .eq('id', storytellerId)
    .single()

  if (storytellerError || !storyteller) {
    console.error('❌ Storyteller error:', storytellerError)
    return
  }

  console.log(`\n👤 STORYTELLER: ${storyteller.full_name}`)
  console.log(`📧 Email: ${storyteller.email || 'Not provided'}`)
  console.log(`🏛️ Role: ${storyteller.role}`)
  console.log(`🌍 Community: ${storyteller.community_affiliation || 'Not specified'}`)
  console.log(`📝 Bio: ${storyteller.bio || 'No bio available'}`)

  // Show all direct database properties
  console.log(`\n🔗 DATABASE PROPERTIES:`)
  console.log(`  ID: ${storyteller.id}`)
  console.log(`  Project ID: ${storyteller.project_id || 'None'}`)
  console.log(`  Organization ID: ${storyteller.organization_id || 'None'}`)
  console.log(`  Primary Location ID: ${storyteller.primary_location_id || 'None'}`)
  console.log(`  Created: ${storyteller.created_at}`)
  console.log(`  Updated: ${storyteller.updated_at}`)

  // Get related data separately to avoid join issues
  let projectData = null
  if (storyteller.project_id) {
    const { data } = await serviceClient
      .from('projects')
      .select('*')
      .eq('id', storyteller.project_id)
      .single()
    projectData = data
  }

  let organizationData = null
  if (storyteller.organization_id) {
    const { data } = await serviceClient
      .from('organizations')
      .select('*')
      .eq('id', storyteller.organization_id)
      .single()
    organizationData = data
  }

  let locationData = null
  if (storyteller.primary_location_id) {
    const { data } = await serviceClient
      .from('locations')
      .select('*')
      .eq('id', storyteller.primary_location_id)
      .single()
    locationData = data
  }

  // Show related data
  if (projectData) {
    console.log(`\n📊 PROJECT CONNECTION:`)
    console.log(`  Name: ${projectData.name}`)
    console.log(`  Type: ${projectData.project_type}`)
    console.log(`  Description: ${projectData.description || 'No description'}`)
  }

  if (organizationData) {
    console.log(`\n🏢 ORGANIZATION CONNECTION:`)
    console.log(`  Name: ${organizationData.name}`)
    console.log(`  Description: ${organizationData.description || 'No description'}`)
  }

  if (locationData) {
    console.log(`\n📍 LOCATION CONNECTION:`)
    console.log(`  Name: ${locationData.name}`)
    console.log(`  State: ${locationData.state || 'Not specified'}`)
    console.log(`  Country: ${locationData.country || 'Not specified'}`)
    if (locationData.latitude && locationData.longitude) {
      console.log(`  Coordinates: ${locationData.latitude}, ${locationData.longitude}`)
    }
  }

  // Find all stories linked to this storyteller
  const { data: linkedStories } = await serviceClient
    .from('stories')
    .select('id, title, content, linked_storytellers, linked_themes, linked_quotes, linked_media')
    .contains('linked_storytellers', [storytellerId])

  console.log(`\n📚 LINKED STORIES (${linkedStories?.length || 0}):`)
  linkedStories?.forEach((story, index) => {
    console.log(`  ${index + 1}. "${story.title}"`)
    console.log(`     Storytellers: ${story.linked_storytellers?.length || 0}`)
    console.log(`     Themes: ${story.linked_themes?.length || 0}`)
    console.log(`     Quotes: ${story.linked_quotes?.length || 0}`)
    console.log(`     Media: ${story.linked_media?.length || 0}`)
    console.log(`     Content: ${story.content?.length || 0} characters`)
  })

  // Summary
  console.log(`\n📈 COMPLETE CONNECTION SUMMARY:`)
  console.log(`  Stories: ${linkedStories?.length || 0}`)
  console.log(`  Project: ${projectData ? '✅ Connected' : '❌ None'}`)
  console.log(`  Organization: ${organizationData ? '✅ Connected' : '❌ None'}`)
  console.log(`  Location: ${locationData ? '✅ Connected' : '❌ None'}`)

  return storyteller.full_name
}

showStorytellerFixed().catch(console.error)