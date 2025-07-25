'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface FeatureToggle {
  feature_key: string;
  feature_name: string;
  feature_description: string;
  feature_category: string;
  enabled: boolean;
  organization_override_allowed: boolean;
  requires_subscription: boolean;
  configuration: Record<string, any>;
  customization_settings: Record<string, any>;
}

interface Organization {
  id: string;
  organization_name: string;
  organization_slug: string;
  organization_type: string;
  subscription_tier: 'basic' | 'professional' | 'enterprise' | 'community_partner';
  subscription_status: string;
  max_storytellers: number;
  max_stories_per_storyteller: number;
  custom_domain_enabled: boolean;
  custom_domain?: string;
  api_access_enabled: boolean;
  whitelisted_domains: string[];
  brand_color_primary: string;
  brand_color_secondary: string;
  indigenous_organization: boolean;
  cultural_protocols_required: boolean;
  revenue_sharing_percentage: number;
  community_contribution_percentage: number;
}

interface APIAccess {
  id: string;
  api_key_name: string;
  api_permissions: Record<string, boolean>;
  allowed_origins: string[];
  rate_limit_requests_per_minute: number;
  total_requests: number;
  last_used?: string;
  status: 'active' | 'suspended' | 'revoked';
}

interface OrganizationDashboardProps {
  organizationId: string;
  userRole: 'admin' | 'storyteller' | 'viewer' | 'cultural_advisor';
}

export default function OrganizationDashboard({ organizationId, userRole }: OrganizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'api' | 'branding' | 'members' | 'analytics'>('overview');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [apiAccess, setAPIAccess] = useState<APIAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);

  useEffect(() => {
    fetchOrganizationData();
  }, [organizationId]);

  const fetchOrganizationData = async () => {
    try {
      // Mock data - in production these would be API calls
      const mockOrganization: Organization = {
        id: organizationId,
        organization_name: 'Justice AI Collective',
        organization_slug: 'justice-ai',
        organization_type: 'nonprofit',
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        max_storytellers: 50,
        max_stories_per_storyteller: 100,
        custom_domain_enabled: true,
        custom_domain: 'stories.justiceai.org',
        api_access_enabled: true,
        whitelisted_domains: ['justiceai.org', 'justice-ai.netlify.app'],
        brand_color_primary: '#1E3A8A',
        brand_color_secondary: '#059669',
        indigenous_organization: false,
        cultural_protocols_required: true,
        revenue_sharing_percentage: 75,
        community_contribution_percentage: 15
      };

      const mockFeatures: FeatureToggle[] = [
        {
          feature_key: 'storyteller_profiles',
          feature_name: 'Storyteller Profiles',
          feature_description: 'Enhanced storyteller profiles with three-tier privacy',
          feature_category: 'core',
          enabled: true,
          organization_override_allowed: false,
          requires_subscription: false,
          configuration: {},
          customization_settings: { show_contact_info: true, show_expertise_areas: true }
        },
        {
          feature_key: 'ai_analytics',
          feature_name: 'AI-Powered Analytics',
          feature_description: 'Professional theme analysis and storyteller intelligence',
          feature_category: 'analytics',
          enabled: true,
          organization_override_allowed: true,
          requires_subscription: true,
          configuration: { cultural_sensitivity_required: true, aboriginal_advisor_review: true },
          customization_settings: { show_cultural_competency: true, highlight_community_impact: true }
        },
        {
          feature_key: 'community_collaboration',
          feature_name: 'Community Collaboration',
          feature_description: 'Storyteller collaboration hub and cross-pollination',
          feature_category: 'community',
          enabled: true,
          organization_override_allowed: true,
          requires_subscription: true,
          configuration: { mentorship_enabled: true, referral_network_enabled: true },
          customization_settings: { focus_on_justice_work: true, prioritize_marginalized_voices: true }
        },
        {
          feature_key: 'organization_dashboard',
          feature_name: 'Organization Dashboard',
          feature_description: 'Multi-tenant organization management and customization',
          feature_category: 'organization',
          enabled: true,
          organization_override_allowed: false,
          requires_subscription: true,
          configuration: {},
          customization_settings: {}
        },
        {
          feature_key: 'api_access',
          feature_name: 'Custom API Access',
          feature_description: 'API endpoints for custom front-end development',
          feature_category: 'organization',
          enabled: true,
          organization_override_allowed: true,
          requires_subscription: true,
          configuration: { rate_limit_per_minute: 120, rate_limit_per_hour: 2000 },
          customization_settings: {}
        },
        {
          feature_key: 'mobile_app',
          feature_name: 'Mobile Application',
          feature_description: 'Native iOS/Android app with offline capabilities',
          feature_category: 'mobile',
          enabled: false,
          organization_override_allowed: true,
          requires_subscription: true,
          configuration: {},
          customization_settings: {}
        }
      ];

      const mockAPIAccess: APIAccess[] = [
        {
          id: 'api-1',
          api_key_name: 'Justice AI Main Frontend',
          api_permissions: {
            read_storytellers: true,
            read_stories: true,
            write_stories: false,
            manage_members: false,
            access_analytics: true
          },
          allowed_origins: ['https://justiceai.org', 'https://justice-ai.netlify.app'],
          rate_limit_requests_per_minute: 120,
          total_requests: 48392,
          last_used: '2024-01-25T14:23:00Z',
          status: 'active'
        },
        {
          id: 'api-2',
          api_key_name: 'Justice AI Analytics Dashboard',
          api_permissions: {
            read_storytellers: true,
            read_stories: true,
            write_stories: false,
            manage_members: false,
            access_analytics: true
          },
          allowed_origins: ['https://analytics.justiceai.org'],
          rate_limit_requests_per_minute: 60,
          total_requests: 12847,
          last_used: '2024-01-25T09:15:00Z',
          status: 'active'
        }
      ];

      setOrganization(mockOrganization);
      setFeatures(mockFeatures);
      setAPIAccess(mockAPIAccess);
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureRequest = async (featureKey: string, action: 'enable' | 'disable', reason: string) => {
    try {
      // In production, this would create a feature request for admin review
      console.log(`Feature request: ${action} ${featureKey} - Reason: ${reason}`);
      // Show success message that request has been submitted
    } catch (error) {
      console.error('Failed to submit feature request:', error);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Stats */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subscription Tier</span>
              <span className="font-medium capitalize">{organization?.subscription_tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Storytellers</span>
              <span className="font-medium">12 / {organization?.max_storytellers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Stories</span>
              <span className="font-medium">87</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API Requests (Month)</span>
              <span className="font-medium">61,239</span>
            </div>
          </div>
        </div>

        {/* Cultural Integration */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Integration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cultural Protocols Required</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                organization?.cultural_protocols_required 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {organization?.cultural_protocols_required ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Indigenous Organization</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                organization?.indigenous_organization 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {organization?.indigenous_organization ? '🏛️ Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cultural Competency Score</span>
              <span className="font-medium">89%</span>
            </div>
          </div>
        </div>

        {/* Revenue Sharing */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Model</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">To Storytellers</span>
              <span className="font-medium text-green-600">{organization?.revenue_sharing_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To Community</span>
              <span className="font-medium text-blue-600">{organization?.community_contribution_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium text-gray-600">
                {100 - (organization?.revenue_sharing_percentage || 0) - (organization?.community_contribution_percentage || 0)}%
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Generated</span>
                <span className="font-medium">$12,847</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700">
            👥 Invite Storytellers
          </Button>
          <Button variant="outline">
            🔑 Generate API Key
          </Button>
          <Button variant="outline">
            🎨 Customize Branding
          </Button>
          <Button variant="outline">
            📊 View Analytics
          </Button>
        </div>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Platform Feature Configuration</h3>
        <div className="text-sm text-gray-600">
          Configure which features are available to your organization
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {features.map((feature) => (
          <div key={feature.feature_key} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900">{feature.feature_name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.feature_category === 'core' ? 'bg-blue-100 text-blue-800' :
                    feature.feature_category === 'analytics' ? 'bg-purple-100 text-purple-800' :
                    feature.feature_category === 'community' ? 'bg-green-100 text-green-800' :
                    feature.feature_category === 'organization' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {feature.feature_category}
                  </span>
                  {feature.requires_subscription && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      💎 Premium
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{feature.feature_description}</p>
                
                {Object.keys(feature.configuration).length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700 mb-1">Configuration:</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(feature.configuration).map(([key, value]) => (
                        <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {key}: {value.toString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex flex-col items-end space-y-2">
                {/* Feature Status */}
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full ${
                    feature.enabled ? 'bg-green-100' : 'bg-gray-100'
                  } flex items-center justify-center`}>
                    <span className={`text-sm ${
                      feature.enabled ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {feature.enabled ? '✓' : '○'}
                    </span>
                  </div>
                  <span className={`text-xs mt-1 block font-medium ${
                    feature.enabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {feature.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Request Buttons */}
                {feature.organization_override_allowed && (
                  <div className="flex space-x-1">
                    {!feature.enabled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          const reason = prompt(`Why do you need the ${feature.feature_name} feature?`);
                          if (reason) handleFeatureRequest(feature.feature_key, 'enable', reason);
                        }}
                      >
                        📤 Request
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => {
                          const reason = prompt(`Why do you want to disable ${feature.feature_name}?`);
                          if (reason) handleFeatureRequest(feature.feature_key, 'disable', reason);
                        }}
                      >
                        💬 Discuss
                      </Button>
                    )}
                  </div>
                )}
                
                {!feature.organization_override_allowed && (
                  <span className="text-xs text-gray-400">Platform Managed</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAPITab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">API Access Management</h3>
        <Button 
          onClick={() => setShowAPIKeyModal(true)}
          className="bg-green-600 hover:bg-green-700"
          disabled={userRole !== 'admin'}
        >
          + Generate New API Key
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">Custom Front-End Development</h4>
        <p className="text-blue-800 text-sm mb-3">
          Build your own front-end using our API while leveraging all platform features. 
          Perfect for embedding storytelling into your existing website or creating custom experiences.
        </p>
        <div className="text-xs text-blue-700">
          <strong>Base API URL:</strong> https://api.empathyledger.com/v1/{organization?.organization_slug}
        </div>
      </div>

      <div className="space-y-4">
        {apiAccess.map((api) => (
          <div key={api.id} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{api.api_key_name}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    api.status === 'active' ? 'bg-green-100 text-green-800' :
                    api.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {api.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {api.total_requests.toLocaleString()} total requests
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Rate Limit</div>
                <div className="font-medium">{api.rate_limit_requests_per_minute}/min</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Permissions</h5>
                <div className="space-y-1">
                  {Object.entries(api.api_permissions).map(([permission, enabled]) => (
                    <div key={permission} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{permission.replace('_', ' ')}</span>
                      <span className={enabled ? 'text-green-600' : 'text-gray-400'}>
                        {enabled ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Allowed Origins</h5>
                <div className="space-y-1">
                  {api.allowed_origins.map((origin, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {origin}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {api.last_used && (
              <div className="text-sm text-gray-500">
                Last used: {new Date(api.last_used).toLocaleString()}
              </div>
            )}

            <div className="flex space-x-2 mt-4">
              <Button variant="outline" size="sm">
                📝 Edit Permissions
              </Button>
              <Button variant="outline" size="sm">
                📊 View Usage
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                🗑️ Revoke
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* API Documentation Link */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Need Help Getting Started?</h4>
        <p className="text-gray-600 text-sm mb-4">
          Check out our comprehensive API documentation and integration examples
        </p>
        <Button variant="outline">
          📚 View API Documentation
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Not Found</h3>
        <p className="text-gray-600">Unable to load organization data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="rounded-lg p-6 text-white"
        style={{ backgroundColor: organization.brand_color_primary }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{organization.organization_name}</h1>
            <p className="opacity-90">
              Organization Dashboard • {organization.organization_type} • {organization.subscription_tier}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Custom Domain</div>
            <div className="font-medium">
              {organization.custom_domain || `${organization.organization_slug}.empathyledger.com`}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '📊 Overview', adminOnly: false },
            { key: 'features', label: '🔧 Features', adminOnly: false },
            { key: 'api', label: '🔑 API Access', adminOnly: true },
            { key: 'branding', label: '🎨 Branding', adminOnly: true },
            { key: 'members', label: '👥 Members', adminOnly: false },
            { key: 'analytics', label: '📈 Analytics', adminOnly: false }
          ]
            .filter(tab => !tab.adminOnly || userRole === 'admin')
            .map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'features' && renderFeaturesTab()}
      {activeTab === 'api' && renderAPITab()}
      {activeTab === 'branding' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brand Customization</h3>
          <p className="text-gray-600">Custom branding, colors, logos, and domain configuration</p>
        </div>
      )}
      {activeTab === 'members' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Member Management</h3>
          <p className="text-gray-600">Invite and manage organization members and roles</p>
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Organization Analytics</h3>
          <p className="text-gray-600">Detailed analytics for storytellers, stories, and community engagement</p>
        </div>
      )}
    </div>
  );
}