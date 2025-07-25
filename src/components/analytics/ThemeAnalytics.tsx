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
      console.log('🔍 UPDATED COMPONENT - Loading analytics data...');
      console.log('🚀 Component version: 2024-07-24-FIXED');
      
      // Get all story analyses
      const { data: analyses, error: analysesError } = await supabase
        .from('story_analysis')
        .select(`
          themes_identified,
          primary_emotions,
          confidence_score,
          quality_score,
          processing_status,
          results
        `)
        .eq('analysis_type', 'theme_extraction')
        .eq('processing_status', 'completed');

      if (analysesError) {
        console.error('❌ Error loading analyses:', analysesError);
        throw analysesError;
      }
      
      console.log(`📊 Found ${analyses?.length || 0} analyses`);
      console.log('📊 Sample analysis data:', analyses?.[0]);
      console.log('📊 Query details - analysis_type: theme_extraction, processing_status: completed');

      // Get theme data for mapping
      const { data: themes, error: themesError } = await supabase
        .from('themes')
        .select('id, name, category')
        .eq('status', 'active');

      if (themesError) {
        throw themesError;
      }

      if (!analyses || !themes) {
        console.log('❌ Missing data - analyses or themes not found');
        setData(null);
        return;
      }

      console.log(`🏷️ Found ${themes.length} themes`);

      // Create theme lookup map
      const themeMap = new Map(themes.map(t => [t.id, { name: t.name, category: t.category }]));

      // Process data
      const themeFrequency = new Map<string, { name: string; category: string; count: number }>();
      const emotionFrequency = new Map<string, number>();
      const categoryFrequency = new Map<string, number>();
      
      let totalConfidence = 0;
      let highQualityCount = 0;
      let confidenceCount = 0;
      let recordsWithThemes = 0;

      analyses.forEach(analysis => {
        // Process themes from both themes_identified array and results.themes
        const themesToProcess = [];
        
        // Check themes_identified array
        if (analysis.themes_identified && analysis.themes_identified.length > 0) {
          themesToProcess.push(...analysis.themes_identified);
        }
        
        // Also check results.themes if themes_identified is empty (fallback)
        if (themesToProcess.length === 0 && analysis.results?.themes) {
          // Extract theme names from results.themes array
          const resultThemes = analysis.results.themes.map((t: any) => {
            if (typeof t === 'string') return t;
            if (t.name) return t.name;
            if (t.theme) return t.theme;
            return null;
          }).filter(Boolean);
          
          // Try to match theme names to IDs
          resultThemes.forEach((themeName: string) => {
            const matchingTheme = themes.find(t => 
              t.name.toLowerCase() === themeName.toLowerCase() ||
              themeName.toLowerCase().includes(t.name.toLowerCase())
            );
            if (matchingTheme) {
              themesToProcess.push(matchingTheme.id);
            } else {
              // Create a synthetic theme entry for unmatched themes
              const syntheticId = `synthetic_${themeName.toLowerCase().replace(/\s+/g, '_')}`;
              const existing = themeFrequency.get(syntheticId) || { 
                name: themeName, 
                category: 'uncategorized', 
                count: 0 
              };
              existing.count += 1;
              themeFrequency.set(syntheticId, existing);
              
              const categoryCount = categoryFrequency.get('uncategorized') || 0;
              categoryFrequency.set('uncategorized', categoryCount + 1);
            }
          });
        }
        
        // Track if we processed any themes for this record
        if (themesToProcess.length > 0) {
          recordsWithThemes++;
        }
        
        // Process identified themes
        themesToProcess.forEach((themeId: string) => {
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

      console.log(`🎯 Processed themes from ${recordsWithThemes} records`);
      console.log(`📊 Theme frequency map size: ${themeFrequency.size}`);
      console.log(`💫 Emotion frequency map size: ${emotionFrequency.size}`);

      // Convert to arrays and sort
      const topThemes = Array.from(themeFrequency.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 12)
        .map(theme => ({
          ...theme,
          percentage: Math.round((theme.count / analyses.length) * 100)
        }));
      
      console.log('🏆 Top themes:', topThemes.map(t => `${t.name}: ${t.count}`));

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
    <div>
      {/* Header Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-icon">📊</span>
              <span className="stat-title">Stories Analyzed</span>
            </div>
            <div className="stat-value">{data.totalAnalyses.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="stat-card stat-card-green">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-icon">🎯</span>
              <span className="stat-title">Unique Themes</span>
            </div>
            <div className="stat-value">{data.topThemes.length.toString()}</div>
          </div>
        </div>
        
        <div className="stat-card stat-card-purple">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-icon">🤖</span>
              <span className="stat-title">AI Confidence</span>
            </div>
            <div className="stat-value">{data.qualityMetrics.averageConfidence}%</div>
          </div>
        </div>
        
        <div className="stat-card stat-card-yellow">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-icon">⭐</span>
              <span className="stat-title">High Quality</span>
            </div>
            <div className="stat-value">{data.qualityMetrics.highQualityCount.toString()}</div>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Top Themes */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">
            <span className="analytics-icon">🎯</span>
            Most Common Themes
          </h3>
          <div className="theme-list">
            {data.topThemes.map((theme, index) => (
              <div key={theme.name} className="theme-item">
                <div className="theme-header">
                  <span className="theme-name">
                    {index + 1}. {theme.name}
                  </span>
                  <span className="theme-count">
                    {theme.count} stories ({theme.percentage}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill progress-blue"
                    style={{ width: `${Math.max(theme.percentage, 3)}%` }}
                  ></div>
                </div>
                <span className="theme-category">
                  {theme.category.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Emotions */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">
            <span className="analytics-icon">💫</span>
            Common Emotions
          </h3>
          <div className="emotion-list">
            {data.topEmotions.map((emotion, index) => (
              <div key={emotion.emotion} className="emotion-item">
                <div className="emotion-header">
                  <span className="emotion-name">
                    {index + 1}. {emotion.emotion}
                  </span>
                  <span className="emotion-count">
                    {emotion.count} stories ({emotion.percentage}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill progress-green"
                    style={{ width: `${Math.max(emotion.percentage, 3)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">
            <span className="analytics-icon">📈</span>
            Theme Categories
          </h3>
          <div className="category-list">
            {data.categoryDistribution.map((category, index) => (
              <div key={category.category} className="category-item">
                <div className="category-header">
                  <span className="category-name">
                    {category.category}
                  </span>
                  <span className="category-count">
                    {category.count} themes ({category.percentage}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill progress-purple"
                    style={{ width: `${Math.max(category.percentage, 3)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Quality Insights */}
        <div className="analytics-card">
          <h3 className="analytics-card-title">
            <span className="analytics-icon">🤖</span>
            AI Analysis Quality
          </h3>
          <div className="quality-metrics">
            <div className="quality-metric quality-metric-blue">
              <div className="metric-content">
                <div className="metric-label">Average Confidence</div>
                <div className="metric-value">{data.qualityMetrics.averageConfidence}%</div>
              </div>
              <div className="metric-icon">🎯</div>
            </div>
            
            <div className="quality-metric quality-metric-green">
              <div className="metric-content">
                <div className="metric-label">High Quality Analyses</div>
                <div className="metric-value">
                  {data.qualityMetrics.highQualityCount} / {data.totalAnalyses}
                </div>
              </div>
              <div className="metric-icon">⭐</div>
            </div>

            <div className="quality-notes">
              <p>• High quality = confidence score &gt; 80%</p>
              <p>• Analyses are continuously improving</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .stat-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .stat-card-blue { border-color: var(--color-brand-blue); }
        .stat-card-green { border-color: var(--color-brand-green); }
        .stat-card-purple { border-color: #8b5cf6; }
        .stat-card-yellow { border-color: #f59e0b; }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-gray);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-ink);
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-xl);
        }

        .analytics-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .analytics-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-blue);
        }

        .analytics-card-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 20px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-lg);
        }

        .analytics-icon {
          font-size: 24px;
        }

        .theme-list, .emotion-list, .category-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .theme-item, .emotion-item, .category-item {
          padding-bottom: var(--space-sm);
        }

        .theme-header, .emotion-header, .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xs);
        }

        .theme-name, .emotion-name, .category-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-ink);
        }

        .theme-count, .emotion-count, .category-count {
          font-size: 12px;
          color: var(--color-gray);
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--color-gray-lighter);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: var(--space-xs);
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s ease;
        }

        .progress-blue { background: var(--color-brand-blue); }
        .progress-green { background: var(--color-brand-green); }
        .progress-purple { background: #8b5cf6; }

        .theme-category {
          font-size: 11px;
          color: var(--color-gray);
          text-transform: capitalize;
        }

        .quality-metrics {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .quality-metric {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          border-radius: 12px;
          border: 1px solid;
        }

        .quality-metric-blue {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .quality-metric-green {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .metric-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-ink-light);
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-ink);
        }

        .metric-icon {
          font-size: 32px;
        }

        .quality-notes {
          padding: var(--space-md);
          background: var(--color-gray-lighter);
          border-radius: 8px;
          font-size: 12px;
          color: var(--color-gray);
        }

        .quality-notes p {
          margin: 0;
          margin-bottom: var(--space-xs);
        }

        .quality-notes p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
          
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>    
    </div>
  );
}

