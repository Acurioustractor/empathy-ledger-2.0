'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface StoryReaderProps {
  storyId: string;
  accessLevel: 'public' | 'paywall' | 'organizational';
  onEngagement?: (engagement: EngagementEvent) => void;
}

interface StorySection {
  id: string;
  section_order: number;
  section_type: string;
  section_title: string;
  section_content: string;
  multimedia_elements: any[];
  key_quotes: string[];
}

interface Story {
  id: string;
  title: string;
  summary: string;
  full_content: string;
  content_structure: {
    sections: StorySection[];
    word_count: number;
    reading_time_minutes: number;
  };
  featured_image_url?: string;
  key_quotes: string[];
  professional_outcomes: string[];
  themes: string[];
  storyteller: {
    full_name: string;
    current_role: string;
    current_organization: string;
  };
}

interface EngagementEvent {
  type: 'scroll' | 'highlight' | 'quote_save' | 'insight_bookmark' | 'share';
  data: any;
}

export default function StoryReader({ storyId, accessLevel, onEngagement }: StoryReaderProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [engagementSession, setEngagementSession] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    fetchStory();
    initializeEngagementTracking();
    
    return () => {
      endEngagementSession();
    };
  }, [storyId]);

  useEffect(() => {
    const handleScroll = () => {
      trackReadingProgress();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchStory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stories/${storyId}?access_level=${accessLevel}`);
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Failed to fetch story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeEngagementTracking = async () => {
    try {
      const response = await fetch('/api/stories/engagement/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: storyId,
          access_level: accessLevel,
          session_start: new Date().toISOString(),
          device_type: getDeviceType(),
          referral_source: document.referrer || 'direct'
        })
      });
      const { session_id } = await response.json();
      setEngagementSession(session_id);
    } catch (error) {
      console.error('Failed to initialize engagement tracking:', error);
    }
  };

  const trackReadingProgress = () => {
    if (!contentRef.current) return;

    const contentElement = contentRef.current;
    const windowHeight = window.innerHeight;
    const documentHeight = contentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    const progress = Math.min(100, (scrollTop + windowHeight) / documentHeight * 100);
    setReadingProgress(progress);

    // Track which section is currently visible
    const sections = contentElement.querySelectorAll('[data-section]');
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
        setCurrentSection(index);
      }
    });

    // Send engagement update every 10% progress
    if (onEngagement && Math.floor(progress) % 10 === 0) {
      onEngagement({
        type: 'scroll',
        data: { progress, currentSection }
      });
    }
  };

  const endEngagementSession = async () => {
    if (!engagementSession) return;

    try {
      await fetch('/api/stories/engagement/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: engagementSession,
          session_end: new Date().toISOString(),
          reading_progress: readingProgress,
          time_spent_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          highlights_made: highlights.length,
          quotes_saved: savedQuotes.length
        })
      });
    } catch (error) {
      console.error('Failed to end engagement session:', error);
    }
  };

  const handleQuoteSave = async (quote: string) => {
    setSavedQuotes(prev => [...prev, quote]);
    
    // Track quote save engagement
    try {
      await fetch('/api/stories/engagement/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: engagementSession,
          action_type: 'quote_save',
          action_data: { quote }
        })
      });
    } catch (error) {
      console.error('Failed to track quote save:', error);
    }

    if (onEngagement) {
      onEngagement({
        type: 'quote_save',
        data: { quote }
      });
    }
  };

  const handleHighlight = async (text: string) => {
    setHighlights(prev => [...prev, text]);
    
    // Track highlight engagement
    try {
      await fetch('/api/stories/engagement/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: engagementSession,
          action_type: 'highlight',
          action_data: { text }
        })
      });
    } catch (error) {
      console.error('Failed to track highlight:', error);
    }

    if (onEngagement) {
      onEngagement({
        type: 'highlight',
        data: { text }
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: story?.title,
        text: story?.summary,
        url: window.location.href
      });
      
      // Track share engagement
      await fetch('/api/stories/engagement/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: engagementSession,
          action_type: 'share',
          action_data: { platform: 'native' }
        })
      });
    } catch (error) {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log('Story URL copied to clipboard');
    }

    if (onEngagement) {
      onEngagement({
        type: 'share',
        data: { story_id: storyId }
      });
    }
  };

  const getDeviceType = (): string => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Story Not Found</h2>
        <p className="text-gray-600">The story you're looking for could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Story Header */}
      <header className="mb-8">
        {story.featured_image_url && (
          <img 
            src={story.featured_image_url} 
            alt={story.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        
        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
        
        <div className="flex items-center space-x-6 text-gray-600 mb-4">
          <span>{story.content_structure.reading_time_minutes} min read</span>
          <span>{story.content_structure.word_count} words</span>
          <span className="capitalize">{accessLevel} access</span>
          <span>by {story.storyteller.full_name}</span>
        </div>

        <p className="text-xl text-gray-700 leading-relaxed mb-6">{story.summary}</p>

        {/* Professional Outcomes Preview */}
        {story.professional_outcomes && story.professional_outcomes.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Professional Insights You'll Gain:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              {story.professional_outcomes.map((outcome, index) => (
                <li key={index}>✓ {outcome}</li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Story Content */}
      <article ref={contentRef} className="prose prose-lg max-w-none">
        {story.content_structure.sections.map((section, index) => (
          <section 
            key={section.id} 
            data-section={index}
            className="mb-8"
          >
            {section.section_title && (
              <h2 className="text-2xl font-bold mb-4">{section.section_title}</h2>
            )}
            
            <div 
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatContent(section.section_content) }}
            />

            {/* Key Quotes in Section */}
            {section.key_quotes && section.key_quotes.length > 0 && (
              <div className="my-6">
                {section.key_quotes.map((quote, quoteIndex) => (
                  <blockquote 
                    key={quoteIndex}
                    className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4"
                  >
                    <p>"{quote}"</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuoteSave(quote)}
                      className="mt-2"
                    >
                      💾 Save Quote
                    </Button>
                  </blockquote>
                ))}
              </div>
            )}
          </section>
        ))}
      </article>

      {/* Story Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Key Themes */}
          <div>
            <h3 className="font-semibold mb-3">Key Themes</h3>
            <div className="flex flex-wrap gap-2">
              {story.themes.map((theme, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Professional Applications */}
          <div>
            <h3 className="font-semibold mb-3">Professional Applications</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {story.professional_outcomes.slice(0, 3).map((outcome, index) => (
                <li key={index}>• {outcome}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Engagement Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button 
            variant="outline"
            onClick={() => handleHighlight(story.title)}
          >
            💡 Save Insights
          </Button>
          <Button 
            variant="outline"
            onClick={handleShare}
          >
            📤 Share Story
          </Button>
          <Button variant="outline">
            💬 Connect with {story.storyteller.full_name}
          </Button>
          <Button variant="outline">
            📅 Book Consultation
          </Button>
        </div>

        {/* Reading Statistics */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Reading Progress: {Math.round(readingProgress)}%</span>
            <span>Time Spent: {Math.floor((Date.now() - sessionStartTime.current) / 60000)} minutes</span>
            <span>Highlights: {highlights.length}</span>
            <span>Quotes Saved: {savedQuotes.length}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatContent(content: string): string {
  // Basic content formatting - in production would use a rich text processor
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.*)$/, '<p>$1</p>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}