/**
 * DEPLOY TRANSCRIPT-STORY ARCHITECTURE
 * 
 * Safely deploy the world-class transcript and story table architecture
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deployArchitecture() {
  console.log('🏗️  DEPLOYING WORLD-CLASS TRANSCRIPT-STORY ARCHITECTURE');
  console.log('Creating tables for transcript → AI analysis → story flow\n');

  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'scripts/sql/world-class-transcript-story-architecture.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');

    console.log('📋 SQL file loaded successfully');
    console.log(`📊 File size: ${Math.round(sqlContent.length / 1024)}KB\n`);

    // Split into individual statements (careful with complex statements)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .filter(stmt => !stmt.match(/^(SELECT|COMMENT)/i)); // Filter out comments and SELECT statements

    console.log(`🔄 Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const [index, statement] of statements.entries()) {
      try {
        // Skip empty statements and comments
        if (!statement.trim() || statement.trim().startsWith('--')) {
          continue;
        }

        console.log(`📝 Statement ${index + 1}/${statements.length}:`);
        
        // Show first line of statement for context
        const firstLine = statement.split('\n')[0].substring(0, 80);
        console.log(`   ${firstLine}${statement.length > 80 ? '...' : ''}`);

        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Check if it's a "already exists" error (which is okay)
          if (error.message.includes('already exists') || 
              error.message.includes('already defined') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`   ↩️  Already exists (skipping)`);
            successCount++;
          } else {
            console.log(`   ❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }

        // Progress indicator
        if ((index + 1) % 5 === 0) {
          console.log(`\n📊 Progress: ${index + 1}/${statements.length} statements processed\n`);
        }

      } catch (error) {
        console.log(`   ❌ Exception: ${error}`);
        errorCount++;
      }
    }

    console.log('\n📊 DEPLOYMENT RESULTS:');
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errorCount}`);
    console.log(`   📋 Total processed: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 ARCHITECTURE DEPLOYED SUCCESSFULLY!');
    } else if (successCount > errorCount) {
      console.log('\n⚠️  MOSTLY SUCCESSFUL with some errors');
    } else {
      console.log('\n💥 DEPLOYMENT HAD SIGNIFICANT ISSUES');
    }

    // Verify key tables exist
    console.log('\n🔍 VERIFYING TABLE CREATION...');
    await verifyTables();

  } catch (error) {
    console.error('\n💥 DEPLOYMENT FAILED:', error);
    throw error;
  }
}

async function verifyTables() {
  const tablesToCheck = [
    'transcripts',
    'ai_analysis_results', 
    'story_creation_workflow',
    'story_transcript_connections'
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`   ✅ ${tableName}: Table exists (${data?.length || 0} records)`);
      }
    } catch (error) {
      console.log(`   ❌ ${tableName}: Verification failed`);
    }
  }

  // Check if stories table was enhanced
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('transcript_id, story_format', { head: true, limit: 1 });

    if (error) {
      console.log(`   ⚠️  stories enhancement: ${error.message}`);
    } else {
      console.log(`   ✅ stories: Enhanced with transcript relationships`);
    }
  } catch (error) {
    console.log(`   ⚠️  stories enhancement verification failed`);
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. ✅ Extract transcripts from existing storyteller data');
  console.log('2. ✅ Set up AI analysis workflow for transcripts');
  console.log('3. ✅ Create story creation workflow');
  console.log('4. ✅ Test full transcript → analysis → story flow');
}

// Execute deployment
deployArchitecture()
  .then(() => {
    console.log('\n✅ Deployment completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Deployment failed:', error);
    process.exit(1);
  });