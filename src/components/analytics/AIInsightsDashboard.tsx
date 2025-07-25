'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import ProfessionalThemeAnalyzer from './ProfessionalThemeAnalyzer';

interface StorytellerIntelligence {
  id: string;
  core_expertise_areas: Array<{
    area: string;
    confidence: number;
    story_evidence: string[];
    professional_applications: string[];
  }>;
  collaboration_style: {
    approach: string;
    strengths: string[];
    ideal_partners: string[];
    communication_style: string;
  };
  cultural_competency_level: 'developing' | 'intermediate' | 'advanced' | 'expert';
  innovation_indicators: Array<{
    indicator: string;
    strength: number;
    examples: string[];
  }>;
  ideal_collaboration_profiles: Array<{
    profile_type: string;
    compatibility_score: number;
    collaboration_potential: string[];
  }>;
  professional_growth_trajectory: {
    current_stage: string;
    growth_indicators: string[];
    next_opportunities: string[];
    timeline_projection: string;
  };
  community_impact_potential: number;
  narrative_authenticity_score: number;
  professional_credibility_score: number;
  story_engagement_quality: number;
  aboriginal_protocol_adherence: number;
  community_centered_approach: number;
  cultural_sensitivity_indicators: string[];
  analysis_completeness: number;
  requires_human_review: boolean;
  last_analysis_date: string;
}

interface AIInsightsDashboardProps {
  storytellerId: string;
  stories: Array<{
    id: string;
    title: string;
    story_type: string;
    view_count: number;
    engagement_score: number;
  }>;
}

export default function AIInsightsDashboard({ storytellerId, stories }: AIInsightsDashboardProps) {
  const [intelligence, setIntelligence] = useState<StorytellerIntelligence | null>(null);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'expertise' | 'collaboration' | 'cultural' | 'stories'>('overview');

  useEffect(() => {
    fetchStorytellerIntelligence();
  }, [storytellerId]);

  const fetchStorytellerIntelligence = async () => {
    try {
      const response = await fetch(`/api/analytics/storyteller-intelligence/${storytellerId}`);
      if (response.ok) {
        const intelligenceData = await response.json();
        setIntelligence(intelligenceData);
      }
    } catch (error) {
      console.error('Failed to fetch storyteller intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCulturalCompetencyBadge = (level: string) => {
    const config = {
      developing: { color: 'yellow', icon: '🌱', text: 'Developing' },
      intermediate: { color: 'blue', icon: '🌿', text: 'Intermediate' },
      advanced: { color: 'green', icon: '🌳', text: 'Advanced' },
      expert: { color: 'purple', icon: '🏛️', text: 'Expert' }
    };
    
    const badge = config[level as keyof typeof config];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-${badge.color}-100 text-${badge.color}-800`}>
        <span className="mr-2">{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const renderScoreBar = (score: number, label: string, color: string = 'blue') => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{Math.round(score * 100)}%</span>
      </div>
      <div className={`w-full bg-${color}-200 rounded-full h-2`}>
        <div 
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`} 
          style={{ width: `${score * 100}%` }}
        ></div>
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

  if (!intelligence) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
        <div className="text-gray-500 mb-4">
          <div className="text-4xl mb-2">🧠</div>
          <h3 className="text-lg font-medium">AI Intelligence Analysis Not Available</h3>
          <p className="text-sm">Publish stories to generate professional intelligence insights</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          📝 Create Your First Story
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">AI-Powered Professional Intelligence</h1>
            <p className="text-blue-100">
              Advanced analytics with Aboriginal advisor cultural oversight
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {Math.round(intelligence.analysis_completeness * 100)}%
            </div>
            <div className="text-sm text-blue-100">Analysis Complete</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '📊 Overview', count: '' },
            { key: 'expertise', label: '🎯 Expertise', count: intelligence.core_expertise_areas.length },
            { key: 'collaboration', label: '🤝 Collaboration', count: intelligence.ideal_collaboration_profiles.length },
            { key: 'cultural', label: '🌏 Cultural', count: intelligence.cultural_sensitivity_indicators.length },
            { key: 'stories', label: '📖 Story Analysis', count: stories.length }
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
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Professional Scores */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Credibility Metrics</h3>
            {renderScoreBar(intelligence.narrative_authenticity_score, 'Narrative Authenticity', 'green')}
            {renderScoreBar(intelligence.professional_credibility_score, 'Professional Credibility', 'blue')}
            {renderScoreBar(intelligence.story_engagement_quality, 'Story Engagement Quality', 'purple')}
            {renderScoreBar(intelligence.community_impact_potential, 'Community Impact Potential', 'orange')}
          </div>

          {/* Cultural Integration */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Integration Assessment</h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Cultural Competency Level</span>
                {getCulturalCompetencyBadge(intelligence.cultural_competency_level)}
              </div>
            </div>
            {renderScoreBar(intelligence.aboriginal_protocol_adherence, 'Aboriginal Protocol Adherence', 'orange')}
            {renderScoreBar(intelligence.community_centered_approach, 'Community-Centered Approach', 'green')}
          </div>

          {/* Professional Growth Trajectory */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Growth Trajectory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Stage</h4>
                <p className="text-gray-600 text-sm">{intelligence.professional_growth_trajectory.current_stage}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Growth Indicators</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {intelligence.professional_growth_trajectory.growth_indicators.slice(0, 3).map((indicator, index) => (
                    <li key={index}>• {indicator}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Next Opportunities</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {intelligence.professional_growth_trajectory.next_opportunities.slice(0, 3).map((opportunity, index) => (
                    <li key={index}>• {opportunity}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expertise' && (
        <div className="space-y-6">
          {intelligence.core_expertise_areas.map((area, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{area.area}</h3>
                <div className="flex items-center">
                  <div className="w-24 bg-blue-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${area.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    {Math.round(area.confidence * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Story Evidence</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {area.story_evidence.map((evidence, i) => (
                      <li key={i}>• {evidence}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Professional Applications</h4>
                  <div className="flex flex-wrap gap-2">
                    {area.professional_applications.map((app, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          {/* Collaboration Style */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaboration Style Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Approach</h4>
                <p className="text-gray-600 text-sm mb-4">{intelligence.collaboration_style.approach}</p>
                
                <h4 className="font-medium text-gray-900 mb-2">Key Strengths</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {intelligence.collaboration_style.strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
                <p className="text-gray-600 text-sm mb-4">{intelligence.collaboration_style.communication_style}</p>
                
                <h4 className="font-medium text-gray-900 mb-2">Ideal Partners</h4>
                <div className="flex flex-wrap gap-2">
                  {intelligence.collaboration_style.ideal_partners.map((partner, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {partner}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ideal Collaboration Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {intelligence.ideal_collaboration_profiles.map((profile, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{profile.profile_type}</h4>
                  <span className="text-sm text-purple-600 font-medium">
                    {Math.round(profile.compatibility_score * 100)}% match
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {profile.collaboration_potential.map((potential, i) => (
                    <li key={i}>• {potential}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cultural' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cultural Sensitivity Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intelligence.cultural_sensitivity_indicators.map((indicator, index) => (
                <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800">{indicator}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Innovation Indicators</h3>
            <div className="space-y-4">
              {intelligence.innovation_indicators.map((indicator, index) => (
                <div key={index} className="border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900">{indicator.indicator}</h4>
                    <span className="text-sm text-purple-600">
                      {Math.round(indicator.strength * 100)}% strength
                    </span>
                  </div>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {indicator.examples.map((example, i) => (
                      <li key={i}>• {example}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="space-y-6">
          {/* Story Selection */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Story for AI Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedStory === story.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900 mb-2">{story.title}</h4>
                  <div className="text-sm text-gray-600">
                    <p>{story.story_type} • {story.view_count} views</p>
                    <p>Engagement: {Math.round(story.engagement_score * 100)}%</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Analyzer */}
          {selectedStory && (
            <ProfessionalThemeAnalyzer 
              storyId={selectedStory}
              storytellerId={storytellerId}
            />
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-center space-x-4 py-6 border-t border-gray-200">
        <Button variant="outline">
          📊 Export Intelligence Report
        </Button>
        <Button variant="outline">
          🏛️ Request Aboriginal Advisor Review
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          🔄 Refresh AI Analysis
        </Button>
      </div>
    </div>
  );
}