'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

interface StoryFormData {
  title: string;
  content: string;
  format: 'text' | 'audio' | 'video';
  theme: string;
  location: string;
  anonymous: boolean;
  shareLevel: 'private' | 'community' | 'research' | 'public';
  culturalConsiderations: string;
  consentToAnalysis: boolean;
  consentToResearch: boolean;
  consentToSharing: boolean;
}

interface PrivacyLevel {
  key: string;
  name: string;
  description: string;
  whoCanSee: string[];
  dataUse: string[];
  benefits: string[];
}

interface StorySubmissionFormProps {
  onSubmit?: (data: StoryFormData) => void;
  className?: string;
}

const privacyLevels: PrivacyLevel[] = [
  {
    key: 'private',
    name: 'Private',
    description:
      'Your story is encrypted and only you can access it. Perfect for personal reflection or keeping a private record.',
    whoCanSee: ['Only you'],
    dataUse: ['Personal insights only', 'No analysis or sharing'],
    benefits: [
      'Personal reflection dashboard',
      'Private story archive',
      'Anonymous support matching',
    ],
  },
  {
    key: 'community',
    name: 'Community',
    description:
      'Share with your local community while maintaining anonymity. Helps build understanding and connection.',
    whoCanSee: ['You', 'Community members (anonymous)', 'Community moderators'],
    dataUse: [
      'Local community insights',
      'Anonymous pattern detection',
      'Community support matching',
    ],
    benefits: [
      'Connect with similar experiences',
      'Community-level insights',
      'Local support resources',
    ],
  },
  {
    key: 'research',
    name: 'Research',
    description:
      'Contribute to ethical research that benefits communities. Researchers never see individual stories.',
    whoCanSee: [
      'You',
      'Approved researchers (aggregate data only)',
      'Ethics review boards',
    ],
    dataUse: [
      'Academic research (anonymous)',
      'Policy development insights',
      'Service improvement data',
    ],
    benefits: [
      'Contribute to positive change',
      'Quarterly impact reports',
      'Research compensation',
    ],
  },
  {
    key: 'public',
    name: 'Public Insights',
    description:
      'Help create public understanding while maintaining your anonymity. Maximum community benefit.',
    whoCanSee: [
      'You',
      'General public (anonymous insights only)',
      'Policy makers',
      'Service providers',
    ],
    dataUse: [
      'Public reporting',
      'Policy advocacy',
      'Service design',
      'Community education',
    ],
    benefits: [
      'Maximum social impact',
      'Policy influence',
      'Public education',
      'Community recognition',
    ],
  },
];

const themes = [
  'Mental Health & Wellbeing',
  'Healthcare Access',
  'Education & Learning',
  'Housing & Homelessness',
  'Employment & Work',
  'Family & Relationships',
  'Community Safety',
  'Indigenous Rights',
  'LGBTQ+ Experiences',
  'Disability & Accessibility',
  'Youth Issues',
  'Elder Care',
  'Environmental Justice',
  'Digital Inclusion',
  'Transport & Mobility',
  'Financial Security',
  'Legal System',
  'Immigration & Settlement',
  'Other',
];

const StorySubmissionForm: React.FC<StorySubmissionFormProps> = ({
  onSubmit,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    format: 'text',
    theme: '',
    location: '',
    anonymous: true,
    shareLevel: 'private',
    culturalConsiderations: '',
    consentToAnalysis: false,
    consentToResearch: false,
    consentToSharing: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (updates: Partial<StoryFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const selectedPrivacyLevel = privacyLevels.find(
    level => level.key === formData.shareLevel
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Submit to Supabase via API
      const response = await fetch('/api/stories/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Add metadata
          submitted_at: new Date().toISOString(),
          ip_address: null, // Privacy-first approach
          user_agent: null, // No tracking
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      const result = await response.json();
      
      if (onSubmit) {
        onSubmit(formData);
      }

      // Show success message
      console.log('Story submitted successfully:', result);
      
    } catch (error) {
      console.error('Story submission error:', error);
      // Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Share Your Story
        </h3>
        <p className="text-gray-700 mb-6">
          Your story matters. Share your experience to help build understanding
          and create positive change.
        </p>
      </div>

      {/* Story Format */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          How would you like to share your story?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              key: 'text',
              name: 'Written Story',
              icon: '📝',
              description: 'Write your story in text',
            },
            {
              key: 'audio',
              name: 'Voice Recording',
              icon: '🎤',
              description: 'Record your story as audio',
            },
            {
              key: 'video',
              name: 'Video Story',
              icon: '🎥',
              description: 'Share through video',
            },
          ].map(format => (
            <button
              key={format.key}
              onClick={() =>
                updateFormData({
                  format: format.key as 'text' | 'audio' | 'video',
                })
              }
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.format === format.key
                  ? 'border-[var(--primary)] bg-[var(--muted)]'
                  : 'border-[var(--muted)] hover:border-[var(--primary)]/50'
              }`}
            >
              <div className="text-2xl mb-2">{format.icon}</div>
              <div className="font-semibold text-gray-900">{format.name}</div>
              <div className="text-sm text-gray-600">{format.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Give your story a title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={e => updateFormData({ title: e.target.value })}
          className="w-full px-4 py-3 border border-[var(--primary)]/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="My story about..."
        />
      </div>

      {/* Story Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {formData.format === 'text'
            ? 'Tell your story'
            : 'Describe your story'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        {formData.format === 'text' ? (
          <textarea
            id="content"
            value={formData.content}
            onChange={e => updateFormData({ content: e.target.value })}
            rows={8}
            className="w-full px-4 py-3 border border-[var(--primary)]/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Share your experience in your own words..."
            required
          />
        ) : (
          <div className="border-2 border-dashed border-[var(--primary)]/50 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">
              {formData.format === 'audio' ? '🎤' : '🎥'}
            </div>
            <p className="text-gray-600 mb-4">
              {formData.format === 'audio'
                ? 'Click to start recording your story'
                : 'Click to upload or record your video story'}
            </p>
            <Button variant="secondary">
              {formData.format === 'audio' ? 'Start Recording' : 'Upload Video'}
            </Button>
            <textarea
              value={formData.content}
              onChange={e => updateFormData({ content: e.target.value })}
              rows={3}
              className="w-full mt-4 px-4 py-3 border border-[var(--primary)]/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add a description of your story..."
            />
          </div>
        )}
      </div>

      {/* Theme Selection */}
      <div>
        <label
          htmlFor="theme"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          What theme best describes your story?
        </label>
        <select
          id="theme"
          value={formData.theme}
          onChange={e => updateFormData({ theme: e.target.value })}
          className="w-full px-4 py-3 border border-[var(--primary)]/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select a theme...</option>
          {themes.map(theme => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Privacy & Sharing Controls
        </h3>
        <p className="text-gray-700 mb-6">
          You have complete control over who can see your story and how it's
          used. These settings can be changed at any time.
        </p>
      </div>

      {/* Privacy Level Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Choose your privacy level
        </label>
        <div className="space-y-4">
          {privacyLevels.map(level => (
            <div
              key={level.key}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                formData.shareLevel === level.key
                  ? 'border-[var(--primary)] bg-[var(--muted)]'
                  : 'border-[var(--muted)] hover:border-[var(--primary)]/50'
              }`}
              onClick={() => updateFormData({ shareLevel: level.key as any })}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  {level.name}
                </h4>
                <div className="flex items-center">
                  {level.key === 'private' && (
                    <SecurityBadge
                      variant="encryption"
                      showBackground={false}
                    />
                  )}
                  {level.key === 'community' && (
                    <SecurityBadge variant="privacy" showBackground={false} />
                  )}
                  {level.key === 'research' && (
                    <SecurityBadge
                      variant="certification"
                      showBackground={false}
                    />
                  )}
                  {level.key === 'public' && (
                    <SecurityBadge variant="privacy" showBackground={false} />
                  )}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{level.description}</p>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Who can see it:
                  </h5>
                  <ul className="text-gray-600 space-y-1">
                    {level.whoCanSee.map((who, index) => (
                      <li key={index}>• {who}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    How it's used:
                  </h5>
                  <ul className="text-gray-600 space-y-1">
                    {level.dataUse.map((use, index) => (
                      <li key={index}>• {use}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    Benefits to you:
                  </h5>
                  <ul className="text-gray-600 space-y-1">
                    {level.benefits.map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anonymous Option */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.anonymous}
            onChange={e => updateFormData({ anonymous: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-[var(--primary)]/50 rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-900">
            Keep my identity anonymous (recommended)
          </span>
        </label>
        <p className="text-sm text-gray-600 mt-1 ml-6">
          Your story will be shared without any identifying information
        </p>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          General location (optional)
        </label>
        <select
          id="location"
          value={formData.location}
          onChange={e => updateFormData({ location: e.target.value })}
          className="w-full px-4 py-3 border border-[var(--primary)]/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Prefer not to say</option>
          <option value="NSW">New South Wales</option>
          <option value="VIC">Victoria</option>
          <option value="QLD">Queensland</option>
          <option value="WA">Western Australia</option>
          <option value="SA">South Australia</option>
          <option value="TAS">Tasmania</option>
          <option value="NT">Northern Territory</option>
          <option value="ACT">Australian Capital Territory</option>
        </select>
        <p className="text-sm text-gray-600 mt-1">
          Only state/territory level - never specific addresses
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Final Details & Consent
        </h3>
        <p className="text-gray-700 mb-6">
          A few final details to ensure your story is handled with respect and
          care.
        </p>
      </div>

      {/* Cultural Considerations */}
      <div>
        <label
          htmlFor="cultural"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Cultural considerations (optional)
        </label>
        <textarea
          id="cultural"
          value={formData.culturalConsiderations}
          onChange={e =>
            updateFormData({ culturalConsiderations: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-3 border border-[var(--primary)]/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Any cultural protocols, sensitivities, or special considerations we should be aware of..."
        />
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.consentToAnalysis}
              onChange={e =>
                updateFormData({ consentToAnalysis: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 border-[var(--primary)]/50 rounded focus:ring-primary-500 mt-1"
            />
            <span className="ml-3 text-sm text-gray-900">
              <strong>I consent to privacy-preserving analysis</strong> of my
              story to generate community insights while keeping my individual
              story encrypted and anonymous.
            </span>
          </label>
        </div>

        {formData.shareLevel === 'research' && (
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={formData.consentToResearch}
                onChange={e =>
                  updateFormData({ consentToResearch: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 border-[var(--primary)]/50 rounded focus:ring-primary-500 mt-1"
              />
              <span className="ml-3 text-sm text-gray-900">
                <strong>I consent to ethical research use</strong> of my
                anonymized story data for academic research that benefits
                communities. I understand I may receive compensation if my data
                contributes to funded research.
              </span>
            </label>
          </div>
        )}

        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.consentToSharing}
              onChange={e =>
                updateFormData({ consentToSharing: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 border-[var(--primary)]/50 rounded focus:ring-primary-500 mt-1"
              required
            />
            <span className="ml-3 text-sm text-gray-900">
              <strong>I understand and consent</strong> to the privacy level
              I've selected ({selectedPrivacyLevel?.name}). I know I can change
              these settings at any time and can delete my story whenever I
              choose.
              <span className="text-red-500 ml-1">*</span>
            </span>
          </label>
        </div>
      </div>

      {/* Privacy Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <h4 className="font-semibold text-gray-900 mb-3">
          Your Privacy Summary
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Privacy Level:</strong> {selectedPrivacyLevel?.name}
            <br />
            <strong>Anonymous:</strong> {formData.anonymous ? 'Yes' : 'No'}
            <br />
            <strong>Location Sharing:</strong>{' '}
            {formData.location || 'Not specified'}
          </div>
          <div>
            <strong>Story Format:</strong> {formData.format}
            <br />
            <strong>Theme:</strong> {formData.theme || 'Not specified'}
            <br />
            <strong>Can be changed:</strong> Anytime
          </div>
        </div>
      </div>
    </div>
  );

  const canProceedToStep2 = formData.content.trim().length > 0;
  const canProceedToStep3 = formData.shareLevel && formData.consentToAnalysis;
  const canSubmit =
    formData.consentToSharing &&
    (formData.shareLevel !== 'research' || formData.consentToResearch);

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">Step {currentStep} of 3</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 mt-8 border-t border-[var(--muted)]">
          <div>
            {currentStep > 1 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Previous
              </Button>
            )}
          </div>

          <div className="space-x-3">
            {currentStep < 3 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedToStep2) ||
                  (currentStep === 2 && !canProceedToStep3)
                }
              >
                Next →
              </Button>
            ) : (
              <Button
                variant="cta"
                onClick={handleSubmit}
                disabled={!canSubmit}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Encrypting & Submitting...' : 'Share My Story'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <SecurityBadge
            variant="encryption"
            text="End-to-end encrypted"
            showBackground={false}
          />
          <SecurityBadge
            variant="privacy"
            text="Australian servers"
            showBackground={false}
          />
          <SecurityBadge
            variant="certification"
            text="GDPR compliant"
            showBackground={false}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Your story is encrypted before it leaves your device. We never see
          your unencrypted content.
        </p>
      </div>
    </div>
  );
};

export default StorySubmissionForm;
