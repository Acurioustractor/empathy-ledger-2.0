'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Static fallback data for A Curious Tractor
const fallbackData = {
  'a-curious-tractor': {
    title: 'A Curious Tractor',
    organisation: 'A Curious Tractor',
    location: 'Australia',
    category: 'Platform Showcase',
    heroImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&h=600&fit=crop&q=80',
    overview: 'Our flagship showcase demonstrating how Empathy Ledger transforms community storytelling into evidence for meaningful change.',
    content: {
      stats: {
        stories_collected: 156,
        communities_served: 12,
        platform_features_tested: 15,
        documentation_created: '25 guides'
      },
      sections: {
        challenge: 'As a forward-thinking organization focused on community impact, A Curious Tractor needed a platform that could authentically capture and share community stories while respecting privacy, maintaining cultural sensitivity, and providing actionable insights for positive change.',
        solution: 'Empathy Ledger provided A Curious Tractor with a comprehensive storytelling platform featuring end-to-end encryption, cultural protocol enforcement, multi-format story collection, and powerful analytics tools that transform narratives into evidence for community action.',
        results: 'A Curious Tractor successfully demonstrated the platform\'s full potential, establishing best practices for community storytelling, data sovereignty, and evidence-based advocacy that other organizations now follow.'
      },
      testimonials: [
        {
          quote: "A Curious Tractor's collaboration with Empathy Ledger has shown us what's possible when technology serves community sovereignty.",
          author: "Community Partnership Lead",
          role: "A Curious Tractor",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80"
        }
      ]
    },
    tags: ['Platform Development', 'Community Storytelling', 'Best Practices']
  }
};

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export default function DynamicCaseStudyPage({ params }: CaseStudyPageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [caseStudyData, setCaseStudyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchCaseStudyData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from CMS API
        const response = await fetch(`/api/cms?type=page&slug=${slug}`);
        const data = await response.json();
        
        if (data.useFallback || !data.page) {
          // Use static fallback data
          const fallback = fallbackData[slug as keyof typeof fallbackData];
          if (fallback) {
            setCaseStudyData(fallback);
            setUsingFallback(true);
            console.log('Using fallback data for:', slug);
          } else {
            throw new Error('Case study not found');
          }
        } else {
          // Use CMS data
          setCaseStudyData(data.page);
          setUsingFallback(false);
          console.log('Using CMS data for:', slug);
        }
      } catch (error) {
        console.error('Error fetching case study:', error);
        
        // Try fallback data
        const fallback = fallbackData[slug as keyof typeof fallbackData];
        if (fallback) {
          setCaseStudyData(fallback);
          setUsingFallback(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudyData();
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading case study...</p>
      </div>
    );
  }

  if (!caseStudyData) {
    return (
      <div className="error-container">
        <h1>Case Study Not Found</h1>
        <p>The requested case study could not be found.</p>
        <Link href="/case-studies" className="btn btn-primary">
          Back to Case Studies
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Debug indicator */}
      {usingFallback && (
        <div className="debug-indicator">
          ⚠️ Using static content - CMS not available
        </div>
      )}

      {/* Hero Section */}
      <section className="case-study-hero" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${caseStudyData.heroImage || caseStudyData.featured_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="container">
          <Link href="/case-studies" className="back-link">
            ← Back to Case Studies
          </Link>
          
          <div className="case-study-hero-content">
            <div className="hero-badge">{caseStudyData.category}</div>
            <h1 className="hero-title">{caseStudyData.title}</h1>
            <div className="hero-meta">
              <span>{caseStudyData.organisation || caseStudyData.content?.hero?.organisation}</span>
              <span>{caseStudyData.location || caseStudyData.content?.hero?.location}</span>
            </div>
            <p className="hero-description">
              {caseStudyData.overview || caseStudyData.description || caseStudyData.content?.hero?.overview}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">
                {caseStudyData.content?.stats?.stories_collected || 
                 caseStudyData.content?.hero?.stats?.stories_collected || 
                 '156'}
              </div>
              <div className="stat-label">Stories Collected</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {caseStudyData.content?.stats?.platform_features_tested || 
                 caseStudyData.content?.hero?.stats?.platform_features_tested || 
                 '15'}
              </div>
              <div className="stat-label">Platform Features</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {caseStudyData.content?.stats?.communities_served || 
                 caseStudyData.content?.hero?.stats?.communities_served || 
                 '12'}
              </div>
              <div className="stat-label">Communities</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {caseStudyData.content?.stats?.documentation_created || 
                 caseStudyData.content?.hero?.stats?.documentation_created || 
                 '25'}
              </div>
              <div className="stat-label">Guides Created</div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge, Solution, Results */}
      <section className="section">
        <div className="container">
          <div className="case-study-content">
            <div className="content-section">
              <h2>The Challenge</h2>
              <p>{caseStudyData.content?.sections?.challenge}</p>
            </div>
            
            <div className="content-section">
              <h2>The Solution</h2>
              <p>{caseStudyData.content?.sections?.solution}</p>
            </div>
            
            <div className="content-section">
              <h2>The Results</h2>
              <p>{caseStudyData.content?.sections?.results}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {caseStudyData.content?.testimonials && caseStudyData.content.testimonials.length > 0 && (
        <section className="section testimonial-section">
          <div className="container">
            <div className="section-header">
              <h2>What Our Partners Say</h2>
              <p>Feedback from the collaboration</p>
            </div>
            
            <div className="testimonials-grid">
              {caseStudyData.content.testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="testimonial-card">
                  <p className="testimonial-quote">"{testimonial.quote}"</p>
                  <div className="testimonial-author">
                    <img src={testimonial.image} alt={testimonial.author} />
                    <div>
                      <div className="author-name">{testimonial.author}</div>
                      <div className="author-role">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Community Storytelling?</h2>
            <p>
              See how {caseStudyData.organisation || 'organizations'} leverage Empathy Ledger to create meaningful change. 
              Your organization can achieve similar impact with our comprehensive platform.
            </p>
            <div className="cta-buttons">
              <Link href="/submit" className="btn btn-primary">
                Try Story Collection
              </Link>
              <Link href="/modules" className="btn btn-outline">
                Explore Platform Modules
              </Link>
              <Link href="/visualisations" className="btn btn-outline">
                View Analytics Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Remove underlines from all content */
        .case-study-hero *,
        .stats-section *,
        .testimonial-section *,
        .cta-section *,
        .content-section * {
          text-decoration: none !important;
        }
        
        a, a:hover, a:focus, a:active {
          text-decoration: none !important;
        }

        .debug-indicator {
          background: #fbbf24;
          color: #92400e;
          padding: 8px 16px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
        }

        .loading-container, .error-container {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .case-study-hero {
          min-height: 60vh;
          display: flex;
          align-items: center;
          color: white;
          position: relative;
        }

        .back-link {
          color: white;
          text-decoration: none;
          font-size: 16px;
          margin-bottom: 2rem;
          display: inline-block;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        .back-link:hover {
          opacity: 1;
          text-decoration: none;
        }

        .case-study-hero-content {
          max-width: 800px;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 1rem;
          display: inline-block;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .hero-meta {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .hero-meta span {
          margin-right: 2rem;
        }

        .hero-description {
          font-size: 1.3rem;
          line-height: 1.6;
          max-width: 700px;
        }

        .stats-section {
          background: var(--color-gray-lighter);
          padding: 4rem 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          text-align: center;
        }

        .stat-item {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--color-brand-blue);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: var(--color-ink-light);
          font-weight: 600;
        }

        .case-study-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .content-section {
          margin-bottom: 3rem;
        }

        .content-section h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--color-ink);
        }

        .content-section p {
          font-size: 1.2rem;
          line-height: 1.7;
          color: var(--color-ink-light);
        }

        .testimonial-section {
          background: var(--color-gray-lighter);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-ink);
        }

        .section-header p {
          font-size: 1.2rem;
          color: var(--color-ink-light);
          margin: 0;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .testimonial-quote {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--color-ink);
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
        }

        .testimonial-author img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 1rem;
          object-fit: cover;
        }

        .author-name {
          font-weight: 600;
          color: var(--color-ink);
        }

        .author-role {
          font-size: 0.9rem;
          color: var(--color-ink-light);
        }

        .cta-section {
          background: var(--color-brand-blue);
          color: white;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn:hover {
          text-decoration: none;
        }

        .btn-primary {
          background: white;
          color: var(--color-brand-blue);
        }

        .btn-outline {
          border: 2px solid white;
          color: white;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}