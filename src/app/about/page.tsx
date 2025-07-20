import React from 'react';
import Link from 'next/link';
import MediaDisplay from '@/components/ui/MediaDisplay';
import {
  placeholderImages,
  placeholderBlurDataURLs,
} from '@/lib/supabase-media';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="hero-spacing">
        <div className="hero-container text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 content-spacing leading-[1.1]">
            Stories are power.
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Empathy Ledger is a technology platform for community knowledge
            sovereignty. We believe that stories are not raw materials to be
            processed, but living entities that belong to their tellers.
          </p>
        </div>
      </section>

      {/* Mission Section with Image */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing leading-[1.1]">
                Our Mission
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-3">
                    Empower Storytellers
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    We give storytellers complete control over their narratives.
                    Every person who shares their wisdom receives insights about
                    their impact and benefits directly when their stories create
                    value.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-3">
                    Transform Communities
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    By connecting individual stories into collective
                    intelligence, we help communities understand their
                    challenges, celebrate their strengths, and make informed
                    decisions for their future.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <MediaDisplay
                src={placeholderImages.community}
                alt="Community gathering"
                aspectRatio="video"
                rounded="3xl"
                priority
                blurDataURL={placeholderBlurDataURLs.community}
                className="hover-lift"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid - Clean and Spacious */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 subsection-spacing text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center hover-lift">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Data Sovereignty
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                You own your story. Always. We're just the trusted custodians
                who help you share it on your terms.
              </p>
            </div>
            <div className="text-center hover-lift">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Community First
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                We respect cultural protocols and community governance.
                Technology serves people, not the other way around.
              </p>
            </div>
            <div className="text-center hover-lift">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Transparency
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Every decision, every algorithm, every partnership is open for
                community scrutiny and governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - Visual Impact */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              Our Story
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Born from the recognition that communities hold profound wisdom in
              their collective experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 subsection-spacing">
            <MediaDisplay
              src={placeholderImages.workshop}
              alt="Early community workshop"
              aspectRatio="video"
              rounded="3xl"
              blurDataURL={placeholderBlurDataURLs.workshop}
              className="hover-lift"
            />
            <div className="flex items-center">
              <div>
                <h3 className="text-2xl font-normal text-gray-900 mb-4">
                  The Beginning
                </h3>
                <p className="text-gray-600 font-light leading-relaxed mb-6">
                  Empathy Ledger began in 2021 when community leaders,
                  technologists, and storytellers came together with a shared
                  vision: what if communities could harness the power of their
                  collective stories while maintaining individual privacy and
                  dignity?
                </p>
                <p className="text-gray-600 font-light leading-relaxed">
                  We spent two years listening to communities, understanding
                  their needs, and building technology that serves rather than
                  extracts.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="flex items-center order-2 md:order-1">
              <div>
                <h3 className="text-2xl font-normal text-gray-900 mb-4">
                  Today
                </h3>
                <p className="text-gray-600 font-light leading-relaxed mb-6">
                  We work with communities across Australia to create positive
                  change through storytelling. From healthcare to education,
                  from social services to policy reform, stories are driving
                  real transformation.
                </p>
                <p className="text-gray-600 font-light leading-relaxed">
                  Every story shared, every insight generated, every positive
                  outcome achieved strengthens our belief that communities have
                  the answers—they just need the right tools to reveal them.
                </p>
              </div>
            </div>
            <MediaDisplay
              src={placeholderImages.impact}
              alt="Community impact"
              aspectRatio="video"
              rounded="3xl"
              className="order-1 md:order-2 hover-lift"
              blurDataURL={placeholderBlurDataURLs.impact}
            />
          </div>
        </div>
      </section>

      {/* Team Section - Elegant Grid */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              Our Team
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              A diverse collective of technologists, community advocates, and
              storytellers united by a shared mission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="text-center hover-lift">
                <div className="mb-6">
                  <MediaDisplay
                    src={placeholderImages.portrait}
                    alt={`Team member ${i}`}
                    aspectRatio="square"
                    rounded="2xl"
                    blurDataURL={placeholderBlurDataURLs.portrait}
                    className="hover-lift"
                  />
                </div>
                <h3 className="text-lg font-normal text-gray-900 mb-1">
                  Team Member
                </h3>
                <p className="text-sm text-gray-600 font-light">Role Title</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="section-spacing">
        <div className="content-container text-center">
          <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
            Our Partners
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto subsection-spacing">
            Working with organizations that share our commitment to community
            empowerment and data sovereignty.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex items-center justify-center">
                <div className="w-full h-20 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-spacing bg-gray-900 text-white">
        <div className="content-container text-center">
          <h2 className="text-4xl md:text-5xl font-extralight content-spacing">
            Join Our Mission
          </h2>
          <p className="text-xl text-gray-300 font-light subsection-spacing max-w-2xl mx-auto">
            Whether you're a storyteller, community organization, or technology
            partner, there's a place for you in our movement.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/submit" className="no-underline">
              <button className="bg-white text-gray-900 px-10 py-4 rounded-full text-base font-light hover:bg-gray-100 smooth-transition hover:scale-[1.02] hover-lift">
                Share Your Story
              </button>
            </Link>
            <Link href="/contact" className="no-underline">
              <button className="border border-white text-white px-10 py-4 rounded-full text-base font-light hover:bg-white hover:text-gray-900 smooth-transition">
                Partner With Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
