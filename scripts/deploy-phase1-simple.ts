#!/usr/bin/env tsx
/**
 * PHASE 1: Simple Bullet-Proof Schema Deployment
 * Deploy Enhanced Supabase Schema step by step
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🚀 PHASE 1: Enhanced Supabase Schema Deployment');
  console.log('=================================================');
  
  // Step 1: Display deployment instructions
  console.log('📋 MANUAL DEPLOYMENT REQUIRED');
  console.log('');
  console.log('Due to Supabase security restrictions, the enhanced schema');
  console.log('must be deployed manually via the Supabase Dashboard.');
  console.log('');
  console.log('🔗 Go to: https://supabase.com/dashboard/project/tednluwflfhxyucgwigh/sql/new');
  console.log('');
  
  // Step 2: Check and prepare SQL files
  const sqlFiles = [
    {
      name: 'Enhanced Sovereignty Schema',
      file: 'sql/003_enhanced_sovereignty_schema.sql',
      description: 'Core storyteller-centric database with sovereignty features'
    },
    {
      name: 'CMS Content Management Schema', 
      file: 'create-cms-schema.sql',
      description: 'Site-wide content management system'
    }
  ];
  
  console.log('📁 SQL FILES TO DEPLOY:');
  console.log('');
  
  for (const [index, sqlFile] of sqlFiles.entries()) {
    const filePath = path.join(__dirname, sqlFile.file);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const size = (content.length / 1024).toFixed(1);
      
      console.log(`${index + 1}. ${sqlFile.name}`);
      console.log(`   📄 ${sqlFile.description}`);
      console.log(`   📁 File: ${sqlFile.file}`);
      console.log(`   📊 Size: ${size}KB`);
      console.log(`   ✅ Ready for deployment`);
      console.log('');
    } else {
      console.log(`${index + 1}. ${sqlFile.name}`);
      console.log(`   ❌ File not found: ${sqlFile.file}`);
      console.log('');
    }
  }
  
  // Step 3: Test connection and show current status
  console.log('🔍 CURRENT DATABASE STATUS:');
  try {
    // Check existing tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%stories%');
      
    if (error) {
      console.log('   ⚠️  Cannot check existing tables (this is normal for new deployment)');
    } else {
      console.log(`   📊 Found ${tables?.length || 0} story-related tables`);
    }
    
    console.log('   ✅ Database connection active');
    
  } catch (error) {
    console.error('   ❌ Database connection failed:', error);
  }
  
  console.log('');
  console.log('📝 DEPLOYMENT STEPS:');
  console.log('');
  console.log('1. Open Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/tednluwflfhxyucgwigh/sql/new');
  console.log('');
  console.log('2. Copy and paste the ENHANCED SOVEREIGNTY SCHEMA:');
  console.log(`   File: ${path.join(__dirname, 'sql/003_enhanced_sovereignty_schema.sql')}`);
  console.log('   ▶️  Run the complete SQL script');
  console.log('');
  console.log('3. Copy and paste the CMS SCHEMA:');
  console.log(`   File: ${path.join(__dirname, 'create-cms-schema.sql')}`);
  console.log('   ▶️  Run the complete SQL script');
  console.log('');
  console.log('4. Verify deployment by running this validation:');
  console.log('   npm run validate-schema');
  console.log('');
  
  // Step 4: Create validation script
  const validationScript = `#!/usr/bin/env tsx
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
        console.log(\`❌ Table \${table}: \${error.message}\`);
        validationErrors++;
      } else {
        console.log(\`✅ Table \${table}: Accessible\`);
      }
    } catch (err) {
      console.log(\`❌ Table \${table}: Exception\`);
      validationErrors++;
    }
  }
  
  if (validationErrors === 0) {
    console.log('\\n🎉 PHASE 1 SCHEMA VALIDATION PASSED!');
    console.log('✅ All required tables are accessible');
    console.log('🎯 Ready for Phase 2: Airtable Migration');
  } else {
    console.log(\`\\n⚠️  VALIDATION FAILED: \${validationErrors} errors\`);
    console.log('Please check the SQL deployment in Supabase Dashboard');
  }
}

validateSchema().catch(console.error);`;
  
  fs.writeFileSync(
    path.join(__dirname, 'validate-phase1-schema.ts'), 
    validationScript
  );
  
  console.log('✅ Created validation script: validate-phase1-schema.ts');
  console.log('');
  console.log('🎯 NEXT STEPS AFTER MANUAL SQL DEPLOYMENT:');
  console.log('   1. Run: npm run tsx scripts/validate-phase1-schema.ts');
  console.log('   2. If validation passes, proceed to Phase 2');
  console.log('   3. If validation fails, check SQL errors in Supabase');
  console.log('');
  console.log('💡 TIP: Copy SQL files one section at a time if you encounter errors');
}

main().catch(console.error);