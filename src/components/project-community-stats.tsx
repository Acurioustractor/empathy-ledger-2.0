/**
 * Project Community Stats Component
 */

'use client';

import React from 'react';

interface ProjectCommunityStatsProps {
  projectId: string;
  stats?: {
    totalStories?: number;
    activeStorytellers?: number;
    communitiesRepresented?: number;
    avgEngagement?: string;
  };
}

export function ProjectCommunityStats({
  projectId,
  stats,
}: ProjectCommunityStatsProps) {
  const defaultStats = {
    totalStories: 0,
    activeStorytellers: 0,
    communitiesRepresented: 0,
    avgEngagement: '0%',
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Community Stats
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {displayStats.totalStories}
          </div>
          <div className="text-sm text-gray-600">Total Stories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {displayStats.activeStorytellers}
          </div>
          <div className="text-sm text-gray-600">Active Storytellers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {displayStats.communitiesRepresented}
          </div>
          <div className="text-sm text-gray-600">Communities</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {displayStats.avgEngagement}
          </div>
          <div className="text-sm text-gray-600">Avg Engagement</div>
        </div>
      </div>
    </div>
  );
}
