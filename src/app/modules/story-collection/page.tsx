'use client';

import React from 'react';
import Link from 'next/link';

export default function StoryCollectionPage() {
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
              <div className="module-hero-icon">📝</div>
              <div>
                <div className="hero-badge">CORE MODULE</div>
                <h1 className="hero-title">Story Collection</h1>
                <p className="hero-description">
                  Empower your community to share their experiences through secure, 
                  culturally-appropriate, and privacy-respecting story submission tools.
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
            <h2>Comprehensive Story Gathering</h2>
            <p>Every voice matters, every format supported</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3>Written Stories</h3>
              <p>Rich text editor with formatting, draft saving, and multi-language support</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3>Audio Recording</h3>
              <p>In-browser recording with noise reduction and automatic transcription</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Video Stories</h3>
              <p>Record or upload video with compression and accessibility features</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>How Story Collection Works</h2>
            <p>A respectful process that puts storytellers in control</p>
          </div>

          <div className="process-timeline">
            <div className="timeline-item">
              <div className="timeline-number">1</div>
              <div className="timeline-content">
                <h3>Choose Format</h3>
                <p>Storytellers select their preferred medium - text, audio, video, or images</p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-number">2</div>
              <div className="timeline-content">
                <h3>Set Privacy</h3>
                <p>Control who can see the story and how it can be used</p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-number">3</div>
              <div className="timeline-content">
                <h3>Share Story</h3>
                <p>Submit with confidence knowing the story is encrypted and protected</p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-number">4</div>
              <div className="timeline-content">
                <h3>Maintain Control</h3>
                <p>Edit, update, or remove stories anytime - ownership never transfers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Privacy-First Architecture</h2>
            <p>Security and sovereignty built into every layer</p>
          </div>

          <div className="security-grid">
            <div className="security-feature">
              <div className="security-icon">🔒</div>
              <h4>End-to-End Encryption</h4>
              <p>Stories encrypted before leaving the device</p>
            </div>
            <div className="security-feature">
              <div className="security-icon">👤</div>
              <h4>Anonymous Options</h4>
              <p>Share stories without revealing identity</p>
            </div>
            <div className="security-feature">
              <div className="security-icon">🌍</div>
              <h4>Local Data Storage</h4>
              <p>Stories stay in your region</p>
            </div>
            <div className="security-feature">
              <div className="security-icon">🔑</div>
              <h4>Consent Management</h4>
              <p>Granular control over data usage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Seamless Integration</h2>
            <p>Works with your existing systems</p>
          </div>

          <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
            <div className="integration-card">
              <h3>API Access</h3>
              <p>RESTful and GraphQL APIs for custom integrations</p>
              <ul>
                <li>• Webhook support</li>
                <li>• Real-time events</li>
                <li>• Batch operations</li>
              </ul>
            </div>
            
            <div className="integration-card">
              <h3>Mobile SDKs</h3>
              <p>Native SDKs for iOS and Android apps</p>
              <ul>
                <li>• Offline support</li>
                <li>• Background sync</li>
                <li>• Push notifications</li>
              </ul>
            </div>
            
            <div className="integration-card">
              <h3>Widget Embed</h3>
              <p>Embed story collection on any website</p>
              <ul>
                <li>• Customizable design</li>
                <li>• Multiple languages</li>
                <li>• WCAG compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Start Collecting Stories Today</h2>
            <p>Empower your community to share their experiences</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link href="/modules" className="btn btn-secondary btn-large">
                Explore Other Modules
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
        }

        .process-timeline {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          padding-left: var(--space-3xl);
        }

        .process-timeline::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 20px;
          bottom: 20px;
          width: 2px;
          background: var(--color-gray-light);
        }

        .timeline-item {
          position: relative;
          margin-bottom: var(--space-2xl);
        }

        .timeline-number {
          position: absolute;
          left: -48px;
          top: 0;
          width: 40px;
          height: 40px;
          background: var(--color-brand-blue);
          color: var(--color-white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .timeline-content h3 {
          font-size: 20px;
          margin-bottom: var(--space-sm);
        }

        .timeline-content p {
          color: var(--color-gray);
          margin: 0;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-2xl);
        }

        .security-feature {
          text-align: center;
          padding: var(--space-lg);
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .security-icon {
          font-size: 48px;
          margin-bottom: var(--space-md);
        }

        .security-feature h4 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
        }

        .security-feature p {
          color: var(--color-gray);
          margin: 0;
          font-size: 14px;
        }

        .integration-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-xl);
        }

        .integration-card h3 {
          font-size: 20px;
          margin-bottom: var(--space-md);
        }

        .integration-card p {
          color: var(--color-gray);
          margin-bottom: var(--space-lg);
        }

        .integration-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .integration-card li {
          color: var(--color-ink-light);
          font-size: 14px;
          margin-bottom: var(--space-sm);
        }

        @media (max-width: 768px) {
          .module-hero-content {
            flex-direction: column;
            text-align: center;
          }

          .process-timeline {
            padding-left: var(--space-xl);
          }

          .timeline-number {
            left: -32px;
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}