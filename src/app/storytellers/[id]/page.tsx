'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface StorytellerProfile {
  id: string;
  name: string;
  profileImage?: string;
  organization?: string;
  location?: string;
  role?: string;
  privacyPreferences: {
    public_display: boolean;
    show_photo: boolean;
    show_location: boolean;
    show_organisation: boolean;
    show_story_themes: boolean;
    show_story_quotes: boolean;
  };
  story: {
    title: string;
    themes: string[];
    quotes: string[];
    summary: string;
    publishedDate: string;
  };
  consentGiven: boolean;
  consentDate: string;
}

// This would typically come from your CMS service
function getStorytellerProfile(id: string): StorytellerProfile {
  // TODO: Implement with your StorytellerCmsService
  // For now, return a mock profile that demonstrates privacy levels
  
  return {
    id,
    name: "Alex Chen",
    profileImage: "https://tednluwflfhxyucgwigh.supabase.co/storage/v1/object/public/images/storyteller-sample.jpg",
    organization: "Community Health Network",
    location: "Melbourne, Victoria",
    role: "Mental Health Advocate",
    privacyPreferences: {
      public_display: true,
      show_photo: true,
      show_location: true,
      show_organisation: true,
      show_story_themes: true,
      show_story_quotes: true
    },
    story: {
      title: "Finding Light in Dark Moments",
      themes: ["Mental Health", "Recovery", "Community Support", "Resilience"],
      quotes: [
        "The hardest part was realizing I didn't have to face it alone.",
        "Recovery isn't linear, but every small step matters.",
        "Sharing my story helped me reclaim my narrative."
      ],
      summary: "A journey through mental health challenges and the power of community support in recovery.",
      publishedDate: "2024-03-15"
    },
    consentGiven: true,
    consentDate: "2024-03-01"
  };
}

export default function StorytellerProfilePage() {
  const [storyteller, setStoryteller] = useState<StorytellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    
    try {
      const profile = getStorytellerProfile(id);
      
      if (!profile || !profile.consentGiven || !profile.privacyPreferences.public_display) {
        setNotFound(true);
      } else {
        setStoryteller(profile);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading storyteller profile...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (notFound || !storyteller) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h1>Profile Not Available</h1>
          <p>This storyteller profile is either private, has been removed, or doesn't exist.</p>
          <p>Storytellers maintain complete control over their privacy and can choose to make their profiles private at any time.</p>
          <Link href="/storytellers" className="btn btn-primary">
            Browse Other Storytellers
          </Link>
        </div>
        <style jsx>{`
          .not-found-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
            padding: 2rem;
          }
          .not-found-content {
            text-align: center;
            max-width: 600px;
          }
          .not-found-content h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #1e293b;
          }
          .not-found-content p {
            margin-bottom: 1rem;
            color: #64748b;
            line-height: 1.6;
          }
          .btn {
            display: inline-block;
            padding: 1rem 2rem;
            background: #3b82f6;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 1rem;
            transition: all 0.3s ease;
          }
          .btn:hover {
            background: #2563eb;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  const { privacyPreferences: prefs } = storyteller;

  return (
    <div className="storyteller-profile">
      {/* Hero Section */}
      <section className="profile-hero">
        <div className="container">
          <div className="hero-content">
            <div className="profile-image-container">
              {prefs.show_photo && storyteller.profileImage ? (
                <Image
                  src={storyteller.profileImage}
                  alt={`${storyteller.name} - Storyteller`}
                  width={200}
                  height={200}
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder">
                  <span className="placeholder-initial">
                    {storyteller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">{storyteller.name}</h1>
              
              {storyteller.role && (
                <p className="profile-role">{storyteller.role}</p>
              )}
              
              <div className="profile-details">
                {prefs.show_organisation && storyteller.organization && (
                  <div className="detail-item">
                    <span className="detail-icon">🏢</span>
                    <span>{storyteller.organization}</span>
                  </div>
                )}
                
                {prefs.show_location && storyteller.location && (
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span>{storyteller.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="privacy-notice-section">
        <div className="container">
          <div className="privacy-notice">
            <div className="privacy-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="privacy-content">
              <p>
                <strong>{storyteller.name}</strong> has chosen to share their story with dignity and control. 
                They maintain complete authority over what information appears here and can update their privacy preferences at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Content */}
      <section className="story-content-section">
        <div className="container">
          <div className="story-content">
            <div className="story-header">
              <h2>{storyteller.story.title}</h2>
              <p className="story-summary">{storyteller.story.summary}</p>
              <div className="story-meta">
                <span>Shared on {new Date(storyteller.story.publishedDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Story Themes */}
            {prefs.show_story_themes && storyteller.story.themes.length > 0 && (
              <div className="story-themes">
                <h3>Story Themes</h3>
                <div className="themes-container">
                  {storyteller.story.themes.map((theme, index) => (
                    <span key={index} className="theme-tag">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Quotes */}
            {prefs.show_story_quotes && storyteller.story.quotes.length > 0 && (
              <div className="story-quotes">
                <h3>Key Insights</h3>
                <div className="quotes-container">
                  {storyteller.story.quotes.map((quote, index) => (
                    <blockquote key={index} className="story-quote">
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            {/* Consent Information */}
            <div className="consent-info">
              <div className="consent-icon">✓</div>
              <div className="consent-content">
                <p>
                  <strong>Sharing with Consent:</strong> This story was shared on {new Date(storyteller.consentDate).toLocaleDateString()} 
                  with full informed consent and complete control over privacy settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Stories / Community */}
      <section className="related-section">
        <div className="container">
          <div className="section-header">
            <h2>More Community Voices</h2>
            <p>Other storytellers who chose to share their experiences</p>
          </div>
          
          <div className="related-actions">
            <Link href="/storytellers" className="btn btn-primary">
              Browse All Storytellers
            </Link>
            <Link href="/submit" className="btn btn-secondary">
              Share Your Story
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .storyteller-profile {
          min-height: 100vh;
        }

        .profile-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 0;
        }

        .hero-content {
          display: flex;
          align-items: center;
          gap: 3rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-image-container {
          flex-shrink: 0;
        }

        .profile-image {
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .profile-placeholder {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: 4px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .placeholder-initial {
          font-size: 4rem;
          font-weight: 700;
          color: white;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .profile-role {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          font-style: italic;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
        }

        .detail-icon {
          font-size: 1.2rem;
        }

        .privacy-notice-section {
          background: #fef3c7;
          padding: 2rem 0;
        }

        .privacy-notice {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border-left: 4px solid #f59e0b;
        }

        .privacy-icon {
          color: #d97706;
          flex-shrink: 0;
        }

        .privacy-icon svg {
          width: 2rem;
          height: 2rem;
        }

        .privacy-content p {
          margin: 0;
          color: #78350f;
          line-height: 1.5;
        }

        .story-content-section {
          padding: 4rem 0;
        }

        .story-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .story-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .story-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .story-summary {
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .story-meta {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .story-themes {
          margin-bottom: 3rem;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .story-themes h3 {
          color: #334155;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .themes-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .theme-tag {
          background: #e0e7ff;
          color: #3730a3;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
          border: 1px solid #c7d2fe;
        }

        .story-quotes {
          margin-bottom: 3rem;
        }

        .story-quotes h3 {
          color: #334155;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .quotes-container {
          space-y: 1.5rem;
        }

        .story-quote {
          background: white;
          padding: 2rem;
          margin-bottom: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid #10b981;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          font-size: 1.1rem;
          line-height: 1.6;
          color: #374151;
          font-style: italic;
        }

        .consent-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f0fdf4;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
          margin-top: 3rem;
        }

        .consent-icon {
          background: #10b981;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .consent-content p {
          margin: 0;
          color: #166534;
          line-height: 1.5;
        }

        .related-section {
          background: #f8fafc;
          padding: 4rem 0;
          text-align: center;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          font-size: 2rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .section-header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .related-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border: 2px solid #3b82f6;
        }

        .btn-primary:hover {
          background: #2563eb;
          border-color: #2563eb;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: white;
          color: #3b82f6;
          border: 2px solid #3b82f6;
        }

        .btn-secondary:hover {
          background: #3b82f6;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
          }
          
          .profile-name {
            font-size: 2rem;
          }
          
          .privacy-notice {
            flex-direction: column;
            text-align: center;
          }
          
          .story-content {
            padding: 0 1rem;
          }
          
          .related-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}