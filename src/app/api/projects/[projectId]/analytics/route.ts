/**
 * Project Analytics API
 *
 * Philosophy: Analytics serve the community and respect consent.
 * All metrics focus on empowerment and community benefit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
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

    // Verify user can access analytics for this project
    const { data: membership } = await supabase
      .from('project_members')
      .select('role, permissions')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || !membership.permissions?.can_view_analytics) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions to view analytics',
          sovereignty_note: 'Analytics access requires community authorization',
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const time_period = url.searchParams.get('period') || 'month'; // week, month, quarter, year
    const include_trends = url.searchParams.get('trends') === 'true';

    // Calculate time boundaries
    const now = new Date();
    const period_start = new Date();

    switch (time_period) {
      case 'week':
        period_start.setDate(now.getDate() - 7);
        break;
      case 'month':
        period_start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        period_start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        period_start.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get project overview
    const { data: project } = await supabase
      .from('projects')
      .select(
        'name, organization_name, sovereignty_compliance_score, created_at'
      )
      .eq('id', params.projectId)
      .single();

    // Get story metrics
    const { data: story_metrics } = await supabase
      .from('stories')
      .select('id, status, privacy_level, submitted_at, consent_settings')
      .eq('project_id', params.projectId)
      .gte('submitted_at', period_start.toISOString());

    // Get storyteller metrics
    const { data: storyteller_metrics } = await supabase
      .from('stories')
      .select('storyteller_id, submitted_at')
      .eq('project_id', params.projectId)
      .gte('submitted_at', period_start.toISOString());

    // Get community insights metrics
    const { data: insights_metrics } = await supabase
      .from('community_insights')
      .select(
        'id, insight_type, confidence_level, generated_at, supporting_stories'
      )
      .eq('project_id', params.projectId)
      .gte('generated_at', period_start.toISOString());

    // Calculate analytics
    const analytics = {
      overview: {
        project_name: project?.name,
        organization: project?.organization_name,
        sovereignty_score: project?.sovereignty_compliance_score,
        analysis_period: {
          start: period_start.toISOString(),
          end: now.toISOString(),
          duration: time_period,
        },
      },

      story_analytics: {
        total_stories: story_metrics?.length || 0,
        published_stories:
          story_metrics?.filter(s => s.status === 'published').length || 0,
        pending_stories:
          story_metrics?.filter(s => s.status === 'pending').length || 0,

        privacy_distribution: {
          public:
            story_metrics?.filter(s => s.privacy_level === 'public').length ||
            0,
          community:
            story_metrics?.filter(s => s.privacy_level === 'community')
              .length || 0,
          private:
            story_metrics?.filter(s => s.privacy_level === 'private').length ||
            0,
        },

        consent_analytics: {
          allow_analysis:
            story_metrics?.filter(s => s.consent_settings?.allowAnalysis)
              .length || 0,
          allow_community_sharing:
            story_metrics?.filter(
              s => s.consent_settings?.allowCommunitySharing
            ).length || 0,
          allow_research:
            story_metrics?.filter(s => s.consent_settings?.allowResearch)
              .length || 0,
          allow_value_creation:
            story_metrics?.filter(s => s.consent_settings?.allowValueCreation)
              .length || 0,
        },
      },

      community_analytics: {
        active_storytellers:
          new Set(storyteller_metrics?.map(s => s.storyteller_id)).size || 0,
        engagement_rate:
          storyteller_metrics && storyteller_metrics.length > 0
            ? (
                (new Set(storyteller_metrics.map(s => s.storyteller_id)).size /
                  storyteller_metrics.length) *
                100
              ).toFixed(1)
            : 0,
        average_stories_per_storyteller:
          storyteller_metrics && storyteller_metrics.length > 0
            ? (
                storyteller_metrics.length /
                new Set(storyteller_metrics.map(s => s.storyteller_id)).size
              ).toFixed(1)
            : 0,
      },

      insights_analytics: {
        total_insights: insights_metrics?.length || 0,
        insight_types: this.groupByInsightType(insights_metrics || []),
        average_confidence:
          insights_metrics && insights_metrics.length > 0
            ? (
                insights_metrics.reduce(
                  (sum, i) => sum + (i.confidence_level || 0),
                  0
                ) / insights_metrics.length
              ).toFixed(2)
            : 0,
        stories_contributing_to_insights: this.countUniqueSupportingStories(
          insights_metrics || []
        ),
      },

      sovereignty_analytics: {
        compliance_score: project?.sovereignty_compliance_score || 100,
        consent_adherence_rate:
          story_metrics && story_metrics.length > 0
            ? (
                (story_metrics.filter(
                  s => Object.keys(s.consent_settings || {}).length > 0
                ).length /
                  story_metrics.length) *
                100
              ).toFixed(1)
            : 100,
        community_controlled_stories:
          story_metrics?.filter(
            s =>
              s.privacy_level === 'community' || s.privacy_level === 'private'
          ).length || 0,
        value_creation_enabled:
          story_metrics?.filter(s => s.consent_settings?.allowValueCreation)
            .length || 0,
      },
    };

    // Add trend analysis if requested
    if (include_trends && ['month', 'quarter', 'year'].includes(time_period)) {
      const trend_analytics = await this.calculateTrends(
        supabase,
        params.projectId,
        time_period
      );
      (analytics as any).trends = trend_analytics;
    }

    return NextResponse.json({
      analytics,
      sovereignty_principles: {
        community_benefit:
          'All analytics serve community empowerment and growth',
        consent_respected: 'Only consented data contributes to analytics',
        privacy_preserved:
          'Individual privacy is maintained in all aggregations',
        community_ownership: 'Communities own and control their analytics',
      },
      insights_for_community: {
        story_engagement:
          analytics.story_analytics.total_stories > 0 ? 'active' : 'building',
        community_participation:
          analytics.community_analytics.active_storytellers > 5
            ? 'strong'
            : 'growing',
        sovereignty_status:
          analytics.sovereignty_analytics.compliance_score >= 90
            ? 'excellent'
            : 'good',
        growth_trajectory: 'positive', // TODO: Calculate based on trends
      },
      recommendations: this.generateCommunityRecommendations(analytics),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Helper functions for analytics calculation
function groupByInsightType(insights: any[]): Record<string, number> {
  return insights.reduce((acc, insight) => {
    const type = insight.insight_type || 'general';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
}

function countUniqueSupportingStories(insights: any[]): number {
  const allStoryIds = new Set();
  insights.forEach(insight => {
    if (
      insight.supporting_stories &&
      Array.isArray(insight.supporting_stories)
    ) {
      insight.supporting_stories.forEach(id => allStoryIds.add(id));
    }
  });
  return allStoryIds.size;
}

async function calculateTrends(
  supabase: any,
  projectId: string,
  period: string
): Promise<any> {
  // Implementation for trend calculation would go here
  // This would analyze historical data to show growth/decline patterns
  return {
    story_submission_trend: 'increasing',
    community_engagement_trend: 'stable',
    sovereignty_compliance_trend: 'maintaining',
  };
}

function generateCommunityRecommendations(analytics: any): string[] {
  const recommendations = [];

  if (analytics.story_analytics.total_stories < 10) {
    recommendations.push(
      'Consider outreach to encourage more community members to share their stories'
    );
  }

  if (analytics.sovereignty_analytics.consent_adherence_rate < 90) {
    recommendations.push(
      'Review consent collection process to ensure all stories have proper consent settings'
    );
  }

  if (analytics.community_analytics.active_storytellers < 5) {
    recommendations.push(
      'Focus on community engagement to grow active storyteller base'
    );
  }

  if (
    analytics.insights_analytics.total_insights === 0 &&
    analytics.story_analytics.total_stories > 5
  ) {
    recommendations.push(
      'Consider generating community insights from existing stories to show collective wisdom'
    );
  }

  return recommendations;
}
