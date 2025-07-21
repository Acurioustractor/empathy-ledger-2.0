import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SecurityBadge from '@/components/trust/SecurityBadge';
import { TrustMetrics } from '@/components/trust/TrustBar';

export default function TrustSecurityPage() {
  const securityPrinciples = [
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: 'Privacy by Design',
      description:
        'Every feature is built with privacy as the foundation, not an afterthought. Your data protection is embedded in our DNA.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: 'Your Data, Your Control',
      description:
        'You own your story. Change permissions, download your data, or delete everything at any time. No questions asked.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Australian Data Sovereignty',
      description:
        'Your stories stay in Australia, on Australian servers, under Australian privacy laws. We respect data sovereignty principles.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-primary-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      ),
      title: 'Transparent Practices',
      description:
        'We openly share how we handle your data. Our privacy policy is written in plain language, not legal jargon.',
    },
  ];

  const technicalSafeguards = [
    {
      feature: 'End-to-end encryption',
      description: 'Stories encrypted in transit and at rest',
    },
    {
      feature: '256-bit AES encryption',
      description: 'Bank-level security standards',
    },
    {
      feature: 'ISO 27001 compliant',
      description: 'International security certification',
    },
    {
      feature: 'Regular security audits',
      description: 'Third-party penetration testing',
    },
    {
      feature: 'GDPR & Privacy Act compliant',
      description: 'Meeting global privacy standards',
    },
    {
      feature: 'Zero-knowledge architecture',
      description: "We can't read your private stories",
    },
  ];

  const dataRights = [
    {
      right: 'Access',
      description: 'Request a copy of all your data anytime',
      icon: '📥',
    },
    {
      right: 'Portability',
      description: 'Export your stories in standard formats',
      icon: '📤',
    },
    {
      right: 'Correction',
      description: 'Update or edit your information',
      icon: '✏️',
    },
    {
      right: 'Deletion',
      description: 'Permanently remove all your data',
      icon: '🗑️',
    },
    {
      right: 'Restriction',
      description: 'Limit how your data is processed',
      icon: '🚫',
    },
    {
      right: 'Objection',
      description: 'Opt out of specific data uses',
      icon: '✋',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trust & Security
            </h1>

            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Your stories are precious. We protect them with the same care and
              respect we'd want for our own. Every security decision is made
              with your privacy and dignity at the forefront.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <SecurityBadge variant="encryption" />
              <SecurityBadge variant="privacy" text="Privacy Act compliant" />
              <SecurityBadge variant="certified" text="ISO 27001" />
              <SecurityBadge variant="secure" text="SOC 2 Type II" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Security Principles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four foundational commitments that guide every decision we make
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {securityPrinciples.map((principle, index) => (
              <Card key={index} variant="trust" className="p-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">{principle.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Safeguards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Technical Safeguards
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Industry-leading security measures protect your stories at every
                level
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {technicalSafeguards.map((safeguard, index) => (
                <div
                  key={index}
                  className="flex items-start bg-white p-6 rounded-lg shadow-sm"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {safeguard.feature}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {safeguard.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Independent Security Verification
              </h3>
              <p className="text-blue-800 mb-6 max-w-2xl mx-auto">
                Our security practices are regularly audited by independent
                third parties. We publish our security reports annually for
                complete transparency.
              </p>
              <Button variant="secondary" href="/security-reports">
                View Security Reports
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Data Rights */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Data Rights
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                You have complete control over your information. These rights
                are guaranteed and can be exercised at any time.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {dataRights.map((item, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Right to {item.right}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Exercise your rights through your account settings or contact
                our privacy team
              </p>
              <Button variant="primary" href="/contact/privacy">
                Contact Privacy Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trust in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our commitment to security and privacy, measured and verified
            </p>
          </div>

          <TrustMetrics />
        </div>
      </section>

      {/* Privacy Commitment */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card variant="trust" className="p-10">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Our Privacy Commitment to You
                </h2>

                <div className="prose prose-lg text-gray-700 mx-auto text-left">
                  <p className="mb-4">We promise to:</p>
                  <ul className="space-y-2 mb-6">
                    <li>Never sell your personal information or stories</li>
                    <li>Always ask for explicit consent before sharing</li>
                    <li>Provide clear, understandable privacy controls</li>
                    <li>Respond to privacy requests within 48 hours</li>
                    <li>Notify you immediately of any security incidents</li>
                    <li>Continuously improve our security practices</li>
                  </ul>
                  <p className="mb-6">
                    This commitment is more than policy—it's our promise to
                    every person who trusts us with their story.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="primary" href="/privacy">
                    Read Full Privacy Policy
                  </Button>
                  <Button variant="secondary" href="/data-practices">
                    Data Practices Guide
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Questions About Security?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our security team is here to help. Whether you have questions
              about our practices or need assistance with privacy settings,
              we're just a message away.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="bg-white rounded-lg p-6 text-center">
                <svg
                  className="w-12 h-12 text-primary-600 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <a
                  href="mailto:security@empathyledger.org"
                  className="text-primary-600 hover:text-primary-700"
                >
                  security@empathyledger.org
                </a>
              </div>

              <div className="bg-white rounded-lg p-6 text-center">
                <svg
                  className="w-12 h-12 text-primary-600 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Response Time
                </h3>
                <p className="text-gray-600">Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
