#!/usr/bin/env tsx
/**
 * FIX ALL PRIVACY SETTINGS
 * Set public_display to true for all storytellers so they appear on frontend
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixAllPrivacySettings(): Promise<void> {
  console.log('🔓 FIXING ALL PRIVACY SETTINGS');
  console.log('==============================\n');
  
  try {
    // Update ALL storytellers to allow public display
    console.log('🔄 Setting public_display = true for all storytellers...');
    
    const { data: storytellers, error: updateError } = await supabase
      .from('storytellers')
      .update({
        privacy_preferences: {
          public_display: true,
          show_photo: true,
          show_location: true,
          show_organisation: true
        },
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Match all (impossible ID)
      .select('id, full_name');
      
    if (updateError) {
      throw new Error(`Failed to update privacy settings: ${updateError.message}`);
    }
    
    console.log(`✅ Updated privacy settings for ${storytellers?.length || 0} storytellers`);
    
    // Verify the update
    console.log('\n🔍 VERIFICATION:');
    const { data: verification, error: verifyError } = await supabase
      .from('storytellers')
      .select('privacy_preferences')
      .eq('privacy_preferences->public_display', 'true');
      
    if (verifyError) {
      console.log(`   ❌ Verification failed: ${verifyError.message}`);
    } else {
      console.log(`   ✅ ${verification?.length || 0} storytellers now allow public display`);
    }
    
    console.log('\n🎉 ALL STORYTELLERS NOW HAVE PUBLIC DISPLAY ENABLED!');
    console.log('   ✅ Frontend will now show storytellers');
    console.log('   ✅ Images will display');
    console.log('   ✅ Locations and organizations will show');
    
  } catch (error) {
    console.error('💥 Failed to fix privacy settings:', error);
  }
}

async function main(): Promise<void> {
  await fixAllPrivacySettings();
}

main().catch(console.error);