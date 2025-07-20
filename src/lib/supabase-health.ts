/**
 * Supabase Health Monitoring System for Empathy Ledger
 * 
 * Continuous monitoring of Supabase connections with:
 * - Real-time health checks
 * - Performance metrics
 * - Alerting system
 * - Recovery assistance
 */

import { createClient, createServerClient, createAdminClient, getSupabaseHealth } from './supabase-factory';
import { SupabaseErrorType, classifySupabaseError, logSupabaseError } from './supabase-errors';

export interface HealthMetrics {
  timestamp: Date;
  responseTime: number;
  success: boolean;
  errorType?: SupabaseErrorType;
  details?: any;
}

export interface HealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  browser: HealthStatus;
  server: HealthStatus;
  admin: HealthStatus;
  metrics: HealthMetrics[];
  recommendations: string[];
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  uptime: number; // percentage
}

class SupabaseHealthMonitor {
  private static instance: SupabaseHealthMonitor;
  private metrics: HealthMetrics[] = [];
  private maxMetrics = 100; // Keep last 100 checks
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: ((report: HealthReport) => void)[] = [];

  private constructor() {
    // Start monitoring on instantiation
    if (typeof window !== 'undefined') {
      this.startMonitoring();
    }
  }

  static getInstance(): SupabaseHealthMonitor {
    if (!SupabaseHealthMonitor.instance) {
      SupabaseHealthMonitor.instance = new SupabaseHealthMonitor();
    }
    return SupabaseHealthMonitor.instance;
  }

  // Start continuous monitoring
  startMonitoring(intervalMs = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    // Initial check
    this.performHealthCheck();
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Perform comprehensive health check
  async performHealthCheck(): Promise<HealthReport> {
    const checks = await Promise.allSettled([
      this.checkBrowserClient(),
      this.checkServerClient(),
      this.checkAdminClient()
    ]);

    const [browserResult, serverResult, adminResult] = checks;

    const browserHealth = browserResult.status === 'fulfilled' 
      ? browserResult.value 
      : this.createUnhealthyStatus(browserResult.reason);

    const serverHealth = serverResult.status === 'fulfilled' 
      ? serverResult.value 
      : this.createUnhealthyStatus(serverResult.reason);

    const adminHealth = adminResult.status === 'fulfilled' 
      ? adminResult.value 
      : this.createUnhealthyStatus(adminResult.reason);

    const report: HealthReport = {
      overall: this.calculateOverallHealth([browserHealth, serverHealth, adminHealth]),
      browser: browserHealth,
      server: serverHealth,
      admin: adminHealth,
      metrics: this.getRecentMetrics(),
      recommendations: this.generateRecommendations([browserHealth, serverHealth, adminHealth])
    };

    // Trigger alerts if needed
    this.checkForAlerts(report);

    return report;
  }

  // Check browser client health
  private async checkBrowserClient(): Promise<HealthStatus> {
    const startTime = Date.now();
    let success = false;
    let errorType: SupabaseErrorType | undefined;

    try {
      const client = await createClient();
      
      // Simple test query
      const { data, error } = await client
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      success = true;
    } catch (error) {
      const errorInfo = classifySupabaseError(error);
      errorType = errorInfo.type;
      logSupabaseError(error, 'browser-health-check');
    }

    const responseTime = Date.now() - startTime;
    
    // Record metric
    this.recordMetric({
      timestamp: new Date(),
      responseTime,
      success,
      errorType
    });

    return this.calculateHealthStatus('browser', success, responseTime);
  }

  // Check server client health
  private async checkServerClient(): Promise<HealthStatus> {
    const startTime = Date.now();
    let success = false;
    let errorType: SupabaseErrorType | undefined;

    try {
      const client = await createServerClient();
      
      // Simple test query
      const { data, error } = await client
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      success = true;
    } catch (error) {
      const errorInfo = classifySupabaseError(error);
      errorType = errorInfo.type;
      logSupabaseError(error, 'server-health-check');
    }

    const responseTime = Date.now() - startTime;
    
    this.recordMetric({
      timestamp: new Date(),
      responseTime,
      success,
      errorType
    });

    return this.calculateHealthStatus('server', success, responseTime);
  }

  // Check admin client health
  private async checkAdminClient(): Promise<HealthStatus> {
    const startTime = Date.now();
    let success = false;
    let errorType: SupabaseErrorType | undefined;

    try {
      // Only check admin client if service key is available
      if (!process.env.SUPABASE_SERVICE_KEY) {
        return {
          status: 'healthy',
          lastCheck: new Date(),
          responseTime: 0,
          errorCount: 0,
          uptime: 100
        };
      }

      const client = await createAdminClient();
      
      // Simple test query
      const { data, error } = await client
        .from('profiles')
        .select('count')
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      success = true;
    } catch (error) {
      const errorInfo = classifySupabaseError(error);
      errorType = errorInfo.type;
      logSupabaseError(error, 'admin-health-check');
    }

    const responseTime = Date.now() - startTime;
    
    this.recordMetric({
      timestamp: new Date(),
      responseTime,
      success,
      errorType
    });

    return this.calculateHealthStatus('admin', success, responseTime);
  }

  // Record health metric
  private recordMetric(metric: HealthMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Calculate health status for a client type
  private calculateHealthStatus(clientType: string, success: boolean, responseTime: number): HealthStatus {
    const recentMetrics = this.getRecentMetrics(10); // Last 10 checks
    const relevantMetrics = recentMetrics; // In a real implementation, filter by client type
    
    const successfulChecks = relevantMetrics.filter(m => m.success).length;
    const totalChecks = relevantMetrics.length || 1;
    const uptime = (successfulChecks / totalChecks) * 100;
    const errorCount = relevantMetrics.filter(m => !m.success).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (uptime >= 95 && responseTime < 2000) {
      status = 'healthy';
    } else if (uptime >= 80 && responseTime < 5000) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      lastCheck: new Date(),
      responseTime,
      errorCount,
      uptime
    };
  }

  // Calculate overall system health
  private calculateOverallHealth(healthStatuses: HealthStatus[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = healthStatuses.filter(h => h.status === 'unhealthy').length;
    const degradedCount = healthStatuses.filter(h => h.status === 'degraded').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }

  // Generate actionable recommendations
  private generateRecommendations(healthStatuses: HealthStatus[]): string[] {
    const recommendations: string[] = [];

    healthStatuses.forEach((status, index) => {
      const clientType = ['browser', 'server', 'admin'][index];
      
      if (status.status === 'unhealthy') {
        recommendations.push(`${clientType} client is unhealthy - check environment variables and network connection`);
      } else if (status.status === 'degraded') {
        recommendations.push(`${clientType} client performance is degraded - consider optimizing queries`);
      }

      if (status.responseTime > 2000) {
        recommendations.push(`${clientType} client has slow response times (${status.responseTime}ms) - check network and query complexity`);
      }

      if (status.errorCount > 3) {
        recommendations.push(`${clientType} client has ${status.errorCount} recent errors - investigate error logs`);
      }
    });

    // General recommendations
    const recentMetrics = this.getRecentMetrics(20);
    const failureRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length;
    
    if (failureRate > 0.2) {
      recommendations.push('High failure rate detected - check Supabase status and environment configuration');
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems operating normally');
    }

    return recommendations;
  }

  // Create unhealthy status for failed checks
  private createUnhealthyStatus(error: any): HealthStatus {
    return {
      status: 'unhealthy',
      lastCheck: new Date(),
      responseTime: 0,
      errorCount: 1,
      uptime: 0
    };
  }

  // Get recent metrics
  private getRecentMetrics(count?: number): HealthMetrics[] {
    if (count) {
      return this.metrics.slice(-count);
    }
    return [...this.metrics];
  }

  // Alert system
  onAlert(callback: (report: HealthReport) => void): void {
    this.alertCallbacks.push(callback);
  }

  private checkForAlerts(report: HealthReport): void {
    if (report.overall === 'unhealthy') {
      this.alertCallbacks.forEach(callback => {
        try {
          callback(report);
        } catch (error) {
          console.error('Error in health alert callback:', error);
        }
      });
    }
  }

  // Get current health report
  async getCurrentHealth(): Promise<HealthReport> {
    return this.performHealthCheck();
  }

  // Get metrics for dashboard
  getMetrics(): HealthMetrics[] {
    return [...this.metrics];
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Export singleton instance
const healthMonitor = SupabaseHealthMonitor.getInstance();

// Public API
export async function getSupabaseHealthReport(): Promise<HealthReport> {
  return healthMonitor.getCurrentHealth();
}

export function startHealthMonitoring(intervalMs?: number): void {
  healthMonitor.startMonitoring(intervalMs);
}

export function stopHealthMonitoring(): void {
  healthMonitor.stopMonitoring();
}

export function onHealthAlert(callback: (report: HealthReport) => void): void {
  healthMonitor.onAlert(callback);
}

export function getHealthMetrics(): HealthMetrics[] {
  return healthMonitor.getMetrics();
}

// Utility to check if Supabase is ready
export async function isSupabaseReady(): Promise<boolean> {
  try {
    const report = await getSupabaseHealthReport();
    return report.overall !== 'unhealthy';
  } catch (error) {
    return false;
  }
}

// Quick health check (lightweight)
export async function quickHealthCheck(): Promise<{ healthy: boolean; responseTime: number }> {
  const startTime = Date.now();
  
  try {
    const client = await createClient();
    await client.from('profiles').select('count').limit(1).single();
    return {
      healthy: true,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: Date.now() - startTime
    };
  }
}

// For debugging - expose to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).supabaseHealthReport = getSupabaseHealthReport;
  (window as any).supabaseHealthMetrics = getHealthMetrics;
  (window as any).supabaseQuickCheck = quickHealthCheck;
}

export { healthMonitor };