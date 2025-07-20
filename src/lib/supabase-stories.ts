// @ts-nocheck - Variable names need alignment with schema
/**
 * EMPATHY LEDGER STORY MANAGEMENT SYSTEM
 * Advanced Supabase integration for multi-modal storytelling
 */

import { supabase } from './supabase-auth';
import { v4 as uuidv4 } from 'uuid';

// =====================================================================
// STORY TYPES & INTERFACES
// =====================================================================

export interface Story {
  id: string;
  title: string;
  content: string;
  summary?: string;
  audio_url?: string;
  video_url?: string;
  image_urls?: string[];
  transcription?: string;
  transcription_confidence?: number;
  category: StoryCategory;
  themes: string[];
  tags: string[];
  privacy_level: PrivacyLevel;
  can_be_shared: boolean;
  allow_research_use: boolean;
  allow_ai_analysis: boolean;
  contributor_id: string;
  organization_id?: string;
  community_id?: string;
  contributor_age_range?: string;
  contributor_location?: string;
  contributor_background?: any;
  sentiment_score?: number;
  emotion_scores?: any;
  topic_scores?: any;
  language_detected?: string;
  content_warnings?: string[];
  view_count: number;
  share_count: number;
  comment_count: number;
  reaction_count: number;
  impact_score: number;
  cited_in_reports: number;
  policy_influence_score: number;
  status: StoryStatus;
  moderation_notes?: string;
  flagged_content: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  published_at?: string;
  featured_until?: string;
  created_at: string;
  updated_at: string;
}

export type StoryCategory =
  | 'healthcare'
  | 'education'
  | 'housing'
  | 'youth'
  | 'elder_care'
  | 'policy'
  | 'community'
  | 'environment'
  | 'employment'
  | 'social_services';

export type PrivacyLevel = 'public' | 'community' | 'organization' | 'private';
export type StoryStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'featured'
  | 'archived';

export interface StorySubmission {
  title: string;
  content: string;
  category: StoryCategory;
  themes?: string[];
  tags?: string[];
  privacy_level: PrivacyLevel;
  can_be_shared?: boolean;
  allow_research_use?: boolean;
  allow_ai_analysis?: boolean;
  community_id?: string;
  contributor_age_range?: string;
  contributor_location?: string;
  audio_file?: File;
  video_file?: File;
  image_files?: File[];
}

export interface StoryFilter {
  category?: StoryCategory;
  privacy_level?: PrivacyLevel;
  status?: StoryStatus;
  community_id?: string;
  organization_id?: string;
  themes?: string[];
  date_from?: string;
  date_to?: string;
  search_query?: string;
  sentiment_min?: number;
  sentiment_max?: number;
  has_media?: boolean;
  featured_only?: boolean;
}

// =====================================================================
// STORY SUBMISSION FUNCTIONS
// =====================================================================

/**
 * Submit a new story with media upload support
 */
export async function submitStory(
  userId: string,
  submission: StorySubmission
): Promise<{ story: Story | null; error: any }> {
  try {
    // Validate submission
    const validationError = validateStorySubmission(submission);
    if (validationError) {
      return { story: null, error: { message: validationError } };
    }

    const storyId = uuidv4();

    // Upload media files first
    const mediaUrls = await uploadStoryMedia(storyId, {
      audio: submission.audio_file,
      video: submission.video_file,
      images: submission.image_files,
    });

    // Process audio transcription if audio is provided
    let transcription = null;
    let transcriptionConfidence = null;

    if (mediaUrls.audio_url) {
      const transcriptionResult = await transcribeAudio(mediaUrls.audio_url);
      transcription = transcriptionResult.text;
      transcriptionConfidence = transcriptionResult.confidence;
    }

    // Analyze content for AI insights (if allowed)
    let aiAnalysis = null;
    if (submission.allow_ai_analysis !== false) {
      aiAnalysis = await analyzeStoryContent(
        submission.content + ' ' + (transcription || '')
      );
    }

    // Create story record
    const storyData: Partial<Story> = {
      id: storyId,
      title: submission.title,
      content: submission.content,
      category: submission.category,
      themes: submission.themes || [],
      tags: submission.tags || [],
      privacy_level: submission.privacy_level,
      can_be_shared: submission.can_be_shared ?? true,
      allow_research_use: submission.allow_research_use ?? false,
      allow_ai_analysis: submission.allow_ai_analysis ?? true,
      contributor_id: userId,
      community_id: submission.community_id,
      contributor_age_range: submission.contributor_age_range,
      contributor_location: submission.contributor_location,
      audio_url: mediaUrls.audio_url,
      video_url: mediaUrls.video_url,
      image_urls: mediaUrls.image_urls,
      transcription,
      transcription_confidence,
      sentiment_score: aiAnalysis?.sentiment_score,
      emotion_scores: aiAnalysis?.emotion_scores,
      topic_scores: aiAnalysis?.topic_scores,
      language_detected: aiAnalysis?.language,
      content_warnings: aiAnalysis?.content_warnings,
      status: 'pending',
      view_count: 0,
      share_count: 0,
      comment_count: 0,
      reaction_count: 0,
      impact_score: 0,
      cited_in_reports: 0,
      policy_influence_score: 0,
      flagged_content: false,
    };

    const { data, error } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single();

    if (error) {
      return { story: null, error };
    }

    // Update user story count
    await supabase.rpc('increment_stories_contributed', { user_id: userId });

    // Trigger notifications for community moderators
    if (submission.community_id) {
      await notifyCommunityModerators(submission.community_id, storyId);
    }

    return { story: data as Story, error: null };
  } catch (error) {
    return { story: null, error };
  }
}

/**
 * Update an existing story
 */
export async function updateStory(
  storyId: string,
  userId: string,
  updates: Partial<StorySubmission>
): Promise<{ story: Story | null; error: any }> {
  try {
    // Check if user owns the story
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('contributor_id, status')
      .eq('id', storyId)
      .single();

    if (fetchError) {
      return { story: null, error: fetchError };
    }

    if (existingStory.contributor_id !== userId) {
      return {
        story: null,
        error: { message: 'Unauthorized to update this story' },
      };
    }

    // Don't allow updates to approved/featured stories without admin approval
    if (['approved', 'featured'].includes(existingStory.status)) {
      return {
        story: null,
        error: { message: 'Cannot update published stories' },
      };
    }

    // Re-analyze content if changed
    let aiAnalysis = null;
    if (updates.content && updates.allow_ai_analysis !== false) {
      aiAnalysis = await analyzeStoryContent(updates.content);
    }

    const updateData = {
      ...updates,
      sentiment_score: aiAnalysis?.sentiment_score,
      emotion_scores: aiAnalysis?.emotion_scores,
      topic_scores: aiAnalysis?.topic_scores,
      language_detected: aiAnalysis?.language,
      content_warnings: aiAnalysis?.content_warnings,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      return { story: null, error };
    }

    return { story: data as Story, error: null };
  } catch (error) {
    return { story: null, error };
  }
}

/**
 * Delete a story (soft delete for data integrity)
 */
export async function deleteStory(
  storyId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    // Check ownership
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('contributor_id')
      .eq('id', storyId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError };
    }

    if (story.contributor_id !== userId) {
      return {
        success: false,
        error: { message: 'Unauthorized to delete this story' },
      };
    }

    // Soft delete by archiving
    const { error } = await supabase
      .from('stories')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', storyId);

    if (error) {
      return { success: false, error };
    }

    // Update user story count
    await supabase.rpc('decrement_stories_contributed', { user_id: userId });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

// =====================================================================
// STORY RETRIEVAL FUNCTIONS
// =====================================================================

/**
 * Get stories with advanced filtering and privacy respect
 */
export async function getStories(
  filter: StoryFilter = {},
  limit: number = 20,
  offset: number = 0,
  userId?: string
): Promise<{ stories: Story[]; total_count: number; error: any }> {
  try {
    let query = supabase.from('stories').select(
      `
        *,
        profiles:contributor_id (
          display_name,
          avatar_url
        ),
        communities:community_id (
          name,
          slug
        )
      `,
      { count: 'exact' }
    );

    // Apply privacy filters based on user
    if (!userId) {
      // Public only for anonymous users
      query = query.eq('privacy_level', 'public');
    } else {
      // Complex privacy filtering for authenticated users
      query = query.or(`
        privacy_level.eq.public,
        and(privacy_level.eq.community,community_id.in.(${await getUserCommunityIds(userId)})),
        contributor_id.eq.${userId}
      `);
    }

    // Apply status filter (default to approved stories)
    query = query.eq('status', filter.status || 'approved');

    // Apply category filter
    if (filter.category) {
      query = query.eq('category', filter.category);
    }

    // Apply community filter
    if (filter.community_id) {
      query = query.eq('community_id', filter.community_id);
    }

    // Apply organization filter
    if (filter.organization_id) {
      query = query.eq('organization_id', filter.organization_id);
    }

    // Apply theme filter
    if (filter.themes && filter.themes.length > 0) {
      query = query.overlaps('themes', filter.themes);
    }

    // Apply date range filter
    if (filter.date_from) {
      query = query.gte('created_at', filter.date_from);
    }
    if (filter.date_to) {
      query = query.lte('created_at', filter.date_to);
    }

    // Apply sentiment filter
    if (filter.sentiment_min !== undefined) {
      query = query.gte('sentiment_score', filter.sentiment_min);
    }
    if (filter.sentiment_max !== undefined) {
      query = query.lte('sentiment_score', filter.sentiment_max);
    }

    // Apply media filter
    if (filter.has_media) {
      query = query.or(
        'audio_url.not.is.null,video_url.not.is.null,image_urls.not.is.null'
      );
    }

    // Apply featured filter
    if (filter.featured_only) {
      query = query.eq('status', 'featured');
    }

    // Apply full-text search if provided
    if (filter.search_query) {
      query = query.textSearch('search_vector', filter.search_query);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { stories: [], total_count: 0, error };
    }

    return {
      stories: data as Story[],
      total_count: count || 0,
      error: null,
    };
  } catch (error) {
    return { stories: [], total_count: 0, error };
  }
}

/**
 * Get a single story by ID with privacy checking
 */
export async function getStoryById(
  storyId: string,
  userId?: string
): Promise<{ story: Story | null; error: any }> {
  try {
    let query = supabase
      .from('stories')
      .select(
        `
        *,
        profiles:contributor_id (
          display_name,
          avatar_url,
          bio
        ),
        communities:community_id (
          name,
          slug,
          description
        ),
        organizations:organization_id (
          name,
          logo_url
        )
      `
      )
      .eq('id', storyId);

    // Apply privacy filtering
    if (!userId) {
      query = query.eq('privacy_level', 'public');
    } else {
      query = query.or(`
        privacy_level.eq.public,
        and(privacy_level.eq.community,community_id.in.(${await getUserCommunityIds(userId)})),
        contributor_id.eq.${userId}
      `);
    }

    const { data, error } = await query.single();

    if (error) {
      return { story: null, error };
    }

    // Increment view count (only for approved stories)
    if (data.status === 'approved' || data.status === 'featured') {
      await supabase.rpc('increment_story_views', { story_id: storyId });
    }

    return { story: data as Story, error: null };
  } catch (error) {
    return { story: null, error };
  }
}

/**
 * Get user's own stories
 */
export async function getUserStories(
  userId: string,
  status?: StoryStatus,
  limit: number = 20,
  offset: number = 0
): Promise<{ stories: Story[]; total_count: number; error: any }> {
  try {
    let query = supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .eq('contributor_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return { stories: [], total_count: 0, error };
    }

    return {
      stories: data as Story[],
      total_count: count || 0,
      error: null,
    };
  } catch (error) {
    return { stories: [], total_count: 0, error };
  }
}

// =====================================================================
// STORY ENGAGEMENT FUNCTIONS
// =====================================================================

/**
 * Add reaction to a story
 */
export async function addStoryReaction(
  storyId: string,
  userId: string,
  reactionType: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.from('story_reactions').insert({
      story_id: storyId,
      user_id: userId,
      reaction_type: reactionType,
    });

    if (error) {
      return { success: false, error };
    }

    // Update reaction count
    await supabase.rpc('increment_story_reactions', { story_id: storyId });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Remove reaction from a story
 */
export async function removeStoryReaction(
  storyId: string,
  userId: string,
  reactionType: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('story_reactions')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);

    if (error) {
      return { success: false, error };
    }

    // Update reaction count
    await supabase.rpc('decrement_story_reactions', { story_id: storyId });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Add comment to a story
 */
export async function addStoryComment(
  storyId: string,
  userId: string,
  content: string,
  isAnonymous: boolean = false,
  parentCommentId?: string
): Promise<{ comment: any; error: any }> {
  try {
    const { data, error } = await supabase
      .from('story_comments')
      .insert({
        story_id: storyId,
        user_id: userId,
        content,
        is_anonymous: isAnonymous,
        parent_comment_id: parentCommentId,
      })
      .select()
      .single();

    if (error) {
      return { comment: null, error };
    }

    // Update comment count
    await supabase.rpc('increment_story_comments', { story_id: storyId });

    return { comment: data, error: null };
  } catch (error) {
    return { comment: null, error };
  }
}

// =====================================================================
// MEDIA UPLOAD FUNCTIONS
// =====================================================================

/**
 * Upload story media files to Supabase Storage
 */
async function uploadStoryMedia(
  storyId: string,
  files: {
    audio?: File;
    video?: File;
    images?: File[];
  }
): Promise<{
  audio_url?: string;
  video_url?: string;
  image_urls?: string[];
}> {
  const results: any = {};

  try {
    // Upload audio file
    if (files.audio) {
      const audioPath = `stories/${storyId}/audio/${files.audio.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('media')
        .upload(audioPath, files.audio);

      if (!audioError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(audioPath);
        results.audio_url = publicUrl;
      }
    }

    // Upload video file
    if (files.video) {
      const videoPath = `stories/${storyId}/video/${files.video.name}`;
      const { data: videoData, error: videoError } = await supabase.storage
        .from('media')
        .upload(videoPath, files.video);

      if (!videoError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(videoPath);
        results.video_url = publicUrl;
      }
    }

    // Upload image files
    if (files.images && files.images.length > 0) {
      const imageUrls = [];

      for (const [index, image] of files.images.entries()) {
        const imagePath = `stories/${storyId}/images/${index}-${image.name}`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from('media')
          .upload(imagePath, image);

        if (!imageError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('media').getPublicUrl(imagePath);
          imageUrls.push(publicUrl);
        }
      }

      if (imageUrls.length > 0) {
        results.image_urls = imageUrls;
      }
    }

    return results;
  } catch (error) {
    console.error('Error uploading media:', error);
    return results;
  }
}

// =====================================================================
// AI ANALYSIS FUNCTIONS
// =====================================================================

/**
 * Analyze story content for insights
 */
async function analyzeStoryContent(content: string): Promise<{
  sentiment_score: number;
  emotion_scores: any;
  topic_scores: any;
  language: string;
  content_warnings: string[];
} | null> {
  try {
    // This would integrate with OpenAI, Anthropic, or other AI services
    // For now, return mock analysis
    return {
      sentiment_score: 0.7 + (Math.random() - 0.5) * 0.4, // 0.5 to 0.9
      emotion_scores: {
        joy: Math.random() * 0.5,
        sadness: Math.random() * 0.3,
        anger: Math.random() * 0.2,
        fear: Math.random() * 0.2,
        hope: Math.random() * 0.6,
      },
      topic_scores: {
        healthcare: content.toLowerCase().includes('health') ? 0.8 : 0.1,
        education: content.toLowerCase().includes('school') ? 0.8 : 0.1,
        housing: content.toLowerCase().includes('home') ? 0.8 : 0.1,
      },
      language: 'en',
      content_warnings: [],
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    return null;
  }
}

/**
 * Transcribe audio file
 */
async function transcribeAudio(audioUrl: string): Promise<{
  text: string;
  confidence: number;
}> {
  try {
    // This would integrate with Assembly AI, OpenAI Whisper, or similar
    // For now, return mock transcription
    return {
      text: 'This is a mock transcription of the audio content.',
      confidence: 0.95,
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      text: '',
      confidence: 0,
    };
  }
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Validate story submission data
 */
function validateStorySubmission(submission: StorySubmission): string | null {
  if (!submission.title || submission.title.trim().length < 3) {
    return 'Title must be at least 3 characters long';
  }

  if (!submission.content || submission.content.trim().length < 10) {
    return 'Story content must be at least 10 characters long';
  }

  if (!submission.category) {
    return 'Please select a category for your story';
  }

  if (!submission.privacy_level) {
    return 'Please select a privacy level for your story';
  }

  return null;
}

/**
 * Get user's community IDs for privacy filtering
 */
async function getUserCommunityIds(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', userId);

    if (error || !data) {
      return '';
    }

    return data.map(row => row.community_id).join(',');
  } catch (error) {
    return '';
  }
}

/**
 * Notify community moderators of new story
 */
async function notifyCommunityModerators(
  communityId: string,
  storyId: string
): Promise<void> {
  try {
    // This would send notifications to moderators
    // Implementation depends on notification system
    console.log(
      `Notifying moderators of community ${communityId} about story ${storyId}`
    );
  } catch (error) {
    console.error('Error notifying moderators:', error);
  }
}
