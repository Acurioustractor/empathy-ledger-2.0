#!/usr/bin/env tsx
/**
 * TEST STORYTELLER FRONTEND
 * Test if the frontend components work with our migrated data
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { StorytellerCmsService } from './src/lib/storyteller-cms-service';

async function testStorytellerFrontend(): Promise<void> {
  console.log('🧪 TESTING STORYTELLER FRONTEND');
  console.log('==============================\n');
  
  try {
    const cms = new StorytellerCmsService();
    
    // Test 1: Get storyteller cards
    console.log('📋 Testing StorytellerCards component data...');
    const storytellers = await cms.getStorytellerCards({ limit: 5 });
    
    console.log(`✅ Found ${storytellers.length} storytellers for display`);
    
    if (storytellers.length > 0) {
      console.log('\n📊 SAMPLE STORYTELLER DATA:');
      storytellers.slice(0, 3).forEach((s, i) => {
        console.log(`\n${i + 1}. ${s.name}`);
        console.log(`   📸 Photo: ${s.photo ? '✅ Has image' : '❌ No image'}`);
        console.log(`   🏢 Organisation: ${s.organisation || 'None'}`);
        console.log(`   📍 Location: ${s.location || 'None'}`);
        console.log(`   🏷️  Themes: ${s.themes.length} themes`);
        console.log(`   💬 Quote: ${s.quote ? '✅ Has quote' : '❌ No quote'}`);
        if (s.photo) {
          console.log(`   🔗 Image URL: ${s.photo.substring(0, 80)}...`);
        }
      });
    }
    
    // Test 2: Test different filtering
    console.log('\n🔍 Testing filtering capabilities...');
    
    // Test by project
    console.log('\n📝 Testing project filtering...');
    const projectStorytellers = await cms.getStorytellerCards({ 
      project: 'A Curious Tractor',
      limit: 3 
    });
    console.log(`   📊 Found ${projectStorytellers.length} storytellers for "A Curious Tractor"`);
    
    // Count with images
    const withImages = storytellers.filter(s => s.photo);
    const withQuotes = storytellers.filter(s => s.quote);
    const withThemes = storytellers.filter(s => s.themes.length > 0);
    
    console.log('\n📈 CONTENT ANALYSIS:');
    console.log(`   👥 Total storytellers available: ${storytellers.length}`);
    console.log(`   📸 With profile images: ${withImages.length} (${Math.round((withImages.length/storytellers.length)*100)}%)`);
    console.log(`   💬 With quotes: ${withQuotes.length} (${Math.round((withQuotes.length/storytellers.length)*100)}%)`);
    console.log(`   🏷️  With themes: ${withThemes.length} (${Math.round((withThemes.length/storytellers.length)*100)}%)`);
    
    // Check image URLs
    const validImages = withImages.filter(s => s.photo?.includes('supabase'));
    console.log(`   🏠 Images hosted on Supabase: ${validImages.length}/${withImages.length}`);
    
    if (validImages.length !== withImages.length) {
      console.log('   ⚠️  Some images still use external URLs');
      withImages.filter(s => !s.photo?.includes('supabase')).forEach(s => {
        console.log(`     - ${s.name}: ${s.photo?.substring(0, 50)}...`);
      });
    }
    
    // Test API performance
    console.log('\n⚡ Testing API performance...');
    const startTime = Date.now();
    await cms.getStorytellerCards({ limit: 10 });
    const endTime = Date.now();
    console.log(`   🕐 API response time: ${endTime - startTime}ms`);
    
    // Frontend readiness check
    console.log('\n🎯 FRONTEND READINESS CHECK:');
    
    const readinessScore = {
      hasData: storytellers.length > 0 ? 25 : 0,
      hasImages: (withImages.length / storytellers.length) * 25,
      hasContent: ((withQuotes.length + withThemes.length) / (storytellers.length * 2)) * 25,
      hasSupabaseImages: (validImages.length / withImages.length) * 25
    };
    
    const totalScore = Object.values(readinessScore).reduce((a, b) => a + b, 0);
    
    console.log(`   📊 Data availability: ${readinessScore.hasData}/25`);
    console.log(`   📸 Image coverage: ${readinessScore.hasImages.toFixed(1)}/25`);
    console.log(`   📝 Content richness: ${readinessScore.hasContent.toFixed(1)}/25`);
    console.log(`   🏠 Supabase hosting: ${readinessScore.hasSupabaseImages.toFixed(1)}/25`);
    console.log(`   🎯 TOTAL SCORE: ${totalScore.toFixed(1)}/100`);
    
    if (totalScore >= 80) {
      console.log('\n🎉 FRONTEND READY FOR PRODUCTION!');
      console.log('   ✅ StorytellerCards component should work perfectly');
      console.log('   ✅ Images will load from Supabase');
      console.log('   ✅ Content is rich and engaging');
    } else if (totalScore >= 60) {
      console.log('\n✅ FRONTEND MOSTLY READY');
      console.log('   ✅ StorytellerCards component will work');
      console.log('   ⚠️  Some content may be missing (themes/quotes)');
    } else {
      console.log('\n⚠️  FRONTEND NEEDS WORK');
      console.log('   ❌ Missing critical data or images');
      console.log('   📋 Review migration and content processing');
    }
    
    // Next steps
    console.log('\n🚀 NEXT STEPS:');
    if (storytellers.length === 0) {
      console.log('   1. ❌ No storytellers found - check migration');
    } else {
      console.log('   1. ✅ Test StorytellerCardsClean component on website');
    }
    
    if (withImages.length < storytellers.length * 0.8) {
      console.log('   2. ⚠️  Complete image migration (currently missing some)');
    } else {
      console.log('   2. ✅ Image migration complete');
    }
    
    if (withQuotes.length === 0) {
      console.log('   3. ❌ Process transcripts to extract quotes');
    } else {
      console.log('   3. ✅ Some quotes available');
    }
    
    if (withThemes.length === 0) {
      console.log('   4. ❌ Generate themes from story content');
    } else {
      console.log('   4. ✅ Some themes available');
    }
    
    console.log('   5. 🌐 Deploy updated components to production');
    
  } catch (error) {
    console.error('💥 Frontend test failed:', error);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check if Supabase connection is working');
    console.log('   2. Verify storytellers table has data');
    console.log('   3. Check StorytellerCmsService implementation');
  }
}

async function main(): Promise<void> {
  await testStorytellerFrontend();
}

main().catch(console.error);