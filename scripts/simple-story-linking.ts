import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function linkStoriesSimple() {
  console.log('🔗 Simple story linking process...')
  
  // Get unlinked stories (limit to 5 for testing)
  const { data: stories } = await serviceClient
    .from('stories')
    .select('id, title, project_id')
    .or('linked_storytellers.is.null,linked_storytellers.eq.{}')
    .limit(5)

  // Get storytellers by project
  const { data: storytellers } = await serviceClient
    .from('users')
    .select('id, full_name, project_id')
    .eq('role', 'storyteller')

  console.log(`📊 Processing ${stories?.length} stories with ${storytellers?.length} storytellers`)

  let processed = 0
  
  for (const story of stories || []) {
    console.log(`\n🔄 Processing: "${story.title}"`)
    
    // Find storytellers from same project or use first 2 available
    const matchingStorytellers = storytellers?.filter(s => s.project_id === story.project_id) || []
    const selectedStorytellers = matchingStorytellers.length > 0 
      ? matchingStorytellers.slice(0, 2)
      : storytellers?.slice(0, 2) || []

    if (selectedStorytellers.length > 0) {
      const storytellerIds = selectedStorytellers.map(s => s.id)
      console.log(`  👥 Linking to: ${selectedStorytellers.map(s => s.full_name).join(', ')}`)
      
      const { error } = await serviceClient
        .from('stories')
        .update({ linked_storytellers: storytellerIds })
        .eq('id', story.id)

      if (error) {
        console.error(`  ❌ Error:`, error.message)
      } else {
        console.log(`  ✅ Success`)
        processed++
      }
    }
  }

  console.log(`\n📈 Successfully processed: ${processed} stories`)
  return processed
}

linkStoriesSimple().catch(console.error)