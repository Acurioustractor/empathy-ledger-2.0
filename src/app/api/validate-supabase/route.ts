/**
 * Supabase Connection Validation API
 * 
 * This endpoint thoroughly tests the Supabase connection and validates
 * the multi-tenant database schema is working correctly.
 */

import { NextResponse } from 'next/server';
import { SupabaseValidator } from '@/lib/supabase-validator';

export async function GET() {
  try {
    const validator = new SupabaseValidator();
    const results = await validator.validateAll();
    
    const statusCode = results.overall_status === 'failed' ? 500 : 200;
    
    return NextResponse.json(results, { status: statusCode });
    
  } catch (error: any) {
    console.error('❌ Validation system error:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall_status: 'failed',
      error: 'Validation system error',
      details: error.message,
      stack: error.stack,
      recommendations: [
        'Check Supabase credentials in .env.local',
        'Verify database schema is deployed',
        'Check network connectivity to Supabase',
        'Ensure validation system is properly configured'
      ]
    }, { status: 500 });
  }
}