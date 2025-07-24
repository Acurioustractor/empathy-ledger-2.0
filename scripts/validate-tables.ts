#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function validateTables() {
  console.log('🔍 Validating Foundation Tables...');
  
  const requiredTables = ['organizations', 'projects', 'locations', 'storytellers', 'stories'];
  let errors = 0;
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        errors++;
      } else {
        console.log(`✅ ${table}: Ready`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Not accessible`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log('\n🎉 ALL FOUNDATION TABLES READY!');
    console.log('✅ Ready for Airtable migration');
  } else {
    console.log(`\n⚠️  ${errors} tables need attention`);
  }
}

validateTables().catch(console.error);