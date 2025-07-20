/**
 * Project Breakdown Component
 */

'use client';

import React from 'react';

interface ProjectBreakdownProps {
  data: any[];
}

export function ProjectBreakdown({ data }: ProjectBreakdownProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Project Breakdown
      </h3>
      <div className="space-y-4">
        {data.map((project, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{project.name}</h4>
            <p className="text-sm text-gray-600">{project.organization_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
