import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">PRIVACY POLICY</div>
            <h1 className="hero-title">
              Your Privacy, Protected
            </h1>
            <p className="hero-description">
              Clear, transparent, and human-readable. We believe you should understand 
              exactly how your data is handled without needing a law degree.
            </p>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Privacy at a Glance</h2>
            <p>The key things you need to know</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>We Never Sell Data</h3>
              <p>Your stories and personal information are never sold to advertisers, data brokers, or third parties.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3>Encrypted & Anonymous</h3>
              <p>Stories are encrypted end-to-end. You can share anonymously. We don't track IP addresses.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3>Delete Anytime</h3>
              <p>Request deletion and your data is gone within 24 hours. No hidden backups or archives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="section">
        <div className="container">
          <div className="connection-note" style={{maxWidth: '800px'}}>
            <div style={{width: '100%'}}>
              <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: 'var(--space-lg)'}}>
                What We Collect
              </h3>
              <ul style={{listStyle: 'none', padding: 0, marginBottom: 'var(--space-xl)'}}>
                <li style={{marginBottom: 'var(--space-sm)'}}>
                  <strong>Your Story:</strong> The content you choose to share, encrypted before storage
                </li>
                <li style={{marginBottom: 'var(--space-sm)'}}>
                  <strong>Basic Account Info:</strong> Email (optional), username (can be anonymous)
                </li>
                <li style={{marginBottom: 'var(--space-sm)'}}>
                  <strong>Permissions:</strong> Your choices about who can access your story
                </li>
                <li style={{marginBottom: 'var(--space-sm)'}}>
                  <strong>Location:</strong> State level only, never precise location
                </li>
              </ul>

              <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: 'var(--space-lg)'}}>
                What We Don't Collect
              </h3>
              <ul style={{listStyle: 'none', padding: 0, marginBottom: 'var(--space-xl)'}}>
                <li style={{marginBottom: 'var(--space-sm)'}}>❌ IP addresses or device identifiers</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>❌ Behavioral tracking or analytics</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>❌ Third-party cookies or pixels</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>❌ Precise geolocation data</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>❌ Biometric or health data</li>
              </ul>

              <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: 'var(--space-lg)'}}>
                Your Rights
              </h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{marginBottom: 'var(--space-sm)'}}>✓ Access all your data anytime</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>✓ Export your stories in standard formats</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>✓ Change permissions retroactively</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>✓ Delete everything permanently</li>
                <li style={{marginBottom: 'var(--space-sm)'}}>✓ Opt out of any data processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sovereignty */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Indigenous Data Sovereignty</h2>
            <p>Respecting cultural protocols and community governance</p>
          </div>

          <div className="connection-note" style={{maxWidth: '800px'}}>
            <svg className="connection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>We follow the CARE Principles for Indigenous Data Governance: Collective benefit, Authority to control, Responsibility, and Ethics. Communities maintain sovereignty over their cultural data.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Questions?</h2>
            <p>We're here to help you understand your privacy rights</p>
          </div>
          
          <div className="connection-note" style={{maxWidth: '600px'}}>
            <div style={{width: '100%', textAlign: 'center'}}>
              <p style={{margin: '0 0 var(--space-lg) 0'}}>
                Email: privacy@empathyledger.org<br />
                Response time: Within 48 hours
              </p>
              <Link href="/contact" className="btn btn-primary">
                Contact Privacy Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="section">
        <div className="container">
          <div style={{textAlign: 'center', opacity: 0.7}}>
            <p>Last updated: January 2024 | Effective date: January 1, 2024</p>
          </div>
        </div>
      </section>
    </div>
  );
}