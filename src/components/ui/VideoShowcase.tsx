'use client';

import React from 'react';
import ImagePlaceholder from './ImagePlaceholder';

interface VideoShowcaseProps {
  title?: string;
  description?: string;
  layout?: 'hero' | 'grid' | 'featured' | 'stories' | 'testimonials';
  count?: number;
  className?: string;
  showControls?: boolean;
}

const VideoShowcase: React.FC<VideoShowcaseProps> = ({
  title = "Video Stories",
  description,
  layout = 'grid',
  count = 4,
  className = '',
  showControls = true
}) => {
  const renderHeroLayout = () => (
    <div className="space-y-6">
      <div className="relative">
        <ImagePlaceholder
          type="video"
          size="xl"
          aspect="video"
          title="Hero Video Story"
          description="Main featured video showcasing platform impact"
          className="hover:scale-105 transition-transform duration-300"
          overlay={true}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors">
            <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="relative">
            <ImagePlaceholder
              type="video"
              size="md"
              aspect="video"
              title={`Related Video ${index + 1}`}
              description="Supporting video content"
              className="hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <svg className="w-4 h-4 text-primary-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGridLayout = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative group">
          <ImagePlaceholder
            type="video"
            size="md"
            aspect="video"
            title={`Video Story ${index + 1}`}
            description="Personal story or community impact video"
            className="hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors">
              <svg className="w-6 h-6 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
          
          {showControls && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 rounded-lg p-3 text-white text-sm">
                <div className="font-medium mb-1">Video Title Placeholder</div>
                <div className="text-xs text-gray-300">Duration: 2:34</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderFeaturedLayout = () => (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className="relative">
        <ImagePlaceholder
          type="video"
          size="xl"
          aspect="video"
          title="Featured Story Video"
          description="Highlighted community member story"
          className="hover:scale-105 transition-transform duration-300"
          overlay={true}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors">
            <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Story Title Placeholder</h3>
          <p className="text-gray-600 mb-4">
            Featured story description placeholder. This would contain a compelling 
            summary of the video content and its impact on the community.
          </p>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>Duration: 3:45</span>
            <span>•</span>
            <span>Category: Healthcare</span>
            <span>•</span>
            <span>Location: NSW</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="relative">
              <ImagePlaceholder
                type="video"
                size="sm"
                aspect="video"
                title={`Related Video ${index + 1}`}
                className="hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <svg className="w-3 h-3 text-primary-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStoriesLayout = () => (
    <div className="space-y-12">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
          <div className={`relative ${index % 2 === 1 ? 'md:order-2' : ''}`}>
            <ImagePlaceholder
              type="video"
              size="lg"
              aspect="video"
              title={`Story Video ${index + 1}`}
              description="Individual community member story"
              className="hover:scale-105 transition-transform duration-300"
              overlay={true}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors">
                <svg className="w-6 h-6 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Story Title Placeholder {index + 1}
              </h3>
              <p className="text-gray-600 mb-4">
                Story description placeholder. This would contain the context and 
                impact of this particular community member's experience.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Duration: 2:15</span>
                <span>Category: Education</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTestimonialsLayout = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative">
            <ImagePlaceholder
              type="video"
              size="md"
              aspect="video"
              title={`Testimonial Video ${index + 1}`}
              description="Community member testimonial"
              className="hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <svg className="w-4 h-4 text-primary-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-2">Testimonial Title</h4>
            <p className="text-sm text-gray-600 mb-3">
              "Testimonial quote placeholder that would contain a powerful 
              statement about impact and change."
            </p>
            <div className="text-xs text-gray-500">
              Duration: 1:30 • Healthcare Category
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'hero':
        return renderHeroLayout();
      case 'featured':
        return renderFeaturedLayout();
      case 'stories':
        return renderStoriesLayout();
      case 'testimonials':
        return renderTestimonialsLayout();
      default:
        return renderGridLayout();
    }
  };

  return (
    <div className={`${className}`}>
      {(title || description) && (
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          {description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{description}</p>
          )}
        </div>
      )}
      
      {renderLayout()}
      
      <div className="mt-8 text-center">
        <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
          + Add more videos
        </button>
      </div>
    </div>
  );
};

export default VideoShowcase;