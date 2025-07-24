import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { createHash } from 'crypto';
import path from 'path';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

async function testSingleMigration() {
  console.log('🧪 TESTING SINGLE STORYTELLER PROFILE IMAGE MIGRATION\n');

  try {
    // 1. Get Greg Graham from Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Storytellers?filterByFormula={Name}='Greg Graham'`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const storyteller = data.records[0];
    
    if (!storyteller) {
      console.log('❌ Greg Graham not found in Airtable');
      return;
    }

    console.log('✅ Found Greg Graham in Airtable:');
    console.log(`   Name: ${storyteller.fields.Name}`);
    console.log(`   Airtable ID: ${storyteller.id}`);
    console.log(`   Has profile image: ${storyteller.fields['File Profile Image'] ? '✅' : '❌'}`);

    if (!storyteller.fields['File Profile Image']) {
      console.log('❌ No profile image found for Greg Graham');
      return;
    }

    // 2. Find matching user in Supabase
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, profile_image_url')
      .eq('full_name', 'Greg Graham');

    if (!users || users.length === 0) {
      console.log('❌ Greg Graham not found in Supabase');
      return;
    }

    const user = users[0];
    console.log('\n✅ Found Greg Graham in Supabase:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Current image: ${user.profile_image_url || 'None'}`);

    // 3. Get the profile image from Airtable
    const profileImage = storyteller.fields['File Profile Image'][0];
    console.log('\n📸 Profile image details:');
    console.log(`   Filename: ${profileImage.filename}`);
    console.log(`   Size: ${profileImage.size} bytes`);
    console.log(`   Type: ${profileImage.type}`);
    console.log(`   URL: ${profileImage.url.substring(0, 80)}...`);

    // 4. Download the image
    console.log('\n📥 Downloading image...');
    const imageResponse = await fetch(profileImage.url);
    
    if (!imageResponse.ok) {
      console.log(`❌ Failed to download: ${imageResponse.status} ${imageResponse.statusText}`);
      return;
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    console.log(`✅ Downloaded ${imageBuffer.length} bytes`);

    // 5. Generate filename and upload to Supabase
    const urlHash = createHash('md5').update(profileImage.url).digest('hex');
    const extension = path.extname(profileImage.filename) || '.jpg';
    const fileName = `profile-images/${user.id}-${urlHash}${extension}`;

    console.log(`\n📤 Uploading to Supabase as: ${fileName}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, imageBuffer, {
        contentType: profileImage.type,
        upsert: true
      });

    if (uploadError) {
      console.log(`❌ Upload failed: ${uploadError.message}`);
      return;
    }

    console.log('✅ Upload successful!');

    // 6. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    console.log(`🔗 Public URL: ${publicUrlData.publicUrl}`);

    // 7. Update user profile
    console.log('\n💾 Updating user profile...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        profile_image_url: publicUrlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.log(`❌ Profile update failed: ${updateError.message}`);
      return;
    }

    console.log('✅ Profile updated successfully!');
    console.log('\n🎉 Single migration test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testSingleMigration().catch(console.error);