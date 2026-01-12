import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function fixMediaLinksCorrectly() {
  console.log('🔗 FIXING MEDIA LINKED_STORYTELLERS FROM STORYTELLER_ID')
  console.log('===================================================')
  
  // Get all media records that have storyteller_id
  const { data: allMediaWithStorytellers } = await client
    .from('media')
    .select('id, title, storyteller_id, transcript, linked_storytellers')

  console.log(`📊 Total media records: ${allMediaWithStorytellers?.length || 0}`)

  // Filter to those with storyteller_id but missing linked_storytellers
  const needsLinking = allMediaWithStorytellers?.filter(media => 
    media.storyteller_id && 
    (!media.linked_storytellers || media.linked_storytellers.length === 0)
  ) || []

  console.log(`🔧 Media records needing linked_storytellers population: ${needsLinking.length}`)

  if (needsLinking.length === 0) {
    console.log('✅ All media records already have linked_storytellers populated')
    
    // Still check Jared's connections
    const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
    const { data: jaredMedia } = await client
      .from('media')
      .select('*')
      .overlaps('linked_storytellers', [jaredId])

    console.log(`👤 Jared's current media connections: ${jaredMedia?.length || 0}`)
    return { fixed: 0, jaredMedia: jaredMedia?.length || 0 }
  }

  console.log(`\n⚡ Populating linked_storytellers arrays...`)
  
  let fixedCount = 0
  let errorCount = 0
  let transcriptCount = 0
  
  for (const media of needsLinking.slice(0, 20)) { // Process first 20 for testing
    // Update linked_storytellers to include the storyteller_id
    const { error } = await client
      .from('media')
      .update({ 
        linked_storytellers: [media.storyteller_id]
      })
      .eq('id', media.id)

    if (error) {
      console.log(`  ❌ Error fixing ${media.title}: ${error.message}`)
      errorCount++
    } else {
      const hasTranscript = media.transcript && media.transcript.length > 10 // More than just "Collection..."
      if (hasTranscript) transcriptCount++
      
      console.log(`  ✅ ${media.title} -> ${media.storyteller_id.substring(0, 8)}... ${hasTranscript ? '📝' : '❌'}`)
      fixedCount++
    }
  }

  console.log(`\n📈 POPULATION RESULTS (first 20):`)
  console.log(`  ✅ Successfully populated: ${fixedCount}`)
  console.log(`  ❌ Errors: ${errorCount}`)
  console.log(`  📝 Records with transcripts: ${transcriptCount}`)

  // Now process all the rest
  if (needsLinking.length > 20) {
    console.log(`\n⚡ Processing remaining ${needsLinking.length - 20} records...`)
    
    for (const media of needsLinking.slice(20)) {
      const { error } = await client
        .from('media')
        .update({ 
          linked_storytellers: [media.storyteller_id]
        })
        .eq('id', media.id)

      if (!error) {
        fixedCount++
        if (media.transcript && media.transcript.length > 10) {
          transcriptCount++
        }
      } else {
        errorCount++
      }
    }
    
    console.log(`  ✅ Total fixed: ${fixedCount}`)
    console.log(`  📝 Total with transcripts: ${transcriptCount}`)
  }

  // Verify Jared's connections now
  console.log(`\n👤 JARED KEATING VERIFICATION:`)
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  const { data: jaredMedia } = await client
    .from('media')
    .select('*')
    .overlaps('linked_storytellers', [jaredId])

  console.log(`📹 Jared's linked media: ${jaredMedia?.length || 0}`)
  
  jaredMedia?.forEach((media, index) => {
    console.log(`\n  ${index + 1}. "${media.title}"`)
    console.log(`     ID: ${media.id}`)
    console.log(`     Transcript: ${media.transcript ? media.transcript.length + ' chars' : 'None'}`)
    console.log(`     Has real content: ${media.transcript && media.transcript.length > 50 ? 'Yes' : 'No'}`)
    
    if (media.transcript && media.transcript.length > 50) {
      console.log(`     Preview: "${media.transcript.substring(0, 150)}..."`)
    }
  })

  // Check overall storyteller coverage
  console.log(`\n📊 OVERALL STORYTELLER COVERAGE:`)
  
  const { data: sampleStorytellers } = await client
    .from('users')
    .select('id, full_name')
    .eq('role', 'storyteller')
    .limit(25)

  let storytellersWithMedia = 0
  let storytellersWithTranscripts = 0
  
  for (const storyteller of sampleStorytellers || []) {
    const { data: mediaRecords } = await client
      .from('media')
      .select('id, title, transcript')
      .overlaps('linked_storytellers', [storyteller.id])

    const hasMedia = (mediaRecords?.length || 0) > 0
    const hasRealTranscript = mediaRecords?.some(m => 
      m.transcript && m.transcript.length > 50 // More than just "Collection of stories..."
    ) || false
    
    if (hasMedia) storytellersWithMedia++
    if (hasRealTranscript) storytellersWithTranscripts++
    
    if (hasMedia) {
      console.log(`  ✅ ${storyteller.full_name}: ${mediaRecords?.length} media, transcript: ${hasRealTranscript ? 'Real' : 'Placeholder'}`)
    }
  }

  console.log(`\n📊 FINAL SUMMARY (25 storytellers checked):`)
  console.log(`  ✅ With media connections: ${storytellersWithMedia}/25 (${((storytellersWithMedia / 25) * 100).toFixed(1)}%)`)
  console.log(`  📝 With real transcripts: ${storytellersWithTranscripts}/25 (${((storytellersWithTranscripts / 25) * 100).toFixed(1)}%)`)
  
  const successRate = storytellersWithMedia / 25
  if (successRate >= 0.8) {
    console.log(`🎉 SUCCESS: High media connection rate achieved!`)
  } else {
    console.log(`⚠️  Some work still needed for complete coverage`)
  }

  return {
    totalFixed: fixedCount,
    transcriptCount,
    jaredMediaCount: jaredMedia?.length || 0,
    storytellersWithMedia,
    storytellersWithTranscripts
  }
}

fixMediaLinksCorrectly().catch(console.error)