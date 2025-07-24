import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function debugQueries() {
  console.log('🔍 DEBUGGING QUERY ERRORS')
  console.log('=========================')
  
  // Test 1: Projects query that's failing
  console.log('\n1. Testing projects query...')
  try {
    const { data, error } = await client
      .from('projects')
      .select('id')
      .or(`id.eq.A Curious Tractor,name.ilike.%A Curious Tractor%`)

    console.log('❌ Projects query error:', error)
    console.log('✅ Projects data:', data)
  } catch (e) {
    console.log('❌ Projects exception:', e)
  }

  // Test 2: Quotes query that's failing  
  console.log('\n2. Testing quotes query...')
  try {
    const { data, error } = await client
      .from('quotes')
      .select('*')
      .limit(3)
      .contains('theme', ['innovation'])

    console.log('❌ Quotes query error:', error)
    console.log('✅ Quotes data:', data)
  } catch (e) {
    console.log('❌ Quotes exception:', e)
  }

  // Test 3: Users query that's failing
  console.log('\n3. Testing users query...')
  try {
    const { data, error } = await client
      .from('users')
      .select(`
        id,
        full_name,
        profile_image_url,
        bio,
        community_affiliation,
        primary_location_id,
        project_id,
        locations(id, name, state, country)
      `)
      .eq('role', 'storyteller')
      .not('profile_image_url', 'is', null)
      .limit(6)

    console.log('❌ Users query error:', error)
    console.log('✅ Users data length:', data?.length)
  } catch (e) {
    console.log('❌ Users exception:', e)
  }

  // Test 4: Simple queries to verify basic connectivity
  console.log('\n4. Testing basic connectivity...')
  try {
    const { data: projects } = await client.from('projects').select('id, name').limit(3)
    console.log('✅ Projects basic:', projects?.length, 'records')

    const { data: users } = await client.from('users').select('id, role').limit(3)
    console.log('✅ Users basic:', users?.length, 'records')

    const { data: quotes } = await client.from('quotes').select('id').limit(3)
    console.log('✅ Quotes basic:', quotes?.length, 'records')
  } catch (e) {
    console.log('❌ Basic connectivity failed:', e)
  }
}

debugQueries().catch(console.error)