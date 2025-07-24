import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function showJaredFinalConnections() {
  const storytellerId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  console.log('👤 JARED KEATING - COMPLETE DATABASE CONNECTIONS')
  console.log('=' .repeat(65))
  
  // Get storyteller profile
  const { data: storyteller } = await serviceClient
    .from('users')
    .select('*')
    .eq('id', storytellerId)
    .single()

  console.log(`\n📋 STORYTELLER PROFILE:`)
  console.log(`  🆔 ID: ${storyteller?.id}`)
  console.log(`  👤 Name: ${storyteller?.full_name}`)
  console.log(`  📧 Email: ${storyteller?.email}`)
  console.log(`  🏛️ Role: ${storyteller?.role}`)
  console.log(`  🌍 Community: ${storyteller?.community_affiliation}`)
  console.log(`  📅 Created: ${storyteller?.created_at}`)
  console.log(`  📝 Bio: ${storyteller?.bio?.substring(0, 150)}...`)

  console.log(`\n🔗 FOREIGN KEY RELATIONSHIPS:`)
  console.log(`  📊 Project ID: ${storyteller?.project_id || '❌ None'}`)
  console.log(`  🏢 Organization ID: ${storyteller?.organization_id || '❌ None'}`)
  console.log(`  📍 Location ID: ${storyteller?.primary_location_id || '❌ None'}`)

  // Get linked stories using overlaps
  const { data: linkedStories } = await serviceClient
    .from('stories')
    .select(`
      id, title, content, project_id,
      linked_storytellers, linked_themes, linked_quotes, linked_media,
      projects(name, project_type)
    `)
    .overlaps('linked_storytellers', [storytellerId])

  console.log(`\n📚 LINKED STORIES (${linkedStories?.length || 0}):`)
  linkedStories?.forEach((story, index) => {
    console.log(`\n  ${index + 1}. "${story.title}"`)
    console.log(`     🆔 Story ID: ${story.id}`)
    console.log(`     📊 Project: ${story.projects?.name || 'No project'} (${story.projects?.project_type || 'N/A'})`)
    console.log(`     📝 Content: ${story.content?.length || 0} characters`)
    
    // Show co-storytellers
    const coStorytellers = story.linked_storytellers?.filter(id => id !== storytellerId) || []
    console.log(`     🤝 Co-storytellers: ${coStorytellers.length}`)
    
    // Show other connections
    console.log(`     🏷️  Themes: ${story.linked_themes?.length || 0} connected`)
    console.log(`     💬 Quotes: ${story.linked_quotes?.length || 0} connected`)
    console.log(`     📸 Media: ${story.linked_media?.length || 0} connected`)
  })

  // Check for theme connections
  const { data: allThemes } = await serviceClient
    .from('themes')
    .select('*')

  const linkedThemes = allThemes?.filter(theme => 
    theme.linked_storytellers?.includes(storytellerId)
  ) || []

  // Check for quote connections
  const { data: allQuotes } = await serviceClient
    .from('quotes')
    .select('*')

  const linkedQuotes = allQuotes?.filter(quote => 
    quote.linked_storytellers?.includes(storytellerId)
  ) || []

  console.log(`\n🏷️  THEME CONNECTIONS (${linkedThemes.length}):`)
  linkedThemes.forEach((theme, index) => {
    console.log(`  ${index + 1}. ${theme.name}`)
    console.log(`     🆔 Theme ID: ${theme.id}`)
    console.log(`     👥 Total storytellers: ${theme.linked_storytellers?.length || 0}`)
  })

  console.log(`\n💬 QUOTE CONNECTIONS (${linkedQuotes.length}):`)
  linkedQuotes.forEach((quote, index) => {
    console.log(`  ${index + 1}. "${quote.content?.substring(0, 100)}..."`)
    console.log(`     🆔 Quote ID: ${quote.id}`)
    console.log(`     👥 Total storytellers: ${quote.linked_storytellers?.length || 0}`)
  })

  // Get details about co-storytellers across all stories
  const allCoStorytellerIds = linkedStories?.flatMap(story => 
    story.linked_storytellers?.filter(id => id !== storytellerId) || []
  ) || []
  
  const uniqueCoStorytellerIds = [...new Set(allCoStorytellerIds)]
  
  if (uniqueCoStorytellerIds.length > 0) {
    const { data: coStorytellers } = await serviceClient
      .from('users')
      .select('id, full_name, community_affiliation')
      .in('id', uniqueCoStorytellerIds)

    console.log(`\n🤝 CO-STORYTELLERS (${uniqueCoStorytellerIds.length} unique):`)
    coStorytellers?.forEach((coStoryteller, index) => {
      const connectionCount = allCoStorytellerIds.filter(id => id === coStoryteller.id).length
      console.log(`  ${index + 1}. ${coStoryteller.full_name}`)
      console.log(`     🌍 Community: ${coStoryteller.community_affiliation || 'None'}`)
      console.log(`     🔗 Shared stories: ${connectionCount}`)
    })
  }

  console.log(`\n📊 COMPLETE CONNECTION SUMMARY:`)
  console.log(`  👤 Storyteller: ${storyteller?.full_name}`)
  console.log(`  🆔 Database ID: ${storytellerId}`)
  console.log(`  📚 Connected stories: ${linkedStories?.length || 0}`)
  console.log(`  🏷️  Connected themes: ${linkedThemes.length}`)
  console.log(`  💬 Connected quotes: ${linkedQuotes.length}`)
  console.log(`  🤝 Unique co-storytellers: ${uniqueCoStorytellerIds.length}`)
  console.log(`  🔗 Total network connections: ${(linkedStories?.length || 0) + linkedThemes.length + linkedQuotes.length}`)

  return {
    storyteller: storyteller?.full_name,
    stories: linkedStories?.length || 0,
    themes: linkedThemes.length,
    quotes: linkedQuotes.length,  
    coStorytellers: uniqueCoStorytellerIds.length
  }
}

showJaredFinalConnections().catch(console.error)