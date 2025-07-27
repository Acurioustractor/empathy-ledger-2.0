import { NextRequest, NextResponse } from 'next/server';

// Demo story data for Ben Knight - integrating with enhanced schema
const BEN_KNIGHT_STORIES = {
  'muswellbrook-to-global': {
    id: 'muswellbrook-to-global',
    storyteller_id: 'ben-knight-demo',
    title: 'From Muswellbrook to Global Platform: A Journey in Community-Centered Innovation',
    summary: 'Growing up in Muswellbrook taught me that authentic relationships matter more than credentials. This small-town foundation led me through youth work with Aboriginal communities, international teaching experiences, and roles with Orange Sky and AIME—each teaching me how technology could amplify community wisdom rather than extract from it.',
    story_type: 'primary',
    content_status: 'published',
    themes: ['Community Relationships', 'Professional Evolution', 'Platform Building', 'Aboriginal Wisdom', 'Ethical Technology'],
    storyteller: {
      full_name: 'Ben Knight',
      current_role: 'Founder & Platform Builder',
      current_organization: 'A Curious Tractor'
    },
    content_structure: {
      word_count: 2500,
      reading_time_minutes: 12,
      sections: [
        {
          id: 'intro',
          section_order: 1,
          section_type: 'introduction',
          section_title: 'Small Town Foundations',
          section_content: `Growing up in Muswellbrook, a coal mining town in the Hunter Valley, I learned that authentic relationships matter more than credentials. My dad worked the mines, my mum taught at the local school, and our community operated on trust, shared values, and mutual support rather than networking optimization or personal branding.
          
          This foundation shaped everything that followed—from youth work with Aboriginal communities to building Empathy Ledger as the storytelling-centered alternative to LinkedIn. The most important professional lesson came not from any university or corporate training, but from understanding that meaningful work emerges from genuine relationships and shared purpose.`,
          key_quotes: [
            'Authentic relationships matter more than credentials',
            'Meaningful work emerges from genuine relationships and shared purpose'
          ],
          multimedia_elements: [
            {
              type: 'image',
              url: '/story-images/muswellbrook-landscape.jpg',
              caption: 'Muswellbrook: Where I learned that community strength comes from authentic relationships'
            }
          ]
        },
        {
          id: 'community-wisdom',
          section_order: 2,
          section_type: 'narrative',
          section_title: 'Learning from Aboriginal Communities',
          section_content: `My most significant professional education came through youth work with Aboriginal and Torres Strait Islander communities. These experiences taught me relationship-building protocols refined over thousands of years—wisdom about how authentic connection creates stronger communities and more effective collaboration.
          
          Working with Aboriginal youth in Muswellbrook and later through AIME, I learned that the best technology amplifies community wisdom rather than extracting from it. This insight became the foundation for everything I've built since, including the community-centered design principles that inform Empathy Ledger's architecture.
          
          Aboriginal communities taught me that professional relationships based on reciprocity, respect, and shared responsibility create better outcomes than networks optimized for individual advancement. This isn't just culturally appropriate—it's more effective.`,
          key_quotes: [
            'Professional relationships based on reciprocity, respect, and shared responsibility create better outcomes than networks optimized for individual advancement',
            'The best technology amplifies community wisdom rather than extracting from it'
          ],
          multimedia_elements: [
            {
              type: 'professional_insight',
              text: 'Indigenous protocols for relationship-building offer time-tested frameworks for authentic professional collaboration that create sustainable outcomes for all participants.'
            }
          ]
        },
        {
          id: 'platform-evolution',
          section_order: 3,
          section_type: 'narrative',
          section_title: 'From Community Work to Platform Building',
          section_content: `The journey from youth work to platform development wasn't linear, but every experience reinforced the same insight: authentic professional relationships develop through understanding each other's stories, values, and approaches rather than optimizing profiles for algorithmic engagement.
          
          Through roles at Orange Sky and AIME, I saw how storytelling reveals expertise in ways that traditional credentials cannot capture. The homeless individuals we served often had profound wisdom about community resilience and human dignity. The Aboriginal youth I worked with demonstrated leadership capabilities that no standardized assessment could measure.
          
          These experiences convinced me that professional networking needed a fundamental redesign—one that honors community wisdom, creates economic opportunities for storytellers, and builds relationships based on shared values rather than transactional exchanges.`,
          key_quotes: [
            'Authentic professional relationships develop through understanding each other\'s stories, values, and approaches',
            'Storytelling reveals expertise in ways that traditional credentials cannot capture'
          ],
          multimedia_elements: [
            {
              type: 'quote_highlight',
              text: 'Professional networking needed a fundamental redesign—one that honors community wisdom, creates economic opportunities for storytellers, and builds relationships based on shared values.',
              context: 'This insight led directly to the development of Empathy Ledger as the storytelling-centered alternative to LinkedIn'
            }
          ]
        },
        {
          id: 'empathy-ledger',
          section_order: 4,
          section_type: 'outcome',
          section_title: 'Building Empathy Ledger: Technology That Serves Community',
          section_content: `Building Empathy Ledger represents the culmination of everything I learned about authentic relationship-building, community-centered technology, and professional development through storytelling. The platform operates on principles learned from Aboriginal communities: reciprocity, respect, shared responsibility, and community ownership.
          
          Rather than extracting value from users' content and relationships, Empathy Ledger ensures storytellers own their content completely, earn 70% of subscription revenue, and participate meaningfully in platform governance. This isn't just ethical—it creates better outcomes for everyone involved.
          
          The three-tier privacy system allows professionals to share their expertise authentically while maintaining control over access and monetization. Stories reveal cultural competency, community trust, and collaborative approaches in ways that LinkedIn profiles cannot capture.`,
          key_quotes: [
            'Stories reveal cultural competency, community trust, and collaborative approaches in ways that LinkedIn profiles cannot capture',
            'Rather than extracting value from users, Empathy Ledger ensures storytellers own their content completely and earn 70% of subscription revenue'
          ],
          multimedia_elements: [
            {
              type: 'professional_insight',
              text: 'Community ownership models create sustainable technology platforms that empower users rather than extracting value from their content and relationships.'
            }
          ]
        },
        {
          id: 'future-vision',
          section_order: 5,
          section_type: 'reflection',
          section_title: 'The Future of Professional Networking',
          section_content: `The future of professional networking isn't about better algorithms or more sophisticated targeting—it's about returning to the relationship-building wisdom that creates authentic community connections and meaningful collaboration opportunities.
          
          Empathy Ledger proves that technology can honor Indigenous protocols, create economic justice for content creators, and build professional relationships based on shared values rather than competitive positioning. This approach creates more sustainable careers and stronger communities.
          
          From Muswellbrook to global platform development, the lesson remains consistent: authentic relationships matter more than credentials, and technology should amplify community wisdom rather than extract from it. This is how we build a professional networking future that serves everyone rather than enriching platform owners at the expense of user communities.`,
          key_quotes: [
            'The future of professional networking is about returning to relationship-building wisdom that creates authentic community connections',
            'Technology should amplify community wisdom rather than extract from it'
          ],
          multimedia_elements: [
            {
              type: 'image',
              url: '/story-images/empathy-ledger-community.jpg',
              caption: 'Empathy Ledger: Where authentic professional relationships develop through storytelling'
            }
          ]
        }
      ]
    },
    featured_image_url: '/story-images/ben-muswellbrook-hero.jpg',
    key_quotes: [
      'Authentic relationships matter more than credentials',
      'Technology should amplify community wisdom rather than extract from it',
      'The most important professional networks form around shared values and approaches',
      'Professional relationships based on reciprocity, respect, and shared responsibility create better outcomes',
      'Stories reveal expertise in ways that traditional credentials cannot capture'
    ],
    professional_outcomes: [
      'Community-centered platform development and technology ethics consultation',
      'Aboriginal community engagement and cultural protocol implementation',
      'Professional storytelling and authentic networking strategy development',
      'Ethical technology design and community ownership model creation',
      'Youth engagement and community relationship building methodology'
    ],
    collaboration_opportunities: [
      'Speaking engagements on the future of professional networking',
      'Partnership opportunities for ethical technology development',
      'Collaboration with organizations building community-owned platforms',
      'Aboriginal community protocol training and consultation',
      'Platform cooperative development and governance design'
    ],
    methodology_insights: [
      'Relationship-building protocols learned from Aboriginal communities',
      'Community-centered technology development principles',
      'Authentic professional networking through storytelling',
      'Economic justice through platform ownership and revenue sharing',
      'Cultural competency integration in technology design'
    ],
    view_count: 1247,
    read_completion_rate: 78.5,
    engagement_score: 85.2
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const accessLevel = searchParams.get('access_level') || 'public';
    const storyId = resolvedParams.storyId;

    // For demo, we have Ben's primary story
    const story = BEN_KNIGHT_STORIES[storyId as keyof typeof BEN_KNIGHT_STORIES];
    
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' }, 
        { status: 404 }
      );
    }

    // Apply access level filtering
    const filteredStory = applyAccessLevelFiltering(story, accessLevel);

    // Track story view (in production this would update database)
    console.log('Story viewed:', {
      story_id: storyId,
      access_level: accessLevel,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(filteredStory);

  } catch (error) {
    console.error('Failed to fetch story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' }, 
      { status: 500 }
    );
  }
}

function applyAccessLevelFiltering(story: any, accessLevel: string) {
  if (accessLevel === 'public') {
    // Public access - limited content
    return {
      ...story,
      content_structure: {
        ...story.content_structure,
        sections: story.content_structure.sections.map((section: any) => ({
          ...section,
          section_content: section.section_content.substring(0, 300) + '...',
          key_quotes: section.key_quotes ? section.key_quotes.slice(0, 1) : [],
          multimedia_elements: []
        }))
      },
      professional_outcomes: story.professional_outcomes.slice(0, 3),
      collaboration_opportunities: [],
      methodology_insights: []
    };
  }
  
  if (accessLevel === 'paywall') {
    // Premium access - full content
    return story;
  }
  
  if (accessLevel === 'organizational') {
    // Organizational access - full content plus additional features
    return {
      ...story,
      organizational_features: {
        custom_consultation_available: true,
        bulk_licensing_options: true,
        priority_response_time: '24 hours',
        direct_contact_information: 'ben@acurioustractor.org'
      }
    };
  }
  
  return story;
}