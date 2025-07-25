'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface Collaboration {
  id: string;
  collaboration_type: 'mentorship' | 'peer_collaboration' | 'collective_project' | 'referral_partnership' | 'cultural_exchange';
  collaboration_status: 'proposed' | 'active' | 'completed' | 'declined' | 'on_hold';
  project_title: string;
  project_description: string;
  collaborator: {
    id: string;
    name: string;
    profile_image_url?: string;
    expertise_areas: string[];
    cultural_competency_level: string;
  };
  timeline_start: string;
  timeline_end: string;
  cultural_protocols_agreed: boolean;
  revenue_sharing_model: {
    model_type: string;
    initiator_percentage: number;
    collaborator_percentage: number;
    community_contribution: number;
  };
  community_impact_score: number;
}

interface CrossPollinationConnection {
  id: string;
  connection_type: 'complementary_expertise' | 'similar_themes' | 'cultural_bridge' | 'professional_synergy' | 'community_impact_potential';
  ai_match_score: number;
  storyteller: {
    id: string;
    name: string;
    profile_image_url?: string;
    expertise_areas: string[];
    story_count: number;
  };
  shared_themes: string[];
  collaboration_opportunities: string[];
  cultural_learning_potential: string[];
  connection_status: string;
}

interface StorytellerCollaborationHubProps {
  storytellerId: string;
  onCollaborationCreate?: (collaboration: any) => void;
}

export default function StorytellerCollaborationHub({ 
  storytellerId, 
  onCollaborationCreate 
}: StorytellerCollaborationHubProps) {
  const [activeTab, setActiveTab] = useState<'collaborations' | 'connections' | 'mentorship' | 'referrals' | 'projects'>('collaborations');
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [connections, setConnections] = useState<CrossPollinationConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCollaborationData();
  }, [storytellerId]);

  const fetchCollaborationData = async () => {
    try {
      // In production, these would be real API calls
      const mockCollaborations: Collaboration[] = [
        {
          id: 'collab-1',
          collaboration_type: 'peer_collaboration',
          collaboration_status: 'active',
          project_title: 'Community Platform Development Best Practices',
          project_description: 'Collaborative documentation of ethical technology development approaches incorporating Aboriginal protocols.',
          collaborator: {
            id: 'storyteller-2',
            name: 'Sarah Chen',
            profile_image_url: undefined,
            expertise_areas: ['Community Development', 'Technology Ethics', 'Social Enterprise'],
            cultural_competency_level: 'intermediate'
          },
          timeline_start: '2024-01-15',
          timeline_end: '2024-03-15',
          cultural_protocols_agreed: true,
          revenue_sharing_model: {
            model_type: 'equal_split',
            initiator_percentage: 45,
            collaborator_percentage: 45,
            community_contribution: 10
          },
          community_impact_score: 0.87
        },
        {
          id: 'collab-2',
          collaboration_type: 'mentorship',
          collaboration_status: 'active',
          project_title: 'Aboriginal Protocol Integration Mentorship',
          project_description: 'Mentoring emerging technology developers in meaningful Aboriginal community engagement.',
          collaborator: {
            id: 'mentee-1',
            name: 'David Rodriguez',
            profile_image_url: undefined,
            expertise_areas: ['Web Development', 'Startup Development'],
            cultural_competency_level: 'developing'
          },
          timeline_start: '2024-01-01',
          timeline_end: '2024-06-01',
          cultural_protocols_agreed: true,
          revenue_sharing_model: {
            model_type: 'mentor_focused',
            initiator_percentage: 70,
            collaborator_percentage: 25,
            community_contribution: 5
          },
          community_impact_score: 0.92
        }
      ];

      const mockConnections: CrossPollinationConnection[] = [
        {
          id: 'connection-1',
          connection_type: 'complementary_expertise',
          ai_match_score: 0.94,
          storyteller: {
            id: 'storyteller-3',
            name: 'Dr. Amara Okafor',
            profile_image_url: undefined,
            expertise_areas: ['Healthcare Innovation', 'Community Health', 'Cultural Competency'],
            story_count: 8
          },
          shared_themes: ['Community-Centered Approach', 'Cultural Competency', 'Aboriginal Protocol Integration'],
          collaboration_opportunities: [
            'Health technology platform development with Aboriginal community oversight',
            'Cultural competency training for healthcare technology',
            'Community health storytelling initiative'
          ],
          cultural_learning_potential: [
            'Healthcare-specific Aboriginal protocol integration',
            'Community health engagement methodologies',
            'Cultural sensitivity in health technology design'
          ],
          connection_status: 'suggested'
        },
        {
          id: 'connection-2',
          connection_type: 'professional_synergy',
          ai_match_score: 0.89,
          storyteller: {
            id: 'storyteller-4',
            name: 'Marcus Thompson',
            profile_image_url: undefined,
            expertise_areas: ['Environmental Justice', 'Community Organizing', 'Policy Development'],
            story_count: 12
          },
          shared_themes: ['Community Organizing', 'Economic Justice', 'Aboriginal Wisdom'],
          collaboration_opportunities: [
            'Environmental justice platform development',
            'Community organizing methodology sharing',
            'Policy advocacy through storytelling'
          ],
          cultural_learning_potential: [
            'Environmental justice and Aboriginal land rights intersection',
            'Community organizing with cultural protocol integration',
            'Policy development with Indigenous wisdom inclusion'
          ],
          connection_status: 'suggested'
        }
      ];

      setCollaborations(mockCollaborations);
      setConnections(mockConnections);
    } catch (error) {
      console.error('Failed to fetch collaboration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCollaborationTypeIcon = (type: string) => {
    const icons = {
      mentorship: '🎓',
      peer_collaboration: '🤝',
      collective_project: '👥',
      referral_partnership: '🔄',
      cultural_exchange: '🌏'
    };
    return icons[type as keyof typeof icons] || '🤝';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      proposed: { color: 'yellow', text: 'Proposed' },
      active: { color: 'green', text: 'Active' },
      completed: { color: 'blue', text: 'Completed' },
      declined: { color: 'red', text: 'Declined' },
      on_hold: { color: 'gray', text: 'On Hold' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  const handleConnectionAction = async (connectionId: string, action: 'connect' | 'decline') => {
    try {
      // In production, this would call the API
      console.log(`${action} connection ${connectionId}`);
      
      if (action === 'connect') {
        setConnections(prev => 
          prev.map(conn => 
            conn.id === connectionId 
              ? { ...conn, connection_status: 'introduced' }
              : conn
          )
        );
      }
    } catch (error) {
      console.error(`Failed to ${action} connection:`, error);
    }
  };

  const renderCollaborationsTab = () => (
    <div className="space-y-6">
      {/* Active Collaborations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Active Collaborations</h3>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Start New Collaboration
          </Button>
        </div>
        
        <div className="space-y-4">
          {collaborations.map((collaboration) => (
            <div key={collaboration.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCollaborationTypeIcon(collaboration.collaboration_type)}</span>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{collaboration.project_title}</h4>
                    <p className="text-sm text-gray-600">
                      with {collaboration.collaborator.name} • 
                      {collaboration.collaboration_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                {getStatusBadge(collaboration.collaboration_status)}
              </div>

              <p className="text-gray-700 mb-4">{collaboration.project_description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Timeline</h5>
                  <p className="text-sm text-gray-600">
                    {new Date(collaboration.timeline_start).toLocaleDateString()} - 
                    {new Date(collaboration.timeline_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Revenue Sharing</h5>
                  <p className="text-sm text-gray-600">
                    You: {collaboration.revenue_sharing_model.initiator_percentage}% • 
                    Partner: {collaboration.revenue_sharing_model.collaborator_percentage}% • 
                    Community: {collaboration.revenue_sharing_model.community_contribution}%
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Community Impact</h5>
                  <div className="flex items-center">
                    <div className="w-16 bg-green-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${collaboration.community_impact_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {Math.round(collaboration.community_impact_score * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {collaboration.cultural_protocols_agreed && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-sm text-green-800 font-medium">
                      Cultural protocols agreed and Aboriginal advisor oversight included
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  📞 Message Partner
                </Button>
                <Button variant="outline" size="sm">
                  📊 View Progress
                </Button>
                <Button variant="outline" size="sm">
                  🏛️ Cultural Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConnectionsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          AI-Suggested Cross-Pollination Connections
        </h3>
        <p className="text-gray-600 mb-6">
          Based on your stories and expertise, these storytellers could be valuable collaboration partners
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {connections.map((connection) => (
            <div key={connection.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {connection.storyteller.profile_image_url ? (
                      <img 
                        src={connection.storyteller.profile_image_url} 
                        alt={connection.storyteller.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {connection.storyteller.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{connection.storyteller.name}</h4>
                    <p className="text-sm text-gray-600">
                      {connection.storyteller.story_count} stories • 
                      {connection.connection_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(connection.ai_match_score * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">AI Match</div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Expertise Areas</h5>
                <div className="flex flex-wrap gap-1">
                  {connection.storyteller.expertise_areas.map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Shared Themes</h5>
                <div className="flex flex-wrap gap-1">
                  {connection.shared_themes.map((theme, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Collaboration Opportunities</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {connection.collaboration_opportunities.slice(0, 2).map((opportunity, index) => (
                    <li key={index}>• {opportunity}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Cultural Learning Potential</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {connection.cultural_learning_potential.slice(0, 2).map((potential, index) => (
                    <li key={index}>• {potential}</li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleConnectionAction(connection.id, 'connect')}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  size="sm"
                >
                  🤝 Connect
                </Button>
                <Button 
                  onClick={() => handleConnectionAction(connection.id, 'decline')}
                  variant="outline" 
                  size="sm"
                >
                  ❌ Pass
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Storyteller Collaboration Hub</h1>
        <p className="text-green-100">
          Connect, collaborate, and create community value through meaningful partnerships
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'collaborations', label: '🤝 Active Collaborations', count: collaborations.length },
            { key: 'connections', label: '🔗 AI Connections', count: connections.length },
            { key: 'mentorship', label: '🎓 Mentorship', count: '2' },
            { key: 'referrals', label: '🔄 Referral Network', count: '5' },
            { key: 'projects', label: '👥 Collective Projects', count: '3' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'collaborations' && renderCollaborationsTab()}
      {activeTab === 'connections' && renderConnectionsTab()}
      {activeTab === 'mentorship' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mentorship Programs</h3>
          <p className="text-gray-600">Coming in Sprint 3 Week 2 full implementation</p>
        </div>
      )}
      {activeTab === 'referrals' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Professional Referral Network</h3>
          <p className="text-gray-600">Coming in Sprint 3 Week 2 full implementation</p>
        </div>
      )}
      {activeTab === 'projects' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Collective Community Projects</h3>
          <p className="text-gray-600">Coming in Sprint 3 Week 2 full implementation</p>
        </div>
      )}

      {/* Revenue and Community Impact Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🌱 Community Value Generated Through Collaboration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">$2,847</div>
            <div className="text-sm text-gray-600">Revenue Shared</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Professional Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">89%</div>
            <div className="text-sm text-gray-600">Cultural Protocol Adherence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">5</div>
            <div className="text-sm text-gray-600">Community Projects</div>
          </div>
        </div>
      </div>
    </div>
  );
}