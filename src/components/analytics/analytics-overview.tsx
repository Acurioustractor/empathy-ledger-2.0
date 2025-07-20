/**
 * Analytics Overview Component
 *
 * Philosophy: High-level metrics that celebrate community growth and empowerment
 * while maintaining transparency about platform impact.
 */

'use client';

import React from 'react';

interface AnalyticsOverviewProps {
  data: {
    total_projects: number;
    active_projects: number;
    total_stories_period: number;
    total_stories_platform: number;
    active_storytellers_period: number;
    total_storytellers_platform: number;
    insights_generated: number;
    subscription_tiers: {
      community: number;
      organization: number;
      enterprise: number;
    };
    geographic_distribution: {
      regions: Record<string, number>;
      countries: Record<string, number>;
    };
    project_categories: Record<string, number>;
  };
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Platform Overview
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Community-driven storytelling ecosystem impact
        </p>
      </div>

      <div className="p-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Projects"
            value={data.active_projects}
            subtitle={`of ${data.total_projects} total`}
            icon="🏛️"
            description="Organizations building storytelling communities"
          />

          <MetricCard
            title="Stories Shared"
            value={data.total_stories_period}
            subtitle={`${formatNumber(data.total_stories_platform)} all-time`}
            icon="📖"
            description="Community narratives this period"
          />

          <MetricCard
            title="Active Storytellers"
            value={data.active_storytellers_period}
            subtitle={`${formatNumber(data.total_storytellers_platform)} all-time`}
            icon="👥"
            description="Community members sharing experiences"
          />

          <MetricCard
            title="Insights Generated"
            value={data.insights_generated}
            subtitle="This period"
            icon="✨"
            description="Community wisdom patterns identified"
          />
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Tiers */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Project Types
            </h3>
            <div className="space-y-3">
              <DistributionBar
                label="Community"
                value={data.subscription_tiers.community}
                total={data.total_projects}
                color="bg-green-500"
                description="Grassroots community initiatives"
              />
              <DistributionBar
                label="Organization"
                value={data.subscription_tiers.organization}
                total={data.total_projects}
                color="bg-blue-500"
                description="Established organizations"
              />
              <DistributionBar
                label="Enterprise"
                value={data.subscription_tiers.enterprise}
                total={data.total_projects}
                color="bg-purple-500"
                description="Large-scale partnerships"
              />
            </div>
          </div>

          {/* Geographic Distribution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Geographic Reach
            </h3>
            <div className="space-y-3">
              {Object.entries(data.geographic_distribution.regions).map(
                ([region, count]) => (
                  <DistributionBar
                    key={region}
                    label={region}
                    value={count}
                    total={Object.values(
                      data.geographic_distribution.regions
                    ).reduce((a, b) => a + b, 0)}
                    color="bg-indigo-500"
                    description={`${count} active communities`}
                  />
                )
              )}
            </div>
          </div>

          {/* Project Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Focus Areas
            </h3>
            <div className="space-y-3">
              {Object.entries(data.project_categories)
                .slice(0, 4)
                .map(([category, count]) => (
                  <DistributionBar
                    key={category}
                    label={formatCategoryName(category)}
                    value={count}
                    total={Object.values(data.project_categories).reduce(
                      (a, b) => a + b,
                      0
                    )}
                    color="bg-orange-500"
                    description={`${count} projects`}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Community Impact Highlights */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Community Impact This Period
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-700">
                <strong>{data.active_storytellers_period}</strong> voices heard
                and honored
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-700">
                <strong>{data.insights_generated}</strong> patterns of wisdom
                identified
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-700">
                <strong>{data.active_projects}</strong> communities empowered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  description: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  description,
}: MetricCardProps) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
      <div className="text-xs text-gray-400 mt-1">{description}</div>
    </div>
  );
}

interface DistributionBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  description: string;
}

function DistributionBar({
  label,
  value,
  total,
  color,
  description,
}: DistributionBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
