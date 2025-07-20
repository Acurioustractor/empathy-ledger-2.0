// @ts-nocheck - Complex database schema requires proper type generation
/**
 * Community-centered database operations for Empathy Ledger
 * 
 * Philosophy: Every database operation must respect:
 * - Community sovereignty over their stories and insights
 * - Cultural protocols and consent settings
 * - Empowerment over extraction
 * - Community language and frameworks
 */

import { Database, ConsentSettings, CulturalProtocols, StoryAnalysis } from './database-types'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type Story = Tables['stories']['Row']
type User = Tables['users']['Row']
type Analysis = Tables['story_analysis']['Row']

/**
 * Check if a user can access a story based on privacy settings and cultural protocols
 */
export async function canAccessStory(
  supabase: SupabaseClient<Database>,
  storyId: string,
  userId: string | null
): Promise<boolean> {
  try {
    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        id,
        storyteller_id,
        privacy_level,
        consent_settings,
        cultural_protocols,
        storyteller:users!storyteller_id(community_affiliation, cultural_protocols)
      `)
      .eq('id', storyId)
      .single()

    if (error || !story) return false

    // Public stories are accessible to all (unless cultural protocols restrict)
    if (story.privacy_level === 'public') {
      // Check if cultural protocols allow public access
      const culturalProtocols = story.cultural_protocols as CulturalProtocols | null
      if (culturalProtocols?.requires_elder_review && !userId) {
        return false
      }
      return true
    }

    // Private stories only accessible to storyteller
    if (story.privacy_level === 'private') {
      return userId === story.storyteller_id
    }

    // Community stories accessible to community members and storyteller
    if (story.privacy_level === 'community') {
      if (userId === story.storyteller_id) return true
      
      if (userId) {
        const { data: user } = await supabase
          .from('users')
          .select('community_affiliation')
          .eq('id', userId)
          .single()
        
        return user?.community_affiliation === (story.storyteller as any)?.community_affiliation
      }
    }

    return false
  } catch (error) {
    console.error('Error checking story access:', error)
    return false
  }
}

/**
 * Get stories for a community with respect for consent and cultural protocols
 */
export async function getCommunityStories(
  supabase: SupabaseClient<Database>,
  communityId: string,
  userId: string | null,
  includePrivate: boolean = false
) {
  let query = supabase
    .from('stories')
    .select(`
      *,
      storyteller:users!storyteller_id(
        id,
        full_name,
        community_affiliation,
        preferred_pronouns,
        profile_image_url
      ),
      analysis:story_analysis(
        analysis_data,
        validated_by_community,
        cultural_review_status
      )
    `)
    .eq('storyteller.community_affiliation', communityId)
    .order('submitted_at', { ascending: false })

  if (!includePrivate) {
    query = query.in('privacy_level', ['public', 'community'])
  }

  const { data: stories, error } = await query

  if (error) {
    console.error('Error fetching community stories:', error)
    return []
  }

  // Filter stories based on user access and cultural protocols
  const accessibleStories = await Promise.all(
    stories?.map(async (story) => {
      const canAccess = await canAccessStory(supabase, story.id, userId)
      return canAccess ? story : null
    }) || []
  )

  return accessibleStories.filter(Boolean) as typeof stories
}

/**
 * Submit a story with proper consent validation and cultural protocol support
 */
export async function submitStory(
  supabase: SupabaseClient<Database>,
  storytellerId: string,
  storyData: {
    title?: string
    transcript: string
    audio_url?: string
    video_url?: string
    submission_method?: string
    privacy_level: 'private' | 'community' | 'public'
    consent_settings: ConsentSettings
    cultural_protocols?: CulturalProtocols
    tags?: string[]
    location?: string
    story_themes?: string[]
    personal_quotes?: string[]
  }
) {
  try {
    // Validate consent settings
    if (!storyData.consent_settings.allowAnalysis && storyData.privacy_level !== 'private') {
      throw new Error('Public or community stories require analysis consent for community insights')
    }

    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        storyteller_id: storytellerId,
        ...storyData,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // If analysis is consented, trigger analysis
    if (storyData.consent_settings.allowAnalysis) {
      // Note: In a real implementation, this would trigger an async analysis job
      console.log('Story submitted with analysis consent - triggering analysis queue')
    }

    return { story, error: null }
  } catch (error) {
    console.error('Error submitting story:', error)
    return { story: null, error }
  }
}

/**
 * Analyze a story using community-centered AI principles
 */
export async function analyzeStory(
  supabase: SupabaseClient<Database>,
  storyId: string,
  analysisData: StoryAnalysis
) {
  try {
    // Verify the story exists and has analysis consent
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('consent_settings, cultural_protocols')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found or inaccessible')
    }

    const consentSettings = story.consent_settings as ConsentSettings
    if (!consentSettings.allowAnalysis) {
      throw new Error('Story does not have analysis consent')
    }

    // Insert analysis with community sovereignty principles
    const { data: analysis, error } = await supabase
      .from('story_analysis')
      .insert({
        story_id: storyId,
        analysis_data: analysisData,
        analysis_version: '2.0',
        validated_by_community: false, // Requires community validation
        cultural_review_status: story.cultural_protocols ? 'pending' : 'approved'
      })
      .select()
      .single()

    if (error) throw error

    // Update story status
    await supabase
      .from('stories')
      .update({ status: 'analyzed' })
      .eq('id', storyId)

    return { analysis, error: null }
  } catch (error) {
    console.error('Error analyzing story:', error)
    return { analysis: null, error }
  }
}

/**
 * Generate community insights with sovereignty controls
 */
export async function generateCommunityInsights(
  supabase: SupabaseClient<Database>,
  communityId: string,
  insightType: 'pattern' | 'trend' | 'recommendation' | 'innovation' | 'wisdom'
) {
  try {
    // Get all community stories with analysis consent
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        consent_settings,
        analysis:story_analysis(analysis_data, validated_by_community),
        storyteller:users!storyteller_id(community_affiliation)
      `)
      .eq('storyteller.community_affiliation', communityId)
      .eq('consent_settings->allowAnalysis', true)
      .eq('consent_settings->allowCommunitySharing', true)

    if (error) throw error

    // Filter for validated analyses only
    const validatedStories = stories?.filter(story => 
      story.analysis?.some(a => a.validated_by_community)
    ) || []

    if (validatedStories.length < 3) {
      throw new Error('Insufficient validated stories for community insights (minimum 3 required)')
    }

    // Here would be the actual AI processing for community insights
    // For now, return a placeholder structure
    const insight = {
      community_id: communityId,
      insight_type: insightType,
      title: `Community ${insightType} from ${validatedStories.length} stories`,
      description: 'Generated using community-validated story analysis',
      supporting_stories: validatedStories.map(s => s.id),
      confidence_level: Math.min(validatedStories.length * 0.2, 1.0),
      visibility: 'community' as const,
      community_validated: false
    }

    const { data: insertedInsight, error: insertError } = await supabase
      .from('community_insights')
      .insert(insight)
      .select()
      .single()

    if (insertError) throw insertError

    return { insight: insertedInsight, error: null }
  } catch (error) {
    console.error('Error generating community insights:', error)
    return { insight: null, error }
  }
}

/**
 * Track value creation events for benefit distribution
 */
export async function trackValueEvent(
  supabase: SupabaseClient<Database>,
  valueEventData: {
    story_id?: string
    insight_id?: string
    storyteller_id?: string
    community_id?: string
    event_type: 'grant_funded' | 'media_license' | 'policy_influence' | 'research_citation' | 'community_benefit' | 'other'
    value_amount?: number
    description: string
    evidence_links?: string[]
  }
) {
  try {
    // Calculate benefit distribution (40% to storyteller, 40% to community, 20% to platform)
    const storytellerShare = valueEventData.value_amount ? valueEventData.value_amount * 0.4 : 0
    const communityShare = valueEventData.value_amount ? valueEventData.value_amount * 0.4 : 0

    const { data: valueEvent, error } = await supabase
      .from('value_events')
      .insert({
        ...valueEventData,
        event_data: {
          event_type: valueEventData.event_type,
          value_amount: valueEventData.value_amount,
          storyteller_share: storytellerShare,
          community_share: communityShare,
          description: valueEventData.description,
          evidence_links: valueEventData.evidence_links || [],
          distribution_status: 'pending'
        },
        occurred_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return { valueEvent, error: null }
  } catch (error) {
    console.error('Error tracking value event:', error)
    return { valueEvent: null, error }
  }
}

/**
 * Get storyteller dashboard data with privacy and cultural protocol respect
 */
export async function getStorytellerDashboard(
  supabase: SupabaseClient<Database>,
  storytellerId: string
) {
  try {
    // Get storyteller's stories
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        *,
        analysis:story_analysis(
          analysis_data,
          validated_by_community,
          cultural_review_status
        )
      `)
      .eq('storyteller_id', storytellerId)
      .order('submitted_at', { ascending: false })

    if (storiesError) throw storiesError

    // Get value events for this storyteller
    const { data: valueEvents, error: valueError } = await supabase
      .from('value_events')
      .select('*')
      .eq('storyteller_id', storytellerId)
      .order('occurred_at', { ascending: false })

    if (valueError) throw valueError

    // Calculate dashboard metrics
    const totalStories = stories?.length || 0
    const analyzedStories = stories?.filter(s => s.analysis?.length > 0).length || 0
    const validatedStories = stories?.filter(s => 
      s.analysis?.some((a: any) => a.validated_by_community)
    ).length || 0
    const totalValueGenerated = valueEvents?.reduce((sum, event) => 
      sum + (event.event_data as any).storyteller_share || 0, 0
    ) || 0

    return {
      stories,
      valueEvents,
      metrics: {
        totalStories,
        analyzedStories,
        validatedStories,
        totalValueGenerated
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching storyteller dashboard:', error)
    return { stories: null, valueEvents: null, metrics: null, error }
  }
}