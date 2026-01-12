'use client';

import React from 'react';
import Link from 'next/link';

// In production, this would fetch from Supabase based on the ID
const caseStudyData = {
  id: 'indigenous-health-network',
  title: 'Indigenous Health Network',
  organisation: 'First Nations Health Authority',
  location: 'British Columbia, Canada',
  category: 'Healthcare',
  heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=600&fit=crop',
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Replace with actual video
  overview: 'The First Nations Health Authority partnered with Empathy Ledger to create a culturally-safe platform for Indigenous communities to share their healthcare experiences while maintaining complete data sovereignty.',
  challenge: 'Indigenous communities in British Columbia faced significant barriers in accessing culturally appropriate healthcare. Traditional data collection methods violated cultural protocols and failed to capture the full context of health and wellness from an Indigenous perspective.',
  solution: 'Empathy Ledger provided a platform that respected Indigenous data sovereignty principles, allowing communities to control their own narratives while contributing to systemic healthcare improvements.',
  results: 'The collected stories led to fundamental changes in healthcare delivery, including the establishment of 15 new Indigenous wellness centres and the integration of traditional healing practices into mainstream healthcare services.',
  impact: {
    stories_collected: 2847,
    communities_served: 523,
    policy_changes: 12,
    lives_impacted: '45,000+',
    custom_metrics: {
      wellness_centers_created: 15,
      traditional_healers_integrated: 89,
      cultural_safety_training: '1,200 healthcare workers'
    }
  },
  processSteps: [
    {
      step: 1,
      title: 'Elder Consultation',
      description: 'Engaged with Elders from 50+ nations to establish cultural protocols',
      duration: '2 months',
      icon: '🙏'
    },
    {
      step: 2,
      title: 'Community Engagement',
      description: 'Built relationships with 500+ communities through local gatherings',
      duration: '6 months',
      icon: '🤝'
    },
    {
      step: 3,
      title: 'Story Collection',
      description: 'Gathered 2,847 stories using culturally appropriate methods',
      duration: '12 months',
      icon: '📝'
    },
    {
      step: 4,
      title: 'Community Analysis',
      description: 'Communities analysed their own data to identify key themes',
      duration: '3 months',
      icon: '🔍'
    },
    {
      step: 5,
      title: 'Implementation',
      description: 'Translated insights into concrete healthcare improvements',
      duration: 'Ongoing',
      icon: '🏥'
    }
  ],
  testimonials: [
    {
      quote: "For the first time, our people's voices are being heard in their own words, on their own terms. This platform respects our sovereignty while creating real change.",
      author: "Elder Mary Williams",
      role: "Cultural Advisor",
      image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop"
    },
    {
      quote: "The stories we collected revealed systemic issues we knew existed but couldn't prove. Now we have the evidence to drive meaningful policy changes.",
      author: "Dr. Sarah Chen",
      role: "Director of Indigenous Health",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop"
    }
  ],
  tags: ['Healthcare', 'Indigenous', 'Policy Change', 'Data Sovereignty']
};

export default function CaseStudyDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const [id, setId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);
  
  if (!id) return <div>Loading...</div>;
  return (
    <div>
      {/* Hero Section with Video */}
      <section className="case-study-hero" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${caseStudyData.heroImage})`}}>
        <div className="container">
          <Link href="/case-studies" className="back-link-hero">
            ← Back to Case Studies
          </Link>
          
          <div className="hero-content-wrapper">
            <div className="hero-badge">{caseStudyData.category.toUpperCase()}</div>
            <h1 className="case-study-title">{caseStudyData.title}</h1>
            <p className="case-study-subtitle">
              {caseStudyData.organisation} • {caseStudyData.location}
            </p>
          </div>
        </div>
      </section>

      {/* Impact Overview */}
      <section className="section impact-overview">
        <div className="container">
          <div className="impact-cards">
            <div className="impact-card">
              <h2>{caseStudyData.impact.stories_collected.toLocaleString()}</h2>
              <p>Stories Collected</p>
            </div>
            <div className="impact-card">
              <h2>{caseStudyData.impact.communities_served}</h2>
              <p>Communities Served</p>
            </div>
            <div className="impact-card">
              <h2>{caseStudyData.impact.policy_changes}</h2>
              <p>Policy Changes</p>
            </div>
            <div className="impact-card">
              <h2>{caseStudyData.impact.lives_impacted}</h2>
              <p>Lives Impacted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="section content-section">
        <div className="container">
          <div className="content-wrapper">
            <div className="content-header">
              <h2>Overview</h2>
            </div>
            <p className="content-text">{caseStudyData.overview}</p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {caseStudyData.videoUrl && (
        <section className="section video-section">
          <div className="container">
            <div className="video-wrapper">
              <iframe
                src={caseStudyData.videoUrl}
                title="Case Study Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {/* Challenge & Solution */}
      <section className="section challenge-solution">
        <div className="container">
          <div className="two-column">
            <div className="column">
              <div className="column-header">
                <div className="column-icon">🎯</div>
                <h2>The Challenge</h2>
              </div>
              <p>{caseStudyData.challenge}</p>
            </div>
            
            <div className="column">
              <div className="column-header">
                <div className="column-icon">💡</div>
                <h2>The Solution</h2>
              </div>
              <p>{caseStudyData.solution}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="section process-section">
        <div className="container">
          <div className="section-header">
            <h2>Implementation Journey</h2>
            <p>How we brought the vision to life</p>
          </div>
          
          <div className="process-timeline">
            {caseStudyData.processSteps.map((step, index) => (
              <div key={step.step} className="process-step">
                <div className="step-connector" />
                <div className="step-content">
                  <div className="step-header">
                    <div className="step-icon">{step.icon}</div>
                    <div className="step-number">Step {step.step}</div>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <span className="step-duration">{step.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results & Custom Metrics */}
      <section className="section results-section">
        <div className="container">
          <div className="content-wrapper">
            <div className="content-header">
              <h2>Transformative Results</h2>
            </div>
            <p className="content-text">{caseStudyData.results}</p>
            
            <div className="custom-metrics">
              <h3>Additional Impact Metrics</h3>
              <div className="metrics-grid">
                {Object.entries(caseStudyData.impact.custom_metrics).map(([key, value]) => (
                  <div key={key} className="metric-item">
                    <span className="metric-value">{value}</span>
                    <span className="metric-label">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Voices from the Community</h2>
          </div>
          
          <div className="testimonials-grid">
            {caseStudyData.testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <blockquote>"{testimonial.quote}"</blockquote>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.author} />
                  <div>
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Create Your Own Success Story?</h2>
            <p>Learn how Empathy Ledger can help your community</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Start Your Journey
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                More Case Studies
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .case-study-hero {
          background-size: cover;
          background-position: center;
          padding: 180px 0 120px;
          position: relative;
          color: white;
        }

        .back-link-hero {
          color: white;
          text-decoration: none;
          font-size: 14px;
          opacity: 0.8;
          transition: opacity 0.2s ease;
          display: inline-block;
          margin-bottom: var(--space-xl);
        }

        .back-link-hero:hover {
          opacity: 1;
        }

        .hero-content-wrapper {
          max-width: 800px;
        }

        .case-study-title {
          font-size: 64px;
          margin-bottom: var(--space-md);
          line-height: 1.1;
        }

        .case-study-subtitle {
          font-size: 20px;
          opacity: 0.9;
        }

        .impact-overview {
          background: var(--color-gray-lighter);
          padding: var(--space-3xl) 0;
          margin-top: -60px;
          position: relative;
          z-index: 10;
        }

        .impact-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-xl);
        }

        .impact-card {
          background: white;
          padding: var(--space-xl);
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .impact-card h2 {
          color: var(--color-brand-blue);
          font-size: 48px;
          margin-bottom: var(--space-sm);
        }

        .impact-card p {
          color: var(--color-gray);
          margin: 0;
        }

        .content-section {
          background: white;
        }

        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        .content-header {
          margin-bottom: var(--space-xl);
        }

        .content-header h2 {
          font-size: 36px;
          margin-bottom: 0;
        }

        .content-text {
          font-size: 18px;
          line-height: 1.8;
          color: var(--color-ink-light);
        }

        .video-section {
          background: var(--color-gray-lighter);
        }

        .video-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .challenge-solution {
          background: var(--color-gray-lighter);
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3xl);
        }

        .column {
          background: white;
          padding: var(--space-2xl);
          border-radius: 16px;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .column-icon {
          font-size: 48px;
        }

        .column h2 {
          font-size: 28px;
          margin: 0;
        }

        .column p {
          color: var(--color-ink-light);
          line-height: 1.6;
        }

        .process-section {
          background: white;
        }

        .process-timeline {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .process-timeline::before {
          content: '';
          position: absolute;
          left: 35px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--color-gray-light);
        }

        .process-step {
          position: relative;
          padding-left: 80px;
          margin-bottom: var(--space-3xl);
        }

        .step-connector {
          position: absolute;
          left: 24px;
          top: 24px;
          width: 24px;
          height: 24px;
          background: white;
          border: 3px solid var(--color-brand-blue);
          border-radius: 50%;
        }

        .step-content {
          background: var(--color-gray-lighter);
          padding: var(--space-xl);
          border-radius: 12px;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .step-icon {
          font-size: 36px;
        }

        .step-number {
          font-size: 14px;
          color: var(--color-gray);
          font-weight: 600;
        }

        .step-content h3 {
          font-size: 24px;
          margin-bottom: var(--space-sm);
        }

        .step-content p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-md);
        }

        .step-duration {
          font-size: 14px;
          color: var(--color-gray);
          font-style: italic;
        }

        .results-section {
          background: var(--color-gray-lighter);
        }

        .custom-metrics {
          margin-top: var(--space-3xl);
          padding: var(--space-2xl);
          background: white;
          border-radius: 12px;
        }

        .custom-metrics h3 {
          font-size: 24px;
          margin-bottom: var(--space-xl);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xl);
        }

        .metric-item {
          text-align: center;
        }

        .metric-value {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-sm);
        }

        .metric-label {
          display: block;
          font-size: 14px;
          color: var(--color-gray);
          text-transform: capitalize;
        }

        .testimonials-section {
          background: white;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-2xl);
          margin-top: var(--space-2xl);
        }

        .testimonial-card {
          background: var(--color-gray-lighter);
          padding: var(--space-2xl);
          border-radius: 16px;
        }

        .testimonial-card blockquote {
          font-size: 20px;
          line-height: 1.6;
          color: var(--color-ink);
          margin-bottom: var(--space-xl);
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .testimonial-author img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .testimonial-author h4 {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .testimonial-author p {
          color: var(--color-gray);
          margin: 0;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .case-study-title {
            font-size: 48px;
          }

          .two-column {
            grid-template-columns: 1fr;
          }

          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .process-step {
            padding-left: 60px;
          }

          .process-timeline::before {
            left: 20px;
          }

          .step-connector {
            left: 9px;
          }
        }
      `}</style>
    </div>
  );
}