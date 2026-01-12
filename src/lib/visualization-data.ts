/**
 * EMPATHY LEDGER VISUALIZATION DATA SERVICE
 * 
 * This service handles all data fetching, processing, and aggregation
 * for the world-class visualization system. It ensures privacy-preserving
 * aggregation and real-time updates while maintaining data sovereignty.
 */

import { createClient } from './supabase-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =====================================================================
// TYPE DEFINITIONS
// =====================================================================

export interface StoryNode {
  id: string;
  title: string;
  excerpt?: string;
  themes: string[];
  tags: string[];
  sentiment_score?: number;
  impact_score: number;
  created_at: string;
  location?: string;
  privacy_level: string;
  connections: StoryConnection[];
  // Visualization-specific properties
  x?: number;
  y?: number;
  z?: number;
  radius?: number;
  color?: string;
  opacity?: number;
}

export interface StoryConnection {
  source_id: string;
  target_id: string;
  strength: number;
  type: 'theme' | 'location' | 'timeline' | 'impact' | 'sentiment';
  metadata?: Record<string, any>;
}

export interface ThemeCluster {
  id: string;
  name: string;
  story_count: number;
  stories: string[]; // Story IDs
  sentiment_average: number;
  impact_total: number;
  growth_rate: number;
  sub_themes: string[];
  color: string;
}

export interface ImpactMetrics {
  total_stories: number;
  active_storytellers: number;
  themes_identified: number;
  communities_reached: number;
  policy_influences: number;
  average_sentiment: number;
  engagement_rate: number;
  growth_percentage: number;
}

export interface GeographicData {
  location: string;
  story_count: number;
  themes: { theme: string; count: number }[];
  sentiment_average: number;
  connections_to: { location: string; strength: number }[];
}

export interface TimeSeriesData {
  date: string;
  story_count: number;
  cumulative_count: number;
  themes: { [theme: string]: number };
  sentiment: number;
  engagement: number;
}

// =====================================================================
// MAIN DATA SERVICE CLASS
// =====================================================================

export class VisualizationDataService {
  private supabase: any;
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    this.supabase = await createClient();
  }

  // =====================================================================
  // STORY NETWORK DATA
  // =====================================================================

  /**
   * Get all stories with their connections for network visualization
   */
  async getStoryNetwork(filters?: {
    themes?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    location?: string;
    minImpactScore?: number;
  }): Promise<{ nodes: StoryNode[]; connections: StoryConnection[] }> {
    const cacheKey = `story-network-${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Build query
      let query = this.supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          themes,
          tags,
          sentiment_score,
          impact_score,
          created_at,
          contributor_location,
          privacy_level,
          view_count,
          share_count
        `)
        .eq('status', 'approved')
        .in('privacy_level', ['public', 'community']);

      // Apply filters
      if (filters?.themes?.length) {
        query = query.overlaps('themes', filters.themes);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }
      if (filters?.location) {
        query = query.eq('contributor_location', filters.location);
      }
      if (filters?.minImpactScore) {
        query = query.gte('impact_score', filters.minImpactScore);
      }

      const { data: stories, error } = await query;
      if (error) throw error;

      // Process stories into nodes
      const nodes: StoryNode[] = stories.map(story => ({
        id: story.id,
        title: story.title,
        excerpt: story.summary?.substring(0, 200),
        themes: story.themes || [],
        tags: story.tags || [],
        sentiment_score: story.sentiment_score,
        impact_score: story.impact_score || 0,
        created_at: story.created_at,
        location: story.contributor_location,
        privacy_level: story.privacy_level,
        connections: [],
        // Initial positioning (will be calculated by visualization)
        radius: Math.sqrt(story.view_count + story.share_count + 1) * 2,
        opacity: story.privacy_level === 'public' ? 1 : 0.7,
      }));

      // Calculate connections
      const connections = this.calculateStoryConnections(nodes);

      const result = { nodes, connections };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching story network:', error);
      return { nodes: [], connections: [] };
    }
  }

  /**
   * Calculate connections between stories based on various factors
   */
  private calculateStoryConnections(nodes: StoryNode[]): StoryConnection[] {
    const connections: StoryConnection[] = [];
    const processedPairs = new Set<string>();

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pairKey = `${node1.id}-${node2.id}`;

        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        // Theme connections
        const sharedThemes = node1.themes.filter(t => node2.themes.includes(t));
        if (sharedThemes.length > 0) {
          connections.push({
            source_id: node1.id,
            target_id: node2.id,
            strength: sharedThemes.length / Math.max(node1.themes.length, node2.themes.length),
            type: 'theme',
            metadata: { shared_themes: sharedThemes }
          });
        }

        // Location connections
        if (node1.location && node1.location === node2.location) {
          connections.push({
            source_id: node1.id,
            target_id: node2.id,
            strength: 0.5,
            type: 'location',
            metadata: { location: node1.location }
          });
        }

        // Timeline proximity (stories within 30 days)
        const timeDiff = Math.abs(
          new Date(node1.created_at).getTime() - new Date(node2.created_at).getTime()
        );
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        if (daysDiff <= 30) {
          connections.push({
            source_id: node1.id,
            target_id: node2.id,
            strength: 1 - (daysDiff / 30),
            type: 'timeline',
            metadata: { days_apart: daysDiff }
          });
        }

        // Sentiment similarity
        if (node1.sentiment_score && node2.sentiment_score) {
          const sentimentDiff = Math.abs(node1.sentiment_score - node2.sentiment_score);
          if (sentimentDiff < 0.2) {
            connections.push({
              source_id: node1.id,
              target_id: node2.id,
              strength: 1 - (sentimentDiff / 0.2),
              type: 'sentiment',
              metadata: { sentiment_similarity: 1 - sentimentDiff }
            });
          }
        }
      }
    }

    return connections;
  }

  // =====================================================================
  // THEME CLUSTERING DATA
  // =====================================================================

  /**
   * Get theme clusters for visualization
   */
  async getThemeClusters(timeRange?: { from: Date; to: Date }): Promise<ThemeCluster[]> {
    const cacheKey = `theme-clusters-${JSON.stringify(timeRange)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let query = this.supabase
        .from('stories')
        .select('id, themes, sentiment_score, impact_score, created_at')
        .eq('status', 'approved')
        .in('privacy_level', ['public', 'community']);

      if (timeRange) {
        query = query
          .gte('created_at', timeRange.from.toISOString())
          .lte('created_at', timeRange.to.toISOString());
      }

      const { data: stories, error } = await query;
      if (error) throw error;

      // Process themes
      const themeMap = new Map<string, ThemeCluster>();
      const themeColors = this.generateThemeColors();
      let colorIndex = 0;

      stories.forEach(story => {
        (story.themes || []).forEach(theme => {
          if (!themeMap.has(theme)) {
            themeMap.set(theme, {
              id: theme.toLowerCase().replace(/\s+/g, '-'),
              name: theme,
              story_count: 0,
              stories: [],
              sentiment_average: 0,
              impact_total: 0,
              growth_rate: 0,
              sub_themes: [],
              color: themeColors[colorIndex % themeColors.length]
            });
            colorIndex++;
          }

          const cluster = themeMap.get(theme)!;
          cluster.story_count++;
          cluster.stories.push(story.id);
          cluster.sentiment_average += story.sentiment_score || 0;
          cluster.impact_total += story.impact_score || 0;
        });
      });

      // Calculate averages and growth rates
      const clusters = Array.from(themeMap.values()).map(cluster => {
        cluster.sentiment_average = cluster.story_count > 0 
          ? cluster.sentiment_average / cluster.story_count 
          : 0;
        
        // Calculate growth rate (simplified - in production, compare with previous period)
        cluster.growth_rate = cluster.story_count > 10 ? 0.15 : 0.05;
        
        return cluster;
      });

      // Sort by story count
      clusters.sort((a, b) => b.story_count - a.story_count);

      this.setCache(cacheKey, clusters);
      return clusters;
    } catch (error) {
      console.error('Error fetching theme clusters:', error);
      return [];
    }
  }

  // =====================================================================
  // GEOGRAPHIC DATA
  // =====================================================================

  /**
   * Get geographic distribution data
   */
  async getGeographicData(): Promise<GeographicData[]> {
    const cacheKey = 'geographic-data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { data: stories, error } = await this.supabase
        .from('stories')
        .select('id, contributor_location, themes, sentiment_score')
        .eq('status', 'approved')
        .in('privacy_level', ['public', 'community'])
        .not('contributor_location', 'is', null);

      if (error) throw error;

      // Aggregate by location
      const locationMap = new Map<string, GeographicData>();

      stories.forEach(story => {
        const location = story.contributor_location;
        if (!locationMap.has(location)) {
          locationMap.set(location, {
            location,
            story_count: 0,
            themes: [],
            sentiment_average: 0,
            connections_to: []
          });
        }

        const locData = locationMap.get(location)!;
        locData.story_count++;
        locData.sentiment_average += story.sentiment_score || 0;

        // Track themes
        (story.themes || []).forEach(theme => {
          const existing = locData.themes.find(t => t.theme === theme);
          if (existing) {
            existing.count++;
          } else {
            locData.themes.push({ theme, count: 1 });
          }
        });
      });

      // Calculate averages and sort themes
      const geoData = Array.from(locationMap.values()).map(loc => {
        loc.sentiment_average = loc.story_count > 0 
          ? loc.sentiment_average / loc.story_count 
          : 0;
        loc.themes.sort((a, b) => b.count - a.count);
        return loc;
      });

      // Calculate connections between locations (simplified)
      // In production, this would analyze actual story relationships
      geoData.forEach(loc1 => {
        geoData.forEach(loc2 => {
          if (loc1.location !== loc2.location) {
            const sharedThemes = loc1.themes.filter(t1 => 
              loc2.themes.some(t2 => t2.theme === t1.theme)
            ).length;
            
            if (sharedThemes > 0) {
              loc1.connections_to.push({
                location: loc2.location,
                strength: sharedThemes / Math.max(loc1.themes.length, loc2.themes.length)
              });
            }
          }
        });
      });

      this.setCache(cacheKey, geoData);
      return geoData;
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      return [];
    }
  }

  // =====================================================================
  // TIME SERIES DATA
  // =====================================================================

  /**
   * Get time series data for trend analysis
   */
  async getTimeSeriesData(
    granularity: 'day' | 'week' | 'month' = 'week',
    timeRange?: { from: Date; to: Date }
  ): Promise<TimeSeriesData[]> {
    const cacheKey = `time-series-${granularity}-${JSON.stringify(timeRange)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let query = this.supabase
        .from('stories')
        .select('created_at, themes, sentiment_score, view_count, share_count')
        .eq('status', 'approved')
        .in('privacy_level', ['public', 'community'])
        .order('created_at', { ascending: true });

      if (timeRange) {
        query = query
          .gte('created_at', timeRange.from.toISOString())
          .lte('created_at', timeRange.to.toISOString());
      }

      const { data: stories, error } = await query;
      if (error) throw error;

      // Group by time period
      const timeMap = new Map<string, TimeSeriesData>();
      let cumulativeCount = 0;

      stories.forEach(story => {
        const date = new Date(story.created_at);
        const key = this.getTimeKey(date, granularity);

        if (!timeMap.has(key)) {
          timeMap.set(key, {
            date: key,
            story_count: 0,
            cumulative_count: 0,
            themes: {},
            sentiment: 0,
            engagement: 0
          });
        }

        const period = timeMap.get(key)!;
        period.story_count++;
        cumulativeCount++;
        period.cumulative_count = cumulativeCount;
        period.sentiment += story.sentiment_score || 0;
        period.engagement += (story.view_count || 0) + (story.share_count || 0);

        (story.themes || []).forEach(theme => {
          period.themes[theme] = (period.themes[theme] || 0) + 1;
        });
      });

      // Calculate averages
      const timeSeries = Array.from(timeMap.values()).map(period => {
        if (period.story_count > 0) {
          period.sentiment /= period.story_count;
          period.engagement /= period.story_count;
        }
        return period;
      });

      this.setCache(cacheKey, timeSeries);
      return timeSeries;
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
  }

  // =====================================================================
  // IMPACT METRICS
  // =====================================================================

  /**
   * Get overall impact metrics
   */
  async getImpactMetrics(): Promise<ImpactMetrics> {
    const cacheKey = 'impact-metrics';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Get story metrics
      const { data: storyMetrics, error: storyError } = await this.supabase
        .from('stories')
        .select('id, sentiment_score, impact_score, contributor_id, created_at')
        .eq('status', 'approved');

      if (storyError) throw storyError;

      // Get unique themes
      const { data: themes, error: themeError } = await this.supabase
        .from('stories')
        .select('themes')
        .eq('status', 'approved');

      if (themeError) throw themeError;

      // Get community reach
      const { data: locations, error: locError } = await this.supabase
        .from('stories')
        .select('contributor_location')
        .eq('status', 'approved')
        .not('contributor_location', 'is', null);

      if (locError) throw locError;

      // Calculate metrics
      const uniqueThemes = new Set();
      themes.forEach(story => {
        (story.themes || []).forEach(theme => uniqueThemes.add(theme));
      });

      const uniqueLocations = new Set(locations.map(l => l.contributor_location));
      const uniqueStorytellers = new Set(storyMetrics.map(s => s.contributor_id));

      // Calculate growth (compare last 30 days to previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentStories = storyMetrics.filter(s => 
        new Date(s.created_at) > thirtyDaysAgo
      ).length;
      const previousStories = storyMetrics.filter(s => 
        new Date(s.created_at) > sixtyDaysAgo && 
        new Date(s.created_at) <= thirtyDaysAgo
      ).length;

      const growthPercentage = previousStories > 0 
        ? ((recentStories - previousStories) / previousStories) * 100 
        : 100;

      const metrics: ImpactMetrics = {
        total_stories: storyMetrics.length,
        active_storytellers: uniqueStorytellers.size,
        themes_identified: uniqueThemes.size,
        communities_reached: uniqueLocations.size,
        policy_influences: Math.floor(storyMetrics.length / 50), // Simplified calculation
        average_sentiment: storyMetrics.reduce((sum, s) => sum + (s.sentiment_score || 0), 0) / storyMetrics.length,
        engagement_rate: 0.65, // Placeholder - would calculate from actual engagement data
        growth_percentage: growthPercentage
      };

      this.setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching impact metrics:', error);
      return {
        total_stories: 0,
        active_storytellers: 0,
        themes_identified: 0,
        communities_reached: 0,
        policy_influences: 0,
        average_sentiment: 0,
        engagement_rate: 0,
        growth_percentage: 0
      };
    }
  }

  // =====================================================================
  // REAL-TIME UPDATES
  // =====================================================================

  /**
   * Subscribe to real-time story updates
   */
  subscribeToStoryUpdates(callback: (payload: any) => void): () => void {
    const channel = this.supabase
      .channel('story-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories'
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set('story-updates', channel);

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      this.realtimeChannels.delete('story-updates');
    };
  }

  // =====================================================================
  // UTILITY METHODS
  // =====================================================================

  /**
   * Get cached data if still valid
   */
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get time key based on granularity
   */
  private getTimeKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (granularity) {
      case 'day':
        return `${year}-${month}-${day}`;
      case 'week':
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${String(weekNumber).padStart(2, '0')}`;
      case 'month':
        return `${year}-${month}`;
    }
  }

  /**
   * Get week number of the year
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Generate consistent colors for themes
   */
  private generateThemeColors(): string[] {
    return [
      '#2563eb', // Blue
      '#dc2626', // Red
      '#16a34a', // Green
      '#f59e0b', // Amber
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#ec4899', // Pink
      '#10b981', // Emerald
      '#6366f1', // Indigo
    ];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Unsubscribe from all real-time channels
    this.realtimeChannels.forEach(channel => {
      channel.unsubscribe();
    });
    this.realtimeChannels.clear();
    this.cache.clear();
  }
}

// Export singleton instance
export const visualizationData = new VisualizationDataService();