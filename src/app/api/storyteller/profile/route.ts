import { NextRequest, NextResponse } from 'next/server';

// Demo data for Ben Knight's profile
const BEN_KNIGHT_PROFILE = {
  id: 'ben-knight-demo',
  full_name: 'Ben Knight',
  current_role: 'Founder & Platform Builder',
  current_organization: 'A Curious Tractor',
  professional_summary: `Building community-centered technology that empowers storytellers and honors community wisdom. Creator of Empathy Ledger, the storytelling-centered alternative to LinkedIn. From youth work in Aboriginal communities to co-founding A Curious Tractor, my professional journey demonstrates how authentic relationships create more meaningful careers and stronger communities.`,
  professional_journey_narrative: `My professional evolution from youth worker in Muswellbrook to platform builder demonstrates how community wisdom shapes ethical technology development. Working with Aboriginal and Torres Strait Islander communities taught me relationship-building protocols that now inform every aspect of Empathy Ledger's design. Through roles at Orange Sky, AIME, and co-founding A Curious Tractor, I learned that the most powerful professional relationships emerge from understanding each other's stories, values, and approaches rather than optimizing for algorithmic engagement.`,
  expertise_areas: [
    'Community-Centered Platform Development',
    'Aboriginal Cultural Protocols in Technology',
    'Ethical Technology & Social Impact',
    'Strategic Vision & Execution',
    'Professional Storytelling & Authentic Networking',
    'Youth Justice & Community Advocacy',
    'Cross-Cultural Collaboration',
    'Cooperative Business Models',
    'Data Sovereignty & Community Ownership'
  ],
  speaking_topics: [
    'The Future of Professional Networking: From Resumes to Stories',
    'Building Ethical Technology That Empowers Communities',
    'Aboriginal Wisdom and Global Platform Design',
    'Community-Centered Platform Development: Principles and Practices',
    'From Community Work to Platform Building: Scaling Empathy Through Technology'
  ],
  consulting_services: [
    'Community Engagement Strategy Consultation',
    'Platform Development & Technology Ethics',
    'Professional Storytelling & Authentic Networking Training',
    'Cooperative & Social Enterprise Development'
  ],
  story_previews: [
    {
      id: 'muswellbrook-to-global',
      title: 'From Muswellbrook to Global Platform: A Journey in Community-Centered Innovation',
      summary: 'Growing up in Muswellbrook taught me that authentic relationships matter more than credentials. This small-town foundation led me through youth work with Aboriginal communities, international teaching experiences, and roles with Orange Sky and AIME—each teaching me how technology could amplify community wisdom rather than extract from it.',
      themes: ['Community Relationships', 'Professional Evolution', 'Platform Building']
    },
    {
      id: 'curious-tractor-origin',
      title: 'The Origin of A Curious Tractor: Building Technology That Cultivates Community',
      summary: 'The name "A Curious Tractor" perfectly captures our philosophy: technology should cultivate community growth rather than extract community value. A tractor doesn\'t harvest—it prepares soil for growth, working with natural systems rather than against them.',
      themes: ['Social Enterprise', 'Community-Centered Technology', 'Partnership']
    },
    {
      id: 'aboriginal-wisdom-platforms',
      title: 'Aboriginal Communities and Global Platforms: Cultural Protocols in Technology Design',
      summary: 'The most important lesson about building platforms didn\'t come from computer science—it came from Aboriginal and Torres Strait Islander communities who taught me that authentic relationship-building has protocols refined over thousands of years.',
      themes: ['Cultural Competency', 'Data Sovereignty', 'Indigenous Wisdom']
    },
    {
      id: 'building-empathy-ledger',
      title: 'Building Empathy Ledger: From Vision to Platform',
      summary: 'Building Empathy Ledger has been like solving a puzzle where half the pieces don\'t exist yet and the other half keep changing based on community feedback. Every technical challenge became a community challenge, requiring innovation at every level.',
      themes: ['Platform Development', 'Technical Innovation', 'Community Input']
    },
    {
      id: 'community-technology-philosophy',
      title: 'Community-Centered Technology Philosophy: Principles for Building Platforms That Empower',
      summary: 'The most important question I ask when building technology isn\'t "How can we make this more efficient?" but "How does this serve the communities who will use it, and how do we know?" This question has become the foundation for everything I build.',
      themes: ['Technology Ethics', 'Community Empowerment', 'Design Principles']
    }
  ],
  services: [
    {
      service_type: 'consultation',
      service_name: 'Community Engagement Strategy',
      base_price: 200
    },
    {
      service_type: 'consultation', 
      service_name: 'Platform Development Ethics',
      base_price: 250
    },
    {
      service_type: 'speaking',
      service_name: 'Future of Professional Networking',
      base_price: 2500
    },
    {
      service_type: 'workshop',
      service_name: 'Storytelling for Professional Development',
      base_price: 1500
    }
  ],
  privacy_tier_settings: {
    public: {
      basic_identity: true,
      professional_overview: true,
      story_previews: true,
      contact_options: true
    },
    paywall: {
      price_monthly: 25,
      price_annual: 250,
      one_time_price: 50
    },
    organizational: {
      available: true,
      services: ['consultation', 'speaking', 'advisory'],
      partnership_preferences: {}
    }
  },
  total_expertise_areas: 9
};

function applyPrivacyTier(profile: typeof BEN_KNIGHT_PROFILE, accessLevel: string) {
  if (accessLevel === 'public') {
    return {
      ...profile,
      professional_summary: profile.professional_summary.substring(0, 200) + '...',
      expertise_areas: profile.expertise_areas.slice(0, 3),
      professional_journey_narrative: undefined, // Hide full narrative
      story_previews: profile.story_previews.map(story => ({
        ...story,
        summary: story.summary.substring(0, 150) + '...'
      })),
      services: profile.services.map(service => ({
        service_type: service.service_type,
        service_name: service.service_name,
        base_price: service.base_price
      }))
    };
  }
  
  if (accessLevel === 'paywall') {
    // Return full profile content for premium subscribers
    return profile;
  }
  
  if (accessLevel === 'organizational') {
    // Return full profile plus organizational features
    return {
      ...profile,
      organizational_features: {
        custom_consultation: true,
        priority_response: true,
        bulk_licensing: true
      }
    };
  }
  
  return profile;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storytellerId = searchParams.get('storyteller_id');
    const accessLevel = searchParams.get('access_level') || 'public';

    // For demo, we only have Ben's profile
    if (!storytellerId || storytellerId !== 'ben-knight-demo') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has subscription access (demo mode)
    if (accessLevel === 'paywall') {
      const hasSubscription = checkSubscriptionAccess(storytellerId);
      if (!hasSubscription) {
        // Return public version if no subscription
        const publicProfile = applyPrivacyTier(BEN_KNIGHT_PROFILE, 'public');
        return NextResponse.json(publicProfile);
      }
    }

    // Apply privacy tier filtering
    const filteredProfile = applyPrivacyTier(BEN_KNIGHT_PROFILE, accessLevel);

    return NextResponse.json(filteredProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storytellerId = searchParams.get('storyteller_id');
    const profileData = await request.json();

    // For demo purposes, just return success
    // In production, this would update the database
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile_id: storytellerId 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

function checkSubscriptionAccess(storytellerId: string): boolean {
  // In demo mode, check localStorage for subscription
  // In production, this would check the database
  try {
    if (typeof window !== 'undefined') {
      const subscription = localStorage.getItem(`subscription_${storytellerId}`);
      return !!subscription;
    }
    return false;
  } catch {
    return false;
  }
}