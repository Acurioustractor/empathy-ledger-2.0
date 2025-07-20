import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===================================
// EMPATHY LEDGER CMS DATA TYPES
// ===================================

export interface Story {
  id: string;
  title: string;
  content: string;
  transcription?: string;
  audio_url?: string;
  video_url?: string;
  category:
    | 'healthcare'
    | 'education'
    | 'housing'
    | 'youth'
    | 'elder-care'
    | 'policy';
  privacy_level: 'public' | 'community' | 'private';
  community_id?: string;
  contributor_age_range?: string;
  contributor_location?: string;
  themes: string[];
  sentiment_score?: number;
  impact_metrics?: Record<string, any>;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'pending' | 'approved' | 'featured';
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
  limit: number = 10
): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('category', category)
      .eq('status', 'approved')
      .eq('privacy_level', 'public')
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

export async function getFeaturedStories(limit: number = 3): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('status', 'featured')
      .eq('privacy_level', 'public')
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
    // Get total story count
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Get stories by category
    const { data: categoryData } = await supabase
      .from('stories')
      .select('category')
      .eq('status', 'approved');

    const storiesByCategory =
      categoryData?.reduce(
        (acc, story) => {
          acc[story.category] = (acc[story.category] || 0) + 1;
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
      .eq('status', 'approved')
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
  pageSlug: string
): Promise<ContentBlock[]> {
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('page_slug', pageSlug)
      .eq('is_active', true)
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
  }
): Promise<Story[]> {
  try {
    let queryBuilder = supabase
      .from('stories')
      .select('*')
      .eq('status', 'approved')
      .eq('privacy_level', 'public')
      .or(
        `title.ilike.%${query}%,content.ilike.%${query}%,themes.cs.{${query}}`
      );

    if (filters?.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters?.location) {
      queryBuilder = queryBuilder.eq('contributor_location', filters.location);
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
// MOCK DATA FOR DEVELOPMENT
// ===================================

export const mockStories: Story[] = [
  {
    id: 'story-1',
    title: 'Healthcare Access in Brisbane',
    content:
      'After sharing my experience with mental health services, the community center implemented 24/7 support lines...',
    category: 'healthcare',
    privacy_level: 'public',
    themes: ['mental health', 'accessibility', 'community support'],
    sentiment_score: 0.8,
    impact_metrics: { people_helped: 347, policy_changes: 2 },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    status: 'featured',
  },
  {
    id: 'story-2',
    title: 'Education Pathways for Indigenous Youth',
    content:
      'Our voices led to culturally responsive teaching programs in three universities...',
    category: 'education',
    privacy_level: 'public',
    themes: ['indigenous education', 'cultural safety', 'youth empowerment'],
    sentiment_score: 0.9,
    impact_metrics: { students_affected: 1200, completion_rate_increase: 67 },
    created_at: '2024-01-10T14:00:00Z',
    updated_at: '2024-01-10T14:00:00Z',
    status: 'approved',
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
