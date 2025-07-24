'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalNetworkPage() {
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
              <div className="module-hero-icon">🌐</div>
              <div>
                <div className="hero-badge">NETWORK MODULE</div>
                <h1 className="hero-title">Global Network</h1>
                <p className="hero-description">
                  Connect communities worldwide through secure storytelling networks, 
                  cross-cultural collaboration, and shared learning experiences.
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
            <h2>Connected Communities Worldwide</h2>
            <p>Building bridges between cultures while respecting sovereignty and privacy</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                </svg>
              </div>
              <h3>Cross-Cultural Exchange</h3>
              <p>Safe spaces for communities to share experiences and learn from each other across cultural boundaries</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>Collaborative Solutions</h3>
              <p>Work together on shared challenges with communities facing similar issues around the world</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3>Knowledge Sharing</h3>
              <p>Create global repositories of community wisdom, best practices, and innovative solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Network Features */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Global Collaboration Tools</h2>
            <p>Technology that connects communities while preserving cultural autonomy</p>
          </div>

          <div className="network-tools">
            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🌍</div>
                <h3>Community Matching</h3>
              </div>
              <p>Intelligent algorithms connect communities facing similar challenges while respecting cultural boundaries</p>
              <div className="tool-features">
                <div className="tool-feature">
                  <span className="feature-name">Issue-Based Matching:</span>
                  <span className="feature-desc">Connect based on shared challenges like housing, healthcare, or education</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Cultural Compatibility:</span>
                  <span className="feature-desc">Respect cultural protocols and communication preferences</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Privacy Controls:</span>
                  <span className="feature-desc">Communities control their visibility and connection preferences</span>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">💬</div>
                <h3>Translation & Interpretation</h3>
              </div>
              <p>Advanced language technology that preserves cultural context and meaning across linguistic barriers</p>
              <div className="tool-features">
                <div className="tool-feature">
                  <span className="feature-name">Cultural Translation:</span>
                  <span className="feature-desc">Context-aware translation that preserves cultural meaning</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Indigenous Languages:</span>
                  <span className="feature-desc">Support for indigenous and minority languages</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Human Oversight:</span>
                  <span className="feature-desc">Community interpreters review sensitive content</span>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">🤝</div>
                <h3>Collaborative Spaces</h3>
              </div>
              <p>Virtual environments for communities to work together on shared projects and initiatives</p>
              <div className="tool-features">
                <div className="tool-feature">
                  <span className="feature-name">Project Workspaces:</span>
                  <span className="feature-desc">Shared spaces for collaborative project development</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Resource Libraries:</span>
                  <span className="feature-desc">Shared repositories of tools, templates, and resources</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Event Coordination:</span>
                  <span className="feature-desc">Tools for organising cross-community events and meetings</span>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <div className="tool-icon">📚</div>
                <h3>Learning Exchange</h3>
              </div>
              <p>Structured programs for communities to share knowledge, skills, and cultural practices</p>
              <div className="tool-features">
                <div className="tool-feature">
                  <span className="feature-name">Peer Learning:</span>
                  <span className="feature-desc">Community-to-community learning programs</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Skill Sharing:</span>
                  <span className="feature-desc">Exchange of practical skills and technical knowledge</span>
                </div>
                <div className="tool-feature">
                  <span className="feature-name">Cultural Exchange:</span>
                  <span className="feature-desc">Respectful sharing of cultural practices and wisdom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Impact Areas */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Global Impact Initiatives</h2>
            <p>Collaborative projects addressing shared challenges across communities worldwide</p>
          </div>

          <div className="impact-areas">
            <div className="impact-area">
              <div className="impact-header">
                <div className="impact-icon">🌡️</div>
                <h4>Climate Adaptation</h4>
              </div>
              <p>Communities share strategies for adapting to climate change impacts and building resilience</p>
              <div className="impact-stats">
                <span className="stat">240 communities</span>
                <span className="stat">50 countries</span>
                <span className="stat">180 solutions shared</span>
              </div>
            </div>

            <div className="impact-area">
              <div className="impact-header">
                <div className="impact-icon">🏥</div>
                <h4>Healthcare Innovation</h4>
              </div>
              <p>Global collaboration on community health solutions and healthcare access innovations</p>
              <div className="impact-stats">
                <span className="stat">180 communities</span>
                <span className="stat">35 countries</span>
                <span className="stat">95 health initiatives</span>
              </div>
            </div>

            <div className="impact-area">
              <div className="impact-header">
                <div className="impact-icon">📚</div>
                <h4>Education Equity</h4>
              </div>
              <p>Cross-cultural learning initiatives and innovative education approaches for underserved communities</p>
              <div className="impact-stats">
                <span className="stat">320 communities</span>
                <span className="stat">60 countries</span>
                <span className="stat">450 programs launched</span>
              </div>
            </div>

            <div className="impact-area">
              <div className="impact-header">
                <div className="impact-icon">⚖️</div>
                <h4>Social Justice</h4>
              </div>
              <p>Coordinated advocacy and rights-based initiatives across communities facing similar challenges</p>
              <div className="impact-stats">
                <span className="stat">150 communities</span>
                <span className="stat">40 countries</span>
                <span className="stat">75 policy changes</span>
              </div>
            </div>

            <div className="impact-area">
              <div className="impact-header">
                <div className="impact-icon">🌱</div>
                <h4>Economic Development</h4>
              </div>
              <p>Community-led economic initiatives and sustainable development projects with global support</p>
              <div className="impact-stats">
                <span className="stat">200 communities</span>
                <span className="stat">45 countries</span>
                <span className="stat">€120M invested</span>
              </div>
            </div>

            <div className="impact-area">
              <div className="impact-header">
                <div className="impact-icon">🎭</div>
                <h4>Cultural Preservation</h4>
              </div>
              <p>Global network supporting communities in preserving and revitalising cultural traditions</p>
              <div className="impact-stats">
                <span className="stat">90 communities</span>
                <span className="stat">25 countries</span>
                <span className="stat">120 languages supported</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Sovereignty */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Sovereignty-Respecting Networks</h2>
            <p>Global connection that strengthens rather than undermines community autonomy</p>
          </div>

          <div className="sovereignty-principles">
            <div className="principle-card">
              <div className="principle-icon">👑</div>
              <div className="principle-content">
                <h4>Community Control</h4>
                <p>Each community maintains complete control over their participation, data sharing, and cultural protocols</p>
                <div className="principle-features">
                  <span className="p-feature">Local governance</span>
                  <span className="p-feature">Withdrawal rights</span>
                  <span className="p-feature">Cultural protocols</span>
                </div>
              </div>
            </div>

            <div className="principle-card">
              <div className="principle-icon">🔐</div>
              <div className="principle-content">
                <h4>Data Sovereignty</h4>
                <p>Communities decide what data is shared, with whom, and under what conditions across the global network</p>
                <div className="principle-features">
                  <span className="p-feature">Selective sharing</span>
                  <span className="p-feature">Encryption by default</span>
                  <span className="p-feature">Local storage options</span>
                </div>
              </div>
            </div>

            <div className="principle-card">
              <div className="principle-icon">⚖️</div>
              <div className="principle-content">
                <h4>Equitable Partnership</h4>
                <p>Power and benefits are distributed fairly across the network, preventing exploitation of vulnerable communities</p>
                <div className="principle-features">
                  <span className="p-feature">Resource sharing</span>
                  <span className="p-feature">Capacity building</span>
                  <span className="p-feature">Benefit distribution</span>
                </div>
              </div>
            </div>

            <div className="principle-card">
              <div className="principle-icon">🌍</div>
              <div className="principle-content">
                <h4>Cultural Respect</h4>
                <p>Network protocols honour diverse cultural values, communication styles, and decision-making processes</p>
                <div className="principle-features">
                  <span className="p-feature">Cultural protocols</span>
                  <span className="p-feature">Indigenous rights</span>
                  <span className="p-feature">Sacred content protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Global Network Success Stories</h2>
            <p>Real examples of cross-community collaboration creating positive change</p>
          </div>

          <div className="success-stories">
            <div className="story-card">
              <div className="story-flag">🇦🇺🇨🇦</div>
              <h4>Indigenous Rights Coalition</h4>
              <p>Aboriginal communities in Australia and First Nations in Canada collaborated to develop shared advocacy strategies, resulting in landmark legislation protecting traditional territories in both countries.</p>
              <div className="story-outcomes">
                <span className="outcome">2 countries involved</span>
                <span className="outcome">15 communities participating</span>
                <span className="outcome">3 laws changed</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-flag">🇰🇪🇮🇳🇧🇷</div>
              <h4>Climate Resilience Network</h4>
              <p>Rural communities in Kenya, India, and Brazil shared drought adaptation strategies, leading to improved water management systems and crop diversification programs.</p>
              <div className="story-outcomes">
                <span className="outcome">3 countries involved</span>
                <span className="outcome">45 communities participating</span>
                <span className="outcome">12 adaptation strategies scaled</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-flag">🇳🇴🇬🇱🇨🇦</div>
              <h4>Arctic Communities Alliance</h4>
              <p>Inuit communities across Norway, Greenland, and Canada created a knowledge-sharing network to address Arctic climate change impacts and preserve traditional knowledge.</p>
              <div className="story-outcomes">
                <span className="outcome">3 countries involved</span>
                <span className="outcome">25 communities participating</span>
                <span className="outcome">8 knowledge protocols established</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Statistics */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Global Network Impact</h2>
            <p>Measurable outcomes from worldwide community collaboration</p>
          </div>

          <div className="network-stats">
            <div className="stat-highlight">
              <div className="stat-number">1,240</div>
              <div className="stat-label">Connected Communities</div>
              <p>Active communities participating in the global network across 85 countries</p>
            </div>

            <div className="stat-highlight">
              <div className="stat-number">450+</div>
              <div className="stat-label">Collaborative Projects</div>
              <p>Cross-community initiatives addressing shared challenges and opportunities</p>
            </div>

            <div className="stat-highlight">
              <div className="stat-number">120</div>
              <div className="stat-label">Languages Supported</div>
              <p>Including 45 Indigenous languages with cultural context preservation</p>
            </div>

            <div className="stat-highlight">
              <div className="stat-number">85%</div>
              <div className="stat-label">Knowledge Transfer Success</div>
              <p>Communities report successfully adapting solutions from partner communities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Join the Global Community Network</h2>
            <p>Connect with communities worldwide while maintaining your sovereignty and cultural integrity</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Join Global Network
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                See Global Collaborations
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

        .network-tools {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-xl);
        }

        .tool-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .tool-card:hover {
          border-color: var(--color-brand-green);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.1);
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .tool-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .tool-header h3 {
          font-size: 20px;
          margin: 0;
        }

        .tool-card > p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .tool-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .tool-feature {
          padding: var(--space-sm);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .feature-name {
          font-weight: 600;
          color: var(--color-ink);
          display: block;
          margin-bottom: 2px;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--color-ink-light);
        }

        .impact-areas {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        .impact-area {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .impact-area:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-blue);
        }

        .impact-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .impact-icon {
          font-size: 48px;
        }

        .impact-header h4 {
          font-size: 18px;
          margin: 0;
          color: var(--color-ink);
        }

        .impact-area p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .impact-stats {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          justify-content: center;
        }

        .stat {
          font-size: 12px;
          background: var(--color-gray-lighter);
          color: var(--color-ink);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .sovereignty-principles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .principle-card {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
          transition: all 0.3s ease;
        }

        .principle-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          border-color: var(--color-brand-green);
        }

        .principle-icon {
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

        .principle-content h4 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .principle-content p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-md);
          line-height: 1.6;
        }

        .principle-features {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .p-feature {
          font-size: 12px;
          background: var(--color-brand-green);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .success-stories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-xl);
        }

        .story-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .story-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-blue);
        }

        .story-flag {
          font-size: 24px;
          margin-bottom: var(--space-md);
          text-align: center;
        }

        .story-card h4 {
          font-size: 20px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .story-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .story-outcomes {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .outcome {
          font-size: 12px;
          background: var(--color-gray-lighter);
          color: var(--color-ink);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .network-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .stat-highlight {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.2s ease;
        }

        .stat-highlight:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .stat-number {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-brand-green);
          margin-bottom: var(--space-xs);
        }

        .stat-label {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--space-md);
        }

        .stat-highlight p {
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

          .network-tools {
            grid-template-columns: 1fr;
          }

          .principle-card {
            flex-direction: column;
            text-align: center;
          }

          .success-stories {
            grid-template-columns: 1fr;
          }

          .network-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}