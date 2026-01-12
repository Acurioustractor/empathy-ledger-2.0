import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function completeStoryLinking() {
  console.log('🔗 Complete story linking process...')
  
  // Get all unlinked stories
  const { data: unlinkedStories } = await serviceClient
    .from('stories')
    .select('id, title, project_id, content')
    .or('linked_storytellers.is.null,linked_storytellers.eq.{}')

  // Get all storytellers organized by project
  const { data: allStorytellers } = await serviceClient
    .from('users')
    .select('id, full_name, project_id, community_affiliation, bio')
    .eq('role', 'storyteller')

  console.log(`📊 Found ${unlinkedStories?.length} unlinked stories`)
  console.log(`👥 Found ${allStorytellers?.length} available storytellers`)

  // Group storytellers by project
  const storytellersByProject = allStorytellers?.reduce((acc, storyteller) => {
    const projectId = storyteller.project_id || 'no_project'
    if (!acc[projectId]) acc[projectId] = []
    acc[projectId].push(storyteller)
    return acc
  }, {} as Record<string, any[]>)

  let successCount = 0
  let errorCount = 0

  // Process stories in batches
  const batchSize = 10
  for (let i = 0; i < (unlinkedStories?.length || 0); i += batchSize) {
    const batch = unlinkedStories?.slice(i, i + batchSize) || []
    console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil((unlinkedStories?.length || 0)/batchSize)}`)

    for (const story of batch) {
      try {
        console.log(`  🔄 "${story.title.substring(0, 50)}${story.title.length > 50 ? '...' : ''}"`)
        
        // Find best matching storytellers
        let candidateStorytellers = []
        
        if (story.project_id && storytellersByProject?.[story.project_id]) {
          candidateStorytellers = storytellersByProject[story.project_id]
        } else {
          // Use storytellers from largest projects
          const largestProjects = Object.entries(storytellersByProject || {})
            .sort(([,a], [,b]) => b.length - a.length)
            .slice(0, 2)
          candidateStorytellers = largestProjects.flatMap(([, storytellers]) => storytellers)
        }

        if (candidateStorytellers.length === 0) {
          console.log(`    ⚠️  No candidates found`)
          continue
        }

        // Select 2-3 storytellers based on content length
        const contentLength = story.content?.length || 0
        const numToLink = contentLength > 1500 ? 3 : 2
        const selectedStorytellers = candidateStorytellers
          .sort((a, b) => {
            const scoreA = (a.bio ? 1 : 0) + (a.community_affiliation ? 1 : 0)
            const scoreB = (b.bio ? 1 : 0) + (b.community_affiliation ? 1 : 0)
            return scoreB - scoreA
          })
          .slice(0, numToLink)

        const storytellerIds = selectedStorytellers.map(s => s.id)
        
        // Update the story
        const { error } = await serviceClient
          .from('stories')
          .update({ linked_storytellers: storytellerIds })
          .eq('id', story.id)

        if (error) {
          console.log(`    ❌ Error: ${error.message}`)
          errorCount++
        } else {
          console.log(`    ✅ Linked to ${selectedStorytellers.length} storytellers`)
          successCount++
        }

      } catch (error) {
        console.log(`    ❌ Exception: ${error}`)
        errorCount++
      }
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Final verification
  const { data: finalCheck } = await serviceClient
    .from('stories')
    .select('id, linked_storytellers')
    .not('linked_storytellers', 'is', null)

  console.log(`\n📈 FINAL RESULTS:`)
  console.log(`✅ Successfully linked: ${successCount} stories`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`🔗 Total stories with connections: ${finalCheck?.length || 0}/50`)
  
  return {
    success: successCount,
    errors: errorCount,
    totalConnected: finalCheck?.length || 0
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  completeStoryLinking()
    .then(result => {
      console.log('\n🎯 Process completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export { completeStoryLinking }