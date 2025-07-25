/**
 * AI-Powered Story Beautification System
 * Transforms raw Descript transcripts into elegant, readable stories
 */

interface StoryContent {
  raw_content: string;
  title?: string;
  storyteller_name?: string;
}

interface BeautifiedStory {
  title: string;
  summary: string;
  content: string;
  key_quotes: string[];
  themes: string[];
  emotions: string[];
  content_warnings?: string[];
  estimated_reading_time: number;
  quality_score: number;
}

export class StoryBeautifier {
  
  /**
   * Master function to transform raw transcript into beautiful story
   */
  static async beautifyStory(storyContent: StoryContent): Promise<BeautifiedStory> {
    // Step 1: Clean the raw formatting
    const cleanedContent = this.cleanRawFormatting(storyContent.raw_content);
    
    // Step 2: Transform to narrative format
    const narrativeContent = this.transformToNarrative(cleanedContent);
    
    // Step 3: Generate AI enhancements
    const aiEnhancements = await this.generateAIEnhancements(narrativeContent, storyContent);
    
    // Step 4: Calculate metrics
    const metrics = this.calculateMetrics(narrativeContent);
    
    return {
      title: aiEnhancements.title || storyContent.title || 'Untitled Story',
      summary: aiEnhancements.summary,
      content: narrativeContent,
      key_quotes: aiEnhancements.key_quotes,
      themes: aiEnhancements.themes,
      emotions: aiEnhancements.emotions,
      content_warnings: aiEnhancements.content_warnings,
      estimated_reading_time: metrics.reading_time,
      quality_score: metrics.quality_score
    };
  }

  /**
   * Step 1: Clean raw formatting issues
   */
  private static cleanRawFormatting(content: string): string {
    return content
      // Fix escaped markdown headers
      .replace(/\\#/g, '#')
      .replace(/\\(\*\*)/g, '$1')
      .replace(/\\(_)/g, '$1')
      
      // Remove transcript timestamps
      .replace(/\[\d{2}:\d{2}:\d{2}\]/g, '')
      .replace(/\[\d{2}:\d{2}:\d{2}\.\d{3}\]/g, '')
      
      // Remove Descript artifacts
      .replace(/\[SPEAKER_\d+\]/g, '')
      .replace(/\[UNKNOWN_SPEAKER\]/g, '')
      .replace(/\[INAUDIBLE\]/g, '[inaudible]')
      .replace(/\[CROSSTALK\]/g, '')
      
      // Clean up strikethrough (keep content, remove formatting)
      .replace(/~~([^~]+)~~/g, '$1')
      
      // Normalize line breaks (max 2 consecutive)
      .replace(/\n{3,}/g, '\n\n')
      
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, '')
      
      // Clean up speaker transitions
      .replace(/\*\*([^*]+):\*\*/g, '\n\n**$1:**')
      
      // Remove duplicate punctuation
      .replace(/([.!?]){2,}/g, '$1')
      
      // Fix spacing around punctuation
      .replace(/\s+([.!?])/g, '$1')
      .replace(/([.!?])([A-Z])/g, '$1 $2');
  }

  /**
   * Step 2: Transform transcript into narrative flow
   */
  private static transformToNarrative(content: string): string {
    // Split into paragraphs for processing
    const paragraphs = content.split(/\n\s*\n/);
    
    const processedParagraphs = paragraphs
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // Convert speaker labels to narrative flow
        if (paragraph.match(/^\*\*[^*]+:\*\*/)) {
          // For interview format, keep speaker structure but clean it
          return paragraph
            .replace(/^\*\*([^*]+):\*\*\s*/, '**$1:** ')
            .replace(/\s+/g, ' ');
        }
        
        // Regular paragraph - ensure proper sentence structure
        return paragraph
          .replace(/\s+/g, ' ')
          .replace(/^([a-z])/, (match, letter) => letter.toUpperCase());
      })
      .filter(paragraph => paragraph.length > 10); // Remove very short fragments
    
    return processedParagraphs.join('\n\n');
  }

  /**
   * Step 3: Generate AI enhancements using Claude
   */
  private static async generateAIEnhancements(content: string, originalStory: StoryContent): Promise<{
    title: string;
    summary: string;
    key_quotes: string[];
    themes: string[];
    emotions: string[];
    content_warnings?: string[];
  }> {
    try {
      // This would integrate with Claude API for analysis
      // For now, returning structured fallback
      
      const wordCount = content.split(' ').length;
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Extract potential quotes (longer sentences with emotional content)
      const potentialQuotes = sentences
        .filter(sentence => sentence.length > 50 && sentence.length < 200)
        .filter(sentence => this.hasEmotionalContent(sentence))
        .slice(0, 5);
      
      // Basic theme extraction (this would be enhanced with AI)
      const themes = this.extractBasicThemes(content);
      
      // Basic emotion detection
      const emotions = this.extractBasicEmotions(content);
      
      return {
        title: originalStory.title || this.generateTitleFromContent(content),
        summary: this.generateSummary(content, wordCount),
        key_quotes: potentialQuotes,
        themes,
        emotions,
        content_warnings: this.detectContentWarnings(content)
      };
      
    } catch (error) {
      console.error('AI enhancement failed, using fallbacks:', error);
      return {
        title: originalStory.title || 'Community Story',
        summary: 'A meaningful story from our community.',
        key_quotes: [],
        themes: ['community', 'experience'],
        emotions: ['reflective']
      };
    }
  }

  /**
   * Helper: Check if sentence has emotional content
   */
  private static hasEmotionalContent(sentence: string): boolean {
    const emotionalWords = [
      'feel', 'felt', 'emotion', 'heart', 'soul', 'love', 'hope', 'fear',
      'angry', 'sad', 'happy', 'grateful', 'proud', 'worried', 'excited',
      'remember', 'never', 'always', 'really', 'truly', 'deeply'
    ];
    
    const lowerSentence = sentence.toLowerCase();
    return emotionalWords.some(word => lowerSentence.includes(word));
  }

  /**
   * Helper: Extract basic themes from content
   */
  private static extractBasicThemes(content: string): string[] {
    const themePatterns = {
      'housing': ['house', 'home', 'housing', 'rent', 'homeless', 'accommodation'],
      'community': ['community', 'together', 'support', 'help', 'neighbor'],
      'health': ['health', 'hospital', 'doctor', 'medical', 'treatment'],
      'family': ['family', 'children', 'parent', 'mother', 'father', 'son', 'daughter'],
      'work': ['work', 'job', 'employment', 'career', 'business'],
      'culture': ['culture', 'traditional', 'aboriginal', 'indigenous', 'country'],
      'education': ['school', 'education', 'learning', 'teacher', 'student'],
      'resilience': ['strong', 'survive', 'overcome', 'persevere', 'fight']
    };
    
    const foundThemes: string[] = [];
    const lowerContent = content.toLowerCase();
    
    Object.entries(themePatterns).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        foundThemes.push(theme);
      }
    });
    
    return foundThemes.slice(0, 5); // Limit to top 5 themes
  }

  /**
   * Helper: Extract basic emotions from content
   */
  private static extractBasicEmotions(content: string): string[] {
    const emotionPatterns = {
      'grateful': ['grateful', 'thankful', 'appreciate', 'blessed'],
      'hopeful': ['hope', 'optimistic', 'future', 'better', 'positive'],
      'determined': ['determined', 'fight', 'never give up', 'persist'],
      'proud': ['proud', 'achievement', 'accomplish', 'success'],
      'concerned': ['worried', 'concerned', 'anxious', 'fear'],
      'sad': ['sad', 'disappointed', 'grief', 'loss'],
      'angry': ['angry', 'frustrated', 'mad', 'upset'],
      'reflective': ['remember', 'think', 'realize', 'understand']
    };
    
    const foundEmotions: string[] = [];
    const lowerContent = content.toLowerCase();
    
    Object.entries(emotionPatterns).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        foundEmotions.push(emotion);
      }
    });
    
    return foundEmotions.slice(0, 4); // Limit to top 4 emotions
  }

  /**
   * Helper: Generate title from content
   */
  private static generateTitleFromContent(content: string): string {
    // Extract first meaningful sentence or use themes
    const firstSentence = content.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 10 && firstSentence.length < 80) {
      return firstSentence.trim();
    }
    
    // Fallback to theme-based title
    const themes = this.extractBasicThemes(content);
    if (themes.length > 0) {
      return `A Story of ${themes[0].charAt(0).toUpperCase() + themes[0].slice(1)}`;
    }
    
    return 'Community Story';
  }

  /**
   * Helper: Generate summary from content
   */
  private static generateSummary(content: string, wordCount: number): string {
    // Take first few sentences up to ~150 words
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = '';
    let currentWordCount = 0;
    
    for (const sentence of sentences.slice(0, 4)) {
      const sentenceWords = sentence.trim().split(' ').length;
      if (currentWordCount + sentenceWords > 150) break;
      
      summary += sentence.trim() + '. ';
      currentWordCount += sentenceWords;
    }
    
    return summary.trim() || 'A meaningful story from our community.';
  }

  /**
   * Helper: Detect content warnings
   */
  private static detectContentWarnings(content: string): string[] {
    const warningPatterns = {
      'mental_health': ['suicide', 'depression', 'mental health', 'anxiety'],
      'violence': ['violence', 'abuse', 'assault', 'attack'],
      'substance_use': ['drugs', 'alcohol', 'addiction', 'overdose'],
      'trauma': ['trauma', 'ptsd', 'flashback', 'nightmare'],
      'death': ['death', 'died', 'funeral', 'passed away']
    };
    
    const warnings: string[] = [];
    const lowerContent = content.toLowerCase();
    
    Object.entries(warningPatterns).forEach(([warning, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        warnings.push(warning);
      }
    });
    
    return warnings;
  }

  /**
   * Step 4: Calculate content metrics
   */
  private static calculateMetrics(content: string): {
    reading_time: number;
    quality_score: number;
  } {
    const wordCount = content.split(/\s+/).length;
    const reading_time = Math.ceil(wordCount / 200); // 200 words per minute
    
    // Basic quality scoring
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    let quality_score = 0.7; // Base score
    
    // Bonus for good sentence variety
    if (avgSentenceLength > 10 && avgSentenceLength < 25) quality_score += 0.1;
    
    // Bonus for adequate length
    if (wordCount > 200 && wordCount < 2000) quality_score += 0.1;
    
    // Bonus for paragraph structure
    if (content.includes('\n\n')) quality_score += 0.1;
    
    return {
      reading_time,
      quality_score: Math.min(1.0, quality_score)
    };
  }
}

/**
 * Batch processing function for multiple stories
 */
export async function beautifyAllStories(stories: any[]): Promise<any[]> {
  const beautifiedStories = [];
  
  for (const story of stories) {
    try {
      console.log(`Processing story: ${story.title || story.id}`);
      
      const beautified = await StoryBeautifier.beautifyStory({
        raw_content: story.content || '',
        title: story.title,
        storyteller_name: story.storyteller?.full_name
      });
      
      beautifiedStories.push({
        ...story,
        ...beautified,
        raw_content: story.content, // Keep original for reference
        beautified_at: new Date().toISOString(),
        beautification_version: '1.0'
      });
      
    } catch (error) {
      console.error(`Failed to beautify story ${story.id}:`, error);
      beautifiedStories.push(story); // Keep original if beautification fails
    }
  }
  
  return beautifiedStories;
}