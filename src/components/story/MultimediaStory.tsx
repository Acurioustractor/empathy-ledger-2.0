'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface MultimediaStoryProps {
  story: {
    id: string;
    title: string;
    video_url?: string;
    audio_url?: string;
    gallery_images?: string[];
    sections: Array<{
      id: string;
      section_title: string;
      section_content: string;
      multimedia_elements: MultimediaElement[];
      key_quotes?: string[];
    }>;
    storyteller: {
      full_name: string;
      current_role: string;
    };
  };
}

interface MultimediaElement {
  type: 'image' | 'video' | 'audio' | 'quote_highlight' | 'professional_insight' | 'timeline' | 'infographic';
  url?: string;
  text?: string;
  caption?: string;
  context?: string;
  timestamp?: string;
}

export default function MultimediaStory({ story }: MultimediaStoryProps) {
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentVideoTimestamp, setCurrentVideoTimestamp] = useState(0);

  const handleMediaClick = (mediaUrl: string) => {
    setActiveMedia(mediaUrl);
  };

  const handleVideoTimeUpdate = (currentTime: number) => {
    setCurrentVideoTimestamp(currentTime);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Video Introduction */}
      {story.video_url && (
        <div className="mb-8">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <video 
              controls 
              className="w-full h-full"
              poster="/video-posters/ben-story-poster.jpg"
              onTimeUpdate={(e) => handleVideoTimeUpdate(e.currentTarget.currentTime)}
            >
              <source src={story.video_url} type="video/mp4" />
              <track 
                kind="captions" 
                src="/video-captions/ben-story-captions.vtt" 
                srcLang="en" 
                label="English"
              />
              Your browser does not support video playback.
            </video>
            
            {/* Video Overlay with Story Context */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h3 className="text-lg font-semibold mb-1">{story.storyteller.full_name} tells his story</h3>
              <p className="text-sm opacity-90">Watch the authentic journey behind the professional narrative</p>
            </div>
          </div>
          
          {/* Video Chapter Navigation */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { title: "Small Town Foundations", time: 0 },
              { title: "Aboriginal Community Wisdom", time: 120 },
              { title: "Platform Development Journey", time: 240 },
              { title: "Future Vision", time: 360 }
            ].map((chapter, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  currentVideoTimestamp >= chapter.time && 
                  currentVideoTimestamp < (index < 3 ? 120 * (index + 2) : Infinity)
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => {
                  const video = document.querySelector('video');
                  if (video) video.currentTime = chapter.time;
                }}
              >
                {chapter.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Narration Option */}
      {story.audio_url && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
              🎧
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Listen to this story</h3>
              <p className="text-blue-700 text-sm mb-3">
                Audio narration by {story.storyteller.full_name} with ambient soundscape
              </p>
              <div className="flex items-center space-x-4">
                <audio 
                  controls 
                  className="flex-1"
                  onPlay={() => setIsAudioPlaying(true)}
                  onPause={() => setIsAudioPlaying(false)}
                >
                  <source src={story.audio_url} type="audio/mpeg" />
                  Your browser does not support audio playback.
                </audio>
                <span className="text-sm text-blue-600">
                  {isAudioPlaying ? '🎵 Playing' : '⏸️ Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Story Gallery */}
      {story.gallery_images && story.gallery_images.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-xl mb-4 text-gray-900">Visual Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {story.gallery_images.map((image, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
                onClick={() => handleMediaClick(image)}
              >
                <img
                  src={image}
                  alt={`Story visual ${index + 1}`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <span className="text-gray-800 text-xl">🔍</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Story Content with Multimedia Elements */}
      <div className="prose prose-lg max-w-none">
        {story.sections.map((section, sectionIndex) => (
          <section key={section.id} className="mb-12">
            {section.section_title && (
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{section.section_title}</h2>
            )}
            
            {/* Section Content with Embedded Media */}
            <div className="leading-relaxed text-gray-700">
              {formatContentWithMedia(section.section_content, section.multimedia_elements)}
            </div>

            {/* Multimedia Elements */}
            {section.multimedia_elements.map((element, elemIndex) => (
              <MultimediaElement 
                key={elemIndex} 
                element={element} 
                onMediaClick={handleMediaClick}
              />
            ))}

            {/* Key Quotes from Section */}
            {section.key_quotes && section.key_quotes.length > 0 && (
              <div className="my-8">
                {section.key_quotes.map((quote, quoteIndex) => (
                  <blockquote 
                    key={quoteIndex}
                    className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg my-6 relative"
                  >
                    <p className="text-lg italic text-blue-900 mb-2">"{quote}"</p>
                    <cite className="text-sm text-blue-700 font-medium">
                      — {story.storyteller.full_name}, {story.storyteller.current_role}
                    </cite>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      💾 Save Quote
                    </Button>
                  </blockquote>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Lightbox Modal for Images */}
      {activeMedia && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setActiveMedia(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={activeMedia} 
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button 
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors"
              onClick={() => setActiveMedia(null)}
            >
              ×
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-white text-center">
              <p className="text-sm opacity-90">Click anywhere to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component for rendering individual multimedia elements
function MultimediaElement({ 
  element, 
  onMediaClick 
}: { 
  element: MultimediaElement; 
  onMediaClick: (url: string) => void;
}) {
  switch (element.type) {
    case 'image':
      return (
        <figure className="my-8 text-center">
          <img 
            src={element.url} 
            alt={element.caption || 'Story image'}
            className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => element.url && onMediaClick(element.url)}
          />
          {element.caption && (
            <figcaption className="text-sm text-gray-600 mt-3 italic">
              {element.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'video':
      return (
        <div className="my-8">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video 
              controls 
              className="w-full h-full"
              poster={element.url?.replace('.mp4', '-poster.jpg')}
            >
              <source src={element.url} type="video/mp4" />
              Video not supported by your browser.
            </video>
          </div>
          {element.caption && (
            <p className="text-sm text-gray-600 mt-2">{element.caption}</p>
          )}
        </div>
      );

    case 'quote_highlight':
      return (
        <blockquote className="border-l-4 border-emerald-500 pl-6 py-4 bg-emerald-50 rounded-r-lg my-8">
          <p className="text-lg italic text-emerald-900 mb-2">"{element.text}"</p>
          {element.context && (
            <cite className="text-sm text-emerald-700 block">
              {element.context}
            </cite>
          )}
        </blockquote>
      );

    case 'professional_insight':
      return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 my-8">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
              💡
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">
                Professional Insight
              </h4>
              <p className="text-purple-700">{element.text}</p>
              {element.context && (
                <p className="text-sm text-purple-600 mt-2 italic">
                  {element.context}
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div className="my-8 p-6 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Timeline: {element.caption}
          </h4>
          <div className="text-gray-700">
            {element.text}
          </div>
        </div>
      );

    default:
      return null;
  }
}

function formatContentWithMedia(content: string, elements: MultimediaElement[]): JSX.Element {
  // Split content into paragraphs and process each one
  const paragraphs = content.split('\n\n');
  
  return (
    <div>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 leading-relaxed">
          {formatTextWithInlineElements(paragraph)}
        </p>
      ))}
    </div>
  );
}

function formatTextWithInlineElements(text: string): JSX.Element {
  // Basic text formatting
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
}