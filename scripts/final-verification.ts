import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function finalVerification() {
  console.log('🔍 Final comprehensive verification...')
  
  // Get all stories with their connections
  const { data: allStories } = await serviceClient
    .from('stories')
    .select(`
      id, title, linked_storytellers,
      projects(name)
    `)

  if (!allStories) {
    console.error('❌ Could not fetch stories')
    return
  }

  const connectedStories = allStories.filter(s => s.linked_storytellers && s.linked_storytellers.length > 0)
  const unconnectedStories = allStories.filter(s => !s.linked_storytellers || s.linked_storytellers.length === 0)

  console.log(`\n📊 FINAL STATISTICS:`)
  console.log(`✅ Connected stories: ${connectedStories.length}`)
  console.log(`❌ Unconnected stories: ${unconnectedStories.length}`)
  console.log(`📈 Connection rate: ${Math.round((connectedStories.length / allStories.length) * 100)}%`)

  // Show connection distribution
  const connectionCounts = connectedStories.reduce((acc, story) => {
    const count = story.linked_storytellers?.length || 0
    acc[count] = (acc[count] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  console.log(`\n🔗 Connection distribution:`)
  Object.entries(connectionCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([count, stories]) => {
      console.log(`  ${count} storytellers: ${stories} stories`)
    })

  // Total storyteller connections
  const totalConnections = connectedStories.reduce((sum, story) => 
    sum + (story.linked_storytellers?.length || 0), 0)
  
  console.log(`\n📈 SUMMARY:`)
  console.log(`📚 Total stories: ${allStories.length}`)
  console.log(`🔗 Total storyteller connections: ${totalConnections}`)
  console.log(`👥 Average connections per story: ${(totalConnections / connectedStories.length).toFixed(1)}`)

  if (unconnectedStories.length > 0) {
    console.log(`\n⚠️  Unconnected stories:`)
    unconnectedStories.forEach(story => {
      console.log(`  - ${story.title}`)
    })
  } else {
    console.log(`\n🎉 ALL STORIES SUCCESSFULLY CONNECTED TO STORYTELLERS!`)
  }

  return {
    totalStories: allStories.length,
    connectedStories: connectedStories.length,
    totalConnections: totalConnections,
    connectionRate: Math.round((connectedStories.length / allStories.length) * 100)
  }
}

finalVerification().catch(console.error)