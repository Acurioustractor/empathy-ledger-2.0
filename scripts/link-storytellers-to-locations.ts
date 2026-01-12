#!/usr/bin/env tsx

/**
 * Link Storytellers to Locations
 * 
 * Maps Airtable storyteller location data to Supabase users
 * and links them via primary_location_id
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

// Airtable API configuration
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_TABLE_NAME = 'Storytellers'

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

// Location name normalization based on our analysis
const LOCATION_MAPPING: { [key: string]: string } = {
  // Spelling corrections
  'Tennent Creek': 'Tennant Creek',
  'Bundaburg': 'Bundaberg',
  'Mt Isa': 'Mount Isa',
  
  // Case standardization
  'central coast': 'Central Coast',
  'Central coast': 'Central Coast',
  'gold coast': 'Gold Coast',
  'Gold coast': 'Gold Coast',
  'brisbane': 'Brisbane',
  'perth': 'Perth',
  'newcastle': 'Newcastle',
  'melbourne': 'Melbourne',
  'adelaide': 'Adelaide',
  'hobart': 'Hobart',
  'darwin': 'Darwin',
  'cairns': 'Cairns',
  'townsville': 'Townsville',
  
  // International standardization
  'spain': 'Spain',
  'SPAIN': 'Spain',
  'athens': 'Athens',
  'ATHENS': 'Athens',
  'london': 'London',
  'LONDON': 'London'
}

function normalizeLocationName(airtableLocation: string): string {
  if (!airtableLocation) return ''
  
  // Check mapping first
  const mapped = LOCATION_MAPPING[airtableLocation]
  if (mapped) return mapped
  
  // Basic cleaning and title case
  return airtableLocation
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function generateUserEmail(name: string): string {
  // Generate the same email pattern used in original migration
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
  
  // Add timestamp suffix (we'll need to match existing pattern)
  return `${sanitized}@empathyledger.migration`
}

interface AirtableStoryteller {
  id: string
  fields: {
    Name: string
    Location?: string
    'Location Rollup (from Media)'?: string[]
    Project?: string
    Organisation?: string
    [key: string]: any
  }
}

interface LocationLinkingResult {
  storyteller: string
  airtableLocation: string
  normalizedLocation: string
  supabaseLocationId: string | null
  userFound: boolean
  linked: boolean
  error?: string
}

async function fetchAirtableStorytellers(): Promise<AirtableStoryteller[]> {
  console.log('📥 Fetching storytellers from Airtable...')
  
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Missing Airtable credentials')
  }
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
  
  let allRecords: AirtableStoryteller[] = []
  let offset = ''
  
  do {
    const fetchUrl = offset ? `${url}?offset=${offset}` : url
    
    const response = await fetch(fetchUrl, { headers })
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    allRecords = allRecords.concat(data.records)
    offset = data.offset || ''
    
  } while (offset)
  
  console.log(`✅ Fetched ${allRecords.length} storytellers from Airtable`)
  return allRecords
}

async function getSupabaseLocationsMap(supabase: any): Promise<Map<string, string>> {
  console.log('📍 Building Supabase locations map...')
  
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, name')
  
  if (error) throw error
  
  const locationsMap = new Map<string, string>()
  locations.forEach((loc: any) => {
    locationsMap.set(loc.name, loc.id)
  })
  
  console.log(`✅ Built map of ${locationsMap.size} locations`)
  return locationsMap
}

async function linkStorytellersToLocations() {
  console.log('🔗 Starting Storyteller Location Linking...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // Step 1: Fetch Airtable storytellers
    const airtableStorytellers = await fetchAirtableStorytellers()
    
    // Step 2: Build Supabase locations map
    const locationsMap = await getSupabaseLocationsMap(supabase)
    
    // Step 3: Process each storyteller
    const results: LocationLinkingResult[] = []
    let linkedCount = 0
    let notFoundCount = 0
    let noLocationCount = 0
    
    console.log('\n🔄 Processing storytellers...')
    
    for (const storyteller of airtableStorytellers) {
      const name = storyteller.fields.Name
      if (!name) continue
      
      // Get location from Airtable (primary Location field or rollup)
      const airtableLocation = storyteller.fields.Location || 
                              storyteller.fields['Location Rollup (from Media)']?.[0]
      
      const result: LocationLinkingResult = {
        storyteller: name,
        airtableLocation: airtableLocation || '',
        normalizedLocation: '',
        supabaseLocationId: null,
        userFound: false,
        linked: false
      }
      
      // If no location data, skip but count
      if (!airtableLocation) {
        noLocationCount++
        result.error = 'No location data in Airtable'
        results.push(result)
        continue
      }
      
      // Normalize location name
      const normalizedLocation = normalizeLocationName(airtableLocation)
      result.normalizedLocation = normalizedLocation
      
      // Find location ID in Supabase
      const locationId = locationsMap.get(normalizedLocation)
      if (!locationId) {
        result.error = `Location "${normalizedLocation}" not found in Supabase`
        results.push(result)
        continue
      }
      result.supabaseLocationId = locationId
      
      // Find user in Supabase by email pattern
      const userEmail = generateUserEmail(name)
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', `%${name.split(' ')[0].toLowerCase()}%`)
        .ilike('email', '%@empathyledger.migration')
      
      if (userError) {
        result.error = `User lookup error: ${userError.message}`
        results.push(result)
        continue
      }
      
      if (!users || users.length === 0) {
        notFoundCount++
        result.error = 'User not found in Supabase'
        results.push(result)
        continue
      }
      
      // If multiple matches, try to find exact match
      let targetUser = users[0]
      if (users.length > 1) {
        const exactMatch = users.find(u => u.email.includes(name.toLowerCase().replace(/[^a-z0-9]/g, '-')))
        if (exactMatch) targetUser = exactMatch
      }
      
      result.userFound = true
      
      // Update user with location
      const { error: updateError } = await supabase
        .from('users')
        .update({ primary_location_id: locationId })
        .eq('id', targetUser.id)
      
      if (updateError) {
        result.error = `Update error: ${updateError.message}`
        results.push(result)
        continue
      }
      
      result.linked = true
      linkedCount++
      
      // Log progress every 10 records
      if (linkedCount % 10 === 0) {
        console.log(`   ✅ Linked ${linkedCount} storytellers...`)
      }
      
      results.push(result)
    }
    
    // Generate summary report
    console.log('\n' + '=' .repeat(60))
    console.log('📊 STORYTELLER LOCATION LINKING SUMMARY')
    console.log('=' .repeat(60))
    
    console.log(`✅ Successfully linked: ${linkedCount}`)
    console.log(`❌ Users not found: ${notFoundCount}`)
    console.log(`📭 No location data: ${noLocationCount}`)
    console.log(`📊 Total processed: ${results.length}`)
    
    // Show location distribution
    const locationCounts = new Map<string, number>()
    results.filter(r => r.linked).forEach(r => {
      const loc = r.normalizedLocation
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1)
    })
    
    console.log('\n📍 LOCATION DISTRIBUTION:')
    Array.from(locationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([location, count]) => {
        console.log(`   ${location}: ${count} storytellers`)
      })
    
    // Show any mapping issues
    const mappingIssues = results.filter(r => r.error?.includes('not found in Supabase'))
    if (mappingIssues.length > 0) {
      console.log('\n⚠️  LOCATION MAPPING ISSUES:')
      const uniqueIssues = [...new Set(mappingIssues.map(r => r.normalizedLocation))]
      uniqueIssues.forEach(location => {
        const count = mappingIssues.filter(r => r.normalizedLocation === location).length
        console.log(`   "${location}" (${count} storytellers) - not in Supabase`)
      })
    }
    
    console.log('\n🚀 Next Steps:')
    console.log('1. ✅ Storytellers are now linked to locations')
    console.log('2. Create organizations and projects tables')
    console.log('3. Link storytellers to projects based on Airtable data')
    console.log('4. Deploy CMS with project/location context')
    
    return results
    
  } catch (error) {
    console.error('❌ Linking failed:', error)
    throw error
  }
}

// Export helper functions for testing
export { normalizeLocationName, generateUserEmail }

// Run linking
linkStorytellersToLocations().catch(console.error)