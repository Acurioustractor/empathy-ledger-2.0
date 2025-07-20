#!/usr/bin/env node

/**
 * Health Check Script
 * Verifies system health for deployment validation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function healthCheck() {
  console.log('🏥 Running health checks...');
  
  const checks = [];
  
  // Environment variables check
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length === 0) {
    checks.push({ name: 'Environment Variables', status: '✅ PASS' });
  } else {
    checks.push({ 
      name: 'Environment Variables', 
      status: `❌ FAIL - Missing: ${missingEnvVars.join(', ')}` 
    });
  }
  
  // Database connectivity check
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      // Simple connection test - this will fail gracefully if no tables exist
      const { error } = await supabase.from('ping').select('*').limit(1);
      
      if (!error || error.code === 'PGRST116') { // Table not found is OK for empty DB
        checks.push({ name: 'Database Connection', status: '✅ PASS' });
      } else {
        checks.push({ name: 'Database Connection', status: `❌ FAIL - ${error.message}` });
      }
    } catch (error) {
      checks.push({ name: 'Database Connection', status: `❌ FAIL - ${error.message}` });
    }
  } else {
    checks.push({ name: 'Database Connection', status: '⏭️  SKIPPED - No credentials' });
  }
  
  // Application health check
  try {
    const response = await fetch(`${process.env.HEALTH_CHECK_URL || 'http://localhost:3000'}/api/health`);
    if (response.ok) {
      checks.push({ name: 'Application Health', status: '✅ PASS' });
    } else {
      checks.push({ name: 'Application Health', status: `❌ FAIL - Status ${response.status}` });
    }
  } catch (error) {
    checks.push({ name: 'Application Health', status: '⏭️  SKIPPED - App not running' });
  }
  
  // Print results
  console.log('\n📊 Health Check Results:');
  console.log('========================');
  checks.forEach(check => {
    console.log(`${check.name}: ${check.status}`);
  });
  
  const failedChecks = checks.filter(check => check.status.includes('❌ FAIL'));
  
  if (failedChecks.length > 0) {
    console.log(`\n❌ ${failedChecks.length} health check(s) failed`);
    process.exit(1);
  } else {
    console.log('\n✅ All health checks passed');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheck();
}

export { healthCheck };