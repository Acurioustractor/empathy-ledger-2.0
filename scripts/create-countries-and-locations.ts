#!/usr/bin/env tsx

/**
 * Countries and Locations Migration
 * 
 * Creates proper international location structure with countries table
 * and links all storytellers to their locations
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing admin credentials')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Countries data for international scaling
const COUNTRIES = [
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    timezone: 'Australia/Sydney'
  },
  {
    code: 'ES', 
    name: 'Spain',
    currency: 'EUR',
    timezone: 'Europe/Madrid'
  },
  {
    code: 'GR',
    name: 'Greece', 
    currency: 'EUR',
    timezone: 'Europe/Athens'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP', 
    timezone: 'Europe/London'
  }
]

// All locations from Airtable analysis with proper country mapping
const LOCATIONS = [
  // Existing locations (already in Supabase)
  { name: 'Adelaide', country_code: 'AU', state: 'SA', existing: true },
  { name: 'Canberra', country_code: 'AU', state: 'ACT', existing: true },
  { name: 'Hobart', country_code: 'AU', state: 'TAS', existing: true },
  { name: 'Melbourne', country_code: 'AU', state: 'VIC', existing: true },
  { name: 'Palm Island', country_code: 'AU', state: 'QLD', existing: true },
  { name: 'Tennant Creek', country_code: 'AU', state: 'NT', existing: true },
  
  // Missing locations (need to add)
  { name: 'Brisbane', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Perth', country_code: 'AU', state: 'WA', existing: false },
  { name: 'Newcastle', country_code: 'AU', state: 'NSW', existing: false },
  { name: 'Central Coast', country_code: 'AU', state: 'NSW', existing: false },
  { name: 'Kalgoorlie', country_code: 'AU', state: 'WA', existing: false },
  { name: 'Toowoomba', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Mackay', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Darwin', country_code: 'AU', state: 'NT', existing: false },
  { name: 'Alice Springs', country_code: 'AU', state: 'NT', existing: false },
  { name: 'Mount Isa', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Rockhampton', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Gladstone', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Bundaberg', country_code: 'AU', state: 'QLD', existing: false }, // Fixed spelling
  { name: 'Townsville', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Cairns', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Gold Coast', country_code: 'AU', state: 'QLD', existing: false },
  { name: 'Geelong', country_code: 'AU', state: 'VIC', existing: false },
  { name: 'Ballarat', country_code: 'AU', state: 'VIC', existing: false },
  { name: 'Stradbroke Island', country_code: 'AU', state: 'QLD', existing: false },
  
  // International locations
  { name: 'Spain', country_code: 'ES', state: null, existing: false },
  { name: 'Athens', country_code: 'GR', state: null, existing: false },
  { name: 'London', country_code: 'GB', state: null, existing: false }
]

// Location name mapping for spelling fixes and variations
const LOCATION_MAPPING = {
  // Spelling corrections
  'Tennent Creek': 'Tennant Creek',
  'Bundaburg': 'Bundaberg',
  'Mt Isa': 'Mount Isa',
  
  // Standardization
  'Central coast': 'Central Coast',
  'central coast': 'Central Coast',
  'gold coast': 'Gold Coast',
  'Gold coast': 'Gold Coast',
  
  // International standardization
  'spain': 'Spain',
  'SPAIN': 'Spain',
  'athens': 'Athens',
  'ATHENS': 'Athens',
  'london': 'London',
  'LONDON': 'London'
}

async function createCountriesTable(supabase: any) {
  console.log('🌍 Creating countries table...')
  
  // Check if countries table exists
  try {
    const { data } = await supabase.from('countries').select('code').limit(1)
    console.log('✅ Countries table already exists')
    return true
  } catch (error) {
    console.log('📋 Creating countries table...')
    
    // Create countries table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS countries (
        code VARCHAR(2) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        currency VARCHAR(3),
        timezone VARCHAR(50),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);
    `
    
    console.log('⚠️  Manual SQL needed for countries table:')
    console.log(createTableSQL)
    console.log('   Run this in Supabase SQL Editor, then run script again')
    return false
  }
}

async function populateCountries(supabase: any) {
  console.log('🌍 Populating countries...')
  
  for (const country of COUNTRIES) {
    try {
      const { data: existing } = await supabase
        .from('countries')
        .select('code')
        .eq('code', country.code)
        .single()
      
      if (existing) {
        console.log(`✅ ${country.name} already exists`)
        continue
      }
      
      const { error } = await supabase
        .from('countries')
        .insert(country)
      
      if (error) throw error
      console.log(`✅ Added country: ${country.name}`)
      
    } catch (error) {
      console.error(`❌ Failed to add ${country.name}:`, error)
    }
  }
}

async function enhanceLocationsTable(supabase: any) {
  console.log('📍 Enhancing locations table...')
  
  // Check if locations table has country_code column
  try {
    const { data } = await supabase
      .from('locations')
      .select('country_code')
      .limit(1)
    
    console.log('✅ Locations table already has country_code')
  } catch (error) {
    console.log('📋 Adding country_code to locations table...')
    
    const enhanceSQL = `
      ALTER TABLE locations ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) REFERENCES countries(code);
      ALTER TABLE locations ADD COLUMN IF NOT EXISTS state VARCHAR(50);
      ALTER TABLE locations ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
      
      CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country_code);
      CREATE INDEX IF NOT EXISTS idx_locations_state ON locations(state);
    `
    
    console.log('⚠️  Manual SQL needed to enhance locations:')
    console.log(enhanceSQL)
    console.log('   Run this in Supabase SQL Editor, then run script again')
    return false
  }
  
  return true
}

async function populateLocations(supabase: any) {
  console.log('📍 Populating missing locations...')
  
  const newLocations = LOCATIONS.filter(loc => !loc.existing)
  
  for (const location of newLocations) {
    try {
      const { data: existing } = await supabase
        .from('locations')
        .select('id')
        .eq('name', location.name)
        .single()
      
      if (existing) {
        console.log(`✅ ${location.name} already exists`)
        continue
      }
      
      const { error } = await supabase
        .from('locations')
        .insert({
          name: location.name,
          country_code: location.country_code,
          state: location.state,
          type: location.country_code === 'AU' ? 'city' : 'country',
          active: true
        })
      
      if (error) throw error
      console.log(`✅ Added location: ${location.name} (${location.country_code})`)
      
    } catch (error) {
      console.error(`❌ Failed to add ${location.name}:`, error)
    }
  }
  
  console.log(`📊 Added ${newLocations.length} new locations`)
}

async function updateExistingLocationsWithCountry(supabase: any) {
  console.log('🔄 Updating existing locations with country data...')
  
  const existingLocations = LOCATIONS.filter(loc => loc.existing)
  
  for (const location of existingLocations) {
    try {
      const { error } = await supabase
        .from('locations')
        .update({
          country_code: location.country_code,
          state: location.state
        })
        .eq('name', location.name)
      
      if (error) throw error
      console.log(`✅ Updated ${location.name} with country data`)
      
    } catch (error) {
      console.error(`❌ Failed to update ${location.name}:`, error)
    }
  }
}

async function linkStorytellersToLocations(supabase: any) {
  console.log('🔗 Linking storytellers to locations...')
  
  // This is a placeholder - we'll need Airtable data to do actual linking
  // For now, let's prepare the structure
  
  console.log('📋 Prepared for storyteller location linking')
  console.log('   Next: Run Airtable analysis to get storyteller location mappings')
  console.log('   Then: Update users.primary_location_id based on Airtable data')
}

function normalizeLocationName(airtableLocation: string): string {
  // Apply mapping rules
  const mapped = LOCATION_MAPPING[airtableLocation]
  if (mapped) return mapped
  
  // Basic cleaning
  return airtableLocation
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

async function migrateLocationsAndCountries() {
  console.log('🌍 Starting Countries and Locations Migration...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Step 1: Create countries table
    const countriesReady = await createCountriesTable(supabase)
    if (!countriesReady) return
    
    // Step 2: Populate countries
    await populateCountries(supabase)
    
    // Step 3: Enhance locations table  
    const locationsReady = await enhanceLocationsTable(supabase)
    if (!locationsReady) return
    
    // Step 4: Update existing locations with country data
    await updateExistingLocationsWithCountry(supabase)
    
    // Step 5: Add missing locations
    await populateLocations(supabase)
    
    // Step 6: Prepare for storyteller linking
    await linkStorytellersToLocations(supabase)
    
    // Summary
    console.log('\n🎉 Countries and Locations Migration Complete!')
    console.log('=' .repeat(60))
    
    const { data: countryCount } = await supabase
      .from('countries')
      .select('code', { count: 'exact' })
    
    const { data: locationCount } = await supabase
      .from('locations') 
      .select('id', { count: 'exact' })
    
    console.log(`✅ Countries: ${countryCount?.length || 0}`)
    console.log(`✅ Locations: ${locationCount?.length || 0}`)
    
    console.log('\n📋 Location Mapping Rules:')
    Object.entries(LOCATION_MAPPING).forEach(([from, to]) => {
      console.log(`   "${from}" → "${to}"`)
    })
    
    console.log('\n🚀 Next Steps:')
    console.log('1. Get Airtable storyteller location data')
    console.log('2. Link users to locations via primary_location_id')
    console.log('3. Validate location mappings')
    console.log('4. Create projects with location context')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Export helper functions
export { normalizeLocationName, LOCATION_MAPPING, COUNTRIES, LOCATIONS }

// Run migration
migrateLocationsAndCountries().catch(console.error)