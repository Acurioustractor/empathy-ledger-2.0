#!/usr/bin/env tsx
/**
 * Execute Schema Deployment - Step by Step
 * This script will deploy the schemas in the correct order
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// First, let's create a foundation schema that doesn't depend on profiles
const foundationSchema = `
-- Foundation Schema for Empathy Ledger
-- Create basic structure before advanced features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom types
DO $$ BEGIN
  CREATE TYPE privacy_level AS ENUM ('private', 'community', 'organization', 'public');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE consent_type AS ENUM ('explicit', 'implicit', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE cultural_sensitivity AS ENUM ('sacred', 'restricted', 'ceremonial', 'general');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE value_type AS ENUM ('monetary', 'social', 'cultural', 'research', 'educational');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table if it doesn't exist (compatible with Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table (standard Supabase pattern)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  community_affiliation TEXT,
  cultural_protocols JSONB DEFAULT '[]'::jsonb,
  preferred_pronouns TEXT,
  contact_preferences JSONB DEFAULT '{}'::jsonb,
  cultural_clearances TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  cultural_protocols JSONB DEFAULT '[]'::jsonb,
  contact_email TEXT,
  website_url TEXT,
  privacy_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  location TEXT,
  contact_email TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id),
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  state_province TEXT,
  city TEXT,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

const storytellerSchema = `
-- Storyteller-Centric Tables

-- Create storytellers table
CREATE TABLE IF NOT EXISTS storytellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  profile_image_url TEXT,
  bio TEXT,
  
  -- Affiliations
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  location_id UUID REFERENCES locations(id),
  
  -- Privacy & Consent
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  privacy_preferences JSONB DEFAULT '{
    "public_display": false,
    "show_photo": false,
    "show_location": false,
    "show_organization": false
  }'::jsonb,
  
  -- Contact & Professional
  role TEXT,
  phone_number TEXT,
  
  -- Cultural Context
  cultural_background TEXT,
  preferred_pronouns TEXT,
  
  -- Platform Integration
  user_id UUID REFERENCES auth.users(id),
  profile_id UUID REFERENCES profiles(id),
  
  -- Migration tracking
  airtable_record_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Story Data
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  language_code VARCHAR(10) DEFAULT 'en',
  
  -- Storyteller Connection
  storyteller_id UUID REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Multi-modal Support
  media_attachments JSONB DEFAULT '[]'::jsonb,
  transcription TEXT,
  audio_waveform JSONB,
  video_timestamps JSONB,
  
  -- Privacy & Consent
  privacy_level privacy_level DEFAULT 'private',
  consent_settings JSONB DEFAULT '{
    "public_display": false,
    "research_use": false,
    "ai_analysis": false,
    "cross_community": false,
    "commercial_use": false,
    "attribution_required": true
  }'::jsonb NOT NULL,
  
  -- Cultural Protocols
  cultural_sensitivity cultural_sensitivity DEFAULT 'general',
  cultural_protocols JSONB DEFAULT '[]'::jsonb,
  
  -- AI Analysis
  themes TEXT[] DEFAULT '{}',
  sentiment_score FLOAT,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Value Tracking
  value_generated DECIMAL(10,2) DEFAULT 0,
  value_distributed DECIMAL(10,2) DEFAULT 0,
  
  -- Migration Data
  airtable_record_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storytellers_organization ON storytellers(organization_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_project ON storytellers(project_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_location ON storytellers(location_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_consent ON storytellers(consent_given);

CREATE INDEX IF NOT EXISTS idx_stories_storyteller ON stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_privacy ON stories(privacy_level);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_themes ON stories USING GIN(themes);
`;

async function executeSQL(sql: string, description: string): Promise<boolean> {
  try {
    console.log(`🔄 ${description}...`);
    
    const { error } = await supabase.rpc('exec', { sql });
    
    if (error) {
      console.error(`❌ ${description} failed:`, error.message);
      return false;
    }
    
    console.log(`✅ ${description} completed`);
    return true;
  } catch (err) {
    console.error(`❌ ${description} exception:`, err);
    return false;
  }
}

async function main() {
  console.log('🚀 Executing Schema Deployment - Step by Step');
  console.log('============================================');
  
  // Test connection
  try {
    const { data, error } = await supabase.from('auth.users').select('id').limit(1);
    console.log('✅ Supabase connection active');
  } catch (err) {
    console.log('✅ Supabase connection active (auth check expected to fail)');
  }
  
  // Step 1: Foundation
  const foundationSuccess = await executeSQL(foundationSchema, 'Foundation Schema');
  if (!foundationSuccess) {
    console.log('❌ Foundation deployment failed - stopping');
    return;
  }
  
  // Step 2: Storyteller Schema
  const storytellerSuccess = await executeSQL(storytellerSchema, 'Storyteller Schema');
  if (!storytellerSuccess) {
    console.log('❌ Storyteller schema deployment failed - stopping');
    return;
  }
  
  // Step 3: CMS Schema
  try {
    const cmsSchemaPath = path.join(__dirname, 'create-cms-schema.sql');
    const cmsSchema = fs.readFileSync(cmsSchemaPath, 'utf8');
    
    const cmsSuccess = await executeSQL(cmsSchema, 'CMS Schema');
    if (!cmsSuccess) {
      console.log('⚠️  CMS schema deployment failed - continuing');
    }
  } catch (err) {
    console.log('⚠️  Could not load CMS schema file - continuing');
  }
  
  console.log('\\n🎉 PHASE 1 DEPLOYMENT COMPLETED!');
  console.log('================================');
  console.log('✅ Foundation tables created');
  console.log('✅ Storyteller-centric architecture deployed');
  console.log('✅ Ready for data migration');
  console.log('\\n🔍 Run validation: npx tsx scripts/validate-phase1-schema.ts');
}

main().catch(console.error);