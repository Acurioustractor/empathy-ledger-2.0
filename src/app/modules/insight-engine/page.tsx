'use client';

import React from 'react';
import Link from 'next/link';

export default function InsightEnginePage() {
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
              <div className="module-hero-icon">🧠</div>
              <div>
                <div className="hero-badge">ANALYTICS MODULE</div>
                <h1 className="hero-title">Insight Engine</h1>
                <p className="hero-description">
                  AI-powered analysis that respects privacy and community values. 
                  Transform stories into actionable insights while maintaining ethical standards.
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
            <h2>Ethical AI Analysis</h2>
            <p>Powerful insights without compromising privacy or cultural values</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>Theme Extraction</h3>
              <p>Identify common themes and patterns across stories while preserving individual context</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3>Sentiment Analysis</h3>
              <p>Understand emotional context and community wellbeing through respectful analysis</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Impact Measurement</h3>
              <p>Track real-world outcomes and policy changes driven by community stories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Types */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Types of Insights</h2>
            <p>From individual reflection to community-wide patterns</p>
          </div>

          <div className="insight-types">
            <div className="insight-type">
              <div className="insight-type-header">
                <div className="insight-type-icon">🔍</div>
                <h3>Pattern Recognition</h3>
              </div>
              <p>Identify recurring themes, barriers, and opportunities across similar stories</p>
              <div className="insight-examples">
                <h4>Examples:</h4>
                <ul>
                  <li>Common challenges in accessing healthcare</li>
                  <li>Successful support strategies</li>
                  <li>Barriers to community participation</li>
                  <li>Effective policy interventions</li>
                </ul>
              </div>
            </div>

            <div className="insight-type">
              <div className="insight-type-header">
                <div className="insight-type-icon">📊</div>
                <h3>Trend Analysis</h3>
              </div>
              <p>Track how community sentiment and experiences evolve over time</p>
              <div className="insight-examples">
                <h4>Examples:</h4>
                <ul>
                  <li>Service improvement over time</li>
                  <li>Community resilience measures</li>
                  <li>Policy impact tracking</li>
                  <li>Seasonal pattern recognition</li>
                </ul>
              </div>
            </div>

            <div className="insight-type">
              <div className="insight-type-header">
                <div className="insight-type-icon">🎯</div>
                <h3>Predictive Insights</h3>
              </div>
              <p>Identify early warning signs and opportunities for proactive intervention</p>
              <div className="insight-examples">
                <h4>Examples:</h4>
                <ul>
                  <li>Crisis prevention indicators</li>
                  <li>Service gap identification</li>
                  <li>Community risk assessment</li>
                  <li>Resource allocation optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical AI Principles */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Ethical AI Principles</h2>
            <p>Technology that serves communities, not shareholders</p>
          </div>

          <div className="ethics-grid">
            <div className="ethics-principle">
              <div className="ethics-icon">🤝</div>
              <h4>Community Consent</h4>
              <p>AI analysis only happens with explicit community permission</p>
            </div>
            <div className="ethics-principle">
              <div className="ethics-icon">🔬</div>
              <h4>Transparent Algorithms</h4>
              <p>Open-source algorithms that communities can inspect and understand</p>
            </div>
            <div className="ethics-principle">
              <div className="ethics-icon">⚖️</div>
              <h4>Bias Detection</h4>
              <p>Continuous monitoring for algorithmic bias with community oversight</p>
            </div>
            <div className="ethics-principle">
              <div className="ethics-icon">🎭</div>
              <h4>Cultural Context</h4>
              <p>AI trained to understand and respect diverse cultural perspectives</p>
            </div>
            <div className="ethics-principle">
              <div className="ethics-icon">🔄</div>
              <h4>Human Oversight</h4>
              <p>Every analysis reviewed by human experts from the community</p>
            </div>
            <div className="ethics-principle">
              <div className="ethics-icon">🛡️</div>
              <h4>Privacy Preservation</h4>
              <p>Differential privacy and homomorphic encryption protect individual stories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Advanced Technical Capabilities</h2>
            <p>Cutting-edge AI with ethical guardrails</p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-header">
                <div className="capability-icon">🗣️</div>
                <h3>Natural Language Processing</h3>
              </div>
              <ul className="capability-features">
                <li>Multi-language support (50+ languages)</li>
                <li>Cultural dialect recognition</li>
                <li>Emotional context understanding</li>
                <li>Metaphor and cultural reference analysis</li>
              </ul>
            </div>

            <div className="capability-card">
              <div className="capability-header">
                <div className="capability-icon">🎵</div>
                <h3>Multimodal Analysis</h3>
              </div>
              <ul className="capability-features">
                <li>Audio emotion detection</li>
                <li>Video sentiment analysis</li>
                <li>Image context recognition</li>
                <li>Cross-modal pattern matching</li>
              </ul>
            </div>

            <div className="capability-card">
              <div className="capability-header">
                <div className="capability-icon">🌐</div>
                <h3>Network Analysis</h3>
              </div>
              <ul className="capability-features">
                <li>Community relationship mapping</li>
                <li>Influence pattern identification</li>
                <li>Information flow analysis</li>
                <li>Support network visualization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Output Formats */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Insight Delivery</h2>
            <p>Information formatted for different audiences and needs</p>
          </div>

          <div className="output-formats">
            <div className="output-format">
              <div className="output-icon">📋</div>
              <div className="output-content">
                <h3>Community Reports</h3>
                <p>Accessible summaries for community members and stakeholders</p>
                <div className="format-features">
                  <span className="format-tag">Visual infographics</span>
                  <span className="format-tag">Key findings</span>
                  <span className="format-tag">Action recommendations</span>
                </div>
              </div>
            </div>

            <div className="output-format">
              <div className="output-icon">📊</div>
              <div className="output-content">
                <h3>Policy Briefs</h3>
                <p>Evidence-based recommendations for policymakers and leaders</p>
                <div className="format-features">
                  <span className="format-tag">Statistical evidence</span>
                  <span className="format-tag">Policy recommendations</span>
                  <span className="format-tag">Implementation guides</span>
                </div>
              </div>
            </div>

            <div className="output-format">
              <div className="output-icon">🔬</div>
              <div className="output-content">
                <h3>Research Data</h3>
                <p>Anonymised datasets for academic and policy research</p>
                <div className="format-features">
                  <span className="format-tag">Statistical analysis</span>
                  <span className="format-tag">Methodology documentation</span>
                  <span className="format-tag">Ethical compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Transform Stories into Action</h2>
            <p>Ethical AI that amplifies community wisdom</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Start Analysis
              </Link>
              <Link href="/visualisations" className="btn btn-secondary btn-large">
                See Example Insights
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

        .insight-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-xl);
        }

        .insight-type {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .insight-type:hover {
          border-color: var(--color-brand-green);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.1);
        }

        .insight-type-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .insight-type-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .insight-type h3 {
          font-size: 20px;
          margin: 0;
        }

        .insight-type > p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .insight-examples h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .insight-examples ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .insight-examples li {
          font-size: 14px;
          color: var(--color-gray);
          margin-bottom: var(--space-xs);
          padding-left: var(--space-md);
          position: relative;
        }

        .insight-examples li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .ethics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        .ethics-principle {
          text-align: center;
          padding: var(--space-lg);
          background: var(--color-gray-lighter);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .ethics-principle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .ethics-icon {
          font-size: 40px;
          margin-bottom: var(--space-md);
        }

        .ethics-principle h4 {
          font-size: 16px;
          margin-bottom: var(--space-sm);
        }

        .ethics-principle p {
          color: var(--color-gray);
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        .capability-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
        }

        .capability-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .capability-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .capability-header h3 {
          font-size: 18px;
          margin: 0;
        }

        .capability-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .capability-features li {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-sm);
          padding-left: var(--space-md);
          position: relative;
        }

        .capability-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .output-formats {
          display: grid;
          gap: var(--space-xl);
          max-width: 800px;
          margin: 0 auto;
        }

        .output-format {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
        }

        .output-icon {
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

        .output-content h3 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
        }

        .output-content p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-md);
          line-height: 1.6;
        }

        .format-features {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .format-tag {
          font-size: 12px;
          background: var(--color-brand-green);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .module-hero-content {
            flex-direction: column;
            text-align: center;
          }

          .output-format {
            flex-direction: column;
            text-align: center;
          }

          .insight-types {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}