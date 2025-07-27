import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

interface FeatureRequest {
  organization_id: string;
  feature_key: string;
  request_type: 'enable' | 'disable' | 'configure';
  reason: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  business_justification?: string;
  expected_usage?: string;
  cultural_considerations?: string;
  requested_configuration?: Record<string, any>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const status = searchParams.get('status');
    const adminView = searchParams.get('admin_view') === 'true';

    const supabase = await createAdminClient();
    
    let query = supabase
      .from('organization_feature_requests') // This table would be created to track requests
      .select(`
        id,
        organization_id,
        feature_key,
        request_type,
        reason,
        urgency_level,
        business_justification,
        expected_usage,
        cultural_considerations,
        requested_configuration,
        status,
        admin_response,
        admin_notes,
        reviewed_by,
        organization:organizations(
          organization_name,
          organization_type,
          subscription_tier
        ),
        feature:feature_toggles(
          feature_name,
          feature_description,
          feature_category,
          requires_subscription,
          organization_override_allowed
        ),
        created_at,
        updated_at,
        reviewed_at
      `)
      .order('created_at', { ascending: false });

    if (!adminView && organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching feature requests:', error);
      return NextResponse.json({ error: 'Failed to fetch feature requests' }, { status: 500 });
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error in feature requests API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FeatureRequest;
    const {
      organization_id,
      feature_key,
      request_type,
      reason,
      urgency_level = 'medium',
      business_justification,
      expected_usage,
      cultural_considerations,
      requested_configuration
    } = body;

    // Validate required fields
    if (!organization_id || !feature_key || !request_type || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Check if organization exists and user has permission
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, organization_name, subscription_tier')
      .eq('id', organization_id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if feature exists and is configurable by organizations
    const { data: feature, error: featureError } = await supabase
      .from('feature_toggles')
      .select('feature_key, feature_name, organization_override_allowed, requires_subscription')
      .eq('feature_key', feature_key)
      .single();

    if (featureError || !feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    if (!feature.organization_override_allowed) {
      return NextResponse.json({ 
        error: 'This feature cannot be configured by organizations' 
      }, { status: 403 });
    }

    // Check subscription requirements
    if (feature.requires_subscription && organization.subscription_tier === 'basic') {
      return NextResponse.json({ 
        error: 'This feature requires a premium subscription' 
      }, { status: 403 });
    }

    // Check for existing pending requests for the same feature
    const { data: existingRequest } = await supabase
      .from('organization_feature_requests')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('feature_key', feature_key)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'A pending request for this feature already exists' 
      }, { status: 409 });
    }

    // Create the feature request
    const { data: featureRequest, error: requestError } = await supabase
      .from('organization_feature_requests')
      .insert([{
        organization_id,
        feature_key,
        request_type,
        reason,
        urgency_level,
        business_justification,
        expected_usage,
        cultural_considerations,
        requested_configuration,
        status: 'pending',
        priority_score: calculatePriorityScore(urgency_level, organization.subscription_tier),
        estimated_review_time: estimateReviewTime(urgency_level, feature_key),
        requires_aboriginal_advisor_review: culturalConsiderationsRequireReview(cultural_considerations)
      }])
      .select()
      .single();

    if (requestError) {
      console.error('Error creating feature request:', requestError);
      return NextResponse.json({ error: 'Failed to create feature request' }, { status: 500 });
    }

    // If cultural considerations require review, create Aboriginal advisor review
    if (culturalConsiderationsRequireReview(cultural_considerations)) {
      await supabase
        .from('aboriginal_advisory_reviews')
        .insert({
          review_type: 'feature_request',
          subject_id: featureRequest.id,
          storyteller_id: null, // This is an organizational request
          organization_id: organization_id,
          advisor_name: 'Aboriginal Advisory Council',
          review_status: 'pending',
          priority_level: urgency_level === 'critical' ? 'urgent' : 'standard',
          cultural_assessment: {
            feature_type: feature_key,
            cultural_impact_potential: true,
            organization_cultural_competency_required: true
          }
        });
    }

    // Notify platform admins (in production, this would send notifications)
    console.log(`New feature request: ${organization.organization_name} requests ${request_type} for ${feature.feature_name}`);

    return NextResponse.json({
      request: featureRequest,
      message: 'Feature request submitted successfully',
      estimated_review_time: estimateReviewTime(urgency_level, feature_key),
      requires_cultural_review: culturalConsiderationsRequireReview(cultural_considerations)
    }, { status: 201 });
  } catch (error) {
    console.error('Error in feature request creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      request_id,
      status,
      admin_response,
      admin_notes,
      reviewed_by,
      approved_configuration
    } = body;

    if (!request_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Update the feature request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('organization_feature_requests')
      .update({
        status,
        admin_response,
        admin_notes,
        reviewed_by,
        reviewed_at: new Date().toISOString(),
        approved_configuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id)
      .select(`
        id,
        organization_id,
        feature_key,
        request_type,
        status,
        organization:organizations(organization_name),
        feature:feature_toggles(feature_name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating feature request:', updateError);
      return NextResponse.json({ error: 'Failed to update feature request' }, { status: 500 });
    }

    // If approved, update the organization's feature configuration
    if (status === 'approved') {
      const enabled = updatedRequest.request_type === 'enable';
      
      await supabase
        .from('organization_feature_config')
        .upsert({
          organization_id: updatedRequest.organization_id,
          feature_key: updatedRequest.feature_key,
          enabled,
          configuration: approved_configuration || {},
          updated_at: new Date().toISOString()
        });

      console.log(`Feature ${updatedRequest.feature_key} ${enabled ? 'enabled' : 'disabled'} for ${(updatedRequest.organization as any)?.organization_name}`);
    }

    return NextResponse.json({
      request: updatedRequest,
      message: `Feature request ${status} successfully`
    });
  } catch (error) {
    console.error('Error in feature request update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function calculatePriorityScore(urgency: string, subscriptionTier: string): number {
  const urgencyScore = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  }[urgency] || 2;

  const tierMultiplier = {
    basic: 1,
    professional: 1.2,
    enterprise: 1.5,
    community_partner: 1.3
  }[subscriptionTier] || 1;

  return urgencyScore * tierMultiplier;
}

function estimateReviewTime(urgency: string, featureKey: string): string {
  const baseTime = {
    low: '5-7 business days',
    medium: '3-5 business days',
    high: '1-2 business days',
    critical: 'Within 24 hours'
  }[urgency] || '3-5 business days';

  // Some features require additional review time
  const complexFeatures = ['ai_analytics', 'mobile_app', 'api_access'];
  if (complexFeatures.includes(featureKey) && urgency !== 'critical') {
    return `${baseTime} (+ cultural review)`;
  }

  return baseTime;
}

function culturalConsiderationsRequireReview(considerations?: string): boolean {
  if (!considerations) return false;
  
  const keywords = [
    'aboriginal', 'indigenous', 'cultural', 'protocol', 'community',
    'traditional', 'cultural competency', 'elder', 'ceremony'
  ];
  
  return keywords.some(keyword => 
    considerations.toLowerCase().includes(keyword)
  );
}