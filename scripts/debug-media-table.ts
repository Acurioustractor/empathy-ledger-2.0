import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function debugMediaTable() {
  console.log('🔍 DEBUGGING MEDIA TABLE STRUCTURE')
  console.log('==================================')
  
  // Get all media records to understand the structure
  const { data: allMedia } = await client
    .from('media')
    .select('*')
    .limit(5)

  console.log(`📊 Sample media records: ${allMedia?.length || 0}`)
  
  if (allMedia && allMedia.length > 0) {
    console.log(`\n📋 Complete record structure:`)
    allMedia.forEach((media, index) => {
      console.log(`\n${index + 1}. Record ${media.id}:`)
      Object.entries(media).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const displayValue = typeof value === 'string' ? 
            (value.length > 50 ? value.substring(0, 50) + '...' : value) :
            JSON.stringify(value)
          console.log(`   ${key}: ${displayValue}`)
        } else {
          console.log(`   ${key}: ${value}`)
        }
      })
    })
  }

  // Check specifically for storyteller connections
  console.log(`\n🔍 CHECKING STORYTELLER FIELD VARIATIONS:`)
  
  // Try different possible field names
  const fieldChecks = [
    'storyteller_id',
    'user_id', 
    'linked_storytellers',
    'linked_users'
  ]

  for (const field of fieldChecks) {
    try {
      const { data: records } = await client
        .from('media')
        .select(`id, title, ${field}`)
        .not(field, 'is', null)
        .limit(3)

      console.log(`  ${field}: ${records?.length || 0} non-null records`)
      
      if (records && records.length > 0) {
        records.forEach(record => {
          console.log(`    - ${record.title}: ${field} = ${JSON.stringify(record[field])}`)
        })
      }
    } catch (error) {
      console.log(`  ${field}: Field doesn't exist`)
    }
  }

  // Check for Jared specifically in different ways
  console.log(`\n👤 JARED KEATING SPECIFIC SEARCH:`)
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  // Check by storyteller_id if it exists
  try {
    const { data: jaredByStorytellerId } = await client
      .from('media')
      .select('*')
      .eq('storyteller_id', jaredId)

    console.log(`  By storyteller_id: ${jaredByStorytellerId?.length || 0}`)
    jaredByStorytellerId?.forEach(media => {
      console.log(`    - ${media.title} (${media.id})`)
    })
  } catch (error) {
    console.log(`  storyteller_id search failed: ${error}`)
  }

  // Check if there's any text-based reference to Jared
  try {
    const { data: jaredByTitle } = await client
      .from('media')
      .select('*')
      .ilike('title', '%jared%')

    console.log(`  By title containing 'jared': ${jaredByTitle?.length || 0}`)
    jaredByTitle?.forEach(media => {
      console.log(`    - ${media.title} (${media.id})`)
    })
  } catch (error) {
    console.log(`  Title search failed: ${error}`)
  }

  // Let's also check if there are any references to storytellers in the transcript
  const { data: sampleWithTranscripts } = await client
    .from('media')
    .select('id, title, transcript')
    .not('transcript', 'is', null)
    .neq('transcript', '')
    .limit(10)

  console.log(`\n📝 TRANSCRIPT Analysis:`)
  console.log(`  Records with transcripts: ${sampleWithTranscripts?.length || 0}`)
  
  sampleWithTranscripts?.slice(0, 3).forEach((media, index) => {
    console.log(`\n  ${index + 1}. ${media.title}`)
    console.log(`     Transcript: ${media.transcript?.substring(0, 200)}...`)
  })

  return {
    totalMedia: allMedia?.length || 0,
    mediaWithTranscripts: sampleWithTranscripts?.length || 0
  }
}

debugMediaTable().catch(console.error)