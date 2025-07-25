'use client';

import React from 'react';
import styles from './TopicWordCloud.module.css';

interface TopicWordCloudProps {
  topics: string[];
  themes: string[];
}

export default function TopicWordCloud({ topics, themes }: TopicWordCloudProps) {
  // Combine topics and themes with deterministic weights to avoid hydration mismatch
  const topicWeights = [3.2, 2.8, 4.1, 3.5, 2.9, 3.8, 2.4, 4.3, 3.0, 2.6];
  const themeWeights = [4.5, 3.8, 4.2, 3.9, 4.0, 3.6, 4.8, 3.7, 4.1, 3.4];
  
  const allWords = [
    ...topics.map((topic, index) => ({ 
      word: topic, 
      weight: topicWeights[index % topicWeights.length] || 3.0, 
      type: 'topic' as const
    })),
    ...themes.map((theme, index) => ({ 
      word: theme, 
      weight: themeWeights[index % themeWeights.length] || 4.0, 
      type: 'theme' as const
    }))
  ];

  if (allWords.length === 0) return null;

  return (
    <section className={styles.cloudSection}>
      <div className={styles.container}>
        <div className={styles.cloudHeader}>
          <h2>Topic Word Cloud</h2>
          <p>Visual representation of key themes and topics</p>
        </div>

        <div className={styles.wordCloud}>
          {allWords.map((item, index) => (
            <span
              key={index}
              className={`${styles.cloudWord} ${styles[item.type]}`}
              style={{
                fontSize: `${0.8 + item.weight * 0.3}rem`,
                opacity: 0.7 + item.weight * 0.1
              }}
            >
              {item.word}
            </span>
          ))}
        </div>

        <div className={styles.cloudLegend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.topicDot}`}></span>
            <span>Topics ({topics.length})</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.themeDot}`}></span>
            <span>Themes ({themes.length})</span>
          </div>
        </div>
      </div>
    </section>
  );
}