#!/usr/bin/env node

/**
 * Database Setup Script
 * Sets up the database for development, testing, or production
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config({ path: '.env.local' });
}

async function setupDatabase() {
  console.log(
    `🗄️  Setting up database for ${process.env.NODE_ENV || 'development'} environment...`
  );

  // Skip Supabase setup for test environment (using local PostgreSQL)
  if (process.env.NODE_ENV === 'test') {
    console.log('🧪 Test environment detected - skipping Supabase setup');
    console.log('✅ Using local PostgreSQL for testing');
    console.log('💡 Run "npm run db:migrate:test" to apply schema migrations');
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.log(
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
    process.exit(1);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection
    const { error } = await supabase.from('ping').select('*').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = table doesn't exist, which is fine
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Database connection successful');
    console.log('💡 Run "npm run db:migrate" to apply schema migrations');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
