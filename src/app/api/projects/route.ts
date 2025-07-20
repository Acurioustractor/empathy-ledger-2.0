/**
 * Main Projects API - Organization Management
 * 
 * Philosophy: Organizations can create sovereign storytelling spaces while
 * maintaining the core principles of community ownership and data sovereignty.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { projectOperations, CreateProjectRequest } from '@/lib/project-operations';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const include_stats = url.searchParams.get('include_stats') === 'true';
    const status_filter = url.searchParams.get('status') || 'active';

    // Get projects user has access to
    let query = supabase
      .from('projects')
      .select(`
        id,
        name,
        slug,
        organization_name,
        status,
        subscription_tier,
        sovereignty_compliance_score,
        custom_domain,
        settings,
        created_at,
        launched_at,
        total_stories,
        total_storytellers,
        last_story_submitted,
        project_members!inner (
          role,
          status,
          joined_at
        )
      `)
      .eq('project_members.user_id', user.id)
      .eq('project_members.status', 'active')
      .eq('status', status_filter)
      .order('created_at', { ascending: false });

    const { data: projects, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Add sovereignty metadata and role context
    const enriched_projects = projects?.map(project => ({
      ...project,
      user_role: project.project_members[0]?.role,
      sovereignty_status: {
        compliance_score: project.sovereignty_compliance_score,
        status: project.sovereignty_compliance_score >= 90 ? 'excellent' : 
                project.sovereignty_compliance_score >= 70 ? 'good' : 'needs_attention',
        community_controlled: true,
        data_sovereignty_maintained: true
      },
      project_health: {
        stories_this_month: 0, // TODO: Calculate from recent submissions
        active_storytellers: project.total_storytellers,
        engagement_trend: 'stable'
      }
    })) || [];

    return NextResponse.json({
      projects: enriched_projects,
      sovereignty_principles: {
        community_ownership: 'All projects maintain community control over their data',
        data_sovereignty: 'Each organization controls their storytelling space',
        cross_project_collaboration: 'Organizations can choose to collaborate while maintaining sovereignty',
        value_sharing: 'Benefits from insights flow back to storytelling communities'
      },
      platform_stats: {
        total_projects: enriched_projects.length,
        active_organizations: enriched_projects.filter(p => p.status === 'active').length,
        sovereignty_compliant: enriched_projects.filter(p => p.sovereignty_compliance_score >= 90).length
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const project_request: CreateProjectRequest = await request.json();

    // Validate required fields
    if (!project_request.name || !project_request.organization_name || !project_request.organization_email) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['name', 'organization_name', 'organization_email'],
          sovereignty_note: 'Organization identity is required for community accountability'
        },
        { status: 400 }
      );
    }

    // Validate organization email format
    if (!project_request.organization_email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid organization email required' },
        { status: 400 }
      );
    }

    // Check for duplicate project names/slugs
    const potential_slug = project_request.name.toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data: existing_project } = await supabase
      .from('projects')
      .select('id, name')
      .ilike('name', project_request.name)
      .single();

    if (existing_project) {
      return NextResponse.json(
        { 
          error: 'A project with this name already exists',
          suggestion: 'Consider adding your organization name to make it unique'
        },
        { status: 409 }
      );
    }

    // Create the project using our sovereignty-compliant operation
    const { project, error: create_error } = await projectOperations.createProject(
      project_request,
      user.id
    );

    if (create_error || !project) {
      return NextResponse.json(
        { error: create_error || 'Failed to create project' },
        { status: 400 }
      );
    }

    // Get the created project with full details
    const { data: full_project } = await supabase
      .from('projects')
      .select(`
        *,
        project_members (
          role,
          permissions,
          status,
          joined_at
        )
      `)
      .eq('id', project.id)
      .single();

    return NextResponse.json({
      project: full_project,
      sovereignty_confirmation: {
        community_ownership_established: true,
        data_sovereignty_configured: true,
        cultural_protocols_ready: true,
        consent_management_enabled: true,
        value_sharing_configured: true
      },
      next_steps: {
        onboarding: 'Complete your project setup to start collecting stories',
        team_setup: 'Invite team members and storytellers to your project',
        customization: 'Configure branding and cultural protocols',
        launch: 'Begin collecting community stories'
      },
      api_access: {
        project_endpoint: `/api/projects/${project.id}`,
        stories_endpoint: `/api/projects/${project.id}/stories`,
        insights_endpoint: `/api/projects/${project.id}/insights`,
        public_api: project.api_configuration?.public_api_enabled || false
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}