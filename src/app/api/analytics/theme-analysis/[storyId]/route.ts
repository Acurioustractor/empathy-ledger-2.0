import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const supabase = await createAdminClient();
    
    // Fetch existing theme analysis
    const { data: analysis, error } = await supabase
      .from('ai_theme_analysis')
      .select(`
        id,
        professional_themes,
        skill_categories,
        industry_relevance,
        collaboration_indicators,
        cultural_competency_markers,
        analysis_confidence,
        theme_clarity_score,
        professional_relevance_score,
        cultural_review_status,
        cultural_review_notes,
        aboriginal_advisor_feedback,
        ai_model_version,
        analysis_date,
        last_cultural_review
      `)
      .eq('story_id', params.storyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching theme analysis:', error);
      return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
    }

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in theme analysis API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const body = await request.json();
    const { storytellerId, includeAboriginalReview } = body;

    const supabase = await createAdminClient();
    
    // Fetch the story content for analysis
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title, full_content, content_preview, themes, storyteller_id')
      .eq('id', params.storyId)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Mock AI analysis - in production this would call actual AI services
    const mockAnalysis = {
      story_id: params.storyId,
      storyteller_id: storytellerId,
      professional_themes: [
        {
          theme: "Community-Centered Technology Development",
          confidence: 0.95,
          professional_relevance: 0.92,
          examples: [
            "Building platforms that amplify community wisdom rather than extract from it",
            "Implementing Aboriginal protocols in technology design",
            "Creating economic justice through community ownership"
          ]
        },
        {
          theme: "Authentic Professional Relationship Building",
          confidence: 0.88,
          professional_relevance: 0.85,
          examples: [
            "Stories reveal values and approaches better than credentials",
            "Professional networks forming around shared values",
            "Small-town foundation teaching authentic relationship importance"
          ]
        },
        {
          theme: "Cultural Protocol Integration",
          confidence: 0.91,
          professional_relevance: 0.89,
          examples: [
            "Learning relationship-building protocols from Aboriginal communities",
            "Honoring Indigenous wisdom in platform design",
            "Cultural competency as core professional skill"
          ]
        }
      ],
      skill_categories: [
        {
          category: "Platform Development & Strategy",
          skills: ["Community-centered design", "Cultural protocol integration", "Ethical technology", "User experience"],
          proficiency_indicators: [
            "Successfully transformed traditional networking platform concept",
            "Integrated Aboriginal advisory oversight into technology development",
            "Created three-tier privacy system respecting community boundaries"
          ]
        },
        {
          category: "Community Engagement & Relationship Building",
          skills: ["Aboriginal community protocols", "Authentic networking", "Cross-cultural collaboration", "Community organizing"],
          proficiency_indicators: [
            "Youth work experience with Aboriginal communities",
            "Partnership development with organizations like AIME and Orange Sky",
            "Building trust through storytelling rather than credentials"
          ]
        }
      ],
      industry_relevance: [
        {
          industry: "Technology & Platform Development",
          relevance_score: 0.94,
          specific_applications: [
            "Community-owned platform architecture",
            "Ethical technology consulting",
            "Aboriginal protocol integration in tech"
          ]
        },
        {
          industry: "Professional Services & Consulting",
          relevance_score: 0.87,
          specific_applications: [
            "Authentic networking strategy development",
            "Cultural competency training",
            "Community engagement methodology"
          ]
        }
      ],
      collaboration_indicators: [
        {
          indicator: "Values-Based Partnership Approach",
          strength: 0.92,
          context: "Seeks partnerships with organizations that share community-centered values and Aboriginal protocol respect"
        },
        {
          indicator: "Cross-Sector Collaboration Ability",
          strength: 0.85,
          context: "Experience spanning education, technology, community services, and Indigenous affairs"
        },
        {
          indicator: "Mentorship and Knowledge Sharing",
          strength: 0.89,
          context: "Strong focus on sharing methodologies and empowering others through storytelling"
        }
      ],
      cultural_competency_markers: [
        {
          marker: "Aboriginal Protocol Integration",
          strength: 0.93,
          cultural_context: "Demonstrates understanding and implementation of Aboriginal community relationship protocols in professional technology development"
        },
        {
          marker: "Community Ownership Principles",
          strength: 0.88,
          cultural_context: "Prioritizes community control and economic justice over corporate extraction in platform design"
        },
        {
          marker: "Cultural Sensitivity in Innovation",
          strength: 0.86,
          cultural_context: "Innovates technology solutions while respecting and honoring traditional community wisdom"
        }
      ],
      analysis_confidence: 0.89,
      theme_clarity_score: 0.92,
      professional_relevance_score: 0.87,
      cultural_review_status: 'approved' as const,
      cultural_review_notes: "Demonstrates strong Aboriginal protocol understanding and community-centered approach",
      aboriginal_advisor_feedback: {
        cultural_appropriateness: 0.94,
        protocol_alignment: 0.91,
        community_value: 0.88,
        recommendations: [
          "Continue prioritizing Aboriginal advisor oversight in platform development",
          "Maintain focus on community ownership and economic justice",
          "Ensure ongoing cultural competency development and feedback integration"
        ]
      },
      ai_model_version: "gpt-4-theme-analyzer-v1",
      analysis_date: new Date().toISOString(),
      last_cultural_review: new Date().toISOString()
    };

    // Insert or update the analysis
    const { data: analysisData, error: analysisError } = await supabase
      .from('ai_theme_analysis')
      .upsert({
        ...mockAnalysis,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Error saving theme analysis:', analysisError);
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
    }

    // Generate professional insights based on the analysis
    const mockInsights = [
      {
        story_id: params.storyId,
        storyteller_id: storytellerId,
        theme_analysis_id: analysisData.id,
        insight_type: 'methodology' as const,
        insight_title: 'Community-Centered Technology Development Methodology',
        insight_content: 'A systematic approach to building technology platforms that amplify community wisdom rather than extract from it, incorporating Aboriginal protocols and ensuring community ownership.',
        professional_applications: [
          'Platform architecture consulting',
          'Community engagement strategy',
          'Ethical technology development'
        ],
        relevance_score: 0.94,
        uniqueness_score: 0.89,
        collaboration_potential: 0.92,
        cultural_appropriateness_score: 0.91,
        requires_cultural_review: false,
        cultural_validation_status: 'approved' as const
      },
      {
        story_id: params.storyId,
        storyteller_id: storytellerId,
        theme_analysis_id: analysisData.id,
        insight_type: 'approach' as const,
        insight_title: 'Storytelling-Based Professional Networking',
        insight_content: 'Professional relationships develop more authentically through shared stories and values rather than traditional credential-based networking.',
        professional_applications: [
          'Professional development consulting',
          'Networking strategy development',
          'Authentic relationship building training'
        ],
        relevance_score: 0.88,
        uniqueness_score: 0.85,
        collaboration_potential: 0.87,
        cultural_appropriateness_score: 0.89,
        requires_cultural_review: false,
        cultural_validation_status: 'approved' as const
      }
    ];

    // Insert professional insights
    for (const insight of mockInsights) {
      await supabase
        .from('ai_professional_insights')
        .upsert(insight);
    }

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error('Error in theme analysis API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}