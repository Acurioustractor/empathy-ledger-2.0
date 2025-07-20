/**
 * Community Story Card Component
 * 
 * Philosophy: Each story card should honor the dignity of the storyteller
 * and the sacredness of their narrative. Design communicates respect,
 * uses community language, and preserves the humanity of each story.
 */

import Link from 'next/link';

interface StoryCardProps {
  id: string;
  title?: string;
  excerpt: string;
  storyteller: {
    name: string;
    community?: string;
    pronouns?: string;
  };
  submittedAt: string;
  themes?: string[];
  privacy_level?: 'public' | 'community' | 'private';
  cultural_protocols?: {
    seasonal_restrictions?: boolean;
    requires_elder_review?: boolean;
  };
  onClick?: () => void;
}

export function StoryCard({ 
  id,
  title, 
  excerpt, 
  storyteller, 
  submittedAt,
  themes = [],
  privacy_level = 'public',
  cultural_protocols,
  onClick 
}: StoryCardProps) {
  const formattedDate = new Date(submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const cardContent = (
    <article 
      className="story-card cursor-pointer group transition-all duration-300"
      onClick={onClick}
    >
      {/* Cultural Protocol Indicator */}
      {cultural_protocols?.seasonal_restrictions && (
        <div 
          className="text-xs mb-3 px-2 py-1 rounded cultural-protocol-indicator"
          style={{ color: 'var(--color-clay)' }}
        >
          ⚭ Cultural protocols apply
        </div>
      )}

      {/* Story Content */}
      <div className="mb-4">
        {title && (
          <h2 
            className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-200"
            style={{ 
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
              lineHeight: '1.3'
            }}
          >
            {title}
          </h2>
        )}
        
        <p 
          className="mb-4 leading-relaxed"
          style={{ 
            color: 'var(--color-storm)',
            lineHeight: '1.6'
          }}
        >
          {excerpt}
          {excerpt.length > 200 && (
            <span 
              className="ml-2 text-sm font-medium"
              style={{ color: 'var(--primary)' }}
            >
              Read more...
            </span>
          )}
        </p>
      </div>

      {/* Story Themes */}
      {themes.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {themes.slice(0, 3).map((theme, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {theme}
              </span>
            ))}
            {themes.length > 3 && (
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)'
                }}
              >
                +{themes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Storyteller Attribution */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-elder)' }}>
        <div className="flex items-center space-x-3">
          {/* Storyteller Avatar */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ 
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)'
            }}
          >
            {storyteller.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Storyteller Info */}
          <div>
            <div 
              className="font-medium text-sm"
              style={{ color: 'var(--foreground)' }}
            >
              {storyteller.name}
              {storyteller.pronouns && (
                <span 
                  className="ml-2 text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  ({storyteller.pronouns})
                </span>
              )}
            </div>
            {storyteller.community && (
              <div 
                className="text-xs"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {storyteller.community}
              </div>
            )}
          </div>
        </div>

        {/* Story Metadata */}
        <div 
          className="text-xs text-right"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <div>{formattedDate}</div>
          {privacy_level === 'community' && (
            <div className="mt-1">
              <span 
                className="px-2 py-1 rounded text-xs"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)'
                }}
              >
                Community
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );

  // If we have an ID, wrap in Link for navigation
  if (id && !onClick) {
    return (
      <Link href={`/stories/${id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// Skeleton loader for story cards
export function StoryCardSkeleton() {
  return (
    <div 
      className="story-card animate-pulse"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div 
        className="h-4 rounded mb-3"
        style={{ backgroundColor: 'var(--muted)' }}
      ></div>
      <div 
        className="h-6 rounded mb-2"
        style={{ backgroundColor: 'var(--muted)' }}
      ></div>
      <div 
        className="h-20 rounded mb-4"
        style={{ backgroundColor: 'var(--muted)' }}
      ></div>
      <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--color-elder)' }}>
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: 'var(--muted)' }}
          ></div>
          <div>
            <div 
              className="h-4 w-20 rounded mb-1"
              style={{ backgroundColor: 'var(--muted)' }}
            ></div>
            <div 
              className="h-3 w-16 rounded"
              style={{ backgroundColor: 'var(--muted)' }}
            ></div>
          </div>
        </div>
        <div 
          className="h-3 w-16 rounded"
          style={{ backgroundColor: 'var(--muted)' }}
        ></div>
      </div>
    </div>
  );
}
