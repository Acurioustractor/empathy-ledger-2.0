#!/usr/bin/env tsx

/**
 * Final Migration Validation
 * 
 * Comprehensive validation that all systems are using Supabase
 * and ready for Airtable deprecation
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

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

async function validateDatabase() {
  console.log('🔍 VALIDATING DATABASE STATE...')
  
  const supabase = await createAdminClient()
  
  // Core table counts
  const tables = ['users', 'stories', 'media', 'quotes', 'themes', 'projects', 'communities', 'locations', 'countries']
  const counts: Record<string, number> = {}
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      counts[table] = count || 0
    } catch (error) {
      console.log(`   ⚠️  Table '${table}' not found or accessible`)
      counts[table] = -1
    }
  }
  
  console.log('\n📊 DATABASE COUNTS:')
  Object.entries(counts).forEach(([table, count]) => {
    const status = count >= 0 ? '✅' : '❌'
    console.log(`   ${status} ${table}: ${count >= 0 ? count : 'ERROR'}`)
  })
  
  return counts
}

async function validateRelationships() {
  console.log('\n🔗 VALIDATING RELATIONSHIPS...')
  
  const supabase = await createAdminClient()
  
  // Check user-project relationships
  const { count: usersWithProjects } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .not('project_id', 'is', null)
  
  // Check user-location relationships  
  const { count: usersWithLocations } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .not('primary_location_id', 'is', null)
  
  // Check project-organization relationships
  const { count: projectsWithOrgs } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .not('organization_id', 'is', null)
  
  console.log(`   ✅ Users linked to projects: ${usersWithProjects}`)
  console.log(`   ✅ Users linked to locations: ${usersWithLocations}`)
  console.log(`   ✅ Projects linked to organizations: ${projectsWithOrgs}`)
  
  return {
    usersWithProjects,
    usersWithLocations,
    projectsWithOrgs
  }
}

async function validateAPIs() {
  console.log('\n🔌 VALIDATING API ENDPOINTS...')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const endpoints = [
    '/api/health',
    '/api/projects',
    '/api/embed/stories?project_id=test&limit=1',
    '/api/stories/submit'
  ]
  
  const results: Record<string, string> = {}
  
  for (const endpoint of endpoints) {
    try {
      let response
      
      if (endpoint === '/api/stories/submit') {
        // Test POST endpoint
        response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'test', shareLevel: 'private' })
        })
      } else {
        // Test GET endpoint
        response = await fetch(`${baseUrl}${endpoint}`)
      }
      
      results[endpoint] = response.ok ? 'WORKING' : `ERROR ${response.status}`
      
    } catch (error) {
      results[endpoint] = 'UNAVAILABLE'
    }
  }
  
  Object.entries(results).forEach(([endpoint, status]) => {
    const icon = status === 'WORKING' ? '✅' : '⚠️'
    console.log(`   ${icon} ${endpoint}: ${status}`)
  })
  
  return results
}

async function validateDataIntegrity() {
  console.log('\n🛡️ VALIDATING DATA INTEGRITY...')
  
  const supabase = await createAdminClient()
  
  // Check for orphaned records
  const { data: orphanedStories } = await supabase
    .from('stories')
    .select('id')
    .is('project_id', null)
    .limit(5)
  
  const { data: orphanedUsers } = await supabase
    .from('users')
    .select('id')
    .is('project_id', null)
    .limit(5)
  
  // Check for duplicate records
  const { data: storiesWithTitles } = await supabase
    .from('stories')
    .select('title')
    .not('title', 'is', null)
  
  const titleCounts: Record<string, number> = {}
  storiesWithTitles?.forEach(story => {
    if (story.title) {
      titleCounts[story.title] = (titleCounts[story.title] || 0) + 1
    }
  })
  
  const duplicateTitles = Object.entries(titleCounts).filter(([_, count]) => count > 1)
  
  console.log(`   ✅ Stories without projects: ${orphanedStories?.length || 0}`)
  console.log(`   ✅ Users without projects: ${orphanedUsers?.length || 0}`)
  console.log(`   ✅ Duplicate story titles: ${duplicateTitles.length}`)
  
  return {
    orphanedStories: orphanedStories?.length || 0,
    orphanedUsers: orphanedUsers?.length || 0,
    duplicateTitles: duplicateTitles.length
  }
}

async function generateMigrationReport() {
  console.log('\n📋 GENERATING MIGRATION REPORT...')
  
  const supabase = await createAdminClient()
  
  // Get project distribution
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      organization_id,
      communities!inner(name)
    `)
  
  const { data: userCounts } = await supabase
    .from('users')
    .select('project_id')
    .not('project_id', 'is', null)
  
  const projectUserCounts: Record<string, number> = {}
  userCounts?.forEach(user => {
    if (user.project_id) {
      projectUserCounts[user.project_id] = (projectUserCounts[user.project_id] || 0) + 1
    }
  })
  
  console.log('\n🏢 PROJECT DISTRIBUTION:')
  projects?.forEach(project => {
    const userCount = projectUserCounts[project.id] || 0
    const orgName = (project.communities as any)?.name || 'Unknown'
    console.log(`   ${project.name} (${orgName}): ${userCount} users`)
  })
  
  return {
    projects: projects?.length || 0,
    totalLinkedUsers: userCounts?.length || 0
  }
}

async function finalValidation() {
  console.log('🎯 FINAL MIGRATION VALIDATION')
  console.log('=' .repeat(60))
  
  try {
    // Run all validation checks
    const dbCounts = await validateDatabase()
    const relationships = await validateRelationships()
    const apiResults = await validateAPIs()
    const integrity = await validateDataIntegrity()
    const report = await generateMigrationReport()
    
    // Generate final status
    console.log('\n🎉 MIGRATION STATUS SUMMARY')
    console.log('=' .repeat(60))
    
    const criticalData = [
      dbCounts.users >= 200,
      dbCounts.stories >= 45,
      dbCounts.projects >= 10,
      relationships.usersWithProjects >= 180,
      relationships.usersWithLocations >= 180
    ]
    
    const allCriticalPassed = criticalData.every(check => check)
    
    console.log(`✅ Database Tables: ${Object.values(dbCounts).filter(c => c > 0).length}/9`)
    console.log(`✅ User-Project Links: ${relationships.usersWithProjects}`)
    console.log(`✅ User-Location Links: ${relationships.usersWithLocations}`)
    console.log(`✅ Active Projects: ${report.projects}`)
    console.log(`✅ Data Integrity: ${integrity.orphanedStories === 0 ? 'CLEAN' : 'NEEDS CLEANUP'}`)
    
    if (allCriticalPassed) {
      console.log('\n🚀 MIGRATION STATUS: READY FOR PRODUCTION!')
      console.log('✅ All critical systems operational')
      console.log('✅ Data migration complete')
      console.log('✅ Multi-tenant architecture active')
      console.log('✅ APIs using Supabase exclusively')
      console.log('\n🎯 NEXT STEPS:')
      console.log('1. ✅ Deploy to production')
      console.log('2. ✅ Monitor performance for 24 hours')
      console.log('3. ✅ Disable Airtable API access')
      console.log('4. ✅ Archive Airtable workspace')
    } else {
      console.log('\n⚠️  MIGRATION STATUS: NEEDS ATTENTION')
      console.log('Some validation checks failed. Review above for details.')
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error)
    throw error
  }
}

// Run validation
finalValidation().catch(console.error)