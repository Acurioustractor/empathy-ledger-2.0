'use client';

import React from 'react';
import ImagePlaceholder from './ImagePlaceholder';

interface PhotoGalleryProps {
  title?: string;
  description?: string;
  layout?: 'grid' | 'masonry' | 'featured' | 'story' | 'testimonial';
  count?: number;
  className?: string;
  showCaptions?: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  title = "Photo Gallery",
  description,
  layout = 'grid',
  count = 6,
  className = '',
  showCaptions = true
}) => {
  const renderGridLayout = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ImagePlaceholder
          key={index}
          type="photo"
          size="md"
          aspect="square"
          title={`Photo ${index + 1}`}
          description={showCaptions ? "Add meaningful caption here" : undefined}
          className="hover:scale-105 transition-transform duration-300"
        />
      ))}
    </div>
  );

  const renderMasonryLayout = () => (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, index) => {
        const aspects = ['portrait', 'landscape', 'square'] as const;
        const randomAspect = aspects[index % aspects.length];
        return (
          <div key={index} className="break-inside-avoid">
            <ImagePlaceholder
              type="photo"
              size="full"
              aspect={randomAspect}
              title={`Photo ${index + 1}`}
              description={showCaptions ? "Add meaningful caption here" : undefined}
              className="mb-4 hover:scale-105 transition-transform duration-300"
            />
          </div>
        );
      })}
    </div>
  );

  const renderFeaturedLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ImagePlaceholder
          type="photo"
          size="xl"
          aspect="video"
          title="Featured Photo"
          description="Primary hero image with strong visual impact"
          className="hover:scale-105 transition-transform duration-300"
          overlay={true}
        />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <ImagePlaceholder
            key={index}
            type="photo"
            size="md"
            aspect="landscape"
            title={`Supporting Photo ${index + 1}`}
            description={showCaptions ? "Supporting visual story" : undefined}
            className="hover:scale-105 transition-transform duration-300"
          />
        ))}
      </div>
    </div>
  );

  const renderStoryLayout = () => (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <ImagePlaceholder
          type="portrait"
          size="lg"
          aspect="portrait"
          title="Storyteller Portrait"
          description="Individual whose story we're featuring"
          className="hover:scale-105 transition-transform duration-300"
        />
        <div className="space-y-4">
          <ImagePlaceholder
            type="story"
            size="md"
            aspect="landscape"
            title="Story Context Photo"
            description="Visual that supports the narrative"
            className="hover:scale-105 transition-transform duration-300"
          />
          <ImagePlaceholder
            type="community"
            size="md"
            aspect="landscape"
            title="Community Context"
            description="Broader community setting"
            className="hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );

  const renderTestimonialLayout = () => (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="text-center">
          <ImagePlaceholder
            type="portrait"
            size="md"
            aspect="square"
            title={`Person ${index + 1}`}
            description="Community member photo"
            className="mx-auto mb-4 hover:scale-105 transition-transform duration-300"
          />
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="text-sm text-gray-500 mt-2">Testimonial quote placeholder</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'masonry':
        return renderMasonryLayout();
      case 'featured':
        return renderFeaturedLayout();
      case 'story':
        return renderStoryLayout();
      case 'testimonial':
        return renderTestimonialLayout();
      default:
        return renderGridLayout();
    }
  };

  return (
    <div className={`${className}`}>
      {(title || description) && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      {renderLayout()}
      
      <div className="mt-6 text-center">
        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
          + Add more photos
        </button>
      </div>
    </div>
  );
};

export default PhotoGallery;