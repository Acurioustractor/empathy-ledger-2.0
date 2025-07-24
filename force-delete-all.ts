/**
 * FORCE DELETE ALL - Use raw SQL to handle cascading deletes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

async function forceDeleteAll() {
  console.log('🔥 FORCE DELETE ALL - USING RAW SQL');
  console.log('='.repeat(80));

  try {
    // Use raw SQL to delete everything in correct order
    const deleteQueries = [
      'DELETE FROM media;',
      'DELETE FROM stories;', 
      'DELETE FROM quotes;',
      'DELETE FROM themes;',
      'UPDATE users SET community_id = NULL, project_id = NULL, primary_location_id = NULL, organization_id = NULL;',
      'DELETE FROM users;',
      'DELETE FROM communities;',
      'DELETE FROM projects;', 
      'DELETE FROM organizations;',
      'DELETE FROM locations;'
    ];

    for (const query of deleteQueries) {
      console.log(`🗑️  Executing: ${query}`);
      const { error } = await supabase.rpc('execute_sql', { sql: query });
      
      if (error) {
        console.log(`❌ SQL Error: ${error.message}`);
        // Try direct query instead
        const { error: directError } = await supabase.from('').select().limit(0);
        console.log('Trying alternative approach...');
      } else {
        console.log('✅ Success');
      }
    }

    // Alternative approach: Delete table by table manually
    console.log('\n📋 TRYING MANUAL TABLE DELETION:');
    console.log('-'.repeat(40));

    // First clear all foreign key references
    const tableResets = [
      { table: 'users', updates: { community_id: null, project_id: null, primary_location_id: null, organization_id: null } },
      { table: 'media', updates: { storyteller_id: null, location_id: null } }
    ];

    for (const reset of tableResets) {
      console.log(`🔄 Clearing ${reset.table} foreign keys...`);
      const { error } = await supabase.from(reset.table).update(reset.updates).neq('id', '00000000-0000-0000-0000-000000000000');
      console.log(error ? `❌ ${error.message}` : '✅ Cleared');
    }

    // Now delete in order
    const tables = ['media', 'stories', 'quotes', 'themes', 'users', 'communities', 'projects', 'organizations', 'locations'];
    
    for (const table of tables) {
      console.log(`💀 Deleting ${table}...`);
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log(error ? `❌ ${error.message}` : '✅ Deleted');
    }

    // Final verification
    console.log('\n🔍 FINAL COUNT CHECK:');
    console.log('-'.repeat(40));

    const tablesToCheck = ['users', 'quotes', 'themes', 'stories', 'locations', 'communities', 'projects', 'organizations', 'media'];
    let totalRemaining = 0;

    for (const table of tablesToCheck) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact' });
      const tableCount = count || 0;
      totalRemaining += tableCount;
      console.log(`   ${table}: ${tableCount}${error ? ` (${error.message})` : ''}`);
    }

    if (totalRemaining === 0) {
      console.log('\n💥 FORCE DELETE COMPLETE!');
      console.log('='.repeat(80));
      console.log('✅ ALL DATA SUCCESSFULLY DELETED');
      console.log('✅ DATABASE IS NOW EMPTY');
      console.log('✅ READY FOR AIRTABLE MIGRATION');
      console.log('');
      console.log('🚀 NEXT: Run your Airtable migration script');
    } else {
      console.log(`\n⚠️  PARTIAL SUCCESS: ${totalRemaining} records remain`);
      console.log('Some foreign key constraints may still need manual handling');
    }

  } catch (error) {
    console.error('💥 Force delete failed:', error);
  }
}

forceDeleteAll();