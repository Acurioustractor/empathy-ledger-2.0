-- =====================================================
-- COUNTRIES AND LOCATIONS TABLES (CORRECTED)
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

-- 2. Add country_code to existing locations table (it already has country field)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) REFERENCES countries(code);

-- Create index for country_code
CREATE INDEX IF NOT EXISTS idx_locations_country_code ON locations(country_code);

-- 3. Insert Countries Data
INSERT INTO countries (code, name, currency, timezone) VALUES
('AU', 'Australia', 'AUD', 'Australia/Sydney'),
('ES', 'Spain', 'EUR', 'Europe/Madrid'), 
('GR', 'Greece', 'EUR', 'Europe/Athens'),
('GB', 'United Kingdom', 'GBP', 'Europe/London')
ON CONFLICT (code) DO NOTHING;

-- 4. Update Existing Locations with Country Codes
UPDATE locations SET country_code = 'AU', state = 'SA' WHERE name = 'Adelaide';
UPDATE locations SET country_code = 'AU', state = 'ACT' WHERE name = 'Canberra';
UPDATE locations SET country_code = 'AU', state = 'TAS' WHERE name = 'Hobart';
UPDATE locations SET country_code = 'AU', state = 'VIC' WHERE name = 'Melbourne';
UPDATE locations SET country_code = 'AU', state = 'QLD' WHERE name = 'Palm Island';
UPDATE locations SET country_code = 'AU', state = 'NT' WHERE name = 'Tennant Creek';

-- 5. Insert Missing Australian Locations (using existing table structure)
INSERT INTO locations (name, country, country_code, state, active) VALUES
('Brisbane', 'Australia', 'AU', 'QLD', true),
('Perth', 'Australia', 'AU', 'WA', true),
('Newcastle', 'Australia', 'AU', 'NSW', true),
('Central Coast', 'Australia', 'AU', 'NSW', true),
('Kalgoorlie', 'Australia', 'AU', 'WA', true),
('Toowoomba', 'Australia', 'AU', 'QLD', true),
('Mackay', 'Australia', 'AU', 'QLD', true),
('Darwin', 'Australia', 'AU', 'NT', true),
('Alice Springs', 'Australia', 'AU', 'NT', true),
('Mount Isa', 'Australia', 'AU', 'QLD', true),
('Rockhampton', 'Australia', 'AU', 'QLD', true),
('Gladstone', 'Australia', 'AU', 'QLD', true),
('Bundaberg', 'Australia', 'AU', 'QLD', true),
('Townsville', 'Australia', 'AU', 'QLD', true),
('Cairns', 'Australia', 'AU', 'QLD', true),
('Gold Coast', 'Australia', 'AU', 'QLD', true),
('Geelong', 'Australia', 'AU', 'VIC', true),
('Ballarat', 'Australia', 'AU', 'VIC', true),
('Stradbroke Island', 'Australia', 'AU', 'QLD', true)
ON CONFLICT (name) DO NOTHING;

-- 6. Insert International Locations
INSERT INTO locations (name, country, country_code, active) VALUES
('Spain', 'Spain', 'ES', true),
('Athens', 'Greece', 'GR', true),
('London', 'United Kingdom', 'GB', true)
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
  l.country,
  c.name as country_name,
  l.country_code
FROM locations l
LEFT JOIN countries c ON l.country_code = c.code
ORDER BY c.name, l.state, l.name;

-- Count total locations
SELECT COUNT(*) as total_locations FROM locations;

-- Success message
SELECT 'Countries and Locations setup complete! 🌍 Ready for storyteller linking!' as result;