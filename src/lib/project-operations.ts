// @ts-nocheck - Missing table references need proper schema generation
/**
 * Project Operations for Multi-Tenant Empathy Ledger
 *
 * Philosophy: Every project operation must honor community sovereignty principles
 * while enabling organizations to build their own storytelling platforms.
 */

import { createClient } from './supabase';
import { Database } from './database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectMember = Database['public']['Tables']['project_members']['Row'];
type ProjectTemplate = Database['public']['Tables']['project_templates']['Row'];

export interface CreateProjectRequest {
  name: string;
  organization_name: string;
  organization_email: string;
  template_id?: string;
  custom_domain?: string;
  branding?: {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    font_family?: string;
  };
  settings?: {
    story_submission_enabled?: boolean;
    public_story_display?: boolean;
    community_insights_enabled?: boolean;
    cross_project_collaboration?: boolean;
  };
}

export interface ProjectConfig {
  project: Project;
  members: ProjectMember[];
  stats: {
    total_stories: number;
    total_storytellers: number;
    sovereignty_compliance_score: number;
  };
}

export class ProjectOperations {
  private supabase = createClient();

  /**
   * Create a new "Built on Empathy Ledger" project
   */
  async createProject(
    request: CreateProjectRequest,
    creator_id: string
  ): Promise<{ project: Project; error?: string }> {
    try {
      // Validate sovereignty requirements
      if (!this.validateSovereigntyCompliance(request)) {
        return {
          project: null as any,
          error: 'Project configuration does not meet sovereignty requirements',
        };
      }

      // Create project using database function
      const { data: projectId, error: functionError } = await this.supabase.rpc(
        'create_empathy_project',
        {
          project_name: request.name,
          organization_name: request.organization_name,
          organization_email: request.organization_email,
          creator_user_id: creator_id,
          template_id: request.template_id || null,
        }
      );

      if (functionError) {
        return { project: null as any, error: functionError.message };
      }

      // Get the created project
      const { data: project, error: fetchError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        return { project: null as any, error: fetchError.message };
      }

      // Apply custom configuration if provided
      if (request.custom_domain || request.branding || request.settings) {
        const updates: Partial<ProjectInsert> = {};

        if (request.custom_domain) {
          updates.custom_domain = request.custom_domain;
        }

        if (request.branding) {
          updates.branding_config = {
            ...project.branding_config,
            ...request.branding,
          };
        }

        if (request.settings) {
          updates.settings = {
            ...project.settings,
            ...request.settings,
          };
        }

        const { error: updateError } = await this.supabase
          .from('projects')
          .update(updates)
          .eq('id', projectId);

        if (updateError) {
          console.warn('Failed to apply custom configuration:', updateError);
        }
      }

      // Log project creation for sovereignty audit
      await this.logSovereigntyEvent({
        project_id: projectId,
        event_type: 'project_created',
        description: `New project "${request.name}" created for ${request.organization_name}`,
        actor_id: creator_id,
      });

      return { project: { ...project, ...updates } as Project };
    } catch (error: any) {
      return { project: null as any, error: error.message };
    }
  }

  /**
   * Get project configuration with sovereignty context
   */
  async getProjectConfig(
    project_id: string,
    user_id: string
  ): Promise<{ config?: ProjectConfig; error?: string }> {
    try {
      // Check user permissions for this project
      const { data: membership } = await this.supabase
        .from('project_members')
        .select('role, permissions')
        .eq('project_id', project_id)
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        return { error: 'Access denied: Not a member of this project' };
      }

      // Get project details
      const { data: project, error: projectError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', project_id)
        .single();

      if (projectError || !project) {
        return { error: 'Project not found' };
      }

      // Get project members (if user has permission)
      let members: ProjectMember[] = [];
      if (['owner', 'admin'].includes(membership.role)) {
        const { data: memberData } = await this.supabase
          .from('project_members')
          .select(
            `
            *,
            user:user_id (
              full_name,
              email,
              community_affiliation
            )
          `
          )
          .eq('project_id', project_id)
          .eq('status', 'active');

        members = memberData || [];
      }

      // Get project statistics
      const { data: statsData } = await this.supabase
        .from('project_dashboard')
        .select(
          'total_stories, active_storytellers, sovereignty_compliance_score'
        )
        .eq('id', project_id)
        .single();

      const config: ProjectConfig = {
        project,
        members,
        stats: {
          total_stories: statsData?.total_stories || 0,
          total_storytellers: statsData?.active_storytellers || 0,
          sovereignty_compliance_score:
            project.sovereignty_compliance_score || 100,
        },
      };

      return { config };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Get available project templates
   */
  async getProjectTemplates(): Promise<{
    templates: ProjectTemplate[];
    error?: string;
  }> {
    try {
      const { data: templates, error } = await this.supabase
        .from('project_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name');

      if (error) {
        return { templates: [], error: error.message };
      }

      return { templates: templates || [] };
    } catch (error: any) {
      return { templates: [], error: error.message };
    }
  }

  /**
   * Get project-specific stories with sovereignty filtering
   */
  async getProjectStories(
    project_id: string,
    user_id: string,
    options: {
      privacy_levels?: string[];
      limit?: number;
      offset?: number;
      include_analysis?: boolean;
    } = {}
  ): Promise<{ stories: any[]; total_count: number; error?: string }> {
    try {
      // Verify user can access this project
      const { data: membership } = await this.supabase
        .from('project_members')
        .select('role')
        .eq('project_id', project_id)
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        return { stories: [], total_count: 0, error: 'Access denied' };
      }

      // Build query with sovereignty-aware filtering
      let query = this.supabase
        .from('stories')
        .select(
          `
          *,
          storyteller:storyteller_id (
            full_name,
            community_affiliation,
            preferred_pronouns
          )
          ${options.include_analysis ? ',story_analysis (*)' : ''}
        `,
          { count: 'exact' }
        )
        .eq('project_id', project_id)
        .order('submitted_at', { ascending: false });

      // Apply privacy filtering based on user role
      const privacy_levels = options.privacy_levels || ['public'];
      if (membership.role === 'storyteller') {
        // Storytellers can see public and community stories, plus their own
        query = query.or(
          `privacy_level.in.(${privacy_levels.join(',')}),storyteller_id.eq.${user_id}`
        );
      } else if (['admin', 'owner', 'editor'].includes(membership.role)) {
        // Admins can see all stories in the project
        query = query.in('privacy_level', ['private', 'community', 'public']);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 50) - 1
        );
      }

      const { data: stories, error, count } = await query;

      if (error) {
        return { stories: [], total_count: 0, error: error.message };
      }

      return {
        stories: stories || [],
        total_count: count || 0,
      };
    } catch (error: any) {
      return { stories: [], total_count: 0, error: error.message };
    }
  }

  /**
   * Update project configuration with sovereignty validation
   */
  async updateProjectConfig(
    project_id: string,
    user_id: string,
    updates: Partial<ProjectInsert>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check user permissions
      const { data: membership } = await this.supabase
        .from('project_members')
        .select('role, permissions')
        .eq('project_id', project_id)
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single();

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return { success: false, error: 'Insufficient permissions' };
      }

      // Validate sovereignty compliance
      if (
        updates.sovereignty_framework &&
        !this.validateSovereigntyFramework(updates.sovereignty_framework)
      ) {
        return {
          success: false,
          error: 'Sovereignty framework does not meet minimum requirements',
        };
      }

      // Apply updates
      const { error } = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project_id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log sovereignty event
      await this.logSovereigntyEvent({
        project_id,
        event_type: 'project_updated',
        description: `Project configuration updated`,
        actor_id: user_id,
        details: updates,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Invite users to project with cultural onboarding
   */
  async inviteToProject(
    project_id: string,
    inviter_id: string,
    invitations: Array<{
      email: string;
      role: string;
      cultural_training_required?: boolean;
    }>
  ): Promise<{ success: boolean; invited_count: number; error?: string }> {
    try {
      // Check inviter permissions
      const { data: membership } = await this.supabase
        .from('project_members')
        .select('role, permissions')
        .eq('project_id', project_id)
        .eq('user_id', inviter_id)
        .eq('status', 'active')
        .single();

      if (!membership || !membership.permissions?.can_invite_members) {
        return {
          success: false,
          invited_count: 0,
          error: 'Insufficient permissions to invite members',
        };
      }

      // Get project sovereignty requirements
      const { data: project } = await this.supabase
        .from('projects')
        .select('sovereignty_framework, cultural_protocols')
        .eq('id', project_id)
        .single();

      let invited_count = 0;

      for (const invitation of invitations) {
        // Create invitation with sovereignty context
        const { error } = await this.supabase
          .from('project_invitations')
          .insert({
            project_id,
            email: invitation.email,
            role: invitation.role,
            invited_by: inviter_id,
            cultural_training_required:
              invitation.cultural_training_required ??
              project?.sovereignty_framework?.cultural_protocols_required ??
              true,
          });

        if (!error) {
          invited_count++;
        }
      }

      return { success: true, invited_count };
    } catch (error: any) {
      return { success: false, invited_count: 0, error: error.message };
    }
  }

  /**
   * Get cross-project analytics with consent validation
   */
  async getCrossProjectAnalytics(
    user_id: string,
    time_period: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<{ analytics: any; error?: string }> {
    try {
      // Check if user is admin or has cross-project permissions
      const { data: user } = await this.supabase
        .from('users')
        .select('role')
        .eq('id', user_id)
        .single();

      if (!user || user.role !== 'admin') {
        return {
          analytics: null,
          error: 'Admin access required for cross-project analytics',
        };
      }

      // Get analytics from projects that allow sharing
      const { data: analytics, error } = await this.supabase
        .from('project_analytics')
        .select(
          `
          *,
          project:project_id (
            name,
            organization_name,
            settings
          )
        `
        )
        .eq(
          'period_type',
          time_period === 'week'
            ? 'weekly'
            : time_period === 'month'
              ? 'monthly'
              : 'quarterly'
        )
        .gte('period_start', this.getTimeThreshold(time_period))
        .order('period_start', { ascending: false });

      if (error) {
        return { analytics: null, error: error.message };
      }

      // Filter out analytics from projects that don't allow sharing
      const allowedAnalytics =
        analytics?.filter(
          item => item.project?.settings?.analytics_sharing !== 'project_only'
        ) || [];

      return { analytics: allowedAnalytics };
    } catch (error: any) {
      return { analytics: null, error: error.message };
    }
  }

  /**
   * Calculate and update sovereignty compliance for a project
   */
  async updateSovereigntyCompliance(
    project_id: string
  ): Promise<{ score: number; error?: string }> {
    try {
      const { data: score, error } = await this.supabase.rpc(
        'calculate_project_sovereignty_score',
        {
          target_project_id: project_id,
        }
      );

      if (error) {
        return { score: 0, error: error.message };
      }

      return { score };
    } catch (error: any) {
      return { score: 0, error: error.message };
    }
  }

  // Private helper methods

  private validateSovereigntyCompliance(
    request: CreateProjectRequest
  ): boolean {
    // Ensure all projects meet minimum sovereignty requirements
    return (
      request.organization_name.length > 0 &&
      request.organization_email.includes('@') &&
      request.name.length > 0
    );
  }

  private validateSovereigntyFramework(framework: any): boolean {
    const required_keys = [
      'cultural_protocols_required',
      'consent_granularity',
      'community_ownership',
      'value_sharing',
    ];

    return required_keys.every(key => key in framework);
  }

  private getTimeThreshold(period: string): string {
    const now = new Date();
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        now.setMonth(now.getMonth() - 3);
        break;
    }
    return now.toISOString();
  }

  private async logSovereigntyEvent(event: {
    project_id: string;
    event_type: string;
    description: string;
    actor_id: string;
    details?: any;
  }): Promise<void> {
    try {
      // Log to audit trail (implement based on your audit requirements)
      console.log('Sovereignty Event:', event);

      // Could insert into an audit_log table if needed
      // await this.supabase.from('audit_log').insert(event);
    } catch (error) {
      console.warn('Failed to log sovereignty event:', error);
    }
  }
}

// Export singleton instance
export const projectOperations = new ProjectOperations();
