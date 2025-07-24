# Empathy Ledger Platform Evolution: Implementation Roadmap

## Executive Summary

Transform Empathy Ledger from a multi-project system to a true multi-tenant platform with modular architecture, while maintaining sovereignty principles and existing functionality.

## Week 1: Foundation & God Mode (Priority: Critical)

### Day 1-2: Database Schema Evolution

```sql
-- 1. Add platform admin capabilities
ALTER TABLE profiles ADD COLUMN platform_role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN is_platform_team BOOLEAN DEFAULT FALSE;

-- 2. Create platform audit log
CREATE TABLE platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enhance projects table for tenant features
ALTER TABLE projects
ADD COLUMN subscription_tier TEXT DEFAULT 'community',
ADD COLUMN subscription_status TEXT DEFAULT 'active',
ADD COLUMN modules_enabled JSONB DEFAULT '{"story_core": true}',
ADD COLUMN limits JSONB DEFAULT '{"max_users": 10, "max_stories_per_month": 100}',
ADD COLUMN white_label_config JSONB DEFAULT '{}';

-- 4. Create platform modules table
CREATE TABLE platform_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    config_schema JSONB,
    default_config JSONB,
    requires_modules TEXT[],
    minimum_tier TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create project modules junction
CREATE TABLE project_modules (
    project_id UUID REFERENCES projects(id),
    module_key TEXT REFERENCES platform_modules(key),
    enabled BOOLEAN DEFAULT FALSE,
    configuration JSONB,
    first_activated TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    PRIMARY KEY (project_id, module_key)
);
```

### Day 3-4: Platform Admin Dashboard

**File:** `app/admin/platform/page.tsx`

```typescript
// Core admin dashboard with god mode controls
export default function PlatformAdminDashboard() {
  // Check platform_role = 'super_admin'
  // Display:
  // - Total projects/tenants
  // - System health metrics
  // - Active stories across platform
  // - Revenue distribution stats
  // - Quick actions (provision, suspend, impersonate)
}
```

**File:** `app/admin/platform/projects/page.tsx`

```typescript
// Project management interface
// List all projects with health indicators
// Actions: view details, impersonate, suspend, upgrade tier
```

### Day 5: RLS Policies for Platform Admins

```sql
-- Create policies for platform admins
CREATE POLICY "Platform admins can view all projects"
ON projects FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.platform_role IN ('super_admin', 'platform_manager')
    )
);

-- Add impersonation capabilities
CREATE FUNCTION impersonate_project_user(
    target_project_id UUID,
    target_user_id UUID
) RETURNS JSONB
SECURITY DEFINER
AS $$
BEGIN
    -- Verify caller is platform admin
    -- Generate temporary token
    -- Log action in platform_audit_log
    -- Return access credentials
END;
$$ LANGUAGE plpgsql;
```

## Week 2: Module System (Priority: High)

### Day 6-7: Extract Core Modules

**Task:** Convert existing features into modules

```typescript
// lib/modules/story-core.ts
export const StoryCoreModule: Module = {
  key: 'story_core',
  name: 'Story Collection',
  category: 'core',
  defaultConfig: {
    submission_methods: ['web', 'sms', 'whatsapp'],
    consent_flow: 'standard',
    auto_transcribe: true,
  },

  async onEnable(projectId: string, config: any) {
    // Module initialization logic
  },

  components: {
    settings: StoryCoreSettings,
    dashboard: StoryCoreDashboard,
    menu: [
      { label: 'Submit Story', href: '/stories/new' },
      { label: 'My Stories', href: '/stories' },
    ],
  },
};
```

### Day 8-9: Module Registry & Management

**File:** `lib/modules/registry.ts`

```typescript
class ModuleRegistry {
  private modules = new Map<string, Module>();

  // Register all modules
  constructor() {
    this.register(StoryCoreModule);
    this.register(ConsentPrivacyModule);
    this.register(CommunityAnalyticsModule);
    // ... more modules
  }

  async getProjectModules(projectId: string) {
    // Fetch enabled modules for project
    // Return configured module instances
  }

  async enableModule(projectId: string, moduleKey: string, config?: any) {
    // Enable module for project
    // Run module.onEnable()
    // Update database
  }
}

export const moduleRegistry = new ModuleRegistry();
```

### Day 10: Module UI Components

**File:** `app/[projectSlug]/settings/modules/page.tsx`

```typescript
// Module management interface for project admins
export default function ModulesSettings() {
  // List available modules
  // Show enabled/disabled state
  // Configuration UI for each module
  // Enable/disable actions
}
```

## Week 3: White-Label & Onboarding (Priority: High)

### Day 11-12: Dynamic Theming System

**File:** `lib/themes/theme-provider.tsx`

```typescript
export function ThemeProvider({ children, project }) {
  const theme = useMemo(() => ({
    colors: {
      primary: project.branding?.primary_color || '#667eea',
      secondary: project.branding?.secondary_color || '#764ba2',
      // ... more theme values
    },
    fonts: {
      heading: project.branding?.heading_font || 'Inter',
      body: project.branding?.body_font || 'Inter'
    }
  }), [project]);

  return (
    <ThemeContext.Provider value={theme}>
      <style jsx global>{`
        :root {
          --primary: ${theme.colors.primary};
          --secondary: ${theme.colors.secondary};
          /* ... CSS variables */
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Day 13-14: Onboarding Flow

**File:** `app/onboarding/page.tsx`

```typescript
// Guided onboarding for new projects
export default function OnboardingFlow() {
  const steps = [
    { id: 'welcome', component: WelcomeStep },
    { id: 'branding', component: BrandingStep },
    { id: 'philosophy', component: PhilosophyStep },
    { id: 'modules', component: ModulesStep },
    { id: 'team', component: TeamStep },
    { id: 'first-story', component: FirstStoryStep },
  ];

  // Track progress
  // Save configurations
  // Celebrate milestones
}
```

### Day 15: Onboarding Templates

```sql
-- Insert onboarding templates
INSERT INTO onboarding_templates (name, organization_type, default_modules, steps) VALUES
('Indigenous Organization', 'indigenous_org',
  ARRAY['story_core', 'cultural_protocols', 'consent_privacy'],
  '[
    {"id": "welcome", "title": "Welcome to Your Sovereignty Journey"},
    {"id": "cultural_setup", "title": "Configure Cultural Protocols"},
    {"id": "elder_roles", "title": "Assign Elder Reviewers"}
  ]'::jsonb
),
('Youth Service', 'youth_service',
  ARRAY['story_core', 'youth_tracker', 'service_finder'],
  '[
    {"id": "welcome", "title": "Empowering Youth Voices"},
    {"id": "safety", "title": "Set Up Safety Protocols"},
    {"id": "programs", "title": "Configure Your Programs"}
  ]'::jsonb
);
```

## Week 4: Advanced Features (Priority: Medium)

### Day 16-17: Automated Reporting Module

**File:** `lib/modules/report-automation.ts`

```typescript
export const ReportAutomationModule: Module = {
  key: 'report_automation',
  name: 'Automated Reports',
  category: 'analytics',
  minimumTier: 'organization',

  defaultConfig: {
    templates: ['quarterly', 'annual'],
    auto_include_stories: true,
    stakeholder_access: false,
  },

  async generateReport(projectId: string, template: string) {
    // Gather data
    // Apply template
    // Generate PDF/DOCX
    // Send to stakeholders
  },
};
```

### Day 18-19: Platform Monitoring

**File:** `lib/monitoring/health-checks.ts`

```typescript
// Automated health monitoring
export async function checkProjectHealth(projectId: string) {
  const metrics = await getProjectMetrics(projectId);

  return {
    status: determineHealthStatus(metrics),
    alerts: generateAlerts(metrics),
    recommendations: generateRecommendations(metrics),
  };
}

// Run periodically via cron
export async function platformHealthCheck() {
  const projects = await getAllProjects();

  for (const project of projects) {
    const health = await checkProjectHealth(project.id);

    if (health.status === 'critical') {
      await notifyPlatformAdmins(project, health);
    }
  }
}
```

### Day 20: Performance Optimization

```sql
-- Create materialized views for performance
CREATE MATERIALIZED VIEW project_metrics AS
SELECT
    p.id as project_id,
    p.name,
    p.subscription_tier,
    COUNT(DISTINCT s.id) as total_stories,
    COUNT(DISTINCT s.id) FILTER (WHERE s.created_at > NOW() - INTERVAL '30 days') as recent_stories,
    COUNT(DISTINCT pm.user_id) as total_users,
    COUNT(DISTINCT pm.user_id) FILTER (WHERE u.last_seen > NOW() - INTERVAL '7 days') as active_users
FROM projects p
LEFT JOIN stories s ON s.project_id = p.id
LEFT JOIN project_members pm ON pm.project_id = p.id
LEFT JOIN profiles u ON u.id = pm.user_id
GROUP BY p.id;

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_project_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY project_metrics;
END;
$$ LANGUAGE plpgsql;
```

## Immediate Next Steps (This Week)

### 1. Set Up Development Environment

```bash
# Create feature branch
git checkout -b feature/platform-admin-system

# Install any additional dependencies
npm install @radix-ui/react-tabs  # For module UI
npm install react-hook-form       # For onboarding forms
```

### 2. Create Initial Migration

```bash
# Generate migration for platform features
supabase migration new add_platform_admin_features

# Add the SQL from Day 1-2 above
# Run migration
supabase db push
```

### 3. Build Minimal Admin Dashboard

- Create `/app/admin/platform` route
- Add authentication check for platform_role
- Display basic metrics
- Add project list with impersonate action

### 4. Test with Existing Projects

- Mark yourself as super_admin in database
- Access platform dashboard
- View existing projects as tenants
- Test impersonation functionality

## Success Metrics

### Week 1 Success

- [ ] Platform admin can log in and see all projects
- [ ] Platform audit log captures admin actions
- [ ] Basic project health metrics visible
- [ ] Can impersonate project admin

### Week 2 Success

- [ ] At least 3 core modules extracted
- [ ] Module enable/disable working
- [ ] Module configuration UI functional
- [ ] Existing features work through modules

### Week 3 Success

- [ ] Projects can customize branding
- [ ] Onboarding flow guides new projects
- [ ] First project completes onboarding
- [ ] White-label theme applied correctly

### Week 4 Success

- [ ] Report module generates first report
- [ ] Health monitoring alerts working
- [ ] Performance optimizations in place
- [ ] Platform ready for scale

## Risk Mitigation

### Data Migration

- Keep existing schema intact
- Add new tables/columns only
- Test thoroughly with existing data
- Have rollback plan ready

### User Impact

- Changes transparent to existing users
- No disruption to current projects
- Gradual rollout of new features
- Clear communication about benefits

### Technical Debt

- Document all architectural decisions
- Write tests for critical paths
- Keep modules loosely coupled
- Plan for future refactoring

This roadmap provides a concrete path to evolve Empathy Ledger into a scalable multi-tenant platform while maintaining its core values and existing functionality. Each week builds on the previous, creating a sustainable transformation.
