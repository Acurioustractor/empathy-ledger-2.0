'use client';

import React, { useState, useEffect } from 'react';
import StoryReader from '@/components/story/StoryReader';
import MultimediaStory from '@/components/story/MultimediaStory';
import { Button } from '@/components/ui/Button';

interface StoryPageProps {
  params: Promise<{
    storyId: string;
  }>;
}

export default function StoryPage({ params }: StoryPageProps) {
  const [storyId, setStoryId] = useState<string>('');
  
  useEffect(() => {
    params.then(resolvedParams => {
      setStoryId(resolvedParams.storyId);
    });
  }, [params]);
  const [accessLevel, setAccessLevel] = useState<'public' | 'paywall' | 'organizational'>('public');
  const [viewMode, setViewMode] = useState<'reader' | 'multimedia'>('reader');
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!storyId) return;
    
    // Check for existing subscription
    const subscription = localStorage.getItem('subscription_ben-knight-demo');
    if (subscription) {
      setAccessLevel('paywall');
    }
    
    fetchStoryPreview();
  }, [storyId]);

  const fetchStoryPreview = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}?access_level=public`);
      const storyData = await response.json();
      setStory(storyData);
    } catch (error) {
      console.error('Failed to fetch story preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEngagement = (engagement: any) => {
    console.log('Engagement tracked:', engagement);
    // In production, this would send analytics to the server
  };

  const handleUpgrade = () => {
    // Demo subscription flow
    localStorage.setItem('subscription_ben-knight-demo', 'active');
    setAccessLevel('paywall');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-600 mb-6">The story you're looking for could not be found.</p>
          <Button onClick={() => window.history.back()}>
            ← Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Controls Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">Empathy Ledger: Interactive Story Reader Demo</h1>
              <p className="text-blue-100 text-sm">
                Experience storytelling-centered professional networking with engagement tracking
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Access Level Controls */}
              <div className="flex bg-blue-500 rounded-lg overflow-hidden">
                {(['public', 'paywall', 'organizational'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setAccessLevel(level)}
                    className={`px-3 py-2 text-sm transition-colors ${
                      accessLevel === level 
                        ? 'bg-white text-blue-600' 
                        : 'text-white hover:bg-blue-400'
                    }`}
                  >
                    {level === 'paywall' ? 'Premium' : level}
                  </button>
                ))}
              </div>
              
              {/* View Mode Controls */}
              <div className="flex bg-blue-500 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('reader')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'reader' 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:bg-blue-400'
                  }`}
                >
                  📖 Text Reader
                </button>
                <button
                  onClick={() => setViewMode('multimedia')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'multimedia' 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:bg-blue-400'
                  }`}
                >
                  🎥 Multimedia
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Upgrade Banner */}
      {accessLevel === 'public' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-800">
                🔒 You're viewing the public preview
              </h3>
              <p className="text-yellow-700 text-sm">
                Upgrade to premium for the complete story, professional insights, and engagement features
              </p>
            </div>
            <Button onClick={handleUpgrade} className="bg-yellow-600 hover:bg-yellow-700">
              Upgrade to Premium ($25/month)
            </Button>
          </div>
        </div>
      )}

      {/* Story Content */}
      <div className="pb-12">
        {viewMode === 'reader' ? (
          <StoryReader 
            storyId={storyId}
            accessLevel={accessLevel}
            onEngagement={handleEngagement}
          />
        ) : (
          <MultimediaStory 
            story={{
              id: storyId,
              title: story.title,
              video_url: '/story-videos/ben-primary-story.mp4',
              audio_url: '/story-audio/ben-primary-narration.mp3',
              gallery_images: [
                '/story-images/muswellbrook-landscape.jpg',
                '/story-images/ben-aime-work.jpg',
                '/story-images/orange-sky-community.jpg',
                '/story-images/empathy-ledger-design.jpg',
                '/story-images/aboriginal-advisors.jpg',
                '/story-images/platform-development.jpg'
              ],
              sections: story.content_structure?.sections || [],
              storyteller: story.storyteller
            }}
          />
        )}
      </div>

      {/* Demo Features Showcase */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Sprint 2 Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📖 Interactive Story Reader</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Real-time reading progress tracking</li>
                <li>✓ Quote saving and highlighting</li>
                <li>✓ Engagement analytics collection</li>
                <li>✓ Professional insights integration</li>
                <li>✓ Mobile-responsive design</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🎥 Multimedia Integration</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Video storytelling with chapters</li>
                <li>✓ Audio narration support</li>
                <li>✓ Visual journey galleries</li>
                <li>✓ Embedded professional insights</li>
                <li>✓ Interactive quote highlights</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">📊 Engagement Tracking</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>✓ Session-based analytics</li>
                <li>✓ Reading completion metrics</li>
                <li>✓ Professional interest tracking</li>
                <li>✓ Storyteller revenue insights</li>
                <li>✓ Community engagement scoring</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                🏠 View Full Profile Demo
              </Button>
              <Button variant="outline">
                📋 Story Management Dashboard
              </Button>
              <Button variant="outline">
                🔍 Discover More Stories
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}