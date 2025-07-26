/**
 * API: Create new story for storyteller
 * Handles story creation with AI analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

interface CreateStoryRequest {
  storyteller_id: string;
  title: string;
  story_type: 'primary' | 'supporting' | 'case_study';
  content: string;
  themes: string[];
  privacy_level: 'public' | 'community' | 'private';
  content_warnings?: string[];
  collaboration_opportunities?: string[];
  professional_outcomes?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateStoryRequest = await request.json();

    // Validate required fields
    if (!data.storyteller_id || !data.title || !data.content) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['storyteller_id', 'title', 'content']
      }, { status: 400 });
    }

    if (data.content.length < 200) {
      return NextResponse.json({
        error: 'Story content must be at least 200 characters'
      }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Verify storyteller exists
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('id, full_name')
      .eq('id', data.storyteller_id)
      .single();

    if (storytellerError || !storyteller) {
      return NextResponse.json({
        error: 'Storyteller not found'
      }, { status: 404 });
    }

    // Create the story
    const { data: newStory, error: storyError } = await supabase
      .from('stories')
      .insert({
        storyteller_id: data.storyteller_id,
        title: data.title,
        content: data.content,
        transcription: data.content,
        privacy_level: data.privacy_level || 'public',
        themes: data.themes || []
      })
      .select()
      .single();

    if (storyError) {
      console.error('Failed to create story:', storyError);
      return NextResponse.json({
        error: 'Failed to create story',
        details: storyError.message,
        code: storyError.code,
        hint: storyError.hint,
        debug_data: {
          storyteller_id: data.storyteller_id,
          title: data.title,
          content_length: data.content?.length || 0
        }
      }, { status: 500 });
    }

    // Trigger AI analysis for the story (async)
    triggerAIAnalysis(newStory.id, data.content).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Story created successfully!',
      story: {
        id: newStory.id,
        title: newStory.title,
        story_type: newStory.story_type,
        privacy_level: newStory.privacy_level,
        created_at: newStory.created_at
      },
      storyteller: {
        id: storyteller.id,
        name: storyteller.full_name
      },
      story_url: `/stories/${newStory.id}`,
      admin_url: `/storytellers/${data.storyteller_id}/admin`
    });

  } catch (error) {
    console.error('Story creation error:', error);
    return NextResponse.json({
      error: 'Failed to create story',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function triggerAIAnalysis(storyId: string, content: string) {
  try {
    // This would trigger the AI analysis system we built earlier
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/ai-analysis/analyze-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        story_id: storyId,
        content: content,
        analysis_type: 'comprehensive'
      })
    });

    if (response.ok) {
      console.log(`AI analysis triggered for story ${storyId}`);
    } else {
      console.warn(`AI analysis failed for story ${storyId}`);
    }
  } catch (error) {
    console.warn('Failed to trigger AI analysis:', error);
  }
}