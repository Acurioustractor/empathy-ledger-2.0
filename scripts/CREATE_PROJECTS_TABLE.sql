-- =====================================================
-- PROJECTS TABLE CREATION
-- =====================================================
-- Run this SQL in your Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  project_type VARCHAR(100),
  start_date DATE,
  end_date DATE,
  website VARCHAR(500),
  contact_email VARCHAR(255),
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(active);

-- Add RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active projects
CREATE POLICY "Public can view active projects"
  ON projects FOR SELECT
  USING (active = true);

-- Allow authenticated users to view all projects
CREATE POLICY "Authenticated users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- Add project_id to users table for user-project relationships
ALTER TABLE users ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_users_project_id ON users(project_id);

-- Add project_id to stories table for story-project relationships
ALTER TABLE stories ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_stories_project_id ON stories(project_id);

-- Add organization_id to users table for direct organization relationships
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES communities(id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Success message
SELECT 'Projects table and relationships created! 🚀' as result;