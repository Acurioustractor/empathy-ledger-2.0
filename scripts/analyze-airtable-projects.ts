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

interface ProjectAnalysis {
  totalStorytellers: number;
  uniqueProjects: Set<string>;
  projectCounts: Map<string, number>;
  organizationPatterns: Map<string, number>;
  sampleData: AirtableRecord[];
  fieldAnalysis: Record<string, any>;
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

  console.log(`✅ Total ${tableName} records fetched: ${allRecords.length}\n`);
  return allRecords;
}

function analyzeProjectData(storytellers: AirtableRecord[]): ProjectAnalysis {
  const analysis: ProjectAnalysis = {
    totalStorytellers: storytellers.length,
    uniqueProjects: new Set(),
    projectCounts: new Map(),
    organizationPatterns: new Map(),
    sampleData: storytellers.slice(0, 10), // First 10 records for detailed analysis
    fieldAnalysis: {}
  };

  // Analyze all field names to understand the data structure
  const allFields = new Set<string>();
  storytellers.forEach(record => {
    Object.keys(record.fields).forEach(field => allFields.add(field));
  });

  analysis.fieldAnalysis.allFieldNames = Array.from(allFields).sort();

  // Analyze project-related fields
  storytellers.forEach(record => {
    const fields = record.fields;
    
    // Look for project-related field names (case insensitive)
    const projectFields = Object.keys(fields).filter(field => 
      field.toLowerCase().includes('project') || 
      field.toLowerCase().includes('organization') ||
      field.toLowerCase().includes('org') ||
      field.toLowerCase().includes('company') ||
      field.toLowerCase().includes('initiative') ||
      field.toLowerCase().includes('program')
    );

    projectFields.forEach(fieldName => {
      const value = fields[fieldName];
      if (value) {
        // Handle both string and array values
        const projectValues = Array.isArray(value) ? value : [value];
        
        projectValues.forEach(projectValue => {
          if (typeof projectValue === 'string') {
            analysis.uniqueProjects.add(projectValue);
            analysis.projectCounts.set(
              projectValue, 
              (analysis.projectCounts.get(projectValue) || 0) + 1
            );

            // Analyze for organization patterns
            analyzeOrganizationPatterns(projectValue, analysis.organizationPatterns);
          }
        });
      }
    });
  });

  return analysis;
}

function analyzeOrganizationPatterns(projectValue: string, orgPatterns: Map<string, number>) {
  // Look for organization indicators in project names
  const patterns = [
    // Common organization types
    /\b(inc|incorporated|corp|corporation|llc|ltd|limited|foundation|institute|university|college|school|nonprofit|non-profit|ngo)\b/gi,
    // Government entities
    /\b(city|county|state|federal|government|gov|dept|department|agency|bureau)\b/gi,
    // Healthcare
    /\b(hospital|clinic|medical|health|healthcare|center|centre)\b/gi,
    // Community orgs
    /\b(community|coalition|alliance|network|association|society|group|collaborative|collective)\b/gi
  ];

  patterns.forEach((pattern, index) => {
    const matches = projectValue.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const key = `org_type_${match.toLowerCase()}`;
        orgPatterns.set(key, (orgPatterns.get(key) || 0) + 1);
      });
    }
  });

  // Look for potential organization names (capitalized words that might be org names)
  const words = projectValue.split(/[\s,\-_]+/);
  words.forEach(word => {
    if (word.length > 2 && /^[A-Z]/.test(word)) {
      const key = `potential_org_${word}`;
      orgPatterns.set(key, (orgPatterns.get(key) || 0) + 1);
    }
  });
}

function generateProjectMigrationStrategy(analysis: ProjectAnalysis) {
  console.log('🎯 PROJECT MIGRATION STRATEGY RECOMMENDATIONS\n');
  console.log('=' .repeat(60));

  const sortedProjects = Array.from(analysis.projectCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  console.log('\n📊 PROJECT DISTRIBUTION ANALYSIS:');
  console.log(`   Total unique projects: ${analysis.uniqueProjects.size}`);
  console.log(`   Total storytellers: ${analysis.totalStorytellers}`);
  console.log(`   Average storytellers per project: ${(analysis.totalStorytellers / analysis.uniqueProjects.size).toFixed(2)}`);

  console.log('\n🏆 TOP 10 PROJECTS BY STORYTELLER COUNT:');
  sortedProjects.slice(0, 10).forEach(([project, count], index) => {
    console.log(`   ${index + 1}. "${project}" - ${count} storytellers`);
  });

  console.log('\n🏢 ORGANIZATION PATTERN ANALYSIS:');
  const sortedOrgPatterns = Array.from(analysis.organizationPatterns.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  sortedOrgPatterns.forEach(([pattern, count]) => {
    if (pattern.startsWith('org_type_')) {
      console.log(`   ${pattern.replace('org_type_', '').toUpperCase()}: ${count} occurrences`);
    }
  });

  console.log('\n🏗️ MIGRATION STRATEGY RECOMMENDATIONS:');
  
  if (analysis.uniqueProjects.size < 50) {
    console.log('   ✅ SIMPLE MIGRATION: Direct project mapping');
    console.log('      - Create one Organization per unique project name');
    console.log('      - Each Organization gets one default Project');
    console.log('      - Map storytellers directly to these projects');
  } else if (analysis.uniqueProjects.size < 200) {
    console.log('   ⚠️  MEDIUM COMPLEXITY: Group similar projects');
    console.log('      - Analyze project names for organization groupings');
    console.log('      - Create Organizations for apparent parent entities');
    console.log('      - Group related projects under Organizations');
  } else {
    console.log('   🚨 COMPLEX MIGRATION: Manual review required');
    console.log('      - Too many unique projects for automated grouping');
    console.log('      - Recommend manual review and categorization');
    console.log('      - Consider hierarchical organization structure');
  }

  console.log('\n📋 RECOMMENDED MIGRATION STEPS:');
  console.log('   1. Review top projects for organization groupings');
  console.log('   2. Create Organizations table with these entities');
  console.log('   3. Create Projects table linked to Organizations');
  console.log('   4. Map existing storytellers to appropriate Projects');
  console.log('   5. Handle edge cases and unmatched projects');

  return sortedProjects;
}

async function analyzeAirtableProjects() {
  console.log('🔍 AIRTABLE PROJECT STRUCTURE ANALYSIS\n');
  console.log('=' .repeat(60));

  try {
    // 1. Fetch storytellers data
    const storytellers = await fetchAllAirtableData('Storytellers');
    
    // 2. Analyze project structure
    console.log('📈 ANALYZING PROJECT DATA STRUCTURE...\n');
    const analysis = analyzeProjectData(storytellers);

    // 3. Display field analysis
    console.log('📋 FIELD STRUCTURE ANALYSIS:');
    console.log('   Available fields in Storytellers table:');
    analysis.fieldAnalysis.allFieldNames.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field}`);
    });

    // 4. Display sample data for manual inspection
    console.log('\n🔍 SAMPLE STORYTELLER RECORDS (First 5):');
    analysis.sampleData.slice(0, 5).forEach((record, index) => {
      console.log(`\n   Record ${index + 1}:`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Fields:`, JSON.stringify(record.fields, null, 4));
    });

    // 5. Generate migration strategy
    const sortedProjects = generateProjectMigrationStrategy(analysis);

    // 6. Export detailed project list for review
    console.log('\n📄 DETAILED PROJECT LIST FOR REVIEW:');
    console.log('   (Sorted by storyteller count - showing all projects)\n');
    
    sortedProjects.forEach(([project, count], index) => {
      console.log(`   ${index + 1}. "${project}" (${count} storytellers)`);
    });

    // 7. Summary and next steps
    console.log('\n🎯 SUMMARY AND NEXT STEPS:');
    console.log(`   ✅ Analyzed ${analysis.totalStorytellers} storytellers`);
    console.log(`   ✅ Found ${analysis.uniqueProjects.size} unique projects`);
    console.log(`   ✅ Identified organization patterns`);
    console.log(`   ✅ Generated migration strategy recommendations`);
    
    console.log('\n📋 RECOMMENDED NEXT ACTIONS:');
    console.log('   1. Review the project list above for grouping opportunities');
    console.log('   2. Identify which projects belong to the same organization');
    console.log('   3. Create Organizations and Projects schema in Supabase');
    console.log('   4. Run migration script to create the new structure');
    console.log('   5. Update storyteller records with new project associations');

    return {
      analysis,
      sortedProjects,
      recommendations: {
        totalProjects: analysis.uniqueProjects.size,
        complexity: analysis.uniqueProjects.size < 50 ? 'simple' : 
                   analysis.uniqueProjects.size < 200 ? 'medium' : 'complex',
        migrationApproach: analysis.uniqueProjects.size < 50 ? 'direct' : 'grouped'
      }
    };

  } catch (error) {
    console.error('💥 Analysis failed:', error);
    throw error;
  }
}

// Run the analysis
analyzeAirtableProjects()
  .then(result => {
    console.log('\n🎉 Analysis completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });

export { analyzeAirtableProjects };