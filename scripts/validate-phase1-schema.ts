#!/usr/bin/env tsx
/**
 * Validate Phase 1 Schema Deployment
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function validateSchema() {
  console.log('🔍 Validating Phase 1 Schema Deployment...');
  
  const requiredTables = [
    'stories',
    'knowledge_connections', 
    'community_insights',
    'cultural_protocols',
    'value_distribution',
    'cms_pages',
    'cms_content_blocks',
    'cms_media',
    'cms_navigation'
  ];
  
  let validationErrors = 0;
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
        validationErrors++;
      } else {
        console.log(`✅ Table ${table}: Accessible`);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: Exception`);
      validationErrors++;
    }
  }
  
  if (validationErrors === 0) {
    console.log('\n🎉 PHASE 1 SCHEMA VALIDATION PASSED!');
    console.log('✅ All required tables are accessible');
    console.log('🎯 Ready for Phase 2: Airtable Migration');
  } else {
    console.log(`\n⚠️  VALIDATION FAILED: ${validationErrors} errors`);
    console.log('Please check the SQL deployment in Supabase Dashboard');
  }
}

validateSchema().catch(console.error);