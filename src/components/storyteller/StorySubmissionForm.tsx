'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitStory, type StorySubmission, type StoryCategory, type PrivacyLevel } from '@/lib/supabase-stories';
import { getCurrentSession, getUserCommunities } from '@/lib/supabase-auth';

interface FormData extends StorySubmission {
  audioRecording?: Blob;
  isRecording?: boolean;
}

const CATEGORIES: { value: StoryCategory; label: string; description: string }[] = [
  { value: 'healthcare', label: 'Healthcare', description: 'Medical care, mental health, wellness services' },
  { value: 'education', label: 'Education', description: 'Schools, learning, educational access' },
  { value: 'housing', label: 'Housing', description: 'Housing affordability, homelessness, accommodation' },
  { value: 'youth', label: 'Youth', description: 'Young people, youth services, coming of age' },
  { value: 'elder_care', label: 'Elder Care', description: 'Aged care, seniors, intergenerational support' },
  { value: 'policy', label: 'Policy', description: 'Government services, policy impact, civic engagement' },
  { value: 'community', label: 'Community', description: 'Community connections, local initiatives' },
  { value: 'environment', label: 'Environment', description: 'Environmental issues, climate impact' },
  { value: 'employment', label: 'Employment', description: 'Work, careers, economic challenges' },
  { value: 'social_services', label: 'Social Services', description: 'Support services, welfare, assistance programs' }
];

const PRIVACY_LEVELS: { value: PrivacyLevel; label: string; description: string }[] = [
  { value: 'private', label: 'Private', description: 'Only you can see this story' },
  { value: 'community', label: 'Community', description: 'Members of your communities can see this' },
  { value: 'organization', label: 'Organization', description: 'Your organization members can see this' },
  { value: 'public', label: 'Public', description: 'Anyone can see this story' }
];

const SUGGESTED_THEMES: { [key in StoryCategory]: string[] } = {
  healthcare: ['access to care', 'mental health', 'preventive care', 'patient advocacy', 'healthcare costs'],
  education: ['school quality', 'educational equity', 'learning disabilities', 'teacher support', 'school funding'],
  housing: ['affordable housing', 'homelessness', 'rental market', 'housing quality', 'community displacement'],
  youth: ['youth engagement', 'mentorship', 'education pathways', 'mental health', 'employment opportunities'],
  elder_care: ['aged care quality', 'social isolation', 'healthcare access', 'family support', 'dignity in aging'],
  policy: ['government services', 'policy implementation', 'community consultation', 'civic participation'],
  community: ['community connections', 'local initiatives', 'neighborhood safety', 'cultural celebration'],
  environment: ['climate change', 'environmental justice', 'sustainable living', 'local environment'],
  employment: ['job security', 'workplace conditions', 'career development', 'unemployment', 'work-life balance'],
  social_services: ['service access', 'support quality', 'bureaucratic challenges', 'social workers', 'eligibility']
};

export default function StorySubmissionForm() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: 'community',
    themes: [],
    tags: [],
    privacy_level: 'community',
    can_be_shared: true,
    allow_research_use: false,
    allow_ai_analysis: true,
    community_id: undefined,
    contributor_age_range: undefined,
    contributor_location: undefined,
    audio_file: undefined,
    video_file: undefined,
    image_files: undefined,
    audioRecording: undefined,
    isRecording: false
  });

  // Audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // File upload refs
  const audioFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await getCurrentSession();
      if (session.user) {
        setUser(session.user);
        const { communities: userCommunities } = await getUserCommunities(session.user.id);
        setCommunities(userCommunities);
        
        // Set default community if user has only one
        if (userCommunities.length === 1) {
          setFormData(prev => ({ ...prev, community_id: userCommunities[0].communities.id }));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThemeToggle = (theme: string) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes?.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...(prev.themes || []), theme]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim().length >= 3 && formData.content.trim().length >= 10;
      case 2:
        return !!formData.category;
      case 3:
        return !!formData.privacy_level;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setFormData(prev => ({ ...prev, audioRecording: audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setFormData(prev => ({ ...prev, isRecording: true }));
      
      // Start timer
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && formData.isRecording) {
      mediaRecorderRef.current.stop();
      setFormData(prev => ({ ...prev, isRecording: false }));
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const clearRecording = () => {
    setFormData(prev => ({ ...prev, audioRecording: undefined }));
    setRecordingTime(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to submit your story');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare submission data
      const submissionData: StorySubmission = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        themes: formData.themes,
        tags: formData.tags,
        privacy_level: formData.privacy_level,
        can_be_shared: formData.can_be_shared,
        allow_research_use: formData.allow_research_use,
        allow_ai_analysis: formData.allow_ai_analysis,
        community_id: formData.community_id,
        contributor_age_range: formData.contributor_age_range,
        contributor_location: formData.contributor_location,
        audio_file: formData.audioRecording ? new File([formData.audioRecording], 'recording.wav', { type: 'audio/wav' }) : formData.audio_file,
        video_file: formData.video_file,
        image_files: formData.image_files
      };

      const { story, error } = await submitStory(user.id, submissionData);

      if (error) {
        throw error;
      }

      // Success! Redirect to story or dashboard
      router.push('/dashboard?submitted=true');
      
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('There was an error submitting your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extralight text-gray-900 mb-4">
            Please sign in to share your story
          </h1>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress indicator */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="content-container py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extralight text-gray-900">Share Your Story</h1>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-light ${
                    step === currentStep
                      ? 'bg-gray-900 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-spacing">
        <div className="max-w-4xl mx-auto px-8">
          {/* Step 1: Story Content */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extralight text-gray-900 mb-4">Tell your story</h2>
                <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                  Share your experience in your own words. You can write, record audio, or upload a video.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-3">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Give your story a meaningful title..."
                  className="w-full p-4 border border-gray-200 rounded-2xl text-lg font-light focus:border-gray-400 focus:outline-none transition-colors"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-2 font-light">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-3">
                  Your Story *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Share your experience here. What happened? How did it affect you? What would you want others to know?"
                  rows={12}
                  className="w-full p-4 border border-gray-200 rounded-2xl text-base font-light leading-relaxed focus:border-gray-400 focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-2 font-light">
                  Write freely - your story matters
                </p>
              </div>

              {/* Audio Recording */}
              <div className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-lg font-normal text-gray-900 mb-4">Add Audio (Optional)</h3>
                <p className="text-gray-600 font-light mb-6">
                  Record your story or upload an audio file to add a personal touch.
                </p>
                
                <div className="space-y-4">
                  {/* Recording Controls */}
                  <div className="flex items-center gap-4">
                    {!formData.audioRecording && !formData.isRecording && (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="bg-red-500 text-white px-6 py-3 rounded-full font-light hover:bg-red-600 smooth-transition flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                        Start Recording
                      </button>
                    )}

                    {formData.isRecording && (
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="bg-gray-900 text-white px-6 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition"
                        >
                          Stop Recording
                        </button>
                        <div className="flex items-center gap-2 text-red-500">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                        </div>
                      </div>
                    )}

                    {formData.audioRecording && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          <span className="text-sm font-light">Recording saved ({formatTime(recordingTime)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearRecording}
                          className="text-red-500 hover:text-red-700 smooth-transition text-sm font-light"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 font-light mb-3">Or upload an audio file:</p>
                    <input
                      ref={audioFileRef}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleInputChange('audio_file', e.target.files?.[0])}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => audioFileRef.current?.click()}
                      className="text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm font-light hover:bg-gray-50 smooth-transition"
                    >
                      Choose Audio File
                    </button>
                    {formData.audio_file && (
                      <p className="text-sm text-gray-600 mt-2 font-light">
                        Selected: {formData.audio_file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(1)}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Category & Themes */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extralight text-gray-900 mb-4">Categorize your story</h2>
                <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                  Help others find and connect with your experience by choosing the most relevant category and themes.
                </p>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-6">
                  Story Category *
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  {CATEGORIES.map((category) => (
                    <label
                      key={category.value}
                      className={`block p-4 border-2 rounded-2xl cursor-pointer hover:border-gray-300 smooth-transition ${
                        formData.category === category.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={formData.category === category.value}
                        onChange={(e) => handleInputChange('category', e.target.value as StoryCategory)}
                        className="sr-only"
                      />
                      <div className="font-normal text-gray-900 mb-1">{category.label}</div>
                      <div className="text-sm text-gray-600 font-light">{category.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              {formData.category && (
                <div>
                  <label className="block text-sm font-normal text-gray-900 mb-6">
                    Themes (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {SUGGESTED_THEMES[formData.category].map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => handleThemeToggle(theme)}
                        className={`px-4 py-2 rounded-full text-sm font-light smooth-transition ${
                          formData.themes?.includes(theme)
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-gray-600 px-8 py-3 rounded-full font-light hover:bg-gray-50 smooth-transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(2)}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Privacy & Permissions */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extralight text-gray-900 mb-4">Privacy settings</h2>
                <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                  You have complete control over who can see your story and how it can be used.
                </p>
              </div>

              {/* Privacy Level */}
              <div>
                <label className="block text-sm font-normal text-gray-900 mb-6">
                  Who can see your story? *
                </label>
                <div className="space-y-4">
                  {PRIVACY_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`block p-4 border-2 rounded-2xl cursor-pointer hover:border-gray-300 smooth-transition ${
                        formData.privacy_level === level.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="privacy_level"
                        value={level.value}
                        checked={formData.privacy_level === level.value}
                        onChange={(e) => handleInputChange('privacy_level', e.target.value as PrivacyLevel)}
                        className="sr-only"
                      />
                      <div className="font-normal text-gray-900 mb-1">{level.label}</div>
                      <div className="text-sm text-gray-600 font-light">{level.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Permissions */}
              <div className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-lg font-normal text-gray-900 mb-6">Additional permissions</h3>
                <div className="space-y-6">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.can_be_shared}
                      onChange={(e) => handleInputChange('can_be_shared', e.target.checked)}
                      className="mt-1 w-5 h-5 text-gray-900 rounded border-gray-300 focus:ring-gray-500"
                    />
                    <div>
                      <div className="font-normal text-gray-900">Allow sharing</div>
                      <div className="text-sm text-gray-600 font-light">
                        Others can share your story (with attribution) to spread awareness
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_research_use}
                      onChange={(e) => handleInputChange('allow_research_use', e.target.checked)}
                      className="mt-1 w-5 h-5 text-gray-900 rounded border-gray-300 focus:ring-gray-500"
                    />
                    <div>
                      <div className="font-normal text-gray-900">Allow research use</div>
                      <div className="text-sm text-gray-600 font-light">
                        Researchers can include your anonymized story in studies (you'll be compensated)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_ai_analysis}
                      onChange={(e) => handleInputChange('allow_ai_analysis', e.target.checked)}
                      className="mt-1 w-5 h-5 text-gray-900 rounded border-gray-300 focus:ring-gray-500"
                    />
                    <div>
                      <div className="font-normal text-gray-900">Allow AI analysis</div>
                      <div className="text-sm text-gray-600 font-light">
                        Help generate community insights through privacy-preserving AI analysis
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-gray-600 px-8 py-3 rounded-full font-light hover:bg-gray-50 smooth-transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(3)}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extralight text-gray-900 mb-4">Review your story</h2>
                <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
                  Take a moment to review your story before sharing it with the community.
                </p>
              </div>

              {/* Story Preview */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-normal text-gray-900">{formData.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-light">
                    {CATEGORIES.find(c => c.value === formData.category)?.label}
                  </span>
                </div>
                
                <div className="prose prose-lg max-w-none mb-6">
                  <p className="text-gray-700 font-light leading-relaxed whitespace-pre-wrap">
                    {formData.content}
                  </p>
                </div>

                {formData.themes && formData.themes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {formData.themes.map((theme) => (
                      <span key={theme} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-light">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 font-light">
                    <span>Privacy: {PRIVACY_LEVELS.find(p => p.value === formData.privacy_level)?.label}</span>
                    <div className="flex items-center gap-4">
                      {formData.audioRecording && <span>📹 Audio included</span>}
                      {formData.video_file && <span>🎥 Video included</span>}
                      {formData.image_files && <span>📷 Images included</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Consent */}
              <div className="bg-blue-50 rounded-3xl p-8">
                <h3 className="text-lg font-normal text-gray-900 mb-4">Before you submit</h3>
                <ul className="space-y-2 text-sm text-gray-700 font-light">
                  <li>• Your story will be reviewed by community moderators before being published</li>
                  <li>• You can edit or delete your story at any time from your dashboard</li>
                  <li>• You retain full ownership and control of your story</li>
                  <li>• Your privacy settings can be changed anytime</li>
                </ul>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-gray-600 px-8 py-3 rounded-full font-light hover:bg-gray-50 smooth-transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Story'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}