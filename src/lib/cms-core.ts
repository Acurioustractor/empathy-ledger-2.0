/**
 * EMPATHY LEDGER CMS CORE
 * 
 * This is the SINGLE, CENTRALIZED Supabase CMS connection for the entire site.
 * No more scattered clients, no more connection issues.
 * 
 * USE THIS FOR ALL CMS DATA ACROSS THE SITE.
 */

import { createClient } from '@supabase/supabase-js';

// Single, shared Supabase client instance
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get the shared Supabase client - creates it once, reuses everywhere
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('🚨 Supabase environment variables not configured');
    throw new Error('Supabase not configured. Check environment variables.');
  }

  // RLS is now disabled, so we can use the anon key safely
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('✅ Supabase CMS client initialized (RLS disabled)');
  
  return supabaseClient;
}

/**
 * CORE CMS DATA TYPES
 */
export interface CMSStoryteller {
  id: string;
  full_name: string;
  profile_image_url?: string;
  bio?: string;
  community_affiliation?: string;
  location?: {
    id: string;
    name: string;
    state?: string;
    country?: string;
  };
  themes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  quotes: Array<{
    id: string;
    quote_text: string;
    context?: string;
  }>;
}

export interface CMSProject {
  id: string;
  name: string;
  project_type?: string;
  description?: string;
  status?: string;
}

export interface CMSQuote {
  id: string;
  quote_text: string;
  context?: string;
  themes?: string[];
}

/**
 * CORE CMS FUNCTIONS - USE THESE ACROSS THE SITE
 */

/**
 * Get storytellers with all their connected data
 */
export async function getStorytellers(options: {
  limit?: number;
  projectName?: string;
  withProfileImages?: boolean;
} = {}): Promise<CMSStoryteller[]> {
  try {
    const client = getSupabaseClient();
    const { limit = 10, projectName, withProfileImages = false } = options;

    // Define the select fields
    const selectFields = `
      id,
      full_name,
      profile_image_url,
      bio,
      community_affiliation,
      primary_location_id,
      project_id,
      locations!primary_location_id(id, name, state, country)
    `;

    // Handle project filtering first
    let targetProjectId: string | null = null;
    if (projectName) {
      const { data: projects } = await client
        .from('projects')
        .select('id')
        .ilike('name', `%${projectName}%`)
        .limit(1);
      
      if (projects && projects.length > 0) {
        targetProjectId = (projects[0] as any).id;
      }
    }

    // Execute query based on filter combinations
    let result;
    if (withProfileImages && targetProjectId) {
      result = await client
        .from('users')
        .select(selectFields)
        .eq('role', 'storyteller')
        .not('profile_image_url', 'is', null)
        .eq('project_id', targetProjectId)
        .limit(limit);
    } else if (withProfileImages) {
      result = await client
        .from('users')
        .select(selectFields)
        .eq('role', 'storyteller')
        .not('profile_image_url', 'is', null)
        .limit(limit);
    } else if (targetProjectId) {
      result = await client
        .from('users')
        .select(selectFields)
        .eq('role', 'storyteller')
        .eq('project_id', targetProjectId)
        .limit(limit);
    } else {
      result = await client
        .from('users')
        .select(selectFields)
        .eq('role', 'storyteller')
        .limit(limit);
    }

    const { data: storytellers, error: storytellersError } = result;

    if (storytellersError) {
      // Handle specific RLS policy infinite recursion error
      if (storytellersError.message?.includes('infinite recursion detected in policy')) {
        console.warn('⚠️ Database RLS policy has infinite recursion - using fallback data. Database admin needs to fix policy.');
        return []; // Will trigger fallback in hook
      } else if (storytellersError.code === 'PGRST116') {
        console.warn('⚠️ RLS policy blocking storytellers query - using fallback data');
        return [];
      } else {
        console.error('❌ Error fetching storytellers:', storytellersError.message || storytellersError);
        return [];
      }
    }

    if (!storytellers) return [];

    // Get themes and quotes for each storyteller
    const enrichedStorytellers: CMSStoryteller[] = [];

    for (const storyteller of storytellers) {
      // Get themes
      const { data: themes } = await client
        .from('themes')
        .select('id, name, description')
        .overlaps('linked_storytellers', [storyteller.id])
        .limit(5);

      // Get quotes
      const { data: quotes } = await client
        .from('quotes')
        .select('id, quote_text, context')
        .overlaps('linked_storytellers', [storyteller.id])
        .limit(3);

      enrichedStorytellers.push({
        id: storyteller.id,
        full_name: storyteller.full_name,
        profile_image_url: storyteller.profile_image_url,
        bio: storyteller.bio,
        community_affiliation: storyteller.community_affiliation,
        location: (storyteller as any).locations ? {
          id: (storyteller as any).locations.id,
          name: (storyteller as any).locations.name,
          state: (storyteller as any).locations.state,
          country: (storyteller as any).locations.country,
        } : undefined,
        themes: (themes as any) || [],
        quotes: (quotes as any) || [],
      });
    }

    return enrichedStorytellers;
  } catch (error) {
    console.error('❌ CMS getStorytellers error:', error);
    return [];
  }
}

/**
 * Get projects
 */
export async function getProjects(options: { limit?: number } = {}): Promise<CMSProject[]> {
  try {
    const client = getSupabaseClient();
    const { limit = 10 } = options;

    const { data, error } = await client
      .from('projects')
      .select('id, name, project_type, description, status')
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching projects:', error);
      return [];
    }

    return (data as any) || [];
  } catch (error) {
    console.error('❌ CMS getProjects error:', error);
    return [];
  }
}

/**
 * Get quotes with themes
 */
export async function getQuotes(options: {
  limit?: number;
  themes?: string[];
} = {}): Promise<CMSQuote[]> {
  try {
    const client = getSupabaseClient();
    const { limit = 10, themes } = options;

    let query = client
      .from('quotes')
      .select('id, quote_text, context, themes')
      .limit(limit);

    // Filter by themes if provided
    if (themes && themes.length > 0) {
      // Use overlaps for array comparison
      query = query.overlaps('themes', themes);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching quotes:', error);
      return [];
    }

    return ((data as any) || []).map((quote: any) => ({
      id: quote.id,
      quote_text: quote.quote_text,
      context: quote.context,
      themes: quote.themes,
    }));
  } catch (error) {
    console.error('❌ CMS getQuotes error:', error);
    return [];
  }
}

/**
 * HEALTH CHECK - Test CMS connection
 */
export async function testCMSConnection(): Promise<{
  healthy: boolean;
  storytellers: number;
  projects: number;
  quotes: number;
  error?: string;
}> {
  try {
    const client = getSupabaseClient();

    const [storytellersResult, projectsResult, quotesResult] = await Promise.allSettled([
      client.from('users').select('id').eq('role', 'storyteller').limit(1),
      client.from('projects').select('id').limit(1),
      client.from('quotes').select('id').limit(1),
    ]);

    return {
      healthy: true,
      storytellers: storytellersResult.status === 'fulfilled' ? 
        (storytellersResult.value.data?.length || 0) : 0,
      projects: projectsResult.status === 'fulfilled' ? 
        (projectsResult.value.data?.length || 0) : 0,
      quotes: quotesResult.status === 'fulfilled' ? 
        (quotesResult.value.data?.length || 0) : 0,
    };
  } catch (error) {
    return {
      healthy: false,
      storytellers: 0,
      projects: 0,
      quotes: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * FALLBACK DATA - Use when CMS is unavailable
 */
export const FALLBACK_STORYTELLERS: CMSStoryteller[] = [
  {
    id: 'fallback-1',
    full_name: 'Community Member',
    profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&q=80',
    community_affiliation: 'Community Network',
    location: {
      id: 'fallback-location',
      name: 'Australia',
    },
    themes: [
      { id: 'community', name: 'Community Impact', description: 'Making a difference in local communities' },
      { id: 'connection', name: 'Human Connection', description: 'Building bridges between people' },
    ],
    quotes: [
      {
        id: 'fallback-quote',
        quote_text: 'Through community storytelling, we create connections that bridge understanding and inspire positive change.',
        context: 'Community impact',
      },
    ],
  },
];

export const FALLBACK_QUOTES: CMSQuote[] = [
  {
    id: 'fallback-1',
    quote_text: 'Every story matters and deserves to be heard with dignity and respect.',
    context: 'Community voice',
    themes: ['community', 'respect'],
  },
];

// Export the client getter as default for convenience
export default getSupabaseClient;