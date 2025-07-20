#!/usr/bin/env node
/**
 * Environment Security Validation Script
 * Checks for common security issues in environment configuration
 */

import fs from 'fs';
import path from 'path';

const ENV_FILE = '.env.local';

function checkEnvironmentSecurity() {
  console.log('🔒 EMPATHY LEDGER ENVIRONMENT SECURITY CHECK');
  console.log('=============================================\n');

  let issues = [];
  let warnings = [];
  let passed = 0;

  // Check if env file exists
  if (!fs.existsSync(ENV_FILE)) {
    issues.push('❌ .env.local file not found');
    return { issues, warnings, passed };
  }

  // Check file permissions
  const stats = fs.statSync(ENV_FILE);
  const permissions = (stats.mode & parseInt('777', 8)).toString(8);

  if (permissions !== '600') {
    issues.push(`❌ File permissions too open: ${permissions} (should be 600)`);
    console.log('   Fix with: chmod 600 .env.local');
  } else {
    passed++;
    console.log('✅ File permissions secure (600)');
  }

  // Read and validate environment variables
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const lines = envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'));

  // Security checks
  const securityChecks = [
    {
      name: 'NextAuth Secret',
      check: content =>
        content.includes('NEXTAUTH_SECRET=') &&
        !content.includes('NEXTAUTH_SECRET=your-'),
      required: true,
    },
    {
      name: 'Encryption Key',
      check: content => {
        const match = content.match(/ENCRYPTION_KEY=(.+)/);
        return match && match[1].length >= 32;
      },
      required: true,
    },
    {
      name: 'Production URLs in Development',
      check: content =>
        !content.includes('NODE_ENV=development') ||
        !content.includes('https://'),
      warning: true,
    },
    {
      name: 'Debug Mode in Production',
      check: content =>
        !content.includes('NODE_ENV=production') ||
        !content.includes('DEBUG_MODE=true'),
      warning: true,
    },
    {
      name: 'Default/Example Values',
      check: content =>
        !content.includes('your-') &&
        !content.includes('change-for-production'),
      warning: true,
    },
  ];

  securityChecks.forEach(check => {
    if (check.check(envContent)) {
      passed++;
      console.log(`✅ ${check.name}`);
    } else {
      if (check.required) {
        issues.push(`❌ ${check.name} - Security requirement not met`);
      } else if (check.warning) {
        warnings.push(`⚠️  ${check.name} - Review recommended`);
      }
    }
  });

  // Check for sensitive data patterns
  const sensitivePatterns = [
    { pattern: /password.*=.*[^*]/i, name: 'Plaintext passwords' },
    { pattern: /secret.*=.*[^*]/i, name: 'Exposed secrets' },
    { pattern: /key.*=.*[^*]/i, name: 'API keys' },
  ];

  console.log('\n📊 SECURITY SUMMARY:');
  console.log('====================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Issues: ${issues.length}`);

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }

  if (issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('   1. Fix file permissions: chmod 600 .env.local');
    console.log('   2. Generate secure secrets: openssl rand -base64 32');
    console.log('   3. Use environment-specific configurations');
    console.log('   4. Rotate all keys for production deployment');
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n🎉 EXCELLENT! Your environment configuration is secure!');
  }

  return { issues, warnings, passed };
}

// Run the security check
const result = checkEnvironmentSecurity();
process.exit(result.issues.length > 0 ? 1 : 0);
