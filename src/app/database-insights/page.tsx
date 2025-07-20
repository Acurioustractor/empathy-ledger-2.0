import React from 'react';
import DatabaseInsights from '@/components/database/DatabaseInsights';
import SupabaseDashboard from '@/components/database/SupabaseDashboard';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

export default function DatabaseInsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Database Insights
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Explore community patterns through privacy-preserving database visualizations. 
              See aggregated insights while individual stories remain completely protected.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <SecurityBadge variant="encryption" text="Zero-knowledge architecture" />
              <SecurityBadge variant="privacy" text="Differential privacy enabled" />
              <SecurityBadge variant="certification" text="Cryptographically verified" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Database Insights */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Live Community Metrics
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Real-time insights from our privacy-preserving database. All data is aggregated 
                and anonymized to protect individual privacy while revealing community patterns.
              </p>
            </div>

            <DatabaseInsights />
          </div>
        </div>
      </section>

      {/* Supabase Dashboard */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Database Architecture
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Explore our Supabase database structure designed for maximum privacy and security. 
                See how we protect individual stories while enabling community insights.
              </p>
            </div>

            <SupabaseDashboard showTechnicalDetails={true} />
          </div>
        </div>
      </section>

      {/* Privacy Methodology */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-teal-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Privacy Methodology
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Learn how we use advanced cryptographic techniques to generate insights 
                without ever accessing individual story content.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">End-to-End Encryption</h3>
                <p className="text-gray-700 mb-4">
                  Stories are encrypted on the user's device before transmission. We never 
                  have access to the actual content, only encrypted data that we cannot read.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AES-256-GCM encryption</li>
                  <li>• Client-side key generation</li>
                  <li>• Zero-knowledge architecture</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-coral-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Differential Privacy</h3>
                <p className="text-gray-700 mb-4">
                  Mathematical noise is added to all aggregated data to prevent individual 
                  identification while preserving statistical accuracy for community insights.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Calibrated noise injection</li>
                  <li>• ε-differential privacy</li>
                  <li>• Minimum 1000+ records</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Zero-Knowledge Proofs</h3>
                <p className="text-gray-700 mb-4">
                  We can prove that patterns exist in the data without revealing what those 
                  patterns are based on, using cryptographic zero-knowledge proof systems.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• zk-SNARKs implementation</li>
                  <li>• Pattern verification only</li>
                  <li>• Mathematically provable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database Performance */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Real-Time Performance
              </h2>
              <p className="text-xl text-gray-700">
                Our privacy-preserving database architecture maintains high performance 
                while protecting individual privacy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt; 50ms</div>
                <div className="text-gray-700 font-medium">Query Response</div>
                <div className="text-sm text-gray-500 mt-2">Average aggregation time</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-700 font-medium">Uptime</div>
                <div className="text-sm text-gray-500 mt-2">Multi-region reliability</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">256-bit</div>
                <div className="text-gray-700 font-medium">Encryption</div>
                <div className="text-sm text-gray-500 mt-2">AES-GCM standard</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                <div className="text-gray-700 font-medium">AU Regions</div>
                <div className="text-sm text-gray-500 mt-2">Data sovereignty compliance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Explore More Visualizations
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Dive deeper into privacy-preserving data exploration with our interactive 
              visualization tools and Story Galaxy.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button variant="cta" size="lg" href="/story-galaxy">
                Launch Story Galaxy
              </Button>
              <Button variant="outline-white" size="lg" href="/visualizations">
                View All Visualizations
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}