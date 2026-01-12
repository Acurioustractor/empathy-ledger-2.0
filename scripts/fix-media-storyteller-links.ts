import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function fixMediaStorytellerLinks() {
  console.log('🔗 FIXING MEDIA-STORYTELLER CONNECTIONS')
  console.log('======================================')
  
  // First, check if media records have storyteller_id field populated
  const { data: mediaWithStorytellerIds } = await client
    .from('media')
    .select('id, title, storyteller_id, transcript, linked_storytellers')
    .not('storyteller_id', 'is', null)
    .limit(10)

  console.log(`📊 Media records with storyteller_id: ${mediaWithStorytellerIds?.length || 0}`)
  
  if (mediaWithStorytellerIds && mediaWithStorytellerIds.length > 0) {
    console.log(`📄 Sample media with storyteller_id:`)
    mediaWithStorytellerIds.slice(0, 5).forEach((media, index) => {
      console.log(`\n  ${index + 1}. ${media.title}`)
      console.log(`     Media ID: ${media.id}`)
      console.log(`     Storyteller ID: ${media.storyteller_id}`)
      console.log(`     Transcript: ${media.transcript ? media.transcript.length + ' chars' : 'None'}`)
      console.log(`     Linked Storytellers Array: ${media.linked_storytellers?.length || 0}`)
    })
  }

  // Check if we need to populate linked_storytellers from storyteller_id
  const { data: mediaToFix } = await client
    .from('media')
    .select('id, title, storyteller_id, linked_storytellers, transcript')
    .not('storyteller_id', 'is', null)
    .or('linked_storytellers.is.null,linked_storytellers.eq.{}')

  console.log(`\n🔧 Media records needing linked_storytellers fix: ${mediaToFix?.length || 0}`)

  if (mediaToFix && mediaToFix.length > 0) {
    console.log(`\n⚡ Fixing linked_storytellers arrays...`)
    
    let fixedCount = 0
    let errorCount = 0
    
    for (const media of mediaToFix) {
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
        console.log(`  ✅ Fixed ${media.title} -> storyteller ${media.storyteller_id.substring(0, 8)}...`)
        fixedCount++
      }
    }

    console.log(`\n📈 FIXING RESULTS:`)
    console.log(`  ✅ Successfully fixed: ${fixedCount}`)
    console.log(`  ❌ Errors: ${errorCount}`)
  }

  // Now verify Jared's media connections
  console.log(`\n👤 JARED KEATING MEDIA VERIFICATION:`)
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  const { data: jaredMediaDirect } = await client
    .from('media')
    .select('*')
    .eq('storyteller_id', jaredId)

  console.log(`📹 Jared's media (by storyteller_id): ${jaredMediaDirect?.length || 0}`)

  const { data: jaredMediaLinked } = await client
    .from('media')
    .select('*')
    .overlaps('linked_storytellers', [jaredId])

  console.log(`📹 Jared's media (by linked_storytellers): ${jaredMediaLinked?.length || 0}`)

  if (jaredMediaDirect && jaredMediaDirect.length > 0) {
    jaredMediaDirect.forEach((media, index) => {
      console.log(`\n  ${index + 1}. ${media.title}`)
      console.log(`     ID: ${media.id}`)
      console.log(`     Transcript: ${media.transcript ? media.transcript.length + ' chars' : 'None'}`)
      console.log(`     Direct storyteller_id: ${media.storyteller_id}`)
      console.log(`     Linked storytellers: ${media.linked_storytellers?.length || 0}`)
    })
  }

  // Check total storyteller coverage
  console.log(`\n📊 FINAL MEDIA COVERAGE CHECK:`)
  
  const { data: allStorytellers } = await client
    .from('users')
    .select('id, full_name')
    .eq('role', 'storyteller')

  let storytellersWithMedia = 0
  let storytellersWithTranscripts = 0
  
  console.log(`Checking first 20 storytellers...`)
  
  for (const storyteller of allStorytellers?.slice(0, 20) || []) {
    const { data: mediaRecords } = await client
      .from('media')
      .select('id, title, transcript')
      .overlaps('linked_storytellers', [storyteller.id])

    const hasMedia = (mediaRecords?.length || 0) > 0
    const hasTranscript = mediaRecords?.some(m => m.transcript && m.transcript.length > 0) || false
    
    if (hasMedia) storytellersWithMedia++
    if (hasTranscript) storytellersWithTranscripts++
    
    if (hasMedia) {
      console.log(`  ✅ ${storyteller.full_name}: ${mediaRecords?.length} media, transcript: ${hasTranscript ? 'Yes' : 'No'}`)
    }
  }

  console.log(`\n📊 COVERAGE SUMMARY (first 20):`)
  console.log(`  👥 Storytellers checked: 20`)
  console.log(`  ✅ With media: ${storytellersWithMedia}`)
  console.log(`  📝 With transcripts: ${storytellersWithTranscripts}`)
  console.log(`  📊 Media coverage: ${((storytellersWithMedia / 20) * 100).toFixed(1)}%`)
  console.log(`  📝 Transcript coverage: ${((storytellersWithTranscripts / 20) * 100).toFixed(1)}%`)

  return {
    mediaRecordsFixed: mediaToFix?.length || 0,
    jaredMediaCount: jaredMediaDirect?.length || 0,
    storytellersWithMedia,
    storytellersWithTranscripts
  }
}

fixMediaStorytellerLinks().catch(console.error)