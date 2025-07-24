import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function showStorytellerConnections() {
  console.log('🔍 Finding storyteller with story connections...')
  
  // First, find a story with storyteller connections to get a connected storyteller
  const { data: connectedStory } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .not('linked_storytellers', 'is', null)
    .limit(1)
    .single()

  if (!connectedStory || !connectedStory.linked_storytellers?.length) {
    console.error('❌ No connected stories found')
    return
  }

  const storytellerId = connectedStory.linked_storytellers[0]
  console.log(`🎯 Selected storyteller ID: ${storytellerId}`)

  // Get the storyteller with all their database connections
  const { data: storyteller } = await serviceClient
    .from('users')
    .select(`
      id, full_name, email, role, bio, community_affiliation,
      project_id, organization_id, primary_location_id,
      created_at, updated_at,
      projects(id, name, project_type, description),
      organizations(id, name, description),
      locations(id, name, state, country, latitude, longitude)
    `)
    .eq('id', storytellerId)
    .single()

  if (!storyteller) {
    console.error('❌ Storyteller not found')
    return
  }

  console.log(`\n👤 STORYTELLER: ${storyteller.full_name}`)
  console.log(`📧 Email: ${storyteller.email}`)
  console.log(`🏛️ Role: ${storyteller.role}`)
  console.log(`🌍 Community: ${storyteller.community_affiliation || 'Not specified'}`)
  console.log(`📝 Bio: ${storyteller.bio || 'No bio available'}`)

  // Show direct foreign key connections
  console.log(`\n🔗 DIRECT DATABASE CONNECTIONS:`)
  console.log(`  Project ID: ${storyteller.project_id || 'None'}`)
  console.log(`  Organization ID: ${storyteller.organization_id || 'None'}`)
  console.log(`  Location ID: ${storyteller.primary_location_id || 'None'}`)

  // Show related data through foreign keys
  if (storyteller.projects) {
    console.log(`\n📊 PROJECT CONNECTION:`)
    console.log(`  Name: ${storyteller.projects.name}`)
    console.log(`  Type: ${storyteller.projects.project_type}`)
    console.log(`  Description: ${storyteller.projects.description || 'No description'}`)
  }

  if (storyteller.organizations) {
    console.log(`\n🏢 ORGANIZATION CONNECTION:`)
    console.log(`  Name: ${storyteller.organizations.name}`)
    console.log(`  Description: ${storyteller.organizations.description || 'No description'}`)
  }

  if (storyteller.locations) {
    console.log(`\n📍 LOCATION CONNECTION:`)
    console.log(`  Name: ${storyteller.locations.name}`)
    console.log(`  State: ${storyteller.locations.state || 'Not specified'}`)
    console.log(`  Country: ${storyteller.locations.country || 'Not specified'}`)
    if (storyteller.locations.latitude && storyteller.locations.longitude) {
      console.log(`  Coordinates: ${storyteller.locations.latitude}, ${storyteller.locations.longitude}`)
    }
  }

  // Find all stories this storyteller is linked to (reverse lookup)
  const { data: linkedStories } = await serviceClient
    .from('stories')
    .select(`
      id, title, content, project_id, 
      linked_storytellers, linked_themes, linked_quotes, linked_media,
      projects(name)
    `)
    .contains('linked_storytellers', [storytellerId])

  console.log(`\n📚 LINKED STORIES (${linkedStories?.length || 0}):`)
  linkedStories?.forEach((story, index) => {
    console.log(`  ${index + 1}. "${story.title}"`)
    console.log(`     Project: ${story.projects?.name || 'No project'}`)
    console.log(`     Storytellers: ${story.linked_storytellers?.length || 0} connected`)
    console.log(`     Themes: ${story.linked_themes?.length || 0} connected`)
    console.log(`     Quotes: ${story.linked_quotes?.length || 0} connected`)
    console.log(`     Media: ${story.linked_media?.length || 0} connected`)
    console.log(`     Content length: ${story.content?.length || 0} characters`)
  })

  // Check for any other potential connections in the database
  console.log(`\n🔍 OTHER POTENTIAL CONNECTIONS:`)
  
  // Check if storyteller appears in any themes
  const { data: themes } = await serviceClient
    .from('themes')
    .select('id, name')
    .contains('linked_storytellers', [storytellerId])

  if (themes?.length) {
    console.log(`  Themes: ${themes.length} connected`)
    themes.forEach(theme => console.log(`    - ${theme.name}`))
  } else {
    console.log(`  Themes: None connected`)
  }

  // Check if storyteller appears in any quotes
  const { data: quotes } = await serviceClient
    .from('quotes')
    .select('id, content')
    .contains('linked_storytellers', [storytellerId])

  if (quotes?.length) {
    console.log(`  Quotes: ${quotes.length} connected`)
    quotes.forEach(quote => console.log(`    - "${quote.content?.substring(0, 100)}..."`))
  } else {
    console.log(`  Quotes: None connected`)
  }

  console.log(`\n📈 CONNECTION SUMMARY:`)
  console.log(`  Stories: ${linkedStories?.length || 0}`)
  console.log(`  Themes: ${themes?.length || 0}`)
  console.log(`  Quotes: ${quotes?.length || 0}`)
  console.log(`  Project: ${storyteller.projects ? '1' : '0'}`)
  console.log(`  Organization: ${storyteller.organizations ? '1' : '0'}`)
  console.log(`  Location: ${storyteller.locations ? '1' : '0'}`)

  return {
    storyteller: storyteller.full_name,
    connections: {
      stories: linkedStories?.length || 0,
      themes: themes?.length || 0,
      quotes: quotes?.length || 0,
      project: storyteller.projects ? 1 : 0,
      organization: storyteller.organizations ? 1 : 0,
      location: storyteller.locations ? 1 : 0
    }
  }
}

showStorytellerConnections().catch(console.error)