/**
 * Story Submission Component
 * 
 * Philosophy: "Share your experience" not "Submit content". This component creates
 * a sacred space for storytellers to share their wisdom while maintaining full
 * sovereignty over their narratives and how they're used.
 */

'use client';

import { useState, useRef } from 'react';
import { useCommunityMember } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { ConsentSettings, CulturalProtocols } from '@/lib/database.types';

interface StorySubmissionData {
  title: string;
  transcript: string;
  submission_method: 'web' | 'whatsapp' | 'sms' | 'voice' | 'video';
  privacy_level: 'private' | 'community' | 'public';
  consent_settings: ConsentSettings;
  cultural_protocols: CulturalProtocols;
  tags: string[];
  location: string;
  geographic_region: string;
  story_themes: string[];
  personal_quotes: string[];
}

const DEFAULT_CONSENT: ConsentSettings = {
  allowAnalysis: false,
  allowCommunitySharing: false,
  allowPublicSharing: false,
  allowResearch: false,
  allowValueCreation: false,
  allowCrossCommunityConnection: false,
  allowPolicyUse: false,
  allowMediaUse: false
};

const DEFAULT_CULTURAL_PROTOCOLS: CulturalProtocols = {
  seasonal_restrictions: false,
  gender_specific: false,
  ceremonial_content: false,
  requires_elder_review: false,
  sharing_protocols: [],
  community_permissions: []
};

const COMMON_THEMES = [
  'Healing', 'Community Strength', 'Cultural Practice', 'Youth Leadership',
  'Elder Wisdom', 'Land Connection', 'Justice', 'Education', 'Family',
  'Tradition', 'Innovation', 'Resilience', 'Connection', 'Identity'
];

interface StorySubmissionProps {
  onSuccess?: () => void;
  initialData?: Partial<StorySubmissionData>;
}

export default function StorySubmission({ onSuccess, initialData }: StorySubmissionProps) {
  const { isSignedIn, communityAffiliation, culturalProtocols } = useCommunityMember();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [storyData, setStoryData] = useState<StorySubmissionData>({
    title: '',
    transcript: '',
    submission_method: 'web',
    privacy_level: 'private',
    consent_settings: { ...DEFAULT_CONSENT },
    cultural_protocols: { 
      ...DEFAULT_CULTURAL_PROTOCOLS,
      // Inherit from user's profile if available
      ...(culturalProtocols || {})
    },
    tags: [],
    location: '',
    geographic_region: '',
    story_themes: [],
    personal_quotes: [],
    ...initialData
  });

  const handleInputChange = (field: keyof StorySubmissionData, value: any) => {
    setStoryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConsentChange = (field: keyof ConsentSettings, value: boolean) => {
    setStoryData(prev => ({
      ...prev,
      consent_settings: {
        ...prev.consent_settings,
        [field]: value
      }
    }));
  };

  const handleCulturalProtocolChange = (field: keyof CulturalProtocols, value: any) => {
    setStoryData(prev => ({
      ...prev,
      cultural_protocols: {
        ...prev.cultural_protocols,
        [field]: value
      }
    }));
  };

  const handleThemeToggle = (theme: string) => {
    setStoryData(prev => ({
      ...prev,
      story_themes: prev.story_themes.includes(theme)
        ? prev.story_themes.filter(t => t !== theme)
        : [...prev.story_themes, theme]
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !storyData.tags.includes(tag.trim())) {
      setStoryData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setStoryData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setAudioRecording(true);

      // Auto-stop after 10 minutes for safety
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setAudioRecording(false);
        }
      }, 600000);
    } catch (error) {
      setError('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopAudioRecording = () => {
    setAudioRecording(false);
    // MediaRecorder stop will be handled by the component managing it
  };

  const uploadAudio = async (audioBlob: Blob): Promise<string | null> => {
    try {
      const fileName = `story-audio-${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('story-audio')
        .upload(fileName, audioBlob);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('story-audio')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Audio upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      if (!storyData.transcript.trim()) {
        setError('Please share your story before submitting.');
        return;
      }

      let audioUrl = null;
      if (audioBlob) {
        audioUrl = await uploadAudio(audioBlob);
      }

      const { data, error } = await supabase
        .from('stories')
        .insert({
          title: storyData.title || 'Untitled Story',
          transcript: storyData.transcript,
          audio_url: audioUrl,
          submission_method: storyData.submission_method,
          privacy_level: storyData.privacy_level,
          consent_settings: storyData.consent_settings,
          cultural_protocols: storyData.cultural_protocols,
          tags: storyData.tags,
          location: storyData.location,
          geographic_region: storyData.geographic_region,
          story_themes: storyData.story_themes,
          personal_quotes: storyData.personal_quotes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setSuccess('Your story has been submitted successfully! Thank you for sharing your wisdom with the community.');
      
      // Reset form
      setStoryData({
        title: '',
        transcript: '',
        submission_method: 'web',
        privacy_level: 'private',
        consent_settings: { ...DEFAULT_CONSENT },
        cultural_protocols: { ...DEFAULT_CULTURAL_PROTOCOLS },
        tags: [],
        location: '',
        geographic_region: '',
        story_themes: [],
        personal_quotes: []
      });
      setCurrentStep(1);
      setAudioBlob(null);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message || 'Failed to submit story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isSignedIn) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-lg mb-6">Please sign in to share your story with our community.</p>
        <a href="/auth/sign-in" className="btn-primary">
          Sign In to Share
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Share Your Experience
        </h1>
        <p className="text-xl" style={{ color: 'var(--color-storm)' }}>
          Your story has power. Share it on your terms, with full control over how it's used.
        </p>
        
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {[1, 2, 3, 4].map(num => (
            <div
              key={num}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: num <= currentStep ? 'var(--primary)' : 'var(--color-elder)'
              }}
            />
          ))}
        </div>
        <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
          Step {currentStep} of 4
        </p>
      </div>

      <div className="story-card p-8">
        {/* Step 1: Your Story */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Your Story</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Story Title (Optional)
              </label>
              <input
                type="text"
                value={storyData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full"
                placeholder="Give your story a title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Experience *
              </label>
              <div className="space-y-3">
                {/* Audio Recording Option */}
                <div className="flex items-center space-x-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                  {!audioRecording ? (
                    <button
                      onClick={startAudioRecording}
                      className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <span>🎤</span>
                      <span>Record Audio</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopAudioRecording}
                      className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <span>⏹️</span>
                      <span>Stop Recording</span>
                    </button>
                  )}
                  
                  {audioBlob && (
                    <div className="text-sm" style={{ color: 'var(--color-storm)' }}>
                      ✓ Audio recorded successfully
                    </div>
                  )}
                </div>

                {/* Text Input */}
                <textarea
                  value={storyData.transcript}
                  onChange={(e) => handleInputChange('transcript', e.target.value)}
                  className="w-full h-40"
                  placeholder="Share your experience, wisdom, or knowledge here. This is your space to tell your story in your own words..."
                  required
                />
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Your story will be preserved exactly as you write it. We honor your language and voice.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={storyData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full"
                placeholder="Where does your story take place?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Story Themes
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_THEMES.map(theme => (
                  <label key={theme} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storyData.story_themes.includes(theme)}
                      onChange={() => handleThemeToggle(theme)}
                      className="rounded"
                    />
                    <span className="text-sm">{theme}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Privacy & Sharing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Privacy & Sharing Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Who can see your story?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy_level"
                      value="private"
                      checked={storyData.privacy_level === 'private'}
                      onChange={(e) => handleInputChange('privacy_level', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">Private</span>
                      <p className="text-sm text-muted-foreground">
                        Only you can see this story. Perfect for personal reflection or when you're not ready to share.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy_level"
                      value="community"
                      checked={storyData.privacy_level === 'community'}
                      onChange={(e) => handleInputChange('privacy_level', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">Community Members</span>
                      <p className="text-sm text-muted-foreground">
                        Share with members of your community ({communityAffiliation}). Builds community wisdom.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy_level"
                      value="public"
                      checked={storyData.privacy_level === 'public'}
                      onChange={(e) => handleInputChange('privacy_level', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">Public</span>
                      <p className="text-sm text-muted-foreground">
                        Share with everyone. Your story can inspire and educate beyond your community.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Consent & Permissions */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">How Can Your Story Be Used?</h2>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                You maintain full control over how your story is used. You can change these permissions at any time.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.consent_settings.allowAnalysis}
                  onChange={(e) => handleConsentChange('allowAnalysis', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">AI Analysis</span>
                  <p className="text-sm text-muted-foreground">
                    Allow respectful AI analysis that preserves your language and identifies community strengths.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.consent_settings.allowCommunitySharing}
                  onChange={(e) => handleConsentChange('allowCommunitySharing', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Community Insights</span>
                  <p className="text-sm text-muted-foreground">
                    Use your story to generate community-wide insights and patterns (anonymized).
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.consent_settings.allowValueCreation}
                  onChange={(e) => handleConsentChange('allowValueCreation', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Value Creation</span>
                  <p className="text-sm text-muted-foreground">
                    Allow your story to help secure grants, influence policy, or create other community value. You'll share in any benefits.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.consent_settings.allowPolicyUse}
                  onChange={(e) => handleConsentChange('allowPolicyUse', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Policy Advocacy</span>
                  <p className="text-sm text-muted-foreground">
                    Use insights from your story to advocate for policy changes that benefit your community.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Cultural Protocols */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Cultural Protocols</h2>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.cultural_protocols.seasonal_restrictions}
                  onChange={(e) => handleCulturalProtocolChange('seasonal_restrictions', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Seasonal or Ceremonial Restrictions</span>
                  <p className="text-sm text-muted-foreground">
                    This story has seasonal restrictions or requires special ceremonial considerations.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.cultural_protocols.gender_specific}
                  onChange={(e) => handleCulturalProtocolChange('gender_specific', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Gender-Specific Knowledge</span>
                  <p className="text-sm text-muted-foreground">
                    This story contains knowledge that should only be shared with specific gender groups.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.cultural_protocols.requires_elder_review}
                  onChange={(e) => handleCulturalProtocolChange('requires_elder_review', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Elder or Community Review</span>
                  <p className="text-sm text-muted-foreground">
                    Request community elders or leaders to review this story before sharing.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={storyData.cultural_protocols.ceremonial_content}
                  onChange={(e) => handleCulturalProtocolChange('ceremonial_content', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium">Sacred or Ceremonial Content</span>
                  <p className="text-sm text-muted-foreground">
                    This story contains sacred knowledge that requires special handling and respect.
                  </p>
                </div>
              </label>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-sunrise)', opacity: 0.1 }}>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                🌟 Ready to Share Your Story
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                Your story will be treated with the respect and protocols you've specified.
              </p>
            </div>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="p-3 rounded-lg text-sm mt-6" style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(185, 28, 28)',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg text-sm mt-6" style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: 'rgb(22, 101, 52)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            {success}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 1 && !storyData.transcript.trim()}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !storyData.transcript.trim()}
              className="btn-primary px-6 py-2"
            >
              {loading ? 'Sharing Story...' : 'Share Your Story'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}