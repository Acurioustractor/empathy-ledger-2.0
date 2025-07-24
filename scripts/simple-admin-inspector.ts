#!/usr/bin/env tsx

/**
 * Simple Admin Inspector
 * 
 * Direct database inspection using service role
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function inspectDatabase() {
  console.log('🔍 Simple Admin Database Inspector')
  console.log('=' .repeat(60))
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing admin credentials')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('✅ Admin client connected')
    
    // Test the tables we know exist
    const knownTables = [
      'users', 'profiles', 'stories', 'media', 'communities',
      'project_members', 'project_analytics', 'themes', 'quotes',
      'storyteller_connections', 'storyteller_onboarding', 'storyteller_projects'
    ]
    
    console.log(`\n📊 Inspecting ${knownTables.length} known tables...`)
    
    const results = []
    
    for (const tableName of knownTables) {
      console.log(`\n🔍 ${tableName}:`)
      
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1)
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`)
          results.push({ table: tableName, status: 'error', error: error.message })
        } else {
          console.log(`   ✅ ${count} records total`)
          
          if (data && data.length > 0) {
            const sampleRecord = data[0]
            const fields = Object.keys(sampleRecord)
            console.log(`   📋 Fields (${fields.length}): ${fields.slice(0, 8).join(', ')}${fields.length > 8 ? '...' : ''}`)
            
            // Show some key field values for important tables
            if (['users', 'profiles', 'stories', 'project_members'].includes(tableName)) {
              console.log(`   📝 Sample data:`)
              Object.entries(sampleRecord).slice(0, 5).forEach(([key, value]) => {
                let displayValue = value
                if (typeof value === 'object' && value !== null) {
                  displayValue = JSON.stringify(value).substring(0, 50) + '...'
                } else if (typeof value === 'string' && value.length > 50) {
                  displayValue = value.substring(0, 50) + '...'
                }
                console.log(`      ${key}: ${displayValue}`)
              })
            }
            
            results.push({ 
              table: tableName, 
              status: 'success', 
              count, 
              fields: fields.length,
              sampleRecord 
            })
          } else {
            console.log(`   📭 Empty table`)
            results.push({ table: tableName, status: 'empty', count: 0 })
          }
        }
      } catch (error) {
        console.log(`   ❌ Exception: ${error}`)
        results.push({ table: tableName, status: 'exception', error: String(error) })
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 DATABASE INSPECTION SUMMARY')
    console.log('='.repeat(60))
    
    const successful = results.filter(r => r.status === 'success')
    const withData = successful.filter(r => r.count > 0)
    const empty = successful.filter(r => r.count === 0)
    const errors = results.filter(r => r.status === 'error' || r.status === 'exception')
    
    console.log(`✅ Accessible tables: ${successful.length}/${knownTables.length}`)
    console.log(`📊 Tables with data: ${withData.length}`)
    console.log(`📭 Empty tables: ${empty.length}`)
    console.log(`❌ Inaccessible tables: ${errors.length}`)
    
    if (withData.length > 0) {
      console.log('\n📊 TABLES WITH DATA:')
      withData
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .forEach(table => {
          console.log(`   ${table.table}: ${table.count} records`)
        })
    }
    
    if (errors.length > 0) {
      console.log('\n❌ PROBLEMATIC TABLES:')
      errors.forEach(table => {
        console.log(`   ${table.table}: ${table.error}`)
      })
    }
    
    // Key insights for migration planning
    console.log('\n🎯 MIGRATION INSIGHTS:')
    console.log('=' .repeat(40))
    
    const storiesTable = results.find(r => r.table === 'stories')
    const usersTable = results.find(r => r.table === 'users')
    const projectMembersTable = results.find(r => r.table === 'project_members')
    
    if (storiesTable && storiesTable.count > 0) {
      console.log(`✅ Stories: ${storiesTable.count} records ready for project linking`)
    }
    
    if (usersTable && usersTable.count > 0) {
      console.log(`✅ Users: ${usersTable.count} records (storytellers from migration)`)
    }
    
    if (projectMembersTable) {
      if (projectMembersTable.count > 0) {
        console.log(`⚠️  Project Members: ${projectMembersTable.count} records (need to check structure)`)
      } else {
        console.log(`📭 Project Members: Empty (will be populated during migration)`)
      }
    }
    
    console.log('\n🚀 NEXT STEPS:')
    console.log('1. ✅ Admin access working - you can now inspect all data!')
    console.log('2. Create organizations and projects tables')
    console.log('3. Migrate Airtable data to new project structure')
    console.log('4. Link existing stories to projects')
    console.log('5. Deploy CMS with project integration')
    
    return results
    
  } catch (error) {
    console.error('❌ Inspection failed:', error)
    throw error
  }
}

// Run inspection
inspectDatabase().catch(console.error)