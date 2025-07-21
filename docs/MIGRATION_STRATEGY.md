# Migration Strategy: Projects → Enhanced Multi-Tenant Platform

## Overview

This document outlines the safe migration path from the current project-based system to the enhanced multi-tenant platform architecture, ensuring zero downtime and no data loss.

## Current State Analysis

### What We Have (Projects)

- ✅ Multi-tenant structure via projects
- ✅ Role-based access control
- ✅ Story management with consent
- ✅ Cross-project collaboration
- ✅ Subscription tiers

### What We're Adding

- 🔄 Platform-level admin roles
- 🔄 Modular feature system
- 🔄 Enhanced white-labeling
- 🔄 Automated onboarding
- 🔄 Platform monitoring

## Migration Principles

1. **No Breaking Changes**: Existing functionality continues working
2. **Incremental Updates**: Small, reversible changes
3. **Data Integrity**: No data loss or corruption
4. **User Transparency**: Minimal visible changes for end users
5. **Progressive Enhancement**: New features opt-in

## Phase 1: Database Extension (Week 1)

### Step 1.1: Add Platform Tables

```sql
-- These are NEW tables, no changes to existing ones
BEGIN;

-- Platform admin features
CREATE TABLE IF NOT EXISTS platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module registry
CREATE TABLE IF NOT EXISTS platform_modules (
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

-- Project-module relationship
CREATE TABLE IF NOT EXISTS project_modules (
    project_id UUID REFERENCES projects(id),
    module_key TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    configuration JSONB,
    first_activated TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    PRIMARY KEY (project_id, module_key),
    FOREIGN KEY (module_key) REFERENCES platform_modules(key)
);

COMMIT;
```

### Step 1.2: Extend Existing Tables Safely

```sql
-- Add columns with defaults that maintain current behavior
BEGIN;

-- Add platform role to profiles (defaults to regular user)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS platform_role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_platform_team BOOLEAN DEFAULT FALSE;

-- Add module configuration to projects (defaults to current features)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS modules_enabled JSONB DEFAULT '{
    "story_core": true,
    "consent_privacy": true,
    "user_management": true,
    "community_analytics": true,
    "cultural_protocols": true
}',
ADD COLUMN IF NOT EXISTS white_label_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS platform_metadata JSONB DEFAULT '{}';

COMMIT;
```

### Step 1.3: Populate Module Registry

```sql
-- Insert core modules that map to existing features
BEGIN;

INSERT INTO platform_modules (key, name, category, is_active, default_config) VALUES
('story_core', 'Story Collection', 'core', true, '{
    "submission_methods": ["web", "sms", "whatsapp", "voice", "video"],
    "consent_flow": "standard"
}'),
('consent_privacy', 'Consent & Privacy', 'core', true, '{
    "consent_granularity": "detailed",
    "default_privacy": "community"
}'),
('user_management', 'User Management', 'core', true, '{
    "roles": ["owner", "admin", "editor", "storyteller", "viewer"],
    "require_cultural_training": true
}'),
('community_analytics', 'Community Analytics', 'analytics', true, '{
    "analysis_types": ["themes", "sentiment", "patterns"],
    "community_centered_metrics": true
}'),
('cultural_protocols', 'Cultural Protocols', 'storytelling', true, '{
    "require_elder_review": false,
    "seasonal_restrictions": false
}');

-- Link existing projects to their current modules
INSERT INTO project_modules (project_id, module_key, enabled, configuration)
SELECT
    p.id,
    m.key,
    true,
    m.default_config
FROM projects p
CROSS JOIN platform_modules m
WHERE m.category = 'core'
ON CONFLICT DO NOTHING;

COMMIT;
```

## Phase 2: Code Migration (Week 1-2)

### Step 2.1: Add Platform Admin Routes

```typescript
// app/admin/platform/layout.tsx
export default function PlatformAdminLayout({ children }) {
  // Check platform_role without breaking existing auth
  const { data: profile } = useProfile();

  if (profile?.platform_role !== 'super_admin') {
    // Redirect to regular admin, not error
    return redirect('/admin');
  }

  return <>{children}</>;
}
```

### Step 2.2: Create Module Compatibility Layer

```typescript
// lib/modules/compatibility.ts
// Ensures existing features work with or without module system

export function getProjectFeatures(project: Project) {
  // If modules_enabled exists, use it
  if (project.modules_enabled) {
    return project.modules_enabled;
  }

  // Otherwise, return current feature flags
  return {
    story_core: project.story_submission_enabled ?? true,
    consent_privacy: true,
    user_management: true,
    community_analytics: project.community_insights_enabled ?? true,
    cultural_protocols: !!project.sovereignty_framework?.cultural_protocols,
  };
}

// Use throughout codebase instead of direct property access
const features = getProjectFeatures(project);
if (features.story_core) {
  // Show story submission UI
}
```

### Step 2.3: Gradual Component Migration

```typescript
// Before: Direct feature check
if (project.story_submission_enabled) {
  return <StorySubmissionForm />;
}

// After: Module-aware check
const modules = useProjectModules(project.id);
if (modules.isEnabled('story_core')) {
  return <StorySubmissionForm config={modules.getConfig('story_core')} />;
}

// Compatibility hook
export function useProjectModules(projectId: string) {
  const { data: modules } = useQuery({
    queryKey: ['project-modules', projectId],
    queryFn: async () => {
      // Try new module system first
      const response = await supabase
        .from('project_modules')
        .select('*')
        .eq('project_id', projectId);

      if (response.data?.length > 0) {
        return response.data;
      }

      // Fall back to legacy feature flags
      return getLegacyModules(projectId);
    }
  });

  return {
    isEnabled: (key: string) => modules?.find(m => m.module_key === key)?.enabled ?? false,
    getConfig: (key: string) => modules?.find(m => m.module_key === key)?.configuration ?? {}
  };
}
```

## Phase 3: Data Migration (Week 2)

### Step 3.1: Migrate Project Settings to Modules

```sql
-- Run after code is deployed and tested
BEGIN;

-- Migrate story submission settings
UPDATE project_modules pm
SET configuration = jsonb_build_object(
    'submission_methods',
    CASE
        WHEN p.submission_channels ? 'whatsapp' THEN '["web", "whatsapp", "sms"]'::jsonb
        ELSE '["web"]'::jsonb
    END,
    'consent_flow', p.sovereignty_framework->>'consent_type'
)
FROM projects p
WHERE pm.project_id = p.id
AND pm.module_key = 'story_core';

-- Migrate analytics settings
UPDATE project_modules pm
SET
    enabled = COALESCE(p.community_insights_enabled, true),
    configuration = jsonb_build_object(
        'cross_project_insights', p.cross_project_collaboration,
        'analysis_types', '["themes", "sentiment", "patterns"]'::jsonb
    )
FROM projects p
WHERE pm.project_id = p.id
AND pm.module_key = 'community_analytics';

COMMIT;
```

### Step 3.2: Create Migration Status Tracking

```sql
CREATE TABLE migration_status (
    project_id UUID PRIMARY KEY REFERENCES projects(id),
    migrated_to_modules BOOLEAN DEFAULT FALSE,
    migrated_to_white_label BOOLEAN DEFAULT FALSE,
    migration_notes JSONB DEFAULT '{}',
    migrated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track migration progress
INSERT INTO migration_status (project_id)
SELECT id FROM projects
ON CONFLICT DO NOTHING;
```

## Phase 4: Feature Rollout (Week 3)

### Step 4.1: Enable Platform Features for Specific Projects

```typescript
// lib/feature-flags.ts
export const platformFeatures = {
  // Start with internal testing
  MODULE_SYSTEM: process.env.ENABLE_MODULE_SYSTEM === 'true',
  WHITE_LABEL: process.env.ENABLE_WHITE_LABEL === 'true',
  PLATFORM_ADMIN: process.env.ENABLE_PLATFORM_ADMIN === 'true',

  // Per-project feature flags
  isModuleSystemEnabled: (projectId: string) => {
    const enabledProjects =
      process.env.MODULE_SYSTEM_PROJECTS?.split(',') || [];
    return (
      enabledProjects.includes(projectId) || platformFeatures.MODULE_SYSTEM
    );
  },
};
```

### Step 4.2: Gradual UI Migration

```typescript
// components/project-settings.tsx
export function ProjectSettings({ project }) {
  const hasModuleSystem = platformFeatures.isModuleSystemEnabled(project.id);

  if (hasModuleSystem) {
    return <ModularProjectSettings project={project} />;
  }

  // Keep showing legacy settings UI
  return <LegacyProjectSettings project={project} />;
}
```

## Phase 5: Cleanup (Week 4)

### Step 5.1: Remove Legacy Code

```typescript
// After all projects migrated
// 1. Remove legacy feature flag checks
// 2. Remove compatibility layers
// 3. Update documentation
```

### Step 5.2: Optimize Database

```sql
-- After migration complete
-- 1. Drop deprecated columns (keep for 6 months as backup)
-- 2. Add performance indexes
CREATE INDEX idx_project_modules_lookup ON project_modules(project_id, module_key, enabled);
CREATE INDEX idx_platform_audit_log_actor ON platform_audit_log(actor_id, created_at DESC);
```

## Rollback Plan

### Database Rollback

```sql
-- Keep for emergency rollback
BEGIN;

-- Remove new tables (data preserved in backups)
DROP TABLE IF EXISTS project_modules CASCADE;
DROP TABLE IF EXISTS platform_modules CASCADE;
DROP TABLE IF EXISTS platform_audit_log CASCADE;

-- Remove new columns
ALTER TABLE profiles
DROP COLUMN IF EXISTS platform_role,
DROP COLUMN IF EXISTS is_platform_team;

ALTER TABLE projects
DROP COLUMN IF EXISTS modules_enabled,
DROP COLUMN IF EXISTS white_label_config,
DROP COLUMN IF EXISTS platform_metadata;

COMMIT;
```

### Code Rollback

- Git revert to previous release
- Redeploy previous Docker images
- Restore environment variables

## Testing Strategy

### 1. Development Environment

- Full migration on dev database
- Test all existing features
- Test new platform features
- Performance benchmarks

### 2. Staging Environment

- Migration with production-like data
- Load testing
- User acceptance testing
- Rollback testing

### 3. Production Rollout

- Read-only mode during migration
- Incremental rollout by project
- Monitor error rates
- Quick rollback capability

## Success Metrics

### Technical Metrics

- [ ] Zero data loss
- [ ] < 5 minute migration time
- [ ] No increase in error rate
- [ ] Performance maintained or improved

### Business Metrics

- [ ] Existing projects unaffected
- [ ] New projects onboard faster
- [ ] Platform admins have needed tools
- [ ] Module adoption begins

## Migration Checklist

### Pre-Migration

- [ ] Full database backup
- [ ] Code deployment tested
- [ ] Rollback plan verified
- [ ] Team briefed
- [ ] Users notified (if needed)

### During Migration

- [ ] Enable read-only mode
- [ ] Run migration scripts
- [ ] Verify data integrity
- [ ] Test critical paths
- [ ] Monitor error logs

### Post-Migration

- [ ] Disable read-only mode
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Document issues
- [ ] Plan next phase

This migration strategy ensures a smooth transition from the current project-based system to the enhanced multi-tenant platform while maintaining data integrity and user experience.
