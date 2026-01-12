import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function linkJaredMetadata() {
  console.log('🔗 LINKING JARED\'S METADATA ACROSS TABLES')
  console.log('=========================================')
  
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  // Get Jared's stories to understand his content
  const { data: jaredStories } = await client
    .from('stories')
    .select('id, title')
    .overlaps('linked_storytellers', [jaredId])

  console.log(`📚 Jared's ${jaredStories?.length} stories to link metadata to:`)
  jaredStories?.forEach(story => {
    console.log(`  - "${story.title}" (${story.id})`)
  })

  // 1. LINK ORANGE SKY THEMES TO JARED
  console.log(`\n🏷️ LINKING ORANGE SKY THEMES TO JARED:`)
  
  const { data: orangeSkyThemes } = await client
    .from('themes')
    .select('*')
    .or('name.ilike.%orange sky%,name.ilike.%volunteer%,name.ilike.%laundry%,name.ilike.%retired%')

  console.log(`Found ${orangeSkyThemes?.length} relevant themes`)
  
  let themesLinked = 0
  for (const theme of orangeSkyThemes || []) {
    // Update theme to link to Jared
    const { error } = await client
      .from('themes')
      .update({
        linked_storytellers: [jaredId]
      })
      .eq('id', theme.id)

    if (!error) {
      console.log(`  ✅ Linked "${theme.name}"`)
      themesLinked++
    } else {
      console.log(`  ❌ Error linking "${theme.name}": ${error.message}`)
    }
  }

  // Update Jared's stories to link to these themes
  const themeIds = orangeSkyThemes?.map(t => t.id) || []
  console.log(`\n📖 UPDATING JARED'S STORIES WITH THEME LINKS:`)
  
  let storiesUpdated = 0
  for (const story of jaredStories || []) {
    // Link relevant themes to each story (first 5 themes per story)
    const storyThemes = themeIds.slice(0, 5)
    
    const { error } = await client
      .from('stories')
      .update({
        linked_themes: storyThemes
      })
      .eq('id', story.id)

    if (!error) {
      console.log(`  ✅ Added ${storyThemes.length} themes to "${story.title}"`)
      storiesUpdated++
    } else {
      console.log(`  ❌ Error updating "${story.title}": ${error.message}`)
    }
  }

  // 2. LINK ORANGE SKY QUOTES TO JARED
  console.log(`\n💬 LINKING ORANGE SKY QUOTES TO JARED:`)
  
  const { data: orangeSkyQuotes } = await client
    .from('quotes')
    .select('*')
    .or('quote_text.ilike.%orange sky%,quote_text.ilike.%volunteer%,quote_text.ilike.%wash%,quote_text.ilike.%laundry%')

  console.log(`Found ${orangeSkyQuotes?.length} relevant quotes`)
  
  let quotesLinked = 0
  for (const quote of orangeSkyQuotes || []) {
    // Update quote to link to Jared
    const { error } = await client
      .from('quotes')
      .update({
        linked_storytellers: [jaredId]
      })
      .eq('id', quote.id)

    if (!error) {
      console.log(`  ✅ Linked "${quote.quote_text?.substring(0, 50)}..."`)
      quotesLinked++
    } else {
      console.log(`  ❌ Error linking quote: ${error.message}`)
    }
  }

  // Update Jared's stories to link to these quotes
  const quoteIds = orangeSkyQuotes?.map(q => q.id) || []
  console.log(`\n📖 UPDATING JARED'S STORIES WITH QUOTE LINKS:`)
  
  for (const story of jaredStories || []) {
    // Link relevant quotes to each story (first 3 quotes per story)
    const storyQuotes = quoteIds.slice(0, 3)
    
    if (storyQuotes.length > 0) {
      const { error } = await client
        .from('stories')
        .update({
          linked_quotes: storyQuotes
        })
        .eq('id', story.id)

      if (!error) {
        console.log(`  ✅ Added ${storyQuotes.length} quotes to "${story.title}"`)
      } else {
        console.log(`  ❌ Error updating "${story.title}": ${error.message}`)
      }
    }
  }

  // 3. LINK MEDIA TO JARED
  console.log(`\n📸 LINKING MEDIA TO JARED:`)
  
  // Look for media that might be related to Orange Sky
  const { data: relevantMedia } = await client
    .from('media')
    .select('*')
    .or('title.ilike.%orange sky%,transcript.ilike.%orange sky%,transcript.ilike.%volunteer%')

  console.log(`Found ${relevantMedia?.length} relevant media items`)
  
  let mediaLinked = 0
  for (const media of relevantMedia || []) {
    // Update media to link to Jared
    const { error } = await client
      .from('media')
      .update({
        linked_storytellers: [jaredId]
      })
      .eq('id', media.id)

    if (!error) {
      console.log(`  ✅ Linked "${media.title}"`)
      mediaLinked++
    } else {
      console.log(`  ❌ Error linking "${media.title}": ${error.message}`)
    }
  }

  // Update Jared's stories to link to media
  const mediaIds = relevantMedia?.map(m => m.id) || []
  if (mediaIds.length > 0) {
    console.log(`\n📖 UPDATING JARED'S STORIES WITH MEDIA LINKS:`)
    
    for (const story of jaredStories || []) {
      // Link media to each story (first 2 media items per story)
      const storyMedia = mediaIds.slice(0, 2)
      
      const { error } = await client
        .from('stories')
        .update({
          linked_media: storyMedia
        })
        .eq('id', story.id)

      if (!error) {
        console.log(`  ✅ Added ${storyMedia.length} media items to "${story.title}"`)
      } else {
        console.log(`  ❌ Error updating "${story.title}": ${error.message}`)
      }
    }
  }

  console.log(`\n📊 LINKING SUMMARY:`)
  console.log(`  ✅ Themes linked: ${themesLinked}`)
  console.log(`  ✅ Quotes linked: ${quotesLinked}`)  
  console.log(`  ✅ Media linked: ${mediaLinked}`)
  console.log(`  ✅ Stories updated: ${storiesUpdated}`)

  return {
    themes: themesLinked,
    quotes: quotesLinked,
    media: mediaLinked,
    stories: storiesUpdated
  }
}

linkJaredMetadata().catch(console.error)