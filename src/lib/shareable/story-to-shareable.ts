#!/usr/bin/env tsx
/**
 * Story to Shareable Content Workflow
 * Transform stories into social media and shareable formats
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ShareableContent {
  story_id: string;
  format: 'social_post' | 'quote_card' | 'story_preview' | 'impact_highlight';
  content: string;
  visual_elements?: {
    background_color?: string;
    storyteller_photo?: boolean;
    organization_logo?: boolean;
    branded_template?: string;
  };
  platform_optimized?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  sovereignty_compliance: {
    consent_verified: boolean;
    attribution_included: boolean;
    community_approved: boolean;
    storyteller_reviewed: boolean;
  };
}

export async function generateShareableContent(
  storyId: string,
  format: ShareableContent['format']
): Promise<ShareableContent | null> {
  
  // Fetch story with storyteller data
  const { data: story, error } = await supabase
    .from('stories')
    .select(`
      *,
      storytellers (
        id, full_name, consent_given, privacy_preferences,
        organizations (name)
      )
    `)
    .eq('id', storyId)
    .single();

  if (error || !story) {
    console.error('Failed to fetch story:', error);
    return null;
  }

  // Check sovereignty compliance
  const storyteller = story.storytellers;
  if (!storyteller?.consent_given) {
    console.log('Story cannot be shared - no storyteller consent');
    return null;
  }

  const privacyPrefs = storyteller.privacy_preferences || {};
  if (!privacyPrefs.public_display) {
    console.log('Story cannot be shared - privacy preferences');
    return null;
  }

  // Generate content based on format
  let content = '';
  let visualElements = {};

  switch (format) {
    case 'quote_card':
      content = extractKeyQuote(story.content);
      visualElements = {
        background_color: '#B85C38',
        storyteller_photo: privacyPrefs.show_photo,
        branded_template: 'quote_card'
      };
      break;

    case 'story_preview':
      content = generatePreview(story.content, 280);
      visualElements = {
        storyteller_photo: privacyPrefs.show_photo,
        organization_logo: privacyPrefs.show_organization
      };
      break;

    case 'impact_highlight':
      content = extractImpactMoment(story.content);
      visualElements = {
        background_color: '#1A3A52',
        branded_template: 'impact_card'
      };
      break;

    case 'social_post':
      content = generateSocialPost(story);
      break;
  }

  return {
    story_id: storyId,
    format,
    content,
    visual_elements: visualElements,
    platform_optimized: generatePlatformVersions(content),
    sovereignty_compliance: {
      consent_verified: true,
      attribution_included: true,
      community_approved: false, // Requires manual approval
      storyteller_reviewed: false // Requires storyteller review
    }
  };
}

function extractKeyQuote(content: string): string {
  // Simple quote extraction - would be enhanced with AI
  const sentences = content.split('.').filter(s => s.length > 50);
  return sentences[0]?.trim() + '.' || content.substring(0, 150) + '...';
}

function generatePreview(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
}

function extractImpactMoment(content: string): string {
  // Look for impact-related keywords and extract context
  const impactKeywords = ['change', 'help', 'support', 'community', 'difference'];
  const sentences = content.split('.');
  
  for (const sentence of sentences) {
    if (impactKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return sentences[0]?.trim() || content.substring(0, 200);
}

function generateSocialPost(story: any): string {
  const storyteller = story.storytellers;
  const org = storyteller.organizations?.name || '';
  
  return `✨ New story from ${storyteller.full_name}${org ? ` at ${org}` : ''}

"${generatePreview(story.content, 200)}"

Every voice matters. Every story creates change.

#CommunityStories #EmpathyLedger #StorytellerVoices`;
}

function generatePlatformVersions(content: string) {
  return {
    twitter: content.length > 280 ? content.substring(0, 277) + '...' : content,
    linkedin: content,
    facebook: content,
    instagram: content
  };
}

export async function createShareableAssets(shareableContent: ShareableContent): Promise<string[]> {
  // This would integrate with image generation APIs
  // For now, return placeholder asset URLs
  
  const assets = [];
  
  if (shareableContent.visual_elements?.branded_template) {
    assets.push(`/api/generate-visual/${shareableContent.story_id}/${shareableContent.format}`);
  }
  
  return assets;
}