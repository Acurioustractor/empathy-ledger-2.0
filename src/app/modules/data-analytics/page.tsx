'use client';

import React from 'react';
import Link from 'next/link';

export default function DataAnalyticsPage() {
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
              <div className="module-hero-icon">📊</div>
              <div>
                <div className="hero-badge">ANALYTICS MODULE</div>
                <h1 className="hero-title">Data Analytics</h1>
                <p className="hero-description">
                  Advanced data analytics platform combining machine learning, 
                  statistical analysis, and community-controlled insights for evidence-based decision making.
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
            <h2>Intelligent Data Analysis</h2>
            <p>Powerful analytics that respect privacy and community values</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>Machine Learning Insights</h3>
              <p>AI-powered pattern recognition and predictive analytics with community oversight and bias detection</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3>Real-Time Dashboards</h3>
              <p>Interactive dashboards that update in real-time with customisable views for different stakeholders</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Statistical Modeling</h3>
              <p>Advanced statistical analysis including regression, correlation, and causal inference with uncertainty quantification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Capabilities */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Comprehensive Analytics Suite</h2>
            <p>From descriptive statistics to predictive modeling and prescriptive analytics</p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-section">
              <h3>Descriptive Analytics</h3>
              <p className="section-desc">Understanding what happened and why</p>
              <div className="capability-items">
                <div className="capability-item">
                  <div className="capability-icon">📈</div>
                  <div className="capability-content">
                    <h4>Trend Analysis</h4>
                    <p>Identify patterns and changes in community sentiment, service usage, and outcomes over time</p>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">🎯</div>
                  <div className="capability-content">
                    <h4>Demographic Segmentation</h4>
                    <p>Analyse story patterns across age, location, culture, and other demographic dimensions</p>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">🔍</div>
                  <div className="capability-content">
                    <h4>Issue Identification</h4>
                    <p>Automatically identify emerging issues and recurring themes from community stories</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="capability-section">
              <h3>Predictive Analytics</h3>
              <p className="section-desc">Forecasting future trends and outcomes</p>
              <div className="capability-items">
                <div className="capability-item">
                  <div className="capability-icon">🔮</div>
                  <div className="capability-content">
                    <h4>Outcome Forecasting</h4>
                    <p>Predict likely outcomes of policy interventions and service changes</p>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">⚠️</div>
                  <div className="capability-content">
                    <h4>Early Warning Systems</h4>
                    <p>Detect early indicators of community crises or emerging issues</p>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">📊</div>
                  <div className="capability-content">
                    <h4>Demand Forecasting</h4>
                    <p>Predict future demand for services based on community story patterns</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="capability-section">
              <h3>Prescriptive Analytics</h3>
              <p className="section-desc">Recommending optimal actions and interventions</p>
              <div className="capability-items">
                <div className="capability-item">
                  <div className="capability-icon">🎯</div>
                  <div className="capability-content">
                    <h4>Intervention Recommendations</h4>
                    <p>AI-generated recommendations for policy and service interventions</p>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">⚖️</div>
                  <div className="capability-content">
                    <h4>Resource Optimisation</h4>
                    <p>Optimise resource allocation based on community needs and story insights</p>
                  </div>
                </div>
                <div className="capability-item">
                  <div className="capability-icon">📋</div>
                  <div className="capability-content">
                    <h4>Action Planning</h4>
                    <p>Generate evidence-based action plans with prioritised interventions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy-Preserving Analytics */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Privacy-Preserving Analytics</h2>
            <p>Advanced analytics that protect individual privacy while enabling community insights</p>
          </div>

          <div className="privacy-methods">
            <div className="privacy-card">
              <div className="privacy-header">
                <div className="privacy-icon">🛡️</div>
                <h4>Differential Privacy</h4>
              </div>
              <p>Mathematical guarantee that individual stories cannot be identified from analytical results</p>
              <div className="privacy-benefits">
                <span className="benefit-tag">Mathematically proven</span>
                <span className="benefit-tag">Industry standard</span>
                <span className="benefit-tag">Tunable privacy levels</span>
              </div>
            </div>

            <div className="privacy-card">
              <div className="privacy-header">
                <div className="privacy-icon">🔐</div>
                <h4>Homomorphic Encryption</h4>
              </div>
              <p>Perform calculations on encrypted data without ever decrypting individual stories</p>
              <div className="privacy-benefits">
                <span className="benefit-tag">Zero plaintext exposure</span>
                <span className="benefit-tag">Cryptographic security</span>
                <span className="benefit-tag">End-to-end protection</span>
              </div>
            </div>

            <div className="privacy-card">
              <div className="privacy-header">
                <div className="privacy-icon">🎭</div>
                <h4>Federated Learning</h4>
              </div>
              <p>Train machine learning models across distributed communities without centralising data</p>
              <div className="privacy-benefits">
                <span className="benefit-tag">Local data processing</span>
                <span className="benefit-tag">Model aggregation</span>
                <span className="benefit-tag">Distributed insights</span>
              </div>
            </div>

            <div className="privacy-card">
              <div className="privacy-header">
                <div className="privacy-icon">🔄</div>
                <h4>Synthetic Data Generation</h4>
              </div>
              <p>Generate statistically accurate synthetic datasets that preserve patterns while protecting individuals</p>
              <div className="privacy-benefits">
                <span className="benefit-tag">Statistical equivalence</span>
                <span className="benefit-tag">Zero re-identification risk</span>
                <span className="benefit-tag">Shareable datasets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Integration */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Multi-Source Data Integration</h2>
            <p>Combine community stories with external data sources for comprehensive analysis</p>
          </div>

          <div className="integration-sources">
            <div className="source-category">
              <h4>Government Data</h4>
              <div className="source-items">
                <div className="source-item">
                  <span className="source-icon">🏥</span>
                  <span className="source-name">Health Statistics</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">📚</span>
                  <span className="source-name">Education Data</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">🏠</span>
                  <span className="source-name">Housing Records</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">💼</span>
                  <span className="source-name">Employment Stats</span>
                </div>
              </div>
            </div>

            <div className="source-category">
              <h4>Social Indicators</h4>
              <div className="source-items">
                <div className="source-item">
                  <span className="source-icon">📱</span>
                  <span className="source-name">Social Media Sentiment</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">🗞️</span>
                  <span className="source-name">News Coverage</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">📊</span>
                  <span className="source-name">Survey Data</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">📈</span>
                  <span className="source-name">Economic Indicators</span>
                </div>
              </div>
            </div>

            <div className="source-category">
              <h4>Environmental Data</h4>
              <div className="source-items">
                <div className="source-item">
                  <span className="source-icon">🌡️</span>
                  <span className="source-name">Climate Data</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">🏭</span>
                  <span className="source-name">Pollution Levels</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">🌳</span>
                  <span className="source-name">Green Space Access</span>
                </div>
                <div className="source-item">
                  <span className="source-icon">🚌</span>
                  <span className="source-name">Transport Usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Results */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Proven Analytics Impact</h2>
            <p>Measurable improvements from data-driven community insights</p>
          </div>

          <div className="results-grid">
            <div className="result-card">
              <div className="result-icon">🎯</div>
              <div className="result-content">
                <div className="result-stat">94%</div>
                <div className="result-label">Prediction Accuracy</div>
                <p>Average accuracy of community outcome predictions across 200+ projects</p>
              </div>
            </div>

            <div className="result-card">
              <div className="result-icon">⚡</div>
              <div className="result-content">
                <div className="result-stat">67%</div>
                <div className="result-label">Faster Issue Detection</div>
                <p>Earlier identification of community issues through predictive analytics</p>
              </div>
            </div>

            <div className="result-card">
              <div className="result-icon">💰</div>
              <div className="result-content">
                <div className="result-stat">£18M</div>
                <div className="result-label">Cost Savings</div>
                <p>Documented savings from optimised resource allocation and prevention</p>
              </div>
            </div>

            <div className="result-card">
              <div className="result-icon">📈</div>
              <div className="result-content">
                <div className="result-stat">156</div>
                <div className="result-label">Data-Driven Policies</div>
                <p>Policy changes implemented based on analytics insights and recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Scalable Technical Architecture</h2>
            <p>Enterprise-grade analytics infrastructure designed for community scale</p>
          </div>

          <div className="architecture-components">
            <div className="arch-layer">
              <h4>Data Layer</h4>
              <div className="arch-items">
                <span className="arch-tag">Data Lakes</span>
                <span className="arch-tag">Real-time Streaming</span>
                <span className="arch-tag">Encrypted Storage</span>
                <span className="arch-tag">Version Control</span>
              </div>
            </div>

            <div className="arch-layer">
              <h4>Processing Layer</h4>
              <div className="arch-items">
                <span className="arch-tag">Distributed Computing</span>
                <span className="arch-tag">Auto-scaling</span>
                <span className="arch-tag">GPU Acceleration</span>
                <span className="arch-tag">Edge Computing</span>
              </div>
            </div>

            <div className="arch-layer">
              <h4>Analytics Layer</h4>
              <div className="arch-items">
                <span className="arch-tag">Machine Learning</span>
                <span className="arch-tag">Statistical Engines</span>
                <span className="arch-tag">NLP Processing</span>
                <span className="arch-tag">Time Series Analysis</span>
              </div>
            </div>

            <div className="arch-layer">
              <h4>Presentation Layer</h4>
              <div className="arch-items">
                <span className="arch-tag">Interactive Dashboards</span>
                <span className="arch-tag">API Endpoints</span>
                <span className="arch-tag">Report Generation</span>
                <span className="arch-tag">Mobile Apps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Unlock Your Community's Data Insights</h2>
            <p>Transform community stories into powerful evidence for change</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Start Analytics Project
              </Link>
              <Link href="/visualisations" className="btn btn-secondary btn-large">
                Explore Dashboards
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
          border-color: var(--color-brand-blue);
        }

        .capabilities-grid {
          display: grid;
          gap: var(--space-3xl);
        }

        .capability-section {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-2xl);
        }

        .capability-section h3 {
          font-size: 24px;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .section-desc {
          color: var(--color-ink-light);
          margin-bottom: var(--space-xl);
        }

        .capability-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .capability-item {
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
          padding: var(--space-lg);
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .capability-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-white);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .capability-content h4 {
          font-size: 16px;
          margin-bottom: var(--space-xs);
          color: var(--color-ink);
        }

        .capability-content p {
          font-size: 14px;
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.5;
        }

        .privacy-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .privacy-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .privacy-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          border-color: var(--color-brand-green);
        }

        .privacy-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
        }

        .privacy-icon {
          font-size: 48px;
        }

        .privacy-header h4 {
          font-size: 18px;
          margin: 0;
          color: var(--color-ink);
        }

        .privacy-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .privacy-benefits {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
          justify-content: center;
        }

        .benefit-tag {
          font-size: 12px;
          background: var(--color-brand-green);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .integration-sources {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-2xl);
        }

        .source-category {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
        }

        .source-category h4 {
          font-size: 20px;
          margin-bottom: var(--space-lg);
          color: var(--color-ink);
          text-align: center;
        }

        .source-items {
          display: grid;
          gap: var(--space-md);
        }

        .source-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .source-icon {
          font-size: 20px;
        }

        .source-name {
          font-size: 14px;
          color: var(--color-ink-light);
          font-weight: 500;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .result-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .result-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .result-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .result-stat {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .result-label {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-md);
        }

        .result-card p {
          font-size: 14px;
          color: var(--color-ink-light);
          line-height: 1.5;
          margin: 0;
        }

        .architecture-components {
          display: grid;
          gap: var(--space-xl);
          max-width: 800px;
          margin: 0 auto;
        }

        .arch-layer {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
        }

        .arch-layer h4 {
          font-size: 20px;
          margin-bottom: var(--space-lg);
          color: var(--color-ink);
        }

        .arch-items {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          justify-content: center;
        }

        .arch-tag {
          font-size: 12px;
          background: var(--color-brand-blue);
          color: var(--color-white);
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .module-hero-content {
            flex-direction: column;
            text-align: center;
          }

          .capability-items {
            grid-template-columns: 1fr;
          }

          .capability-item {
            flex-direction: column;
            text-align: center;
          }

          .results-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .integration-sources {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}