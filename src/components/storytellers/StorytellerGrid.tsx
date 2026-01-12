'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStorytellers, StorytellerWithStories } from '@/lib/supabase-storytellers';
import StorytellerProfile from './StorytellerProfile';

export default function StorytellerGrid() {
  const [storytellers, setStorytellers] = useState<StorytellerWithStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStorytellers();
  }, []);

  async function loadStorytellers() {
    try {
      setLoading(true);
      const { storytellers: data, error: fetchError } = await getStorytellers({
        limit: 12,
        includeStories: true
      });

      if (fetchError) {
        throw fetchError;
      }

      setStorytellers(data);
    } catch (err) {
      console.error('Error loading storytellers:', err);
      setError('Failed to load storytellers');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  if (!storytellers || storytellers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No storytellers found</p>
        <p className="text-gray-500 mt-2">Check back soon for new community voices</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {storytellers.map((storyteller) => (
        <Link key={storyteller.id} href={`/storytellers/${storyteller.id}`}>
          <div className="group hover:shadow-lg transition-shadow bg-white rounded-lg border p-6 cursor-pointer">
            {/* Profile Header */}
            <div className="mb-4">
              <StorytellerProfile 
                storyteller={{
                  id: storyteller.id,
                  full_name: storyteller.preferred_name || storyteller.full_name || 'Community Member',
                  profile_image_url: storyteller.profile_image_url || undefined,
                  community_affiliation: storyteller.community_affiliation || undefined,
                  bio: storyteller.bio || undefined,
                  public_story_count: storyteller.story_count
                }}
                size="large"
                showStoryCount={false}
              />
            </div>
            
            {/* Bio */}
            {storyteller.bio && (
              <p className="text-gray-700 mb-4 text-sm line-clamp-2">
                {storyteller.bio}
              </p>
            )}
            
            {/* Location */}
            {storyteller.location && (
              <p className="text-gray-600 text-sm mb-3">
                📍 {storyteller.location}
              </p>
            )}
            
            {/* Themes */}
            {storyteller.primary_themes && storyteller.primary_themes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {storyteller.primary_themes.map((theme: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}
            
            {/* Stats */}
            <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
              <span>{storyteller.story_count || 0} {storyteller.story_count === 1 ? 'story' : 'stories'}</span>
              {storyteller.impact_score && (
                <span>Impact: {storyteller.impact_score}/10</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}