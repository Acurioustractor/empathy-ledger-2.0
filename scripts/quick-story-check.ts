import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function quickCheck() {
  console.log('🔍 Quick story connection check...')
  
  // Check current story connection status
  const { data: stories, error } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .limit(10)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📊 Sample of ${stories?.length} stories:`)
  stories?.forEach(story => {
    const hasConnections = story.linked_storytellers && story.linked_storytellers.length > 0
    console.log(`  ${hasConnections ? '✅' : '❌'} ${story.title} - ${hasConnections ? story.linked_storytellers.length + ' connections' : 'no connections'}`)
  })

  // Count totals
  const { data: allStories } = await serviceClient
    .from('stories')
    .select('id, linked_storytellers')

  const connected = allStories?.filter(s => s.linked_storytellers && s.linked_storytellers.length > 0).length || 0
  const total = allStories?.length || 0

  console.log(`\n📈 SUMMARY: ${connected}/${total} stories have storyteller connections`)
}

quickCheck().catch(console.error)