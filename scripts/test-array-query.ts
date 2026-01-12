import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testArrayQuery() {
  const storytellerId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  console.log('🔍 Testing array queries for Jared Keating...')
  console.log(`Target ID: ${storytellerId}`)
  
  // Get ALL stories first to see the data structure
  const { data: allStories } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .limit(10)

  console.log(`\n📚 Sample stories with linked_storytellers:`)
  allStories?.forEach((story, index) => {
    console.log(`${index + 1}. "${story.title}"`)
    console.log(`   Array: ${JSON.stringify(story.linked_storytellers)}`)
    console.log(`   Type: ${typeof story.linked_storytellers}`)
    console.log(`   Length: ${story.linked_storytellers?.length || 'null'}`)
    if (story.linked_storytellers) {
      const hasJared = story.linked_storytellers.includes(storytellerId)
      console.log(`   Contains Jared: ${hasJared}`)
    }
    console.log('')
  })

  // Test the overlaps operator specifically
  console.log(`🔍 Testing overlaps operator:`)
  const { data: overlapsResult, error: overlapsError } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .overlaps('linked_storytellers', [storytellerId])

  console.log(`Overlaps result: ${overlapsResult?.length || 0} stories`)
  console.log(`Overlaps error:`, overlapsError)

  if (overlapsResult?.length) {
    console.log(`\n✅ Stories found with overlaps:`)
    overlapsResult.forEach((story, index) => {
      console.log(`  ${index + 1}. "${story.title}"`)
      console.log(`     IDs: ${JSON.stringify(story.linked_storytellers)}`)
    })
  }

  return overlapsResult
}

testArrayQuery().catch(console.error)