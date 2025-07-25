'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import PaywallUpgrade from './PaywallUpgrade';

interface ProfileDisplayProps {
  storytellerId: string;
  accessLevel: 'public' | 'paywall' | 'organizational';
}

interface StorytellerProfile {
  id: string;
  full_name: string;
  current_role: string;
  current_organization: string;
  professional_summary: string;
  expertise_areas: string[];
  story_previews?: Array<{
    id: string;
    title: string;
    summary: string;
    themes: string[];
  }>;
  services?: Array<{
    service_type: string;
    service_name: string;
    base_price: number;
  }>;
  privacy_tier_settings: {
    paywall: {
      price_monthly: number;
      price_annual: number;
    };
  };
  total_expertise_areas?: number;
}

export default function ProfileDisplay({ storytellerId, accessLevel }: ProfileDisplayProps) {
  const [profile, setProfile] = useState<StorytellerProfile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [storytellerId, accessLevel]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/storyteller/profile?storyteller_id=${storytellerId}&access_level=${accessLevel}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-48 rounded-lg mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-600">Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
            {profile.full_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-xl opacity-90">{profile.current_role}</p>
            <p className="text-lg opacity-75">{profile.current_organization}</p>
          </div>
          {accessLevel === 'public' && (
            <Button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              View Full Profile
            </Button>
          )}
        </div>
      </div>

      {/* Access Level Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              accessLevel === 'public' ? 'bg-green-100 text-green-800' :
              accessLevel === 'paywall' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {accessLevel === 'public' ? 'Public Access' :
               accessLevel === 'paywall' ? 'Premium Access' :
               'Organizational Access'}
            </div>
            {accessLevel === 'public' && (
              <span className="text-sm text-gray-600">
                Upgrade for complete profile and professional insights
              </span>
            )}
          </div>
          {accessLevel === 'paywall' && (
            <div className="text-sm text-gray-600">
              ✓ Full access to stories, insights, and contact info
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Professional Overview</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          {accessLevel === 'public' && profile.professional_summary?.length > 200 
            ? profile.professional_summary.substring(0, 200) + '...'
            : profile.professional_summary
          }
          {accessLevel === 'public' && profile.professional_summary?.length > 200 && (
            <span 
              className="text-blue-600 cursor-pointer ml-2 hover:underline" 
              onClick={() => setShowUpgradeModal(true)}
            >
              Read more
            </span>
          )}
        </p>
      </div>

      {/* Expertise Areas */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Expertise & Focus Areas</h2>
        <div className="flex flex-wrap gap-3">
          {(accessLevel === 'public' 
            ? profile.expertise_areas?.slice(0, 3) 
            : profile.expertise_areas
          )?.map((area, index) => (
            <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              {area}
            </span>
          ))}
          {accessLevel === 'public' && profile.expertise_areas?.length > 3 && (
            <span 
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full cursor-pointer hover:bg-gray-200"
              onClick={() => setShowUpgradeModal(true)}
            >
              +{profile.expertise_areas.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Story Portfolio */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Professional Stories</h2>
        {accessLevel === 'public' ? (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Unlock Complete Story Portfolio</h3>
              <p className="text-gray-600 mb-4">
                Access Ben's complete professional journey including 5 in-depth stories, professional insights series, and exclusive methodologies.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="text-left">
                  <h4 className="font-medium mb-2">What's included:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ "From Muswellbrook to Global Platform" (2,500 words)</li>
                    <li>✓ "The Origin of A Curious Tractor"</li>
                    <li>✓ "Building Empathy Ledger: Vision to Platform"</li>
                    <li>✓ Complete professional insights series</li>
                    <li>✓ Quote library with 30+ professional insights</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-medium mb-2">Professional value:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Community-centered platform development</li>
                    <li>✓ Ethical technology principles and practices</li>
                    <li>✓ Strategic vision and execution methodology</li>
                    <li>✓ Aboriginal community protocols in technology</li>
                    <li>✓ Direct contact and collaboration opportunities</li>
                  </ul>
                </div>
              </div>
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                View Pricing & Upgrade
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.story_previews?.map((story) => (
              <div key={story.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                <p className="text-gray-600 mb-3">{story.summary}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {story.themes?.map((theme, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {theme}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  Read Full Story
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Professional Services */}
      {profile.services && profile.services.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Professional Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.services.map((service, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">{service.service_name}</h3>
                <p className="text-gray-600 text-sm mb-3 capitalize">{service.service_type.replace('_', ' ')}</p>
                {service.base_price && (
                  <p className="font-semibold text-green-600 mb-3">${service.base_price}</p>
                )}
                {accessLevel === 'public' ? (
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    View Details
                  </Button>
                ) : (
                  <Button size="sm" className="w-full">
                    Book Service
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact & Collaboration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Connect & Collaborate</h2>
        {accessLevel === 'public' ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Interested in Ben's expertise in community-centered platform development, ethical technology, or storytelling-centered networking?
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 mr-4"
              >
                Access Full Profile
              </Button>
              <Button variant="outline">
                General Inquiry
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Ready to collaborate on community-centered technology, platform development, or professional storytelling initiatives?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full">
                📧 Direct Email
              </Button>
              <Button variant="outline" className="w-full">
                📅 Schedule Call
              </Button>
              <Button variant="outline" className="w-full">
                🤝 Partnership Inquiry
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Paywall Upgrade Modal */}
      {showUpgradeModal && (
        <PaywallUpgrade 
          storyteller={profile}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={(newAccessLevel) => {
            setShowUpgradeModal(false);
            // In a real implementation, this would update the access level and refresh the profile
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}