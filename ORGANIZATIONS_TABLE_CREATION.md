# HOW TO CREATE ORGANIZATIONS TABLE AND FILL IT

## The Problem
The `organizations` table was never created during the Airtable migration, but the `users` table has `organization_id` foreign keys pointing to nothing. This prevents linking storytellers to organizations.

## Solution: Manual Database Setup

### Step 1: Create Organizations Table in Supabase Dashboard

Go to your Supabase Dashboard > SQL Editor and run this SQL:

```sql
-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  organization_type VARCHAR(100) DEFAULT 'Community',
  status VARCHAR(50) DEFAULT 'active',
  website_url VARCHAR(500),
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Australia',
  postal_code VARCHAR(20),
  founded_date DATE,
  logo_url VARCHAR(500),
  social_media JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(organization_type);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Allow full access for service role" ON public.organizations
  FOR ALL USING (true);
```

### Step 2: Insert Organization Records

Run this SQL to insert all 13 organizations based on community affiliations:

```sql
-- Insert organizations based on storyteller communities
INSERT INTO public.organizations (name, description, organization_type, status, country, metadata) VALUES
('Orange Sky', 'Orange Sky community organization - affiliated with Orange Sky', 'Community', 'active', 'Australia', '{"storyteller_count": 107, "primary_project": "Orange Sky", "created_from_migration": true}'),
('Goods.', 'Goods. community organization - affiliated with Goods.', 'Community', 'active', 'Australia', '{"storyteller_count": 22, "primary_project": "Goods.", "created_from_migration": true}'),
('Diagrama', 'Diagrama community organization - affiliated with Diagrama', 'Community', 'active', 'Australia', '{"storyteller_count": 15, "primary_project": "Diagrama", "created_from_migration": true}'),
('PICC', 'PICC community organization - affiliated with PICC', 'Community', 'active', 'Australia', '{"storyteller_count": 13, "primary_project": "PICC", "created_from_migration": true}'),
('TOMNET', 'TOMNET community organization - affiliated with TOMNET', 'Community', 'active', 'Australia', '{"storyteller_count": 9, "primary_project": "TOMNET", "created_from_migration": true}'),
('MMEIC', 'MMEIC community organization - affiliated with MMEIC', 'Community', 'active', 'Australia', '{"storyteller_count": 9, "primary_project": "MMEIC", "created_from_migration": true}'),
('Global Laundry Alliance', 'Global Laundry Alliance community organization - affiliated with Global Laundry Alliance', 'Community', 'active', 'Australia', '{"storyteller_count": 7, "primary_project": "Global Laundry Alliance", "created_from_migration": true}'),
('MingaMinga Rangers', 'MingaMinga Rangers community organization - affiliated with MingaMinga Rangers', 'Community', 'active', 'Australia', '{"storyteller_count": 7, "primary_project": "MingaMinga Rangers", "created_from_migration": true}'),
('Young Guns', 'Young Guns community organization - affiliated with Young Guns', 'Community', 'active', 'Australia', '{"storyteller_count": 5, "primary_project": "Young Guns", "created_from_migration": true}'),
('Oonchiumpa', 'Oonchiumpa community organization - affiliated with Oonchiumpa', 'Community', 'active', 'Australia', '{"storyteller_count": 4, "primary_project": "Oonchiumpa", "created_from_migration": true}'),
('General Community', 'General Community community organization - independent community group', 'Community', 'active', 'Australia', '{"storyteller_count": 3, "primary_project": null, "created_from_migration": true}'),
('Beyond Shadows', 'Beyond Shadows community organization - affiliated with Beyond Shadows', 'Community', 'active', 'Australia', '{"storyteller_count": 3, "primary_project": "Beyond Shadows", "created_from_migration": true}'),
('JusticeHub', 'JusticeHub community organization - affiliated with JusticeHub', 'Community', 'active', 'Australia', '{"storyteller_count": 2, "primary_project": "JusticeHub", "created_from_migration": true}')
ON CONFLICT (name) DO NOTHING;
```

### Step 3: Link Storytellers to Organizations

Run this SQL to update all storytellers with their organization links:

```sql
-- Link Orange Sky storytellers (107 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Orange Sky')
WHERE role = 'storyteller' AND community_affiliation = 'Orange Sky';

-- Link Goods. storytellers (22 storytellers)  
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Goods.')
WHERE role = 'storyteller' AND community_affiliation = 'Goods.';

-- Link Diagrama storytellers (15 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Diagrama')
WHERE role = 'storyteller' AND community_affiliation = 'Diagrama';

-- Link PICC storytellers (13 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'PICC')
WHERE role = 'storyteller' AND community_affiliation = 'PICC';

-- Link TOMNET storytellers (9 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'TOMNET')
WHERE role = 'storyteller' AND community_affiliation = 'TOMNET';

-- Link MMEIC storytellers (9 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'MMEIC')
WHERE role = 'storyteller' AND community_affiliation = 'MMEIC';

-- Link Global Laundry Alliance storytellers (7 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Global Laundry Alliance')
WHERE role = 'storyteller' AND community_affiliation = 'Global Laundry Alliance';

-- Link MingaMinga Rangers storytellers (7 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'MingaMinga Rangers')
WHERE role = 'storyteller' AND community_affiliation = 'MingaMinga Rangers';

-- Link Young Guns storytellers (5 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Young Guns')
WHERE role = 'storyteller' AND community_affiliation = 'Young Guns';

-- Link Oonchiumpa storytellers (4 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Oonchiumpa')
WHERE role = 'storyteller' AND community_affiliation = 'Oonchiumpa';

-- Link General Community storytellers (3 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'General Community')
WHERE role = 'storyteller' AND community_affiliation = 'General Community';

-- Link Beyond Shadows storytellers (3 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Beyond Shadows')
WHERE role = 'storyteller' AND community_affiliation = 'Beyond Shadows';

-- Link JusticeHub storytellers (2 storytellers)
UPDATE public.users 
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'JusticeHub')
WHERE role = 'storyteller' AND community_affiliation = 'JusticeHub';
```

### Step 4: Verify the Results

Run this query to verify all storytellers are now linked:

```sql
-- Check organization linking results
SELECT 
  o.name as organization_name,
  COUNT(u.id) as storyteller_count,
  o.description
FROM public.organizations o
LEFT JOIN public.users u ON u.organization_id = o.id AND u.role = 'storyteller'
GROUP BY o.id, o.name, o.description
ORDER BY storyteller_count DESC;

-- Check individual storyteller links
SELECT 
  u.full_name,
  u.community_affiliation,
  o.name as organization_name,
  p.name as project_name,
  l.name as location_name
FROM public.users u
LEFT JOIN public.organizations o ON u.organization_id = o.id
LEFT JOIN public.projects p ON u.project_id = p.id  
LEFT JOIN public.locations l ON u.primary_location_id = l.id
WHERE u.role = 'storyteller'
LIMIT 10;
```

## Expected Results After Completion

- **13 organizations created** matching the 13 unique community affiliations
- **206/206 storytellers linked** to organizations (100% success)
- **Complete storyteller profiles** with project, location, AND organization links
- **Full database relationships** working across all tables

## Why This Manual Approach

The programmatic approach failed because:
1. The `organizations` table doesn't exist in the database schema
2. Supabase client can't execute raw DDL (CREATE TABLE) statements
3. Foreign key constraints prevent linking without the table existing first
4. The migration script that should have created this table was incomplete

This manual SQL approach bypasses these limitations by directly creating the table structure and data through the Supabase Dashboard's SQL Editor.