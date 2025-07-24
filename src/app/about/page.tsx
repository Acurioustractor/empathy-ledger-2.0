import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">OUR STORY</div>
            <h1 className="hero-title">
              Stories belong to their tellers
            </h1>
            <p className="hero-description">
              Empathy Ledger is a community-first storytelling platform where technology serves human dignity, 
              storytellers maintain ownership of their narratives, and communities control their cultural data.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Mission</h2>
            <p>Building technology that serves communities, not shareholders</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3>Community Ownership</h3>
              <p>Stories belong to storytellers, not platforms. Communities decide how their narratives are shared and used.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3>Data Sovereignty</h3>
              <p>Following Indigenous data sovereignty principles. Cultural knowledge stays with its communities.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3>Ethical Technology</h3>
              <p>AI serves storytellers, not shareholders. Innovation happens with communities, not to them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Why We Built This</h2>
            <p>Technology doesn't have to extract from communities—it can serve them</p>
          </div>

          <div className="connection-note" style={{maxWidth: '800px'}}>
            <div style={{width: '100%'}}>
              <p style={{margin: 0, lineHeight: 1.6}}>
                We believe another way is possible. Stories don't have to be commodified—they 
                can remain with their tellers while still building collective wisdom. We're not 
                venture-backed, we're not racing for an exit, and we're not building to sell user data. 
                This is our contribution to a world where technology honors human dignity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitments Section */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Commitments</h2>
            <p>Promises we make to every storyteller and community</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3>Story Ownership</h3>
              <p>Your story belongs to you, always. You control how it's shared, analysed, and used. You can remove it at any time.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>Community Governance</h3>
              <p>Communities control their data governance. Cultural protocols are respected. Every decision is transparent.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3>Fair Value</h3>
              <p>Value created from stories flows back to storytelling communities, not platform shareholders.</p>
            </div>
          </div>

          <div className="connection-note" style={{maxWidth: '800px', marginTop: 'var(--space-3xl)'}}>
            <svg className="connection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p>We follow Indigenous data sovereignty principles and the CARE framework (Collective benefit, Authority to control, Responsibility, Ethics)</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Built by A Curious Tractor</h2>
            <p>A collective committed to technology that serves human dignity</p>
          </div>

          <div className="connection-note" style={{maxWidth: '800px'}}>
            <div style={{width: '100%'}}>
              <p style={{margin: 0, lineHeight: 1.6}}>
                We're a diverse team of technologists, community advocates, and storytellers united by a shared mission. 
                We believe in building with communities, not for them. Our work is guided by Indigenous data sovereignty 
                principles and a commitment to ensuring technology amplifies voices without extracting value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Join Our Mission</h2>
            <p>Whether you're a storyteller, community organisation, or technology partner, there's a place for you</p>
            <div className="flex justify-center gap-4">
              <Link href="/submit" className="btn btn-primary btn-large">
                Share Your Story
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-large">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}