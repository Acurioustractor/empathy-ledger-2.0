-- Create organizations table that was missing from migration
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
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

-- Create index on name for fast lookups
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY "Allow full access for service role" ON organizations
    FOR ALL USING (true);

-- Insert the 13 organizations based on community affiliations
INSERT INTO organizations (name, description, organization_type, status, country) VALUES
('Orange Sky', 'Orange Sky community organization providing laundry services for homeless', 'Community', 'active', 'Australia'),
('Goods.', 'Goods. community organization focused on community marketplace', 'Community', 'active', 'Australia'),
('Diagrama', 'Diagrama community organization providing social services', 'Community', 'active', 'Australia'),
('PICC', 'PICC community center organization', 'Community', 'active', 'Australia'),
('TOMNET', 'TOMNET youth services organization', 'Community', 'active', 'Australia'),
('MMEIC', 'MMEIC indigenous services organization', 'Community', 'active', 'Australia'),
('Global Laundry Alliance', 'Global Laundry Alliance network initiative organization', 'Community', 'active', 'Australia'),
('MingaMinga Rangers', 'MingaMinga Rangers environmental organization', 'Community', 'active', 'Australia'),
('Young Guns', 'Young Guns youth development organization', 'Community', 'active', 'Australia'),
('Oonchiumpa', 'Oonchiumpa cultural organization', 'Community', 'active', 'Australia'),
('General Community', 'General Community organization for diverse storytellers', 'Community', 'active', 'Australia'),
('Beyond Shadows', 'Beyond Shadows mental health organization', 'Community', 'active', 'Australia'),
('JusticeHub', 'JusticeHub legal aid organization', 'Community', 'active', 'Australia')
ON CONFLICT (name) DO NOTHING;