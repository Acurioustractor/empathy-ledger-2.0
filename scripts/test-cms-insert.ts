#!/usr/bin/env tsx

/**
 * Test CMS Insert
 * 
 * Simple test to understand CMS table requirements
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

async function testCMSInsert() {
  console.log('🧪 TESTING CMS INSERT...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Test 1: Simple insert into cms_settings
    console.log('\n📝 Testing cms_settings insert:')
    try {
      const { data, error } = await supabase
        .from('cms_settings')
        .insert({
          key: 'test_setting',
          value: 'test_value',
          category: 'test',
          description: 'Test setting'
        })
        .select()
      
      if (error) {
        console.log('   ❌ Error:', JSON.stringify(error, null, 2))
      } else {
        console.log('   ✅ Success:', data)
      }
    } catch (error) {
      console.log('   ❌ Exception:', error)
    }
    
    // Test 2: Simple insert into cms_pages
    console.log('\n📄 Testing cms_pages insert:')
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .insert({
          slug: 'test-page',
          title: 'Test Page',
          description: 'A test page'
        })
        .select()
      
      if (error) {
        console.log('   ❌ Error:', JSON.stringify(error, null, 2))
      } else {
        console.log('   ✅ Success:', data)
      }
    } catch (error) {
      console.log('   ❌ Exception:', error)
    }
    
    // Test 3: Check what we can select from cms_settings
    console.log('\n📋 Testing cms_settings select:')
    try {
      const { data, error } = await supabase
        .from('cms_settings')
        .select('*')
        .limit(5)
      
      if (error) {
        console.log('   ❌ Select error:', JSON.stringify(error, null, 2))
      } else {
        console.log('   ✅ Select success:', data)
      }
    } catch (error) {
      console.log('   ❌ Select exception:', error)
    }
    
    // Test 4: Try to understand the table structure
    console.log('\n🔍 Testing table structure:')
    try {
      // This might fail but will give us insights
      const { data, error } = await supabase
        .from('cms_settings')
        .insert({})
        .select()
      
      if (error) {
        console.log('   📝 Empty insert error (reveals required fields):')
        console.log('      ', JSON.stringify(error, null, 2))
      } else {
        console.log('   ⚠️ Empty insert succeeded (no required fields)')
      }
    } catch (error) {
      console.log('   ❌ Exception:', error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

// Run the test
testCMSInsert().catch(console.error)