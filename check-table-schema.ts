#!/usr/bin/env tsx
/**
 * CHECK TABLE SCHEMA
 * Check the actual schema of our tables
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTableSchema(): Promise<void> {
  console.log('🔍 CHECKING TABLE SCHEMA');
  console.log('=======================\n');
  
  try {
    // Check storytellers table structure
    console.log('👥 STORYTELLERS TABLE:');
    const { data: storytellers, error: storytellersError } = await supabase
      .from('storytellers')
      .select('*')
      .limit(1);
      
    if (storytellersError) {
      console.log(`   ❌ Error: ${storytellersError.message}`);
    } else if (storytellers && storytellers.length > 0) {
      console.log(`   ✅ Columns: ${Object.keys(storytellers[0]).join(', ')}`);
      console.log(`   📊 Sample ID: ${storytellers[0].id}`);
      console.log(`   📝 Name: ${storytellers[0].full_name}`);
    } else {
      console.log('   ⚠️  No data found');
    }
    
    // Check locations table structure  
    console.log('\n📍 LOCATIONS TABLE:');
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .limit(1);
      
    if (locationsError) {
      console.log(`   ❌ Error: ${locationsError.message}`);
    } else if (locations && locations.length > 0) {
      console.log(`   ✅ Columns: ${Object.keys(locations[0]).join(', ')}`);
      console.log(`   📊 Sample: ${JSON.stringify(locations[0], null, 2)}`);
    } else {
      console.log('   ⚠️  No data found');
    }
    
    // Check organizations table structure
    console.log('\n🏢 ORGANIZATIONS TABLE:');
    const { data: organizations, error: organizationsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(1);
      
    if (organizationsError) {
      console.log(`   ❌ Error: ${organizationsError.message}`);
    } else if (organizations && organizations.length > 0) {
      console.log(`   ✅ Columns: ${Object.keys(organizations[0]).join(', ')}`);
      console.log(`   📊 Sample: ${JSON.stringify(organizations[0], null, 2)}`);
    } else {
      console.log('   ⚠️  No data found');
    }
    
    // Check stories table
    console.log('\n📖 STORIES TABLE:');
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .limit(1);
      
    if (storiesError) {
      console.log(`   ❌ Error: ${storiesError.message}`);
    } else if (stories && stories.length > 0) {
      console.log(`   ✅ Columns: ${Object.keys(stories[0]).join(', ')}`);
    } else {
      console.log('   ⚠️  No data found');
    }
    
    // Check if storytellers have the consent fields we're filtering on
    console.log('\n🔒 CONSENT & PRIVACY CHECK:');
    const { data: sampleStoryteller } = await supabase
      .from('storytellers')
      .select('consent_given, privacy_preferences')
      .limit(1)
      .single();
      
    if (sampleStoryteller) {
      console.log(`   ✅ Consent given: ${sampleStoryteller.consent_given}`);
      console.log(`   ✅ Privacy prefs: ${JSON.stringify(sampleStoryteller.privacy_preferences, null, 2)}`);
    }
    
    // Count total storytellers
    const { count } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true });
      
    console.log(`\n📊 TOTAL STORYTELLERS: ${count}`);
    
    // Count with images
    const { count: withImages } = await supabase
      .from('storytellers')
      .select('*', { count: 'exact', head: true })
      .not('profile_image_url', 'is', null);
      
    console.log(`📸 WITH IMAGES: ${withImages}`);
    
  } catch (error) {
    console.error('💥 Schema check failed:', error);
  }
}

async function main(): Promise<void> {
  await checkTableSchema();
}

main().catch(console.error);