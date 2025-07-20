import React from 'react';
import StoryGalaxy from '@/components/visualizations/StoryGalaxy';
import DatabaseInsights from '@/components/database/DatabaseInsights';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

export default function StoryGalaxyPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-cyan-900/30"></div>
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Story
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Galaxy
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Navigate through interconnected stories as galaxies of shared
            experience. Explore patterns while protecting individual privacy.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <SecurityBadge
              variant="encryption"
              text="Zero-knowledge visualization"
              className="backdrop-blur-sm bg-white/10"
            />
            <SecurityBadge
              variant="privacy"
              text="Individual stories encrypted"
              className="backdrop-blur-sm bg-white/10"
            />
            <SecurityBadge
              variant="certification"
              text="Pattern-only analysis"
              className="backdrop-blur-sm bg-white/10"
            />
          </div>
        </div>
      </section>

      {/* Interactive Galaxy */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Interactive Story Network
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Each point represents an anonymized story. Size indicates
              community connections. Colors show impact level. Click to explore.
            </p>
          </div>

          <StoryGalaxy className="h-[600px] mb-12" />

          {/* Instructions */}
          <div className="grid md:grid-cols-3 gap-6 text-white">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Explore Patterns</h3>
              <p className="text-gray-300 text-sm">
                Zoom and filter to discover how stories cluster around themes,
                locations, and impact levels.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Click to Investigate
              </h3>
              <p className="text-gray-300 text-sm">
                Select individual nodes to see anonymized metadata without
                accessing private story content.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy Guaranteed</h3>
              <p className="text-gray-300 text-sm">
                All visualizations use cryptographic proofs. Individual privacy
                is mathematically protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Explanation */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-8">
              How We Protect Privacy While Revealing Patterns
            </h2>
            <p className="text-lg text-gray-300 mb-12 leading-relaxed">
              Story Galaxy uses advanced cryptographic techniques to visualize
              community patterns without ever accessing individual story
              content.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-green-400">
                  What We Can See
                </h3>
                <ul className="text-left space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Aggregate patterns across 1000+ stories
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Theme clustering and relationships
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Geographic distribution (state level only)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Statistical impact measurements
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Anonymized connection strengths
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-red-400">
                  What We Cannot See
                </h3>
                <ul className="text-left space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    Individual story content or text
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    Personal identifying information
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    Specific locations or addresses
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    Individual behavioral patterns
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    Direct links between specific stories
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12">
              <Button variant="secondary" size="lg" href="/trust-security">
                Deep Dive: Privacy Architecture →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">
              Add Your Story to the Galaxy
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Every story makes the galaxy more complete. Join thousands of
              Australians contributing to community understanding while
              maintaining complete privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button variant="cta" size="lg" href="/submit">
                Share Your Story
              </Button>
              <Button variant="outline-white" size="lg" href="/visualizations">
                Explore More Visualizations
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
