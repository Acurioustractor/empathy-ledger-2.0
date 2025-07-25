import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStorytellers() {
  console.log('🔍 Checking storytellers table and relationships...\n');

  try {
    // Check storytellers table
    const { data: storytellers, error: storytellersError } = await supabase
      .from('storytellers')
      .select('*')
      .limit(5);

    if (storytellersError) {
      console.log('❌ Error fetching storytellers:', storytellersError.message);
      return;
    }

    console.log(`✅ Found ${storytellers.length} sample storytellers`);
    if (storytellers.length > 0) {
      console.log('Storyteller columns:', Object.keys(storytellers[0]));
      
      storytellers.forEach((s, i) => {
        console.log(`\n👤 Storyteller ${i + 1}:`);
        console.log(`- ID: ${s.id}`);
        console.log(`- Name: ${s.full_name}`);
        console.log(`- Email: ${s.email}`);
        console.log(`- Created: ${s.created_at}`);
      });
    }

    // Check the relationship between transcripts and storytellers
    console.log('\n🔗 CHECKING TRANSCRIPT-STORYTELLER RELATIONSHIPS:');
    
    const { data: transcriptCheck, error: transcriptError } = await supabase
      .from('transcripts')
      .select(`
        id,
        storyteller_id,
        storytellers!inner(id, full_name, email)
      `)
      .limit(5);

    if (transcriptError) {
      console.log('❌ Error with relationship query:', transcriptError.message);
      
      // Try to check if storyteller_id values exist in storytellers table
      const { data: orphanCheck } = await supabase
        .from('transcripts')
        .select('storyteller_id')
        .limit(5);
        
      if (orphanCheck) {
        console.log('\nChecking if storyteller_ids exist:');
        for (const transcript of orphanCheck) {
          const { data: storytellerExists } = await supabase
            .from('storytellers')
            .select('id, full_name')
            .eq('id', transcript.storyteller_id)
            .single();
            
          console.log(`- Transcript storyteller_id ${transcript.storyteller_id}: ${storytellerExists ? storytellerExists.full_name : 'NOT FOUND'}`);
        }
      }
    } else {
      console.log('✅ Relationships work!');
      transcriptCheck.forEach(t => {
        console.log(`- Transcript ${t.id} → ${t.storytellers.full_name}`);
      });
    }

    // Get total counts
    const { count: storytellerCount } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true });
      
    const { count: transcriptCount } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 TOTALS: ${storytellerCount} storytellers, ${transcriptCount} transcripts`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkStorytellers();