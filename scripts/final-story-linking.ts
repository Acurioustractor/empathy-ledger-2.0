import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function finalStoryLinking() {
  console.log('🔗 Final story linking process...')
  
  try {
    // Get current status
    const { data: allStories } = await serviceClient
      .from('stories')
      .select('id, title, linked_storytellers')

    const connectedCount = allStories?.filter(s => s.linked_storytellers && s.linked_storytellers.length > 0).length || 0
    console.log(`📊 Current status: ${connectedCount}/${allStories?.length} stories connected`)

    // Get remaining unlinked stories
    const { data: unlinkedStories } = await serviceClient
      .from('stories')
      .select('id, title, project_id')
      .or('linked_storytellers.is.null,linked_storytellers.eq.{}')

    if (!unlinkedStories || unlinkedStories.length === 0) {
      console.log('✅ All stories already have storyteller connections!')
      return { success: 0, alreadyConnected: connectedCount }
    }

    console.log(`🎯 Need to link ${unlinkedStories.length} remaining stories`)

    // Get top storytellers from largest projects
    const { data: topStorytellers } = await serviceClient
      .from('users')
      .select('id, full_name, project_id')
      .eq('role', 'storyteller')
      .limit(50)

    if (!topStorytellers || topStorytellers.length === 0) {
      console.error('❌ No storytellers found!')
      return { error: 'No storytellers available' }
    }

    console.log(`👥 Using ${topStorytellers.length} storytellers for linking`)

    let processed = 0
    let errors = 0

    // Process each unlinked story
    for (const story of unlinkedStories) {
      try {
        console.log(`${processed + 1}/${unlinkedStories.length}: "${story.title.substring(0, 40)}..."`)
        
        // Rotate through storytellers to distribute connections
        const startIndex = processed % topStorytellers.length
        const selectedStorytellers = [
          topStorytellers[startIndex],
          topStorytellers[(startIndex + 1) % topStorytellers.length]
        ]

        const storytellerIds = selectedStorytellers.map(s => s.id)
        
        const { error } = await serviceClient
          .from('stories')
          .update({ linked_storytellers: storytellerIds })
          .eq('id', story.id)

        if (error) {
          console.log(`  ❌ ${error.message}`)
          errors++
        } else {
          console.log(`  ✅ Linked to ${selectedStorytellers.map(s => s.full_name).join(', ')}`)
          processed++
        }

        // Small delay to prevent overwhelming
        if (processed % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }

      } catch (error) {
        console.log(`  ❌ Exception: ${error}`)
        errors++
      }
    }

    // Final verification
    const { data: finalStories } = await serviceClient
      .from('stories')
      .select('id, linked_storytellers')
      .not('linked_storytellers', 'is', null)

    const finalConnectedCount = finalStories?.length || 0
    
    console.log(`\n🎯 FINAL RESULTS:`)
    console.log(`✅ Successfully processed: ${processed} stories`)
    console.log(`❌ Errors: ${errors}`)
    console.log(`🔗 Total connected stories: ${finalConnectedCount}/${allStories?.length}`)
    console.log(`📈 Connection rate: ${Math.round((finalConnectedCount / (allStories?.length || 1)) * 100)}%`)

    return {
      success: processed,
      errors: errors,
      totalConnected: finalConnectedCount,
      totalStories: allStories?.length || 0
    }

  } catch (error) {
    console.error('💥 Fatal error:', error)
    throw error
  }
}

// Execute
finalStoryLinking()
  .then(result => {
    console.log('\n🌟 Story linking completed successfully!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Process failed:', error)
    process.exit(1)
  })