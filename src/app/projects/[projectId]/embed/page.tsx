/**
 * Project Embed Management Page
 * 
 * Philosophy: Organizations control how their stories are shared
 * beyond the platform while maintaining sovereignty principles.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { BrandedLayout } from '@/components/branded-layout';
import { EmbedCodeGenerator } from '@/components/embed/embed-code-generator';
import { EmbedPreview } from '@/components/embed/embed-preview';
import { EmbedSettings } from '@/components/embed/embed-settings';

interface ProjectEmbedPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectEmbedPage({ params }: ProjectEmbedPageProps) {
  const { projectId } = params;
  const [embedConfig, setEmbedConfig] = useState({
    widgetType: 'story_card',
    theme: 'light',
    limit: 3,
    storyId: '',
    customDomain: false,
    allowedDomains: [] as string[]
  });

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BrandedLayout projectId={projectId}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </BrandedLayout>
    );
  }

  return (
    <BrandedLayout projectId={projectId}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 brand-primary font-brand-heading">
            Story Embedding
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Share your community stories on external websites while maintaining full sovereignty 
            and consent controls. Only stories with public sharing consent can be embedded.
          </p>
        </div>

        {/* Sovereignty Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🛡️ Sovereignty & Consent Protection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Consent Required:</strong> Only stories with explicit public sharing consent are embeddable
            </div>
            <div>
              <strong>Storyteller Control:</strong> Rights and ownership remain with individual storytellers
            </div>
            <div>
              <strong>Community Governance:</strong> Organizations control which domains can embed their stories
            </div>
            <div>
              <strong>Brand Preservation:</strong> Widgets maintain your community branding and attribution
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-8">
            {/* Embed Settings */}
            <EmbedSettings
              config={embedConfig}
              onChange={setEmbedConfig}
              projectId={projectId}
            />

            {/* Code Generator */}
            <EmbedCodeGenerator
              projectId={projectId}
              config={embedConfig}
              project={project}
            />
          </div>

          {/* Preview Panel */}
          <div className="space-y-8">
            <EmbedPreview
              projectId={projectId}
              config={embedConfig}
            />

            {/* Usage Statistics */}
            <EmbedUsageStats projectId={projectId} />
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-12">
          <EmbedDocumentation />
        </div>
      </div>
    </BrandedLayout>
  );
}

interface EmbedUsageStatsProps {
  projectId: string;
}

function EmbedUsageStats({ projectId }: EmbedUsageStatsProps) {
  const [stats, setStats] = useState({
    totalEmbeds: 0,
    totalViews: 0,
    topDomains: [] as string[],
    embedEnabledStories: 0
  });

  useEffect(() => {
    // In a real implementation, this would fetch actual usage statistics
    setStats({
      totalEmbeds: 12,
      totalViews: 1847,
      topDomains: ['community.org', 'newsletter.com', 'blog.example.org'],
      embedEnabledStories: 8
    });
  }, [projectId]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Embedding Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalEmbeds}</div>
          <div className="text-sm text-blue-700">Active Embeds</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalViews}</div>
          <div className="text-sm text-green-700">Total Views</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Stories Available for Embedding</h4>
          <div className="text-sm text-gray-600">
            {stats.embedEnabledStories} stories have public sharing consent enabled
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Top Embedding Domains</h4>
          <div className="space-y-1">
            {stats.topDomains.map((domain, index) => (
              <div key={domain} className="text-sm text-gray-600 flex items-center">
                <span className="w-4 text-gray-400">{index + 1}.</span>
                <span>{domain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedDocumentation() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Embedding Documentation</h3>
      
      <div className="space-y-6 text-sm text-gray-700">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Widget Types</h4>
          <ul className="space-y-2">
            <li><strong>Story Cards:</strong> Grid layout displaying multiple stories with excerpts</li>
            <li><strong>Story Carousel:</strong> Rotating display of featured stories</li>
            <li><strong>Story List:</strong> Compact list format for sidebar placement</li>
            <li><strong>Featured Story:</strong> Single story highlight with full content</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Embedding Options</h4>
          <ul className="space-y-2">
            <li><strong>HTML:</strong> Direct HTML code for copy-paste embedding</li>
            <li><strong>Iframe:</strong> Secure iframe with automatic updates</li>
            <li><strong>JSON API:</strong> Raw data for custom implementations</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Sovereignty Compliance</h4>
          <ul className="space-y-2">
            <li>• Only stories with explicit public sharing consent are embeddable</li>
            <li>• Storyteller attribution is always maintained</li>
            <li>• Community branding and sovereignty notices are preserved</li>
            <li>• Organizations can restrict embedding to specific domains</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Technical Notes</h4>
          <ul className="space-y-2">
            <li>• Widgets are responsive and mobile-friendly</li>
            <li>• CORS headers allow cross-origin embedding</li>
            <li>• Widgets automatically update when new stories are added</li>
            <li>• All embedded content respects community cultural protocols</li>
          </ul>
        </div>
      </div>
    </div>
  );
}