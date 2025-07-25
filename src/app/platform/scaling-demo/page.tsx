'use client';

import React, { useState } from 'react';
import OrganizationDashboard from '@/components/organization/OrganizationDashboard';
import PlatformRoadmap from '@/components/platform/PlatformRoadmap';
import { Button } from '@/components/ui/Button';

export default function PlatformScalingDemo() {
  const [activeView, setActiveView] = useState<'overview' | 'organization' | 'roadmap' | 'environments' | 'api_docs'>('overview');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'production' | 'development' | 'staging'>('development');
  const [selectedOrganization, setSelectedOrganization] = useState('justice-ai');

  const environments = {
    production: {
      name: 'Production',
      url: 'https://empathyledger.com',
      status: 'live',
      features: ['storyteller_profiles', 'story_reader', 'story_discovery', 'payment_integration', 'cultural_protocols'],
      description: 'Live platform with core features for storytellers and organizations'
    },
    development: {
      name: 'Development',
      url: 'http://localhost:3005',
      status: 'active',
      features: ['storyteller_profiles', 'story_reader', 'ai_analytics', 'community_collaboration', 'organization_dashboard', 'story_discovery', 'payment_integration', 'cultural_protocols', 'api_access'],
      description: 'Full feature development environment with all Sprint 3 capabilities'
    },
    staging: {
      name: 'Staging',
      url: 'https://staging.empathyledger.com',
      status: 'testing',
      features: ['storyteller_profiles', 'story_reader', 'story_discovery', 'payment_integration', 'cultural_protocols'],
      description: 'Testing environment for feature validation before production release'
    }
  };

  const featureDefinitions = {
    storyteller_profiles: {
      name: 'Storyteller Profiles',
      description: 'Enhanced profiles with three-tier privacy',
      category: 'core',
      status: 'stable'
    },
    story_reader: {
      name: 'Interactive Story Reader',
      description: 'Advanced reading with engagement tracking',
      category: 'storytelling',
      status: 'stable'
    },
    ai_analytics: {
      name: 'AI-Powered Analytics',
      description: 'Professional theme analysis and storyteller intelligence',
      category: 'analytics',
      status: 'beta'
    },
    community_collaboration: {
      name: 'Community Collaboration',
      description: 'Storyteller collaboration hub and cross-pollination',
      category: 'community',
      status: 'beta'
    },
    organization_dashboard: {
      name: 'Organization Dashboard',
      description: 'Multi-tenant organization management',
      category: 'organization',
      status: 'beta'
    },
    story_discovery: {
      name: 'Story Discovery',
      description: 'Advanced search and recommendations',
      category: 'storytelling',
      status: 'stable'
    },
    payment_integration: {
      name: 'Payment Processing',
      description: 'Stripe integration for subscriptions',
      category: 'core',
      status: 'stable'
    },
    cultural_protocols: {
      name: 'Aboriginal Protocol Integration',
      description: 'Cultural competency and advisor oversight',
      category: 'cultural',
      status: 'stable'
    },
    api_access: {
      name: 'Organization API Access',
      description: 'API endpoints for custom front-ends',
      category: 'organization',
      status: 'alpha'
    }
  };

  const organizations = {
    'justice-ai': {
      name: 'Justice AI Collective',
      type: 'nonprofit',
      subscription: 'enterprise',
      storytellers: 12,
      custom_domain: 'stories.justiceai.org'
    },
    'fnigc': {
      name: 'First Nations Information Governance Centre',
      type: 'indigenous',
      subscription: 'community_partner',
      storytellers: 8,
      custom_domain: 'stories.fnigc.ca'
    },
    'beam-collective': {
      name: 'BEAM Collective',
      type: 'community',
      subscription: 'professional',
      storytellers: 15,
      custom_domain: null
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Platform Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(environments).map(([key, env]) => (
          <div key={key} className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                env.status === 'live' ? 'bg-green-100 text-green-800' :
                env.status === 'active' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {env.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{env.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Features Enabled</span>
                <span className="font-medium">{env.features.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">URL</span>
                <span className="font-mono text-xs text-blue-600">{env.url}</span>
              </div>
            </div>
            <Button 
              onClick={() => {
                setSelectedEnvironment(key as any);
                setActiveView('environments');
              }}
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
            >
              View Details
            </Button>
          </div>
        ))}
      </div>

      {/* Organizations Overview */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Organizations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(organizations).map(([key, org]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{org.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="capitalize">{org.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscription</span>
                  <span className="capitalize">{org.subscription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storytellers</span>
                  <span>{org.storytellers}</span>
                </div>
                {org.custom_domain && (
                  <div className="text-xs text-blue-600 mt-2">
                    🌐 {org.custom_domain}
                  </div>
                )}
              </div>
              <Button 
                onClick={() => {
                  setSelectedOrganization(key);
                  setActiveView('organization');
                }}
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
              >
                Manage
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Scaling Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">35</div>
            <div className="text-sm text-gray-600">Active Storytellers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Partner Organizations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">9</div>
            <div className="text-sm text-gray-600">Platform Features</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">147</div>
            <div className="text-sm text-gray-600">API Requests (Daily)</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnvironments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Environment Management</h2>
        <div className="flex space-x-2">
          {Object.entries(environments).map(([key, env]) => (
            <Button
              key={key}
              onClick={() => setSelectedEnvironment(key as any)}
              variant={selectedEnvironment === key ? 'default' : 'outline'}
              size="sm"
            >
              {env.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {environments[selectedEnvironment].name} Environment
            </h3>
            <p className="text-gray-600">{environments[selectedEnvironment].description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            environments[selectedEnvironment].status === 'live' ? 'bg-green-100 text-green-800' :
            environments[selectedEnvironment].status === 'active' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {environments[selectedEnvironment].status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Environment Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base URL</span>
                <span className="font-mono text-blue-600">{environments[selectedEnvironment].url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Endpoint</span>
                <span className="font-mono text-blue-600">{environments[selectedEnvironment].url}/api</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Features Enabled</span>
                <span className="font-medium">{environments[selectedEnvironment].features.length}/9</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Feature Status</h4>
            <div className="space-y-2">
              {Object.entries(featureDefinitions).map(([key, feature]) => {
                const isEnabled = environments[selectedEnvironment].features.includes(key);
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className={`${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        feature.status === 'stable' ? 'bg-green-100 text-green-800' :
                        feature.status === 'beta' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {feature.status}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        isEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🔧 Feature Toggle Philosophy</h4>
        <p className="text-blue-800 text-sm">
          Features are gradually rolled out across environments. Development has all features for testing, 
          staging validates core features, and production only enables stable, well-tested capabilities. 
          Organizations can request specific features through the platform admin team.
        </p>
      </div>
    </div>
  );

  const renderAPIDocumentation = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Organization API Documentation</h2>
        <p className="text-gray-600 mb-6">
          Build custom front-ends for your organization while leveraging all platform features, 
          cultural protocols, and community connections.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Base API Endpoints</h3>
            <div className="bg-gray-50 rounded p-4 font-mono text-sm">
              <div className="mb-2"><strong>Production:</strong> https://api.empathyledger.com/v1/[org-slug]</div>
              <div className="mb-2"><strong>Development:</strong> http://localhost:3005/api/v1/[org-slug]</div>
              <div><strong>Staging:</strong> https://staging-api.empathyledger.com/v1/[org-slug]</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Endpoints</h3>
            <div className="space-y-3">
              {[
                { method: 'GET', endpoint: '/storytellers', description: 'List organization storytellers with privacy controls' },
                { method: 'GET', endpoint: '/stories', description: 'Fetch stories with three-tier access filtering' },
                { method: 'GET', endpoint: '/stories/{id}', description: 'Get specific story with engagement tracking' },
                { method: 'POST', endpoint: '/analytics/engagement', description: 'Track story engagement and reader analytics' },
                { method: 'GET', endpoint: '/community/collaborations', description: 'Access collaboration and mentorship data' },
                { method: 'GET', endpoint: '/cultural/protocols', description: 'Get cultural competency and protocol status' },
                { method: 'POST', endpoint: '/feature-requests', description: 'Request new features or configuration changes' }
              ].map((endpoint, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-sm">{endpoint.endpoint}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded p-4">
                <h4 className="font-medium text-gray-900 mb-2">Justice AI Implementation</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Custom React app embedded in their main website, filtered to show only justice-focused stories
                </p>
                <div className="text-xs text-blue-600">→ stories.justiceai.org</div>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h4 className="font-medium text-gray-900 mb-2">FNIGC Portal</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Indigenous-controlled storytelling portal with enhanced cultural protocol integration
                </p>
                <div className="text-xs text-blue-600">→ stories.fnigc.ca</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">🏛️ Cultural Protocol Integration</h4>
            <p className="text-orange-800 text-sm">
              All API endpoints include cultural protocol metadata and Aboriginal advisor oversight indicators. 
              Organizations must maintain cultural competency standards when building custom front-ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sprint 3 Week 3: Platform Scaling Infrastructure
              </h1>
              <p className="text-lg text-gray-600">
                Multi-tenant architecture, feature toggles, organization dashboards, and custom API access
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Week 3: Platform Scaling Complete
              </div>
              <Button variant="outline">
                📊 View Technical Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-purple-50 border-b border-purple-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-purple-900 mb-1">
                🏗️ Platform Scaling Demo - Sprint 3 Week 3
              </h2>
              <p className="text-purple-700 text-sm">
                Demonstrating multi-tenant organization management, feature toggle system, 
                custom API access for whitelisted front-ends, and community roadmap voting
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600">
                <div className="font-medium">Production Ready Architecture</div>
                <div>Scalable for 100+ Organizations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'overview', label: '📊 Platform Overview', desc: 'Environment status and metrics' },
            { key: 'organization', label: '🏢 Organization Dashboard', desc: 'Multi-tenant management' },
            { key: 'roadmap', label: '🗺️ Community Roadmap', desc: 'Feature voting and development' },
            { key: 'environments', label: '🔧 Environment Control', desc: 'Feature toggles and deployment' },
            { key: 'api_docs', label: '🔌 API Documentation', desc: 'Custom front-end integration' }
          ].map((view) => (
            <Button
              key={view.key}
              onClick={() => setActiveView(view.key as any)}
              className={`flex-1 flex flex-col items-center p-4 h-auto ${
                activeView === view.key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{view.label}</div>
              <div className="text-xs opacity-75 mt-1">{view.desc}</div>
            </Button>
          ))}
        </div>

        {/* Main Content */}
        {activeView === 'overview' && renderOverview()}
        {activeView === 'organization' && (
          <OrganizationDashboard 
            organizationId={selectedOrganization}
            userRole="admin"
          />
        )}
        {activeView === 'roadmap' && (
          <PlatformRoadmap 
            userRole="organization_admin"
            organizationId={selectedOrganization}
          />
        )}
        {activeView === 'environments' && renderEnvironments()}
        {activeView === 'api_docs' && renderAPIDocumentation()}
      </div>

      {/* Implementation Summary */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Sprint 3 Week 3: Platform Scaling Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗄️ Multi-Tenant Database Schema</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>feature_toggles</code> - Modular feature control and gradual rollout</li>
                <li>✅ <code>organizations</code> - Multi-tenant architecture with customization</li>
                <li>✅ <code>organization_feature_config</code> - Org-specific feature configuration</li>
                <li>✅ <code>organization_members</code> - Role-based access control</li>
                <li>✅ <code>platform_roadmap</code> - Community-driven development planning</li>
                <li>✅ <code>roadmap_votes</code> - Democratic feature prioritization</li>
                <li>✅ <code>organization_api_access</code> - Custom front-end API management</li>
                <li>✅ <code>environment_config</code> - Production vs development separation</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚛️ Platform Management Components</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>OrganizationDashboard</code> - Multi-tenant management interface</li>
                <li>✅ <code>PlatformRoadmap</code> - Community voting and feature planning</li>
                <li>✅ Feature request system with admin approval workflow</li>
                <li>✅ API access management for custom front-ends</li>
                <li>✅ Environment-specific feature toggle controls</li>
                <li>✅ Cultural protocol integration across all scaling features</li>
                <li>✅ Revenue sharing and community contribution tracking</li>
                <li>✅ Organization branding and customization capabilities</li>
              </ul>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">🚀 Platform Scaling Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Gradual Rollout Control</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Feature toggles for safe deployment</li>
                  <li>• Environment-specific configurations</li>
                  <li>• A/B testing capabilities</li>
                  <li>• Rollback mechanisms</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Organization Customization</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Custom domains and branding</li>
                  <li>• Whitelisted front-end APIs</li>
                  <li>• Feature request workflow</li>
                  <li>• Cultural protocol requirements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Community Governance</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Democratic feature voting</li>
                  <li>• Aboriginal advisor oversight</li>
                  <li>• Transparent development roadmap</li>
                  <li>• Community impact prioritization</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Sprint 3 Final Week: Mobile Foundation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">React Native Architecture</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Cross-platform mobile app development</li>
                  <li>• Offline-first design with local storage</li>
                  <li>• Native story reader with touch interface</li>
                  <li>• Mobile collaboration and community features</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Cultural Protocol Integration</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Mobile cultural competency features</li>
                  <li>• Aboriginal protocol reminders and guidance</li>
                  <li>• Community accountability on mobile</li>
                  <li>• Mobile API with cultural oversight</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}