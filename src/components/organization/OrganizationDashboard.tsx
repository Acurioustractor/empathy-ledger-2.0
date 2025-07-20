'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getInsightsSummary, 
  generateOrganizationInsights,
  type OrganizationInsights 
} from '@/lib/organization-insights';
import { getCurrentSession } from '@/lib/supabase-auth';

interface OrganizationDashboardProps {
  organizationId: string;
}

export default function OrganizationDashboard({ organizationId }: OrganizationDashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [fullInsights, setFullInsights] = useState<OrganizationInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'summary' | 'stories' | 'community' | 'impact' | 'insights'>('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [organizationId]);

  const loadDashboardData = async () => {
    try {
      const session = await getCurrentSession();
      if (!session.user) return;
      
      setUser(session.user);
      
      // Load insights summary
      const { summary: insightsSummary, error } = await getInsightsSummary(organizationId, session.user.id);
      if (!error && insightsSummary) {
        setSummary(insightsSummary);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFullInsights = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(); // Last 90 days
      
      const { insights, error } = await generateOrganizationInsights(
        organizationId,
        startDate,
        endDate,
        user.id
      );
      
      if (error) throw error;
      
      setFullInsights(insights);
      setActiveView('insights');
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-3xl animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-500 font-light">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extralight text-gray-900 mb-4">
            Please sign in to access organization dashboard
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
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-2">
                Organization Dashboard
              </h1>
              <p className="text-xl text-gray-600 font-light mb-4">
                Comprehensive insights into your community's impact and value creation
              </p>
              {summary && (
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-extralight text-gray-900">{summary.key_metrics.total_stories}</div>
                    <div className="text-sm text-gray-500 font-light">Stories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extralight text-gray-900">{summary.key_metrics.active_members}</div>
                    <div className="text-sm text-gray-500 font-light">Active Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extralight text-gray-900">
                      ${Math.round(summary.key_metrics.value_created).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 font-light">Value Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extralight text-gray-900">
                      {Math.round(summary.key_metrics.sentiment * 100)}%
                    </div>
                    <div className="text-sm text-gray-500 font-light">Positive Sentiment</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={generateFullInsights}
                disabled={isGenerating}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300 hover:scale-[1.02]"
              >
                {isGenerating ? 'Generating...' : 'Generate Full Report'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="border-b border-gray-100">
        <div className="content-container">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'summary', label: 'Summary' },
              { id: 'stories', label: 'Story Analytics' },
              { id: 'community', label: 'Community Health' },
              { id: 'impact', label: 'Impact Metrics' },
              { id: 'insights', label: 'Deep Insights' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-light smooth-transition ${
                  activeView === tab.id
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
          {activeView === 'summary' && summary && (
            <div className="space-y-8">
              {/* Key Highlights */}
              <div>
                <h2 className="text-2xl font-extralight text-gray-900 mb-6">Recent Highlights</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {summary.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover-lift">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-light text-gray-900">{highlight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Themes */}
              <div>
                <h2 className="text-2xl font-extralight text-gray-900 mb-6">Most Discussed Themes</h2>
                <div className="bg-white border border-gray-200 rounded-3xl p-8">
                  <div className="space-y-4">
                    {summary.top_themes.map((theme: any, index: number) => (
                      <div key={theme.theme} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-light text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-normal text-gray-900 capitalize">{theme.theme}</h3>
                            <p className="text-sm text-gray-600 font-light">
                              {theme.story_count} stories • Urgency: {Math.round(theme.urgency_score * 100)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-light ${
                            theme.growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {theme.growth_rate > 0 ? '+' : ''}{Math.round(theme.growth_rate * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">growth</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Urgent Issues */}
              {summary.urgent_issues && summary.urgent_issues.length > 0 && (
                <div>
                  <h2 className="text-2xl font-extralight text-gray-900 mb-6">Issues Requiring Attention</h2>
                  <div className="space-y-4">
                    {summary.urgent_issues.map((issue: any, index: number) => (
                      <div key={issue.theme} className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-normal text-amber-900 mb-2 capitalize">{issue.theme}</h3>
                            <p className="text-sm text-amber-800 font-light">
                              {issue.story_count} stories with concerning sentiment
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-extralight text-amber-900">
                              {Math.round(issue.urgency_score * 100)}%
                            </div>
                            <div className="text-xs text-amber-700">urgency</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'stories' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-extralight text-gray-900 mb-4">Story Analytics</h2>
              <p className="text-gray-600 font-light mb-6">
                Detailed story analytics coming soon. Generate a full report to see comprehensive story metrics.
              </p>
              <button
                onClick={generateFullInsights}
                disabled={isGenerating}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300"
              >
                {isGenerating ? 'Generating...' : 'Generate Full Report'}
              </button>
            </div>
          )}

          {activeView === 'community' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-extralight text-gray-900 mb-4">Community Health</h2>
              <p className="text-gray-600 font-light mb-6">
                Community health metrics coming soon. Generate a full report to see engagement and retention data.
              </p>
              <button
                onClick={generateFullInsights}
                disabled={isGenerating}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300"
              >
                {isGenerating ? 'Generating...' : 'Generate Full Report'}
              </button>
            </div>
          )}

          {activeView === 'impact' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-extralight text-gray-900 mb-4">Impact Metrics</h2>
              <p className="text-gray-600 font-light mb-6">
                Impact and value creation metrics coming soon. Generate a full report to see detailed impact analysis.
              </p>
              <button
                onClick={generateFullInsights}
                disabled={isGenerating}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300"
              >
                {isGenerating ? 'Generating...' : 'Generate Full Report'}
              </button>
            </div>
          )}

          {activeView === 'insights' && fullInsights && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extralight text-gray-900 mb-4">Comprehensive Insights Report</h2>
                <p className="text-gray-600 font-light">
                  Generated on {new Date(fullInsights.generated_at).toLocaleDateString()}
                </p>
              </div>

              {/* Story Metrics */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-6">Story Analytics</h3>
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.story_metrics.total_stories}</div>
                    <div className="text-sm text-gray-500 font-light">Total Stories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.story_metrics.media_distribution.withAudio}</div>
                    <div className="text-sm text-gray-500 font-light">With Audio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.story_metrics.media_distribution.withVideo}</div>
                    <div className="text-sm text-gray-500 font-light">With Video</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.story_metrics.media_distribution.withImages}</div>
                    <div className="text-sm text-gray-500 font-light">With Images</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">Stories by Category</h4>
                    <div className="space-y-2">
                      {Object.entries(fullInsights.story_metrics.stories_by_category).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 font-light capitalize">{category}</span>
                          <span className="text-sm font-normal text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">Privacy Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(fullInsights.story_metrics.stories_by_privacy_level).map(([level, count]) => (
                        <div key={level} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 font-light capitalize">{level}</span>
                          <span className="text-sm font-normal text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-6">Impact & Engagement</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.impact_metrics.total_views.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 font-light">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.impact_metrics.total_reactions.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 font-light">Reactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.impact_metrics.stories_cited_in_research}</div>
                    <div className="text-sm text-gray-500 font-light">Research Citations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">{fullInsights.policy_influence.policies_influenced}</div>
                    <div className="text-sm text-gray-500 font-light">Policies Influenced</div>
                  </div>
                </div>
              </div>

              {/* Value Creation */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-6">Value Creation & Distribution</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">
                      ${Math.round(fullInsights.value_creation.total_value_created).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 font-light">Total Value Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">
                      ${Math.round(fullInsights.value_creation.value_distributed_to_storytellers).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 font-light">Distributed to Storytellers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-900">
                      ${Math.round(fullInsights.value_creation.average_compensation_per_story)}
                    </div>
                    <div className="text-sm text-gray-500 font-light">Average per Story</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-normal text-gray-900 mb-3">Value Sources</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(fullInsights.value_creation.value_by_source).map(([source, amount]) => (
                      <div key={source} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-600 font-light capitalize">{source.replace('_', ' ')}</span>
                        <span className="text-sm font-normal text-gray-900">${Math.round(amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-6">Community Sentiment</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-green-600">
                      {Math.round(fullInsights.sentiment_analysis.sentiment_distribution.positive * 100)}%
                    </div>
                    <div className="text-sm text-gray-500 font-light">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-gray-500">
                      {Math.round(fullInsights.sentiment_analysis.sentiment_distribution.neutral * 100)}%
                    </div>
                    <div className="text-sm text-gray-500 font-light">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extralight text-red-600">
                      {Math.round(fullInsights.sentiment_analysis.sentiment_distribution.negative * 100)}%
                    </div>
                    <div className="text-sm text-gray-500 font-light">Negative</div>
                  </div>
                </div>

                {fullInsights.sentiment_analysis.critical_issues.length > 0 && (
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">Critical Issues</h4>
                    <div className="space-y-3">
                      {fullInsights.sentiment_analysis.critical_issues.map((issue) => (
                        <div key={issue.theme} className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-normal text-red-900 capitalize">{issue.theme}</h5>
                              <p className="text-sm text-red-700 font-light">{issue.story_count} stories</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-extralight text-red-900">
                                {Math.round(issue.urgency_score * 100)}%
                              </div>
                              <div className="text-xs text-red-700">urgency</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'insights' && !fullInsights && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-extralight text-gray-900 mb-4">Generate Comprehensive Insights</h2>
              <p className="text-gray-600 font-light mb-6">
                Click the button above to generate a detailed insights report with analytics, sentiment analysis, and value creation metrics.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}