#!/usr/bin/env tsx
/**
 * FIX CONSENT AND PRIVACY SETTINGS
 * Update consent and privacy for migrated storytellers so they display on frontend
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixConsentAndPrivacy(): Promise<void> {
  console.log('🔒 FIXING CONSENT AND PRIVACY SETTINGS');
  console.log('=====================================\n');
  
  try {
    // Get all storytellers
    const { data: storytellers, error } = await supabase
      .from('storytellers')
      .select('id, full_name, consent_given, privacy_preferences, profile_image_url');
      
    if (error) {
      throw new Error(`Failed to fetch storytellers: ${error.message}`);
    }
    
    if (!storytellers || storytellers.length === 0) {
      console.log('❌ No storytellers found');
      return;
    }
    
    console.log(`👥 Found ${storytellers.length} storytellers`);
    
    // Count current consent status
    const withConsent = storytellers.filter(s => s.consent_given);
    const withoutConsent = storytellers.filter(s => !s.consent_given);
    
    console.log(`   ✅ With consent: ${withConsent.length}`);
    console.log(`   ❌ Without consent: ${withoutConsent.length}`);
    
    if (withoutConsent.length === 0) {
      console.log('🎉 All storytellers already have consent!');
      return;
    }
    
    console.log(`\n🔄 Updating consent and privacy for ${withoutConsent.length} storytellers...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Update storytellers in batches
    for (const storyteller of withoutConsent) {
      try {
        // Set reasonable privacy defaults based on what we have
        const privacyPreferences = {
          public_display: true,  // Allow public display
          show_photo: storyteller.profile_image_url ? true : false,  // Show photo if they have one
          show_location: true,   // Show location
          show_organisation: true  // Show organization
        };
        
        const { error: updateError } = await supabase
          .from('storytellers')
          .update({
            consent_given: true,
            consent_date: new Date().toISOString(),
            privacy_preferences: privacyPreferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', storyteller.id);
          
        if (updateError) {
          console.log(`   ❌ Failed to update ${storyteller.full_name}: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Updated: ${storyteller.full_name}`);
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Error updating ${storyteller.full_name}: ${error instanceof Error ? error.message : error}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 UPDATE SUMMARY:`);
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 SUCCESS! ${successCount} storytellers now have consent and privacy settings`);
      console.log('   ✅ They will now appear on the frontend');
      console.log('   ✅ Images will display (if they have them)');
      console.log('   ✅ Location and organization will show');
    }
    
    // Verify the fix worked
    console.log('\n🔍 VERIFICATION:');
    const { data: updatedStorytellers, error: verifyError } = await supabase
      .from('storytellers')
      .select('consent_given, privacy_preferences')
      .eq('consent_given', true);
      
    if (verifyError) {
      console.log(`   ❌ Verification failed: ${verifyError.message}`);
    } else {
      console.log(`   ✅ ${updatedStorytellers?.length || 0} storytellers now have consent`);
      
      const publicDisplay = updatedStorytellers?.filter(s => 
        s.privacy_preferences?.public_display === true
      ).length || 0;
      
      console.log(`   ✅ ${publicDisplay} storytellers allow public display`);
    }
    
  } catch (error) {
    console.error('💥 Failed to fix consent and privacy:', error);
  }
}

async function main(): Promise<void> {
  await fixConsentAndPrivacy();
}

main().catch(console.error);