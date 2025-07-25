'use client';

import React, { useState } from 'react';
import StorytellerCollaborationHub from '@/components/community/StorytellerCollaborationHub';
import CommunityConnections from '@/components/community/CommunityConnections';
import { Button } from '@/components/ui/Button';

export default function CollaborationHubPage() {
  const [activeView, setActiveView] = useState<'hub' | 'connections' | 'analytics'>('hub');
  const [selectedStoryteller] = useState('ben-knight-demo');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sprint 3 Week 2: Community Collaboration Features
              </h1>
              <p className="text-lg text-gray-600">
                Storyteller collaboration tools, mentorship, referrals, and cross-pollination systems
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Week 2: Community Features Complete
              </div>
              <Button variant="outline">
                📊 View Technical Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-green-50 border-b border-green-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-green-900 mb-1">
                🤝 Community Collaboration Demo - Sprint 3 Week 2
              </h2>
              <p className="text-green-700 text-sm">
                Demonstrating storyteller collaboration hub, AI-powered cross-pollination connections, 
                mentorship programs, and professional referral networks with Aboriginal advisor oversight
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600">
                <div className="font-medium">Ben Knight Case Study</div>
                <div>Community Features Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={() => setActiveView('hub')}
            className={activeView === 'hub' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}
          >
            🤝 Collaboration Hub
          </Button>
          <Button
            onClick={() => setActiveView('connections')}
            className={activeView === 'connections' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}
          >
            🌐 Community Connections
          </Button>
          <Button
            onClick={() => setActiveView('analytics')}
            className={activeView === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}
          >
            📊 Collaboration Analytics
          </Button>
        </div>

        {/* Main Content */}
        {activeView === 'hub' && (
          <StorytellerCollaborationHub 
            storytellerId={selectedStoryteller}
          />
        )}

        {activeView === 'connections' && (
          <CommunityConnections 
            storytellerId={selectedStoryteller}
            userRole="all"
          />
        )}

        {activeView === 'analytics' && (
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Collaboration Analytics Dashboard</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive analytics for tracking community value generation, collaboration success metrics, 
              and cultural competency development through storyteller partnerships
            </p>
            <p className="text-sm text-gray-500">
              Coming in Sprint 3 Week 3: Platform Scaling implementation
            </p>
          </div>
        )}
      </div>

      {/* Features Overview */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Sprint 3 Week 2: Community Features Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Storyteller Collaboration Hub</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive collaboration management with peer partnerships, mentorship programs, 
                and collective project coordination including Aboriginal advisor oversight
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Cross-Pollination</h3>
              <p className="text-gray-600 text-sm">
                Intelligent connection suggestions based on complementary expertise, shared themes, 
                and cultural competency alignment with community value optimization
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Value Generation</h3>
              <p className="text-gray-600 text-sm">
                Revenue sharing models, professional referral networks, and collective project 
                management designed to benefit community members and cultural protocols
              </p>
            </div>
          </div>

          {/* Technical Implementation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Database Schema */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗄️ Community Database Schema</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>storyteller_collaborations</code> - Partnership and project management</li>
                <li>✅ <code>mentorship_programs</code> - Structured mentorship with cultural protocols</li>
                <li>✅ <code>cross_pollination_connections</code> - AI-powered storyteller matching</li>
                <li>✅ <code>collective_projects</code> - Community co-creation with Aboriginal involvement</li>
                <li>✅ <code>storyteller_referrals</code> - Professional referral network with revenue sharing</li>
                <li>✅ <code>community_messages</code> - Communication hub for collaboration</li>
              </ul>
            </div>

            {/* API Endpoints */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔌 Community API Endpoints</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>/api/community/collaborations</code> - Collaboration management</li>
                <li>✅ <code>/api/community/cross-pollination</code> - AI connection matching</li>
                <li>✅ Mentorship program management and tracking</li>
                <li>✅ Professional referral network with revenue sharing</li>
                <li>✅ Collective project participation and coordination</li>
                <li>✅ Community messaging and communication systems</li>
              </ul>
            </div>

            {/* React Components */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚛️ Community Components</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>StorytellerCollaborationHub</code> - Main collaboration interface</li>
                <li>✅ <code>CommunityConnections</code> - Mentorship and referral management</li>
                <li>✅ AI-powered cross-pollination connection suggestions</li>
                <li>✅ Revenue sharing and community value tracking</li>
                <li>✅ Cultural protocol integration in all collaboration features</li>
                <li>✅ Aboriginal advisor oversight workflow integration</li>
              </ul>
            </div>

            {/* Cultural Integration */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌏 Aboriginal Protocol Integration</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ Cultural protocol requirements in all collaboration types</li>
                <li>✅ Aboriginal advisor review for community projects</li>
                <li>✅ Cultural competency tracking in mentorship programs</li>
                <li>✅ Community value prioritization in revenue sharing models</li>
                <li>✅ Cultural sensitivity verification in cross-pollination connections</li>
                <li>✅ Aboriginal community involvement flags and requirements</li>
              </ul>
            </div>
          </div>

          {/* Community Impact Metrics */}
          <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">🌱 Community Value Generation Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">89%</div>
                <div className="text-sm text-green-700">Cultural Protocol Adherence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$12,847</div>
                <div className="text-sm text-blue-700">Revenue Shared with Community</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24</div>
                <div className="text-sm text-purple-700">Active Collaborations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">15</div>
                <div className="text-sm text-orange-700">Professional Referrals</div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Sprint 3 Roadmap - Remaining Weeks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Week 3: Platform Scaling</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Multi-tenant architecture for 100+ storytellers</li>
                  <li>• Organization dashboard and partnership management</li>
                  <li>• Performance monitoring and scaling infrastructure</li>
                  <li>• Advanced analytics for community collaboration metrics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Week 4: Mobile Foundation</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• React Native architecture and cross-platform development</li>
                  <li>• Mobile collaboration hub and community connections</li>
                  <li>• Offline-first design with cultural protocol integration</li>
                  <li>• Native mobile story reader and collaboration tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}