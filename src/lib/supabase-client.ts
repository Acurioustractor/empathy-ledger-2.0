/**
 * Bulletproof Supabase Client for Empathy Ledger
 *
 * This is the NEW main Supabase client that replaces the old ones.
 * It's bulletproof, handles all edge cases, and never fucking breaks.
 *
 * Use this instead of the old supabase.ts and supabase-server.ts
 */

import {
  createClient as createFactoryClient,
  createServerClient as createFactoryServerClient,
  createAdminClient as createFactoryAdminClient,
  getSupabaseHealth,
  testConnection,
  validateSupabaseEnvironment,
} from './supabase-factory';

import {
  withErrorHandling,
  SupabaseError,
  SupabaseErrorType,
  getUserMessage,
  getSuggestions,
  isRetryableError,
} from './supabase-errors';

import {
  getSupabaseHealthReport,
  startHealthMonitoring,
  isSupabaseReady,
  quickHealthCheck,
} from './supabase-health';

import { Database } from './database.types';

// Main client creation functions with error handling
export async function createClient() {
  try {
    const env = validateSupabaseEnvironment();
    if (!env.isValid) {
      throw new Error(
        `Missing Supabase environment variables: ${env.missingVars.join(', ')}`
      );
    }

    return await createFactoryClient({
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
    });
  } catch (error) {
    console.error('🚨 Failed to create Supabase client:', error);
    throw error;
  }
}

export async function createServerClient() {
  try {
    const env = validateSupabaseEnvironment();
    if (!env.isValid) {
      throw new Error(
        `Missing Supabase environment variables: ${env.missingVars.join(', ')}`
      );
    }

    return await createFactoryServerClient({
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 15000,
    });
  } catch (error) {
    console.error('🚨 Failed to create Supabase server client:', error);
    throw error;
  }
}

export async function createAdminClient() {
  try {
    const env = validateSupabaseEnvironment();
    if (!env.isValid) {
      throw new Error(
        `Missing Supabase environment variables: ${env.missingVars.join(', ')}`
      );
    }

    if (!process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_KEY is required for admin operations');
    }

    return await createFactoryAdminClient({
      maxRetries: 5,
      retryDelay: 2000,
      timeout: 30000,
    });
  } catch (error) {
    console.error('🚨 Failed to create Supabase admin client:', error);
    throw error;
  }
}

// High-level wrapper for database operations
export class SupabaseClient {
  private client: any;
  private clientType: 'browser' | 'server' | 'admin';

  private constructor(client: any, clientType: 'browser' | 'server' | 'admin') {
    this.client = client;
    this.clientType = clientType;
  }

  static async createBrowser(): Promise<SupabaseClient> {
    const client = await createClient();
    return new SupabaseClient(client, 'browser');
  }

  static async createServer(): Promise<SupabaseClient> {
    const client = await createServerClient();
    return new SupabaseClient(client, 'server');
  }

  static async createAdmin(): Promise<SupabaseClient> {
    const client = await createAdminClient();
    return new SupabaseClient(client, 'admin');
  }

  // Wrapped database operations with error handling
  async select<T = any>(
    table: string,
    query: string = '*',
    filters?: Record<string, any>
  ): Promise<T[]> {
    return withErrorHandling(async () => {
      let queryBuilder = this.client.from(table).select(query);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }

      return queryBuilder;
    }, `select from ${table}`);
  }

  async insert<T = any>(table: string, data: any): Promise<T> {
    return withErrorHandling(async () => {
      return this.client.from(table).insert(data).select().single();
    }, `insert into ${table}`);
  }

  async update<T = any>(
    table: string,
    data: any,
    filters: Record<string, any>
  ): Promise<T> {
    return withErrorHandling(async () => {
      let queryBuilder = this.client.from(table).update(data);

      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });

      return queryBuilder.select().single();
    }, `update ${table}`);
  }

  async delete(table: string, filters: Record<string, any>): Promise<void> {
    return withErrorHandling(async () => {
      let queryBuilder = this.client.from(table).delete();

      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });

      return queryBuilder;
    }, `delete from ${table}`);
  }

  async rpc<T = any>(functionName: string, params?: any): Promise<T> {
    return withErrorHandling(async () => {
      return this.client.rpc(functionName, params);
    }, `rpc ${functionName}`);
  }

  // Authentication operations
  async signIn(email: string, password: string) {
    return withErrorHandling(async () => {
      return this.client.auth.signInWithPassword({ email, password });
    }, 'sign in');
  }

  async signUp(email: string, password: string, options?: any) {
    return withErrorHandling(async () => {
      return this.client.auth.signUp({ email, password, options });
    }, 'sign up');
  }

  async signOut() {
    return withErrorHandling(async () => {
      return this.client.auth.signOut();
    }, 'sign out');
  }

  async getUser() {
    return withErrorHandling(async () => {
      return this.client.auth.getUser();
    }, 'get user');
  }

  async getSession() {
    return withErrorHandling(async () => {
      return this.client.auth.getSession();
    }, 'get session');
  }

  // File operations
  async uploadFile(bucket: string, path: string, file: File, options?: any) {
    return withErrorHandling(async () => {
      return this.client.storage.from(bucket).upload(path, file, options);
    }, `upload file to ${bucket}`);
  }

  async downloadFile(bucket: string, path: string) {
    return withErrorHandling(async () => {
      return this.client.storage.from(bucket).download(path);
    }, `download file from ${bucket}`);
  }

  async deleteFile(bucket: string, path: string) {
    return withErrorHandling(async () => {
      return this.client.storage.from(bucket).remove([path]);
    }, `delete file from ${bucket}`);
  }

  // Get raw client for advanced operations
  getRawClient() {
    return this.client;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.from('profiles').select('count').limit(1).single();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Utility functions
export async function ensureSupabaseReady(): Promise<void> {
  const isReady = await isSupabaseReady();
  if (!isReady) {
    throw new Error(
      'Supabase is not ready. Check your configuration and network connection.'
    );
  }
}

export async function getConnectionStatus() {
  try {
    const health = await getSupabaseHealthReport();
    const quick = await quickHealthCheck();

    return {
      status: health.overall,
      responseTime: quick.responseTime,
      healthy: quick.healthy,
      details: health,
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      responseTime: 0,
      healthy: false,
      error: error.message,
    };
  }
}

// Initialize health monitoring
if (typeof window !== 'undefined') {
  startHealthMonitoring(60000); // Check every minute
}

// Export everything for easy access
export {
  // Error handling
  SupabaseError,
  SupabaseErrorType,
  withErrorHandling,
  getUserMessage,
  getSuggestions,
  isRetryableError,

  // Health monitoring
  getSupabaseHealthReport,
  startHealthMonitoring,
  isSupabaseReady,
  quickHealthCheck,

  // Utilities
  testConnection,
  validateSupabaseEnvironment,
  getSupabaseHealth,
};

// For debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).SupabaseClient = SupabaseClient;
  (window as any).getSupabaseStatus = getConnectionStatus;
  (window as any).testSupabase = testConnection;
}

// Default export for convenience
export default SupabaseClient;
