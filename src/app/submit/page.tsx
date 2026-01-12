'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ShareYourStoryPage() {
  const [selectedStep, setSelectedStep] = useState(1);

  const storyTypes = [
    {
      id: 'personal',
      name: 'Personal Experience',
      description: 'Share your individual journey, challenge, or transformation',
      icon: '👤',
      examples: ['Health journey', 'Mental health experience', 'Life transition', 'Personal growth']
    },
    {
      id: 'service',
      name: 'Service Experience',
      description: 'Share your experience with healthcare, education, or community services',
      icon: '🏥',
      examples: ['Hospital visit', 'School experience', 'Government service', 'Support program']
    },
    {
      id: 'community',
      name: 'Community Story',
      description: 'Share how your community or culture has shaped your experience',
      icon: '🌏',
      examples: ['Cultural tradition', 'Community support', 'Neighbourhood change', 'Local initiative']
    },
    {
      id: 'change',
      name: 'Change Story',
      description: 'Share about creating or witnessing positive change in your community',
      icon: '✨',
      examples: ['Policy advocacy', 'Community organizing', 'Social innovation', 'Leadership journey']
    }
  ];

  const comingSoonFeatures = [
    {
      title: 'Multi-Format Submission',
      description: 'Share through text, voice recording, video, or images',
      status: 'Q2 2024',
      icon: '🎬'
    },
    {
      title: 'Cultural Protocols',
      description: 'Customisable cultural review and approval processes',
      status: 'Q2 2024',
      icon: '🌍'
    },
    {
      title: 'Anonymous Verification',
      description: 'Verify your identity while keeping your story anonymous',
      status: 'Q3 2024',
      icon: '🛡️'
    },
    {
      title: 'Impact Tracking',
      description: 'See how your story contributes to real-world change',
      status: 'Q3 2024',
      icon: '📈'
    },
    {
      title: 'Community Matching',
      description: 'Connect with others who share similar experiences',
      status: 'Q4 2024',
      icon: '🤝'
    },
    {
      title: 'Smart Compensation',
      description: 'Automatic fair compensation when stories create value',
      status: 'Q4 2024',
      icon: '💎'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">SECURE & PRIVATE</div>
            <h1 className="hero-title">
              Your Story Has Power
            </h1>
            <p className="hero-description">
              Share your experience with complete control over your privacy and data. 
              Your story remains yours - forever.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={() => setSelectedStep(1)}>
                Start Sharing
              </button>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                See Impact Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story Type Selection */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>What Kind of Story Would You Like to Share?</h2>
            <p>Choose the type that best fits your experience</p>
          </div>

          <div className="story-types-grid">
            {storyTypes.map((type) => (
              <div key={type.id} className="story-type-card">
                <div className="story-type-header">
                  <div className="story-type-icon">{type.icon}</div>
                  <h3>{type.name}</h3>
                </div>
                
                <p className="story-type-description">{type.description}</p>
                
                <div className="story-type-examples">
                  <h4>Examples:</h4>
                  <ul>
                    {type.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="story-type-action">
                  <button className="btn btn-outline btn-coming-soon" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Control */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Complete Privacy Control</h2>
            <p>You decide every aspect of how your story is shared and used</p>
          </div>

          <div className="privacy-features">
            <div className="privacy-feature">
              <div className="privacy-icon">🔐</div>
              <div className="privacy-content">
                <h3>Anonymous by Default</h3>
                <p>No real names required. Your identity stays completely private unless you choose otherwise.</p>
              </div>
            </div>
            
            <div className="privacy-feature">
              <div className="privacy-icon">🎛️</div>
              <div className="privacy-content">
                <h3>Granular Control</h3>
                <p>Choose exactly who can see your story: researchers, policymakers, community, or keep it completely private.</p>
              </div>
            </div>
            
            <div className="privacy-feature">
              <div className="privacy-icon">💰</div>
              <div className="privacy-content">
                <h3>Value Sharing</h3>
                <p>If your story contributes to research or policy that creates value, you receive fair compensation.</p>
              </div>
            </div>
            
            <div className="privacy-feature">
              <div className="privacy-icon">🚪</div>
              <div className="privacy-content">
                <h3>Exit Anytime</h3>
                <p>Remove your story, change permissions, or update your privacy settings at any time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Features */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>What's Coming Soon</h2>
            <p>We're building the most comprehensive storytelling platform for communities</p>
          </div>

          <div className="coming-soon-timeline">
            {comingSoonFeatures.map((feature, index) => (
              <div key={index} className="coming-soon-card">
                <div className="coming-soon-status">{feature.status}</div>
                <div className="coming-soon-content">
                  <div className="coming-soon-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beta Access */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Join Our Beta Program</h2>
            <p>Be among the first to share your story and shape the platform</p>
          </div>

          <div className="beta-signup-card">
            <div className="beta-content">
              <div className="beta-benefits">
                <h3>Beta Access Includes:</h3>
                <ul className="beta-benefits-list">
                  <li>✓ Early access to story submission</li>
                  <li>✓ Direct input on platform features</li>
                  <li>✓ Priority support and onboarding</li>
                  <li>✓ Community of early storytellers</li>
                  <li>✓ No fees during beta period</li>
                </ul>
              </div>
              
              <div className="beta-form">
                <h3>Request Beta Access</h3>
                <form className="beta-form-fields">
                  <input 
                    type="email" 
                    placeholder="Your email address"
                    className="beta-input"
                  />
                  <select className="beta-input">
                    <option value="">I'm interested in sharing...</option>
                    <option value="personal">Personal experiences</option>
                    <option value="service">Service experiences</option>
                    <option value="community">Community stories</option>
                    <option value="change">Change stories</option>
                  </select>
                  <button type="submit" className="btn btn-primary btn-large">
                    Request Access
                  </button>
                </form>
                
                <p className="beta-privacy-note">
                  We'll only use your email to notify you about beta access. 
                  <Link href="/privacy"> View our privacy policy →</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Resources */}
      <section className="section cta-section">
        <div className="container">
          <div className="section-header">
            <h2>Support & Resources</h2>
            <p className="section-description">We're here to help throughout your storytelling journey</p>
          </div>
          
          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="card-header">Crisis Support</h3>
              <p className="support-text">24/7 trained counsellors available anytime you need to talk</p>
              <p className="crisis-phone">Lifeline: 13 11 14</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="card-header">Storytelling Guide</h3>
              <p className="support-text">Tips and resources for sharing your story safely and effectively</p>
              <Link href="/guides/storytelling" className="card-link">Read Guide →</Link>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.818-4.954A9.955 9.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2a9.955 9.955 0 015.818 2.954l-1.286 1.286A7.966 7.966 0 0011 4a8 8 0 100 16 8 8 0 004.532-1.286l1.286-1.286z" />
                </svg>
              </div>
              <h3 className="card-header">Privacy Protection</h3>
              <p className="support-text">Understand exactly how we protect your story and personal data</p>
              <Link href="/trust-security" className="card-link">Learn More →</Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .story-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
          margin-top: var(--space-2xl);
        }

        .story-type-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .story-type-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: var(--color-brand-blue);
        }

        .story-type-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .story-type-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .story-type-header h3 {
          font-size: 20px;
          margin: 0;
        }

        .story-type-description {
          color: var(--color-ink-light);
          line-height: 1.6;
          margin-bottom: var(--space-lg);
        }

        .story-type-examples h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
        }

        .story-type-examples ul {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--space-lg) 0;
        }

        .story-type-examples li {
          font-size: 15px;
          color: var(--color-ink-light);
          margin-bottom: var(--space-xs);
          padding-left: var(--space-md);
          position: relative;
          line-height: 1.4;
        }

        .story-type-examples li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--color-brand-blue);
        }

        .story-type-action {
          margin-top: auto;
        }

        .btn-coming-soon {
          background: var(--color-gray-lighter);
          color: var(--color-gray);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .privacy-features {
          display: grid;
          gap: var(--space-xl);
          max-width: 800px;
          margin: 0 auto;
        }

        .privacy-feature {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
          padding: var(--space-lg);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
        }

        .privacy-icon {
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

        .privacy-content h3 {
          font-size: 18px;
          margin-bottom: var(--space-sm);
        }

        .privacy-content p {
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.6;
        }

        .coming-soon-timeline {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-lg);
        }

        .coming-soon-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-light);
          border-radius: 12px;
          padding: var(--space-lg);
          position: relative;
          transition: all 0.2s ease;
        }

        .coming-soon-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .coming-soon-status {
          position: absolute;
          top: var(--space-sm);
          right: var(--space-sm);
          background: var(--color-brand-blue);
          color: var(--color-white);
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .coming-soon-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .coming-soon-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-lighter);
          border-radius: 8px;
          align-self: flex-start;
        }

        .coming-soon-content h3 {
          font-size: 16px;
          margin: 0;
        }

        .coming-soon-content p {
          font-size: 15px;
          color: var(--color-ink-light);
          margin: 0;
          line-height: 1.6;
        }

        .beta-signup-card {
          background: var(--color-white);
          border: 2px solid var(--color-brand-blue);
          border-radius: 16px;
          padding: var(--space-3xl);
          max-width: 900px;
          margin: 0 auto;
        }

        .beta-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3xl);
          align-items: start;
        }

        .beta-benefits h3 {
          margin-bottom: var(--space-lg);
          color: var(--color-ink);
        }

        .beta-benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .beta-benefits-list li {
          margin-bottom: var(--space-sm);
          color: var(--color-ink);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 15px;
          line-height: 1.5;
        }

        .beta-form h3 {
          margin-bottom: var(--space-lg);
          color: var(--color-ink);
        }

        .beta-form-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .beta-input {
          padding: var(--space-md);
          border: 2px solid var(--color-gray-light);
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s ease;
        }

        .beta-input:focus {
          outline: none;
          border-color: var(--color-brand-blue);
        }

        .beta-privacy-note {
          font-size: 14px;
          color: var(--color-ink-light);
          margin-top: var(--space-md);
          line-height: 1.4;
        }
        
        .crisis-phone {
          font-weight: 600;
          margin-top: var(--space-sm);
          color: var(--color-ink);
          font-size: 16px;
          background: var(--color-brand-red);
          color: var(--color-white);
          padding: var(--space-sm) var(--space-md);
          border-radius: 8px;
          display: inline-block;
        }

        .card-link {
          font-size: 16px;
          color: var(--color-brand-blue);
          text-decoration: none;
          font-weight: 600;
          margin-top: var(--space-sm);
          display: inline-block;
          padding: var(--space-xs) 0;
        }

        .card-link:hover {
          color: var(--color-brand-red);
          text-decoration: underline;
        }
        
        .support-text {
          color: var(--color-ink);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: var(--space-md);
        }
        
        .section-description {
          color: var(--color-white);
          font-size: 18px;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .card-header {
          color: var(--color-ink);
          font-size: 20px;
          font-weight: 600;
          margin-bottom: var(--space-md);
        }

        @media (max-width: 768px) {
          .beta-content {
            grid-template-columns: 1fr;
            gap: var(--space-xl);
          }
          
          .privacy-feature {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}