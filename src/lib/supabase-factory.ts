/**
 * Bulletproof Supabase Client Factory for Empathy Ledger
 * 
 * This factory creates rock-solid Supabase connections with:
 * - Connection pooling
 * - Retry logic with exponential backoff
 * - Comprehensive error handling
 * - Health monitoring
 * - Circuit breaker pattern
 * - Environment validation
 * 
 * Philosophy: No more fucking connection issues. Ever.
 */

import { createBrowserClient, createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { Database } from './database.types';

// Types
export type SupabaseClientType = 'browser' | 'server' | 'admin';
export type ConnectionStatus = 'healthy' | 'degraded' | 'unhealthy' | 'circuit_open';

interface ClientConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  circuitBreakerThreshold?: number;
  healthCheckInterval?: number;
}

interface ConnectionMetrics {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  lastHealthCheck: Date | null;
  circuitBreakerTrips: number;
  averageResponseTime: number;
}

// Global connection state
class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager;
  private metrics: ConnectionMetrics;
  private status: ConnectionStatus = 'healthy';
  private circuitBreakerOpen = false;
  private lastCircuitBreakerTrip: Date | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private clientPool: Map<string, any> = new Map();

  private constructor() {
    this.metrics = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      lastHealthCheck: null,
      circuitBreakerTrips: 0,
      averageResponseTime: 0
    };
    this.startHealthMonitoring();
  }

  static getInstance(): SupabaseConnectionManager {
    if (!SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance = new SupabaseConnectionManager();
    }
    return SupabaseConnectionManager.instance;
  }

  // Environment validation
  validateEnvironment(): { isValid: boolean; missingVars: string[] } {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    return {
      isValid: missingVars.length === 0,
      missingVars
    };
  }

  // Circuit breaker logic
  private shouldAllowConnection(): boolean {
    if (!this.circuitBreakerOpen) return true;

    // Circuit breaker timeout (30 seconds)
    if (this.lastCircuitBreakerTrip && 
        Date.now() - this.lastCircuitBreakerTrip.getTime() > 30000) {
      this.circuitBreakerOpen = false;
      console.log('🔧 Supabase circuit breaker reset');
      return true;
    }

    return false;
  }

  private tripCircuitBreaker(): void {
    this.circuitBreakerOpen = true;
    this.lastCircuitBreakerTrip = new Date();
    this.metrics.circuitBreakerTrips++;
    this.status = 'circuit_open';
    console.error('🚨 Supabase circuit breaker tripped - too many failures');
  }

  // Retry logic with exponential backoff
  async withRetry<T>(
    operation: () => Promise<T>,
    config: ClientConfig = {}
  ): Promise<T> {
    const maxRetries = config.maxRetries || 3;
    const baseDelay = config.retryDelay || 1000;
    
    if (!this.shouldAllowConnection()) {
      throw new Error('Connection blocked by circuit breaker');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operation();
        
        // Success - update metrics
        this.metrics.successfulConnections++;
        this.metrics.averageResponseTime = 
          (this.metrics.averageResponseTime + (Date.now() - startTime)) / 2;
        
        if (this.status !== 'healthy' && this.metrics.failedConnections > 0) {
          this.status = 'healthy';
          console.log('✅ Supabase connection recovered');
        }
        
        return result;
      } catch (error) {
        this.metrics.failedConnections++;
        
        console.error(`🔥 Supabase attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt === maxRetries) {
          // All retries exhausted
          if (this.metrics.failedConnections > (config.circuitBreakerThreshold || 5)) {
            this.tripCircuitBreaker();
          } else {
            this.status = 'degraded';
          }
          throw new Error(`Supabase operation failed after ${maxRetries} attempts: ${error}`);
        }

        // Wait before retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unexpected error in retry logic');
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Client-side health check every 30 seconds
      this.healthCheckTimer = setInterval(() => {
        this.performHealthCheck();
      }, 30000);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const env = this.validateEnvironment();
      if (!env.isValid) {
        this.status = 'unhealthy';
        return;
      }

      // Simple ping to Supabase
      const client = this.createBrowserClient();
      await client.from('profiles').select('count').limit(1).single();
      
      this.metrics.lastHealthCheck = new Date();
      
      if (this.status === 'unhealthy') {
        this.status = 'healthy';
        console.log('💚 Supabase health check passed');
      }
    } catch (error) {
      this.status = 'unhealthy';
      console.error('❤️‍🩹 Supabase health check failed:', error);
    }
  }

  // Get connection metrics
  getMetrics(): ConnectionMetrics & { status: ConnectionStatus } {
    return {
      ...this.metrics,
      status: this.status
    };
  }

  // Client factory methods
  createBrowserClient(config: ClientConfig = {}): any {
    const cacheKey = 'browser';
    
    if (this.clientPool.has(cacheKey)) {
      return this.clientPool.get(cacheKey);
    }

    const env = this.validateEnvironment();
    if (!env.isValid) {
      console.error('🚨 Missing Supabase environment variables:', env.missingVars);
      throw new Error(`Missing environment variables: ${env.missingVars.join(', ')}`);
    }

    this.metrics.totalConnections++;

    const client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined
        },
        global: {
          headers: {
            'X-Community-Platform': 'empathy-ledger',
            'X-Philosophy': 'community-sovereignty',
            'X-Client-Type': 'browser',
            'X-Connection-ID': `browser-${Date.now()}`
          }
        },
        // Connection timeout
        db: {
          schema: 'public'
        }
      }
    );

    this.clientPool.set(cacheKey, client);
    return client;
  }

  async createServerClient(config: ClientConfig = {}): Promise<any> {
    const env = this.validateEnvironment();
    if (!env.isValid) {
      console.error('🚨 Missing Supabase environment variables:', env.missingVars);
      throw new Error(`Missing environment variables: ${env.missingVars.join(', ')}`);
    }

    this.metrics.totalConnections++;

    try {
      // Dynamic import of cookies to avoid build-time issues
      let cookieStore: any = null;
      try {
        if (typeof window === 'undefined') {
          const { cookies } = await import('next/headers');
          cookieStore = await cookies();
        }
      } catch (error) {
        console.warn('⚠️ Could not access cookies (might be build time):', error);
      }

      return createSupabaseServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              try {
                return cookieStore?.getAll() || [];
              } catch (error) {
                console.warn('⚠️ Failed to get cookies, using empty array:', error);
                return [];
              }
            },
            setAll(cookiesToSet) {
              try {
                if (cookieStore) {
                  cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options);
                  });
                }
              } catch (error) {
                console.warn('⚠️ Failed to set cookies (might be SSG):', error);
                // Ignore - this is expected during static generation
              }
            },
          },
          global: {
            headers: {
              'X-Community-Platform': 'empathy-ledger',
              'X-Philosophy': 'community-sovereignty',
              'X-Client-Type': 'server',
              'X-Connection-ID': `server-${Date.now()}`
            }
          }
        }
      );
    } catch (error) {
      this.metrics.failedConnections++;
      throw new Error(`Failed to create server client: ${error}`);
    }
  }

  async createAdminClient(config: ClientConfig = {}): Promise<any> {
    if (!process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_KEY is required for admin operations');
    }

    const env = this.validateEnvironment();
    if (!env.isValid) {
      throw new Error(`Missing environment variables: ${env.missingVars.join(', ')}`);
    }

    this.metrics.totalConnections++;

    try {
      return createSupabaseServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY,
        {
          cookies: {
            getAll() { return []; },
            setAll() { /* Admin client doesn't need cookies */ },
          },
          global: {
            headers: {
              'X-Community-Platform': 'empathy-ledger',
              'X-Philosophy': 'community-sovereignty',
              'X-Client-Type': 'admin',
              'X-Connection-ID': `admin-${Date.now()}`
            }
          }
        }
      );
    } catch (error) {
      this.metrics.failedConnections++;
      throw new Error(`Failed to create admin client: ${error}`);
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.clientPool.clear();
  }
}

// Export the singleton instance
const connectionManager = SupabaseConnectionManager.getInstance();

// Public API
export async function createClient(config: ClientConfig = {}) {
  return connectionManager.withRetry(() => 
    Promise.resolve(connectionManager.createBrowserClient(config)), 
    config
  );
}

export async function createServerClient(config: ClientConfig = {}) {
  return connectionManager.withRetry(() => 
    connectionManager.createServerClient(config), 
    config
  );
}

export async function createAdminClient(config: ClientConfig = {}) {
  return connectionManager.withRetry(() => 
    connectionManager.createAdminClient(config), 
    config
  );
}

// Health check API
export function getSupabaseHealth() {
  return connectionManager.getMetrics();
}

// Utility for testing connections
export async function testConnection(clientType: SupabaseClientType = 'browser') {
  try {
    let client;
    switch (clientType) {
      case 'browser':
        client = await createClient();
        break;
      case 'server':
        client = await createServerClient();
        break;
      case 'admin':
        client = await createAdminClient();
        break;
    }

    // Simple test query
    const { data, error } = await client
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error) throw error;

    return { success: true, clientType, data };
  } catch (error) {
    return { success: false, clientType, error: error.message };
  }
}

// Environment validation utility
export function validateSupabaseEnvironment() {
  return connectionManager.validateEnvironment();
}

// For debugging and monitoring
if (typeof window !== 'undefined') {
  (window as any).supabaseHealth = getSupabaseHealth;
  (window as any).testSupabaseConnection = testConnection;
}

export { connectionManager };

// Backward compatibility exports (drop-in replacement)
export { createClient as createClientLegacy } from './supabase';
// Legacy exports removed - now using bulletproof factory methods above