/**
 * EMPATHY LEDGER AUTHENTICATION SYSTEM
 * Advanced Supabase Auth with privacy-first user management
 */

import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// =====================================================================
// USER MANAGEMENT
// =====================================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  age_range?: string;
  location_general?: string;
  languages_spoken?: string[];
  role:
    | 'storyteller'
    | 'organization_admin'
    | 'community_moderator'
    | 'platform_admin'
    | 'researcher';
  privacy_settings: PrivacySettings;
  notification_preferences: NotificationPreferences;
  stories_contributed: number;
  communities_joined: number;
  insights_generated: number;
  is_verified: boolean;
  is_active: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  show_profile: 'public' | 'community' | 'private';
  show_stories: 'public' | 'community' | 'private';
  show_location: boolean;
  show_age_range: boolean;
  allow_contact: boolean;
  allow_research_participation: boolean;
  data_retention_preference: 'standard' | 'minimal' | 'extended';
}

export interface NotificationPreferences {
  email_story_responses: boolean;
  email_community_updates: boolean;
  email_insights_generated: boolean;
  email_platform_updates: boolean;
  push_story_responses: boolean;
  push_community_activity: boolean;
  push_insights_ready: boolean;
}

// =====================================================================
// AUTHENTICATION FUNCTIONS
// =====================================================================

/**
 * Sign up a new user with privacy-first defaults
 */
export async function signUpUser(
  email: string,
  password: string,
  userData: {
    full_name?: string;
    display_name?: string;
    age_range?: string;
    location_general?: string;
    role?: UserProfile['role'];
  }
): Promise<{ user: User | null; error: any }> {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          display_name:
            userData.display_name ||
            userData.full_name?.split(' ')[0] ||
            'Storyteller',
        },
      },
    });

    if (authError) {
      return { user: null, error: authError };
    }

    // Create user profile with privacy-first defaults
    if (authData.user) {
      const profileData = {
        id: authData.user.id,
        email,
        full_name: userData.full_name || null,
        display_name:
          userData.display_name ||
          userData.full_name?.split(' ')[0] ||
          'Anonymous',
        age_range: userData.age_range || null,
        location_general: userData.location_general || null,
        role: userData.role || 'storyteller',
        privacy_settings: {
          show_profile: 'community' as const,
          show_stories: 'community' as const,
          show_location: false,
          show_age_range: false,
          allow_contact: true,
          allow_research_participation: false,
          data_retention_preference: 'standard' as const,
        },
        notification_preferences: {
          email_story_responses: true,
          email_community_updates: false,
          email_insights_generated: true,
          email_platform_updates: false,
          push_story_responses: true,
          push_community_activity: false,
          push_insights_ready: true,
        },
        is_verified: false,
        is_active: true,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: profileError };
      }
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Sign in user and sync profile data
 */
export async function signInUser(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // Update last active timestamp
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { user: null, session: null, error };
  }
}

/**
 * Get current user profile with all data
 */
export async function getUserProfile(
  userId: string
): Promise<{ profile: UserProfile | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { profile: null, error };
    }

    return { profile: data as UserProfile, error: null };
  } catch (error) {
    return { profile: null, error };
  }
}

/**
 * Update user profile with privacy validation
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error: any }> {
  try {
    // Validate privacy settings if being updated
    if (updates.privacy_settings) {
      const validatedSettings = validatePrivacySettings(
        updates.privacy_settings
      );
      updates.privacy_settings = validatedSettings;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Sign out user and clean up session data
 */
export async function signOutUser(): Promise<{ error: any }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

// =====================================================================
// PRIVACY & CONSENT MANAGEMENT
// =====================================================================

/**
 * Validate and sanitize privacy settings
 */
function validatePrivacySettings(
  settings: Partial<PrivacySettings>
): PrivacySettings {
  return {
    show_profile: settings.show_profile || 'community',
    show_stories: settings.show_stories || 'community',
    show_location: settings.show_location ?? false,
    show_age_range: settings.show_age_range ?? false,
    allow_contact: settings.allow_contact ?? true,
    allow_research_participation:
      settings.allow_research_participation ?? false,
    data_retention_preference: settings.data_retention_preference || 'standard',
  };
}

/**
 * Request data deletion (GDPR Right to be Forgotten)
 */
export async function requestDataDeletion(
  userId: string,
  reason?: string
): Promise<{ success: boolean; error: any }> {
  try {
    // Mark user for deletion (actual deletion handled by scheduled job)
    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        deletion_requested_at: new Date().toISOString(),
        deletion_reason: reason || 'User requested',
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error };
    }

    // Sign out user
    await signOutUser();

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Export user data (GDPR Data Portability)
 */
export async function exportUserData(
  userId: string
): Promise<{ data: any | null; error: any }> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return { data: null, error: profileError };
    }

    // Get user stories
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .eq('contributor_id', userId);

    if (storiesError) {
      return { data: null, error: storiesError };
    }

    // Get user reactions
    const { data: reactions, error: reactionsError } = await supabase
      .from('story_reactions')
      .select('*')
      .eq('user_id', userId);

    if (reactionsError) {
      return { data: null, error: reactionsError };
    }

    // Get user comments
    const { data: comments, error: commentsError } = await supabase
      .from('story_comments')
      .select('*')
      .eq('user_id', userId);

    if (commentsError) {
      return { data: null, error: commentsError };
    }

    const exportData = {
      export_date: new Date().toISOString(),
      profile,
      stories,
      reactions,
      comments,
      data_summary: {
        total_stories: stories?.length || 0,
        total_reactions: reactions?.length || 0,
        total_comments: comments?.length || 0,
      },
    };

    return { data: exportData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// =====================================================================
// SESSION MANAGEMENT
// =====================================================================

/**
 * Get current session and user
 */
export async function getCurrentSession(): Promise<{
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
}> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return { session: null, user: null, profile: null };
    }

    const { profile } = await getUserProfile(session.user.id);

    return {
      session,
      user: session.user,
      profile,
    };
  } catch (error) {
    return { session: null, user: null, profile: null };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// =====================================================================
// ORGANIZATION & COMMUNITY MANAGEMENT
// =====================================================================

/**
 * Join a community
 */
export async function joinCommunity(
  userId: string,
  communityId: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: userId,
      role: 'member',
    });

    if (error) {
      return { success: false, error };
    }

    // Update user's communities joined count
    await supabase.rpc('increment_communities_joined', { user_id: userId });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Leave a community
 */
export async function leaveCommunity(
  userId: string,
  communityId: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error };
    }

    // Update user's communities joined count
    await supabase.rpc('decrement_communities_joined', { user_id: userId });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Get user's communities
 */
export async function getUserCommunities(
  userId: string
): Promise<{ communities: any[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .select(
        `
        *,
        communities (
          id,
          name,
          slug,
          description,
          member_count,
          story_count,
          is_active
        )
      `
      )
      .eq('user_id', userId);

    if (error) {
      return { communities: [], error };
    }

    return { communities: data || [], error: null };
  } catch (error) {
    return { communities: [], error };
  }
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Check if user has permission for action
 */
export async function checkUserPermission(
  userId: string,
  action: string,
  resourceId?: string
): Promise<boolean> {
  try {
    const { profile } = await getUserProfile(userId);

    if (!profile || !profile.is_active) {
      return false;
    }

    // Basic permission checks
    switch (action) {
      case 'create_story':
        return (
          profile.role === 'storyteller' || profile.role === 'platform_admin'
        );

      case 'moderate_content':
        return (
          profile.role === 'community_moderator' ||
          profile.role === 'platform_admin'
        );

      case 'access_analytics':
        return (
          profile.role === 'organization_admin' ||
          profile.role === 'platform_admin'
        );

      case 'manage_users':
        return profile.role === 'platform_admin';

      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Generate secure avatar URL
 */
export function generateAvatarUrl(email: string, size: number = 200): string {
  // Use a privacy-friendly avatar service
  const hash = btoa(email).slice(0, 8);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email.charAt(0))}&size=${size}&background=f3f4f6&color=374151&format=svg`;
}
