#!/usr/bin/env tsx

/**
 * Simple Table Check
 * 
 * Check what tables exist and their basic structure
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function checkTables() {
  console.log('🔍 Checking existing Supabase tables...')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables:')
      console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
      console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey)
      console.error('\n💡 Make sure .env.local exists with these variables')
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // List of tables we expect to exist
    const expectedTables = [
      'users', 'profiles', 'stories', 'media', 'communities',
      'project_members', 'project_analytics', 'storytellers',
      'themes', 'quotes'
    ]
    
    // Tables we need to create
    const neededTables = ['organizations', 'projects']
    
    console.log('\n📋 Checking Existing Tables:')
    console.log('=' .repeat(50))
    
    const existingTables = []
    const missingTables = []
    
    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table} - NOT ACCESSIBLE (${error.message})`)
          missingTables.push(table)
        } else {
          console.log(`✅ ${table} - EXISTS`)
          existingTables.push(table)
        }
      } catch (error) {
        console.log(`❌ ${table} - ERROR`)
        missingTables.push(table)
      }
    }
    
    console.log('\n📋 Checking Tables We Need to Create:')
    console.log('=' .repeat(50))
    
    for (const table of neededTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`⚠️  ${table} - NEEDS TO BE CREATED`)
        } else {
          console.log(`✅ ${table} - ALREADY EXISTS`)
        }
      } catch (error) {
        console.log(`⚠️  ${table} - NEEDS TO BE CREATED`)
      }
    }
    
    // Check project_members structure if it exists
    if (existingTables.includes('project_members')) {
      console.log('\n🔍 Checking project_members structure...')
      try {
        const { data, error } = await supabase
          .from('project_members')
          .select('*')
          .limit(1)
        
        if (data && data.length > 0) {
          console.log('📊 Sample project_members record:')
          console.log(JSON.stringify(data[0], null, 2))
        } else {
          console.log('📊 project_members table exists but is empty')
        }
      } catch (error) {
        console.log('⚠️  Could not read project_members structure')
      }
    }
    
    console.log('\n📊 SUMMARY:')
    console.log('=' .repeat(50))
    console.log(`✅ Existing tables: ${existingTables.length}`)
    console.log(`❌ Missing/inaccessible: ${missingTables.length}`)
    console.log(`⚠️  Need to create: organizations, projects`)
    
    console.log('\n🚀 NEXT STEPS:')
    if (existingTables.length >= 5) {
      console.log('✅ Good! Core tables exist')
      console.log('1. Create organizations and projects tables')
      console.log('2. Run data migration from Airtable')
      console.log('3. Link existing data to projects')
    } else {
      console.log('⚠️  Some core tables are missing or inaccessible')
      console.log('1. Check database permissions')
      console.log('2. Verify environment variables')
      console.log('3. Check Supabase connection')
    }
    
  } catch (error) {
    console.error('❌ Failed to check tables:', error)
  }
}

// Run the check
checkTables()