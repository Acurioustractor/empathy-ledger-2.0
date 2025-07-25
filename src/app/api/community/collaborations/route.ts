import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storytellerId = searchParams.get('storyteller_id');
    const collaborationType = searchParams.get('type');
    const status = searchParams.get('status');

    if (!storytellerId) {
      return NextResponse.json({ error: 'Storyteller ID required' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    
    let query = supabase
      .from('storyteller_collaborations')
      .select(`
        id,
        collaboration_type,
        collaboration_status,
        project_title,
        project_description,
        collaboration_goals,
        expected_outcomes,
        timeline_start,
        timeline_end,
        cultural_protocols_agreed,
        aboriginal_advisor_review_required,
        revenue_sharing_model,
        community_impact_score,
        knowledge_sharing_value,
        cultural_learning_value,
        initiator:profiles!initiator_id(
          id,
          full_name,
          profile_image_url,
          bio
        ),
        collaborator:profiles!collaborator_id(
          id,
          full_name,
          profile_image_url,
          bio
        ),
        created_at,
        updated_at
      `)
      .or(`initiator_id.eq.${storytellerId},collaborator_id.eq.${storytellerId}`)
      .order('created_at', { ascending: false });

    if (collaborationType) {
      query = query.eq('collaboration_type', collaborationType);
    }

    if (status) {
      query = query.eq('collaboration_status', status);
    }

    const { data: collaborations, error } = await query;

    if (error) {
      console.error('Error fetching collaborations:', error);
      return NextResponse.json({ error: 'Failed to fetch collaborations' }, { status: 500 });
    }

    return NextResponse.json({ collaborations });
  } catch (error) {
    console.error('Error in collaborations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      initiator_id,
      collaborator_id,
      collaboration_type,
      project_title,
      project_description,
      collaboration_goals,
      expected_outcomes,
      timeline_start,
      timeline_end,
      cultural_protocols_agreed = false,
      aboriginal_advisor_review_required = false,
      revenue_sharing_model
    } = body;

    // Validate required fields
    if (!initiator_id || !collaborator_id || !collaboration_type || !project_title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Create the collaboration
    const { data: collaboration, error } = await supabase
      .from('storyteller_collaborations')
      .insert([{
        initiator_id,
        collaborator_id,
        collaboration_type,
        collaboration_status: 'proposed',
        project_title,
        project_description,
        collaboration_goals,
        expected_outcomes,
        timeline_start,
        timeline_end,
        cultural_protocols_agreed,
        aboriginal_advisor_review_required,
        revenue_sharing_model: revenue_sharing_model || {
          model_type: 'equal_split',
          initiator_percentage: 50,
          collaborator_percentage: 50,
          community_contribution: 5,
          platform_fee: 5
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating collaboration:', error);
      return NextResponse.json({ error: 'Failed to create collaboration' }, { status: 500 });
    }

    // If Aboriginal advisor review is required, create review record
    if (aboriginal_advisor_review_required) {
      await supabase
        .from('aboriginal_advisory_reviews')
        .insert({
          review_type: 'collaboration_proposal',
          subject_id: collaboration.id,
          storyteller_id: initiator_id,
          advisor_name: 'Aboriginal Advisory Council',
          review_status: 'pending',
          priority_level: 'standard',
          cultural_assessment: {
            collaboration_type: collaboration_type,
            cultural_sensitivity_required: true,
            protocol_review_needed: true
          }
        });
    }

    return NextResponse.json({ 
      collaboration,
      message: 'Collaboration proposal created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in collaboration creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      collaboration_id,
      collaboration_status,
      progress_updates,
      cultural_protocols_agreed,
      community_impact_score
    } = body;

    if (!collaboration_id) {
      return NextResponse.json({ error: 'Collaboration ID required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (collaboration_status) updateData.collaboration_status = collaboration_status;
    if (progress_updates) updateData.progress_updates = progress_updates;
    if (cultural_protocols_agreed !== undefined) updateData.cultural_protocols_agreed = cultural_protocols_agreed;
    if (community_impact_score !== undefined) updateData.community_impact_score = community_impact_score;

    const { data: collaboration, error } = await supabase
      .from('storyteller_collaborations')
      .update(updateData)
      .eq('id', collaboration_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating collaboration:', error);
      return NextResponse.json({ error: 'Failed to update collaboration' }, { status: 500 });
    }

    return NextResponse.json({
      collaboration,
      message: 'Collaboration updated successfully'
    });
  } catch (error) {
    console.error('Error in collaboration update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}