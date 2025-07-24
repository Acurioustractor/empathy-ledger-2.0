/**
 * Embeddable Iframe Widget Page
 *
 * Philosophy: Standalone widget interface that maintains sovereignty
 * principles in external embedding contexts.
 */

import React from 'react';
import { EmbedWidget } from '@/components/embed/embed-widget';

interface EmbedIframePageProps {
  searchParams: Promise<{
    project_id?: string;
    type?: string;
    theme?: string;
    story_id?: string;
    limit?: string;
  }>;
}

export default async function EmbedIframePage({
  searchParams,
}: EmbedIframePageProps) {
  const params = await searchParams;
  const {
    project_id,
    type = 'story_card',
    theme = 'light',
    story_id,
    limit = '3',
  } = params;

  if (!project_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Configuration Error
          </h2>
          <p className="text-gray-600">Project ID is required for embedding</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
    >
      <EmbedWidget
        projectId={project_id}
        widgetType={
          type as
            | 'story_card'
            | 'story_carousel'
            | 'story_list'
            | 'featured_story'
        }
        theme={theme as 'light' | 'dark'}
        storyId={story_id}
        limit={parseInt(limit)}
      />
    </div>
  );
}
