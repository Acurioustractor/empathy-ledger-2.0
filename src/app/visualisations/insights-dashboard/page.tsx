'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function InsightsDashboardPage() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('stories');
  const [refreshRate, setRefreshRate] = useState('realtime');
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  // Sample dashboard data
  const dashboardData = {
    overview: {
      totalStories: 2340,
      activeUsers: 890,
      communitiesConnected: 45,
      impactScore: 87,
      growthRate: 23.5,
      lastUpdate: new Date().toISOString()
    },
    timeSeriesData: {
      stories: [
        { date: '2024-01', value: 120 },
        { date: '2024-02', value: 156 },
        { date: '2024-03', value: 189 },
        { date: '2024-04', value: 234 },
        { date: '2024-05', value: 298 },
        { date: '2024-06', value: 367 },
        { date: '2024-07', value: 423 }
      ],
      engagement: [
        { date: '2024-01', value: 65 },
        { date: '2024-02', value: 72 },
        { date: '2024-03', value: 68 },
        { date: '2024-04', value: 78 },
        { date: '2024-05', value: 85 },
        { date: '2024-06', value: 92 },
        { date: '2024-07', value: 87 }
      ],
      impact: [
        { date: '2024-01', value: 45 },
        { date: '2024-02', value: 52 },
        { date: '2024-03', value: 48 },
        { date: '2024-04', value: 63 },
        { date: '2024-05', value: 71 },
        { date: '2024-06', value: 78 },
        { date: '2024-07', value: 87 }
      ]
    },
    categoryBreakdown: {
      healthcare: { value: 28, trend: 12.3 },
      housing: { value: 22, trend: -3.1 },
      education: { value: 18, trend: 8.7 },
      employment: { value: 15, trend: 15.2 },
      environment: { value: 10, trend: 5.8 },
      other: { value: 7, trend: 2.1 }
    },
    geographicData: [
      { region: 'NSW', stories: 680, growth: 15.2 },
      { region: 'VIC', stories: 520, growth: 12.8 },
      { region: 'QLD', stories: 420, growth: 18.5 },
      { region: 'WA', stories: 280, growth: 8.9 },
      { region: 'SA', stories: 210, growth: 11.2 },
      { region: 'TAS', stories: 150, growth: 22.1 },
      { region: 'NT', stories: 50, growth: 35.7 },
      { region: 'ACT', stories: 30, growth: 28.4 }
    ],
    realtimeMetrics: {
      activeNow: 47,
      storiesThisHour: 8,
      avgResponseTime: '2.3s',
      systemHealth: 98.5
    }
  };

  // Chart rendering functions
  const drawLineChart = (canvasId: string, data: any[], color: string) => {
    const canvas = chartRefs.current[canvasId];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw data line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.fillStyle = color + '20';

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth / (data.length - 1));
      const y = padding + chartHeight - ((point.value - minValue) / valueRange * chartHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw data points
    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth / (data.length - 1));
      const y = padding + chartHeight - ((point.value - minValue) / valueRange * chartHeight);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawDonutChart = (canvasId: string, data: any, colors: string[]) => {
    const canvas = chartRefs.current[canvasId];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(canvas.offsetWidth, canvas.offsetHeight);
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 20;
    const innerRadius = radius * 0.6;

    const total = Object.values(data).reduce((sum: number, item: any) => sum + Number(item.value), 0);
    let currentAngle = -Math.PI / 2;

    Object.entries(data).forEach(([key, item]: [string, any], index) => {
      const sliceAngle = (Number(item.value) / Number(total)) * 2 * Math.PI;
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Center text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${total}%`, centerX, centerY);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Total Coverage', centerX, centerY + 20);
  };

  const drawBarChart = (canvasId: string, data: any[], color: string) => {
    const canvas = chartRefs.current[canvasId];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length - 10;

    const maxValue = Math.max(...data.map(d => d.stories));

    data.forEach((item, index) => {
      const barHeight = (item.stories / maxValue) * chartHeight;
      const x = padding + (index * (barWidth + 10));
      const y = height - padding - barHeight;

      // Bar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.region, x + barWidth/2, height - padding + 15);
      ctx.fillText(item.stories.toString(), x + barWidth/2, y - 5);
    });
  };

  useEffect(() => {
    // Redraw charts when data changes
    const timeData = dashboardData.timeSeriesData[selectedMetric as keyof typeof dashboardData.timeSeriesData] || [];
    
    drawLineChart('mainChart', timeData, '#3b82f6');
    drawDonutChart('categoryChart', dashboardData.categoryBreakdown, 
      ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4']);
    drawBarChart('geoChart', dashboardData.geographicData, '#22c55e');
  }, [selectedMetric, timeRange]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <div>
      {/* Header */}
      <section className="viz-header">
        <div className="container">
          <Link href="/visualisations" className="back-link">
            ← Back to Visualisations
          </Link>
          
          <div className="viz-title-section">
            <div className="viz-icon-large">📊</div>
            <div>
              <h1>Insights Dashboard</h1>
              <p>Comprehensive real-time analytics combining multiple visualisation types and data sources</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Controls */}
      <section className="dashboard-controls">
        <div className="container">
          <div className="controls-bar">
            <div className="control-group">
              <label>Time Range:</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="control-select"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="control-group">
              <label>Primary Metric:</label>
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="control-select"
              >
                <option value="stories">Story Volume</option>
                <option value="engagement">Community Engagement</option>
                <option value="impact">Impact Score</option>
              </select>
            </div>

            <div className="control-group">
              <label>Refresh Rate:</label>
              <select 
                value={refreshRate} 
                onChange={(e) => setRefreshRate(e.target.value)}
                className="control-select"
              >
                <option value="manual">Manual</option>
                <option value="1min">Every Minute</option>
                <option value="5min">Every 5 Minutes</option>
                <option value="realtime">Real-time</option>
              </select>
            </div>

            <div className="control-actions">
              <button className="control-btn primary">
                📥 Export Data
              </button>
              <button className="control-btn secondary">
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Overview */}
      <section className="metrics-overview">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-header">
                <span className="metric-icon">📖</span>
                <div className="metric-trend positive">
                  <span>+{dashboardData.overview.growthRate}%</span>
                  <span className="trend-icon">📈</span>
                </div>
              </div>
              <div className="metric-value">{formatNumber(dashboardData.overview.totalStories)}</div>
              <div className="metric-label">Total Stories</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">👥</span>
                <div className="metric-trend positive">
                  <span>+12.8%</span>
                  <span className="trend-icon">📈</span>
                </div>
              </div>
              <div className="metric-value">{formatNumber(dashboardData.overview.activeUsers)}</div>
              <div className="metric-label">Active Users</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">🏘️</span>
                <div className="metric-trend positive">
                  <span>+8.2%</span>
                  <span className="trend-icon">📈</span>
                </div>
              </div>
              <div className="metric-value">{dashboardData.overview.communitiesConnected}</div>
              <div className="metric-label">Connected Communities</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">⚡</span>
                <div className="metric-trend positive">
                  <span>+5.4%</span>
                  <span className="trend-icon">📈</span>
                </div>
              </div>
              <div className="metric-value">{dashboardData.overview.impactScore}</div>
              <div className="metric-label">Impact Score</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="dashboard-main">
        <div className="container">
          <div className="dashboard-grid">
            {/* Primary Chart */}
            <div className="chart-container main-chart">
              <div className="chart-header">
                <h3>{selectedMetric === 'stories' ? 'Story Volume' : 
                     selectedMetric === 'engagement' ? 'Community Engagement' : 'Impact Score'} Trend</h3>
                <div className="chart-period">{timeRange.replace('months', ' months').replace('month', ' month')}</div>
              </div>
              <canvas 
                ref={(el) => chartRefs.current['mainChart'] = el}
                className="chart-canvas"
              />
            </div>

            {/* Category Breakdown */}
            <div className="chart-container">
              <div className="chart-header">
                <h3>Story Categories</h3>
                <div className="chart-subtitle">Distribution by theme</div>
              </div>
              <canvas 
                ref={(el) => chartRefs.current['categoryChart'] = el}
                className="chart-canvas donut"
              />
              <div className="category-legend">
                {Object.entries(dashboardData.categoryBreakdown).map(([key, data]: [string, any], index) => (
                  <div key={key} className="legend-item">
                    <div 
                      className="legend-dot"
                      style={{ backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'][index] }}
                    ></div>
                    <span className="legend-label">{key}</span>
                    <span className="legend-value">{data.value}%</span>
                    <span className={`legend-trend ${data.trend >= 0 ? 'positive' : 'negative'}`}>
                      {formatTrend(data.trend)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="chart-container">
              <div className="chart-header">
                <h3>Geographic Distribution</h3>
                <div className="chart-subtitle">Stories by region</div>
              </div>
              <canvas 
                ref={(el) => chartRefs.current['geoChart'] = el}
                className="chart-canvas"
              />
            </div>

            {/* Real-time Metrics */}
            <div className="chart-container realtime">
              <div className="chart-header">
                <h3>Real-time Metrics</h3>
                <div className="live-indicator">
                  <div className="pulse-dot"></div>
                  <span>Live</span>
                </div>
              </div>
              <div className="realtime-grid">
                <div className="realtime-item">
                  <div className="rt-value">{dashboardData.realtimeMetrics.activeNow}</div>
                  <div className="rt-label">Active Now</div>
                </div>
                <div className="realtime-item">
                  <div className="rt-value">{dashboardData.realtimeMetrics.storiesThisHour}</div>
                  <div className="rt-label">Stories This Hour</div>
                </div>
                <div className="realtime-item">
                  <div className="rt-value">{dashboardData.realtimeMetrics.avgResponseTime}</div>
                  <div className="rt-label">Avg Response Time</div>
                </div>
                <div className="realtime-item">
                  <div className="rt-value">{dashboardData.realtimeMetrics.systemHealth}%</div>
                  <div className="rt-label">System Health</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Insights */}
      <section className="insights-section">
        <div className="container">
          <div className="section-header">
            <h2>Key Insights & Recommendations</h2>
            <p>AI-powered analysis of your community data</p>
          </div>

          <div className="insights-grid">
            <div className="insight-card trending">
              <div className="insight-icon">📈</div>
              <h4>Trending Topics</h4>
              <p>Healthcare stories showing 15.2% increase. Youth programs gaining traction with 28% more engagement.</p>
              <div className="insight-action">
                <button className="btn btn-outline btn-sm">Explore Trends</button>
              </div>
            </div>

            <div className="insight-card alert">
              <div className="insight-icon">🚨</div>
              <h4>Attention Required</h4>
              <p>Housing stories decreased 3.1% this month. Consider targeted outreach in affected communities.</p>
              <div className="insight-action">
                <button className="btn btn-outline btn-sm">View Details</button>
              </div>
            </div>

            <div className="insight-card success">
              <div className="insight-icon">🎯</div>
              <h4>Success Metrics</h4>
              <p>Impact score reached all-time high of 87. Northern Territory showing exceptional 35.7% growth.</p>
              <div className="insight-action">
                <button className="btn btn-outline btn-sm">See Success Stories</button>
              </div>
            </div>

            <div className="insight-card recommendation">
              <div className="insight-icon">💡</div>
              <h4>Recommendations</h4>
              <p>Focus resources on ACT and NT regions. Consider launching environment-focused storytelling campaigns.</p>
              <div className="insight-action">
                <button className="btn btn-outline btn-sm">View Recommendations</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .viz-header {
          background: var(--color-gray-darker);
          color: var(--color-white);
          padding: var(--space-xl) 0;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--color-white);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: var(--space-lg);
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .back-link:hover {
          opacity: 1;
        }

        .viz-title-section {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .viz-icon-large {
          font-size: 64px;
        }

        .viz-title-section h1 {
          font-size: 48px;
          margin-bottom: var(--space-sm);
        }

        .viz-title-section p {
          opacity: 0.8;
          margin: 0;
        }

        .dashboard-controls {
          background: var(--color-white);
          border-bottom: 1px solid var(--color-gray-light);
          padding: var(--space-lg) 0;
        }

        .controls-bar {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .control-group label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-ink);
          opacity: 0.8;
        }

        .control-select {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--color-ink);
          font-size: 14px;
          font-weight: 500;
          transition: border-color 0.2s ease;
        }

        .control-select:focus {
          outline: none;
          border-color: var(--color-brand-blue);
        }

        .control-actions {
          display: flex;
          gap: var(--space-md);
          margin-left: auto;
        }

        .control-btn {
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn.primary {
          background: var(--color-brand-blue);
          color: var(--color-white);
        }

        .control-btn.secondary {
          background: var(--color-gray-lighter);
          color: var(--color-ink);
        }

        .metrics-overview {
          background: var(--color-gray-lighter);
          padding: var(--space-xl) 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .metric-card {
          background: var(--color-white);
          border-radius: 16px;
          padding: var(--space-xl);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .metric-card.primary {
          background: linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-green));
          color: var(--color-white);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }

        .metric-icon {
          font-size: 32px;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .metric-trend.positive {
          color: var(--color-brand-green);
        }

        .metric-card.primary .metric-trend {
          color: rgba(255, 255, 255, 0.8);
        }

        .metric-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: var(--space-xs);
        }

        .metric-label {
          font-size: 14px;
          opacity: 0.8;
          font-weight: 500;
        }

        .dashboard-main {
          padding: var(--space-xl) 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-template-rows: auto auto;
          gap: var(--space-xl);
        }

        .chart-container {
          background: var(--color-white);
          border-radius: 16px;
          padding: var(--space-xl);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .chart-container.main-chart {
          grid-row: span 2;
        }

        .chart-container.realtime {
          border: 2px solid var(--color-brand-green);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02));
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }

        .chart-header h3 {
          font-size: 18px;
          margin: 0;
          color: var(--color-ink);
        }

        .chart-period, .chart-subtitle {
          font-size: 12px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 12px;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: var(--color-brand-green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .chart-canvas {
          width: 100%;
          height: 300px;
          border-radius: 8px;
        }

        .chart-canvas.donut {
          height: 200px;
        }

        .category-legend {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-top: var(--space-lg);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 14px;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-label {
          flex: 1;
          color: var(--color-ink);
          text-transform: capitalize;
        }

        .legend-value {
          color: var(--color-ink-light);
          font-weight: 600;
        }

        .legend-trend {
          font-size: 12px;
          font-weight: 600;
        }

        .legend-trend.positive {
          color: var(--color-brand-green);
        }

        .legend-trend.negative {
          color: var(--color-brand-red);
        }

        .realtime-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }

        .realtime-item {
          text-align: center;
          padding: var(--space-lg);
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
        }

        .rt-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-brand-green);
          margin-bottom: var(--space-xs);
        }

        .rt-label {
          font-size: 12px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .insights-section {
          background: var(--color-gray-lighter);
          padding: var(--space-xl) 0;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .insight-card {
          background: var(--color-white);
          border-radius: 12px;
          padding: var(--space-xl);
          border-left: 4px solid var(--color-gray-light);
          transition: all 0.3s ease;
        }

        .insight-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .insight-card.trending {
          border-left-color: var(--color-brand-blue);
        }

        .insight-card.alert {
          border-left-color: var(--color-brand-red);
        }

        .insight-card.success {
          border-left-color: var(--color-brand-green);
        }

        .insight-card.recommendation {
          border-left-color: var(--color-brand-yellow);
        }

        .insight-icon {
          font-size: 32px;
          margin-bottom: var(--space-md);
        }

        .insight-card h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .insight-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .insight-action {
          display: flex;
          justify-content: flex-end;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .viz-title-section {
            flex-direction: column;
            text-align: center;
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .control-actions {
            margin-left: 0;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .realtime-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}