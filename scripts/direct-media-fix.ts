import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function directMediaFix() {
  console.log('🔗 DIRECT MEDIA STORYTELLER LINKING')
  console.log('===================================')
  
  // Try a different approach - use RPC or direct SQL-like operations
  // First, let's just update all media records to populate linked_storytellers from storyteller_id
  
  console.log('⚡ Updating all media records to populate linked_storytellers...')
  
  // This should update all media records where storyteller_id exists but linked_storytellers is null/empty
  const { data, error, count } = await client
    .rpc('update_media_linked_storytellers')
    
  if (error) {
    console.log(`❌ RPC failed: ${error.message}`)
    
    // Fall back to manual approach - get Jared's media and fix it directly
    console.log('\n🔧 Falling back to manual fix for Jared...')
    
    const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
    
    // Get Jared's media by storyteller_id
    const { data: jaredMedia } = await client
      .from('media')
      .select('id, title, storyteller_id, transcript')
      .eq('storyteller_id', jaredId)

    console.log(`📹 Found ${jaredMedia?.length || 0} media records for Jared`)
    
    // Fix each one individually
    for (const media of jaredMedia || []) {
      const { error: updateError } = await client
        .from('media')
        .update({ linked_storytellers: [jaredId] })
        .eq('id', media.id)
        
      if (updateError) {
        console.log(`  ❌ Failed to update ${media.title}: ${updateError.message}`)
      } else {
        console.log(`  ✅ Updated ${media.title}`)
      }
    }
    
    // Verify the fix
    const { data: jaredLinked } = await client
      .from('media')
      .select('*')
      .overlaps('linked_storytellers', [jaredId])

    console.log(`\n🎯 Jared's linked media after fix: ${jaredLinked?.length || 0}`)
    
    jaredLinked?.forEach((media, index) => {
      console.log(`\n  ${index + 1}. "${media.title}"`)
      console.log(`     ID: ${media.id}`)
      console.log(`     Transcript: ${media.transcript?.length} chars`)
      console.log(`     Content: "${media.transcript?.substring(0, 100)}..."`)
    })
    
    return { jaredFixed: jaredMedia?.length || 0, jaredVerified: jaredLinked?.length || 0 }
  }
  
  console.log(`✅ RPC succeeded: ${count} records updated`)
  return { totalUpdated: count }
}

directMediaFix().catch(console.error)