'use client';

import React from 'react';
import styles from './StoryTimeline.module.css';

interface StoryTimelineProps {
  transcriptContent: string;
  themes: string[];
  emotions: string[];
}

export default function StoryTimeline({ transcriptContent, themes, emotions }: StoryTimelineProps) {
  // Generate timeline points from content
  const timelinePoints = [
    { time: '0%', label: 'Story Beginning', content: 'Opening narrative and context setting' },
    { time: '25%', label: 'Initial Challenges', content: 'First obstacles and turning points emerge' },
    { time: '50%', label: 'Growth & Discovery', content: 'Key insights and personal development' },
    { time: '75%', label: 'Community Impact', content: 'Connection with others and giving back' },
    { time: '100%', label: 'Reflection', content: 'Looking forward and sharing wisdom' }
  ];

  if (!transcriptContent) return null;

  return (
    <section className={styles.timelineSection}>
      <div className={styles.container}>
        <div className={styles.timelineHeader}>
          <h2>Story Timeline</h2>
          <p>The chronological journey of narrative progression</p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineTrack}></div>
          
          {timelinePoints.map((point, index) => (
            <div
              key={index}
              className={styles.timelinePoint}
              style={{ left: point.time }}
            >
              <div className={styles.timelineMarker}>
                <div className={styles.markerDot}></div>
                <div className={styles.markerLine}></div>
              </div>
              
              <div className={styles.timelineContent}>
                <h4>{point.label}</h4>
                <p>{point.content}</p>
                <div className={styles.progressIndicator}>{point.time}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.timelineStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{Math.ceil(transcriptContent.split(' ').length / 200)}</span>
            <span className={styles.statLabel}>Minutes</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{themes.length}</span>
            <span className={styles.statLabel}>Themes</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{emotions.length}</span>
            <span className={styles.statLabel}>Emotions</span>
          </div>
        </div>
      </div>
    </section>
  );
}