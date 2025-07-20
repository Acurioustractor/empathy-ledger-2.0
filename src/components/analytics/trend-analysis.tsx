/**
 * Trend Analysis Component
 */

'use client';

import React from 'react';

interface TrendAnalysisProps {
  data: any[];
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
      <div className="space-y-4">
        {data.map((trend, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{trend.title}</h4>
            <p className="text-sm text-gray-600">{trend.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              Trend: {trend.direction || 'stable'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}