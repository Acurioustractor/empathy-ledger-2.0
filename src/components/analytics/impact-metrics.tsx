/**
 * Impact Metrics Component
 *
 * Philosophy: Measuring real-world value creation and benefit
 * distribution back to storytelling communities.
 */

'use client';

import React from 'react';

interface ImpactMetricsProps {
  data: {
    financial_impact: {
      total_value_created: number;
      community_value_share: number;
      storyteller_value_share: number;
      value_sharing_rate: number;
    };
    value_distribution: Record<string, number>;
    policy_influence: {
      policy_citations: number;
      advocacy_uses: number;
    };
    grants_and_funding: {
      grants_received: number;
      total_grant_amount: number;
    };
    media_and_outreach: {
      media_features: number;
      public_presentations: number;
    };
    actionable_insights: {
      total_insights: number;
      policy_insights: number;
      community_insights: number;
    };
  };
}

export function ImpactMetrics({ data }: ImpactMetricsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getValueSharingColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getValueSharingIcon = (rate: number) => {
    if (rate >= 80) return '🟢';
    if (rate >= 60) return '🟡';
    return '🔴';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Community Impact
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Real-world value creation and benefit distribution
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Financial Impact Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.financial_impact.total_value_created)}
            </div>
            <div className="text-sm font-medium text-blue-700">
              Total Value Created
            </div>
            <div className="text-xs text-blue-600 mt-1">
              From community stories
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">
                {getValueSharingIcon(data.financial_impact.value_sharing_rate)}
              </span>
              <span
                className={`text-2xl font-bold ${getValueSharingColor(data.financial_impact.value_sharing_rate)}`}
              >
                {data.financial_impact.value_sharing_rate}%
              </span>
            </div>
            <div className="text-sm font-medium text-green-700">
              Value Shared Back
            </div>
            <div className="text-xs text-green-600 mt-1">
              To communities & storytellers
            </div>
          </div>
        </div>

        {/* Value Distribution Breakdown */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Value Distribution
          </h3>
          <div className="space-y-3">
            <ValueBar
              label="Community Share"
              value={data.financial_impact.community_value_share}
              total={data.financial_impact.total_value_created}
              color="bg-green-500"
              description="Direct benefit to storytelling communities"
            />
            <ValueBar
              label="Storyteller Share"
              value={data.financial_impact.storyteller_value_share}
              total={data.financial_impact.total_value_created}
              color="bg-blue-500"
              description="Direct compensation to individual storytellers"
            />
            <ValueBar
              label="Platform Operations"
              value={
                data.financial_impact.total_value_created -
                data.financial_impact.community_value_share -
                data.financial_impact.storyteller_value_share
              }
              total={data.financial_impact.total_value_created}
              color="bg-gray-400"
              description="Platform sustainability and development"
            />
          </div>
        </div>

        {/* Impact Categories */}
        <div className="grid grid-cols-2 gap-4">
          <ImpactCard
            title="Policy Influence"
            metrics={[
              {
                label: 'Policy Citations',
                value: data.policy_influence.policy_citations,
                icon: '📋',
              },
              {
                label: 'Advocacy Uses',
                value: data.policy_influence.advocacy_uses,
                icon: '📢',
              },
            ]}
            description="Stories influencing policy and advocacy"
            color="bg-purple-50"
          />

          <ImpactCard
            title="Grants & Funding"
            metrics={[
              {
                label: 'Grants Received',
                value: data.grants_and_funding.grants_received,
                icon: '💰',
              },
              {
                label: 'Total Amount',
                value: formatCurrency(
                  data.grants_and_funding.total_grant_amount
                ),
                icon: '💵',
              },
            ]}
            description="Funding secured through story impact"
            color="bg-green-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ImpactCard
            title="Media & Outreach"
            metrics={[
              {
                label: 'Media Features',
                value: data.media_and_outreach.media_features,
                icon: '📺',
              },
              {
                label: 'Presentations',
                value: data.media_and_outreach.public_presentations,
                icon: '🎤',
              },
            ]}
            description="Public visibility and awareness"
            color="bg-orange-50"
          />

          <ImpactCard
            title="Actionable Insights"
            metrics={[
              {
                label: 'Total Insights',
                value: data.actionable_insights.total_insights,
                icon: '💡',
              },
              {
                label: 'Policy Insights',
                value: data.actionable_insights.policy_insights,
                icon: '🏛️',
              },
            ]}
            description="Insights leading to concrete action"
            color="bg-indigo-50"
          />
        </div>

        {/* Value Creation by Type */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Value Creation by Type
          </h3>
          <div className="space-y-2">
            {Object.entries(data.value_distribution).map(([type, amount]) => (
              <ValueTypeBar
                key={type}
                label={formatValueType(type)}
                value={amount}
                total={data.financial_impact.total_value_created}
                description={getValueTypeDescription(type)}
              />
            ))}
          </div>
        </div>

        {/* Impact Health Indicator */}
        <div className="border-t pt-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Impact Health</h4>
                <p className="text-sm text-gray-600">
                  Value creation and distribution effectiveness
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${getValueSharingColor(data.financial_impact.value_sharing_rate)}`}
                >
                  {data.financial_impact.value_sharing_rate >= 80
                    ? 'Excellent'
                    : data.financial_impact.value_sharing_rate >= 60
                      ? 'Good'
                      : 'Needs Work'}
                </div>
                <div className="text-xs text-gray-500">
                  Value Sharing Assessment
                </div>
              </div>
            </div>

            {data.financial_impact.value_sharing_rate < 80 && (
              <div className="mt-3 text-sm text-gray-600">
                <strong>Recommendation:</strong> Increase direct benefit flow to
                storytelling communities
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ValueBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  description: string;
}

function ValueBar({ label, value, total, color, description }: ValueBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {formatCurrency(value)} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}

interface ImpactCardProps {
  title: string;
  metrics: Array<{
    label: string;
    value: number | string;
    icon: string;
  }>;
  description: string;
  color: string;
}

function ImpactCard({ title, metrics, description, color }: ImpactCardProps) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{metric.icon}</span>
              <span className="text-sm font-medium text-gray-700">
                {metric.label}
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {metric.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3">{description}</p>
    </div>
  );
}

interface ValueTypeBarProps {
  label: string;
  value: number;
  total: number;
  description: string;
}

function ValueTypeBar({ label, value, total, description }: ValueTypeBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{formatCurrency(value)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-indigo-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}

function formatValueType(type: string): string {
  const typeMap: Record<string, string> = {
    grant_funded: 'Grant Funding',
    media_license: 'Media Licensing',
    policy_influence: 'Policy Influence',
    advocacy_use: 'Advocacy Use',
    research_citation: 'Research Citation',
    public_presentation: 'Public Speaking',
    consulting: 'Community Consulting',
    training: 'Training Programs',
  };

  return (
    typeMap[type] ||
    type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function getValueTypeDescription(type: string): string {
  const descriptionMap: Record<string, string> = {
    grant_funded: 'Grants received based on story insights',
    media_license: 'Media licensing of community stories',
    policy_influence: 'Stories cited in policy documents',
    advocacy_use: 'Stories used in advocacy campaigns',
    research_citation: 'Academic research citing stories',
    public_presentation: 'Speaking fees from story sharing',
    consulting: 'Community consulting based on insights',
    training: 'Training programs developed from learnings',
  };

  return descriptionMap[type] || 'Value created through community stories';
}
