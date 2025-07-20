import React from 'react';
import Link from 'next/link';
import CaseStudyShowcase from '@/components/case-studies/CaseStudyShowcase';
import MediaDisplay from '@/components/ui/MediaDisplay';
import { placeholderImages, placeholderBlurDataURLs } from '@/lib/supabase-media';

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="min-h-[70vh] flex items-center justify-center px-8 md:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-8 leading-[1.1]">
            Real stories.
            <br />
            Real impact.
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Discover how communities across Australia are using storytelling to drive 
            meaningful change while protecting individual privacy.
          </p>
        </div>
      </section>

      {/* Impact Overview - Subtle Metrics */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Transforming Communities
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              From healthcare to education, privacy-preserving storytelling creates 
              measurable change across Australia.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-16 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-extralight text-gray-900 mb-3">1,847</div>
              <div className="text-base text-gray-500 font-light">Stories shared</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extralight text-gray-900 mb-3">67</div>
              <div className="text-base text-gray-500 font-light">Policy changes</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extralight text-gray-900 mb-3">100%</div>
              <div className="text-base text-gray-500 font-light">Privacy protected</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extralight text-gray-900 mb-3">$2.3M</div>
              <div className="text-base text-gray-500 font-light">Value created</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Studies - Visual Impact */}
      <section className="py-32 md:py-40">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Featured Stories
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              In-depth looks at transformative projects powered by community insights.
            </p>
          </div>

          <div className="space-y-32">
            {/* Healthcare Case Study */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <MediaDisplay
                  src={placeholderImages.impact}
                  alt="Healthcare transformation"
                  aspectRatio="video"
                  rounded="3xl"
                  priority
                  blurDataURL={placeholderBlurDataURLs.impact}
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-4 uppercase tracking-wide">Healthcare</div>
                <h3 className="text-3xl font-normal text-gray-900 mb-6">Brisbane Mental Health Initiative</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-8">
                  347 anonymous stories from mental health service users revealed critical gaps 
                  in after-hours support. The insights led to a complete redesign of crisis 
                  services, reducing emergency presentations by 42% and improving satisfaction 
                  scores by 89%.
                </p>
                <Link href="/case-studies/brisbane-mental-health" className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 font-light text-lg transition-colors group no-underline">
                  Read full case study
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Education Case Study */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="text-sm text-gray-500 font-light mb-4 uppercase tracking-wide">Education</div>
                <h3 className="text-3xl font-normal text-gray-900 mb-6">Indigenous Education Pathways</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-8">
                  Stories from 89 Indigenous students and families transformed how three 
                  universities approach cultural safety and support. The project led to a 
                  67% increase in completion rates and established new standards for 
                  culturally responsive education.
                </p>
                <Link href="/case-studies/indigenous-education" className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 font-light text-lg transition-colors group no-underline">
                  Read full case study
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="order-1 lg:order-2">
                <MediaDisplay
                  src={placeholderImages.workshop}
                  alt="Education transformation"
                  aspectRatio="video"
                  rounded="3xl"
                  blurDataURL={placeholderBlurDataURLs.workshop}
                />
              </div>
            </div>

            {/* Community Development Case Study */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <MediaDisplay
                  src={placeholderImages.community}
                  alt="Community transformation"
                  aspectRatio="video"
                  rounded="3xl"
                  blurDataURL={placeholderBlurDataURLs.community}
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-4 uppercase tracking-wide">Community Development</div>
                <h3 className="text-3xl font-normal text-gray-900 mb-6">Western Sydney Housing Project</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-8">
                  1,200 stories from residents living in social housing revealed systemic 
                  maintenance issues and safety concerns. The aggregated insights prompted 
                  immediate policy changes and a $12M investment in community-led 
                  improvements.
                </p>
                <Link href="/case-studies/western-sydney-housing" className="inline-flex items-center gap-3 text-gray-900 hover:text-gray-600 font-light text-lg transition-colors group no-underline">
                  Read full case study
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Case Studies - Clean Grid */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              All Case Studies
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Explore projects across healthcare, education, community development, 
              policy reform, and research.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { category: 'Healthcare', count: '12', color: 'bg-gray-100' },
              { category: 'Education', count: '8', color: 'bg-gray-100' },
              { category: 'Housing', count: '6', color: 'bg-gray-100' },
              { category: 'Youth Services', count: '9', color: 'bg-gray-100' },
              { category: 'Elder Care', count: '5', color: 'bg-gray-100' },
              { category: 'Policy Reform', count: '14', color: 'bg-gray-100' }
            ].map((item, index) => (
              <Link key={index} href={`/case-studies?category=${item.category.toLowerCase().replace(' ', '-')}`} className="no-underline group">
                <div className="bg-white rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-6"></div>
                  <h3 className="text-xl font-normal text-gray-900 mb-2">{item.category}</h3>
                  <p className="text-gray-500 font-light">{item.count} case studies</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology - Clean and Simple */}
      <section className="py-32 md:py-40">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Our Impact Methodology
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              How we measure real-world outcomes while protecting privacy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">Baseline</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Clear metrics established before implementation using community-defined 
                success indicators.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">Track</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Continuous monitoring through privacy-preserving analytics and 
                community feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">Validate</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Independent audits ensure genuine, sustainable impact through 
                long-term studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Ethics - Clean Layout */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Privacy & Ethics
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Every case study follows strict ethical guidelines and privacy protections
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div>
              <h3 className="text-2xl font-normal text-gray-900 mb-8">Privacy Protected</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Individual stories remain encrypted and anonymous
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Participants control their data throughout
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Only aggregated insights shared publicly
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Communities approve all publications
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-normal text-gray-900 mb-8">Ethical Standards</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Community benefit requirements for all projects
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Fair compensation for story contributors
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Cultural protocols for Indigenous communities
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Independent ethics review for research
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Impact Gallery */}
      <section className="py-32 md:py-40">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Stories in Action
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Documenting the journey from individual stories to community transformation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MediaDisplay
              src={placeholderImages.community}
              alt="Community workshop"
              aspectRatio="square"
              rounded="3xl"
              caption="Story-sharing workshop"
              blurDataURL={placeholderBlurDataURLs.community}
            />
            <MediaDisplay
              src={placeholderImages.impact}
              alt="Policy presentation"
              aspectRatio="square"
              rounded="3xl"
              caption="Insights presented to council"
              blurDataURL={placeholderBlurDataURLs.impact}
            />
            <MediaDisplay
              src={placeholderImages.workshop}
              alt="Youth engagement"
              aspectRatio="square"
              rounded="3xl"
              caption="Youth storytelling session"
              blurDataURL={placeholderBlurDataURLs.workshop}
            />
            <MediaDisplay
              src={placeholderImages.team}
              alt="Community celebration"
              aspectRatio="square"
              rounded="3xl"
              caption="Celebrating outcomes"
              blurDataURL={placeholderBlurDataURLs.team}
            />
            <MediaDisplay
              src={placeholderImages.story}
              alt="Data visualization"
              aspectRatio="square"
              rounded="3xl"
              caption="Community insights dashboard"
              blurDataURL={placeholderBlurDataURLs.story}
            />
            <MediaDisplay
              src={placeholderImages.portrait}
              alt="Storyteller"
              aspectRatio="square"
              rounded="3xl"
              caption="Protected storyteller identity"
              blurDataURL={placeholderBlurDataURLs.portrait}
            />
          </div>
        </div>
      </section>

      {/* Video Case Studies */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Watch the Impact
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Video documentaries showing how communities create lasting change
            </p>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-light">Video showcase coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 md:py-40">
        <div className="max-w-4xl mx-auto px-8 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 mb-10 leading-[1.1]">
            Ready to create your
            <br />
            own success story?
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto font-light">
            Join organizations using storytelling to drive meaningful change.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="no-underline">
              <button className="bg-gray-900 text-white px-10 py-4 rounded-full text-base font-light hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02]">
                Start Your Project
              </button>
            </Link>
            <Link href="/modules" className="no-underline">
              <button className="text-gray-700 px-10 py-4 rounded-full text-base font-light hover:bg-gray-50 transition-all duration-200">
                Explore Modules
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}