import React from 'react';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

export default function VisualizationsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
            alt="Data visualization abstract background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/85 to-teal-900/75"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Data That
            <span className="block bg-gradient-to-r from-teal-300 to-coral-400 bg-clip-text text-transparent">
              Tells Stories
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Explore community insights through privacy-preserving visualizations that reveal patterns 
            without compromising individual privacy
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <SecurityBadge variant="encryption" text="Zero-knowledge proofs" className="backdrop-blur-sm bg-white/10" />
            <SecurityBadge variant="privacy" text="Individual privacy protected" className="backdrop-blur-sm bg-white/10" />
            <SecurityBadge variant="certification" text="Mathematically verified" className="backdrop-blur-sm bg-white/10" />
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How We Visualize Without Violating Privacy
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Our visualizations use advanced cryptographic techniques to show community patterns 
              while ensuring individual stories remain completely private and encrypted.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zero-Knowledge Proofs</h3>
              <p className="text-gray-700">
                We can verify patterns exist without seeing individual data. Like proving you know 
                a secret without revealing what it is.
              </p>
            </div>

            <div className="bg-gradient-to-br from-coral-50 to-coral-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-coral-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Differential Privacy</h3>
              <p className="text-gray-700">
                Mathematical noise ensures that no individual can be identified from aggregate 
                data, even with sophisticated attacks.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Homomorphic Encryption</h3>
              <p className="text-gray-700">
                Perform computations on encrypted data without ever decrypting it. See the 
                results, never the individual inputs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Dashboard Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Live Community Insights Dashboard
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Real-time visualizations of community patterns, updated as new stories are shared
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Story Volume Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Story Volume by Topic</h3>
                <span className="text-sm text-gray-500">Updated 2 minutes ago</span>
              </div>
              <div className="relative h-80">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Interactive chart showing story volume by topic"
                  className="w-full h-full object-cover rounded-xl opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-teal-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-teal-800">1,247</div>
                        <div className="text-sm text-teal-600">Mental Health</div>
                      </div>
                      <div className="bg-coral-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-coral-800">856</div>
                        <div className="text-sm text-coral-600">Healthcare Access</div>
                      </div>
                      <div className="bg-primary-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-primary-800">623</div>
                        <div className="text-sm text-primary-600">Education</div>
                      </div>
                      <div className="bg-yellow-100 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-800">412</div>
                        <div className="text-sm text-yellow-600">Housing</div>
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium">Interactive Chart Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Geographic Distribution</h3>
              <div className="relative h-80">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Map of Australia showing story distribution"
                  className="w-full h-full object-cover rounded-xl opacity-30"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">NSW</span>
                      <span className="font-bold text-gray-900">4,123</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">VIC</span>
                      <span className="font-bold text-gray-900">3,567</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">QLD</span>
                      <span className="font-bold text-gray-900">2,891</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">WA</span>
                      <span className="font-bold text-gray-900">1,456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">SA</span>
                      <span className="font-bold text-gray-900">892</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Community Sentiment Trends</h3>
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Sentiment analysis trend chart"
                  className="w-full h-full object-cover rounded-xl opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-700 font-medium">Positive trend +12%</span>
                    </div>
                    <p className="text-gray-600">Community resilience indicators</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Policy Impact Correlation</h3>
              <div className="relative h-64">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Policy impact correlation visualization"
                  className="w-full h-full object-cover rounded-xl opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">73%</div>
                    <p className="text-gray-600">Stories leading to policy changes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demos */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Interactive Exploration Tools
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Click and explore different dimensions of community data while maintaining privacy
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Story Galaxy Explorer
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Navigate through interconnected stories as galaxies of related experiences. 
                  Zoom in to see themes, zoom out to see the big picture.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-teal-50 rounded-xl">
                  <div className="w-3 h-3 bg-teal-500 rounded-full mr-4"></div>
                  <span className="font-medium text-gray-900">3D network visualization</span>
                </div>
                <div className="flex items-center p-4 bg-coral-50 rounded-xl">
                  <div className="w-3 h-3 bg-coral-500 rounded-full mr-4"></div>
                  <span className="font-medium text-gray-900">Filter by themes, location, time</span>
                </div>
                <div className="flex items-center p-4 bg-primary-50 rounded-xl">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-4"></div>
                  <span className="font-medium text-gray-900">Real-time pattern discovery</span>
                </div>
              </div>

              <Button variant="cta" size="lg" href="/story-galaxy">
                Launch Story Galaxy →
              </Button>
            </div>

            <div className="relative">
              <div className="bg-black rounded-3xl shadow-2xl p-8 aspect-square flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Galaxy-like visualization of connected stories"
                  className="w-full h-full object-cover rounded-2xl opacity-70"
                />
                <div className="absolute inset-8 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-20 h-20 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="font-semibold text-xl">Interactive Galaxy Demo</p>
                    <p className="text-white/70 mt-2">15,247 stories, 342 insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Guarantees */}
      <section className="py-20 bg-gradient-to-br from-primary-50 via-teal-50 to-coral-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Mathematical Privacy Guarantees
            </h2>
            <p className="text-xl text-gray-700 mb-12 leading-relaxed">
              Our visualizations come with mathematically provable privacy guarantees. 
              Here's exactly what we can and cannot see.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-green-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What We Can See</h3>
                <ul className="text-left space-y-2 text-gray-700">
                  <li>• Aggregate patterns across 1000+ stories</li>
                  <li>• General themes and trends</li>
                  <li>• Statistical correlations</li>
                  <li>• Community-level insights</li>
                  <li>• Policy impact measurements</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">What We Cannot See</h3>
                <ul className="text-left space-y-2 text-gray-700">
                  <li>• Individual story content</li>
                  <li>• Personal identifying information</li>
                  <li>• Specific locations or details</li>
                  <li>• Individual behavioral patterns</li>
                  <li>• Connection to other stories</li>
                </ul>
              </div>
            </div>

            <div className="mt-12">
              <Button variant="secondary" size="lg" href="/trust-security">
                Deep Dive into Our Privacy Architecture
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Explore Your Community's Data?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Dive into interactive visualizations that respect privacy while revealing powerful insights
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="cta" size="lg" href="/story-galaxy">
              Launch Story Galaxy
            </Button>
            <Button variant="outline-white" size="lg" href="/submit">
              Add Your Story to the Data
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}