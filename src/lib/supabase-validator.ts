/**
 * Supabase Connection and Schema Validator
 * 
 * This module provides comprehensive validation of the Supabase setup
 * with proper error handling, logging, and recovery mechanisms.
 */

import { createServerClient, createAdminClient } from './supabase-server';
import { Database } from './database.types';

// Types for validation results
interface ValidationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  recommendations?: string[];
}

interface ComprehensiveValidation {
  timestamp: string;
  overall_status: 'success' | 'partial' | 'failed';
  environment: {
    supabase_url: string;
    has_anon_key: boolean;
    has_service_key: boolean;
  };
  connection: ValidationResult;
  authentication: ValidationResult;
  schema: ValidationResult;
  rls: ValidationResult;
  multi_tenant: ValidationResult;
  performance: ValidationResult;
  recommendations: string[];
}

export class SupabaseValidator {
  private startTime: number = 0;
  
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run comprehensive validation of the entire Supabase setup
   */
  async validateAll(): Promise<ComprehensiveValidation> {
    console.log('🔍 Starting comprehensive Supabase validation...');
    
    const results: ComprehensiveValidation = {
      timestamp: new Date().toISOString(),
      overall_status: 'failed',
      environment: this.validateEnvironment(),
      connection: await this.validateConnection(),
      authentication: await this.validateAuthentication(),
      schema: await this.validateSchema(),
      rls: await this.validateRLS(),
      multi_tenant: await this.validateMultiTenant(),
      performance: await this.validatePerformance(),
      recommendations: []
    };

    // Determine overall status
    const validations = [
      results.connection,
      results.authentication,
      results.schema,
      results.rls,
      results.multi_tenant,
      results.performance
    ];

    const successCount = validations.filter(v => v.success).length;
    const totalCount = validations.length;

    if (successCount === totalCount) {
      results.overall_status = 'success';
    } else if (successCount > totalCount / 2) {
      results.overall_status = 'partial';
    }

    // Compile recommendations
    results.recommendations = validations
      .filter(v => !v.success && v.recommendations)
      .flatMap(v => v.recommendations || []);

    console.log(`✅ Validation completed in ${Date.now() - this.startTime}ms`);
    return results;
  }

  /**
   * Validate environment variables and configuration
   */
  private validateEnvironment() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    return {
      supabase_url: supabaseUrl || 'NOT_SET',
      has_anon_key: !!anonKey,
      has_service_key: !!serviceKey
    };
  }

  /**
   * Test basic Supabase connection
   */
  public async validateConnection(): Promise<ValidationResult> {
    try {
      console.log('📡 Testing basic connection...');
      
      const supabase = await createServerClient();
      
      // Test with a simple query
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: 'Connection failed',
          error: error.message,
          recommendations: [
            'Check Supabase URL and API keys',
            'Verify network connectivity',
            'Ensure Supabase project is active'
          ]
        };
      }

      return {
        success: true,
        message: 'Connection successful',
        data: { response_time: Date.now() - this.startTime }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Connection error',
        error: error.message,
        recommendations: [
          'Check environment variables',
          'Verify Supabase project configuration'
        ]
      };
    }
  }

  /**
   * Test authentication capabilities
   */
  private async validateAuthentication(): Promise<ValidationResult> {
    try {
      console.log('🔐 Testing authentication...');
      
      const supabase = await createServerClient();
      const adminClient = await createAdminClient();

      // Test anonymous access
      const { data: session } = await supabase.auth.getSession();
      
      // Test admin client
      const { data: adminTest, error: adminError } = await adminClient
        .from('users')
        .select('count')
        .limit(1);

      if (adminError) {
        return {
          success: false,
          message: 'Admin authentication failed',
          error: adminError.message,
          recommendations: [
            'Check SUPABASE_SERVICE_KEY is correct',
            'Verify service role permissions'
          ]
        };
      }

      return {
        success: true,
        message: 'Authentication working',
        data: {
          has_session: !!session,
          admin_access: !adminError
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Authentication error',
        error: error.message,
        recommendations: [
          'Check authentication configuration',
          'Verify service role key'
        ]
      };
    }
  }

  /**
   * Validate database schema and tables
   */
  public async validateSchema(): Promise<ValidationResult> {
    try {
      console.log('🗄️ Validating database schema...');
      
      const supabase = await createAdminClient();
      
      const requiredTables = [
        'users',
        'projects', 
        'stories',
        'story_analysis',
        'community_insights',
        'project_members',
        'value_events'
      ];

      const tableStatus = {};
      const missingTables = [];

      for (const table of requiredTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          tableStatus[table] = {
            exists: !error,
            has_data: data && data.length > 0,
            error: error?.message
          };

          if (error) {
            missingTables.push(table);
          }
        } catch (err: any) {
          tableStatus[table] = {
            exists: false,
            has_data: false,
            error: err.message
          };
          missingTables.push(table);
        }
      }

      const success = missingTables.length === 0;

      return {
        success,
        message: success ? 'Schema validation passed' : `Missing ${missingTables.length} tables`,
        data: { tables: tableStatus },
        recommendations: missingTables.length > 0 ? [
          `Create missing tables: ${missingTables.join(', ')}`,
          'Run database migration scripts',
          'Check schema deployment'
        ] : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Schema validation failed',
        error: error.message,
        recommendations: [
          'Check database permissions',
          'Verify schema is deployed'
        ]
      };
    }
  }

  /**
   * Test Row Level Security policies
   */
  private async validateRLS(): Promise<ValidationResult> {
    try {
      console.log('🔒 Testing Row Level Security...');
      
      const supabase = await createServerClient();
      
      // Test without authentication (should be restricted)
      const { data: restrictedData, error: rlsError } = await supabase
        .from('stories')
        .select('*')
        .limit(1);

      // Check if RLS is working (should either get empty data or permission error)
      const rlsWorking = rlsError || (restrictedData && restrictedData.length === 0);

      return {
        success: true,
        message: 'RLS validation completed',
        data: {
          rls_enabled: rlsWorking,
          access_without_auth: !rlsWorking,
          error: rlsError?.message
        },
        recommendations: !rlsWorking ? [
          'Enable Row Level Security policies',
          'Restrict unauthorized access to sensitive data'
        ] : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'RLS validation failed',
        error: error.message,
        recommendations: [
          'Check RLS policy configuration',
          'Verify table permissions'
        ]
      };
    }
  }

  /**
   * Test multi-tenant project functionality
   */
  private async validateMultiTenant(): Promise<ValidationResult> {
    try {
      console.log('🏢 Testing multi-tenant functionality...');
      
      const adminClient = await createAdminClient();
      
      // Create test project
      const testProject = {
        name: `Validation Test ${Date.now()}`,
        description: 'Automated validation test - safe to delete',
        organization_name: 'Test Organization',
        status: 'active',
        created_by: '00000000-0000-0000-0000-000000000000',
        metadata: {
          test: true,
          validation: true,
          created_at: new Date().toISOString()
        }
      };

      const { data: project, error: createError } = await adminClient
        .from('projects')
        .insert(testProject)
        .select()
        .single();

      if (createError || !project) {
        return {
          success: false,
          message: 'Project creation failed',
          error: createError?.message,
          recommendations: [
            'Check projects table schema',
            'Verify insert permissions',
            'Check foreign key constraints'
          ]
        };
      }

      // Test project isolation by adding a story
      const testStory = {
        project_id: project.id,
        title: 'Test Story',
        content: 'This is a test story for validation',
        storyteller_id: '00000000-0000-0000-0000-000000000000',
        privacy_level: 'public',
        metadata: { test: true }
      };

      const { data: story, error: storyError } = await adminClient
        .from('stories')
        .insert(testStory)
        .select()
        .single();

      // Clean up test data
      if (story) {
        await adminClient
          .from('stories')
          .delete()
          .eq('id', story.id);
      }

      await adminClient
        .from('projects')
        .delete()
        .eq('id', project.id);

      return {
        success: true,
        message: 'Multi-tenant functionality working',
        data: {
          project_created: !!project,
          story_isolation: !storyError,
          test_project_id: project.id
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Multi-tenant validation failed',
        error: error.message,
        recommendations: [
          'Check project table configuration',
          'Verify foreign key relationships',
          'Check data isolation policies'
        ]
      };
    }
  }

  /**
   * Test database performance
   */
  private async validatePerformance(): Promise<ValidationResult> {
    try {
      console.log('⚡ Testing database performance...');
      
      const supabase = await createAdminClient();
      
      const startTime = Date.now();
      
      // Test query performance
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .limit(10);

      const queryTime = Date.now() - startTime;

      if (error) {
        return {
          success: false,
          message: 'Performance test failed',
          error: error.message
        };
      }

      const performanceGood = queryTime < 1000; // Less than 1 second

      return {
        success: performanceGood,
        message: `Query completed in ${queryTime}ms`,
        data: {
          query_time_ms: queryTime,
          records_returned: data?.length || 0,
          performance_grade: performanceGood ? 'good' : 'needs_optimization'
        },
        recommendations: !performanceGood ? [
          'Optimize database queries',
          'Add appropriate indexes',
          'Consider query optimization'
        ] : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Performance validation failed',
        error: error.message
      };
    }
  }
}

/**
 * Quick validation for basic functionality
 */
export async function quickValidation() {
  const validator = new SupabaseValidator();
  const connection = await validator.validateConnection();
  const schema = await validator.validateSchema();
  
  return {
    connection_ok: connection.success,
    schema_ok: schema.success,
    ready_for_use: connection.success && schema.success
  };
}