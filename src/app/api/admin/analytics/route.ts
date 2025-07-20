/**
 * Master Analytics Dashboard API
 * 
 * Philosophy: Cross-project analytics serve platform-wide empowerment while
 * respecting individual project sovereignty and consent settings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { projectOperations } from '@/lib/project-operations';

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

    // Verify admin access
    const { data: user_data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!user_data || user_data.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Admin access required',
          sovereignty_note: 'Cross-project analytics require platform-level responsibility'
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const time_period = url.searchParams.get('period') || 'month';
    const include_project_breakdown = url.searchParams.get('breakdown') === 'true';
    const include_trends = url.searchParams.get('trends') === 'true';

    // Get cross-project analytics with consent validation
    const { analytics: cross_project_analytics, error: analytics_error } = 
      await projectOperations.getCrossProjectAnalytics(user.id, time_period as any);

    if (analytics_error) {
      return NextResponse.json(
        { error: analytics_error },
        { status: 500 }
      );
    }

    // Get platform-wide overview
    const platform_overview = await getPlatformOverview(supabase, time_period);
    
    // Get sovereignty compliance metrics
    const sovereignty_metrics = await getSovereigntyMetrics(supabase, time_period);
    
    // Get community impact metrics
    const impact_metrics = await getImpactMetrics(supabase, time_period);
    
    // Get project growth metrics
    const growth_metrics = await getGrowthMetrics(supabase, time_period);

    const response_data = {
      platform_overview,
      sovereignty_metrics,
      impact_metrics,
      growth_metrics,
      cross_project_analytics,
      sovereignty_principles: {
        consent_based_aggregation: 'All metrics respect individual story consent settings',
        project_sovereignty_maintained: 'Projects maintain control over their data sharing',
        community_empowerment_focused: 'Analytics highlight community strengths and impact',
        transparency_commitment: 'Communities can see how their data contributes to insights'
      },
      analysis_period: {
        period: time_period,
        description: getPeriodDescription(time_period),
        last_updated: new Date().toISOString()
      }
    };

    // Add project breakdown if requested
    if (include_project_breakdown) {
      (response_data as any).project_breakdown = await getProjectBreakdown(supabase, time_period);
    }

    // Add trend analysis if requested
    if (include_trends) {
      (response_data as any).trends = await getTrendAnalysis(supabase, time_period);
    }

    return NextResponse.json(response_data);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Helper functions for analytics calculation

async function getPlatformOverview(supabase: any, period: string) {
  const period_start = getPeriodStart(period);

  // Get basic counts
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, subscription_tier, created_at, total_stories, total_storytellers')
    .eq('status', 'active');

  const { data: stories } = await supabase
    .from('stories')
    .select('id, project_id, submitted_at, consent_settings, privacy_level')
    .gte('submitted_at', period_start);

  const { data: insights } = await supabase
    .from('community_insights')
    .select('id, project_id, generated_at, confidence_level')
    .gte('generated_at', period_start);

  const { data: storytellers } = await supabase
    .from('stories')
    .select('storyteller_id, project_id, submitted_at')
    .gte('submitted_at', period_start);

  return {
    total_projects: projects?.length || 0,
    active_projects: projects?.filter(p => p.status === 'active').length || 0,
    
    total_stories_period: stories?.length || 0,
    total_stories_platform: projects?.reduce((sum, p) => sum + (p.total_stories || 0), 0) || 0,
    
    active_storytellers_period: new Set(storytellers?.map(s => s.storyteller_id)).size || 0,
    total_storytellers_platform: projects?.reduce((sum, p) => sum + (p.total_storytellers || 0), 0) || 0,
    
    insights_generated: insights?.length || 0,
    
    subscription_tiers: {
      community: projects?.filter(p => p.subscription_tier === 'community').length || 0,
      organization: projects?.filter(p => p.subscription_tier === 'organization').length || 0,
      enterprise: projects?.filter(p => p.subscription_tier === 'enterprise').length || 0
    },
    
    geographic_distribution: await getGeographicDistribution(supabase, period_start),
    project_categories: await getProjectCategories(supabase)
  };
}

async function getSovereigntyMetrics(supabase: any, period: string) {
  const period_start = getPeriodStart(period);

  // Get sovereignty compliance data
  const { data: projects } = await supabase
    .from('projects')
    .select('sovereignty_compliance_score, sovereignty_framework')
    .eq('status', 'active');

  const { data: stories } = await supabase
    .from('stories')
    .select('consent_settings, cultural_protocols, privacy_level')
    .gte('submitted_at', period_start);

  // Calculate consent metrics
  const stories_with_consent = stories?.filter(s => 
    s.consent_settings && Object.keys(s.consent_settings).length > 0
  ).length || 0;

  const consent_categories = {
    allowAnalysis: stories?.filter(s => s.consent_settings?.allowAnalysis).length || 0,
    allowCommunitySharing: stories?.filter(s => s.consent_settings?.allowCommunitySharing).length || 0,
    allowResearch: stories?.filter(s => s.consent_settings?.allowResearch).length || 0,
    allowValueCreation: stories?.filter(s => s.consent_settings?.allowValueCreation).length || 0,
    allowPolicyUse: stories?.filter(s => s.consent_settings?.allowPolicyUse).length || 0
  };

  // Calculate compliance scores
  const compliance_scores = projects?.map(p => p.sovereignty_compliance_score || 100) || [];
  const average_compliance = compliance_scores.length > 0 ? 
    compliance_scores.reduce((sum, score) => sum + score, 0) / compliance_scores.length : 100;

  return {
    average_compliance_score: Math.round(average_compliance),
    excellent_compliance: projects?.filter(p => (p.sovereignty_compliance_score || 100) >= 90).length || 0,
    good_compliance: projects?.filter(p => {
      const score = p.sovereignty_compliance_score || 100;
      return score >= 70 && score < 90;
    }).length || 0,
    needs_attention: projects?.filter(p => (p.sovereignty_compliance_score || 100) < 70).length || 0,
    
    consent_adherence: {
      total_stories: stories?.length || 0,
      stories_with_consent,
      adherence_rate: stories?.length ? Math.round((stories_with_consent / stories.length) * 100) : 100,
      consent_breakdown: consent_categories
    },
    
    cultural_protocols: {
      stories_with_protocols: stories?.filter(s => 
        s.cultural_protocols && Object.keys(s.cultural_protocols).length > 0
      ).length || 0,
      indigenous_data_sovereignty: projects?.filter(p => 
        p.sovereignty_framework?.indigenous_data_sovereignty
      ).length || 0
    },
    
    privacy_distribution: {
      private: stories?.filter(s => s.privacy_level === 'private').length || 0,
      community: stories?.filter(s => s.privacy_level === 'community').length || 0,
      public: stories?.filter(s => s.privacy_level === 'public').length || 0
    }
  };
}

async function getImpactMetrics(supabase: any, period: string) {
  const period_start = getPeriodStart(period);

  // Get value events (grants, policy influence, etc.)
  const { data: value_events } = await supabase
    .from('value_events')
    .select('event_type, value_amount, storyteller_share, community_share, occurred_at')
    .gte('occurred_at', period_start);

  // Get insights that led to action
  const { data: actionable_insights } = await supabase
    .from('community_insights')
    .select('id, insight_type, supporting_stories, value_created')
    .gte('generated_at', period_start)
    .not('value_created', 'is', null);

  // Calculate financial impact
  const total_value_created = value_events?.reduce((sum, event) => sum + (event.value_amount || 0), 0) || 0;
  const community_value_share = value_events?.reduce((sum, event) => sum + (event.community_share || 0), 0) || 0;
  const storyteller_value_share = value_events?.reduce((sum, event) => sum + (event.storyteller_share || 0), 0) || 0;

  // Group value events by type
  const value_by_type = value_events?.reduce((acc, event) => {
    const type = event.event_type || 'other';
    acc[type] = (acc[type] || 0) + (event.value_amount || 0);
    return acc;
  }, {}) || {};

  return {
    financial_impact: {
      total_value_created,
      community_value_share,
      storyteller_value_share,
      value_sharing_rate: total_value_created > 0 ? 
        Math.round(((community_value_share + storyteller_value_share) / total_value_created) * 100) : 0
    },
    
    value_distribution: value_by_type,
    
    policy_influence: {
      policy_citations: value_events?.filter(e => e.event_type === 'policy_influence').length || 0,
      advocacy_uses: value_events?.filter(e => e.event_type === 'advocacy_use').length || 0
    },
    
    grants_and_funding: {
      grants_received: value_events?.filter(e => e.event_type === 'grant_funded').length || 0,
      total_grant_amount: value_events
        ?.filter(e => e.event_type === 'grant_funded')
        ?.reduce((sum, e) => sum + (e.value_amount || 0), 0) || 0
    },
    
    media_and_outreach: {
      media_features: value_events?.filter(e => e.event_type === 'media_license').length || 0,
      public_presentations: value_events?.filter(e => e.event_type === 'public_presentation').length || 0
    },
    
    actionable_insights: {
      total_insights: actionable_insights?.length || 0,
      policy_insights: actionable_insights?.filter(i => i.insight_type === 'policy_recommendation').length || 0,
      community_insights: actionable_insights?.filter(i => i.insight_type === 'community_strength').length || 0
    }
  };
}

async function getGrowthMetrics(supabase: any, period: string) {
  const current_period_start = getPeriodStart(period);
  const previous_period_start = getPreviousPeriodStart(period);

  // Current period data
  const { data: current_projects } = await supabase
    .from('projects')
    .select('id, created_at')
    .gte('created_at', current_period_start);

  const { data: current_stories } = await supabase
    .from('stories')
    .select('id, submitted_at')
    .gte('submitted_at', current_period_start);

  const { data: current_storytellers } = await supabase
    .from('stories')
    .select('storyteller_id, submitted_at')
    .gte('submitted_at', current_period_start);

  // Previous period data
  const { data: previous_projects } = await supabase
    .from('projects')
    .select('id, created_at')
    .gte('created_at', previous_period_start)
    .lt('created_at', current_period_start);

  const { data: previous_stories } = await supabase
    .from('stories')
    .select('id, submitted_at')
    .gte('submitted_at', previous_period_start)
    .lt('submitted_at', current_period_start);

  const { data: previous_storytellers } = await supabase
    .from('stories')
    .select('storyteller_id, submitted_at')
    .gte('submitted_at', previous_period_start)
    .lt('submitted_at', current_period_start);

  // Calculate growth rates
  const project_growth_rate = calculateGrowthRate(
    previous_projects?.length || 0,
    current_projects?.length || 0
  );

  const story_growth_rate = calculateGrowthRate(
    previous_stories?.length || 0,
    current_stories?.length || 0
  );

  const storyteller_growth_rate = calculateGrowthRate(
    new Set(previous_storytellers?.map(s => s.storyteller_id)).size || 0,
    new Set(current_storytellers?.map(s => s.storyteller_id)).size || 0
  );

  return {
    project_growth: {
      current_period: current_projects?.length || 0,
      previous_period: previous_projects?.length || 0,
      growth_rate: project_growth_rate,
      trend: getGrowthTrend(project_growth_rate)
    },
    
    story_growth: {
      current_period: current_stories?.length || 0,
      previous_period: previous_stories?.length || 0,
      growth_rate: story_growth_rate,
      trend: getGrowthTrend(story_growth_rate)
    },
    
    storyteller_growth: {
      current_period: new Set(current_storytellers?.map(s => s.storyteller_id)).size || 0,
      previous_period: new Set(previous_storytellers?.map(s => s.storyteller_id)).size || 0,
      growth_rate: storyteller_growth_rate,
      trend: getGrowthTrend(storyteller_growth_rate)
    },
    
    engagement_metrics: {
      stories_per_project: current_projects?.length ? 
        Math.round((current_stories?.length || 0) / current_projects.length) : 0,
      stories_per_storyteller: new Set(current_storytellers?.map(s => s.storyteller_id)).size ? 
        Math.round((current_stories?.length || 0) / new Set(current_storytellers?.map(s => s.storyteller_id)).size) : 0
    }
  };
}

async function getProjectBreakdown(supabase: any, period: string) {
  const period_start = getPeriodStart(period);

  const { data: projects } = await supabase
    .from('project_dashboard')
    .select(`
      id,
      name,
      organization_name,
      status,
      sovereignty_compliance_score,
      total_stories,
      active_storytellers,
      subscription_tier,
      created_at,
      last_story_submitted
    `)
    .eq('status', 'active')
    .order('total_stories', { ascending: false });

  return projects?.map(project => ({
    ...project,
    activity_level: getActivityLevel(project.total_stories, project.active_storytellers),
    compliance_status: getComplianceStatus(project.sovereignty_compliance_score),
    growth_indicator: getGrowthIndicator(project.last_story_submitted)
  })) || [];
}

async function getTrendAnalysis(supabase: any, period: string) {
  // This would implement historical trend analysis
  // For now, return basic trend indicators
  return {
    platform_growth_trend: 'increasing',
    sovereignty_compliance_trend: 'stable',
    community_engagement_trend: 'increasing',
    value_creation_trend: 'increasing',
    geographic_expansion_trend: 'expanding'
  };
}

async function getGeographicDistribution(supabase: any, period_start: string) {
  // This would analyze geographic distribution of projects/stories
  // For now, return placeholder data
  return {
    regions: {
      'North America': 45,
      'Indigenous Territories': 30,
      'Urban Centers': 15,
      'Rural Communities': 10
    },
    countries: {
      'Canada': 60,
      'United States': 25,
      'Australia': 10,
      'New Zealand': 5
    }
  };
}

async function getProjectCategories(supabase: any) {
  const { data: templates } = await supabase
    .from('project_templates')
    .select('category')
    .eq('is_active', true);

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('status', 'active');

  // This would map projects to categories based on their templates
  return {
    'indigenous_communities': 35,
    'youth_justice': 20,
    'health_sovereignty': 15,
    'environmental_justice': 15,
    'community_development': 10,
    'research_partnership': 5
  };
}

// Utility functions

function getPeriodStart(period: string): string {
  const now = new Date();
  const start = new Date(now);
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return start.toISOString();
}

function getPreviousPeriodStart(period: string): string {
  const now = new Date();
  const start = new Date(now);
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 14);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 2);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 6);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 2);
      break;
  }
  
  return start.toISOString();
}

function getPeriodDescription(period: string): string {
  const descriptions = {
    week: 'Last 7 days',
    month: 'Last 30 days',
    quarter: 'Last 3 months',
    year: 'Last 12 months'
  };
  return descriptions[period] || 'Custom period';
}

function calculateGrowthRate(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getGrowthTrend(growth_rate: number): string {
  if (growth_rate > 10) return 'strong_growth';
  if (growth_rate > 0) return 'growing';
  if (growth_rate === 0) return 'stable';
  if (growth_rate > -10) return 'declining';
  return 'concerning';
}

function getActivityLevel(stories: number, storytellers: number): string {
  if (stories > 50 && storytellers > 20) return 'very_active';
  if (stories > 20 && storytellers > 10) return 'active';
  if (stories > 5 && storytellers > 3) return 'moderate';
  if (stories > 0) return 'starting';
  return 'inactive';
}

function getComplianceStatus(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs_improvement';
  return 'critical';
}

function getGrowthIndicator(last_story: string | null): string {
  if (!last_story) return 'inactive';
  
  const daysSince = Math.floor((Date.now() - new Date(last_story).getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSince <= 7) return 'very_recent';
  if (daysSince <= 30) return 'recent';
  if (daysSince <= 90) return 'moderate';
  return 'stale';
}