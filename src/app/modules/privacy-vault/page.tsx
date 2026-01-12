'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyVaultPage() {
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
              <div className="module-hero-icon">🔐</div>
              <div>
                <div className="hero-badge">CORE MODULE</div>
                <h1 className="hero-title">Privacy Vault</h1>
                <p className="hero-description">
                  Military-grade privacy controls ensuring complete data sovereignty. 
                  Your stories, your rules - always and forever.
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
            <h2>Uncompromising Privacy Protection</h2>
            <p>Every setting, every permission, every decision remains yours</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-purple">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.818-4.954A9.955 9.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2a9.955 9.955 0 015.818 2.954l-1.286 1.286A7.966 7.966 0 0011 4a8 8 0 100 16 8 8 0 004.532-1.286l1.286-1.286z" />
                </svg>
              </div>
              <h3>Granular Consent</h3>
              <p>Control exactly who sees your story, when they see it, and how they can use it</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Anonymous Options</h3>
              <p>Share powerful stories while keeping your identity completely private</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3>Data Portability</h3>
              <p>Export your stories anytime in standard formats - your data is never locked in</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Levels */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your Privacy Level</h2>
            <p>From completely private to community-wide sharing</p>
          </div>

          <div className="privacy-levels">
            <div className="privacy-level">
              <div className="privacy-level-icon">👁️</div>
              <div className="privacy-level-content">
                <h3>Private Vault</h3>
                <p>Only you can see your stories. Use for personal reflection and private journaling.</p>
                <div className="privacy-features">
                  <span className="feature-tag">Local encryption</span>
                  <span className="feature-tag">No cloud access</span>
                  <span className="feature-tag">Personal insights</span>
                </div>
              </div>
            </div>

            <div className="privacy-level">
              <div className="privacy-level-icon">👥</div>
              <div className="privacy-level-content">
                <h3>Trusted Circle</h3>
                <p>Share with selected family, friends, or support network members you trust.</p>
                <div className="privacy-features">
                  <span className="feature-tag">Invite-only</span>
                  <span className="feature-tag">End-to-end encrypted</span>
                  <span className="feature-tag">Revokable access</span>
                </div>
              </div>
            </div>

            <div className="privacy-level">
              <div className="privacy-level-icon">🏘️</div>
              <div className="privacy-level-content">
                <h3>Community Sharing</h3>
                <p>Share with your broader community while maintaining anonymity if desired.</p>
                <div className="privacy-features">
                  <span className="feature-tag">Anonymous options</span>
                  <span className="feature-tag">Community insights</span>
                  <span className="feature-tag">Moderation tools</span>
                </div>
              </div>
            </div>

            <div className="privacy-level">
              <div className="privacy-level-icon">📊</div>
              <div className="privacy-level-content">
                <h3>Research Contribution</h3>
                <p>Contribute to ethical research while maintaining privacy and receiving compensation.</p>
                <div className="privacy-features">
                  <span className="feature-tag">De-identified data</span>
                  <span className="feature-tag">Fair compensation</span>
                  <span className="feature-tag">Withdrawal rights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sovereignty */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Complete Data Sovereignty</h2>
            <p>Following Indigenous data sovereignty principles and international best practices</p>
          </div>

          <div className="sovereignty-grid">
            <div className="sovereignty-feature">
              <div className="sovereignty-icon">🏛️</div>
              <h4>Legal Ownership</h4>
              <p>You retain full legal ownership of your stories under all jurisdictions</p>
            </div>
            <div className="sovereignty-feature">
              <div className="sovereignty-icon">🗺️</div>
              <h4>Geographic Control</h4>
              <p>Choose which countries your data can be stored and processed in</p>
            </div>
            <div className="sovereignty-feature">
              <div className="sovereignty-icon">⚖️</div>
              <h4>Rights Protection</h4>
              <p>GDPR, CCPA, and PIPEDA compliant with automatic rights enforcement</p>
            </div>
            <div className="sovereignty-feature">
              <div className="sovereignty-icon">🔄</div>
              <h4>Consent Evolution</h4>
              <p>Change your mind anytime - permissions can be updated or revoked instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Zero-Knowledge Architecture</h2>
            <p>We can't access your stories even if we wanted to</p>
          </div>

          <div className="tech-features">
            <div className="tech-feature">
              <div className="tech-icon">🔐</div>
              <div className="tech-content">
                <h3>Client-Side Encryption</h3>
                <p>Stories are encrypted on your device before they ever leave. We never see the unencrypted content.</p>
              </div>
            </div>
            
            <div className="tech-feature">
              <div className="tech-icon">🔑</div>
              <div className="tech-content">
                <h3>Key Management</h3>
                <p>You control the encryption keys. Lost keys mean lost access - even for us.</p>
              </div>
            </div>
            
            <div className="tech-feature">
              <div className="tech-icon">🏭</div>
              <div className="tech-content">
                <h3>Decentralised Storage</h3>
                <p>Stories stored across multiple secure locations you choose, never in a single point of failure.</p>
              </div>
            </div>
            
            <div className="tech-feature">
              <div className="tech-icon">🕵️</div>
              <div className="tech-content">
                <h3>Zero Logging</h3>
                <p>We don't log access patterns, IP addresses, or behaviour. Your privacy is mathematically guaranteed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Take Control of Your Digital Privacy</h2>
            <p>Experience true data sovereignty with military-grade protection</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Secure Your Stories
              </Link>
              <Link href="/trust-security" className="btn btn-secondary btn-large">
                Learn About Security
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
          border-color: #8b5cf6;
        }

        .icon-purple {
          color: #8b5cf6;
        }

        .privacy-levels {
          display: grid;
          gap: var(--space-xl);
          max-width: 800px;
          margin: 0 auto;
        }

        .privacy-level {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 16px;
          border: 2px solid var(--color-gray-light);
          transition: all 0.3s ease;
        }

        .privacy-level:hover {
          border-color: #8b5cf6;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.1);
        }

        .privacy-level-icon {
          font-size: 40px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .privacy-level-content h3 {
          font-size: 20px;
          margin-bottom: var(--space-sm);
        }

        .privacy-level-content p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-md);
          line-height: 1.6;
        }

        .privacy-features {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .feature-tag {
          font-size: 12px;
          background: #8b5cf6;
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .sovereignty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .sovereignty-feature {
          text-align: center;
          padding: var(--space-lg);
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .sovereignty-icon {
          font-size: 48px;
          margin-bottom: var(--space-md);
        }

        .sovereignty-feature h4 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
        }

        .sovereignty-feature p {
          color: var(--color-gray);
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }

        .tech-features {
          display: grid;
          gap: var(--space-xl);
          max-width: 900px;
          margin: 0 auto;
        }

        .tech-feature {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
        }

        .tech-icon {
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

        .tech-content h3 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
        }

        .tech-content p {
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .module-hero-content {
            flex-direction: column;
            text-align: center;
          }

          .privacy-level {
            flex-direction: column;
            text-align: center;
          }

          .tech-feature {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}