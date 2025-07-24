/**
 * EMPATHY LEDGER STORYTELLER MANAGEMENT
 * Functions for managing and displaying storyteller data
 */

import { createClient } from './supabase-client';
import { Database } from './database.types';

type User = Database['public']['Tables']['users']['Row'];
type Story = Database['public']['Tables']['stories']['Row'];

export interface Storyteller extends User {
  story_count?: number;
  latest_story_date?: string;
  primary_themes?: string[];
  impact_score?: number;
}

export interface StorytellerWithStories extends Storyteller {
  stories?: Story[];
}

/**
 * Get a list of storytellers with their story counts and metadata
 */
export async function getStorytellers(options?: {
  limit?: number;
  offset?: number;
  projectId?: string;
  organizationId?: string;
  includeStories?: boolean;
}) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Supabase client not available');

    const limit = options?.limit || 12;
    const offset = options?.offset || 0;

    // First, get storytellers from users table
    let query = supabase
      .from('users')
      .select(`
        *,
        stories:stories!storyteller_id(
          id,
          title,
          status,
          created_at,
          linked_themes,
          privacy_level
        )
      `)
      .eq('role', 'storyteller')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.projectId) {
      query = query.eq('project', options.projectId);
    }

    const { data: storytellers, error } = await query;

    if (error) throw error;

    // Process storytellers to add computed fields
    const processedStorytellers = storytellers?.map(storyteller => {
      const publicStories = (storyteller.stories as any[] || [])
        .filter(story => story.status === 'Published' && story.privacy_level === 'public');
      
      // Extract unique themes from all stories
      const allThemes = publicStories.flatMap(story => story.linked_themes || []);
      const uniqueThemes = [...new Set(allThemes)].slice(0, 5);
      
      return {
        ...storyteller,
        story_count: publicStories.length,
        latest_story_date: publicStories[0]?.created_at,
        primary_themes: uniqueThemes,
        stories: options?.includeStories ? publicStories : undefined
      } as StorytellerWithStories;
    }) || [];

    return {
      storytellers: processedStorytellers,
      total: processedStorytellers.length,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching storytellers:', error);
    return {
      storytellers: [],
      total: 0,
      limit: options?.limit || 12,
      offset: options?.offset || 0,
      error
    };
  }
}

/**
 * Get a single storyteller by ID with their stories
 */
export async function getStorytellerById(storytellerId: string) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Supabase client not available');

    const { data: storyteller, error } = await supabase
      .from('users')
      .select(`
        *,
        stories:stories!storyteller_id(
          id,
          title,
          story_copy,
          story_transcript,
          story_image_url,
          video_story_link,
          linked_themes,
          status,
          privacy_level,
          created_at,
          view_count,
          featured
        )
      `)
      .eq('id', storytellerId)
      .single();

    if (error) throw error;

    // Filter for public stories only
    const publicStories = ((storyteller as any).stories || [])
      .filter((story: any) => story.status === 'Published' && story.privacy_level === 'public')
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calculate impact score based on views and features
    const totalViews = publicStories.reduce((sum: number, story: any) => sum + (story.view_count || 0), 0);
    const featuredCount = publicStories.filter((story: any) => story.featured).length;
    const impactScore = Math.min(10, (totalViews / 100) + (featuredCount * 2));

    return {
      ...storyteller,
      stories: publicStories,
      story_count: publicStories.length,
      impact_score: Math.round(impactScore * 10) / 10
    } as StorytellerWithStories;
  } catch (error) {
    console.error('Error fetching storyteller:', error);
    return null;
  }
}

/**
 * Get featured storytellers
 */
export async function getFeaturedStorytellers(limit: number = 3) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Supabase client not available');

    // Get storytellers who have featured stories
    const { data: featuredStories, error } = await supabase
      .from('stories')
      .select(`
        storyteller_id,
        users!storyteller_id(
          id,
          full_name,
          preferred_name,
          profile_image_url,
          bio,
          location,
          expertise_areas,
          cultural_background
        )
      `)
      .eq('featured', true)
      .eq('status', 'Published')
      .eq('privacy_level', 'public')
      .order('created_at', { ascending: false })
      .limit(limit * 3); // Get more to ensure unique storytellers

    if (error) throw error;

    // Get unique storytellers
    const uniqueStorytellers = new Map();
    featuredStories?.forEach(story => {
      const user = (story as any).users;
      if (user && !uniqueStorytellers.has(user.id)) {
        uniqueStorytellers.set(user.id, user);
      }
    });

    return Array.from(uniqueStorytellers.values()).slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured storytellers:', error);
    return [];
  }
}

/**
 * Search storytellers by name, location, or expertise
 */
export async function searchStorytellers(searchTerm: string, options?: {
  limit?: number;
  projectId?: string;
}) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Supabase client not available');

    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'storyteller')
      .or(`full_name.ilike.%${searchTerm}%,preferred_name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
      .limit(options?.limit || 20);

    if (options?.projectId) {
      query = query.eq('project', options.projectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching storytellers:', error);
    return [];
  }
}

/**
 * Get storyteller statistics for analytics
 */
export async function getStorytellerStats(projectId?: string) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Supabase client not available');

    // Get total storyteller count
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'storyteller');

    if (projectId) {
      countQuery = countQuery.eq('project', projectId);
    }

    const { count: totalStorytellers } = await countQuery;

    // Get active storytellers (those with stories in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentStories } = await supabase
      .from('stories')
      .select('storyteller_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('status', 'Published');

    const activeStorytellers = new Set(recentStories?.map(s => s.storyteller_id)).size;

    // Get location distribution
    const { data: locations } = await supabase
      .from('users')
      .select('location')
      .eq('role', 'storyteller')
      .not('location', 'is', null);

    const locationCounts = locations?.reduce((acc, user) => {
      const loc = user.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total_storytellers: totalStorytellers || 0,
      active_storytellers: activeStorytellers,
      location_distribution: locationCounts,
      engagement_rate: totalStorytellers ? (activeStorytellers / totalStorytellers) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting storyteller stats:', error);
    return {
      total_storytellers: 0,
      active_storytellers: 0,
      location_distribution: {},
      engagement_rate: 0
    };
  }
}