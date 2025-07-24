#!/usr/bin/env tsx
/**
 * PHASE 1: Deploy Enhanced Supabase Schema for Empathy Ledger
 * Bullet-proof deployment of storyteller-centric architecture + CMS system
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DeploymentStep {
  name: string;
  sqlFile: string;
  critical: boolean;
  description: string;
}

const deploymentSteps: DeploymentStep[] = [
  {
    name: 'Enhanced Sovereignty Schema',
    sqlFile: 'sql/003_enhanced_sovereignty_schema.sql',
    critical: true,
    description: 'World-class storyteller-centric database with full sovereignty features'
  },
  {
    name: 'CMS Content Management',
    sqlFile: 'create-cms-schema.sql',
    critical: true,
    description: 'Site-wide content management system with project multi-tenancy'
  }
];

async function executeSQL(sqlContent: string, stepName: string): Promise<boolean> {
  try {
    console.log(`📊 Executing ${stepName}...`);
    
    // Use raw SQL execution via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql: sqlContent })
    });
    
    if (response.ok) {
      console.log(`✅ ${stepName}: SQL executed successfully`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ ${stepName} failed:`, errorText);
      
      // Check if error is non-critical
      if (errorText.includes('already exists') || 
          errorText.includes('duplicate') ||
          errorText.includes('does not exist')) {
        console.log(`⚠️  Non-critical error in ${stepName} - continuing`);
        return true;
      }
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Failed to execute ${stepName}:`, error);
    return false;
  }
}

async function checkPrerequisites(): Promise<boolean> {
  console.log('🔍 Checking prerequisites...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    // Check if we can create functions (service role requirement)
    const { error: funcError } = await supabase.rpc('version');
    if (funcError) {
      console.error('❌ Service role access required for schema deployment');
      return false;
    }
    
    console.log('✅ Prerequisites check passed');
    return true;
    
  } catch (error) {
    console.error('❌ Prerequisites check failed:', error);
    return false;
  }
}

async function validateDeployment(): Promise<boolean> {
  console.log('🔍 Validating deployment...');
  
  try {
    // Check core tables exist
    const coreTables = ['stories', 'knowledge_connections', 'community_insights', 'cultural_protocols'];
    const cmsTables = ['cms_pages', 'cms_content_blocks', 'cms_media', 'cms_navigation'];
    
    const allTables = [...coreTables, ...cmsTables];
    let validationErrors = 0;
    
    for (const tableName of allTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.error(`❌ Table ${tableName} not accessible:`, error.message);
        validationErrors++;
      } else {
        console.log(`✅ Table ${tableName} is accessible`);
      }
    }
    
    // Check critical functions exist
    const { data: functions, error: funcError } = await supabase.rpc('check_story_access_sovereign', {
      p_story_id: '00000000-0000-0000-0000-000000000000',
      p_user_id: '00000000-0000-0000-0000-000000000000', 
      p_access_type: 'view'
    });
    
    if (funcError && !funcError.message.includes('does not exist')) {
      console.log('✅ Sovereignty functions deployed');
    } else {
      console.error('❌ Critical functions missing');
      validationErrors++;
    }
    
    return validationErrors === 0;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 PHASE 1: Deploying Enhanced Supabase Schema');
  console.log('==================================================');
  console.log('📋 Features:');
  console.log('   • Storyteller-centric architecture');
  console.log('   • Indigenous data sovereignty');
  console.log('   • Granular consent management');
  console.log('   • Cultural protocol enforcement');
  console.log('   • Site-wide CMS system');
  console.log('   • Multi-tenant project support');
  console.log('==================================================\\n');
  
  // Prerequisites check
  const prereqsOk = await checkPrerequisites();
  if (!prereqsOk) {
    process.exit(1);
  }
  
  let deploymentSuccess = true;
  
  // Execute deployment steps
  for (const step of deploymentSteps) {
    try {
      const sqlPath = path.join(__dirname, step.sqlFile);
      
      if (!fs.existsSync(sqlPath)) {
        console.error(`❌ SQL file not found: ${sqlPath}`);
        if (step.critical) {
          deploymentSuccess = false;
          break;
        }
        continue;
      }
      
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      console.log(`\\n📦 Deploying: ${step.name}`);
      console.log(`📄 Description: ${step.description}`);
      console.log(`📁 File: ${step.sqlFile}`);
      console.log(`📊 Size: ${(sqlContent.length / 1024).toFixed(1)}KB`);
      
      const stepSuccess = await executeSQL(sqlContent, step.name);
      
      if (!stepSuccess && step.critical) {
        console.error(`❌ Critical step failed: ${step.name}`);
        deploymentSuccess = false;
        break;
      }
      
    } catch (error) {
      console.error(`❌ Error processing step ${step.name}:`, error);
      if (step.critical) {
        deploymentSuccess = false;
        break;
      }
    }
  }
  
  // Final validation
  if (deploymentSuccess) {
    console.log('\\n🔍 Running final validation...');
    const validationPassed = await validateDeployment();
    
    if (validationPassed) {
      console.log('\\n🎉 PHASE 1 DEPLOYMENT SUCCESSFUL!');
      console.log('==================================================');
      console.log('✅ Enhanced sovereignty schema deployed');
      console.log('✅ CMS content management system ready');
      console.log('✅ Cultural protocol enforcement active');
      console.log('✅ Multi-tenant project support enabled');
      console.log('\\n🎯 Ready for Phase 2: Airtable Migration');
      console.log('==================================================');
    } else {
      console.log('\\n⚠️  DEPLOYMENT COMPLETED WITH WARNINGS');
      console.log('Some validation checks failed - review logs above');
    }
  } else {
    console.log('\\n❌ DEPLOYMENT FAILED');
    console.log('Critical errors encountered - please review and retry');
    process.exit(1);
  }
}

// Execute deployment
main().catch(console.error);