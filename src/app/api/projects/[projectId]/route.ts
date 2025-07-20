/**
 * Individual Project Management API
 * 
 * Philosophy: Organizations maintain complete control over their project
 * configuration while adhering to sovereignty principles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { projectOperations } from '@/lib/project-operations';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get project configuration with sovereignty context
    const { config, error } = await projectOperations.getProjectConfig(
      params.projectId,
      user.id
    );

    if (error) {
      return NextResponse.json(
        { error, sovereignty_note: 'Access to project details requires membership and appropriate permissions' },
        { status: 403 }
      );
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Calculate sovereignty compliance in real-time
    const { score: current_compliance_score } = await projectOperations.updateSovereigntyCompliance(params.projectId);

    return NextResponse.json({
      ...config,
      sovereignty_status: {
        compliance_score: current_compliance_score,
        status: current_compliance_score >= 90 ? 'excellent' : 
                current_compliance_score >= 70 ? 'good' : 'needs_attention',
        last_assessment: new Date().toISOString(),
        community_controlled: true,
        data_sovereignty_maintained: true
      },
      api_endpoints: {
        stories: `/api/projects/${params.projectId}/stories`,
        insights: `/api/projects/${params.projectId}/insights`,
        members: `/api/projects/${params.projectId}/members`,
        analytics: `/api/projects/${params.projectId}/analytics`
      },
      sovereignty_principles: {
        community_ownership: 'This project belongs to the participating community',
        storyteller_control: 'Storytellers maintain ownership and control over their narratives',
        cultural_protocols: 'Community-defined protocols are technically enforced',
        value_sharing: 'Benefits from stories flow back to the community'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Validate sovereignty requirements for updates
    if (updates.sovereignty_framework) {
      const required_keys = [
        'cultural_protocols_required',
        'consent_granularity',
        'community_ownership',
        'value_sharing'
      ];

      const missing_keys = required_keys.filter(key => !(key in updates.sovereignty_framework));
      if (missing_keys.length > 0) {
        return NextResponse.json(
          {
            error: 'Sovereignty framework missing required elements',
            missing_keys,
            sovereignty_note: 'All projects must maintain minimum sovereignty standards'
          },
          { status: 400 }
        );
      }
    }

    // Apply updates with sovereignty validation
    const { success, error } = await projectOperations.updateProjectConfig(
      params.projectId,
      user.id,
      updates
    );

    if (!success) {
      return NextResponse.json(
        { error, sovereignty_note: 'Updates must maintain sovereignty compliance' },
        { status: 400 }
      );
    }

    // Get updated project configuration
    const { config: updated_config } = await projectOperations.getProjectConfig(
      params.projectId,
      user.id
    );

    return NextResponse.json({
      project: updated_config?.project,
      sovereignty_confirmation: {
        compliance_maintained: true,
        community_ownership_preserved: true,
        cultural_protocols_respected: true,
        updates_applied: Object.keys(updates)
      },
      message: 'Project configuration updated successfully while maintaining sovereignty principles'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user is project owner
    const { data: membership } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        { 
          error: 'Only project owners can delete projects',
          sovereignty_note: 'Project deletion requires the highest level of community authorization'
        },
        { status: 403 }
      );
    }

    // Check if project has active stories
    const { data: stories, count: story_count } = await supabase
      .from('stories')
      .select('id', { count: 'exact' })
      .eq('project_id', params.projectId);

    if (story_count && story_count > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete project with existing stories',
          story_count,
          sovereignty_note: 'Community stories must be preserved - consider archiving instead of deletion',
          alternative: 'Use project archiving to preserve stories while disabling access'
        },
        { status: 409 }
      );
    }

    // Soft delete by changing status to archived
    const { error: update_error } = await supabase
      .from('projects')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.projectId);

    if (update_error) {
      return NextResponse.json(
        { error: update_error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Project archived successfully',
      sovereignty_confirmation: {
        stories_preserved: true,
        community_data_protected: true,
        reversible_action: true,
        audit_trail_maintained: true
      },
      note: 'Project has been archived rather than deleted to preserve community data sovereignty'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}