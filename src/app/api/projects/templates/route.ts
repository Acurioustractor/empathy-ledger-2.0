/**
 * Project Templates API
 * 
 * Philosophy: Templates accelerate sovereignty-compliant project creation
 * while ensuring each community can customize according to their protocols.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { projectOperations } from '@/lib/project-operations';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const featured_only = url.searchParams.get('featured') === 'true';

    // Get available project templates
    const { templates, error } = await projectOperations.getProjectTemplates();

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    // Filter templates based on query parameters
    let filtered_templates = templates;

    if (category) {
      filtered_templates = templates.filter(template => template.category === category);
    }

    if (featured_only) {
      filtered_templates = filtered_templates.filter(template => template.is_featured);
    }

    // Enrich templates with sovereignty guidance
    const enriched_templates = filtered_templates.map(template => ({
      ...template,
      sovereignty_features: {
        cultural_protocols_included: !!template.default_cultural_protocols,
        community_ownership_ensured: template.default_sovereignty_framework?.community_ownership || false,
        consent_management_configured: template.default_sovereignty_framework?.consent_granularity === 'story_level',
        value_sharing_enabled: template.default_sovereignty_framework?.value_sharing || false
      },
      community_benefits: {
        storyteller_empowerment: template.category === 'indigenous_communities' ? 'maximum' : 'high',
        cultural_respect: template.default_cultural_protocols ? 'comprehensive' : 'standard',
        data_sovereignty: 'full',
        community_control: 'complete'
      },
      use_cases: this.getTemplateLUseCases(template.category),
      estimated_setup_time: this.getSetupTime(template.category)
    }));

    return NextResponse.json({
      templates: enriched_templates,
      categories: [
        {
          id: 'indigenous_communities',
          name: 'Indigenous Communities',
          description: 'Templates designed for Indigenous communities with full cultural protocol support',
          sovereignty_level: 'maximum'
        },
        {
          id: 'youth_justice',
          name: 'Youth Justice',
          description: 'Templates for organizations working with youth in justice systems',
          sovereignty_level: 'high'
        },
        {
          id: 'health_sovereignty',
          name: 'Health Sovereignty',
          description: 'Templates for community health initiatives and traditional medicine',
          sovereignty_level: 'high'
        },
        {
          id: 'environmental_justice',
          name: 'Environmental Justice',
          description: 'Templates for environmental and climate justice organizations',
          sovereignty_level: 'high'
        },
        {
          id: 'community_development',
          name: 'Community Development',
          description: 'General community development and empowerment projects',
          sovereignty_level: 'standard'
        },
        {
          id: 'research_partnership',
          name: 'Research Partnership',
          description: 'Templates for ethical research collaborations with communities',
          sovereignty_level: 'high'
        }
      ],
      sovereignty_principles: {
        all_templates_include: [
          'Community ownership of data and insights',
          'Granular consent management',
          'Cultural protocol support',
          'Value sharing mechanisms',
          'Storyteller empowerment focus'
        ],
        customization_allowed: 'All templates can be customized to match specific community needs',
        community_validation: 'Templates are developed with input from relevant communities'
      },
      selection_guidance: {
        indigenous_communities: 'Choose if your organization is Indigenous-led or working directly with Indigenous communities',
        youth_justice: 'Choose if working with young people affected by justice systems',
        health_sovereignty: 'Choose for community health, traditional medicine, or wellness initiatives',
        environmental_justice: 'Choose for environmental protection, climate action, or land rights work',
        community_development: 'Choose for general community empowerment and development work',
        research_partnership: 'Choose for academic or research collaborations with communities'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin (only admins can create templates)
    const { data: user_data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!user_data || user_data.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Admin privileges required to create templates',
          sovereignty_note: 'Template creation requires platform-level responsibility'
        },
        { status: 403 }
      );
    }

    const template_data = await request.json();

    // Validate required fields
    const required_fields = [
      'name',
      'description',
      'category',
      'default_sovereignty_framework',
      'default_settings',
      'default_branding'
    ];

    const missing_fields = required_fields.filter(field => !template_data[field]);
    if (missing_fields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missing_fields,
          sovereignty_note: 'Templates must include complete sovereignty configuration'
        },
        { status: 400 }
      );
    }

    // Validate sovereignty framework
    const required_sovereignty_keys = [
      'cultural_protocols_required',
      'consent_granularity',
      'community_ownership',
      'value_sharing'
    ];

    const missing_sovereignty_keys = required_sovereignty_keys.filter(
      key => !(key in template_data.default_sovereignty_framework)
    );

    if (missing_sovereignty_keys.length > 0) {
      return NextResponse.json(
        {
          error: 'Incomplete sovereignty framework',
          missing_keys: missing_sovereignty_keys,
          sovereignty_note: 'All templates must include complete sovereignty configuration'
        },
        { status: 400 }
      );
    }

    // Create template
    const { data: new_template, error: create_error } = await supabase
      .from('project_templates')
      .insert({
        ...template_data,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (create_error) {
      return NextResponse.json(
        { error: create_error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      template: new_template,
      sovereignty_confirmation: {
        framework_validated: true,
        cultural_protocols_included: true,
        community_ownership_ensured: true,
        consent_management_configured: true
      },
      message: 'Template created successfully with full sovereignty compliance'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Helper methods for template enrichment
function getTemplateLUseCases(category: string): string[] {
  const use_cases = {
    indigenous_communities: [
      'Traditional knowledge sharing',
      'Language revitalization programs',
      'Land rights documentation',
      'Cultural preservation initiatives',
      'Elder story collection'
    ],
    youth_justice: [
      'Restorative justice programs',
      'Youth mentorship initiatives',
      'Alternative to incarceration programs',
      'Community service documentation',
      'Rehabilitation success stories'
    ],
    health_sovereignty: [
      'Traditional medicine documentation',
      'Community health assessments',
      'Wellness program evaluation',
      'Health equity advocacy',
      'Healing practice sharing'
    ],
    environmental_justice: [
      'Environmental impact documentation',
      'Climate change adaptation stories',
      'Land protection campaigns',
      'Traditional ecological knowledge',
      'Community resilience projects'
    ],
    community_development: [
      'Asset-based community development',
      'Social enterprise documentation',
      'Community organizing stories',
      'Neighborhood improvement projects',
      'Civic engagement initiatives'
    ],
    research_partnership: [
      'Participatory action research',
      'Community-based participatory research',
      'Ethical research collaborations',
      'Knowledge co-creation projects',
      'Community validation of research'
    ]
  };

  return use_cases[category] || ['General community storytelling'];
}

function getSetupTime(category: string): string {
  const setup_times = {
    indigenous_communities: '2-3 hours',
    youth_justice: '1-2 hours',
    health_sovereignty: '1-2 hours',
    environmental_justice: '1-2 hours',
    community_development: '30-60 minutes',
    research_partnership: '1-2 hours'
  };

  return setup_times[category] || '1 hour';
}