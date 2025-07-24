/**
 * PROFESSIONAL STORYTELLER CARDS COMPONENT
 * Production-ready implementation following 2024/2025 best practices
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useStorytellerCards } from '@/hooks/useSupabaseProfessional';

interface StorytellerCardsProps {
  projectName: string;
  limit?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function StorytellerCardsProfessional({ 
  projectName,
  limit = 3,
  title = "Community Voices",
  subtitle = "Stories from our community members",
  className = ""
}: StorytellerCardsProps) {
  
  // Use professional hook - no more RLS issues!
  const { data: storytellers, loading, error, refresh } = useStorytellerCards(projectName, limit);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className={`storyteller-cards-section ${className}`}>
        <div className="section-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="cards-grid">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="storyteller-card skeleton">
              <div className="skeleton-avatar" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          ))}
        </div>
        {renderStyles()}
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className={`storyteller-cards-section ${className}`}>
        <div className="section-header">
          <h2>{title}</h2>
          <p style={{ color: '#ef4444' }}>
            Unable to load community stories. 
            <button onClick={refresh} className="retry-button">
              Try Again
            </button>
          </p>
        </div>
        {renderStyles()}
      </div>
    );
  }

  // Empty state
  if (!storytellers || storytellers.length === 0) {
    return (
      <div className={`storyteller-cards-section ${className}`}>
        <div className="section-header">
          <h2>{title}</h2>
          <p>No community stories available yet. Check back soon!</p>
        </div>
        {renderStyles()}
      </div>
    );
  }

  // Success state with real data
  return (
    <div className={`storyteller-cards-section ${className}`}>
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="cards-grid">
        {storytellers.map((storyteller) => (
          <article key={storyteller.id} className="storyteller-card">
            
            {/* Profile Photo */}
            <div className="card-photo">
              {storyteller.profile_image_url ? (
                <Image
                  src={storyteller.profile_image_url}
                  alt={`${storyteller.full_name} - Community Storyteller`}
                  width={120}
                  height={120}
                  className="profile-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`profile-placeholder ${storyteller.profile_image_url ? 'hidden' : ''}`}>
                {storyteller.full_name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Storyteller Information */}
            <div className="card-content">
              <h3 className="storyteller-name">
                {storyteller.full_name}
              </h3>
              
              {storyteller.location && (
                <p className="storyteller-location">
                  📍 {storyteller.location.name}
                  {storyteller.location.state && `, ${storyteller.location.state}`}
                  {storyteller.location.country && `, ${storyteller.location.country}`}
                </p>
              )}

              {storyteller.community_affiliation && (
                <p className="storyteller-community">
                  🏛️ {storyteller.community_affiliation}
                </p>
              )}

              {storyteller.bio && (
                <p className="storyteller-bio">
                  {storyteller.bio.length > 150 
                    ? `${storyteller.bio.substring(0, 150)}...` 
                    : storyteller.bio
                  }
                </p>
              )}
            </div>

            {/* Action/Read More */}
            <div className="card-actions">
              <button 
                className="read-more-btn"
                onClick={() => {
                  // Future: Link to individual storyteller page
                  console.log('View storyteller:', storyteller.id);
                }}
              >
                View Stories
              </button>
            </div>

          </article>
        ))}
      </div>

      {renderStyles()}
    </div>
  );
}

// Render styles function to keep component clean
function renderStyles() {
  return (
    <style jsx>{`
      .storyteller-cards-section {
        margin: 4rem 0;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
        padding: 0 1rem;
      }

      .section-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .section-header h2 {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--color-ink, #1a202c);
        margin-bottom: 0.5rem;
      }

      .section-header p {
        font-size: 1.2rem;
        color: var(--color-ink-light, #4a5568);
        margin: 0;
      }

      .retry-button {
        background: none;
        color: #3182ce;
        border: none;
        text-decoration: underline;
        cursor: pointer;
        margin-left: 0.5rem;
        font-size: inherit;
      }

      .retry-button:hover {
        color: #2c5aa0;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        margin: 0 auto;
      }

      .storyteller-card {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .storyteller-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }

      .card-photo {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
        position: relative;
      }

      .profile-image {
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid var(--color-brand-blue, #3182ce);
      }

      .profile-placeholder {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: var(--color-brand-blue, #3182ce);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        font-weight: 700;
      }

      .profile-placeholder.hidden {
        display: none;
      }

      .card-content {
        flex: 1;
        text-align: center;
      }

      .storyteller-name {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-ink, #1a202c);
        margin-bottom: 0.5rem;
      }

      .storyteller-location {
        font-size: 1rem;
        color: var(--color-ink-light, #4a5568);
        margin-bottom: 0.5rem;
      }

      .storyteller-community {
        font-size: 0.9rem;
        color: var(--color-brand-blue, #3182ce);
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .storyteller-bio {
        font-size: 0.95rem;
        color: var(--color-ink-light, #4a5568);
        line-height: 1.5;
        margin-bottom: 1.5rem;
      }

      .card-actions {
        margin-top: auto;
        text-align: center;
      }

      .read-more-btn {
        background: var(--color-brand-blue, #3182ce);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
      }

      .read-more-btn:hover {
        background: var(--color-brand-blue-dark, #2c5aa0);
        transform: translateY(-1px);
      }

      /* Skeleton styles */
      .storyteller-card.skeleton {
        pointer-events: none;
      }

      .skeleton-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        margin: 0 auto 1.5rem;
      }

      .skeleton-text {
        height: 1rem;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      .skeleton-text.short {
        width: 60%;
        margin: 0 auto;
      }

      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      @media (max-width: 768px) {
        .section-header h2 {
          font-size: 2rem;
        }

        .cards-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .storyteller-card {
          padding: 1.5rem;
        }
      }
    `}</style>
  );
}