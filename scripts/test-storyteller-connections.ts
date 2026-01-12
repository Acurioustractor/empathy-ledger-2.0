#!/usr/bin/env npx tsx

/**
 * Storyteller Database Connection Testing Script
 * 
 * This script tests all database relationships for storytellers to ensure
 * the CMS system is properly connected and data flows correctly.
 * 
 * Usage: npx tsx scripts/test-storyteller-connections.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '../src/lib/supabase-client';

interface ConnectionTestResult {
  storytellerId: string;
  storytellerName: string;
  stories: number;
  media: number;
  quotes: number;
  themes: string[];
  projects: string[];
  location: string;
  errors: string[];
}

async function testStorytellerConnections(): Promise<ConnectionTestResult[]> {
  console.log('🔍 Starting Storyteller Database Connection Tests...\n');
  console.log('=' .repeat(80));
  
  const supabase = await createClient();
  if (!supabase) {
    console.error('❌ Failed to initialize Supabase client');
    process.exit(1);
  }
  
  const results: ConnectionTestResult[] = [];
  
  try {
    // Get storytellers for testing
    console.log('📋 Fetching storytellers...');
    const { data: storytellers, error: storytellersError } = await supabase
      .from('users')
      .select('id, full_name, preferred_name, role, created_at')
      .eq('role', 'storyteller')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (storytellersError) {
      console.error('❌ Error fetching storytellers:', storytellersError);
      return results;
    }
    
    if (!storytellers || storytellers.length === 0) {
      console.log('⚠️  No storytellers found in database');
      console.log('💡 Try running: npm run seed:storytellers');
      return results;
    }
    
    console.log(`✅ Found ${storytellers.length} storytellers to test\n`);
    
    // Test each storyteller's connections
    for (let i = 0; i < storytellers.length; i++) {
      const storyteller = storytellers[i];
      const displayName = storyteller.preferred_name || storyteller.full_name || 'Unnamed Storyteller';
      
      console.log(`\n[${i + 1}/${storytellers.length}] 👤 Testing: ${displayName}`);
      console.log(`    ID: ${storyteller.id}`);
      console.log('─'.repeat(60));
      
      const result: ConnectionTestResult = {
        storytellerId: storyteller.id,
        storytellerName: displayName,
        stories: 0,
        media: 0,
        quotes: 0,
        themes: [],
        projects: [],
        location: '',
        errors: []
      };
      
      // Test 1: Stories Connection
      try {
        console.log('  📚 Testing stories connection...');
        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select('id, title, status, privacy_level, created_at, linked_themes')
          .eq('storyteller_id', storyteller.id);
          
        if (storiesError) {
          result.errors.push(`Stories query error: ${storiesError.message}`);
          console.log(`    ❌ ${storiesError.message}`);
        } else {
          result.stories = stories?.length || 0;
          console.log(`    ✅ ${result.stories} stories found`);
          
          // Show sample stories
          if (stories && stories.length > 0) {
            stories.slice(0, 3).forEach(story => {
              console.log(`      - "${story.title || 'Untitled'}" (${story.status}, ${story.privacy_level})`);
            });
            if (stories.length > 3) {
              console.log(`      ... and ${stories.length - 3} more`);
            }
            
            // Extract themes from stories
            const allThemes = stories.flatMap(story => story.linked_themes || []);
            result.themes = [...new Set(allThemes)];
          }
        }
      } catch (error) {
        result.errors.push(`Stories connection failed: ${error}`);
        console.log(`    ❌ Connection failed: ${error}`);
      }
      
      // Test 2: Media Content Connection
      try {
        console.log('  🖼️  Testing media connection...');
        const { data: media, error: mediaError } = await supabase
          .from('media_content')
          .select('id, title, type, media_url, file_size')
          .eq('storyteller_id', storyteller.id);
          
        if (mediaError) {
          result.errors.push(`Media query error: ${mediaError.message}`);
          console.log(`    ❌ ${mediaError.message}`);
        } else {
          result.media = media?.length || 0;
          console.log(`    ✅ ${result.media} media items found`);
          
          if (media && media.length > 0) {
            media.slice(0, 2).forEach(item => {
              const sizeStr = item.file_size ? ` (${Math.round(item.file_size / 1024)}KB)` : '';
              console.log(`      - "${item.title || 'Untitled'}" ${item.type}${sizeStr}`);
            });
          }
        }
      } catch (error) {
        result.errors.push(`Media connection failed: ${error}`);
        console.log(`    ❌ Connection failed: ${error}`);
      }
      
      // Test 3: Quotes Connection (via stories)
      try {
        console.log('  💬 Testing quotes connection...');
        const { data: quotes, error: quotesError } = await supabase
          .from('story_quotes')
          .select(`
            id, quote_text, themes, impact_score,
            stories!inner(storyteller_id, title)
          `)
          .eq('stories.storyteller_id', storyteller.id);
          
        if (quotesError) {
          result.errors.push(`Quotes query error: ${quotesError.message}`);
          console.log(`    ❌ ${quotesError.message}`);
        } else {
          result.quotes = quotes?.length || 0;
          console.log(`    ✅ ${result.quotes} quotes found`);
          
          if (quotes && quotes.length > 0) {
            quotes.slice(0, 2).forEach(quote => {
              const preview = quote.quote_text.length > 60 
                ? quote.quote_text.substring(0, 60) + '...'
                : quote.quote_text;
              console.log(`      - "${preview}"`);
            });
          }
        }
      } catch (error) {
        result.errors.push(`Quotes connection failed: ${error}`);
        console.log(`    ❌ Connection failed: ${error}`);
      }
      
      // Test 4: Project Connections
      try {
        console.log('  🚀 Testing project connections...');
        const { data: projectLinks, error: projectError } = await supabase
          .from('story_project_links')
          .select(`
            relevance_score,
            projects!inner(name, description),
            stories!inner(storyteller_id)
          `)
          .eq('stories.storyteller_id', storyteller.id);
          
        if (projectError) {
          result.errors.push(`Projects query error: ${projectError.message}`);
          console.log(`    ❌ ${projectError.message}`);
        } else {
          const uniqueProjects = [...new Set(projectLinks?.map(p => (p as any).projects?.name).filter(Boolean) || [])];
          result.projects = uniqueProjects;
          console.log(`    ✅ ${uniqueProjects.length} projects connected`);
          
          if (uniqueProjects.length > 0) {
            console.log(`      - ${uniqueProjects.join(', ')}`);
          }
        }
      } catch (error) {
        result.errors.push(`Projects connection failed: ${error}`);
        console.log(`    ❌ Connection failed: ${error}`);
      }
      
      // Test 5: Location Data
      try {
        console.log('  📍 Testing location data...');
        const { data: userDetail, error: locationError } = await supabase
          .from('users')
          .select(`
            location,
            primary_location_id,
            locations(name, country)
          `)
          .eq('id', storyteller.id)
          .single();
          
        if (locationError) {
          result.errors.push(`Location query error: ${locationError.message}`);
          console.log(`    ❌ ${locationError.message}`);
        } else {
          result.location = userDetail?.location || 'Not specified';
          console.log(`    ✅ Location: ${result.location}`);
          
          if (userDetail?.locations) {
            const locationData = userDetail.locations as any;
            console.log(`      - Structured: ${locationData?.name}, ${locationData?.country}`);
          }
        }
      } catch (error) {
        result.errors.push(`Location connection failed: ${error}`);
        console.log(`    ❌ Connection failed: ${error}`);
      }
      
      // Test 6: Profile Completeness
      try {
        console.log('  👤 Testing profile completeness...');
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select(`
            bio, profile_image_url, expertise_areas, cultural_background,
            languages_spoken, core_values, sharing_motivations
          `)
          .eq('id', storyteller.id)
          .single();
          
        if (profileError) {
          result.errors.push(`Profile query error: ${profileError.message}`);
          console.log(`    ❌ ${profileError.message}`);
        } else {
          const completenessFields = {
            bio: !!profile.bio,
            image: !!profile.profile_image_url,
            expertise: !!(profile.expertise_areas && profile.expertise_areas.length > 0),
            culture: !!(profile.cultural_background && profile.cultural_background.length > 0),
            languages: !!(profile.languages_spoken && profile.languages_spoken.length > 0)
          };
          
          const completeness = Object.values(completenessFields).filter(Boolean).length;
          const total = Object.keys(completenessFields).length;
          
          console.log(`    ✅ Profile ${Math.round((completeness / total) * 100)}% complete (${completeness}/${total} fields)`);
        }
      } catch (error) {
        result.errors.push(`Profile completeness check failed: ${error}`);
        console.log(`    ❌ Check failed: ${error}`);
      }
      
      results.push(result);
      
      // Summary for this storyteller
      console.log('  📊 Summary:');
      console.log(`    Stories: ${result.stories}, Media: ${result.media}, Quotes: ${result.quotes}`);
      console.log(`    Themes: ${result.themes.length}, Projects: ${result.projects.length}`);
      if (result.errors.length > 0) {
        console.log(`    ⚠️  ${result.errors.length} errors encountered`);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
  }
  
  return results;
}

async function generateSummaryReport(results: ConnectionTestResult[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 STORYTELLER CONNECTION TEST SUMMARY');
  console.log('=' .repeat(80));
  
  if (results.length === 0) {
    console.log('⚠️  No results to summarize');
    return;
  }
  
  const totalStorytellers = results.length;
  const totalStories = results.reduce((sum, r) => sum + r.stories, 0);
  const totalMedia = results.reduce((sum, r) => sum + r.media, 0);
  const totalQuotes = results.reduce((sum, r) => sum + r.quotes, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  
  console.log(`\n📈 Overall Statistics:`);
  console.log(`  Storytellers Tested: ${totalStorytellers}`);
  console.log(`  Total Stories: ${totalStories} (avg: ${(totalStories / totalStorytellers).toFixed(1)} per storyteller)`);
  console.log(`  Total Media Items: ${totalMedia} (avg: ${(totalMedia / totalStorytellers).toFixed(1)} per storyteller)`);
  console.log(`  Total Quotes: ${totalQuotes} (avg: ${(totalQuotes / totalStorytellers).toFixed(1)} per storyteller)`);
  console.log(`  Total Errors: ${totalErrors}`);
  
  // Top storytellers by content
  const topByStories = [...results].sort((a, b) => b.stories - a.stories).slice(0, 3);
  console.log(`\n🏆 Most Active Storytellers (by story count):`);
  topByStories.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.storytellerName}: ${result.stories} stories`);
  });
  
  // Most common themes
  const allThemes = results.flatMap(r => r.themes);
  const themeCount = allThemes.reduce((acc, theme) => {
    acc[theme] = (acc[theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topThemes = Object.entries(themeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
    
  if (topThemes.length > 0) {
    console.log(`\n🏷️  Most Common Themes:`);
    topThemes.forEach(([theme, count], index) => {
      console.log(`  ${index + 1}. ${theme}: ${count} storytellers`);
    });
  }
  
  // Error summary
  if (totalErrors > 0) {
    console.log(`\n⚠️  Error Summary:`);
    const errorTypes = results.flatMap(r => r.errors);
    const errorCount = errorTypes.reduce((acc, error) => {
      const errorType = error.split(':')[0];
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(errorCount).forEach(([errorType, count]) => {
      console.log(`  - ${errorType}: ${count} occurrences`);
    });
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`);
  
  const storytellersWithoutStories = results.filter(r => r.stories === 0).length;
  if (storytellersWithoutStories > 0) {
    console.log(`  - ${storytellersWithoutStories} storytellers have no stories (consider outreach)`);
  }
  
  const storytellersWithoutMedia = results.filter(r => r.media === 0).length;
  if (storytellersWithoutMedia > 0) {
    console.log(`  - ${storytellersWithoutMedia} storytellers have no media (encourage multimedia)`);
  }
  
  const storytellersWithoutProjects = results.filter(r => r.projects.length === 0).length;
  if (storytellersWithoutProjects > 0) {
    console.log(`  - ${storytellersWithoutProjects} storytellers not linked to projects (review project assignments)`);
  }
  
  if (totalErrors === 0) {
    console.log(`  ✅ All database connections working perfectly!`);
  } else {
    console.log(`  - Review and fix ${totalErrors} connection errors above`);
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('  1. Review any error messages above');
  console.log('  2. Check data quality and completeness');
  console.log('  3. Verify CMS functionality with these storytellers');
  console.log('  4. Test frontend display components');
  console.log('  5. Run performance tests with this dataset');
  
  console.log('\n' + '='.repeat(80));
}

// Run the tests
async function main() {
  try {
    const results = await testStorytellerConnections();
    await generateSummaryReport(results);
    
    // Exit with appropriate code
    const hasErrors = results.some(r => r.errors.length > 0);
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Only run if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testStorytellerConnections, ConnectionTestResult };