'use client';

import React from 'react';
import Link from 'next/link';

export default function CulturalProtocolsPage() {
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
              <div className="module-hero-icon">🌍</div>
              <div>
                <div className="hero-badge">CULTURAL MODULE</div>
                <h1 className="hero-title">Cultural Protocols</h1>
                <p className="hero-description">
                  Respect and preserve cultural traditions with customisable protocols 
                  for story sharing, review processes, and community governance frameworks.
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
            <h2>Culturally Responsive Technology</h2>
            <p>Technology that adapts to cultural values, not the other way around</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.818-4.954A9.955 9.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2a9.955 9.955 0 015.818 2.954l-1.286 1.286A7.966 7.966 0 0011 4a8 8 0 100 16 8 8 0 004.532-1.286l1.286-1.286z" />
                </svg>
              </div>
              <h3>Customisable Approval Workflows</h3>
              <p>Design review processes that honour traditional decision-making structures and cultural hierarchies</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3>Sacred Story Protection</h3>
              <p>Special handling for ceremonial, spiritual, or culturally sensitive content with restricted access</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>Elder & Leadership Roles</h3>
              <p>Integrated governance allowing cultural leaders and elders to guide story sharing processes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Types */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Cultural Protocol Framework</h2>
            <p>Flexible systems that honour diverse cultural approaches to knowledge sharing</p>
          </div>

          <div className="protocol-types">
            <div className="protocol-card">
              <div className="protocol-header">
                <div className="protocol-icon">🪶</div>
                <h3>Indigenous Data Sovereignty</h3>
              </div>
              <p>Built following CARE principles (Collective Benefit, Authority to Control, Responsibility, Ethics) and OCAP® principles</p>
              <div className="protocol-features">
                <div className="feature-item">
                  <span className="feature-label">Collective Ownership:</span>
                  <span className="feature-desc">Stories belong to the community, not individuals</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Ceremonial Restrictions:</span>
                  <span className="feature-desc">Sacred content protected from inappropriate sharing</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Intergenerational Consent:</span>
                  <span className="feature-desc">Elder approval required for cultural knowledge</span>
                </div>
              </div>
            </div>

            <div className="protocol-card">
              <div className="protocol-header">
                <div className="protocol-icon">🕌</div>
                <h3>Faith Community Guidelines</h3>
              </div>
              <p>Respect religious protocols around testimony sharing, community consultation, and spiritual content</p>
              <div className="protocol-features">
                <div className="feature-item">
                  <span className="feature-label">Religious Authority:</span>
                  <span className="feature-desc">Clergy or community leaders review content</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Prayer & Reflection:</span>
                  <span className="feature-desc">Built-in time for spiritual consideration</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Doctrinal Alignment:</span>
                  <span className="feature-desc">Ensure stories align with community values</span>
                </div>
              </div>
            </div>

            <div className="protocol-card">
              <div className="protocol-header">
                <div className="protocol-icon">🏛️</div>
                <h3>Traditional Governance</h3>
              </div>
              <p>Honour traditional decision-making structures including councils, assemblies, and consensus processes</p>
              <div className="protocol-features">
                <div className="feature-item">
                  <span className="feature-label">Council Approval:</span>
                  <span className="feature-desc">Community council reviews sensitive stories</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Consensus Building:</span>
                  <span className="feature-desc">Group discussion before publication</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Hierarchical Review:</span>
                  <span className="feature-desc">Respect for traditional authority structures</span>
                </div>
              </div>
            </div>

            <div className="protocol-card">
              <div className="protocol-header">
                <div className="protocol-icon">👥</div>
                <h3>Family & Kinship Systems</h3>
              </div>
              <p>Navigate complex family relationships and kinship obligations in story sharing decisions</p>
              <div className="protocol-features">
                <div className="feature-item">
                  <span className="feature-label">Family Consent:</span>
                  <span className="feature-desc">Extended family approval for sensitive topics</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Generational Respect:</span>
                  <span className="feature-desc">Honour elder wisdom in storytelling</span>
                </div>
                <div className="feature-item">
                  <span className="feature-label">Kinship Obligations:</span>
                  <span className="feature-desc">Consider impacts on relatives and descendants</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Features */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Technical Implementation</h2>
            <p>Sophisticated technology that serves cultural protocols, not the other way around</p>
          </div>

          <div className="implementation-grid">
            <div className="impl-card">
              <div className="impl-icon">⚙️</div>
              <div className="impl-content">
                <h4>Workflow Builder</h4>
                <p>Drag-and-drop interface to create custom approval processes matching your community's decision-making traditions</p>
                <div className="impl-tags">
                  <span className="impl-tag">Visual workflow designer</span>
                  <span className="impl-tag">Multi-step approvals</span>
                  <span className="impl-tag">Conditional logic</span>
                </div>
              </div>
            </div>

            <div className="impl-card">
              <div className="impl-icon">🎭</div>
              <div className="impl-content">
                <h4>Role-Based Permissions</h4>
                <p>Sophisticated permission systems that honour traditional roles including elders, leaders, and knowledge keepers</p>
                <div className="impl-tags">
                  <span className="impl-tag">Custom role definitions</span>
                  <span className="impl-tag">Hierarchical permissions</span>
                  <span className="impl-tag">Seasonal restrictions</span>
                </div>
              </div>
            </div>

            <div className="impl-card">
              <div className="impl-icon">🔐</div>
              <div className="impl-content">
                <h4>Sacred Content Vaults</h4>
                <p>Special encrypted storage for ceremonial, spiritual, or culturally sensitive stories with restricted access</p>
                <div className="impl-tags">
                  <span className="impl-tag">Encryption by default</span>
                  <span className="impl-tag">Access logging</span>
                  <span className="impl-tag">Time-based restrictions</span>
                </div>
              </div>
            </div>

            <div className="impl-card">
              <div className="impl-icon">🌐</div>
              <div className="impl-content">
                <h4>Multi-Language Support</h4>
                <p>Native support for Indigenous languages, dialects, and cultural expressions with appropriate fonts and input methods</p>
                <div className="impl-tags">
                  <span className="impl-tag">Unicode support</span>
                  <span className="impl-tag">Right-to-left text</span>
                  <span className="impl-tag">Cultural calendars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Considerations */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Deep Cultural Integration</h2>
            <p>Beyond translation - true cultural responsiveness in every feature</p>
          </div>

          <div className="considerations-list">
            <div className="consideration-item">
              <div className="consideration-icon">🕰️</div>
              <div className="consideration-content">
                <h4>Seasonal & Ceremonial Timing</h4>
                <p>Respect traditional calendars and ceremonial seasons. Some stories may only be appropriate to share at certain times of year.</p>
              </div>
            </div>

            <div className="consideration-item">
              <div className="consideration-icon">👁️</div>
              <div className="consideration-content">
                <h4>Gender & Age Restrictions</h4>
                <p>Cultural protocols around who can hear certain stories based on gender, age, initiation status, or other traditional categories.</p>
              </div>
            </div>

            <div className="consideration-item">
              <div className="consideration-icon">🗣️</div>
              <div className="consideration-content">
                <h4>Oral Tradition Respect</h4>
                <p>Special considerations for cultures where knowledge is traditionally passed down orally, not through written records.</p>
              </div>
            </div>

            <div className="consideration-item">
              <div className="consideration-icon">🏞️</div>
              <div className="consideration-content">
                <h4>Geographic Restrictions</h4>
                <p>Some stories may be tied to specific places and should only be accessible to people in certain geographic regions.</p>
              </div>
            </div>

            <div className="consideration-item">
              <div className="consideration-icon">⚖️</div>
              <div className="consideration-content">
                <h4>Legal & Sovereignty Issues</h4>
                <p>Navigate complex legal frameworks around cultural intellectual property, traditional knowledge, and community sovereignty.</p>
              </div>
            </div>

            <div className="consideration-item">
              <div className="consideration-icon">🔄</div>
              <div className="consideration-content">
                <h4>Intergenerational Transmission</h4>
                <p>Ensure stories can be passed down appropriately to future generations while respecting current cultural protocols.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Cultural Protocol Success Stories</h2>
            <p>Communities preserving culture while sharing their stories</p>
          </div>

          <div className="success-examples">
            <div className="success-card">
              <div className="success-location">Maori Communities, New Zealand</div>
              <h4>Traditional Knowledge Preservation</h4>
              <p>Iwi councils used cultural protocols to safely digitise traditional stories while maintaining tikanga Māori around sacred knowledge sharing.</p>
              <div className="success-metrics">
                <span className="metric">2,400 stories preserved</span>
                <span className="metric">15 iwi participating</span>
                <span className="metric">100% elder approval</span>
              </div>
            </div>

            <div className="success-card">
              <div className="success-location">First Nations, Canada</div>
              <h4>Ceremony Protection Protocols</h4>
              <p>Indigenous communities established protocols ensuring ceremonial stories remain within appropriate cultural contexts while sharing healing journeys.</p>
              <div className="success-metrics">
                <span className="metric">8 Nations involved</span>
                <span className="metric">Zero protocol violations</span>
                <span className="metric">95% community satisfaction</span>
              </div>
            </div>

            <div className="success-card">
              <div className="success-location">Muslim Communities, UK</div>
              <h4>Faith-Based Review Systems</h4>
              <p>Islamic communities developed imam-led review processes ensuring shared stories aligned with religious values while advocating for community needs.</p>
              <div className="success-metrics">
                <span className="metric">45 mosques participating</span>
                <span className="metric">1,200 stories reviewed</span>
                <span className="metric">3 policy changes achieved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Honour Your Cultural Protocols</h2>
            <p>Technology that respects tradition while enabling modern storytelling</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Design Your Protocols
              </Link>
              <Link href="/trust-security" className="btn btn-secondary btn-large">
                Learn About Cultural Security
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

        .protocol-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-xl);
        }

        .protocol-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .protocol-card:hover {
          border-color: var(--color-brand-blue);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
        }

        .protocol-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .protocol-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .protocol-header h3 {
          font-size: 20px;
          margin: 0;
        }

        .protocol-card > p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .protocol-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .feature-item {
          padding: var(--space-sm);
          background: var(--color-gray-lighter);
          border-radius: 8px;
        }

        .feature-label {
          font-weight: 600;
          color: var(--color-ink);
          display: block;
          margin-bottom: 2px;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--color-ink-light);
        }

        .implementation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-xl);
        }

        .impl-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .impl-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .impl-icon {
          font-size: 48px;
          margin-bottom: var(--space-lg);
        }

        .impl-content h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .impl-content p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .impl-tags {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
          justify-content: center;
        }

        .impl-tag {
          font-size: 12px;
          background: var(--color-brand-blue);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .considerations-list {
          display: grid;
          gap: var(--space-lg);
          max-width: 900px;
          margin: 0 auto;
        }

        .consideration-item {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-lg);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
        }

        .consideration-icon {
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

        .consideration-content h4 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .consideration-content p {
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.6;
        }

        .success-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-xl);
        }

        .success-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
          transition: all 0.3s ease;
        }

        .success-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-green);
        }

        .success-location {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-brand-blue);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-sm);
        }

        .success-card h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .success-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .success-metrics {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .metric {
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

          .protocol-types {
            grid-template-columns: 1fr;
          }

          .consideration-item {
            flex-direction: column;
            text-align: center;
          }

          .success-examples {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}