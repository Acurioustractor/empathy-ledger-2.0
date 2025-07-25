#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM0NjIyOSwiZXhwIjoyMDY3OTIyMjI5fQ.wyizbOWRxMULUp6WBojJPfey1ta8-Al1OlZqDDIPIHo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeFormattingIssues() {
  console.log('🔍 DETAILED FORMATTING ANALYSIS\n');
  
  // Get all stories to analyze patterns
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, content, transcription, created_at')
    .limit(10);
    
  if (error) {
    console.error('Error fetching stories:', error);
    return;
  }
  
  if (!stories || stories.length === 0) {
    console.log('No stories found.');
    return;
  }
  
  console.log(`🔄 Analyzing ${stories.length} stories for formatting issues...\n`);
  
  // Track different types of formatting issues
  const formatIssues = {
    escapedMarkdown: { count: 0, examples: [] },
    timestamps: { count: 0, examples: [] },
    strikethrough: { count: 0, examples: [] },
    doubleLineBreaks: { count: 0, examples: [] },
    headers: { count: 0, examples: [] },
    speakerLabels: { count: 0, examples: [] },
    other: { count: 0, examples: [] }
  };
  
  stories.forEach((story, index) => {
    if (!story.content) return;
    
    const content = story.content;
    console.log(`\n📖 STORY ${index + 1}: "${story.title}"`);
    console.log('─'.repeat(50));
    
    // Check for escaped markdown headers
    const escapedHeaders = content.match(/\\#/g);
    if (escapedHeaders) {
      formatIssues.escapedMarkdown.count++;
      formatIssues.escapedMarkdown.examples.push({
        id: story.id,
        title: story.title,
        issue: `${escapedHeaders.length} escaped headers`
      });
      console.log(`❌ Escaped Headers: ${escapedHeaders.length} occurrences`);
    }
    
    // Check for escaped asterisks (bold/italic)
    const escapedAsterisks = content.match(/\\\\?\*/g);
    if (escapedAsterisks) {
      console.log(`❌ Escaped Asterisks: ${escapedAsterisks.length} occurrences`);
    }
    
    // Check for timestamps [00:00:00]
    const timestamps = content.match(/\[(\d{2}:)?\d{2}:\d{2}\]/g);
    if (timestamps) {
      formatIssues.timestamps.count++;
      formatIssues.timestamps.examples.push({
        id: story.id,
        title: story.title,
        issue: `${timestamps.length} timestamps`
      });
      console.log(`🕐 Timestamps: ${timestamps.length} occurrences`);
    }
    
    // Check for strikethrough patterns ~~text~~
    const strikethrough = content.match(/~~[^~]*~~/g);
    if (strikethrough) {
      formatIssues.strikethrough.count++;
      formatIssues.strikethrough.examples.push({
        id: story.id,
        title: story.title,
        issue: `${strikethrough.length} strikethrough sections`
      });
      console.log(`~~ Strikethrough: ${strikethrough.length} occurrences`);
    }
    
    // Check for speaker labels (Name:)
    const speakerLabels = content.match(/\*\*[^:]+:\*\*/g);
    if (speakerLabels) {
      formatIssues.speakerLabels.count++;
      formatIssues.speakerLabels.examples.push({
        id: story.id, 
        title: story.title,
        issue: `${speakerLabels.length} speaker labels`
      });
      console.log(`🗣️ Speaker Labels: ${speakerLabels.length} occurrences`);
    }
    
    // Check for excessive line breaks
    const doubleBreaks = content.match(/\n\n+/g);
    if (doubleBreaks) {
      formatIssues.doubleLineBreaks.count++;
      formatIssues.doubleLineBreaks.examples.push({
        id: story.id,
        title: story.title,
        issue: `${doubleBreaks.length} double line breaks`
      });
      console.log(`📄 Double Line Breaks: ${doubleBreaks.length} occurrences`);
    }
    
    // Show raw content sample
    console.log('\n🔍 Raw Content Sample (first 200 chars):');
    console.log('"' + content.substring(0, 200).replace(/\n/g, '\\n') + '"');
    
    if (content.length > 200) {
      console.log('...[truncated]');
    }
  });
  
  // Summary report
  console.log('\n\n📊 FORMATTING ISSUES SUMMARY');
  console.log('═'.repeat(60));
  
  Object.entries(formatIssues).forEach(([issueType, data]) => {
    if (data.count > 0) {
      console.log(`\n🚨 ${issueType.toUpperCase()}: ${data.count} stories affected`);
      console.log('Examples:');
      data.examples.slice(0, 3).forEach(example => {
        console.log(`  - "${example.title}" (${example.issue})`);
      });
    }
  });
  
  // Generate cleanup recommendations
  console.log('\n\n🛠️ CLEANUP RECOMMENDATIONS');
  console.log('═'.repeat(60));
  
  if (formatIssues.escapedMarkdown.count > 0) {
    console.log('\n1. ESCAPED MARKDOWN HEADERS');
    console.log('   Problem: Headers show as "\\# Title" instead of "# Title"');
    console.log('   Solution: Replace \\# with # for proper header formatting');
    console.log(`   SQL: UPDATE stories SET content = REPLACE(content, '\\\\#', '#');`);
  }
  
  if (formatIssues.timestamps.count > 0) {
    console.log('\n2. TRANSCRIPT TIMESTAMPS');
    console.log('   Problem: [00:00:00] timestamps in story content');
    console.log('   Solution: Move to separate metadata field or remove if not needed');
    console.log('   - Option A: Extract to timeline_markers JSONB field');
    console.log('   - Option B: Remove entirely if just transcript artifacts');
  }
  
  if (formatIssues.strikethrough.count > 0) {
    console.log('\n3. STRIKETHROUGH TEXT');
    console.log('   Problem: ~~text~~ appears as crossed-out content');
    console.log('   Solution: Convert to regular text or use different formatting');
    console.log('   - May indicate transcript corrections or editing marks');
    console.log('   - Consider removing ~~ markers for cleaner presentation');
  }
  
  if (formatIssues.speakerLabels.count > 0) {
    console.log('\n4. SPEAKER LABELS');
    console.log('   Problem: **Speaker:** labels mixed with story content');
    console.log('   Solution: Clean formatting or move to structured data');
    console.log('   - Option A: Convert to cleaner format like "Speaker: content"');
    console.log('   - Option B: Extract speaker turns to separate table');
  }
  
  if (formatIssues.doubleLineBreaks.count > 0) {
    console.log('\n5. EXCESSIVE LINE BREAKS');
    console.log('   Problem: Multiple consecutive line breaks create large gaps');
    console.log('   Solution: Normalize to single paragraph breaks');
    console.log(`   SQL: UPDATE stories SET content = REGEXP_REPLACE(content, '\\n{3,}', '\\n\\n', 'g');`);
  }
  
  console.log('\n\n🎯 PRIORITY ACTIONS:');
  console.log('1. Fix escaped markdown (highest impact for readability)');
  console.log('2. Clean up timestamp artifacts from transcripts');
  console.log('3. Normalize line break patterns');
  console.log('4. Decide on speaker label formatting standard');
  console.log('5. Review strikethrough usage and convert appropriately');
}

// Run the analysis
analyzeFormattingIssues().catch(console.error);