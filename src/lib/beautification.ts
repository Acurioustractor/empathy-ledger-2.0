// =====================================================================
// STORY BEAUTIFICATION CLIENT LIBRARY
// =====================================================================
// Client-side utilities for interacting with the beautification system

import React from 'react';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface BeautificationStatus {
  id: string;
  title: string;
  ai_processing_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  ai_processed_at: string | null;
  ai_confidence_score: number | null;
  status_category: 'success' | 'error' | 'in_progress' | 'pending';
  completeness: 'complete' | 'partial' | 'not_processed';
  processing_time_minutes: number | null;
}

export interface BeautifiedStory {
  id: string;
  title: string;
  content: string;
  
  // Original fields
  transcription?: string;
  themes: string[];
  
  // Beautified fields
  beautified_title?: string;
  beautified_content?: string;
  executive_summary?: string;
  key_quotes?: string[];
  emotional_tone?: string;
  readability_score?: number;
  
  // Enhanced classification
  auto_generated_themes?: string[];
  content_categories?: string[];
  sensitivity_flags?: string[];
  topic_tags?: string[];
  
  // Engagement content
  social_share_text?: string;
  newsletter_excerpt?: string;
  search_keywords?: string[];
  
  // Quality scores
  content_completeness_score?: number;
  narrative_coherence_score?: number;
  impact_potential_score?: number;
  
  // Processing metadata
  ai_processing_status: string;
  ai_processed_at?: string;
  ai_confidence_score?: number;
}

/**
 * Get beautification status for stories
 */
export async function getBeautificationStatus(limit = 50): Promise<BeautificationStatus[]> {
  const { data, error } = await supabase
    .from('story_beautification_status')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch beautification status: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a beautified story with all enhanced content
 */
export async function getBeautifiedStory(storyId: string): Promise<BeautifiedStory | null> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      transcription,
      themes,
      beautified_title,
      beautified_content,
      executive_summary,
      key_quotes,
      emotional_tone,
      readability_score,
      auto_generated_themes,
      content_categories,
      sensitivity_flags,
      topic_tags,
      social_share_text,
      newsletter_excerpt,
      search_keywords,
      content_completeness_score,
      narrative_coherence_score,
      impact_potential_score,
      ai_processing_status,
      ai_processed_at,
      ai_confidence_score
    `)
    .eq('id', storyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch beautified story: ${error.message}`);
  }

  return data;
}

/**
 * Manually trigger beautification for a story
 */
export async function triggerBeautification(storyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('trigger_ai_processing_for_story', { story_id: storyId });

  if (error) {
    throw new Error(`Failed to trigger beautification: ${error.message}`);
  }

  return data;
}

/**
 * Get stories by processing status
 */
export async function getStoriesByProcessingStatus(
  status: BeautificationStatus['ai_processing_status'],
  limit = 20
): Promise<BeautifiedStory[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      beautified_title,
      beautified_content,
      executive_summary,
      themes,
      ai_processing_status,
      ai_processed_at,
      ai_confidence_score,
      created_at
    `)
    .eq('ai_processing_status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch stories by status: ${error.message}`);
  }

  return data || [];
}

/**
 * Search beautified stories by keywords or themes
 */
export async function searchBeautifiedStories(
  query: string,
  searchFields: ('title' | 'content' | 'themes' | 'keywords')[] = ['title', 'content'],
  limit = 20
): Promise<BeautifiedStory[]> {
  let selectQuery = supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      beautified_title,
      beautified_content,
      executive_summary,
      themes,
      ai_processing_status,
      key_quotes,
      emotional_tone,
      auto_generated_themes,
      content_categories,
      search_keywords,
      ai_confidence_score
    `)
    .eq('ai_processing_status', 'completed')
    .limit(limit);

  // Add search conditions based on fields
  if (searchFields.includes('title')) {
    selectQuery = selectQuery.or(`title.ilike.%${query}%,beautified_title.ilike.%${query}%`);
  }
  
  if (searchFields.includes('content')) {
    selectQuery = selectQuery.or(`beautified_content.ilike.%${query}%`);
  }
  
  if (searchFields.includes('themes')) {
    selectQuery = selectQuery.contains('auto_generated_themes', [query]);
  }
  
  if (searchFields.includes('keywords')) {
    selectQuery = selectQuery.contains('search_keywords', [query]);
  }

  const { data, error } = await selectQuery;

  if (error) {
    throw new Error(`Failed to search beautified stories: ${error.message}`);
  }

  return data || [];
}

/**
 * Get processing statistics
 */
export async function getProcessingStats(): Promise<{
  total_stories: number;
  completed: number;
  pending: number;
  processing: number;
  failed: number;
  success_rate: number;
  avg_processing_time_minutes: number;
}> {
  const { data, error } = await supabase
    .from('story_beautification_status')
    .select('ai_processing_status, processing_time_minutes');

  if (error) {
    throw new Error(`Failed to fetch processing stats: ${error.message}`);
  }

  const stats = data?.reduce((acc, story) => {
    acc.total_stories++;
    
    switch (story.ai_processing_status) {
      case 'completed':
        acc.completed++;
        if (story.processing_time_minutes) {
          acc.total_processing_time += story.processing_time_minutes;
          acc.processed_count++;
        }
        break;
      case 'pending':
        acc.pending++;
        break;
      case 'processing':
        acc.processing++;
        break;
      case 'failed':
        acc.failed++;
        break;
    }
    
    return acc;
  }, {
    total_stories: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    failed: 0,
    total_processing_time: 0,
    processed_count: 0
  }) || {
    total_stories: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    failed: 0,
    total_processing_time: 0,
    processed_count: 0
  };

  return {
    ...stats,
    success_rate: stats.total_stories > 0 ? (stats.completed / stats.total_stories) * 100 : 0,
    avg_processing_time_minutes: stats.processed_count > 0 ? stats.total_processing_time / stats.processed_count : 0
  };
}

/**
 * Hook for real-time beautification status updates
 */
export function useBeautificationStatus(storyId?: string) {
  const [status, setStatus] = React.useState<BeautificationStatus | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!storyId) return;

    // Initial fetch
    getBeautificationStatus(1).then(data => {
      const storyStatus = data.find(s => s.id === storyId);
      setStatus(storyStatus || null);
      setLoading(false);
    });

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`story-beautification-${storyId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'stories',
        filter: `id=eq.${storyId}`
      }, (payload) => {
        // Refetch status when story is updated
        getBeautificationStatus(1).then(data => {
          const storyStatus = data.find(s => s.id === storyId);
          setStatus(storyStatus || null);
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [storyId]);

  return { status, loading };
}