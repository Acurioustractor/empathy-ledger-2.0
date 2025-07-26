/**
 * Story Creation Wizard for Storytellers
 * Guided story creation process with AI assistance
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './create-story.module.css';

interface StoryData {
  title: string;
  story_type: 'primary' | 'supporting' | 'case_study';
  content: string;
  themes: string[];
  privacy_level: 'public' | 'community' | 'private';
  content_warnings?: string[];
  collaboration_opportunities?: string[];
  professional_outcomes?: string[];
}

interface Storyteller {
  id: string;
  full_name: string;
  role: string;
  organization?: string;
}

export default function CreateStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [storyteller, setStoryteller] = useState<Storyteller | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolve params first
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const [storyData, setStoryData] = useState<StoryData>({
    title: '',
    story_type: 'primary',
    content: '',
    themes: [],
    privacy_level: 'public',
    content_warnings: [],
    collaboration_opportunities: [],
    professional_outcomes: []
  });

  // Load storyteller info
  useEffect(() => {
    if (!resolvedParams?.id) return;

    const loadStoryteller = async () => {
      try {
        const response = await fetch(`/api/storytellers/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setStoryteller(data);
        }
      } catch (err) {
        console.error('Failed to load storyteller:', err);
      }
    };

    loadStoryteller();
  }, [resolvedParams?.id]);

  const handleInputChange = (field: string, value: any) => {
    setStoryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: string, value: string) => {
    if (!value.trim()) return;
    setStoryData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof StoryData] as string[]), value.trim()]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setStoryData(prev => ({
      ...prev,
      [field]: (prev[field as keyof StoryData] as string[]).filter((_, i) => i !== index)
    }));
  };

  const generateAISuggestions = async () => {
    if (!storyData.content || storyData.content.length < 100) {
      setError('Please write at least 100 characters for AI analysis');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai-analysis/suggest-themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: storyData.content,
          storyteller_role: storyteller?.role 
        })
      });

      if (response.ok) {
        const suggestions = await response.json();
        setStoryData(prev => ({
          ...prev,
          themes: [...new Set([...prev.themes, ...suggestions.themes])],
          professional_outcomes: [...new Set([...prev.professional_outcomes, ...suggestions.professional_outcomes])]
        }));
      }
    } catch (err) {
      console.warn('AI suggestions unavailable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!resolvedParams?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/storytellers/create-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyteller_id: resolvedParams.id,
          ...storyData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create story');
      }

      // Success - redirect to the new story
      router.push(`/stories/${result.story.id}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStepValid = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return storyData.title.trim() !== '' && storyData.story_type !== '';
      case 2:
        return storyData.content.length >= 200;
      case 3:
        return storyData.themes.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!storyteller) {
    return <div className={styles.loading}>Loading storyteller information...</div>;
  }

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.header}>
        <h1>Create Your Story</h1>
        <p>Welcome, {storyteller.full_name}! Let's share your meaningful experience.</p>
        <div className={styles.progressBar}>
          <div 
            className={styles.progress} 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <span className={styles.stepIndicator}>Step {step} of 4</span>
      </div>

      <div className={styles.formContainer}>
        {step === 1 && (
          <div className={styles.step}>
            <h2>Story Basics</h2>
            <p>Give your story a compelling title and choose its type</p>

            <div className={styles.formGroup}>
              <label htmlFor="title">Story Title *</label>
              <input
                id="title"
                type="text"
                value={storyData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., The Day I Learned to Listen: A Midwife's Journey"
                maxLength={100}
              />
              <span className={styles.charCount}>{storyData.title.length}/100</span>
            </div>

            <div className={styles.formGroup}>
              <label>Story Type *</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="primary"
                    checked={storyData.story_type === 'primary'}
                    onChange={(e) => handleInputChange('story_type', e.target.value)}
                  />
                  <div className={styles.radioContent}>
                    <strong>Primary Story</strong>
                    <p>A foundational experience that shaped your professional journey</p>
                  </div>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="supporting"
                    checked={storyData.story_type === 'supporting'}
                    onChange={(e) => handleInputChange('story_type', e.target.value)}
                  />
                  <div className={styles.radioContent}>
                    <strong>Supporting Story</strong>
                    <p>A specific experience that demonstrates your expertise or values</p>
                  </div>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="case_study"
                    checked={storyData.story_type === 'case_study'}
                    onChange={(e) => handleInputChange('story_type', e.target.value)}
                  />
                  <div className={styles.radioContent}>
                    <strong>Case Study</strong>
                    <p>A detailed analysis of a project, challenge, or solution</p>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.tipBox}>
              <h4>💡 Writing Tips</h4>
              <ul>
                <li>Choose a title that captures the emotional core of your story</li>
                <li>Primary stories work best for first-time storytellers</li>
                <li>Think about a moment that changed how you approach your work</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h2>Tell Your Story</h2>
            <p>Share the experience in your own words. Be authentic and specific.</p>

            <div className={styles.formGroup}>
              <label htmlFor="content">Your Story *</label>
              <textarea
                id="content"
                value={storyData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Start with the moment that mattered most. What happened? How did it feel? What did you learn? How did it change your approach to your work?"
                rows={12}
                minLength={200}
              />
              <span className={styles.charCount}>
                {storyData.content.length} characters (minimum 200)
              </span>
            </div>

            <div className={styles.actionButton}>
              <button 
                onClick={generateAISuggestions}
                disabled={loading || storyData.content.length < 100}
                className={styles.aiButton}
              >
                {loading ? 'Analyzing...' : '✨ Get AI Suggestions'}
              </button>
              <p>Our AI can suggest themes and outcomes based on your story</p>
            </div>

            <div className={styles.tipBox}>
              <h4>✍️ Storytelling Guidelines</h4>
              <ul>
                <li>Use concrete details and specific moments</li>
                <li>Focus on what you learned, not just what happened</li>
                <li>Include how this experience shaped your professional approach</li>
                <li>Write in your authentic voice - this is your story</li>
              </ul>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.step}>
            <h2>Themes & Insights</h2>
            <p>Help others understand the key themes and professional insights from your story</p>

            <div className={styles.formGroup}>
              <label>Themes *</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  placeholder="Add a theme (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayFieldChange('themes', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className={styles.tags}>
                  {storyData.themes.map((theme, index) => (
                    <span key={index} className={styles.tag}>
                      {theme}
                      <button 
                        onClick={() => removeArrayItem('themes', index)}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Professional Outcomes</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  placeholder="What professional skills or insights did you gain? (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayFieldChange('professional_outcomes', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className={styles.tags}>
                  {storyData.professional_outcomes.map((outcome, index) => (
                    <span key={index} className={styles.tag}>
                      {outcome}
                      <button 
                        onClick={() => removeArrayItem('professional_outcomes', index)}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Collaboration Opportunities</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  placeholder="What kinds of collaboration does this story suggest? (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayFieldChange('collaboration_opportunities', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className={styles.tags}>
                  {storyData.collaboration_opportunities.map((opp, index) => (
                    <span key={index} className={styles.tag}>
                      {opp}
                      <button 
                        onClick={() => removeArrayItem('collaboration_opportunities', index)}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.step}>
            <h2>Privacy & Publishing</h2>
            <p>Choose how you want to share your story with the community</p>

            <div className={styles.formGroup}>
              <label>Privacy Level *</label>
              <select
                value={storyData.privacy_level}
                onChange={(e) => handleInputChange('privacy_level', e.target.value)}
              >
                <option value="public">Public - Anyone can read</option>
                <option value="community">Community - Members only</option>
                <option value="private">Private - Invitation only</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Content Warnings (optional)</label>
              <div className={styles.tagInput}>
                <input
                  type="text"
                  placeholder="Add content warning if needed (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayFieldChange('content_warnings', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className={styles.tags}>
                  {storyData.content_warnings?.map((warning, index) => (
                    <span key={index} className={styles.tag}>
                      {warning}
                      <button 
                        onClick={() => removeArrayItem('content_warnings', index)}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.previewBox}>
              <h4>Story Preview</h4>
              <div className={styles.preview}>
                <h3>{storyData.title}</h3>
                <p><strong>By:</strong> {storyteller.full_name}</p>
                <p><strong>Type:</strong> {storyData.story_type}</p>
                <p><strong>Themes:</strong> {storyData.themes.join(', ')}</p>
                <div className={styles.contentPreview}>
                  {storyData.content.substring(0, 200)}...
                </div>
              </div>
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
          
          {step < 4 && (
            <button 
              onClick={nextStep}
              className={styles.primaryButton}
              disabled={!isStepValid(step)}
            >
              Continue
            </button>
          )}
          
          {step === 4 && (
            <button 
              onClick={handleSubmit}
              className={styles.primaryButton}
              disabled={loading || !isStepValid(step)}
            >
              {loading ? 'Publishing Story...' : 'Publish Story'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}