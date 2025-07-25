import { saveCulturalProtocol, getCulturalProtocols, saveSetting, getSetting } from './database';

// Types
interface CulturalProtocolCheck {
  story_id: string;
  storyteller_cultural_level: string;
  reader_context: 'mobile_reading' | 'collaboration' | 'sharing';
}

interface CulturalProtocolResponse {
  requires_acknowledgment: boolean;
  protocol_level: 'basic' | 'standard' | 'enhanced' | 'elder_consultation';
  message?: string;
  guidance?: string[];
  advisor_contact?: string;
}

interface CulturalProtocolStatus {
  accepted: boolean;
  onboardingComplete: boolean;
  lastReviewDate?: string;
  competencyLevel: string;
}

// Core cultural protocols
const CULTURAL_PROTOCOLS = {
  basic: {
    id: 'basic-respect',
    protocol_type: 'basic',
    description: 'Basic respect and cultural awareness when engaging with Indigenous and cultural content',
    acceptance_required: true,
    guidance: [
      'Approach all stories with respect and open-mindedness',
      'Recognize that some content may contain cultural knowledge',
      'Be mindful of your own cultural perspective and potential bias',
      'Ask questions respectfully if seeking to understand'
    ]
  },
  standard: {
    id: 'cultural-competency',
    protocol_type: 'standard',
    description: 'Standard cultural competency protocols for engaging with Aboriginal and Indigenous content',
    acceptance_required: true,
    guidance: [
      'Understand that Aboriginal knowledge is owned by communities',
      'Do not appropriate or misuse cultural information',
      'Respect protocols around sacred and sensitive content',
      'Support Indigenous storytellers through engagement and sharing'
    ]
  },
  enhanced: {
    id: 'advanced-protocols',
    protocol_type: 'enhanced',
    description: 'Enhanced protocols for deep cultural engagement and collaboration',
    acceptance_required: true,
    guidance: [
      'Actively center Indigenous voices and perspectives',
      'Challenge colonial narratives and assumptions',
      'Seek permission before sharing cultural content',
      'Contribute to decolonization efforts through your engagement'
    ]
  },
  elder_consultation: {
    id: 'elder-oversight',
    protocol_type: 'elder_consultation',
    description: 'Elder and advisor consultation protocols for sensitive cultural content',
    acceptance_required: true,
    guidance: [
      'This content requires elder or cultural advisor oversight',
      'Engage only with proper cultural guidance and support',
      'Honor traditional protocols and ceremonial considerations',
      'Contribute to cultural preservation and revitalization'
    ]
  }
};

// Aboriginal Advisory Council contact information
const ABORIGINAL_ADVISORY = {
  contact_email: 'advisory@empathyledger.com',
  protocols_coordinator: 'Elder Mary Sinclair',
  cultural_competency_resources: 'https://empathyledger.com/cultural-competency',
  community_guidelines: 'https://empathyledger.com/community-protocols'
};

export const initializeCulturalProtocols = async (): Promise<CulturalProtocolStatus> => {
  try {
    // Check if protocols have been accepted
    const protocolsAccepted = await getSetting('cultural_protocols_accepted');
    const onboardingComplete = await getSetting('onboarding_complete');
    const competencyLevel = await getSetting('cultural_competency_level') || 'basic';
    const lastReviewDate = await getSetting('last_protocol_review');
    
    // Initialize default protocols if first time
    if (!protocolsAccepted) {
      await initializeDefaultProtocols();
    }
    
    return {
      accepted: protocolsAccepted === 'true',
      onboardingComplete: onboardingComplete === 'true',
      lastReviewDate,
      competencyLevel
    };
  } catch (error) {
    console.error('Error initializing cultural protocols:', error);
    return {
      accepted: false,
      onboardingComplete: false,
      competencyLevel: 'basic'
    };
  }
};

const initializeDefaultProtocols = async (): Promise<void> => {
  // Save all default protocols to database
  for (const protocol of Object.values(CULTURAL_PROTOCOLS)) {
    await saveCulturalProtocol({
      id: protocol.id,
      protocol_type: protocol.protocol_type,
      description: protocol.description,
      acceptance_required: protocol.acceptance_required
    });
  }
  
  console.log('Default cultural protocols initialized');
};

export const acceptCulturalProtocols = async (competencyLevel: string = 'basic'): Promise<void> => {
  try {
    await saveSetting('cultural_protocols_accepted', 'true');
    await saveSetting('cultural_competency_level', competencyLevel);
    await saveSetting('last_protocol_review', new Date().toISOString());
    
    // Mark relevant protocols as accepted
    const protocols = await getCulturalProtocols();
    for (const protocol of protocols) {
      if (shouldAcceptProtocol(protocol.protocol_type, competencyLevel)) {
        await saveCulturalProtocol({
          ...protocol,
          accepted_at: new Date().toISOString()
        });
      }
    }
    
    console.log(`Cultural protocols accepted at ${competencyLevel} level`);
  } catch (error) {
    console.error('Error accepting cultural protocols:', error);
    throw error;
  }
};

const shouldAcceptProtocol = (protocolType: string, competencyLevel: string): boolean => {
  const levelHierarchy = ['basic', 'standard', 'enhanced', 'elder_consultation'];
  const userLevelIndex = levelHierarchy.indexOf(competencyLevel);
  const protocolLevelIndex = levelHierarchy.indexOf(protocolType);
  
  return protocolLevelIndex <= userLevelIndex;
};

export const checkCulturalProtocols = async (check: CulturalProtocolCheck): Promise<CulturalProtocolResponse> => {
  try {
    const competencyLevel = await getSetting('cultural_competency_level') || 'basic';
    const protocolLevel = determineCulturalProtocolLevel(check.storyteller_cultural_level, check.reader_context);
    
    // Check if user's competency meets requirements
    const levelHierarchy = ['basic', 'standard', 'enhanced', 'elder_consultation'];
    const userLevelIndex = levelHierarchy.indexOf(competencyLevel);
    const requiredLevelIndex = levelHierarchy.indexOf(protocolLevel);
    
    const requiresAcknowledgment = requiredLevelIndex > userLevelIndex;
    
    const protocol = CULTURAL_PROTOCOLS[protocolLevel as keyof typeof CULTURAL_PROTOCOLS];
    
    const response: CulturalProtocolResponse = {
      requires_acknowledgment: requiresAcknowledgment,
      protocol_level: protocolLevel as any,
      message: requiresAcknowledgment ? generateProtocolMessage(protocolLevel, check.reader_context) : undefined,
      guidance: protocol?.guidance,
      advisor_contact: protocolLevel === 'elder_consultation' ? ABORIGINAL_ADVISORY.contact_email : undefined
    };
    
    return response;
  } catch (error) {
    console.error('Error checking cultural protocols:', error);
    // Default to requiring acknowledgment on error
    return {
      requires_acknowledgment: true,
      protocol_level: 'standard',
      message: 'Unable to verify cultural protocols. Please proceed with respect and cultural awareness.',
      guidance: CULTURAL_PROTOCOLS.standard.guidance
    };
  }
};

const determineCulturalProtocolLevel = (storytellerLevel: string, context: string): string => {
  // Determine required protocol level based on storyteller's cultural level and context
  if (storytellerLevel === 'elder' || storytellerLevel === 'knowledge_keeper') {
    return 'elder_consultation';
  }
  
  if (storytellerLevel === 'cultural_practitioner' || storytellerLevel === 'traditional') {
    return context === 'collaboration' ? 'enhanced' : 'standard';
  }
  
  if (storytellerLevel === 'culturally_competent') {
    return 'standard';
  }
  
  return 'basic';
};

const generateProtocolMessage = (protocolLevel: string, context: string): string => {
  const messages = {
    basic: {
      mobile_reading: 'This story contains cultural content that requires respectful engagement.',
      collaboration: 'Cultural protocols apply when collaborating with this storyteller.',
      sharing: 'Please share this content respectfully and with proper attribution.'
    },
    standard: {
      mobile_reading: 'This story contains Aboriginal or Indigenous content that requires cultural competency awareness.',
      collaboration: 'Enhanced cultural protocols apply when collaborating with Aboriginal storytellers.',
      sharing: 'This content includes Indigenous knowledge - please share with appropriate cultural protocols.'
    },
    enhanced: {
      mobile_reading: 'This story contains sacred or sensitive cultural content requiring advanced cultural competency.',
      collaboration: 'Deep cultural engagement protocols apply - please ensure proper cultural guidance.',
      sharing: 'This sacred content requires permission and cultural oversight before sharing.'
    },
    elder_consultation: {
      mobile_reading: 'This content is under Elder oversight and requires consultation with Aboriginal advisors.',
      collaboration: 'Elder consultation is required before engaging with this cultural content.',
      sharing: 'This content requires Elder approval and cultural advisor oversight before sharing.'
    }
  };
  
  return messages[protocolLevel as keyof typeof messages]?.[context as keyof typeof messages['basic']] || 
         'Cultural protocols apply to this content.';
};

export const getCulturalGuidance = async (storyId: string): Promise<string[]> => {
  try {
    const competencyLevel = await getSetting('cultural_competency_level') || 'basic';
    const protocol = CULTURAL_PROTOCOLS[competencyLevel as keyof typeof CULTURAL_PROTOCOLS];
    
    return protocol?.guidance || CULTURAL_PROTOCOLS.basic.guidance;
  } catch (error) {
    console.error('Error getting cultural guidance:', error);
    return CULTURAL_PROTOCOLS.basic.guidance;
  }
};

export const reportCulturalConcern = async (concern: {
  story_id: string;
  concern_type: 'inappropriate_use' | 'cultural_insensitivity' | 'protocol_violation' | 'other';
  description: string;
  reporter_contact?: string;
}): Promise<void> => {
  try {
    // In production, this would send to Aboriginal Advisory Council
    console.log('Cultural concern reported:', {
      ...concern,
      timestamp: new Date().toISOString(),
      aboriginal_advisory_contact: ABORIGINAL_ADVISORY.contact_email
    });
    
    // Store concern for sync when online
    // This would be implemented with proper API endpoint
  } catch (error) {
    console.error('Error reporting cultural concern:', error);
    throw error;
  }
};

export const updateCulturalCompetency = async (newLevel: string): Promise<void> => {
  try {
    await saveSetting('cultural_competency_level', newLevel);
    await saveSetting('last_protocol_review', new Date().toISOString());
    
    console.log(`Cultural competency updated to ${newLevel}`);
  } catch (error) {
    console.error('Error updating cultural competency:', error);
    throw error;
  }
};

export const getAboriginalAdvisoryInfo = () => {
  return ABORIGINAL_ADVISORY;
};

export const completeOnboarding = async (): Promise<void> => {
  try {
    await saveSetting('onboarding_complete', 'true');
    await saveSetting('onboarding_completed_at', new Date().toISOString());
    
    console.log('Cultural protocols onboarding completed');
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};
