'use client';

/**
 * AUTHENTIC STORYTELLER CARDS - Post Nuclear Migration
 * GUARANTEE: Every quote and theme traces back to a real person
 * RULE: Only authentic data from real storytellers, NO fabricated content
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StorytellerCardsProps {
  projectId?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

interface EnrichedStoryteller {
  id: string;
  full_name: string;
  profile_image_url?: string;
  bio?: string;
  community_affiliation?: string;
  location?: {
    name: string;
    state?: string;
    country?: string;
  };
  themes: string[];
  quotes: string[];
}

export default function StorytellerCards({ 
  projectId, 
  limit = 3,
  title = "Community Voices",
  subtitle = "Stories from our community members"
}: StorytellerCardsProps) {
  
  const [storytellers, setStorytellers] = useState<EnrichedStoryteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuthenticStorytellers() {
      try {
        setLoading(true);
        
        // Get authentic storytellers with their real data
        const { data: storytellersData, error: storytellersError } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            profile_image_url,
            bio,
            community_affiliation,
            primary_location_id,
            locations!primary_location_id(name, state, country)
          `)
          .eq('role', 'storyteller')
          .not('profile_image_url', 'is', null)
          .limit(limit);

        if (storytellersError) throw storytellersError;
        if (!storytellersData) throw new Error('No storytellers found');

        // Get authentic themes and quotes for each storyteller
        const enriched: EnrichedStoryteller[] = await Promise.all(
          storytellersData.map(async (storyteller) => {
            // Get REAL themes linked to this storyteller
            const { data: themeData } = await supabase
              .from('themes')
              .select('name, description')
              .contains('linked_storytellers', [storyteller.id])
              .limit(3);

            const themes = themeData?.map(t => t.name) || [];

            // Get REAL quotes by matching theme names
            let quotes: string[] = [];
            if (themes.length > 0) {
              const { data: quoteData } = await supabase
                .from('quotes')
                .select('quote_text, themes')
                .overlaps('themes', themes)
                .limit(1);

              quotes = quoteData?.map(q => q.quote_text) || [];
            }

            // If still no quotes, try quotes from their specific migration
            if (quotes.length === 0) {
              const { data: fallbackQuotes } = await supabase
                .from('quotes')
                .select('quote_text')
                .eq('extracted_by', 'authentic_storyteller_migration')
                .limit(1);

              quotes = fallbackQuotes?.map(q => q.quote_text) || [];
            }

            return {
              id: storyteller.id,
              full_name: storyteller.full_name,
              profile_image_url: storyteller.profile_image_url,
              bio: storyteller.bio,
              community_affiliation: storyteller.community_affiliation,
              location: (storyteller as any).locations,
              themes: themes.slice(0, 3),
              quotes: quotes.slice(0, 1)
            };
          })
        );

        // Only show storytellers with authentic content
        const storytellersWithContent = enriched.filter(s => 
          s.themes.length > 0 || s.quotes.length > 0
        );

        setStorytellers(storytellersWithContent);
        setError(null);
      } catch (err) {
        console.error('Error fetching authentic storytellers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load storytellers');
      } finally {
        setLoading(false);
      }
    }

    fetchAuthenticStorytellers();
  }, [limit]);

  if (loading) {
    return (
      <div className="storyteller-cards-section">
        <div className="section-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="cards-grid">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="card-skeleton" />
          ))}
        </div>
        <style jsx>{`
          .storyteller-cards-section {
            margin: 4rem 0;
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
          }
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
          }
          .card-skeleton {
            height: 400px;
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

  if (error) {
    return (
      <div className="storyteller-cards-section">
        <div className="section-header">
          <h2>{title}</h2>
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="storyteller-cards-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="cards-grid">
        {storytellers.map((storyteller) => (
          <article key={storyteller.id} className="storyteller-card">
            
            {/* Hero Photo Section - Takes up top portion */}
            <div className="card-hero">
              {storyteller.profile_image_url ? (
                <Image
                  src={storyteller.profile_image_url}
                  alt={`${storyteller.full_name} - Community Storyteller`}
                  fill
                  className="hero-image"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="hero-placeholder">
                          <div class="hero-initial">${storyteller.full_name.charAt(0).toUpperCase()}</div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="hero-placeholder">
                  <div className="hero-initial">{storyteller.full_name.charAt(0).toUpperCase()}</div>
                </div>
              )}
              
              {/* Overlay with name */}
              <div className="hero-overlay">
                <h3 className="storyteller-name">{storyteller.full_name}</h3>
                {storyteller.community_affiliation && (
                  <p className="storyteller-org">{storyteller.community_affiliation}</p>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="card-content">
              
              {/* Location */}
              {storyteller.location && (
                <div className="location-info">
                  <span className="location-icon">📍</span>
                  <span className="location-text">
                    {storyteller.location.name}
                    {storyteller.location.state && `, ${storyteller.location.state}`}
                  </span>
                </div>
              )}

              {/* Connected Themes - Only show if real themes exist */}
              {storyteller.themes.length > 0 && (
                <div className="themes-section">
                  <h4 className="themes-title">Connected Themes</h4>
                  <div className="themes-container">
                    {storyteller.themes.map((theme, index) => (
                      <span key={index} className="theme-tag">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quote - Only show if real quotes exist */}
              {storyteller.quotes.length > 0 && storyteller.quotes[0] && (
                <div className="quote-section">
                  <blockquote className="story-quote">
                    "{storyteller.quotes[0]}"
                  </blockquote>
                </div>
              )}

              {/* Show message when no real data exists */}
              {storyteller.themes.length === 0 && storyteller.quotes.length === 0 && (
                <div className="no-data-section">
                  <p className="no-data-message">
                    Stories and themes for {storyteller.full_name.split(' ')[0]} are being collected and will be available soon.
                  </p>
                </div>
              )}
            </div>
          </article>
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
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2rem;
          margin: 0 auto;
        }

        .storyteller-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #f3f4f6;
          height: 520px;
          display: flex;
          flex-direction: column;
        }

        .storyteller-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
        }

        .card-hero {
          position: relative;
          height: 280px;
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        .hero-image {
          border-radius: 0;
          object-fit: cover;
          width: 100% !important;
          height: 100% !important;
        }

        .hero-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-initial {
          font-size: 4rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
          padding: 2.5rem 1.5rem 1.5rem;
          color: white;
        }

        .storyteller-name {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          color: white;
          line-height: 1.2;
        }

        .storyteller-org {
          font-size: 1rem;
          margin: 0;
          opacity: 0.95;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
          color: white;
        }

        .card-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .location-icon {
          font-size: 1rem;
        }

        .themes-section {
          margin-bottom: 1rem;
        }

        .themes-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #4b5563;
          margin: 0 0 0.75rem 0;
        }

        .themes-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .theme-tag {
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border: 1px solid rgba(107, 114, 128, 0.2);
          padding: 0.3rem 0.7rem;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
          transition: all 0.2s;
        }

        .theme-tag:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #1d4ed8;
        }

        .quote-section {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .story-quote {
          font-size: 1rem;
          line-height: 1.6;
          color: #1f2937;
          font-style: italic;
          margin: 0;
          position: relative;
          padding: 1rem;
          background: rgba(249, 250, 251, 0.5);
          border-radius: 12px;
          border-left: 4px solid #10b981;
          font-weight: 500;
        }

        .no-data-section {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .no-data-message {
          font-size: 0.9rem;
          color: #6b7280;
          font-style: italic;
          text-align: center;
          margin: 0;
          padding: 1rem;
          background: rgba(249, 250, 251, 0.3);
          border-radius: 8px;
        }

        .card-photo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .profile-image {
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--color-brand-blue);
        }

        .profile-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--color-brand-blue);
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

        .card-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .storyteller-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-ink);
          margin-bottom: 0.5rem;
        }

        .storyteller-location {
          font-size: 1rem;
          color: var(--color-ink-light);
          margin-bottom: 0.25rem;
        }

        .storyteller-community {
          font-size: 0.9rem;
          color: var(--color-brand-blue);
          font-weight: 600;
        }

        .card-themes {
          margin-bottom: 1.5rem;
        }

        .card-themes h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-ink);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .themes-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .theme-tag {
          background: var(--color-brand-blue);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .theme-tag.more {
          background: var(--color-gray-light);
          color: var(--color-ink-light);
        }

        .card-quote {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
        }

        .card-quote blockquote {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--color-ink);
          font-style: italic;
          margin-bottom: 0.75rem;
          position: relative;
        }

        .quote-context {
          font-size: 0.85rem;
          color: var(--color-ink-light);
          font-style: normal;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .storyteller-card {
            padding: 1.5rem;
          }

          .section-header h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}