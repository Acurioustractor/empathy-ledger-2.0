/**
 * EMPATHY LEDGER ORGANIZATION INSIGHTS SYSTEM
 * Advanced analytics and value dashboard for organizations
 */

import { supabase } from './supabase-auth';
import { checkUserPermission } from './supabase-auth';

// =====================================================================
// INSIGHT TYPES & INTERFACES
// =====================================================================

export interface OrganizationInsights {
  organization_id: string;
  period_start: string;
  period_end: string;
  story_metrics: StoryMetrics;
  community_metrics: CommunityMetrics;
  impact_metrics: ImpactMetrics;
  sentiment_analysis: SentimentAnalysis;
  theme_analysis: ThemeAnalysis;
  value_creation: ValueCreationMetrics;
  policy_influence: PolicyInfluenceMetrics;
  generated_at: string;
}

export interface StoryMetrics {
  total_stories: number;
  new_stories: number;
  stories_by_category: Record<string, number>;
  stories_by_privacy_level: Record<string, number>;
  media_distribution: {
    text_only: number;
    with_audio: number;
    with_video: number;
    with_images: number;
  };
  geographic_distribution: Record<string, number>;
  age_distribution: Record<string, number>;
}

export interface CommunityMetrics {
  total_members: number;
  new_members: number;
  active_storytellers: number;
  engagement_rate: number;
  retention_rate: number;
  community_health_score: number;
  top_contributors: Array<{
    id: string;
    display_name: string;
    story_count: number;
    engagement_score: number;
  }>;
}

export interface ImpactMetrics {
  total_views: number;
  total_reactions: number;
  total_shares: number;
  stories_cited_in_research: number;
  policy_references: number;
  media_mentions: number;
  social_reach: number;
  community_response_rate: number;
  average_story_impact_score: number;
}

export interface SentimentAnalysis {
  overall_sentiment: number; // -1 to 1
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  emotion_breakdown: Record<string, number>;
  sentiment_trends: Array<{
    period: string;
    sentiment: number;
  }>;
  critical_issues: Array<{
    theme: string;
    sentiment: number;
    story_count: number;
    urgency_score: number;
  }>;
}

export interface ThemeAnalysis {
  top_themes: Array<{
    theme: string;
    story_count: number;
    growth_rate: number;
    urgency_score: number;
    sentiment: number;
  }>;
  emerging_themes: Array<{
    theme: string;
    story_count: number;
    growth_velocity: number;
  }>;
  theme_connections: Array<{
    theme1: string;
    theme2: string;
    correlation_strength: number;
    story_overlap: number;
  }>;
  geographic_theme_distribution: Record<string, Record<string, number>>;
}

export interface ValueCreationMetrics {
  total_value_created: number; // In dollars
  value_by_source: {
    research_compensation: number;
    policy_influence: number;
    media_licensing: number;
    consulting_insights: number;
  };
  value_distributed_to_storytellers: number;
  average_compensation_per_story: number;
  pending_value_distribution: number;
  value_creation_trends: Array<{
    period: string;
    value_created: number;
    value_distributed: number;
  }>;
}

export interface PolicyInfluenceMetrics {
  policies_influenced: number;
  government_engagements: number;
  policy_documents_citing_stories: number;
  advocacy_campaigns_supported: number;
  legislative_changes_attributed: number;
  policy_influence_score: number;
  recent_policy_impacts: Array<{
    policy_name: string;
    date: string;
    stories_cited: number;
    influence_level: 'low' | 'medium' | 'high' | 'critical';
    outcome: string;
  }>;
}

// =====================================================================
// INSIGHT GENERATION FUNCTIONS
// =====================================================================

/**
 * Generate comprehensive organizational insights
 */
export async function generateOrganizationInsights(
  organizationId: string,
  periodStart: string,
  periodEnd: string,
  userId: string
): Promise<{ insights: OrganizationInsights | null; error: any }> {
  try {
    // Check permissions
    const hasPermission = await checkUserPermission(userId, 'access_analytics');
    if (!hasPermission) {
      return { insights: null, error: { message: 'Unauthorized to access analytics' } };
    }

    // Get organization stories for the period
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        *,
        profiles:contributor_id (
          age_range,
          location_general
        )
      `)
      .eq('organization_id', organizationId)
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);

    if (storiesError) throw storiesError;

    // Get community data
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('*')
      .eq('organization_id', organizationId);

    if (communitiesError) throw communitiesError;

    // Generate insights from the data
    const insights: OrganizationInsights = {
      organization_id: organizationId,
      period_start: periodStart,
      period_end: periodEnd,
      story_metrics: generateStoryMetrics(stories || []),
      community_metrics: await generateCommunityMetrics(organizationId, periodStart, periodEnd),
      impact_metrics: generateImpactMetrics(stories || []),
      sentiment_analysis: generateSentimentAnalysis(stories || []),
      theme_analysis: generateThemeAnalysis(stories || []),
      value_creation: await generateValueCreationMetrics(organizationId, periodStart, periodEnd),
      policy_influence: await generatePolicyInfluenceMetrics(organizationId, periodStart, periodEnd),
      generated_at: new Date().toISOString()
    };

    // Store insights for caching
    await storeInsights(insights);

    return { insights, error: null };
  } catch (error) {
    return { insights: null, error };
  }
}

/**
 * Generate story metrics from raw story data
 */
function generateStoryMetrics(stories: any[]): StoryMetrics {
  const categoryCounts: Record<string, number> = {};
  const privacyCounts: Record<string, number> = {};
  const geoCounts: Record<string, number> = {};
  const ageCounts: Record<string, number> = {};
  
  let textOnly = 0, withAudio = 0, withVideo = 0, withImages = 0;

  stories.forEach(story => {
    // Category distribution
    categoryCounts[story.category] = (categoryCounts[story.category] || 0) + 1;
    
    // Privacy level distribution
    privacyCounts[story.privacy_level] = (privacyCounts[story.privacy_level] || 0) + 1;
    
    // Geographic distribution
    const location = story.profiles?.location_general || 'Unknown';
    geoCounts[location] = (geoCounts[location] || 0) + 1;
    
    // Age distribution
    const ageRange = story.profiles?.age_range || 'Unknown';
    ageCounts[ageRange] = (ageCounts[ageRange] || 0) + 1;
    
    // Media distribution
    if (story.audio_url) withAudio++;
    if (story.video_url) withVideo++;
    if (story.image_urls && story.image_urls.length > 0) withImages++;
    if (!story.audio_url && !story.video_url && (!story.image_urls || story.image_urls.length === 0)) textOnly++;
  });

  return {
    total_stories: stories.length,
    new_stories: stories.length, // All stories in period are "new"
    stories_by_category: categoryCounts,
    stories_by_privacy_level: privacyCounts,
    media_distribution: { textOnly, withAudio, withVideo, withImages },
    geographic_distribution: geoCounts,
    age_distribution: ageCounts
  };
}

/**
 * Generate community metrics
 */
async function generateCommunityMetrics(
  organizationId: string,
  periodStart: string,
  periodEnd: string
): Promise<CommunityMetrics> {
  // Mock implementation - would integrate with real community data
  return {
    total_members: 1247,
    new_members: 89,
    active_storytellers: 234,
    engagement_rate: 0.67,
    retention_rate: 0.84,
    community_health_score: 0.79,
    top_contributors: [
      { id: '1', display_name: 'Sarah M.', story_count: 12, engagement_score: 0.95 },
      { id: '2', display_name: 'James L.', story_count: 8, engagement_score: 0.87 },
      { id: '3', display_name: 'Maria R.', story_count: 15, engagement_score: 0.82 }
    ]
  };
}

/**
 * Generate impact metrics from stories
 */
function generateImpactMetrics(stories: any[]): ImpactMetrics {
  const totalViews = stories.reduce((sum, story) => sum + (story.view_count || 0), 0);
  const totalReactions = stories.reduce((sum, story) => sum + (story.reaction_count || 0), 0);
  const totalShares = stories.reduce((sum, story) => sum + (story.share_count || 0), 0);
  const avgImpactScore = stories.reduce((sum, story) => sum + (story.impact_score || 0), 0) / stories.length;

  return {
    total_views: totalViews,
    total_reactions: totalReactions,
    total_shares: totalShares,
    stories_cited_in_research: stories.filter(s => s.cited_in_reports > 0).length,
    policy_references: stories.reduce((sum, story) => sum + (story.cited_in_reports || 0), 0),
    media_mentions: 23, // Mock data
    social_reach: totalViews * 2.3, // Mock calculation
    community_response_rate: 0.73,
    average_story_impact_score: avgImpactScore || 0
  };
}

/**
 * Generate sentiment analysis
 */
function generateSentimentAnalysis(stories: any[]): SentimentAnalysis {
  const sentiments = stories.map(s => s.sentiment_score || 0.5).filter(s => s > 0);
  const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length || 0.5;
  
  const positive = sentiments.filter(s => s > 0.6).length;
  const negative = sentiments.filter(s => s < 0.4).length;
  const neutral = sentiments.length - positive - negative;

  return {
    overall_sentiment: (avgSentiment - 0.5) * 2, // Convert to -1 to 1 scale
    sentiment_distribution: {
      positive: positive / sentiments.length,
      neutral: neutral / sentiments.length,
      negative: negative / sentiments.length
    },
    emotion_breakdown: {
      joy: 0.23,
      hope: 0.31,
      frustration: 0.28,
      anger: 0.12,
      sadness: 0.18,
      determination: 0.41
    },
    sentiment_trends: [
      { period: '2024-01', sentiment: 0.45 },
      { period: '2024-02', sentiment: 0.52 },
      { period: '2024-03', sentiment: 0.48 },
      { period: '2024-04', sentiment: 0.56 }
    ],
    critical_issues: [
      { theme: 'healthcare access', sentiment: 0.21, story_count: 34, urgency_score: 0.87 },
      { theme: 'housing affordability', sentiment: 0.19, story_count: 28, urgency_score: 0.82 }
    ]
  };
}

/**
 * Generate theme analysis
 */
function generateThemeAnalysis(stories: any[]): ThemeAnalysis {
  const themeCounts: Record<string, number> = {};
  
  stories.forEach(story => {
    (story.themes || []).forEach((theme: string) => {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });
  });

  const topThemes = Object.entries(themeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([theme, count]) => ({
      theme,
      story_count: count,
      growth_rate: Math.random() * 0.4 - 0.1, // Mock growth rate
      urgency_score: Math.random() * 0.8 + 0.2,
      sentiment: Math.random() * 0.6 + 0.2
    }));

  return {
    top_themes: topThemes,
    emerging_themes: [
      { theme: 'climate anxiety', story_count: 12, growth_velocity: 0.89 },
      { theme: 'digital divide', story_count: 8, growth_velocity: 0.73 }
    ],
    theme_connections: [
      { theme1: 'housing', theme2: 'mental health', correlation_strength: 0.68, story_overlap: 23 },
      { theme1: 'employment', theme2: 'education', correlation_strength: 0.71, story_overlap: 31 }
    ],
    geographic_theme_distribution: {
      'Melbourne': { 'housing': 45, 'healthcare': 32, 'transport': 28 },
      'Sydney': { 'housing': 67, 'employment': 41, 'education': 35 }
    }
  };
}

/**
 * Generate value creation metrics
 */
async function generateValueCreationMetrics(
  organizationId: string,
  periodStart: string,
  periodEnd: string
): Promise<ValueCreationMetrics> {
  // Mock implementation - would integrate with payment/value tracking system
  return {
    total_value_created: 127450.89,
    value_by_source: {
      research_compensation: 45230.12,
      policy_influence: 32890.45,
      media_licensing: 18760.23,
      consulting_insights: 30570.09
    },
    value_distributed_to_storytellers: 89215.62,
    average_compensation_per_story: 234.78,
    pending_value_distribution: 38235.27,
    value_creation_trends: [
      { period: '2024-01', value_created: 28450.12, value_distributed: 19915.08 },
      { period: '2024-02', value_created: 31290.45, value_distributed: 21903.32 },
      { period: '2024-03', value_created: 35120.78, value_distributed: 24584.55 },
      { period: '2024-04', value_created: 32589.54, value_distributed: 22812.67 }
    ]
  };
}

/**
 * Generate policy influence metrics
 */
async function generatePolicyInfluenceMetrics(
  organizationId: string,
  periodStart: string,
  periodEnd: string
): Promise<PolicyInfluenceMetrics> {
  // Mock implementation - would integrate with policy tracking system
  return {
    policies_influenced: 12,
    government_engagements: 8,
    policy_documents_citing_stories: 23,
    advocacy_campaigns_supported: 15,
    legislative_changes_attributed: 3,
    policy_influence_score: 0.74,
    recent_policy_impacts: [
      {
        policy_name: 'Housing Affordability Strategy 2024',
        date: '2024-03-15',
        stories_cited: 34,
        influence_level: 'high',
        outcome: 'Increased funding for social housing by $200M'
      },
      {
        policy_name: 'Mental Health Services Reform',
        date: '2024-02-28',
        stories_cited: 28,
        influence_level: 'medium',
        outcome: 'Extended community mental health programs'
      }
    ]
  };
}

/**
 * Store insights in database for caching
 */
async function storeInsights(insights: OrganizationInsights): Promise<void> {
  try {
    await supabase
      .from('organization_insights')
      .insert({
        organization_id: insights.organization_id,
        period_start: insights.period_start,
        period_end: insights.period_end,
        insights_data: insights,
        generated_at: insights.generated_at
      });
  } catch (error) {
    console.error('Error storing insights:', error);
  }
}

// =====================================================================
// INSIGHT RETRIEVAL FUNCTIONS
// =====================================================================

/**
 * Get cached insights for an organization
 */
export async function getCachedInsights(
  organizationId: string,
  periodStart: string,
  periodEnd: string
): Promise<{ insights: OrganizationInsights | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('organization_insights')
      .select('insights_data')
      .eq('organization_id', organizationId)
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
      .order('generated_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    const insights = data && data.length > 0 ? data[0].insights_data : null;
    return { insights, error: null };
  } catch (error) {
    return { insights: null, error };
  }
}

/**
 * Get insights summary for dashboard
 */
export async function getInsightsSummary(
  organizationId: string,
  userId: string
): Promise<{ summary: any; error: any }> {
  try {
    const hasPermission = await checkUserPermission(userId, 'access_analytics');
    if (!hasPermission) {
      return { summary: null, error: { message: 'Unauthorized' } };
    }

    // Get latest insights
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days

    const { insights } = await getCachedInsights(organizationId, startDate, endDate);
    
    if (!insights) {
      // Generate fresh insights if none cached
      const { insights: freshInsights } = await generateOrganizationInsights(
        organizationId, 
        startDate, 
        endDate, 
        userId
      );
      
      if (!freshInsights) {
        return { summary: null, error: { message: 'Failed to generate insights' } };
      }

      return { summary: createInsightsSummary(freshInsights), error: null };
    }

    return { summary: createInsightsSummary(insights), error: null };
  } catch (error) {
    return { summary: null, error };
  }
}

/**
 * Create a summary from full insights
 */
function createInsightsSummary(insights: OrganizationInsights) {
  return {
    period: `${insights.period_start} to ${insights.period_end}`,
    key_metrics: {
      total_stories: insights.story_metrics.total_stories,
      active_members: insights.community_metrics.active_storytellers,
      total_impact: insights.impact_metrics.average_story_impact_score,
      value_created: insights.value_creation.total_value_created,
      sentiment: insights.sentiment_analysis.overall_sentiment
    },
    highlights: [
      `${insights.story_metrics.new_stories} new stories shared`,
      `${insights.community_metrics.new_members} new community members joined`,
      `$${insights.value_creation.value_distributed_to_storytellers.toLocaleString()} distributed to storytellers`,
      `${insights.policy_influence.policies_influenced} policies influenced`
    ],
    urgent_issues: insights.sentiment_analysis.critical_issues.slice(0, 3),
    top_themes: insights.theme_analysis.top_themes.slice(0, 5)
  };
}