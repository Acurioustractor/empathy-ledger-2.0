'use client';

import React from 'react';
import Link from 'next/link';
// import StorytellerCardsClean from '@/components/cms/StorytellerCardsClean';

export default function CommunityGalleryPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">COMMUNITY GALLERY</div>
            <h1 className="hero-title">
              Voices United
            </h1>
            <p className="hero-description">
              A celebration of courage, resilience, and shared humanity. 
              These storytellers have chosen to share their experiences with complete control over their privacy and dignity.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="section privacy-notice-section">
        <div className="container">
          <div className="privacy-notice">
            <div className="privacy-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="privacy-content">
              <h3>Dignity-First Storytelling</h3>
              <p>
                Every storyteller here has complete control over what they share. 
                Each person chooses their own level of privacy—from photos and locations to story details. 
                <strong> No information appears without explicit consent.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Storytellers */}
      <section className="section storytellers-section">
        <div className="container">
          {/* <StorytellerCardsClean 
            title="Community Storytellers"
            subtitle="Real voices sharing authentic experiences with purpose and privacy"
            limit={9}
          /> */}
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-gray-600">Community storyteller gallery coming soon!</p>
            <Link href="/stories" className="text-blue-600 hover:text-blue-700 font-medium">
              Browse Stories →
            </Link>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Community Impact</h2>
            <p>The power of shared stories in numbers</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <h3 style={{fontSize: '36px', marginBottom: 'var(--space-sm)'}}>2,847</h3>
              <p>Stories shared this year</p>
            </div>
            
            <div className="value-card">
              <h3 style={{fontSize: '36px', marginBottom: 'var(--space-sm)'}}>156</h3>
              <p>Communities represented</p>
            </div>
            
            <div className="value-card">
              <h3 style={{fontSize: '36px', marginBottom: 'var(--space-sm)'}}>94%</h3>
              <p>Found connection through sharing</p>
            </div>
          </div>

          <div className="connection-note" style={{maxWidth: '800px', marginTop: 'var(--space-3xl)'}}>
            <svg className="connection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p>Every storyteller maintains complete control over their narrative and privacy settings. These brave individuals have chosen to share with dignity to help others feel less alone.</p>
          </div>
        </div>
      </section>

      {/* Join the Gallery */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Add Your Voice</h2>
            <p>Join a community of storytellers creating change through shared experience</p>
            <div className="flex justify-center gap-4">
              <Link href="/submit" className="btn btn-primary btn-large">
                Share Your Story
              </Link>
              <Link href="/simple-stories" className="btn btn-secondary btn-large">
                Browse All Stories
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .privacy-notice-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 2rem 0;
        }

        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);
          border-left: 4px solid #f59e0b;
        }

        .privacy-icon {
          flex-shrink: 0;
          color: #d97706;
        }

        .privacy-icon svg {
          width: 2rem;
          height: 2rem;
        }

        .privacy-content h3 {
          margin: 0 0 0.5rem 0;
          color: #92400e;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .privacy-content p {
          margin: 0;
          color: #78350f;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .privacy-notice {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}