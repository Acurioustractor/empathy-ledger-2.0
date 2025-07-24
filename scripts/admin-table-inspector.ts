#!/usr/bin/env tsx

/**
 * Admin Table Inspector
 * 
 * Comprehensive tool to inspect all tables with admin access
 * This gives us full visibility into the database structure and content
 */

import { getAdminClient, adminQuery, adminGetAllTables } from './create-admin-access'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

interface TableInspectionResult {
  name: string
  accessible: boolean
  recordCount: number
  sampleRecord?: any
  schema?: any[]
  error?: string
}

async function inspectAllTables() {
  console.log('🔍 Admin Table Inspector - Full Database Analysis')
  console.log('=' .repeat(70))
  
  try {
    const supabase = await getAdminClient()
    console.log('✅ Admin client connected')
    
    // Get all tables
    const { data: tables } = await adminGetAllTables()
    if (!tables) {
      throw new Error('Could not retrieve table list')
    }
    
    console.log(`\n📊 Found ${tables.length} tables to inspect`)
    
    const results: TableInspectionResult[] = []
    
    for (const table of tables) {
      console.log(`\n🔍 Inspecting: ${table.table_name}`)
      console.log('-'.repeat(40))
      
      const result: TableInspectionResult = {
        name: table.table_name,
        accessible: false,
        recordCount: 0
      }
      
      try {
        // Get record count and sample
        const { data, error, count } = await supabase
          .from(table.table_name)
          .select('*', { count: 'exact' })
          .limit(1)
        
        if (error) {
          result.error = error.message
          console.log(`   ❌ Error: ${error.message}`)
        } else {
          result.accessible = true
          result.recordCount = count || 0
          result.sampleRecord = data?.[0]
          
          console.log(`   ✅ Accessible: ${count} records`)
          
          if (data?.[0]) {
            console.log(`   📋 Sample fields: ${Object.keys(data[0]).join(', ')}`)
          }
        }
        
        // Get schema information
        try {
          const { data: schemaData } = await supabase.rpc('admin_get_table_schema', {
            table_name: table.table_name
          })
          result.schema = schemaData
        } catch (schemaError) {
          // Schema info not critical
        }
        
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error'
        console.log(`   ❌ Exception: ${result.error}`)
      }
      
      results.push(result)
    }
    
    // Generate summary report
    generateSummaryReport(results)
    
    // Generate detailed report for key tables
    await generateDetailedReport(supabase, results)
    
    return results
    
  } catch (error) {
    console.error('❌ Admin inspection failed:', error)
    throw error
  }
}

function generateSummaryReport(results: TableInspectionResult[]) {
  console.log('\n' + '='.repeat(70))
  console.log('📊 DATABASE SUMMARY REPORT')
  console.log('='.repeat(70))
  
  const accessible = results.filter(r => r.accessible)
  const inaccessible = results.filter(r => !r.accessible)
  const withData = accessible.filter(r => r.recordCount > 0)
  const empty = accessible.filter(r => r.recordCount === 0)
  
  console.log(`📋 Total Tables: ${results.length}`)
  console.log(`✅ Accessible: ${accessible.length}`)
  console.log(`❌ Inaccessible: ${inaccessible.length}`)
  console.log(`📊 With Data: ${withData.length}`)
  console.log(`📭 Empty: ${empty.length}`)
  
  console.log('\n📊 TABLES WITH DATA:')
  withData
    .sort((a, b) => b.recordCount - a.recordCount)
    .forEach(table => {
      console.log(`   ${table.name}: ${table.recordCount} records`)
    })
  
  if (inaccessible.length > 0) {
    console.log('\n❌ INACCESSIBLE TABLES:')
    inaccessible.forEach(table => {
      console.log(`   ${table.name}: ${table.error}`)
    })
  }
  
  if (empty.length > 0) {
    console.log('\n📭 EMPTY TABLES:')
    empty.forEach(table => {
      console.log(`   ${table.name}`)
    })
  }
}

async function generateDetailedReport(supabase: any, results: TableInspectionResult[]) {
  console.log('\n' + '='.repeat(70))
  console.log('🔍 DETAILED TABLE ANALYSIS')
  console.log('='.repeat(70))
  
  // Focus on key tables for our migration
  const keyTables = [
    'users', 'profiles', 'stories', 'media', 'communities',
    'project_members', 'project_analytics', 'themes', 'quotes'
  ]
  
  for (const tableName of keyTables) {
    const result = results.find(r => r.name === tableName)
    if (!result || !result.accessible) {
      console.log(`\n❌ ${tableName}: Not accessible`)
      continue
    }
    
    console.log(`\n📋 ${tableName.toUpperCase()} - Detailed Analysis`)
    console.log('-'.repeat(50))
    console.log(`Records: ${result.recordCount}`)
    
    if (result.sampleRecord) {
      console.log('Sample Record Structure:')
      const fields = Object.keys(result.sampleRecord)
      fields.forEach(field => {
        const value = result.sampleRecord[field]
        const type = typeof value
        const preview = type === 'object' && value !== null 
          ? JSON.stringify(value).substring(0, 50) + '...'
          : String(value).substring(0, 50)
        console.log(`   ${field}: ${type} = ${preview}`)
      })
    }
    
    // Get additional samples for important tables
    if (['stories', 'profiles', 'project_members'].includes(tableName) && result.recordCount > 0) {
      try {
        const { data: samples } = await supabase
          .from(tableName)
          .select('*')
          .limit(3)
        
        if (samples && samples.length > 1) {
          console.log(`\nMultiple Records Preview (${samples.length} samples):`)
          samples.forEach((record: any, index: number) => {
            const key = record.id || record.name || record.email || 'Record ' + (index + 1)
            console.log(`   ${index + 1}. ${key}`)
          })
        }
      } catch (error) {
        console.log('   Could not get additional samples')
      }
    }
  }
}

// Specific analysis functions
export async function analyzeProjectStructure() {
  console.log('\n🏗️  PROJECT STRUCTURE ANALYSIS')
  console.log('=' .repeat(50))
  
  const supabase = await getAdminClient()
  
  // Check if project_members reveals project structure
  try {
    const { data: projectMembers } = await supabase
      .from('project_members')
      .select('*')
      .limit(10)
    
    if (projectMembers && projectMembers.length > 0) {
      console.log('📊 Project Members Sample:')
      projectMembers.forEach((member: any, index: number) => {
        console.log(`   ${index + 1}. User: ${member.user_id}, Project: ${member.project_id || 'N/A'}`)
      })
      
      // Look for project patterns
      const projectIds = [...new Set(projectMembers.map((m: any) => m.project_id).filter(Boolean))]
      console.log(`\n📋 Found ${projectIds.length} unique project references`)
      
    } else {
      console.log('📭 No project members found')
    }
  } catch (error) {
    console.log('❌ Could not analyze project structure')
  }
}

export async function analyzeStoriesStructure() {
  console.log('\n📖 STORIES STRUCTURE ANALYSIS')
  console.log('=' .repeat(50))
  
  const supabase = await getAdminClient()
  
  try {
    const { data: stories, count } = await supabase
      .from('stories')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log(`📊 Total Stories: ${count}`)
    
    if (stories && stories.length > 0) {
      console.log('\n📋 Sample Stories:')
      stories.forEach((story: any, index: number) => {
        console.log(`   ${index + 1}. ${story.title || story.id}`)
        if (story.storyteller_id) {
          console.log(`      Storyteller: ${story.storyteller_id}`)
        }
        if (story.project_id) {
          console.log(`      Project: ${story.project_id}`)
        }
      })
      
      // Analyze project connections
      const storiesWithProjects = stories.filter((s: any) => s.project_id)
      console.log(`\n📊 Stories with project_id: ${storiesWithProjects.length}/${stories.length}`)
    }
  } catch (error) {
    console.log('❌ Could not analyze stories structure')
  }
}

// Run full inspection if called directly
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  inspectAllTables()
    .then(() => analyzeProjectStructure())
    .then(() => analyzeStoriesStructure())
    .catch(console.error)
}

export { inspectAllTables }