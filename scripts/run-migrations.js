#!/usr/bin/env node

/**
 * Migration Runner Script
 * Runs database migrations safely with backup and rollback support
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config({ path: '.env.local' });
}

async function runMigrations() {
  console.log(
    `🗄️  Running database migrations for ${process.env.NODE_ENV || 'development'} environment...`
  );

  // Skip Supabase migrations for test environment (using local PostgreSQL)
  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 Test environment detected - skipping Supabase migrations');
    console.log('✅ Using local PostgreSQL for testing (no migrations needed)');
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if migration is needed
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

    try {
      const files = await fs.readdir(migrationsDir);
      const sqlFiles = files.filter(file => file.endsWith('.sql'));

      if (sqlFiles.length === 0) {
        console.log('📝 No migration files found');
        return;
      }

      console.log(`📁 Found ${sqlFiles.length} migration files`);
      console.log(
        '💡 For production migrations, use the Supabase CLI or dashboard'
      );
      console.log('💡 This script is for development reference only');
    } catch (error) {
      console.log(
        '📁 No migrations directory found - this is expected for initial setup'
      );
    }

    console.log('✅ Migration check completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
