import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable API credentials');
}

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

async function fetchAllAirtableData(tableName: string): Promise<AirtableRecord[]> {
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

  return allRecords;
}

function analyzeLocationData(storytellers: AirtableRecord[]) {
  console.log('\n🗺️  LOCATION-BASED PROJECT ANALYSIS\n');
  console.log('=' .repeat(60));

  const locationCounts = new Map<string, number>();
  const stateCounts = new Map<string, number>();
  const projectOrgCombos = new Map<string, number>();
  const roleDistribution = new Map<string, number>();
  
  // Track records with missing location data
  let missingLocationCount = 0;
  let missingProjectCount = 0;

  storytellers.forEach(record => {
    const fields = record.fields;
    
    // Analyze location data
    const location = fields.Location || fields['Location Rollup (from Media)']?.[0];
    const state = fields['State (from Shifts)']?.[0];
    const project = fields.Project;
    const organisation = fields.Organisation;
    const role = fields.Role;

    if (location) {
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    } else {
      missingLocationCount++;
    }

    if (state) {
      stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
    }

    if (!project) {
      missingProjectCount++;
    }

    if (role) {
      roleDistribution.set(role, (roleDistribution.get(role) || 0) + 1);
    }

    // Track project-organization combinations
    const combo = `${project || 'No Project'} - ${organisation || 'No Org'}`;
    projectOrgCombos.set(combo, (projectOrgCombos.get(combo) || 0) + 1);
  });

  // Display results
  console.log('📊 LOCATION DISTRIBUTION:');
  const sortedLocations = Array.from(locationCounts.entries())
    .sort((a, b) => b[1] - a[1]);
  
  sortedLocations.forEach(([location, count], index) => {
    console.log(`   ${index + 1}. ${location}: ${count} storytellers`);
  });

  if (missingLocationCount > 0) {
    console.log(`   ⚠️  Missing location data: ${missingLocationCount} records`);
  }

  console.log('\n🏛️  STATE DISTRIBUTION:');
  const sortedStates = Array.from(stateCounts.entries())
    .sort((a, b) => b[1] - a[1]);
  
  sortedStates.forEach(([state, count], index) => {
    console.log(`   ${index + 1}. ${state}: ${count} storytellers`);
  });

  console.log('\n🏢 PROJECT-ORGANIZATION COMBINATIONS:');
  const sortedCombos = Array.from(projectOrgCombos.entries())
    .sort((a, b) => b[1] - a[1]);
  
  sortedCombos.forEach(([combo, count], index) => {
    console.log(`   ${index + 1}. ${combo}: ${count} storytellers`);
  });

  console.log('\n👥 ROLE DISTRIBUTION:');
  const sortedRoles = Array.from(roleDistribution.entries())
    .sort((a, b) => b[1] - a[1]);
  
  sortedRoles.forEach(([role, count], index) => {
    console.log(`   ${index + 1}. ${role || 'No Role'}: ${count} storytellers`);
  });

  // Generate proposed project structure
  console.log('\n🏗️  PROPOSED PROJECT STRUCTURE FOR SUPABASE:');
  console.log('=' .repeat(60));

  console.log('\n📋 Organizations Table:');
  console.log('   1. Orange Sky (id: 1, type: nonprofit, description: "Community laundry and conversation service")');

  console.log('\n📋 Projects Table (Location-based):');
  sortedLocations.forEach(([location, count], index) => {
    const projectName = `Orange Sky ${location}`;
    console.log(`   ${index + 1}. ${projectName} (organization_id: 1, location: "${location}", storytellers: ${count})`);
  });

  // Generate SQL for migration
  console.log('\n💾 MIGRATION SQL PREVIEW:');
  console.log('-- Organizations');
  console.log(`INSERT INTO organizations (id, name, type, description) VALUES`);
  console.log(`  (1, 'Orange Sky', 'nonprofit', 'Community laundry and conversation service for people experiencing homelessness');`);
  
  console.log('\n-- Projects');
  console.log(`INSERT INTO projects (name, organization_id, location, description) VALUES`);
  sortedLocations.forEach(([location, count], index) => {
    const projectName = `Orange Sky ${location}`;
    const comma = index < sortedLocations.length - 1 ? ',' : ';';
    console.log(`  ('${projectName}', 1, '${location}', 'Orange Sky services in ${location}')${comma}`);
  });

  return {
    locationCounts,
    stateCounts,
    projectOrgCombos,
    roleDistribution,
    missingLocationCount,
    missingProjectCount,
    totalRecords: storytellers.length
  };
}

async function analyzeLocationsForProjects() {
  console.log('🗺️  AIRTABLE LOCATION ANALYSIS FOR PROJECT STRUCTURE\n');
  console.log('=' .repeat(60));

  try {
    // Fetch storytellers data
    const storytellers = await fetchAllAirtableData('Storytellers');
    
    // Analyze location-based project structure
    const analysis = analyzeLocationData(storytellers);

    console.log('\n📈 SUMMARY STATISTICS:');
    console.log(`   Total storytellers: ${analysis.totalRecords}`);
    console.log(`   Unique locations: ${analysis.locationCounts.size}`);
    console.log(`   Unique states: ${analysis.stateCounts.size}`);
    console.log(`   Missing location data: ${analysis.missingLocationCount}`);
    console.log(`   Missing project data: ${analysis.missingProjectCount}`);

    console.log('\n🎯 MIGRATION RECOMMENDATIONS:');
    console.log('   1. Create 1 organization (Orange Sky)');
    console.log(`   2. Create ${analysis.locationCounts.size} location-based projects`);
    console.log('   3. Map storytellers to projects based on location');
    console.log('   4. Handle missing location data with default "Orange Sky General" project');

    return analysis;

  } catch (error) {
    console.error('💥 Analysis failed:', error);
    throw error;
  }
}

// Run the analysis
analyzeLocationsForProjects()
  .then(result => {
    console.log('\n🎉 Location analysis completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });

export { analyzeLocationsForProjects };