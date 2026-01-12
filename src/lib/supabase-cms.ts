import { createClient } from './supabase-client';

// Get shared Supabase client instance
let supabase: any = null;

async function getSupabase() {
  if (!supabase) {
    supabase = await createClient();
  }
  return supabase;
}

// ===================================
// EMPATHY LEDGER CMS DATA TYPES
// ===================================

export interface Story {
  id: string;
  title: string;
  story_transcript?: string;
  story_copy?: string;
  story_image_url?: string;
  video_story_link?: string;
  embed_code?: string;
  linked_storytellers?: string[];
  linked_media?: string[];
  linked_quotes?: string[];
  linked_themes?: string[];
  status: string;
  featured: boolean;
  project_id?: string;
  created_at: string;
  updated_at: string;
  
  // Legacy fields for backward compatibility
  content?: string;
  transcription?: string;
  audio_url?: string;
  video_url?: string;
  category?: string;
  privacy_level?: string;
  community_id?: string;
  organization_id?: string;
  contributor_age_range?: string;
  contributor_location?: string;
  themes?: string[];
  sentiment_score?: number;
  impact_metrics?: Record<string, any>;
}

export interface CommunityInsight {
  id: string;
  title: string;
  description: string;
  story_count: number;
  affected_population: number;
  key_findings: string[];
  recommendations: string[];
  policy_impact?: string[];
  category: string;
  location: string;
  date_generated: string;
  confidence_score: number;
  visualization_data?: Record<string, any>;
}

export interface ContentBlock {
  id: string;
  page_slug: string;
  section_name: string;
  content_type: 'text' | 'media' | 'insight' | 'story_collection' | 'metric';
  content_data: Record<string, any>;
  display_order: number;
  is_active: boolean;
  project_id?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteMetric {
  id: string;
  metric_name: string;
  metric_value: string | number;
  metric_type:
    | 'story_count'
    | 'community_count'
    | 'policy_changes'
    | 'value_created';
  description: string;
  last_updated: string;
  display_format: 'number' | 'currency' | 'percentage';
  is_featured: boolean;
}

// ===================================
// STORY MANAGEMENT FUNCTIONS
// ===================================

export async function getStoriesByCategory(
  category: string,
  limit: number = 10,
  projectId?: string,
  organizationId?: string
): Promise<Story[]> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available - using mock data');
      return mockStories
        .filter(story => story.category === category)
        .slice(0, limit);
    }

    let queryBuilder = supabase
      .from('stories')
      .select('*')
      .eq('status', 'Published');
    
    if (projectId) {
      queryBuilder = queryBuilder.eq('project_id', projectId);
    }
    
    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (
      data ||
      mockStories.filter(story => story.category === category).slice(0, limit)
    );
  } catch (error) {
    console.error('Error fetching stories by category:', error);
    // Return mock data filtered by category when Supabase is not available
    return mockStories
      .filter(story => story.category === category)
      .slice(0, limit);
  }
}

export async function getFeaturedStories(
  limit: number = 3,
  projectId?: string,
  organizationId?: string
): Promise<Story[]> {
  try {
    let queryBuilder = supabase
      .from('stories')
      .select('*')
      .eq('featured', true)
      .eq('status', 'Published');
    
    if (projectId) {
      queryBuilder = queryBuilder.eq('project_id', projectId);
    }
    
    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured stories:', error);
    return [];
  }
}

export async function getStoryAnalytics(): Promise<{
  total_stories: number;
  stories_by_category: Record<string, number>;
  monthly_growth: number;
  sentiment_distribution: Record<string, number>;
}> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      return {
        total_stories: 43,
        stories_by_category: {
          healthcare: 12,
          education: 8,
          housing: 10,
          youth: 6,
          'elder-care': 4,
          policy: 3,
        },
        monthly_growth: 12.5,
        sentiment_distribution: {
          positive: 45,
          neutral: 35,
          negative: 20,
        },
      };
    }
    // Get total story count
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Published');

    // Get stories by linked themes (simplified)
    const { data: storyData } = await supabase
      .from('stories')
      .select('linked_themes')
      .eq('status', 'Published');

    const storiesByCategory =
      storyData?.reduce(
        (acc, story) => {
          // Count stories by themes
          if (story.linked_themes && Array.isArray(story.linked_themes)) {
            story.linked_themes.forEach((theme: string) => {
              acc[theme] = (acc[theme] || 0) + 1;
            });
          }
          return acc;
        },
        {} as Record<string, number>
      ) || {};

    // Calculate monthly growth (simplified)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { count: recentStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Published')
      .gte('created_at', oneMonthAgo.toISOString());

    return {
      total_stories: totalStories || 0,
      stories_by_category: storiesByCategory,
      monthly_growth: recentStories || 0,
      sentiment_distribution: {
        positive: 0.65,
        neutral: 0.25,
        negative: 0.1,
      },
    };
  } catch (error) {
    console.error('Error getting story analytics:', error);
    // Return mock analytics data when Supabase is not available
    return {
      total_stories: 1847,
      stories_by_category: {
        healthcare: 423,
        education: 312,
        housing: 267,
        youth: 245,
        'elder-care': 189,
        policy: 411,
      },
      monthly_growth: 89,
      sentiment_distribution: {
        positive: 0.65,
        neutral: 0.25,
        negative: 0.1,
      },
    };
  }
}

// ===================================
// COMMUNITY INSIGHTS FUNCTIONS
// ===================================

export async function getCommunityInsights(
  limit: number = 6
): Promise<CommunityInsight[]> {
  try {
    const { data, error } = await supabase
      .from('community_insights')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || mockInsights.slice(0, limit);
  } catch (error) {
    console.error('Error fetching community insights:', error);
    // Return mock data when Supabase is not available
    return mockInsights.slice(0, limit);
  }
}

export async function getInsightsByLocation(
  location: string
): Promise<CommunityInsight[]> {
  try {
    const { data, error } = await supabase
      .from('community_insights')
      .select('*')
      .eq('location', location)
      .order('date_generated', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching insights by location:', error);
    return [];
  }
}

// ===================================
// DYNAMIC CONTENT FUNCTIONS
// ===================================

export async function getPageContent(
  pageSlug: string,
  projectId?: string,
  organizationId?: string
): Promise<ContentBlock[]> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available - returning empty content');
      return [];
    }

    let queryBuilder = supabase
      .from('content_blocks')
      .select('*')
      .eq('page_slug', pageSlug)
      .eq('is_active', true);
    
    if (projectId) {
      queryBuilder = queryBuilder.eq('project_id', projectId);
    }
    
    if (organizationId && !projectId) {
      queryBuilder = queryBuilder.eq('organization_id', organizationId);
    }
    
    const { data, error } = await queryBuilder
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching page content:', error);
    return [];
  }
}

export async function updatePageContent(
  pageSlug: string,
  sectionName: string,
  contentData: any
): Promise<boolean> {
  try {
    const { error } = await supabase.from('content_blocks').upsert({
      page_slug: pageSlug,
      section_name: sectionName,
      content_data: contentData,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating page content:', error);
    return false;
  }
}

// ===================================
// SITE METRICS FUNCTIONS
// ===================================

export async function getSiteMetrics(): Promise<SiteMetric[]> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      console.warn('Supabase client not available - using mock data');
      return mockSiteMetrics;
    }

    const { data, error } = await supabase
      .from('site_metrics')
      .select('*')
      .eq('is_featured', true)
      .order('metric_type');

    if (error) throw error;
    return data || mockSiteMetrics;
  } catch (error) {
    console.error('Error fetching site metrics:', error);
    // Return mock data when Supabase is not available
    return mockSiteMetrics;
  }
}

export async function updateMetric(
  metricName: string,
  value: string | number
): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      console.warn('Supabase client not available - cannot update metric');
      return false;
    }

    const { error } = await supabase
      .from('site_metrics')
      .update({
        metric_value: value,
        last_updated: new Date().toISOString(),
      })
      .eq('metric_name', metricName);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating metric:', error);
    return false;
  }
}

// ===================================
// SEARCH AND FILTERING
// ===================================

export async function searchStories(
  query: string,
  filters?: {
    category?: string;
    location?: string;
    dateRange?: { start: string; end: string };
    projectId?: string;
    organizationId?: string;
  }
): Promise<Story[]> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      console.warn('Supabase client not available - returning empty results');
      return [];
    }
    
    let queryBuilder = supabase
      .from('stories')
      .select('*')
      .eq('status', 'Published')
      .or(
        `title.ilike.%${query}%,story_transcript.ilike.%${query}%,story_copy.ilike.%${query}%`
      );

    // Category filtering removed - using themes instead

    if (filters?.location) {
      queryBuilder = queryBuilder.eq('contributor_location', filters.location);
    }
    
    if (filters?.projectId) {
      queryBuilder = queryBuilder.eq('project_id', filters.projectId);
    }
    
    if (filters?.organizationId && !filters?.projectId) {
      queryBuilder = queryBuilder.eq('organization_id', filters.organizationId);
    }

    if (filters?.dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching stories:', error);
    return [];
  }
}

// ===================================
// MULTI-TENANT PROJECT/ORGANIZATION FUNCTIONS
// ===================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  status: string;
  project_type?: string;
  metadata?: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  location?: string;
  contact_info?: string;
  active: boolean;
  created_at: string;
}

export async function getProjects(organizationId?: string): Promise<Project[]> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      console.warn('Supabase client not available - returning empty projects');
      return [];
    }

    let queryBuilder = supabase
      .from('projects')
      .select('*')
      .eq('active', true);

    if (organizationId) {
      queryBuilder = queryBuilder.eq('organization_id', organizationId);
    }

    const { data, error } = await queryBuilder
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getOrganizations(): Promise<Organization[]> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      console.warn('Supabase client not available - returning empty organizations');
      return [];
    }

    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

export async function getProjectAnalytics(projectId: string): Promise<{
  story_count: number;
  storyteller_count: number;
  location_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
}> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      return {
        story_count: 0,
        storyteller_count: 0,
        location_distribution: {},
        category_distribution: {}
      };
    }

    // Get story count for project
    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'Published');

    // Get storyteller count for project
    const { count: storytellerCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    // Get location distribution
    const { data: locationData } = await supabase
      .from('users')
      .select(`
        primary_location_id,
        locations!inner(name)
      `)
      .eq('project_id', projectId)
      .not('primary_location_id', 'is', null);

    const locationDistribution = locationData?.reduce((acc, user) => {
      const locationName = (user as any).locations?.name;
      if (locationName) {
        acc[locationName] = (acc[locationName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Get theme distribution from stories
    const { data: themeData } = await supabase
      .from('stories')
      .select('linked_themes')
      .eq('project_id', projectId)
      .eq('status', 'Published');

    const categoryDistribution = themeData?.reduce((acc, story) => {
      if (story.linked_themes && Array.isArray(story.linked_themes)) {
        story.linked_themes.forEach((theme: string) => {
          acc[theme] = (acc[theme] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      story_count: storyCount || 0,
      storyteller_count: storytellerCount || 0,
      location_distribution: locationDistribution,
      category_distribution: categoryDistribution
    };
  } catch (error) {
    console.error('Error getting project analytics:', error);
    return {
      story_count: 0,
      storyteller_count: 0,
      location_distribution: {},
      category_distribution: {}
    };
  }
}

export async function getOrganizationAnalytics(organizationId: string): Promise<{
  project_count: number;
  total_storytellers: number;
  total_stories: number;
  projects: Array<{ name: string; storyteller_count: number; story_count: number }>;
}> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      return {
        project_count: 0,
        total_storytellers: 0,
        total_stories: 0,
        projects: []
      };
    }

    // Get projects for organization
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('organization_id', organizationId)
      .eq('active', true);

    const projectIds = projects?.map(p => p.id) || [];

    // Get total storytellers for organization
    const { count: storytellerCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds);

    // Get total stories for organization
    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('status', 'Published');

    // Get per-project stats
    const projectStats = await Promise.all(
      projects?.map(async (project) => {
        const { count: projectStorytellerCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        const { count: projectStoryCount } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('status', 'Published');

        return {
          name: project.name,
          storyteller_count: projectStorytellerCount || 0,
          story_count: projectStoryCount || 0
        };
      }) || []
    );

    return {
      project_count: projects?.length || 0,
      total_storytellers: storytellerCount || 0,
      total_stories: storyCount || 0,
      projects: projectStats
    };
  } catch (error) {
    console.error('Error getting organization analytics:', error);
    return {
      project_count: 0,
      total_storytellers: 0,
      total_stories: 0,
      projects: []
    };
  }
}

// ===================================
// MOCK DATA FOR DEVELOPMENT
// ===================================

export const mockStories: Story[] = [
  {
    id: 'story-1',
    title: 'Healthcare Access in Brisbane',
    story_transcript: 'After sharing my experience with mental health services, the community center implemented 24/7 support lines...',
    linked_themes: ['mental health', 'accessibility', 'community support'],
    status: 'Published',
    featured: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'story-2',
    title: 'Education Pathways for Indigenous Youth',
    story_transcript: 'Our voices led to culturally responsive teaching programs in three universities...',
    linked_themes: ['indigenous education', 'cultural safety', 'youth empowerment'],
    status: 'Published',
    featured: false,
    created_at: '2024-01-10T14:00:00Z',
    updated_at: '2024-01-10T14:00:00Z',
  },
];

export const mockInsights: CommunityInsight[] = [
  {
    id: 'insight-1',
    title: 'Mental Health Service Gaps',
    description:
      'Analysis of 347 stories reveals critical after-hours support needs',
    story_count: 347,
    affected_population: 15000,
    key_findings: [
      'Peak crisis times between 6PM-12AM underserved',
      'Young adults (18-25) face longest wait times',
      'Community centers preferred over hospitals for initial support',
    ],
    recommendations: [
      'Implement 24/7 community-based crisis support',
      'Youth-specific mental health programs',
      'Train community workers in crisis intervention',
    ],
    policy_impact: [
      'City Council Motion 2024-15 approved',
      'State funding allocation increased 40%',
    ],
    category: 'healthcare',
    location: 'Brisbane',
    date_generated: '2024-01-20T00:00:00Z',
    confidence_score: 0.92,
  },
];

export const mockSiteMetrics: SiteMetric[] = [
  {
    id: 'metric-1',
    metric_name: 'total_stories',
    metric_value: 1847,
    metric_type: 'story_count',
    description: 'Stories shared across all communities',
    last_updated: '2024-01-20T12:00:00Z',
    display_format: 'number',
    is_featured: true,
  },
  {
    id: 'metric-2',
    metric_name: 'policy_changes',
    metric_value: 67,
    metric_type: 'policy_changes',
    description: 'Policy changes driven by community insights',
    last_updated: '2024-01-20T12:00:00Z',
    display_format: 'number',
    is_featured: true,
  },
  {
    id: 'metric-3',
    metric_name: 'value_created',
    metric_value: 2300000,
    metric_type: 'value_created',
    description: 'Value returned to storytellers and communities',
    last_updated: '2024-01-20T12:00:00Z',
    display_format: 'currency',
    is_featured: true,
  },
];
