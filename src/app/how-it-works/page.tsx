import React from 'react';
import Link from 'next/link';
import { LiveMetric } from '@/components/cms/DynamicContent';
import MediaDisplay from '@/components/ui/MediaDisplay';
import {
  placeholderImages,
  placeholderBlurDataURLs,
} from '@/lib/supabase-media';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="hero-spacing">
        <div className="hero-container text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 content-spacing leading-[1.1]">
            Simple.
            <br />
            Secure.
            <br />
            <span className="text-gray-500">Empowering.</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Transform your story into community wisdom with complete privacy and
            control. Three simple steps to lasting impact.
          </p>
        </div>
      </section>

      {/* Three Steps - Visual and Elegant */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              How it works
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              A privacy-first approach to community storytelling
            </p>
          </div>

          {/* Step 1 - Share */}
          <div className="grid lg:grid-cols-2 gap-24 items-center subsection-spacing">
            <div>
              <div className="flex items-center content-spacing">
                <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mr-6">
                  <span className="text-2xl text-white font-extralight">1</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extralight text-gray-900">
                  Share
                </h3>
              </div>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
                Tell your story in your own way—written, audio, or video. Choose
                exactly who can access it and what insights you'd like to
                receive. Every word is encrypted before it leaves your device.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Complete control
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Set permissions, change access anytime
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      End-to-end encrypted
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Military-grade protection from device to destination
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Australian sovereignty
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Your data never leaves Australia
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <MediaDisplay
                src={placeholderImages.workshop}
                alt="Story sharing interface"
                aspectRatio="square"
                rounded="3xl"
                className="hover-lift"
                blurDataURL={placeholderBlurDataURLs.workshop}
              />
            </div>
          </div>

          {/* Step 2 - Connect */}
          <div className="grid lg:grid-cols-2 gap-24 items-center subsection-spacing">
            <div className="order-2 lg:order-1">
              <MediaDisplay
                src={placeholderImages.impact}
                alt="Privacy-preserving analysis"
                aspectRatio="square"
                rounded="3xl"
                className="hover-lift"
                blurDataURL={placeholderBlurDataURLs.impact}
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center content-spacing">
                <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mr-6">
                  <span className="text-2xl text-white font-extralight">2</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extralight text-gray-900">
                  Connect
                </h3>
              </div>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
                Our privacy-preserving AI finds patterns across community
                stories without reading individual content. You receive
                personalized insights about shared experiences and community
                trends.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Anonymous analysis
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Patterns revealed without exposing individuals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Community insights
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Understand broader trends affecting your community
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Find your people
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Connect anonymously with others sharing similar
                      experiences
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Transform */}
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="flex items-center content-spacing">
                <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mr-6">
                  <span className="text-2xl text-white font-extralight">3</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-extralight text-gray-900">
                  Transform
                </h3>
              </div>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
                When your story contributes to insights that help organizations
                or researchers, you receive direct compensation. Transparent
                smart contracts ensure fair value distribution back to the
                community.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Fair compensation
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Receive value when your insights create impact
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Policy influence
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Drive real change in services and systems
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">
                      Community ownership
                    </h4>
                    <p className="text-gray-500 font-light text-sm">
                      Collective governance over platform decisions
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <MediaDisplay
                src={placeholderImages.team}
                alt="Community transformation"
                aspectRatio="square"
                rounded="3xl"
                className="hover-lift"
                blurDataURL={placeholderBlurDataURLs.team}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact - CMS Integration */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              Real impact,
              <br />
              <span className="text-gray-500">real time.</span>
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              See how storytelling is creating change across Australia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center hover-lift">
              <div className="text-5xl font-extralight text-gray-900 mb-4">
                <LiveMetric metricType="story_count" fallbackValue={15247} />
              </div>
              <div className="text-base text-gray-500 font-light">
                Stories shared securely
              </div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-5xl font-extralight text-gray-900 mb-4">
                <LiveMetric metricType="policy_changes" fallbackValue={342} />
              </div>
              <div className="text-base text-gray-500 font-light">
                Policy changes influenced
              </div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-5xl font-extralight text-gray-900 mb-4">
                <LiveMetric
                  metricType="value_created"
                  fallbackValue={2300000}
                  format="currency"
                />
              </div>
              <div className="text-base text-gray-500 font-light">
                Returned to storytellers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Different Audiences - Clean Grid */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              For everyone
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Different ways to participate in the movement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center hover-lift">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto content-spacing">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Storytellers
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                Share your experiences and receive insights about how your story
                connects to broader community patterns.
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 font-light smooth-transition no-underline"
              >
                Tell your story
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="text-center hover-lift">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto content-spacing">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Communities
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                Collect stories from your community and receive aggregated
                insights to inform programs and advocacy.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 font-light smooth-transition no-underline"
              >
                Partner with us
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div className="text-center hover-lift">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto content-spacing">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Researchers
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                Access ethically-sourced community insights while ensuring fair
                compensation flows back to storytellers.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-600 font-light smooth-transition no-underline"
              >
                Learn more
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Deep Dive - Elegant Simplicity */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              Built for trust
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Advanced technology that prioritizes your privacy and community
              ownership
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="bg-white rounded-3xl p-8 hover-lift">
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Privacy-Preserving AI
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                Advanced cryptographic techniques analyze patterns without
                accessing individual stories. Your data remains private while
                contributing to community insights.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Homomorphic encryption
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Zero-knowledge proofs
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Differential privacy
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 hover-lift">
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Smart Contracts
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                Transparent, automated agreements ensure fair compensation and
                community governance. Every transaction is auditable and follows
                community-agreed rules.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Automatic value distribution
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Transparent governance
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Community ownership
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 hover-lift">
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Australian Sovereignty
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                All data stored within Australian borders, complying with local
                privacy laws and Indigenous data sovereignty principles.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Local infrastructure
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Privacy Act compliant
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Indigenous protocols respected
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 hover-lift">
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Open Source Transparency
              </h3>
              <p className="text-gray-600 font-light mb-6 leading-relaxed">
                Community-auditable code with regular security reviews and
                transparency reports ensure accountability to storytellers.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Publicly auditable
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Regular security reviews
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 font-light">
                    Community oversight
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Perfect Closure */}
      <section className="section-spacing">
        <div className="content-container text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 content-spacing leading-[1.1]">
            Ready to begin?
          </h2>
          <p className="text-xl text-gray-600 subsection-spacing max-w-2xl mx-auto font-light">
            Join thousands creating positive change through secure, empowering
            storytelling.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/submit" className="no-underline">
              <button className="bg-gray-900 text-white px-10 py-4 rounded-full text-base font-light hover:bg-gray-800 smooth-transition hover:scale-[1.02] hover-lift">
                Share Your Story
              </button>
            </Link>
            <Link href="/about" className="no-underline">
              <button className="text-gray-700 px-10 py-4 rounded-full text-base font-light hover:bg-gray-50 smooth-transition">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
