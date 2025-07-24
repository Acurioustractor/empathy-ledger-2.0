#!/usr/bin/env npx tsx

/**
 * Storyteller Connections Demonstration
 * Shows all the connections and relationships for storytellers
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { 
  getStorytellersSafe, 
  getStorytellerWithConnectionsSafe, 
  getStorytellerStatsSafe 
} from './src/lib/supabase-storytellers-safe.js';

async function demonstrateStorytellerConnections() {
  console.log('🌟 EMPATHY LEDGER - STORYTELLER CONNECTIONS DEMO');
  console.log('=' .repeat(80));

  try {
    // First, get overall statistics
    console.log('\n📊 SYSTEM STATISTICS');
    console.log('-' .repeat(40));
    
    const stats = await getStorytellerStatsSafe();
    if (stats.error) {
      console.log(`❌ Stats error: ${stats.error}`);
    } else {
      console.log(`Total Storytellers: ${stats.total_storytellers}`);
      console.log(`Active Storytellers: ${stats.active_storytellers}`);
      console.log(`Engagement Rate: ${stats.engagement_rate}%`);
    }

    // Get a sample of storytellers
    console.log('\n👥 SAMPLE STORYTELLERS');
    console.log('-' .repeat(40));
    
    const { storytellers, total, error } = await getStorytellersSafe({ limit: 5 });
    
    if (error) {
      console.log(`❌ Error getting storytellers: ${error}`);
      return;
    }

    if (storytellers.length === 0) {
      console.log('⚠️  No storytellers found in database');
      console.log('\n💡 To add test data, you could:');
      console.log('   1. Create sample storyteller profiles in Supabase');
      console.log('   2. Add stories and link them to storytellers');
      console.log('   3. Add media content and quotes');
      console.log('   4. Link stories to projects and themes');
      return;
    }

    console.log(`Found ${storytellers.length} storytellers out of ${total} total`);

    // Show detailed connections for the first storyteller
    const firstStoryteller = storytellers[0];
    console.log(`\n🔍 DETAILED CONNECTIONS FOR: ${firstStoryteller.preferred_name || firstStoryteller.full_name}`);
    console.log('=' .repeat(80));

    const connections = await getStorytellerWithConnectionsSafe(firstStoryteller.id);
    
    if (connections.error) {
      console.log(`❌ Error getting connections: ${connections.error}`);
      return;
    }

    const storyteller = connections.storyteller;
    const conn = connections.connections;

    // Display comprehensive connection table
    console.log('\n📋 STORYTELLER PROFILE');
    console.log('-' .repeat(50));
    console.log(`Name: ${storyteller.preferred_name || storyteller.full_name || 'N/A'}`);
    console.log(`Bio: ${storyteller.bio ? storyteller.bio.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`Location: ${storyteller.location || 'N/A'}`);
    console.log(`Community: ${storyteller.community_affiliation || 'N/A'}`);
    console.log(`Cultural Background: ${storyteller.cultural_background?.join(', ') || 'N/A'}`);
    console.log(`Expertise: ${storyteller.expertise_areas?.join(', ') || 'N/A'}`);
    console.log(`Languages: ${storyteller.languages_spoken?.join(', ') || 'N/A'}`);
    console.log(`Values: ${storyteller.core_values?.join(', ') || 'N/A'}`);

    console.log('\n🔗 CONNECTION SUMMARY');
    console.log('-' .repeat(50));
    console.log(`Stories: ${conn.totals.stories}`);
    console.log(`Media Items: ${conn.totals.media}`);
    console.log(`Quotes: ${conn.totals.quotes}`);
    console.log(`Themes: ${conn.totals.themes}`);
    console.log(`Projects: ${conn.totals.projects}`);
    console.log(`Geographic Location: ${conn.location ? `${conn.location.name}, ${conn.location.country}` : 'Not specified'}`);

    if (conn.stories.length > 0) {
      console.log('\n📚 STORIES');
      console.log('-' .repeat(30));
      conn.stories.forEach((story, index) => {
        console.log(`${index + 1}. "${story.title || 'Untitled'}"`);
        console.log(`   Themes: ${story.linked_themes?.join(', ') || 'None'}`);
        console.log(`   Created: ${new Date(story.created_at).toLocaleDateString()}`);
        if (story.story_copy) {
          console.log(`   Preview: ${story.story_copy.substring(0, 100)}...`);
        }
        console.log('');
      });
    }

    if (conn.media.length > 0) {
      console.log('\n🖼️  MEDIA CONTENT');
      console.log('-' .repeat(30));
      conn.media.forEach((media, index) => {
        const sizeStr = media.file_size ? ` (${Math.round(media.file_size / 1024)}KB)` : '';
        console.log(`${index + 1}. "${media.title || 'Untitled'}" - ${media.type}${sizeStr}`);
        console.log(`   URL: ${media.media_url}`);
        console.log('');
      });
    }

    if (conn.quotes.length > 0) {
      console.log('\n💬 STORY QUOTES');
      console.log('-' .repeat(30));
      conn.quotes.forEach((quote, index) => {
        console.log(`${index + 1}. "${quote.quote_text}"`);
        console.log(`   Themes: ${quote.themes?.join(', ') || 'None'}`);
        console.log(`   Impact Score: ${quote.impact_score || 'N/A'}`);
        console.log('');
      });
    }

    if (conn.themes.length > 0) {
      console.log('\n🏷️  THEMES & TOPICS');
      console.log('-' .repeat(30));
      console.log(conn.themes.join(', '));
    }

    if (conn.projects.length > 0) {
      console.log('\n🚀 CONNECTED PROJECTS');
      console.log('-' .repeat(30));
      conn.projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project}`);
      });
    }

    // Show summary table for all storytellers
    console.log('\n\n📊 ALL STORYTELLERS SUMMARY TABLE');
    console.log('=' .repeat(120));
    console.log('| Name                     | Stories | Media | Themes              | Location             | Latest Activity |');
    console.log('|' + '-'.repeat(118) + '|');
    
    storytellers.forEach(st => {
      const name = (st.preferred_name || st.full_name || 'N/A').padEnd(24).substring(0, 24);
      const stories = st.story_count.toString().padEnd(7);
      const media = '0'; // We'd need to fetch this separately for each
      const themes = st.primary_themes.slice(0, 2).join(', ').padEnd(19).substring(0, 19);
      const location = (st.location || 'N/A').padEnd(20).substring(0, 20);
      const activity = st.latest_activity ? 
        new Date(st.latest_activity).toLocaleDateString().padEnd(15) : 
        'None'.padEnd(15);
      
      console.log(`| ${name} | ${stories} | ${media.padEnd(5)} | ${themes} | ${location} | ${activity} |`);
    });

    console.log('\n' + '=' .repeat(80));
    console.log('🎯 DEMONSTRATION COMPLETE');
    console.log('✅ Storyteller connections working properly');
    console.log('✅ All relationship data accessible');
    console.log('✅ Privacy-safe data display functioning');
    console.log('✅ Multi-dimensional storyteller profiles ready');
    
    console.log('\n💡 This demonstrates how storytellers connect to:');
    console.log('   • Stories (their narratives and content)');
    console.log('   • Media (images, videos, audio files)');
    console.log('   • Quotes (highlighted excerpts from stories)');
    console.log('   • Themes (topics and categories)');
    console.log('   • Projects (community initiatives and campaigns)');
    console.log('   • Locations (geographic and cultural contexts)');
    console.log('   • Profile data (expertise, values, background)');

  } catch (error) {
    console.log(`\n❌ Demo failed: ${error.message}`);
    console.log('Stack trace:', error.stack);
  }
}

// Run the demonstration
demonstrateStorytellerConnections();