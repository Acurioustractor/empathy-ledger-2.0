'use client';

import React, { useState, useEffect } from 'react';
import ProfileDisplay from '@/components/storyteller/ProfileDisplay';

export default function BenKnightProfilePage() {
  const [accessLevel, setAccessLevel] = useState<'public' | 'paywall' | 'organizational'>('public');

  useEffect(() => {
    // Check if user has subscription access
    const subscription = localStorage.getItem('subscription_ben-knight-demo');
    if (subscription) {
      setAccessLevel('paywall');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Controls */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-2">Empathy Ledger Demo: Enhanced Storyteller Profile</h1>
          <p className="text-blue-100 text-sm mb-4">
            This demonstrates the three-tier profile system with Ben Knight as the first case study storyteller.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setAccessLevel('public')}
              className={`px-4 py-2 rounded text-sm ${
                accessLevel === 'public' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}
            >
              Public View (Free)
            </button>
            <button
              onClick={() => setAccessLevel('paywall')}
              className={`px-4 py-2 rounded text-sm ${
                accessLevel === 'paywall' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}
            >
              Premium View ($25/month)
            </button>
            <button
              onClick={() => setAccessLevel('organizational')}
              className={`px-4 py-2 rounded text-sm ${
                accessLevel === 'organizational' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
              }`}
            >
              Organizational (Custom)
            </button>
          </div>
        </div>
      </div>

      {/* Profile Display */}
      <ProfileDisplay 
        storytellerId="ben-knight-demo" 
        accessLevel={accessLevel}
      />

      {/* Demo Features Info */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Demo Features Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">Public Tier (Free)</h3>
              <ul className="text-sm space-y-1">
                <li>✓ Basic professional identity</li>
                <li>✓ Truncated professional summary</li>
                <li>✓ Top 3 expertise areas</li>
                <li>✓ Story previews (150 chars)</li>
                <li>✓ Service overviews</li>
                <li>✓ Upgrade prompts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Premium Tier ($25/month)</h3>
              <ul className="text-sm space-y-1">
                <li>✓ Complete professional summary</li>
                <li>✓ All expertise areas</li>
                <li>✓ Full story portfolio access</li>
                <li>✓ Professional insights series</li>
                <li>✓ Direct contact information</li>
                <li>✓ Calendar booking access</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">Organizational (Custom)</h3>
              <ul className="text-sm space-y-1">
                <li>✓ All premium features</li>
                <li>✓ Custom consultation rates</li>
                <li>✓ Priority response times</li>
                <li>✓ Bulk licensing options</li>
                <li>✓ Partnership opportunities</li>
                <li>✓ Custom service development</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Platform Innovation Demonstrated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Storytelling {">"} Resumes</h3>
              <p className="text-sm text-gray-600">
                Ben's profile demonstrates how professional stories reveal expertise, values, and approach 
                in ways that traditional LinkedIn profiles cannot capture.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Community-Centered Revenue</h3>
              <p className="text-sm text-gray-600">
                70% of subscription revenue flows to Ben, proving that storytellers can earn sustainable 
                income from sharing their expertise authentically.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Three-Tier Privacy System</h3>
              <p className="text-sm text-gray-600">
                Storytellers control access to their content while creating multiple revenue streams 
                from public visibility to custom organizational partnerships.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentic Professional Relationships</h3>
              <p className="text-sm text-gray-600">
                Organizations can discover professionals whose expertise comes from authentic community 
                relationships rather than just traditional credentials.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Next Steps in Development</h3>
          <p className="text-yellow-700 text-sm">
            This demo represents Sprint 1 completion with Ben's enhanced profile system. 
            Next: Story integration, video content, visual assets, and the $1000 Storyteller Program 
            with 10 diverse community leaders.
          </p>
        </div>
      </div>
    </div>
  );
}