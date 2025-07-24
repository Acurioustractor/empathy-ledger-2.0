-- =====================================================
-- COUNTRIES AND LOCATIONS TABLES
-- =====================================================
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Create Countries Table for International Scaling
CREATE TABLE IF NOT EXISTS countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  currency VARCHAR(3),
  timezone VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for countries
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);

-- 2. Enhance Locations Table with Country Reference
ALTER TABLE locations ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) REFERENCES countries(code);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Create indexes for locations
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country_code);
CREATE INDEX IF NOT EXISTS idx_locations_state ON locations(state);

-- 3. Insert Countries Data
INSERT INTO countries (code, name, currency, timezone) VALUES
('AU', 'Australia', 'AUD', 'Australia/Sydney'),
('ES', 'Spain', 'EUR', 'Europe/Madrid'),
('GR', 'Greece', 'EUR', 'Europe/Athens'),
('GB', 'United Kingdom', 'GBP', 'Europe/London')
ON CONFLICT (code) DO NOTHING;

-- 4. Update Existing Locations with Country Data
UPDATE locations SET country_code = 'AU', state = 'SA' WHERE name = 'Adelaide';
UPDATE locations SET country_code = 'AU', state = 'ACT' WHERE name = 'Canberra';
UPDATE locations SET country_code = 'AU', state = 'TAS' WHERE name = 'Hobart';
UPDATE locations SET country_code = 'AU', state = 'VIC' WHERE name = 'Melbourne';
UPDATE locations SET country_code = 'AU', state = 'QLD' WHERE name = 'Palm Island';
UPDATE locations SET country_code = 'AU', state = 'NT' WHERE name = 'Tennant Creek';

-- 5. Insert Missing Australian Locations
INSERT INTO locations (name, country_code, state, type, active) VALUES
('Brisbane', 'AU', 'QLD', 'city', true),
('Perth', 'AU', 'WA', 'city', true),
('Newcastle', 'AU', 'NSW', 'city', true),
('Central Coast', 'AU', 'NSW', 'region', true),
('Kalgoorlie', 'AU', 'WA', 'city', true),
('Toowoomba', 'AU', 'QLD', 'city', true),
('Mackay', 'AU', 'QLD', 'city', true),
('Darwin', 'AU', 'NT', 'city', true),
('Alice Springs', 'AU', 'NT', 'city', true),
('Mount Isa', 'AU', 'QLD', 'city', true),
('Rockhampton', 'AU', 'QLD', 'city', true),
('Gladstone', 'AU', 'QLD', 'city', true),
('Bundaberg', 'AU', 'QLD', 'city', true),
('Townsville', 'AU', 'QLD', 'city', true),
('Cairns', 'AU', 'QLD', 'city', true),
('Gold Coast', 'AU', 'QLD', 'city', true),
('Geelong', 'AU', 'VIC', 'city', true),
('Ballarat', 'AU', 'VIC', 'city', true),
('Stradbroke Island', 'AU', 'QLD', 'island', true)
ON CONFLICT (name) DO NOTHING;

-- 6. Insert International Locations
INSERT INTO locations (name, country_code, state, type, active) VALUES
('Spain', 'ES', NULL, 'country', true),
('Athens', 'GR', NULL, 'city', true),
('London', 'GB', NULL, 'city', true)
ON CONFLICT (name) DO NOTHING;

-- 7. Create Location Lookup Function for Easy Access
CREATE OR REPLACE FUNCTION get_location_id_by_name(location_name TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM locations WHERE name = location_name LIMIT 1;
$$;

-- 8. Create Location Normalization Function
CREATE OR REPLACE FUNCTION normalize_location_name(input_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Handle common spelling variations and normalize
  CASE 
    WHEN input_name ILIKE 'Tennent Creek' THEN RETURN 'Tennant Creek';
    WHEN input_name ILIKE 'Bundaburg' THEN RETURN 'Bundaberg';
    WHEN input_name ILIKE 'Mt Isa' THEN RETURN 'Mount Isa';
    WHEN input_name ILIKE 'central coast' THEN RETURN 'Central Coast';
    WHEN input_name ILIKE 'gold coast' THEN RETURN 'Gold Coast';
    WHEN input_name ILIKE 'spain' THEN RETURN 'Spain';
    WHEN input_name ILIKE 'athens' THEN RETURN 'Athens';
    WHEN input_name ILIKE 'london' THEN RETURN 'London';
    ELSE RETURN TRIM(input_name);
  END CASE;
END;
$$;

-- 9. Verification Queries
SELECT 
  c.name as country,
  COUNT(l.id) as location_count
FROM countries c
LEFT JOIN locations l ON l.country_code = c.code
GROUP BY c.code, c.name
ORDER BY c.name;

-- Show all locations with their countries
SELECT 
  l.name as location,
  l.state,
  c.name as country,
  l.type
FROM locations l
LEFT JOIN countries c ON l.country_code = c.code
ORDER BY c.name, l.state, l.name;

-- Success message
SELECT 'Countries and Locations setup complete! 🌍' as result;