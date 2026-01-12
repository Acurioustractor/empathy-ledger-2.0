import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUserFields() {
  console.log('🔍 Checking user table fields and sample data...\n');

  try {
    // Get a sample user with all fields
    const { data: sampleUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'storyteller')
      .limit(5);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    if (sampleUsers && sampleUsers.length > 0) {
      console.log('📊 SAMPLE USER STRUCTURE:');
      console.log('Available fields:', Object.keys(sampleUsers[0]).join(', '));
      
      console.log('\n📋 SAMPLE STORYTELLER DATA:');
      sampleUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log('   Fields with values:');
        Object.entries(user).forEach(([key, value]) => {
          if (value !== null && value !== '' && key !== 'id') {
            console.log(`   - ${key}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`);
          }
        });
      });
    }

    // Check if there's a separate storytellers table
    console.log('\n\n🔍 Checking for storytellers table...');
    const { data: storytellersData, error: storytellersError } = await supabase
      .from('storytellers')
      .select('*')
      .limit(5);

    if (storytellersError) {
      console.log('No separate storytellers table found or error accessing it.');
    } else if (storytellersData && storytellersData.length > 0) {
      console.log('✅ Found storytellers table!');
      console.log('Available fields:', Object.keys(storytellersData[0]).join(', '));
      
      console.log('\n📋 SAMPLE STORYTELLER DATA:');
      storytellersData.forEach((storyteller, index) => {
        console.log(`\n${index + 1}. Storyteller:`, storyteller);
      });
    }

  } catch (error) {
    console.error('Error checking fields:', error);
  }
}

// Run the check
checkUserFields();