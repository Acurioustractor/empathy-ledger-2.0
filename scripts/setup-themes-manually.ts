/**
 * MANUAL THEME SETUP
 * 
 * Creates initial theme taxonomy for story categorization
 * Run this to populate the themes table
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function setupThemes() {
  console.log('📝 SETTING UP THEME TAXONOMY');
  console.log('Creating research-backed themes for story categorization\n');

  const initialThemes = [
    // Core Life Themes
    { name: 'Resilience', description: 'Stories of overcoming challenges and bouncing back', category: 'strength' },
    { name: 'Community', description: 'Connection, belonging, and collective support', category: 'social' },
    { name: 'Identity', description: 'Self-discovery, cultural identity, and personal growth', category: 'self' },
    { name: 'Healing', description: 'Recovery, trauma processing, and restoration', category: 'wellbeing' },
    { name: 'Wisdom', description: 'Life lessons, insights, and knowledge sharing', category: 'growth' },
    
    // Emotional Themes
    { name: 'Hope', description: 'Optimism, future vision, and positive outlook', category: 'emotion' },
    { name: 'Grief', description: 'Loss, mourning, and processing difficult emotions', category: 'emotion' },
    { name: 'Joy', description: 'Happiness, celebration, and positive experiences', category: 'emotion' },
    { name: 'Fear', description: 'Anxiety, worry, and challenging emotions', category: 'emotion' },
    { name: 'Love', description: 'Relationships, care, and deep connections', category: 'emotion' },
    
    // Life Events
    { name: 'Family', description: 'Family relationships, dynamics, and experiences', category: 'life_event' },
    { name: 'Work', description: 'Career, employment, and professional life', category: 'life_event' },
    { name: 'Health', description: 'Physical and mental health experiences', category: 'life_event' },
    { name: 'Education', description: 'Learning, schooling, and knowledge acquisition', category: 'life_event' },
    { name: 'Migration', description: 'Moving, displacement, and new beginnings', category: 'life_event' },
    
    // Social Issues
    { name: 'Injustice', description: 'Unfairness, discrimination, and systemic issues', category: 'social_issue' },
    { name: 'Poverty', description: 'Economic hardship and financial struggles', category: 'social_issue' },
    { name: 'Violence', description: 'Harm, abuse, and traumatic experiences', category: 'social_issue' },
    { name: 'Equality', description: 'Rights, fairness, and social justice', category: 'social_issue' },
    { name: 'Environment', description: 'Nature, climate, and environmental concerns', category: 'social_issue' }
  ];

  console.log(`Creating ${initialThemes.length} initial themes...`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const [index, theme] of initialThemes.entries()) {
    try {
      console.log(`\n${index + 1}/${initialThemes.length}: ${theme.name}`);

      // Check if theme already exists
      const { data: existingTheme } = await supabase
        .from('themes')
        .select('id')
        .eq('name', theme.name)
        .maybeSingle();

      if (existingTheme) {
        console.log(`   ↩️  Already exists`);
        skipCount++;
        continue;
      }

      // Create theme
      const { error } = await supabase
        .from('themes')
        .insert({
          name: theme.name,
          description: theme.description,
          category: theme.category,
          level: 0,
          sort_order: index,
          ai_confidence_threshold: 0.75,
          status: 'active'
        });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Created successfully`);
        successCount++;
      }

    } catch (error) {
      console.log(`   ❌ Exception: ${error}`);
      errorCount++;
    }
  }

  console.log(`\n📊 THEME CREATION RESULTS:`);
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ↩️  Already existed: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total themes: ${successCount + skipCount}`);

  if (successCount > 0) {
    console.log(`\n🎉 THEME TAXONOMY CREATED!`);
    console.log(`\n🎯 WHAT THIS ENABLES:`);
    console.log(`✅ STORY CATEGORIZATION: AI can classify stories by themes`);
    console.log(`✅ PATTERN ANALYSIS: Identify common themes across communities`);
    console.log(`✅ SEARCH & DISCOVERY: Users can find stories by theme`);
    console.log(`✅ INSIGHT GENERATION: Generate reports on theme frequency`);
  }

  // Show current themes
  const { data: allThemes } = await supabase
    .from('themes')
    .select('name, category, description')
    .eq('status', 'active')
    .order('category', { ascending: true });

  if (allThemes && allThemes.length > 0) {
    console.log(`\n📋 AVAILABLE THEMES BY CATEGORY:`);
    
    const themesByCategory = allThemes.reduce((acc, theme) => {
      if (!acc[theme.category]) acc[theme.category] = [];
      acc[theme.category].push(theme);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(themesByCategory).forEach(([category, themes]) => {
      console.log(`\n   ${category.toUpperCase()}:`);
      themes.forEach(theme => {
        console.log(`     • ${theme.name}: ${theme.description}`);
      });
    });
  }
}

// Execute setup
setupThemes()
  .then(() => {
    console.log('\n✅ Theme setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Theme setup failed:', error);
    process.exit(1);
  });