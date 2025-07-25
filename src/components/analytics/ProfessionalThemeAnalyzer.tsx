'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface ThemeAnalysis {
  id: string;
  professional_themes: Array<{
    theme: string;
    confidence: number;
    professional_relevance: number;
    examples: string[];
  }>;
  skill_categories: Array<{
    category: string;
    skills: string[];
    proficiency_indicators: string[];
  }>;
  industry_relevance: Array<{
    industry: string;
    relevance_score: number;
    specific_applications: string[];
  }>;
  collaboration_indicators: Array<{
    indicator: string;
    strength: number;
    context: string;
  }>;
  cultural_competency_markers: Array<{
    marker: string;
    strength: number;
    cultural_context: string;
  }>;
  analysis_confidence: number;
  cultural_review_status: 'pending' | 'reviewed' | 'flagged' | 'approved';
  aboriginal_advisor_feedback?: {
    cultural_appropriateness: number;
    protocol_alignment: number;
    community_value: number;
    recommendations: string[];
  };
}

interface ProfessionalThemeAnalyzerProps {
  storyId: string;
  storytellerId: string;
  onAnalysisComplete?: (analysis: ThemeAnalysis) => void;
}

export default function ProfessionalThemeAnalyzer({
  storyId,
  storytellerId,
  onAnalysisComplete
}: ProfessionalThemeAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ThemeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAboriginalReview, setShowAboriginalReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExistingAnalysis();
  }, [storyId]);

  const fetchExistingAnalysis = async () => {
    try {
      const response = await fetch(`/api/analytics/theme-analysis/${storyId}`);
      if (response.ok) {
        const analysisData = await response.json();
        setAnalysis(analysisData);
        if (onAnalysisComplete) {
          onAnalysisComplete(analysisData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runThemeAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analytics/analyze-themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          storytellerId,
          includeAboriginalReview: true
        }),
      });

      const analysisData = await response.json();
      setAnalysis(analysisData);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      }
    } catch (error) {
      console.error('Failed to run theme analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCulturalReviewStatus = () => {
    if (!analysis) return null;
    
    const statusConfig = {
      pending: { color: 'yellow', icon: '⏳', text: 'Awaiting Aboriginal Advisor Review' },
      reviewed: { color: 'blue', icon: '👁️', text: 'Under Aboriginal Advisor Review' },
      flagged: { color: 'red', icon: '⚠️', text: 'Requires Cultural Modifications' },
      approved: { color: 'green', icon: '✅', text: 'Culturally Reviewed and Approved' }
    };

    const status = statusConfig[analysis.cultural_review_status];
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-${status.color}-100 text-${status.color}-800`}>
        <span className="mr-2">{status.icon}</span>
        {status.text}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Professional Theme Analysis</h2>
          <p className="text-gray-600 mt-1">
            Advanced analysis with Aboriginal advisor cultural oversight
          </p>
        </div>
        
        {!analysis && (
          <Button 
            onClick={runThemeAnalysis}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              '🧠 Run AI Analysis'
            )}
          </Button>
        )}
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Cultural Review Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Cultural Review Status</h3>
              <p className="text-sm text-gray-600">
                Aboriginal Advisory Council oversight ensures cultural appropriateness
              </p>
            </div>
            {getCulturalReviewStatus()}
          </div>

          {/* Aboriginal Advisor Feedback */}
          {analysis.aboriginal_advisor_feedback && (
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
                🏛️ Aboriginal Advisory Council Feedback
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    {Math.round(analysis.aboriginal_advisor_feedback.cultural_appropriateness * 100)}%
                  </div>
                  <div className="text-sm text-orange-700">Cultural Appropriateness</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    {Math.round(analysis.aboriginal_advisor_feedback.protocol_alignment * 100)}%
                  </div>
                  <div className="text-sm text-orange-700">Protocol Alignment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-800">
                    {Math.round(analysis.aboriginal_advisor_feedback.community_value * 100)}%
                  </div>
                  <div className="text-sm text-orange-700">Community Value</div>
                </div>
              </div>
              {analysis.aboriginal_advisor_feedback.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-900 mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside text-sm text-orange-800 space-y-1">
                    {analysis.aboriginal_advisor_feedback.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Analysis Confidence */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900">Analysis Confidence</h3>
              <div className="flex items-center">
                <div className="w-32 bg-blue-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${analysis.analysis_confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-800 font-medium">
                  {Math.round(analysis.analysis_confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Professional Themes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Professional Themes Identified
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.professional_themes.map((theme, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{theme.theme}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {Math.round(theme.confidence * 100)}% confidence
                      </span>
                      <span className="text-sm text-blue-600">
                        {Math.round(theme.professional_relevance * 100)}% relevance
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Examples from story:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {theme.examples.slice(0, 2).map((example, i) => (
                        <li key={i}>{example}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🛠️ Professional Skill Categories
            </h3>
            <div className="space-y-3">
              {analysis.skill_categories.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Evidence:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {category.proficiency_indicators.slice(0, 2).map((indicator, i) => (
                          <li key={i}>• {indicator}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Competency Markers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌏 Cultural Competency Indicators
            </h3>
            <div className="space-y-3">
              {analysis.cultural_competency_markers.map((marker, index) => (
                <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">{marker.marker}</h4>
                    <div className="flex items-center">
                      <div className="w-20 bg-green-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${marker.strength * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-green-800">
                        {Math.round(marker.strength * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">{marker.cultural_context}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration Indicators */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤝 Collaboration Potential Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.collaboration_indicators.map((indicator, index) => (
                <div key={index} className="border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900">{indicator.indicator}</h4>
                    <span className="text-sm text-purple-600">
                      {Math.round(indicator.strength * 100)}% strength
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">{indicator.context}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
            <Button 
              variant="outline"
              onClick={() => setShowAboriginalReview(true)}
            >
              🏛️ Request Aboriginal Advisor Review
            </Button>
            <Button 
              onClick={runThemeAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔄 Refresh Analysis
            </Button>
            <Button variant="outline">
              📊 View Full Intelligence Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}