/**
 * PROFESSIONAL SUPABASE CLIENT ARCHITECTURE
 * Based on 2024/2025 best practices for production applications
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =====================================================================
// CLIENT-SIDE SUPABASE CLIENT (for public content)
// =====================================================================

export const supabaseClient = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,  // For CMS content, we don't need sessions
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,  // Rate limit for production
    },
  },
});

// =====================================================================
// SERVER-SIDE ADMIN CLIENT (for admin operations only)
// =====================================================================

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================================
// PROFESSIONAL DATA FETCHING FUNCTIONS
// =====================================================================

/**
 * Get public storytellers - uses proper RLS policies
 * This is the RIGHT way to do it in production
 */
export async function getPublicStorytellers(options: {
  limit?: number;
  projectName?: string;
  withImages?: boolean;
} = {}) {
  const { limit = 10, projectName, withImages = false } = options;

  try {
    // Build query with proper Supabase patterns
    let query = supabaseClient
      .from('users')
      .select(`
        id,
        full_name,
        profile_image_url,
        bio,
        community_affiliation,
        primary_location_id,
        project_id,
        locations!primary_location_id(
          id,
          name,
          state,
          country
        )
      `)
      .eq('role', 'storyteller')
      .order('created_at', { ascending: false });

    // Apply filters
    if (withImages) {
      query = query.not('profile_image_url', 'is', null);
    }

    if (projectName) {
      // Proper way to filter by project name
      const { data: projects } = await supabaseClient
        .from('projects')
        .select('id')
        .ilike('name', `%${projectName}%`)
        .limit(1);

      if (projects && projects.length > 0) {
        query = query.eq('project_id', projects[0].id);
      }
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error('Error fetching storytellers:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };

  } catch (error) {
    console.error('Exception in getPublicStorytellers:', error);
    return { data: [], error: 'Failed to fetch storytellers' };
  }
}

/**
 * Get quotes with proper RLS - no more 400 errors
 */
export async function getPublicQuotes(options: {
  limit?: number;
  themes?: string[];
} = {}) {
  const { limit = 10, themes } = options;

  try {
    let query = supabaseClient
      .from('quotes')
      .select('id, quote_text, context, themes')  // Using correct column name
      .order('created_at', { ascending: false });

    // Filter by themes if provided
    if (themes && themes.length > 0) {
      query = query.overlaps('themes', themes);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error('Error fetching quotes:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };

  } catch (error) {
    console.error('Exception in getPublicQuotes:', error);
    return { data: [], error: 'Failed to fetch quotes' };
  }
}

/**
 * Professional health check function
 */
export async function checkSupabaseHealth() {
  try {
    const start = Date.now();
    
    // Test basic connectivity
    const { data, error } = await supabaseClient
      .from('users')
      .select('id')
      .eq('role', 'storyteller')
      .limit(1);

    const responseTime = Date.now() - start;

    return {
      healthy: !error,
      responseTime,
      error: error?.message || null,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    return {
      healthy: false,
      responseTime: -1,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================================
// ADMIN FUNCTIONS (use sparingly, only for admin operations)
// =====================================================================

/**
 * Admin-only function to bypass RLS for management tasks
 * Only use this for admin dashboards, not public content
 */
export async function getStorytellersAdmin(limit: number = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        profile_image_url,
        created_at,
        last_sign_in_at
      `)
      .eq('role', 'storyteller')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };

  } catch (error) {
    console.error('Admin storytellers fetch failed:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Admin fetch failed'
    };
  }
}

// =====================================================================
// TYPES (matching your existing interfaces)
// =====================================================================

export interface PublicStoryteller {
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
}

export interface PublicQuote {
  id: string;
  quote_text: string;
  context?: string;
  themes?: string[];
}

export default supabaseClient;