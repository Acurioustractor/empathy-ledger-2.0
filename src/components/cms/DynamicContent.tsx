'use client';

import React, { useState, useEffect } from 'react';
import {
  getPageContent,
  getStoriesByCategory,
  getSiteMetrics,
  type ContentBlock,
  type Story,
  type SiteMetric,
} from '@/lib/supabase-cms';
import MediaDisplay from '@/components/ui/MediaDisplay';
import {
  placeholderImages,
  placeholderBlurDataURLs,
} from '@/lib/supabase-media';

interface DynamicContentProps {
  pageSlug: string;
  fallbackContent?: React.ReactNode;
}

interface LiveMetricProps {
  metricType:
    | 'story_count'
    | 'community_count'
    | 'policy_changes'
    | 'value_created';
  fallbackValue?: string | number;
  format?: 'number' | 'currency' | 'percentage';
}

// Component for displaying live metrics from Supabase
export function LiveMetric({
  metricType,
  fallbackValue = 0,
  format = 'number',
}: LiveMetricProps) {
  const [value, setValue] = useState<string | number>(fallbackValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetric() {
      try {
        const metrics = await getSiteMetrics();
        const metric = metrics.find(m => m.metric_type === metricType);

        if (metric) {
          setValue(metric.metric_value);
        } else {
          // Fallback values based on type
          const fallbacks = {
            story_count: 1847,
            community_count: 89,
            policy_changes: 67,
            value_created: 2300000,
          };
          setValue(fallbacks[metricType]);
        }
      } catch (error) {
        console.error('Error loading metric:', error);
        setValue(fallbackValue);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetric();
  }, [metricType, fallbackValue]);

  const formatValue = (val: string | number): string => {
    const numVal = Number(val);

    switch (format) {
      case 'currency':
        return `$${(numVal / 1000000).toFixed(1)}M`;
      case 'percentage':
        return `${val}%`;
      default:
        return numVal.toLocaleString();
    }
  };

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <span className="font-extralight text-gray-900">{formatValue(value)}</span>
  );
}

// Component for displaying live story collections
interface LiveStoryCollectionProps {
  category: string;
  limit?: number;
  displayStyle?: 'cards' | 'list' | 'quotes';
}

export function LiveStoryCollection({
  category,
  limit = 3,
  displayStyle = 'cards',
}: LiveStoryCollectionProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStories() {
      try {
        const storyData = await getStoriesByCategory(category, limit);
        setStories(storyData);
      } catch (error) {
        console.error('Error loading stories:', error);
        // Fallback to mock data
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadStories();
  }, [category, limit]);

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-light">
          No stories available in this category yet.
        </p>
      </div>
    );
  }

  if (displayStyle === 'quotes') {
    return (
      <div className="space-y-8">
        {stories.map(story => (
          <blockquote
            key={story.id}
            className="border-l-4 border-gray-200 pl-6"
          >
            <p className="text-lg text-gray-700 font-light italic mb-3">
              "{story.content.substring(0, 200)}..."
            </p>
            <footer className="text-sm text-gray-500 font-light">
              — {story.title}, {'story'}
            </footer>
          </blockquote>
        ))}
      </div>
    );
  }

  if (displayStyle === 'list') {
    return (
      <div className="space-y-4">
        {stories.map(story => (
          <div
            key={story.id}
            className="border-b border-gray-100 pb-4 last:border-b-0"
          >
            <h3 className="text-lg font-normal text-gray-900 mb-2">
              {story.title}
            </h3>
            <p className="text-gray-600 font-light text-sm mb-2">
              {story.content.substring(0, 150)}...
            </p>
            <div className="flex gap-2">
              {story.themes.slice(0, 2).map(theme => (
                <span
                  key={theme}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: cards style
  return (
    <div className="grid gap-6">
      {stories.map(story => (
        <div
          key={story.id}
          className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-gray-500 font-light uppercase tracking-wide">
              {'story'}
            </span>
            {story.sentiment_score && (
              <div
                className={`w-2 h-2 rounded-full ${
                  story.sentiment_score > 0.7
                    ? 'bg-green-500'
                    : story.sentiment_score > 0.4
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              ></div>
            )}
          </div>
          <h3 className="text-lg font-normal text-gray-900 mb-3">
            {story.title}
          </h3>
          <p className="text-gray-600 font-light mb-4 leading-relaxed">
            {story.content.substring(0, 200)}...
          </p>
          <div className="flex flex-wrap gap-2">
            {story.themes.slice(0, 3).map(theme => (
              <span
                key={theme}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main dynamic content component
export default function DynamicContent({
  pageSlug,
  fallbackContent,
}: DynamicContentProps) {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const blocks = await getPageContent(pageSlug);
        setContentBlocks(blocks);
      } catch (error) {
        console.error('Error loading page content:', error);
        setContentBlocks([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [pageSlug]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (contentBlocks.length === 0) {
    return <>{fallbackContent}</>;
  }

  return (
    <div className="space-y-16">
      {contentBlocks.map(block => (
        <DynamicContentBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

// Component for rendering individual content blocks
function DynamicContentBlock({ block }: { block: ContentBlock }) {
  const { content_type, content_data } = block;

  switch (content_type) {
    case 'text':
      return (
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-extralight text-gray-900 mb-6">
            {content_data.title}
          </h2>
          <div className="text-gray-600 font-light leading-relaxed">
            {content_data.content}
          </div>
        </div>
      );

    case 'media':
      return (
        <div className="text-center">
          <MediaDisplay
            src={content_data.url || placeholderImages.community}
            alt={content_data.alt || 'Content image'}
            aspectRatio={content_data.aspectRatio || 'video'}
            rounded="3xl"
            caption={content_data.caption}
            blurDataURL={placeholderBlurDataURLs.community}
          />
          {content_data.description && (
            <p className="text-gray-600 font-light mt-4 max-w-2xl mx-auto">
              {content_data.description}
            </p>
          )}
        </div>
      );

    case 'story_collection':
      return (
        <div>
          <h2 className="text-3xl font-extralight text-gray-900 mb-8 text-center">
            {content_data.title || 'Stories'}
          </h2>
          <LiveStoryCollection
            category={content_data.category}
            limit={content_data.limit || 3}
            displayStyle={content_data.style || 'cards'}
          />
        </div>
      );

    case 'metric':
      return (
        <div className="text-center bg-white border border-gray-100 rounded-3xl p-8">
          <div className="text-5xl font-extralight text-gray-900 mb-3">
            <LiveMetric
              metricType={content_data.metricType}
              format={content_data.format}
              fallbackValue={content_data.fallbackValue}
            />
          </div>
          <div className="text-base text-gray-500 font-light">
            {content_data.description}
          </div>
        </div>
      );

    case 'insight':
      return (
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8">
          <h3 className="text-xl font-normal text-gray-900 mb-4">
            {content_data.title}
          </h3>
          <p className="text-gray-600 font-light mb-6 leading-relaxed">
            {content_data.description}
          </p>
          {content_data.findings && (
            <ul className="space-y-2">
              {content_data.findings.map((finding: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 font-light">
                    {finding}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    default:
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <p className="text-yellow-800 font-light">
            Unknown content type: {content_type}
          </p>
        </div>
      );
  }
}
