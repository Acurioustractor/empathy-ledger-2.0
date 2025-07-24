'use client';

import React from 'react';
import StorytellerProfile from '@/components/storytellers/StorytellerProfile';
import { useTestimonials } from '@/hooks/useCMS';

interface StorytellerTestimonialsProps {
  projectId?: string;
  limit?: number;
  theme?: string;
}

export default function StorytellerTestimonials({ 
  projectId, 
  limit = 3,
  theme 
}: StorytellerTestimonialsProps) {
  // Use the new centralized CMS hook
  const { data: testimonials, loading } = useTestimonials({
    limit,
    themes: theme ? [theme] : undefined,
  });

  if (loading) {
    return (
      <div className="testimonials-grid">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="testimonial-skeleton" />
        ))}
        <style jsx>{`
          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
          }
          .testimonial-skeleton {
            height: 200px;
            background: #f3f4f6;
            border-radius: 12px;
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

  return (
    <div className="testimonials-section">
      <div className="testimonials-grid">
        {testimonials?.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <blockquote className="testimonial-quote">
              "{testimonial.quote_text}"
            </blockquote>
            
            <div className="testimonial-author">
              <StorytellerProfile
                storyteller={{
                  id: testimonial.storyteller.id,
                  full_name: testimonial.storyteller.full_name,
                  profile_image_url: testimonial.storyteller.profile_image_url,
                  community_affiliation: testimonial.storyteller.community_affiliation,
                  bio: undefined
                }}
                size="small"
                showBio={false}
                showStoryCount={false}
              />
              {testimonial.storyteller.location && (
                <p className="author-location">📍 {testimonial.storyteller.location}</p>
              )}
            </div>
          </div>
        )) || []}
      </div>

      <style jsx>{`
        .testimonials-section {
          margin: 3rem 0;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
        }

        .testimonial-quote {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #374151;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-author {
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .author-location {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          padding-left: 3rem;
        }

        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}