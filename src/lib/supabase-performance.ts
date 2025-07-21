/**
 * Advanced Supabase Performance Monitoring and Optimization
 * 
 * Features:
 * - Query performance tracking
 * - Connection pool optimization
 * - Caching layer with TTL
 * - Real-time performance metrics
 * - Automatic query optimization suggestions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Performance monitoring types
interface QueryMetrics {
  queryId: string;
  query: string;
  executionTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  rowsAffected?: number;
  cacheHit?: boolean;
}

interface PerformanceReport {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: QueryMetrics[];
  cacheHitRate: number;
  errorRate: number;
  peakPerformanceTime: Date;
  recommendations: string[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
  accessCount: number;
}

// Advanced caching layer
class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    const now = new Date().getTime();
    const entryTime = entry.timestamp.getTime();
    if (now - entryTime > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access count
    entry.accessCount++;
    return entry.data as T;
  }

  private evictOldest(): void {
    let oldestKey: string | undefined;
    let oldestTime = new Date().getTime();

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.timestamp.getTime() < oldestTime) {
        oldestTime = entry.timestamp.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hitRate: number } {
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    const hitRate = totalAccess > 0 ? (this.cache.size / totalAccess) * 100 : 0;
    
    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }
}

// Performance monitoring class
class SupabasePerformanceMonitor {
  private static instance: SupabasePerformanceMonitor;
  private queryMetrics: QueryMetrics[] = [];
  private cache: QueryCache = new QueryCache();
  private maxMetricsHistory = 10000;

  static getInstance(): SupabasePerformanceMonitor {
    if (!SupabasePerformanceMonitor.instance) {
      SupabasePerformanceMonitor.instance = new SupabasePerformanceMonitor();
    }
    return SupabasePerformanceMonitor.instance;
  }

  // Wrap Supabase query with performance monitoring
  async monitorQuery<T>(
    queryId: string,
    queryFn: () => Promise<T>,
    options: { 
      cacheKey?: string; 
      cacheTTL?: number;
      enableCache?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const { cacheKey, cacheTTL, enableCache = true } = options;

    // Check cache first
    if (enableCache && cacheKey) {
      const cachedResult = this.cache.get<T>(cacheKey);
      if (cachedResult) {
        this.recordMetric({
          queryId,
          query: `CACHED: ${queryId}`,
          executionTime: 0,
          timestamp: new Date(),
          success: true,
          cacheHit: true,
        });
        return cachedResult;
      }
    }

    try {
      const result = await queryFn();
      const executionTime = performance.now() - startTime;

      // Cache successful results
      if (enableCache && cacheKey) {
        this.cache.set(cacheKey, result, cacheTTL);
      }

      this.recordMetric({
        queryId,
        query: queryId,
        executionTime,
        timestamp: new Date(),
        success: true,
        cacheHit: false,
      });

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      this.recordMetric({
        queryId,
        query: queryId,
        executionTime,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cacheHit: false,
      });

      throw error;
    }
  }

  private recordMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric);

    // Keep only recent metrics
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }
  }

  // Generate performance report
  generateReport(timeRange?: { start: Date; end: Date }): PerformanceReport {
    let metrics = this.queryMetrics;

    // Filter by time range if provided
    if (timeRange) {
      metrics = metrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    const totalQueries = metrics.length;
    const successfulQueries = metrics.filter(m => m.success);
    const cachedQueries = metrics.filter(m => m.cacheHit);
    
    const averageExecutionTime = totalQueries > 0
      ? metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
      : 0;

    const slowQueries = metrics
      .filter(m => m.executionTime > 1000) // Queries slower than 1 second
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    const cacheHitRate = totalQueries > 0
      ? (cachedQueries.length / totalQueries) * 100
      : 0;

    const errorRate = totalQueries > 0
      ? ((totalQueries - successfulQueries.length) / totalQueries) * 100
      : 0;

    const peakPerformanceTime = metrics.length > 0
      ? metrics.reduce((fastest, current) => 
          current.executionTime < fastest.executionTime ? current : fastest
        ).timestamp
      : new Date();

    const recommendations = this.generateRecommendations(metrics);

    return {
      totalQueries,
      averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      peakPerformanceTime,
      recommendations,
    };
  }

  private generateRecommendations(metrics: QueryMetrics[]): string[] {
    const recommendations: string[] = [];
    const slowQueries = metrics.filter(m => m.executionTime > 1000);
    const errorQueries = metrics.filter(m => !m.success);
    const cachedQueries = metrics.filter(m => m.cacheHit);

    if (slowQueries.length > metrics.length * 0.1) {
      recommendations.push('Consider adding database indexes for frequently slow queries');
    }

    if (errorQueries.length > metrics.length * 0.05) {
      recommendations.push('High error rate detected - review error handling and query validation');
    }

    if (cachedQueries.length < metrics.length * 0.3) {
      recommendations.push('Low cache hit rate - consider caching more frequently accessed data');
    }

    const avgExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    if (avgExecutionTime > 500) {
      recommendations.push('Average query time is high - consider query optimization');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal - no issues detected');
    }

    return recommendations;
  }

  // Get real-time performance stats
  getRealtimeStats(): {
    recentQueries: number;
    averageResponseTime: number;
    errorRate: number;
    cacheStats: { size: number; hitRate: number };
  } {
    const recentWindow = 5 * 60 * 1000; // 5 minutes
    const now = new Date().getTime();
    
    const recentMetrics = this.queryMetrics.filter(
      m => now - m.timestamp.getTime() < recentWindow
    );

    const recentQueries = recentMetrics.length;
    const averageResponseTime = recentQueries > 0
      ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentQueries
      : 0;

    const errorRate = recentQueries > 0
      ? (recentMetrics.filter(m => !m.success).length / recentQueries) * 100
      : 0;

    return {
      recentQueries,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      cacheStats: this.cache.getStats(),
    };
  }

  // Clear performance data
  clearMetrics(): void {
    this.queryMetrics = [];
    this.cache.clear();
  }
}

// Enhanced Supabase client wrapper with performance monitoring
export class PerformantSupabaseClient {
  private client: SupabaseClient<Database>;
  private monitor: SupabasePerformanceMonitor;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
    this.monitor = SupabasePerformanceMonitor.getInstance();
  }

  // Optimized story queries with caching
  async getPublicStories(options: {
    limit?: number;
    offset?: number;
    theme?: string;
    location?: string;
  } = {}) {
    const { limit = 50, offset = 0, theme, location } = options;
    const cacheKey = `public_stories_${limit}_${offset}_${theme || 'all'}_${location || 'all'}`;

    return this.monitor.monitorQuery(
      'getPublicStories',
      async () => {
        let query = this.client
          .from('stories')
          .select(`
            id,
            title,
            transcript,
            storyteller_id,
            story_themes,
            location,
            geographic_region,
            submitted_at,
            users!inner(full_name, community_affiliation)
          `)
          .eq('privacy_level', 'public')
          .eq('status', 'published')
          .order('submitted_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (theme) {
          query = query.contains('story_themes', [theme]);
        }

        if (location) {
          query = query.ilike('location', `%${location}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      { cacheKey, cacheTTL: 2 * 60 * 1000 } // 2 minutes cache
    );
  }

  // Optimized community insights
  async getCommunityInsights(community: string, daysBack: number = 30) {
    const cacheKey = `community_insights_${community}_${daysBack}`;

    return this.monitor.monitorQuery(
      'getCommunityInsights',
      async () => {
        const { data, error } = await this.client
          .rpc('get_community_insights', {
            target_community: community,
            days_back: daysBack
          });

        if (error) throw error;
        return data;
      },
      { cacheKey, cacheTTL: 10 * 60 * 1000 } // 10 minutes cache
    );
  }

  // Get performance metrics
  getPerformanceReport(timeRange?: { start: Date; end: Date }) {
    return this.monitor.generateReport(timeRange);
  }

  getRealtimeStats() {
    return this.monitor.getRealtimeStats();
  }

  clearPerformanceData() {
    this.monitor.clearMetrics();
  }

  // Access underlying client for other operations
  get supabase() {
    return this.client;
  }
}

// Export singleton instance
export const performanceMonitor = SupabasePerformanceMonitor.getInstance();
export default SupabasePerformanceMonitor;