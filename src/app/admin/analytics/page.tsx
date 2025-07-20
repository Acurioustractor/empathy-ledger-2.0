/**
 * Master Analytics Dashboard
 *
 * Philosophy: Platform-wide insights that serve community empowerment
 * while respecting sovereignty and consent at every level.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { SovereigntyMetrics } from '@/components/analytics/sovereignty-metrics';
import { ImpactMetrics } from '@/components/analytics/impact-metrics';
import { GrowthMetrics } from '@/components/analytics/growth-metrics';
import { ProjectBreakdown } from '@/components/analytics/project-breakdown';
import { TrendAnalysis } from '@/components/analytics/trend-analysis';

interface AnalyticsData {
  platform_overview: any;
  sovereignty_metrics: any;
  impact_metrics: any;
  growth_metrics: any;
  cross_project_analytics: any;
  project_breakdown?: any;
  trends?: any;
  analysis_period: {
    period: string;
    description: string;
    last_updated: string;
  };
  sovereignty_principles: {
    consent_based_aggregation: string;
    project_sovereignty_maintained: string;
    community_empowerment_focused: string;
    transparency_commitment: string;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showTrends, setShowTrends] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, showBreakdown, showTrends]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        breakdown: showBreakdown.toString(),
        trends: showTrends.toString(),
      });

      const response = await fetch(`/api/admin/analytics?${params}`);

      if (!response.ok) {
        const error_data = await response.json();
        throw new Error(error_data.error || 'Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Analytics Load Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Empathy Ledger Analytics
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Platform-wide insights that serve community empowerment while
                  respecting sovereignty
                </p>
              </div>

              {/* Period Selector */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>

                <button
                  onClick={loadAnalytics}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Analysis Period Info */}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
              <span>Period: {analytics.analysis_period.description}</span>
              <span>
                Last Updated:{' '}
                {new Date(
                  analytics.analysis_period.last_updated
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Sovereignty Principles Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Sovereignty & Ethics Framework
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>Consent-Based:</strong>{' '}
                {analytics.sovereignty_principles.consent_based_aggregation}
              </div>
              <div>
                <strong>Project Sovereignty:</strong>{' '}
                {
                  analytics.sovereignty_principles
                    .project_sovereignty_maintained
                }
              </div>
              <div>
                <strong>Community Empowerment:</strong>{' '}
                {analytics.sovereignty_principles.community_empowerment_focused}
              </div>
              <div>
                <strong>Transparency:</strong>{' '}
                {analytics.sovereignty_principles.transparency_commitment}
              </div>
            </div>
          </div>

          {/* Platform Overview */}
          <AnalyticsOverview data={analytics.platform_overview} />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SovereigntyMetrics data={analytics.sovereignty_metrics} />
            <ImpactMetrics data={analytics.impact_metrics} />
            <GrowthMetrics data={analytics.growth_metrics} />
          </div>

          {/* Advanced Analytics Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Advanced Analytics
            </h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showBreakdown}
                  onChange={e => setShowBreakdown(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Project Breakdown</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showTrends}
                  onChange={e => setShowTrends(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Trend Analysis</span>
              </label>
            </div>
          </div>

          {/* Project Breakdown */}
          {showBreakdown && analytics.project_breakdown && (
            <ProjectBreakdown data={analytics.project_breakdown} />
          )}

          {/* Trend Analysis */}
          {showTrends && analytics.trends && (
            <TrendAnalysis data={analytics.trends} />
          )}

          {/* Cross-Project Analytics */}
          {analytics.cross_project_analytics && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cross-Project Insights
              </h3>
              <div className="text-sm text-gray-600 mb-4">
                Aggregated insights from projects that have opted into
                cross-project collaboration
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.cross_project_analytics.map(
                  (item: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {item.project?.name}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>Stories: {item.stories_submitted || 0}</div>
                        <div>Storytellers: {item.active_storytellers || 0}</div>
                        <div>
                          Engagement: {item.community_engagement_score || 0}%
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Action Items */}
          <ActionItems analytics={analytics} />
        </div>
      </div>
    </div>
  );
}

interface ActionItemsProps {
  analytics: AnalyticsData;
}

function ActionItems({ analytics }: ActionItemsProps) {
  const generateActionItems = () => {
    const items = [];

    // Sovereignty compliance checks
    if (analytics.sovereignty_metrics.needs_attention > 0) {
      items.push({
        type: 'warning',
        title: 'Sovereignty Compliance',
        message: `${analytics.sovereignty_metrics.needs_attention} projects need attention for sovereignty compliance`,
        action: 'Review compliance scores and provide support',
      });
    }

    // Growth opportunities
    if (analytics.growth_metrics.project_growth.growth_rate < 0) {
      items.push({
        type: 'info',
        title: 'Project Growth',
        message: 'Project creation has slowed this period',
        action: 'Consider outreach to potential partner organizations',
      });
    }

    // Impact optimization
    if (analytics.impact_metrics.financial_impact.value_sharing_rate < 80) {
      items.push({
        type: 'info',
        title: 'Value Sharing',
        message: 'Value sharing to communities could be improved',
        action: 'Review value distribution mechanisms',
      });
    }

    // Engagement
    if (
      analytics.platform_overview.active_storytellers_period <
      analytics.platform_overview.total_storytellers_platform * 0.1
    ) {
      items.push({
        type: 'info',
        title: 'Community Engagement',
        message:
          'Active storyteller engagement is low relative to total community',
        action: 'Develop community engagement strategies',
      });
    }

    return items;
  };

  const actionItems = generateActionItems();

  if (actionItems.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Platform Health Excellent
            </h3>
            <p className="text-green-800">
              All key metrics are performing well. Continue monitoring for
              optimal community empowerment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recommended Actions
      </h3>
      <div className="space-y-4">
        {actionItems.map((item, index) => (
          <div
            key={index}
            className={`border-l-4 pl-4 py-3 ${
              item.type === 'warning'
                ? 'border-yellow-400 bg-yellow-50'
                : item.type === 'error'
                  ? 'border-red-400 bg-red-50'
                  : 'border-blue-400 bg-blue-50'
            }`}
          >
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{item.message}</p>
            <p className="text-sm font-medium text-gray-800 mt-2">
              Action: {item.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
