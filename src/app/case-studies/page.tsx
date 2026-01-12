'use client';

import React from 'react';
import Link from 'next/link';

// Case study data - in production this would come from Supabase
const caseStudies = [
  {
    id: 'a-curious-tractor',
    title: 'A Curious Tractor',
    organisation: 'A Curious Tractor',
    location: 'Australia',
    category: 'Platform Showcase',
    profileImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=400&fit=crop&q=80',
    excerpt: 'Our flagship showcase demonstrating how Empathy Ledger transforms community storytelling into evidence for meaningful change.',
    impact: {
      stories: '156',
      communities: '12',
      policyChanges: '8',
      livesImpacted: '5,000+'
    },
    tags: ['Platform Development', 'Community Storytelling', 'Best Practices'],
    featured: true,
    isShowcase: true
  },
  {
    id: 'indigenous-health-network',
    title: 'Indigenous Health Network',
    organisation: 'First Nations Health Authority',
    location: 'British Columbia, Canada',
    category: 'Healthcare',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    excerpt: 'How 500+ Indigenous communities transformed healthcare delivery through shared stories of healing and wellness.',
    impact: {
      stories: '2,847',
      communities: '523',
      policyChanges: '12',
      livesImpacted: '45,000+'
    },
    tags: ['Healthcare', 'Indigenous', 'Policy Change'],
    featured: true
  },
  {
    id: 'youth-mental-health',
    title: 'Youth Voices Matter',
    organisation: 'Headspace Australia',
    location: 'Melbourne, Australia',
    category: 'Mental Health',
    profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    excerpt: 'Young people sharing mental health journeys led to complete redesign of support services across 150 centres.',
    impact: {
      stories: '8,234',
      communities: '150',
      policyChanges: '3',
      livesImpacted: '120,000+'
    },
    tags: ['Mental Health', 'Youth', 'Service Design'],
    featured: true
  },
  {
    id: 'refugee-integration',
    title: 'New Beginnings Project',
    organisation: 'UNHCR Partnership',
    location: 'Germany & France',
    category: 'Social Integration',
    profileImage: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=400&h=400&fit=crop',
    excerpt: 'Refugee stories bridging cultural divides and creating pathways to meaningful employment and community connection.',
    impact: {
      stories: '3,456',
      communities: '89',
      policyChanges: '7',
      livesImpacted: '67,000+'
    },
    tags: ['Refugees', 'Integration', 'Employment'],
    featured: false
  },
  {
    id: 'disability-advocacy',
    title: 'Access For All',
    organisation: 'Disability Rights Coalition',
    location: 'United States',
    category: 'Accessibility',
    profileImage: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=400&fit=crop',
    excerpt: 'Personal stories of barriers faced by disabled community members revolutionized urban planning in 20 cities.',
    impact: {
      stories: '5,678',
      communities: '20',
      policyChanges: '45',
      livesImpacted: '2.3M+'
    },
    tags: ['Disability', 'Urban Planning', 'Advocacy'],
    featured: true
  },
  {
    id: 'elder-care-revolution',
    title: 'Wisdom Keepers',
    organisation: 'Age Care Quality Commission',
    location: 'New Zealand',
    category: 'Elder Care',
    profileImage: 'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=400&fit=crop',
    excerpt: 'Elders reclaiming their narrative transformed aged care standards and created intergenerational connections.',
    impact: {
      stories: '1,234',
      communities: '45',
      policyChanges: '8',
      livesImpacted: '89,000+'
    },
    tags: ['Elder Care', 'Quality Standards', 'Community'],
    featured: false
  },
  {
    id: 'education-equity',
    title: 'Every Child\'s Story',
    organisation: 'UNESCO Education Initiative',
    location: 'Kenya & Uganda',
    category: 'Education',
    profileImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=400&fit=crop',
    excerpt: 'Student and teacher stories revealed hidden barriers to education, leading to nationwide curriculum reforms.',
    impact: {
      stories: '12,345',
      communities: '234',
      policyChanges: '15',
      livesImpacted: '3.5M+'
    },
    tags: ['Education', 'Equity', 'Curriculum Reform'],
    featured: true
  }
];

const categories = ['All', 'Healthcare', 'Mental Health', 'Social Integration', 'Accessibility', 'Elder Care', 'Education'];

export default function CaseStudiesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const filteredStudies = selectedCategory === 'All' 
    ? caseStudies 
    : caseStudies.filter(study => study.category === selectedCategory);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">SUCCESS STORIES</div>
            <h1 className="hero-title">
              Real Impact Through Shared Stories
            </h1>
            <p className="hero-description" style={{textAlign: 'center'}}>
              Discover how communities worldwide are using Empathy Ledger to transform 
              stories into meaningful change, better services, and stronger policies.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="section values-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>35,678</h3>
              <p>Stories Collected</p>
            </div>
            <div className="stat-card">
              <h3>1,265</h3>
              <p>Communities Served</p>
            </div>
            <div className="stat-card">
              <h3>90</h3>
              <p>Policy Changes</p>
            </div>
            <div className="stat-card">
              <h3>6.2M+</h3>
              <p>Lives Impacted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Transformative Case Studies</h2>
            <p>See how organisations are creating change through storytelling</p>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Case Study Cards */}
          <div className="case-studies-grid">
            {filteredStudies.map(study => (
              <Link key={study.id} href={`/case-studies/${study.id}`} className="case-study-card-link" style={{textDecoration: 'none'}}>
                <div className="case-study-card">
                  {study.featured && <div className="featured-badge">Featured</div>}
                  
                  <div className="card-header">
                    <img 
                      src={study.profileImage} 
                      alt={study.organisation}
                      className="profile-image"
                    />
                    <div className="header-info">
                      <h3>{study.title}</h3>
                      <p className="organisation">{study.organisation}</p>
                      <p className="location">{study.location}</p>
                    </div>
                  </div>

                  <p className="excerpt">{study.excerpt}</p>

                  <div className="impact-grid">
                    <div className="impact-stat">
                      <span className="impact-number">{study.impact.stories}</span>
                      <span className="impact-label">Stories</span>
                    </div>
                    <div className="impact-stat">
                      <span className="impact-number">{study.impact.communities}</span>
                      <span className="impact-label">Communities</span>
                    </div>
                    <div className="impact-stat">
                      <span className="impact-number">{study.impact.policyChanges}</span>
                      <span className="impact-label">Policy Changes</span>
                    </div>
                    <div className="impact-stat">
                      <span className="impact-number">{study.impact.livesImpacted}</span>
                      <span className="impact-label">Lives Impacted</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="tags">
                      {study.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <span className="read-more">Read Case Study →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Create Your Success Story?</h2>
            <p>Join organisations worldwide transforming communities through storytelling</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Start Your Journey
              </Link>
              <Link href="/modules" className="btn btn-secondary btn-large">
                Explore Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Remove all underlines globally */
        * {
          text-decoration: none !important;
        }

        a, a:hover, a:focus, a:active, a:visited {
          text-decoration: none !important;
        }

        .case-study-card * {
          text-decoration: none !important;
        }

        .case-study-card h3,
        .case-study-card p,
        .case-study-card span,
        .case-study-card div,
        .case-study-card a {
          text-decoration: none !important;
        }

        .case-studies-grid * {
          text-decoration: none !important;
        }

        /* Force hero text centering */
        .hero-constellation .text-center {
          text-align: center !important;
        }

        .hero-constellation .max-w-4xl {
          text-align: center !important;
        }

        .hero-title {
          text-align: center !important;
        }

        .hero-description {
          text-align: center !important;
        }

        .hero-badge {
          text-align: center !important;
        }

        .hero-constellation p {
          text-align: center !important;
        }

        .hero-constellation {
          text-align: center !important;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-xl);
          margin-bottom: var(--space-3xl);
        }

        .stat-card {
          text-align: center;
          padding: var(--space-xl);
          background: var(--color-white);
          border-radius: 12px;
          border: 1px solid var(--color-gray-light);
        }

        .stat-card h3 {
          font-size: 48px;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .stat-card p {
          color: var(--color-gray);
          margin: 0;
        }

        .category-filter {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-2xl);
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-btn {
          padding: var(--space-sm) var(--space-lg);
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 24px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          border-color: var(--color-brand-blue);
          color: var(--color-brand-blue);
        }

        .filter-btn.active {
          background: var(--color-brand-blue);
          color: var(--color-white);
          border-color: var(--color-brand-blue);
        }

        .case-studies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: var(--space-xl);
        }

        .case-study-card-link {
          text-decoration: none !important;
          display: block;
        }
        
        .case-study-card-link:hover,
        .case-study-card-link:focus,
        .case-study-card-link:active,
        .case-study-card-link:visited {
          text-decoration: none !important;
        }
        
        .case-study-card-link *,
        .case-study-card-link *:hover,
        .case-study-card-link *:focus,
        .case-study-card-link *:active,
        .case-study-card-link *:visited {
          text-decoration: none !important;
        }

        /* Extra strong underline removal for card content */
        .case-study-card * {
          text-decoration: none !important;
        }

        .case-study-card h3,
        .case-study-card p,
        .case-study-card span,
        .case-study-card div {
          text-decoration: none !important;
        }

        .case-study-card {
          background: var(--color-white);
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid var(--color-gray-light);
          transition: all 0.3s ease;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .case-study-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: var(--color-brand-blue);
        }

        .featured-badge {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          background: var(--color-brand-red);
          color: var(--color-white);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-header {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-xl);
          padding-bottom: 0;
        }

        .profile-image {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .header-info h3 {
          font-size: 24px;
          margin-bottom: var(--space-xs);
          color: var(--color-ink);
        }

        .organisation {
          font-weight: 500;
          color: var(--color-brand-blue);
          margin-bottom: 4px;
        }

        .location {
          font-size: 14px;
          color: var(--color-gray);
          margin: 0;
        }

        .excerpt {
          padding: var(--space-lg) var(--space-xl);
          color: var(--color-ink-light);
          line-height: 1.6;
          flex: 1;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--color-gray-light);
          border-bottom: 1px solid var(--color-gray-light);
        }

        .impact-stat {
          padding: var(--space-md);
          text-align: center;
          border-right: 1px solid var(--color-gray-light);
        }

        .impact-stat:last-child {
          border-right: none;
        }

        .impact-number {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--color-ink);
          margin-bottom: 4px;
        }

        .impact-label {
          display: block;
          font-size: 12px;
          color: var(--color-gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg) var(--space-xl);
        }

        .tags {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .tag {
          font-size: 12px;
          background: var(--color-gray-lighter);
          color: var(--color-gray);
          padding: 4px 10px;
          border-radius: 12px;
        }

        .read-more {
          color: var(--color-brand-blue);
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
        }

        .case-study-card:hover .read-more {
          color: var(--color-brand-red);
        }

        @media (max-width: 768px) {
          .case-studies-grid {
            grid-template-columns: 1fr;
          }

          .impact-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .impact-stat:nth-child(2) {
            border-right: none;
          }

          .impact-stat:nth-child(3) {
            border-top: 1px solid var(--color-gray-light);
          }

          .impact-stat:nth-child(4) {
            border-top: 1px solid var(--color-gray-light);
          }
        }
      `}</style>
    </div>
  );
}