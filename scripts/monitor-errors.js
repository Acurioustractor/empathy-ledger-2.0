#!/usr/bin/env node

/**
 * Post-Deployment Error Monitoring Script
 * Monitors application health and error rates after deployment
 */

const https = require('https');

const config = {
  baseUrl:
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://empathy-ledger-2-0.vercel.app',
  healthEndpoint: '/api/health',
  supabaseHealthEndpoint: '/api/health/supabase',
  maxErrors: 5,
  timeout: 10000, // 10 seconds
};

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: config.timeout }, response => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: response.statusCode,
            data: jsonData,
            headers: response.headers,
          });
        } catch (error) {
          resolve({
            statusCode: response.statusCode,
            data: data,
            headers: response.headers,
          });
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkHealth() {
  console.log('🔍 Starting post-deployment health check...');

  const checks = [
    {
      name: 'Application Health',
      url: `${config.baseUrl}${config.healthEndpoint}`,
    },
    {
      name: 'Supabase Connection',
      url: `${config.baseUrl}${config.supabaseHealthEndpoint}`,
    },
  ];

  let errorCount = 0;
  const results = [];

  for (const check of checks) {
    try {
      console.log(`📡 Checking ${check.name}...`);
      const result = await makeRequest(check.url);

      if (result.statusCode === 200) {
        console.log(`✅ ${check.name}: OK`);
        results.push({ ...check, status: 'ok', response: result });
      } else {
        console.log(`❌ ${check.name}: Failed (${result.statusCode})`);
        errorCount++;
        results.push({ ...check, status: 'error', response: result });
      }
    } catch (error) {
      console.log(`💥 ${check.name}: Error - ${error.message}`);
      errorCount++;
      results.push({ ...check, status: 'error', error: error.message });
    }
  }

  // Summary
  console.log('\n📊 Health Check Summary:');
  console.log(`Total checks: ${checks.length}`);
  console.log(`Passed: ${checks.length - errorCount}`);
  console.log(`Failed: ${errorCount}`);

  if (errorCount === 0) {
    console.log('🎉 All health checks passed! Deployment is healthy.');
    process.exit(0);
  } else if (errorCount <= config.maxErrors) {
    console.log(
      `⚠️  Some checks failed (${errorCount}), but within acceptable limits.`
    );
    process.exit(0);
  } else {
    console.log(
      `🚨 Critical: Too many failures (${errorCount}). Deployment may have issues.`
    );
    process.exit(1);
  }
}

async function monitorErrors() {
  console.log('🔍 Post-Deployment Error Monitoring');
  console.log(`📍 Monitoring: ${config.baseUrl}`);
  console.log('⏱️  Starting health checks...\n');

  try {
    await checkHealth();
  } catch (error) {
    console.error('💥 Monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  monitorErrors();
}

module.exports = { monitorErrors };
