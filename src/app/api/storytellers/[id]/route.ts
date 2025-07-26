/**
 * API: Get individual storyteller information
 * Used by the story creation wizard and admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const storytellerId = resolvedParams.id;

    if (!storytellerId) {
      return NextResponse.json({
        error: 'Storyteller ID is required'
      }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Get storyteller with basic info first
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('*')
      .eq('id', storytellerId)
      .single();

    if (storytellerError || !storyteller) {
      return NextResponse.json({
        error: 'Storyteller not found',
        details: storytellerError?.message || 'No storyteller with this ID',
        storyteller_id: storytellerId
      }, { status: 404 });
    }

    // Privacy preferences are stored directly in the storyteller record
    const privacyPrefs = {
      profile_visibility: storyteller.profile_visibility || 'public',
      allow_contact: true,
      share_analytics: false
    };

    // Get stories separately to avoid join issues
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, story_type, privacy_level, primary_themes, created_at')
      .eq('storyteller_id', storytellerId);

    const storyStats = {
      total_stories: stories?.length || 0,
      public_stories: stories?.filter(s => s.privacy_level === 'public').length || 0,
      primary_stories: stories?.filter(s => s.story_type === 'primary').length || 0,
      latest_story: stories && stories.length > 0 ? stories[0] : null
    };

    return NextResponse.json({
      id: storyteller.id,
      full_name: storyteller.full_name,
      email: storyteller.email,
      role: storyteller.role || 'Community Member',
      organization: storyteller.organization || null,
      location: storyteller.location || null,
      bio: storyteller.bio || null,
      website: storyteller.website || null,
      profile_image_url: storyteller.profile_image_url || null,
      created_at: storyteller.created_at,
      privacy_preferences: privacyPrefs,
      story_statistics: storyStats,
      stories: (stories || []).map(story => ({
        id: story.id,
        title: story.title,
        story_type: story.story_type,
        privacy_level: story.privacy_level,
        themes: story.primary_themes || [],
        created_at: story.created_at
      }))
    });

  } catch (error) {
    console.error('Get storyteller error:', error);
    return NextResponse.json({
      error: 'Failed to fetch storyteller',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const storytellerId = resolvedParams.id;
    const updates = await request.json();

    const supabase = await createAdminClient();

    // Update storyteller profile
    const { data: updatedStoryteller, error: updateError } = await supabase
      .from('storytellers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', storytellerId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update storyteller:', updateError);
      return NextResponse.json({
        error: 'Failed to update storyteller',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Storyteller updated successfully',
      storyteller: updatedStoryteller
    });

  } catch (error) {
    console.error('Update storyteller error:', error);
    return NextResponse.json({
      error: 'Failed to update storyteller',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}