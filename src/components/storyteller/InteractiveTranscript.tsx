'use client';

import React, { useState, useMemo } from 'react';
import styles from './InteractiveTranscript.module.css';

interface InteractiveTranscriptProps {
  transcript: string;
  themes: string[];
  quotes: string[];
  emotions: string[];
  storytellerName: string;
}

interface TranscriptSegment {
  text: string;
  highlighted: boolean;
  type?: 'theme' | 'quote' | 'emotion';
  category?: string;
}

export default function InteractiveTranscript({ 
  transcript, 
  themes, 
  quotes, 
  emotions, 
  storytellerName 
}: InteractiveTranscriptProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'themes' | 'quotes' | 'emotions'>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const processedTranscript = useMemo(() => {
    if (!transcript) return [];
    
    let processedText = transcript;
    const segments: TranscriptSegment[] = [];
    
    // Mark quotes
    quotes.forEach(quote => {
      if (quote && processedText.includes(quote)) {
        processedText = processedText.replace(
          quote, 
          `<QUOTE>${quote}</QUOTE>`
        );
      }
    });
    
    // Mark themes (approximate matching)
    themes.forEach(theme => {
      if (theme) {
        const regex = new RegExp(`\\b${theme.toLowerCase()}\\b`, 'gi');
        processedText = processedText.replace(regex, `<THEME>${theme}</THEME>`);
      }
    });
    
    // Mark emotions (approximate matching)
    emotions.forEach(emotion => {
      if (emotion) {
        const regex = new RegExp(`\\b${emotion.toLowerCase()}\\b`, 'gi');
        processedText = processedText.replace(regex, `<EMOTION>${emotion}</EMOTION>`);
      }
    });
    
    // Split into segments
    const parts = processedText.split(/(<QUOTE>.*?<\/QUOTE>|<THEME>.*?<\/THEME>|<EMOTION>.*?<\/EMOTION>)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('<QUOTE>')) {
        return {
          text: part.replace(/<\/?QUOTE>/g, ''),
          highlighted: true,
          type: 'quote' as const,
          category: 'quote'
        };
      } else if (part.startsWith('<THEME>')) {
        return {
          text: part.replace(/<\/?THEME>/g, ''),
          highlighted: true,
          type: 'theme' as const,
          category: 'theme'
        };
      } else if (part.startsWith('<EMOTION>')) {
        return {
          text: part.replace(/<\/?EMOTION>/g, ''),
          highlighted: true,
          type: 'emotion' as const,
          category: 'emotion'
        };
      } else {
        return {
          text: part,
          highlighted: false
        };
      }
    }).filter(segment => segment.text.trim().length > 0);
  }, [transcript, themes, quotes, emotions]);

  const filteredTranscript = useMemo(() => {
    if (!searchTerm && selectedFilter === 'all') return processedTranscript;
    
    return processedTranscript.filter(segment => {
      const matchesSearch = !searchTerm || 
        segment.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'themes' && segment.type === 'theme') ||
        (selectedFilter === 'quotes' && segment.type === 'quote') ||
        (selectedFilter === 'emotions' && segment.type === 'emotion') ||
        (selectedFilter !== 'all' && !segment.highlighted);
      
      return matchesSearch && matchesFilter;
    });
  }, [processedTranscript, searchTerm, selectedFilter]);

  const displayTranscript = isExpanded ? filteredTranscript : filteredTranscript.slice(0, 10);

  if (!transcript) return null;

  return (
    <section className={styles.transcriptSection}>
      <div className={styles.container}>
        <div className={styles.transcriptHeader}>
          <div className={styles.headerContent}>
            <h2>Full Story Transcript</h2>
            <p>Explore {storytellerName}&apos;s complete narrative with interactive highlights</p>
          </div>
          
          <div className={styles.transcriptControls}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.searchIcon}>🔍</div>
            </div>
            
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${selectedFilter === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedFilter('all')}
              >
                All
              </button>
              <button
                className={`${styles.filterTab} ${selectedFilter === 'themes' ? styles.active : ''}`}
                onClick={() => setSelectedFilter('themes')}
              >
                Themes ({themes.length})
              </button>
              <button
                className={`${styles.filterTab} ${selectedFilter === 'quotes' ? styles.active : ''}`}
                onClick={() => setSelectedFilter('quotes')}
              >
                Quotes ({quotes.length})
              </button>
              <button
                className={`${styles.filterTab} ${selectedFilter === 'emotions' ? styles.active : ''}`}
                onClick={() => setSelectedFilter('emotions')}
              >
                Emotions ({emotions.length})
              </button>
            </div>
          </div>
        </div>

        <div className={styles.transcriptContent}>
          <div className={styles.transcriptMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Word Count:</span>
              <span className={styles.metaValue}>{transcript.split(' ').length.toLocaleString()}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Reading Time:</span>
              <span className={styles.metaValue}>{Math.ceil(transcript.split(' ').length / 200)} min</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Highlights:</span>
              <span className={styles.metaValue}>{themes.length + quotes.length + emotions.length}</span>
            </div>
          </div>

          <div className={styles.transcriptText}>
            {displayTranscript.map((segment, index) => (
              <span
                key={index}
                className={`${styles.transcriptSegment} ${
                  segment.highlighted ? styles[segment.type || 'highlighted'] : ''
                }`}
                title={segment.highlighted ? `${segment.type}: ${segment.category}` : undefined}
              >
                {segment.text}
              </span>
            ))}
            
            {!isExpanded && filteredTranscript.length > 10 && (
              <div className={styles.expandPrompt}>
                <button
                  className={styles.expandButton}
                  onClick={() => setIsExpanded(true)}
                >
                  Continue Reading... ({filteredTranscript.length - 10} more segments)
                </button>
              </div>
            )}
            
            {isExpanded && (
              <div className={styles.collapsePrompt}>
                <button
                  className={styles.collapseButton}
                  onClick={() => setIsExpanded(false)}
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.transcriptLegend}>
          <h4>Highlight Legend</h4>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.themeColor}`}></span>
              <span>Key Themes</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.quoteColor}`}></span>
              <span>Notable Quotes</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.emotionColor}`}></span>
              <span>Emotional Expressions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}