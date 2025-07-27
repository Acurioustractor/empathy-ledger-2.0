'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface RoadmapItem {
  id: string;
  feature_title: string;
  feature_description: string;
  feature_category: 'core' | 'analytics' | 'community' | 'storytelling' | 'organization' | 'mobile' | 'cultural';
  status: 'proposed' | 'under_review' | 'planned' | 'in_development' | 'in_testing' | 'released' | 'rejected';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  vote_count: number;
  comment_count: number;
  community_interest_score: number;
  estimated_effort_weeks?: number;
  estimated_release_quarter?: string;
  technical_complexity: 'low' | 'medium' | 'high' | 'very_high';
  requires_aboriginal_advisor_review: boolean;
  organization_sponsors: string[];
  potential_revenue_impact: number;
  community_value_impact: number;
  proposed_by: {
    id: string;
    name: string;
    role: string;
  };
  proposed_by_organization?: {
    id: string;
    name: string;
  };
  user_vote?: 'upvote' | 'downvote' | 'priority_high' | 'priority_medium' | 'priority_low' | null;
  created_at: string;
}

interface PlatformRoadmapProps {
  userRole: 'storyteller' | 'organization_admin' | 'platform_admin' | 'community_member';
  organizationId?: string;
}

export default function PlatformRoadmap({ userRole, organizationId }: PlatformRoadmapProps) {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'proposed' | 'planned' | 'in_development' | 'released'>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showProposeModal, setShowProposeModal] = useState(false);

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      // Mock data - in production this would be API calls
      const mockRoadmapItems: RoadmapItem[] = [
        {
          id: 'roadmap-1',
          feature_title: 'Advanced AI Story Theme Analysis with Cultural Sensitivity',
          feature_description: 'Enhanced AI analysis that can identify professional themes, cultural context, and collaboration opportunities while respecting Aboriginal protocols and community values.',
          feature_category: 'analytics',
          status: 'in_development',
          priority_level: 'high',
          vote_count: 47,
          comment_count: 12,
          community_interest_score: 8.9,
          estimated_effort_weeks: 6,
          estimated_release_quarter: 'Q2 2024',
          technical_complexity: 'high',
          requires_aboriginal_advisor_review: true,
          organization_sponsors: ['Justice AI Collective', 'FNIGC'],
          potential_revenue_impact: 25000,
          community_value_impact: 9.2,
          proposed_by: {
            id: 'user-1',
            name: 'Dr. Sarah Mitchell',
            role: 'Cultural Competency Advisor'
          },
          proposed_by_organization: {
            id: 'org-1',
            name: 'Justice AI Collective'
          },
          user_vote: 'upvote',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'roadmap-2',
          feature_title: 'Mobile App with Offline Story Reading',
          feature_description: 'Native iOS and Android app that allows storytellers and readers to access content offline, with full cultural protocol integration and community messaging.',
          feature_category: 'mobile',
          status: 'planned',
          priority_level: 'medium',
          vote_count: 34,
          comment_count: 8,
          community_interest_score: 7.6,
          estimated_effort_weeks: 12,
          estimated_release_quarter: 'Q3 2024',
          technical_complexity: 'very_high',
          requires_aboriginal_advisor_review: true,
          organization_sponsors: ['BEAM Collective'],
          potential_revenue_impact: 45000,
          community_value_impact: 8.1,
          proposed_by: {
            id: 'user-2',
            name: 'Marcus Rodriguez',
            role: 'Community Organizer'
          },
          user_vote: 'priority_high',
          created_at: '2024-01-10T14:30:00Z'
        },
        {
          id: 'roadmap-3',
          feature_title: 'Storyteller Revenue Analytics Dashboard',
          feature_description: 'Comprehensive analytics showing revenue streams, subscription conversions, professional inquiries, and community impact metrics for storytellers.',
          feature_category: 'analytics',
          status: 'proposed',
          priority_level: 'high',
          vote_count: 28,
          comment_count: 6,
          community_interest_score: 8.3,
          estimated_effort_weeks: 4,
          estimated_release_quarter: 'Q2 2024',
          technical_complexity: 'medium',
          requires_aboriginal_advisor_review: false,
          organization_sponsors: ['Cultural Survival'],
          potential_revenue_impact: 15000,
          community_value_impact: 7.8,
          proposed_by: {
            id: 'user-3',
            name: 'Ben Knight',
            role: 'Platform Developer'
          },
          user_vote: null,
          created_at: '2024-01-20T09:15:00Z'
        },
        {
          id: 'roadmap-4',
          feature_title: 'Community Project Collaboration Tools',
          feature_description: 'Enhanced tools for collective projects including real-time collaboration, document sharing, cultural protocol checklists, and community governance features.',
          feature_category: 'community',
          status: 'under_review',
          priority_level: 'medium',
          vote_count: 19,
          comment_count: 4,
          community_interest_score: 6.9,
          estimated_effort_weeks: 8,
          estimated_release_quarter: 'Q3 2024',
          technical_complexity: 'high',
          requires_aboriginal_advisor_review: true,
          organization_sponsors: [],
          potential_revenue_impact: 12000,
          community_value_impact: 9.5,
          proposed_by: {
            id: 'user-4',
            name: 'Elder Mary Wilson',
            role: 'Aboriginal Advisory Council'
          },
          user_vote: 'priority_medium',
          created_at: '2024-01-18T16:45:00Z'
        },
        {
          id: 'roadmap-5',
          feature_title: 'White-label Platform Solutions for Organizations',
          feature_description: 'Allow organizations to deploy their own branded version of the platform while maintaining connection to the community network and cultural protocols.',
          feature_category: 'organization',
          status: 'proposed',
          priority_level: 'low',
          vote_count: 15,
          comment_count: 3,
          community_interest_score: 5.2,
          estimated_effort_weeks: 16,
          estimated_release_quarter: 'Q4 2024',
          technical_complexity: 'very_high',
          requires_aboriginal_advisor_review: true,
          organization_sponsors: ['Justice AI Collective', 'Healthcare Innovation Lab'],
          potential_revenue_impact: 75000,
          community_value_impact: 6.8,
          proposed_by: {
            id: 'user-5',
            name: 'Alex Chen',
            role: 'Organization Admin'
          },
          proposed_by_organization: {
            id: 'org-2',
            name: 'Healthcare Innovation Lab'
          },
          user_vote: null,
          created_at: '2024-01-22T11:20:00Z'
        }
      ];

      setRoadmapItems(mockRoadmapItems);
    } catch (error) {
      console.error('Failed to fetch roadmap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (itemId: string, voteType: 'upvote' | 'downvote' | 'priority_high' | 'priority_medium' | 'priority_low') => {
    try {
      setRoadmapItems(prev => 
        prev.map(item => {
          if (item.id === itemId) {
            const isNewVote = item.user_vote !== voteType;
            const voteChange = isNewVote ? (voteType === 'upvote' ? 1 : voteType === 'downvote' ? -1 : 1) : 0;
            
            return {
              ...item,
              vote_count: Math.max(0, item.vote_count + voteChange),
              user_vote: isNewVote ? voteType : null
            };
          }
          return item;
        })
      );
      
      // In production, this would call the API
      console.log(`Voted ${voteType} on roadmap item ${itemId}`);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposed: { color: 'blue', text: '💡 Proposed', bg: 'bg-blue-100', text_color: 'text-blue-800' },
      under_review: { color: 'yellow', text: '👀 Under Review', bg: 'bg-yellow-100', text_color: 'text-yellow-800' },
      planned: { color: 'purple', text: '📅 Planned', bg: 'bg-purple-100', text_color: 'text-purple-800' },
      in_development: { color: 'orange', text: '🔨 In Development', bg: 'bg-orange-100', text_color: 'text-orange-800' },
      in_testing: { color: 'indigo', text: '🧪 In Testing', bg: 'bg-indigo-100', text_color: 'text-indigo-800' },
      released: { color: 'green', text: '✅ Released', bg: 'bg-green-100', text_color: 'text-green-800' },
      rejected: { color: 'red', text: '❌ Rejected', bg: 'bg-red-100', text_color: 'text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text_color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { bg: 'bg-gray-100', text_color: 'text-gray-800', text: 'Low' },
      medium: { bg: 'bg-blue-100', text_color: 'text-blue-800', text: 'Medium' },
      high: { bg: 'bg-orange-100', text_color: 'text-orange-800', text: 'High' },
      critical: { bg: 'bg-red-100', text_color: 'text-red-800', text: 'Critical' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text_color}`}>
        {config.text}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      core: '🏗️',
      analytics: '📊',
      community: '🤝',
      storytelling: '📖',
      organization: '🏢',
      mobile: '📱',
      cultural: '🏛️'
    };
    return icons[category as keyof typeof icons] || '🔧';
  };

  const filteredItems = roadmapItems.filter(item => {
    const statusMatch = activeFilter === 'all' || item.status === activeFilter;
    const categoryMatch = activeCategoryFilter === 'all' || item.feature_category === activeCategoryFilter;
    return statusMatch && categoryMatch;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Platform Roadmap & Community Voting</h1>
            <p className="text-purple-100">
              Community-driven development with Aboriginal advisor oversight and cultural protocol integration
            </p>
          </div>
          <Button 
            onClick={() => setShowProposeModal(true)}
            className="bg-white text-purple-600 hover:bg-gray-50"
          >
            💡 Propose Feature
          </Button>
        </div>
      </div>

      {/* Community Impact Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2">🏛️ Community-Driven Development</h3>
        <p className="text-orange-800 text-sm">
          All platform features are developed with community input and Aboriginal advisor oversight. 
          Your votes help prioritize development while ensuring cultural protocols and community values guide our roadmap.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'proposed', 'planned', 'in_development', 'released'].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'analytics', 'community', 'mobile', 'organization', 'cultural'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeCategoryFilter === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : `${getCategoryIcon(category)} ${category}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">{getCategoryIcon(item.feature_category)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{item.feature_title}</h3>
                  {getStatusBadge(item.status)}
                  {getPriorityBadge(item.priority_level)}
                  {item.requires_aboriginal_advisor_review && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      🏛️ Cultural Review Required
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{item.feature_description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>Proposed by {item.proposed_by.name}</span>
                  {item.proposed_by_organization && (
                    <span>• {item.proposed_by_organization.name}</span>
                  )}
                  <span>• {new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                {item.organization_sponsors.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Sponsored by: </span>
                    <span className="text-sm text-blue-600">{item.organization_sponsors.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="ml-6 flex flex-col items-end space-y-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{item.vote_count}</div>
                  <div className="text-xs text-gray-500">votes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{item.community_interest_score}</div>
                  <div className="text-xs text-gray-500">interest</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Development Estimate</h5>
                <p className="text-sm text-gray-600">
                  {item.estimated_effort_weeks} weeks • {item.estimated_release_quarter}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {item.technical_complexity} complexity
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Impact Potential</h5>
                <p className="text-sm text-gray-600">
                  Revenue: ${item.potential_revenue_impact.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Community Value: {item.community_value_impact}/10
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Community Engagement</h5>
                <p className="text-sm text-gray-600">
                  {item.comment_count} comments
                </p>
                <p className="text-sm text-gray-600">
                  Interest Score: {item.community_interest_score}/10
                </p>
              </div>
            </div>

            {/* Voting Buttons */}
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <Button
                size="sm"
                variant={item.user_vote === 'upvote' ? 'primary' : 'outline'}
                onClick={() => handleVote(item.id, 'upvote')}
                className={item.user_vote === 'upvote' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                👍 Upvote
              </Button>
              <Button
                size="sm"
                variant={item.user_vote === 'priority_high' ? 'danger' : 'outline'}
                onClick={() => handleVote(item.id, 'priority_high')}
                className={item.user_vote === 'priority_high' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                🔥 High Priority
              </Button>
              <Button
                size="sm"
                variant={item.user_vote === 'priority_medium' ? 'secondary' : 'outline'}
                onClick={() => handleVote(item.id, 'priority_medium')}
                className={item.user_vote === 'priority_medium' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              >
                ⭐ Medium Priority
              </Button>
              <Button
                size="sm"
                variant="outline"
              >
                💬 Comment ({item.comment_count})
              </Button>
              {userRole === 'organization_admin' && organizationId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  🏢 Sponsor Feature
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Community Participation Guidelines */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🌱 Community Participation Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Voting Principles</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Consider community value alongside business impact</li>
              <li>• Prioritize features that respect cultural protocols</li>
              <li>• Support features that benefit storytellers and readers</li>
              <li>• Value Aboriginal advisor input and cultural review processes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Development Process</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All features undergo community review and voting</li>
              <li>• Aboriginal advisor review for culturally significant features</li>
              <li>• Transparent development timeline and progress updates</li>
              <li>• Community feedback integration throughout development</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}