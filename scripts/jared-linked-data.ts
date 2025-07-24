import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const storytellerId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'

async function showJaredLinkedData() {
  console.log('👤 JARED KEATING - LINKED DATA ACROSS TABLES')
  console.log('===========================================')
  
  // Get stories where Jared is in linked_storytellers
  const { data: storiesWithJared } = await client
    .from('stories')
    .select('*')
    .overlaps('linked_storytellers', [storytellerId])

  console.log(`📚 STORIES CONTAINING JARED (${storiesWithJared?.length}):`)
  
  for (const story of storiesWithJared || []) {
    console.log(`\n📖 STORY: "${story.title}"`)
    console.log(`  🆔 Story ID: ${story.id}`)
    console.log(`  📝 Transcript: ${story.story_transcript?.length || 0} characters`)
    
    // Show linked themes for this story
    console.log(`  🏷️ Linked themes: ${JSON.stringify(story.linked_themes)}`)
    if (story.linked_themes?.length) {
      // Get actual theme data
      const { data: themes } = await client
        .from('themes')
        .select('*')
        .in('id', story.linked_themes)
      
      themes?.forEach(theme => {
        console.log(`    - ${theme.name} (ID: ${theme.id})`)
      })
    }
    
    // Show linked quotes for this story
    console.log(`  💬 Linked quotes: ${JSON.stringify(story.linked_quotes)}`)
    if (story.linked_quotes?.length) {
      // Get actual quote data
      const { data: quotes } = await client
        .from('quotes')
        .select('*')
        .in('id', story.linked_quotes)
      
      quotes?.forEach(quote => {
        console.log(`    - "${quote.content?.substring(0, 100)}..." (ID: ${quote.id})`)
      })
    }
    
    // Show linked media for this story
    console.log(`  📸 Linked media: ${JSON.stringify(story.linked_media)}`)
    if (story.linked_media?.length) {
      // Get actual media data
      const { data: media } = await client
        .from('media')
        .select('*')
        .in('id', story.linked_media)
      
      media?.forEach(m => {
        console.log(`    - ${m.filename} (${m.media_type}) - ${m.url}`)
      })
    }
    
    // Show other storytellers
    const otherStorytellers = story.linked_storytellers?.filter(id => id !== storytellerId) || []
    console.log(`  👥 Other storytellers: ${JSON.stringify(otherStorytellers)}`)
    if (otherStorytellers.length) {
      const { data: coStorytellers } = await client
        .from('users')
        .select('id, full_name')
        .in('id', otherStorytellers)
      
      coStorytellers?.forEach(cs => {
        console.log(`    - ${cs.full_name} (ID: ${cs.id})`)
      })
    }
  }

  // Now check what themes, quotes, media have Jared in THEIR linked_storytellers
  console.log(`\n🏷️ THEMES LINKING TO JARED:`)
  const { data: allThemes } = await client.from('themes').select('*')
  const themesWithJared = allThemes?.filter(theme => 
    theme.linked_storytellers?.includes(storytellerId)
  ) || []
  
  themesWithJared.forEach(theme => {
    console.log(`  - ${theme.name} (ID: ${theme.id})`)
    console.log(`    Linked storytellers: ${JSON.stringify(theme.linked_storytellers)}`)
  })

  console.log(`\n💬 QUOTES LINKING TO JARED:`)
  const { data: allQuotes } = await client.from('quotes').select('*')
  const quotesWithJared = allQuotes?.filter(quote => 
    quote.linked_storytellers?.includes(storytellerId)
  ) || []
  
  quotesWithJared.forEach(quote => {
    console.log(`  - "${quote.content?.substring(0, 100)}..." (ID: ${quote.id})`)
    console.log(`    Linked storytellers: ${JSON.stringify(quote.linked_storytellers)}`)
  })

  console.log(`\n📸 MEDIA LINKING TO JARED:`)
  const { data: allMedia } = await client.from('media').select('*')
  const mediaWithJared = allMedia?.filter(media => 
    media.linked_storytellers?.includes(storytellerId)
  ) || []
  
  mediaWithJared.forEach(media => {
    console.log(`  - ${media.filename} (${media.media_type})`)
    console.log(`    URL: ${media.url}`)
    console.log(`    Linked storytellers: ${JSON.stringify(media.linked_storytellers)}`)
  })

  console.log(`\n📊 JARED'S COMPLETE DATA NETWORK:`)
  console.log(`  Stories: ${storiesWithJared?.length || 0}`)
  console.log(`  Themes: ${themesWithJared.length}`)
  console.log(`  Quotes: ${quotesWithJared.length}`)
  console.log(`  Media: ${mediaWithJared.length}`)
}

showJaredLinkedData().catch(console.error)