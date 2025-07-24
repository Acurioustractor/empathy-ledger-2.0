/**
 * STORYTELLER PROFILE COMPONENT
 * Displays storyteller information with proper privacy controls
 * Ensures no PII exposure while showing meaningful community connections
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface Storyteller {
  id: string;
  full_name: string;
  profile_image_url?: string;
  community_affiliation?: string;
  bio?: string;
  public_story_count?: number;
}

interface StorytellerProfileProps {
  storyteller: Storyteller;
  size?: 'small' | 'medium' | 'large';
  showBio?: boolean;
  showStoryCount?: boolean;
  className?: string;
}

// Privacy-safe name display - removes potential PII patterns
function sanitizeDisplayName(name: string): string {
  // Remove email patterns, phone numbers, etc.
  let safeName = name.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[Contact Removed]');
  safeName = safeName.replace(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[Phone Removed]');
  
  // If name appears to be just an email or phone, use generic name
  if (safeName.includes('[Contact Removed]') || safeName.includes('[Phone Removed]')) {
    return 'Community Member';
  }
  
  return safeName.trim() || 'Community Member';
}

export default function StorytellerProfile({ 
  storyteller, 
  size = 'medium',
  showBio = false,
  showStoryCount = false,
  className = ''
}: StorytellerProfileProps) {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm', 
    large: 'w-16 h-16 text-base'
  };
  
  // Ensure no PII is exposed - only show approved public information
  const publicName = sanitizeDisplayName(storyteller.full_name);
  const publicAffiliation = storyteller.community_affiliation || 'Empathy Ledger Community';
  
  // Don't show bio if it contains potential PII
  const safeBio = storyteller.bio && !storyteller.bio.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) && !storyteller.bio.match(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/) 
    ? storyteller.bio 
    : null;
  
  return (
    <div className={`storyteller-profile ${className}`}>
      <div className="flex items-center gap-3">
        {/* Profile Image with Fallback */}
        {storyteller.profile_image_url ? (
          <img 
            src={storyteller.profile_image_url}
            alt={`Profile of ${publicName}`}
            className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[var(--color-gray-200)] storyteller-image`}
            onError={(e) => {
              // Fallback to initials if image fails
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback to Initials */}
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-teal-500)] flex items-center justify-center text-white font-semibold storyteller-initials ${storyteller.profile_image_url ? 'hidden' : ''}`}
        >
          {publicName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        
        {/* Storyteller Info */}
        <div className="flex-1 min-w-0">
          <Link 
            href={`/storytellers/${storyteller.id}`}
            className="font-semibold text-[var(--color-gray-900)] hover:text-[var(--color-primary-600)] transition-colors block truncate storyteller-name"
          >
            {publicName}
          </Link>
          
          <div className="text-[var(--color-primary-600)] text-sm truncate storyteller-affiliation">
            {publicAffiliation}
          </div>
          
          {showStoryCount && storyteller.public_story_count && storyteller.public_story_count > 0 && (
            <div className="text-xs text-[var(--color-gray-500)] mt-1">
              {storyteller.public_story_count} {storyteller.public_story_count === 1 ? 'story' : 'stories'} shared
            </div>
          )}
        </div>
      </div>
      
      {/* Bio Section - Only if PII-safe */}
      {showBio && safeBio && (
        <div className="mt-3 text-sm text-[var(--color-gray-600)] leading-relaxed storyteller-bio">
          {safeBio.length > 200 ? `${safeBio.substring(0, 200)}...` : safeBio}
        </div>
      )}
    </div>
  );
}