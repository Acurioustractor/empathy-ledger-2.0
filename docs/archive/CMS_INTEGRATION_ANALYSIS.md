# CMS Integration Analysis - Existing Tables

## 📊 EXISTING SCHEMA ANALYSIS

### Core Architecture ✅
Your existing schema shows a **well-designed multi-tenant system** with:

- **User Management**: `users`, `profiles`
- **Project System**: `project_members`, `project_invitations`, `project_analytics`, `project_modules`, `project_templates`
- **Content Core**: `stories`, `media`, `quotes`, `themes`, `story_themes`, `story_analysis`
- **Community Features**: `communities`, `storyteller_connections`, `storyteller_onboarding`, `storyteller_projects`
- **Cross-project**: `cross_project_connections`, `community_insights`
- **Platform Management**: `platform_audit_log`, `platform_modules`, `content_calendar`

### 🔍 KEY OBSERVATIONS

#### 1. **Missing `projects` Table** ⚠️
- You have `project_members`, `project_analytics`, `project_modules`, etc.
- But no core `projects` table visible
- **Question**: Is this table named differently or missing from the list?

#### 2. **Existing Media System** ✅
- You already have a `media` table
- **CMS Integration**: Should we extend this or create separate `cms_media_library`?

#### 3. **Content Structure** ✅
- `stories` table for user-generated content
- `content_calendar` for planning
- **CMS Addition**: Static/marketing pages (different from user stories)

#### 4. **User System** ✅
- `users` + `profiles` pattern
- `project_members` for permissions
- **Perfect for CMS integration**

## 🎯 OPTIMAL CMS INTEGRATION STRATEGY

### Phase 1: Extend Existing Tables (Recommended)

#### Option A: Extend Media Table
```sql
-- Add CMS-specific columns to existing media table
ALTER TABLE media ADD COLUMN content_type VARCHAR(50) DEFAULT 'story_media';
ALTER TABLE media ADD COLUMN cms_metadata JSONB;
ALTER TABLE media ADD COLUMN folder_path VARCHAR(255) DEFAULT '/';

-- Values: 'story_media', 'cms_asset', 'page_image', etc.
```

#### Option B: Separate CMS Media (Safer)
```sql
-- Create separate CMS media library
CREATE TABLE cms_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id), -- IF projects table exists
  -- ... rest of CMS media fields
);
```

### Phase 2: Core CMS Tables with Existing Integration

```sql
-- CMS Pages (new - for static/marketing content)
CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID, -- Link to existing project system
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content JSONB DEFAULT '[]',
  
  -- Integrate with existing user system
  author_id UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  
  -- Use existing patterns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- CMS-specific fields
  page_type VARCHAR(50) DEFAULT 'static',
  status VARCHAR(20) DEFAULT 'draft',
  visibility VARCHAR(20) DEFAULT 'public',
  
  -- Sovereignty compliance (matching your existing patterns)
  cultural_sensitivity VARCHAR(20) DEFAULT 'general',
  requires_elder_review BOOLEAN DEFAULT FALSE,
  
  -- SEO and analytics
  meta_description TEXT,
  meta_keywords TEXT[],
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  version_notes TEXT
);

-- Content Blocks (new - for page building)
CREATE TABLE cms_content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  project_id UUID, -- For easier querying
  
  block_type VARCHAR(50) NOT NULL,
  block_order INTEGER NOT NULL,
  block_data JSONB NOT NULL DEFAULT '{}',
  
  -- Display control
  display_conditions JSONB,
  css_classes TEXT[],
  custom_styles JSONB,
  
  -- A/B testing
  experiment_id VARCHAR(100),
  variant_name VARCHAR(50),
  traffic_allocation DECIMAL(5,2) DEFAULT 100.00,
  
  -- Analytics
  interaction_count INTEGER DEFAULT 0,
  conversion_events JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation (extend content_calendar concept)
CREATE TABLE cms_navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID, -- Multi-tenant
  name VARCHAR(100) NOT NULL,
  menu_items JSONB NOT NULL DEFAULT '[]',
  visibility_rules JSONB DEFAULT '{}',
  required_permissions TEXT[],
  styling JSONB DEFAULT '{}',
  behavior_config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page versions (extend your existing versioning patterns)
CREATE TABLE cms_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  content JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
```

## 🔗 INTEGRATION POINTS

### 1. **Project System Integration**
```sql
-- Assume projects table exists (need to verify)
-- All CMS tables get project_id for multi-tenancy
-- Use existing project_members for permissions
```

### 2. **User System Integration** ✅
```sql
-- Use existing users table for CMS authors
-- Use existing profiles for display names/avatars
-- Use existing project_members for CMS permissions
```

### 3. **Media Integration** 
```sql
-- Option 1: Extend existing media table
-- Option 2: Create cms_media_library with references to media
-- Option 3: Hybrid approach (recommended)
```

### 4. **Analytics Integration** ✅
```sql
-- CMS page views can feed into existing project_analytics
-- Use existing platform_audit_log for CMS actions
-- Integrate with existing story_analysis patterns
```

## 🚨 CRITICAL QUESTIONS TO RESOLVE

### 1. **Projects Table Location**
```sql
-- Is there a projects table not in this list?
-- Or is project data stored differently?
-- Need to see the actual projects schema
```

### 2. **Media Strategy**
```sql
-- Extend existing media table?
-- Create separate cms_media_library?
-- How does current media table work with stories?
```

### 3. **Permission Model**
```sql
-- How do project_members permissions work?
-- What roles exist in the system?
-- How should CMS permissions map to existing roles?
```

## 🎯 RECOMMENDED NEXT STEPS

### Step 1: Verify Project System
```sql
-- Check if projects table exists with different name
-- Or understand how project data is structured
```

### Step 2: Examine Existing Schema
```sql
-- Get full schema for key tables:
-- project_members, users, profiles, media
-- Understand existing permission patterns
```

### Step 3: Design Integration Schema
```sql
-- Create CMS tables that perfectly integrate
-- with your existing patterns and naming conventions
```

### Step 4: Safe Deployment
```sql
-- Deploy CMS tables as additive only
-- No changes to existing tables initially
-- Test integration thoroughly
```

## 📋 IMMEDIATE ACTION ITEMS

1. **Show me the `projects` table schema** (or equivalent)
2. **Show me `project_members` and permission structure**
3. **Show me `media` table structure**
4. **Confirm user/profile relationship**

Once I have this information, I can create the **perfect CMS integration** that seamlessly extends your existing architecture without any conflicts or risks.