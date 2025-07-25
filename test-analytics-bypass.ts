#!/usr/bin/env tsx
/**
 * TEMPORARY TEST SCRIPT FOR ANALYTICS SHOWCASE
 * 
 * Creates a simplified analytics endpoint to showcase the features
 * without requiring full authentication setup
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateMockAnalyticsData() {
  console.log('🎯 GENERATING MOCK ANALYTICS DATA FOR SHOWCASE');
  console.log('===============================================\n');

  try {
    // Get real data from your analysis
    const { data: analyses } = await supabase
      .from('story_analysis')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('id, storyteller_id, word_count, created_at');

    const { data: storytellers } = await supabase
      .from('storytellers')
      .select('id, full_name, created_at');

    const { data: themes } = await supabase
      .from('themes')
      .select('*')
      .eq('status', 'active');

    const { data: quotes } = await supabase
      .from('quotes')
      .select('*')
      .eq('extracted_by_ai', true);

    // Generate analytics based on real data
    const mockAnalytics = {
      platform_overview: {
        total_projects: 1, // Simplified for showcase
        active_projects: 1,
        total_stories_period: analyses?.length || 0,
        total_stories_platform: transcripts?.length || 0,
        active_storytellers_period: storytellers?.length || 0,
        total_storytellers_platform: storytellers?.length || 0,
        insights_generated: analyses?.length || 0,
        subscription_tiers: {
          community: 1,
          organization: 0,
          enterprise: 0
        },
        geographic_distribution: {
          regions: {
            'North America': 45,
            'Indigenous Territories': 30,
            'Urban Centers': 15,
            'Rural Communities': 10
          }
        }
      },

      sovereignty_metrics: {
        average_compliance_score: 95,
        excellent_compliance: 1,
        good_compliance: 0,
        needs_attention: 0,
        consent_adherence: {
          total_stories: transcripts?.length || 0,
          stories_with_consent: transcripts?.length || 0,
          adherence_rate: 100,
          consent_breakdown: {
            allowAnalysis: analyses?.length || 0,
            allowCommunitySharing: Math.floor((analyses?.length || 0) * 0.8),
            allowResearch: Math.floor((analyses?.length || 0) * 0.6),
            allowValueCreation: Math.floor((analyses?.length || 0) * 0.7),
            allowPolicyUse: Math.floor((analyses?.length || 0) * 0.5)
          }
        },
        cultural_protocols: {
          stories_with_protocols: Math.floor((analyses?.length || 0) * 0.3),
          indigenous_data_sovereignty: 1
        },
        privacy_distribution: {
          private: Math.floor((analyses?.length || 0) * 0.4),
          community: Math.floor((analyses?.length || 0) * 0.5),
          public: Math.floor((analyses?.length || 0) * 0.1)
        }
      },

      impact_metrics: {
        financial_impact: {
          total_value_created: 45000,
          community_value_share: 31500,
          storyteller_value_share: 13500,
          value_sharing_rate: 100
        },
        policy_influence: {
          policy_citations: 3,
          advocacy_uses: 7
        },
        grants_and_funding: {
          grants_received: 2,
          total_grant_amount: 35000
        },
        actionable_insights: {
          total_insights: analyses?.length || 0,
          policy_insights: Math.floor((analyses?.length || 0) * 0.2),
          community_insights: Math.floor((analyses?.length || 0) * 0.8)
        }
      },

      growth_metrics: {
        project_growth: {
          current_period: 1,
          previous_period: 0,
          growth_rate: 100,
          trend: 'strong_growth'
        },
        story_growth: {
          current_period: analyses?.length || 0,
          previous_period: Math.floor((analyses?.length || 0) * 0.7),
          growth_rate: 43,
          trend: 'growing'
        },
        storyteller_growth: {
          current_period: storytellers?.length || 0,
          previous_period: Math.floor((storytellers?.length || 0) * 0.9),
          growth_rate: 11,
          trend: 'growing'
        }
      },

      cross_project_analytics: [
        {
          project: { name: 'Empathy Ledger Community' },
          stories_submitted: analyses?.length || 0,
          active_storytellers: storytellers?.length || 0,
          community_engagement_score: 87
        }
      ],

      sovereignty_principles: {
        consent_based_aggregation: 'All metrics respect individual story consent settings',
        project_sovereignty_maintained: 'Projects maintain control over their data sharing',
        community_empowerment_focused: 'Analytics highlight community strengths and impact',
        transparency_commitment: 'Communities can see how their data contributes to insights'
      },

      analysis_period: {
        period: 'month',
        description: 'Last 30 days',
        last_updated: new Date().toISOString()
      }
    };

    console.log('✅ Mock analytics generated successfully!');
    console.log(`📊 Based on ${analyses?.length || 0} real AI analyses`);
    console.log(`👥 ${storytellers?.length || 0} storytellers`);
    console.log(`🎯 ${themes?.length || 0} active themes`);
    console.log(`💬 ${quotes?.length || 0} AI-extracted quotes`);

    // Write to a temporary file for the frontend to use
    const fs = require('fs');
    fs.writeFileSync('mock-analytics.json', JSON.stringify(mockAnalytics, null, 2));
    
    console.log('\n🎯 ANALYTICS SHOWCASE READY!');
    console.log('Now you can:');
    console.log('1. ✅ View Story Galaxy at: http://localhost:3005/visualisations/story-galaxy');
    console.log('2. ✅ Create a simple analytics view without authentication');
    console.log('3. ✅ Demonstrate the philosophical and technical excellence');

  } catch (error) {
    console.error('❌ Error generating analytics:', error);
  }
}

generateMockAnalyticsData();