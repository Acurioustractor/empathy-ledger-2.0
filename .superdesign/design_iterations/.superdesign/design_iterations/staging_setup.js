#!/usr/bin/env node
/**
 * Sovereignty-Aligned Staging Environment Setup
 *
 * This script creates a staging environment with existing data
 * aligned to Indigenous Data Sovereignty principles
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupStagingEnvironment() {
  console.log('🎯 Setting up sovereignty-aligned staging environment...\n');

  try {
    // Step 1: Analyze existing data
    console.log('📊 Analyzing existing data...');

    // Get current story count
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select(
        'id, title, privacy_level, consent_settings, cultural_protocols, submitted_at'
      )
      .order('submitted_at', { ascending: false })
      .limit(50);

    if (storiesError) throw storiesError;

    console.log(`Found ${stories?.length || 0} existing stories`);

    // Get user information
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, community_affiliation, cultural_protocols')
      .limit(50);

    if (usersError) throw usersError;

    console.log(`Found ${users?.length || 0} existing users`);

    // Step 2: Create sovereignty-aligned test data
    console.log('\n🔧 Creating sovereignty-aligned test data...');

    // Test users representing different communities
    const testUsers = [
      {
        email: 'elder.palm@example.com',
        full_name: 'Aunty Sarah Palm',
        community_affiliation: 'Palm Island',
        cultural_protocols: {
          role: 'elder',
          seasonal_restrictions: true,
          gender_protocols: ['womens_business'],
          approval_authority: true,
        },
        contact_preferences: {
          email: true,
          community_meetings: true,
        },
      },
      {
        email: 'youth.townsville@example.com',
        full_name: 'Jake Wilson',
        community_affiliation: 'Townsville Youth',
        cultural_protocols: {
          role: 'youth',
          seasonal_restrictions: false,
          gender_protocols: [],
          approval_required: true,
        },
        contact_preferences: {
          email: true,
          sms: true,
        },
      },
      {
        email: 'healer.cairns@example.com',
        full_name: 'Maria Torres',
        community_affiliation: 'Cairns Healing Circle',
        cultural_protocols: {
          role: 'healer',
          seasonal_restrictions: true,
          ceremonial_timing: true,
          elder_approval_required: true,
        },
        contact_preferences: {
          email: true,
          community_meetings: true,
          phone: true,
        },
      },
    ];

    console.log('Creating test users...');
    const createdUsers = [];
    for (const userData of testUsers) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (!existingUser) {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (error) throw error;
        createdUsers.push(newUser);
        console.log(`✅ Created user: ${newUser.full_name}`);
      } else {
        console.log(`⚠️ User already exists: ${userData.email}`);
      }
    }

    // Step 3: Create test stories with sovereignty-aligned consent
    console.log('\n✍️ Creating test stories...');

    const testStories = [
      {
        title: 'Cultural Healing Through Connection',
        transcript:
          "I've seen how cultural connection brings our young people back from the brink. When my nephew was struggling, it wasn't the programs that saved him - it was sitting with Elders, learning our language, being on country. This is what true healing looks like.",
        privacy_level: 'community',
        consent_settings: {
          allowAnalysis: true,
          allowSharing: true,
          allowRevenue: true,
          sovereignty_acknowledged: true,
          elder_approval_required: true,
          seasonal_restrictions: false,
          gender_specific_access: false,
        },
        cultural_protocols: {
          community: 'Palm Island',
          protocols: ['elder_approval', 'community_consent'],
          seasonal_restrictions: [],
          gender_restrictions: [],
        },
        tags: ['healing', 'cultural_connection', 'youth', 'community'],
        location: 'Palm Island',
        submission_method: 'web',
      },
      {
        title: "Women's Business - Strength in Community",
        transcript:
          "I want to share how our women's healing circle has transformed lives. This is women's business, and we need to protect these stories while still sharing their power.",
        privacy_level: 'community',
        consent_settings: {
          allowAnalysis: true,
          allowSharing: true,
          allowRevenue: true,
          sovereignty_acknowledged: true,
          elder_approval_required: true,
          seasonal_restrictions: true,
          gender_specific_access: true,
          womens_business: true,
        },
        cultural_protocols: {
          community: 'Cairns Healing Circle',
          protocols: [
            'womens_business',
            'elder_approval',
            'seasonal_restrictions',
          ],
          seasonal_restrictions: ['dry_season', 'ceremonial_period'],
          gender_restrictions: ['women_only'],
        },
        tags: ['womens_business', 'healing', 'community_strength'],
        location: 'Cairns',
        submission_method: 'voice',
      },
      {
        title: 'Digital Youth - Finding Balance',
        transcript:
          "Our young people are navigating two worlds - traditional culture and digital life. I'm sharing this to help others understand how we can support their journey.",
        privacy_level: 'public',
        consent_settings: {
          allowAnalysis: true,
          allowSharing: true,
          allowRevenue: true,
          sovereignty_acknowledged: true,
          elder_approval_required: false,
          seasonal_restrictions: false,
          youth_voice: true,
        },
        cultural_protocols: {
          community: 'Townsville Youth',
          protocols: ['youth_voice', 'community_consent'],
          seasonal_restrictions: [],
          age_restrictions: ['youth_focused'],
        },
        tags: ['youth', 'digital', 'balance', 'modern_tradition'],
        location: 'Townsville',
        submission_method: 'web',
      },
    ];

    console.log('Creating test stories...');
    const createdStories = [];
    for (
      let i = 0;
      i < Math.min(createdUsers.length, testStories.length);
      i++
    ) {
      const storyData = testStories[i];
      const user = createdUsers[i];

      const { data: newStory, error } = await supabase
        .from('stories')
        .insert({
          ...storyData,
          storyteller_id: user.id,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      createdStories.push(newStory);
      console.log(`✅ Created story: ${newStory.title}`);
    }

    // Step 4: Initialize benefit tracking
    console.log('\\n💰 Setting up benefit tracking...');

    for (const story of createdStories) {
      const { error: benefitError } = await supabase
        .from('value_events')
        .insert({
          story_id: story.id,
          event_type: 'initialization',
          value_amount: 0,
          storyteller_share: 0,
          community_share: 0,
          description:
            'Sovereignty-aligned initialization with 70/30 split ready',
          occurred_at: new Date().toISOString(),
        });

      if (benefitError) throw benefitError;
    }

    // Step 5: Create community sovereignty records
    console.log('\\n🏛️ Creating community sovereignty records...');

    const communities = [
      {
        community_id: 'palm-island',
        community_name: 'Palm Island Community',
        sovereignty_declaration:
          'We maintain sovereignty over our stories and knowledge systems, ensuring benefits flow back to our people.',
        cultural_protocols: {
          elder_authority: true,
          seasonal_restrictions: ['wet_season', 'ceremonial_period'],
          gender_protocols: ['womens_business', 'mens_business'],
          approval_required: true,
        },
        benefit_distribution_agreement: {
          storyteller_share: 70,
          community_share: 30,
          community_fund_uses: [
            'youth_programs',
            'elder_support',
            'cultural_activities',
          ],
          distribution_method: 'community_council',
        },
      },
      {
        community_id: 'cairns-healing',
        community_name: 'Cairns Healing Circle',
        sovereignty_declaration:
          'Our healing knowledge belongs to our community and must serve our people first.',
        cultural_protocols: {
          elder_authority: true,
          womens_business: true,
          ceremonial_timing: true,
          seasonal_restrictions: ['dry_season'],
        },
        benefit_distribution_agreement: {
          storyteller_share: 70,
          community_share: 30,
          community_fund_uses: [
            'healing_programs',
            'womens_support',
            'ceremonial_costs',
          ],
          distribution_method: 'womens_council',
        },
      },
    ];

    for (const community of communities) {
      const { error: communityError } = await supabase
        .from('community_sovereignty')
        .insert(community);

      if (communityError) throw communityError;
      console.log(
        `✅ Created community sovereignty: ${community.community_name}`
      );
    }

    // Step 6: Generate summary report
    console.log('\\n📋 Staging Environment Summary:');
    console.log(`✅ ${createdUsers.length} test users created`);
    console.log(`✅ ${createdStories.length} test stories created`);
    console.log(
      `✅ ${createdStories.length} benefit tracking records initialized`
    );
    console.log(
      `✅ ${communities.length} community sovereignty records created`
    );
    console.log('\\n🎯 Environment ready for testing sovereignty principles!');
  } catch (error) {
    console.error('❌ Error setting up staging:', error);
    process.exit(1);
  }
}

// Run the setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupStagingEnvironment();
}

export { setupStagingEnvironment };
