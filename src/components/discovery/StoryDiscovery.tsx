'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStories, type Story, type StoryFilter } from '@/lib/supabase-stories';
import { getCurrentSession } from '@/lib/supabase-auth';
import MediaDisplay from '@/components/ui/MediaDisplay';
import { placeholderImages, placeholderBlurDataURLs } from '@/lib/supabase-media';

export default function StoryDiscovery() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<StoryFilter>({
    status: 'approved'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'impact'>('recent');

  const categories = [
    { value: 'all', label: 'All Stories' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'housing', label: 'Housing' },
    { value: 'youth', label: 'Youth' },
    { value: 'elder_care', label: 'Elder Care' },
    { value: 'policy', label: 'Policy' },
    { value: 'community', label: 'Community' },
    { value: 'environment', label: 'Environment' },
    { value: 'employment', label: 'Employment' },
    { value: 'social_services', label: 'Social Services' }
  ];

  const commonThemes = [
    'healthcare access', 'mental health', 'housing affordability', 'education quality',
    'employment opportunities', 'community safety', 'environmental justice',
    'youth support', 'aged care', 'social services', 'policy impact'
  ];

  useEffect(() => {
    loadUser();
    loadStories();
  }, [filter, selectedCategory, searchQuery, selectedThemes, sortBy]);

  const loadUser = async () => {
    try {
      const session = await getCurrentSession();
      setUser(session.user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const currentFilter: StoryFilter = {
        ...filter,
        category: selectedCategory === 'all' ? undefined : selectedCategory as any,
        search_query: searchQuery || undefined,
        themes: selectedThemes.length > 0 ? selectedThemes : undefined
      };

      const { stories: loadedStories, error } = await getStories(
        currentFilter,
        20,
        0,
        user?.id
      );

      if (error) throw error;

      // Sort stories based on selection
      let sortedStories = loadedStories || [];
      switch (sortBy) {
        case 'popular':
          sortedStories.sort((a, b) => (b.view_count + b.reaction_count) - (a.view_count + a.reaction_count));
          break;
        case 'impact':
          sortedStories.sort((a, b) => b.impact_score - a.impact_score);
          break;
        case 'recent':
        default:
          sortedStories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }

      setStories(sortedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      // Fallback to demo data
      setStories(generateDemoStories());
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStoryExcerpt = (content: string, maxLength: number = 200): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const generateDemoStories = (): Story[] => {
    return [
      {
        id: '1',
        title: 'Finding Hope in Community Mental Health Support',
        content: 'After struggling with anxiety for months, I discovered the power of peer support groups in my local community. The safe space created by others who understood my journey became a lifeline during my darkest moments...',
        category: 'healthcare',
        themes: ['mental health', 'community support', 'peer support'],
        tags: ['anxiety', 'recovery', 'community'],
        privacy_level: 'public',
        can_be_shared: true,
        allow_research_use: true,
        allow_ai_analysis: true,
        contributor_id: 'demo-user-1',
        view_count: 234,
        share_count: 12,
        comment_count: 8,
        reaction_count: 45,
        impact_score: 8.5,
        cited_in_reports: 2,
        policy_influence_score: 1,
        status: 'approved',
        flagged_content: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Breaking Barriers: Access to Quality Education',
        content: 'Growing up in a low-income household, quality education seemed out of reach. But through dedicated teachers and community programs, I found pathways to learning that changed my entire trajectory...',
        category: 'education',
        themes: ['education access', 'community programs', 'social mobility'],
        tags: ['education', 'opportunity', 'community'],
        privacy_level: 'public',
        can_be_shared: true,
        allow_research_use: true,
        allow_ai_analysis: true,
        contributor_id: 'demo-user-2',
        view_count: 189,
        share_count: 8,
        comment_count: 12,
        reaction_count: 67,
        impact_score: 9.2,
        cited_in_reports: 3,
        policy_influence_score: 2,
        status: 'featured',
        flagged_content: false,
        created_at: '2024-01-12T14:20:00Z',
        updated_at: '2024-01-12T14:20:00Z'
      },
      {
        id: '3',
        title: 'Housing Crisis: A Personal Journey',
        content: 'When rent prices skyrocketed in our neighborhood, my family faced an impossible choice. This is our story of navigating the housing market and finding creative solutions through community support...',
        category: 'housing',
        themes: ['housing affordability', 'community support', 'family resilience'],
        tags: ['housing', 'affordability', 'family'],
        privacy_level: 'public',
        can_be_shared: true,
        allow_research_use: false,
        allow_ai_analysis: true,
        contributor_id: 'demo-user-3',
        view_count: 312,
        share_count: 18,
        comment_count: 15,
        reaction_count: 89,
        impact_score: 7.8,
        cited_in_reports: 1,
        policy_influence_score: 3,
        status: 'approved',
        flagged_content: false,
        created_at: '2024-01-10T09:15:00Z',
        updated_at: '2024-01-10T09:15:00Z'
      }
    ];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extralight text-gray-900 mb-6">
              Discover Stories
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
              Explore powerful stories from communities around Australia. Every story shared with permission to inspire change and understanding.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories by keywords, themes, or content..."
                  className="w-full p-4 pr-12 border border-gray-200 rounded-2xl text-lg font-light focus:border-gray-400 focus:outline-none transition-colors"
                />
                <svg className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-100">
        <div className="content-container py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-normal text-gray-900 mb-3">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm font-light bg-white focus:border-gray-400 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className="block text-sm font-normal text-gray-900 mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm font-light bg-white focus:border-gray-400 focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="impact">Highest Impact</option>
              </select>
            </div>

            {/* Privacy Level Filter */}
            <div className="flex-1">
              <label className="block text-sm font-normal text-gray-900 mb-3">Story Type</label>
              <select
                value={filter.featured_only ? 'featured' : 'all'}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  featured_only: e.target.value === 'featured' ? true : undefined 
                }))}
                className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm font-light bg-white focus:border-gray-400 focus:outline-none"
              >
                <option value="all">All Stories</option>
                <option value="featured">Featured Stories</option>
              </select>
            </div>
          </div>

          {/* Theme Tags */}
          <div className="mt-6">
            <label className="block text-sm font-normal text-gray-900 mb-3">Themes</label>
            <div className="flex flex-wrap gap-2">
              {commonThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeToggle(theme)}
                  className={`px-3 py-1 rounded-full text-sm font-light smooth-transition ${
                    selectedThemes.includes(theme)
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="section-spacing">
        <div className="content-container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-3xl h-64 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-2">No Stories Found</h3>
              <p className="text-gray-600 font-light mb-6">
                Try adjusting your filters or search terms to discover more stories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedThemes([]);
                  setFilter({ status: 'approved' });
                }}
                className="bg-gray-900 text-white px-6 py-2 rounded-full font-light hover:bg-gray-800 smooth-transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <article key={story.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover-lift">
                  {/* Story Image/Media Preview */}
                  <div className="aspect-video bg-gray-100 relative">
                    <MediaDisplay
                      src={story.image_urls?.[0] || placeholderImages.story}
                      alt={story.title}
                      aspectRatio="video"
                      className="w-full h-full"
                      blurDataURL={placeholderBlurDataURLs.story}
                    />
                    {story.status === 'featured' && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-light">
                          Featured
                        </span>
                      </div>
                    )}
                    {(story.audio_url || story.video_url) && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        {story.audio_url && (
                          <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9v6m4-6v6m4-8v8" />
                            </svg>
                          </div>
                        )}
                        {story.video_url && (
                          <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Category & Themes */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-light capitalize">
                        {story.category.replace('_', ' ')}
                      </span>
                      {story.themes.slice(0, 2).map((theme) => (
                        <span key={theme} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-light">
                          {theme}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-normal text-gray-900 mb-3 line-clamp-2">
                      {story.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 font-light text-sm leading-relaxed mb-4 line-clamp-3">
                      {getStoryExcerpt(story.content, 120)}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 font-light mb-4">
                      <div className="flex items-center gap-4">
                        <span>{story.view_count} views</span>
                        <span>{story.reaction_count} reactions</span>
                        {story.impact_score > 0 && (
                          <span>{story.impact_score.toFixed(1)} impact</span>
                        )}
                      </div>
                      <span>{formatDate(story.created_at)}</span>
                    </div>

                    {/* Read More */}
                    <Link href={`/stories/${story.id}`} className="no-underline">
                      <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-2 rounded-full text-sm font-light smooth-transition">
                        Read Full Story
                      </button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Load More */}
          {stories.length > 0 && stories.length >= 20 && (
            <div className="text-center mt-12">
              <button
                onClick={() => {/* Implement pagination */}}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition"
              >
                Load More Stories
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-spacing bg-gray-900 text-white">
        <div className="content-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extralight mb-6">
              Share Your Story
            </h2>
            <p className="text-xl text-gray-300 font-light mb-8">
              Join our community of storytellers making a difference. Your experience could inspire change and support others facing similar challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit" className="no-underline">
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-light hover:bg-gray-100 smooth-transition">
                  Share Your Story
                </button>
              </Link>
              <Link href="/auth/signin" className="no-underline">
                <button className="border border-gray-600 text-gray-300 px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition">
                  Join Community
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}