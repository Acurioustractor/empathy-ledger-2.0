import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixQuotesTableConstraint() {
  console.log('🔧 FIXING QUOTES TABLE CONSTRAINTS...\n');

  try {
    // Use SQL to modify the table structure
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Remove NOT NULL constraint from story_id and transcript_id
        ALTER TABLE quotes ALTER COLUMN story_id DROP NOT NULL;
        ALTER TABLE quotes ALTER COLUMN transcript_id DROP NOT NULL;
        
        -- Verify the changes
        SELECT column_name, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'quotes' 
          AND column_name IN ('story_id', 'transcript_id');
      `
    });

    if (error) {
      console.error('❌ Failed to modify table:', error);
    } else {
      console.log('✅ Successfully removed NOT NULL constraints');
      console.log('📊 Result:', data);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

fixQuotesTableConstraint().catch(console.error);