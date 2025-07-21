#!/usr/bin/env node

/**
 * Post-Deployment Performance Monitoring Script
 * Monitors application performance metrics after deployment
 */

const https = require('https');

const config = {
  baseUrl:
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://empathy-ledger-2-0.vercel.app',
  healthEndpoint: '/api/health',
  timeout: 15000, // 15 seconds
  maxResponseTime: 5000, // 5 seconds
  performanceChecks: [
    { name: 'Home Page', path: '/' },
    { name: 'Health API', path: '/api/health' },
    { name: 'Supabase Health', path: '/api/health/supabase' },
  ],
};

async function measurePerformance(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const request = https.get(url, { timeout: config.timeout }, response => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          responseTime,
          contentLength: data.length,
          success: response.statusCode >= 200 && response.statusCode < 400,
        });
      });
    });

    request.on('error', error => {
      const endTime = Date.now();
      reject({
        error: error.message,
        responseTime: endTime - startTime,
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject({
        error: 'Request timeout',
        responseTime: config.timeout,
      });
    });
  });
}

async function runPerformanceChecks() {
  console.log('📊 Starting post-deployment performance monitoring...');
  console.log(`📍 Target: ${config.baseUrl}\n`);

  const results = [];
  let totalResponseTime = 0;
  let successCount = 0;

  for (const check of config.performanceChecks) {
    const url = `${config.baseUrl}${check.path}`;

    try {
      console.log(`⏱️  Testing ${check.name}...`);
      const result = await measurePerformance(url);

      results.push({
        ...check,
        ...result,
      });

      if (result.success) {
        successCount++;
        totalResponseTime += result.responseTime;

        const status =
          result.responseTime <= config.maxResponseTime ? '🟢' : '🟡';
        console.log(
          `${status} ${check.name}: ${result.responseTime}ms (${result.statusCode})`
        );
      } else {
        console.log(
          `🔴 ${check.name}: Failed (${result.statusCode}) - ${result.responseTime}ms`
        );
      }
    } catch (error) {
      console.log(
        `💥 ${check.name}: Error - ${error.error} (${error.responseTime}ms)`
      );
      results.push({
        ...check,
        success: false,
        error: error.error,
        responseTime: error.responseTime,
      });
    }
  }

  // Performance Summary
  console.log('\n📈 Performance Summary:');
  console.log(`Total endpoints tested: ${config.performanceChecks.length}`);
  console.log(`Successful responses: ${successCount}`);
  console.log(
    `Success rate: ${Math.round((successCount / config.performanceChecks.length) * 100)}%`
  );

  if (successCount > 0) {
    const avgResponseTime = Math.round(totalResponseTime / successCount);
    console.log(`Average response time: ${avgResponseTime}ms`);

    if (avgResponseTime <= config.maxResponseTime) {
      console.log('🚀 Performance is excellent!');
    } else {
      console.log('⚠️  Performance is slower than expected but acceptable.');
    }
  }

  // Detailed Results
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.responseTime}ms`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  // Exit with appropriate code
  if (successCount === config.performanceChecks.length) {
    console.log('\n🎉 All performance checks passed!');
    process.exit(0);
  } else if (successCount >= Math.ceil(config.performanceChecks.length * 0.7)) {
    console.log(
      '\n✅ Performance monitoring completed with acceptable results.'
    );
    process.exit(0);
  } else {
    console.log('\n🚨 Performance issues detected. Manual review recommended.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runPerformanceChecks().catch(error => {
    console.error('💥 Performance monitoring failed:', error);
    process.exit(1);
  });
}

module.exports = { runPerformanceChecks };
