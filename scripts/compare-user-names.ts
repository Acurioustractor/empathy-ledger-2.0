import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

async function compareUserNames() {
  console.log('🔍 COMPARING USER NAMES BETWEEN AIRTABLE AND SUPABASE\n');

  try {
    // Get sample Supabase users
    const { data: supabaseUsers } = await supabase
      .from('users')
      .select('id, full_name, airtable_id, email')
      .order('full_name')
      .limit(20);

    console.log('📊 SAMPLE SUPABASE USERS:');
    if (supabaseUsers) {
      supabaseUsers.forEach((user, i) => {
        console.log(`   ${i + 1}. "${user.full_name}" | Airtable ID: ${user.airtable_id || 'None'}`);
      });
    }

    // Get sample Airtable storytellers
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?maxRecords=20`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const airtableStorytellers = data.records;

    console.log('\n📊 SAMPLE AIRTABLE STORYTELLERS:');
    airtableStorytellers.forEach((storyteller: any, i: number) => {
      console.log(`   ${i + 1}. "${storyteller.fields.Name}" | ID: ${storyteller.id}`);
    });

    // Try to find potential matches
    console.log('\n🔍 LOOKING FOR POTENTIAL MATCHES:');
    const airtableNames = airtableStorytellers.map((s: any) => s.fields.Name);
    const supabaseNames = supabaseUsers?.map(u => u.full_name) || [];

    // Check for exact matches
    const exactMatches = [];
    for (const airtableName of airtableNames) {
      for (const supabaseName of supabaseNames) {
        if (airtableName && supabaseName && airtableName.toLowerCase().trim() === supabaseName.toLowerCase().trim()) {
          exactMatches.push({ airtable: airtableName, supabase: supabaseName });
        }
      }
    }

    console.log(`\n✅ EXACT MATCHES FOUND: ${exactMatches.length}`);
    exactMatches.forEach(match => {
      console.log(`   - "${match.airtable}" ↔ "${match.supabase}"`);
    });

    // Check for partial matches
    console.log('\n🤔 POTENTIAL PARTIAL MATCHES:');
    let partialMatchCount = 0;
    for (const airtableName of airtableNames) {
      if (!airtableName) continue;
      for (const supabaseName of supabaseNames) {
        if (!supabaseName) continue;
        
        const aClean = airtableName.toLowerCase().trim();
        const sClean = supabaseName.toLowerCase().trim();
        
        // Check if either name contains the other
        if (aClean !== sClean && (aClean.includes(sClean) || sClean.includes(aClean)) && partialMatchCount < 10) {
          console.log(`   - "${airtableName}" ↔ "${supabaseName}"`);
          partialMatchCount++;
        }
      }
    }

    if (partialMatchCount === 0) {
      console.log('   No obvious partial matches found in sample data');
    }

    // Check if Supabase users have airtable_id references
    const usersWithAirtableId = supabaseUsers?.filter(u => u.airtable_id) || [];
    console.log(`\n🔗 SUPABASE USERS WITH AIRTABLE_ID: ${usersWithAirtableId.length}`);
    usersWithAirtableId.forEach(user => {
      console.log(`   - "${user.full_name}" | Airtable ID: ${user.airtable_id}`);
    });

  } catch (error) {
    console.error('💥 Error comparing names:', error);
  }
}

compareUserNames().catch(console.error);