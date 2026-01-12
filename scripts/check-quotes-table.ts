/**
 * CHECK ACTUAL QUOTES TABLE STRUCTURE
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM0NjIyOSwiZXhwIjoyMDY3OTIyMjI5fQ.wyizbOWRxMULUp6WBojJPfey1ta8-Al1OlZqDDIPIHo';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkQuotesTable() {
  console.log('🔍 Checking actual quotes table structure...\n');

  try {
    // Get one row to see the actual columns
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ Quotes table columns:');
      console.log(Object.keys(data[0]));
      console.log('\n📋 Sample data:');
      console.log(data[0]);
    } else {
      console.log('⚠️ No data in quotes table');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkQuotesTable();