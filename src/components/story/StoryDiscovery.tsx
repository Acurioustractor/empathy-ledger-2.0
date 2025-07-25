'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface StoryCard {
  id: string;
  title: string;
  storyteller: {
    full_name: string;
    current_role: string;
    current_organization: string;
    avatar_url?: string;
  };
  summary: string;
  themes: string[];
  story_type: 'primary' | 'supporting' | 'insight' | 'case_study';
  reading_time_minutes: number;
  view_count: number;
  engagement_score: number;
  featured_image_url?: string;
  access_level: 'public' | 'premium' | 'organizational';
  professional_outcomes: string[];
}

interface StoryCategory {
  name: string;
  description: string;
  count: number;
  icon: string;
  featured_themes: string[];
}

export default function StoryDiscovery() {
  const [featuredStories, setFeaturedStories] = useState<StoryCard[]>([]);
  const [categories, setCategories] = useState<StoryCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'engagement' | 'recent' | 'popular'>('engagement');
  const [filteredStories, setFilteredStories] = useState<StoryCard[]>([]);

  useEffect(() => {
    loadFeaturedStories();
    loadCategories();
  }, []);

  useEffect(() => {
    filterAndSortStories();
  }, [searchQuery, selectedCategory, sortBy, featuredStories]);

  const loadFeaturedStories = () => {
    // Demo data for featured stories
    const demoStories: StoryCard[] = [
      {
        id: 'muswellbrook-to-global',
        title: 'From Muswellbrook to Global Platform',
        storyteller: {
          full_name: 'Ben Knight',
          current_role: 'Founder & Platform Builder',
          current_organization: 'A Curious Tractor',
          avatar_url: '/avatars/ben-knight.jpg'
        },
        summary: 'How small-town values shaped the development of community-centered technology that honors Indigenous wisdom while creating economic opportunities for storytellers.',
        themes: ['Community Building', 'Platform Development', 'Aboriginal Wisdom', 'Ethical Technology'],
        story_type: 'primary',
        reading_time_minutes: 12,
        view_count: 1247,
        engagement_score: 85.2,
        featured_image_url: '/story-covers/ben-muswellbrook.jpg',
        access_level: 'premium',
        professional_outcomes: [
          'Community-centered platform development methodology',
          'Aboriginal cultural protocol integration in technology',
          'Economic justice through platform ownership models'
        ]
      },
      {
        id: 'beam-healing-networks',
        title: 'Building Healing Networks in Black Communities',
        storyteller: {
          full_name: 'BEAM Collective',
          current_role: 'Community Healing Organization',
          current_organization: 'Black Lives Matter Healing Justice Committee',
          avatar_url: '/avatars/beam-collective.jpg'
        },
        summary: 'Creating mental health resources that honor Black wellness traditions while building community-controlled healing infrastructure outside traditional clinical models.',
        themes: ['Community Health', 'Black Wellness', 'Healing Justice', 'Community Ownership'],
        story_type: 'primary',
        reading_time_minutes: 8,
        view_count: 892,
        engagement_score: 92.1,
        featured_image_url: '/story-covers/beam-healing.jpg',
        access_level: 'premium',
        professional_outcomes: [
          'Community-controlled healing program development',
          'Black wellness cultural competency framework',
          'Trauma-informed community organizing methods'
        ]
      },
      {
        id: 'indigenous-data-sovereignty',
        title: 'OCAP Principles in Digital Platform Design',
        storyteller: {
          full_name: 'First Nations Information Governance Centre',
          current_role: 'Indigenous Data Sovereignty Leadership',
          current_organization: 'FNIGC',
          avatar_url: '/avatars/fnigc-team.jpg'
        },
        summary: 'Implementing Ownership, Control, Access, and Possession principles in technology design to ensure Indigenous communities maintain sovereignty over their digital presence.',
        themes: ['Data Sovereignty', 'Indigenous Rights', 'Technology Ethics', 'Community Governance'],
        story_type: 'case_study',
        reading_time_minutes: 15,
        view_count: 654,
        engagement_score: 88.7,
        featured_image_url: '/story-covers/fnigc-sovereignty.jpg',
        access_level: 'organizational',
        professional_outcomes: [
          'Indigenous data governance framework implementation',
          'OCAP principles in technology development',
          'Community-accountable platform design methods'
        ]
      },
      {
        id: 'climate-justice-organizing',
        title: 'Front-line Communities Leading Climate Solutions',
        storyteller: {
          full_name: 'Climate Justice Alliance',
          current_role: 'Front-line Community Organizers',
          current_organization: 'Climate Justice Alliance',
          avatar_url: '/avatars/cja-organizers.jpg'
        },
        summary: 'How communities most impacted by climate change are developing just transition strategies that prioritize community ownership and environmental justice.',
        themes: ['Climate Justice', 'Community Organizing', 'Environmental Justice', 'Just Transition'],
        story_type: 'supporting',
        reading_time_minutes: 10,
        view_count: 543,
        engagement_score: 79.3,
        featured_image_url: '/story-covers/cja-organizing.jpg',
        access_level: 'public',
        professional_outcomes: [
          'Just transition strategy development',
          'Front-line community organizing methods',
          'Environmental justice campaign design'
        ]
      },
      {
        id: 'youth-justice-innovation',
        title: 'Transforming Youth Justice Through Community Investment',
        storyteller: {
          full_name: 'Dream Defenders',
          current_role: 'Youth Justice Organizers',
          current_organization: 'Dream Defenders',
          avatar_url: '/avatars/dream-defenders.jpg'
        },
        summary: 'Building alternatives to youth incarceration through community-controlled investment in education, mental health, and economic opportunity for young people.',
        themes: ['Youth Justice', 'Community Investment', 'Abolition', 'Education Innovation'],
        story_type: 'supporting',
        reading_time_minutes: 9,
        view_count: 423,
        engagement_score: 81.6,
        featured_image_url: '/story-covers/dream-defenders.jpg',
        access_level: 'premium',
        professional_outcomes: [
          'Youth justice alternative program development',
          'Community investment strategy design',
          'Restorative justice implementation methods'
        ]
      }
    ];
    
    setFeaturedStories(demoStories);
  };

  const loadCategories = () => {
    const demoCategories: StoryCategory[] = [
      {
        name: 'Community Organizing',
        description: 'Grassroots organizing, community building, and social movement leadership',
        count: 23,
        icon: '🤝',
        featured_themes: ['Community Building', 'Social Movement', 'Grassroots Organizing']
      },
      {
        name: 'Technology Innovation',
        description: 'Ethical technology development, platform building, and digital justice',
        count: 18,
        icon: '⚡',
        featured_themes: ['Platform Development', 'Ethical Technology', 'Digital Justice']
      },
      {
        name: 'Healthcare Innovation',
        description: 'Community health, healing justice, and wellness innovation',
        count: 15,
        icon: '🏥',
        featured_themes: ['Community Health', 'Healing Justice', 'Wellness Innovation']
      },
      {
        name: 'Environmental Justice',
        description: 'Climate justice, environmental organizing, and just transition',
        count: 12,
        icon: '🌱',
        featured_themes: ['Climate Justice', 'Environmental Organizing', 'Just Transition']
      },
      {
        name: 'Educational Innovation',
        description: 'Community education, youth development, and learning alternatives',
        count: 20,
        icon: '📚',
        featured_themes: ['Community Education', 'Youth Development', 'Alternative Learning']
      },
      {
        name: 'Arts & Culture',
        description: 'Cultural organizing, creative practice, and artistic community building',
        count: 14,
        icon: '🎨',
        featured_themes: ['Cultural Organizing', 'Creative Practice', 'Community Arts']
      },
      {
        name: 'Economic Justice',
        description: 'Cooperative development, community ownership, and economic democracy',
        count: 16,
        icon: '💰',
        featured_themes: ['Cooperative Development', 'Community Ownership', 'Economic Democracy']
      },
      {
        name: 'Youth Development',
        description: 'Youth organizing, leadership development, and intergenerational wisdom',
        count: 19,
        icon: '🌟',
        featured_themes: ['Youth Organizing', 'Leadership Development', 'Intergenerational Work']
      }
    ];
    
    setCategories(demoCategories);
  };

  const filterAndSortStories = () => {
    let filtered = [...featuredStories];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.themes.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase())) ||
        story.storyteller.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filtered = filtered.filter(story =>
          story.themes.some(theme => category.featured_themes.includes(theme))
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagement_score - a.engagement_score;
        case 'popular':
          return b.view_count - a.view_count;
        case 'recent':
          return new Date().getTime() - new Date().getTime(); // Demo: would use actual dates
        default:
          return 0;
      }
    });

    setFilteredStories(filtered);
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'organizational': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStoryTypeIcon = (type: string) => {
    switch (type) {
      case 'primary': return '⭐';
      case 'supporting': return '📖';
      case 'insight': return '💡';
      case 'case_study': return '📊';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Discover Professional Stories</h1>
        <p className="text-gray-600 text-lg">
          Explore authentic professional journeys from community-centered leaders and innovators
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-white rounded-lg border shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search stories by theme, expertise, storyteller, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'engagement' | 'recent' | 'popular')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="engagement">Highest Engagement</option>
            <option value="popular">Most Views</option>
            <option value="recent">Recently Published</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredStories.length} of {featuredStories.length} stories
          {searchQuery && <span> matching "{searchQuery}"</span>}
          {selectedCategory !== 'all' && <span> in {selectedCategory}</span>}
        </div>
      </div>

      {/* Featured Stories Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {searchQuery || selectedCategory !== 'all' ? 'Filtered Stories' : 'Featured Stories'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
              {story.featured_image_url && (
                <img 
                  src={story.featured_image_url} 
                  alt={story.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              
              <div className="p-6">
                {/* Story Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${getAccessLevelColor(story.access_level)}`}>
                      {story.access_level}
                    </span>
                    <span className="text-sm">
                      {getStoryTypeIcon(story.story_type)} {story.story_type}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">{story.reading_time_minutes} min</span>
                </div>

                {/* Story Content */}
                <h3 className="font-semibold text-lg mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {story.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.summary}</p>

                {/* Themes */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.themes.slice(0, 3).map((theme, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {theme}
                    </span>
                  ))}
                  {story.themes.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                      +{story.themes.length - 3} more
                    </span>
                  )}
                </div>

                {/* Storyteller Info */}
                <div className="flex items-center space-x-3 mb-4">
                  {story.storyteller.avatar_url && (
                    <img 
                      src={story.storyteller.avatar_url}
                      alt={story.storyteller.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-sm text-gray-900">{story.storyteller.full_name}</div>
                    <div className="text-xs text-gray-600">{story.storyteller.current_organization}</div>
                  </div>
                </div>

                {/* Professional Outcomes Preview */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Professional Insights:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {story.professional_outcomes.slice(0, 2).map((outcome, index) => (
                      <li key={index}>• {outcome}</li>
                    ))}
                  </ul>
                </div>

                {/* Stats and Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>👁️ {story.view_count.toLocaleString()}</span>
                    <span>⚡ {story.engagement_score}% engagement</span>
                  </div>
                  <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Read Story →
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Explore by Focus Area</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div 
              key={category.name} 
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer ${
                selectedCategory === category.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedCategory(category.name)}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-medium mb-1 text-gray-900">{category.name}</h3>
              <p className="text-gray-600 text-xs mb-2">{category.description}</p>
              <p className="text-gray-500 text-sm font-medium">{category.count} stories</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Call-to-Action */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Join the Storytelling Community</h3>
        <p className="text-gray-700 mb-6">
          Share your professional journey and connect with organizations seeking authentic community expertise.
        </p>
        <div className="flex justify-center space-x-4">
          <Button>Apply for $1000 Storyteller Program</Button>
          <Button variant="outline">Learn About Platform</Button>
        </div>
      </div>
    </div>
  );
}