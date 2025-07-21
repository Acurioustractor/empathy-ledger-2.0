# Refined Onboarding Flow Design

## Overview

Building on the existing community-centered onboarding foundation, this refined flow creates distinct paths for platform admins, project creators, and community members while maintaining sovereignty principles throughout.

## Three Onboarding Journeys

### 1. Platform Onboarding (New Organizations)

**Entry Points:**

- Direct outreach from Empathy Ledger team
- Application via website
- Referral from existing project

**Flow:**

```typescript
interface PlatformOnboarding {
  discovery: {
    source: 'direct' | 'application' | 'referral';
    organizationType: string;
    primaryUseCase: string;
  };

  consultation: {
    introCall: boolean;
    needsAssessment: string[];
    culturalConsiderations: string[];
    technicalRequirements: string[];
  };

  provisioning: {
    projectName: string;
    projectSlug: string;
    initialModules: Module[];
    subscriptionTier: 'community' | 'organization' | 'enterprise';
  };

  setupGuidance: {
    assignedOnboardingSpecialist?: string;
    scheduledTrainingSessions: Date[];
    resourceAccess: Resource[];
  };
}
```

**Implementation:**

```tsx
// app/apply/page.tsx
export default function ApplyForPlatform() {
  return (
    <OnboardingWizard
      steps={[
        {
          id: 'organization-info',
          title: 'Tell Us About Your Organization',
          component: OrganizationInfoStep,
          fields: ['name', 'type', 'size', 'location', 'website'],
        },
        {
          id: 'use-case',
          title: 'How Will You Use Empathy Ledger?',
          component: UseCaseStep,
          fields: ['primary_purpose', 'story_types', 'community_size'],
        },
        {
          id: 'values-alignment',
          title: 'Platform Values',
          component: ValuesAlignmentStep,
          description: 'Ensuring alignment with sovereignty principles',
        },
        {
          id: 'technical-needs',
          title: 'Technical Requirements',
          component: TechnicalNeedsStep,
          fields: ['custom_domain', 'integrations', 'data_residency'],
        },
      ]}
    />
  );
}
```

### 2. Project Creator Onboarding (Project Admins)

**Enhanced Current Flow:**

```tsx
// app/projects/new/onboarding/page.tsx
export default function ProjectCreatorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectOnboardingData>({});

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Empathy Ledger Project',
      component: WelcomeStep,
      description: "Let's set up your ethical storytelling infrastructure",
      skippable: false,
    },
    {
      id: 'project-identity',
      title: 'Project Identity',
      component: ProjectIdentityStep,
      tasks: [
        'Choose project name',
        'Set custom URL slug',
        'Upload logo',
        'Write project description',
      ],
    },
    {
      id: 'branding',
      title: 'Customize Your Look',
      component: BrandingStep,
      tasks: [
        'Select primary colors',
        'Choose fonts',
        'Preview branded experience',
      ],
    },
    {
      id: 'philosophy',
      title: 'Define Your Approach',
      component: PhilosophyStep,
      tasks: [
        'Set story collection goals',
        'Define community values',
        'Configure consent approach',
        'Set cultural protocols',
      ],
    },
    {
      id: 'modules',
      title: 'Choose Your Features',
      component: ModuleSelectionStep,
      tasks: [
        'Review recommended modules',
        'Enable desired features',
        'Configure module settings',
      ],
    },
    {
      id: 'team',
      title: 'Build Your Team',
      component: TeamInvitationStep,
      tasks: [
        'Invite administrators',
        'Add storytellers',
        'Set up cultural reviewers',
        'Configure permissions',
      ],
    },
    {
      id: 'first-story',
      title: 'Collect Your First Story',
      component: FirstStoryStep,
      tasks: [
        'Create example story',
        'Test submission flow',
        'Review consent process',
      ],
      celebration: true,
    },
  ];

  return (
    <OnboardingLayout>
      <OnboardingProgress
        steps={steps}
        currentStep={currentStep}
        completedSteps={projectData.completedSteps || []}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {React.createElement(steps[currentStep].component, {
            projectData,
            onUpdate: setProjectData,
            onNext: () => setCurrentStep(currentStep + 1),
            onBack: () => setCurrentStep(currentStep - 1),
          })}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
```

### 3. Community Member Onboarding (Enhanced Current Flow)

**Improvements to Existing Flow:**

```tsx
// components/CommunityProfileSetup.tsx (enhanced)
export function CommunityProfileSetup({
  onComplete,
  projectContext,
}: CommunityProfileSetupProps) {
  const steps = [
    {
      id: 'welcome',
      title: projectContext
        ? `Welcome to ${projectContext.name}`
        : 'Welcome to Empathy Ledger',
      component: WelcomeStep,
      description: "Your stories matter. Let's get you set up safely.",
    },
    {
      id: 'identity',
      title: 'Your Identity',
      component: IdentityStep,
      // Existing fields plus:
      fields: [
        'display_name',
        'pronouns',
        'community_affiliation',
        'traditional_name', // New: optional
        'bio',
      ],
    },
    {
      id: 'cultural-context',
      title: 'Cultural Context',
      component: CulturalContextStep,
      fields: [
        'languages',
        'cultural_background', // New
        'connection_to_country', // New for Indigenous users
      ],
    },
    {
      id: 'protocols',
      title: 'Respecting Protocols',
      component: ProtocolsStep,
      // Enhanced with educational content
      educational: true,
      content: [
        'Understanding cultural protocols',
        'Why we ask these questions',
        'How your preferences are protected',
      ],
    },
    {
      id: 'platform-tour', // New step
      title: 'How Empathy Ledger Works',
      component: PlatformTourStep,
      interactive: true,
      topics: [
        'Story sovereignty explained',
        'How consent works',
        'Your rights and control',
        'Community benefits',
      ],
    },
    {
      id: 'project-specific', // New conditional step
      title: `About ${projectContext?.name}`,
      component: ProjectSpecificStep,
      condition: () => !!projectContext,
      content: [
        'Project mission and values',
        'How stories are used',
        'Your role in the community',
      ],
    },
  ];

  return (
    <OnboardingContainer>
      {/* Progress indicator */}
      <StepProgress
        steps={steps}
        currentStep={currentStep}
        isInteractive={true}
      />

      {/* Cultural acknowledgment banner */}
      {projectContext?.sovereignty_framework?.acknowledgment && (
        <AcknowledgmentBanner>
          {projectContext.sovereignty_framework.acknowledgment}
        </AcknowledgmentBanner>
      )}

      {/* Step content with animations */}
      <StepContent>
        {/* ... existing implementation enhanced ... */}
      </StepContent>

      {/* Completion celebration */}
      {isComplete && (
        <CompletionCelebration
          userName={formData.display_name}
          nextAction="Tell Your First Story"
          onNext={() => router.push('/stories/new')}
        />
      )}
    </OnboardingContainer>
  );
}
```

## Key Enhancements

### 1. Progress Tracking & Persistence

```sql
-- Enhanced onboarding tracking
CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    project_id UUID REFERENCES projects(id),
    onboarding_type TEXT, -- 'platform', 'project_creator', 'member'

    -- Progress tracking
    current_step TEXT,
    completed_steps TEXT[],
    step_data JSONB DEFAULT '{}',

    -- Milestones
    milestones JSONB DEFAULT '{
        "profile_completed": false,
        "first_story_submitted": false,
        "cultural_training_completed": false,
        "team_invited": false,
        "project_launched": false
    }',

    -- Analytics
    time_per_step JSONB DEFAULT '{}',
    abandoned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Contextual Help System

```tsx
// components/OnboardingHelp.tsx
export function OnboardingHelp({ currentStep, userRole }) {
  const [showHelper, setShowHelper] = useState(false);

  const helpContent = {
    'project-identity': {
      title: 'Creating Your Project Identity',
      tips: [
        'Choose a name that reflects your community',
        'Your URL will be: yourname.empathyledger.org',
        'You can add a custom domain later',
      ],
      resources: [
        { label: 'Naming Best Practices', url: '/docs/naming' },
        { label: 'Example Projects', url: '/showcase' },
      ],
    },
    // ... more help content
  };

  return (
    <HelpWidget>
      <HelpButton onClick={() => setShowHelper(!showHelper)}>
        Need help?
      </HelpButton>

      {showHelper && (
        <HelpPanel>
          <h3>{helpContent[currentStep]?.title}</h3>
          <Tips items={helpContent[currentStep]?.tips} />
          <Resources links={helpContent[currentStep]?.resources} />
          <LiveChat available={userRole === 'project_creator'} />
        </HelpPanel>
      )}
    </HelpWidget>
  );
}
```

### 3. Cultural Training Integration

```tsx
// components/CulturalTraining.tsx
export function CulturalTrainingModule({
  projectId,
  trainingType,
  onComplete,
}) {
  const modules = [
    {
      id: 'sovereignty',
      title: 'Understanding Story Sovereignty',
      duration: '10 min',
      content: InteractiveSovereigntyLesson,
      quiz: SovereigntyQuiz,
    },
    {
      id: 'protocols',
      title: 'Respecting Cultural Protocols',
      duration: '15 min',
      content: ProtocolsLesson,
      activities: ['scenario-based learning', 'protocol matching'],
    },
    {
      id: 'consent',
      title: 'Consent in Practice',
      duration: '10 min',
      content: ConsentPractice,
      certification: true,
    },
  ];

  return (
    <TrainingContainer>
      <ModuleList modules={modules} />
      <ProgressTracker />
      <CertificationBadge onEarn={onComplete} />
    </TrainingContainer>
  );
}
```

### 4. Celebration & Gamification

```tsx
// components/OnboardingCelebrations.tsx
export function MilestoneCelebration({ milestone, userName }) {
  const celebrations = {
    profile_completed: {
      title: `Welcome to the community, ${userName}!`,
      animation: 'confetti',
      message: 'Your voice is now part of something bigger.',
      reward: 'Community Member Badge',
    },
    first_story_submitted: {
      title: 'Your First Story is Sacred',
      animation: 'stars',
      message: 'Thank you for trusting us with your story.',
      reward: 'Storyteller Badge',
    },
    project_launched: {
      title: 'Your Project is Live!',
      animation: 'fireworks',
      message: 'Ready to amplify community voices.',
      reward: 'Project Creator Badge',
      shareOptions: ['twitter', 'linkedin', 'email'],
    },
  };

  const celebration = celebrations[milestone];

  return (
    <CelebrationModal>
      <Animation type={celebration.animation} />
      <Title>{celebration.title}</Title>
      <Message>{celebration.message}</Message>
      {celebration.reward && <Badge type={celebration.reward} />}
      {celebration.shareOptions && (
        <ShareButtons options={celebration.shareOptions} />
      )}
    </CelebrationModal>
  );
}
```

### 5. Smart Defaults & Templates

```typescript
// lib/onboarding/templates.ts
export const projectTemplates = {
  indigenous_org: {
    name: 'Indigenous Community Organization',
    defaultModules: ['story_core', 'cultural_protocols', 'cultural_knowledge'],
    brandingSuggestions: {
      fonts: ['Roboto', 'Open Sans'],
      colorSchemes: ['earth_tones', 'ocean_palette'],
    },
    philosophyPrompts: [
      'How do stories connect to Country in your community?',
      'What protocols guide knowledge sharing?',
      'How can technology respect cultural boundaries?',
    ],
  },
  youth_service: {
    name: 'Youth Service Organization',
    defaultModules: ['story_core', 'youth_tracker', 'service_finder'],
    brandingSuggestions: {
      fonts: ['Poppins', 'Inter'],
      colorSchemes: ['vibrant', 'approachable'],
    },
    philosophyPrompts: [
      'How do you create safe spaces for youth voices?',
      'What does empowerment mean in your context?',
      'How do you measure positive outcomes?',
    ],
  },
  // ... more templates
};
```

## Implementation Priority

### Phase 1: Complete Existing Gaps (Week 1)

1. Implement sign-in page
2. Complete invitation acceptance flow
3. Add onboarding progress tracking
4. Create completion celebrations

### Phase 2: Enhance Project Creator Path (Week 2)

1. Build project onboarding wizard
2. Add contextual help system
3. Implement module selection UI
4. Create first story celebration

### Phase 3: Add Educational Content (Week 3)

1. Develop cultural training modules
2. Create interactive platform tour
3. Add help videos/resources
4. Build certification system

### Phase 4: Polish & Optimize (Week 4)

1. Add animations and transitions
2. Implement smart defaults
3. Create abandonment recovery
4. A/B test onboarding flows

## Success Metrics

### Completion Rates

- **Target**: 80% complete profile setup
- **Target**: 60% submit first story within 7 days
- **Target**: 90% of project creators launch project

### Time to Value

- **Member**: < 10 minutes to complete profile
- **Creator**: < 30 minutes to launch project
- **First Story**: < 24 hours after profile completion

### Satisfaction

- **NPS**: > 8 for onboarding experience
- **Support Tickets**: < 5% need help during onboarding
- **Return Rate**: > 70% return within first week

## Key Principles Maintained

1. **Sovereignty First**: Every step reinforces data ownership
2. **Cultural Safety**: Protocols respected throughout
3. **Progressive Disclosure**: Complexity introduced gradually
4. **Celebration of Voice**: Milestones acknowledge trust
5. **Community Connection**: Never just "users" but community members

This refined onboarding flow builds on the strong foundation already in place while addressing gaps and adding features that will help scale the platform while maintaining its core values.
