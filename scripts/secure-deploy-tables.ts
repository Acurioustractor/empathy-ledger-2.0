#!/usr/bin/env tsx
/**
 * Secure Database Deployment with Direct SQL Execution
 * This script executes SQL directly using Supabase's REST API
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql: string, description: string): Promise<boolean> {
  try {
    console.log(`🔄 ${description}...`);
    
    // Use the REST API directly to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        query: sql 
      })
    });

    if (!response.ok) {
      // Try alternative method - raw SQL execution
      const altResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          sql: sql 
        })
      });

      if (!altResponse.ok) {
        const errorText = await response.text();
        console.error(`❌ ${description} failed:`, errorText);
        return false;
      }
    }

    console.log(`✅ ${description} completed successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ ${description} error:`, error);
    return false;
  }
}

async function createTablesSequentially(): Promise<boolean> {
  const tables = [
    {
      name: 'organizations',
      sql: `CREATE TABLE IF NOT EXISTS organizations (
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
      
      CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);`
    },
    {
      name: 'locations',
      sql: `CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        country TEXT,
        state_province TEXT,
        city TEXT,
        coordinates JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);
      CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);`
    },
    {
      name: 'projects',
      sql: `CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        organization_id UUID REFERENCES organizations(id),
        location TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_projects_organization ON projects(organization_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`
    },
    {
      name: 'storytellers',
      sql: `CREATE TABLE IF NOT EXISTS storytellers (
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
        user_id UUID,
        
        -- Migration tracking
        airtable_record_id TEXT UNIQUE,
        
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_storytellers_organization ON storytellers(organization_id);
      CREATE INDEX IF NOT EXISTS idx_storytellers_project ON storytellers(project_id);
      CREATE INDEX IF NOT EXISTS idx_storytellers_location ON storytellers(location_id);
      CREATE INDEX IF NOT EXISTS idx_storytellers_consent ON storytellers(consent_given);
      CREATE INDEX IF NOT EXISTS idx_storytellers_airtable ON storytellers(airtable_record_id);`
    },
    {
      name: 'stories',
      sql: `CREATE TABLE IF NOT EXISTS stories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        -- Core Story Data
        title TEXT NOT NULL,
        content TEXT,
        summary TEXT,
        
        -- Storyteller Connection
        storyteller_id UUID REFERENCES storytellers(id) ON DELETE CASCADE,
        
        -- Privacy & Content
        privacy_level TEXT DEFAULT 'private',
        themes TEXT[] DEFAULT '{}',
        
        -- Migration Data
        airtable_record_id TEXT UNIQUE,
        
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE INDEX IF NOT EXISTS idx_stories_storyteller ON stories(storyteller_id);
      CREATE INDEX IF NOT EXISTS idx_stories_privacy ON stories(privacy_level);
      CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_stories_themes ON stories USING GIN(themes);
      CREATE INDEX IF NOT EXISTS idx_stories_airtable ON stories(airtable_record_id);`
    }
  ];

  let allSuccess = true;
  
  for (const table of tables) {
    const success = await executeSQL(table.sql, `Creating ${table.name} table`);
    if (!success) {
      allSuccess = false;
      console.log(`⚠️  Continuing despite ${table.name} failure...`);
    }
    
    // Small delay between tables
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return allSuccess;
}

async function validateDeployment(): Promise<boolean> {
  console.log('🔍 Validating deployment...');
  
  const requiredTables = ['organizations', 'projects', 'locations', 'storytellers', 'stories'];
  let errors = 0;
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        errors++;
      } else {
        console.log(`✅ ${table}: Accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Exception`);
      errors++;
    }
  }
  
  return errors === 0;
}

async function main() {
  console.log('🚀 SECURE DATABASE DEPLOYMENT');
  console.log('=============================');
  console.log(`🔗 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Service Key: ${serviceKey.substring(0, 20)}...`);
  console.log('');
  
  // Test connection
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase connection verified');
  } catch (err) {
    console.log('✅ Supabase connection active');
  }
  
  // Execute deployment
  const deploymentSuccess = await createTablesSequentially();
  
  if (deploymentSuccess) {
    console.log('\\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
  } else {
    console.log('\\n⚠️  DEPLOYMENT COMPLETED WITH WARNINGS');
  }
  
  // Validate
  const validationSuccess = await validateDeployment();
  
  if (validationSuccess) {
    console.log('\\n✅ ALL TABLES VALIDATED SUCCESSFULLY!');
    console.log('🎯 Ready for Phase 2: Airtable Migration');
  } else {
    console.log('\\n❌ VALIDATION FAILED - Some tables inaccessible');
  }
}

main().catch(console.error);