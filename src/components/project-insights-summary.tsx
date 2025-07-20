/**
 * Project Insights Summary Component
 */

'use client';

import React from 'react';

interface ProjectInsightsSummaryProps {
  projectId: string;
  insights?: any[];
}

export function ProjectInsightsSummary({ projectId, insights = [] }: ProjectInsightsSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Insights Summary</h3>
      <div className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{insight.title || `Insight ${index + 1}`}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {insight.description || 'Community insight generated from story analysis'}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Impact: {insight.impact || 'Medium'} | 
                Confidence: {insight.confidence || '85%'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No insights available yet</p>
            <p className="text-sm mt-1">Insights will appear as stories are analyzed</p>
          </div>
        )}
      </div>
    </div>
  );
}