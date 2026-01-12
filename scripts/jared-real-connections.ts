import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const storytellerId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'

async function showJaredRealConnections() {
  console.log('👤 JARED KEATING - REAL DATA CONNECTIONS ACROSS TABLES')
  console.log('====================================================')
  
  // Get Jared's basic info
  const { data: jared } = await client
    .from('users')
    .select('*')
    .eq('id', storytellerId)
    .single()

  console.log(`🆔 Jared ID: ${jared.id}`)
  console.log(`👤 Name: ${jared.full_name}`)
  console.log(`📧 Email: ${jared.email}`)

  // Find stories WHERE JARED IS THE STORYTELLER (not linked_storytellers)
  const { data: jaredStories } = await client
    .from('stories')
    .select('*')
    .eq('storyteller_id', storytellerId)

  console.log(`\n📚 JARED'S OWN STORIES (storyteller_id = jared):`)
  if (jaredStories?.length) {
    jaredStories.forEach(story => {
      console.log(`  - "${story.title}" (ID: ${story.id})`)
    })
  } else {
    console.log(`  ❌ No stories with storyteller_id = ${storytellerId}`)
  }

  // Check if stories table has different structure - maybe user_id?
  const { data: storiesByUserId } = await client
    .from('stories')
    .select('*')
    .eq('user_id', storytellerId)

  console.log(`\n📚 STORIES BY user_id:`)
  if (storiesByUserId?.length) {
    storiesByUserId.forEach(story => {
      console.log(`  - "${story.title}" (ID: ${story.id})`)
    })
  } else {
    console.log(`  ❌ No stories with user_id = ${storytellerId}`)
  }

  // Find themes connected to Jared
  const { data: jaredThemes } = await client
    .from('themes')
    .select('*')
    .eq('storyteller_id', storytellerId)

  console.log(`\n🏷️ JARED'S THEMES:`)
  if (jaredThemes?.length) {
    jaredThemes.forEach(theme => {
      console.log(`  - ${theme.name} (ID: ${theme.id})`)
    })
  } else {
    console.log(`  ❌ No themes with storyteller_id = ${storytellerId}`)
  }

  // Find quotes connected to Jared
  const { data: jaredQuotes } = await client
    .from('quotes')
    .select('*')
    .eq('storyteller_id', storytellerId)

  console.log(`\n💬 JARED'S QUOTES:`)
  if (jaredQuotes?.length) {
    jaredQuotes.forEach(quote => {
      console.log(`  - "${quote.content?.substring(0, 100)}..." (ID: ${quote.id})`)
    })
  } else {
    console.log(`  ❌ No quotes with storyteller_id = ${storytellerId}`)
  }

  // Check for transcripts
  const { data: jaredTranscripts } = await client
    .from('transcripts')
    .select('*')
    .eq('storyteller_id', storytellerId)

  console.log(`\n📝 JARED'S TRANSCRIPTS:`)
  if (jaredTranscripts?.length) {
    jaredTranscripts.forEach(transcript => {
      console.log(`  - Transcript ID: ${transcript.id}`)
      console.log(`    Content: ${transcript.content?.substring(0, 100)}...`)
    })
  } else {
    console.log(`  ❌ No transcripts with storyteller_id = ${storytellerId}`)
  }

  // Check locations - maybe he's linked to a location
  if (jared.primary_location_id) {
    const { data: location } = await client
      .from('locations')
      .select('*')
      .eq('id', jared.primary_location_id)
      .single()

    console.log(`\n📍 JARED'S LOCATION:`)
    console.log(`  - ${location?.name}, ${location?.state}, ${location?.country}`)
    console.log(`  - Coordinates: ${location?.latitude}, ${location?.longitude}`)
  } else {
    console.log(`\n📍 JARED'S LOCATION: ❌ No primary_location_id`)
  }

  // Check media connected to Jared
  const { data: jaredMedia } = await client
    .from('media')
    .select('*')
    .eq('storyteller_id', storytellerId)

  console.log(`\n📸 JARED'S MEDIA:`)
  if (jaredMedia?.length) {
    jaredMedia.forEach(media => {
      console.log(`  - ${media.filename} (${media.media_type})`)
      console.log(`    URL: ${media.url}`)
    })
  } else {
    console.log(`  ❌ No media with storyteller_id = ${storytellerId}`)
  }

  // Show table structure to understand connections
  console.log(`\n🔍 CHECKING TABLE STRUCTURES:`)
  
  // Check what columns exist in stories table
  const { data: sampleStory } = await client
    .from('stories')
    .select('*')
    .limit(1)
    .single()

  console.log(`📚 Stories table columns:`)
  if (sampleStory) {
    Object.keys(sampleStory).forEach(key => {
      console.log(`  - ${key}: ${typeof sampleStory[key]}`)
    })
  }
}

showJaredRealConnections().catch(console.error)