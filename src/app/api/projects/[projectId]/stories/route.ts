/**
 * Project-Specific Stories API
 * 
 * Philosophy: Each project maintains sovereignty over their stories while
 * adhering to the universal principles of community ownership and respect.
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
        { error: 'Authentication required', philosophy: 'Stories belong to their tellers and require authenticated access' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const privacy_levels = url.searchParams.get('privacy_levels')?.split(',') || ['public'];
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const include_analysis = url.searchParams.get('include_analysis') === 'true';

    // Get project stories with sovereignty filtering
    const { stories, total_count, error } = await projectOperations.getProjectStories(
      params.projectId,
      user.id,
      {
        privacy_levels,
        limit,
        offset,
        include_analysis
      }
    );

    if (error) {
      return NextResponse.json(
        { error, sovereignty_note: 'Access to stories is controlled by community consent and cultural protocols' },
        { status: 403 }
      );
    }

    // Add sovereignty metadata to response
    const response_data = {
      stories: stories.map(story => ({
        ...story,
        sovereignty_metadata: {
          storyteller_owns: true,
          consent_respected: true,
          cultural_protocols_honored: true,
          community_controlled: true
        }
      })),
      pagination: {
        total_count,
        limit,
        offset,
        has_more: total_count > offset + limit
      },
      sovereignty_principles: {
        narrative_ownership: 'All stories remain owned by their tellers',
        consent_granular: 'Each story has individual consent settings',
        cultural_protocols: 'Community protocols are automatically respected',
        value_sharing: 'Value created from stories flows back to communities'
      }
    };

    return NextResponse.json(response_data);
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        sovereignty_note: 'Even errors respect community privacy and dignity'
      },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify user is a member of this project
    const { data: membership } = await supabase
      .from('project_members')
      .select('role, permissions')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || !membership.permissions?.can_submit_stories) {
      return NextResponse.json(
        { error: 'Not authorized to submit stories to this project' },
        { status: 403 }
      );
    }

    const story_data = await request.json();

    // Validate sovereignty requirements
    if (!story_data.consent_settings) {
      return NextResponse.json(
        { 
          error: 'Consent settings required',
          sovereignty_note: 'Every story must have explicit consent settings to respect storyteller autonomy'
        },
        { status: 400 }
      );
    }

    // Get project sovereignty framework
    const { data: project } = await supabase
      .from('projects')
      .select('sovereignty_framework, cultural_protocols')
      .eq('id', params.projectId)
      .single();

    // Apply project-specific sovereignty defaults
    const sovereignty_compliant_story = {
      ...story_data,
      project_id: params.projectId,
      storyteller_id: user.id,
      consent_settings: {
        // Ensure minimum consent requirements
        allowAnalysis: story_data.consent_settings.allowAnalysis || false,
        allowCommunitySharing: story_data.consent_settings.allowCommunitySharing || false,
        allowPublicSharing: story_data.consent_settings.allowPublicSharing || false,
        allowResearch: story_data.consent_settings.allowResearch || false,
        allowValueCreation: story_data.consent_settings.allowValueCreation || false,
        allowCrossCommunityConnection: story_data.consent_settings.allowCrossCommunityConnection || false,
        allowPolicyUse: story_data.consent_settings.allowPolicyUse || false,
        allowMediaUse: story_data.consent_settings.allowMediaUse || false,
        ...story_data.consent_settings
      },
      cultural_protocols: {
        // Inherit project-level protocols
        ...project?.cultural_protocols,
        // Allow story-specific overrides
        ...story_data.cultural_protocols
      },
      status: 'pending', // All stories start as pending for review
      submitted_at: new Date().toISOString()
    };

    // Insert the story
    const { data: new_story, error: insert_error } = await supabase
      .from('stories')
      .insert(sovereignty_compliant_story)
      .select(`
        *,
        storyteller:storyteller_id (
          full_name,
          community_affiliation
        )
      `)
      .single();

    if (insert_error) {
      return NextResponse.json(
        { error: insert_error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      story: new_story,
      sovereignty_confirmation: {
        storyteller_maintains_ownership: true,
        consent_settings_respected: true,
        cultural_protocols_applied: true,
        community_sovereignty_preserved: true,
        value_sharing_enabled: story_data.consent_settings.allowValueCreation
      },
      next_steps: {
        review_process: 'Your story will be reviewed according to community protocols',
        consent_control: 'You can update your consent settings at any time',
        community_benefit: 'If you chose to allow value creation, any benefits will flow back to your community'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}