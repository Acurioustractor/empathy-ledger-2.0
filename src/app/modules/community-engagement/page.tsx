'use client';

import React from 'react';
import Link from 'next/link';

export default function CommunityEngagementPage() {
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
              <div className="module-hero-icon">🤝</div>
              <div>
                <div className="hero-badge">COMMUNITY MODULE</div>
                <h1 className="hero-title">Community Engagement</h1>
                <p className="hero-description">
                  Build stronger communities through meaningful dialogue, 
                  collaborative decision-making, and inclusive participation platforms.
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
            <h2>Meaningful Community Connection</h2>
            <p>Tools that bring people together and amplify every voice</p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3>Digital Town Halls</h3>
              <p>Virtual community meetings with real-time polling, breakout discussions, and multilingual support</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Collaborative Decision Making</h3>
              <p>Consensus-building tools that help communities make decisions together transparently</p>
            </div>
            
            <div className="feature-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3>Inclusive Participation</h3>
              <p>Accessibility features ensuring everyone can contribute regardless of ability or background</p>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Methods */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Ways to Engage Your Community</h2>
            <p>Flexible tools that adapt to your community's unique needs</p>
          </div>

          <div className="engagement-methods">
            <div className="method-card">
              <div className="method-icon">🗳️</div>
              <div className="method-content">
                <h3>Community Polling & Surveys</h3>
                <p>Create polls and surveys with branching logic, anonymous options, and real-time results</p>
                <div className="method-features">
                  <span className="feature-tag">Real-time results</span>
                  <span className="feature-tag">Anonymous voting</span>
                  <span className="feature-tag">Mobile optimised</span>
                </div>
              </div>
            </div>

            <div className="method-card">
              <div className="method-icon">💬</div>
              <div className="method-content">
                <h3>Moderated Discussions</h3>
                <p>Facilitate healthy community conversations with AI-assisted moderation and community guidelines</p>
                <div className="method-features">
                  <span className="feature-tag">AI moderation</span>
                  <span className="feature-tag">Threaded discussions</span>
                  <span className="feature-tag">Sentiment tracking</span>
                </div>
              </div>
            </div>

            <div className="method-card">
              <div className="method-icon">🎯</div>
              <div className="method-content">
                <h3>Priority Setting Workshops</h3>
                <p>Collaborative tools to help communities identify and rank their most important issues</p>
                <div className="method-features">
                  <span className="feature-tag">Dot voting</span>
                  <span className="feature-tag">Issue mapping</span>
                  <span className="feature-tag">Consensus building</span>
                </div>
              </div>
            </div>

            <div className="method-card">
              <div className="method-icon">🏛️</div>
              <div className="method-content">
                <h3>Participatory Budgeting</h3>
                <p>Let communities decide how public resources are allocated through transparent voting processes</p>
                <div className="method-features">
                  <span className="feature-tag">Budget visualization</span>
                  <span className="feature-tag">Impact projections</span>
                  <span className="feature-tag">Transparent tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Benefits */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Strengthen Your Community</h2>
            <p>The outcomes when everyone has a voice in shaping their future</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-number">85%</div>
              <h4>Increased Participation</h4>
              <p>More residents engage when accessible digital tools remove traditional barriers</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">60%</div>
              <h4>Faster Decision Making</h4>
              <p>Communities reach consensus more quickly with structured dialogue tools</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">90%</div>
              <h4>Greater Trust</h4>
              <p>Transparent processes build confidence in community leadership</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">3x</div>
              <h4>More Diverse Voices</h4>
              <p>Online engagement reaches community members often excluded from traditional meetings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Community Success Stories</h2>
            <p>Real examples of transformative community engagement</p>
          </div>

          <div className="success-stories">
            <div className="story-card">
              <div className="story-location">Brisbane, Australia</div>
              <h3>Neighbourhood Renewal Project</h3>
              <p>Residents used collaborative planning tools to redesign their local park, resulting in 400% increase in usage and stronger community bonds.</p>
              <div className="story-impact">
                <span className="impact-metric">2,340 participants</span>
                <span className="impact-metric">89% satisfaction</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-location">Toronto, Canada</div>
              <h3>Indigenous Community Consultation</h3>
              <p>First Nations communities used culturally appropriate engagement tools to guide city development decisions affecting traditional territories.</p>
              <div className="story-impact">
                <span className="impact-metric">12 communities</span>
                <span className="impact-metric">3 treaties updated</span>
              </div>
            </div>

            <div className="story-card">
              <div className="story-location">Manchester, UK</div>
              <h3>Youth-Led Climate Action</h3>
              <p>Young people used digital engagement platforms to propose and vote on climate solutions, leading to £2M in green infrastructure investment.</p>
              <div className="story-impact">
                <span className="impact-metric">8,500 youth engaged</span>
                <span className="impact-metric">15 projects funded</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Strengthen Your Community Connections</h2>
            <p>Give every community member a voice in shaping their future</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Start Engaging
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                See Community Impact
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

        .engagement-methods {
          display: grid;
          gap: var(--space-xl);
          max-width: 900px;
          margin: 0 auto;
        }

        .method-card {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 16px;
          border: 2px solid var(--color-gray-light);
          transition: all 0.3s ease;
        }

        .method-card:hover {
          border-color: var(--color-brand-blue);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
        }

        .method-icon {
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

        .method-content h3 {
          font-size: 20px;
          margin-bottom: var(--space-sm);
        }

        .method-content p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-md);
          line-height: 1.6;
        }

        .method-features {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }

        .feature-tag {
          font-size: 12px;
          background: var(--color-brand-blue);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: 500;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .benefit-card {
          text-align: center;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 16px;
          border: 1px solid var(--color-gray-light);
          transition: all 0.2s ease;
        }

        .benefit-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .benefit-number {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-sm);
        }

        .benefit-card h4 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .benefit-card p {
          color: var(--color-ink-light);
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .success-stories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
          border-color: var(--color-brand-green);
        }

        .story-location {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-brand-blue);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-sm);
        }

        .story-card h3 {
          font-size: 18px;
          margin-bottom: var(--space-md);
          color: var(--color-ink);
        }

        .story-card p {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .story-impact {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .impact-metric {
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

          .method-card {
            flex-direction: column;
            text-align: center;
          }

          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .success-stories {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}