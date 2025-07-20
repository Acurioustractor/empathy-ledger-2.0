'use client';

import React, { useState, useRef } from 'react';
import MediaDisplay from '@/components/ui/MediaDisplay';
import { uploadMedia, placeholderImages } from '@/lib/supabase-media';

export default function MediaAdminPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');

      // For demo purposes, we'll just create a preview URL
      const previewUrl = URL.createObjectURL(file);

      newFiles.push({
        id: Date.now() + i,
        url: previewUrl,
        type: isVideo ? 'video' : 'image',
        title: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      });
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setUploading(false);
  };

  const placeholderCategories = [
    { key: 'hero', title: 'Hero Images', images: [placeholderImages.hero] },
    {
      key: 'community',
      title: 'Community',
      images: [placeholderImages.community, placeholderImages.workshop],
    },
    {
      key: 'portraits',
      title: 'Portraits',
      images: [placeholderImages.portrait, placeholderImages.team],
    },
    {
      key: 'impact',
      title: 'Impact Stories',
      images: [placeholderImages.impact, placeholderImages.story],
    },
  ];

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-8 md:px-12">
        <div className="mb-20">
          <h1 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-4">
            Media Gallery
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Upload and manage images and videos for your website
          </p>
        </div>

        {/* Upload Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-normal text-gray-900 mb-8">
            Upload New Media
          </h2>
          <div
            className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-light mb-2">
              {uploading
                ? 'Uploading...'
                : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 font-light">
              Supports JPG, PNG, GIF, MP4, MOV up to 50MB
            </p>
          </div>
        </section>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-normal text-gray-900 mb-8">
              Recent Uploads
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uploadedFiles.map(file => (
                <div key={file.id} className="group">
                  <MediaDisplay
                    src={file.url}
                    alt={file.title}
                    type={file.type}
                    aspectRatio="square"
                    rounded="2xl"
                  />
                  <div className="mt-3">
                    <p className="text-sm font-normal text-gray-900 truncate">
                      {file.title}
                    </p>
                    <p className="text-xs text-gray-500 font-light">
                      {file.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Placeholder Images */}
        <section>
          <h2 className="text-2xl font-normal text-gray-900 mb-8">
            Available Placeholder Images
          </h2>
          <p className="text-gray-600 font-light mb-12">
            These are high-quality placeholder images you can use throughout
            your site. Copy the URL to use them in your content.
          </p>

          {placeholderCategories.map(category => (
            <div key={category.key} className="mb-16">
              <h3 className="text-xl font-normal text-gray-900 mb-6">
                {category.title}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.images.map((image, index) => (
                  <div key={index} className="group">
                    <MediaDisplay
                      src={image}
                      alt={`${category.title} ${index + 1}`}
                      aspectRatio="video"
                      rounded="2xl"
                    />
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 font-light mb-2">
                        Image URL:
                      </p>
                      <code className="text-xs text-gray-700 break-all font-mono">
                        {image}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(image)}
                        className="mt-3 text-sm text-gray-600 hover:text-gray-900 font-light transition-colors"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Instructions */}
        <section className="mt-20 bg-gray-50 rounded-3xl p-12">
          <h2 className="text-2xl font-normal text-gray-900 mb-6">
            How to Use Images
          </h2>
          <div className="space-y-4 text-gray-600 font-light">
            <p>
              1. <strong className="font-normal">Upload your images</strong>{' '}
              using the upload area above
            </p>
            <p>
              2. <strong className="font-normal">Use placeholder images</strong>{' '}
              by copying their URLs
            </p>
            <p>
              3. <strong className="font-normal">Add to pages</strong> using the
              MediaDisplay component:
            </p>
            <pre className="bg-white p-4 rounded-xl mt-4 text-sm font-mono overflow-x-auto">
              {`<MediaDisplay
  src="your-image-url"
  alt="Description"
  aspectRatio="video"
  rounded="3xl"
/>`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
