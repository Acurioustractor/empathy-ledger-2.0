import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function debugStoryConnections() {
  console.log('🔍 Debugging story-storyteller connections...')
  
  const storytellerId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  const storyTitle = 'Freddy on Orange Sky'
  
  // Check the specific story
  const { data: story } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .eq('title', storyTitle)
    .single()

  console.log(`\n📚 STORY: "${story?.title}"`)
  console.log(`🆔 Story ID: ${story?.id}`)
  console.log(`👥 Linked storytellers array:`, story?.linked_storytellers)
  console.log(`📊 Array length: ${story?.linked_storytellers?.length || 0}`)

  if (story?.linked_storytellers) {
    console.log(`\n🔍 Individual storyteller IDs:`)
    story.linked_storytellers.forEach((id, index) => {
      console.log(`  ${index + 1}. ${id}`)
      console.log(`     Matches target: ${id === storytellerId}`)
    })
  }

  // Try different query approaches
  console.log(`\n🔍 Testing different query methods:`)
  
  // Method 1: Contains with array
  const { data: method1 } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .contains('linked_storytellers', [storytellerId])

  console.log(`Method 1 (contains array): ${method1?.length || 0} results`)

  // Method 2: Contains with single value  
  const { data: method2 } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .contains('linked_storytellers', storytellerId)

  console.log(`Method 2 (contains single): ${method2?.length || 0} results`)

  // Method 3: Using overlaps
  const { data: method3 } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .overlaps('linked_storytellers', [storytellerId])

  console.log(`Method 3 (overlaps): ${method3?.length || 0} results`)

  // Method 4: Manual filter
  const { data: allStories } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .not('linked_storytellers', 'is', null)

  const manualFilter = allStories?.filter(s => 
    s.linked_storytellers?.includes(storytellerId)
  ) || []

  console.log(`Method 4 (manual filter): ${manualFilter.length} results`)

  if (manualFilter.length > 0) {
    console.log(`\n✅ FOUND CONNECTIONS via manual filter:`)
    manualFilter.forEach((s, index) => {
      console.log(`  ${index + 1}. "${s.title}"`)
      console.log(`     Storytellers: ${s.linked_storytellers?.length}`)
    })
  }

  // Show the storyteller again with correct connections
  console.log(`\n👤 STORYTELLER SUMMARY:`)
  console.log(`  Name: Jared Keating`)
  console.log(`  ID: ${storytellerId}`)
  console.log(`  Stories connected: ${manualFilter.length}`)
  
  return {
    storytellerId,
    storiesFound: manualFilter.length,
    connections: manualFilter
  }
}

debugStoryConnections().catch(console.error)