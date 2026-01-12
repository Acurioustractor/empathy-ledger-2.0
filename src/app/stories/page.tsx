'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

interface Story {
  id: string;
  title: string;
  summary?: string;
  story_image_url?: string;
  themes?: string[];
  privacy_level: string;
  created_at: string;
  storyteller: {
    full_name: string;
    organization?: {
      name: string;
    };
  };
  story_analysis?: {
    primary_emotions: string[];
    key_topics: string[];
    themes_identified: string[];
  }[];
}

interface Theme {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStoriesAndThemes();
  }, []);

  async function loadStoriesAndThemes() {
    try {
      // Load stories with related data
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          summary,
          story_image_url,
          themes,
          privacy_level,
          created_at,
          storyteller:storytellers(
            full_name,
            organization:organizations(name)
          ),
          story_analysis(
            primary_emotions,
            key_topics,
            themes_identified
          )
        `)
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      // Load themes
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('id, name, category, description')
        .eq('status', 'active')
        .order('category', { ascending: true });

      if (storiesError) {
        console.error('Error loading stories:', storiesError);
      } else {
        // Process stories data to handle array relationships from Supabase
        const processedStories = (storiesData || []).map(story => ({
          ...story,
          storyteller: Array.isArray(story.storyteller) ? {
            ...story.storyteller[0],
            organization: Array.isArray(story.storyteller[0]?.organization) 
              ? story.storyteller[0].organization[0] 
              : story.storyteller[0]?.organization
          } : story.storyteller
        }));
        setStories(processedStories);
      }

      if (themesError) {
        console.error('Error loading themes:', themesError);
      } else {
        setThemes(themesData || []);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter stories based on search and theme
  const filteredStories = stories.filter(story => {
    const matchesSearch = !searchTerm || 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.storyteller?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTheme = selectedTheme === 'all' || 
      story.themes?.includes(selectedTheme) ||
      story.story_analysis?.some(analysis => 
        analysis.themes_identified?.includes(selectedTheme)
      );

    return matchesSearch && matchesTheme;
  });

  // Group themes by category
  const themesByCategory = themes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, Theme[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Community Stories
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover wisdom, resilience, and insights from our community storytellers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Explore Stories
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Stories
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or storyteller..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Theme Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Theme
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Themes</option>
                  {Object.entries(themesByCategory).map(([category, categoryThemes]) => (
                    <optgroup key={category} label={category.replace('_', ' ').toUpperCase()}>
                      {categoryThemes.map(theme => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Stats */}
              <div className="text-sm text-gray-600">
                <p className="mb-1">
                  <span className="font-medium">{filteredStories.length}</span> stories found
                </p>
                <p>
                  <span className="font-medium">{themes.length}</span> themes available
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Stories Grid */}
          <div className="lg:col-span-3">
            {filteredStories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No stories found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTheme('all');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStories.map((story) => (
                  <StoryCard key={story.id} story={story} themes={themes} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story, themes }: { story: Story; themes: Theme[] }) {
  // Get theme names from IDs
  const getThemeNames = (themeIds: string[] = []) => {
    return themeIds
      .map(id => themes.find(t => t.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3); // Show max 3 themes
  };

  const storyThemes = getThemeNames(
    story.story_analysis?.[0]?.themes_identified || story.themes || []
  );

  const emotions = story.story_analysis?.[0]?.primary_emotions?.slice(0, 2) || [];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Story Image */}
      {story.story_image_url && (
        <div className="aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden">
          <img
            src={story.story_image_url}
            alt={story.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {story.title}
        </h3>
        
        {/* Storyteller */}
        <p className="text-sm text-gray-600 mb-3">
          by <span className="font-medium">{story.storyteller?.full_name}</span>
          {story.storyteller?.organization?.name && (
            <span className="text-gray-400"> • {story.storyteller.organization.name}</span>
          )}
        </p>

        {/* Summary */}
        {story.summary && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {story.summary}
          </p>
        )}

        {/* Themes */}
        {storyThemes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {storyThemes.map((theme, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emotions */}
        {emotions.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                >
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            href={`/stories/${story.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Read Story →
          </Link>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <button className="hover:text-red-500 transition-colors">
              ❤️ 0
            </button>
            <button className="hover:text-blue-500 transition-colors">
              💬 0
            </button>
            <button className="hover:text-green-500 transition-colors">
              📤 Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}