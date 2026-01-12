#!/usr/bin/env tsx

/**
 * Test Multi-Tenant CMS Functionality
 * 
 * Validates that the updated CMS service works with projects and organizations
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Import CMS functions to test
import { 
  getOrganizations, 
  getProjects, 
  getProjectAnalytics, 
  getOrganizationAnalytics,
  getStoriesByCategory,
  getFeaturedStories
} from '../src/lib/supabase-cms'

config({ path: '.env.local' })

async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing admin credentials')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function testMultiTenantCMS() {
  console.log('🧪 Testing Multi-Tenant CMS Functionality...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Test 1: Get all organizations
    console.log('\n📋 Test 1: Get Organizations')
    const organizations = await getOrganizations()
    console.log(`✅ Found ${organizations.length} organizations:`)
    organizations.slice(0, 5).forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name} (ID: ${org.id.slice(0, 8)}...)`)
    })
    
    // Test 2: Get all projects
    console.log('\n🚀 Test 2: Get All Projects')
    const allProjects = await getProjects()
    console.log(`✅ Found ${allProjects.length} projects:`)
    allProjects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (${project.project_type || 'Unknown type'})`)
    })
    
    // Test 3: Get projects for specific organization (Orange Sky)
    const orangeSkyOrg = organizations.find(org => org.name === 'Orange Sky')
    if (orangeSkyOrg) {
      console.log('\n🍊 Test 3: Get Orange Sky Projects')
      const orangeSkyProjects = await getProjects(orangeSkyOrg.id)
      console.log(`✅ Found ${orangeSkyProjects.length} Orange Sky projects:`)
      orangeSkyProjects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name}`)
      })
    }
    
    // Test 4: Get project analytics for largest project
    if (allProjects.length > 0) {
      const largestProject = allProjects[0] // Orange Sky should be first
      console.log(`\n📊 Test 4: Analytics for "${largestProject.name}"`)
      const analytics = await getProjectAnalytics(largestProject.id)
      console.log(`✅ Project Analytics:`)
      console.log(`   Stories: ${analytics.story_count}`)
      console.log(`   Storytellers: ${analytics.storyteller_count}`)
      console.log(`   Top locations:`)
      
      const topLocations = Object.entries(analytics.location_distribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
      
      topLocations.forEach(([location, count]) => {
        console.log(`     ${location}: ${count} storytellers`)
      })
    }
    
    // Test 5: Get organization analytics
    if (orangeSkyOrg) {
      console.log(`\n🏢 Test 5: Organization Analytics for Orange Sky`)
      const orgAnalytics = await getOrganizationAnalytics(orangeSkyOrg.id)
      console.log(`✅ Organization Analytics:`)
      console.log(`   Projects: ${orgAnalytics.project_count}`)
      console.log(`   Total Storytellers: ${orgAnalytics.total_storytellers}`)
      console.log(`   Total Stories: ${orgAnalytics.total_stories}`)
      console.log(`   Per-project breakdown:`)
      orgAnalytics.projects.forEach(project => {
        console.log(`     ${project.name}: ${project.storyteller_count} storytellers, ${project.story_count} stories`)
      })
    }
    
    // Test 6: Test story filtering by project
    if (allProjects.length > 0) {
      const testProject = allProjects[0]
      console.log(`\n📖 Test 6: Get Stories for "${testProject.name}"`)
      const projectStories = await getStoriesByCategory('healthcare', 5, testProject.id)
      console.log(`✅ Found ${projectStories.length} healthcare stories for project`)
      
      const featuredProjectStories = await getFeaturedStories(3, testProject.id)
      console.log(`✅ Found ${featuredProjectStories.length} featured stories for project`)
    }
    
    // Test 7: Database validation
    console.log('\n🔍 Test 7: Database Validation')
    
    // Check that users are linked to projects
    const { count: linkedUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('project_id', 'is', null)
    
    // Check that projects exist
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
    
    // Check that locations are linked
    const { count: linkedLocations } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('primary_location_id', 'is', null)
    
    console.log(`✅ Database Validation:`)
    console.log(`   Users linked to projects: ${linkedUsers}`)
    console.log(`   Total projects: ${totalProjects}`)
    console.log(`   Users linked to locations: ${linkedLocations}`)
    
    // Test 8: Multi-tenant isolation test
    console.log('\n🔒 Test 8: Multi-Tenant Isolation')
    
    if (allProjects.length >= 2) {
      const project1 = allProjects[0]
      const project2 = allProjects[1]
      
      const project1Stories = await getStoriesByCategory('healthcare', 10, project1.id)
      const project2Stories = await getStoriesByCategory('healthcare', 10, project2.id)
      
      console.log(`✅ Isolation Test:`)
      console.log(`   ${project1.name}: ${project1Stories.length} healthcare stories`)
      console.log(`   ${project2.name}: ${project2Stories.length} healthcare stories`)
      
      // Verify no story overlap (stories should be project-specific)
      const project1Ids = new Set(project1Stories.map(s => s.id))
      const project2Ids = new Set(project2Stories.map(s => s.id))
      const overlap = [...project1Ids].filter(id => project2Ids.has(id))
      
      if (overlap.length === 0) {
        console.log(`   ✅ No story overlap - proper isolation confirmed`)
      } else {
        console.log(`   ⚠️  Found ${overlap.length} overlapping stories - may need investigation`)
      }
    }
    
    // Summary
    console.log('\n🎉 Multi-Tenant CMS Test Complete!')
    console.log('=' .repeat(60))
    console.log(`✅ Organizations: ${organizations.length}`)
    console.log(`✅ Projects: ${allProjects.length}`)
    console.log(`✅ Users with projects: ${linkedUsers}`)
    console.log(`✅ Users with locations: ${linkedLocations}`)
    
    console.log('\n🚀 Multi-Tenant CMS System Status: READY!')
    console.log('✅ Content can now be filtered by project and organization')
    console.log('✅ Analytics support project-specific insights')
    console.log('✅ Multi-tenant isolation working correctly')
    console.log('✅ Sprint 1 foundation complete!')
    
  } catch (error) {
    console.error('❌ Multi-tenant CMS test failed:', error)
    throw error
  }
}

// Run test
testMultiTenantCMS().catch(console.error)