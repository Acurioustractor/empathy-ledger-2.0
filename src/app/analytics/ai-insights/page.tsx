'use client';

import React, { useState } from 'react';
import AIInsightsDashboard from '@/components/analytics/AIInsightsDashboard';
import { Button } from '@/components/ui/Button';

export default function AIInsightsPage() {
  const [selectedStoryteller, setSelectedStoryteller] = useState('ben-knight-demo');

  // Mock data for the demo - in production this would come from API
  const mockStories = [
    {
      id: 'muswellbrook-to-global',
      title: 'From Muswellbrook to Global Platform: A Journey in Community-Centered Innovation',
      story_type: 'primary',
      view_count: 2847,
      engagement_score: 0.73
    },
    {
      id: 'supporting-story-1',
      title: 'Youth Work with Aboriginal Communities: Building Authentic Relationships',
      story_type: 'supporting',
      view_count: 1245,
      engagement_score: 0.68
    },
    {
      id: 'supporting-story-2',
      title: 'AIME Partnership: Scaling Community-Centered Education',
      story_type: 'supporting',
      view_count: 987,
      engagement_score: 0.71
    },
    {
      id: 'insight-1',
      title: 'Community Engagement Strategy: Building Authentic Relationships',
      story_type: 'insight',
      view_count: 654,
      engagement_score: 0.79
    },
    {
      id: 'insight-2',
      title: 'Aboriginal Protocol Integration in Technology Development',
      story_type: 'insight',
      view_count: 543,
      engagement_score: 0.82
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sprint 3: AI-Powered Professional Intelligence
              </h1>
              <p className="text-lg text-gray-600">
                Advanced analytics with Aboriginal advisor cultural oversight
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Week 1: AI Analytics Complete
              </div>
              <Button variant="outline">
                📊 View Technical Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border-b border-blue-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-blue-900 mb-1">
                🧠 AI-Powered Analytics Demo - Sprint 3 Week 1
              </h2>
              <p className="text-blue-700 text-sm">
                Demonstrating advanced professional theme analysis, storyteller intelligence, 
                and Aboriginal advisor cultural oversight integration
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">
                <div className="font-medium">Ben Knight Case Study</div>
                <div>AI Analysis Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Theme Analysis</h3>
              <p className="text-gray-600 text-sm">
                AI-powered extraction of professional themes, skills, and collaboration indicators 
                from storytelling content with cultural sensitivity scoring
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Aboriginal Advisor Oversight</h3>
              <p className="text-gray-600 text-sm">
                Cultural review and validation by Aboriginal Advisory Council ensuring 
                appropriate representation and protocol adherence
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Storyteller Intelligence</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive professional intelligence dashboard with collaboration matching, 
                cultural competency tracking, and growth trajectory analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <AIInsightsDashboard 
          storytellerId={selectedStoryteller}
          stories={mockStories}
        />
      </div>

      {/* Technical Implementation Overview */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sprint 3 Week 1: Technical Implementation</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Database Schema */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗄️ Enhanced Database Schema</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>ai_theme_analysis</code> - Professional theme extraction with confidence scoring</li>
                <li>✅ <code>ai_professional_insights</code> - Methodology and approach insights from stories</li>
                <li>✅ <code>storyteller_ai_intelligence</code> - Comprehensive professional intelligence</li>
                <li>✅ <code>aboriginal_advisory_reviews</code> - Cultural oversight and validation</li>
                <li>✅ <code>ai_story_recommendations</code> - Culturally sensitive recommendation engine</li>
                <li>✅ <code>ai_enhanced_analytics</code> - Advanced metrics with cultural integration</li>
              </ul>
            </div>

            {/* API Endpoints */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔌 AI Analytics API Endpoints</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>/api/analytics/analyze-themes</code> - Comprehensive theme analysis</li>
                <li>✅ <code>/api/analytics/theme-analysis/[storyId]</code> - Story-specific analysis</li>
                <li>✅ <code>/api/analytics/storyteller-intelligence/[id]</code> - Professional intelligence</li>
                <li>✅ Aboriginal advisor integration workflow</li>
                <li>✅ Cultural sensitivity validation pipeline</li>
                <li>✅ Professional insight generation and scoring</li>
              </ul>
            </div>

            {/* React Components */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚛️ AI Analytics Components</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ <code>ProfessionalThemeAnalyzer</code> - Interactive theme analysis interface</li>
                <li>✅ <code>AIInsightsDashboard</code> - Comprehensive intelligence dashboard</li>
                <li>✅ Aboriginal advisor feedback integration</li>
                <li>✅ Cultural competency scoring visualization</li>
                <li>✅ Professional collaboration matching interface</li>
                <li>✅ Real-time analysis confidence indicators</li>
              </ul>
            </div>

            {/* Cultural Integration */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌏 Cultural Protocol Integration</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✅ Aboriginal Advisory Council oversight workflow</li>
                <li>✅ Cultural appropriateness scoring system</li>
                <li>✅ Protocol alignment validation</li>
                <li>✅ Community value assessment metrics</li>
                <li>✅ Cultural sensitivity indicators tracking</li>
                <li>✅ Indigenous wisdom integration in AI analysis</li>
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Sprint 3 Roadmap - Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Week 2: Community Features</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Storyteller collaboration hub</li>
                  <li>• Cross-pollination system</li>
                  <li>• Mentorship and referral networks</li>
                  <li>• Collective project management</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Week 3: Platform Scaling</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Multi-tenant architecture</li>
                  <li>• Organization dashboards</li>
                  <li>• 100+ storyteller support</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Week 4: Mobile Foundation</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• React Native architecture</li>
                  <li>• Mobile story reader</li>
                  <li>• Offline-first design</li>
                  <li>• Cultural protocol integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}