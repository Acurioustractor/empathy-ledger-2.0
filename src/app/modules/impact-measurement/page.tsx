'use client';

import React from 'react';
import Link from 'next/link';

export default function ImpactMeasurementPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="module-hero">
            <Link href="/modules" className="back-link">
              ← Back to Modules
            </Link>
            
            <div className="module-hero-content">
              <div className="module-hero-icon">📈</div>
              <div>
                <div className="hero-badge">ANALYTICS MODULE</div>
                <h1 className="hero-title">Impact Measurement</h1>
                <p className="hero-description">
                  Measure real-world change from community stories with comprehensive 
                  analytics, outcome tracking, and evidence-based impact reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Measure What Matters</h2>
            <p>Turn community stories into compelling evidence of change</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Outcome Tracking</h3>
              <p>Track policy changes, service improvements, and community wellbeing indicators linked to stories</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3>Longitudinal Analysis</h3>
              <p>Monitor community changes over time with comprehensive trend analysis and predictive insights</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3>Impact Reports</h3>
              <p>Generate compelling reports for funders, policymakers, and communities with visual storytelling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Measurement Frameworks */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Comprehensive Impact Frameworks</h2>
            <p>Multiple approaches to capture the full spectrum of community change</p>
          </div>

          <div className="frameworks-grid">
            <div className="framework-card">
              <div className="framework-header">
                <div className="framework-icon">🎯</div>
                <h3>Theory of Change</h3>
              </div>
              <p>Map how stories contribute to long-term community outcomes through evidence-based pathways</p>
              <div className="framework-features">
                <ul>
                  <li>Causal pathway mapping</li>
                  <li>Assumption testing</li>
                  <li>Milestone tracking</li>
                  <li>Adaptive management</li>
                </ul>
              </div>
            </div>

            <div className="framework-card">
              <div className="framework-header">
                <div className="framework-icon">💎</div>
                <h3>Social Return on Investment</h3>
              </div>
              <p>Calculate the monetary value of social outcomes generated through community storytelling</p>
              <div className="framework-features">
                <ul>
                  <li>Outcome monetisation</li>
                  <li>Stakeholder valuation</li>
                  <li>Attribution analysis</li>
                  <li>SROI ratio calculation</li>
                </ul>
              </div>
            </div>

            <div className="framework-card">
              <div className="framework-header">
                <div className="framework-icon">🌱</div>
                <h3>Wellbeing Indicators</h3>
              </div>
              <p>Monitor community wellbeing across mental health, social connection, and quality of life dimensions</p>
              <div className="framework-features">
                <ul>
                  <li>Mental health metrics</li>
                  <li>Social cohesion indices</li>
                  <li>Economic security measures</li>
                  <li>Cultural vitality indicators</li>
                </ul>
              </div>
            </div>

            <div className="framework-card">
              <div className="framework-header">
                <div className="framework-icon">⚖️</div>
                <h3>Rights-Based Assessment</h3>
              </div>
              <p>Track progress on human rights, equity, and justice through community-defined indicators</p>
              <div className="framework-features">
                <ul>
                  <li>Rights realisation tracking</li>
                  <li>Equity gap analysis</li>
                  <li>Participation quality assessment</li>
                  <li>Accountability monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Integration */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Holistic Data Integration</h2>
            <p>Combine qualitative stories with quantitative data for comprehensive impact evidence</p>
          </div>

          <div className="integration-types">
            <div className="integration-item">
              <div className="integration-icon">📊</div>
              <div className="integration-content">
                <h4>Government Data</h4>
                <p>Integrate with health, education, housing, and crime statistics to show broader community trends</p>
              </div>
            </div>

            <div className="integration-item">
              <div className="integration-icon">🏥</div>
              <div className="integration-content">
                <h4>Service Provider Metrics</h4>
                <p>Connect with healthcare, social services, and education providers to track service improvements</p>
              </div>
            </div>

            <div className="integration-item">
              <div className="integration-icon">📱</div>
              <div className="integration-content">
                <h4>Community Surveys</h4>
                <p>Regular pulse surveys to validate story insights and track community sentiment over time</p>
              </div>
            </div>

            <div className="integration-item">
              <div className="integration-icon">🗞️</div>
              <div className="integration-content">
                <h4>Media & Policy Tracking</h4>
                <p>Monitor policy changes, media coverage, and public discourse linked to community stories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Visualisations */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Compelling Impact Visualisations</h2>
            <p>Transform data into powerful visual narratives that drive action</p>
          </div>

          <div className="visualisation-gallery">
            <div className="viz-card">
              <div className="viz-preview">
                <div className="viz-chart">📊</div>
              </div>
              <h4>Impact Dashboards</h4>
              <p>Real-time dashboards showing key metrics, trends, and progress towards community goals</p>
            </div>

            <div className="viz-card">
              <div className="viz-preview">
                <div className="viz-chart">🗺️</div>
              </div>
              <h4>Geographic Heat Maps</h4>
              <p>Visualise impact across different neighbourhoods, regions, or demographic groups</p>
            </div>

            <div className="viz-card">
              <div className="viz-preview">
                <div className="viz-chart">📈</div>
              </div>
              <h4>Outcome Timelines</h4>
              <p>Track policy changes, service improvements, and community milestones over time</p>
            </div>

            <div className="viz-card">
              <div className="viz-preview">
                <div className="viz-chart">🌐</div>
              </div>
              <h4>Network Diagrams</h4>
              <p>Show connections between stories, stakeholders, and outcomes in interactive networks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Proven Impact Results</h2>
            <p>Real outcomes from communities using impact measurement tools</p>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">£12.3M</div>
              <div className="metric-label">Policy Investment Generated</div>
              <p>Direct funding secured through evidence-based impact reports</p>
            </div>

            <div className="metric-card">
              <div className="metric-value">340%</div>
              <div className="metric-label">Increase in Service Usage</div>
              <p>Average improvement in service uptake after story-driven changes</p>
            </div>

            <div className="metric-card">
              <div className="metric-value">89%</div>
              <div className="metric-label">Community Satisfaction</div>
              <p>Residents report feeling heard and seeing meaningful change</p>
            </div>

            <div className="metric-card">
              <div className="metric-value">45</div>
              <div className="metric-label">Policy Changes</div>
              <p>Documented policy improvements driven by community evidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Start Measuring Your Impact Today</h2>
            <p>Turn community stories into evidence that drives real change</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Measure Impact
              </Link>
              <Link href="/visualisations" className="btn btn-secondary btn-large">
                See Sample Reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .module-hero {
          max-width: 1000px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--color-gray);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: var(--space-xl);
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: var(--color-ink);
        }

        .module-hero-content {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2xl);
        }

        .module-hero-icon {
          font-size: 80px;
          line-height: 1;
          flex-shrink: 0;
        }

        .feature-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-green);
        }

        .frameworks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        .framework-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .framework-card:hover {
          border-color: var(--color-brand-green);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.1);
        }

        .framework-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .framework-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .framework-header h3 {
          font-size: 20px;
          margin: 0;
        }

        .framework-card > p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .framework-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .framework-features li {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-xs);
          padding-left: var(--space-md);
          position: relative;
        }

        .framework-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .integration-types {
          display: grid;
          gap: var(--space-xl);
          max-width: 800px;
          margin: 0 auto;
        }

        .integration-item {
          display: flex;
          gap: var(--space-lg);
          align-items: center;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
        }

        .integration-icon {
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

        .integration-content h4 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
        }

        .integration-content p {
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.6;
        }

        .visualisation-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .viz-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-lg);
          text-align: center;
          transition: all 0.3s ease;
        }

        .viz-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-blue);
        }

        .viz-preview {
          background: var(--color-gray-lighter);
          border-radius: 8px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-lg);
        }

        .viz-chart {
          font-size: 48px;
        }

        .viz-card h4 {
          font-size: 16px;
          margin-bottom: var(--space-sm);
        }

        .viz-card p {
          font-size: 14px;
          color: var(--color-ink-light);
          line-height: 1.5;
          margin: 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .metric-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.2s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .metric-value {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-brand-green);
          margin-bottom: var(--space-xs);
        }

        .metric-label {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-md);
        }

        .metric-card p {
          font-size: 14px;
          color: var(--color-ink-light);
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .module-hero-content {
            flex-direction: column;
            text-align: center;
          }

          .integration-item {
            flex-direction: column;
            text-align: center;
          }

          .frameworks-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}