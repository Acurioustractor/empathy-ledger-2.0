/**
 * Project Story Cards Component
 * 
 * Philosophy: Stories are presented with dignity and respect for storyteller agency.
 * Display adapts to project branding while maintaining accessibility.
 */

'use client';

import React, { useEffect, useState } from 'react';

interface Story {
  id: string;
  title?: string;
  transcript: string;
  storyteller: {
    full_name: string;
    community_affiliation?: string;
    preferred_pronouns?: string;
  };
  tags?: string[];
  submitted_at: string;
  privacy_level: 'public' | 'community' | 'private';
  consent_settings: {
    allowCommunitySharing: boolean;
    allowPublicSharing: boolean;
  };
  sovereignty_metadata: {
    storyteller_owns: boolean;
    consent_respected: boolean;
    cultural_protocols_honored: boolean;
    community_controlled: boolean;
  };
}

interface ProjectStoryCardsProps {
  projectId: string;
  limit?: number;
  privacy_levels?: string[];
  className?: string;
}

export function ProjectStoryCards({ 
  projectId, 
  limit = 10, 
  privacy_levels = ['public', 'community'],
  className = ''
}: ProjectStoryCardsProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    loadStories();
  }, [projectId, limit, privacy_levels]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        privacy_levels: privacy_levels.join(',')
      });

      const response = await fetch(`/api/projects/${projectId}/stories?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load stories');
      }

      const data = await response.json();
      setStories(data.stories || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-600 mb-4">Unable to load stories: {error}</p>
        <button 
          onClick={loadStories}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-brand-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📖</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Stories Yet</h3>
          <p className="text-gray-600 mb-6">
            Be the first to share your story and help build our community narrative.
          </p>
          <a 
            href={`/projects/${projectId}/submit`}
            className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Share Your Story
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} projectId={projectId} />
      ))}
    </div>
  );
}

interface StoryCardProps {
  story: Story;
  projectId: string;
}

function StoryCard({ story, projectId }: StoryCardProps) {
  const getExcerpt = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    const excerpt = text.substring(0, maxLength);
    const lastSpace = excerpt.lastIndexOf(' ');
    return excerpt.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrivacyIcon = () => {
    switch (story.privacy_level) {
      case 'public':
        return '🌍';
      case 'community':
        return '👥';
      case 'private':
        return '🔒';
      default:
        return '📄';
    }
  };

  const getPrivacyLabel = () => {
    switch (story.privacy_level) {
      case 'public':
        return 'Public Story';
      case 'community':
        return 'Community Story';
      case 'private':
        return 'Private Story';
      default:
        return 'Story';
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{getPrivacyIcon()}</span>
            <span>{getPrivacyLabel()}</span>
          </div>
          <time className="text-sm text-gray-500">
            {formatDate(story.submitted_at)}
          </time>
        </div>

        {story.title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-brand-heading">
            {story.title}
          </h3>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <blockquote className="text-gray-700 leading-relaxed mb-4 italic border-l-4 border-brand-primary pl-4">
          "{getExcerpt(story.transcript)}"
        </blockquote>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="inline-block px-2 py-1 text-xs font-medium bg-brand-primary bg-opacity-10 text-brand-primary rounded-full"
              >
                #{tag}
              </span>
            ))}
            {story.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                +{story.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Storyteller Attribution */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-primary bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-brand-primary">
                {story.storyteller.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {story.storyteller.full_name}
              </p>
              {story.storyteller.community_affiliation && (
                <p className="text-xs text-gray-500">
                  {story.storyteller.community_affiliation}
                </p>
              )}
            </div>
          </div>

          <a 
            href={`/projects/${projectId}/stories/${story.id}`}
            className="text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors"
          >
            Read More →
          </a>
        </div>
      </div>

      {/* Sovereignty Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Storyteller consent verified</span>
          </div>
          {story.sovereignty_metadata.community_controlled && (
            <div className="flex items-center space-x-1">
              <span>🛡️</span>
              <span>Community controlled</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function StoryCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header Skeleton */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
        </div>

        {/* Tags Skeleton */}
        <div className="flex space-x-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
        </div>

        {/* Attribution Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}