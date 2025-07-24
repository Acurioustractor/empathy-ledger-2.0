#!/usr/bin/env tsx
/**
 * Secure Environment Loader for Empathy Ledger
 * Use this instead of directly loading .env.local
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export function loadSecureEnv() {
  // Try secure env first, then fallback to local
  const secureEnvPath = path.join(process.cwd(), '.env.secure');
  const localEnvPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(secureEnvPath)) {
    console.log('🔐 Loading secure environment configuration');
    dotenv.config({ path: secureEnvPath });
  } else if (fs.existsSync(localEnvPath)) {
    console.log('⚠️  Loading local environment (consider using .env.secure)');
    dotenv.config({ path: localEnvPath });
  } else {
    console.error('❌ No environment configuration found');
    process.exit(1);
  }
}

export function validateRequiredEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return false;
  }
  
  return true;
}

// Auto-load when imported
loadSecureEnv();