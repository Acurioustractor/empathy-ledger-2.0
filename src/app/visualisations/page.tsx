'use client';

import React from 'react';
import Link from 'next/link';

export default function VisualisationsPage() {
  const visualisations = [
    {
      id: 'story-galaxy',
      title: 'Story Galaxy',
      description: 'Interactive 3D visualisation of community stories arranged by themes, connections, and impact',
      icon: '🌌',
      status: 'active',
      category: 'Immersive',
      features: ['3D Navigation', 'Story Clustering', 'Thematic Grouping', 'Interactive Exploration']
    },
    {
      id: 'knowledge-river',
      title: 'Knowledge River Flow',
      description: 'Dynamic flow visualisation showing how insights and wisdom flow through communities over time',
      icon: '🌊',
      status: 'active',
      category: 'Dynamic',
      features: ['Time-based Flow', 'Knowledge Tracking', 'Community Networks', 'Influence Patterns']
    },
    {
      id: 'impact-heatmap',
      title: 'Impact Heat Map',
      description: 'Geographic visualisation showing community impact intensity across different regions and demographics',
      icon: '🗺️',
      status: 'active',
      category: 'Geographic',
      features: ['Regional Analysis', 'Impact Intensity', 'Demographic Layers', 'Temporal Changes']
    },
    {
      id: 'network-graph',
      title: 'Relationship Network',
      description: 'Interactive network graph showing connections between stories, communities, and outcomes',
      icon: '🕸️',
      status: 'active',
      category: 'Network',
      features: ['Node Relationships', 'Community Clusters', 'Influence Metrics', 'Connection Strength']
    },
    {
      id: 'insights-dashboard',
      title: 'Insights Dashboard',
      description: 'Comprehensive analytics dashboard combining multiple visualisation types and real-time data',
      icon: '📊',
      status: 'active',
      category: 'Dashboard',
      features: ['Real-time Data', 'Multiple Charts', 'Customisable Views', 'Export Options']
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">DATA VISUALISATION</div>
            <h1 className="hero-title">
              Community Data Comes Alive
            </h1>
            <p className="hero-description">
              Transform community stories and data into compelling visual narratives 
              that drive understanding, engagement, and meaningful change.
            </p>
            <div className="hero-actions">
              <Link href="/visualisations/story-galaxy" className="btn btn-primary btn-large">
                Explore Story Galaxy
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-large">
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visualisation Categories */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Visualisation Types</h2>
            <p>Different ways to explore and understand your community data</p>
          </div>

          <div className="viz-categories">
            <div className="category-card">
              <div className="category-icon">🌌</div>
              <h3>Immersive 3D</h3>
              <p>Three-dimensional explorations that let you navigate through data like exploring a galaxy of stories</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🌊</div>
              <h3>Dynamic Flows</h3>
              <p>Time-based visualisations showing how information, influence, and impact flow through communities</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🗺️</div>
              <h3>Geographic Maps</h3>
              <p>Location-based insights showing regional patterns, hotspots, and geographic distribution of impact</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🕸️</div>
              <h3>Network Graphs</h3>
              <p>Relationship mapping showing connections between people, stories, issues, and outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Visualisations */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Visualisations</h2>
            <p>Interactive tools for exploring community data and insights</p>
          </div>

          <div className="visualisations-grid">
            {visualisations.map((viz) => (
              <div key={viz.id} className="viz-card">
                <div className="viz-preview">
                  <div className="viz-icon">{viz.icon}</div>
                  <div className="viz-category">{viz.category}</div>
                </div>
                
                <div className="viz-content">
                  <h3>{viz.title}</h3>
                  <p>{viz.description}</p>
                  
                  <div className="viz-features">
                    {viz.features.map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  
                  <div className="viz-actions">
                    <Link href={`/visualisations/${viz.id}`} className="btn btn-primary">
                      Explore
                    </Link>
                    <Link href={`/visualisations/${viz.id}?demo=true`} className="btn btn-outline">
                      Live Demo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Visualisation Use Cases</h2>
            <p>How different stakeholders use data visualisations</p>
          </div>

          <div className="use-cases">
            <div className="use-case">
              <div className="use-case-header">
                <div className="use-case-icon">👥</div>
                <h4>Community Leaders</h4>
              </div>
              <ul>
                <li>Understand community needs and priorities</li>
                <li>Track progress on community initiatives</li>
                <li>Identify emerging issues and opportunities</li>
                <li>Communicate impact to stakeholders</li>
              </ul>
            </div>

            <div className="use-case">
              <div className="use-case-header">
                <div className="use-case-icon">🏛️</div>
                <h4>Policymakers</h4>
              </div>
              <ul>
                <li>Evidence-based policy development</li>
                <li>Resource allocation decisions</li>
                <li>Impact assessment of programs</li>
                <li>Constituent engagement insights</li>
              </ul>
            </div>

            <div className="use-case">
              <div className="use-case-header">
                <div className="use-case-icon">🔬</div>
                <h4>Researchers</h4>
              </div>
              <ul>
                <li>Pattern identification and analysis</li>
                <li>Data exploration and hypothesis generation</li>
                <li>Publication-ready visualisations</li>
                <li>Cross-community comparative analysis</li>
              </ul>
            </div>

            <div className="use-case">
              <div className="use-case-header">
                <div className="use-case-icon">💰</div>
                <h4>Funders & Investors</h4>
              </div>
              <ul>
                <li>Impact measurement and ROI analysis</li>
                <li>Program effectiveness evaluation</li>
                <li>Risk assessment and mitigation</li>
                <li>Investment decision support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Interactive Features</h2>
            <p>Powerful capabilities built into every visualisation</p>
          </div>

          <div className="interactive-features">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div className="feature-content">
                <h4>Drill-Down Analysis</h4>
                <p>Click on any data point to explore deeper levels of detail and context</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🎛️</div>
              <div className="feature-content">
                <h4>Dynamic Filtering</h4>
                <p>Filter by demographics, time periods, topics, or custom criteria in real-time</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-content">
                <h4>Multiple View Modes</h4>
                <p>Switch between different visualisation types to see data from various perspectives</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💾</div>
              <div className="feature-content">
                <h4>Export & Share</h4>
                <p>Save visualisations as images, PDFs, or interactive web links for presentations</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">⏱️</div>
              <div className="feature-content">
                <h4>Real-Time Updates</h4>
                <p>Visualisations update automatically as new data and stories are collected</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-content">
                <h4>Privacy Controls</h4>
                <p>Respect data sovereignty with granular privacy settings and anonymisation options</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Bring Your Community Data to Life</h2>
            <p>Transform stories into compelling visual narratives that drive action</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link href="/visualisations/story-galaxy" className="btn btn-secondary btn-large">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .viz-categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .category-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-blue);
        }

        .category-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .category-card h3 {
          font-size: 20px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .category-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin: 0;
        }

        .visualisations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: var(--space-xl);
        }

        .viz-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .viz-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: var(--color-brand-blue);
        }

        .viz-preview {
          background: linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-green));
          color: var(--color-white);
          padding: var(--space-xl);
          text-align: center;
          position: relative;
        }

        .viz-icon {
          font-size: 64px;
          margin-bottom: var(--space-md);
        }

        .viz-category {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .viz-content {
          padding: var(--space-xl);
        }

        .viz-content h3 {
          font-size: 24px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .viz-content p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .viz-features {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
          margin-bottom: var(--space-xl);
        }

        .feature-tag {
          font-size: 12px;
          background: var(--color-gray-lighter);
          color: var(--color-ink);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .viz-actions {
          display: flex;
          gap: var(--space-md);
        }

        .use-cases {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .use-case {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
        }

        .use-case-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .use-case-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .use-case-header h4 {
          font-size: 18px;
          margin: 0;
          color: var(--color-ink);
        }

        .use-case ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .use-case li {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-sm);
          padding-left: var(--space-md);
          position: relative;
          line-height: 1.5;
        }

        .use-case li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--color-brand-blue);
          font-weight: 600;
        }

        .interactive-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        .feature-item {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-lg);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
        }

        .feature-icon {
          font-size: 32px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .feature-content h4 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .feature-content p {
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .visualisations-grid {
            grid-template-columns: 1fr;
          }

          .viz-actions {
            flex-direction: column;
          }

          .feature-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}