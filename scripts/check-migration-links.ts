import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkMigrationLinks() {
  console.log('🔍 CHECKING MIGRATION LINKING METHODS')
  console.log('===================================')
  
  // Get Jared's info
  const jaredId = 'b5792008-c1d3-4bda-a0c4-be549c7cbc45'
  const { data: jared } = await client
    .from('users')
    .select('*')
    .eq('id', jaredId)
    .single()

  console.log(`👤 JARED:`)
  console.log(`  Name: "${jared.full_name}"`)
  console.log(`  Email: "${jared.email}"`)
  console.log(`  Community: "${jared.community_affiliation}"`)

  // Check themes table for potential matches
  console.log(`\n🏷️ CHECKING THEMES TABLE:`)
  const { data: allThemes } = await client.from('themes').select('*').limit(10)
  
  allThemes?.forEach((theme, i) => {
    console.log(`  ${i+1}. ${theme.name}`)
    console.log(`     ID: ${theme.id}`)
    console.log(`     storyteller_name: "${theme.storyteller_name || 'null'}"`)
    console.log(`     storyteller_email: "${theme.storyteller_email || 'null'}"`)
    console.log(`     linked_storytellers: ${JSON.stringify(theme.linked_storytellers)}`)
    
    // Check for name/email matches
    const nameMatch = theme.storyteller_name?.includes('Jared') || theme.storyteller_name?.includes('Keating')
    const emailMatch = theme.storyteller_email === jared.email
    if (nameMatch || emailMatch) {
      console.log(`     🎯 POTENTIAL MATCH: name=${nameMatch}, email=${emailMatch}`)
    }
  })

  // Check quotes table for potential matches  
  console.log(`\n💬 CHECKING QUOTES TABLE:`)
  const { data: allQuotes } = await client.from('quotes').select('*').limit(10)
  
  allQuotes?.forEach((quote, i) => {
    console.log(`  ${i+1}. "${quote.content?.substring(0, 50)}..."`)
    console.log(`     ID: ${quote.id}`)
    console.log(`     storyteller_name: "${quote.storyteller_name || 'null'}"`)
    console.log(`     storyteller_email: "${quote.storyteller_email || 'null'}"`)
    console.log(`     linked_storytellers: ${JSON.stringify(quote.linked_storytellers)}`)
    
    // Check for name/email matches
    const nameMatch = quote.storyteller_name?.includes('Jared') || quote.storyteller_name?.includes('Keating')
    const emailMatch = quote.storyteller_email === jared.email
    if (nameMatch || emailMatch) {
      console.log(`     🎯 POTENTIAL MATCH: name=${nameMatch}, email=${emailMatch}`)
    }
  })

  // Check media table for potential matches
  console.log(`\n📸 CHECKING MEDIA TABLE:`)
  const { data: allMedia } = await client.from('media').select('*').limit(10)
  
  allMedia?.forEach((media, i) => {
    console.log(`  ${i+1}. ${media.filename || 'no filename'}`)
    console.log(`     ID: ${media.id}`)
    console.log(`     storyteller_name: "${media.storyteller_name || 'null'}"`)
    console.log(`     storyteller_email: "${media.storyteller_email || 'null'}"`)
    console.log(`     linked_storytellers: ${JSON.stringify(media.linked_storytellers)}`)
    
    // Check for name/email matches
    const nameMatch = media.storyteller_name?.includes('Jared') || media.storyteller_name?.includes('Keating')
    const emailMatch = media.storyteller_email === jared.email
    if (nameMatch || emailMatch) {
      console.log(`     🎯 POTENTIAL MATCH: name=${nameMatch}, email=${emailMatch}`)
    }
  })

  // Now search specifically for Jared's data by name/email
  console.log(`\n🎯 SEARCHING FOR JARED'S DATA BY NAME/EMAIL:`)
  
  // Search themes by name
  const { data: jaredThemesByName } = await client
    .from('themes')
    .select('*')
    .or(`storyteller_name.ilike.%Jared%,storyteller_name.ilike.%Keating%`)

  console.log(`\n🏷️ Jared's themes by name: ${jaredThemesByName?.length || 0}`)
  jaredThemesByName?.forEach(theme => {
    console.log(`  - ${theme.name} (storyteller: ${theme.storyteller_name})`)
  })

  // Search quotes by name
  const { data: jaredQuotesByName } = await client
    .from('quotes')
    .select('*')
    .or(`storyteller_name.ilike.%Jared%,storyteller_name.ilike.%Keating%`)

  console.log(`\n💬 Jared's quotes by name: ${jaredQuotesByName?.length || 0}`)
  jaredQuotesByName?.forEach(quote => {
    console.log(`  - "${quote.content?.substring(0, 100)}..." (storyteller: ${quote.storyteller_name})`)
  })

  // Search media by name
  const { data: jaredMediaByName } = await client
    .from('media')
    .select('*')
    .or(`storyteller_name.ilike.%Jared%,storyteller_name.ilike.%Keating%`)

  console.log(`\n📸 Jared's media by name: ${jaredMediaByName?.length || 0}`)
  jaredMediaByName?.forEach(media => {
    console.log(`  - ${media.filename} (storyteller: ${media.storyteller_name})`)
  })

  return {
    themes: jaredThemesByName?.length || 0,
    quotes: jaredQuotesByName?.length || 0,
    media: jaredMediaByName?.length || 0
  }
}

checkMigrationLinks().catch(console.error)