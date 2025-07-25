'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface StoryManagementProps {
  storytellerId: string;
}

interface Story {
  id: string;
  title: string;
  story_type: 'primary' | 'supporting' | 'insight' | 'quote_collection' | 'case_study';
  content_status: 'draft' | 'review' | 'published' | 'archived';
  view_count: number;
  read_completion_rate: number;
  engagement_score: number;
  revenue_generated: number;
  last_updated: string;
  word_count: number;
  reading_time_minutes: number;
}

interface Analytics {
  total_views: number;
  unique_readers: number;
  average_completion_rate: number;
  total_revenue: number;
  professional_inquiries: number;
  growth_metrics: {
    views_change: number;
    completion_change: number;
    revenue_change: number;
  };
}

export default function StoryManagement({ storytellerId }: StoryManagementProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [viewPeriod, setViewPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStories();
    fetchAnalytics();
  }, [storytellerId, viewPeriod]);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      // In production, this would fetch from the database
      // For demo, we'll use Ben's story data
      const demoStories: Story[] = [
        {
          id: 'muswellbrook-to-global',
          title: 'From Muswellbrook to Global Platform',
          story_type: 'primary',
          content_status: 'published',
          view_count: 1247,
          read_completion_rate: 78.5,
          engagement_score: 85.2,
          revenue_generated: 850,
          last_updated: '2024-01-15',
          word_count: 2500,
          reading_time_minutes: 12
        },
        {
          id: 'curious-tractor-origin',
          title: 'The Origin of A Curious Tractor',
          story_type: 'supporting',
          content_status: 'published',
          view_count: 623,
          read_completion_rate: 82.1,
          engagement_score: 79.4,
          revenue_generated: 320,
          last_updated: '2024-01-10',
          word_count: 950,
          reading_time_minutes: 5
        },
        {
          id: 'aboriginal-wisdom-platforms',
          title: 'Aboriginal Communities and Global Platforms',
          story_type: 'supporting',
          content_status: 'published',
          view_count: 445,
          read_completion_rate: 71.3,
          engagement_score: 88.7,
          revenue_generated: 180,
          last_updated: '2024-01-08',
          word_count: 1100,
          reading_time_minutes: 6
        },
        {
          id: 'building-empathy-ledger',
          title: 'Building Empathy Ledger: From Vision to Platform',
          story_type: 'supporting',
          content_status: 'review',
          view_count: 89,
          read_completion_rate: 65.8,
          engagement_score: 72.1,
          revenue_generated: 45,
          last_updated: '2024-01-20',
          word_count: 1200,
          reading_time_minutes: 7
        },
        {
          id: 'community-technology-philosophy',
          title: 'Community-Centered Technology Philosophy',
          story_type: 'insight',
          content_status: 'draft',
          view_count: 0,
          read_completion_rate: 0,
          engagement_score: 0,
          revenue_generated: 0,
          last_updated: '2024-01-22',
          word_count: 800,
          reading_time_minutes: 4
        }
      ];
      
      setStories(demoStories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // In production, this would fetch from analytics aggregation tables
      const demoAnalytics: Analytics = {
        total_views: 2404,
        unique_readers: 1876,
        average_completion_rate: 75.4,
        total_revenue: 1395,
        professional_inquiries: 18,
        growth_metrics: {
          views_change: 12.3,
          completion_change: 5.7,
          revenue_change: 18.9
        }
      };
      
      setAnalytics(demoAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'supporting': return 'bg-green-100 text-green-800';
      case 'insight': return 'bg-purple-100 text-purple-800';
      case 'quote_collection': return 'bg-orange-100 text-orange-800';
      case 'case_study': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Story Management</h1>
          <p className="text-gray-600 mt-1">Manage your story portfolio and track engagement</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={viewPeriod} 
            onChange={(e) => setViewPeriod(e.target.value as 'week' | 'month' | 'quarter')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
          <Button>+ Create New Story</Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics.total_views.toLocaleString()}</p>
            <p className={`text-sm mt-1 ${analytics.growth_metrics.views_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.growth_metrics.views_change >= 0 ? '+' : ''}{analytics.growth_metrics.views_change}% this {viewPeriod}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Reading Completion</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics.average_completion_rate}%</p>
            <p className={`text-sm mt-1 ${analytics.growth_metrics.completion_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.growth_metrics.completion_change >= 0 ? '+' : ''}{analytics.growth_metrics.completion_change}% this {viewPeriod}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Professional Inquiries</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics.professional_inquiries}</p>
            <p className="text-sm text-blue-600 mt-1">3 new this {viewPeriod}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Revenue Generated</h3>
            <p className="text-2xl font-bold text-gray-900">${analytics.total_revenue.toLocaleString()}</p>
            <p className={`text-sm mt-1 ${analytics.growth_metrics.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.growth_metrics.revenue_change >= 0 ? '+' : ''}{analytics.growth_metrics.revenue_change}% this {viewPeriod}
            </p>
          </div>
        </div>
      )}

      {/* Story List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Stories</h2>
          <p className="text-gray-600 text-sm mt-1">Manage and track performance of your story portfolio</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {stories.map((story) => (
            <div key={story.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{story.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(story.story_type)}`}>
                      {story.story_type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(story.content_status)}`}>
                      {story.content_status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>{story.word_count} words</span>
                    <span>{story.reading_time_minutes} min read</span>
                    <span>Updated {new Date(story.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{story.view_count.toLocaleString()}</div>
                      <div className="text-gray-500">views</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{story.read_completion_rate}%</div>
                      <div className="text-gray-500">completion</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{story.engagement_score}</div>
                      <div className="text-gray-500">engagement</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">${story.revenue_generated}</div>
                      <div className="text-gray-500">revenue</div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 flex space-x-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Analytics</Button>
                </div>
              </div>
              
              {/* Expanded Analytics (if selected) */}
              {selectedStory === story.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Reader Demographics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Public Readers</span>
                          <span className="font-medium">68%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Premium Subscribers</span>
                          <span className="font-medium">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organizational</span>
                          <span className="font-medium">7%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Engagement Actions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quotes Saved</span>
                          <span className="font-medium">47</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Text Highlighted</span>
                          <span className="font-medium">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shared</span>
                          <span className="font-medium">12</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Professional Impact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Requests</span>
                          <span className="font-medium">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consultation Inquiries</span>
                          <span className="font-medium">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Speaking Requests</span>
                          <span className="font-medium">2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-start">
            📝 Draft New Story
          </Button>
          <Button variant="outline" className="justify-start">
            📊 Export Analytics
          </Button>
          <Button variant="outline" className="justify-start">
            💰 View Revenue Report
          </Button>
          <Button variant="outline" className="justify-start">
            🎯 Optimize Content
          </Button>
        </div>
      </div>
    </div>
  );
}