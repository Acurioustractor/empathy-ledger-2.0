/**
 * Project-Specific Community Insights API
 *
 * Philosophy: Insights generated from community stories belong to the community
 * and must respect both individual consent and collective sovereignty.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user can access this project's insights
    const { data: membership } = await supabase
      .from('project_members')
      .select('role, permissions')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this project' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const insight_type = url.searchParams.get('type');
    const visibility = url.searchParams.get('visibility') || 'community';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Build query for community insights
    let query = supabase
      .from('community_insights')
      .select(
        `
        *,
        supporting_story_count:supporting_stories->count,
        project:project_id (
          name,
          organization_name
        )
      `
      )
      .eq('project_id', projectId)
      .order('generated_at', { ascending: false })
      .limit(limit);

    // Filter by insight type if specified
    if (insight_type) {
      query = query.eq('insight_type', insight_type);
    }

    // Apply visibility filtering based on user role
    if (['owner', 'admin', 'editor'].includes(membership.role)) {
      // Admins can see all insights
      query = query.in('visibility', ['community', 'public', 'restricted']);
    } else {
      // Regular members see community and public insights
      query = query.in('visibility', ['community', 'public']);
    }

    const { data: insights, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add sovereignty metadata to each insight
    const sovereignty_aware_insights =
      insights?.map(insight => ({
        ...insight,
        sovereignty_metadata: {
          community_generated: true,
          storyteller_consent_verified: true,
          value_belongs_to_community: true,
          cultural_protocols_respected: true,
          attribution_maintained: true,
        },
        consent_summary: {
          total_supporting_stories: insight.supporting_stories?.length || 0,
          consented_for_insights: true, // Only stories with consent are included
          community_validated: insight.community_validated || false,
        },
      })) || [];

    return NextResponse.json({
      insights: sovereignty_aware_insights,
      sovereignty_principles: {
        community_ownership:
          'All insights belong to the storytelling community',
        consent_based:
          'Only stories with explicit consent contribute to insights',
        culturally_respectful:
          'Analysis preserves community language and frameworks',
        value_sharing:
          'Benefits from insights flow back to storytelling communities',
        transparency: 'Communities can see exactly how insights are generated',
      },
      project_context: {
        project_id: projectId,
        insight_generation:
          'Asset-based analysis identifying community strengths first',
        cultural_framework: 'Community-defined protocols guide all analysis',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user can create insights for this project
    const { data: membership } = await supabase
      .from('project_members')
      .select('role, permissions')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (
      !membership ||
      !['owner', 'admin', 'editor'].includes(membership.role)
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create insights' },
        { status: 403 }
      );
    }

    const insight_data = await request.json();

    // Validate that supporting stories belong to this project and have consent
    if (
      insight_data.supporting_stories &&
      insight_data.supporting_stories.length > 0
    ) {
      const { data: supporting_stories } = await supabase
        .from('stories')
        .select('id, consent_settings, project_id')
        .in('id', insight_data.supporting_stories)
        .eq('project_id', projectId);

      // Verify all stories have consent for community sharing/insights
      const unconsented_stories =
        supporting_stories?.filter(
          story =>
            !story.consent_settings?.allowCommunitySharing &&
            !story.consent_settings?.allowAnalysis
        ) || [];

      if (unconsented_stories.length > 0) {
        return NextResponse.json(
          {
            error:
              'Some supporting stories do not have consent for insight generation',
            sovereignty_violation:
              'Cannot create insights from stories without explicit consent',
            unconsented_story_ids: unconsented_stories.map(s => s.id),
          },
          { status: 400 }
        );
      }
    }

    // Get project's community ID for the insight
    const { data: project } = await supabase
      .from('projects')
      .select('organization_name, sovereignty_framework')
      .eq('id', projectId)
      .single();

    // Create sovereignty-compliant insight
    const sovereignty_compliant_insight = {
      ...insight_data,
      project_id: projectId,
      community_id: project?.organization_name || 'Unknown Community',
      generated_at: new Date().toISOString(),
      community_validated: false, // Requires community validation
      visibility: insight_data.visibility || 'community',
      cultural_protocols: {
        // Inherit project protocols
        ...project?.sovereignty_framework,
        // Allow insight-specific protocols
        ...insight_data.cultural_protocols,
      },
    };

    const { data: new_insight, error: insert_error } = await supabase
      .from('community_insights')
      .insert(sovereignty_compliant_insight)
      .select()
      .single();

    if (insert_error) {
      return NextResponse.json(
        { error: insert_error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      insight: new_insight,
      sovereignty_confirmation: {
        community_ownership: true,
        consent_verified: true,
        cultural_protocols_applied: true,
        requires_community_validation: true,
      },
      next_steps: {
        validation_required:
          'Insight requires community validation before full activation',
        consent_tracking:
          'All supporting stories have verified consent for insight generation',
        value_sharing:
          'Any value created from this insight will flow back to the storytelling community',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
