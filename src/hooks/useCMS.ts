/**
 * EMPATHY LEDGER CMS HOOKS
 * 
 * React hooks for using CMS data consistently across the site.
 * These handle loading states, errors, and caching automatically.
 */

import { useState, useEffect } from 'react';
import {
  getStorytellers,
  getProjects,
  getQuotes,
  testCMSConnection,
  CMSStoryteller,
  CMSProject,
  CMSQuote,
  FALLBACK_STORYTELLERS,
  FALLBACK_QUOTES,
} from '@/lib/cms-core';

// Generic hook state interface
interface CMSHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook for fetching storytellers with all their connected data
 */
export function useStorytellers(options: {
  limit?: number;
  projectName?: string;
  withProfileImages?: boolean;
  useFallback?: boolean;
} = {}): CMSHookState<CMSStoryteller[]> {
  const [state, setState] = useState<CMSHookState<CMSStoryteller[]>>({
    data: null,
    loading: true,
    error: null,
    refresh: () => {},
  });

  const { limit = 10, projectName, withProfileImages = false, useFallback = true } = options;

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const storytellers = await getStorytellers({
        limit,
        projectName,
        withProfileImages,
      });

      // Use fallback data if no results and fallback is enabled
      const finalData = storytellers.length > 0 ? storytellers : 
        (useFallback ? FALLBACK_STORYTELLERS.slice(0, limit) : []);

      setState(prev => ({
        ...prev,
        data: finalData,
        loading: false,
      }));
    } catch (error) {
      console.error('❌ useStorytellers error:', error);
      setState(prev => ({
        ...prev,
        data: useFallback ? FALLBACK_STORYTELLERS.slice(0, limit) : [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load storytellers',
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit, projectName, withProfileImages]);

  return {
    ...state,
    refresh: fetchData,
  };
}

/**
 * Hook for fetching projects
 */
export function useProjects(options: {
  limit?: number;
} = {}): CMSHookState<CMSProject[]> {
  const [state, setState] = useState<CMSHookState<CMSProject[]>>({
    data: null,
    loading: true,
    error: null,
    refresh: () => {},
  });

  const { limit = 10 } = options;

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const projects = await getProjects({ limit });

      setState(prev => ({
        ...prev,
        data: projects,
        loading: false,
      }));
    } catch (error) {
      console.error('❌ useProjects error:', error);
      setState(prev => ({
        ...prev,
        data: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load projects',
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  return {
    ...state,
    refresh: fetchData,
  };
}

/**
 * Hook for fetching quotes
 */
export function useQuotes(options: {
  limit?: number;
  themes?: string[];
  useFallback?: boolean;
} = {}): CMSHookState<CMSQuote[]> {
  const [state, setState] = useState<CMSHookState<CMSQuote[]>>({
    data: null,
    loading: true,
    error: null,
    refresh: () => {},
  });

  const { limit = 10, themes, useFallback = true } = options;

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const quotes = await getQuotes({ limit, themes });

      // Use fallback data if no results and fallback is enabled
      const finalData = quotes.length > 0 ? quotes : 
        (useFallback ? FALLBACK_QUOTES.slice(0, limit) : []);

      setState(prev => ({
        ...prev,
        data: finalData,
        loading: false,
      }));
    } catch (error) {
      console.error('❌ useQuotes error:', error);
      setState(prev => ({
        ...prev,
        data: useFallback ? FALLBACK_QUOTES.slice(0, limit) : [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load quotes',
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit, JSON.stringify(themes)]);

  return {
    ...state,
    refresh: fetchData,
  };
}

/**
 * Hook for CMS health monitoring
 */
export function useCMSHealth(): CMSHookState<{
  healthy: boolean;
  storytellers: number;
  projects: number;
  quotes: number;
}> {
  const [state, setState] = useState<CMSHookState<{
    healthy: boolean;
    storytellers: number;
    projects: number;
    quotes: number;
  }>>({
    data: null,
    loading: true,
    error: null,
    refresh: () => {},
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const health = await testCMSConnection();

      setState(prev => ({
        ...prev,
        data: {
          healthy: health.healthy,
          storytellers: health.storytellers,
          projects: health.projects,
          quotes: health.quotes,
        },
        loading: false,
        error: health.error || null,
      }));
    } catch (error) {
      console.error('❌ useCMSHealth error:', error);
      setState(prev => ({
        ...prev,
        data: { healthy: false, storytellers: 0, projects: 0, quotes: 0 },
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check CMS health',
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...state,
    refresh: fetchData,
  };
}

/**
 * Custom hook for storyteller cards (specific to case studies)
 */
export function useStorytellerCards(options: {
  projectName?: string;
  limit?: number;
} = {}) {
  return useStorytellers({
    ...options,
    withProfileImages: true,
    useFallback: true,
  });
}

/**
 * Custom hook for testimonials
 */
export function useTestimonials(options: {
  limit?: number;
  themes?: string[];
} = {}) {
  const quotesResult = useQuotes({
    ...options,
    useFallback: true,
  });

  // Transform quotes into testimonial format
  const data = quotesResult.data?.map(quote => ({
    id: quote.id,
    quote_text: quote.quote_text,
    storyteller: {
      id: `storyteller-${quote.id}`,
      full_name: 'Community Member',
      profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&q=80',
      community_affiliation: 'Community Network',
      location: 'Australia',
    },
  })) || [];

  return {
    ...quotesResult,
    data,
  };
}

// Export types for use across the site
export type { CMSStoryteller, CMSProject, CMSQuote, CMSHookState };