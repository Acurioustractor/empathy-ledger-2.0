/**
 * STORYTELLER CARDS - CLEAN IMPLEMENTATION
 * Uses the new storyteller-centric CMS service
 * GUARANTEE: Only shows real, consenting storytellers
 */

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { StorytellerCmsService, StorytellerCard } from '@/lib/storyteller-cms-service';

interface StorytellerCardsProps {
  project?: string;
  organisation?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function StorytellerCardsClean({
  project,
  organisation,
  limit = 3,
  title = "Community Voices",
  subtitle = "Real stories from our community members"
}: StorytellerCardsProps) {
  const [storytellers, setStorytellers] = useState<StorytellerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStorytellers() {
      try {
        setLoading(true);
        setError(null);

        const cms = new StorytellerCmsService();
        const data = await cms.getStorytellerCards({
          project,
          organisation,
          limit
        });

        setStorytellers(data);
      } catch (err) {
        console.error('Error loading storytellers:', err);
        setError('Failed to load storytellers');
      } finally {
        setLoading(false);
      }
    }

    loadStorytellers();
  }, [project, organisation, limit]);

  if (loading) {
    return <StorytellerCardsSkeleton title={title} subtitle={subtitle} count={limit} />;
  }

  if (error) {
    return <StorytellerCardsError title={title} subtitle={subtitle} error={error} />;
  }

  if (storytellers.length === 0) {
    return <NoStorytellersMessage title={title} subtitle={subtitle} />;
  }

  return (
    <div className="storyteller-cards-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="cards-grid">
        {storytellers.map((storyteller) => (
          <StorytellerCardItem key={storyteller.id} {...storyteller} />
        ))}
      </div>

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
          margin-bottom: 0.5rem;
          color: var(--color-ink);
          font-weight: 700;
        }

        .section-header p {
          font-size: 1.2rem;
          color: var(--color-ink-light);
          margin: 0;
          text-align: center;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 2rem;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function StorytellerCardItem({
  id,
  name,
  photo,
  role,
  organisation,
  organizationType,
  project,
  location,
  themes,
  quote
}: StorytellerCard) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="storyteller-card">
      {/* Image Thumbnail */}
      <div className="card-image">
        {photo && !imageError ? (
          <Image
            src={photo}
            alt={`${name} - Community Storyteller`}
            width={340}
            height={200}
            className="thumbnail-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">
            <span className="placeholder-initial">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="card-content">
        {/* Name and Role */}
        <div className="storyteller-header">
          <h3 className="storyteller-name">{name}</h3>
          {role && (
            <p className="storyteller-role">{role}</p>
          )}
        </div>

        {/* Location */}
        {location && (
          <p className="storyteller-location">{location}</p>
        )}

        {/* Organization */}
        {organisation && (
          <p className="storyteller-org">{organisation}</p>
        )}

        {/* Quote */}
        {quote && (
          <blockquote className="story-quote">
            "{quote}"
          </blockquote>
        )}

        {/* Themes */}
        {themes.length > 0 && (
          <div className="themes-container">
            {themes.slice(0, 3).map((theme, index) => (
              <span key={index} className="theme-tag">
                {theme}
              </span>
            ))}
          </div>
        )}

        {/* No content message */}
        {!quote && themes.length === 0 && (
          <div className="coming-soon">
            <p>Stories from {name.split(' ')[0]} coming soon...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .storyteller-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .storyteller-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        /* Image Section */
        .card-image {
          position: relative;
          width: 100%;
          min-height: 180px;
          max-height: 260px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .thumbnail-image {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          object-position: center;
          transition: transform 0.2s ease;
          display: block;
        }

        .storyteller-card:hover .thumbnail-image {
          transform: scale(1.02);
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          background: #fafbfc;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .placeholder-initial {
          font-size: 3rem;
          font-weight: 300;
          color: #d1d5db;
        }

        /* Content Section */
        .card-content {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        /* Header */
        .storyteller-header {
          margin-bottom: 8px;
        }

        .storyteller-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .storyteller-role {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
          font-weight: 500;
        }

        /* Location */
        .storyteller-location {
          font-size: 0.8rem;
          color: #888;
          margin: 0;
          font-weight: 400;
        }

        /* Organization */
        .storyteller-org {
          font-size: 0.8rem;
          color: #666;
          margin: 0;
          font-weight: 500;
        }

        /* Quote */
        .story-quote {
          font-size: 0.9rem;
          line-height: 1.5;
          color: #4a4a4a;
          font-style: italic;
          margin: 12px 0 0 0;
          padding: 0;
          border: none;
          background: none;
          flex: 1;
        }

        /* Themes */
        .themes-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: auto;
          padding-top: 12px;
        }

        .theme-tag {
          background: #f8fafc;
          color: #64748b;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .theme-tag:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .coming-soon {
          margin-top: auto;
          text-align: center;
          padding: 12px 0;
        }

        .coming-soon p {
          font-size: 0.85rem;
          color: #9ca3af;
          font-style: italic;
          margin: 0;
        }
      `}</style>
    </article>
  );
}

function StorytellerCardsSkeleton({ title, subtitle, count }: { title: string; subtitle: string; count: number }) {
  return (
    <div className="storyteller-cards-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="cards-grid">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="card-skeleton" />
        ))}
      </div>
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
          margin-bottom: 0.5rem;
          color: var(--color-ink);
        }
        .section-header p {
          font-size: 1.2rem;
          color: var(--color-ink-light);
          margin: 0;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2rem;
        }
        .card-skeleton {
          height: 480px;
          background: #f3f4f6;
          border-radius: 16px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function StorytellerCardsError({ title, subtitle, error }: { title: string; subtitle: string; error: string }) {
  return (
    <div className="storyteller-cards-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p style={{ color: '#ef4444' }}>{error}</p>
      </div>
      <style jsx>{`
        .storyteller-cards-section {
          margin: 4rem 0;
          text-align: center;
        }
        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-ink);
        }
      `}</style>
    </div>
  );
}

function NoStorytellersMessage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="storyteller-cards-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="no-content">
        <p>No storytellers available at this time.</p>
        <p>Please check back soon for community stories.</p>
      </div>
      <style jsx>{`
        .storyteller-cards-section {
          margin: 4rem 0;
          text-align: center;
        }
        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-ink);
        }
        .section-header p {
          font-size: 1.2rem;
          color: var(--color-ink-light);
          margin: 0 0 2rem 0;
        }
        .no-content {
          padding: 3rem;
          background: #f9fafb;
          border-radius: 16px;
          max-width: 600px;
          margin: 0 auto;
        }
        .no-content p {
          margin: 0.5rem 0;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}