import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAllStoryTables() {
  console.log('🔍 Checking all possible story-related tables...\n');

  const possibleTables = [
    'stories',
    'transcripts', 
    'generated_stories',
    'story_drafts',
    'community_stories',
    'user_stories',
    'published_stories'
  ];

  for (const table of possibleTables) {
    console.log(`📋 Checking table: ${table}`);
    
    try {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.log(`❌ Table ${table} does not exist or is not accessible: ${countError.message}`);
      } else {
        console.log(`✅ Table ${table} exists with ${count} records`);
        
        if (count > 0) {
          // Get sample data
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(2);
            
          if (!error && data?.length > 0) {
            console.log(`   Sample columns:`, Object.keys(data[0]));
            
            // Look for story-like content
            const sampleRecord = data[0];
            if (sampleRecord.title || sampleRecord.content || sampleRecord.transcript_content) {
              console.log(`   📖 HAS CONTENT! Sample:`, {
                id: sampleRecord.id,
                title: sampleRecord.title?.substring(0, 50) + '...' || 'N/A',
                content_length: sampleRecord.content?.length || sampleRecord.transcript_content?.length || 0,
                created_at: sampleRecord.created_at
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(`❌ Error checking ${table}: ${error.message}`);
    }
    console.log('');
  }

  // Also check if there are any related tables like storytellers, quotes, etc.
  console.log('🔍 Checking related content tables...\n');
  
  const relatedTables = [
    'storytellers',
    'quotes', 
    'case_studies',
    'profiles'
  ];

  for (const table of relatedTables) {
    try {
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        console.log(`✅ Table ${table}: ${count} records`);
      } else {
        console.log(`❌ Table ${table}: ${countError.message}`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${table}: ${error.message}`);
    }
  }
}

checkAllStoryTables();