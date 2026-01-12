import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const storytellerId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'

async function showJared() {
  // Get storyteller info
  const { data: storyteller } = await client
    .from('users')
    .select('id, full_name, email, community_affiliation, bio, project_id, organization_id, primary_location_id')
    .eq('id', storytellerId)
    .single()

  console.log('👤 JARED KEATING - DATABASE CONNECTIONS')
  console.log('=====================================')
  console.log(`🆔 ID: ${storyteller.id}`)
  console.log(`👤 Name: ${storyteller.full_name}`)
  console.log(`🌍 Community: ${storyteller.community_affiliation}`)
  console.log(`📝 Bio: ${storyteller.bio.substring(0, 150)}...`)

  console.log(`\n🔗 FOREIGN KEY CONNECTIONS:`)
  console.log(`  Project ID: ${storyteller.project_id || 'None'}`)
  console.log(`  Organization ID: ${storyteller.organization_id || 'None'}`)
  console.log(`  Location ID: ${storyteller.primary_location_id || 'None'}`)

  // Get stories using overlaps
  const { data: stories } = await client
    .from('stories')
    .select('id, title, linked_storytellers, projects(name)')
    .overlaps('linked_storytellers', [storytellerId])

  console.log(`\n📚 CONNECTED STORIES (${stories.length}):`)
  stories.forEach((story, i) => {
    console.log(`  ${i+1}. "${story.title}"`)
    console.log(`     🆔 ${story.id}`)
    console.log(`     📊 Project: ${story.projects?.name || 'None'}`)
    console.log(`     👥 Total storytellers: ${story.linked_storytellers.length}`)
    
    const otherStorytellers = story.linked_storytellers.filter(id => id !== storytellerId)
    console.log(`     🤝 Co-storytellers: ${otherStorytellers.length}`)
    if (otherStorytellers.length > 0) {
      console.log(`     🔗 Co-storyteller IDs: ${otherStorytellers.join(', ')}`)
    }
  })

  console.log(`\n📊 SUMMARY:`)
  console.log(`  Stories connected: ${stories.length}`)
  console.log(`  Direct FK connections: ${[storyteller.project_id, storyteller.organization_id, storyteller.primary_location_id].filter(Boolean).length}`)
  
  const totalCoStorytellers = stories.reduce((sum, story) => 
    sum + story.linked_storytellers.filter(id => id !== storytellerId).length, 0
  )
  console.log(`  Total co-storyteller connections: ${totalCoStorytellers}`)
}

showJared().catch(console.error)