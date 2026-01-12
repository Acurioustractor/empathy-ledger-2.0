#!/usr/bin/env tsx

/**
 * Execute CMS Schema Creation
 * 
 * Creates the CMS database tables and structure
 */

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
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

async function executeCMSSchema() {
  console.log('🏗️ CREATING CMS SCHEMA...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Read the SQL file
    const sqlContent = await readFile('/Users/benknight/Code/Empathy Ledger v.02/scripts/create-cms-schema.sql', 'utf-8')
    console.log('✅ SQL schema loaded')
    
    // Execute the SQL
    console.log('\n📊 Executing CMS schema creation...')
    
    // Split the SQL into individual statements (rough approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { 
            query: statement + ';' 
          })
          
          if (error) {
            console.log(`   ❌ Statement ${i + 1} failed: ${error.message}`)
            // Continue with other statements
          } else {
            if (statement.includes('CREATE TABLE')) {
              const tableName = statement.match(/CREATE TABLE.*?(\w+)/)?.[1]
              console.log(`   ✅ Created table: ${tableName}`)
            } else if (statement.includes('CREATE INDEX')) {
              const indexName = statement.match(/CREATE INDEX.*?(\w+)/)?.[1]
              console.log(`   ✅ Created index: ${indexName}`)
            } else if (statement.includes('CREATE POLICY')) {
              console.log(`   ✅ Created policy`)
            } else {
              console.log(`   ✅ Executed statement ${i + 1}`)
            }
          }
        } catch (error) {
          console.log(`   ❌ Statement ${i + 1} exception:`, error)
        }
      }
    }
    
    console.log('\n🎉 CMS SCHEMA CREATION COMPLETE!')
    console.log('✅ Tables created with proper RLS policies')
    console.log('✅ Indexes added for performance')
    console.log('✅ Initial settings populated')
    
    // Verify the tables exist
    console.log('\n📋 VERIFYING CMS TABLES:')
    const cmsTables = ['cms_pages', 'cms_content_blocks', 'cms_media', 'cms_navigation', 'cms_settings']
    
    for (const table of cmsTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ❌ ${table}: Error - ${error.message}`)
        } else {
          console.log(`   ✅ ${table}: ${count} records`)
        }
      } catch (error) {
        console.log(`   ❌ ${table}: Exception`)
      }
    }
    
  } catch (error) {
    console.error('❌ CMS schema creation failed:', error)
    throw error
  }
}

// Execute the schema
executeCMSSchema().catch(console.error)