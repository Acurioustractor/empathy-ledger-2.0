'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

interface ThemeData {
  name: string;
  category: string;
  count: number;
  percentage: number;
}

interface AnalyticsData {
  totalAnalyses: number;
  topThemes: ThemeData[];
  topEmotions: { emotion: string; count: number; percentage: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  qualityMetrics: {
    averageConfidence: number;
    highQualityCount: number;
  };
}

export default function ThemeAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  async function loadAnalyticsData() {
    try {
      // Get all story analyses
      const { data: analyses, error: analysesError } = await supabase
        .from('story_analysis')
        .select(`
          themes_identified,
          primary_emotions,
          confidence_score,
          quality_score,
          processing_status
        `)
        .eq('analysis_type', 'theme_extraction')
        .eq('processing_status', 'completed');

      if (analysesError) {
        throw analysesError;
      }

      // Get theme data for mapping
      const { data: themes, error: themesError } = await supabase
        .from('themes')
        .select('id, name, category')
        .eq('status', 'active');

      if (themesError) {
        throw themesError;
      }

      if (!analyses || !themes) {
        setData(null);
        return;
      }

      // Create theme lookup map
      const themeMap = new Map(themes.map(t => [t.id, { name: t.name, category: t.category }]));

      // Process data
      const themeFrequency = new Map<string, { name: string; category: string; count: number }>();
      const emotionFrequency = new Map<string, number>();
      const categoryFrequency = new Map<string, number>();
      
      let totalConfidence = 0;
      let highQualityCount = 0;
      let confidenceCount = 0;

      analyses.forEach(analysis => {
        // Process themes
        if (analysis.themes_identified) {
          analysis.themes_identified.forEach((themeId: string) => {
            const themeInfo = themeMap.get(themeId);
            if (themeInfo) {
              const existing = themeFrequency.get(themeId) || { ...themeInfo, count: 0 };
              existing.count += 1;
              themeFrequency.set(themeId, existing);

              // Count category
              const categoryCount = categoryFrequency.get(themeInfo.category) || 0;
              categoryFrequency.set(themeInfo.category, categoryCount + 1);
            }
          });
        }

        // Process emotions
        if (analysis.primary_emotions) {
          analysis.primary_emotions.forEach((emotion: string) => {
            const count = emotionFrequency.get(emotion) || 0;
            emotionFrequency.set(emotion, count + 1);
          });
        }

        // Process quality metrics
        if (analysis.confidence_score !== null) {
          totalConfidence += analysis.confidence_score;
          confidenceCount += 1;
          if (analysis.confidence_score > 0.8) {
            highQualityCount += 1;
          }
        }
      });

      // Convert to arrays and sort
      const topThemes = Array.from(themeFrequency.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 12)
        .map(theme => ({
          ...theme,
          percentage: Math.round((theme.count / analyses.length) * 100)
        }));

      const topEmotions = Array.from(emotionFrequency.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([emotion, count]) => ({
          emotion,
          count,
          percentage: Math.round((count / analyses.length) * 100)
        }));

      const categoryDistribution = Array.from(categoryFrequency.entries())
        .sort(([,a], [,b]) => b - a)
        .map(([category, count]) => ({
          category: category.replace('_', ' ').toUpperCase(),
          count,
          percentage: Math.round((count / Array.from(categoryFrequency.values()).reduce((a, b) => a + b, 0)) * 100)
        }));

      setData({
        totalAnalyses: analyses.length,
        topThemes,
        topEmotions,
        categoryDistribution,
        qualityMetrics: {
          averageConfidence: confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 100) : 0,
          highQualityCount
        }
      });

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No Analytics Available</p>
          <p className="text-sm">
            {error || 'No AI analysis data found. Process some transcripts first.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Stories Analyzed"
          value={data.totalAnalyses.toLocaleString()}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Unique Themes"
          value={data.topThemes.length.toString()}
          icon="🎯"
          color="green"
        />
        <StatCard
          title="AI Confidence"
          value={`${data.qualityMetrics.averageConfidence}%`}
          icon="🤖"
          color="purple"
        />
        <StatCard
          title="High Quality"
          value={data.qualityMetrics.highQualityCount.toString()}
          icon="⭐"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Themes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Most Common Themes
          </h3>
          <div className="space-y-3">
            {data.topThemes.map((theme, index) => (
              <div key={theme.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {theme.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {theme.count} stories ({theme.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${theme.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {theme.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Emotions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💫</span>
            Common Emotions
          </h3>
          <div className="space-y-3">
            {data.topEmotions.map((emotion, index) => (
              <div key={emotion.emotion} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {index + 1}. {emotion.emotion}
                    </span>
                    <span className="text-sm text-gray-500">
                      {emotion.count} stories ({emotion.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${emotion.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Theme Categories
          </h3>
          <div className="space-y-3">
            {data.categoryDistribution.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {category.count} themes ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Quality Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            AI Analysis Quality
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">Average Confidence</p>
                <p className="text-2xl font-bold text-blue-700">{data.qualityMetrics.averageConfidence}%</p>
              </div>
              <div className="text-blue-600 text-2xl">🎯</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">High Quality Analyses</p>
                <p className="text-2xl font-bold text-green-700">
                  {data.qualityMetrics.highQualityCount} / {data.totalAnalyses}
                </p>
              </div>
              <div className="text-green-600 text-2xl">⭐</div>
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <p>• High quality = confidence score &gt; 80%</p>
              <p>• Analyses are continuously improving</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-2xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}