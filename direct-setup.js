/**
 * Direct Database Setup using Supabase API
 * No more scripts - just set up the database properly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function setupDatabase() {
  console.log('🚀 Setting up Empathy Ledger database directly...');

  try {
    // 1. Create custom types
    console.log('📝 Creating custom types...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TYPE IF NOT EXISTS story_category AS ENUM (
          'healthcare', 'education', 'housing', 'youth', 'elder_care',
          'policy', 'community', 'environment', 'employment', 'social_services'
        );
        
        CREATE TYPE IF NOT EXISTS privacy_level AS ENUM ('public', 'community', 'organization', 'private');
        CREATE TYPE IF NOT EXISTS story_status AS ENUM ('draft', 'pending', 'approved', 'featured', 'archived');
        CREATE TYPE IF NOT EXISTS user_role AS ENUM ('storyteller', 'organization_admin', 'community_moderator', 'platform_admin', 'researcher');
      `,
    });

    // 2. Create profiles table
    console.log('👤 Creating profiles table...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          display_name TEXT,
          bio TEXT,
          avatar_url TEXT,
          age_range TEXT,
          location_general TEXT,
          role user_role DEFAULT 'storyteller',
          privacy_settings JSONB DEFAULT '{}',
          notification_preferences JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          last_active_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      `,
    });

    // 3. Create organizations table
    console.log('🏢 Creating organizations table...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          website TEXT,
          contact_email TEXT,
          logo_url TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
      `,
    });

    // 4. Create communities table
    console.log('🏘️ Creating communities table...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS communities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          description TEXT,
          privacy_level privacy_level DEFAULT 'public',
          membership_type TEXT DEFAULT 'open',
          member_count INTEGER DEFAULT 0,
          story_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(organization_id, slug)
        );
        
        ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
      `,
    });

    // 5. Drop and recreate stories table with proper structure
    console.log('📚 Setting up stories table...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        DROP TABLE IF EXISTS stories CASCADE;
        
        CREATE TABLE stories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category story_category NOT NULL,
          themes TEXT[] DEFAULT '{}',
          tags TEXT[] DEFAULT '{}',
          privacy_level privacy_level DEFAULT 'private',
          can_be_shared BOOLEAN DEFAULT FALSE,
          allow_research_use BOOLEAN DEFAULT FALSE,
          allow_ai_analysis BOOLEAN DEFAULT FALSE,
          contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
          image_urls TEXT[] DEFAULT '{}',
          audio_url TEXT,
          video_url TEXT,
          transcription TEXT,
          view_count INTEGER DEFAULT 0,
          share_count INTEGER DEFAULT 0,
          comment_count INTEGER DEFAULT 0,
          reaction_count INTEGER DEFAULT 0,
          impact_score FLOAT DEFAULT 0,
          cited_in_reports INTEGER DEFAULT 0,
          status story_status DEFAULT 'draft',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          sentiment_score FLOAT,
          emotion_scores JSONB DEFAULT '{}'
        );
        
        ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
      `,
    });

    // 6. Create community_members table
    console.log('👥 Creating community members table...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS community_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'member',
          joined_at TIMESTAMPTZ DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE,
          UNIQUE(community_id, user_id)
        );
        
        ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
      `,
    });

    // 7. Create security policies
    console.log('🔒 Setting up security policies...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        -- Profiles policies
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
          FOR ALL USING (auth.uid() = id);
        
        CREATE POLICY IF NOT EXISTS "Users can view public profile info" ON profiles
          FOR SELECT USING (true);
        
        -- Organizations policies
        CREATE POLICY IF NOT EXISTS "Organizations are viewable by all" ON organizations
          FOR SELECT USING (is_active = true);
        
        -- Communities policies  
        CREATE POLICY IF NOT EXISTS "Public communities are viewable" ON communities
          FOR SELECT USING (privacy_level = 'public' AND is_active = true);
        
        -- Stories policies
        CREATE POLICY IF NOT EXISTS "Users can manage own stories" ON stories
          FOR ALL USING (auth.uid() = contributor_id);
        
        CREATE POLICY IF NOT EXISTS "Public stories are viewable" ON stories
          FOR SELECT USING (privacy_level = 'public' AND status = 'approved');
        
        -- Community members policies
        CREATE POLICY IF NOT EXISTS "Users can view their memberships" ON community_members
          FOR ALL USING (auth.uid() = user_id);
      `,
    });

    // 8. Create profile management function
    console.log('⚙️ Setting up profile management...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, display_name)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
          )
          ON CONFLICT (id) DO NOTHING;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `,
    });

    // 9. Create indexes
    console.log('📊 Creating performance indexes...');
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_stories_contributor ON stories(contributor_id);
        CREATE INDEX IF NOT EXISTS idx_stories_community ON stories(community_id);
        CREATE INDEX IF NOT EXISTS idx_stories_privacy_status ON stories(privacy_level, status);
        CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
        CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at);
        CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
      `,
    });

    console.log('✅ Database setup completed successfully!');

    // 10. Create test data
    console.log('🧪 Creating test data...');
    await createTestData();

    // 11. Verify setup
    await verifySetup();
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

async function createTestData() {
  // Create test organization
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      name: 'Melbourne Community Network',
      slug: 'melbourne-community',
      description:
        'Supporting diverse communities across Melbourne through storytelling and advocacy',
      website: 'https://melbournecommunity.org.au',
      contact_email: 'stories@melbournecommunity.org.au',
    })
    .select()
    .single();

  if (org) {
    // Create test community
    await supabase.from('communities').insert({
      organization_id: org.id,
      name: 'Inner Melbourne Families',
      slug: 'inner-melbourne-families',
      description:
        'A safe space for families in inner Melbourne to share experiences and support each other',
      privacy_level: 'public',
      membership_type: 'open',
    });

    console.log('✅ Test organization and community created');
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying database setup...');

  const tables = [
    'profiles',
    'organizations',
    'communities',
    'stories',
    'community_members',
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Ready (${count || 0} records)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log(
    '\n🎉 Database is ready for Sarah Thompson user journey testing!'
  );
  console.log('\nNext steps:');
  console.log('1. Go to http://localhost:3003');
  console.log('2. Sign up as sarah.thompson.test@gmail.com');
  console.log('3. Submit the test story from the walkthrough');
  console.log('4. Test privacy controls and analytics');
}

setupDatabase().catch(console.error);
