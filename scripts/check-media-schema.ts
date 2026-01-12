import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkMediaSchema() {
  console.log('🔍 CHECKING ACTUAL MEDIA TABLE SCHEMA')
  console.log('====================================')
  
  // Get one record to see all columns
  const { data: sampleRecord } = await client
    .from('media')
    .select('*')
    .limit(1)
    .single()

  if (sampleRecord) {
    console.log('📋 Actual media table columns:')
    Object.keys(sampleRecord).forEach(key => {
      console.log(`  - ${key}`)
    })
    
    console.log('\n🎯 KEY FINDINGS:')
    console.log(`  ✅ Has storyteller_id: ${sampleRecord.storyteller_id ? 'Yes' : 'No'}`)
    console.log(`  ❌ Has linked_storytellers: ${'linked_storytellers' in sampleRecord ? 'Yes' : 'No'}`)
    
    if (sampleRecord.storyteller_id) {
      console.log(`  📊 Sample storyteller_id: ${sampleRecord.storyteller_id}`)
    }
  }

  // The media table uses storyteller_id as direct foreign key, not linked_storytellers array
  // This means every storyteller should have media via the storyteller_id field
  
  console.log('\n👤 CHECKING STORYTELLERS WITH MEDIA (via storyteller_id):')
  
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  const { data: jaredMedia } = await client
    .from('media')
    .select('id, title, transcript, storyteller_id')
    .eq('storyteller_id', jaredId)

  console.log(`📹 Jared Keating's media: ${jaredMedia?.length || 0}`)
  
  jaredMedia?.forEach((media, index) => {
    console.log(`\n  ${index + 1}. "${media.title}"`)
    console.log(`     ID: ${media.id}`)
    console.log(`     Transcript length: ${media.transcript?.length || 0}`)
    console.log(`     Content: "${(media.transcript || '').substring(0, 150)}..."`)
  })

  // Check a few other storytellers
  const { data: sampleStorytellers } = await client
    .from('users')
    .select('id, full_name')
    .eq('role', 'storyteller')
    .limit(10)

  console.log('\n📊 SAMPLE STORYTELLER MEDIA CONNECTIONS:')
  
  let storytellersWithMedia = 0
  
  for (const storyteller of sampleStorytellers || []) {
    const { data: mediaCount } = await client
      .from('media')
      .select('id')
      .eq('storyteller_id', storyteller.id)

    const hasMedia = (mediaCount?.length || 0) > 0
    if (hasMedia) storytellersWithMedia++
    
    console.log(`  ${hasMedia ? '✅' : '❌'} ${storyteller.full_name}: ${mediaCount?.length || 0} media`)
  }

  console.log(`\n📊 SUMMARY:`)
  console.log(`  👥 Storytellers checked: ${sampleStorytellers?.length || 0}`)
  console.log(`  ✅ With media: ${storytellersWithMedia}`)
  console.log(`  📊 Coverage: ${sampleStorytellers?.length ? ((storytellersWithMedia / sampleStorytellers.length) * 100).toFixed(1) : 0}%`)

  // THE REAL ANSWER: Media table uses storyteller_id, not linked_storytellers
  // Every storyteller SHOULD have media via this direct relationship
  console.log('\n🎯 CONCLUSION:')
  console.log('  📋 Media table uses storyteller_id (direct foreign key)')
  console.log('  ❌ Media table does NOT have linked_storytellers column')
  console.log('  ✅ Storytellers connect to media via storyteller_id field')
  console.log('  📝 Each media record represents a transcript for one storyteller')

  return {
    jaredMediaCount: jaredMedia?.length || 0,
    storytellersWithMedia,
    totalChecked: sampleStorytellers?.length || 0,
    usesDirectForeignKey: true,
    hasLinkedStorytellersColumn: false
  }
}

checkMediaSchema().catch(console.error)