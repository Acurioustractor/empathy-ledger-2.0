export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      community_insights: {
        Row: {
          community_id: string | null;
          confidence_level: number | null;
          description: string | null;
          generated_at: string | null;
          id: string;
          insight_type: string | null;
          supporting_stories: string[] | null;
          tags: string[] | null;
          title: string;
          visibility: string | null;
        };
        Insert: {
          community_id?: string | null;
          confidence_level?: number | null;
          description?: string | null;
          generated_at?: string | null;
          id?: string;
          insight_type?: string | null;
          supporting_stories?: string[] | null;
          tags?: string[] | null;
          title: string;
          visibility?: string | null;
        };
        Update: {
          community_id?: string | null;
          confidence_level?: number | null;
          description?: string | null;
          generated_at?: string | null;
          id?: string;
          insight_type?: string | null;
          supporting_stories?: string[] | null;
          tags?: string[] | null;
          title?: string;
          visibility?: string | null;
        };
        Relationships: [];
      };
      community_insights_backup_20250714: {
        Row: {
          community_id: string | null;
          confidence_level: number | null;
          description: string | null;
          generated_at: string | null;
          id: string | null;
          insight_type: string | null;
          supporting_stories: string[] | null;
          tags: string[] | null;
          title: string | null;
          visibility: string | null;
        };
        Insert: {
          community_id?: string | null;
          confidence_level?: number | null;
          description?: string | null;
          generated_at?: string | null;
          id?: string | null;
          insight_type?: string | null;
          supporting_stories?: string[] | null;
          tags?: string[] | null;
          title?: string | null;
          visibility?: string | null;
        };
        Update: {
          community_id?: string | null;
          confidence_level?: number | null;
          description?: string | null;
          generated_at?: string | null;
          id?: string | null;
          insight_type?: string | null;
          supporting_stories?: string[] | null;
          tags?: string[] | null;
          title?: string | null;
          visibility?: string | null;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          app_type: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          import_date: string | null;
          name: string | null;
          organization_id: string | null;
          phone: string | null;
          project: string | null;
          service_id: string | null;
          source: string | null;
          updated_at: string | null;
        };
        Insert: {
          app_type?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          import_date?: string | null;
          name?: string | null;
          organization_id?: string | null;
          phone?: string | null;
          project?: string | null;
          service_id?: string | null;
          source?: string | null;
          updated_at?: string | null;
        };
        Update: {
          app_type?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          import_date?: string | null;
          name?: string | null;
          organization_id?: string | null;
          phone?: string | null;
          project?: string | null;
          service_id?: string | null;
          source?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'contacts_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contacts_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };
      content_artifacts: {
        Row: {
          artifact_type: string;
          created_at: string | null;
          description: string | null;
          duration: number | null;
          id: string;
          media_url: string;
          processing_status: string | null;
          storyteller_id: string | null;
          title: string;
          transcript: string | null;
          updated_at: string | null;
        };
        Insert: {
          artifact_type: string;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          id?: string;
          media_url: string;
          processing_status?: string | null;
          storyteller_id?: string | null;
          title: string;
          transcript?: string | null;
          updated_at?: string | null;
        };
        Update: {
          artifact_type?: string;
          created_at?: string | null;
          description?: string | null;
          duration?: number | null;
          id?: string;
          media_url?: string;
          processing_status?: string | null;
          storyteller_id?: string | null;
          title?: string;
          transcript?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'content_artifacts_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'storytellers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_artifacts_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      locations: {
        Row: {
          app_type: string | null;
          country: string | null;
          created_at: string | null;
          id: string;
          import_date: string | null;
          latitude: number | null;
          locality: string | null;
          longitude: number | null;
          postcode: string | null;
          project: string | null;
          source: string | null;
          state: string | null;
          street_address: string | null;
          suburb: string | null;
          updated_at: string | null;
        };
        Insert: {
          app_type?: string | null;
          country?: string | null;
          created_at?: string | null;
          id?: string;
          import_date?: string | null;
          latitude?: number | null;
          locality?: string | null;
          longitude?: number | null;
          postcode?: string | null;
          project?: string | null;
          source?: string | null;
          state?: string | null;
          street_address?: string | null;
          suburb?: string | null;
          updated_at?: string | null;
        };
        Update: {
          app_type?: string | null;
          country?: string | null;
          created_at?: string | null;
          id?: string;
          import_date?: string | null;
          latitude?: number | null;
          locality?: string | null;
          longitude?: number | null;
          postcode?: string | null;
          project?: string | null;
          source?: string | null;
          state?: string | null;
          street_address?: string | null;
          suburb?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      media_content: {
        Row: {
          created_at: string;
          display_order: number | null;
          file_size: number | null;
          file_url: string;
          id: number;
          metadata: Json | null;
          privacy_level: string | null;
          story_id: string | null;
          storyteller_id: string | null;
          thumbnail_url: string | null;
          title: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number | null;
          file_size?: number | null;
          file_url: string;
          id?: number;
          metadata?: Json | null;
          privacy_level?: string | null;
          story_id?: string | null;
          storyteller_id?: string | null;
          thumbnail_url?: string | null;
          title: string;
          type: string;
        };
        Update: {
          created_at?: string;
          display_order?: number | null;
          file_size?: number | null;
          file_url?: string;
          id?: number;
          metadata?: Json | null;
          privacy_level?: string | null;
          story_id?: string | null;
          storyteller_id?: string | null;
          thumbnail_url?: string | null;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'media_content_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'media_content_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'storytellers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'media_content_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          app_type: string | null;
          created_at: string | null;
          description: string | null;
          email: string | null;
          id: string;
          import_date: string | null;
          name: string;
          phone: string | null;
          project: string | null;
          source: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          app_type?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string;
          import_date?: string | null;
          name: string;
          phone?: string | null;
          project?: string | null;
          source?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          app_type?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string;
          import_date?: string | null;
          name?: string;
          phone?: string | null;
          project?: string | null;
          source?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          age_range: string | null;
          avatar_url: string | null;
          bio: string | null;
          communities_joined: number | null;
          created_at: string | null;
          display_name: string | null;
          email: string;
          full_name: string | null;
          id: string;
          insights_generated: number | null;
          is_active: boolean | null;
          is_verified: boolean | null;
          languages_spoken: string[] | null;
          last_active_at: string | null;
          location_general: string | null;
          notification_preferences: Json | null;
          privacy_settings: Json | null;
          role: Database['public']['Enums']['user_role'] | null;
          stories_contributed: number | null;
          updated_at: string | null;
        };
        Insert: {
          age_range?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          communities_joined?: number | null;
          created_at?: string | null;
          display_name?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          insights_generated?: number | null;
          is_active?: boolean | null;
          is_verified?: boolean | null;
          languages_spoken?: string[] | null;
          last_active_at?: string | null;
          location_general?: string | null;
          notification_preferences?: Json | null;
          privacy_settings?: Json | null;
          role?: Database['public']['Enums']['user_role'] | null;
          stories_contributed?: number | null;
          updated_at?: string | null;
        };
        Update: {
          age_range?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          communities_joined?: number | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          insights_generated?: number | null;
          is_active?: boolean | null;
          is_verified?: boolean | null;
          languages_spoken?: string[] | null;
          last_active_at?: string | null;
          location_general?: string | null;
          notification_preferences?: Json | null;
          privacy_settings?: Json | null;
          role?: Database['public']['Enums']['user_role'] | null;
          stories_contributed?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          description: string | null;
          id: string;
          last_synced: string | null;
          name: string;
          notion_id: string;
          status: string | null;
        };
        Insert: {
          description?: string | null;
          id?: string;
          last_synced?: string | null;
          name: string;
          notion_id: string;
          status?: string | null;
        };
        Update: {
          description?: string | null;
          id?: string;
          last_synced?: string | null;
          name?: string;
          notion_id?: string;
          status?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          app_type: string | null;
          created_at: string | null;
          description: string | null;
          eligibility: string | null;
          id: string;
          import_date: string | null;
          keywords: string | null;
          location_id: string | null;
          name: string;
          organization_id: string | null;
          project: string | null;
          service_types: string | null;
          source: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          app_type?: string | null;
          created_at?: string | null;
          description?: string | null;
          eligibility?: string | null;
          id?: string;
          import_date?: string | null;
          keywords?: string | null;
          location_id?: string | null;
          name: string;
          organization_id?: string | null;
          project?: string | null;
          service_types?: string | null;
          source?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          app_type?: string | null;
          created_at?: string | null;
          description?: string | null;
          eligibility?: string | null;
          id?: string;
          import_date?: string | null;
          keywords?: string | null;
          location_id?: string | null;
          name?: string;
          organization_id?: string | null;
          project?: string | null;
          service_types?: string | null;
          source?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'services_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'services_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      stories: {
        Row: {
          airtable_id: string | null;
          audio_url: string | null;
          author_notes: string | null;
          consent_settings: Json | null;
          cultural_protocols: Json | null;
          date_occurred: string | null;
          emotions_expressed: string[] | null;
          featured: boolean | null;
          id: string;
          image_caption: string | null;
          image_url: string | null;
          impact_areas: string[] | null;
          intended_audience: string[] | null;
          language: string | null;
          last_updated_by: string | null;
          location: string | null;
          media_ids: string[] | null;
          media_metadata: Json | null;
          media_type: string | null;
          media_urls: string[] | null;
          medium: string | null;
          moderation_status: string | null;
          primary_media_url: string | null;
          primary_themes: string[] | null;
          privacy_level: string | null;
          project: string | null;
          publication_date: string | null;
          related_stories: string[] | null;
          response_to: string | null;
          setting_type: string | null;
          share_count: number | null;
          status: string | null;
          story_copy: string | null;
          story_type: string | null;
          storyteller_id: string | null;
          submission_method: string | null;
          submitted_at: string | null;
          tags: string[] | null;
          thumbnail_url: string | null;
          title: string | null;
          topics_addressed: string[] | null;
          transcript: string;
          updated_at: string | null;
          video_duration: number | null;
          video_embed_code: string | null;
          video_url: string | null;
          view_count: number | null;
        };
        Insert: {
          airtable_id?: string | null;
          audio_url?: string | null;
          author_notes?: string | null;
          consent_settings?: Json | null;
          cultural_protocols?: Json | null;
          date_occurred?: string | null;
          emotions_expressed?: string[] | null;
          featured?: boolean | null;
          id?: string;
          image_caption?: string | null;
          image_url?: string | null;
          impact_areas?: string[] | null;
          intended_audience?: string[] | null;
          language?: string | null;
          last_updated_by?: string | null;
          location?: string | null;
          media_ids?: string[] | null;
          media_metadata?: Json | null;
          media_type?: string | null;
          media_urls?: string[] | null;
          medium?: string | null;
          moderation_status?: string | null;
          primary_media_url?: string | null;
          primary_themes?: string[] | null;
          privacy_level?: string | null;
          project?: string | null;
          publication_date?: string | null;
          related_stories?: string[] | null;
          response_to?: string | null;
          setting_type?: string | null;
          share_count?: number | null;
          status?: string | null;
          story_copy?: string | null;
          story_type?: string | null;
          storyteller_id?: string | null;
          submission_method?: string | null;
          submitted_at?: string | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title?: string | null;
          topics_addressed?: string[] | null;
          transcript: string;
          updated_at?: string | null;
          video_duration?: number | null;
          video_embed_code?: string | null;
          video_url?: string | null;
          view_count?: number | null;
        };
        Update: {
          airtable_id?: string | null;
          audio_url?: string | null;
          author_notes?: string | null;
          consent_settings?: Json | null;
          cultural_protocols?: Json | null;
          date_occurred?: string | null;
          emotions_expressed?: string[] | null;
          featured?: boolean | null;
          id?: string;
          image_caption?: string | null;
          image_url?: string | null;
          impact_areas?: string[] | null;
          intended_audience?: string[] | null;
          language?: string | null;
          last_updated_by?: string | null;
          location?: string | null;
          media_ids?: string[] | null;
          media_metadata?: Json | null;
          media_type?: string | null;
          media_urls?: string[] | null;
          medium?: string | null;
          moderation_status?: string | null;
          primary_media_url?: string | null;
          primary_themes?: string[] | null;
          privacy_level?: string | null;
          project?: string | null;
          publication_date?: string | null;
          related_stories?: string[] | null;
          response_to?: string | null;
          setting_type?: string | null;
          share_count?: number | null;
          status?: string | null;
          story_copy?: string | null;
          story_type?: string | null;
          storyteller_id?: string | null;
          submission_method?: string | null;
          submitted_at?: string | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title?: string | null;
          topics_addressed?: string[] | null;
          transcript?: string;
          updated_at?: string | null;
          video_duration?: number | null;
          video_embed_code?: string | null;
          video_url?: string | null;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'stories_last_updated_by_fkey';
            columns: ['last_updated_by'];
            isOneToOne: false;
            referencedRelation: 'storytellers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stories_last_updated_by_fkey';
            columns: ['last_updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stories_response_to_fkey';
            columns: ['response_to'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stories_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'storytellers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stories_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      stories_backup_20250714: {
        Row: {
          airtable_id: string | null;
          audio_url: string | null;
          author_notes: string | null;
          consent_settings: Json | null;
          cultural_protocols: Json | null;
          date_occurred: string | null;
          emotions_expressed: string[] | null;
          featured: boolean | null;
          id: string | null;
          image_caption: string | null;
          image_url: string | null;
          impact_areas: string[] | null;
          intended_audience: string[] | null;
          language: string | null;
          last_updated_by: string | null;
          location: string | null;
          media_ids: string[] | null;
          media_metadata: Json | null;
          media_type: string | null;
          media_urls: string[] | null;
          medium: string | null;
          moderation_status: string | null;
          primary_media_url: string | null;
          primary_themes: string[] | null;
          privacy_level: string | null;
          project: string | null;
          publication_date: string | null;
          related_stories: string[] | null;
          response_to: string | null;
          setting_type: string | null;
          share_count: number | null;
          status: string | null;
          story_copy: string | null;
          story_type: string | null;
          storyteller_id: string | null;
          submission_method: string | null;
          submitted_at: string | null;
          tags: string[] | null;
          thumbnail_url: string | null;
          title: string | null;
          topics_addressed: string[] | null;
          transcript: string | null;
          updated_at: string | null;
          video_duration: number | null;
          video_embed_code: string | null;
          video_url: string | null;
          view_count: number | null;
        };
        Insert: {
          airtable_id?: string | null;
          audio_url?: string | null;
          author_notes?: string | null;
          consent_settings?: Json | null;
          cultural_protocols?: Json | null;
          date_occurred?: string | null;
          emotions_expressed?: string[] | null;
          featured?: boolean | null;
          id?: string | null;
          image_caption?: string | null;
          image_url?: string | null;
          impact_areas?: string[] | null;
          intended_audience?: string[] | null;
          language?: string | null;
          last_updated_by?: string | null;
          location?: string | null;
          media_ids?: string[] | null;
          media_metadata?: Json | null;
          media_type?: string | null;
          media_urls?: string[] | null;
          medium?: string | null;
          moderation_status?: string | null;
          primary_media_url?: string | null;
          primary_themes?: string[] | null;
          privacy_level?: string | null;
          project?: string | null;
          publication_date?: string | null;
          related_stories?: string[] | null;
          response_to?: string | null;
          setting_type?: string | null;
          share_count?: number | null;
          status?: string | null;
          story_copy?: string | null;
          story_type?: string | null;
          storyteller_id?: string | null;
          submission_method?: string | null;
          submitted_at?: string | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title?: string | null;
          topics_addressed?: string[] | null;
          transcript?: string | null;
          updated_at?: string | null;
          video_duration?: number | null;
          video_embed_code?: string | null;
          video_url?: string | null;
          view_count?: number | null;
        };
        Update: {
          airtable_id?: string | null;
          audio_url?: string | null;
          author_notes?: string | null;
          consent_settings?: Json | null;
          cultural_protocols?: Json | null;
          date_occurred?: string | null;
          emotions_expressed?: string[] | null;
          featured?: boolean | null;
          id?: string | null;
          image_caption?: string | null;
          image_url?: string | null;
          impact_areas?: string[] | null;
          intended_audience?: string[] | null;
          language?: string | null;
          last_updated_by?: string | null;
          location?: string | null;
          media_ids?: string[] | null;
          media_metadata?: Json | null;
          media_type?: string | null;
          media_urls?: string[] | null;
          medium?: string | null;
          moderation_status?: string | null;
          primary_media_url?: string | null;
          primary_themes?: string[] | null;
          privacy_level?: string | null;
          project?: string | null;
          publication_date?: string | null;
          related_stories?: string[] | null;
          response_to?: string | null;
          setting_type?: string | null;
          share_count?: number | null;
          status?: string | null;
          story_copy?: string | null;
          story_type?: string | null;
          storyteller_id?: string | null;
          submission_method?: string | null;
          submitted_at?: string | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title?: string | null;
          topics_addressed?: string[] | null;
          transcript?: string | null;
          updated_at?: string | null;
          video_duration?: number | null;
          video_embed_code?: string | null;
          video_url?: string | null;
          view_count?: number | null;
        };
        Relationships: [];
      };
      story_analysis: {
        Row: {
          analyzed_at: string | null;
          created_at: string | null;
          id: string;
          impact_categories: string[] | null;
          key_quotes: string[] | null;
          sentiment_analysis: Json | null;
          story_id: string;
          summary: string | null;
          themes: string[] | null;
        };
        Insert: {
          analyzed_at?: string | null;
          created_at?: string | null;
          id?: string;
          impact_categories?: string[] | null;
          key_quotes?: string[] | null;
          sentiment_analysis?: Json | null;
          story_id: string;
          summary?: string | null;
          themes?: string[] | null;
        };
        Update: {
          analyzed_at?: string | null;
          created_at?: string | null;
          id?: string;
          impact_categories?: string[] | null;
          key_quotes?: string[] | null;
          sentiment_analysis?: Json | null;
          story_id?: string;
          summary?: string | null;
          themes?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'story_analysis_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: true;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
      story_media: {
        Row: {
          caption: string | null;
          created_at: string | null;
          display_order: number | null;
          duration: number | null;
          file_size: number | null;
          id: string;
          media_type: string | null;
          media_url: string;
          mime_type: string | null;
          story_id: string | null;
          thumbnail_url: string | null;
        };
        Insert: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          duration?: number | null;
          file_size?: number | null;
          id?: string;
          media_type?: string | null;
          media_url: string;
          mime_type?: string | null;
          story_id?: string | null;
          thumbnail_url?: string | null;
        };
        Update: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          duration?: number | null;
          file_size?: number | null;
          id?: string;
          media_type?: string | null;
          media_url?: string;
          mime_type?: string | null;
          story_id?: string | null;
          thumbnail_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'story_media_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
      story_media_backup_20250714: {
        Row: {
          caption: string | null;
          created_at: string | null;
          display_order: number | null;
          duration: number | null;
          file_size: number | null;
          id: string | null;
          media_type: string | null;
          media_url: string | null;
          mime_type: string | null;
          story_id: string | null;
          thumbnail_url: string | null;
        };
        Insert: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          duration?: number | null;
          file_size?: number | null;
          id?: string | null;
          media_type?: string | null;
          media_url?: string | null;
          mime_type?: string | null;
          story_id?: string | null;
          thumbnail_url?: string | null;
        };
        Update: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          duration?: number | null;
          file_size?: number | null;
          id?: string | null;
          media_type?: string | null;
          media_url?: string | null;
          mime_type?: string | null;
          story_id?: string | null;
          thumbnail_url?: string | null;
        };
        Relationships: [];
      };
      story_project_links: {
        Row: {
          created_at: string | null;
          id: string;
          project_id: string | null;
          relevance_score: number | null;
          story_id: string | null;
          tag_reason: string | null;
          tagged_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          project_id?: string | null;
          relevance_score?: number | null;
          story_id?: string | null;
          tag_reason?: string | null;
          tagged_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          project_id?: string | null;
          relevance_score?: number | null;
          story_id?: string | null;
          tag_reason?: string | null;
          tagged_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'story_project_links_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'story_project_links_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
      story_quotes: {
        Row: {
          approval_status: string | null;
          approved_at: string | null;
          approved_by: string | null;
          context: string | null;
          created_at: string | null;
          emotions: string[] | null;
          end_time: number | null;
          id: string;
          impact_score: number | null;
          quote_text: string;
          speaker_name: string | null;
          start_time: number | null;
          story_id: string | null;
          suitable_for_sharing: boolean | null;
          themes: string[] | null;
          usage_count: number | null;
        };
        Insert: {
          approval_status?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          context?: string | null;
          created_at?: string | null;
          emotions?: string[] | null;
          end_time?: number | null;
          id?: string;
          impact_score?: number | null;
          quote_text: string;
          speaker_name?: string | null;
          start_time?: number | null;
          story_id?: string | null;
          suitable_for_sharing?: boolean | null;
          themes?: string[] | null;
          usage_count?: number | null;
        };
        Update: {
          approval_status?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          context?: string | null;
          created_at?: string | null;
          emotions?: string[] | null;
          end_time?: number | null;
          id?: string;
          impact_score?: number | null;
          quote_text?: string;
          speaker_name?: string | null;
          start_time?: number | null;
          story_id?: string | null;
          suitable_for_sharing?: boolean | null;
          themes?: string[] | null;
          usage_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'story_quotes_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'storytellers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'story_quotes_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'story_quotes_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
      story_tag_relations: {
        Row: {
          story_id: string;
          tag_id: string;
        };
        Insert: {
          story_id: string;
          tag_id: string;
        };
        Update: {
          story_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'story_tag_relations_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'story_tag_relations_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'story_tags';
            referencedColumns: ['id'];
          },
        ];
      };
      story_tags: {
        Row: {
          category: string | null;
          color: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          usage_count: number | null;
        };
        Insert: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          usage_count?: number | null;
        };
        Update: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          usage_count?: number | null;
        };
        Relationships: [];
      };
      story_themes: {
        Row: {
          created_at: string | null;
          id: string;
          relevance_score: number | null;
          story_id: string | null;
          theme: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          relevance_score?: number | null;
          story_id?: string | null;
          theme: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          relevance_score?: number | null;
          story_id?: string | null;
          theme?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'story_themes_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
      storyteller_insights: {
        Row: {
          average_sentiment: number | null;
          community_contributions: Json | null;
          dominant_themes: string[] | null;
          emotional_journey: Json | null;
          engagement_score: number | null;
          id: string;
          impactful_quotes: string[] | null;
          last_story_date: string | null;
          last_updated: string | null;
          storyteller_id: string | null;
          theme_frequency: Json | null;
          total_quotes: number | null;
          total_stories: number | null;
          total_views: number | null;
        };
        Insert: {
          average_sentiment?: number | null;
          community_contributions?: Json | null;
          dominant_themes?: string[] | null;
          emotional_journey?: Json | null;
          engagement_score?: number | null;
          id?: string;
          impactful_quotes?: string[] | null;
          last_story_date?: string | null;
          last_updated?: string | null;
          storyteller_id?: string | null;
          theme_frequency?: Json | null;
          total_quotes?: number | null;
          total_stories?: number | null;
          total_views?: number | null;
        };
        Update: {
          average_sentiment?: number | null;
          community_contributions?: Json | null;
          dominant_themes?: string[] | null;
          emotional_journey?: Json | null;
          engagement_score?: number | null;
          id?: string;
          impactful_quotes?: string[] | null;
          last_story_date?: string | null;
          last_updated?: string | null;
          storyteller_id?: string | null;
          theme_frequency?: Json | null;
          total_quotes?: number | null;
          total_stories?: number | null;
          total_views?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'storyteller_insights_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: true;
            referencedRelation: 'storytellers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'storyteller_insights_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      storyteller_project_links: {
        Row: {
          connection_type: string | null;
          created_at: string | null;
          id: string;
          project_id: string;
          relevance_score: number | null;
          storyteller_id: string;
          tag_reason: string | null;
          tagged_by: string | null;
        };
        Insert: {
          connection_type?: string | null;
          created_at?: string | null;
          id?: string;
          project_id: string;
          relevance_score?: number | null;
          storyteller_id: string;
          tag_reason?: string | null;
          tagged_by?: string | null;
        };
        Update: {
          connection_type?: string | null;
          created_at?: string | null;
          id?: string;
          project_id?: string;
          relevance_score?: number | null;
          storyteller_id?: string;
          tag_reason?: string | null;
          tagged_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_project';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          airtable_id: string | null;
          bio: string | null;
          birth_year: number | null;
          community_affiliation: string | null;
          contact_preferences: Json | null;
          core_values: string[] | null;
          created: string | null;
          created_at: string | null;
          cultural_background: string[] | null;
          cultural_protocols: Json | null;
          email: string;
          expertise_areas: string[] | null;
          full_name: string | null;
          id: string;
          interest_themes: string[] | null;
          is_verified: boolean | null;
          languages_spoken: string[] | null;
          last_active: string | null;
          life_lessons: string[] | null;
          lived_experiences: string[] | null;
          location: string | null;
          organisation: string | null;
          personal_quote: string | null;
          preferred_mediums: string[] | null;
          preferred_name: string | null;
          preferred_pronouns: string | null;
          profile_complete: boolean | null;
          profile_image_url: string | null;
          profile_visibility: string | null;
          project: string | null;
          role: string | null;
          sharing_boundaries: Json | null;
          sharing_motivations: string[] | null;
          signature_quotes: Json | null;
          storyteller_type: string | null;
          themes: Json | null;
          updated_at: string | null;
          verification_status: string | null;
          verified_at: string | null;
          website: string | null;
        };
        Insert: {
          airtable_id?: string | null;
          bio?: string | null;
          birth_year?: number | null;
          community_affiliation?: string | null;
          contact_preferences?: Json | null;
          core_values?: string[] | null;
          created?: string | null;
          created_at?: string | null;
          cultural_background?: string[] | null;
          cultural_protocols?: Json | null;
          email: string;
          expertise_areas?: string[] | null;
          full_name?: string | null;
          id?: string;
          interest_themes?: string[] | null;
          is_verified?: boolean | null;
          languages_spoken?: string[] | null;
          last_active?: string | null;
          life_lessons?: string[] | null;
          lived_experiences?: string[] | null;
          location?: string | null;
          organisation?: string | null;
          personal_quote?: string | null;
          preferred_mediums?: string[] | null;
          preferred_name?: string | null;
          preferred_pronouns?: string | null;
          profile_complete?: boolean | null;
          profile_image_url?: string | null;
          profile_visibility?: string | null;
          project?: string | null;
          role?: string | null;
          sharing_boundaries?: Json | null;
          sharing_motivations?: string[] | null;
          signature_quotes?: Json | null;
          storyteller_type?: string | null;
          themes?: Json | null;
          updated_at?: string | null;
          verification_status?: string | null;
          verified_at?: string | null;
          website?: string | null;
        };
        Update: {
          airtable_id?: string | null;
          bio?: string | null;
          birth_year?: number | null;
          community_affiliation?: string | null;
          contact_preferences?: Json | null;
          core_values?: string[] | null;
          created?: string | null;
          created_at?: string | null;
          cultural_background?: string[] | null;
          cultural_protocols?: Json | null;
          email?: string;
          expertise_areas?: string[] | null;
          full_name?: string | null;
          id?: string;
          interest_themes?: string[] | null;
          is_verified?: boolean | null;
          languages_spoken?: string[] | null;
          last_active?: string | null;
          life_lessons?: string[] | null;
          lived_experiences?: string[] | null;
          location?: string | null;
          organisation?: string | null;
          personal_quote?: string | null;
          preferred_mediums?: string[] | null;
          preferred_name?: string | null;
          preferred_pronouns?: string | null;
          profile_complete?: boolean | null;
          profile_image_url?: string | null;
          profile_visibility?: string | null;
          project?: string | null;
          role?: string | null;
          sharing_boundaries?: Json | null;
          sharing_motivations?: string[] | null;
          signature_quotes?: Json | null;
          storyteller_type?: string | null;
          themes?: Json | null;
          updated_at?: string | null;
          verification_status?: string | null;
          verified_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      users_backup_20250114: {
        Row: {
          description: string | null;
          file_profile_image: string | null;
          id: string | null;
          summary: string | null;
          transcript: string | null;
        };
        Insert: {
          description?: string | null;
          file_profile_image?: string | null;
          id?: string | null;
          summary?: string | null;
          transcript?: string | null;
        };
        Update: {
          description?: string | null;
          file_profile_image?: string | null;
          id?: string | null;
          summary?: string | null;
          transcript?: string | null;
        };
        Relationships: [];
      };
      users_backup_20250714: {
        Row: {
          airtable_id: string | null;
          bio: string | null;
          birth_year: number | null;
          community_affiliation: string | null;
          contact_preferences: Json | null;
          core_values: string[] | null;
          created: string | null;
          created_at: string | null;
          cultural_background: string[] | null;
          cultural_protocols: Json | null;
          email: string | null;
          expertise_areas: string[] | null;
          full_name: string | null;
          id: string | null;
          interest_themes: string[] | null;
          is_verified: boolean | null;
          languages_spoken: string[] | null;
          last_active: string | null;
          life_lessons: string[] | null;
          lived_experiences: string[] | null;
          location: string | null;
          organisation: string | null;
          personal_quote: string | null;
          preferred_mediums: string[] | null;
          preferred_name: string | null;
          preferred_pronouns: string | null;
          profile_complete: boolean | null;
          profile_image_url: string | null;
          profile_visibility: string | null;
          project: string | null;
          role: string | null;
          sharing_boundaries: Json | null;
          sharing_motivations: string[] | null;
          signature_quotes: Json | null;
          storyteller_type: string | null;
          themes: Json | null;
          updated_at: string | null;
          verification_status: string | null;
          verified_at: string | null;
          website: string | null;
        };
        Insert: {
          airtable_id?: string | null;
          bio?: string | null;
          birth_year?: number | null;
          community_affiliation?: string | null;
          contact_preferences?: Json | null;
          core_values?: string[] | null;
          created?: string | null;
          created_at?: string | null;
          cultural_background?: string[] | null;
          cultural_protocols?: Json | null;
          email?: string | null;
          expertise_areas?: string[] | null;
          full_name?: string | null;
          id?: string | null;
          interest_themes?: string[] | null;
          is_verified?: boolean | null;
          languages_spoken?: string[] | null;
          last_active?: string | null;
          life_lessons?: string[] | null;
          lived_experiences?: string[] | null;
          location?: string | null;
          organisation?: string | null;
          personal_quote?: string | null;
          preferred_mediums?: string[] | null;
          preferred_name?: string | null;
          preferred_pronouns?: string | null;
          profile_complete?: boolean | null;
          profile_image_url?: string | null;
          profile_visibility?: string | null;
          project?: string | null;
          role?: string | null;
          sharing_boundaries?: Json | null;
          sharing_motivations?: string[] | null;
          signature_quotes?: Json | null;
          storyteller_type?: string | null;
          themes?: Json | null;
          updated_at?: string | null;
          verification_status?: string | null;
          verified_at?: string | null;
          website?: string | null;
        };
        Update: {
          airtable_id?: string | null;
          bio?: string | null;
          birth_year?: number | null;
          community_affiliation?: string | null;
          contact_preferences?: Json | null;
          core_values?: string[] | null;
          created?: string | null;
          created_at?: string | null;
          cultural_background?: string[] | null;
          cultural_protocols?: Json | null;
          email?: string | null;
          expertise_areas?: string[] | null;
          full_name?: string | null;
          id?: string | null;
          interest_themes?: string[] | null;
          is_verified?: boolean | null;
          languages_spoken?: string[] | null;
          last_active?: string | null;
          life_lessons?: string[] | null;
          lived_experiences?: string[] | null;
          location?: string | null;
          organisation?: string | null;
          personal_quote?: string | null;
          preferred_mediums?: string[] | null;
          preferred_name?: string | null;
          preferred_pronouns?: string | null;
          profile_complete?: boolean | null;
          profile_image_url?: string | null;
          profile_visibility?: string | null;
          project?: string | null;
          role?: string | null;
          sharing_boundaries?: Json | null;
          sharing_motivations?: string[] | null;
          signature_quotes?: Json | null;
          storyteller_type?: string | null;
          themes?: Json | null;
          updated_at?: string | null;
          verification_status?: string | null;
          verified_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      value_events: {
        Row: {
          created_at: string | null;
          description: string | null;
          event_type: string;
          id: string;
          metadata: Json | null;
          platform_share: number;
          story_id: string | null;
          storyteller_id: string | null;
          storyteller_share: number;
          value_amount: number;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          event_type: string;
          id?: string;
          metadata?: Json | null;
          platform_share?: number;
          story_id?: string | null;
          storyteller_id?: string | null;
          storyteller_share?: number;
          value_amount?: number;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
          platform_share?: number;
          story_id?: string | null;
          storyteller_id?: string | null;
          storyteller_share?: number;
          value_amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'value_events_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'value_events_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'storytellers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'value_events_storyteller_id_fkey';
            columns: ['storyteller_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      community_statistics: {
        Row: {
          common_themes: string[] | null;
          community_affiliation: string | null;
          community_stories: number | null;
          private_stories: number | null;
          public_stories: number | null;
          story_count: number | null;
          storyteller_count: number | null;
          storyteller_types: string[] | null;
        };
        Relationships: [];
      };
      storytellers: {
        Row: {
          bio: string | null;
          birth_year: number | null;
          community_affiliation: string | null;
          contact_preferences: Json | null;
          core_values: string[] | null;
          created_at: string | null;
          cultural_background: string[] | null;
          cultural_protocols: Json | null;
          email: string | null;
          expertise_areas: string[] | null;
          full_name: string | null;
          id: string | null;
          interest_themes: string[] | null;
          languages_spoken: string[] | null;
          last_active: string | null;
          life_lessons: string[] | null;
          lived_experiences: string[] | null;
          location: string | null;
          preferred_mediums: string[] | null;
          preferred_name: string | null;
          preferred_pronouns: string | null;
          profile_image_url: string | null;
          profile_visibility: string | null;
          sharing_boundaries: Json | null;
          sharing_motivations: string[] | null;
          signature_quotes: Json | null;
          storyteller_type: string | null;
          updated_at: string | null;
          verification_status: string | null;
        };
        Insert: {
          bio?: string | null;
          birth_year?: number | null;
          community_affiliation?: string | null;
          contact_preferences?: Json | null;
          core_values?: string[] | null;
          created_at?: string | null;
          cultural_background?: string[] | null;
          cultural_protocols?: Json | null;
          email?: string | null;
          expertise_areas?: string[] | null;
          full_name?: string | null;
          id?: string | null;
          interest_themes?: string[] | null;
          languages_spoken?: string[] | null;
          last_active?: string | null;
          life_lessons?: string[] | null;
          lived_experiences?: string[] | null;
          location?: string | null;
          preferred_mediums?: string[] | null;
          preferred_name?: string | null;
          preferred_pronouns?: string | null;
          profile_image_url?: string | null;
          profile_visibility?: string | null;
          sharing_boundaries?: Json | null;
          sharing_motivations?: string[] | null;
          signature_quotes?: Json | null;
          storyteller_type?: string | null;
          updated_at?: string | null;
          verification_status?: string | null;
        };
        Update: {
          bio?: string | null;
          birth_year?: number | null;
          community_affiliation?: string | null;
          contact_preferences?: Json | null;
          core_values?: string[] | null;
          created_at?: string | null;
          cultural_background?: string[] | null;
          cultural_protocols?: Json | null;
          email?: string | null;
          expertise_areas?: string[] | null;
          full_name?: string | null;
          id?: string | null;
          interest_themes?: string[] | null;
          languages_spoken?: string[] | null;
          last_active?: string | null;
          life_lessons?: string[] | null;
          lived_experiences?: string[] | null;
          location?: string | null;
          preferred_mediums?: string[] | null;
          preferred_name?: string | null;
          preferred_pronouns?: string | null;
          profile_image_url?: string | null;
          profile_visibility?: string | null;
          sharing_boundaries?: Json | null;
          sharing_motivations?: string[] | null;
          signature_quotes?: Json | null;
          storyteller_type?: string | null;
          updated_at?: string | null;
          verification_status?: string | null;
        };
        Relationships: [];
      };
      theme_analysis: {
        Row: {
          public_stories: number | null;
          published_stories: number | null;
          story_count: number | null;
          story_ids: string[] | null;
          storyteller_count: number | null;
          tag: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      ensure_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      extract_story_themes: {
        Args: {
          p_story_id: string;
          p_themes: string[];
          p_relevance_scores?: number[];
        };
        Returns: undefined;
      };
      get_storyteller_themes: {
        Args: { p_storyteller_id: string };
        Returns: {
          theme: string;
          story_count: number;
          avg_relevance: number;
        }[];
      };
    };
    Enums: {
      organization_type:
        | 'nonprofit'
        | 'government'
        | 'healthcare'
        | 'education'
        | 'research'
        | 'community_group'
        | 'private_sector';
      privacy_level: 'public' | 'community' | 'organization' | 'private';
      story_category:
        | 'healthcare'
        | 'education'
        | 'housing'
        | 'youth'
        | 'elder_care'
        | 'policy'
        | 'community'
        | 'environment'
        | 'employment'
        | 'social_services';
      story_status: 'draft' | 'pending' | 'approved' | 'featured' | 'archived';
      user_role:
        | 'storyteller'
        | 'organization_admin'
        | 'community_moderator'
        | 'platform_admin'
        | 'researcher';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      organization_type: [
        'nonprofit',
        'government',
        'healthcare',
        'education',
        'research',
        'community_group',
        'private_sector',
      ],
      privacy_level: ['public', 'community', 'organization', 'private'],
      story_category: [
        'healthcare',
        'education',
        'housing',
        'youth',
        'elder_care',
        'policy',
        'community',
        'environment',
        'employment',
        'social_services',
      ],
      story_status: ['draft', 'pending', 'approved', 'featured', 'archived'],
      user_role: [
        'storyteller',
        'organization_admin',
        'community_moderator',
        'platform_admin',
        'researcher',
      ],
    },
  },
} as const;
