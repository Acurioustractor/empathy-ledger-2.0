#!/usr/bin/env npx tsx

/**
 * CMS Functionality Testing Script
 * 
 * This script tests all CMS functionality to ensure components work correctly
 * and can handle various data scenarios.
 * 
 * Usage: npx tsx scripts/test-cms-functionality.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '../src/lib/supabase-client';
import { getStorytellers, getFeaturedStorytellers, searchStorytellers, getStorytellerStats } from '../src/lib/supabase-storytellers';

interface CMSTestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  data?: any;
  executionTime?: number;
}

class CMSTester {
  private results: CMSTestResult[] = [];
  
  private addResult(testName: string, status: 'pass' | 'fail' | 'warning', message: string, data?: any, executionTime?: number) {
    this.results.push({ testName, status, message, data, executionTime });
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    const timeStr = executionTime ? ` (${executionTime}ms)` : '';
    console.log(`${emoji} ${testName}: ${message}${timeStr}`);
  }
  
  async testSupabaseConnection() {
    const startTime = Date.now();
    try {
      const supabase = await createClient();
      if (!supabase) {
        throw new Error('Supabase client is null');
      }
      
      // Test basic connection
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      
      this.addResult(
        'Supabase Connection',
        'pass',
        'Database connection established successfully',
        null,
        Date.now() - startTime
      );
    } catch (error) {
      this.addResult(
        'Supabase Connection',
        'fail',
        `Failed to connect: ${error}`,
        null,
        Date.now() - startTime
      );
    }
  }
  
  async testGetStorytellers() {
    const startTime = Date.now();
    try {
      const result = await getStorytellers({ limit: 10 });
      
      if (result.error) {
        throw new Error(result.error.toString());
      }
      
      if (result.storytellers.length === 0) {
        this.addResult(
          'Get Storytellers',
          'warning',
          'No storytellers found in database',
          { count: 0 },
          Date.now() - startTime
        );
      } else {
        // Validate data structure
        const firstStoryteller = result.storytellers[0];
        const hasRequiredFields = firstStoryteller.id && 
          (firstStoryteller.full_name || firstStoryteller.preferred_name);
        
        if (!hasRequiredFields) {
          throw new Error('Storyteller missing required fields');
        }
        
        this.addResult(
          'Get Storytellers',
          'pass',
          `Retrieved ${result.storytellers.length} storytellers successfully`,
          { 
            count: result.storytellers.length,
            sampleName: firstStoryteller.preferred_name || firstStoryteller.full_name,
            hasStoryCount: typeof firstStoryteller.story_count === 'number'
          },
          Date.now() - startTime
        );
      }
    } catch (error) {
      this.addResult(
        'Get Storytellers',
        'fail',
        `Failed to retrieve storytellers: ${error}`,
        null,
        Date.now() - startTime
      );
    }
  }
  
  async testGetFeaturedStorytellers() {
    const startTime = Date.now();
    try {
      const featured = await getFeaturedStorytellers(3);
      
      this.addResult(
        'Get Featured Storytellers',
        featured.length > 0 ? 'pass' : 'warning',
        featured.length > 0 
          ? `Retrieved ${featured.length} featured storytellers`
          : 'No featured storytellers found',
        { count: featured.length },
        Date.now() - startTime
      );
    } catch (error) {
      this.addResult(
        'Get Featured Storytellers',
        'fail',
        `Failed to retrieve featured storytellers: ${error}`,
        null,
        Date.now() - startTime
      );
    }
  }
  
  async testSearchStorytellers() {
    const startTime = Date.now();
    try {
      // Test with a common term
      const searchResults = await searchStorytellers('community', { limit: 5 });
      
      this.addResult(
        'Search Storytellers',
        'pass',
        `Search completed, found ${searchResults.length} results for "community"`,
        { 
          searchTerm: 'community',
          resultCount: searchResults.length 
        },
        Date.now() - startTime
      );
    } catch (error) {
      this.addResult(
        'Search Storytellers',
        'fail',
        `Search failed: ${error}`,
        null,
        Date.now() - startTime
      );
    }
  }
  
  async testGetStorytellerStats() {
    const startTime = Date.now();
    try {
      const stats = await getStorytellerStats();
      
      const hasValidStats = typeof stats.total_storytellers === 'number' &&
        typeof stats.active_storytellers === 'number' &&
        typeof stats.engagement_rate === 'number';
      
      if (!hasValidStats) {
        throw new Error('Invalid stats structure returned');
      }
      
      this.addResult(
        'Get Storyteller Stats',
        'pass',
        `Stats retrieved successfully`,
        {
          totalStorytellers: stats.total_storytellers,
          activeStorytellers: stats.active_storytellers,
          engagementRate: `${stats.engagement_rate.toFixed(1)}%`
        },
        Date.now() - startTime
      );
    } catch (error) {
      this.addResult(
        'Get Storyteller Stats',
        'fail',
        `Failed to retrieve stats: ${error}`,
        null,
        Date.now() - startTime
      );
    }
  }
  
  async testDataQuality() {
    const startTime = Date.now();
    try {
      const { storytellers } = await getStorytellers({ limit: 20, includeStories: true });
      
      if (storytellers.length === 0) {
        this.addResult(
          'Data Quality Check',
          'warning',
          'No storytellers to check data quality',
          null,
          Date.now() - startTime
        );
        return;
      }
      
      const qualityMetrics = {
        withProfiles: 0,
        withStories: 0,
        withBios: 0,
        withImages: 0,
        withLocations: 0,
        withThemes: 0
      };
      
      storytellers.forEach(storyteller => {
        qualityMetrics.withProfiles++;
        if (storyteller.story_count && storyteller.story_count > 0) qualityMetrics.withStories++;
        if (storyteller.bio) qualityMetrics.withBios++;
        if (storyteller.profile_image_url) qualityMetrics.withImages++;
        if (storyteller.location) qualityMetrics.withLocations++;
        if (storyteller.primary_themes && storyteller.primary_themes.length > 0) qualityMetrics.withThemes++;
      });
      
      const total = storytellers.length;
      const qualityScore = (
        (qualityMetrics.withStories + qualityMetrics.withBios + 
         qualityMetrics.withImages + qualityMetrics.withLocations + qualityMetrics.withThemes) 
        / (total * 5)
      ) * 100;
      
      this.addResult(
        'Data Quality Check',
        qualityScore > 60 ? 'pass' : qualityScore > 30 ? 'warning' : 'fail',
        `Data quality score: ${qualityScore.toFixed(1)}%`,
        {
          totalStorytellers: total,
          withStories: `${qualityMetrics.withStories}/${total}`,
          withBios: `${qualityMetrics.withBios}/${total}`,
          withImages: `${qualityMetrics.withImages}/${total}`,
          withLocations: `${qualityMetrics.withLocations}/${total}`,
          withThemes: `${qualityMetrics.withThemes}/${total}`
        },
        Date.now() - startTime
      );
    } catch (error) {
      this.addResult(
        'Data Quality Check',
        'fail',
        `Data quality check failed: ${error}`,
        null,
        Date.now() - startTime
      );
    }
  }
  
  async testPagination() {
    const startTime = Date.now();
    try {
      // Test first page
      const page1 = await getStorytellers({ limit: 5, offset: 0 });
      const page2 = await getStorytellers({ limit: 5, offset: 5 });
      
      const hasDifferentResults = page1.storytellers.length > 0 && 
        page2.storytellers.length > 0 &&
        page1.storytellers[0].id !== page2.storytellers[0].id;
      
      this.addResult(
        'Pagination Test',
        'pass',
        `Pagination working correctly`,
        {
          page1Count: page1.storytellers.length,
          page2Count: page2.storytellers.length,
          differentResults: hasDifferentResults
        },
        Date.now() - startTime
      );
    } catch (error) {
      this.addResult(
        'Pagination Test',
        'fail',
        `Pagination test failed: ${error}`,
        null,
        Date.now() - startTime
      );
    }
  }
  
  async testPerformance() {
    console.log('\n🚀 Running Performance Tests...');
    
    // Test 1: Large query performance
    const startTime1 = Date.now();
    try {
      await getStorytellers({ limit: 100 });
      const queryTime = Date.now() - startTime1;
      
      this.addResult(
        'Large Query Performance',
        queryTime < 2000 ? 'pass' : queryTime < 5000 ? 'warning' : 'fail',
        queryTime < 2000 ? 'Excellent' : queryTime < 5000 ? 'Acceptable' : 'Too slow',
        { queryTime: `${queryTime}ms` },
        queryTime
      );
    } catch (error) {
      this.addResult(
        'Large Query Performance',
        'fail',
        `Performance test failed: ${error}`,
        null,
        Date.now() - startTime1
      );
    }
    
    // Test 2: Multiple concurrent queries
    const startTime2 = Date.now();
    try {
      await Promise.all([
        getStorytellers({ limit: 10 }),
        getFeaturedStorytellers(3),
        getStorytellerStats()
      ]);
      const concurrentTime = Date.now() - startTime2;
      
      this.addResult(
        'Concurrent Queries',
        concurrentTime < 3000 ? 'pass' : concurrentTime < 6000 ? 'warning' : 'fail',
        concurrentTime < 3000 ? 'Excellent' : concurrentTime < 6000 ? 'Acceptable' : 'Too slow',
        { concurrentTime: `${concurrentTime}ms` },
        concurrentTime
      );
    } catch (error) {
      this.addResult(
        'Concurrent Queries',
        'fail',
        `Concurrent query test failed: ${error}`,
        null,
        Date.now() - startTime2
      );
    }
  }
  
  async runAllTests() {
    console.log('🧪 Starting CMS Functionality Tests...\n');
    console.log('=' .repeat(60));
    
    // Basic functionality tests
    console.log('\n📋 Basic Functionality Tests:');
    await this.testSupabaseConnection();
    await this.testGetStorytellers();
    await this.testGetFeaturedStorytellers();
    await this.testSearchStorytellers();
    await this.testGetStorytellerStats();
    
    // Data quality tests
    console.log('\n🔍 Data Quality Tests:');
    await this.testDataQuality();
    await this.testPagination();
    
    // Performance tests
    await this.testPerformance();
    
    return this.results;
  }
  
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CMS FUNCTIONALITY TEST REPORT');
    console.log('=' .repeat(60));
    
    const passCount = this.results.filter(r => r.status === 'pass').length;
    const failCount = this.results.filter(r => r.status === 'fail').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const total = this.results.length;
    
    console.log(`\nOverall Results:`);
    console.log(`✅ Passed: ${passCount}/${total} (${((passCount/total)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failCount}/${total} (${((failCount/total)*100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${warningCount}/${total} (${((warningCount/total)*100).toFixed(1)}%)`);
    
    if (failCount > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`  - ${r.testName}: ${r.message}`));
    }
    
    if (warningCount > 0) {
      console.log(`\n⚠️  Warnings:`);
      this.results
        .filter(r => r.status === 'warning')
        .forEach(r => console.log(`  - ${r.testName}: ${r.message}`));
    }
    
    // Performance summary
    const performanceTests = this.results.filter(r => r.executionTime && r.executionTime > 0);
    if (performanceTests.length > 0) {
      console.log(`\n⚡ Performance Summary:`);
      const avgTime = performanceTests.reduce((sum, r) => sum + (r.executionTime || 0), 0) / performanceTests.length;
      console.log(`  Average Response Time: ${avgTime.toFixed(0)}ms`);
      
      const slowTests = performanceTests.filter(r => (r.executionTime || 0) > 1000);
      if (slowTests.length > 0) {
        console.log(`  Slow Tests (>1s):`);
        slowTests.forEach(r => console.log(`    - ${r.testName}: ${r.executionTime}ms`));
      }
    }
    
    console.log(`\n🎯 System Status: ${
      failCount === 0 
        ? passCount === total 
          ? '🟢 EXCELLENT - All tests passed!'
          : '🟡 GOOD - Some warnings to address'
        : failCount < total / 2
          ? '🟠 NEEDS WORK - Several issues to fix'
          : '🔴 CRITICAL - Major issues need immediate attention'
    }`);
    
    console.log('\n💡 Next Steps:');
    if (failCount > 0) {
      console.log('  1. Fix failed tests immediately');
      console.log('  2. Review error messages and logs');
      console.log('  3. Check database connectivity and permissions');
    }
    if (warningCount > 0) {
      console.log('  1. Address data quality issues');
      console.log('  2. Consider seeding more test data');
      console.log('  3. Optimize query performance if needed');
    }
    if (failCount === 0 && warningCount === 0) {
      console.log('  1. Run integration tests');
      console.log('  2. Test frontend components');
      console.log('  3. Perform user acceptance testing');
    }
    
    console.log('\n' + '='.repeat(60));
    
    return {
      total,
      passed: passCount,
      failed: failCount,
      warnings: warningCount,
      status: failCount === 0 ? (warningCount === 0 ? 'excellent' : 'good') : 'needs-work'
    };
  }
}

// Main execution
async function main() {
  const tester = new CMSTester();
  
  try {
    await tester.runAllTests();
    const report = tester.generateReport();
    
    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Only run if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CMSTester };