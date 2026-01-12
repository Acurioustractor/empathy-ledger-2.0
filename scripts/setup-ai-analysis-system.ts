/**
 * AI ANALYSIS SYSTEM SETUP
 * 
 * Sets up the complete AI analysis pipeline for processing transcripts
 * Creates themes, runs analysis, and prepares for story generation
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Load environment variables
dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

async function setupAIAnalysisSystem() {
  console.log('🤖 SETTING UP AI ANALYSIS SYSTEM');
  console.log('Creating theme taxonomy and processing pipeline\n');

  try {
    // Step 1: Create initial theme taxonomy
    console.log('📝 STEP 1: CREATING THEME TAXONOMY...');
    await createInitialThemes();

    // Step 2: Test AI connection
    console.log('\n🔌 STEP 2: TESTING AI CONNECTION...');
    await testAIConnection();

    // Step 3: Process sample transcripts
    console.log('\n🧠 STEP 3: PROCESSING SAMPLE TRANSCRIPTS...');
    await processSampleTranscripts();

    // Step 4: Set up batch processing
    console.log('\n⚙️ STEP 4: SETTING UP BATCH PROCESSING...');
    await setupBatchProcessing();

    console.log('\n✅ AI ANALYSIS SYSTEM SETUP COMPLETE!');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Run: npx tsx scripts/analyze-all-transcripts.ts');
    console.log('2. Review AI analysis results in admin dashboard');
    console.log('3. Generate stories from analyzed transcripts');

  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    throw error;
  }
}

async function createInitialThemes() {
  console.log('Creating research-backed theme taxonomy...');

  const initialThemes = [
    // Core Life Themes (Level 0)
    { name: 'Resilience', description: 'Stories of overcoming challenges and bouncing back', category: 'strength', level: 0 },
    { name: 'Community', description: 'Connection, belonging, and collective support', category: 'social', level: 0 },
    { name: 'Identity', description: 'Self-discovery, cultural identity, and personal growth', category: 'self', level: 0 },
    { name: 'Healing', description: 'Recovery, trauma processing, and restoration', category: 'wellbeing', level: 0 },
    { name: 'Wisdom', description: 'Life lessons, insights, and knowledge sharing', category: 'growth', level: 0 },
    
    // Emotional Themes (Level 0)
    { name: 'Hope', description: 'Optimism, future vision, and positive outlook', category: 'emotion', level: 0 },
    { name: 'Grief', description: 'Loss, mourning, and processing difficult emotions', category: 'emotion', level: 0 },
    { name: 'Joy', description: 'Happiness, celebration, and positive experiences', category: 'emotion', level: 0 },
    { name: 'Fear', description: 'Anxiety, worry, and challenging emotions', category: 'emotion', level: 0 },
    { name: 'Love', description: 'Relationships, care, and deep connections', category: 'emotion', level: 0 },
    
    // Life Event Themes (Level 0)
    { name: 'Family', description: 'Family relationships, dynamics, and experiences', category: 'life_event', level: 0 },
    { name: 'Work', description: 'Career, employment, and professional life', category: 'life_event', level: 0 },
    { name: 'Health', description: 'Physical and mental health experiences', category: 'life_event', level: 0 },
    { name: 'Education', description: 'Learning, schooling, and knowledge acquisition', category: 'life_event', level: 0 },
    { name: 'Migration', description: 'Moving, displacement, and new beginnings', category: 'life_event', level: 0 },
    
    // Social Issues (Level 0)
    { name: 'Injustice', description: 'Unfairness, discrimination, and systemic issues', category: 'social_issue', level: 0 },
    { name: 'Poverty', description: 'Economic hardship and financial struggles', category: 'social_issue', level: 0 },
    { name: 'Violence', description: 'Harm, abuse, and traumatic experiences', category: 'social_issue', level: 0 },
    { name: 'Equality', description: 'Rights, fairness, and social justice', category: 'social_issue', level: 0 },
    { name: 'Environment', description: 'Nature, climate, and environmental concerns', category: 'social_issue', level: 0 }
  ];

  let successCount = 0;
  let skipCount = 0;

  for (const theme of initialThemes) {
    try {
      // Check if theme already exists
      const { data: existingTheme } = await supabase
        .from('themes')
        .select('id')
        .eq('name', theme.name)
        .maybeSingle();

      if (existingTheme) {
        console.log(`   ↩️  Theme "${theme.name}" already exists`);
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
          level: theme.level,
          sort_order: successCount,
          ai_confidence_threshold: 0.75,
          status: 'active'
        });

      if (error) {
        console.log(`   ❌ Failed to create "${theme.name}": ${error.message}`);
      } else {
        console.log(`   ✅ Created theme: ${theme.name}`);
        successCount++;
      }

    } catch (error) {
      console.log(`   ❌ Exception creating "${theme.name}": ${error}`);
    }
  }

  console.log(`\n📊 Theme Creation Results:`);
  console.log(`   ✅ Created: ${successCount}`);
  console.log(`   ↩️  Already existed: ${skipCount}`);
  console.log(`   📋 Total themes available: ${successCount + skipCount}`);
}

async function testAIConnection() {
  console.log('Testing OpenAI connection and model capabilities...');

  try {
    const testPrompt = `Analyze this brief story excerpt for themes:

"After losing my job during the pandemic, I felt lost and scared. But my community rallied around me - neighbors brought food, friends helped with job applications, and my family reminded me of my strength. Six months later, I not only found a better job but also started a support group for others facing similar challenges."

Please identify the main themes and emotional elements in this story.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in narrative analysis, trauma-informed care, and community resilience. Analyze stories with cultural sensitivity and identify meaningful themes.'
        },
        {
          role: 'user',
          content: testPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const analysis = response.choices[0]?.message?.content;
    
    if (analysis) {
      console.log('✅ OpenAI connection successful');
      console.log('📝 Sample analysis preview:');
      console.log(`   "${analysis.substring(0, 150)}..."`);
      return true;
    } else {
      throw new Error('No response from OpenAI');
    }

  } catch (error) {
    console.log('❌ OpenAI connection failed:', error);
    throw error;
  }
}

async function processSampleTranscripts() {
  console.log('Processing sample transcripts to test the pipeline...');

  try {
    // Get 3 sample transcripts
    const { data: sampleTranscripts, error } = await supabase
      .from('transcripts')
      .select(`
        id,
        transcript_content,
        storyteller_id,
        storytellers!inner(full_name)
      `)
      .limit(3);

    if (error) {
      console.log('❌ Failed to fetch sample transcripts:', error.message);
      return;
    }

    if (!sampleTranscripts || sampleTranscripts.length === 0) {
      console.log('⚠️  No transcripts found for processing');
      return;
    }

    console.log(`📝 Processing ${sampleTranscripts.length} sample transcripts...`);

    for (const [index, transcript] of sampleTranscripts.entries()) {
      try {
        console.log(`\n🔄 Processing transcript ${index + 1}/${sampleTranscripts.length}`);
        console.log(`   Storyteller: ${transcript.storytellers?.full_name}`);
        console.log(`   Content length: ${transcript.transcript_content.length} characters`);

        // Check if already analyzed
        const { data: existingAnalysis } = await supabase
          .from('story_analysis')
          .select('id')
          .eq('transcript_id', transcript.id)
          .eq('analysis_type', 'theme_extraction')
          .maybeSingle();

        if (existingAnalysis) {
          console.log('   ↩️  Already analyzed, skipping');
          continue;
        }

        // Analyze with AI
        const analysis = await analyzeTranscriptWithAI(transcript.transcript_content);
        
        if (analysis) {
          // Map theme names to UUIDs
          const themeUUIDs = await mapThemeNamesToUUIDs(analysis.themes || []);
          
          // Save analysis results
          const { error: saveError } = await supabase
            .from('story_analysis')
            .insert({
              transcript_id: transcript.id,
              analysis_type: 'theme_extraction',
              ai_model_used: 'gpt-4',
              analysis_version: '1.0',
              results: analysis,
              confidence_score: analysis.confidence_score || 0.8,
              quality_score: analysis.quality_score || 0.85,
              themes_identified: themeUUIDs, // Use UUIDs instead of names
              primary_emotions: analysis.emotions || [],
              key_topics: analysis.topics || [],
              key_quotes: analysis.quotes || [],
              summary: analysis.summary || '',
              insights: analysis.insights || [],
              processing_status: 'completed',
              processing_time_seconds: 15 // Approximate
            });

          if (saveError) {
            console.log(`   ❌ Failed to save analysis: ${saveError.message}`);
          } else {
            console.log('   ✅ Analysis completed and saved');
            console.log(`   🎯 Themes: ${analysis.themes?.join(', ') || 'None identified'}`);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`   ❌ Processing failed: ${error}`);
      }
    }

  } catch (error) {
    console.log('❌ Sample processing failed:', error);
  }
}

async function analyzeTranscriptWithAI(transcriptContent: string) {
  const analysisPrompt = `As an expert in narrative analysis and trauma-informed care, analyze this personal story transcript for themes, emotions, and insights.

TRANSCRIPT:
${transcriptContent.substring(0, 3000)} ${transcriptContent.length > 3000 ? '[TRUNCATED]' : ''}

Please provide a structured analysis in this JSON format:
{
  "themes": ["primary themes found"],
  "emotions": ["main emotions expressed"],
  "topics": ["key topics discussed"],
  "quotes": ["2-3 most meaningful quotes"],
  "summary": "Brief 2-sentence summary",
  "insights": ["key insights or wisdom shared"],
  "cultural_elements": ["any cultural references or considerations"],
  "sensitivity_flags": ["any content requiring careful handling"],
  "confidence_score": 0.85,
  "quality_score": 0.90
}

Focus on:
- Resilience and strength themes
- Community and support systems
- Identity and personal growth
- Healing and recovery elements
- Wisdom and life lessons
- Cultural sensitivity and respect

Return only valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in narrative analysis, specializing in trauma-informed care and community resilience. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const analysisText = response.choices[0]?.message?.content;
    
    if (analysisText) {
      try {
        return JSON.parse(analysisText);
      } catch (parseError) {
        console.log('   ⚠️  JSON parse error, using fallback analysis');
        return {
          themes: ['Personal Story'],
          emotions: ['Mixed'],
          topics: ['Life Experience'],
          quotes: [],
          summary: 'Personal narrative requiring further analysis',
          insights: [],
          cultural_elements: [],
          sensitivity_flags: [],
          confidence_score: 0.5,
          quality_score: 0.5
        };
      }
    }

    return null;

  } catch (error) {
    console.log('   ❌ AI analysis failed:', error);
    return null;
  }
}

async function setupBatchProcessing() {
  console.log('Setting up batch processing configuration...');

  // Check current analysis status
  const { data: totalTranscripts } = await supabase
    .from('transcripts')
    .select('id', { count: 'exact', head: true });

  const { data: analyzedTranscripts } = await supabase
    .from('story_analysis')
    .select('id', { count: 'exact', head: true })
    .eq('analysis_type', 'theme_extraction');

  const remaining = (totalTranscripts?.length || 0) - (analyzedTranscripts?.length || 0);

  console.log(`📊 Batch Processing Status:`);
  console.log(`   📝 Total transcripts: ${totalTranscripts?.length || 0}`);
  console.log(`   ✅ Already analyzed: ${analyzedTranscripts?.length || 0}`);
  console.log(`   ⏳ Remaining to analyze: ${remaining}`);

  if (remaining > 0) {
    console.log(`\n🚀 Ready to process ${remaining} transcripts`);
    console.log('   Run: npx tsx scripts/analyze-all-transcripts.ts');
    console.log('   Estimated time: ~' + Math.ceil(remaining * 20 / 60) + ' minutes');
  } else {
    console.log('\n✅ All transcripts already analyzed!');
  }
}

async function mapThemeNamesToUUIDs(themeNames: string[]): Promise<string[]> {
  if (!themeNames || themeNames.length === 0) {
    return [];
  }

  // Get all available themes
  const { data: themes, error } = await supabase
    .from('themes')
    .select('id, name')
    .eq('status', 'active');

  if (error || !themes) {
    console.log('   ⚠️  Could not fetch themes for mapping, using empty array');
    return [];
  }

  // Create name to UUID mapping
  const themeMap = new Map<string, string>();
  themes.forEach(theme => {
    themeMap.set(theme.name.toLowerCase(), theme.id);
  });

  // Map theme names to UUIDs, ignoring unmatched themes
  const mappedUUIDs: string[] = [];
  themeNames.forEach(themeName => {
    const cleanName = themeName.toLowerCase().trim();
    const uuid = themeMap.get(cleanName);
    if (uuid) {
      mappedUUIDs.push(uuid);
    } else {
      console.log(`   ⚠️  Theme "${themeName}" not found in database, skipping`);
    }
  });

  return mappedUUIDs;
}

// Execute setup
setupAIAnalysisSystem()
  .then(() => {
    console.log('\n✅ AI Analysis System setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  });