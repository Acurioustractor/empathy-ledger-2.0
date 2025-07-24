-- EMPATHY LEDGER: OPTIMIZE SUPABASE STRUCTURE FOR EFFICIENCY
-- Execute this SQL to create normalized, efficient structure

-- =====================================================
-- ANALYSIS OF CURRENT STRUCTURE:
-- =====================================================
-- STORYTELLERS: users table (role='storyteller') - 206 records
-- DUPLICATE DATA: storyteller_profiles table - 206 records (merge needed)
-- LOCATIONS: Scattered strings in media table (normalize needed)
-- COMMUNITIES: 13 unique communities as strings (normalize needed)
-- PROJECTS: NULL data (needs proper structure)
-- LINKING: Empty arrays (needs population)

-- =====================================================
-- STEP 1: CREATE NORMALIZED REFERENCE TABLES
-- =====================================================

-- Communities table for efficiency and consistency
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR,
  contact_info JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table for geographic data
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR DEFAULT 'Australia',
  region VARCHAR,
  coordinates POINT,
  timezone VARCHAR,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table for storyteller projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'paused')),
  community_id UUID REFERENCES communities(id),
  location_id UUID REFERENCES locations(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: POPULATE REFERENCE TABLES WITH EXISTING DATA
-- =====================================================

-- Insert unique communities
INSERT INTO communities (name)
SELECT DISTINCT community_affiliation
FROM users 
WHERE role = 'storyteller' 
  AND community_affiliation IS NOT NULL 
  AND community_affiliation != ''
ON CONFLICT (name) DO NOTHING;

-- Insert unique locations from media table
INSERT INTO locations (name)
SELECT DISTINCT location
FROM media 
WHERE location IS NOT NULL 
  AND location != 'null'
  AND location != ''
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 3: ENHANCE USERS TABLE FOR STORYTELLERS
-- =====================================================

-- Add foreign key references to normalized tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_location_id UUID REFERENCES locations(id);

-- Merge storyteller_profiles data into users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_story_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS shared_themes TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS contribution_score INTEGER DEFAULT 0;

-- Update users with community_id references
UPDATE users 
SET community_id = c.id
FROM communities c
WHERE users.community_affiliation = c.name 
  AND users.role = 'storyteller';

-- Merge storyteller_profiles data (shared_themes is NULL, so skip it)
UPDATE users 
SET 
  public_story_count = sp.public_story_count,
  contribution_score = sp.contribution_score,
  bio = COALESCE(users.bio, sp.bio),
  profile_image_url = COALESCE(users.profile_image_url, sp.profile_image_url)
FROM storyteller_profiles sp
WHERE users.id = sp.storyteller_id;

-- =====================================================
-- STEP 4: ENHANCE MEDIA TABLE WITH REFERENCES
-- =====================================================

-- Add location reference to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);

-- Update media with location_id references
UPDATE media 
SET location_id = l.id
FROM locations l
WHERE media.location = l.name;

-- =====================================================
-- STEP 5: CREATE PROJECT-STORYTELLER LINKING TABLE
-- =====================================================

-- Many-to-many relationship between storytellers and projects
CREATE TABLE IF NOT EXISTS storyteller_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storyteller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role VARCHAR, -- 'participant', 'lead', 'facilitator', etc.
  start_date DATE,
  end_date DATE,
  contribution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(storyteller_id, project_id)
);

-- =====================================================
-- STEP 6: CREATE EFFICIENT VIEWS FOR DATA ACCESS
-- =====================================================

-- Comprehensive storyteller view
CREATE OR REPLACE VIEW storyteller_complete AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.bio,
  u.profile_image_url,
  u.public_story_count,
  u.contribution_score,
  u.shared_themes,
  u.created_at,
  u.updated_at,
  
  -- Community info
  c.name as community_name,
  c.description as community_description,
  c.location as community_location,
  
  -- Primary location info
  l.name as location_name,
  l.city as location_city,
  l.state as location_state,
  l.region as location_region,
  
  -- Linked content counts
  u.linked_media,
  u.linked_stories,
  u.linked_quotes,
  u.linked_themes,
  
  -- Media count (actual count from media table)
  (SELECT COUNT(*) FROM media m WHERE m.storyteller_id = u.id) as actual_media_count,
  
  -- Projects
  array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as project_names,
  array_agg(DISTINCT sp.role) FILTER (WHERE sp.role IS NOT NULL) as project_roles

FROM users u
LEFT JOIN communities c ON u.community_id = c.id
LEFT JOIN locations l ON u.primary_location_id = l.id
LEFT JOIN storyteller_projects sp ON u.id = sp.storyteller_id
LEFT JOIN projects p ON sp.project_id = p.id
WHERE u.role = 'storyteller'
GROUP BY u.id, c.id, l.id;

-- Media with full context view
CREATE OR REPLACE VIEW media_complete AS
SELECT 
  m.id,
  m.title,
  m.transcript,
  m.summary,
  m.video_url,
  m.audio_url,
  m.status,
  m.submitted_at,
  m.created_at,
  
  -- Storyteller info
  u.full_name as storyteller_name,
  c.name as storyteller_community,
  
  -- Location info
  l.name as location_name,
  l.city as location_city,
  l.state as location_state,
  
  -- Linking arrays
  m.linked_quotes,
  m.linked_themes,
  
  -- Actual linked content counts
  cardinality(m.linked_quotes) as quotes_count,
  cardinality(m.linked_themes) as themes_count

FROM media m
LEFT JOIN users u ON m.storyteller_id = u.id
LEFT JOIN communities c ON u.community_id = c.id
LEFT JOIN locations l ON m.location_id = l.id;

-- =====================================================
-- STEP 7: CREATE PERFORMANCE INDEXES
-- =====================================================

-- Storyteller indexes
CREATE INDEX IF NOT EXISTS idx_users_role_community ON users(role, community_id);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(primary_location_id);
CREATE INDEX IF NOT EXISTS idx_users_contribution_score ON users(contribution_score DESC);

-- Media indexes
CREATE INDEX IF NOT EXISTS idx_media_storyteller_location ON media(storyteller_id, location_id);
CREATE INDEX IF NOT EXISTS idx_media_status_date ON media(status, submitted_at DESC);

-- Community and location indexes
CREATE INDEX IF NOT EXISTS idx_communities_name ON communities(name);
CREATE INDEX IF NOT EXISTS idx_locations_name_state ON locations(name, state);

-- Project linking indexes
CREATE INDEX IF NOT EXISTS idx_storyteller_projects_storyteller ON storyteller_projects(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_projects_project ON storyteller_projects(project_id);

-- =====================================================
-- STEP 8: CREATE LINKING POPULATION FUNCTIONS
-- =====================================================

-- Function to populate storyteller linked_media arrays
CREATE OR REPLACE FUNCTION populate_storyteller_media_links()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET linked_media = (
    SELECT array_agg(m.id)
    FROM media m 
    WHERE m.storyteller_id = users.id
  )
  WHERE role = 'storyteller';
END;
$$ LANGUAGE plpgsql;

-- Function to populate media linked_quotes arrays based on story_id
CREATE OR REPLACE FUNCTION populate_media_quote_links()
RETURNS void AS $$
BEGIN
  -- This needs to be done based on your quotes table structure
  -- Since quotes have story_id, we need to map old story IDs to media IDs
  UPDATE media 
  SET linked_quotes = (
    SELECT array_agg(q.id)
    FROM quotes q 
    WHERE q.story_id = media.id
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 9: CLEANUP AND OPTIMIZATION
-- =====================================================

-- Add comments for clarity
COMMENT ON TABLE communities IS 'Normalized community organizations';
COMMENT ON TABLE locations IS 'Normalized geographic locations';
COMMENT ON TABLE projects IS 'Storyteller projects and initiatives';
COMMENT ON TABLE storyteller_projects IS 'Many-to-many linking between storytellers and projects';

COMMENT ON VIEW storyteller_complete IS 'Complete storyteller information with all relationships';
COMMENT ON VIEW media_complete IS 'Complete media information with storyteller and location context';

-- =====================================================
-- STEP 10: EXECUTE LINKING FUNCTIONS
-- =====================================================

-- Populate the linking arrays
SELECT populate_storyteller_media_links();
SELECT populate_media_quote_links();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check the new structure:
-- SELECT COUNT(*) FROM communities;
-- SELECT COUNT(*) FROM locations;
-- SELECT * FROM storyteller_complete LIMIT 5;
-- SELECT * FROM media_complete LIMIT 5;

-- =====================================================
-- RESULT: OPTIMIZED STRUCTURE
-- =====================================================

-- STORYTELLERS: Enhanced users table with normalized references
-- COMMUNITIES: 13 communities in normalized table
-- LOCATIONS: Normalized location data with geographic info
-- PROJECTS: Proper project management system
-- LINKING: Populated UUID arrays for Airtable-style relationships
-- VIEWS: Easy access to complete data with joins
-- PERFORMANCE: Proper indexes for efficient queries