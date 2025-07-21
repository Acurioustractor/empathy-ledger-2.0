/**
 * Growth Metrics Component
 *
 * Philosophy: Growth that serves community empowerment,
 * measuring expansion of storytelling capacity and impact.
 */

'use client';

import React from 'react';

interface GrowthMetricsProps {
  data: {
    project_growth: {
      current_period: number;
      previous_period: number;
      growth_rate: number;
      trend: string;
    };
    story_growth: {
      current_period: number;
      previous_period: number;
      growth_rate: number;
      trend: string;
    };
    storyteller_growth: {
      current_period: number;
      previous_period: number;
      growth_rate: number;
      trend: string;
    };
    engagement_metrics: {
      stories_per_project: number;
      stories_per_storyteller: number;
    };
  };
}

export function GrowthMetrics({ data }: GrowthMetricsProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'strong_growth':
        return 'text-green-600';
      case 'growing':
        return 'text-green-500';
      case 'stable':
        return 'text-blue-600';
      case 'declining':
        return 'text-yellow-600';
      case 'concerning':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'strong_growth':
        return '🚀';
      case 'growing':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
      case 'concerning':
        return '⚠️';
      default:
        return '📊';
    }
  };

  const getTrendDescription = (trend: string) => {
    switch (trend) {
      case 'strong_growth':
        return 'Excellent growth momentum';
      case 'growing':
        return 'Healthy growth trajectory';
      case 'stable':
        return 'Stable, consistent activity';
      case 'declining':
        return 'Needs attention - declining';
      case 'concerning':
        return 'Critical - requires intervention';
      default:
        return 'Monitoring growth patterns';
    }
  };

  const formatGrowthRate = (rate: number) => {
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Growth Metrics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Community expansion and storytelling capacity growth
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Growth Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GrowthCard
            title="Project Growth"
            current={data.project_growth.current_period}
            previous={data.project_growth.previous_period}
            growthRate={data.project_growth.growth_rate}
            trend={data.project_growth.trend}
            icon="🏛️"
            description="New organizations joining"
          />

          <GrowthCard
            title="Story Growth"
            current={data.story_growth.current_period}
            previous={data.story_growth.previous_period}
            growthRate={data.story_growth.growth_rate}
            trend={data.story_growth.trend}
            icon="📖"
            description="Stories shared this period"
          />

          <GrowthCard
            title="Storyteller Growth"
            current={data.storyteller_growth.current_period}
            previous={data.storyteller_growth.previous_period}
            growthRate={data.storyteller_growth.growth_rate}
            trend={data.storyteller_growth.trend}
            icon="👥"
            description="New voices joining communities"
          />
        </div>

        {/* Growth Trends Visual */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Growth Trends
          </h3>
          <div className="space-y-4">
            <TrendBar
              label="Project Expansion"
              growthRate={data.project_growth.growth_rate}
              trend={data.project_growth.trend}
              description="Rate of new organizations building storytelling communities"
            />
            <TrendBar
              label="Story Volume"
              growthRate={data.story_growth.growth_rate}
              trend={data.story_growth.trend}
              description="Increase in community narratives being shared"
            />
            <TrendBar
              label="Community Participation"
              growthRate={data.storyteller_growth.growth_rate}
              trend={data.storyteller_growth.trend}
              description="Growth in active community members sharing experiences"
            />
          </div>
        </div>

        {/* Engagement Quality Metrics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Engagement Quality
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.engagement_metrics.stories_per_project.toFixed(1)}
              </div>
              <div className="text-sm font-medium text-blue-700">
                Stories per Project
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Average community engagement depth
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.engagement_metrics.stories_per_storyteller.toFixed(1)}
              </div>
              <div className="text-sm font-medium text-purple-700">
                Stories per Storyteller
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Individual sharing frequency
              </div>
            </div>
          </div>
        </div>

        {/* Growth Health Assessment */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Growth Health Assessment
          </h3>
          <div className="space-y-3">
            <HealthIndicator
              metric="Platform Adoption"
              status={getOverallHealthStatus([
                data.project_growth.trend,
                data.story_growth.trend,
                data.storyteller_growth.trend,
              ])}
              description="Overall platform growth trajectory"
            />
            <HealthIndicator
              metric="Community Engagement"
              status={getEngagementHealthStatus(data.engagement_metrics)}
              description="Quality of community participation"
            />
            <HealthIndicator
              metric="Sustainable Growth"
              status={getSustainabilityStatus(data)}
              description="Balance between growth and quality"
            />
          </div>
        </div>

        {/* Growth Insights */}
        <div className="border-t pt-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Growth Insights</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {generateGrowthInsights(data).map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GrowthCardProps {
  title: string;
  current: number;
  previous: number;
  growthRate: number;
  trend: string;
  icon: string;
  description: string;
}

function GrowthCard({
  title,
  current,
  previous,
  growthRate,
  trend,
  icon,
  description,
}: GrowthCardProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'strong_growth':
        return 'text-green-600';
      case 'growing':
        return 'text-green-500';
      case 'stable':
        return 'text-blue-600';
      case 'declining':
        return 'text-yellow-600';
      case 'concerning':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'strong_growth':
        return '🚀';
      case 'growing':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
      case 'concerning':
        return '⚠️';
      default:
        return '📊';
    }
  };

  const formatGrowthRate = (rate: number) => {
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate}%`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-lg">{getTrendIcon(trend)}</span>
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-1">
        {current.toLocaleString()}
      </div>

      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">vs {previous}</span>
        <span className={`font-medium ${getTrendColor(trend)}`}>
          {formatGrowthRate(growthRate)}
        </span>
      </div>

      <div className="text-xs text-gray-500 mt-2">{description}</div>
    </div>
  );
}

interface TrendBarProps {
  label: string;
  growthRate: number;
  trend: string;
  description: string;
}

function TrendBar({ label, growthRate, trend, description }: TrendBarProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'strong_growth':
        return 'bg-green-500';
      case 'growing':
        return 'bg-green-400';
      case 'stable':
        return 'bg-blue-500';
      case 'declining':
        return 'bg-yellow-500';
      case 'concerning':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'strong_growth':
        return '🚀';
      case 'growing':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
      case 'concerning':
        return '⚠️';
      default:
        return '📊';
    }
  };

  const formatGrowthRate = (rate: number) => {
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate}%`;
  };

  // Calculate bar width based on growth rate (normalized to 0-100 scale)
  const normalizedWidth = Math.min(Math.max((growthRate + 50) * 2, 10), 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <span>{getTrendIcon(trend)}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">
          {formatGrowthRate(growthRate)}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full ${getTrendColor(trend)}`}
          style={{ width: `${normalizedWidth}%` }}
        ></div>
      </div>

      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

interface HealthIndicatorProps {
  metric: string;
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  description: string;
}

function HealthIndicator({
  metric,
  status,
  description,
}: HealthIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'needs_attention':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return '🟢';
      case 'good':
        return '🔵';
      case 'needs_attention':
        return '🟡';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusText = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getStatusIcon(status)}</span>
        <div>
          <div className="text-sm font-medium text-gray-900">{metric}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
      <div className={`text-sm font-medium ${getStatusColor(status)}`}>
        {getStatusText(status)}
      </div>
    </div>
  );
}

// Helper functions

function getOverallHealthStatus(
  trends: string[]
): 'excellent' | 'good' | 'needs_attention' | 'critical' {
  const excellentCount = trends.filter(t => t === 'strong_growth').length;
  const goodCount = trends.filter(t => t === 'growing').length;
  const concerningCount = trends.filter(t => t === 'concerning').length;

  if (excellentCount >= 2) return 'excellent';
  if (goodCount >= 2 || excellentCount >= 1) return 'good';
  if (concerningCount >= 1) return 'critical';
  return 'needs_attention';
}

function getEngagementHealthStatus(engagement: {
  stories_per_project: number;
  stories_per_storyteller: number;
}): 'excellent' | 'good' | 'needs_attention' | 'critical' {
  const projectEngagement = engagement.stories_per_project;
  const storytellerEngagement = engagement.stories_per_storyteller;

  if (projectEngagement > 10 && storytellerEngagement > 2) return 'excellent';
  if (projectEngagement > 5 && storytellerEngagement > 1.5) return 'good';
  if (projectEngagement > 2 && storytellerEngagement > 1)
    return 'needs_attention';
  return 'critical';
}

function getSustainabilityStatus(
  data: GrowthMetricsProps['data']
): 'excellent' | 'good' | 'needs_attention' | 'critical' {
  const projectGrowth = data.project_growth.growth_rate;
  const storyGrowth = data.story_growth.growth_rate;
  const storytellerGrowth = data.storyteller_growth.growth_rate;

  // Sustainable growth: story growth should outpace or match project growth
  const growthBalance = storyGrowth / Math.max(projectGrowth, 1);

  if (growthBalance > 1.5 && storytellerGrowth > 0) return 'excellent';
  if (growthBalance > 1 && storytellerGrowth >= 0) return 'good';
  if (growthBalance > 0.5) return 'needs_attention';
  return 'critical';
}

function generateGrowthInsights(data: GrowthMetricsProps['data']): string[] {
  const insights = [];

  // Project growth insights
  if (data.project_growth.growth_rate > 20) {
    insights.push(
      'Strong organizational adoption indicates growing awareness of community storytelling value'
    );
  } else if (data.project_growth.growth_rate < 0) {
    insights.push(
      'Project creation has slowed - consider outreach to potential partner organizations'
    );
  }

  // Story engagement insights
  if (data.engagement_metrics.stories_per_project > 10) {
    insights.push(
      'High story volume per project shows strong community engagement'
    );
  } else if (data.engagement_metrics.stories_per_project < 3) {
    insights.push(
      'Low story engagement suggests need for community activation strategies'
    );
  }

  // Storyteller retention insights
  if (data.engagement_metrics.stories_per_storyteller > 2) {
    insights.push(
      'Multiple stories per storyteller indicates strong platform value for users'
    );
  } else if (data.engagement_metrics.stories_per_storyteller < 1.2) {
    insights.push(
      'Most storytellers share only once - consider improving retention and re-engagement'
    );
  }

  // Growth balance insights
  const storyToProjectRatio =
    data.story_growth.growth_rate /
    Math.max(data.project_growth.growth_rate, 1);
  if (storyToProjectRatio > 2) {
    insights.push(
      'Story growth outpacing project growth shows deepening community engagement'
    );
  } else if (storyToProjectRatio < 0.5) {
    insights.push(
      'Projects growing faster than stories - focus on community activation within existing projects'
    );
  }

  return insights.slice(0, 4); // Limit to 4 insights
}
