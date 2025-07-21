'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface MediaDisplayProps {
  src?: string;
  alt?: string;
  type?: 'image' | 'video';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  className?: string;
  rounded?: 'none' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  overlay?: boolean;
  caption?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({
  src,
  alt = '',
  type = 'image',
  aspectRatio = 'landscape',
  className = '',
  rounded = '2xl',
  overlay = false,
  caption,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const roundedClasses = {
    none: '',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  if (!src || hasError) {
    return (
      <div
        className={`relative bg-gray-100 ${aspectRatioClasses[aspectRatio]} ${roundedClasses[rounded]} ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            {!src && (
              <p className="text-sm text-gray-500 font-light">
                No image available
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div
        className={`relative ${aspectRatioClasses[aspectRatio]} ${roundedClasses[rounded]} ${className} overflow-hidden bg-black`}
      >
        <video
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          controls
          playsInline
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        )}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-sm font-light">{caption}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative ${aspectRatioClasses[aspectRatio]} ${roundedClasses[rounded]} ${className} overflow-hidden`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        priority={priority}
        placeholder={blurDataURL ? placeholder : 'empty'}
        blurDataURL={blurDataURL}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      )}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-sm font-light">{caption}</p>
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;
