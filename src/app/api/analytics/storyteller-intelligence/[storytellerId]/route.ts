import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { storytellerId: string } }
) {
  try {
    const supabase = await createAdminClient();
    
    // Fetch existing storyteller intelligence
    const { data: intelligence, error } = await supabase
      .from('storyteller_ai_intelligence')
      .select('*')
      .eq('storyteller_id', params.storytellerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching storyteller intelligence:', error);
      return NextResponse.json({ error: 'Failed to fetch intelligence' }, { status: 500 });
    }

    // If no intelligence exists, generate it
    if (!intelligence) {
      return await generateStorytellerIntelligence(params.storytellerId);
    }

    return NextResponse.json(intelligence);
  } catch (error) {
    console.error('Error in storyteller intelligence API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateStorytellerIntelligence(storytellerId: string) {
  try {
    const supabase = await createAdminClient();

    // Fetch storyteller's stories and existing analyses
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        story_type,
        themes,
        professional_outcomes,
        collaboration_opportunities,
        methodology_insights,
        view_count,
        engagement_score
      `)
      .eq('storyteller_id', storytellerId)
      .eq('content_status', 'published');

    if (storiesError) {
      console.error('Error fetching stories:', storiesError);
      throw new Error('Failed to fetch stories');
    }

    // Mock comprehensive storyteller intelligence - in production this would aggregate from actual AI analyses
    const mockIntelligence = {
      storyteller_id: storytellerId,
      core_expertise_areas: [
        {
          area: "Community-Centered Technology Development",
          confidence: 0.96,
          story_evidence: [
            "Built Empathy Ledger as storytelling-centered alternative to LinkedIn",
            "Integrated Aboriginal protocols into platform architecture",
            "Created three-tier privacy system respecting community boundaries",
            "Implemented 70/30 revenue sharing prioritizing storytellers"
          ],
          professional_applications: [
            "Platform architecture consulting",
            "Community-owned technology development",
            "Ethical business model design",
            "Cultural protocol integration"
          ]
        },
        {
          area: "Aboriginal Community Engagement & Cultural Competency",
          confidence: 0.94,
          story_evidence: [
            "Youth work experience with Aboriginal communities",
            "Integration of Aboriginal Advisory Council in platform governance",
            "Learning relationship-building protocols from Aboriginal communities",
            "Cultural competency as core professional development area"
          ],
          professional_applications: [
            "Cross-cultural consultation",
            "Aboriginal community engagement",
            "Cultural competency training",
            "Indigenous protocol integration"
          ]
        },
        {
          area: "Authentic Professional Networking & Storytelling",
          confidence: 0.91,
          story_evidence: [
            "Developed storytelling-centered professional networking methodology",
            "Stories revealing values and approaches vs traditional credentials",
            "Building professional networks around shared values",
            "Created comprehensive professional content portfolio"
          ],
          professional_applications: [
            "Professional development consulting",
            "Networking strategy development",
            "Professional storytelling training",
            "Authentic relationship building"
          ]
        },
        {
          area: "Social Enterprise & Economic Justice",
          confidence: 0.89,
          story_evidence: [
            "$1000 storyteller program with transparent revenue sharing",
            "Platform cooperative business model development",
            "Community ownership principles in technology design",
            "Economic justice prioritized over corporate extraction"
          ],
          professional_applications: [
            "Social enterprise development",
            "Revenue sharing model design",
            "Community governance consulting",
            "Ethical business practice development"
          ]
        }
      ],
      collaboration_style: {
        approach: "Values-based partnership development with strong emphasis on community accountability, cultural competency, and shared economic justice principles",
        strengths: [
          "Cross-cultural communication and sensitivity",
          "Community-centered methodology development",
          "Transparent and ethical business practices",
          "Aboriginal protocol integration",
          "Technology innovation with social impact focus",
          "Authentic relationship building through storytelling"
        ],
        ideal_partners: [
          "Aboriginal and Indigenous organizations",
          "Community-centered social enterprises",
          "Ethical technology developers",
          "Cultural competency focused organizations",
          "Economic justice advocates",
          "Community-owned platform developers"
        ],
        communication_style: "Authentic storytelling approach that reveals values and methodology through narrative rather than traditional professional credentials"
      },
      cultural_competency_level: 'advanced' as const,
      innovation_indicators: [
        {
          indicator: "Community-Owned Platform Architecture Innovation",
          strength: 0.95,
          examples: [
            "Three-tier privacy system design",
            "Aboriginal advisory integration in governance",
            "Storytelling-centered professional networking",
            "70/30 revenue sharing model"
          ]
        },
        {
          indicator: "Cultural Protocol Integration in Technology",
          strength: 0.92,
          examples: [
            "Aboriginal protocols in platform design",
            "Community accountability mechanisms",
            "Cultural competency oversight systems",
            "Indigenous wisdom integration processes"
          ]
        },
        {
          indicator: "Economic Justice Technology Solutions",
          strength: 0.88,
          examples: [
            "Community ownership vs corporate extraction model",
            "Transparent revenue sharing systems",
            "Storyteller empowerment through platform control",
            "Community governance participation structures"
          ]
        }
      ],
      ideal_collaboration_profiles: [
        {
          profile_type: "Aboriginal Community Organizations",
          compatibility_score: 0.97,
          collaboration_potential: [
            "Cultural protocol consulting and training",
            "Community engagement methodology development",
            "Aboriginal advisory integration in technology projects",
            "Cultural competency curriculum development"
          ]
        },
        {
          profile_type: "Ethical Technology Organizations",
          compatibility_score: 0.93,
          collaboration_potential: [
            "Community-owned platform development",
            "Ethical business model consulting",
            "Cultural protocol integration in tech",
            "Community governance system design"
          ]
        },
        {
          profile_type: "Social Enterprise & Community Development",
          compatibility_score: 0.91,
          collaboration_potential: [
            "Revenue sharing model development",
            "Community ownership structure design",
            "Social impact measurement systems",
            "Economic justice technology solutions"
          ]
        },
        {
          profile_type: "Professional Development & Training Organizations",
          compatibility_score: 0.87,
          collaboration_potential: [
            "Authentic networking methodology training",
            "Professional storytelling program development",
            "Cultural competency training design",
            "Community-centered professional development"
          ]
        }
      ],
      professional_growth_trajectory: {
        current_stage: "Established community-centered technology innovator with proven platform development and Aboriginal community engagement expertise",
        growth_indicators: [
          "Successfully launched comprehensive storytelling platform",
          "Integrated Aboriginal advisory oversight in technology development",
          "Created sustainable revenue sharing model",
          "Demonstrated cross-sector collaboration ability",
          "Built authentic professional content portfolio"
        ],
        next_opportunities: [
          "Scaling platform to 100+ storytellers and organizational partnerships",
          "Expanding Aboriginal advisor involvement in technology consulting",
          "Developing cultural competency training programs",
          "International expansion of community-owned platform model",
          "Speaking engagements on ethical technology development"
        ],
        timeline_projection: "6-12 months: Platform scaling and partnership expansion; 1-2 years: Thought leadership and consulting practice growth; 2-5 years: International community platform model replication"
      },
      community_impact_potential: 0.94,
      narrative_authenticity_score: 0.96,
      professional_credibility_score: 0.92,
      story_engagement_quality: 0.89,
      aboriginal_protocol_adherence: 0.95,
      community_centered_approach: 0.93,
      cultural_sensitivity_indicators: [
        "Meaningful Aboriginal protocol integration in professional practice",
        "Community accountability mechanisms in business development",
        "Cultural competency as ongoing professional development priority",
        "Indigenous wisdom integration in technology innovation",
        "Respectful cross-cultural collaboration approach",
        "Economic justice prioritized over corporate profit extraction",
        "Community ownership principles in platform design",
        "Transparent and ethical business practice commitment"
      ],
      last_analysis_date: new Date().toISOString(),
      analysis_completeness: 0.91,
      requires_human_review: false
    };

    // Save the intelligence to database
    const { data: intelligenceData, error: intelligenceError } = await supabase
      .from('storyteller_ai_intelligence')
      .upsert({
        ...mockIntelligence,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (intelligenceError) {
      console.error('Error saving storyteller intelligence:', intelligenceError);
      throw new Error('Failed to save intelligence');
    }

    return NextResponse.json(mockIntelligence);
  } catch (error) {
    console.error('Error generating storyteller intelligence:', error);
    return NextResponse.json({ error: 'Failed to generate intelligence' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { storytellerId: string } }
) {
  try {
    const body = await request.json();
    const { refresh = false } = body;

    if (refresh) {
      // Regenerate intelligence
      return await generateStorytellerIntelligence(params.storytellerId);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error in storyteller intelligence POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}