import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storytellerId = searchParams.get('storyteller_id');
    const connectionType = searchParams.get('type');
    const status = searchParams.get('status');
    const minMatchScore = searchParams.get('min_match_score');

    if (!storytellerId) {
      return NextResponse.json({ error: 'Storyteller ID required' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    
    let query = supabase
      .from('cross_pollination_connections')
      .select(`
        id,
        connection_type,
        ai_match_score,
        ai_reasoning,
        shared_themes,
        complementary_skills,
        collaboration_opportunities,
        cultural_learning_potential,
        connection_status,
        cultural_sensitivity_verified,
        protocol_alignment_score,
        cultural_bridge_potential,
        community_value_potential,
        knowledge_exchange_value,
        professional_growth_value,
        storyteller_a:profiles!storyteller_a_id(
          id,
          full_name,
          profile_image_url,
          bio,
          expertise_areas
        ),
        storyteller_b:profiles!storyteller_b_id(
          id,
          full_name,
          profile_image_url,
          bio,
          expertise_areas
        ),
        created_at
      `)
      .or(`storyteller_a_id.eq.${storytellerId},storyteller_b_id.eq.${storytellerId}`)
      .order('ai_match_score', { ascending: false });

    if (connectionType) {
      query = query.eq('connection_type', connectionType);
    }

    if (status) {
      query = query.eq('connection_status', status);
    }

    if (minMatchScore) {
      query = query.gte('ai_match_score', parseFloat(minMatchScore));
    }

    const { data: connections, error } = await query;

    if (error) {
      console.error('Error fetching cross-pollination connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    // Process connections to determine the "other" storyteller for each connection
    const processedConnections = connections.map(connection => {
      const isStorytellerA = connection.storyteller_a.id === storytellerId;
      const otherStoryteller = isStorytellerA ? connection.storyteller_b : connection.storyteller_a;
      
      return {
        ...connection,
        other_storyteller: otherStoryteller,
        user_role: isStorytellerA ? 'storyteller_a' : 'storyteller_b'
      };
    });

    return NextResponse.json({ connections: processedConnections });
  } catch (error) {
    console.error('Error in cross-pollination API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storyteller_a_id,
      storyteller_b_id,
      connection_type,
      ai_match_score,
      ai_reasoning,
      shared_themes,
      complementary_skills,
      collaboration_opportunities,
      cultural_learning_potential,
      cultural_sensitivity_verified = false,
      generate_ai_analysis = true
    } = body;

    // Validate required fields
    if (!storyteller_a_id || !storyteller_b_id || !connection_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent self-connections
    if (storyteller_a_id === storyteller_b_id) {
      return NextResponse.json({ error: 'Cannot create connection with self' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('cross_pollination_connections')
      .select('id')
      .or(`and(storyteller_a_id.eq.${storyteller_a_id},storyteller_b_id.eq.${storyteller_b_id}),and(storyteller_a_id.eq.${storyteller_b_id},storyteller_b_id.eq.${storyteller_a_id})`)
      .single();

    if (existingConnection) {
      return NextResponse.json({ error: 'Connection already exists between these storytellers' }, { status: 409 });
    }

    let connectionData: any = {
      storyteller_a_id,
      storyteller_b_id,
      connection_type,
      connection_status: 'suggested',
      cultural_sensitivity_verified
    };

    if (generate_ai_analysis) {
      // Mock AI analysis - in production this would call actual AI services
      const mockAIAnalysis = {
        ai_match_score: ai_match_score || 0.87,
        ai_reasoning: ai_reasoning || {
          primary_factors: [
            'Complementary expertise in community-centered development',
            'Shared commitment to Aboriginal protocol integration',
            'Similar cultural competency levels and approaches'
          ],
          collaboration_potential: 'High potential for knowledge sharing and joint project development',
          cultural_alignment: 'Strong alignment in community-centered values and cultural sensitivity'
        },
        shared_themes: shared_themes || [
          'Community-Centered Approach',
          'Cultural Competency',
          'Aboriginal Protocol Integration',
          'Ethical Technology Development'
        ],
        complementary_skills: complementary_skills || [
          'Technology Development & Community Engagement',
          'Platform Architecture & Cultural Protocol Integration',
          'Business Development & Community Organizing'
        ],
        collaboration_opportunities: collaboration_opportunities || [
          'Joint technology platform development with Aboriginal oversight',
          'Cultural competency training program collaboration',
          'Community engagement methodology sharing',
          'Cross-sector partnership development'
        ],
        cultural_learning_potential: cultural_learning_potential || [
          'Aboriginal protocol integration methodologies',
          'Community-centered business model development',
          'Cross-cultural collaboration approaches',
          'Cultural competency development strategies'
        ],
        protocol_alignment_score: 0.92,
        community_value_potential: 0.89,
        knowledge_exchange_value: 0.91,
        professional_growth_value: 0.88
      };

      connectionData = { ...connectionData, ...mockAIAnalysis };
    }

    // Create the connection
    const { data: connection, error } = await supabase
      .from('cross_pollination_connections')
      .insert([connectionData])
      .select(`
        id,
        connection_type,
        ai_match_score,
        connection_status,
        storyteller_a:profiles!storyteller_a_id(id, full_name),
        storyteller_b:profiles!storyteller_b_id(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating cross-pollination connection:', error);
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }

    // If cultural sensitivity verification is required, create review record
    if (!cultural_sensitivity_verified) {
      await supabase
        .from('aboriginal_advisory_reviews')
        .insert({
          review_type: 'cross_pollination_connection',
          subject_id: connection.id,
          storyteller_id: storyteller_a_id,
          advisor_name: 'Aboriginal Advisory Council',
          review_status: 'pending',
          priority_level: 'standard',
          cultural_assessment: {
            connection_type: connection_type,
            cultural_bridge_potential: connectionData.cultural_bridge_potential || false,
            protocol_alignment_required: true
          }
        });
    }

    return NextResponse.json({
      connection,
      message: 'Cross-pollination connection created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in cross-pollination creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      connection_id,
      connection_status,
      first_interaction_date,
      collaboration_outcomes,
      professional_referrals_generated,
      story_collaborations_created
    } = body;

    if (!connection_id) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (connection_status) {
      updateData.connection_status = connection_status;
      if (connection_status === 'engaged' && !first_interaction_date) {
        updateData.first_interaction_date = new Date().toISOString();
      }
    }

    if (first_interaction_date) updateData.first_interaction_date = first_interaction_date;
    if (collaboration_outcomes) updateData.collaboration_outcomes = collaboration_outcomes;
    if (professional_referrals_generated !== undefined) updateData.professional_referrals_generated = professional_referrals_generated;
    if (story_collaborations_created !== undefined) updateData.story_collaborations_created = story_collaborations_created;

    // Update last interaction date for any status change
    updateData.last_interaction_date = new Date().toISOString();

    const { data: connection, error } = await supabase
      .from('cross_pollination_connections')
      .update(updateData)
      .eq('id', connection_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cross-pollination connection:', error);
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
    }

    return NextResponse.json({
      connection,
      message: 'Connection updated successfully'
    });
  } catch (error) {
    console.error('Error in connection update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}