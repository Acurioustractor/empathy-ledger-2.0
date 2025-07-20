/**
 * EMPATHY LEDGER PRIVACY MANAGEMENT SYSTEM
 * Comprehensive privacy controls with Indigenous data sovereignty principles
 */

import { supabase } from './supabase-auth';
import type { UserProfile, PrivacySettings } from './supabase-auth';

// =====================================================================
// PRIVACY LEVELS & PERMISSIONS
// =====================================================================

export interface PermissionMatrix {
  can_view_profile: boolean;
  can_view_stories: boolean;
  can_view_location: boolean;
  can_view_age_range: boolean;
  can_contact_user: boolean;
  can_see_analytics: boolean;
  can_use_for_research: boolean;
  can_ai_analyze: boolean;
  can_share_externally: boolean;
}

export interface PrivacyContext {
  viewer_id?: string;
  viewer_role?: string;
  viewer_communities?: string[];
  viewer_organization?: string;
  resource_type: 'profile' | 'story' | 'comment' | 'reaction';
  resource_privacy_level: 'public' | 'community' | 'organization' | 'private';
}

// =====================================================================
// PRIVACY CALCULATION ENGINE
// =====================================================================

/**
 * Calculate what a user can see/do based on privacy settings
 */
export function calculatePermissions(
  target_user: UserProfile,
  context: PrivacyContext
): PermissionMatrix {
  const settings = target_user.privacy_settings;
  const is_self = context.viewer_id === target_user.id;
  const is_admin = context.viewer_role === 'platform_admin';
  
  // Self and admin have full access
  if (is_self || is_admin) {
    return {
      can_view_profile: true,
      can_view_stories: true,
      can_view_location: true,
      can_view_age_range: true,
      can_contact_user: true,
      can_see_analytics: true,
      can_use_for_research: true,
      can_ai_analyze: true,
      can_share_externally: true
    };
  }

  // Anonymous user - only public content
  if (!context.viewer_id) {
    return {
      can_view_profile: settings.show_profile === 'public',
      can_view_stories: settings.show_stories === 'public',
      can_view_location: settings.show_location && settings.show_profile === 'public',
      can_view_age_range: settings.show_age_range && settings.show_profile === 'public',
      can_contact_user: false,
      can_see_analytics: false,
      can_use_for_research: false,
      can_ai_analyze: false,
      can_share_externally: false
    };
  }

  // Authenticated user permissions
  const viewer_in_same_community = hasSharedCommunity(
    target_user.id, 
    context.viewer_id,
    context.viewer_communities || []
  );

  const viewer_in_same_org = context.viewer_organization === target_user.id; // Simplified

  const can_view_profile = 
    settings.show_profile === 'public' ||
    (settings.show_profile === 'community' && viewer_in_same_community) ||
    (settings.show_profile === 'organization' && viewer_in_same_org);

  const can_view_stories = 
    settings.show_stories === 'public' ||
    (settings.show_stories === 'community' && viewer_in_same_community) ||
    (settings.show_stories === 'organization' && viewer_in_same_org);

  return {
    can_view_profile,
    can_view_stories,
    can_view_location: settings.show_location && can_view_profile,
    can_view_age_range: settings.show_age_range && can_view_profile,
    can_contact_user: settings.allow_contact && can_view_profile,
    can_see_analytics: false, // Restricted to self/admin
    can_use_for_research: settings.allow_research_participation,
    can_ai_analyze: true, // Platform-level setting
    can_share_externally: context.resource_privacy_level === 'public'
  };
}

/**
 * Check if two users share any communities
 */
function hasSharedCommunity(
  user1_id: string, 
  user2_id: string, 
  viewer_communities: string[]
): boolean {
  // This would be enhanced with actual community membership check
  return viewer_communities.length > 0;
}

// =====================================================================
// GDPR COMPLIANCE FUNCTIONS
// =====================================================================

/**
 * Data export for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<{
  data: any | null;
  error: any;
}> {
  try {
    // Get complete user data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .eq('contributor_id', userId);

    if (storiesError) throw storiesError;

    const { data: reactions, error: reactionsError } = await supabase
      .from('story_reactions')
      .select('*')
      .eq('user_id', userId);

    if (reactionsError) throw reactionsError;

    const { data: comments, error: commentsError } = await supabase
      .from('story_comments')
      .select('*')
      .eq('user_id', userId);

    if (commentsError) throw commentsError;

    const exportData = {
      export_metadata: {
        requested_at: new Date().toISOString(),
        user_id: userId,
        export_version: '1.0.0',
        compliance_note: 'This export contains all personal data stored by Empathy Ledger'
      },
      profile_data: profile,
      story_data: stories,
      interaction_data: {
        reactions: reactions,
        comments: comments
      },
      privacy_settings: profile.privacy_settings,
      summary: {
        total_stories: stories?.length || 0,
        total_reactions: reactions?.length || 0,
        total_comments: comments?.length || 0,
        account_created: profile.created_at,
        last_active: profile.last_active_at
      }
    };

    return { data: exportData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Anonymize user data (soft deletion)
 */
export async function anonymizeUserData(userId: string, reason?: string): Promise<{
  success: boolean;
  error: any;
}> {
  try {
    // Anonymize profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        email: `anonymized_${userId}@empathyledger.local`,
        full_name: 'Anonymous User',
        display_name: 'Anonymous',
        bio: null,
        avatar_url: null,
        location_general: null,
        languages_spoken: null,
        is_active: false,
        anonymized_at: new Date().toISOString(),
        anonymization_reason: reason || 'User requested data deletion'
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Anonymize stories (keep content for community value but remove attribution)
    const { error: storiesError } = await supabase
      .from('stories')
      .update({
        contributor_age_range: null,
        contributor_location: null,
        contributor_background: null,
        content: '[Story content anonymized at user request]',
        title: 'Anonymous Story',
        anonymized_at: new Date().toISOString()
      })
      .eq('contributor_id', userId);

    if (storiesError) throw storiesError;

    // Delete personal interactions
    await supabase.from('story_reactions').delete().eq('user_id', userId);
    await supabase.from('story_comments').delete().eq('user_id', userId);

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// =====================================================================
// CONSENT MANAGEMENT
// =====================================================================

export interface ConsentRecord {
  user_id: string;
  consent_type: 'data_collection' | 'ai_analysis' | 'research_participation' | 'marketing' | 'sharing';
  consent_given: boolean;
  consent_date: string;
  consent_version: string;
  withdrawal_date?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Record user consent
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentRecord['consent_type'],
  consentGiven: boolean,
  metadata?: Partial<ConsentRecord>
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('consent_records')
      .insert({
        user_id: userId,
        consent_type: consentType,
        consent_given: consentGiven,
        consent_date: new Date().toISOString(),
        consent_version: '1.0.0',
        ip_address: metadata?.ip_address,
        user_agent: metadata?.user_agent,
        withdrawal_date: consentGiven ? null : new Date().toISOString()
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Check if user has given specific consent
 */
export async function checkConsent(
  userId: string,
  consentType: ConsentRecord['consent_type']
): Promise<{ hasConsent: boolean; error: any }> {
  try {
    const { data, error } = await supabase
      .from('consent_records')
      .select('consent_given, withdrawal_date')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .order('consent_date', { ascending: false })
      .limit(1);

    if (error) throw error;

    const hasConsent = data && data.length > 0 && 
                      data[0].consent_given && 
                      !data[0].withdrawal_date;

    return { hasConsent: !!hasConsent, error: null };
  } catch (error) {
    return { hasConsent: false, error };
  }
}

// =====================================================================
// AUDIT LOGGING
// =====================================================================

export interface AuditLog {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

/**
 * Log privacy-related actions for audit trail
 */
export async function logPrivacyAction(
  userId: string,
  action: string,
  resourceType: string,
  details?: any
): Promise<void> {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        details,
        timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log privacy action:', error);
  }
}

// =====================================================================
// PRIVACY SETTINGS VALIDATION
// =====================================================================

/**
 * Validate and sanitize privacy settings updates
 */
export function validatePrivacySettings(
  currentSettings: PrivacySettings,
  updates: Partial<PrivacySettings>
): { valid: boolean; sanitized: PrivacySettings; errors: string[] } {
  const errors: string[] = [];
  
  const sanitized: PrivacySettings = {
    show_profile: updates.show_profile || currentSettings.show_profile,
    show_stories: updates.show_stories || currentSettings.show_stories,
    show_location: updates.show_location ?? currentSettings.show_location,
    show_age_range: updates.show_age_range ?? currentSettings.show_age_range,
    allow_contact: updates.allow_contact ?? currentSettings.allow_contact,
    allow_research_participation: updates.allow_research_participation ?? currentSettings.allow_research_participation,
    data_retention_preference: updates.data_retention_preference || currentSettings.data_retention_preference
  };

  // Validation rules
  const validLevels = ['public', 'community', 'organization', 'private'];
  if (!validLevels.includes(sanitized.show_profile)) {
    errors.push('Invalid profile visibility level');
    sanitized.show_profile = 'community';
  }

  if (!validLevels.includes(sanitized.show_stories)) {
    errors.push('Invalid story visibility level');
    sanitized.show_stories = 'community';
  }

  const validRetention = ['standard', 'minimal', 'extended'];
  if (!validRetention.includes(sanitized.data_retention_preference)) {
    errors.push('Invalid data retention preference');
    sanitized.data_retention_preference = 'standard';
  }

  return {
    valid: errors.length === 0,
    sanitized,
    errors
  };
}