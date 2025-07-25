'use client';

import React from 'react';
import Link from 'next/link';

// Module data with consistent icons and descriptions
const modules = [
  {
    id: 'story-collection',
    name: 'Story Collection',
    category: 'Core',
    description: 'Secure, multi-format story submission with complete privacy control',
    features: [
      'Text, audio, video, and image stories',
      'End-to-end encryption',
      'Flexible consent management',
      'Cultural protocol support'
    ],
    icon: '📝',
    color: 'blue',
    href: '/modules/story-collection'
  },
  {
    id: 'privacy-vault',
    name: 'Privacy Vault',
    category: 'Core',
    description: 'Advanced privacy controls ensuring complete data sovereignty',
    features: [
      'Granular consent settings',
      'Anonymous story options',
      'Data portability',
      'Right to deletion'
    ],
    icon: '🔐',
    color: 'purple',
    href: '/modules/privacy-vault'
  },
  {
    id: 'insight-engine',
    name: 'Insight Engine',
    category: 'Analytics',
    description: 'AI-powered analysis that respects privacy and community values',
    features: [
      'Theme extraction',
      'Sentiment analysis',
      'Pattern recognition',
      'Impact measurement'
    ],
    icon: '🧠',
    color: 'green',
    href: '/modules/insight-engine'
  },
  {
    id: 'community-dashboard',
    name: 'Community Dashboard',
    category: 'Engagement',
    description: 'Real-time community health and engagement metrics',
    features: [
      'Story submission trends',
      'Engagement analytics',
      'Theme evolution tracking',
      'Community pulse'
    ],
    icon: '📊',
    color: 'amber',
    href: '/modules/community-dashboard'
  },
  {
    id: 'story-studio',
    name: 'Story Studio',
    category: 'Creation',
    description: 'Professional tools for story development and curation',
    features: [
      'Rich media editing',
      'Collaborative storytelling',
      'Template library',
      'Translation support'
    ],
    icon: '🎬',
    color: 'red',
    href: '/modules/story-studio'
  },
  {
    id: 'impact-tracker',
    name: 'Impact Tracker',
    category: 'Measurement',
    description: 'Track real-world change driven by community stories',
    features: [
      'Policy influence metrics',
      'Service improvement tracking',
      'Community outcome measurement',
      'ROI calculations'
    ],
    icon: '📈',
    color: 'teal',
    href: '/modules/impact-tracker'
  },
  {
    id: 'cultural-protocols',
    name: 'Cultural Protocols',
    category: 'Governance',
    description: 'Implement community-specific rules and cultural requirements',
    features: [
      'Custom approval workflows',
      'Elder review processes',
      'Sacred story protection',
      'Language preservation'
    ],
    icon: '🌍',
    color: 'indigo',
    href: '/modules/cultural-protocols'
  },
  {
    id: 'value-distribution',
    name: 'Value Distribution',
    category: 'Economics',
    description: 'Fair compensation when stories create economic value',
    features: [
      'Smart contract automation',
      'Transparent revenue sharing',
      'Community fund allocation',
      'Impact-based rewards'
    ],
    icon: '💎',
    color: 'pink',
    href: '/modules/value-distribution'
  },
  {
    id: 'research-portal',
    name: 'Research Portal',
    category: 'Knowledge',
    description: 'Ethical research access with community oversight',
    features: [
      'Anonymized data sets',
      'Ethics review board',
      'Citation tracking',
      'Knowledge commons'
    ],
    icon: '🔬',
    color: 'cyan',
    href: '/modules/research-portal'
  }
];

const categories = ['Core', 'Analytics', 'Engagement', 'Creation', 'Measurement', 'Governance', 'Economics', 'Knowledge'];

export default function ModulesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">PLATFORM MODULES</div>
            <h1 className="hero-title">
              Everything You Need to Transform Stories into Impact
            </h1>
            <p className="hero-description">
              A comprehensive suite of modules designed for communities to collect, protect, 
              analyse, and leverage their collective wisdom while maintaining complete sovereignty.
            </p>
          </div>
        </div>
      </section>

      {/* Module Categories Overview */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Complete Platform Ecosystem</h2>
            <p>Each module works independently or as part of an integrated system</p>
          </div>

          {/* Quick Stats */}
          <div className="grid-3" style={{marginBottom: 'var(--space-3xl)'}}>
            <div className="text-center">
              <h3 style={{fontSize: '48px', marginBottom: 'var(--space-sm)'}}>9</h3>
              <p>Core Modules</p>
            </div>
            <div className="text-center">
              <h3 style={{fontSize: '48px', marginBottom: 'var(--space-sm)'}}>100%</h3>
              <p>Privacy Compliant</p>
            </div>
            <div className="text-center">
              <h3 style={{fontSize: '48px', marginBottom: 'var(--space-sm)'}}>∞</h3>
              <p>Customization Options</p>
            </div>
          </div>

          {/* Module Grid */}
          <div className="modules-grid">
            {modules.map((module) => (
              <Link key={module.id} href={module.href} className="module-card-link">
                <div className={`module-card module-${module.color}`}>
                  <div className="module-header">
                    <div className="module-icon">{module.icon}</div>
                    <div className="module-category">{module.category}</div>
                  </div>
                  
                  <h3 className="module-name">{module.name}</h3>
                  <p className="module-description">{module.description}</p>
                  
                  <ul className="module-features">
                    {module.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  
                  <div className="module-action">
                    <span className="learn-more">Learn More →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Seamless Integration</h2>
            <p>All modules work together to create a unified platform</p>
          </div>

          <div className="integration-diagram">
            <div className="integration-flow">
              <div className="flow-step">
                <div className="step-icon">📝</div>
                <h4>Collect</h4>
                <p>Stories gathered with consent</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="step-icon">🔐</div>
                <h4>Protect</h4>
                <p>Privacy and sovereignty ensured</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="step-icon">🧠</div>
                <h4>Analyze</h4>
                <p>Insights extracted ethically</p>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div className="step-icon">📈</div>
                <h4>Impact</h4>
                <p>Real-world change measured</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your Deployment</h2>
            <p>Flexible options to match your community's needs</p>
          </div>

          <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'}}>
            <div className="deployment-card">
              <div className="deployment-icon">☁️</div>
              <h3>Cloud Hosted</h3>
              <p>We handle everything while you maintain control</p>
              <ul className="deployment-features">
                <li>✓ Zero maintenance required</li>
                <li>✓ Automatic updates</li>
                <li>✓ 99.9% uptime SLA</li>
                <li>✓ Full data portability</li>
                <li>✓ 24/7 support</li>
              </ul>
              <Link href="/contact?deployment=cloud" className="btn btn-primary" style={{marginTop: 'var(--space-lg)'}}>
                Start with Cloud
              </Link>
            </div>
            
            <div className="deployment-card">
              <div className="deployment-icon">🏠</div>
              <h3>Self-Hosted</h3>
              <p>Complete control on your infrastructure</p>
              <ul className="deployment-features">
                <li>✓ Run on your servers</li>
                <li>✓ Custom integrations</li>
                <li>✓ Air-gapped options</li>
                <li>✓ Full source code access</li>
                <li>✓ Enterprise support</li>
              </ul>
              <Link href="/contact?deployment=self-hosted" className="btn btn-secondary" style={{marginTop: 'var(--space-lg)'}}>
                Explore Self-Hosting
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Community's Stories?</h2>
            <p>Start with one module or deploy the complete platform</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Schedule Demo
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                See Success Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-2xl);
        }

        .module-card-link {
          text-decoration: none !important;
          display: block;
          height: 100%;
        }

        .module-card-link:hover {
          text-decoration: none !important;
        }

        .module-card-link:focus {
          text-decoration: none !important;
        }

        .module-card-link:visited {
          text-decoration: none !important;
        }

        .module-card-link:active {
          text-decoration: none !important;
        }

        .module-card-link * {
          text-decoration: none !important;
        }

        .module-card-link:hover *,
        .module-card-link:focus *,
        .module-card-link:visited *,
        .module-card-link:active * {
          text-decoration: none !important;
        }

        .module-card-link a,
        .module-card-link a:hover,
        .module-card-link a:focus,
        .module-card-link a:visited,
        .module-card-link a:active {
          text-decoration: none !important;
        }

        .module-name,
        .module-name:hover,
        .module-name:focus,
        .module-name:visited,
        .module-name:active {
          text-decoration: none !important;
        }

        .learn-more,
        .learn-more:hover,
        .learn-more:focus,
        .learn-more:visited,
        .learn-more:active {
          text-decoration: none !important;
        }

        /* Nuclear option - remove underlines from everything in module cards */
        .modules-grid a,
        .modules-grid a *,
        .modules-grid a:hover,
        .modules-grid a:hover *,
        .modules-grid a:focus,
        .modules-grid a:focus *,
        .modules-grid a:visited,
        .modules-grid a:visited *,
        .modules-grid a:active,
        .modules-grid a:active * {
          text-decoration: none !important;
          text-decoration-line: none !important;
          text-decoration-color: transparent !important;
          text-decoration-style: none !important;
          text-decoration-thickness: 0 !important;
          border-bottom: none !important;
        }

        /* Even more aggressive - target every possible element */
        .modules-grid *,
        .modules-grid *:before,
        .modules-grid *:after {
          text-decoration: none !important;
          text-decoration-line: none !important;
          text-decoration-color: transparent !important;
          text-decoration-style: none !important;
          text-decoration-thickness: 0 !important;
          border-bottom: none !important;
          border-bottom-width: 0 !important;
          border-bottom-style: none !important;
          border-bottom-color: transparent !important;
        }

        /* Target specific Next.js link classes that might be applied */
        .modules-grid [class*="link"],
        .modules-grid [class*="Link"],
        .modules-grid [class*="next"] {
          text-decoration: none !important;
          border-bottom: none !important;
        }

        /* Override any global link styles */
        .modules-grid h3,
        .modules-grid h3 *,
        .modules-grid .module-name,
        .modules-grid .module-name *,
        .modules-grid .learn-more,
        .modules-grid .learn-more * {
          text-decoration: none !important;
          text-decoration-line: none !important;
          border-bottom: none !important;
        }

        /* Fix the specific li elements that have underlines */
        .modules-grid li,
        .modules-grid .module-features li,
        .module-features li,
        .deployment-features li {
          text-decoration: none !important;
          text-decoration-line: none !important;
          text-decoration-color: transparent !important;
          text-decoration-style: none !important;
          text-decoration-thickness: 0 !important;
          border-bottom: none !important;
          border-bottom-width: 0 !important;
          border-bottom-style: none !important;
          border-bottom-color: transparent !important;
        }

        /* Target JSX scoped classes directly */
        li[class*="jsx-"] {
          text-decoration: none !important;
          text-decoration-line: none !important;
          text-decoration-color: transparent !important;
          text-decoration-style: none !important;
          text-decoration-thickness: 0 !important;
          border-bottom: none !important;
          border-bottom-width: 0 !important;
          border-bottom-style: none !important;
          border-bottom-color: transparent !important;
        }

        /* Also target any elements with jsx classes */
        [class*="jsx-"] {
          text-decoration: none !important;
        }

        /* Super specific targeting of the module features */
        .module-features li[class*="jsx-"],
        ul[class*="jsx-"] li[class*="jsx-"],
        .modules-grid ul li,
        .modules-grid .module-features li[class*="jsx-"] {
          text-decoration: none !important;
          text-decoration-line: none !important;
          border-bottom: none !important;
        }

        .module-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .module-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--color-gray-light);
          transition: all 0.3s ease;
        }

        .module-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: transparent;
        }

        .module-blue::before,
        .module-blue:hover { border-color: var(--color-brand-blue); }
        .module-blue::before { background: var(--color-brand-blue); }

        .module-purple::before,
        .module-purple:hover { border-color: #8b5cf6; }
        .module-purple::before { background: #8b5cf6; }

        .module-green::before,
        .module-green:hover { border-color: var(--color-brand-green); }
        .module-green::before { background: var(--color-brand-green); }

        .module-amber::before,
        .module-amber:hover { border-color: #f59e0b; }
        .module-amber::before { background: #f59e0b; }

        .module-red::before,
        .module-red:hover { border-color: var(--color-brand-red); }
        .module-red::before { background: var(--color-brand-red); }

        .module-teal::before,
        .module-teal:hover { border-color: #14b8a6; }
        .module-teal::before { background: #14b8a6; }

        .module-indigo::before,
        .module-indigo:hover { border-color: #6366f1; }
        .module-indigo::before { background: #6366f1; }

        .module-pink::before,
        .module-pink:hover { border-color: #ec4899; }
        .module-pink::before { background: #ec4899; }

        .module-cyan::before,
        .module-cyan:hover { border-color: #06b6d4; }
        .module-cyan::before { background: #06b6d4; }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-lg);
        }

        .module-icon {
          font-size: 48px;
          line-height: 1;
        }

        .module-category {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-gray);
          background: var(--color-gray-lighter);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .module-name {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .module-description {
          color: var(--color-gray);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .module-features {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--space-lg) 0;
          flex: 1;
        }

        .module-features li {
          position: relative;
          padding-left: var(--space-lg);
          margin-bottom: var(--space-sm);
          color: var(--color-ink-light);
          font-size: 14px;
        }

        .module-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .module-action {
          margin-top: auto;
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-gray-light);
        }

        .learn-more {
          color: var(--color-brand-blue);
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .module-card:hover .learn-more {
          color: var(--color-brand-red);
          text-decoration: none;
        }

        .integration-diagram {
          background: var(--color-gray-lighter);
          border-radius: 16px;
          padding: var(--space-3xl);
          margin-top: var(--space-2xl);
        }

        .integration-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-lg);
          flex-wrap: wrap;
        }

        .flow-step {
          text-align: center;
          max-width: 200px;
        }

        .step-icon {
          font-size: 48px;
          margin-bottom: var(--space-md);
        }

        .flow-step h4 {
          font-size: 20px;
          margin-bottom: var(--space-sm);
        }

        .flow-step p {
          font-size: 14px;
          color: var(--color-gray);
          margin: 0;
        }

        .flow-arrow {
          font-size: 32px;
          color: var(--color-brand-blue);
          font-weight: 300;
        }

        .deployment-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-2xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .deployment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: var(--color-brand-blue);
        }

        .deployment-icon {
          font-size: 64px;
          margin-bottom: var(--space-lg);
        }

        .deployment-card h3 {
          font-size: 28px;
          margin-bottom: var(--space-md);
        }

        .deployment-card p {
          color: var(--color-gray);
          margin-bottom: var(--space-xl);
        }

        .deployment-features {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
          display: inline-block;
        }

        .deployment-features li {
          margin-bottom: var(--space-sm);
          color: var(--color-ink-light);
        }

        @media (max-width: 768px) {
          .integration-flow {
            flex-direction: column;
          }
          
          .flow-arrow {
            transform: rotate(90deg);
          }
        }

        /* NUCLEAR OPTION - FUCK ALL UNDERLINES */
        * {
          text-decoration: none !important;
        }
        
        *:hover, *:focus, *:active, *:visited {
          text-decoration: none !important;
        }
        
        li, ul li, ol li {
          text-decoration: none !important;
          text-decoration-line: none !important;
          border-bottom: none !important;
        }
        
        a, a *, a:hover, a:hover *, a:focus, a:focus *, a:active, a:active *, a:visited, a:visited * {
          text-decoration: none !important;
          text-decoration-line: none !important;
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
}