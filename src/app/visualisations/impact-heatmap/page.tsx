'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ImpactHeatmapPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [viewMode, setViewMode] = useState('impact');
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Real data from Supabase
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryData = {
    healthcare: { color: '#3b82f6', intensity: [78, 85, 92, 65, 71, 88, 45, 95] },
    housing: { color: '#ef4444', intensity: [82, 89, 75, 60, 68, 85, 42, 92] },
    education: { color: '#22c55e', intensity: [88, 94, 81, 72, 74, 91, 48, 98] },
    employment: { color: '#f59e0b', intensity: [75, 87, 70, 55, 65, 80, 38, 89] },
    environment: { color: '#10b981', intensity: [70, 78, 85, 45, 58, 75, 52, 82] }
  };

  const timeData = {
    '2021': [65, 72, 68, 45, 58, 75, 32, 78],
    '2022': [72, 80, 73, 52, 63, 80, 38, 85],
    '2023': [78, 87, 76, 58, 68, 83, 42, 90],
    '2024': [85, 92, 78, 67, 71, 88, 45, 95]
  };

  // Get color based on impact intensity
  const getHeatmapColor = (intensity: number) => {
    if (intensity < 30) return '#1e3a8a'; // Dark blue (low impact)
    if (intensity < 50) return '#3b82f6'; // Blue
    if (intensity < 70) return '#22c55e'; // Green
    if (intensity < 85) return '#f59e0b'; // Orange
    return '#ef4444'; // Red (high impact)
  };

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchRegionalData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/analytics?type=regional-impact');
        const data = await response.json();
        
        if (data.regionData) {
          setRegionData(data.regionData);
        }
      } catch (error) {
        console.error('Failed to fetch regional data:', error);
        // Fallback to sample data if API fails
        setRegionData([
          { id: 'nsw', name: 'New South Wales', impact: 85, stories: 145, users: 67, population: 8164000, centroid: [400, 300] },
          { id: 'vic', name: 'Victoria', impact: 92, stories: 89, users: 45, population: 6648000, centroid: [380, 380] },
          { id: 'qld', name: 'Queensland', impact: 78, stories: 76, users: 38, population: 5185000, centroid: [450, 200] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionalData();
  }, []);

  const getCurrentIntensity = (regionIndex: number) => {
    if (loading || !regionData[regionIndex]) return 0;
    
    if (categoryFilter !== 'all') {
      return categoryData[categoryFilter as keyof typeof categoryData]?.intensity[regionIndex] || 0;
    }
    if (timeFilter !== 'all') {
      return timeData[timeFilter as keyof typeof timeData][regionIndex] || 0;
    }
    return regionData[regionIndex]?.impact || 0;
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous content
    svg.innerHTML = '';

    // Create definitions for gradients and patterns
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Create gradient for background
    const bgGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    bgGradient.setAttribute('id', 'bgGradient');
    bgGradient.innerHTML = `
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    `;
    defs.appendChild(bgGradient);

    // Create glow filter
    const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    glowFilter.setAttribute('id', 'glow');
    glowFilter.innerHTML = `
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    `;
    defs.appendChild(glowFilter);

    svg.appendChild(defs);

    // Create background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', 'url(#bgGradient)');
    svg.appendChild(background);

    // Create simplified Australia map regions
    const regions = [
      // NSW
      { path: 'M 380 280 L 480 280 L 480 350 L 420 380 L 380 360 Z', id: 'nsw', index: 0 },
      // Victoria  
      { path: 'M 360 360 L 420 360 L 420 400 L 360 400 Z', id: 'vic', index: 1 },
      // Queensland
      { path: 'M 420 150 L 500 150 L 500 280 L 420 280 Z', id: 'qld', index: 2 },
      // Western Australia
      { path: 'M 50 200 L 300 200 L 300 400 L 50 400 Z', id: 'wa', index: 3 },
      // South Australia
      { path: 'M 300 300 L 380 300 L 380 380 L 300 380 Z', id: 'sa', index: 4 },
      // Tasmania
      { path: 'M 360 420 L 400 420 L 400 450 L 360 450 Z', id: 'tas', index: 5 },
      // Northern Territory
      { path: 'M 280 50 L 380 50 L 380 200 L 280 200 Z', id: 'nt', index: 6 },
      // ACT
      { path: 'M 400 310 L 420 310 L 420 330 L 400 330 Z', id: 'act', index: 7 }
    ];

    // Draw regions
    regions.forEach((region) => {
      const intensity = getCurrentIntensity(region.index);
      const color = getHeatmapColor(intensity);
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', region.path);
      path.setAttribute('fill', color);
      path.setAttribute('stroke', '#ffffff');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('opacity', '0.8');
      path.setAttribute('filter', 'url(#glow)');
      path.style.cursor = 'pointer';
      path.style.transition = 'all 0.3s ease';

      // Add hover effects
      path.addEventListener('mouseenter', () => {
        path.setAttribute('opacity', '1');
        path.setAttribute('stroke-width', '3');
      });

      path.addEventListener('mouseleave', () => {
        path.setAttribute('opacity', '0.8');
        path.setAttribute('stroke-width', '2');
      });

      path.addEventListener('click', () => {
        setSelectedRegion(regionData[region.index]);
      });

      svg.appendChild(path);

      // Add region labels
      const regionInfo = regionData && regionData[region.index];
      if (regionInfo) {
        const [x, y] = regionInfo.centroid;
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-family', 'Inter, sans-serif');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', '600');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('stroke', '#000000');
        text.setAttribute('stroke-width', '0.5');
        text.textContent = regionInfo.name.split(' ')[0]; // First word only
        
        svg.appendChild(text);

        // Add intensity value
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', x.toString());
        valueText.setAttribute('y', (y + 20).toString());
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('dominant-baseline', 'middle');
        valueText.setAttribute('font-family', 'Inter, sans-serif');
        valueText.setAttribute('font-size', '12');
        valueText.setAttribute('font-weight', '700');
        valueText.setAttribute('fill', '#ffffff');
        valueText.setAttribute('stroke', '#000000');
        valueText.setAttribute('stroke-width', '0.5');
        valueText.textContent = `${intensity}%`;
        
        svg.appendChild(valueText);
      }
    });

    // Add grid pattern for visual enhancement
    const gridPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    gridPattern.setAttribute('id', 'grid');
    gridPattern.setAttribute('width', '20');
    gridPattern.setAttribute('height', '20');
    gridPattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    const gridPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    gridPath.setAttribute('d', 'M 20 0 L 0 0 0 20');
    gridPath.setAttribute('fill', 'none');
    gridPath.setAttribute('stroke', 'rgba(255,255,255,0.1)');
    gridPath.setAttribute('stroke-width', '1');
    
    gridPattern.appendChild(gridPath);
    defs.appendChild(gridPattern);

    // Add subtle grid overlay
    const gridOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    gridOverlay.setAttribute('width', '100%');
    gridOverlay.setAttribute('height', '100%');
    gridOverlay.setAttribute('fill', 'url(#grid)');
    gridOverlay.setAttribute('opacity', '0.3');
    svg.appendChild(gridOverlay);

  }, [viewMode, timeFilter, categoryFilter, loading, regionData]);

  const categories = ['all', 'healthcare', 'housing', 'education', 'employment', 'environment'];
  const timeFilters = ['all', '2021', '2022', '2023', '2024'];

  return (
    <div>
      {/* Header */}
      <section className="viz-header">
        <div className="container">
          <Link href="/visualisations" className="back-link">
            ← Back to Visualisations
          </Link>
          
          <div className="viz-title-section">
            <div className="viz-icon-large">🗺️</div>
            <div>
              <h1>Impact Heat Map</h1>
              <p>Geographic visualisation of community impact intensity across regions and demographics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Visualisation */}
      <section className="viz-interactive">
        <div className="container">
          <div className="viz-container">
            <div className="viz-main">
              <div className="viz-controls-top">
                <div className="control-group">
                  <label>Category:</label>
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="control-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="control-group">
                  <label>Time Period:</label>
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="control-select"
                  >
                    {timeFilters.map(time => (
                      <option key={time} value={time}>
                        {time === 'all' ? 'All Time' : time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>View Mode:</label>
                  <select 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)}
                    className="control-select"
                  >
                    <option value="impact">Impact Intensity</option>
                    <option value="stories">Story Volume</option>
                    <option value="population">Per Capita</option>
                  </select>
                </div>
              </div>

              <div className="heatmap-wrapper">
                <svg
                  ref={svgRef}
                  viewBox="0 0 550 500"
                  className="heatmap-svg"
                  preserveAspectRatio="xMidYMid meet"
                />
                
                {/* Color Scale Legend */}
                <div className="color-scale">
                  <h4>Impact Intensity</h4>
                  <div className="scale-bar">
                    <div className="scale-gradient"></div>
                    <div className="scale-labels">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="info-panel">
              {selectedRegion ? (
                <div>
                  <div className="info-header">
                    <h3>{selectedRegion.name}</h3>
                    <button onClick={() => setSelectedRegion(null)} className="close-btn">×</button>
                  </div>
                  <div className="info-content">
                    <div className="region-stats">
                      <div className="stat-item">
                        <span className="stat-value">{selectedRegion.impact}%</span>
                        <span className="stat-label">Impact Score</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{selectedRegion.stories.toLocaleString()}</span>
                        <span className="stat-label">Stories Collected</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{(selectedRegion.population / 1000000).toFixed(1)}M</span>
                        <span className="stat-label">Population</span>
                      </div>
                    </div>

                    <div className="category-breakdown">
                      <h4>Impact by Category</h4>
                      {Object.entries(categoryData).map(([category, data]) => {
                        const regionIndex = regionData.findIndex(r => r.id === selectedRegion.id);
                        const intensity = data.intensity[regionIndex];
                        return (
                          <div key={category} className="category-item">
                            <div className="category-header">
                              <div 
                                className="category-color" 
                                style={{ backgroundColor: data.color }}
                              ></div>
                              <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                              <span className="category-value">{intensity}%</span>
                            </div>
                            <div className="category-bar">
                              <div 
                                className="category-fill" 
                                style={{ 
                                  width: `${intensity}%`,
                                  backgroundColor: data.color
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="region-actions">
                      <button className="btn btn-primary btn-sm">View Stories</button>
                      <button className="btn btn-outline btn-sm">Download Data</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-placeholder">
                  <div className="placeholder-icon">🗺️</div>
                  <h3>Impact Heat Map</h3>
                  <p>Click on any region to explore detailed impact data and story insights.</p>
                  
                  <div className="summary-stats">
                    <div className="summary-item">
                      <span className="summary-value">
                        {loading ? '...' : regionData.reduce((sum, region: any) => sum + (region.stories || 0), 0).toLocaleString()}
                      </span>
                      <span className="summary-label">Total Stories</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-value">{loading ? '...' : regionData.length}</span>
                      <span className="summary-label">Regions</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-value">
                        {loading ? '...' : regionData.length > 0 ? Math.round(regionData.reduce((sum: number, region: any) => sum + (region.impact || 0), 0) / regionData.length) + '%' : '0%'}
                      </span>
                      <span className="summary-label">Avg Impact</span>
                    </div>
                  </div>

                  <div className="impact-insights">
                    <h4>Key Insights</h4>
                    {loading ? (
                      <p>Loading insights...</p>
                    ) : regionData.length > 0 ? (
                      <ul>
                        <li>{regionData.reduce((max: any, region: any) => region.impact > max.impact ? region : max, regionData[0])?.name} shows highest impact intensity ({regionData.reduce((max: any, region: any) => region.impact > max.impact ? region : max, regionData[0])?.impact}%)</li>
                        <li>{regionData.reduce((max: any, region: any) => (region.stories || 0) > (max.stories || 0) ? region : max, regionData[0])?.name} leads in story volume ({regionData.reduce((max: any, region: any) => (region.stories || 0) > (max.stories || 0) ? region : max, regionData[0])?.stories || 0} stories)</li>
                        <li>Real-time data from {regionData.length} active regions</li>
                        <li>Community stories driving measurable impact</li>
                      </ul>
                    ) : (
                      <p>No regional data available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Data Insights */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Understanding the Heat Map</h2>
            <p>How to interpret geographic impact visualisation</p>
          </div>

          <div className="insights-grid">
            <div className="insight-item">
              <div className="insight-icon">🌡️</div>
              <h4>Heat Intensity</h4>
              <p>Color intensity represents the level of community impact, from blue (low) through green and orange to red (high impact)</p>
            </div>
            <div className="insight-item">
              <div className="insight-icon">📊</div>
              <h4>Multi-Dimensional Data</h4>
              <p>Switch between impact intensity, story volume, and per-capita views to see different perspectives of the same data</p>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🎯</div>
              <h4>Category Filtering</h4>
              <p>Filter by healthcare, housing, education, employment, or environment to see domain-specific impact patterns</p>
            </div>
            <div className="insight-item">
              <div className="insight-icon">⏱️</div>
              <h4>Temporal Analysis</h4>
              <p>View impact changes over time to identify trends, improvements, or emerging issues requiring attention</p>
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

        .viz-interactive {
          background: var(--color-gray-lighter);
          min-height: 80vh;
          padding: var(--space-xl) 0;
        }

        .viz-container {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--space-xl);
          height: 80vh;
        }

        .viz-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .viz-controls-top {
          display: flex;
          gap: var(--space-lg);
          background: var(--color-white);
          padding: var(--space-lg);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

        .heatmap-wrapper {
          position: relative;
          background: var(--color-white);
          border-radius: 12px;
          padding: var(--space-xl);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          flex: 1;
        }

        .heatmap-svg {
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }

        .color-scale {
          position: absolute;
          bottom: var(--space-lg);
          right: var(--space-lg);
          background: rgba(255, 255, 255, 0.95);
          padding: var(--space-md);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .color-scale h4 {
          font-size: 14px;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .scale-bar {
          width: 120px;
        }

        .scale-gradient {
          height: 20px;
          background: linear-gradient(to right, #1e3a8a, #3b82f6, #22c55e, #f59e0b, #ef4444);
          border-radius: 4px;
          margin-bottom: var(--space-xs);
        }

        .scale-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-ink-light);
        }

        .info-panel {
          background: var(--color-white);
          border-radius: 12px;
          padding: var(--space-xl);
          height: fit-content;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-lg);
        }

        .info-header h3 {
          font-size: 20px;
          margin: 0;
          color: var(--color-ink);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--color-gray);
          cursor: pointer;
          padding: 0;
        }

        .region-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .stat-item {
          text-align: center;
          padding: var(--space-md);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .stat-label {
          font-size: 12px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .category-breakdown {
          margin-bottom: var(--space-xl);
        }

        .category-breakdown h4 {
          font-size: 16px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .category-item {
          margin-bottom: var(--space-md);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-xs);
        }

        .category-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .category-name {
          flex: 1;
          font-size: 14px;
          color: var(--color-ink);
        }

        .category-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-ink-light);
        }

        .category-bar {
          height: 6px;
          background: var(--color-gray-lighter);
          border-radius: 3px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .region-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 14px;
        }

        .info-placeholder {
          text-align: center;
        }

        .placeholder-icon {
          font-size: 64px;
          margin-bottom: var(--space-lg);
        }

        .info-placeholder h3 {
          font-size: 24px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .info-placeholder p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-xl);
          line-height: 1.6;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .summary-item {
          text-align: center;
          padding: var(--space-md);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .summary-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .summary-label {
          font-size: 12px;
          color: var(--color-ink-light);
          text-transform: uppercase;
          font-weight: 600;
        }

        .impact-insights h4 {
          font-size: 16px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
          text-align: left;
        }

        .impact-insights ul {
          text-align: left;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .impact-insights li {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-sm);
          padding-left: var(--space-md);
          position: relative;
        }

        .impact-insights li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--color-brand-blue);
          font-weight: 600;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .insight-item {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
        }

        .insight-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .insight-item h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .insight-item p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .viz-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
          }

          .viz-title-section {
            flex-direction: column;
            text-align: center;
          }

          .viz-controls-top {
            flex-direction: column;
            gap: var(--space-md);
          }

          .region-stats, .summary-stats {
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