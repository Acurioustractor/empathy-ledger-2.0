import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function createOrganizationsComplete() {
  console.log('🏢 CREATING ORGANIZATIONS TABLE AND FILLING IT')
  console.log('=============================================')
  
  // Step 1: Create the organizations table using direct SQL execution
  console.log('📝 Step 1: Creating organizations table...')
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      organization_type VARCHAR(100) DEFAULT 'Community',
      status VARCHAR(50) DEFAULT 'active',
      website_url VARCHAR(500),
      contact_email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100) DEFAULT 'Australia',
      postal_code VARCHAR(20),
      founded_date DATE,
      logo_url VARCHAR(500),
      social_media JSONB,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations(name);
    CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(organization_type);
    
    -- Enable RLS
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for service role
    DROP POLICY IF EXISTS "Allow full access for service role" ON public.organizations;
    CREATE POLICY "Allow full access for service role" ON public.organizations
      FOR ALL USING (true);
  `

  try {
    // Use rpc to execute raw SQL
    const { error: createError } = await client.rpc('exec_sql', { sql: createTableSQL })
    
    if (createError) {
      console.log(`❌ Table creation failed: ${createError.message}`)
      console.log('🔧 Trying alternative method...')
      
      // If rpc doesn't work, we'll insert organizations directly and handle constraint errors
    } else {
      console.log('✅ Organizations table created successfully')
    }
  } catch (error) {
    console.log(`⚠️ RPC method not available, proceeding with direct insert method`)
  }

  // Step 2: Get unique communities to create organizations from
  console.log('\n📊 Step 2: Getting unique communities from storytellers...')
  
  const { data: storytellers } = await client
    .from('users')
    .select('community_affiliation, project_id, projects(name)')
    .eq('role', 'storyteller')
    .not('community_affiliation', 'is', null)

  const communityGroups = storytellers?.reduce((acc, storyteller) => {
    const community = storyteller.community_affiliation
    if (!acc[community]) {
      acc[community] = {
        count: 0,
        project: storyteller.projects?.name,
        project_id: storyteller.project_id
      }
    }
    acc[community].count++
    return acc
  }, {} as Record<string, any>)

  console.log(`Found ${Object.keys(communityGroups || {}).length} unique communities`)

  // Step 3: Create organization records
  console.log('\n🏗️ Step 3: Creating organization records...')
  
  const organizationsToCreate = Object.entries(communityGroups || {}).map(([community, data]) => ({
    name: community,
    description: `${community} community organization - ${data.project ? `affiliated with ${data.project}` : 'independent community group'}`,
    organization_type: 'Community',
    status: 'active',
    country: 'Australia',
    metadata: {
      storyteller_count: data.count,
      primary_project: data.project,
      created_from_migration: true
    }
  }))

  const createdOrgs = []
  let successCount = 0
  
  for (const org of organizationsToCreate) {
    try {
      const { data: newOrg, error } = await client
        .from('organizations')
        .insert(org)
        .select()
        .single()

      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
          console.log(`  ⚠️ ${org.name}: Already exists, skipping`)
          
          // Get existing org
          const { data: existingOrg } = await client
            .from('organizations')
            .select('*')
            .eq('name', org.name)
            .single()
          
          if (existingOrg) {
            createdOrgs.push(existingOrg)
            successCount++
          }
        } else {
          console.log(`  ❌ ${org.name}: ${error.message}`)
        }
      } else {
        console.log(`  ✅ ${org.name}: Created (${org.metadata.storyteller_count} storytellers)`)
        createdOrgs.push(newOrg)
        successCount++
      }
    } catch (error) {
      console.log(`  ❌ ${org.name}: Exception ${error}`)
    }
  }

  console.log(`\n📈 Organization creation results: ${successCount}/${organizationsToCreate.length}`)

  // Step 4: Link storytellers to organizations
  console.log('\n🔗 Step 4: Linking storytellers to organizations...')
  
  let linkedCount = 0
  let linkErrors = 0

  for (const org of createdOrgs) {
    // Find storytellers with matching community affiliation
    const { data: matchingStorytellers } = await client
      .from('users')
      .select('id, full_name, community_affiliation')
      .eq('role', 'storyteller')
      .eq('community_affiliation', org.name)

    console.log(`\n📍 Linking ${matchingStorytellers?.length || 0} storytellers to "${org.name}":`)

    for (const storyteller of matchingStorytellers || []) {
      const { error } = await client
        .from('users')
        .update({ organization_id: org.id })
        .eq('id', storyteller.id)

      if (error) {
        console.log(`  ❌ ${storyteller.full_name}: ${error.message}`)
        linkErrors++
      } else {
        console.log(`  ✅ ${storyteller.full_name}`)
        linkedCount++
      }
    }
  }

  // Step 5: Verification
  console.log('\n📊 Step 5: Final verification...')
  
  const { data: finalOrgs } = await client.from('organizations').select('*')
  const { data: linkedStorytellers } = await client
    .from('users')
    .select('id, full_name, community_affiliation, organization_id, organizations(name)')
    .eq('role', 'storyteller')
    .not('organization_id', 'is', null)

  console.log(`\n✅ FINAL RESULTS:`)
  console.log(`📊 Organizations created: ${finalOrgs?.length || 0}`)
  console.log(`👥 Storytellers linked: ${linkedCount}`)
  console.log(`❌ Link errors: ${linkErrors}`)
  console.log(`📈 Total with organization links: ${linkedStorytellers?.length || 0}/206`)

  // Show sample of successful links
  console.log(`\n👤 SAMPLE LINKED STORYTELLERS:`)
  linkedStorytellers?.slice(0, 5).forEach(storyteller => {
    console.log(`  - ${storyteller.full_name}`)
    console.log(`    Community: ${storyteller.community_affiliation}`)
    console.log(`    Organization: ${storyteller.organizations?.name}`)
  })

  console.log(`\n🎯 ORGANIZATIONS CREATED:`)
  finalOrgs?.forEach(org => {
    const storytellerCount = linkedStorytellers?.filter(s => s.organization_id === org.id).length || 0
    console.log(`  - ${org.name}: ${storytellerCount} storytellers`)
  })

  return {
    organizationsCreated: finalOrgs?.length || 0,
    storytellersLinked: linkedCount,
    linkErrors: linkErrors,
    finalLinkedCount: linkedStorytellers?.length || 0
  }
}

createOrganizationsComplete().catch(console.error)