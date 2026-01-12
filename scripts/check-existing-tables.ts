#!/usr/bin/env tsx

/**
 * Check Existing Tables Script
 * 
 * Verifies what tables currently exist in Supabase
 * and determines what needs to be created for migration
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

async function checkExistingTables() {
  console.log('🔍 Checking existing Supabase tables...')
  
  try {
    // Use basic client with environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Check .env.local file.')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get all tables using a simpler approach
    const { data: tables, error } = await supabase
      .rpc('get_tables')

    if (error) throw error

    console.log('\n📋 Current Tables:')
    console.log('=' .repeat(50))
    
    const existingTables = new Set()
    for (const table of tables) {
      console.log(`${table.table_name.padEnd(30)} | ${table.table_type}`)
      existingTables.add(table.table_name)
    }

    // Check for critical missing tables
    console.log('\n🔍 Migration Requirements Check:')
    console.log('=' .repeat(50))
    
    const requiredTables = [
      'organizations',
      'projects', 
      'users',
      'profiles',
      'stories',
      'media',
      'project_members'
    ]

    const missing = []
    const existing = []

    for (const table of requiredTables) {
      if (existingTables.has(table)) {
        console.log(`✅ ${table} - EXISTS`)
        existing.push(table)
      } else {
        console.log(`❌ ${table} - MISSING`)
        missing.push(table)
      }
    }

    // Check project_members structure if it exists
    if (existingTables.has('project_members')) {
      console.log('\n🔍 Checking project_members structure...')
      try {
        const { data: sampleData } = await supabase
          .from('project_members')
          .select('*')
          .limit(1)
        
        if (sampleData && sampleData.length > 0) {
          console.log('📊 Sample project_members record structure:')
          console.log(JSON.stringify(sampleData[0], null, 2))
        } else {
          console.log('📊 project_members table exists but is empty')
        }
      } catch (error) {
        console.log('⚠️  Could not access project_members data')
      }
    }

    // Summary and recommendations
    console.log('\n📊 SUMMARY:')
    console.log('=' .repeat(50))
    console.log(`✅ Existing required tables: ${existing.length}/${requiredTables.length}`)
    console.log(`❌ Missing required tables: ${missing.length}`)
    
    if (missing.length > 0) {
      console.log('\n🚀 NEXT STEPS:')
      console.log('1. Create missing tables:', missing.join(', '))
      console.log('2. Run organizations/projects migration script')
      console.log('3. Link existing data to new project structure')
    } else {
      console.log('\n✅ All required tables exist!')
      console.log('🚀 Ready to run data migration')
    }

    return { existing, missing, totalTables: tables.length }

  } catch (error) {
    console.error('❌ Failed to check tables:', error)
    throw error
  }
}

// Main execution
async function main() {
  try {
    await checkExistingTables()
  } catch (error) {
    console.error('Check failed:', error)
    process.exit(1)
  }
}

// Run if called directly (ES module compatible)
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main()
}

export { checkExistingTables }