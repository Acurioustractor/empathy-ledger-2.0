import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStoriesSchema() {
  try {
    console.log('🔍 Checking stories table schema...\n');

    // Get table schema information
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'stories' })
      .single();

    if (tableError) {
      console.log('❌ Error getting table info, trying alternative approach...');
      
      // Try a simple select to see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from('stories')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ Error accessing stories table:', sampleError);
        
        // Try to check if the table exists at all
        const { data: existsData, error: existsError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
          .eq('tablename', 'stories');

        if (!existsError && existsData && existsData.length > 0) {
          console.log('✅ Stories table exists, but query failed. Checking permissions...');
        } else {
          console.log('❌ Stories table may not exist. Checking all tables...');
          
          const { data: allTables, error: allTablesError } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');

          if (!allTablesError) {
            console.log('\n📋 Available tables:');
            allTables.forEach(table => console.log(`   - ${table.tablename}`));
          }
        }

        return;
      }

      if (sampleData && sampleData.length > 0) {
        console.log('✅ Stories table accessible. Sample record structure:');
        console.log('Columns found:', Object.keys(sampleData[0]));
        
        // Get total count
        const { count, error: countError } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          console.log(`\n📊 Total records: ${count}`);
        }
      }

    } else {
      console.log('✅ Table info retrieved:', tableInfo);
    }

  } catch (error) {
    console.error('❌ Error:', error);

    // Fallback: Try to list all tables in the database
    try {
      console.log('\n🔍 Trying to list all tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (!tablesError && tables) {
        console.log('\n📋 All public tables:');
        tables.forEach(table => console.log(`   - ${table.table_name}`));
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
}

checkStoriesSchema();