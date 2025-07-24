# Projects & Organizations Architecture Design

## 🎯 FOUNDATIONAL ARCHITECTURE PLAN

You're absolutely right! Before CMS integration, we need to establish the core **Projects** and **Organizations** structure. This will be the foundation for everything else.

## 📊 PROPOSED SCHEMA DESIGN

### 1. Organizations Table (New)
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Organization Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
  description TEXT,
  website_url VARCHAR(500),
  
  -- Contact Information
  primary_contact_email VARCHAR(255) NOT NULL,
  primary_contact_name VARCHAR(255),
  phone VARCHAR(50),
  
  -- Address/Location
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Organization Type & Status
  organization_type VARCHAR(50) DEFAULT 'nonprofit', -- nonprofit, government, community, corporate, academic
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  
  -- Sovereignty & Cultural Context
  cultural_context TEXT[], -- Cultural affiliations/protocols
  sovereignty_status VARCHAR(50), -- indigenous_controlled, community_led, etc.
  cultural_protocols JSONB DEFAULT '{}',
  
  -- Platform Settings
  subscription_tier VARCHAR(20) DEFAULT 'community', -- community, pro, enterprise
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  
  -- Branding & Customization
  logo_url VARCHAR(500),
  brand_colors JSONB DEFAULT '{}', -- primary, secondary, accent colors
  custom_domain VARCHAR(255),
  
  -- Platform Features
  enabled_modules TEXT[] DEFAULT ARRAY['storytelling'], -- storytelling, analytics, cms, etc.
  feature_flags JSONB DEFAULT '{}',
  
  -- Compliance & Sovereignty
  sovereignty_compliance_score INTEGER DEFAULT 85, -- 0-100
  data_retention_policy JSONB DEFAULT '{}',
  consent_framework JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_type ON organizations(organization_type);
```

### 2. Projects Table (New - Core Multi-tenant Entity)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization Relationship
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Basic Project Info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL, -- Unique within organization
  description TEXT,
  mission_statement TEXT,
  
  -- Project Configuration
  project_type VARCHAR(50) DEFAULT 'storytelling', -- storytelling, research, advocacy, etc.
  status VARCHAR(20) DEFAULT 'setup', -- setup, active, paused, completed, archived
  visibility VARCHAR(20) DEFAULT 'public', -- public, community, private
  
  -- Storytelling Configuration
  story_collection_methods TEXT[] DEFAULT ARRAY['web'], -- web, sms, whatsapp, phone, email
  story_approval_required BOOLEAN DEFAULT TRUE,
  story_moderation_enabled BOOLEAN DEFAULT TRUE,
  
  -- Cultural & Sovereignty Settings
  cultural_sensitivity VARCHAR(20) DEFAULT 'general', -- general, restricted, ceremonial, sacred
  requires_elder_review BOOLEAN DEFAULT FALSE,
  cultural_protocols JSONB DEFAULT '{}',
  community_consent_required BOOLEAN DEFAULT TRUE,
  
  -- Geographic/Community Scope
  geographic_scope VARCHAR(100), -- "Toronto", "Ontario", "Global", etc.
  target_communities TEXT[], -- Communities this project serves
  primary_language VARCHAR(10) DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  
  -- Project Lifecycle
  launched_at TIMESTAMPTZ,
  planned_end_date TIMESTAMPTZ,
  actual_end_date TIMESTAMPTZ,
  
  -- Capacity & Limits
  max_storytellers INTEGER DEFAULT 1000,
  max_stories INTEGER DEFAULT 10000,
  max_administrators INTEGER DEFAULT 10,
  
  -- Public Interface
  custom_subdomain VARCHAR(100), -- myproject.empathyledger.com
  custom_domain VARCHAR(255), -- stories.myorg.com
  public_description TEXT, -- For public project listing
  
  -- Branding (inherits from org but can override)
  logo_url VARCHAR(500),
  brand_colors JSONB DEFAULT '{}',
  custom_styling JSONB DEFAULT '{}',
  
  -- Analytics & Metrics
  total_stories INTEGER DEFAULT 0,
  total_storytellers INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0.0,
  impact_score DECIMAL(5,2) DEFAULT 0.0,
  sovereignty_compliance_score INTEGER DEFAULT 85,
  
  -- Last Activity Tracking
  last_story_submitted TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Settings & Configuration
  settings JSONB DEFAULT '{}', -- Flexible project-specific settings
  notification_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Ensure slug is unique within organization
  UNIQUE(organization_id, slug)
);

-- Indexes for performance
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_slug ON projects(organization_id, slug);
CREATE INDEX idx_projects_activity ON projects(last_activity_at DESC);
```

### 3. Update Existing Tables to Link to Projects

```sql
-- Update existing tables to properly reference projects
ALTER TABLE stories ADD COLUMN project_id UUID REFERENCES projects(id);
ALTER TABLE media ADD COLUMN project_id UUID REFERENCES projects(id);
ALTER TABLE project_members ADD COLUMN project_id UUID REFERENCES projects(id); -- If not already there
ALTER TABLE project_analytics ADD COLUMN project_id UUID REFERENCES projects(id); -- If not already there

-- Create indexes
CREATE INDEX idx_stories_project ON stories(project_id);
CREATE INDEX idx_media_project ON media(project_id);
```

## 📋 MIGRATION PLAN FROM AIRTABLE

### Phase 1: Data Discovery
```typescript
// Script to analyze Airtable project data
interface AirtableStorytellerWithProject {
  storyteller_id: string
  project_name: string
  organization_name?: string
  // ... other project fields from Airtable
}

// 1. Extract unique projects from Airtable storytellers
// 2. Group by organization (if available)
// 3. Map to our new schema
```

### Phase 2: Create Organizations
```typescript
// Migration script priorities:
// 1. Create organizations (extract from project data or create defaults)
// 2. Create projects under organizations
// 3. Link existing storytellers/users to projects
// 4. Update existing stories/media with project_id
```

### Phase 3: Link Existing Data
```sql
-- Update existing stories to link to projects
-- Based on storyteller -> project mapping from Airtable
UPDATE stories 
SET project_id = (
  SELECT p.id FROM projects p 
  JOIN project_members pm ON pm.project_id = p.id 
  WHERE pm.user_id = stories.storyteller_id 
  LIMIT 1
);
```

## 🔗 RELATIONSHIPS DIAGRAM

```
Organizations (1) ──→ (Many) Projects
                            │
                            ├─→ (Many) Users/Storytellers (via project_members)
                            ├─→ (Many) Stories
                            ├─→ (Many) Media
                            ├─→ (Many) CMS Pages (future)
                            └─→ (Many) Analytics
```

## 🚀 IMPLEMENTATION PLAN

### Step 1: Create Foundation Tables (30 minutes)
```sql
-- Deploy organizations and projects tables
-- Create proper indexes and constraints
```

### Step 2: Analyze Airtable Data (20 minutes)
```typescript
// Create script to examine Airtable project data
// Identify unique projects and organizations
// Plan migration mapping
```

### Step 3: Migrate Organizations & Projects (45 minutes)
```typescript
// Create organizations (extract or create defaults)
// Create projects with proper organization links
// Migrate project-specific settings and data
```

### Step 4: Link Existing Data (30 minutes)
```sql
-- Update existing tables with project_id
-- Ensure all storytellers are linked to projects
-- Update stories and media with project context
```

### Step 5: Update CMS Integration (20 minutes)
```typescript
// Update CMS schema to use new projects table
// Update CMS service to work with project context
// Test full integration
```

## 🎯 SUCCESS METRICS

### Data Integrity ✅
- [ ] All existing storytellers linked to projects
- [ ] All existing stories have project_id
- [ ] No data loss during migration
- [ ] Proper organization/project hierarchy

### Functionality ✅
- [ ] Multi-tenant project system working
- [ ] CMS integration with project context
- [ ] Existing features continue to work
- [ ] New organization/project management features

## 🚨 CRITICAL QUESTIONS

1. **Airtable Project Data**: Can you show me the structure of the Project field in your Airtable storytellers table?

2. **Organization Grouping**: Are there organizations already defined, or should we create them based on project patterns?

3. **Default Organization**: Should we create a default "Empathy Ledger" organization for ungrouped projects?

4. **Migration Strategy**: Do you want to migrate all historical project data, or start fresh with current active projects?

---

**Next Step**: Let's examine the Airtable project data structure so I can create the perfect migration script!