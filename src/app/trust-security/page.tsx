import React from 'react';
import Link from 'next/link';

export default function TrustSecurityPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">TRUST & SECURITY</div>
            <h1 className="hero-title">
              Your Privacy is Sacred
            </h1>
            <p className="hero-description">
              Military-grade encryption, zero-knowledge architecture, and complete transparency. 
              We protect your stories like they're our own—because trust is everything.
            </p>
          </div>
        </div>
      </section>

      {/* Security Principles */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Security First, Always</h2>
            <p>Built on principles that put your protection above all else</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3>End-to-End Encryption</h3>
              <p>Your story is encrypted on your device before it ever reaches our servers. Only you hold the keys.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Zero-Knowledge Architecture</h3>
              <p>We can't read your stories even if we wanted to. Your privacy is guaranteed by mathematics, not promises.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3>Regular Security Audits</h3>
              <p>Independent security experts regularly audit our systems. All reports are public for complete transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Protection Features */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>How We Protect You</h2>
            <p>Multiple layers of security to ensure your stories remain yours</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <h3>Anonymous by Default</h3>
              <p>No real names required. Location data limited to state level. IP addresses never stored.</p>
            </div>
            
            <div className="value-card">
              <h3>Secure Infrastructure</h3>
              <p>ISO 27001 certified data centres. SOC 2 Type II compliant. 24/7 security monitoring.</p>
            </div>
            
            <div className="value-card">
              <h3>Data Minimization</h3>
              <p>We only collect what's absolutely necessary. No tracking pixels, no behavioral analytics.</p>
            </div>
            
            <div className="value-card">
              <h3>Right to Delete</h3>
              <p>Complete deletion within 24 hours. No backups retained. Your data disappears forever.</p>
            </div>
            
            <div className="value-card">
              <h3>Transparent Operations</h3>
              <p>Open source codebase. Public security audits. Clear data handling policies.</p>
            </div>
            
            <div className="value-card">
              <h3>No Third-Party Access</h3>
              <p>Your data is never sold, shared, or accessed by advertisers or data brokers.</p>
            </div>
          </div>

          <div className="connection-note" style={{maxWidth: '800px', marginTop: 'var(--space-3xl)'}}>
            <svg className="connection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p>All our security measures are verified by independent auditors. View our latest security audit report and compliance certifications.</p>
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Trust in Numbers</h2>
            <p>Our commitment to security, measured and verified</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <h3 style={{fontSize: '36px', marginBottom: 'var(--space-sm)'}}>256-bit</h3>
              <p>AES encryption standard for all stories</p>
            </div>
            
            <div className="value-card">
              <h3 style={{fontSize: '36px', marginBottom: 'var(--space-sm)'}}>Zero</h3>
              <p>Data breaches in our entire history</p>
            </div>
            
            <div className="value-card">
              <h3 style={{fontSize: '36px', marginBottom: 'var(--space-sm)'}}>24 hours</h3>
              <p>Maximum time for complete data deletion</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Share Safely?</h2>
            <p>Join a platform that respects your privacy as much as your story</p>
            <div className="flex justify-center gap-4">
              <Link href="/submit" className="btn btn-primary btn-large">
                Start Your Story
              </Link>
              <Link href="/privacy" className="btn btn-secondary btn-large">
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}