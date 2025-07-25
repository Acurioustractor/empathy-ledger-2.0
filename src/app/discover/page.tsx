'use client';

import React from 'react';
import StoryDiscovery from '@/components/story/StoryDiscovery';

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Stories That Matter
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Discover authentic professional journeys from community-centered leaders, innovators, 
              and change-makers who are building a more just and sustainable world.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-700 font-medium">📖 {Math.floor(Math.random() * 50) + 100} Stories</span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-green-700 font-medium">👥 {Math.floor(Math.random() * 30) + 50} Storytellers</span>
              </div>
              <div className="bg-purple-50 px-4 py-2 rounded-lg">
                <span className="text-purple-700 font-medium">🏢 {Math.floor(Math.random() * 20) + 25} Organizations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Discovery Component */}
      <StoryDiscovery />

      {/* Platform Benefits Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Stories {">"} Resumes for Professional Networking
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Traditional professional platforms optimize for algorithmic engagement. 
              We optimize for authentic relationship-building through storytelling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Authentic Relationships</h3>
              <p className="text-gray-600 text-sm">
                Stories reveal values, approaches, and cultural competency in ways 
                that traditional credentials cannot capture.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Economic Justice</h3>
              <p className="text-gray-600 text-sm">
                Storytellers earn 70% of subscription revenue and maintain complete 
                ownership of their content and professional relationships.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Governance</h3>
              <p className="text-gray-600 text-sm">
                Platform policies include meaningful community participation rather 
                than corporate control over user experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community Wisdom</h3>
              <p className="text-gray-600 text-sm">
                Technology designed with Indigenous protocols that honor community 
                knowledge and create sustainable professional relationships.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Share Your Professional Story?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join the growing community of professionals who are building authentic 
            relationships and creating economic opportunities through storytelling.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Apply for $1000 Storyteller Program
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Learn About the Platform
            </button>
          </div>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="font-semibold text-yellow-800 mb-2">
            🚧 Demo Platform - Sprint 2 Features
          </h3>
          <p className="text-yellow-700 text-sm">
            This demonstrates the story discovery and interactive reading features built in Sprint 2. 
            The complete platform includes story management dashboards, multimedia integration, 
            and comprehensive analytics for storytellers.
          </p>
        </div>
      </div>
    </div>
  );
}