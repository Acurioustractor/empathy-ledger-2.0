import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">GET IN TOUCH</div>
            <h1 className="hero-title">
              Let's Connect
            </h1>
            <p className="hero-description">
              Ready to empower your community with privacy-preserving storytelling? 
              We're here to help you get started.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>How Can We Help?</h2>
            <p>Choose the best way to reach us</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>General Inquiries</h3>
              <p>hello@empathyledger.org</p>
              <p style={{fontSize: '14px', opacity: 0.7}}>Response within 48 hours</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3>Partnerships</h3>
              <p>partner@empathyledger.org</p>
              <p style={{fontSize: '14px', opacity: 0.7}}>For organizations & communities</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3>Support</h3>
              <p>support@empathyledger.org</p>
              <p style={{fontSize: '14px', opacity: 0.7}}>Technical help & guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Partnership Opportunities</h2>
            <p>Work with us to empower your community</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <h3>Community Organizations</h3>
              <p>Deploy Empathy Ledger for your community with full data sovereignty and custom governance.</p>
            </div>
            
            <div className="value-card">
              <h3>Research Institutions</h3>
              <p>Access anonymized insights while respecting storyteller privacy and community protocols.</p>
            </div>
            
            <div className="value-card">
              <h3>Healthcare Providers</h3>
              <p>Understand patient experiences to improve care delivery and health outcomes.</p>
            </div>
            
            <div className="value-card">
              <h3>Educational Institutions</h3>
              <p>Create safe spaces for student voices while maintaining privacy and trust.</p>
            </div>
            
            <div className="value-card">
              <h3>Government Agencies</h3>
              <p>Gather community feedback ethically to inform policy and service improvements.</p>
            </div>
            
            <div className="value-card">
              <h3>Indigenous Communities</h3>
              <p>Implement with full respect for data sovereignty and cultural protocols.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Office Info */}
      <section className="section">
        <div className="container">
          <div className="connection-note" style={{maxWidth: '800px'}}>
            <div style={{width: '100%'}}>
              <h3 style={{fontSize: '24px', fontWeight: '600', marginBottom: 'var(--space-lg)'}}>
                Our Office
              </h3>
              <p style={{marginBottom: 'var(--space-md)'}}>
                <strong>A Curious Tractor</strong><br />
                Sydney, Australia
              </p>
              <p style={{marginBottom: 'var(--space-md)'}}>
                We acknowledge the Traditional Custodians of the lands on which we work and live. 
                We pay our respects to Elders past, present, and emerging.
              </p>
              <p>
                <strong>Office Hours:</strong> Monday - Friday, 9am - 5pm AEST<br />
                <strong>Response Time:</strong> Within 48 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join the movement for ethical, community-owned storytelling</p>
            <div className="flex justify-center gap-4">
              <a href="mailto:hello@empathyledger.org" className="btn btn-primary btn-large">
                Email Us
              </a>
              <Link href="/how-it-works" className="btn btn-secondary btn-large">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}