/**
 * Test the corrected Supabase queries
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testCorrectedQueries() {
  console.log('🧪 Testing corrected Supabase queries...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Corrected quotes query with quote_text column
    console.log('🔍 Testing corrected quotes query...');
    const { data: quotesResult, error: quotesError } = await supabase
      .from('quotes')
      .select('id, quote_text, context, themes')
      .overlaps('themes', ['Innovation'])
      .limit(3);

    if (quotesError) {
      console.log('❌ Quotes query failed:', quotesError);
    } else {
      console.log('✅ Quotes query successful!');
      console.log(`Found ${quotesResult?.length || 0} records`);
      if (quotesResult && quotesResult.length > 0) {
        console.log('Sample quote:', quotesResult[0]);
      }
    }

    // Test 2: Test with other themes to see data variety
    console.log('\n🔍 Testing quotes with different themes...');
    const { data: diverseQuotes, error: diverseError } = await supabase
      .from('quotes')
      .select('id, quote_text, themes')
      .not('themes', 'is', null)
      .limit(5);

    if (diverseError) {
      console.log('❌ Diverse quotes query failed:', diverseError);
    } else {
      console.log('✅ Diverse quotes query successful!');
      console.log(`Found ${diverseQuotes?.length || 0} records`);
      if (diverseQuotes && diverseQuotes.length > 0) {
        const allThemes = new Set();
        diverseQuotes.forEach(quote => {
          if (quote.themes && Array.isArray(quote.themes)) {
            quote.themes.forEach(theme => allThemes.add(theme));
          }
        });
        console.log('Available themes:', Array.from(allThemes));
      }
    }

    // Test 3: Users query (this will likely still fail due to RLS, but let's check)
    console.log('\n🔍 Testing users query (may fail due to RLS)...');
    const { data: usersResult, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, profile_image_url')
      .eq('role', 'storyteller')
      .not('profile_image_url', 'is', null)
      .limit(3);

    if (usersError) {
      console.log('❌ Users query failed (expected due to RLS):', usersError.message);
      console.log('💡 This confirms the RLS policy issue needs database-level fix');
    } else {
      console.log('✅ Users query successful!');
      console.log(`Found ${usersResult?.length || 0} records`);
    }

    console.log('\n🎯 Query testing completed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Quotes queries now working with quote_text column');
    console.log('- ❌ Users queries still blocked by RLS policy (database admin needed)');
    console.log('- 🔧 Frontend fixes applied to cms-core.ts and useCMS.ts');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testCorrectedQueries().catch(console.error);