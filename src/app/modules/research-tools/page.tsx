'use client';

import React from 'react';
import Link from 'next/link';

export default function ResearchToolsPage() {
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
              <div className="module-hero-icon">🔬</div>
              <div>
                <div className="hero-badge">RESEARCH MODULE</div>
                <h1 className="hero-title">Research Tools</h1>
                <p className="hero-description">
                  Comprehensive research platform for ethical community-based research 
                  with advanced analytics, participant management, and publication tools.
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
            <h2>Ethical Research Excellence</h2>
            <p>Research tools that put community benefit first</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3>Community-Based Research</h3>
              <p>Tools designed for participatory research where communities control the research agenda and outcomes</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3>Advanced Analytics Suite</h3>
              <p>Sophisticated analysis tools including qualitative coding, statistical analysis, and mixed-methods research</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3>Publication & Dissemination</h3>
              <p>Integrated tools for creating research outputs that honour community ownership and traditional knowledge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Methodologies */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Supported Research Methodologies</h2>
            <p>Comprehensive support for diverse research approaches and cultural epistemologies</p>
          </div>

          <div className="methodology-grid">
            <div className="methodology-card">
              <div className="methodology-header">
                <div className="methodology-icon">📊</div>
                <h3>Mixed Methods Research</h3>
              </div>
              <p>Combine quantitative and qualitative approaches for comprehensive understanding of community experiences</p>
              <div className="methodology-tools">
                <ul>
                  <li>Sequential explanatory design</li>
                  <li>Concurrent triangulation</li>
                  <li>Transformative frameworks</li>
                  <li>Data integration protocols</li>
                </ul>
              </div>
            </div>

            <div className="methodology-card">
              <div className="methodology-header">
                <div className="methodology-icon">🎭</div>
                <h3>Participatory Action Research</h3>
              </div>
              <p>Community-driven research where participants are co-researchers working toward social change</p>
              <div className="methodology-tools">
                <ul>
                  <li>Co-researcher training</li>
                  <li>Action planning cycles</li>
                  <li>Reflection protocols</li>
                  <li>Change implementation</li>
                </ul>
              </div>
            </div>

            <div className="methodology-card">
              <div className="methodology-header">
                <div className="methodology-icon">📖</div>
                <h3>Narrative Inquiry</h3>
              </div>
              <p>Deep exploration of lived experiences through story analysis and meaning-making processes</p>
              <div className="methodology-tools">
                <ul>
                  <li>Story structure analysis</li>
                  <li>Thematic coding</li>
                  <li>Counter-narrative identification</li>
                  <li>Meaning interpretation</li>
                </ul>
              </div>
            </div>

            <div className="methodology-card">
              <div className="methodology-header">
                <div className="methodology-icon">🌍</div>
                <h3>Indigenous Research Methods</h3>
              </div>
              <p>Research approaches grounded in Indigenous ways of knowing, cultural protocols, and community governance</p>
              <div className="methodology-tools">
                <ul>
                  <li>Ceremony-based research</li>
                  <li>Storytelling methodologies</li>
                  <li>Land-based knowledge</li>
                  <li>Elder-guided inquiry</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Features */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Advanced Analytics Capabilities</h2>
            <p>Powerful analysis tools that respect community values and cultural protocols</p>
          </div>

          <div className="analytics-features">
            <div className="analytics-section">
              <h4>Qualitative Analysis</h4>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">🏷️</div>
                  <div className="feature-content">
                    <h5>Automated Coding</h5>
                    <p>AI-assisted thematic coding with human oversight and cultural sensitivity checks</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔍</div>
                  <div className="feature-content">
                    <h5>Content Analysis</h5>
                    <p>Systematic analysis of story content including sentiment, themes, and linguistic patterns</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🌐</div>
                  <div className="feature-content">
                    <h5>Cross-Cultural Comparison</h5>
                    <p>Compare themes and patterns across different cultural contexts and communities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="analytics-section">
              <h4>Quantitative Analysis</h4>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">📈</div>
                  <div className="feature-content">
                    <h5>Statistical Modeling</h5>
                    <p>Advanced statistical analysis including regression, correlation, and predictive modeling</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📊</div>
                  <div className="feature-content">
                    <h5>Demographic Analysis</h5>
                    <p>Analyse story patterns across different demographic groups while protecting privacy</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-content">
                    <h5>Impact Measurement</h5>
                    <p>Quantify research outcomes and community impact using validated measurement frameworks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Research Framework */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Ethical Research Framework</h2>
            <p>Built-in ethical safeguards that go beyond traditional research ethics</p>
          </div>

          <div className="ethics-pillars">
            <div className="pillar-card">
              <div className="pillar-icon">🤝</div>
              <h4>Community Benefit</h4>
              <p>Research must demonstrably benefit the participating community, not just advance academic knowledge</p>
              <div className="pillar-requirements">
                <span className="req-tag">Community approval required</span>
                <span className="req-tag">Benefit sharing agreements</span>
                <span className="req-tag">Results dissemination plan</span>
              </div>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">👑</div>
              <h4>Community Control</h4>
              <p>Communities retain control over research processes, data use, and publication decisions</p>
              <div className="pillar-requirements">
                <span className="req-tag">Data governance protocols</span>
                <span className="req-tag">Publication approval</span>
                <span className="req-tag">Research agenda setting</span>
              </div>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">🛡️</div>
              <h4>Cultural Protection</h4>
              <p>Sacred, sensitive, or culturally significant content receives special protection and handling</p>
              <div className="pillar-requirements">
                <span className="req-tag">Cultural review boards</span>
                <span className="req-tag">Sacred content protocols</span>
                <span className="req-tag">Traditional knowledge respect</span>
              </div>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">⚖️</div>
              <h4>Equitable Partnership</h4>
              <p>True partnership between researchers and communities with shared power and decision-making</p>
              <div className="pillar-requirements">
                <span className="req-tag">Co-researcher training</span>
                <span className="req-tag">Capacity building</span>
                <span className="req-tag">Resource sharing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publication Tools */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Community-Controlled Publication</h2>
            <p>Research outputs that honour community ownership and traditional knowledge systems</p>
          </div>

          <div className="publication-options">
            <div className="pub-card">
              <div className="pub-icon">📄</div>
              <div className="pub-content">
                <h4>Academic Publications</h4>
                <p>Traditional academic papers with community co-authorship and benefit-sharing agreements</p>
                <div className="pub-features">
                  <span className="pub-tag">Peer review support</span>
                  <span className="pub-tag">Co-authorship protocols</span>
                  <span className="pub-tag">Open access publishing</span>
                </div>
              </div>
            </div>

            <div className="pub-card">
              <div className="pub-icon">📱</div>
              <div className="pub-content">
                <h4>Community Reports</h4>
                <p>Accessible summaries designed for community members and local stakeholders</p>
                <div className="pub-features">
                  <span className="pub-tag">Plain language</span>
                  <span className="pub-tag">Visual storytelling</span>
                  <span className="pub-tag">Multi-language support</span>
                </div>
              </div>
            </div>

            <div className="pub-card">
              <div className="pub-icon">🎥</div>
              <div className="pub-content">
                <h4>Multimedia Presentations</h4>
                <p>Interactive presentations combining data visualisation with community stories</p>
                <div className="pub-features">
                  <span className="pub-tag">Story integration</span>
                  <span className="pub-tag">Interactive dashboards</span>
                  <span className="pub-tag">Presentation tools</span>
                </div>
              </div>
            </div>

            <div className="pub-card">
              <div className="pub-icon">🌐</div>
              <div className="pub-content">
                <h4>Policy Briefs</h4>
                <p>Research-based policy recommendations formatted for government and decision-makers</p>
                <div className="pub-features">
                  <span className="pub-tag">Evidence synthesis</span>
                  <span className="pub-tag">Recommendation frameworks</span>
                  <span className="pub-tag">Implementation guides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Impact */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Research Impact Achievements</h2>
            <p>Measurable outcomes from community-controlled research projects</p>
          </div>

          <div className="impact-metrics">
            <div className="impact-card">
              <div className="impact-stat">340+</div>
              <div className="impact-label">Research Projects</div>
              <p>Community-controlled research studies completed with full community ownership</p>
            </div>

            <div className="impact-card">
              <div className="impact-stat">89%</div>
              <div className="impact-label">Community Satisfaction</div>
              <p>Participating communities report research met their needs and expectations</p>
            </div>

            <div className="impact-card">
              <div className="impact-stat">£45M</div>
              <div className="impact-label">Funding Secured</div>
              <p>Additional funding attracted by communities through research evidence</p>
            </div>

            <div className="impact-card">
              <div className="impact-stat">180</div>
              <div className="impact-label">Policy Changes</div>
              <p>Direct policy and service changes resulting from community research findings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Start Ethical Community Research</h2>
            <p>Research tools that put community benefit and control first</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Begin Research Project
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                See Research Impact
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

        .methodology-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        .methodology-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .methodology-card:hover {
          border-color: var(--color-brand-blue);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
        }

        .methodology-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .methodology-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .methodology-header h3 {
          font-size: 20px;
          margin: 0;
        }

        .methodology-card > p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .methodology-tools ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .methodology-tools li {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-xs);
          padding-left: var(--space-md);
          position: relative;
        }

        .methodology-tools li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-brand-blue);
          font-weight: 600;
        }

        .analytics-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-3xl);
        }

        .analytics-section h4 {
          font-size: 24px;
          margin-bottom: var(--space-xl);
          color: var(--color-ink);
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
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
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .feature-content h5 {
          font-size: 16px;
          margin-bottom: var(--space-xs);
          color: var(--color-ink);
        }

        .feature-content p {
          font-size: 14px;
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.5;
        }

        .ethics-pillars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .pillar-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .pillar-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          border-color: var(--color-brand-green);
        }

        .pillar-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .pillar-card h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .pillar-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .pillar-requirements {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
          justify-content: center;
        }

        .req-tag {
          font-size: 12px;
          background: var(--color-brand-green);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .publication-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .pub-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .pub-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .pub-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .pub-content h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .pub-content p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .pub-features {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
          justify-content: center;
        }

        .pub-tag {
          font-size: 12px;
          background: var(--color-gray-lighter);
          color: var(--color-ink);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .impact-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .impact-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.2s ease;
        }

        .impact-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .impact-stat {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .impact-label {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-md);
        }

        .impact-card p {
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

          .methodology-grid {
            grid-template-columns: 1fr;
          }

          .analytics-features {
            grid-template-columns: 1fr;
            gap: var(--space-2xl);
          }

          .feature-item {
            flex-direction: column;
            text-align: center;
          }

          .impact-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}