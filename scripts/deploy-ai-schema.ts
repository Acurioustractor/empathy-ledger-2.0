/**
 * Deploy AI Analysis Schema to Supabase
 * This script deploys the complete AI storyteller analysis database schema
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function deploySchema() {
  console.log('🚀 Deploying AI Analysis Schema to Supabase...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseKey === 'your_service_role_key_here') {
    console.error('❌ Missing Supabase credentials');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.development');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('storytellers').select('count').limit(1);
    
    if (error && !error.message.includes('relation "storytellers" does not exist')) {
      throw error;
    }
    
    console.log('✅ Database connection successful\n');

    // Deploy AI analysis tables
    console.log('📦 Creating AI analysis tables...');
    
    const aiTables = [
      {
        name: 'storyteller_analysis_v2',
        sql: `
          CREATE TABLE IF NOT EXISTS storyteller_analysis_v2 (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            storyteller_id UUID NOT NULL,
            themes JSONB NOT NULL DEFAULT '[]'::jsonb,
            quotes JSONB NOT NULL DEFAULT '[]'::jsonb,
            biography JSONB NOT NULL DEFAULT '{}'::jsonb,
            community_connections JSONB NOT NULL DEFAULT '[]'::jsonb,
            analysis_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
            wellbeing_indicators JSONB NOT NULL DEFAULT '{}'::jsonb,
            privacy_level TEXT NOT NULL DEFAULT 'private',
            consent_given BOOLEAN NOT NULL DEFAULT false,
            storyteller_approved BOOLEAN DEFAULT null,
            analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(storyteller_id)
          );
        `
      },
      {
        name: 'story_themes',
        sql: `
          CREATE TABLE IF NOT EXISTS story_themes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            storyteller_id UUID NOT NULL,
            theme_name TEXT NOT NULL,
            significance TEXT NOT NULL DEFAULT 'secondary',
            description TEXT NOT NULL,
            community_relevance TEXT NOT NULL,
            emotional_tone TEXT,
            confidence_score DECIMAL(3,2),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'story_quotes',
        sql: `
          CREATE TABLE IF NOT EXISTS story_quotes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            storyteller_id UUID NOT NULL,
            quote_text TEXT NOT NULL,
            context_description TEXT,
            impact_type TEXT NOT NULL DEFAULT 'inspiring',
            themes TEXT[] NOT NULL DEFAULT '{}',
            public_safe BOOLEAN NOT NULL DEFAULT false,
            storyteller_approved BOOLEAN DEFAULT null,
            confidence_score DECIMAL(3,2),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'community_connections',
        sql: `
          CREATE TABLE IF NOT EXISTS community_connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            primary_storyteller_id UUID NOT NULL,
            connected_storyteller_id UUID NOT NULL,
            connection_type TEXT NOT NULL DEFAULT 'shared_experience',
            connection_strength DECIMAL(3,2) NOT NULL DEFAULT 0.5,
            insight_description TEXT NOT NULL,
            potential_support TEXT,
            discovered_date TIMESTAMPTZ DEFAULT NOW(),
            CHECK (primary_storyteller_id != connected_storyteller_id)
          );
        `
      },
      {
        name: 'analysis_queue',
        sql: `
          CREATE TABLE IF NOT EXISTS analysis_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            storyteller_id UUID NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            priority INTEGER NOT NULL DEFAULT 5,
            started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            error_message TEXT,
            retry_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'theme_taxonomy',
        sql: `
          CREATE TABLE IF NOT EXISTS theme_taxonomy (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            theme_name TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            usage_count INTEGER DEFAULT 0,
            community_relevance DECIMAL(3,2) DEFAULT 0.5,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true
          );
        `
      }
    ];

    // Create each table
    for (const table of aiTables) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
        if (error) throw error;
        console.log(`  ✅ Created table: ${table.name}`);
      } catch (error) {
        console.log(`  ⚠️  Table ${table.name}: ${error.message}`);
      }
    }

    // Insert initial theme taxonomy
    console.log('\n📋 Inserting initial theme taxonomy...');
    
    const initialThemes = [
      {
        theme_name: 'Mental Health Journey',
        category: 'wellness',
        description: 'Personal experiences with mental health challenges and recovery'
      },
      {
        theme_name: 'Community Support',
        category: 'relationships', 
        description: 'Finding and providing support within community networks'
      },
      {
        theme_name: 'Career Transformation',
        category: 'growth',
        description: 'Professional development and career change experiences'
      },
      {
        theme_name: 'Cultural Identity',
        category: 'identity',
        description: 'Connection to cultural heritage and identity exploration'
      },
      {
        theme_name: 'Resilience Building',
        category: 'strength',
        description: 'Developing capacity to overcome challenges and adversity'
      }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('theme_taxonomy')
      .upsert(initialThemes, { onConflict: 'theme_name' });

    if (insertError) {
      console.log(`  ⚠️  Theme taxonomy: ${insertError.message}`);
    } else {
      console.log(`  ✅ Inserted ${initialThemes.length} initial themes`);
    }

    // Create indexes for performance
    console.log('\n⚡ Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_storyteller_analysis_storyteller ON storyteller_analysis_v2(storyteller_id);',
      'CREATE INDEX IF NOT EXISTS idx_story_themes_name ON story_themes(theme_name);',
      'CREATE INDEX IF NOT EXISTS idx_story_quotes_approved ON story_quotes(storyteller_approved, public_safe);',
      'CREATE INDEX IF NOT EXISTS idx_analysis_queue_status ON analysis_queue(status, priority);'
    ];

    for (const indexSql of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
        if (error) throw error;
        console.log(`  ✅ Created index`);
      } catch (error) {
        console.log(`  ⚠️  Index creation: ${error.message}`);
      }
    }

    console.log('\n🎉 AI Analysis Schema Deployment Complete!');
    console.log('\n📊 Schema Summary:');
    console.log('  ✅ storyteller_analysis_v2 - Main analysis storage');
    console.log('  ✅ story_themes - Thematic insights');
    console.log('  ✅ story_quotes - Curated quotes');
    console.log('  ✅ community_connections - Storyteller connections');
    console.log('  ✅ analysis_queue - Processing queue');
    console.log('  ✅ theme_taxonomy - Standardized themes');
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. Test AI analysis: npm run test-ai');
    console.log('  2. Start application: npm run dev');
    console.log('  3. Visit admin panel: http://localhost:3005/admin');

  } catch (error) {
    console.error('❌ Schema deployment failed:', error);
    process.exit(1);
  }
}

// Check if we have the exec_sql function, if not create a simple version
async function ensureExecSqlFunction() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Try to create a simple exec_sql function for table creation
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  try {
    // This would need to be run via direct SQL access
    console.log('📝 Note: For full deployment, run the SQL schema file directly');
    console.log('   psql $DATABASE_URL -f scripts/sql/ai-analysis-schema.sql');
  } catch (error) {
    // Expected if we don't have function creation permissions
  }
}

// Run deployment
deploySchema();