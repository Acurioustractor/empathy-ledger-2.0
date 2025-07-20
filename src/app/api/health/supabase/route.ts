/**
 * Supabase Health Check API Endpoint
 * 
 * Use this to monitor Supabase connection health from external services
 * GET /api/health/supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseHealthReport, quickHealthCheck } from '@/lib/supabase-health';
import { testConnection, validateSupabaseEnvironment, getSupabaseHealth } from '@/lib/supabase-factory';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Basic environment check
    const env = validateSupabaseEnvironment();
    if (!env.isValid) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Missing environment variables',
        missingVars: env.missingVars,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }, { status: 503 });
    }

    // Quick connection test
    const quickCheck = await quickHealthCheck();
    
    // Get detailed health report
    const healthReport = await getSupabaseHealthReport();
    
    // Get connection manager metrics
    const connectionMetrics = getSupabaseHealth();

    // Test different client types
    const [browserTest, serverTest] = await Promise.allSettled([
      testConnection('browser'),
      testConnection('server')
    ]);

    const response = {
      status: healthReport.overall,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      quickCheck: {
        healthy: quickCheck.healthy,
        responseTime: quickCheck.responseTime
      },
      clients: {
        browser: {
          status: healthReport.browser.status,
          responseTime: healthReport.browser.responseTime,
          uptime: healthReport.browser.uptime,
          test: browserTest.status === 'fulfilled' ? browserTest.value : { success: false, error: browserTest.reason }
        },
        server: {
          status: healthReport.server.status,
          responseTime: healthReport.server.responseTime,
          uptime: healthReport.server.uptime,
          test: serverTest.status === 'fulfilled' ? serverTest.value : { success: false, error: serverTest.reason }
        },
        admin: {
          status: healthReport.admin.status,
          responseTime: healthReport.admin.responseTime,
          uptime: healthReport.admin.uptime
        }
      },
      connectionMetrics: {
        totalConnections: connectionMetrics.totalConnections,
        successfulConnections: connectionMetrics.successfulConnections,
        failedConnections: connectionMetrics.failedConnections,
        status: connectionMetrics.status,
        circuitBreakerTrips: connectionMetrics.circuitBreakerTrips
      },
      recommendations: healthReport.recommendations,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      }
    };

    // Return appropriate status code
    const statusCode = healthReport.overall === 'healthy' ? 200 : 
                      healthReport.overall === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 503 });
  }
}

// Support OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}