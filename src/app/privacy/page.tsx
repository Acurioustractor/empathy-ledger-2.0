import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extralight text-gray-900 mb-6">
              Privacy & Data Sovereignty
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
              Your stories belong to you. Our privacy principles are built on Indigenous data sovereignty and your fundamental right to control your narrative.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="no-underline">
                <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition">
                  Manage Your Privacy
                </button>
              </Link>
              <Link href="/auth/signin" className="no-underline">
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-light hover:bg-gray-50 smooth-transition">
                  View Your Data
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extralight text-gray-900 mb-12 text-center">
              Our Privacy Principles
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 hover-lift">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Data Sovereignty</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  You own your stories completely. We act as custodians, never owners. Every piece of data belongs to you and can be exported or deleted at any time.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8 hover-lift">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Privacy by Design</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Every feature includes granular privacy controls. Share publicly, with your community, or keep stories private - you decide who sees what.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8 hover-lift">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Fair Value Exchange</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  When your stories create value through research or insights, you share in that value. Our platform operates on principles of fair compensation and transparent value distribution.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8 hover-lift">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Cultural Protocols</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Indigenous data sovereignty principles guide our platform. Stories are living entities that belong to their tellers, not raw materials to be processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Controls */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extralight text-gray-900 mb-12 text-center">
              Granular Privacy Controls
            </h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-200">
                <h3 className="text-xl font-normal text-gray-900 mb-4">Story Visibility</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l4.242 4.242M21 12a9.969 9.969 0 01-1.697 5.538m-7.848 2.287a10.05 10.05 0 01-3.455-.643M21 12a9.969 9.969 0 00-1.697-5.538m-7.848-2.287A10.05 10.05 0 0112 5c2.756 0 5.277 1.119 7.094 2.935L21 9.75" />
                      </svg>
                    </div>
                    <h4 className="font-normal text-gray-900 text-sm">Private</h4>
                    <p className="text-xs text-gray-600 font-light">Only you</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="font-normal text-gray-900 text-sm">Community</h4>
                    <p className="text-xs text-gray-600 font-light">Your communities</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="font-normal text-gray-900 text-sm">Organization</h4>
                    <p className="text-xs text-gray-600 font-light">Your organization</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-normal text-gray-900 text-sm">Public</h4>
                    <p className="text-xs text-gray-600 font-light">Anyone</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-200">
                <h3 className="text-xl font-normal text-gray-900 mb-6">Additional Controls</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-normal text-gray-900">Personal Information</h4>
                        <p className="text-sm text-gray-600 font-light">Control location and age visibility</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-normal text-gray-900">Contact Preferences</h4>
                        <p className="text-sm text-gray-600 font-light">Choose who can message you</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-normal text-gray-900">Research Participation</h4>
                        <p className="text-sm text-gray-600 font-light">Opt into compensated research</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-normal text-gray-900">Data Retention</h4>
                        <p className="text-sm text-gray-600 font-light">Choose how long to keep data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extralight text-gray-900 mb-12 text-center">
              Your Rights
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Export Your Data</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Download a complete copy of all your data at any time. Your stories, settings, and interactions in a portable format.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Update & Correct</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Edit your stories, update your profile, and correct any information. You maintain complete control over your narrative.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-4">Delete & Forget</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Request complete account deletion. Your personal data will be anonymized while preserving community value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section-spacing bg-gray-900 text-white">
        <div className="content-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extralight mb-6">
              Questions About Privacy?
            </h2>
            <p className="text-xl text-gray-300 font-light mb-8">
              Our privacy team is here to help you understand and control your data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="no-underline">
                <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-light hover:bg-gray-100 smooth-transition">
                  Contact Privacy Team
                </button>
              </Link>
              <a href="mailto:privacy@empathyledger.org" className="no-underline">
                <button className="border border-gray-600 text-gray-300 px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition">
                  privacy@empathyledger.org
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}