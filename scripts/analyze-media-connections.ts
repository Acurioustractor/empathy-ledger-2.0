import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function analyzeMediaConnections() {
  console.log('📹 ANALYZING MEDIA TABLE CONNECTIONS TO STORYTELLERS')
  console.log('==================================================')
  
  // Check media table structure
  const { data: sampleMedia } = await client
    .from('media')
    .select('*')
    .limit(3)

  console.log(`📊 Found ${sampleMedia?.length || 0} sample media records`)
  
  if (sampleMedia && sampleMedia.length > 0) {
    console.log(`📋 Media table columns:`)
    Object.keys(sampleMedia[0]).forEach(key => {
      console.log(`  - ${key}: ${typeof sampleMedia[0][key]}`)
    })
    
    console.log(`\n📄 Sample media records:`)
    sampleMedia.forEach((media, index) => {
      console.log(`\n  ${index + 1}. Media ID: ${media.id}`)
      console.log(`     Title: ${media.title || 'N/A'}`)
      console.log(`     Type: ${media.media_type || 'N/A'}`)
      console.log(`     URL: ${media.media_url ? 'Has URL' : 'No URL'}`)
      console.log(`     Transcript: ${media.transcript ? media.transcript.length + ' chars' : 'No transcript'}`)
      console.log(`     Linked Stories: ${media.linked_stories?.length || 0}`)
      console.log(`     Linked Storytellers: ${media.linked_storytellers?.length || 0}`)
    })
  }

  // Get total media count
  const { count: totalMediaCount } = await client
    .from('media')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📊 TOTAL MEDIA RECORDS: ${totalMediaCount}`)

  // Check how many media records have transcripts
  const { data: mediaWithTranscripts } = await client
    .from('media')
    .select('id, title, transcript, linked_storytellers')
    .not('transcript', 'is', null)
    .neq('transcript', '')

  console.log(`📝 Media with transcripts: ${mediaWithTranscripts?.length || 0}`)

  // Check storyteller connections to media
  const { data: allStorytellers } = await client
    .from('users')
    .select('id, full_name')
    .eq('role', 'storyteller')

  console.log(`\n👥 STORYTELLER MEDIA ANALYSIS:`)
  console.log(`Total storytellers: ${allStorytellers?.length || 0}`)

  let storytellersWithMedia = 0
  let storytellersWithoutMedia = 0
  let storytellersWithTranscripts = 0

  // Check each storyteller's media connections
  console.log(`\n🔍 Checking each storyteller's media connections...`)
  
  for (const storyteller of allStorytellers?.slice(0, 10) || []) {
    // Find media linked to this storyteller
    const { data: linkedMedia } = await client
      .from('media')
      .select('id, title, transcript, media_type')
      .overlaps('linked_storytellers', [storyteller.id])

    const hasMedia = (linkedMedia?.length || 0) > 0
    const hasTranscript = linkedMedia?.some(m => m.transcript && m.transcript.length > 0) || false
    
    if (hasMedia) storytellersWithMedia++
    else storytellersWithoutMedia++
    
    if (hasTranscript) storytellersWithTranscripts++

    console.log(`  ${hasMedia ? '✅' : '❌'} ${storyteller.full_name}`)
    console.log(`    Media records: ${linkedMedia?.length || 0}`)
    console.log(`    Has transcript: ${hasTranscript ? 'Yes' : 'No'}`)
    
    if (linkedMedia && linkedMedia.length > 0) {
      linkedMedia.forEach(media => {
        console.log(`      - ${media.title || 'Untitled'} (${media.media_type || 'unknown'})`)
        console.log(`        Transcript: ${media.transcript ? media.transcript.length + ' chars' : 'None'}`)
      })
    }
  }

  // Check specific storyteller - Jared Keating
  console.log(`\n👤 JARED KEATING MEDIA CHECK:`)
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  const { data: jaredMedia } = await client
    .from('media')
    .select('*')
    .overlaps('linked_storytellers', [jaredId])

  console.log(`📹 Jared's media records: ${jaredMedia?.length || 0}`)
  
  jaredMedia?.forEach((media, index) => {
    console.log(`\n  ${index + 1}. ${media.title || 'Untitled'}`)
    console.log(`     ID: ${media.id}`)
    console.log(`     Type: ${media.media_type}`)
    console.log(`     Transcript: ${media.transcript ? media.transcript.length + ' chars' : 'None'}`)
    console.log(`     Created: ${media.created_at}`)
  })

  // Summary analysis
  console.log(`\n📊 MEDIA CONNECTION SUMMARY:`)
  console.log(`  📹 Total media records: ${totalMediaCount}`)
  console.log(`  📝 Media with transcripts: ${mediaWithTranscripts?.length || 0}`)
  console.log(`  👥 Total storytellers: ${allStorytellers?.length || 0}`)
  console.log(`  ✅ Storytellers with media: ${storytellersWithMedia} (from first 10 checked)`)
  console.log(`  ❌ Storytellers without media: ${storytellersWithoutMedia} (from first 10 checked)`)
  console.log(`  📝 Storytellers with transcripts: ${storytellersWithTranscripts} (from first 10 checked)`)

  // Check if we need to create missing connections
  const connectionRate = storytellersWithMedia / Math.min(10, allStorytellers?.length || 0)
  console.log(`\n🎯 CONNECTION RATE: ${(connectionRate * 100).toFixed(1)}% (sample)`)
  
  if (connectionRate < 1.0) {
    console.log(`⚠️  NOT ALL STORYTELLERS HAVE MEDIA CONNECTIONS`)
    console.log(`   This needs to be fixed to ensure every storyteller has transcript access`)
  } else {
    console.log(`✅ ALL SAMPLED STORYTELLERS HAVE MEDIA CONNECTIONS`)
  }

  return {
    totalMedia: totalMediaCount,
    mediaWithTranscripts: mediaWithTranscripts?.length || 0,
    totalStorytellers: allStorytellers?.length || 0,
    jaredMediaCount: jaredMedia?.length || 0,
    connectionRate: connectionRate
  }
}

analyzeMediaConnections().catch(console.error)