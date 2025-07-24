'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import StoryEngagement from '@/components/story/StoryEngagement';

const supabase = createClient();

interface Story {
  id: string;
  title: string;
  summary?: string;
  story_content?: string;
  story_image_url?: string;
  themes?: string[];
  privacy_level: string;
  created_at: string;
  storyteller: {
    full_name: string;
    bio?: string;
    profile_image_url?: string;
    organization?: {
      name: string;
    };
  };
  story_analysis?: {
    primary_emotions: string[];
    key_topics: string[];
    key_quotes: string[];
    summary: string;
    insights: string[];
    themes_identified: string[];
    confidence_score: number;
  }[];
}

interface Theme {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params?.storyId as string;
  const [story, setStory] = useState<Story | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);

  async function loadStory() {
    try {
      // Load story with all related data
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          story_content,
          story_image_url,
          themes,
          privacy_level,
          created_at,
          storyteller:storytellers(
            full_name,
            bio,
            profile_image_url,
            organization:organizations(name)
          ),
          story_analysis(
            primary_emotions,
            key_topics,
            key_quotes,
            summary,
            insights,
            themes_identified,
            confidence_score
          )
        `)
        .eq('id', storyId)
        .maybeSingle();

      // Load themes for mapping
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('id, name, category, description')
        .eq('status', 'active');

      if (storyError) {
        throw storyError;
      }

      if (!storyData) {
        setError('Story not found');
        return;
      }

      if (storyData.privacy_level !== 'public') {
        setError('This story is not publicly available');
        return;
      }

      // Handle the case where storyteller might be an array from Supabase
      const storyteller = Array.isArray(storyData.storyteller) ? storyData.storyteller[0] : storyData.storyteller;
      const processedStory = {
        ...storyData,
        storyteller: {
          ...storyteller,
          organization: Array.isArray(storyteller?.organization) ? storyteller.organization[0] : storyteller?.organization
        }
      };

      setStory(processedStory);
      setThemes(themesData || []);

    } catch (err) {
      console.error('Error loading story:', err);
      setError('Failed to load story');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Story Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The story you\'re looking for doesn\'t exist.'}</p>
          <Link href="/stories" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Browse All Stories
          </Link>
        </div>
      </div>
    );
  }

  // Get theme names from IDs
  const getThemeNames = (themeIds: string[] = []) => {
    return themeIds
      .map(id => themes.find(t => t.id === id))
      .filter(Boolean);
  };

  const storyThemes = getThemeNames(
    story.story_analysis?.[0]?.themes_identified || story.themes || []
  );

  const analysis = story.story_analysis?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/stories"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Stories
          </Link>
        </div>

        {/* Story Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Story Image */}
          {story.story_image_url && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={story.story_image_url}
                alt={story.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {story.title}
            </h1>

            {/* Storyteller Info */}
            <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                {story.storyteller.profile_image_url ? (
                  <img
                    src={story.storyteller.profile_image_url}
                    alt={story.storyteller.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {story.storyteller.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {story.storyteller.full_name}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {story.storyteller.organization?.name && (
                      <span>{story.storyteller.organization.name} • </span>
                    )}
                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="prose prose-lg max-w-none mb-8">
              {story.summary && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <p className="text-blue-800 font-medium text-lg italic">
                    {story.summary}
                  </p>
                </div>
              )}

              {story.story_content ? (
                <div
                  className="story-content"
                  dangerouslySetInnerHTML={{ __html: story.story_content }}
                />
              ) : (
                <p className="text-gray-600 italic">
                  Story content is being processed. Check back soon for the full narrative.
                </p>
              )}
            </div>

            {/* AI Analysis Insights */}
            {analysis && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI Story Insights
                  <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {Math.round(analysis.confidence_score * 100)}% confidence
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Themes */}
                  {storyThemes.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {storyThemes.map((theme) => (
                          <span
                            key={theme!.id}
                            className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                            title={theme!.description}
                          >
                            {theme!.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emotions */}
                  {analysis.primary_emotions && analysis.primary_emotions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Emotions</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.primary_emotions.map((emotion, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Quotes */}
                {analysis.key_quotes && analysis.key_quotes.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Key Quotes</h4>
                    <div className="space-y-3">
                      {analysis.key_quotes.slice(0, 2).map((quote, index) => (
                        <blockquote
                          key={index}
                          className="border-l-4 border-blue-400 pl-4 italic text-gray-700"
                        >
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {analysis.insights && analysis.insights.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
                    <ul className="space-y-2">
                      {analysis.insights.slice(0, 3).map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Engagement Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Community Response
              </h3>
              <StoryEngagement storyId={story.id} className="mb-6" />
              
              {/* Comments Placeholder */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-2">💬 Comments & Discussions</p>
                <p className="text-sm text-gray-500">
                  Community discussion features coming soon. Share your thoughts using the reactions above!
                </p>
              </div>
            </div>

            {/* Related Stories */}
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Related Stories
              </h3>
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Related story recommendations based on themes and content coming soon.
                </p>
                <Link
                  href="/stories"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse All Stories →
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}