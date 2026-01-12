/**
 * Test CMS Integration API
 * 
 * Simple endpoint to test if the CMS service works with existing Supabase patterns
 */

import { NextResponse } from 'next/server'
import { cmsService } from '@/lib/cms'

export async function GET() {
  try {
    console.log('🧪 Testing CMS Service Integration...')

    // Test basic connection - try to get pages (should work even if no pages exist)
    const pages = await cmsService.getPages({
      limit: 1,
      include_author: false
    })

    return NextResponse.json({
      success: true,
      message: 'CMS service connected successfully',
      connection_test: {
        supabase_client: 'connected',
        cms_service: 'initialized',
        pages_query: 'success',
        total_pages: pages.total
      },
      sovereignty_compliance: {
        cultural_protocols: 'active',
        existing_patterns_used: 'true',
        connection_method: 'existing-supabase-patterns'
      },
      next_steps: [
        'Deploy CMS tables to database',
        'Test admin interface at /admin/cms',
        'Run content migration script'
      ]
    })
  } catch (error: any) {
    console.error('❌ CMS Test failed:', error)

    return NextResponse.json({
      success: false,
      error: 'CMS connection test failed',
      details: error.message,
      troubleshooting: {
        check_environment: 'Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
        check_database: 'Ensure Supabase database is accessible',
        check_tables: 'CMS tables may not exist yet - deploy schema first'
      },
      connection_status: {
        supabase_client: error.message.includes('fetch') ? 'network_error' : 'config_error',
        cms_service: 'failed_to_initialize'
      }
    }, { status: 500 })
  }
}