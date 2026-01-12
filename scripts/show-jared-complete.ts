import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function showJaredComplete() {
  const storytellerId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  console.log('👤 COMPLETE STORYTELLER PROFILE & CONNECTIONS')
  console.log('=' .repeat(60))
  
  // Get storyteller details
  const { data: storyteller } = await serviceClient
    .from('users')
    .select('*')
    .eq('id', storytellerId)
    .single()

  console.log(`\n📋 BASIC INFORMATION:`)
  console.log(`  Name: ${storyteller?.full_name}`)
  console.log(`  Email: ${storyteller?.email}`)
  console.log(`  Role: ${storyteller?.role}`)
  console.log(`  Community: ${storyteller?.community_affiliation}`)
  console.log(`  Bio: ${storyteller?.bio?.substring(0, 200)}${storyteller?.bio?.length > 200 ? '...' : ''}`)

  console.log(`\n🔗 DATABASE FOREIGN KEYS:`)
  console.log(`  Project ID: ${storyteller?.project_id || 'None'}`)
  console.log(`  Organization ID: ${storyteller?.organization_id || 'None'}`)
  console.log(`  Primary Location ID: ${storyteller?.primary_location_id || 'None'}`)
  console.log(`  Created: ${storyteller?.created_at}`)
  console.log(`  Updated: ${storyteller?.updated_at}`)

  // Get all related stories using the working query method
  const { data: allStories } = await serviceClient
    .from('stories')
    .select(`
      id, title, content, project_id, 
      linked_storytellers, linked_themes, linked_quotes, linked_media,
      projects(name, project_type)
    `)
    .not('linked_storytellers', 'is', null)

  const linkedStories = allStories?.filter(s => 
    s.linked_storytellers?.includes(storytellerId)
  ) || []

  console.log(`\n📚 LINKED STORIES (${linkedStories.length}):`)
  linkedStories.forEach((story, index) => {
    console.log(`\n  ${index + 1}. "${story.title}"`)
    console.log(`     🆔 Story ID: ${story.id}`)
    console.log(`     📊 Project: ${story.projects?.name || 'No project'}`)
    console.log(`     👥 Total storytellers: ${story.linked_storytellers?.length || 0}`)
    console.log(`     🏷️  Themes: ${story.linked_themes?.length || 0}`)
    console.log(`     💬 Quotes: ${story.linked_quotes?.length || 0}`)
    console.log(`     📸 Media: ${story.linked_media?.length || 0}`)
    console.log(`     📝 Content: ${story.content?.length || 0} characters`)
    
    // Show other storytellers connected to this story
    if (story.linked_storytellers && story.linked_storytellers.length > 1) {
      const otherStorytellers = story.linked_storytellers.filter(id => id !== storytellerId)
      console.log(`     🤝 Co-storytellers: ${otherStorytellers.length}`)
    }
  })

  // Check other potential connections
  console.log(`\n🔍 OTHER DATABASE CONNECTIONS:`)

  // Check themes
  const { data: themes } = await serviceClient
    .from('themes')
    .select('*')

  const linkedThemes = themes?.filter(t => 
    t.linked_storytellers?.includes(storytellerId)
  ) || []

  console.log(`  Themes: ${linkedThemes.length}`)
  linkedThemes.forEach(theme => {
    console.log(`    - ${theme.name}`)
  })

  // Check quotes  
  const { data: quotes } = await serviceClient
    .from('quotes')
    .select('*')

  const linkedQuotes = quotes?.filter(q => 
    q.linked_storytellers?.includes(storytellerId)
  ) || []

  console.log(`  Quotes: ${linkedQuotes.length}`)
  linkedQuotes.forEach(quote => {
    console.log(`    - "${quote.content?.substring(0, 100)}..."`)
  })

  console.log(`\n📊 CONNECTION SUMMARY FOR JARED KEATING:`)
  console.log(`  🆔 Storyteller ID: ${storytellerId}`)
  console.log(`  📚 Stories: ${linkedStories.length}`)
  console.log(`  🏷️  Themes: ${linkedThemes.length}`)
  console.log(`  💬 Quotes: ${linkedQuotes.length}`)
  console.log(`  📊 Direct FK Relations: ${[storyteller?.project_id, storyteller?.organization_id, storyteller?.primary_location_id].filter(Boolean).length}`)

  // Calculate total story connections this storyteller contributes to
  const totalStoryConnections = linkedStories.reduce((sum, story) => 
    sum + (story.linked_storytellers?.length || 0), 0
  )

  console.log(`  🔗 Total story network connections: ${totalStoryConnections}`)
  console.log(`  📈 Average co-storytellers per story: ${linkedStories.length > 0 ? (totalStoryConnections / linkedStories.length).toFixed(1) : 0}`)

  return {
    storyteller: storyteller?.full_name,
    id: storytellerId,
    stories: linkedStories.length,
    themes: linkedThemes.length,
    quotes: linkedQuotes.length,
    totalConnections: totalStoryConnections
  }
}

showJaredComplete().catch(console.error)