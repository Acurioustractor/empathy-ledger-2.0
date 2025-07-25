# Sprint 2: Story Integration & Content Management System
## 3-Week Implementation: Advanced Storytelling Features

*Building on Sprint 1's enhanced profile foundation to create comprehensive story integration, multimedia support, and content management capabilities*

---

## 🎯 **Sprint 2 Overview**

### **Goal**
Transform static story previews into dynamic, interactive storytelling experiences with full content integration, multimedia support, and advanced content management for storytellers.

### **Success Criteria**
- Ben's complete story portfolio integrated and accessible
- Interactive story reading experience with engagement tracking
- Multimedia content support (video, audio, images)
- Content management dashboard for storytellers
- Story discovery and recommendation system
- Analytics and engagement insights for storytellers

### **Foundation Built On**
Sprint 1's enhanced profile system provides the three-tier privacy framework, payment integration, and user management needed for advanced story features.

---

## **Week 1: Story Content Integration & Display**

### **Day 1-2: Enhanced Story Schema & Database**

#### **Story Content Schema Expansion**
```sql
-- Enhanced story table for full content management
ALTER TABLE stories ADD COLUMN IF NOT EXISTS
  -- Content Structure
  story_type TEXT CHECK (story_type IN ('primary', 'supporting', 'insight', 'quote_collection', 'case_study')),
  content_structure JSONB DEFAULT '{
    "sections": [],
    "word_count": 0,
    "reading_time_minutes": 0,
    "multimedia_elements": []
  }'::jsonb,
  
  -- Rich Content
  full_content TEXT, -- Complete story content
  content_preview TEXT, -- First 300 words for previews
  key_quotes TEXT[], -- Extracted quotes for highlighting
  
  -- Multimedia Support
  featured_image_url TEXT,
  audio_url TEXT,
  video_url TEXT,
  gallery_images TEXT[],
  
  -- Engagement & Analytics
  view_count INTEGER DEFAULT 0,
  read_completion_rate DECIMAL(5,2) DEFAULT 0.0,
  engagement_score DECIMAL(5,2) DEFAULT 0.0,
  
  -- Content Management
  content_status TEXT DEFAULT 'draft' CHECK (content_status IN ('draft', 'review', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  social_share_image TEXT,
  
  -- Professional Context
  professional_outcomes TEXT[], -- What outcomes this story demonstrates
  collaboration_opportunities TEXT[], -- What this story suggests for partnerships
  methodology_insights TEXT[]; -- Key professional insights from this story

-- Story sections for structured content
CREATE TABLE IF NOT EXISTS story_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Section Structure
  section_order INTEGER NOT NULL,
  section_type TEXT CHECK (section_type IN ('introduction', 'narrative', 'insight', 'outcome', 'methodology', 'reflection')),
  section_title TEXT,
  section_content TEXT NOT NULL,
  
  -- Rich Content Elements
  multimedia_elements JSONB DEFAULT '[]'::jsonb,
  key_quotes TEXT[],
  professional_insights TEXT[],
  
  -- Engagement Tracking
  engagement_hotspots JSONB DEFAULT '[]'::jsonb, -- Where readers spend time
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story engagement tracking
CREATE TABLE IF NOT EXISTS story_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  reader_id UUID REFERENCES profiles(id), -- NULL for anonymous readers
  
  -- Reading Session
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  reading_progress DECIMAL(5,2) DEFAULT 0.0, -- Percentage read
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Engagement Actions
  highlights_made INTEGER DEFAULT 0,
  quotes_saved INTEGER DEFAULT 0,
  insights_bookmarked INTEGER DEFAULT 0,
  social_shares INTEGER DEFAULT 0,
  
  -- Reader Context
  access_level TEXT CHECK (access_level IN ('public', 'paywall', 'organizational')),
  referral_source TEXT,
  device_type TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_content_status ON stories(content_status);
CREATE INDEX IF NOT EXISTS idx_stories_story_type ON stories(story_type);
CREATE INDEX IF NOT EXISTS idx_story_sections_story_order ON story_sections(story_id, section_order);
CREATE INDEX IF NOT EXISTS idx_story_engagement_story ON story_engagement(story_id);
CREATE INDEX IF NOT EXISTS idx_story_engagement_reader ON story_engagement(reader_id);
```

### **Day 3-4: Story Display Components**

#### **Interactive Story Reader**
```typescript
// /components/story/StoryReader.tsx
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
      const response = await fetch(`/api/stories/${storyId}?access_level=${accessLevel}`);
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Failed to fetch story:', error);
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
          session_start: new Date().toISOString()
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

    // Send engagement update
    if (onEngagement) {
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

  const handleQuoteSave = (quote: string) => {
    setSavedQuotes(prev => [...prev, quote]);
    if (onEngagement) {
      onEngagement({
        type: 'quote_save',
        data: { quote }
      });
    }
  };

  const handleHighlight = (text: string) => {
    setHighlights(prev => [...prev, text]);
    if (onEngagement) {
      onEngagement({
        type: 'highlight',
        data: { text }
      });
    }
  };

  if (!story) {
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
        </div>

        <p className="text-xl text-gray-700 leading-relaxed">{story.summary}</p>

        {/* Professional Outcomes Preview */}
        {story.professional_outcomes && story.professional_outcomes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
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
                      Save Quote
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

          {/* Professional Insights */}
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
        <div className="mt-8 flex space-x-4">
          <Button 
            variant="outline"
            onClick={() => handleHighlight(story.title)}
          >
            💡 Save Insights
          </Button>
          <Button 
            variant="outline"
            onClick={() => onEngagement?.({ type: 'share', data: { story_id: storyId } })}
          >
            📤 Share Story
          </Button>
          <Button variant="outline">
            💬 Discuss with Author
          </Button>
        </div>
      </footer>
    </div>
  );
}

function formatContent(content: string): string {
  // Basic content formatting - in production would use a rich text processor
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/^\s*/, '<p>')
    .replace(/\s*$/, '</p>');
}
```

### **Day 5-7: Story Management Dashboard**

#### **Storyteller Content Management**
```typescript
// /components/storyteller/StoryManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface StoryManagementProps {
  storytellerId: string;
}

export default function StoryManagement({ storytellerId }: StoryManagementProps) {
  const [stories, setStories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Story Management</h1>
        <Button>+ Create New Story</Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="text-2xl font-bold">2,847</p>
          <p className="text-sm text-green-600">+12% this week</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Reading Completion</h3>
          <p className="text-2xl font-bold">73%</p>
          <p className="text-sm text-green-600">+5% this week</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Professional Inquiries</h3>
          <p className="text-2xl font-bold">18</p>
          <p className="text-sm text-blue-600">3 this week</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Revenue Generated</h3>
          <p className="text-2xl font-bold">$1,250</p>
          <p className="text-sm text-green-600">+$180 this week</p>
        </div>
      </div>

      {/* Story List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Your Stories</h2>
        </div>
        <div className="divide-y">
          {[
            {
              title: 'From Muswellbrook to Global Platform',
              type: 'primary',
              status: 'published',
              views: 1247,
              completion_rate: 78,
              revenue: 850
            },
            {
              title: 'The Origin of A Curious Tractor',
              type: 'supporting',
              status: 'published',
              views: 623,
              completion_rate: 82,
              revenue: 320
            },
            {
              title: 'Building Empathy Ledger: Vision to Platform',
              type: 'supporting',
              status: 'published',
              views: 445,
              completion_rate: 71,
              revenue: 180
            }
          ].map((story, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{story.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      story.type === 'primary' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {story.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      story.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {story.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">{story.views}</div>
                      <div className="text-gray-500">views</div>
                    </div>
                    <div>
                      <div className="font-medium">{story.completion_rate}%</div>
                      <div className="text-gray-500">completion</div>
                    </div>
                    <div>
                      <div className="font-medium">${story.revenue}</div>
                      <div className="text-gray-500">revenue</div>
                    </div>
                  </div>
                </div>
                <div className="ml-6">
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## **Week 2: Multimedia Integration & Enhanced UX**

### **Day 1-3: Video & Audio Integration**

#### **Multimedia Story Components**
```typescript
// /components/story/MultimediaStory.tsx
'use client';

import React, { useState } from 'react';

interface MultimediaStoryProps {
  story: {
    id: string;
    title: string;
    video_url?: string;
    audio_url?: string;
    gallery_images?: string[];
    sections: Array<{
      content: string;
      multimedia_elements: any[];
    }>;
  };
}

export default function MultimediaStory({ story }: MultimediaStoryProps) {
  const [activeMedia, setActiveMedia] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Video Story Introduction */}
      {story.video_url && (
        <div className="mb-8">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video 
              controls 
              className="w-full h-full"
              poster="/video-poster.jpg"
            >
              <source src={story.video_url} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Watch Ben tell his story in his own words
          </p>
        </div>
      )}

      {/* Audio Narration Option */}
      {story.audio_url && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
              🎧
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Listen to this story</h3>
              <p className="text-sm text-gray-600">Audio narration available</p>
            </div>
            <audio controls className="max-w-xs">
              <source src={story.audio_url} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {story.gallery_images && story.gallery_images.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Visual Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {story.gallery_images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Story image ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => setActiveMedia(image)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Text with Embedded Media */}
      <div className="prose prose-lg max-w-none">
        {story.sections.map((section, index) => (
          <div key={index} className="mb-8">
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
            
            {/* Embedded multimedia elements */}
            {section.multimedia_elements.map((element, elemIndex) => (
              <div key={elemIndex} className="my-6">
                {element.type === 'image' && (
                  <figure className="text-center">
                    <img 
                      src={element.url} 
                      alt={element.caption}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                    {element.caption && (
                      <figcaption className="text-sm text-gray-600 mt-2">
                        {element.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
                
                {element.type === 'quote_highlight' && (
                  <blockquote className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg my-6">
                    <p className="text-lg italic text-blue-900">"{element.text}"</p>
                    {element.context && (
                      <cite className="text-sm text-blue-700 mt-2 block">
                        {element.context}
                      </cite>
                    )}
                  </blockquote>
                )}
                
                {element.type === 'professional_insight' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                        💡
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">
                          Professional Insight
                        </h4>
                        <p className="text-green-700 text-sm">{element.text}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Lightbox for images */}
      {activeMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setActiveMedia(null)}
        >
          <img 
            src={activeMedia} 
            alt="Enlarged view"
            className="max-w-full max-h-full object-contain"
          />
          <button 
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setActiveMedia(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
```

### **Day 4-5: Story Discovery & Recommendations**

#### **Story Discovery System**
```typescript
// /components/story/StoryDiscovery.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function StoryDiscovery() {
  const [featuredStories, setFeaturedStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Professional Stories</h1>
        <p className="text-gray-600">
          Explore authentic professional journeys from community-centered leaders and innovators
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search stories by theme, expertise, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Categories</option>
            <option>Community Organizing</option>
            <option>Technology Innovation</option>
            <option>Social Enterprise</option>
            <option>Healthcare Innovation</option>
            <option>Environmental Justice</option>
          </select>
        </div>
      </div>

      {/* Featured Stories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "From Muswellbrook to Global Platform",
              author: "Ben Knight",
              theme: "Platform Building",
              readTime: 12,
              excerpt: "How small-town values shaped the development of community-centered technology...",
              image: "/story-covers/ben-primary.jpg"
            },
            {
              title: "Building Healing Networks in Black Communities",
              author: "BEAM Collective",
              theme: "Community Health",
              readTime: 8,
              excerpt: "Creating mental health resources that honor Black wellness traditions...",
              image: "/story-covers/beam-healing.jpg"
            }
          ].map((story, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={story.image} 
                alt={story.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {story.theme}
                  </span>
                  <span className="text-gray-500 text-sm">{story.readTime} min</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{story.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">by {story.author}</span>
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    Read Story →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Explore by Focus Area</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Community Organizing", count: 23, icon: "🤝" },
            { name: "Technology Innovation", count: 18, icon: "⚡" },
            { name: "Healthcare Innovation", count: 15, icon: "🏥" },
            { name: "Environmental Justice", count: 12, icon: "🌱" },
            { name: "Educational Innovation", count: 20, icon: "📚" },
            { name: "Arts & Culture", count: 14, icon: "🎨" },
            { name: "Economic Justice", count: 16, icon: "💰" },
            { name: "Youth Development", count: 19, icon: "🌟" }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-medium mb-1">{category.name}</h3>
              <p className="text-gray-500 text-sm">{category.count} stories</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### **Day 6-7: Analytics & Insights Dashboard**

---

## **Week 3: Advanced Features & Testing**

### **Day 1-3: Story Analytics & Engagement Insights**

### **Day 4-5: Content Migration & Integration**

### **Day 6-7: Testing & Performance Optimization**

---

## **Sprint 2 Success Criteria**

- ✅ **Interactive Story Reading**: Full content display with engagement tracking
- ✅ **Multimedia Integration**: Video, audio, and image support within stories  
- ✅ **Content Management**: Dashboard for storytellers to manage and analyze content
- ✅ **Story Discovery**: Search, categorization, and recommendation system
- ✅ **Analytics Integration**: Engagement tracking and insights for storytellers
- ✅ **Ben's Content Integration**: All 15,000+ words of content accessible through platform
- ✅ **Performance Optimization**: Fast loading, smooth interactions, mobile optimization

**Sprint 2 transforms Empathy Ledger from a profile platform into a comprehensive storytelling ecosystem where professional relationships develop through authentic narrative engagement rather than transactional networking.**