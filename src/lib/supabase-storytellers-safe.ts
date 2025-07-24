/**
 * SAFE STORYTELLER MANAGEMENT - Works around RLS issues
 * Temporary functions that work with current database setup
 */

import { createClient } from './supabase-client';

export interface SafeStoryteller {
  id: string;
  email: string | null;
  story_count: number;
  latest_activity: string | null;
  primary_themes: string[];
  created_at: string;
}

/**
 * Get storytellers safely without triggering RLS issues
 */
export async function getStorytellersSafe(options?: {
  limit?: number;
  offset?: number;
}) {
  const { limit = 20, offset = 0 } = options || {};
  
  try {
    const supabase = await createClient();
    
    // Step 1: Get basic storyteller data without joins
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        preferred_name,
        profile_image_url,
        bio,
        location,
        community_affiliation,
        cultural_background,
        expertise_areas,
        created_at
      `)
      .eq('role', 'storyteller')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.log('Users query error:', usersError);
      return { storytellers: [], total: 0, error: usersError };
    }

    if (!users || users.length === 0) {
      return { storytellers: [], total: 0, error: null };
    }

    // Step 2: Get story counts separately to avoid relationship issues
    const storytellerIds = users.map(u => u.id);
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('storyteller_id, linked_themes, created_at')
      .in('storyteller_id', storytellerIds)
      .eq('status', 'Published')
      .eq('privacy_level', 'public');

    // Step 3: Process and combine data
    const storytellers: SafeStoryteller[] = users.map(user => {
      const userStories = stories?.filter(s => s.storyteller_id === user.id) || [];
      
      // Extract themes from stories
      const allThemes = userStories.flatMap(story => story.linked_themes || []);
      const uniqueThemes = [...new Set(allThemes)].slice(0, 3);
      
      // Find latest activity
      const latestStory = userStories
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      return {
        id: user.id,
        full_name: user.full_name,
        preferred_name: user.preferred_name,
        profile_image_url: user.profile_image_url,
        bio: user.bio,
        location: user.location,
        community_affiliation: user.community_affiliation,
        cultural_background: user.cultural_background,
        expertise_areas: user.expertise_areas,
        story_count: userStories.length,
        latest_activity: latestStory?.created_at || null,
        primary_themes: uniqueThemes,
        created_at: user.created_at
      };
    });

    // Get total count
    const { count: totalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'storyteller');

    return {
      storytellers,
      total: totalCount || 0,
      error: null
    };

  } catch (error) {
    console.error('Error in getStorytellersSafe:', error);
    return { 
      storytellers: [], 
      total: 0, 
      error: error.message || 'Unknown error' 
    };
  }
}

/**
 * Get a single storyteller with all connections
 */
export async function getStorytellerWithConnectionsSafe(storytellerId: string) {
  try {
    const supabase = await createClient();

    // Get storyteller basic info
    const { data: storyteller, error: storytellerError } = await supabase
      .from('users')
      .select(`
        id, full_name, preferred_name, profile_image_url, bio,
        location, community_affiliation, cultural_background,
        expertise_areas, languages_spoken, core_values,
        sharing_motivations, created_at, updated_at
      `)
      .eq('id', storytellerId)
      .eq('role', 'storyteller')
      .single();

    if (storytellerError) throw storytellerError;

    // Get stories
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, story_copy, linked_themes, created_at, status, privacy_level')
      .eq('storyteller_id', storytellerId)
      .eq('status', 'Published')
      .eq('privacy_level', 'public');

    // Get media content
    const { data: media } = await supabase
      .from('media_content')
      .select('id, title, type, media_url, file_size, created_at')
      .eq('storyteller_id', storytellerId);

    // Get quotes (through stories)
    const storyIds = stories?.map(s => s.id) || [];
    const { data: quotes } = storyIds.length > 0 ? await supabase
      .from('story_quotes')
      .select('id, quote_text, themes, impact_score, created_at')
      .in('story_id', storyIds) : { data: [] };

    // Get project connections (through story_project_links)
    const { data: projectLinks } = storyIds.length > 0 ? await supabase
      .from('story_project_links')
      .select(`
        relevance_score,
        projects(name, description)
      `)
      .in('story_id', storyIds) : { data: [] };

    // Get location data
    const { data: locationData } = await supabase
      .from('locations')
      .select('name, country, region')
      .eq('id', storyteller.primary_location_id || '');

    // Compile all connections
    const allThemes = stories?.flatMap(s => s.linked_themes || []) || [];
    const uniqueThemes = [...new Set(allThemes)];
    
    const uniqueProjects = [...new Set(
      projectLinks?.map(pl => (pl as any).projects?.name).filter(Boolean) || []
    )];

    return {
      storyteller,
      connections: {
        stories: stories || [],
        media: media || [],
        quotes: quotes || [],
        themes: uniqueThemes,
        projects: uniqueProjects,
        location: locationData?.[0] || null,
        totals: {
          stories: stories?.length || 0,
          media: media?.length || 0,
          quotes: quotes?.length || 0,
          themes: uniqueThemes.length,
          projects: uniqueProjects.length
        }
      },
      error: null
    };

  } catch (error) {
    console.error('Error getting storyteller connections:', error);
    return {
      storyteller: null,
      connections: null,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Get storyteller statistics safely
 */
export async function getStorytellerStatsSafe() {
  try {
    const supabase = await createClient();

    // Get total storytellers
    const { count: totalStorytellers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'storyteller');

    // Get active storytellers (those with published stories)
    const { data: activeStorytellerIds } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('status', 'Published')
      .eq('privacy_level', 'public');

    const uniqueActiveStorytellers = new Set(
      activeStorytellerIds?.map(s => s.storyteller_id) || []
    ).size;

    // Calculate engagement rate
    const engagementRate = totalStorytellers ? 
      (uniqueActiveStorytellers / totalStorytellers) * 100 : 0;

    return {
      total_storytellers: totalStorytellers || 0,
      active_storytellers: uniqueActiveStorytellers,
      engagement_rate: Number(engagementRate.toFixed(1)),
      error: null
    };

  } catch (error) {
    console.error('Error getting storyteller stats:', error);
    return {
      total_storytellers: 0,
      active_storytellers: 0,
      engagement_rate: 0,
      error: error.message || 'Unknown error'
    };
  }
}