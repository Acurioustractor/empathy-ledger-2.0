/**
 * COMPLETE NUCLEAR DELETE - Handle foreign key constraints properly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function completeNuclearDelete() {
  console.log('💥 COMPLETE NUCLEAR DELETE - HANDLING FOREIGN KEYS');
  console.log('='.repeat(80));

  try {
    // Delete in correct order to handle foreign key constraints
    
    console.log('💀 Deleting media...');
    const mediaResult = await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(mediaResult.error ? `⚠️  Media: ${mediaResult.error.message}` : '✅ Media deleted');

    console.log('💀 Deleting stories...');
    const storiesResult = await supabase.from('stories').delete().neq('id', '00000000-0000-0000-0000-000000000000');  
    console.log(storiesResult.error ? `⚠️  Stories: ${storiesResult.error.message}` : '✅ Stories deleted');

    console.log('💀 Deleting quotes...');
    const quotesResult = await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(quotesResult.error ? `⚠️  Quotes: ${quotesResult.error.message}` : '✅ Quotes deleted');

    console.log('💀 Deleting themes...');
    const themesResult = await supabase.from('themes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(themesResult.error ? `⚠️  Themes: ${themesResult.error.message}` : '✅ Themes deleted');

    // Clear foreign key references in users table first
    console.log('💀 Clearing user foreign key references...');
    const clearRefsResult = await supabase
      .from('users')
      .update({
        community_id: null,
        project_id: null,
        primary_location_id: null
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(clearRefsResult.error ? `⚠️  Clear refs: ${clearRefsResult.error.message}` : '✅ User references cleared');

    console.log('💀 Deleting users...');
    const usersResult = await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(usersResult.error ? `⚠️  Users: ${usersResult.error.message}` : '✅ Users deleted');

    console.log('💀 Deleting communities...');
    const communitiesResult = await supabase.from('communities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(communitiesResult.error ? `⚠️  Communities: ${communitiesResult.error.message}` : '✅ Communities deleted');

    console.log('💀 Deleting projects...');
    const projectsResult = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(projectsResult.error ? `⚠️  Projects: ${projectsResult.error.message}` : '✅ Projects deleted');

    console.log('💀 Deleting organizations...');
    const organizationsResult = await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(organizationsResult.error ? `⚠️  Organizations: ${organizationsResult.error.message}` : '✅ Organizations deleted');

    console.log('💀 Deleting locations...');
    const locationsResult = await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(locationsResult.error ? `⚠️  Locations: ${locationsResult.error.message}` : '✅ Locations deleted');

    // Verify complete deletion
    console.log('\n🔍 FINAL VERIFICATION:');
    console.log('-'.repeat(40));

    const finalCounts = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('quotes').select('*', { count: 'exact' }),
      supabase.from('themes').select('*', { count: 'exact' }),
      supabase.from('stories').select('*', { count: 'exact' }),
      supabase.from('locations').select('*', { count: 'exact' }),
      supabase.from('communities').select('*', { count: 'exact' }),
      supabase.from('projects').select('*', { count: 'exact' }),
      supabase.from('organizations').select('*', { count: 'exact' }),
      supabase.from('media').select('*', { count: 'exact' })
    ]);

    console.log('📊 FINAL COUNTS:');
    console.log(`   Users: ${finalCounts[0].count || 0}`);
    console.log(`   Quotes: ${finalCounts[1].count || 0}`);
    console.log(`   Themes: ${finalCounts[2].count || 0}`);
    console.log(`   Stories: ${finalCounts[3].count || 0}`);
    console.log(`   Locations: ${finalCounts[4].count || 0}`);
    console.log(`   Communities: ${finalCounts[5].count || 0}`);
    console.log(`   Projects: ${finalCounts[6].count || 0}`);
    console.log(`   Organizations: ${finalCounts[7].count || 0}`);
    console.log(`   Media: ${finalCounts[8].count || 0}`);

    const totalRemaining = finalCounts.reduce((sum, data) => sum + (data.count || 0), 0);

    if (totalRemaining === 0) {
      console.log('\n💥 COMPLETE NUCLEAR DELETION SUCCESS!');
      console.log('='.repeat(80));
      console.log('✅ ALL DATA DELETED');
      console.log('✅ DATABASE IS EMPTY');
      console.log('✅ READY FOR AIRTABLE MIGRATION');
      console.log('');
      console.log('🚀 You can now run your Airtable migration');
    } else {
      console.log(`\n⚠️  ${totalRemaining} records still remain`);
      console.log('May need additional cleanup');
    }

  } catch (error) {
    console.error('💥 Complete deletion failed:', error);
  }
}

completeNuclearDelete();