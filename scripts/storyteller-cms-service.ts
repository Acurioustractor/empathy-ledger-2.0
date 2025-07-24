/**
 * STORYTELLER CMS SERVICE
 * Clean, simple, and safe CMS integration for the website
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types
export interface StorytellerCard {
  id: string;
  name: string;
  photo: string | null;
  role: string | null;
  organisation: string | null;
  organizationType: string | null;
  project: string | null;
  location: string | null;
  themes: string[];
  quote: string | null;
}

export interface StorytellerDetails extends StorytellerCard {
  bio: string | null;
  stories: Array<{
    id: string;
    title: string;
    excerpt: string;
    publishedAt: string;
  }>;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  videoLink: string | null;
  videoEmbed: string | null;
  imageUrl: string | null;
  themes: string[];
  quotes: string[];
  storyteller: {
    id: string;
    name: string;
    photo: string | null;
    organisation: string | null;
  };
  publishedAt: string;
}

/**
 * Storyteller CMS Service
 * Provides safe, cached access to storyteller content
 */
export class StorytellerCmsService {
  private supabase: SupabaseClient;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!url || !anonKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    this.supabase = createClient(url, anonKey);
  }

  /**
   * Get storyteller cards for display
   * ONLY returns storytellers with consent and public display enabled
   */
  async getStorytellerCards(options: {
    project?: string;
    organisation?: string;
    limit?: number;
  } = {}): Promise<StorytellerCard[]> {
    try {
      // Build query
      let query = this.supabase
        .from('storytellers')
        .select(`
          id,
          full_name,
          profile_image_url,
          role,
          privacy_preferences,
          organization:organizations(name, type),
          location:locations(name, state_province),
          project:projects(name, description),
          stories!storyteller_id(
            id,
            title,
            themes,
            content,
            transcription,
            privacy_level
          )
        `)
        .eq('consent_given', true)
        .not('privacy_preferences->public_display', 'is', null)
        .eq('privacy_preferences->public_display', 'true')
        .not('profile_image_url', 'is', null);

      // Apply filters
      if (options.organisation) {
        const { data: org } = await this.supabase
          .from('organizations')
          .select('id')
          .eq('name', options.organisation)
          .single();
        
        if (org) {
          query = query.eq('organization_id', org.id);
        }
      }

      if (options.project) {
        const { data: project } = await this.supabase
          .from('projects')
          .select('id')
          .eq('name', options.project)
          .single();
        
        if (project) {
          query = query.eq('project_id', project.id);
        }
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: storytellers, error } = await query;

      if (error) {
        console.error('Error fetching storytellers:', error);
        return [];
      }

      if (!storytellers || storytellers.length === 0) {
        return [];
      }

      // Transform to cards, respecting privacy preferences
      return storytellers.map(storyteller => {
        const prefs = storyteller.privacy_preferences || {};
        
        // Get public stories only (privacy_level = 'public' or null)
        const publicStories = storyteller.stories?.filter(s => 
          !s.privacy_level || s.privacy_level === 'public'
        ) || [];
        
        // Extract unique themes from stories
        const themes = publicStories
          .flatMap(s => s.themes || [])
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 3);
        
        // Extract quote from content or transcription
        const quote = this.extractQuoteFromStory(publicStories[0]) || null;

        return {
          id: storyteller.id,
          name: storyteller.full_name,
          photo: prefs.show_photo ? storyteller.profile_image_url : null,
          role: storyteller.role,
          organisation: prefs.show_organisation && storyteller.organization 
            ? storyteller.organization.name 
            : null,
          organizationType: prefs.show_organisation && storyteller.organization 
            ? storyteller.organization.type 
            : null,
          project: storyteller.project 
            ? storyteller.project.name 
            : null,
          location: prefs.show_location && storyteller.location
            ? `${storyteller.location.name}${storyteller.location.state_province ? `, ${storyteller.location.state_province}` : ''}`
            : null,
          themes,
          quote
        };
      });
    } catch (error) {
      console.error('Failed to get storyteller cards:', error);
      return [];
    }
  }

  /**
   * Get a single storyteller with full details
   */
  async getStorytellerDetails(storytellerId: string): Promise<StorytellerDetails | null> {
    try {
      const { data: storyteller, error } = await this.supabase
        .from('storytellers')
        .select(`
          id,
          full_name,
          profile_image_url,
          bio,
          role,
          privacy_preferences,
          organization:organizations(name),
          location:locations(name, state_province),
          stories!storyteller_id(
            id,
            title,
            story_copy,
            is_published,
            published_at
          )
        `)
        .eq('id', storytellerId)
        .eq('consent_given', true)
        .eq('privacy_preferences->public_display', 'true')
        .single();

      if (error || !storyteller) {
        return null;
      }

      const prefs = storyteller.privacy_preferences || {};
      const publishedStories = storyteller.stories?.filter(s => s.is_published) || [];

      return {
        id: storyteller.id,
        name: storyteller.full_name,
        photo: prefs.show_photo ? storyteller.profile_image_url : null,
        bio: storyteller.bio,
        role: storyteller.role,
        organisation: prefs.show_organisation && storyteller.organisation 
          ? storyteller.organisation.name 
          : null,
        location: prefs.show_location && storyteller.location
          ? `${storyteller.location.name}, ${storyteller.location.state}`
          : null,
        themes: [], // Would be populated from story processing
        quote: null, // Would be populated from story processing
        stories: publishedStories.map(s => ({
          id: s.id,
          title: s.title,
          excerpt: s.story_copy ? s.story_copy.substring(0, 200) + '...' : '',
          publishedAt: s.published_at
        }))
      };
    } catch (error) {
      console.error('Failed to get storyteller details:', error);
      return null;
    }
  }

  /**
   * Get a single story with storyteller info
   */
  async getStory(storyId: string): Promise<Story | null> {
    try {
      const { data: story, error } = await this.supabase
        .from('stories')
        .select(`
          id,
          title,
          story_copy,
          story_transcript,
          story_image_url,
          video_story_link,
          video_embed_code,
          themes,
          featured_quotes,
          published_at,
          storyteller:storytellers!storyteller_id(
            id,
            full_name,
            profile_image_url,
            privacy_preferences,
            consent_given,
            organisation:organisations(name)
          )
        `)
        .eq('id', storyId)
        .eq('is_published', true)
        .single();

      if (error || !story) {
        return null;
      }

      // Check storyteller consent
      if (!story.storyteller.consent_given || 
          story.storyteller.privacy_preferences?.public_display !== true) {
        return null;
      }

      const prefs = story.storyteller.privacy_preferences || {};

      return {
        id: story.id,
        title: story.title,
        content: story.story_copy || story.story_transcript || '',
        videoLink: story.video_story_link,
        videoEmbed: story.video_embed_code,
        imageUrl: story.story_image_url,
        themes: story.themes || [],
        quotes: story.featured_quotes || [],
        storyteller: {
          id: story.storyteller.id,
          name: story.storyteller.full_name,
          photo: prefs.show_photo ? story.storyteller.profile_image_url : null,
          organisation: prefs.show_organisation && story.storyteller.organisation
            ? story.storyteller.organisation.name
            : null
        },
        publishedAt: story.published_at
      };
    } catch (error) {
      console.error('Failed to get story:', error);
      return null;
    }
  }

  /**
   * Get stories for a specific project or organisation
   */
  async getStories(options: {
    project?: string;
    organisation?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Story[]> {
    try {
      let query = this.supabase
        .from('stories')
        .select(`
          id,
          title,
          story_copy,
          story_transcript,
          story_image_url,
          themes,
          featured_quotes,
          published_at,
          storyteller:storytellers!storyteller_id(
            id,
            full_name,
            profile_image_url,
            privacy_preferences,
            consent_given,
            organisation_id,
            project_id,
            organisation:organisations(name)
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      // Apply filters through storyteller relationships
      if (options.organisation) {
        const { data: org } = await this.supabase
          .from('organisations')
          .select('id')
          .eq('name', options.organisation)
          .single();
        
        if (org) {
          query = query.eq('storyteller.organisation_id', org.id);
        }
      }

      if (options.project) {
        const { data: project } = await this.supabase
          .from('projects')
          .select('id')
          .eq('name', options.project)
          .single();
        
        if (project) {
          query = query.eq('storyteller.project_id', project.id);
        }
      }

      // Pagination
      const limit = options.limit || 10;
      const offset = options.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data: stories, error } = await query;

      if (error || !stories) {
        return [];
      }

      // Filter out stories from non-consenting storytellers
      return stories
        .filter(story => 
          story.storyteller.consent_given && 
          story.storyteller.privacy_preferences?.public_display === true
        )
        .map(story => {
          const prefs = story.storyteller.privacy_preferences || {};
          
          return {
            id: story.id,
            title: story.title,
            content: story.story_copy || story.story_transcript || '',
            videoLink: null,
            videoEmbed: null,
            imageUrl: story.story_image_url,
            themes: story.themes || [],
            quotes: story.featured_quotes || [],
            storyteller: {
              id: story.storyteller.id,
              name: story.storyteller.full_name,
              photo: prefs.show_photo ? story.storyteller.profile_image_url : null,
              organisation: prefs.show_organisation && story.storyteller.organisation
                ? story.storyteller.organisation.name
                : null
            },
            publishedAt: story.published_at
          };
        });
    } catch (error) {
      console.error('Failed to get stories:', error);
      return [];
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStats(): Promise<{
    totalStorytellers: number;
    publicStorytellers: number;
    totalStories: number;
    publishedStories: number;
  }> {
    try {
      const [storytellers, stories] = await Promise.all([
        this.supabase
          .from('storytellers')
          .select('id, consent_given, privacy_preferences'),
        this.supabase
          .from('stories')
          .select('id, is_published')
      ]);

      const totalStorytellers = storytellers.data?.length || 0;
      const publicStorytellers = storytellers.data?.filter(
        s => s.consent_given && s.privacy_preferences?.public_display === true
      ).length || 0;

      const totalStories = stories.data?.length || 0;
      const publishedStories = stories.data?.filter(s => s.is_published).length || 0;

      return {
        totalStorytellers,
        publicStorytellers,
        totalStories,
        publishedStories
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalStorytellers: 0,
        publicStorytellers: 0,
        totalStories: 0,
        publishedStories: 0
      };
    }
  }

  /**
   * Extract a meaningful quote from story content or transcription
   */
  private extractQuoteFromStory(story: any): string | null {
    if (!story) return null;
    
    // Try content first, then transcription
    const text = story.content || story.transcription;
    if (!text || typeof text !== 'string') return null;
    
    // Simple quote extraction - look for sentences with quotes or meaningful content
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    
    if (sentences.length > 0) {
      // Return first substantial sentence, max 150 chars
      const quote = sentences[0];
      return quote.length > 150 ? quote.substring(0, 147) + '...' : quote;
    }
    
    return null;
  }
}