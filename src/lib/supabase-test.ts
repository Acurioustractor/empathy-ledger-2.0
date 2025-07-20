/**
 * Comprehensive Supabase Test Suite
 * 
 * Tests all the fucking edge cases to make sure nothing breaks
 */

import { 
  createClient, 
  createServerClient, 
  createAdminClient,
  SupabaseClient 
} from './supabase-client';

import { 
  testConnection, 
  validateSupabaseEnvironment 
} from './supabase-factory';

import { 
  getSupabaseHealthReport,
  quickHealthCheck,
  isSupabaseReady 
} from './supabase-health';

import { 
  SupabaseError, 
  SupabaseErrorType,
  classifySupabaseError 
} from './supabase-errors';

export interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  overallSuccess: boolean;
  totalDuration: number;
}

class SupabaseTestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Running test: ${name}`);
      const result = await testFn();
      
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name,
        success: true,
        duration,
        details: result
      };
      
      console.log(`✅ ${name} passed (${duration}ms)`);
      this.results.push(testResult);
      return testResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const testResult: TestResult = {
        name,
        success: false,
        duration,
        error: error.message,
        details: error
      };
      
      console.error(`❌ ${name} failed (${duration}ms):`, error.message);
      this.results.push(testResult);
      return testResult;
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  clearResults(): void {
    this.results = [];
  }
}

// Test suite functions
export async function testEnvironmentConfiguration(): Promise<TestSuite> {
  const runner = new SupabaseTestRunner();
  const startTime = Date.now();

  await runner.runTest('Environment Variables', async () => {
    const env = validateSupabaseEnvironment();
    if (!env.isValid) {
      throw new Error(`Missing variables: ${env.missingVars.join(', ')}`);
    }
    return { valid: true, vars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] };
  });

  await runner.runTest('URL Format Validation', async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) throw new Error('URL not found');
    
    if (!url.includes('.supabase.co') && !url.includes('localhost')) {
      throw new Error('Invalid URL format');
    }
    
    return { url: url.substring(0, 20) + '...' };
  });

  await runner.runTest('Anon Key Format', async () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) throw new Error('Anon key not found');
    
    if (key.length < 100) {
      throw new Error('Anon key seems too short');
    }
    
    return { keyLength: key.length, preview: key.substring(0, 10) + '...' };
  });

  await runner.runTest('Service Key Check', async () => {
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    return { 
      hasServiceKey: !!serviceKey,
      keyLength: serviceKey?.length || 0
    };
  });

  const results = runner.getResults();
  return {
    name: 'Environment Configuration',
    results,
    overallSuccess: results.every(r => r.success),
    totalDuration: Date.now() - startTime
  };
}

export async function testClientConnections(): Promise<TestSuite> {
  const runner = new SupabaseTestRunner();
  const startTime = Date.now();

  await runner.runTest('Browser Client Creation', async () => {
    const client = await createClient();
    return { created: true, client: !!client };
  });

  await runner.runTest('Server Client Creation', async () => {
    const client = await createServerClient();
    return { created: true, client: !!client };
  });

  await runner.runTest('Admin Client Creation', async () => {
    try {
      const client = await createAdminClient();
      return { created: true, client: !!client };
    } catch (error) {
      if (error.message.includes('SUPABASE_SERVICE_KEY')) {
        return { created: false, reason: 'Service key not configured' };
      }
      throw error;
    }
  });

  await runner.runTest('Wrapper Client Creation', async () => {
    const client = await SupabaseClient.createBrowser();
    const health = await client.healthCheck();
    return { created: true, healthy: health };
  });

  const results = runner.getResults();
  return {
    name: 'Client Connections',
    results,
    overallSuccess: results.every(r => r.success),
    totalDuration: Date.now() - startTime
  };
}

export async function testDatabaseOperations(): Promise<TestSuite> {
  const runner = new SupabaseTestRunner();
  const startTime = Date.now();

  await runner.runTest('Simple Query Test', async () => {
    const client = await SupabaseClient.createBrowser();
    // Try to query an existing table
    try {
      await client.select('profiles', 'count', {});
      return { query: 'success', table: 'profiles' };
    } catch (error) {
      // Table might not exist, try a different approach
      const rawClient = client.getRawClient();
      const { data, error: dbError } = await rawClient.from('profiles').select('count').limit(1);
      if (dbError && dbError.code === '42P01') {
        return { query: 'table_not_found', table: 'profiles', message: 'Expected if database not set up' };
      }
      throw error;
    }
  });

  await runner.runTest('Authentication Test', async () => {
    const client = await SupabaseClient.createBrowser();
    const session = await client.getSession();
    return { 
      hasSession: !!session.session,
      user: session.session?.user?.id || null
    };
  });

  await runner.runTest('Raw Client Access', async () => {
    const client = await SupabaseClient.createBrowser();
    const rawClient = client.getRawClient();
    return { 
      hasRawClient: !!rawClient,
      hasFrom: typeof rawClient.from === 'function',
      hasAuth: typeof rawClient.auth === 'object'
    };
  });

  const results = runner.getResults();
  return {
    name: 'Database Operations',
    results,
    overallSuccess: results.every(r => r.success),
    totalDuration: Date.now() - startTime
  };
}

export async function testErrorHandling(): Promise<TestSuite> {
  const runner = new SupabaseTestRunner();
  const startTime = Date.now();

  await runner.runTest('Network Error Classification', async () => {
    const networkError = new Error('Failed to fetch');
    const classified = classifySupabaseError(networkError);
    
    if (classified.type !== SupabaseErrorType.NETWORK_ERROR) {
      throw new Error(`Expected NETWORK_ERROR, got ${classified.type}`);
    }
    
    return { 
      type: classified.type,
      retryable: classified.retryable,
      userMessage: classified.userMessage
    };
  });

  await runner.runTest('Auth Error Classification', async () => {
    const authError = { message: 'Invalid login credentials', status: 401 };
    const classified = classifySupabaseError(authError);
    
    if (classified.type !== SupabaseErrorType.AUTHENTICATION_FAILED) {
      throw new Error(`Expected AUTHENTICATION_FAILED, got ${classified.type}`);
    }
    
    return { 
      type: classified.type,
      retryable: classified.retryable,
      userMessage: classified.userMessage
    };
  });

  await runner.runTest('Rate Limit Error Classification', async () => {
    const rateLimitError = { message: 'Too many requests', status: 429 };
    const classified = classifySupabaseError(rateLimitError);
    
    if (classified.type !== SupabaseErrorType.RATE_LIMITED) {
      throw new Error(`Expected RATE_LIMITED, got ${classified.type}`);
    }
    
    return { 
      type: classified.type,
      retryable: classified.retryable,
      userMessage: classified.userMessage
    };
  });

  await runner.runTest('Supabase Error Creation', async () => {
    const error = new SupabaseError({
      type: SupabaseErrorType.CONNECTION_FAILED,
      message: 'Test error',
      userMessage: 'Test user message',
      suggestion: 'Test suggestion',
      retryable: true
    });
    
    if (!(error instanceof SupabaseError)) {
      throw new Error('SupabaseError not created correctly');
    }
    
    return {
      isSupabaseError: error instanceof SupabaseError,
      type: error.type,
      retryable: error.retryable
    };
  });

  const results = runner.getResults();
  return {
    name: 'Error Handling',
    results,
    overallSuccess: results.every(r => r.success),
    totalDuration: Date.now() - startTime
  };
}

export async function testHealthMonitoring(): Promise<TestSuite> {
  const runner = new SupabaseTestRunner();
  const startTime = Date.now();

  await runner.runTest('Quick Health Check', async () => {
    const health = await quickHealthCheck();
    return {
      healthy: health.healthy,
      responseTime: health.responseTime
    };
  });

  await runner.runTest('Supabase Ready Check', async () => {
    const ready = await isSupabaseReady();
    return { ready };
  });

  await runner.runTest('Health Report Generation', async () => {
    const report = await getSupabaseHealthReport();
    return {
      overall: report.overall,
      hasRecommendations: report.recommendations.length > 0,
      clientsChecked: Object.keys(report).filter(k => ['browser', 'server', 'admin'].includes(k)).length
    };
  });

  await runner.runTest('Connection Testing', async () => {
    const browserTest = await testConnection('browser');
    const serverTest = await testConnection('server');
    
    return {
      browser: browserTest.success,
      server: serverTest.success,
      errors: [browserTest.error, serverTest.error].filter(Boolean)
    };
  });

  const results = runner.getResults();
  return {
    name: 'Health Monitoring',
    results,
    overallSuccess: results.every(r => r.success),
    totalDuration: Date.now() - startTime
  };
}

// Run all tests
export async function runFullTestSuite(): Promise<{
  suites: TestSuite[];
  overallSuccess: boolean;
  totalDuration: number;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
  };
}> {
  const startTime = Date.now();
  
  console.log('🚀 Starting comprehensive Supabase test suite...');
  
  const suites = await Promise.all([
    testEnvironmentConfiguration(),
    testClientConnections(),
    testDatabaseOperations(),
    testErrorHandling(),
    testHealthMonitoring()
  ]);
  
  const allResults = suites.flatMap(suite => suite.results);
  const passedTests = allResults.filter(r => r.success).length;
  const failedTests = allResults.filter(r => !r.success).length;
  const totalTests = allResults.length;
  
  const summary = {
    totalTests,
    passedTests,
    failedTests,
    successRate: (passedTests / totalTests) * 100
  };
  
  const overallSuccess = suites.every(suite => suite.overallSuccess);
  const totalDuration = Date.now() - startTime;
  
  console.log(`\n📊 Test Suite Complete:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${summary.successRate.toFixed(1)}%)`);
  console.log(`❌ Failed: ${failedTests}/${totalTests}`);
  console.log(`⏱️  Duration: ${totalDuration}ms`);
  console.log(`🎯 Overall: ${overallSuccess ? 'SUCCESS' : 'FAILURE'}`);
  
  return {
    suites,
    overallSuccess,
    totalDuration,
    summary
  };
}

// For debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).runSupabaseTests = runFullTestSuite;
  (window as any).testSupabaseEnvironment = testEnvironmentConfiguration;
  (window as any).testSupabaseConnections = testClientConnections;
}