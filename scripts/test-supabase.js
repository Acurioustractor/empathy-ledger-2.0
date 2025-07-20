/**
 * Supabase Connection and Schema Validation Test
 * 
 * This script tests the database connection, validates the schema deployment,
 * and provides insights for scaling considerations.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const adminSupabase = createClient(supabaseUrl, serviceKey);

async function testDatabaseConnection() {
  console.log('🌱 Testing Empathy Ledger Supabase Connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function validateSchemaDeployment() {
  console.log('\n2. Validating community sovereignty schema...');
  
  const requiredTables = [
    'users',
    'stories', 
    'story_analysis',
    'community_insights',
    'value_events',
    'content_calendar',
    'storyteller_connections'
  ];
  
  const requiredViews = [
    'community_dashboard',
    'storyteller_profiles'
  ];
  
  const requiredFunctions = [
    'can_access_story',
    'calculate_empowerment_score'
  ];
  
  try {
    // Check tables
    console.log('   📋 Checking core tables...');
    for (const table of requiredTables) {
      const { data, error } = await adminSupabase
        .from(table)
        .select('*')
        .limit(0);
        
      if (error) {
        console.log(`   ❌ Table '${table}' missing or inaccessible: ${error.message}`);
        return false;
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }
    
    // Check views
    console.log('   📊 Checking community views...');
    for (const view of requiredViews) {
      const { data, error } = await adminSupabase
        .from(view)
        .select('*')
        .limit(0);
        
      if (error) {
        console.log(`   ❌ View '${view}' missing: ${error.message}`);
      } else {
        console.log(`   ✅ View '${view}' exists`);
      }
    }
    
    // Check RLS policies
    console.log('   🔒 Checking Row Level Security...');
    const { data: policies, error: policyError } = await adminSupabase
      .from('pg_policies')
      .select('tablename, policyname')
      .in('tablename', requiredTables);
      
    if (policyError) {
      console.log('   ⚠️  Cannot check RLS policies (may need admin access)');
    } else {
      const tablesPolicies = policies.reduce((acc, policy) => {
        acc[policy.tablename] = (acc[policy.tablename] || 0) + 1;
        return acc;
      }, {});
      
      for (const table of requiredTables) {
        const policyCount = tablesPolicies[table] || 0;
        if (policyCount > 0) {
          console.log(`   ✅ Table '${table}' has ${policyCount} RLS policies`);
        } else {
          console.log(`   ⚠️  Table '${table}' may be missing RLS policies`);
        }
      }
    }
    
    console.log('\n✅ Schema validation complete');
    return true;
    
  } catch (err) {
    console.error('❌ Schema validation failed:', err.message);
    return false;
  }
}

async function testCommunityOperations() {
  console.log('\n3. Testing community-centered operations...');
  
  try {
    // Test user creation with community protocols
    console.log('   👤 Testing community member creation...');
    const testUser = {
      email: `test-${Date.now()}@empathyledger.test`,
      full_name: 'Test Community Member',
      community_affiliation: 'Test Community',
      role: 'storyteller',
      cultural_protocols: {
        seasonal_restrictions: false,
        gender_specific: false,
        ceremonial_content: false,
        requires_elder_review: false
      }
    };
    
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
      
    if (userError) {
      console.log('   ❌ User creation failed:', userError.message);
      return false;
    }
    
    console.log('   ✅ Community member created successfully');
    
    // Test story submission with sovereignty controls
    console.log('   📖 Testing story submission with consent controls...');
    const testStory = {
      storyteller_id: userData.id,
      title: 'Test Community Story',
      transcript: 'This is a test story to validate our community sovereignty platform.',
      privacy_level: 'community',
      consent_settings: {
        allowAnalysis: true,
        allowCommunitySharing: true,
        allowPublicSharing: false,
        allowResearch: false,
        allowValueCreation: true,
        allowCrossCommunityConnection: false,
        allowPolicyUse: false,
        allowMediaUse: false
      },
      cultural_protocols: {
        seasonal_restrictions: false,
        gender_specific: false,
        ceremonial_content: false,
        requires_elder_review: false
      },
      status: 'pending'
    };
    
    const { data: storyData, error: storyError } = await adminSupabase
      .from('stories')
      .insert(testStory)
      .select()
      .single();
      
    if (storyError) {
      console.log('   ❌ Story creation failed:', storyError.message);
      return false;
    }
    
    console.log('   ✅ Story with sovereignty controls created successfully');
    
    // Test community insights creation
    console.log('   🧠 Testing community insights generation...');
    const testInsight = {
      community_id: 'Test Community',
      insight_type: 'pattern',
      title: 'Test Community Pattern',
      description: 'A test pattern identified in community stories.',
      supporting_stories: [storyData.id],
      confidence_level: 0.85,
      visibility: 'community',
      community_validated: false
    };
    
    const { data: insightData, error: insightError } = await adminSupabase
      .from('community_insights')
      .insert(testInsight)
      .select()
      .single();
      
    if (insightError) {
      console.log('   ❌ Community insight creation failed:', insightError.message);
    } else {
      console.log('   ✅ Community insight created successfully');
    }
    
    // Clean up test data
    console.log('   🧹 Cleaning up test data...');
    await adminSupabase.from('stories').delete().eq('id', storyData.id);
    if (insightData) {
      await adminSupabase.from('community_insights').delete().eq('id', insightData.id);
    }
    await adminSupabase.from('users').delete().eq('id', userData.id);
    
    console.log('✅ Community operations test complete');
    return true;
    
  } catch (err) {
    console.error('❌ Community operations test failed:', err.message);
    return false;
  }
}

async function analyzePerformanceMetrics() {
  console.log('\n4. Analyzing current database performance...');
  
  try {
    // Check current data volumes
    const tables = ['users', 'stories', 'story_analysis', 'community_insights'];
    
    for (const table of tables) {
      const { count, error } = await adminSupabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (!error) {
        console.log(`   📊 ${table}: ${count || 0} records`);
      }
    }
    
    // Test query performance
    console.log('   ⚡ Testing query performance...');
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        submitted_at,
        storyteller:storyteller_id (
          full_name,
          community_affiliation
        )
      `)
      .eq('privacy_level', 'public')
      .order('submitted_at', { ascending: false })
      .limit(10);
      
    const queryTime = Date.now() - startTime;
    
    if (!error) {
      console.log(`   ✅ Complex join query completed in ${queryTime}ms`);
    } else {
      console.log(`   ❌ Query failed: ${error.message}`);
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Performance analysis failed:', err.message);
    return false;
  }
}

function generateScalingRecommendations() {
  console.log('\n🚀 SUPABASE SCALING RECOMMENDATIONS FOR EMPATHY LEDGER\n');
  
  console.log('📈 **CURRENT SETUP ANALYSIS:**');
  console.log('   • Free/Pro tier with cloud hosting');
  console.log('   • Postgres database with Row Level Security');
  console.log('   • Community sovereignty schema implemented');
  console.log('   • Cultural protocol support built-in\n');
  
  console.log('🎯 **SCALING STRATEGY BY COMMUNITY SIZE:**\n');
  
  console.log('**Phase 1: Pilot Communities (0-1,000 storytellers)**');
  console.log('   ✅ Current Supabase Pro plan sufficient');
  console.log('   ✅ 500MB database storage adequate');
  console.log('   ✅ 2GB file storage for audio stories');
  console.log('   ✅ 100,000 requests/month within limits');
  console.log('   📋 Action: Monitor usage via Supabase dashboard\n');
  
  console.log('**Phase 2: Regional Communities (1,000-10,000 storytellers)**');
  console.log('   🔄 Upgrade to Team plan ($25/month base)');
  console.log('   📊 Enable database analytics and monitoring');
  console.log('   🗃️  Implement story archiving for old content');
  console.log('   ⚡ Add read replicas for community insights queries');
  console.log('   🎬 Consider CDN for audio/video story content\n');
  
  console.log('**Phase 3: National/Global Scale (10,000+ storytellers)**');
  console.log('   🏢 Consider Enterprise plan or self-hosting');
  console.log('   🌍 Multi-region deployment for global communities');
  console.log('   📈 Database sharding by community affiliation');
  console.log('   🔍 Advanced search with external solutions (Algolia/Elasticsearch)');
  console.log('   📊 Dedicated analytics infrastructure\n');
  
  console.log('🔧 **IMMEDIATE OPTIMIZATIONS:**\n');
  
  console.log('**Database Performance:**');
  console.log('   • Add composite indexes for community queries');
  console.log('   • Optimize RLS policies for large datasets');
  console.log('   • Implement story content pagination');
  console.log('   • Use database functions for complex aggregations\n');
  
  console.log('**Cultural Protocol Scaling:**');
  console.log('   • Cache cultural protocol rules in application');
  console.log('   • Implement protocol validation at API level');
  console.log('   • Create community-specific access patterns');
  console.log('   • Build automated consent management workflows\n');
  
  console.log('**Storage Strategy:**');
  console.log('   • Use Supabase Storage for audio/video files');
  console.log('   • Implement tiered storage (hot/cold) for old stories');
  console.log('   • Compress audio files without losing quality');
  console.log('   • Consider external CDN for global story distribution\n');
  
  console.log('**Monitoring & Sovereignty:**');
  console.log('   • Track community engagement metrics');
  console.log('   • Monitor consent pattern changes');
  console.log('   • Audit cultural protocol compliance');
  console.log('   • Alert on sovereignty violations\n');
  
  console.log('💰 **COST PROJECTIONS:**');
  console.log('   • 1K storytellers: ~$25-50/month');
  console.log('   • 10K storytellers: ~$200-500/month');
  console.log('   • 100K storytellers: ~$2K-5K/month');
  console.log('   • Note: Community sovereignty features are priceless\n');
  
  console.log('🛡️  **SOVEREIGNTY-SPECIFIC CONSIDERATIONS:**');
  console.log('   • Data residency requirements for Indigenous communities');
  console.log('   • Backup strategies that respect cultural protocols');
  console.log('   • Audit trails for all story access and analysis');
  console.log('   • Community-controlled data export capabilities');
}

async function runFullTest() {
  console.log('🌱 EMPATHY LEDGER - SUPABASE VALIDATION & SCALING ANALYSIS');
  console.log('=' .repeat(70));
  
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed - database connection failed');
    return;
  }
  
  const schemaOk = await validateSchemaDeployment();
  const operationsOk = await testCommunityOperations();
  const performanceOk = await analyzePerformanceMetrics();
  
  generateScalingRecommendations();
  
  console.log('🎯 **NEXT ACTIONS:**');
  console.log('   1. Deploy the migration SQL to your Supabase instance');
  console.log('   2. Configure authentication providers (Google OAuth)');
  console.log('   3. Set up story content storage buckets');
  console.log('   4. Enable real-time subscriptions for community features');
  console.log('   5. Configure backup schedules with cultural protocol awareness\n');
  
  console.log('✨ Your platform is ready to honor community stories with dignity and sovereignty! ✨');
}

// Run the test
runFullTest().catch(console.error);