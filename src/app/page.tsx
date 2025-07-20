import React from 'react';
import Link from 'next/link';
import {
  LiveMetric,
  LiveStoryCollection,
} from '@/components/cms/DynamicContent';
import MediaDisplay from '@/components/ui/MediaDisplay';
import {
  placeholderImages,
  placeholderBlurDataURLs,
} from '@/lib/supabase-media';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero - Perfect Breathing Space */}
      <section className="hero-spacing">
        <div className="hero-container text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight text-gray-900 mb-8 tracking-tight leading-[0.9]">
            Every story
            <br />
            has power.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto content-spacing leading-relaxed">
            Transform personal experiences into community wisdom. Complete
            privacy. Real impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center subsection-spacing">
            <Link href="/submit" className="no-underline">
              <button className="bg-gray-900 text-white px-10 py-4 rounded-full text-base font-light hover:bg-gray-800 smooth-transition hover:scale-[1.02] hover-lift">
                Share Your Story
              </button>
            </Link>
            <Link href="/how-it-works" className="no-underline">
              <button className="text-gray-700 px-10 py-4 rounded-full text-base font-light hover:bg-gray-50 smooth-transition">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* Elegant scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border border-gray-300 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Refined */}
      <section className="py-8 border-y border-gray-100">
        <div className="content-container">
          <div className="flex flex-wrap justify-center items-center gap-12 text-sm text-gray-500 font-light">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Australian owned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>
                <LiveMetric metricType="story_count" fallbackValue={15247} />{' '}
                stories protected
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Power - Elegant Layout */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 content-spacing leading-[1.1]">
                Your story
                <br />
                stays yours.
              </h2>
              <p className="text-lg text-gray-600 subsection-spacing leading-relaxed font-light">
                Share your experiences while maintaining complete control.
                Choose who sees your story, change permissions anytime, and
                benefit when your insights help others.
              </p>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-normal text-gray-900 mb-3 text-lg">
                      Complete privacy control
                    </h3>
                    <p className="text-gray-500 text-base font-light leading-relaxed">
                      Your data never leaves Australia. Full encryption.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-normal text-gray-900 mb-3 text-lg">
                      Connect with community
                    </h3>
                    <p className="text-gray-500 text-base font-light leading-relaxed">
                      Find others with shared experiences, anonymously.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-normal text-gray-900 mb-3 text-lg">
                      Fair compensation
                    </h3>
                    <p className="text-gray-500 text-base font-light leading-relaxed">
                      Receive value when your story creates insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <MediaDisplay
                src={placeholderImages.community}
                alt="Community gathering"
                aspectRatio="portrait"
                rounded="3xl"
                blurDataURL={placeholderBlurDataURLs.community}
                className="hover-lift"
              />
              <div className="absolute -bottom-8 -right-8 bg-white rounded-3xl shadow-xl p-8 max-w-sm hover-lift">
                <p className="text-base text-gray-600 italic font-light mb-4">
                  "My story helped reshape mental health services for 200+
                  people in my community."
                </p>
                <p className="text-sm font-normal text-gray-900">
                  Sarah, Brisbane
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics - Breathing Beautifully */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 content-spacing leading-[1.1]">
              When stories connect,
              <br />
              <span className="text-gray-500">communities transform.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              Privacy-preserving AI reveals patterns without exposing
              individuals. Real insights. Real change.
            </p>
          </div>

          {/* Live metrics with perfect spacing */}
          <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            <div className="text-center hover-lift">
              <div className="text-6xl font-extralight text-gray-900 mb-4">
                <LiveMetric metricType="community_count" fallbackValue={89} />
              </div>
              <div className="text-base text-gray-500 font-light">
                Communities empowered
              </div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-6xl font-extralight text-gray-900 mb-4">
                <LiveMetric metricType="policy_changes" fallbackValue={342} />
              </div>
              <div className="text-base text-gray-500 font-light">
                Policy changes driven
              </div>
            </div>
            <div className="text-center hover-lift">
              <div className="text-6xl font-extralight text-gray-900 mb-4">
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

      {/* Visual Impact - Media Integration */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <MediaDisplay
                src={placeholderImages.impact}
                alt="Community impact visualization"
                aspectRatio="video"
                rounded="3xl"
                blurDataURL={placeholderBlurDataURLs.impact}
                className="hover-lift"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 content-spacing leading-[1.1]">
                See the impact.
              </h2>
              <p className="text-lg text-gray-600 subsection-spacing leading-relaxed font-light">
                From individual stories to community transformation. Watch how
                shared experiences create lasting change in healthcare,
                education, and social services.
              </p>
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 font-light text-lg smooth-transition group no-underline"
              >
                View case studies
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 smooth-transition"
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

      {/* How It Works - Elegant Simplicity */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 subsection-spacing leading-[1.1]">
            Simple. Secure. Powerful.
          </h2>

          <div className="grid md:grid-cols-3 gap-16 subsection-spacing">
            <div className="hover-lift">
              <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto content-spacing">
                <span className="text-3xl text-white font-extralight">1</span>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">Share</h3>
              <p className="text-gray-500 font-light leading-relaxed">
                Tell your story in your own way. Written, audio, or video.
              </p>
            </div>

            <div className="hover-lift">
              <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto content-spacing">
                <span className="text-3xl text-white font-extralight">2</span>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Connect
              </h3>
              <p className="text-gray-500 font-light leading-relaxed">
                Find community. Build understanding. Drive change.
              </p>
            </div>

            <div className="hover-lift">
              <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto content-spacing">
                <span className="text-3xl text-white font-extralight">3</span>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">
                Transform
              </h3>
              <p className="text-gray-500 font-light leading-relaxed">
                See real impact in your community. Get compensated.
              </p>
            </div>
          </div>

          <div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 font-light text-lg smooth-transition group no-underline"
            >
              Learn how it works
              <svg
                className="w-5 h-5 group-hover:translate-x-1 smooth-transition"
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
      </section>

      {/* Live Stories - CMS Integration Showcase */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              Stories in action
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Real community insights updating live from our platform
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 hover-lift">
            <LiveStoryCollection
              category="healthcare"
              limit={2}
              displayStyle="quotes"
            />
          </div>

          <div className="text-center mt-12">
            <Link
              href="/cms"
              className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 font-light text-lg smooth-transition group no-underline"
            >
              View CMS Dashboard
              <svg
                className="w-5 h-5 group-hover:translate-x-1 smooth-transition"
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
      </section>

      {/* Media Gallery - Visual Storytelling */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="text-center subsection-spacing">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 content-spacing">
              Community in action
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              See the faces and places where stories become change
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MediaDisplay
              src={placeholderImages.workshop}
              alt="Community workshop"
              aspectRatio="square"
              rounded="3xl"
              caption="Story-sharing workshops"
              blurDataURL={placeholderBlurDataURLs.workshop}
              className="hover-lift"
            />
            <MediaDisplay
              src={placeholderImages.team}
              alt="Team collaboration"
              aspectRatio="square"
              rounded="3xl"
              caption="Cross-community collaboration"
              blurDataURL={placeholderBlurDataURLs.team}
              className="hover-lift"
            />
            <MediaDisplay
              src={placeholderImages.portrait}
              alt="Community leader"
              aspectRatio="square"
              rounded="3xl"
              caption="Community leadership"
              blurDataURL={placeholderBlurDataURLs.portrait}
              className="hover-lift"
            />
          </div>
        </div>
      </section>

      {/* Final CTA - Perfect Closure */}
      <section className="section-spacing">
        <div className="content-container text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 content-spacing leading-[1.1]">
            Ready to share
            <br />
            your story?
          </h2>
          <p className="text-xl text-gray-600 subsection-spacing max-w-2xl mx-auto font-light">
            Join thousands of Australians creating positive change through
            storytelling.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/submit" className="no-underline">
              <button className="bg-gray-900 text-white px-10 py-4 rounded-full text-base font-light hover:bg-gray-800 smooth-transition hover:scale-[1.02] hover-lift">
                Start Now
              </button>
            </Link>
            <Link href="/contact" className="no-underline">
              <button className="text-gray-700 px-10 py-4 rounded-full text-base font-light hover:bg-gray-50 smooth-transition">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
