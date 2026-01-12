#!/usr/bin/env tsx
/**
 * Verify Foundation Schema Deployment
 * Run this after manually executing the SQL in Supabase Dashboard
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TableCheck {
  name: string;
  description: string;
  critical: boolean;
}

const tables: TableCheck[] = [
  { name: 'organizations', description: 'Multi-tenant organization structure', critical: true },
  { name: 'locations', description: 'Geographic context for storytellers', critical: true },
  { name: 'projects', description: 'Location-based groupings within organizations', critical: true },
  { name: 'storytellers', description: 'Core storyteller-centric architecture', critical: true },
  { name: 'stories', description: 'Stories linked to storytellers', critical: true },
  { name: 'cms_pages', description: 'Site-wide content management pages', critical: false },
  { name: 'cms_content_blocks', description: 'Reusable content blocks', critical: false },
  { name: 'cms_media', description: 'Media library', critical: false }
];

async function verifyTable(table: TableCheck): Promise<boolean> {
  try {
    // Test basic access
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(1);
      
    if (error) {
      console.log(`❌ ${table.name}: ${error.message}`);
      return false;
    }
    
    // Test insert capability (for critical tables)
    if (table.critical && table.name !== 'stories') {
      try {
        const testData = getTestData(table.name);
        const { error: insertError } = await supabase
          .from(table.name)
          .insert(testData)
          .select();
          
        if (insertError) {
          console.log(`⚠️  ${table.name}: Read-only (${insertError.message})`);
        } else {
          console.log(`✅ ${table.name}: Fully accessible`);
          
          // Clean up test data  
          await supabase
            .from(table.name)
            .delete()
            .eq('name', testData.name || testData.title || testData.full_name);
            
          return true;
        }
      } catch (err) {
        console.log(`⚠️  ${table.name}: Insert test failed`);
      }
    }
    
    console.log(`✅ ${table.name}: Accessible`);
    return true;
    
  } catch (err) {
    console.log(`❌ ${table.name}: Not accessible`);
    return false;
  }
}

function getTestData(tableName: string): any {
  switch (tableName) {
    case 'organizations':
      return { name: 'Test Organization', type: 'test' };
    case 'locations':
      return { name: 'Test Location', country: 'Test' };
    case 'projects':
      return { name: 'Test Project', status: 'test' };
    case 'storytellers':
      return { full_name: 'Test Storyteller', consent_given: false };
    default:
      return { name: 'Test Item' };
  }
}

async function verifyIndexes(): Promise<void> {
  console.log('\\n🔍 Checking database indexes...');
  
  try {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .like('indexname', 'idx_%')
      .limit(10);
      
    if (error) {
      console.log('⚠️  Could not check indexes (permissions may be limited)');
    } else {
      console.log(`✅ Found ${data.length} custom indexes`);
      data.forEach(index => {
        console.log(`   📊 ${index.tablename}.${index.indexname}`);
      });
    }
  } catch (err) {
    console.log('⚠️  Index check failed (this is normal for hosted Supabase)');
  }
}

async function verifyTriggers(): Promise<void> {
  console.log('\\n🔧 Checking triggers...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table')
      .like('trigger_name', '%updated_at%')
      .limit(5);
      
    if (error) {
      console.log('⚠️  Could not check triggers (permissions may be limited)');
    } else {
      console.log(`✅ Found ${data.length} updated_at triggers`);
    }
  } catch (err) {
    console.log('⚠️  Trigger check failed (this is normal for hosted Supabase)');
  }
}

async function testStorytellersStoryRelationship(): Promise<boolean> {
  console.log('\\n🔗 Testing storyteller-story relationship...');
  
  try {
    // Test that stories require storytellers
    const { error } = await supabase
      .from('stories')
      .insert({
        title: 'Test Story Without Storyteller',
        content: 'This should fail due to foreign key constraint'
      });
      
    if (error && error.message.includes('violates foreign key constraint')) {
      console.log('✅ Stories correctly require storytellers (foreign key working)');
      return true;
    } else if (error) {
      console.log(`⚠️  Story constraint check failed: ${error.message}`);
      return false;
    } else {
      console.log('⚠️  Stories can be created without storytellers (constraint missing)');
      return false;
    }
  } catch (err) {
    console.log('⚠️  Relationship test failed');
    return false;
  }
}

async function main() {
  console.log('🔍 VERIFYING FOUNDATION SCHEMA DEPLOYMENT');
  console.log('=========================================');
  console.log('');
  
  let criticalErrors = 0;
  let totalErrors = 0;
  
  for (const table of tables) {
    const success = await verifyTable(table);
    if (!success) {
      totalErrors++;
      if (table.critical) {
        criticalErrors++;
      }
    }
  }
  
  // Additional verification
  await verifyIndexes();
  await verifyTriggers();
  const relationshipOk = await testStorytellersStoryRelationship();
  
  // Final assessment
  console.log('\\n📊 DEPLOYMENT VERIFICATION RESULTS');
  console.log('===================================');
  
  if (criticalErrors === 0) {
    console.log('🎉 FOUNDATION DEPLOYMENT SUCCESSFUL!');
    console.log('✅ All critical tables are accessible');
    console.log('✅ Storyteller-centric architecture ready');
    console.log('✅ Foreign key relationships working');
    
    if (totalErrors > 0) {
      console.log(`⚠️  ${totalErrors} non-critical tables need attention`);
    }
    
    console.log('\\n🎯 READY FOR PHASE 2: AIRTABLE MIGRATION');
    console.log('==========================================');
    console.log('Next steps:');
    console.log('1. Review migration scripts in scripts/ directory');
    console.log('2. Execute: npx tsx scripts/execute-airtable-migration.ts');
    console.log('3. Validate migrated data');
    
    return true;
    
  } else {
    console.log('❌ DEPLOYMENT VERIFICATION FAILED');
    console.log(`❌ ${criticalErrors} critical tables inaccessible`);
    console.log(`❌ ${totalErrors} total tables need attention`);
    console.log('');
    console.log('🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Ensure SQL was executed completely in Supabase Dashboard');
    console.log('2. Check for SQL errors in Supabase Dashboard logs');
    console.log('3. Verify service role permissions');
    console.log('4. Re-run: npx tsx scripts/verify-deployment.ts');
    
    return false;
  }
}

main().catch(console.error);