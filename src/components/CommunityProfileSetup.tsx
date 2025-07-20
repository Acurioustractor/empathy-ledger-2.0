/**
 * Community Profile Setup Component
 * 
 * Philosophy: This component honors each community member's identity, cultural protocols,
 * and preferences. It creates space for storytellers to define how they want to participate
 * in the community while ensuring their sovereignty is respected.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface CommunityProfileData {
  full_name: string;
  community_affiliation: string;
  preferred_pronouns: string;
  bio: string;
  languages_spoken: string[];
  cultural_protocols: {
    seasonal_restrictions: boolean;
    gender_specific: boolean;
    ceremonial_content: boolean;
    requires_elder_review: boolean;
    sharing_protocols: string[];
    community_permissions: string[];
  };
  contact_preferences: {
    email_updates: boolean;
    community_newsletter: boolean;
    story_connections: boolean;
    value_notifications: boolean;
  };
}

const COMMON_COMMUNITIES = [
  'First Nations',
  'Indigenous Australian',
  'Aboriginal',
  'Torres Strait Islander',
  'Métis',
  'Inuit',
  'Native American',
  'Native Hawaiian',
  'Pacific Islander',
  'African Diaspora',
  'Latino/Latina/Latinx',
  'Refugee/Migrant',
  'LGBTQ+',
  'Disability Community',
  'Youth Justice',
  'Community Organization',
  'Other'
];

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'Mandarin', 'Arabic', 'Hindi', 'Portuguese',
  'Russian', 'Japanese', 'German', 'Korean', 'Italian', 'Vietnamese', 'Tagalog',
  'Swahili', 'Thai', 'Dutch', 'Swedish', 'Polish', 'Hebrew', 'Greek'
];

interface CommunityProfileSetupProps {
  onComplete: () => void;
}

export default function CommunityProfileSetup({ onComplete }: CommunityProfileSetupProps) {
  const { updateCommunityProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const [profileData, setProfileData] = useState<CommunityProfileData>({
    full_name: '',
    community_affiliation: '',
    preferred_pronouns: '',
    bio: '',
    languages_spoken: [],
    cultural_protocols: {
      seasonal_restrictions: false,
      gender_specific: false,
      ceremonial_content: false,
      requires_elder_review: false,
      sharing_protocols: [],
      community_permissions: []
    },
    contact_preferences: {
      email_updates: true,
      community_newsletter: true,
      story_connections: true,
      value_notifications: true
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setProfileData(prev => {
      const currentSection = prev[section as keyof CommunityProfileData];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: value
          }
        };
      }
      return prev;
    });
  };

  const handleLanguageToggle = (language: string) => {
    setProfileData(prev => ({
      ...prev,
      languages_spoken: prev.languages_spoken.includes(language)
        ? prev.languages_spoken.filter(l => l !== language)
        : [...prev.languages_spoken, language]
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      
      await updateCommunityProfile(profileData);
      onComplete();
      router.push('/stories');
    } catch (error: any) {
      setError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: 'var(--muted)' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Welcome to Our Community
          </h1>
          <p 
            className="text-xl mb-6"
            style={{ color: 'var(--color-storm)' }}
          >
            Help us understand how to best honor your participation and respect your cultural protocols.
          </p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {[1, 2, 3, 4].map(num => (
              <div
                key={num}
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: num <= step ? 'var(--primary)' : 'var(--color-elder)'
                }}
              />
            ))}
          </div>
        </div>

        <div 
          className="story-card p-8"
          style={{ backgroundColor: 'var(--background)' }}
        >
          {/* Step 1: Basic Identity */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 
                className="text-2xl font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                Tell Us About Yourself
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full"
                  placeholder="Your preferred name"
                />
                <p className="text-xs mt-1 text-muted-foreground">
                  This can be your traditional name, chosen name, or how you'd like to be known in the community.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Pronouns
                </label>
                <input
                  type="text"
                  value={profileData.preferred_pronouns}
                  onChange={(e) => handleInputChange('preferred_pronouns', e.target.value)}
                  className="w-full"
                  placeholder="she/her, he/him, they/them, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Community Affiliation *
                </label>
                <select
                  value={profileData.community_affiliation}
                  onChange={(e) => handleInputChange('community_affiliation', e.target.value)}
                  className="w-full"
                  required
                >
                  <option value="">Select your community...</option>
                  {COMMON_COMMUNITIES.map(community => (
                    <option key={community} value={community}>
                      {community}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-1 text-muted-foreground">
                  This helps us connect you with relevant community insights and respect cultural protocols.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full h-24"
                  placeholder="Share a bit about yourself, your work, or what brings you to this community..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Languages and Cultural Background */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 
                className="text-2xl font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                Languages and Cultural Context
              </h2>
              
              <div>
                <label className="block text-sm font-medium mb-3">
                  Languages You Speak
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COMMON_LANGUAGES.map(language => (
                    <label key={language} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileData.languages_spoken.includes(language)}
                        onChange={() => handleLanguageToggle(language)}
                        className="rounded"
                      />
                      <span className="text-sm">{language}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Other language..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleLanguageToggle(e.currentTarget.value.trim());
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-xs mt-1 text-muted-foreground">
                    Press Enter to add a language not listed above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cultural Protocols */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 
                className="text-2xl font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                Cultural Protocols and Sharing Preferences
              </h2>
              
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <p 
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  These settings help us respect your cultural protocols and ensure your stories are shared appropriately.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.cultural_protocols.seasonal_restrictions}
                    onChange={(e) => handleNestedChange('cultural_protocols', 'seasonal_restrictions', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Seasonal or Ceremonial Restrictions</span>
                    <p className="text-sm text-muted-foreground">
                      Some of my stories may have seasonal restrictions or require special ceremonial considerations.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.cultural_protocols.gender_specific}
                    onChange={(e) => handleNestedChange('cultural_protocols', 'gender_specific', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Gender-Specific Knowledge</span>
                    <p className="text-sm text-muted-foreground">
                      Some of my stories contain knowledge that should only be shared with specific gender groups.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.cultural_protocols.requires_elder_review}
                    onChange={(e) => handleNestedChange('cultural_protocols', 'requires_elder_review', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Elder or Community Review</span>
                    <p className="text-sm text-muted-foreground">
                      I would prefer community elders or leaders to review my stories before public sharing.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.cultural_protocols.ceremonial_content}
                    onChange={(e) => handleNestedChange('cultural_protocols', 'ceremonial_content', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Sacred or Ceremonial Content</span>
                    <p className="text-sm text-muted-foreground">
                      Some of my stories may contain sacred knowledge that requires special handling and respect.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Communication Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 
                className="text-2xl font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                How We'll Stay Connected
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.contact_preferences.email_updates}
                    onChange={(e) => handleNestedChange('contact_preferences', 'email_updates', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Platform Updates</span>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates about platform features and community news.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.contact_preferences.community_newsletter}
                    onChange={(e) => handleNestedChange('contact_preferences', 'community_newsletter', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Community Newsletter</span>
                    <p className="text-sm text-muted-foreground">
                      Monthly newsletter with community insights, stories, and collective wisdom.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.contact_preferences.story_connections}
                    onChange={(e) => handleNestedChange('contact_preferences', 'story_connections', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Story Connections</span>
                    <p className="text-sm text-muted-foreground">
                      Notifications when your stories connect with others or create community insights.
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.contact_preferences.value_notifications}
                    onChange={(e) => handleNestedChange('contact_preferences', 'value_notifications', e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">Value Creation Notifications</span>
                    <p className="text-sm text-muted-foreground">
                      Alerts when your stories help secure grants, influence policy, or create other community value.
                    </p>
                  </div>
                </label>
              </div>

              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-sunrise)', opacity: 0.1 }}
              >
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  🌟 Ready to Join Our Community
                </p>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  You can always update these preferences later in your profile settings.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="p-3 rounded-lg text-sm mt-6"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'rgb(185, 28, 28)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="text-center">
              <span 
                className="text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Step {step} of 4
              </span>
            </div>
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && (!profileData.full_name || !profileData.community_affiliation)}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary px-6 py-2"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}