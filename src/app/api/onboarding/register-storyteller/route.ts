/**
 * API: Automated storyteller onboarding registration
 * Creates a new storyteller profile with basic information
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

interface OnboardingData {
  full_name: string;
  email: string;
  role?: string;
  organization?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  privacy_preferences?: {
    profile_visibility: 'public' | 'community' | 'private';
    allow_contact: boolean;
    share_analytics: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: OnboardingData = await request.json();

    // Validate required fields
    if (!data.full_name || !data.email) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['full_name', 'email']
      }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Check if storyteller already exists
    const { data: existing } = await supabase
      .from('storytellers')
      .select('id, email')
      .eq('email', data.email)
      .single();

    if (existing) {
      return NextResponse.json({
        error: 'Storyteller already exists',
        storyteller_id: existing.id,
        redirect_url: `/storytellers/${existing.id}/admin`
      }, { status: 409 });
    }

    // Create new storyteller profile (minimal required fields)
    const { data: newStoryteller, error: storytellerError } = await supabase
      .from('storytellers')
      .insert({
        full_name: data.full_name,
        email: data.email,
        bio: data.bio || `${data.full_name} is a new member of the Empathy Ledger community.`,
        role: data.role || 'Community Member'
      })
      .select()
      .single();

    if (storytellerError) {
      console.error('Failed to create storyteller:', storytellerError);
      return NextResponse.json({
        error: 'Failed to create storyteller profile',
        details: storytellerError.message
      }, { status: 500 });
    }

    // Set profile visibility directly in the storytellers table
    const privacyLevel = data.privacy_preferences?.profile_visibility || 'public';
    
    const { error: privacyError } = await supabase
      .from('storytellers')
      .update({
        profile_visibility: privacyLevel
      })
      .eq('id', newStoryteller.id);

    if (privacyError) {
      console.warn('Failed to set privacy preferences:', privacyError);
    }

    // Generate onboarding tasks
    const onboardingTasks = generateOnboardingTasks(newStoryteller.id);

    return NextResponse.json({
      success: true,
      message: 'Storyteller profile created successfully!',
      storyteller: {
        id: newStoryteller.id,
        name: newStoryteller.full_name,
        email: newStoryteller.email,
        completion_score: calculateCompletionScore(data)
      },
      onboarding: {
        next_steps: onboardingTasks,
        admin_url: `/storytellers/${newStoryteller.id}/admin`,
        story_wizard_url: `/storytellers/${newStoryteller.id}/create-story`
      },
      estimated_completion_time: '15-20 minutes'
    });

  } catch (error) {
    console.error('Onboarding registration error:', error);
    return NextResponse.json({
      error: 'Failed to process registration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function calculateCompletionScore(data: OnboardingData): number {
  let score = 30; // Base score for name and email
  
  if (data.role) score += 15;
  if (data.organization) score += 15;
  if (data.location) score += 10;
  if (data.bio && data.bio.length > 50) score += 15;
  if (data.website) score += 10;
  if (data.linkedin_url) score += 5;
  
  return Math.min(score, 100);
}

function generateOnboardingTasks(storytellerId: string) {
  return [
    {
      id: 'upload_profile_image',
      title: 'Add Profile Image',
      description: 'Upload a professional photo to help people connect with your story',
      estimated_time: '2 minutes',
      priority: 'high',
      url: `/storytellers/${storytellerId}/admin#profile-image`
    },
    {
      id: 'complete_bio',
      title: 'Enhance Your Bio',
      description: 'Share more about your background and what drives your work',
      estimated_time: '5 minutes',
      priority: 'high',
      url: `/storytellers/${storytellerId}/admin#bio`
    },
    {
      id: 'create_first_story',
      title: 'Create Your First Story',
      description: 'Share a meaningful experience that shaped your professional journey',
      estimated_time: '10-15 minutes',
      priority: 'essential',
      url: `/storytellers/${storytellerId}/create-story`
    },
    {
      id: 'set_privacy_preferences',
      title: 'Configure Privacy Settings',
      description: 'Choose how your profile and stories are shared',
      estimated_time: '3 minutes',
      priority: 'medium',
      url: `/storytellers/${storytellerId}/admin#privacy`
    },
    {
      id: 'explore_community',
      title: 'Explore Stories',
      description: 'Read other community members\' stories to understand the platform',
      estimated_time: '10 minutes',
      priority: 'medium',
      url: '/storytellers'
    }
  ];
}