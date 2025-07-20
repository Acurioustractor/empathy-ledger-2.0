'use client';

import React from 'react';

interface ImagePlaceholderProps {
  type?: 'photo' | 'video' | 'gallery' | 'portrait' | 'story' | 'community';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  aspect?: 'square' | 'video' | 'portrait' | 'landscape' | 'wide';
  title?: string;
  description?: string;
  className?: string;
  overlay?: boolean;
  showIcon?: boolean;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  type = 'photo',
  size = 'md',
  aspect = 'landscape',
  title,
  description,
  className = '',
  overlay = false,
  showIcon = true
}) => {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-80',
    full: 'h-full'
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  };

  const typeLabels = {
    photo: 'Photo',
    video: 'Video',
    gallery: 'Photo Gallery',
    portrait: 'Portrait',
    story: 'Story Visual',
    community: 'Community Photo'
  };

  const typeIcons = {
    photo: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    video: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    gallery: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    portrait: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    story: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    community: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  };

  return (
    <div className={`relative ${aspectClasses[aspect]} ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-all duration-200">
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
        )}
        
        <div className="relative z-10 text-center p-4">
          {showIcon && !title && !description && (
            <div className="text-gray-300">
              {typeIcons[type]}
            </div>
          )}
          
          {(title || description) && (
            <>
              {title && (
                <div className="text-sm font-light text-gray-700 mb-1">
                  {title}
                </div>
              )}
              
              {description && (
                <div className="text-xs text-gray-500 max-w-xs font-light">
                  {description}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePlaceholder;