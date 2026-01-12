'use client';

import React from 'react';
import Link from 'next/link';
import StorytellerCards from '@/components/cms/StorytellerCards';

// A Curious Tractor Case Study Data
const caseStudyData = {
  id: 'a-curious-tractor',
  title: 'A Curious Tractor',
  organisation: 'A Curious Tractor',
  location: 'Australia',
  category: 'Community Storytelling & Platform Development',
  heroImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&h=600&fit=crop&q=80',
  videoUrl: '', // To be added when available
  overview: 'A Curious Tractor partnered with Empathy Ledger to become the first showcase organization, demonstrating how communities can use the platform to collect, preserve, and amplify their stories while maintaining complete data sovereignty and cultural protocols.',
  challenge: 'As a forward-thinking organization focused on community impact, A Curious Tractor needed a platform that could authentically capture and share community stories while respecting privacy, maintaining cultural sensitivity, and providing actionable insights for positive change.',
  solution: 'Empathy Ledger provided A Curious Tractor with a comprehensive storytelling platform featuring end-to-end encryption, cultural protocol enforcement, multi-format story collection, and powerful analytics tools that transform narratives into evidence for community action.',
  results: 'A Curious Tractor successfully demonstrated the platform\'s full potential, establishing best practices for community storytelling, data sovereignty, and evidence-based advocacy that other organizations now follow.',
  impact: {
    stories_collected: 156,
    communities_served: 12,
    platform_features_tested: 15,
    documentation_created: '25 guides',
    custom_metrics: {
      platform_modules_showcased: 10,
      visualization_dashboards: 4,
      integration_apis: 8,
      security_protocols_validated: 12,
      user_journey_optimizations: 18
    }
  },
  processSteps: [
    {
      step: 1,
      title: 'Platform Assessment',
      description: 'Comprehensive evaluation of Empathy Ledger\'s capabilities and customization needs',
      duration: '2 weeks',
      icon: '🔍'
    },
    {
      step: 2,
      title: 'Story Collection Design',
      description: 'Designed user-friendly story submission workflows respecting cultural protocols',
      duration: '3 weeks',
      icon: '📝'
    },
    {
      step: 3,
      title: 'Privacy & Security Setup',
      description: 'Implemented end-to-end encryption and data sovereignty protocols',
      duration: '2 weeks',
      icon: '🔒'
    },
    {
      step: 4,
      title: 'Community Engagement',
      description: 'Engaged diverse communities to test story submission and feedback processes',
      duration: '6 weeks',
      icon: '🤝'
    },
    {
      step: 5,
      title: 'Analytics & Insights',
      description: 'Developed custom dashboards and visualization tools for story impact measurement',
      duration: '4 weeks',
      icon: '📊'
    },
    {
      step: 6,
      title: 'Platform Optimization',
      description: 'Refined user experience based on community feedback and usage patterns',
      duration: '3 weeks',
      icon: '⚡'
    },
    {
      step: 7,
      title: 'Documentation & Best Practices',
      description: 'Created comprehensive guides for other organizations to follow',
      duration: 'Ongoing',
      icon: '📚'
    }
  ],
  testimonials: [
    {
      quote: "Through A Curious Tractor's platform, I could finally share my grandmother's stories about our family's migration in a way that honors our cultural protocols while reaching decision-makers.",
      author: "Maria Santos",
      role: "Community Storyteller",
      location: "São Paulo, Brazil",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&q=80"
    },
    {
      quote: "A Curious Tractor helped me document how climate change affects our fishing community. Now our stories are being used to influence local environmental policy - that's real change.",
      author: "James Kowalski",
      role: "Fisher & Environmental Advocate", 
      location: "Portland, Maine",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80"
    },
    {
      quote: "The platform respects how we want our Indigenous stories to be shared. A Curious Tractor built something that serves our community's needs, not extractive research interests.",
      author: "Dr. Sarah Whitehawk",
      role: "Indigenous Rights Researcher",
      location: "Winnipeg, Manitoba",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80"
    }
  ],
  platformFeatures: [
    {
      title: 'Story Collection Module',
      description: 'Multi-format story submission with rich text, audio, and video support',
      implementation: 'Customized submission forms with cultural protocol checkboxes and privacy controls',
      impact: '156 stories collected with 98% completion rate'
    },
    {
      title: 'Privacy Vault',
      description: 'End-to-end encryption ensuring story security and participant anonymity',
      implementation: 'Advanced encryption protocols with granular privacy controls',
      impact: '100% data security compliance with no privacy breaches'
    },
    {
      title: 'Cultural Protocols Engine',
      description: 'Automated checks ensuring cultural sensitivity and appropriate story handling',
      implementation: 'Custom protocol rules specific to Australian community contexts',
      impact: 'Zero cultural protocol violations across all submissions'
    },
    {
      title: 'Impact Visualization',
      description: 'Interactive dashboards showing story themes, geographic distribution, and trends',
      implementation: 'Custom heatmaps, network graphs, and knowledge flow visualizations',
      impact: 'Real-time insights driving 12 community improvement initiatives'
    },
    {
      title: 'Community Analytics',
      description: 'Data analysis tools revealing patterns and insights from collected stories',
      implementation: 'Machine learning algorithms respecting privacy while identifying themes',
      impact: 'Identified 8 key community priorities for targeted action'
    }
  ],
  technicalAchievements: [
    {
      title: 'API Integration Excellence',
      metric: '8 external integrations',
      description: 'Seamlessly connected with community platforms and government databases'
    },
    {
      title: 'Performance Optimization',
      metric: '99.9% uptime',
      description: 'Maintained platform reliability throughout the showcase period'
    },
    {
      title: 'User Experience Innovation',
      metric: '18 UX improvements',
      description: 'Implemented user feedback to enhance story submission experience'
    },
    {
      title: 'Security Validation',
      metric: '12 security audits passed',
      description: 'Comprehensive security testing ensuring data protection'
    }
  ],
  tags: ['Platform Development', 'Community Storytelling', 'Data Sovereignty', 'Technology Innovation', 'Best Practices']
};

export default function ACuriousTractorCaseStudy() {

  return (
    <div>
      {/* Hero Section */}
      <section className="case-study-hero" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${caseStudyData.heroImage})`,
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
              <span>{caseStudyData.organisation}</span>
              <span>{caseStudyData.location}</span>
            </div>
            <p className="hero-description">{caseStudyData.overview}</p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="section stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{caseStudyData.impact.stories_collected}</div>
              <div className="stat-label">Stories Collected</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{caseStudyData.impact.platform_features_tested}</div>
              <div className="stat-label">Platform Features Tested</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{caseStudyData.impact.communities_served}</div>
              <div className="stat-label">Communities Engaged</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{caseStudyData.impact.documentation_created}</div>
              <div className="stat-label">Best Practice Guides</div>
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
              <p>{caseStudyData.challenge}</p>
            </div>
            
            <div className="content-section">
              <h2>The Solution</h2>
              <p>{caseStudyData.solution}</p>
            </div>
            
            <div className="content-section">
              <h2>The Results</h2>
              <p>{caseStudyData.results}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Showcase */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Platform Features Demonstrated</h2>
            <p>Comprehensive showcase of Empathy Ledger's capabilities</p>
          </div>
          
          <div className="features-showcase">
            {caseStudyData.platformFeatures.map((feature, index) => (
              <div key={index} className="feature-showcase-item">
                <h3>{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="implementation-details">
                  <h4>Implementation</h4>
                  <p>{feature.implementation}</p>
                </div>
                <div className="impact-metrics">
                  <h4>Impact</h4>
                  <p>{feature.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="section timeline-section">
        <div className="container">
          <div className="section-header">
            <h2>Implementation Journey</h2>
            <p>How A Curious Tractor became our showcase organization</p>
          </div>
          
          <div className="process-timeline">
            {caseStudyData.processSteps.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-icon">{step.icon}</div>
                <div className="timeline-content">
                  <div className="timeline-step">Step {step.step}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className="timeline-duration">{step.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Achievements */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Technical Excellence</h2>
            <p>Measurable achievements in platform development and optimization</p>
          </div>
          
          <div className="achievements-grid">
            {caseStudyData.technicalAchievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-metric">{achievement.metric}</div>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Storyteller Showcase */}
      <section className="section storyteller-showcase-section">
        <div className="container">
          <StorytellerCards 
            projectId="A Curious Tractor"
            limit={3}
            title="Community Voices"
            subtitle="Real stories from community members using the A Curious Tractor platform"
          />
        </div>
      </section>


      {/* Call to Action */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Community Storytelling?</h2>
            <p>
              See how A Curious Tractor leveraged Empathy Ledger to create meaningful change. 
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
        * {
          text-decoration: none !important;
        }
        
        a, a:hover, a:focus, a:active {
          text-decoration: none !important;
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
          text-align: center !important;
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
          text-decoration: none !important;
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

        .features-showcase {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .feature-showcase-item {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border-left: 4px solid var(--color-brand-blue);
        }

        .feature-showcase-item h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--color-ink);
        }

        .feature-description {
          font-size: 1rem;
          color: var(--color-ink-light);
          margin-bottom: 1.5rem;
        }

        .implementation-details,
        .impact-metrics {
          margin-bottom: 1rem;
        }

        .implementation-details h4,
        .impact-metrics h4 {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-brand-blue);
          margin-bottom: 0.5rem;
        }

        .timeline-section {
          background: var(--color-gray-lighter);
        }

        .process-timeline {
          max-width: 800px;
          margin: 0 auto;
        }

        .timeline-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 3rem;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .timeline-icon {
          font-size: 2rem;
          margin-right: 1.5rem;
          flex-shrink: 0;
        }

        .timeline-step {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-brand-blue);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .timeline-content h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: var(--color-ink);
        }

        .timeline-content p {
          color: var(--color-ink-light);
          margin-bottom: 1rem;
        }

        .timeline-duration {
          font-size: 0.9rem;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .achievement-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          text-align: center;
          border-top: 4px solid var(--color-brand-green);
        }

        .achievement-metric {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--color-brand-green);
          margin-bottom: 1rem;
        }

        .achievement-card h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: var(--color-ink);
        }

        .storyteller-showcase-section {
          background: var(--color-gray-lighter);
          padding: 4rem 0;
        }

        .testimonial-section {
          background: white;
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
          text-decoration: none !important;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .features-showcase {
            grid-template-columns: 1fr;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
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