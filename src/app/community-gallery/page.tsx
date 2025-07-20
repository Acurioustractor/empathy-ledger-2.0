import React from 'react';
import PhotoGallery from '@/components/ui/PhotoGallery';
import VideoShowcase from '@/components/ui/VideoShowcase';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

export default function CommunityGalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
            alt="Community members sharing stories together"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-teal-900/80"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Community
            <span className="block bg-gradient-to-r from-teal-300 to-coral-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Celebrating the faces, places, and moments that make our community 
            storytelling movement possible across Australia.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <SecurityBadge variant="privacy" text="Consent-first sharing" className="backdrop-blur-sm bg-white/10" />
            <SecurityBadge variant="encryption" text="Privacy-preserving galleries" className="backdrop-blur-sm bg-white/10" />
            <SecurityBadge variant="certification" text="Community-curated content" className="backdrop-blur-sm bg-white/10" />
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-colors">
              All Content
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
              Community Events
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
              Storytellers
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
              Impact Stories
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
              Behind the Scenes
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
              Team & Partners
            </button>
          </div>
        </div>
      </section>

      {/* Featured Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Featured: Community Transformation
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              A visual journey through one community's transformation using Empathy Ledger
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-16">
            <div className="grid lg:grid-cols-2">
              <div className="relative">
                <ImagePlaceholder
                  type="community"
                  size="full"
                  aspect="video"
                  title="Brisbane Community Health Center - Before"
                  description="The starting point: outdated facilities and disconnected services"
                  className="hover:scale-105 transition-transform duration-300"
                  overlay={true}
                />
              </div>
              <div className="relative">
                <ImagePlaceholder
                  type="community"
                  size="full"
                  aspect="video"
                  title="Brisbane Community Health Center - After"
                  description="6 months later: redesigned based on 200+ community stories"
                  className="hover:scale-105 transition-transform duration-300"
                  overlay={true}
                />
              </div>
            </div>
            <div className="p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                200 Stories, 6 Months, Complete Transformation
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                See how community members in Brisbane used Empathy Ledger to document 
                their healthcare experiences, leading to a complete redesign of local 
                health services that now better serve 15,000+ residents.
              </p>
              <Button variant="primary" href="/case-studies/brisbane-health">
                View Full Case Study →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Galleries by Theme */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="space-y-20">
            
            {/* Community Events */}
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Community Events & Workshops
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Story-sharing sessions, workshops, and community gatherings across Australia
                </p>
              </div>
              <PhotoGallery 
                title=""
                layout="masonry"
                count={12}
                showCaptions={true}
                className="mb-8"
              />
            </div>

            {/* Storyteller Portraits */}
            <div className="bg-white p-12 rounded-3xl shadow-lg">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Storyteller Portraits
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  The brave individuals who share their experiences to create positive change
                </p>
              </div>
              <PhotoGallery 
                title=""
                layout="testimonial"
                count={9}
                showCaptions={true}
                className="mb-8"
              />
            </div>

            {/* Impact Documentation */}
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Real-World Impact
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Before and after photos documenting positive changes in communities
                </p>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Healthcare Improvements</h3>
                  <div className="space-y-4">
                    <ImagePlaceholder
                      type="photo"
                      size="md"
                      aspect="landscape"
                      title="Perth Mental Health Hub - Redesigned"
                      description="New layout based on accessibility feedback"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                    <ImagePlaceholder
                      type="photo"
                      size="md"
                      aspect="landscape"
                      title="Adelaide Community Clinic"
                      description="Extended hours after community input"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Education Initiatives</h3>
                  <div className="space-y-4">
                    <ImagePlaceholder
                      type="photo"
                      size="md"
                      aspect="landscape"
                      title="Melbourne Learning Center"
                      description="New programs for adult learners"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                    <ImagePlaceholder
                      type="photo"
                      size="md"
                      aspect="landscape"
                      title="Cairns Youth Workshop"
                      description="Skills development program launch"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Policy Changes</h3>
                  <div className="space-y-4">
                    <ImagePlaceholder
                      type="photo"
                      size="md"
                      aspect="landscape"
                      title="Sydney Council Meeting"
                      description="Housing policy updated based on stories"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                    <ImagePlaceholder
                      type="photo"
                      size="md"
                      aspect="landscape"
                      title="Darwin Community Forum"
                      description="New accessibility standards implemented"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Gallery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <VideoShowcase 
            title="Community Video Stories"
            description="Watch the journeys, celebrations, and transformations happening across our communities"
            layout="hero"
            count={6}
            className="mb-16"
          />
        </div>
      </section>

      {/* Behind the Scenes */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Behind the Scenes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The people and processes that make privacy-preserving community storytelling possible
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Our Team at Work</h3>
              <PhotoGallery 
                title=""
                layout="grid"
                count={6}
                showCaptions={true}
                className="mb-8"
              />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Technology & Security</h3>
              <div className="space-y-6">
                <ImagePlaceholder
                  type="photo"
                  size="lg"
                  aspect="video"
                  title="Data Center Security"
                  description="Australian servers protecting community stories"
                  className="hover:scale-105 transition-transform duration-300"
                />
                <div className="grid grid-cols-2 gap-4">
                  <ImagePlaceholder
                    type="photo"
                    size="md"
                    aspect="landscape"
                    title="Privacy Engineering"
                    description="Building zero-knowledge systems"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                  <ImagePlaceholder
                    type="photo"
                    size="md"
                    aspect="landscape"
                    title="Community Testing"
                    description="User experience validation sessions"
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Guidelines */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Share Your Community Moments
              </h2>
              <p className="text-lg text-gray-700">
                Have photos or videos that show the impact of storytelling in your community? 
                We'd love to feature them in our gallery.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-primary-50 to-teal-50 p-8 rounded-2xl border border-primary-200 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Submission Guidelines</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">✓ What We Feature</h4>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Community events and workshops</li>
                    <li>• Storyteller portraits (with permission)</li>
                    <li>• Before/after impact documentation</li>
                    <li>• Team and partner collaborations</li>
                    <li>• Technology and process insights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Our Standards</h4>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Explicit consent from all people featured</li>
                    <li>• High-quality, authentic imagery</li>
                    <li>• Diverse representation prioritized</li>
                    <li>• Community benefit focus</li>
                    <li>• Privacy-first approach to sharing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button variant="cta" size="lg" href="/submit-media">
                Submit Photos or Videos
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                All submissions reviewed for community benefit and privacy compliance
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}