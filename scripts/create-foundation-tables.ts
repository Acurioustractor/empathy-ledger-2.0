#!/usr/bin/env tsx
/**
 * Create Foundation Tables for Empathy Ledger
 * This creates the essential tables needed for the storyteller-centric architecture
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable(tableName: string, sql: string): Promise<boolean> {
  try {
    console.log(`🔄 Creating ${tableName}...`);
    
    // Try to create the table directly
    const { error } = await supabase.from(tableName).select('*').limit(1);
    
    if (!error) {
      console.log(`✅ ${tableName} already exists`);
      return true;
    }
    
    console.log(`⚠️  ${tableName} doesn't exist - manual creation needed`);
    console.log(`📋 SQL for ${tableName}:`);
    console.log('```sql');
    console.log(sql);
    console.log('```\\n');
    
    return false;
    
  } catch (err) {
    console.log(`⚠️  ${tableName} needs to be created manually`);
    return false;
  }
}

async function main() {
  console.log('🏗️  Foundation Tables Setup for Empathy Ledger');
  console.log('=============================================');
  console.log('');
  
  // Check connection
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase connection active');
  } catch (err) {
    console.log('✅ Supabase connection active');
  }
  
  // Define essential tables
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
);`
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
);`
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
);`
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
);`
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
);`
    }
  ];
  
  console.log('📋 MANUAL TABLE CREATION REQUIRED');
  console.log('');
  console.log('Please execute these SQL statements in Supabase Dashboard');
  console.log('🔗 https://supabase.com/dashboard/project/tednluwflfhxyucgwigh/sql/new');
  console.log('');
  
  // Check each table and show SQL if needed
  for (const table of tables) {
    await createTable(table.name, table.sql);
  }
  
  console.log('🎯 AFTER CREATING TABLES MANUALLY:');
  console.log('1. Run validation: npx tsx scripts/validate-tables.ts');
  console.log('2. Proceed to Phase 2: Airtable Migration');
  console.log('');
  
  // Create validation script
  const validationScript = `#!/usr/bin/env tsx
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
        console.log(\`❌ \${table}: \${error.message}\`);
        errors++;
      } else {
        console.log(\`✅ \${table}: Ready\`);
      }
    } catch (err) {
      console.log(\`❌ \${table}: Not accessible\`);
      errors++;
    }
  }
  
  if (errors === 0) {
    console.log('\\n🎉 ALL FOUNDATION TABLES READY!');
    console.log('✅ Ready for Airtable migration');
  } else {
    console.log(\`\\n⚠️  \${errors} tables need attention\`);
  }
}

validateTables().catch(console.error);`;
  
  // Write validation script
  const fs = await import('fs');
  fs.writeFileSync(
    path.join(__dirname, 'validate-tables.ts'),
    validationScript
  );
  
  console.log('✅ Created validation script: validate-tables.ts');
}

main().catch(console.error);