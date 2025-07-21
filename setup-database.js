/**
 * Database Setup Script for Empathy Ledger
 * Executes all necessary SQL to create the complete database schema
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function readSQLFile(filename) {
  const filePath = path.join('supabase', filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Failed to read ${filename}:`, error.message);
    return null;
  }
}

async function executeSQLFile(filename, description) {
  console.log(`\n📝 Setting up ${description}...`);

  const sql = await readSQLFile(filename);
  if (!sql) {
    console.log(`⏭️  Skipping ${filename} (file not found)`);
    return false;
  }

  try {
    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim().length === 0) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement,
        });
        if (error) {
          // Try direct execution for DDL statements
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
            body: JSON.stringify({ sql_query: statement }),
          });

          if (!response.ok) {
            console.log(
              `⚠️  Statement might need manual execution: ${statement.substring(0, 50)}...`
            );
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Error in statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log(
      `✅ ${description} completed: ${successCount} successful, ${errorCount} need manual review`
    );
    return true;
  } catch (error) {
    console.error(`❌ Failed to execute ${filename}:`, error.message);
    return false;
  }
}

async function createBasicTables() {
  console.log('\n🔧 Creating essential tables manually...');

  const basicSQL = `
    -- Enable Row Level Security
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
    
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      full_name TEXT,
      bio TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'storyteller',
      privacy_settings JSONB DEFAULT '{}',
      notification_preferences JSONB DEFAULT '{}',
      location_general TEXT,
      age_range TEXT,
      is_active BOOLEAN DEFAULT true,
      deletion_requested_at TIMESTAMPTZ,
      anonymized_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_active_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create organizations table
    CREATE TABLE IF NOT EXISTS public.organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      website TEXT,
      contact_email TEXT,
      logo_url TEXT,
      banner_url TEXT,
      settings JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
    
    -- Create communities table
    CREATE TABLE IF NOT EXISTS public.communities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      privacy_level TEXT DEFAULT 'public',
      membership_type TEXT DEFAULT 'open',
      banner_url TEXT,
      settings JSONB DEFAULT '{}',
      member_count INTEGER DEFAULT 0,
      story_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(organization_id, slug)
    );
    
    ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
    
    -- Create stories table
    CREATE TABLE IF NOT EXISTS public.stories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      themes TEXT[] DEFAULT '{}',
      tags TEXT[] DEFAULT '{}',
      privacy_level TEXT DEFAULT 'private',
      can_be_shared BOOLEAN DEFAULT false,
      allow_research_use BOOLEAN DEFAULT false,
      allow_ai_analysis BOOLEAN DEFAULT false,
      contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
      image_urls TEXT[] DEFAULT '{}',
      audio_url TEXT,
      video_url TEXT,
      transcription TEXT,
      transcription_confidence FLOAT,
      view_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      reaction_count INTEGER DEFAULT 0,
      impact_score FLOAT DEFAULT 0,
      cited_in_reports INTEGER DEFAULT 0,
      policy_influence_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      flagged_content BOOLEAN DEFAULT false,
      moderation_notes TEXT,
      reviewed_by UUID REFERENCES public.profiles(id),
      reviewed_at TIMESTAMPTZ,
      featured_until TIMESTAMPTZ,
      anonymized_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      sentiment_score FLOAT,
      emotion_scores JSONB DEFAULT '{}'
    );
    
    ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: basicSQL });
    if (error) {
      console.log('⚠️  Basic table creation needs manual setup');
      console.log(
        'Please go to SQL Editor in Supabase and run the schema.sql file'
      );
      return false;
    }
    console.log('✅ Essential tables created successfully');
    return true;
  } catch (err) {
    console.log('⚠️  Manual schema setup required');
    return false;
  }
}

async function testSetup() {
  console.log('\n🧪 Testing database setup...');

  const tables = ['profiles', 'organizations', 'communities', 'stories'];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      results[table] = error ? `❌ ${error.message}` : '✅ Ready';
    } catch (err) {
      results[table] = `❌ ${err.message}`;
    }
  }

  console.log('\nTable Status:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`  ${table}: ${status}`);
  });

  return results;
}

async function main() {
  console.log('🚀 EMPATHY LEDGER DATABASE SETUP');
  console.log('='.repeat(50));
  console.log(`📍 Project: ${supabaseUrl}`);

  // First, try to create basic tables
  const basicSuccess = await createBasicTables();

  if (!basicSuccess) {
    console.log('\n📋 MANUAL SETUP REQUIRED');
    console.log('='.repeat(30));
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Open your Empathy Ledger project');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Copy and paste the contents of supabase/schema.sql');
    console.log('5. Run the query');
    console.log('6. Then run this script again');
    return;
  }

  // Test the setup
  const testResults = await testSetup();

  const allTablesReady = Object.values(testResults).every(status =>
    status.includes('✅')
  );

  if (allTablesReady) {
    console.log('\n🎉 DATABASE SETUP COMPLETE!');
    console.log('✅ Ready for user journey testing');
    console.log('\nNext steps:');
    console.log('1. Create test organization and community');
    console.log('2. Test Sarah Thompson user journey');
    console.log('3. Verify privacy controls');
  } else {
    console.log('\n⚠️  Setup partially complete');
    console.log('Some manual configuration may be needed');
  }
}

main().catch(console.error);
