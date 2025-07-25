#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM0NjIyOSwiZXhwIjoyMDY3OTIyMjI5fQ.wyizbOWRxMULUp6WBojJPfey1ta8-Al1OlZqDDIPIHo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeStoriesTable() {
  console.log('🔍 ANALYZING STORIES TABLE STRUCTURE AND CONTENT\n');
  
  // 1. Get table schema information
  console.log('📋 STORIES TABLE SCHEMA:');
  console.log('====================================');
  
  const schemaQuery = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = 'stories' 
      AND table_schema = 'public'
    ORDER BY ordinal_position;
  `;
  
  const { data: schema, error: schemaError } = await supabase.rpc('exec_sql', { query: schemaQuery });
  
  if (schemaError) {
    console.error('Schema query error:', schemaError);
  } else if (schema && schema.length > 0) {
    schema.forEach((col: any) => {
      console.log(`${col.column_name.padEnd(30)} | ${col.data_type.padEnd(20)} | Nullable: ${col.is_nullable}`);
    });
  } else {
    console.log('No schema data found or function not available. Listing known columns from SQL file:');
    const knownColumns = [
      'id - UUID - Primary Key',
      'title - TEXT - Story title',
      'content - TEXT - Main story content (potential Markdown)',
      'summary - TEXT - AI-generated or user summary',
      'audio_url - TEXT - Audio file URL', 
      'video_url - TEXT - Video file URL',
      'image_urls - TEXT[] - Array of image URLs',
      'transcription - TEXT - Audio/video transcription',
      'transcription_confidence - FLOAT - AI transcription confidence',
      'category - story_category - Enum category',
      'themes - TEXT[] - Story themes array',
      'tags - TEXT[] - Story tags array',
      'privacy_level - privacy_level - public/community/organization/private',
      'can_be_shared - BOOLEAN - Sharing permission',
      'allow_research_use - BOOLEAN - Research permission',
      'allow_ai_analysis - BOOLEAN - AI analysis permission',
      'contributor_id - UUID - References profiles(id)',
      'organization_id - UUID - References organizations(id)',
      'community_id - UUID - References communities(id)',
      'contributor_age_range - TEXT - Age range info',
      'contributor_location - TEXT - General location',
      'contributor_background - JSONB - Demographic context',
      'sentiment_score - FLOAT - AI sentiment analysis',
      'emotion_scores - JSONB - Emotion analysis results',
      'topic_scores - JSONB - Topic modeling results',
      'language_detected - TEXT - Detected language',
      'content_warnings - TEXT[] - Content warning tags',
      'view_count - INTEGER - View counter',
      'share_count - INTEGER - Share counter', 
      'comment_count - INTEGER - Comment counter',
      'reaction_count - INTEGER - Reaction counter',
      'impact_score - FLOAT - Impact measurement',
      'cited_in_reports - INTEGER - Report citation count',
      'policy_influence_score - FLOAT - Policy influence metric',
      'status - story_status - draft/pending/approved/featured/archived',
      'moderation_notes - TEXT - Moderation comments',
      'flagged_content - BOOLEAN - Content flagged?',
      'reviewed_by - UUID - Reviewer ID',
      'reviewed_at - TIMESTAMPTZ - Review timestamp',
      'published_at - TIMESTAMPTZ - Publish timestamp',
      'featured_until - TIMESTAMPTZ - Feature expiry',
      'created_at - TIMESTAMPTZ - Creation timestamp',
      'updated_at - TIMESTAMPTZ - Last update timestamp',
      'search_vector - tsvector - Full-text search vector (generated)'
    ];
    
    knownColumns.forEach(col => console.log(col));
  }
  
  console.log('\n📊 SAMPLE STORIES DATA:');
  console.log('====================================');
  
  // 2. Get count of stories
  const { count, error: countError } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Count error:', countError);
  } else {
    console.log(`Total stories in database: ${count || 0}`);
  }
  
  // 3. Get sample stories with full data
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('*')
    .limit(3);
    
  if (storiesError) {
    console.error('Stories query error:', storiesError);
    return;
  }
  
  if (!stories || stories.length === 0) {
    console.log('No stories found in database.');
    return;
  }
  
  console.log(`\nFound ${stories.length} sample stories:\n`);
  
  stories.forEach((story, index) => {
    console.log(`\n🔸 STORY ${index + 1}:`);
    console.log('─'.repeat(60));
    console.log(`ID: ${story.id}`);
    console.log(`Title: ${story.title || 'No title'}`);
    console.log(`Status: ${story.status}`);
    console.log(`Privacy Level: ${story.privacy_level}`);
    console.log(`Category: ${story.category}`);
    console.log(`Created: ${story.created_at}`);
    
    // Analyze content field for formatting issues
    if (story.content) {
      console.log('\n📝 CONTENT ANALYSIS:');
      console.log(`Content length: ${story.content.length} characters`);
      
      // Check for various Markdown patterns that might be causing issues
      const mdPatterns = {
        headers: /^#{1,6}\s/gm,
        boldItalic: /(\*{1,3}[^*]+\*{1,3}|_{1,3}[^_]+_{1,3})/g,
        codeBlocks: /```[\s\S]*?```/g,
        inlineCode: /`[^`]+`/g,
        links: /\[([^\]]+)\]\(([^)]+)\)/g,
        images: /!\[([^\]]*)\]\(([^)]+)\)/g,
        lists: /^[\s]*[-*+]\s/gm,
        numberedLists: /^[\s]*\d+\.\s/gm,
        blockquotes: /^>/gm,
        lineBreaks: /\n{2,}/g,
        htmlTags: /<[^>]+>/g
      };
      
      const detectedPatterns = [];
      
      Object.entries(mdPatterns).forEach(([name, pattern]) => {
        const matches = story.content.match(pattern);
        if (matches) {
          detectedPatterns.push(`${name}: ${matches.length} occurrences`);
        }
      });
      
      if (detectedPatterns.length > 0) {
        console.log('🚨 DETECTED MARKDOWN/FORMATTING PATTERNS:');
        detectedPatterns.forEach(pattern => console.log(`  - ${pattern}`));
      } else {
        console.log('✅ No obvious Markdown patterns detected');
      }
      
      // Show first 300 characters of content
      console.log('\n📖 CONTENT PREVIEW (first 300 chars):');
      console.log('─'.repeat(40));
      console.log(story.content.substring(0, 300) + (story.content.length > 300 ? '...' : ''));
      console.log('─'.repeat(40));
    }
    
    // Check media fields
    const mediaFields = [];
    if (story.audio_url) mediaFields.push(`Audio: ${story.audio_url}`);
    if (story.video_url) mediaFields.push(`Video: ${story.video_url}`);
    if (story.image_urls && story.image_urls.length > 0) mediaFields.push(`Images: ${story.image_urls.length} files`);
    if (story.transcription) mediaFields.push(`Transcription: ${story.transcription.length} chars`);
    
    if (mediaFields.length > 0) {
      console.log('\n🎬 MEDIA CONTENT:');
      mediaFields.forEach(field => console.log(`  - ${field}`));
    }
    
    // Check AI analysis fields
    const aiFields = [];
    if (story.sentiment_score !== null) aiFields.push(`Sentiment: ${story.sentiment_score}`);
    if (story.emotion_scores) aiFields.push(`Emotions: ${Object.keys(story.emotion_scores).length} types`);
    if (story.topic_scores) aiFields.push(`Topics: ${Object.keys(story.topic_scores).length} topics`);
    if (story.themes && story.themes.length > 0) aiFields.push(`Themes: ${story.themes.join(', ')}`);
    
    if (aiFields.length > 0) {
      console.log('\n🤖 AI ANALYSIS:');
      aiFields.forEach(field => console.log(`  - ${field}`));
    }
  });
  
  console.log('\n\n🎯 RICH CONTENT FIELDS SUMMARY:');
  console.log('====================================');
  console.log('Media Fields:');
  console.log('  - audio_url: Audio file URLs');
  console.log('  - video_url: Video file URLs'); 
  console.log('  - image_urls: Array of image URLs');
  console.log('  - transcription: Audio/video transcripts');
  console.log('  - transcription_confidence: AI confidence score');
  
  console.log('\nAI Analysis Fields:');
  console.log('  - sentiment_score: Sentiment analysis (-1 to 1)');
  console.log('  - emotion_scores: JSONB emotion analysis');
  console.log('  - topic_scores: JSONB topic modeling results'); 
  console.log('  - themes: TEXT[] thematic categorization');
  console.log('  - content_warnings: TEXT[] flagged content types');
  console.log('  - language_detected: Detected language');
  
  console.log('\nContent Fields:');
  console.log('  - content: Main story text (potential Markdown formatting issues)');
  console.log('  - summary: AI-generated or user summary');
  console.log('  - title: Story title');
  
  console.log('\nMetadata Fields:');
  console.log('  - contributor_background: JSONB demographic context');
  console.log('  - tags: TEXT[] user-defined tags');
  console.log('  - category: Enum category (healthcare, education, etc.)');
  
  console.log('\n✅ Analysis complete!');
}

// Run the analysis
analyzeStoriesTable().catch(console.error);