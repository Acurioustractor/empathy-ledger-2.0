/**
 * Temporary database type definitions for TypeScript compilation
 * TODO: Generate these from actual Supabase schema
 */

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          description?: string;
          organization_name?: string;
          api_configuration?: any;
          custom_domain?: string;
          branding_config?: any;
          settings?: any;
          sovereignty_framework?: any;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          organization_name?: string;
          api_configuration?: any;
          created_by: string;
        };
        Update: {
          name?: string;
          description?: string;
          organization_name?: string;
          api_configuration?: any;
          custom_domain?: string;
          branding_config?: any;
          settings?: any;
          sovereignty_framework?: any;
        };
      };
      stories: {
        Row: {
          id: string;
          title: string;
          content: string;
          transcript?: string;
          project_id: string;
          storyteller_id: string;
          privacy_level: string;
          metadata?: any;
          analysis_data?: any;
          event_data?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          content: string;
          transcript: string;
          project_id: string;
          storyteller_id: string;
          privacy_level: string;
          metadata?: any;
        };
        Update: {
          title?: string;
          content?: string;
          transcript?: string;
          privacy_level?: string;
          metadata?: any;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          permissions: any;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
          role: string;
          permissions?: any;
        };
        Update: {
          role?: string;
          permissions?: any;
        };
      };
      project_templates: {
        Row: {
          id: string;
          name: string;
          description?: string;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string;
        };
        Update: {
          name?: string;
          description?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          role?: string;
          created_at: string;
        };
        Insert: {
          name: string;
          role?: string;
        };
        Update: {
          name?: string;
          role?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          role?: string;
          created_at: string;
        };
        Insert: {
          name: string;
          role?: string;
        };
        Update: {
          name?: string;
          role?: string;
        };
      };
      story_analysis: {
        Row: {
          id: string;
          story_id: string;
          analysis_data?: any;
          created_at: string;
        };
        Insert: {
          story_id: string;
          analysis_data?: any;
        };
        Update: {
          analysis_data?: any;
        };
      };
      value_events: {
        Row: {
          id: string;
          story_id: string;
          storyteller_id: string;
          event_type: string;
          description: string;
          value_amount: number;
          storyteller_share: number;
          platform_share: number;
          metadata: Json;
          event_data?: any;
          created_at: string;
        };
        Insert: {
          story_id: string;
          storyteller_id: string;
          event_type: string;
          description: string;
          value_amount: number;
          storyteller_share: number;
          platform_share: number;
          metadata?: Json;
        };
        Update: {
          description?: string;
          value_amount?: number;
          storyteller_share?: number;
          platform_share?: number;
          metadata?: Json;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Additional types for components
export interface ConsentSettings {
  publicSharing: boolean;
  allowPublicSharing?: boolean;
  dataRetention: string;
  contactPermission: boolean;
}

export interface CulturalProtocols {
  communityAffiliation: string;
  culturalContext: string;
  sensitiveTopics: string[];
  sharingRestrictions: string[];
}

export interface StoryAnalysis {
  themes: string[];
  sentiment: string;
  culturalMarkers: string[];
  confidenceLevel: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  storyteller_id: string;
  project_id: string;
  privacy_level: string;
  created_at: string;
  updated_at: string;
  analysis_data?: StoryAnalysis;
  consent_settings?: ConsentSettings;
  cultural_protocols?: CulturalProtocols;
}

export interface StoryStatus {
  draft: 'draft';
  published: 'published';
  archived: 'archived';
}

// Export function placeholders for components
export function getUserStories(userId: string): Promise<Story[]> {
  return Promise.resolve([]);
}

// Additional exports needed by components (already exported above)
