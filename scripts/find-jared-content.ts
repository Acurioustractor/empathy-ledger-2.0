import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function findJaredContent() {
  console.log('🔍 FINDING JARED\'S CONTENT IN DATABASE')
  console.log('====================================')
  
  // Get Jared's story content to understand what to look for
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  const { data: jaredStories } = await client
    .from('stories')
    .select('*')
    .overlaps('linked_storytellers', [jaredId])

  console.log(`📚 JARED'S STORY CONTENT TO MATCH AGAINST:`)
  jaredStories?.slice(0, 2).forEach(story => {
    console.log(`\n"${story.title}":`)
    console.log(`${story.story_transcript?.substring(0, 200)}...`)
  })

  // Look for themes that might relate to Orange Sky or Jared's content
  console.log(`\n🏷️ SEARCHING THEMES FOR ORANGE SKY / VOLUNTEERING CONTENT:`)
  const { data: relevantThemes } = await client
    .from('themes')
    .select('*')
    .or('name.ilike.%orange%,name.ilike.%volunteer%,name.ilike.%wash%,name.ilike.%laundry%,name.ilike.%retired%')

  relevantThemes?.forEach(theme => {
    console.log(`  - ${theme.name} (ID: ${theme.id})`)
  })

  // Look for quotes that might contain Orange Sky related content
  console.log(`\n💬 SEARCHING QUOTES FOR ORANGE SKY CONTENT:`)
  const { data: relevantQuotes } = await client
    .from('quotes')
    .select('*')
    .or('content.ilike.%orange sky%,content.ilike.%volunteer%,content.ilike.%wash%,content.ilike.%laundry%,content.ilike.%retired%')

  relevantQuotes?.forEach(quote => {
    console.log(`  - "${quote.content?.substring(0, 100)}..." (ID: ${quote.id})`)
  })

  // Check if there are source/origin fields that might help link
  console.log(`\n🔍 CHECKING TABLE STRUCTURES FOR LINKING FIELDS:`)
  
  const { data: sampleTheme } = await client.from('themes').select('*').limit(1).single()
  console.log(`\nThemes table fields:`)
  if (sampleTheme) {
    Object.keys(sampleTheme).forEach(key => {
      console.log(`  - ${key}: ${sampleTheme[key]}`)
    })
  }

  const { data: sampleQuote } = await client.from('quotes').select('*').limit(1).single()
  console.log(`\nQuotes table fields:`)
  if (sampleQuote) {
    Object.keys(sampleQuote).forEach(key => {
      console.log(`  - ${key}: ${sampleQuote[key]}`)
    })
  }

  const { data: sampleMedia } = await client.from('media').select('*').limit(1).single()
  console.log(`\nMedia table fields:`)
  if (sampleMedia) {
    Object.keys(sampleMedia).forEach(key => {
      console.log(`  - ${key}: ${sampleMedia[key]}`)
    })
  }

  // Look for any fields that might contain story IDs or names
  console.log(`\n🎯 LOOKING FOR STORY CONNECTIONS:`)
  
  // Check if themes have story_id or story references
  const { data: themesWithStoryRef } = await client
    .from('themes')
    .select('*')
    .not('story_id', 'is', null)
    .limit(5)

  console.log(`Themes with story_id: ${themesWithStoryRef?.length || 0}`)
  themesWithStoryRef?.forEach(theme => {
    console.log(`  - ${theme.name} -> story_id: ${theme.story_id}`)
  })

  // Check if quotes have story_id references
  const { data: quotesWithStoryRef } = await client
    .from('quotes')
    .select('*')
    .not('story_id', 'is', null)
    .limit(5)

  console.log(`Quotes with story_id: ${quotesWithStoryRef?.length || 0}`)
  quotesWithStoryRef?.forEach(quote => {
    console.log(`  - "${quote.content?.substring(0, 50)}..." -> story_id: ${quote.story_id}`)
  })

  return {
    relevantThemes: relevantThemes?.length || 0,
    relevantQuotes: relevantQuotes?.length || 0,
    themesWithStoryId: themesWithStoryRef?.length || 0,
    quotesWithStoryId: quotesWithStoryRef?.length || 0
  }
}

findJaredContent().catch(console.error)