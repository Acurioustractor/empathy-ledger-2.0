import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function executeSQL() {
  console.log('🔧 CREATING ORGANIZATIONS TABLE AND DATA')
  console.log('=======================================')
  
  // Since we can't execute raw SQL, let's use the Supabase client
  
  // 1. Create organizations one by one
  const organizations = [
    { name: 'Orange Sky', description: 'Orange Sky community organization providing laundry services for homeless', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'Goods.', description: 'Goods. community organization focused on community marketplace', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'Diagrama', description: 'Diagrama community organization providing social services', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'PICC', description: 'PICC community center organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'TOMNET', description: 'TOMNET youth services organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'MMEIC', description: 'MMEIC indigenous services organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'Global Laundry Alliance', description: 'Global Laundry Alliance network initiative organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'MingaMinga Rangers', description: 'MingaMinga Rangers environmental organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'Young Guns', description: 'Young Guns youth development organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'Oonchiumpa', description: 'Oonchiumpa cultural organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'General Community', description: 'General Community organization for diverse storytellers', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'Beyond Shadows', description: 'Beyond Shadows mental health organization', organization_type: 'Community', status: 'active', country: 'Australia' },
    { name: 'JusticeHub', description: 'JusticeHub legal aid organization', organization_type: 'Community', status: 'active', country: 'Australia' }
  ]

  console.log(`📝 Inserting ${organizations.length} organizations...`)
  
  const createdOrgs = []
  let successCount = 0
  let errorCount = 0

  for (const org of organizations) {
    try {
      const { data: newOrg, error } = await client
        .from('organizations')
        .insert(org)
        .select()
        .single()

      if (error) {
        console.log(`  ❌ ${org.name}: ${error.message}`)
        errorCount++
      } else {
        console.log(`  ✅ ${org.name}: Created (ID: ${newOrg.id})`)
        createdOrgs.push(newOrg)
        successCount++
      }
    } catch (error) {
      console.log(`  ❌ ${org.name}: Exception ${error}`)
      errorCount++
    }
  }

  console.log(`\n📊 ORGANIZATION CREATION RESULTS:`)
  console.log(`✅ Created: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)

  return createdOrgs
}

executeSQL().catch(console.error)