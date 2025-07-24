/**
 * NUCLEAR DELETE ALL - Complete Supabase wipe
 * This will delete ALL data in preparation for Airtable migration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function nuclearDeleteAll() {
  console.log('💥 NUCLEAR DELETE ALL SUPABASE DATA');
  console.log('='.repeat(80));
  console.log('⚠️  THIS WILL DELETE EVERYTHING - NO RECOVERY');
  console.log('='.repeat(80));

  try {
    // First, get counts of what we're about to delete
    console.log('📊 COUNTING DATA TO DELETE:');
    console.log('-'.repeat(40));
    
    const dataCounts = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('quotes').select('*', { count: 'exact' }),
      supabase.from('themes').select('*', { count: 'exact' }),
      supabase.from('stories').select('*', { count: 'exact' }),
      supabase.from('locations').select('*', { count: 'exact' }),
      supabase.from('communities').select('*', { count: 'exact' }),
      supabase.from('projects').select('*', { count: 'exact' }),
      supabase.from('organizations').select('*', { count: 'exact' })
    ]);

    console.log(`   Users: ${dataCounts[0].count || 0}`);
    console.log(`   Quotes: ${dataCounts[1].count || 0}`);
    console.log(`   Themes: ${dataCounts[2].count || 0}`);
    console.log(`   Stories: ${dataCounts[3].count || 0}`);
    console.log(`   Locations: ${dataCounts[4].count || 0}`);
    console.log(`   Communities: ${dataCounts[5].count || 0}`);
    console.log(`   Projects: ${dataCounts[6].count || 0}`);
    console.log(`   Organizations: ${dataCounts[7].count || 0}`);

    const totalRecords = dataCounts.reduce((sum, data) => sum + (data.count || 0), 0);
    console.log(`\n   🔥 TOTAL RECORDS TO DELETE: ${totalRecords}`);

    // PHASE 1: Delete dependent data first
    console.log('\n🔥 PHASE 1: DELETING DEPENDENT DATA');
    console.log('-'.repeat(40));
    
    console.log('💀 Deleting stories...');
    const storiesResult = await supabase.from('stories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(storiesResult.error ? `❌ Error: ${storiesResult.error.message}` : '✅ Stories deleted');

    console.log('💀 Deleting quotes...');
    const quotesResult = await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(quotesResult.error ? `❌ Error: ${quotesResult.error.message}` : '✅ Quotes deleted');

    console.log('💀 Deleting themes...');
    const themesResult = await supabase.from('themes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(themesResult.error ? `❌ Error: ${themesResult.error.message}` : '✅ Themes deleted');

    // PHASE 2: Delete core entities
    console.log('\n🔥 PHASE 2: DELETING CORE ENTITIES');
    console.log('-'.repeat(40));

    console.log('💀 Deleting users...');
    const usersResult = await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(usersResult.error ? `❌ Error: ${usersResult.error.message}` : '✅ Users deleted');

    console.log('💀 Deleting communities...');
    const communitiesResult = await supabase.from('communities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(communitiesResult.error ? `❌ Error: ${communitiesResult.error.message}` : '✅ Communities deleted');

    console.log('💀 Deleting projects...');
    const projectsResult = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(projectsResult.error ? `❌ Error: ${projectsResult.error.message}` : '✅ Projects deleted');

    console.log('💀 Deleting organizations...');
    const organizationsResult = await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(organizationsResult.error ? `❌ Error: ${organizationsResult.error.message}` : '✅ Organizations deleted');

    console.log('💀 Deleting locations...');
    const locationsResult = await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(locationsResult.error ? `❌ Error: ${locationsResult.error.message}` : '✅ Locations deleted');

    // PHASE 3: Verify complete deletion
    console.log('\n🔍 PHASE 3: VERIFYING DELETION');
    console.log('-'.repeat(40));

    const finalCounts = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('quotes').select('*', { count: 'exact' }),
      supabase.from('themes').select('*', { count: 'exact' }),
      supabase.from('stories').select('*', { count: 'exact' }),
      supabase.from('locations').select('*', { count: 'exact' }),
      supabase.from('communities').select('*', { count: 'exact' }),
      supabase.from('projects').select('*', { count: 'exact' }),
      supabase.from('organizations').select('*', { count: 'exact' })
    ]);

    console.log('📊 REMAINING DATA:');
    console.log(`   Users: ${finalCounts[0].count || 0}`);
    console.log(`   Quotes: ${finalCounts[1].count || 0}`);
    console.log(`   Themes: ${finalCounts[2].count || 0}`);
    console.log(`   Stories: ${finalCounts[3].count || 0}`);
    console.log(`   Locations: ${finalCounts[4].count || 0}`);
    console.log(`   Communities: ${finalCounts[5].count || 0}`);
    console.log(`   Projects: ${finalCounts[6].count || 0}`);
    console.log(`   Organizations: ${finalCounts[7].count || 0}`);

    const remainingRecords = finalCounts.reduce((sum, data) => sum + (data.count || 0), 0);

    if (remainingRecords === 0) {
      console.log('\n💥 NUCLEAR DELETION COMPLETE!');
      console.log('='.repeat(80));
      console.log('✅ All data successfully deleted');
      console.log('✅ Database is now empty');
      console.log('✅ Ready for Airtable migration');
      console.log('');
      console.log('🚀 NEXT STEP: Run Airtable migration script');
    } else {
      console.log('\n⚠️  INCOMPLETE DELETION');
      console.log(`${remainingRecords} records remain - may need manual intervention`);
    }

  } catch (error) {
    console.error('💥 Nuclear deletion failed:', error);
    console.log('');
    console.log('🚨 DATABASE MAY BE IN INCONSISTENT STATE');
    console.log('🚨 MANUAL CLEANUP MAY BE REQUIRED');
  }
}

nuclearDeleteAll();