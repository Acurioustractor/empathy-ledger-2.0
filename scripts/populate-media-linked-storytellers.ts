import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function populateMediaLinkedStorytellers() {
  console.log('🔗 POPULATING MEDIA LINKED_STORYTELLERS ARRAYS')
  console.log('===============================================')
  
  // Get all media records with storyteller_id but missing linked_storytellers
  const { data: mediaToFix } = await client
    .from('media')
    .select('id, title, storyteller_id, transcript, linked_storytellers')
    .not('storyteller_id', 'is', null)

  console.log(`📊 Total media records with storyteller_id: ${mediaToFix?.length || 0}`)

  if (!mediaToFix || mediaToFix.length === 0) {
    console.log('❌ No media records found with storyteller_id')
    return
  }

  // Filter to only those that need fixing
  const needsFix = mediaToFix.filter(media => 
    !media.linked_storytellers || media.linked_storytellers.length === 0
  )

  console.log(`🔧 Media records needing linked_storytellers fix: ${needsFix.length}`)

  if (needsFix.length === 0) {
    console.log('✅ All media records already have linked_storytellers populated')
    return mediaToFix.length
  }

  console.log(`\n⚡ Populating linked_storytellers arrays...`)
  
  let fixedCount = 0
  let errorCount = 0
  let transcriptCount = 0
  
  for (const media of needsFix) {
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
      const hasTranscript = media.transcript && media.transcript.length > 0
      if (hasTranscript) transcriptCount++
      
      console.log(`  ✅ ${media.title} -> ${media.storyteller_id.substring(0, 8)}... ${hasTranscript ? '📝' : '❌'}`)
      fixedCount++
    }
  }

  console.log(`\n📈 POPULATION RESULTS:`)
  console.log(`  ✅ Successfully populated: ${fixedCount}`)
  console.log(`  ❌ Errors: ${errorCount}`)
  console.log(`  📝 Records with transcripts: ${transcriptCount}`)

  // Verify the fix by checking Jared's connections
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
    console.log(`     Storyteller ID: ${media.storyteller_id}`)
    console.log(`     Linked storytellers: ${media.linked_storytellers?.length || 0}`)
    
    if (media.transcript) {
      console.log(`     Sample: "${media.transcript.substring(0, 100)}..."`)
    }
  })

  // Check coverage across storytellers
  console.log(`\n📊 STORYTELLER MEDIA COVERAGE CHECK:`)
  
  const { data: allStorytellers } = await client
    .from('users')
    .select('id, full_name')
    .eq('role', 'storyteller')

  let storytellersWithMedia = 0
  let storytellersWithTranscripts = 0
  
  console.log(`Checking first 30 storytellers...`)
  
  for (const storyteller of allStorytellers?.slice(0, 30) || []) {
    const { data: mediaRecords } = await client
      .from('media')
      .select('id, title, transcript')
      .overlaps('linked_storytellers', [storyteller.id])

    const hasMedia = (mediaRecords?.length || 0) > 0
    const hasTranscript = mediaRecords?.some(m => m.transcript && m.transcript.length > 0) || false
    
    if (hasMedia) storytellersWithMedia++
    if (hasTranscript) storytellersWithTranscripts++
    
    const status = hasMedia ? (hasTranscript ? '✅📝' : '✅❌') : '❌❌'
    console.log(`  ${status} ${storyteller.full_name}: ${mediaRecords?.length || 0} media`)
  }

  console.log(`\n📊 FINAL COVERAGE SUMMARY (first 30):`)
  console.log(`  👥 Storytellers checked: 30`)
  console.log(`  ✅ With media: ${storytellersWithMedia}/${30} (${((storytellersWithMedia / 30) * 100).toFixed(1)}%)`)
  console.log(`  📝 With transcripts: ${storytellersWithTranscripts}/${30} (${((storytellersWithTranscripts / 30) * 100).toFixed(1)}%)`)
  
  if (storytellersWithTranscripts === 30) {
    console.log(`🎉 SUCCESS: All storytellers have transcript access!`)
  } else if (storytellersWithMedia === 30) {
    console.log(`⚠️  All storytellers have media, but some transcripts missing`)
  } else {
    console.log(`⚠️  Some storytellers still missing media connections`)
  }

  return {
    totalMediaFixed: fixedCount,
    mediaWithTranscripts: transcriptCount,
    storytellersWithMedia,
    storytellersWithTranscripts,
    jaredMediaCount: jaredMedia?.length || 0
  }
}

populateMediaLinkedStorytellers().catch(console.error)