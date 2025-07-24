import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

interface Story {
  id: string
  title: string
  content: string
  project_id: string | null
  linked_storytellers: string[] | null
  projects?: {
    name: string
    project_type: string
  }
}

interface Storyteller {
  id: string
  full_name: string
  email: string
  community_affiliation: string | null
  project_id: string | null
  bio: string | null
}

async function linkAllStoriesToStorytellers() {
  console.log('🔗 Starting comprehensive story-storyteller linking process...')
  
  // Get all stories that don't have storyteller connections
  const { data: unlinkedStories, error: storiesError } = await serviceClient
    .from('stories')
    .select(`
      id, title, content, project_id, linked_storytellers,
      projects(name, project_type)
    `)
    .or('linked_storytellers.is.null,linked_storytellers.eq.{}')

  if (storiesError) {
    console.error('❌ Error fetching unlinked stories:', storiesError)
    return
  }

  // Get all storytellers organized by project
  const { data: allStorytellers, error: storytellersError } = await serviceClient
    .from('users')
    .select('id, full_name, email, community_affiliation, project_id, bio')
    .eq('role', 'storyteller')

  if (storytellersError) {
    console.error('❌ Error fetching storytellers:', storytellersError)
    return
  }

  console.log(`📊 Found ${unlinkedStories?.length || 0} unlinked stories`)
  console.log(`👥 Found ${allStorytellers?.length || 0} available storytellers`)

  // Group storytellers by project for intelligent matching
  const storytellersByProject = allStorytellers?.reduce((acc, storyteller) => {
    const projectId = storyteller.project_id || 'no_project'
    if (!acc[projectId]) acc[projectId] = []
    acc[projectId].push(storyteller)
    return acc
  }, {} as Record<string, Storyteller[]>)

  let linkedCount = 0
  let errors: string[] = []

  // Process each unlinked story
  for (const story of unlinkedStories || []) {
    try {
      console.log(`\n🔄 Processing: "${story.title}"`)
      
      // Try to match storytellers from same project first
      let candidateStorytellers: Storyteller[] = []
      
      if (story.project_id && storytellersByProject?.[story.project_id]) {
        candidateStorytellers = storytellersByProject[story.project_id]
        console.log(`  📌 Found ${candidateStorytellers.length} storytellers in same project`)
      } else {
        // If no project match, use storytellers from largest projects
        const projectSizes = Object.entries(storytellersByProject || {})
          .sort(([,a], [,b]) => b.length - a.length)
        
        candidateStorytellers = projectSizes.slice(0, 3)
          .flatMap(([, storytellers]) => storytellers)
          .slice(0, 10)
        console.log(`  🌐 Using storytellers from largest projects`)
      }

      if (candidateStorytellers.length === 0) {
        console.log(`  ⚠️  No candidate storytellers found`)
        continue
      }

      // Smart selection: prefer storytellers with bios and community affiliations
      const rankedStorytellers = candidateStorytellers
        .sort((a, b) => {
          const scoreA = (a.bio ? 2 : 0) + (a.community_affiliation ? 1 : 0)
          const scoreB = (b.bio ? 2 : 0) + (b.community_affiliation ? 1 : 0)
          return scoreB - scoreA
        })

      // Link to top 2-4 storytellers based on story content length
      const contentLength = story.content?.length || 0
      const numToLink = contentLength > 2000 ? 4 : contentLength > 1000 ? 3 : 2
      const storytellersToLink = rankedStorytellers.slice(0, numToLink)
      
      console.log(`  👥 Linking to ${storytellersToLink.length} storytellers:`)
      storytellersToLink.forEach(s => 
        console.log(`    - ${s.full_name} (${s.community_affiliation || 'No community'})`)
      )

      // Update story with storyteller connections
      const storytellerIds = storytellersToLink.map(s => s.id)
      const { error: updateError } = await serviceClient
        .from('stories')
        .update({
          linked_storytellers: storytellerIds
        })
        .eq('id', story.id)

      if (updateError) {
        console.error(`  ❌ Error linking story "${story.title}":`, updateError)
        errors.push(`${story.title}: ${updateError.message}`)
      } else {
        console.log(`  ✅ Successfully linked story to ${storytellerIds.length} storytellers`)
        linkedCount++
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error(`  ❌ Unexpected error processing "${story.title}":`, error)
      errors.push(`${story.title}: ${error}`)
    }
  }

  // Final summary
  console.log(`\n📈 LINKING SUMMARY:`)
  console.log(`✅ Successfully linked: ${linkedCount} stories`)
  console.log(`❌ Errors: ${errors.length}`)
  
  if (errors.length > 0) {
    console.log(`\n🚨 Error details:`)
    errors.forEach(error => console.log(`  - ${error}`))
  }

  // Verify final state
  const { data: verificationData } = await serviceClient
    .from('stories')
    .select('id, title, linked_storytellers')
    .not('linked_storytellers', 'is', null)

  console.log(`\n🔍 VERIFICATION:`)
  console.log(`📊 Total stories with storyteller connections: ${verificationData?.length || 0}`)
  
  return {
    totalProcessed: unlinkedStories?.length || 0,
    successfullyLinked: linkedCount,
    errors: errors.length,
    finalConnectedCount: verificationData?.length || 0
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  linkAllStoriesToStorytellers()
    .then(result => {
      console.log('\n🎯 Process completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export { linkAllStoriesToStorytellers }