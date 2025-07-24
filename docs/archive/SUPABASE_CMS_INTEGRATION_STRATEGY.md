# Supabase CMS Integration Strategy

## Executive Summary

Based on comprehensive audit of the existing Empathy Ledger Supabase setup, this document outlines a safe integration strategy for the new CMS system that preserves existing functionality, data, and sovereignty principles.

## Current State Analysis

### Existing Architecture ✅
- **Well-established multi-tenant project-based system**
- **30+ Supabase-related files with sophisticated patterns**
- **Comprehensive sovereignty-focused schema with 20+ tables**
- **Robust RLS policies with cultural protocol validation**
- **Strong API patterns following sovereignty principles**

### Key Existing Tables 
```sql
-- Core sovereignty-based tables
projects, storytellers, stories, communities
project_members, story_permissions, consent_records
story_tags, story_themes, story_analytics

-- Supporting infrastructure
profiles, user_roles, community_permissions
cultural_protocols, story_lifecycle_events
```

### Connection Patterns ✅
- **Client-side**: `createClient()` via `@supabase/ssr`
- **Server-side**: `createServerClient()` with cookie management
- **Admin operations**: `createAdminClient()` with service role key
- **Philosophy headers**: All clients include sovereignty metadata

## Integration Challenges Identified

### 1. **Connection Pattern Conflicts** ⚠️
- CMS service uses different Supabase client pattern (`@supabase/supabase-js`)
- Existing system uses `@supabase/ssr` for Next.js integration
- Headers and configuration differ between systems

### 2. **Table Namespace Conflicts** ⚠️
- CMS tables (`cms_pages`, `cms_content_blocks`) are safe
- But lack integration with existing `projects` multi-tenancy
- Missing connection to existing permission system

### 3. **Authentication Integration** ⚠️
- CMS service doesn't integrate with existing `project_members` roles
- Missing cultural protocol validation from existing system
- No integration with sovereignty compliance scoring

## Safe Integration Strategy

### Phase 1: Fix Connection Patterns

#### 1.1 Update CMS Service to Use Existing Patterns
```typescript
// Replace cms/index.ts
import { createClient } from '../supabase'
import { createServerClient } from '../supabase-server'

export function getCMSClient() {
  const client = createClient()
  if (!client) {
    throw new Error('Supabase client not available')
  }
  return client
}

export function getCMSServerClient() {
  return createServerClient()
}
```

#### 1.2 Update CMS Service Constructor
```typescript
// cms-service.ts
export class CMSService {
  private getClient: () => SupabaseClient | null
  private getServerClient: () => Promise<SupabaseClient>

  constructor(
    getClient: () => SupabaseClient | null,
    getServerClient: () => Promise<SupabaseClient>
  ) {
    this.getClient = getClient
    this.getServerClient = getServerClient
  }

  private async getSupabase(): Promise<SupabaseClient> {
    // Try client-side first, fall back to server-side
    const client = this.getClient()
    if (client) return client
    return await this.getServerClient()
  }
}
```

### Phase 2: Integrate with Existing Multi-tenancy

#### 2.1 Add Project Integration to CMS Tables
```sql
-- Add project_id to cms_pages for multi-tenancy
ALTER TABLE cms_pages ADD COLUMN project_id UUID REFERENCES projects(id);

-- Add project context to other CMS tables
ALTER TABLE cms_content_blocks ADD COLUMN project_id UUID;
ALTER TABLE cms_media_library ADD COLUMN project_id UUID REFERENCES projects(id);
ALTER TABLE cms_navigation_menus ADD COLUMN project_id UUID REFERENCES projects(id);

-- Create indexes for performance
CREATE INDEX idx_cms_pages_project_id ON cms_pages(project_id);
CREATE INDEX idx_cms_media_project_id ON cms_media_library(project_id);
```

#### 2.2 Update RLS Policies for Project-based Access
```sql
-- CMS pages RLS (integrate with existing project_members)
CREATE POLICY "cms_pages_project_access" ON cms_pages
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
      AND role IN ('owner', 'admin', 'editor', 'contributor')
    )
  );

-- Similar policies for other CMS tables...
```

### Phase 3: Cultural Protocol Integration

#### 3.1 Integrate CMS with Existing Cultural Validation
```typescript
// Update cms-service.ts
private async validateCulturalProtocols(
  pageData: Partial<CMSPageInsert | CMSPageUpdate>,
  projectId: string
): Promise<void> {
  const supabase = await this.getSupabase()
  
  // Get project's cultural protocols
  const { data: project } = await supabase
    .from('projects')
    .select('cultural_protocols, sovereignty_settings')
    .eq('id', projectId)
    .single()

  // Apply existing cultural validation logic
  if (pageData.cultural_sensitivity === 'sacred' || 
      pageData.cultural_sensitivity === 'ceremonial') {
    
    // Check project's cultural protocol requirements
    const protocols = project?.cultural_protocols || {}
    if (protocols.requires_elder_review && !pageData.requires_elder_review) {
      throw new Error('This project requires elder review for sacred content')
    }
  }
}
```

### Phase 4: API Integration

#### 4.1 Create Project-aware CMS API Routes
```typescript
// /api/projects/[projectId]/cms/pages/route.ts
import { createServerClient } from '@/lib/supabase-server'
import { cmsService } from '@/lib/cms'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const supabase = await createServerClient()
  
  // Verify project access using existing patterns
  const { data: membership } = await supabase
    .from('project_members')
    .select('role, permissions')
    .eq('project_id', params.projectId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Use CMS service with project context
  const pages = await cmsService.getPages({
    project_id: params.projectId,
    include_author: true
  })

  return NextResponse.json({
    pages,
    sovereignty_status: {
      project_controlled: true,
      cultural_protocols_active: true
    }
  })
}
```

## Implementation Checklist

### Prerequisites ✅
- [ ] Backup existing database
- [ ] Test current functionality before changes
- [ ] Verify all environment variables are correctly set

### Phase 1: Connection Fix 🔧
- [ ] Update CMS service to use existing Supabase patterns
- [ ] Test CMS admin interface with new connection
- [ ] Verify compatibility with existing auth flows

### Phase 2: Multi-tenancy Integration 🏗️
- [ ] Add project_id columns to CMS tables
- [ ] Update RLS policies for project-based access
- [ ] Test CMS operations within project context

### Phase 3: Cultural Integration 🛡️
- [ ] Integrate CMS cultural validation with existing protocols
- [ ] Update CMS types to include project context
- [ ] Test cultural sensitivity workflows

### Phase 4: API Integration 🔌
- [ ] Create project-aware CMS API routes
- [ ] Update frontend to use project-scoped CMS calls
- [ ] Test full integration with existing project workflows

## Risk Mitigation

### Data Protection 🛡️
1. **Database Backup**: Full backup before any schema changes
2. **Gradual Rollout**: Test each phase in isolation
3. **Rollback Plan**: Keep migration scripts reversible

### Functionality Preservation 🔒
1. **Existing API Compatibility**: No changes to current story/project APIs
2. **Permission System**: CMS respects existing project_members roles
3. **Cultural Protocols**: CMS integrates with existing sovereignty validation

### Testing Strategy 🧪
1. **Unit Tests**: Test CMS service with existing Supabase patterns
2. **Integration Tests**: Verify project-based CMS access
3. **E2E Tests**: Test full user workflow from project to CMS

## Success Metrics

### Technical ✅
- [ ] CMS service connects using existing Supabase patterns
- [ ] All CMS operations respect project-based permissions
- [ ] Cultural protocols are enforced in CMS content
- [ ] No breaking changes to existing functionality

### User Experience ✅
- [ ] Seamless integration between project management and CMS
- [ ] Consistent sovereignty principles across all features
- [ ] Intuitive content management within project context
- [ ] Cultural sensitivity maintained in all content operations

## Next Steps

1. **Review this strategy** with development team
2. **Create detailed migration scripts** for each phase
3. **Set up staging environment** for safe testing
4. **Implement Phase 1** (connection fixes) first
5. **Test thoroughly** before proceeding to next phase

---

*This strategy ensures the new CMS system integrates seamlessly with Empathy Ledger's existing sovereignty-focused architecture while preserving all current functionality and data.*