import React from 'react';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">HOW IT WORKS</div>
            <h1 className="hero-title">
              Your Story, Your Control
            </h1>
            <p className="hero-description">
              Share your experience safely, maintain ownership of your narrative, 
              and contribute to community understanding—all while protecting your privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Secure, Sovereign</h2>
            <p>Four steps to sharing your story with complete control</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3>1. Share Your Story</h3>
              <p>Write, record, or upload your experience in any format. Your story is encrypted before it leaves your device.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3>2. Set Your Permissions</h3>
              <p>You decide who can access your story and how it can be used. Change these settings anytime.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>3. Connect & Learn</h3>
              <p>Find others with similar experiences. Access community insights while maintaining your privacy.</p>
            </div>
          </div>

          <div className="connection-note" style={{maxWidth: '800px', marginTop: 'var(--space-3xl)'}}>
            <svg className="connection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <p>If your story contributes to research or community insights, you receive fair compensation through transparent smart contracts</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Built for Trust</h2>
            <p>Every feature designed with your sovereignty in mind</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <h3>End-to-End Encryption</h3>
              <p>Your story is encrypted on your device before upload. Only those you authorize can decrypt it.</p>
            </div>
            
            <div className="value-card">
              <h3>Anonymous by Default</h3>
              <p>Share your experience without revealing your identity. Location data limited to state level only.</p>
            </div>
            
            <div className="value-card">
              <h3>Delete Anytime</h3>
              <p>Remove your story completely at any time. No hidden copies, no data retention.</p>
            </div>
            
            <div className="value-card">
              <h3>Transparent AI</h3>
              <p>See exactly how AI analyzes stories. All models are auditable and explainable.</p>
            </div>
            
            <div className="value-card">
              <h3>Community Governance</h3>
              <p>Communities decide their own data governance rules and cultural protocols.</p>
            </div>
            
            <div className="value-card">
              <h3>Value Sharing</h3>
              <p>Revenue from insights flows back to storytelling communities, not shareholders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Share Your Story?</h2>
            <p>Join thousands who are building community understanding while maintaining control</p>
            <div className="flex justify-center gap-4">
              <Link href="/submit" className="btn btn-primary btn-large">
                Start Sharing
              </Link>
              <Link href="/trust-security" className="btn btn-secondary btn-large">
                Learn About Security
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}