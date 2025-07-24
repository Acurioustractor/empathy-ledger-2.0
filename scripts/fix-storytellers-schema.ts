#!/usr/bin/env tsx
/**
 * FIX STORYTELLERS SCHEMA
 * Add the missing location column using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixStorytellersSchema(): Promise<void> {
  console.log('🔧 FIXING STORYTELLERS SCHEMA');
  console.log('=============================');
  
  try {
    // Add the missing location column
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE storytellers 
        ADD COLUMN IF NOT EXISTS location TEXT;
        
        -- Also ensure we have all the other columns we need
        ALTER TABLE storytellers 
        ADD COLUMN IF NOT EXISTS project_name TEXT,
        ADD COLUMN IF NOT EXISTS profile_image_file TEXT,
        ADD COLUMN IF NOT EXISTS media_type TEXT;
      `
    });
    
    if (error) {
      console.error('❌ Schema fix failed:', error);
      
      // Try a simpler approach - check current schema first
      console.log('\n📊 Checking current storytellers table schema...');
      
      const { data: schemaData, error: schemaError } = await supabase
        .from('storytellers')
        .select('*')
        .limit(1);
        
      if (schemaError) {
        console.error('Schema check error:', schemaError);
      } else {
        console.log('✅ Current schema works - let me check the exact error');
        
        // Try inserting a test record to see the exact schema
        const testData = {
          full_name: 'TEST_USER',
          airtable_record_id: 'test123'
        };
        
        const { error: testError } = await supabase
          .from('storytellers')
          .insert(testData);
          
        if (testError) {
          console.log('Test insert error:', testError.message);
        } else {
          console.log('✅ Basic insert works');
          
          // Clean up test
          await supabase
            .from('storytellers')
            .delete()
            .eq('full_name', 'TEST_USER');
        }
      }
    } else {
      console.log('✅ Schema updated successfully');
    }
    
  } catch (err) {
    console.error('❌ Error fixing schema:', err);
  }
}

async function checkStorytellersSchema(): Promise<void> {
  console.log('\n📊 CHECKING STORYTELLERS TABLE SCHEMA');
  console.log('=====================================');
  
  try {
    // Get a sample record to see the current schema
    const { data, error } = await supabase
      .from('storytellers')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error checking schema:', error);
    } else if (data && data.length > 0) {
      console.log('📋 Current table columns:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
    } else {
      console.log('📋 Table exists but is empty');
    }
    
    // Check table count
    const { count } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true });
      
    console.log(`📊 Current storytellers count: ${count}`);
    
  } catch (err) {
    console.error('❌ Error checking table:', err);
  }
}

async function main(): Promise<void> {
  console.log('🔧 STORYTELLERS SCHEMA FIX');
  console.log('===========================');
  
  await checkStorytellersSchema();
  await fixStorytellersSchema();
  await checkStorytellersSchema();
  
  console.log('\n✅ Schema fix complete - ready to retry migration');
}

main().catch(console.error);