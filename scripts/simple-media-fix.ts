import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function simpleMediaFix() {
  console.log('🔗 SIMPLE MEDIA-STORYTELLER FIX')
  console.log('===============================')
  
  // Get total count first
  const { count: totalCount } = await client
    .from('media')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 Total media records: ${totalCount}`)

  // Get first batch of media with storyteller_id
  const { data: mediaBatch } = await client
    .from('media')
    .select('id, title, storyteller_id, linked_storytellers')
    .range(0, 49) // First 50 records

  console.log(`📄 First batch: ${mediaBatch?.length || 0} records`)

  // Count how many need fixing
  const needsFix = mediaBatch?.filter(m => 
    m.storyteller_id && (!m.linked_storytellers || m.linked_storytellers.length === 0)
  ) || []

  console.log(`🔧 Records needing fix: ${needsFix.length}`)

  // Fix them
  let fixed = 0
  for (const media of needsFix) {
    const { error } = await client
      .from('media')
      .update({ linked_storytellers: [media.storyteller_id] })
      .eq('id', media.id)

    if (!error) {
      console.log(`  ✅ Fixed: ${media.title}`)
      fixed++
    } else {
      console.log(`  ❌ Error: ${media.title} - ${error.message}`)
    }
  }

  console.log(`\n📈 Fixed ${fixed} records`)

  // Check Jared specifically
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  
  const { data: jaredDirect } = await client
    .from('media')
    .select('*')
    .eq('storyteller_id', jaredId)

  console.log(`\n👤 Jared's media (direct): ${jaredDirect?.length || 0}`)

  const { data: jaredLinked } = await client
    .from('media')
    .select('*')
    .overlaps('linked_storytellers', [jaredId])

  console.log(`👤 Jared's media (linked): ${jaredLinked?.length || 0}`)

  jaredLinked?.forEach(media => {
    console.log(`  - ${media.title}: ${media.transcript?.length} chars`)
  })

  return { totalRecords: totalCount, fixed, jaredCount: jaredLinked?.length || 0 }
}

simpleMediaFix().catch(console.error)