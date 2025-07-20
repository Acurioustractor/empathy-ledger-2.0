'use client';

import React, { useState, useEffect } from 'react';
import { 
  getStoryAnalytics, 
  getCommunityInsights, 
  getSiteMetrics,
  mockStories,
  mockInsights,
  mockSiteMetrics,
  type CommunityInsight,
  type SiteMetric 
} from '@/lib/supabase-cms';
import MediaDisplay from '@/components/ui/MediaDisplay';
import { placeholderImages, placeholderBlurDataURLs } from '@/lib/supabase-media';

interface StoryAnalytics {
  total_stories: number;
  stories_by_category: Record<string, number>;
  monthly_growth: number;
  sentiment_distribution: Record<string, number>;
}

export default function CMSDashboard() {
  const [analytics, setAnalytics] = useState<StoryAnalytics | null>(null);
  const [insights, setInsights] = useState<CommunityInsight[]>([]);
  const [metrics, setMetrics] = useState<SiteMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // For now, use mock data - in production this would fetch from Supabase
        const analyticsData = await getStoryAnalytics();
        setAnalytics(analyticsData);
        setInsights(mockInsights);
        setMetrics(mockSiteMetrics);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data
        setAnalytics({
          total_stories: 1847,
          stories_by_category: {
            healthcare: 423,
            education: 312,
            housing: 267,
            'youth': 245,
            'elder-care': 189,
            policy: 411
          },
          monthly_growth: 89,
          sentiment_distribution: {
            positive: 0.65,
            neutral: 0.25,
            negative: 0.10
          }
        });
        setInsights(mockInsights);
        setMetrics(mockSiteMetrics);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatMetricValue = (metric: SiteMetric): string => {
    if (metric.display_format === 'currency') {
      return `$${(Number(metric.metric_value) / 1000000).toFixed(1)}M`;
    }
    if (metric.display_format === 'percentage') {
      return `${metric.metric_value}%`;
    }
    return metric.metric_value.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-500 font-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Elegant Introduction */}
      <section className="hero-spacing bg-gray-50">
        <div className="hero-container text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 content-spacing tracking-tight leading-[0.9]">
            Empathy Ledger
            <br />
            <span className="text-gray-500">CMS Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Real-time insights from community storytelling across Australia
          </p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <h2 className="text-3xl font-extralight text-gray-900 mb-12 text-center">
            Platform Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-white border border-gray-100 rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="text-5xl font-extralight text-gray-900 mb-3">
                  {formatMetricValue(metric)}
                </div>
                <div className="text-base text-gray-500 font-light">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Analytics */}
      {analytics && (
        <section className="section-spacing bg-gray-50">
          <div className="max-w-7xl mx-auto px-8 md:px-12">
            <h2 className="text-3xl font-extralight text-gray-900 mb-12 text-center">
              Story Analytics
            </h2>
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Stories by Category */}
              <div className="bg-white rounded-3xl p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-8">
                  Stories by Category
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.stories_by_category).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-gray-700 font-light capitalize">
                        {category.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(count / Math.max(...Object.values(analytics.stories_by_category))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 font-normal w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white rounded-3xl p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-8">
                  Community Sentiment
                </h3>
                <div className="space-y-6">
                  {Object.entries(analytics.sentiment_distribution).map(([sentiment, value]) => (
                    <div key={sentiment} className="flex justify-between items-center">
                      <span className="text-gray-700 font-light capitalize">
                        {sentiment}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              sentiment === 'positive' ? 'bg-green-500' :
                              sentiment === 'neutral' ? 'bg-gray-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${value * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 font-normal w-12 text-right">
                          {Math.round(value * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Community Insights */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <h2 className="text-3xl font-extralight text-gray-900 mb-12 text-center">
            Community Insights
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-normal text-gray-900 mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-light">
                      {insight.location} • {insight.story_count} stories • {insight.affected_population.toLocaleString()} people affected
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 font-light">Confidence</div>
                    <div className="text-lg font-normal text-gray-900">
                      {Math.round(insight.confidence_score * 100)}%
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 font-light mb-6 leading-relaxed">
                  {insight.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-base font-normal text-gray-900 mb-3">Key Findings</h4>
                  <ul className="space-y-2">
                    {insight.key_findings.slice(0, 3).map((finding, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600 font-light leading-relaxed">
                          {finding}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {insight.policy_impact && insight.policy_impact.length > 0 && (
                  <div className="bg-green-50 rounded-2xl p-4">
                    <h4 className="text-sm font-normal text-green-900 mb-2">Policy Impact</h4>
                    <div className="space-y-1">
                      {insight.policy_impact.map((impact, index) => (
                        <p key={index} className="text-sm text-green-700 font-light">
                          {impact}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Stories */}
      <section className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <h2 className="text-3xl font-extralight text-gray-900 mb-12 text-center">
            Featured Stories
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {mockStories.map((story) => (
              <div key={story.id} className="bg-white rounded-3xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm text-gray-500 font-light uppercase tracking-wide">
                    {story.category.replace('-', ' ')}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      story.sentiment_score && story.sentiment_score > 0.7 ? 'bg-green-500' :
                      story.sentiment_score && story.sentiment_score > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500 font-light">
                      {story.sentiment_score ? Math.round(story.sentiment_score * 100) : 0}% positive
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-normal text-gray-900 mb-4">
                  {story.title}
                </h3>

                <p className="text-gray-600 font-light mb-6 leading-relaxed">
                  {story.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {story.themes.map((theme) => (
                    <span key={theme} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-light">
                      {theme}
                    </span>
                  ))}
                </div>

                {story.impact_metrics && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    {Object.entries(story.impact_metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-normal text-gray-900">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        <div className="text-xs text-gray-500 font-light">
                          {key.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Gallery Integration */}
      <section className="section-spacing">
        <div className="max-w-7xl mx-auto px-8 md:px-12">
          <h2 className="text-3xl font-extralight text-gray-900 mb-12 text-center">
            Story Visualization
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MediaDisplay
              src={placeholderImages.community}
              alt="Community storytelling session"
              aspectRatio="square"
              rounded="3xl"
              caption="Community workshops in action"
              blurDataURL={placeholderBlurDataURLs.community}
            />
            <MediaDisplay
              src={placeholderImages.impact}
              alt="Data visualization"
              aspectRatio="square"
              rounded="3xl"
              caption="Impact analysis dashboard"
              blurDataURL={placeholderBlurDataURLs.impact}
            />
            <MediaDisplay
              src={placeholderImages.team}
              alt="Team collaboration"
              aspectRatio="square"
              rounded="3xl"
              caption="Cross-community collaboration"
              blurDataURL={placeholderBlurDataURLs.team}
            />
          </div>
        </div>
      </section>
    </div>
  );
}