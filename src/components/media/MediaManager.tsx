'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  description: string;
  category: string;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'ready' | 'published';
  consentStatus: 'pending' | 'approved' | 'declined';
}

interface MediaManagerProps {
  userRole?: 'storyteller' | 'admin' | 'community';
  allowedCategories?: string[];
  className?: string;
}

const MediaManager: React.FC<MediaManagerProps> = ({
  userRole = 'storyteller',
  allowedCategories = ['story', 'community', 'impact'],
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedCategory, setSelectedCategory] = useState('story');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mockMediaItems: MediaItem[] = [
    {
      id: '1',
      type: 'photo',
      title: 'Community Workshop Sydney',
      description: 'Story-sharing session with 30+ participants',
      category: 'community',
      uploadDate: '2024-01-15',
      status: 'published',
      consentStatus: 'approved'
    },
    {
      id: '2',
      type: 'video',
      title: 'Healthcare Journey Story',
      description: 'Personal story about accessing mental health support',
      category: 'story',
      uploadDate: '2024-01-14',
      status: 'ready',
      consentStatus: 'approved'
    },
    {
      id: '3',
      type: 'photo',
      title: 'Before: Perth Health Center',
      description: 'Original facility layout and accessibility issues',
      category: 'impact',
      uploadDate: '2024-01-13',
      status: 'processing',
      consentStatus: 'pending'
    }
  ];

  const categories = [
    { key: 'story', name: 'Personal Stories', description: 'Individual storyteller content' },
    { key: 'community', name: 'Community Events', description: 'Workshops, meetings, gatherings' },
    { key: 'impact', name: 'Impact Documentation', description: 'Before/after, policy changes' },
    { key: 'team', name: 'Team & Partners', description: 'Behind the scenes content' },
    { key: 'testimonial', name: 'Testimonials', description: 'Community member endorsements' }
  ];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const renderUploadTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload New Media</h3>
        <p className="text-gray-600 mb-6">
          Share photos and videos that document community storytelling and its impact. 
          All uploads require explicit consent from featured individuals.
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Category
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          {categories.filter(cat => allowedCategories.includes(cat.key)).map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedCategory === category.key
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{category.name}</div>
              <div className="text-sm text-gray-600">{category.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Upload Files
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-300 hover:bg-primary-50 transition-all">
          <div className="text-6xl mb-4">📁</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Drop files here or click to browse
          </h4>
          <p className="text-gray-600 mb-4">
            Supports: JPG, PNG, GIF, MP4, MOV (max 100MB per file)
          </p>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="secondary" className="cursor-pointer">
              Choose Files
            </Button>
          </label>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Form */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Descriptive title for your media"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
            Location (optional)
          </label>
          <select
            id="location"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select location...</option>
            <option value="NSW">New South Wales</option>
            <option value="VIC">Victoria</option>
            <option value="QLD">Queensland</option>
            <option value="WA">Western Australia</option>
            <option value="SA">South Australia</option>
            <option value="TAS">Tasmania</option>
            <option value="NT">Northern Territory</option>
            <option value="ACT">Australian Capital Territory</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe the context, people, and story behind this media..."
        />
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-gray-900 mb-2">Consent Requirements</h4>
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                required
              />
              <span className="ml-3 text-sm text-gray-700">
                I have explicit consent from all individuals featured in this media to share their image/voice for community storytelling purposes.
              </span>
            </label>
            <label className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                required
              />
              <span className="ml-3 text-sm text-gray-700">
                I confirm this media represents authentic community storytelling activities and will benefit the broader community.
              </span>
            </label>
            <label className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
              />
              <span className="ml-3 text-sm text-gray-700">
                I consent to this media being used in Empathy Ledger promotional materials, case studies, and community galleries.
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="cta" size="lg">
          Upload & Submit for Review
        </Button>
      </div>
    </div>
  );

  const renderLibraryTab = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Media Library</h3>
          <p className="text-gray-600">Manage your uploaded photos and videos</p>
        </div>
        <Button variant="secondary" onClick={() => setActiveTab('upload')}>
          + Upload New Media
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium">
          All Media
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
          Photos
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
          Videos
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
          Published
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
          Pending Review
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMediaItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              <ImagePlaceholder
                type={item.type}
                size="md"
                aspect="video"
                title={item.title}
                description={item.description}
                className=""
                showIcon={true}
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'published' ? 'bg-green-100 text-green-800' :
                  item.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.consentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  item.consentStatus === 'declined' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.consentStatus}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{item.category}</span>
                <span>{item.uploadDate}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upload Media
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'library'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Media Library
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        {activeTab === 'upload' ? renderUploadTab() : renderLibraryTab()}
      </div>
    </div>
  );
};

export default MediaManager;