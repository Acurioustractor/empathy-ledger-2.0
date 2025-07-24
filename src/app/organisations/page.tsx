'use client';

import React from 'react';
import Link from 'next/link';

// Organisation types and their use cases
const organisationTypes = [
  {
    type: 'Healthcare Systems',
    icon: '🏥',
    description: 'Transform patient experiences into better care delivery',
    examples: [
      'Patient journey mapping',
      'Service improvement insights',
      'Cultural competency enhancement',
      'Mental health understanding'
    ],
    caseStudy: 'Indigenous Health Network',
    metrics: { stories: '2,847', impact: '45,000+ lives' }
  },
  {
    type: 'Government Agencies',
    icon: '🏛️',
    description: 'Evidence-based policy making through citizen voices',
    examples: [
      'Policy impact assessment',
      'Service gap identification',
      'Community consultation',
      'Social program evaluation'
    ],
    caseStudy: 'Access For All Initiative',
    metrics: { stories: '5,678', impact: '2.3M+ lives' }
  },
  {
    type: 'Educational Institutions',
    icon: '🎓',
    description: 'Student-centred learning through authentic feedback',
    examples: [
      'Curriculum development',
      'Student wellbeing programs',
      'Equity and inclusion initiatives',
      'Learning environment improvement'
    ],
    caseStudy: 'Every Child\'s Story',
    metrics: { stories: '12,345', impact: '3.5M+ students' }
  },
  {
    type: 'Non-Profit Organisations',
    icon: '🤝',
    description: 'Amplify community voices while preserving dignity',
    examples: [
      'Program effectiveness measurement',
      'Community needs assessment',
      'Impact storytelling',
      'Donor engagement through stories'
    ],
    caseStudy: 'New Beginnings Project',
    metrics: { stories: '3,456', impact: '67,000+ people' }
  },
  {
    type: 'Mental Health Services',
    icon: '🧠',
    description: 'Safe spaces for sharing experiences and healing',
    examples: [
      'Service design improvement',
      'Peer support programs',
      'Stigma reduction initiatives',
      'Recovery pathway optimisation'
    ],
    caseStudy: 'Youth Voices Matter',
    metrics: { stories: '8,234', impact: '120,000+ young people' }
  },
  {
    type: 'Research Institutions',
    icon: '🔬',
    description: 'Ethical community-partnered research',
    examples: [
      'Community-based participatory research',
      'Longitudinal impact studies',
      'Policy recommendation development',
      'Academic publication support'
    ],
    caseStudy: 'Global Health Research Initiative',
    metrics: { stories: '4,567', impact: '15 policy changes' }
  }
];

const implementationSteps = [
  {
    step: 1,
    title: 'Discovery & Planning',
    duration: '2-4 weeks',
    description: 'We work with your team to understand your goals, community, and cultural protocols.',
    deliverables: ['Needs assessment', 'Technical requirements', 'Privacy framework']
  },
  {
    step: 2,
    title: 'Platform Configuration',
    duration: '1-2 weeks',
    description: 'Custom setup of your Empathy Ledger instance with your branding and requirements.',
    deliverables: ['Configured platform', 'Admin training', 'Security implementation']
  },
  {
    step: 3,
    title: 'Community Engagement',
    duration: '4-8 weeks',
    description: 'Support your team in engaging your community and building trust for story sharing.',
    deliverables: ['Engagement strategy', 'Training materials', 'Launch campaign']
  },
  {
    step: 4,
    title: 'Story Collection',
    duration: 'Ongoing',
    description: 'Begin collecting stories with full privacy protection and consent management.',
    deliverables: ['Active platform', 'Ongoing support', 'Monthly insights']
  },
  {
    step: 5,
    title: 'Insights & Action',
    duration: 'Ongoing',
    description: 'Transform collected stories into actionable insights and measurable improvements.',
    deliverables: ['Monthly reports', 'Policy recommendations', 'Impact measurement']
  }
];

export default function OrganisationsPage() {
  const [selectedType, setSelectedType] = React.useState(organisationTypes[0]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-constellation">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="hero-badge">FOR ORGANISATIONS</div>
            <h1 className="hero-title">
              Transform Your Community's Stories Into Lasting Change
            </h1>
            <p className="hero-description">
              Join organisations worldwide using Empathy Ledger to collect, protect, 
              and leverage community stories while maintaining complete data sovereignty 
              and ethical standards.
            </p>
            <div className="hero-actions">
              <Link href="/contact" className="btn btn-primary btn-large">
                Schedule Demo
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                See Success Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Organisation Types */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Built for Every Type of Organisation</h2>
            <p>Tailored solutions for your sector's unique needs</p>
          </div>

          <div className="org-types-container">
            <div className="org-types-list">
              {organisationTypes.map((org, index) => (
                <button
                  key={index}
                  className={`org-type-button ${selectedType === org ? 'active' : ''}`}
                  onClick={() => setSelectedType(org)}
                >
                  <span className="org-icon">{org.icon}</span>
                  <span className="org-name">{org.type}</span>
                </button>
              ))}
            </div>

            <div className="org-details">
              <div className="detail-card">
                <div className="detail-header">
                  <span className="detail-icon">{selectedType.icon}</span>
                  <h3>{selectedType.type}</h3>
                </div>
                
                <p className="detail-description">{selectedType.description}</p>
                
                <div className="detail-examples">
                  <h4>Common Use Cases:</h4>
                  <ul>
                    {selectedType.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-metrics">
                  <div className="metric">
                    <span className="metric-number">{selectedType.metrics.stories}</span>
                    <span className="metric-label">Stories Collected</span>
                  </div>
                  <div className="metric">
                    <span className="metric-number">{selectedType.metrics.impact}</span>
                    <span className="metric-label">Impact Achieved</span>
                  </div>
                </div>

                <div className="detail-cta">
                  <Link href="/case-studies" className="btn btn-primary">
                    Read {selectedType.caseStudy} Case Study →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Your Journey to Impact</h2>
            <p>Our proven process for successful implementation</p>
          </div>

          <div className="implementation-timeline">
            {implementationSteps.map((step) => (
              <div key={step.step} className="timeline-step">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <div className="step-header">
                    <h3>{step.title}</h3>
                    <span className="step-duration">{step.duration}</span>
                  </div>
                  <p>{step.description}</p>
                  <div className="deliverables">
                    <h4>Key Deliverables:</h4>
                    <ul>
                      {step.deliverables.map((deliverable, index) => (
                        <li key={index}>{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Organisations Choose Empathy Ledger</h2>
            <p>Beyond traditional feedback - ethical, actionable, transformative</p>
          </div>

          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.818-4.954A9.955 9.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2a9.955 9.955 0 015.818 2.954l-1.286 1.286A7.966 7.966 0 0011 4a8 8 0 100 16 8 8 0 004.532-1.286l1.286-1.286z" />
                </svg>
              </div>
              <h3>Complete Data Sovereignty</h3>
              <p>Your community maintains full ownership and control over their stories and data at all times.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Rapid Implementation</h3>
              <p>Get started in weeks, not months, with our proven implementation methodology and ongoing support.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Measurable Impact</h3>
              <p>Track real-world outcomes and demonstrate ROI through comprehensive analytics and reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Transparent Pricing</h2>
            <p>Choose the plan that fits your organisation's needs</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Community</h3>
                <div className="pricing-badge">Most Popular</div>
              </div>
              <div className="pricing-price">
                <span className="currency">$</span>
                <span className="amount">2,000</span>
                <span className="period">per month</span>
              </div>
              <ul className="pricing-features">
                <li>Up to 1,000 stories per month</li>
                <li>5 admin users included</li>
                <li>Standard analytics dashboard</li>
                <li>Community support</li>
                <li>99.5% uptime SLA</li>
              </ul>
              <Link href="/contact?plan=community" className="btn btn-primary pricing-cta">
                Start Free Trial
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="pricing-header">
                <h3>Professional</h3>
                <div className="pricing-badge">Best Value</div>
              </div>
              <div className="pricing-price">
                <span className="currency">$</span>
                <span className="amount">5,000</span>
                <span className="period">per month</span>
              </div>
              <ul className="pricing-features">
                <li>Up to 5,000 stories per month</li>
                <li>15 admin users included</li>
                <li>Advanced analytics & insights</li>
                <li>Priority support</li>
                <li>99.9% uptime SLA</li>
                <li>Custom integrations</li>
              </ul>
              <Link href="/contact?plan=professional" className="btn btn-primary pricing-cta">
                Start Free Trial
              </Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Enterprise</h3>
                <div className="pricing-badge">Custom</div>
              </div>
              <div className="pricing-price">
                <span className="amount">Custom</span>
                <span className="period">pricing</span>
              </div>
              <ul className="pricing-features">
                <li>Unlimited stories</li>
                <li>Unlimited admin users</li>
                <li>White-label solution</li>
                <li>Dedicated success manager</li>
                <li>99.99% uptime SLA</li>
                <li>On-premises deployment option</li>
              </ul>
              <Link href="/contact?plan=enterprise" className="btn btn-secondary pricing-cta">
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="pricing-note">
            <p>All plans include end-to-end encryption, GDPR compliance, and data sovereignty protection. 30-day free trial available.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Organisation?</h2>
            <p>Join forward-thinking organisations using ethical technology to amplify community voices</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="btn btn-primary btn-large">
                Schedule Demo
              </Link>
              <Link href="/case-studies" className="btn btn-secondary btn-large">
                Explore Case Studies
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .org-types-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-3xl);
          margin-top: var(--space-2xl);
        }

        .org-types-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .org-type-button {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .org-type-button:hover {
          border-color: var(--color-brand-blue);
          transform: translateX(4px);
        }

        .org-type-button.active {
          border-color: var(--color-brand-blue);
          background: rgba(37, 99, 235, 0.05);
          transform: translateX(4px);
        }

        .org-icon {
          font-size: 32px;
        }

        .org-name {
          font-weight: 500;
          color: var(--color-ink);
        }

        .org-details {
          position: relative;
        }

        .detail-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-2xl);
          min-height: 500px;
          position: sticky;
          top: var(--space-xl);
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .detail-icon {
          font-size: 48px;
        }

        .detail-header h3 {
          font-size: 28px;
          margin: 0;
        }

        .detail-description {
          font-size: 18px;
          line-height: 1.6;
          color: var(--color-gray);
          margin-bottom: var(--space-xl);
        }

        .detail-examples {
          margin-bottom: var(--space-xl);
        }

        .detail-examples h4 {
          font-size: 18px;
          margin-bottom: var(--space-md);
        }

        .detail-examples ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .detail-examples li {
          padding: var(--space-sm) 0;
          padding-left: var(--space-lg);
          position: relative;
          color: var(--color-ink-light);
        }

        .detail-examples li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .detail-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
          padding: var(--space-lg);
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .metric {
          text-align: center;
        }

        .metric-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: var(--color-brand-blue);
          margin-bottom: var(--space-xs);
        }

        .metric-label {
          display: block;
          font-size: 14px;
          color: var(--color-gray);
        }

        .detail-cta {
          text-align: center;
        }

        .implementation-timeline {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .implementation-timeline::before {
          content: '';
          position: absolute;
          left: 30px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--color-gray-light);
        }

        .timeline-step {
          position: relative;
          padding-left: 80px;
          margin-bottom: var(--space-3xl);
        }

        .step-number {
          position: absolute;
          left: 12px;
          top: 0;
          width: 36px;
          height: 36px;
          background: var(--color-brand-blue);
          color: var(--color-white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .step-content {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-xl);
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .step-header h3 {
          font-size: 24px;
          margin: 0;
        }

        .step-duration {
          font-size: 14px;
          color: var(--color-gray);
          background: var(--color-gray-lighter);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .step-content p {
          color: var(--color-ink-light);
          margin-bottom: var(--space-lg);
        }

        .deliverables h4 {
          font-size: 16px;
          margin-bottom: var(--space-sm);
        }

        .deliverables ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-sm);
        }

        .deliverables li {
          padding: var(--space-xs) var(--space-sm);
          background: var(--color-gray-lighter);
          border-radius: 8px;
          font-size: 14px;
          color: var(--color-ink-light);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-xl);
          margin-bottom: var(--space-2xl);
        }

        .pricing-card {
          background: var(--color-white);
          border: 2px solid var(--color-gray-light);
          border-radius: 16px;
          padding: var(--space-2xl);
          position: relative;
          transition: all 0.3s ease;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .pricing-card.featured {
          border-color: var(--color-brand-blue);
          transform: scale(1.05);
        }

        .pricing-header {
          text-align: center;
          margin-bottom: var(--space-xl);
          position: relative;
        }

        .pricing-header h3 {
          font-size: 24px;
          margin-bottom: var(--space-sm);
        }

        .pricing-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: var(--color-brand-red);
          color: var(--color-white);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .pricing-price {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .currency {
          font-size: 24px;
          color: var(--color-gray);
          vertical-align: top;
        }

        .amount {
          font-size: 48px;
          font-weight: 700;
          color: var(--color-ink);
        }

        .period {
          font-size: 16px;
          color: var(--color-gray);
          margin-left: var(--space-xs);
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--space-xl) 0;
        }

        .pricing-features li {
          padding: var(--space-sm) 0;
          padding-left: var(--space-lg);
          position: relative;
          color: var(--color-ink-light);
        }

        .pricing-features li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-brand-green);
          font-weight: 600;
        }

        .pricing-cta {
          width: 100%;
          text-align: center;
        }

        .pricing-note {
          text-align: center;
          margin-top: var(--space-2xl);
          padding: var(--space-lg);
          background: var(--color-gray-lighter);
          border-radius: 12px;
        }

        .pricing-note p {
          color: var(--color-gray);
          margin: 0;
          font-size: 14px;
        }

        @media (max-width: 1024px) {
          .org-types-container {
            grid-template-columns: 1fr;
            gap: var(--space-xl);
          }

          .org-types-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: var(--space-md);
          }

          .detail-card {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .timeline-step {
            padding-left: 60px;
          }

          .step-number {
            left: 4px;
            width: 32px;
            height: 32px;
          }

          .implementation-timeline::before {
            left: 20px;
          }

          .step-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-sm);
          }

          .deliverables ul {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}