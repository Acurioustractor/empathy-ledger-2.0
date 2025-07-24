import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!supabaseUrl || !supabaseServiceKey || !AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface UserComparison {
  airtableName: string;
  airtableLocation: string;
  airtableLocationRollup: string[];
  airtableState: string[];
  airtableProject: string;
  airtableOrganisation: string;
  supabaseEmail: string;
  supabaseLocationId: string | null;
  matched: boolean;
}

async function fetchAirtableData(tableName: string): Promise<AirtableRecord[]> {
  console.log(`📡 Fetching all records from ${tableName}...`);
  
  let allRecords: AirtableRecord[] = [];
  let offset: string | null = null;
  
  do {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}${offset ? `?offset=${offset}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset || null;
    
    console.log(`   Fetched ${data.records.length} records (total: ${allRecords.length})`);
  } while (offset);

  console.log(`✅ Total ${tableName} records fetched: ${allRecords.length}\n`);
  return allRecords;
}

function sanitizeName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

async function compareUserNames() {
  console.log('👥 AIRTABLE TO SUPABASE USER COMPARISON WITH LOCATION DATA\n');
  console.log('=' .repeat(70));

  try {
    // 1. Fetch all Airtable storytellers
    console.log('1. FETCHING AIRTABLE STORYTELLERS:');
    console.log('===================================');
    const storytellers = await fetchAirtableData('Storytellers');

    // 2. Fetch all Supabase users
    console.log('2. FETCHING SUPABASE USERS:');
    console.log('============================');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, primary_location_id')
      .eq('role', 'storyteller');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users?.length || 0} Supabase users\n`);

    // 3. Get locations for reference
    console.log('3. FETCHING LOCATION REFERENCE:');
    console.log('================================');
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*');

    if (locationsError) {
      console.log('No locations table found');
    } else {
      console.log(`Found ${locations?.length || 0} locations in Supabase`);
      locations?.forEach(loc => {
        console.log(`   ${loc.id}: ${loc.name || loc.city || 'Unknown'}`);
      });
      console.log('');
    }

    // 4. Create comparison mapping
    console.log('4. CREATING USER COMPARISON MAPPING:');
    console.log('====================================');
    
    const comparisons: UserComparison[] = [];
    
    storytellers.forEach(storyteller => {
      const name = storyteller.fields.Name;
      if (!name) return;
      
      const sanitizedName = sanitizeName(name);
      
      // Find matching Supabase user
      const matchingUser = users?.find(user => 
        user.email.includes(sanitizedName) || 
        user.email.startsWith(sanitizedName)
      );
      
      const comparison: UserComparison = {
        airtableName: name,
        airtableLocation: storyteller.fields.Location || 'Not set',
        airtableLocationRollup: storyteller.fields['Location Rollup (from Media)'] || [],
        airtableState: storyteller.fields['State (from Shifts)'] || [],
        airtableProject: storyteller.fields.Project || 'Not set',
        airtableOrganisation: storyteller.fields.Organisation || 'Not set',
        supabaseEmail: matchingUser?.email || 'Not found',
        supabaseLocationId: matchingUser?.primary_location_id || null,
        matched: !!matchingUser
      };
      
      comparisons.push(comparison);
    });

    // 5. Analysis and results
    console.log('5. COMPARISON RESULTS:');
    console.log('======================');
    
    const matchedUsers = comparisons.filter(c => c.matched);
    const unmatchedUsers = comparisons.filter(c => !c.matched);
    const usersWithAirtableLocation = comparisons.filter(c => c.airtableLocation !== 'Not set');
    const usersWithSupabaseLocation = comparisons.filter(c => c.supabaseLocationId);
    
    console.log(`Total Airtable storytellers: ${comparisons.length}`);
    console.log(`Matched with Supabase: ${matchedUsers.length}`);
    console.log(`Unmatched: ${unmatchedUsers.length}`);
    console.log(`Have Airtable location: ${usersWithAirtableLocation.length}`);
    console.log(`Have Supabase location: ${usersWithSupabaseLocation.length}\n`);
    
    // 6. Detailed comparison examples
    console.log('6. SAMPLE DETAILED COMPARISONS:');
    console.log('================================');
    
    console.log('\n📍 USERS WITH LOCATION DATA:');
    const usersWithLocations = comparisons.filter(c => 
      c.matched && (c.airtableLocation !== 'Not set' || c.airtableLocationRollup.length > 0)
    );
    
    usersWithLocations.slice(0, 15).forEach((comp, index) => {
      console.log(`\n${index + 1}. ${comp.airtableName}`);
      console.log(`   Airtable Location: ${comp.airtableLocation}`);
      console.log(`   Location Rollup: ${comp.airtableLocationRollup.join(', ') || 'None'}`);
      console.log(`   State: ${comp.airtableState.join(', ') || 'None'}`);
      console.log(`   Project: ${comp.airtableProject}`);
      console.log(`   Organisation: ${comp.airtableOrganisation}`);
      console.log(`   Supabase Email: ${comp.supabaseEmail}`);
      console.log(`   Supabase Location ID: ${comp.supabaseLocationId || 'Not set'}`);
    });

    // 7. Location mapping analysis
    console.log('\n\n7. LOCATION MAPPING ANALYSIS:');
    console.log('=============================');
    
    // Analyze which Airtable locations need mapping
    const airtableLocationCounts = new Map<string, number>();
    const airtableLocationRollupCounts = new Map<string, number>();
    
    comparisons.forEach(comp => {
      if (comp.airtableLocation !== 'Not set') {
        airtableLocationCounts.set(
          comp.airtableLocation, 
          (airtableLocationCounts.get(comp.airtableLocation) || 0) + 1
        );
      }
      
      comp.airtableLocationRollup.forEach(loc => {
        if (loc && loc !== 'null') {
          airtableLocationRollupCounts.set(
            loc, 
            (airtableLocationRollupCounts.get(loc) || 0) + 1
          );
        }
      });
    });
    
    console.log('\nAirtable Location field distribution:');
    Array.from(airtableLocationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([location, count]) => {
        console.log(`   "${location}": ${count} storytellers`);
      });
    
    console.log('\nAirtable Location Rollup distribution:');
    Array.from(airtableLocationRollupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([location, count]) => {
        console.log(`   "${location}": ${count} storytellers`);
      });

    // 8. Mapping recommendations
    console.log('\n\n📋 LOCATION MAPPING STRATEGY RECOMMENDATIONS:');
    console.log('==============================================');
    
    console.log('\n🎯 PRIMARY MAPPING APPROACH:');
    console.log('   1. Use Airtable "Location" field as primary source when available');
    console.log('   2. Fall back to "Location Rollup (from Media)" for additional context');
    console.log('   3. Use "State (from Shifts)" for state-level mapping');
    console.log('   4. Consider "Project" and "Organisation" for project-location linking');
    
    console.log('\n🗺️  REQUIRED LOCATION STANDARDIZATION:');
    const allLocations = new Set([
      ...Array.from(airtableLocationCounts.keys()),
      ...Array.from(airtableLocationRollupCounts.keys())
    ]);
    
    console.log('   Unique locations needing mapping:', allLocations.size);
    Array.from(allLocations).sort().forEach(loc => {
      console.log(`   - "${loc}"`);
    });
    
    console.log('\n🔗 MIGRATION STEPS:');
    console.log('   1. Expand locations table with missing locations');
    console.log('   2. Create location mapping lookup table');
    console.log('   3. Update user primary_location_id based on Airtable data');
    console.log('   4. Link stories and projects to appropriate locations');
    console.log('   5. Validate location consistency across linked records');
    
    return {
      totalComparisons: comparisons.length,
      matchedUsers: matchedUsers.length,
      usersWithAirtableLocation: usersWithAirtableLocation.length,
      usersWithSupabaseLocation: usersWithSupabaseLocation.length,
      locationCounts: {
        direct: airtableLocationCounts,
        rollup: airtableLocationRollupCounts
      },
      sampleComparisons: usersWithLocations.slice(0, 10)
    };

  } catch (error) {
    console.error('Error comparing user names:', error);
    throw error;
  }
}

// Run the comparison
compareUserNames()
  .then(result => {
    console.log('\n🎉 User comparison completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 User comparison failed:', error);
    process.exit(1);
  });

export { compareUserNames };