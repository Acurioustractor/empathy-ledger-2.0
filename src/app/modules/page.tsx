import React from 'react';
import Link from 'next/link';
import PlatformModules from '@/components/modules/PlatformModules';
import MediaDisplay from '@/components/ui/MediaDisplay';
import { placeholderImages } from '@/lib/supabase-media';

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="min-h-[70vh] flex items-center justify-center px-8 md:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight text-gray-900 mb-8 leading-[1.1]">
            Platform modules.
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
            Building blocks for community storytelling and privacy-preserving insights.
          </p>
        </div>
      </section>

      {/* Platform Overview - Clean Principles */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Building blocks for empowerment
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Each module designed with privacy, community sovereignty, and ethical 
              data practices at its core.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">Modular</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Use individual modules or combine them to create custom solutions. 
                Each module is independent.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">Private</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Privacy protection built from the ground up, ensuring individual 
                stories remain secure and anonymous.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4">Community-led</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Communities control how modules are configured and used, ensuring 
                technology serves their needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Module Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Explore All Platform Modules
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              From core storytelling tools to advanced analytics, our modules provide 
              everything needed for privacy-preserving community insights.
            </p>
          </div>

          <PlatformModules showCategories={true} layout="grid" />
        </div>
      </section>

      {/* Module Showcase */}
      <section className="py-32 md:py-40">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Available modules
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Comprehensive platform modules
            </p>
          </div>

          <PlatformModules />
        </div>
      </section>

      {/* Integration Options */}
      <section className="py-32 md:py-40 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-8">
              Deployment options
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Choose how you want to implement modules in your organization
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-gray-900 mb-4">Cloud Hosted</h3>
              <p className="text-gray-600 font-light mb-8 leading-relaxed">
                Fully managed platform on Australian servers with automatic updates.
              </p>
              <Link href="/contact" className="no-underline">
                <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-full text-base font-light hover:bg-gray-800 transition-all duration-200">
                  Get Started
                </button>
              </Link>
            </div>

            <div className="bg-white p-10 rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-gray-900 mb-4">Self-Hosted</h3>
              <p className="text-gray-600 font-light mb-8 leading-relaxed">
                Deploy on your infrastructure with complete data control.
              </p>
              <Link href="/docs/self-hosting" className="no-underline">
                <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-full text-base font-light hover:bg-gray-50 transition-all duration-200">
                  Documentation
                </button>
              </Link>
            </div>

            <div className="bg-white p-10 rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-normal text-gray-900 mb-4">API Integration</h3>
              <p className="text-gray-600 font-light mb-8 leading-relaxed">
                Integrate modules into existing systems via comprehensive APIs.
              </p>
              <Link href="/docs/api" className="no-underline">
                <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-full text-base font-light hover:bg-gray-50 transition-all duration-200">
                  API Docs
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Resources - Simple CTA */}
      <section className="py-32 md:py-40">
        <div className="max-w-4xl mx-auto px-8 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 mb-10 leading-[1.1]">
            Ready to build with
            <br />
            our modules?
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto font-light">
            Get started with comprehensive documentation and community support.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/docs" className="no-underline">
              <button className="bg-gray-900 text-white px-10 py-4 rounded-full text-base font-light hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02]">
                Browse Documentation
              </button>
            </Link>
            <Link href="/contact" className="no-underline">
              <button className="text-gray-700 px-10 py-4 rounded-full text-base font-light hover:bg-gray-50 transition-all duration-200">
                Get Support
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}