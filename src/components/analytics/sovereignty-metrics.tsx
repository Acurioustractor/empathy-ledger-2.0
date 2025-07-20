/**
 * Sovereignty Metrics Component
 * 
 * Philosophy: Transparency about how well the platform maintains
 * community data sovereignty and consent principles.
 */

'use client';

import React from 'react';

interface SovereigntyMetricsProps {
  data: {
    average_compliance_score: number;
    excellent_compliance: number;
    good_compliance: number;
    needs_attention: number;
    consent_adherence: {
      total_stories: number;
      stories_with_consent: number;
      adherence_rate: number;
      consent_breakdown: {
        allowAnalysis: number;
        allowCommunitySharing: number;
        allowResearch: number;
        allowValueCreation: number;
        allowPolicyUse: number;
      };
    };
    cultural_protocols: {
      stories_with_protocols: number;
      indigenous_data_sovereignty: number;
    };
    privacy_distribution: {
      private: number;
      community: number;
      public: number;
    };
  };
}

export function SovereigntyMetrics({ data }: SovereigntyMetricsProps) {
  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Sovereignty Metrics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Community data sovereignty and consent compliance
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Compliance Score */}
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">
            {getComplianceIcon(data.average_compliance_score)}
          </div>
          <div className={`text-3xl font-bold ${getComplianceColor(data.average_compliance_score)}`}>
            {data.average_compliance_score}%
          </div>
          <div className="text-sm font-medium text-gray-600">Average Compliance Score</div>
          <div className="text-xs text-gray-500 mt-1">
            Platform-wide sovereignty standards adherence
          </div>
        </div>

        {/* Compliance Distribution */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Compliance Distribution</h3>
          <div className="space-y-3">
            <ComplianceBar
              label="Excellent (90%+)"
              value={data.excellent_compliance}
              total={data.excellent_compliance + data.good_compliance + data.needs_attention}
              color="bg-green-500"
              icon="🟢"
            />
            <ComplianceBar
              label="Good (70-89%)"
              value={data.good_compliance}
              total={data.excellent_compliance + data.good_compliance + data.needs_attention}
              color="bg-yellow-500"
              icon="🟡"
            />
            <ComplianceBar
              label="Needs Attention (<70%)"
              value={data.needs_attention}
              total={data.excellent_compliance + data.good_compliance + data.needs_attention}
              color="bg-red-500"
              icon="🔴"
            />
          </div>
        </div>

        {/* Consent Adherence */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Consent Management</h3>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Stories with Explicit Consent</span>
              <span className="text-lg font-bold text-blue-900">
                {data.consent_adherence.adherence_rate}%
              </span>
            </div>
            <div className="text-xs text-blue-700">
              {data.consent_adherence.stories_with_consent} of {data.consent_adherence.total_stories} stories
            </div>
          </div>

          {/* Consent Types Breakdown */}
          <div className="space-y-2">
            <ConsentTypeBar
              label="Analysis Permission"
              value={data.consent_adherence.consent_breakdown.allowAnalysis}
              total={data.consent_adherence.total_stories}
              description="Stories allowing AI analysis"
            />
            <ConsentTypeBar
              label="Community Sharing"
              value={data.consent_adherence.consent_breakdown.allowCommunitySharing}
              total={data.consent_adherence.total_stories}
              description="Stories shared within community"
            />
            <ConsentTypeBar
              label="Research Use"
              value={data.consent_adherence.consent_breakdown.allowResearch}
              total={data.consent_adherence.total_stories}
              description="Stories available for research"
            />
            <ConsentTypeBar
              label="Value Creation"
              value={data.consent_adherence.consent_breakdown.allowValueCreation}
              total={data.consent_adherence.total_stories}
              description="Stories enabling community benefit"
            />
            <ConsentTypeBar
              label="Policy Use"
              value={data.consent_adherence.consent_breakdown.allowPolicyUse}
              total={data.consent_adherence.total_stories}
              description="Stories for advocacy/policy work"
            />
          </div>
        </div>

        {/* Cultural Protocols */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Cultural Protocols</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.cultural_protocols.stories_with_protocols}
              </div>
              <div className="text-sm font-medium text-purple-700">Stories with Cultural Protocols</div>
              <div className="text-xs text-purple-600 mt-1">Community-defined handling requirements</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.cultural_protocols.indigenous_data_sovereignty}
              </div>
              <div className="text-sm font-medium text-orange-700">Indigenous Data Sovereignty</div>
              <div className="text-xs text-orange-600 mt-1">Projects with IDS frameworks</div>
            </div>
          </div>
        </div>

        {/* Privacy Distribution */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy Preferences</h3>
          <div className="space-y-3">
            <PrivacyBar
              label="Private Stories"
              value={data.privacy_distribution.private}
              total={data.privacy_distribution.private + data.privacy_distribution.community + data.privacy_distribution.public}
              color="bg-red-500"
              icon="🔒"
              description="Storyteller access only"
            />
            <PrivacyBar
              label="Community Stories"
              value={data.privacy_distribution.community}
              total={data.privacy_distribution.private + data.privacy_distribution.community + data.privacy_distribution.public}
              color="bg-yellow-500"
              icon="👥"
              description="Community member access"
            />
            <PrivacyBar
              label="Public Stories"
              value={data.privacy_distribution.public}
              total={data.privacy_distribution.private + data.privacy_distribution.community + data.privacy_distribution.public}
              color="bg-green-500"
              icon="🌍"
              description="Public access with consent"
            />
          </div>
        </div>

        {/* Sovereignty Health Indicator */}
        <div className="border-t pt-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Sovereignty Health</h4>
                <p className="text-sm text-gray-600">Platform commitment to community control</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {data.average_compliance_score >= 90 ? 'Excellent' : 
                   data.average_compliance_score >= 70 ? 'Good' : 'Needs Work'}
                </div>
                <div className="text-xs text-gray-500">Overall Assessment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComplianceBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: string;
}

function ComplianceBar({ label, value, total, color, icon }: ComplianceBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center space-x-2">
          <span>{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm text-gray-500">{value} projects</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

interface ConsentTypeBarProps {
  label: string;
  value: number;
  total: number;
  description: string;
}

function ConsentTypeBar({ label, value, total, description }: ConsentTypeBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="h-1.5 rounded-full bg-blue-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}

interface PrivacyBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: string;
  description: string;
}

function PrivacyBar({ label, value, total, color, icon, description }: PrivacyBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center space-x-2">
          <span>{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm text-gray-500">{value} ({percentage.toFixed(1)}%)</span>
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