-- Create CMS Schema for World-Class Content Management
-- Empathy Ledger CMS Foundation

-- 1. CMS Pages Table
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
    project_id UUID REFERENCES projects(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 2. CMS Content Blocks Table
CREATE TABLE IF NOT EXISTS cms_content_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    block_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    schema JSONB DEFAULT '{}',
    default_content JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    project_id UUID REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CMS Media Library Table
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
    project_id UUID REFERENCES projects(id),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CMS Navigation Table
CREATE TABLE IF NOT EXISTS cms_navigation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    items JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    project_id UUID REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CMS Settings Table
CREATE TABLE IF NOT EXISTS cms_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    category VARCHAR(100),
    description TEXT,
    data_type VARCHAR(50) DEFAULT 'string',
    is_sensitive BOOLEAN DEFAULT false,
    project_id UUID REFERENCES projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Page Content Blocks Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS cms_page_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
    block_id UUID REFERENCES cms_content_blocks(id) ON DELETE CASCADE,
    content_data JSONB DEFAULT '{}',
    position INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id, block_id, position)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_project_id ON cms_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_pages_page_type ON cms_pages(page_type);

CREATE INDEX IF NOT EXISTS idx_cms_content_blocks_type ON cms_content_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_cms_content_blocks_category ON cms_content_blocks(category);
CREATE INDEX IF NOT EXISTS idx_cms_content_blocks_project_id ON cms_content_blocks(project_id);

CREATE INDEX IF NOT EXISTS idx_cms_media_category ON cms_media(category);
CREATE INDEX IF NOT EXISTS idx_cms_media_project_id ON cms_media(project_id);
CREATE INDEX IF NOT EXISTS idx_cms_media_tags ON cms_media USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_cms_navigation_type ON cms_navigation(type);
CREATE INDEX IF NOT EXISTS idx_cms_navigation_project_id ON cms_navigation(project_id);

CREATE INDEX IF NOT EXISTS idx_cms_settings_key ON cms_settings(key);
CREATE INDEX IF NOT EXISTS idx_cms_settings_category ON cms_settings(category);
CREATE INDEX IF NOT EXISTS idx_cms_settings_project_id ON cms_settings(project_id);

CREATE INDEX IF NOT EXISTS idx_cms_page_blocks_page_id ON cms_page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_page_blocks_position ON cms_page_blocks(page_id, position);

-- Row Level Security (RLS) Policies

-- Enable RLS on all CMS tables
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_blocks ENABLE ROW LEVEL SECURITY;

-- CMS Pages Policies
CREATE POLICY "Public read access for published pages" ON cms_pages
    FOR SELECT USING (status = 'published');

CREATE POLICY "Project members can read all pages" ON cms_pages
    FOR SELECT USING (
        project_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = cms_pages.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project admins can manage pages" ON cms_pages
    FOR ALL USING (
        project_id IS NULL OR
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = cms_pages.project_id 
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'editor')
        )
    );

-- CMS Content Blocks Policies
CREATE POLICY "Public read for active blocks" ON cms_content_blocks
    FOR SELECT USING (is_active = true);

CREATE POLICY "Project members can read blocks" ON cms_content_blocks
    FOR SELECT USING (
        project_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = cms_content_blocks.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project admins can manage blocks" ON cms_content_blocks
    FOR ALL USING (
        project_id IS NULL OR
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = cms_content_blocks.project_id 
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'editor')
        )
    );

-- CMS Media Policies
CREATE POLICY "Public read for media" ON cms_media
    FOR SELECT USING (true);

CREATE POLICY "Project members can manage media" ON cms_media
    FOR ALL USING (
        project_id IS NULL OR
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = cms_media.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- CMS Navigation Policies
CREATE POLICY "Public read for active navigation" ON cms_navigation
    FOR SELECT USING (is_active = true);

CREATE POLICY "Project admins can manage navigation" ON cms_navigation
    FOR ALL USING (
        project_id IS NULL OR
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = cms_navigation.project_id 
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'editor')
        )
    );

-- CMS Settings Policies
CREATE POLICY "Public read for non-sensitive settings" ON cms_settings
    FOR SELECT USING (is_sensitive = false);

CREATE POLICY "Project admins can manage settings" ON cms_settings
    FOR ALL USING (
        project_id IS NULL OR
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = cms_settings.project_id 
            AND project_members.user_id = auth.uid()
            AND project_members.role = 'admin'
        )
    );

-- CMS Page Blocks Policies
CREATE POLICY "Public read for page blocks" ON cms_page_blocks
    FOR SELECT USING (
        is_visible = true AND
        EXISTS (
            SELECT 1 FROM cms_pages 
            WHERE cms_pages.id = cms_page_blocks.page_id 
            AND cms_pages.status = 'published'
        )
    );

CREATE POLICY "Project members can manage page blocks" ON cms_page_blocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cms_pages 
            JOIN project_members ON (
                cms_pages.project_id = project_members.project_id OR cms_pages.project_id IS NULL
            )
            WHERE cms_pages.id = cms_page_blocks.page_id 
            AND project_members.user_id = auth.uid()
            AND project_members.role IN ('admin', 'editor')
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_cms_pages_updated_at 
    BEFORE UPDATE ON cms_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_content_blocks_updated_at 
    BEFORE UPDATE ON cms_content_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_media_updated_at 
    BEFORE UPDATE ON cms_media 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_navigation_updated_at 
    BEFORE UPDATE ON cms_navigation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_settings_updated_at 
    BEFORE UPDATE ON cms_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_page_blocks_updated_at 
    BEFORE UPDATE ON cms_page_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial global settings (not project-specific)
INSERT INTO cms_settings (key, value, category, description, project_id) VALUES
('site_title', 'Empathy Ledger', 'general', 'Main site title', NULL),
('site_tagline', 'Community Stories That Matter', 'general', 'Site tagline/subtitle', NULL),
('default_theme', 'empathy-ledger', 'appearance', 'Default theme for the platform', NULL),
('enable_story_submission', 'true', 'features', 'Enable public story submission', NULL),
('enable_visualizations', 'true', 'features', 'Enable data visualization pages', NULL),
('contact_email', 'hello@empathyledger.com', 'contact', 'Main contact email', NULL),
('privacy_policy_url', '/privacy', 'legal', 'Privacy policy page URL', NULL),
('terms_of_service_url', '/terms', 'legal', 'Terms of service page URL', NULL)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE cms_pages IS 'CMS pages with metadata, SEO, and content structure';
COMMENT ON TABLE cms_content_blocks IS 'Reusable content blocks with schemas and defaults';
COMMENT ON TABLE cms_media IS 'Media library for images, videos, and documents';
COMMENT ON TABLE cms_navigation IS 'Navigation menus and structures';
COMMENT ON TABLE cms_settings IS 'Site-wide and project-specific configuration';
COMMENT ON TABLE cms_page_blocks IS 'Junction table linking pages to content blocks';