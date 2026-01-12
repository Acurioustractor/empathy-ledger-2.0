import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

interface StoryellerCardProps {
  storytellerId: string;
  showPhoto?: boolean;
  showBio?: boolean;
  showOrganization?: boolean;
  showLocation?: boolean;
  cardStyle?: 'minimal' | 'detailed' | 'featured';
}

export default function StorytellerCard({
  storytellerId,
  showPhoto = true,
  showBio = true,
  showOrganization = true,
  showLocation = false,
  cardStyle = 'detailed'
}: StoryellerCardProps) {
  const [storyteller, setStoryteller] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStoryteller() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('storytellers')
        .select(`
          *,
          organizations (name, type),
          locations (name, country),
          projects (name)
        `)
        .eq('id', storytellerId)
        .eq('consent_given', true)
        .single();

      if (data && !error) {
        setStoryteller(data);
      }
      setLoading(false);
    }

    fetchStoryteller();
  }, [storytellerId]);

  if (loading) {
    return <div className="storyteller-card loading">Loading...</div>;
  }

  if (!storyteller) {
    return null;
  }

  const cardClasses = `storyteller-card ${cardStyle}`;

  return (
    <div className={cardClasses}>
      {showPhoto && storyteller.profile_image_url && (
        <div className="storyteller-photo">
          <Image
            src={storyteller.profile_image_url}
            alt={`${storyteller.full_name} profile photo`}
            width={100}
            height={100}
            className="profile-image"
          />
        </div>
      )}
      
      <div className="storyteller-info">
        <h3 className="storyteller-name">{storyteller.full_name}</h3>
        
        {storyteller.role && (
          <p className="storyteller-role">{storyteller.role}</p>
        )}
        
        {showOrganization && storyteller.organizations && (
          <p className="storyteller-organization">
            {storyteller.organizations.name}
          </p>
        )}
        
        {showLocation && storyteller.locations && (
          <p className="storyteller-location">
            {storyteller.locations.name}
          </p>
        )}
        
        {showBio && storyteller.bio && (
          <p className="storyteller-bio">{storyteller.bio}</p>
        )}
      </div>

      <style jsx>{`
        .storyteller-card {
          background: var(--card-background, #ffffff);
          border: 1px solid var(--card-border, #e0e0e0);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .storyteller-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .storyteller-card.minimal {
          padding: 1rem;
        }
        
        .storyteller-card.featured {
          padding: 2rem;
          border-color: var(--primary-color, #B85C38);
          border-width: 2px;
        }
        
        .storyteller-photo {
          text-align: center;
          margin-bottom: 1rem;
        }
        
        .profile-image {
          border-radius: 50%;
          object-fit: cover;
        }
        
        .storyteller-name {
          color: var(--primary-color, #B85C38);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .storyteller-role {
          color: var(--secondary-color, #1A3A52);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .storyteller-organization,
        .storyteller-location {
          color: var(--text-muted, #6B7280);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .storyteller-bio {
          color: var(--text-color, #2D2D2D);
          line-height: 1.5;
          margin-top: 1rem;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-muted, #6B7280);
        }
      `}</style>
    </div>
  );
}