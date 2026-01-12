'use client';

import React from 'react';
import Link from 'next/link';

export default function PolicyIntegrationPage() {
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
              <div className="module-hero-icon">🏛️</div>
              <div>
                <div className="hero-badge">POLICY MODULE</div>
                <h1 className="hero-title">Policy Integration</h1>
                <p className="hero-description">
                  Transform community stories into policy evidence with direct integration 
                  to government systems, automated report generation, and stakeholder engagement tools.
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
            <h2>From Stories to Policy Change</h2>
            <p>Bridge the gap between lived experience and legislative action</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3>Automated Policy Briefs</h3>
              <p>Generate evidence-based policy recommendations directly from community story patterns and insights</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3>Stakeholder Mapping</h3>
              <p>Identify and engage key policymakers, officials, and decision-makers relevant to community issues</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Impact Tracking</h3>
              <p>Monitor policy implementation and measure real-world outcomes from legislative changes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Pipeline */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Story-to-Policy Pipeline</h2>
            <p>A systematic approach to transforming community experiences into legislative change</p>
          </div>

          <div className="pipeline-flow">
            <div className="pipeline-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Story Collection & Analysis</h3>
                <p>Community stories are analysed for common themes, policy gaps, and systemic issues</p>
                <div className="step-tools">
                  <span className="tool-tag">Pattern recognition</span>
                  <span className="tool-tag">Sentiment analysis</span>
                  <span className="tool-tag">Issue categorisation</span>
                </div>
              </div>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Evidence Synthesis</h3>
                <p>Stories are combined with quantitative data to create compelling policy evidence</p>
                <div className="step-tools">
                  <span className="tool-tag">Data integration</span>
                  <span className="tool-tag">Statistical analysis</span>
                  <span className="tool-tag">Research correlation</span>
                </div>
              </div>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Policy Brief Generation</h3>
                <p>Automated creation of professional policy documents tailored for specific audiences</p>
                <div className="step-tools">
                  <span className="tool-tag">Template customisation</span>
                  <span className="tool-tag">Audience targeting</span>
                  <span className="tool-tag">Multi-format output</span>
                </div>
              </div>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="pipeline-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Stakeholder Engagement</h3>
                <p>Direct delivery to relevant policymakers with follow-up tracking and engagement</p>
                <div className="step-tools">
                  <span className="tool-tag">Automated delivery</span>
                  <span className="tool-tag">Read tracking</span>
                  <span className="tool-tag">Response monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Government Integration */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Government System Integration</h2>
            <p>Seamless connection with existing government processes and databases</p>
          </div>

          <div className="integration-features">
            <div className="integration-card">
              <div className="integration-icon">🏢</div>
              <div className="integration-content">
                <h4>Parliamentary Systems</h4>
                <p>Direct integration with parliamentary petition systems, committee processes, and legislative tracking</p>
                <ul>
                  <li>Automated petition submission</li>
                  <li>Committee hearing scheduling</li>
                  <li>Bill amendment tracking</li>
                  <li>Voting record correlation</li>
                </ul>
              </div>
            </div>

            <div className="integration-card">
              <div className="integration-icon">📊</div>
              <div className="integration-content">
                <h4>Statistical Agencies</h4>
                <p>Connect community stories with official statistics and census data for comprehensive policy evidence</p>
                <ul>
                  <li>Census data correlation</li>
                  <li>Health statistics integration</li>
                  <li>Economic indicator matching</li>
                  <li>Demographic analysis</li>
                </ul>
              </div>
            </div>

            <div className="integration-card">
              <div className="integration-icon">⚖️</div>
              <div className="integration-content">
                <h4>Regulatory Bodies</h4>
                <p>Interface with industry regulators and oversight bodies for sector-specific policy recommendations</p>
                <ul>
                  <li>Complaint system integration</li>
                  <li>Compliance monitoring</li>
                  <li>Industry consultation</li>
                  <li>Regulatory impact assessment</li>
                </ul>
              </div>
            </div>

            <div className="integration-card">
              <div className="integration-icon">🏛️</div>
              <div className="integration-content">
                <h4>Local Government</h4>
                <p>Connect with council systems, planning processes, and local decision-making frameworks</p>
                <ul>
                  <li>Council agenda integration</li>
                  <li>Planning application correlation</li>
                  <li>Budget consultation</li>
                  <li>Service delivery monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Formats */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Policy Document Formats</h2>
            <p>Professional outputs tailored for different government contexts</p>
          </div>

          <div className="format-grid">
            <div className="format-card">
              <div className="format-header">
                <div className="format-icon">📋</div>
                <h4>Executive Summary</h4>
              </div>
              <p>Concise 1-2 page summaries highlighting key issues and recommendations for busy decision-makers</p>
              <div className="format-features">
                <span className="format-tag">Key findings</span>
                <span className="format-tag">Action items</span>
                <span className="format-tag">Cost implications</span>
              </div>
            </div>

            <div className="format-card">
              <div className="format-header">
                <div className="format-icon">📊</div>
                <h4>Research Brief</h4>
              </div>
              <p>Comprehensive analysis with methodology, findings, and detailed recommendations for policy researchers</p>
              <div className="format-features">
                <span className="format-tag">Literature review</span>
                <span className="format-tag">Statistical analysis</span>
                <span className="format-tag">International comparisons</span>
              </div>
            </div>

            <div className="format-card">
              <div className="format-header">
                <div className="format-icon">⚡</div>
                <h4>Rapid Response</h4>
              </div>
              <p>Quick-turnaround analysis for urgent policy issues requiring immediate attention</p>
              <div className="format-features">
                <span className="format-tag">Urgent issues</span>
                <span className="format-tag">24-hour delivery</span>
                <span className="format-tag">Crisis response</span>
              </div>
            </div>

            <div className="format-card">
              <div className="format-header">
                <div className="format-icon">🎯</div>
                <h4>Implementation Guide</h4>
              </div>
              <p>Step-by-step guidance for policy implementation including timelines and resource requirements</p>
              <div className="format-features">
                <span className="format-tag">Implementation steps</span>
                <span className="format-tag">Resource planning</span>
                <span className="format-tag">Success metrics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Policy Impact Results</h2>
            <p>Measurable outcomes from story-driven policy advocacy</p>
          </div>

          <div className="success-stats">
            <div className="stat-item">
              <div className="stat-number">156</div>
              <div className="stat-label">Policies Changed</div>
              <p>Legislative and regulatory changes directly attributed to community story evidence</p>
            </div>

            <div className="stat-item">
              <div className="stat-number">£2.8B</div>
              <div className="stat-label">Funding Allocated</div>
              <p>Government investment secured through compelling community evidence</p>
            </div>

            <div className="stat-item">
              <div className="stat-number">78%</div>
              <div className="stat-label">Faster Policy Response</div>
              <p>Reduction in time from issue identification to policy implementation</p>
            </div>

            <div className="stat-item">
              <div className="stat-number">4.2M</div>
              <div className="stat-label">Lives Improved</div>
              <p>People directly benefiting from policy changes driven by community stories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Policy Success Stories</h2>
            <p>Real examples of stories transforming into policy change</p>
          </div>

          <div className="policy-cases">
            <div className="case-card">
              <div className="case-type">Healthcare Policy</div>
              <h4>Mental Health Services Reform</h4>
              <p>Youth mental health stories led to £50M investment in community mental health services and policy changes reducing waiting times by 60%.</p>
              <div className="case-details">
                <span className="detail-item">📈 2,300 stories analysed</span>
                <span className="detail-item">⏱️ 18 months to implementation</span>
                <span className="detail-item">👥 150,000 people affected</span>
              </div>
            </div>

            <div className="case-card">
              <div className="case-type">Housing Policy</div>
              <h4>Affordable Housing Initiative</h4>
              <p>Tenant stories about housing insecurity resulted in new social housing regulations and £200M affordable housing program.</p>
              <div className="case-details">
                <span className="detail-item">📈 1,800 stories collected</span>
                <span className="detail-item">⏱️ 12 months to policy change</span>
                <span className="detail-item">👥 50,000 households helped</span>
              </div>
            </div>

            <div className="case-card">
              <div className="case-type">Education Policy</div>
              <h4>Inclusive Education Standards</h4>
              <p>Parent and student stories about disability discrimination led to comprehensive inclusive education policy reforms across 200 schools.</p>
              <div className="case-details">
                <span className="detail-item">📈 950 stories from families</span>
                <span className="detail-item">⏱️ 24 months implementation</span>
                <span className="detail-item">👥 80,000 students impacted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Transform Stories into Policy Change</h2>
            <p>Give your community stories the policy impact they deserve</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Start Policy Integration
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                See Policy Success Stories
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

        .pipeline-flow {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          max-width: 1200px;
          margin: 0 auto;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pipeline-step {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          max-width: 250px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .pipeline-step:hover {
          border-color: var(--color-brand-blue);
          transform: translateY(-4px);
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: var(--color-brand-blue);
          color: var(--color-white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin: 0 auto var(--space-md) auto;
        }

        .step-content h3 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
        }

        .step-content p {
          color: var(--color-ink-light);
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: var(--space-md);
        }

        .step-tools {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
          justify-content: center;
        }

        .tool-tag {
          font-size: 12px;
          background: var(--color-brand-blue);
          color: var(--color-white);
          padding: 4px 6px;
          border-radius: 6px;
          font-weight: 500;
        }

        .pipeline-arrow {
          font-size: 24px;
          color: var(--color-brand-blue);
          font-weight: bold;
        }

        .integration-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        .integration-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .integration-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          border-color: var(--color-brand-green);
        }

        .integration-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .integration-content h4 {
          font-size: 20px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .integration-content p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .integration-content ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .integration-content li {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-xs);
          padding-left: var(--space-md);
          position: relative;
        }

        .integration-content li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .format-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .format-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .format-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .format-icon {
          font-size: 48px;
        }

        .format-header h4 {
          font-size: 18px;
          margin: 0;
        }

        .format-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .format-features {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
          justify-content: center;
        }

        .format-tag {
          font-size: 12px;
          background: var(--color-gray-lighter);
          color: var(--color-ink);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .success-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .stat-item {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.2s ease;
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .stat-number {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .stat-label {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-md);
        }

        .stat-item p {
          font-size: 14px;
          color: var(--color-ink-light);
          line-height: 1.5;
          margin: 0;
        }

        .policy-cases {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-xl);
        }

        .case-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .case-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-green);
        }

        .case-type {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-brand-blue);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-sm);
        }

        .case-card h4 {
          font-size: 20px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .case-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .case-details {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .detail-item {
          font-size: 12px;
          background: var(--color-gray-lighter);
          color: var(--color-ink);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .module-hero-content {
            flex-direction: column;
            text-align: center;
          }

          .pipeline-flow {
            flex-direction: column;
          }

          .pipeline-arrow {
            transform: rotate(90deg);
          }

          .success-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .policy-cases {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}