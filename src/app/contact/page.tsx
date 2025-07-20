import React from 'react';
import Link from 'next/link';
import MediaDisplay from '@/components/ui/MediaDisplay';
import {
  placeholderImages,
  placeholderBlurDataURLs,
} from '@/lib/supabase-media';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="min-h-[70vh] flex items-center justify-center px-8 md:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-8 leading-[1.1]">
            Let's connect.
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Ready to empower your community with privacy-preserving
            storytelling? We're here to help you get started.
          </p>
        </div>
      </section>

      {/* Contact Options - Clean Grid */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              How can we help?
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Choose the option that best describes your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Community Organizations */}
            <div className="bg-white p-10 rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
                <svg
                  className="w-8 h-8 text-gray-600"
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
              <h3 className="text-2xl font-normal text-gray-900 mb-4">
                Community Organizations
              </h3>
              <p className="text-gray-600 font-light mb-8 leading-relaxed">
                Healthcare providers, community services, advocacy groups, and
                local government seeking to understand community needs.
              </p>
              <Link href="/contact/community" className="no-underline">
                <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-full text-base font-light hover:bg-gray-800 transition-all duration-200">
                  Start Community Project
                </button>
              </Link>
            </div>

            {/* Researchers */}
            <div className="bg-white p-10 rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
                <svg
                  className="w-8 h-8 text-gray-600"
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
              <h3 className="text-2xl font-normal text-gray-900 mb-4">
                Researchers
              </h3>
              <p className="text-gray-600 font-light mb-8 leading-relaxed">
                Academic institutions, think tanks, and research organizations
                seeking ethical access to community insights.
              </p>
              <Link href="/contact/research" className="no-underline">
                <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-full text-base font-light hover:bg-gray-800 transition-all duration-200">
                  Explore Research Partnership
                </button>
              </Link>
            </div>

            {/* Technology Partners */}
            <div className="bg-white p-10 rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-gray-900 mb-4">
                Technology Partners
              </h3>
              <p className="text-gray-600 font-light mb-8 leading-relaxed">
                Developers, tech companies, and integration partners looking to
                build with our privacy-preserving platform.
              </p>
              <Link href="/contact/technology" className="no-underline">
                <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-full text-base font-light hover:bg-gray-800 transition-all duration-200">
                  Discuss Integration
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* General Contact Form - Clean Design */}
      <section className="py-32 md:py-40">
        <div className="max-w-4xl mx-auto px-8 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Get in touch
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Send us a message and we'll get back to you within 24 hours.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-12">
            <form className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-base font-normal text-gray-900 mb-3"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 focus:border-transparent font-light transition-all"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-base font-normal text-gray-900 mb-3"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 focus:border-transparent font-light transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="organization"
                    className="block text-base font-normal text-gray-900 mb-3"
                  >
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 focus:border-transparent font-light transition-all"
                    placeholder="Your organization name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="inquiry-type"
                    className="block text-base font-normal text-gray-900 mb-3"
                  >
                    Type of Inquiry
                  </label>
                  <select
                    id="inquiry-type"
                    className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 focus:border-transparent font-light transition-all"
                  >
                    <option value="">Select inquiry type</option>
                    <option value="community">Community Partnership</option>
                    <option value="research">Research Collaboration</option>
                    <option value="technology">Technology Integration</option>
                    <option value="media">Media Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-base font-normal text-gray-900 mb-3"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 focus:border-transparent font-light transition-all resize-none"
                  placeholder="Tell us about your project, questions, or how we can help..."
                />
              </div>

              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  required
                  className="w-5 h-5 text-gray-600 border-gray-300 rounded focus:ring-gray-300 mt-1"
                />
                <label
                  htmlFor="privacy-consent"
                  className="text-base text-gray-600 font-light leading-relaxed"
                >
                  I consent to Empathy Ledger storing and processing this
                  information to respond to my inquiry. I understand that my
                  data will be handled according to your{' '}
                  <Link
                    href="/privacy"
                    className="text-gray-900 hover:text-gray-600 font-normal no-underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-10 py-4 rounded-full text-base font-light hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02]"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Information - Simple Grid */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8 md:px-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-3">Email</h3>
              <p className="text-gray-600 font-light mb-2">
                hello@empathyledger.org
              </p>
              <p className="text-sm text-gray-500 font-light">
                Response within 24 hours
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-3">
                Location
              </h3>
              <p className="text-gray-600 font-light mb-2">Australia Wide</p>
              <p className="text-sm text-gray-500 font-light">
                All states and territories
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-3">
                Support
              </h3>
              <p className="text-gray-600 font-light mb-2">
                Live chat available
              </p>
              <p className="text-sm text-gray-500 font-light">
                Mon-Fri 9am-5pm AEST
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team & Community Photos */}
      <section className="py-32 md:py-40">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Our Community
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              The dedicated team and communities we're privileged to work with
              across Australia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MediaDisplay
              src={placeholderImages.team}
              alt="Team meeting"
              aspectRatio="square"
              rounded="3xl"
              caption="Team collaboration"
              blurDataURL={placeholderBlurDataURLs.team}
            />
            <MediaDisplay
              src={placeholderImages.community}
              alt="Community workshop"
              aspectRatio="square"
              rounded="3xl"
              caption="Community partnership meeting"
              blurDataURL={placeholderBlurDataURLs.community}
            />
            <MediaDisplay
              src={placeholderImages.workshop}
              alt="Brisbane workshop"
              aspectRatio="square"
              rounded="3xl"
              caption="Design workshop"
              blurDataURL={placeholderBlurDataURLs.workshop}
            />
            <MediaDisplay
              src={placeholderImages.portrait}
              alt="Team member"
              aspectRatio="square"
              rounded="3xl"
              caption="Team leadership"
              blurDataURL={placeholderBlurDataURLs.portrait}
            />
            <MediaDisplay
              src={placeholderImages.impact}
              alt="Conference presentation"
              aspectRatio="square"
              rounded="3xl"
              caption="Annual conference"
              blurDataURL={placeholderBlurDataURLs.impact}
            />
            <MediaDisplay
              src={placeholderImages.story}
              alt="Community celebration"
              aspectRatio="square"
              rounded="3xl"
              caption="Community celebration"
              blurDataURL={placeholderBlurDataURLs.story}
            />
          </div>
        </div>
      </section>

      {/* Security Notice - Simple and Clean */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
            Your privacy matters
          </h2>
          <p className="text-xl text-gray-600 font-light mb-12 max-w-3xl mx-auto">
            All communications are handled with the same privacy standards as
            our platform. Your contact information is encrypted and used only to
            respond to your inquiry.
          </p>
          <div className="flex flex-wrap justify-center gap-12 text-sm text-gray-500 font-light">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Encrypted communications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Data minimization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
