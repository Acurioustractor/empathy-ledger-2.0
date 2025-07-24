# 🚀 World-Class Architecture Deployment Guide

## Overview
This guide will help you deploy the enhanced Supabase architecture through the Supabase dashboard SQL editor.

## Prerequisites
- Access to your Supabase project dashboard
- Admin privileges on the project

## Deployment Steps

### Step 1: Access Supabase SQL Editor
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `tednluwflfhxyucgwigh`
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Check Current Schema
First, let's see what tables currently exist:

```sql
-- Check existing tables
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Step 3: Deploy Enhanced Sovereignty Schema
Copy and paste the entire contents of `scripts/sql/003_enhanced_sovereignty_schema.sql` into the SQL editor and run it.

This will create:
- ✅ Enhanced stories table with sovereignty features
- ✅ Knowledge connections for AI graph
- ✅ Community insights with validation
- ✅ Value distribution tracking
- ✅ Cultural protocols registry
- ✅ Collaboration sessions
- ✅ Sovereignty audit log

### Step 4: Apply Advanced RLS Policies
Copy and paste the entire contents of `scripts/sql/004_advanced_rls_policies.sql` into the SQL editor and run it.

This will create:
- ✅ Helper functions for RLS
- ✅ Comprehensive security policies
- ✅ Rate limiting protection
- ✅ Cultural protocol enforcement
- ✅ Security monitoring views

### Step 5: Create CMS Tables
Run this SQL to create the Content Management System tables:

```sql
-- =============================================================================
-- CMS TABLES FOR EMPATHY LEDGER
-- =============================================================================

-- Website Content Management Tables
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta_description TEXT,
  meta_keywords TEXT[] DEFAULT '{}',
  
  -- Sovereignty Features
  page_type TEXT NOT NULL DEFAULT 'static',
  visibility TEXT DEFAULT 'public',
  cultural_sensitivity TEXT DEFAULT 'general',
  requires_elder_review BOOLEAN DEFAULT false,
  
  -- Content Management
  status TEXT DEFAULT 'draft',
  author_id UUID REFERENCES profiles(id),
  reviewer_id UUID REFERENCES profiles(id),
  review_notes TEXT,
  
  -- SEO & Analytics
  canonical_url TEXT,
  og_image_url TEXT,
  view_count INTEGER DEFAULT 0,
  bounce_rate FLOAT,
  avg_time_on_page INTERVAL,
  
  -- Scheduling
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES cms_pages(id),
  version_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  
  -- Block Structure
  block_type TEXT NOT NULL,
  block_order INTEGER NOT NULL DEFAULT 0,
  block_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Display Control
  display_conditions JSONB DEFAULT '{}'::jsonb,
  css_classes TEXT[] DEFAULT '{}',
  custom_styles JSONB DEFAULT '{}'::jsonb,
  
  -- A/B Testing
  experiment_id UUID,
  variant_name TEXT,
  traffic_allocation FLOAT DEFAULT 1.0,
  
  -- Analytics
  interaction_count INTEGER DEFAULT 0,
  conversion_events JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(page_id, block_order)
);

CREATE TABLE IF NOT EXISTS cms_navigation_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  menu_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Access Control
  visibility_rules JSONB DEFAULT '{"public": true}'::jsonb,
  required_permissions TEXT[] DEFAULT '{}',
  
  -- Customization
  styling JSONB DEFAULT '{}'::jsonb,
  behavior_config JSONB DEFAULT '{}'::jsonb,
  
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- File Information
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_type TEXT NOT NULL,
  
  -- Media Metadata
  title TEXT,
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  attribution TEXT,
  
  -- Technical Details
  dimensions JSONB,
  duration INTERVAL,
  color_palette TEXT[],
  
  -- Sovereignty & Consent
  consent_settings JSONB DEFAULT '{
    "public_display": true,
    "commercial_use": false,
    "attribution_required": true,
    "cultural_protocols": []
  }'::jsonb,
  
  -- Organization
  folder_path TEXT DEFAULT '/',
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  
  -- Processing & Optimization
  processed_variants JSONB DEFAULT '{}'::jsonb,
  processing_status TEXT DEFAULT 'pending',
  optimization_score FLOAT,
  
  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  used_in_pages UUID[] DEFAULT '{}',
  
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_visibility ON cms_pages(visibility);
CREATE INDEX IF NOT EXISTS idx_cms_blocks_page ON cms_content_blocks(page_id, block_order);
CREATE INDEX IF NOT EXISTS idx_cms_media_type ON cms_media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_cms_media_tags ON cms_media_library USING GIN(tags);

-- Enable RLS on CMS tables
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media_library ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for CMS
CREATE POLICY IF NOT EXISTS "cms_pages_public_read" ON cms_pages FOR SELECT USING (
  status = 'published' AND visibility = 'public'
);

CREATE POLICY IF NOT EXISTS "cms_pages_admin_full" ON cms_pages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY IF NOT EXISTS "cms_blocks_follow_page" ON cms_content_blocks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM cms_pages 
    WHERE cms_pages.id = cms_content_blocks.page_id 
    AND cms_pages.status = 'published' 
    AND cms_pages.visibility = 'public'
  )
);

-- Success notification
SELECT 'CMS tables created successfully!' as status;
```

### Step 6: Set Up Monitoring
```sql
-- Basic monitoring and logging setup
CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS deployment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_type TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  deployed_at TIMESTAMPTZ DEFAULT now()
);

-- Log this deployment
INSERT INTO deployment_logs (deployment_type, status, details) VALUES (
  'world_class_architecture', 
  'success', 
  '{"components": ["sovereignty_schema", "rls_policies", "cms_tables"], "version": "1.0.0"}'::jsonb
);

SELECT 'Monitoring setup complete!' as status;
```

### Step 7: Verify Deployment
Run this to verify everything was created successfully:

```sql
-- Verify all tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name LIKE 'cms_%' THEN 'CMS'
    WHEN table_name IN ('stories', 'communities', 'profiles') THEN 'Core'
    WHEN table_name LIKE 'wiki_%' THEN 'AI Wiki'
    WHEN table_name LIKE '%_audit%' THEN 'Audit'
    ELSE 'Other'
  END as category
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY category, table_name;

-- Check RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE ANY(ARRAY['cms_%', 'stories', 'communities'])
ORDER BY tablename;
```

## 🎉 Success Criteria

After completing all steps, you should see:

✅ **Enhanced Core Tables**: stories, communities, profiles with sovereignty features  
✅ **CMS Tables**: cms_pages, cms_content_blocks, cms_navigation_menus, cms_media_library  
✅ **AI Infrastructure**: knowledge_connections, wiki tables, embeddings support  
✅ **Security**: All tables have RLS enabled with comprehensive policies  
✅ **Monitoring**: system_health_logs, deployment_logs for tracking  

## Next Steps

1. **Test the deployment** by running a few queries
2. **Check the application** - restart your dev server: `npm run dev`
3. **Begin Day 3 tasks** - TypeScript service layer development

## Troubleshooting

If you encounter any errors:

1. **Permission errors**: Ensure you're using an admin account
2. **Table already exists**: Run `DROP TABLE IF EXISTS table_name CASCADE;` before creating
3. **RLS errors**: Temporarily disable RLS with `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

## 🚀 You're Ready!

Once deployment is complete, your Empathy Ledger platform will be running on world-class infrastructure with:

- **Community Knowledge Sovereignty** built into every table
- **Advanced Security** with comprehensive RLS policies  
- **Cultural Protocol** enforcement at the database level
- **AI-Ready Infrastructure** for semantic search and analysis
- **CMS Foundation** for dynamic content management

**Let's move to the next phase!** 🎯