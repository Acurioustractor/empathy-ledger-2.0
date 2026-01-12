#!/usr/bin/env tsx

/**
 * Inspect CMS Tables Structure
 * 
 * Check the actual schema of CMS tables to understand insert failures
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

async function inspectCMSTables() {
  console.log('🔍 INSPECTING CMS TABLES STRUCTURE...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    const cmsTables = [
      'cms_pages',
      'cms_content_blocks', 
      'cms_media',
      'cms_navigation',
      'cms_settings'
    ]
    
    for (const table of cmsTables) {
      console.log(`\n📋 TABLE: ${table}`)
      
      // Try a simple select to see what columns exist
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ❌ Error accessing table: ${error.message}`)
          console.log(`   Full error:`, error)
        } else {
          console.log(`   ✅ Table accessible, columns might include:`)
          
          // Try inserting a minimal record to see field requirements
          const testInsert = await supabase
            .from(table)
            .insert({})
            .select()
          
          if (testInsert.error) {
            console.log(`   📝 Insert error reveals required fields:`)
            console.log(`      ${testInsert.error.message}`)
          } else {
            console.log(`   ✅ Empty insert succeeded`)
          }
        }
      } catch (error) {
        console.log(`   ❌ Exception: ${error}`)
      }
    }
    
    // Also check if these tables actually exist in the database
    console.log('\n🗂️ CHECKING TABLE EXISTENCE:')
    
    try {
      const { data: tables, error } = await supabase
        .rpc('get_table_names')
      
      if (error) {
        console.log('   ❌ Could not retrieve table list via RPC')
        
        // Alternative approach - check information_schema
        const schemaQuery = `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name LIKE 'cms_%'
        `
        
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('exec_sql', { query: schemaQuery })
        
        if (schemaError) {
          console.log('   ❌ Could not check schema either')
        } else {
          console.log('   📋 CMS tables found:', schemaData)
        }
      } else {
        console.log('   📋 All tables:', tables)
      }
    } catch (error) {
      console.log('   ⚠️ Could not check table existence')
    }
    
  } catch (error) {
    console.error('❌ Inspection failed:', error)
    throw error
  }
}

// Run inspection
inspectCMSTables().catch(console.error)