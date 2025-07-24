import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const storyData = await request.json()
    
    // Validate required fields
    if (!storyData.content || !storyData.shareLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Insert story into Supabase
    const { data, error } = await supabase
      .from('stories')
      .insert({
        title: storyData.title,
        story_transcript: storyData.content,
        status: 'Published',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Story submission error:', error)
      return NextResponse.json(
        { error: 'Failed to save story' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      story_id: data.id,
      message: 'Story submitted successfully'
    })
    
  } catch (error: any) {
    console.error('Story submission API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}