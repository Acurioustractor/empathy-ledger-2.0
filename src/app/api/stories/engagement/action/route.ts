import { NextRequest, NextResponse } from 'next/server';

// Story engagement tracking - individual actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, action_type, action_data } = body;

    // Validate required fields
    if (!session_id || !action_type) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, action_type' }, 
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['highlight', 'quote_save', 'insight_bookmark', 'share', 'scroll'];
    if (!validActions.includes(action_type)) {
      return NextResponse.json(
        { error: `Invalid action_type. Must be one of: ${validActions.join(', ')}` }, 
        { status: 400 }
      );
    }

    // In production, this would insert into engagement_actions table
    const actionRecord = {
      session_id,
      action_type,
      action_data: action_data || {},
      timestamp: new Date().toISOString()
    };

    // Store action data (in production this would be in database)
    if (typeof window === 'undefined') {
      global.engagementActions = global.engagementActions || [];
      global.engagementActions.push(actionRecord);
      
      // Update session counts
      global.engagementSessions = global.engagementSessions || new Map();
      const session = global.engagementSessions.get(session_id);
      if (session) {
        switch (action_type) {
          case 'highlight':
            session.highlights_made = (session.highlights_made || 0) + 1;
            break;
          case 'quote_save':
            session.quotes_saved = (session.quotes_saved || 0) + 1;
            break;
          case 'insight_bookmark':
            session.insights_bookmarked = (session.insights_bookmarked || 0) + 1;
            break;
          case 'share':
            session.social_shares = (session.social_shares || 0) + 1;
            break;
        }
        global.engagementSessions.set(session_id, session);
      }
    }

    console.log('Engagement action tracked:', {
      session_id,
      action_type,
      action_data,
      timestamp: actionRecord.timestamp
    });

    // Return action-specific response
    let responseMessage = 'Action tracked successfully';
    let additionalData = {};

    switch (action_type) {
      case 'quote_save':
        responseMessage = 'Quote saved successfully';
        additionalData = { saved_quote: action_data.quote };
        break;
      case 'highlight':
        responseMessage = 'Text highlighted successfully';
        additionalData = { highlighted_text: action_data.text };
        break;
      case 'share':
        responseMessage = 'Share action tracked';
        additionalData = { share_platform: action_data.platform || 'unknown' };
        break;
      case 'insight_bookmark':
        responseMessage = 'Insight bookmarked successfully';
        break;
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      action_id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...additionalData
    });

  } catch (error) {
    console.error('Failed to track engagement action:', error);
    return NextResponse.json(
      { error: 'Failed to track engagement action' }, 
      { status: 500 }
    );
  }
}