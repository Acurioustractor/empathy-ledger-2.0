/**
 * PROFESSIONAL SUPABASE REACT HOOKS
 * Production-ready patterns used by major companies
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getPublicStorytellers, 
  getPublicQuotes, 
  checkSupabaseHealth,
  PublicStoryteller,
  PublicQuote 
} from '@/lib/supabase-professional';

// =====================================================================
// GENERIC HOOK STATE INTERFACE
// =====================================================================

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// =====================================================================
// STORYTELLERS HOOK - Professional Implementation
// =====================================================================

export function useStorytellers(options: {
  limit?: number;
  projectName?: string;
  withImages?: boolean;
  autoFetch?: boolean;
} = {}): ApiState<PublicStoryteller[]> {
  
  const { 
    limit = 10, 
    projectName, 
    withImages = false, 
    autoFetch = true 
  } = options;

  const [state, setState] = useState<ApiState<PublicStoryteller[]>>({
    data: null,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await getPublicStorytellers({
        limit,
        projectName,
        withImages,
      });

      if (result.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error,
          data: [], // Empty array instead of null for consistency
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          data: result.data,
        }));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch storytellers';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        data: [],
      }));
    }
  }, [limit, projectName, withImages]);

  // Set refresh function
  useEffect(() => {
    setState(prev => ({ ...prev, refresh: fetchData }));
  }, [fetchData]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return state;
}

// =====================================================================
// QUOTES HOOK - Professional Implementation
// =====================================================================

export function useQuotes(options: {
  limit?: number;
  themes?: string[];
  autoFetch?: boolean;
} = {}): ApiState<PublicQuote[]> {
  
  const { limit = 10, themes, autoFetch = true } = options;

  const [state, setState] = useState<ApiState<PublicQuote[]>>({
    data: null,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await getPublicQuotes({ limit, themes });

      if (result.error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error,
          data: [],
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          data: result.data,
        }));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quotes';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        data: [],
      }));
    }
  }, [limit, JSON.stringify(themes)]);

  useEffect(() => {
    setState(prev => ({ ...prev, refresh: fetchData }));
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return state;
}

// =====================================================================
// HEALTH MONITORING HOOK
// =====================================================================

export function useSupabaseHealth(): ApiState<{
  healthy: boolean;
  responseTime: number;
  timestamp: string;
}> {
  const [state, setState] = useState<ApiState<{
    healthy: boolean;
    responseTime: number;
    timestamp: string;
  }>>({
    data: null,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  const checkHealth = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const health = await checkSupabaseHealth();
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: health.error,
        data: {
          healthy: health.healthy,
          responseTime: health.responseTime,
          timestamp: health.timestamp,
        },
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        data: {
          healthy: false,
          responseTime: -1,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  }, []);

  useEffect(() => {
    setState(prev => ({ ...prev, refresh: checkHealth }));
  }, [checkHealth]);

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return state;
}

// =====================================================================
// CONVENIENCE HOOKS FOR SPECIFIC USE CASES
// =====================================================================

/**
 * Hook specifically for storyteller cards on case study pages
 */
export function useStorytellerCards(projectName: string, limit: number = 3) {
  return useStorytellers({
    projectName,
    limit,
    withImages: true,
    autoFetch: true,
  });
}

/**
 * Hook for testimonials/quotes on landing pages
 */
export function useTestimonials(themes?: string[], limit: number = 6) {
  return useQuotes({
    themes,
    limit,
    autoFetch: true,
  });
}

// =====================================================================
// EXPORT TYPES
// =====================================================================

export type { ApiState, PublicStoryteller, PublicQuote };