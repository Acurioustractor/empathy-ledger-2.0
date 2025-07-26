/**
 * Storyteller Onboarding Registration Form
 * Self-service registration for new storytellers
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';

interface OnboardingFormData {
  full_name: string;
  email: string;
  role: string;
  organization: string;
  location: string;
  bio: string;
  website: string;
  linkedin_url: string;
  privacy_preferences: {
    profile_visibility: 'public' | 'community' | 'private';
    allow_contact: boolean;
    share_analytics: boolean;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingFormData>({
    full_name: '',
    email: '',
    role: '',
    organization: '',
    location: '',
    bio: '',
    website: '',
    linkedin_url: '',
    privacy_preferences: {
      profile_visibility: 'public',
      allow_contact: true,
      share_analytics: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('privacy_preferences.')) {
      const privacyField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        privacy_preferences: {
          ...prev.privacy_preferences,
          [privacyField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/register-storyteller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Existing user - redirect to their admin page
          router.push(result.redirect_url);
          return;
        }
        throw new Error(result.error || 'Registration failed');
      }

      // Success - redirect to admin dashboard
      router.push(result.onboarding.admin_url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStepValid = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return formData.full_name.trim() !== '' && formData.email.trim() !== '';
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Privacy preferences have defaults
      default:
        return false;
    }
  };

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.header}>
        <h1>Join the Empathy Ledger Community</h1>
        <p>Share your story. Build authentic professional relationships.</p>
        <div className={styles.progressBar}>
          <div 
            className={styles.progress} 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <span className={styles.stepIndicator}>Step {step} of 3</span>
      </div>

      <div className={styles.formContainer}>
        {step === 1 && (
          <div className={styles.step}>
            <h2>Basic Information</h2>
            <p>Let's start with the essentials</p>

            <div className={styles.formGroup}>
              <label htmlFor="full_name">Full Name *</label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">Professional Role</label>
              <input
                id="role"
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="e.g., Midwife, Teacher, Community Organizer"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="organization">Organization</label>
              <input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="Where do you work or volunteer?"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h2>Tell Us More</h2>
            <p>Help the community understand your background</p>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Share a brief overview of your background and what drives your work..."
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="linkedin_url">LinkedIn Profile</label>
              <input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.step}>
            <h2>Privacy Preferences</h2>
            <p>Choose how you want to share your profile and stories</p>

            <div className={styles.formGroup}>
              <label>Profile Visibility</label>
              <select
                value={formData.privacy_preferences.profile_visibility}
                onChange={(e) => handleInputChange('privacy_preferences.profile_visibility', e.target.value)}
              >
                <option value="public">Public - Anyone can view</option>
                <option value="community">Community - Members only</option>
                <option value="private">Private - Invitation only</option>
              </select>
            </div>

            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.privacy_preferences.allow_contact}
                  onChange={(e) => handleInputChange('privacy_preferences.allow_contact', e.target.checked)}
                />
                Allow community members to contact me
              </label>
            </div>

            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.privacy_preferences.share_analytics}
                  onChange={(e) => handleInputChange('privacy_preferences.share_analytics', e.target.checked)}
                />
                Share anonymized analytics to improve the platform
              </label>
            </div>

            <div className={styles.infoBox}>
              <h4>What happens next?</h4>
              <ul>
                <li>Complete your profile setup</li>
                <li>Create your first story (15 mins)</li>
                <li>Explore the community</li>
                <li>Start building authentic professional relationships</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.buttonGroup}>
          {step > 1 && (
            <button 
              onClick={prevStep}
              className={styles.secondaryButton}
              disabled={loading}
            >
              Back
            </button>
          )}
          
          {step < 3 && (
            <button 
              onClick={nextStep}
              className={styles.primaryButton}
              disabled={!isStepValid(step)}
            >
              Continue
            </button>
          )}
          
          {step === 3 && (
            <button 
              onClick={handleSubmit}
              className={styles.primaryButton}
              disabled={loading || !isStepValid(step)}
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <p>Already have an account? <a href="/storytellers">Browse storytellers</a></p>
      </div>
    </div>
  );
}