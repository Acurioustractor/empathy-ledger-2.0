/**
 * Embeddable Widget Component
 * 
 * Philosophy: Stories can be shared beyond the platform while maintaining
 * full storyteller consent and sovereignty principles.
 */

'use client';

import React, { useEffect, useState } from 'react';

interface Story {
  id: string;
  title?: string;
  transcript: string;
  tags?: string[];
  submitted_at: string;
  storyteller: {
    full_name: string;
    community_affiliation?: string;
  };
  consent_settings: {
    allowPublicSharing: boolean;
  };
}

interface Project {
  name: string;
  organization_name: string;
  branding_config?: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
  };
}

interface EmbedWidgetProps {
  projectId: string;
  widgetType?: 'story_card' | 'story_carousel' | 'story_list' | 'featured_story';
  theme?: 'light' | 'dark';
  storyId?: string;
  limit?: number;
}

interface WidgetData {
  stories: Story[];
  project: Project;
  loading: boolean;
  error?: string;
}

export function EmbedWidget({
  projectId,
  widgetType = 'story_card',
  theme = 'light',
  storyId,
  limit = 3
}: EmbedWidgetProps) {
  const [data, setData] = useState<WidgetData>({
    stories: [],
    project: { name: '', organization_name: '' },
    loading: true
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadWidgetData();
  }, [projectId, storyId, limit]);

  const loadWidgetData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));

      const params = new URLSearchParams({
        project_id: projectId,
        format: 'json',
        limit: limit.toString()
      });

      if (storyId) {
        params.append('story_id', storyId);
      }

      const response = await fetch(`/api/embed/stories?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load stories');
      }

      const widgetData = await response.json();
      
      setData({
        stories: widgetData.stories || [],
        project: widgetData.project,
        loading: false
      });

    } catch (error: any) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const getThemeStyles = () => {
    const primary_color = data.project.branding_config?.primary_color || '#B85C38';
    const secondary_color = data.project.branding_config?.secondary_color || '#7A9B76';
    const font_family = data.project.branding_config?.font_family || 'Inter';

    return {
      colors: {
        primary: primary_color,
        secondary: secondary_color,
        background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        text: theme === 'dark' ? '#ffffff' : '#1a1a1a',
        cardBg: theme === 'dark' ? '#2d2d2d' : '#ffffff',
        border: theme === 'dark' ? '#404040' : '#e5e5e5'
      },
      font: font_family
    };
  };

  const styles = getThemeStyles();

  if (data.loading) {
    return <WidgetSkeleton theme={theme} />;
  }

  if (data.error) {
    return (
      <div 
        className="p-4 text-center"
        style={{ 
          background: styles.colors.background, 
          color: styles.colors.text,
          fontFamily: styles.font
        }}
      >
        <div className="text-red-500 mb-2">Widget Error</div>
        <p className="text-sm opacity-75">{data.error}</p>
      </div>
    );
  }

  if (data.stories.length === 0) {
    return (
      <div 
        className="p-8 text-center"
        style={{ 
          background: styles.colors.background, 
          color: styles.colors.text,
          fontFamily: styles.font
        }}
      >
        <div className="text-2xl mb-2">📖</div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: styles.colors.primary }}>
          No Stories Available
        </h3>
        <p className="text-sm opacity-75">
          No public stories are currently available for embedding from this project.
        </p>
      </div>
    );
  }

  const renderWidget = () => {
    switch (widgetType) {
      case 'story_carousel':
        return <StoryCarousel stories={data.stories} styles={styles} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} />;
      case 'story_list':
        return <StoryList stories={data.stories} styles={styles} />;
      case 'featured_story':
        return <FeaturedStory story={data.stories[0]} styles={styles} />;
      default:
        return <StoryCards stories={data.stories} styles={styles} />;
    }
  };

  return (
    <div 
      className="empathy-widget p-4 rounded-lg"
      style={{ 
        background: styles.colors.background, 
        color: styles.colors.text,
        fontFamily: styles.font,
        maxWidth: '100%'
      }}
    >
      {/* Header */}
      <div 
        className="flex justify-between items-center mb-4 pb-2"
        style={{ borderBottom: `1px solid ${styles.colors.border}` }}
      >
        <h2 className="text-lg font-semibold" style={{ color: styles.colors.primary }}>
          {data.project.name} Stories
        </h2>
        <span className="text-xs opacity-60">
          Powered by Empathy Ledger
        </span>
      </div>

      {/* Widget Content */}
      {renderWidget()}

      {/* Sovereignty Footer */}
      <div 
        className="text-center mt-4 pt-2 text-xs opacity-60"
        style={{ borderTop: `1px solid ${styles.colors.border}` }}
      >
        Stories shared with consent • Rights remain with storytellers
      </div>
    </div>
  );
}

interface StoryCardsProps {
  stories: Story[];
  styles: any;
}

function StoryCards({ stories, styles }: StoryCardsProps) {
  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <div 
          key={story.id}
          className="rounded-lg p-4 shadow-sm"
          style={{ 
            background: styles.colors.cardBg,
            border: `1px solid ${styles.colors.border}`
          }}
        >
          {story.title && (
            <h3 className="text-lg font-medium mb-2" style={{ color: styles.colors.primary }}>
              {story.title}
            </h3>
          )}
          
          <blockquote 
            className="mb-3 pl-4 italic opacity-90"
            style={{ borderLeft: `3px solid ${styles.colors.primary}` }}
          >
            "{truncateText(story.transcript, 150)}"
          </blockquote>
          
          <div className="flex justify-between items-center text-sm opacity-75">
            <span>— {story.storyteller.full_name}</span>
            <span>{formatDate(story.submitted_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StoryCarouselProps {
  stories: Story[];
  styles: any;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
}

function StoryCarousel({ stories, styles, currentSlide, setCurrentSlide }: StoryCarouselProps) {
  const story = stories[currentSlide];

  useEffect(() => {
    if (stories.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % stories.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [stories.length, setCurrentSlide]);

  return (
    <div>
      <div 
        className="rounded-lg p-6 text-center min-h-[200px] flex flex-col justify-center"
        style={{ 
          background: styles.colors.cardBg,
          border: `1px solid ${styles.colors.border}`
        }}
      >
        {story.title && (
          <h3 className="text-xl font-medium mb-4" style={{ color: styles.colors.primary }}>
            {story.title}
          </h3>
        )}
        
        <blockquote className="text-lg italic leading-relaxed mb-4">
          "{truncateText(story.transcript, 200)}"
        </blockquote>
        
        <div className="font-medium" style={{ color: styles.colors.primary }}>
          — {story.storyteller.full_name}
        </div>
      </div>

      {stories.length > 1 && (
        <div className="flex justify-center items-center mt-4 gap-3">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + stories.length) % stories.length)}
            className="px-3 py-1 rounded text-white text-sm"
            style={{ background: styles.colors.primary }}
          >
            Previous
          </button>
          
          <span className="text-sm opacity-75">
            {currentSlide + 1} of {stories.length}
          </span>
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % stories.length)}
            className="px-3 py-1 rounded text-white text-sm"
            style={{ background: styles.colors.primary }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

interface StoryListProps {
  stories: Story[];
  styles: any;
}

function StoryList({ stories, styles }: StoryListProps) {
  return (
    <div className="space-y-0">
      {stories.map((story, index) => (
        <div 
          key={story.id}
          className={`py-3 ${index < stories.length - 1 ? 'border-b' : ''}`}
          style={{ borderColor: styles.colors.border }}
        >
          <div className="mb-2">
            {story.title && (
              <div className="font-medium mb-1" style={{ color: styles.colors.primary }}>
                {story.title}
              </div>
            )}
            <div className="text-sm opacity-80">
              "{truncateText(story.transcript, 100)}"
            </div>
          </div>
          
          <div className="flex justify-between text-xs opacity-70">
            <span>{story.storyteller.full_name}</span>
            <span>{formatDate(story.submitted_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface FeaturedStoryProps {
  story: Story;
  styles: any;
}

function FeaturedStory({ story, styles }: FeaturedStoryProps) {
  return (
    <div className="text-center">
      <div className="mb-4">
        <span 
          className="text-sm font-medium uppercase tracking-wide"
          style={{ color: styles.colors.primary }}
        >
          Featured Story
        </span>
      </div>
      
      {story.title && (
        <h2 className="text-2xl font-bold mb-6" style={{ color: styles.colors.primary }}>
          {story.title}
        </h2>
      )}
      
      <blockquote 
        className="text-lg italic leading-relaxed mb-6 p-4 rounded-lg"
        style={{ 
          background: styles.colors.cardBg,
          border: `1px solid ${styles.colors.border}`
        }}
      >
        "{story.transcript}"
      </blockquote>
      
      <div className="mb-2 font-medium" style={{ color: styles.colors.primary }}>
        — {story.storyteller.full_name}
      </div>
      
      {story.storyteller.community_affiliation && (
        <div className="text-sm opacity-70 mb-4">
          {story.storyteller.community_affiliation}
        </div>
      )}
      
      <div className="text-xs opacity-60">
        Shared {formatDate(story.submitted_at)}
      </div>
    </div>
  );
}

function WidgetSkeleton({ theme }: { theme: string }) {
  const bgColor = theme === 'dark' ? '#2d2d2d' : '#f3f4f6';
  const shimmerColor = theme === 'dark' ? '#404040' : '#e5e7eb';

  return (
    <div className="p-4 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div 
          className="h-6 rounded w-1/3"
          style={{ background: shimmerColor }}
        ></div>
        <div 
          className="h-4 rounded w-24"
          style={{ background: shimmerColor }}
        ></div>
      </div>
      
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="p-4 rounded-lg"
            style={{ background: bgColor }}
          >
            <div 
              className="h-5 rounded w-2/3 mb-3"
              style={{ background: shimmerColor }}
            ></div>
            <div className="space-y-2">
              <div 
                className="h-4 rounded"
                style={{ background: shimmerColor }}
              ></div>
              <div 
                className="h-4 rounded w-5/6"
                style={{ background: shimmerColor }}
              ></div>
            </div>
            <div className="flex justify-between mt-3">
              <div 
                className="h-3 rounded w-24"
                style={{ background: shimmerColor }}
              ></div>
              <div 
                className="h-3 rounded w-20"
                style={{ background: shimmerColor }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Utility functions
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}