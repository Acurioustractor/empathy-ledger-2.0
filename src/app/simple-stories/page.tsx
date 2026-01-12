import React from 'react';
import Link from 'next/link';

export default function SimpleStoriesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">BROWSE STORIES</div>
            <h1 className="hero-title">
              Community Stories
            </h1>
            <p className="hero-description">
              Explore stories shared by community members who maintain ownership 
              of their narratives while building collective understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Recent Stories</h2>
            <p>Shared with consent to inspire and connect</p>
          </div>

          <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'}}>
            {/* Sample Story Cards */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="storyteller-header" style={{marginBottom: 'var(--space-md)'}}>
                  <div className="icon icon-blue" style={{width: '48px', height: '48px'}}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="storyteller-info" style={{textAlign: 'left'}}>
                    <h3 style={{fontSize: '18px', marginBottom: '4px'}}>
                      {['Finding My Voice', 'Journey to Healing', 'Breaking Barriers', 'Community Support', 'New Beginnings', 'Strength in Unity'][i]}
                    </h3>
                    <p style={{fontSize: '14px', color: 'var(--color-gray)', margin: 0}}>
                      Anonymous • {['2 days ago', '5 days ago', '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago'][i]}
                    </p>
                  </div>
                </div>
                
                <p style={{marginBottom: 'var(--space-lg)', lineHeight: 1.6}}>
                  {[
                    'After years of silence, I finally found the courage to speak up about my experiences. Sharing my story has been transformative...',
                    'The path to healing isn\'t linear, but every step forward matters. Through community support, I\'ve learned that vulnerability is strength...',
                    'They said it couldn\'t be done, but here I am. My story is proof that with determination and support, anything is possible...',
                    'I never realized how powerful community could be until I needed it most. This is my story of finding belonging...',
                    'Sometimes the hardest endings lead to the most beautiful beginnings. Here\'s how I turned my challenges into opportunities...',
                    'Alone we are strong, but together we are unstoppable. This is a story about the power of collective action...'
                  ][i]}
                </p>
                
                <div className="storyteller-themes" style={{marginBottom: 'var(--space-md)'}}>
                  {[
                    ['Mental Health', 'Courage', 'Growth'],
                    ['Recovery', 'Support', 'Hope'],
                    ['Achievement', 'Persistence', 'Success'],
                    ['Community', 'Belonging', 'Connection'],
                    ['Resilience', 'Change', 'Opportunity'],
                    ['Unity', 'Advocacy', 'Impact']
                  ][i].map(theme => (
                    <span key={theme} className="theme-pill">{theme}</span>
                  ))}
                </div>
                
                <div style={{textAlign: 'right'}}>
                  <Link href={`/story/${i}`} className="view-more">
                    Read Full Story →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="section values-section">
        <div className="container">
          <div className="connection-note" style={{maxWidth: '800px'}}>
            <svg className="connection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: 'var(--space-sm)'}}>
                Full Story Archive Coming Soon
              </h3>
              <p>We're currently migrating our story database with enhanced privacy protections. 
              The full collection of community stories will be available once migration is complete.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Have a Story to Share?</h2>
            <p>Your experience matters and could help someone else feel less alone</p>
            <div className="flex justify-center gap-4">
              <Link href="/submit" className="btn btn-primary btn-large">
                Share Your Story
              </Link>
              <Link href="/how-it-works" className="btn btn-secondary btn-large">
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}