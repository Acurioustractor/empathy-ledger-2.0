# Supabase CMS Setup Guide

## Step 1: Create CMS Tables in Supabase Dashboard

Go to your Supabase Dashboard > SQL Editor and run these commands:

### 1. Create cms_pages table
```sql
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  page_type VARCHAR(50) DEFAULT 'content',
  status VARCHAR(20) DEFAULT 'draft',
  content JSONB DEFAULT '{}',
  seo_title VARCHAR(500),
  seo_description TEXT,
  seo_keywords TEXT,
  meta_data JSONB DEFAULT '{}',
  featured_image TEXT,
  author_id UUID,
  project_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
```

### 2. Create cms_content_blocks table
```sql
CREATE TABLE IF NOT EXISTS cms_content_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  block_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  schema JSONB DEFAULT '{}',
  default_content JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  project_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Create cms_media table
```sql
CREATE TABLE IF NOT EXISTS cms_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  category VARCHAR(100),
  tags TEXT[],
  usage TEXT,
  project_id UUID,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Create cms_page_blocks junction table
```sql
CREATE TABLE IF NOT EXISTS cms_page_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_id UUID REFERENCES cms_content_blocks(id) ON DELETE CASCADE,
  content_data JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, block_id, position)
);
```

### 5. Enable Row Level Security
```sql
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_blocks ENABLE ROW LEVEL SECURITY;
```

### 6. Create RLS Policies
```sql
-- Public read access for published content
CREATE POLICY "Public read published content" ON cms_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public read active blocks" ON cms_content_blocks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read media" ON cms_media
  FOR SELECT USING (true);

CREATE POLICY "Public read page blocks" ON cms_page_blocks
  FOR SELECT USING (
    is_visible = true AND
    EXISTS (
      SELECT 1 FROM cms_pages 
      WHERE cms_pages.id = cms_page_blocks.page_id 
      AND cms_pages.status = 'published'
    )
  );
```

## Step 2: Populate Initial Content

After creating the tables, run:
```bash
npx tsx scripts/setup-dynamic-cms.ts
```

## Step 3: Update Website to Use Dynamic Content

The system will automatically switch to pulling content from Supabase instead of static files.

## Content Structure

### Case Studies
- **Type**: `case-study`
- **Content**: JSONB with hero, stats, sections, process_steps, testimonials
- **Template**: Reusable blocks for consistent presentation

### Blog Posts  
- **Type**: `blog-post`
- **Content**: JSONB with hero, sections, author info
- **Template**: Flexible content blocks for rich text, images, embeds

### Module Pages
- **Type**: `module`
- **Content**: JSONB with features, benefits, technical specs
- **Template**: Standardized layout with customizable blocks

## Benefits

✅ **Content managed in Supabase** - No code changes needed for content updates
✅ **Reusable templates** - Consistent formatting across all content
✅ **SEO optimization** - Dynamic meta tags and structured data
✅ **Multi-tenant support** - Organization-specific content
✅ **Version control** - Draft/published workflow
✅ **Rich content** - Support for text, images, videos, embeds