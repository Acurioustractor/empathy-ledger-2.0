#!/usr/bin/env tsx

/**
 * Analyze Remaining Migration Tasks
 * 
 * Identifies what data still needs to be migrated from Airtable to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY

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

async function fetchAirtableTable(tableName: string): Promise<any[]> {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Missing Airtable credentials')
  }
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
  
  let allRecords: any[] = []
  let offset = ''
  
  do {
    const fetchUrl = offset ? `${url}?offset=${offset}` : url
    
    const response = await fetch(fetchUrl, { headers })
    if (!response.ok) {
      throw new Error(`Airtable API error for ${tableName}: ${response.status}`)
    }
    
    const data = await response.json()
    allRecords = allRecords.concat(data.records)
    offset = data.offset || ''
    
  } while (offset)
  
  return allRecords
}

async function analyzeRemainingMigration() {
  console.log('🔍 Analyzing Remaining Migration Tasks...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // 1. Check current Supabase state
    console.log('\n📊 CURRENT SUPABASE STATE:')
    
    const { count: storiesCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
    
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: mediaCount } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
    
    const { count: quotesCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
    
    const { count: themesCount } = await supabase
      .from('themes')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Stories: ${storiesCount}`)
    console.log(`   Users: ${usersCount}`)
    console.log(`   Media: ${mediaCount}`)
    console.log(`   Quotes: ${quotesCount}`)
    console.log(`   Themes: ${themesCount}`)
    
    // 2. Check Airtable state
    console.log('\n📥 AIRTABLE STATE:')
    
    const airtableStorytellers = await fetchAirtableTable('Storytellers')
    const airtableStories = await fetchAirtableTable('Stories')
    const airtableMedia = await fetchAirtableTable('Media')
    const airtableQuotes = await fetchAirtableTable('Quotes')
    let airtableThemes: any[] = []
    
    try {
      airtableThemes = await fetchAirtableTable('Shared Themes')
    } catch (error) {
      console.log('   ⚠️  Shared Themes table access restricted, using Supabase data for comparison')
    }
    
    console.log(`   Storytellers: ${airtableStorytellers.length}`)
    console.log(`   Stories: ${airtableStories.length}`)
    console.log(`   Media: ${airtableMedia.length}`)
    console.log(`   Quotes: ${airtableQuotes.length}`)
    console.log(`   Themes: ${airtableThemes.length}`)
    
    // 3. Migration gap analysis
    console.log('\n📈 MIGRATION GAP ANALYSIS:')
    
    const gaps = {
      stories: Math.max(0, airtableStories.length - (storiesCount || 0)),
      media: Math.max(0, airtableMedia.length - (mediaCount || 0)),
      quotes: Math.max(0, airtableQuotes.length - (quotesCount || 0)),
      themes: Math.max(0, airtableThemes.length - (themesCount || 0))
    }
    
    console.log(`   Stories gap: ${gaps.stories} (${airtableStories.length} → ${storiesCount})`)
    console.log(`   Media gap: ${gaps.media} (${airtableMedia.length} → ${mediaCount})`)
    console.log(`   Quotes gap: ${gaps.quotes} (${airtableQuotes.length} → ${quotesCount})`)
    console.log(`   Themes gap: ${gaps.themes} (${airtableThemes.length} → ${themesCount})`)
    
    // 4. Detailed analysis of missing data
    console.log('\n🔍 DETAILED ANALYSIS:')
    
    // Check media files
    if (gaps.media > 0) {
      console.log('\n📎 MEDIA FILES ANALYSIS:')
      const mediaWithFiles = airtableMedia.filter(m => 
        m.fields.File && Array.isArray(m.fields.File) && m.fields.File.length > 0
      )
      console.log(`   Media records with files: ${mediaWithFiles.length}`)
      
      const mediaTypes = {}
      mediaWithFiles.forEach(m => {
        if (m.fields.File && m.fields.File[0]) {
          const type = m.fields.File[0].type || 'unknown'
          mediaTypes[type] = (mediaTypes[type] || 0) + 1
        }
      })
      
      console.log('   Media types:')
      Object.entries(mediaTypes).forEach(([type, count]) => {
        console.log(`     ${type}: ${count}`)
      })
    }
    
    // Check quotes
    if (gaps.quotes > 0) {
      console.log('\n💬 QUOTES ANALYSIS:')
      const quotesWithContent = airtableQuotes.filter(q => q.fields.Quote)
      console.log(`   Quotes with content: ${quotesWithContent.length}`)
      
      const quoteSources = {}
      airtableQuotes.forEach(q => {
        const source = q.fields.Source || 'No source'
        quoteSources[source] = (quoteSources[source] || 0) + 1
      })
      
      console.log('   Quote sources:')
      Object.entries(quoteSources).slice(0, 5).forEach(([source, count]) => {
        console.log(`     ${source}: ${count}`)
      })
    }
    
    // Check themes
    if (gaps.themes > 0) {
      console.log('\n🏷️ THEMES ANALYSIS:')
      const themesWithNames = airtableThemes.filter(t => t.fields.Name)
      console.log(`   Themes with names: ${themesWithNames.length}`)
      
      const topThemes = airtableThemes
        .filter(t => t.fields.Name)
        .map(t => ({ name: t.fields.Name, usage: t.fields['Total Usage'] || 0 }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10)
      
      console.log('   Top 10 themes:')
      topThemes.forEach(theme => {
        console.log(`     ${theme.name}: ${theme.usage} uses`)
      })
    }
    
    // 5. Generate migration priority
    console.log('\n🎯 MIGRATION PRIORITIES:')
    
    const priorities = []
    
    if (gaps.media > 0) {
      priorities.push(`🔥 HIGH: Migrate ${gaps.media} media files (essential for story display)`)
    }
    
    if (gaps.quotes > 0) {
      priorities.push(`🔥 HIGH: Migrate ${gaps.quotes} quotes (key storyteller content)`)
    }
    
    if (gaps.themes > 0) {
      priorities.push(`🔶 MEDIUM: Migrate ${gaps.themes} themes (categorization system)`)
    }
    
    if (gaps.stories > 0) {
      priorities.push(`🔥 CRITICAL: Migrate ${gaps.stories} missing stories`)
    }
    
    priorities.forEach(priority => console.log(`   ${priority}`))
    
    // 6. Recommended next steps
    console.log('\n🚀 RECOMMENDED NEXT STEPS:')
    console.log('1. Migrate media files with proper Supabase storage integration')
    console.log('2. Migrate quotes and link to storytellers')
    console.log('3. Complete themes migration and story-theme linking')
    console.log('4. Update API endpoints to use Supabase exclusively')
    console.log('5. Update frontend components to use new data sources')
    console.log('6. Run final validation and disable Airtable access')
    
    return {
      supabaseState: { storiesCount, usersCount, mediaCount, quotesCount, themesCount },
      airtableState: {
        storytellers: airtableStorytellers.length,
        stories: airtableStories.length,
        media: airtableMedia.length,
        quotes: airtableQuotes.length,
        themes: airtableThemes.length
      },
      gaps,
      priorities
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error)
    throw error
  }
}

// Run analysis
analyzeRemainingMigration().catch(console.error)