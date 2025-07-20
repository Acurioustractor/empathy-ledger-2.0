import React from 'react';
import StorySubmissionForm from '@/components/story/StorySubmissionForm';
import SecurityBadge from '@/components/trust/SecurityBadge';
import Button from '@/components/ui/Button';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import PhotoGallery from '@/components/ui/PhotoGallery';
import VideoShowcase from '@/components/ui/VideoShowcase';

export default function SubmitStoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
            alt="Person writing their story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-teal-900/80"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Your Story
            <span className="block bg-gradient-to-r from-teal-300 to-coral-400 bg-clip-text text-transparent">
              Has Power
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Share your experience safely and anonymously. Help build understanding 
            while maintaining complete control over your privacy and data.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <SecurityBadge variant="encryption" text="End-to-end encrypted" className="backdrop-blur-sm bg-white/10" />
            <SecurityBadge variant="privacy" text="You control who sees it" className="backdrop-blur-sm bg-white/10" />
            <SecurityBadge variant="certification" text="Change settings anytime" className="backdrop-blur-sm bg-white/10" />
          </div>
        </div>
      </section>

      {/* Pre-submission Information */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Before You Begin
              </h2>
              <p className="text-xl text-gray-700">
                Understanding how your story will be protected and used
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Your Data, Your Control</h3>
                <p className="text-gray-600">
                  You decide who can see your story, how it's used, and can change 
                  these settings or delete your story at any time.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-coral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community Impact</h3>
                <p className="text-gray-600">
                  Your story helps build understanding and can drive positive 
                  changes in services, policies, and community support.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Compensation</h3>
                <p className="text-gray-600">
                  If your story contributes to research or insights that create 
                  value, you receive fair compensation through smart contracts.
                </p>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-8 rounded-2xl border border-blue-200 mb-16">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Important to Know</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">✓ What We Protect</h4>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Your identity remains anonymous</li>
                    <li>• Stories are encrypted before submission</li>
                    <li>• No personal identifying information stored</li>
                    <li>• Location limited to state level only</li>
                    <li>• You can withdraw consent anytime</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">✓ How We Help</h4>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Connect you with similar experiences</li>
                    <li>• Provide community insights and support</li>
                    <li>• Contribute to policy and service improvements</li>
                    <li>• Enable ethical research for positive change</li>
                    <li>• Ensure community benefits from your wisdom</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Examples Gallery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Get Inspired by Other Stories
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              See how others have shared their experiences through photos, videos, and written stories. 
              Find the format that feels right for you.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Written Stories</h3>
              <div className="space-y-4">
                <ImagePlaceholder
                  type="story"
                  size="md"
                  aspect="landscape"
                  title="Mental Health Journey"
                  description="Sarah's story about finding support"
                  className="hover:scale-105 transition-transform duration-300"
                />
                <ImagePlaceholder
                  type="story"
                  size="md"
                  aspect="landscape"
                  title="Education Access"
                  description="Marcus shares his learning experience"
                  className="hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Photo Stories</h3>
              <PhotoGallery 
                title=""
                layout="grid"
                count={4}
                showCaptions={true}
                className=""
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Video Stories</h3>
              <VideoShowcase 
                title=""
                description=""
                layout="grid"
                count={2}
                className=""
              />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Every story format is welcome and equally valued. Choose what feels most comfortable for you.
            </p>
            <Button variant="secondary" href="/story-examples">
              View More Story Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Story Submission Form */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <StorySubmissionForm />
        </div>
      </section>

      {/* Support & Resources */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Need Support?
              </h2>
              <p className="text-lg text-gray-700">
                We're here to help if you need support before, during, or after sharing your story
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Emotional Support</h3>
                <p className="text-gray-700 mb-4">
                  Sharing your story can bring up difficult emotions. Here are resources 
                  that can provide support:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Lifeline:</strong> 13 11 14 (24/7 crisis support)</li>
                  <li>• <strong>Beyond Blue:</strong> 1300 22 4636 (mental health support)</li>
                  <li>• <strong>Kids Helpline:</strong> 1800 55 1800 (for young people)</li>
                  <li>• <strong>MensLine:</strong> 1300 78 99 78 (support for men)</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Support</h3>
                <p className="text-gray-700 mb-4">
                  Having trouble with the platform or have questions about privacy 
                  and data security?
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Help Center:</strong> Browse our comprehensive guides</li>
                  <li>• <strong>Community Forum:</strong> Connect with other users</li>
                  <li>• <strong>Live Chat:</strong> Get real-time technical support</li>
                  <li>• <strong>Email Support:</strong> support@empathyledger.org</li>
                </ul>
                <div className="mt-6">
                  <Button variant="secondary" href="/help">
                    Visit Help Center
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Commitment */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-6">
              Our Privacy Promise
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Your trust is sacred to us. We've built every aspect of our platform 
              to protect your privacy and ensure your story remains yours.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <SecurityBadge variant="encryption" text="Military-grade encryption" className="backdrop-blur-sm bg-white/10" />
              <SecurityBadge variant="privacy" text="Zero-knowledge architecture" className="backdrop-blur-sm bg-white/10" />
              <SecurityBadge variant="certification" text="Regular security audits" className="backdrop-blur-sm bg-white/10" />
            </div>
            <Button variant="outline-white" href="/trust-security">
              Learn About Our Security
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}