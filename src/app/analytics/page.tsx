'use client';

import React from 'react';
import ThemeAnalytics from '@/components/analytics/ThemeAnalytics';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Community Insights
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore patterns, themes, and wisdom from our storytelling community
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ThemeAnalytics />
        
        {/* Additional Insights */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌟</span>
            About These Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="mb-4">
                Our AI system analyzes each story transcript using advanced natural language processing 
                to identify themes, emotions, and key insights while maintaining cultural sensitivity 
                and trauma-informed approaches.
              </p>
              <h3 className="font-medium text-gray-900 mb-2">Theme Categories</h3>
              <ul className="space-y-1">
                <li>• <strong>Strength:</strong> Resilience, courage, perseverance</li>
                <li>• <strong>Social:</strong> Community, relationships, leadership</li>
                <li>• <strong>Wellbeing:</strong> Healing, mental health, recovery</li>
                <li>• <strong>Life Events:</strong> Family, work, education, migration</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Quality Assurance</h3>
              <p className="mb-4">
                Each analysis includes confidence scores and quality metrics. High-quality analyses 
                (&gt;80% confidence) indicate strong thematic matches and reliable insights.
              </p>
              <h3 className="font-medium text-gray-900 mb-2">Privacy & Ethics</h3>
              <ul className="space-y-1">
                <li>• All analyses respect storyteller consent</li>
                <li>• Trauma-informed processing methods</li>
                <li>• Cultural sensitivity protocols</li>
                <li>• Aggregated data protects individual privacy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}