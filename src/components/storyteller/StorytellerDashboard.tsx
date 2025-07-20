'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getUserStories, 
  getUserProfile, 
  getUserCommunities,
  type Story, 
  type UserProfile,
  type StoryStatus 
} from '@/lib/supabase-auth';
import { getCurrentSession } from '@/lib/supabase-auth';
import MediaDisplay from '@/components/ui/MediaDisplay';
import { placeholderImages, placeholderBlurDataURLs } from '@/lib/supabase-media';
import PrivacySettingsPanel from '@/components/privacy/PrivacySettingsPanel';

interface DashboardStats {
  total_stories: number;
  published_stories: number;
  draft_stories: number;
  total_views: number;
  total_reactions: number;
  communities_joined: number;
  insights_generated: number;
}

export default function StorytellerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_stories: 0,
    published_stories: 0,
    draft_stories: 0,
    total_views: 0,
    total_reactions: 0,
    communities_joined: 0,
    insights_generated: 0
  });
  const [communities, setCommunities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'communities' | 'insights' | 'privacy'>('overview');
  const [selectedStatus, setSelectedStatus] = useState<StoryStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const session = await getCurrentSession();
      if (!session.user) {
        // Redirect to login
        return;
      }

      setUser(session.user);

      // Load user profile
      const { profile: userProfile } = await getUserProfile(session.user.id);
      setProfile(userProfile);

      // Load user stories
      const { stories: userStories } = await getUserStories(session.user.id);
      setStories(userStories);

      // Load user communities
      const { communities: userCommunities } = await getUserCommunities(session.user.id);
      setCommunities(userCommunities);

      // Calculate stats
      const dashboardStats = calculateStats(userStories, userProfile);
      setStats(dashboardStats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (userStories: Story[], userProfile: UserProfile | null): DashboardStats => {
    const publishedStories = userStories.filter(s => s.status === 'approved' || s.status === 'featured');
    const draftStories = userStories.filter(s => s.status === 'draft');
    const totalViews = userStories.reduce((sum, story) => sum + story.view_count, 0);
    const totalReactions = userStories.reduce((sum, story) => sum + story.reaction_count, 0);

    return {
      total_stories: userStories.length,
      published_stories: publishedStories.length,
      draft_stories: draftStories.length,
      total_views: totalViews,
      total_reactions: totalReactions,
      communities_joined: userProfile?.communities_joined || 0,
      insights_generated: userProfile?.insights_generated || 0
    };
  };

  const filterStories = (stories: Story[]): Story[] => {
    if (selectedStatus === 'all') return stories;
    return stories.filter(story => story.status === selectedStatus);
  };

  const getStatusColor = (status: StoryStatus): string => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'featured': return 'bg-blue-100 text-blue-700';
      case 'archived': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-3xl animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-500 font-light">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extralight text-gray-900 mb-4">
            Please sign in to access your dashboard
          </h1>
          <Link href="/auth/signin" className="no-underline">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 rounded-3xl flex items-center justify-center">
                <span className="text-2xl font-extralight text-gray-600">
                  {profile.display_name?.charAt(0) || 'S'}
                </span>
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-2">
                Welcome back, {profile.display_name}
              </h1>
              <p className="text-xl text-gray-600 font-light mb-4">
                Your storytelling journey at a glance
              </p>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-extralight text-gray-900">{stats.total_stories}</div>
                  <div className="text-sm text-gray-500 font-light">Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extralight text-gray-900">{stats.total_views}</div>
                  <div className="text-sm text-gray-500 font-light">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extralight text-gray-900">{stats.communities_joined}</div>
                  <div className="text-sm text-gray-500 font-light">Communities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extralight text-gray-900">{stats.insights_generated}</div>
                  <div className="text-sm text-gray-500 font-light">Insights</div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link href="/submit" className="no-underline">
                <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition hover:scale-[1.02]">
                  Share New Story
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="border-b border-gray-100">
        <div className="content-container">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'stories', label: 'My Stories' },
              { id: 'communities', label: 'Communities' },
              { id: 'insights', label: 'Insights' },
              { id: 'privacy', label: 'Privacy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-light smooth-transition ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-spacing">
        <div className="content-container">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quick Stats */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-extralight text-gray-900 mb-6">Your Impact</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-normal text-gray-900">Published Stories</h3>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-extralight text-gray-900 mb-2">{stats.published_stories}</div>
                    <p className="text-sm text-gray-500 font-light">Stories reaching the community</p>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl p-6 hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-normal text-gray-900">Total Engagement</h3>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-extralight text-gray-900 mb-2">{stats.total_reactions}</div>
                    <p className="text-sm text-gray-500 font-light">Reactions from the community</p>
                  </div>
                </div>

                {/* Recent Stories */}
                <h3 className="text-xl font-normal text-gray-900 mb-4">Recent Stories</h3>
                <div className="space-y-4">
                  {stories.slice(0, 3).map((story) => (
                    <div key={story.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover-lift">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-normal text-gray-900 flex-1">{story.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-light ${getStatusColor(story.status)}`}>
                          {story.status}
                        </span>
                      </div>
                      <p className="text-gray-600 font-light text-sm mb-3 line-clamp-2">
                        {story.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-light">{formatDate(story.created_at)}</span>
                        <div className="flex items-center gap-4">
                          <span>{story.view_count} views</span>
                          <span>{story.reaction_count} reactions</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-4 mb-8">
                  <Link href="/submit" className="block bg-gray-900 text-white p-4 rounded-2xl hover:bg-gray-800 smooth-transition no-underline">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-light">Share New Story</span>
                    </div>
                  </Link>
                  <Link href="/communities" className="block bg-gray-50 text-gray-700 p-4 rounded-2xl hover:bg-gray-100 smooth-transition no-underline">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-light">Explore Communities</span>
                    </div>
                  </Link>
                </div>

                <h3 className="text-xl font-normal text-gray-900 mb-4">Your Communities</h3>
                <div className="space-y-3">
                  {communities.slice(0, 3).map((membership) => (
                    <div key={membership.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                      <h4 className="font-normal text-gray-900 text-sm mb-1">
                        {membership.communities.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-light">
                        {membership.communities.member_count} members • {membership.communities.story_count} stories
                      </p>
                    </div>
                  ))}
                  {communities.length === 0 && (
                    <p className="text-gray-500 font-light text-sm">
                      You haven't joined any communities yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stories' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h2 className="text-2xl font-extralight text-gray-900 mb-4 sm:mb-0">My Stories</h2>
                <div className="flex gap-4">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="border border-gray-200 rounded-full px-4 py-2 text-sm font-light bg-white"
                  >
                    <option value="all">All Stories</option>
                    <option value="draft">Drafts</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Published</option>
                    <option value="featured">Featured</option>
                  </select>
                  <Link href="/submit" className="no-underline">
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-light hover:bg-gray-800 smooth-transition">
                      New Story
                    </button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-6">
                {filterStories(stories).map((story) => (
                  <div key={story.id} className="bg-white border border-gray-100 rounded-3xl p-8 hover-lift">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-normal text-gray-900">{story.title}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full font-light ${getStatusColor(story.status)}`}>
                            {story.status}
                          </span>
                        </div>
                        <p className="text-gray-600 font-light mb-4 leading-relaxed">
                          {story.content.substring(0, 300)}...
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {story.themes.slice(0, 3).map((theme) => (
                            <span key={theme} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-light">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                      {(story.audio_url || story.video_url || story.image_urls?.length) && (
                        <div className="flex-shrink-0 ml-6">
                          <MediaDisplay
                            src={story.image_urls?.[0] || placeholderImages.story}
                            alt="Story media"
                            aspectRatio="square"
                            rounded="2xl"
                            className="w-24 h-24"
                            blurDataURL={placeholderBlurDataURLs.story}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6 text-sm text-gray-500 font-light">
                        <span>{formatDate(story.created_at)}</span>
                        <span>{story.view_count} views</span>
                        <span>{story.reaction_count} reactions</span>
                        <span>{story.comment_count} comments</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link href={`/stories/${story.id}/edit`} className="text-gray-600 hover:text-gray-900 smooth-transition no-underline">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <Link href={`/stories/${story.id}`} className="text-gray-600 hover:text-gray-900 smooth-transition no-underline">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {filterStories(stories).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-normal text-gray-900 mb-2">No stories yet</h3>
                    <p className="text-gray-600 font-light mb-6">
                      {selectedStatus === 'all' 
                        ? 'Start your storytelling journey by sharing your first story.'
                        : `No ${selectedStatus} stories found.`
                      }
                    </p>
                    <Link href="/submit" className="no-underline">
                      <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition">
                        Share Your First Story
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab === 'communities' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-extralight text-gray-900 mb-4">Communities</h2>
              <p className="text-gray-600 font-light">Community management features coming soon.</p>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-extralight text-gray-900 mb-4">Insights</h2>
              <p className="text-gray-600 font-light">Personalized insights about your story impact coming soon.</p>
            </div>
          )}

          {activeTab === 'privacy' && user && (
            <PrivacySettingsPanel 
              userId={user.id} 
              onSettingsUpdate={(settings) => {
                // Update profile with new privacy settings
                setProfile(prev => prev ? { ...prev, privacy_settings: settings } : null);
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}