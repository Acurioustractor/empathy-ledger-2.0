import { NextRequest, NextResponse } from 'next/server';

// Story engagement tracking - session end
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      session_id, 
      session_end, 
      reading_progress, 
      time_spent_seconds,
      highlights_made,
      quotes_saved 
    } = body;

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing required field: session_id' }, 
        { status: 400 }
      );
    }

    // In production, this would update the story_engagement record
    const engagementUpdate = {
      session_id,
      session_end: session_end || new Date().toISOString(),
      reading_progress: reading_progress || 0,
      time_spent_seconds: time_spent_seconds || 0,
      highlights_made: highlights_made || 0,
      quotes_saved: quotes_saved || 0
    };

    // Update session data (in production this would update database)
    if (typeof window === 'undefined') {
      global.engagementSessions = global.engagementSessions || new Map();
      const existingSession = global.engagementSessions.get(session_id);
      if (existingSession) {
        global.engagementSessions.set(session_id, {
          ...existingSession,
          ...engagementUpdate
        });
      }
    }

    // Calculate engagement metrics
    const completion_rate = Math.min(100, reading_progress);
    const engagement_score = calculateEngagementScore({
      reading_progress,
      time_spent_seconds,
      highlights_made,
      quotes_saved
    });

    console.log('Engagement session ended:', {
      session_id,
      reading_progress,
      time_spent_seconds,
      highlights_made,
      quotes_saved,
      completion_rate,
      engagement_score
    });

    // In production, this would also trigger analytics aggregation
    // and update story view counts and storyteller statistics

    return NextResponse.json({
      success: true,
      message: 'Engagement session completed',
      metrics: {
        completion_rate,
        engagement_score,
        time_spent_minutes: Math.round(time_spent_seconds / 60),
        total_interactions: highlights_made + quotes_saved
      }
    });

  } catch (error) {
    console.error('Failed to end engagement tracking:', error);
    return NextResponse.json(
      { error: 'Failed to end engagement tracking' }, 
      { status: 500 }
    );
  }
}

function calculateEngagementScore({
  reading_progress,
  time_spent_seconds,
  highlights_made,
  quotes_saved
}: {
  reading_progress: number;
  time_spent_seconds: number;
  highlights_made: number;
  quotes_saved: number;
}): number {
  // Engagement scoring algorithm
  let score = 0;
  
  // Reading completion (0-40 points)
  score += Math.min(40, reading_progress * 0.4);
  
  // Time engagement (0-30 points)
  const minutes = time_spent_seconds / 60;
  score += Math.min(30, minutes * 2);
  
  // Active engagement (0-30 points)
  score += Math.min(15, highlights_made * 3);
  score += Math.min(15, quotes_saved * 5);
  
  return Math.round(Math.min(100, score));
}