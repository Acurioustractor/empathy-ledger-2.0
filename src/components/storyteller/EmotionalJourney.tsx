'use client';

import React, { useState, useMemo } from 'react';
import styles from './EmotionalJourney.module.css';

interface EmotionalJourneyProps {
  emotions: string[];
  themes: string[];
  transcriptContent: string;
}

interface EmotionPoint {
  emotion: string;
  intensity: number;
  position: number;
  relatedThemes: string[];
}

interface EmotionCategory {
  name: string;
  emotions: string[];
  color: string;
  intensity: number;
}

export default function EmotionalJourney({ emotions, themes, transcriptContent }: EmotionalJourneyProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'timeline' | 'radar'>('chart');

  const emotionCategories: EmotionCategory[] = useMemo(() => {
    const categories = new Map<string, string[]>();
    
    emotions.forEach(emotion => {
      const normalizedEmotion = emotion.toLowerCase();
      
      if (['joy', 'happy', 'excited', 'grateful', 'satisfied', 'proud', 'optimistic'].some(e => normalizedEmotion.includes(e))) {
        if (!categories.has('positive')) categories.set('positive', []);
        categories.get('positive')!.push(emotion);
      } else if (['sad', 'disappointed', 'frustrated', 'angry', 'worried', 'anxious', 'stressed'].some(e => normalizedEmotion.includes(e))) {
        if (!categories.has('challenging')) categories.set('challenging', []);
        categories.get('challenging')!.push(emotion);
      } else if (['hopeful', 'determined', 'motivated', 'inspired', 'resilient', 'empowered'].some(e => normalizedEmotion.includes(e))) {
        if (!categories.has('growth')) categories.set('growth', []);
        categories.get('growth')!.push(emotion);
      } else if (['calm', 'peaceful', 'content', 'thoughtful', 'reflective', 'contemplative'].some(e => normalizedEmotion.includes(e))) {
        if (!categories.has('reflective')) categories.set('reflective', []);
        categories.get('reflective')!.push(emotion);
      } else {
        if (!categories.has('other')) categories.set('other', []);
        categories.get('other')!.push(emotion);
      }
    });

    return Array.from(categories.entries()).map(([name, emotions]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      emotions,
      intensity: emotions.length / emotions.length * 100,
      color: {
        positive: '#10b981',
        challenging: '#ef4444', 
        growth: '#8b5cf6',
        reflective: '#06b6d4',
        other: '#6b7280'
      }[name] || '#6b7280'
    }));
  }, [emotions]);

  const emotionTimeline: EmotionPoint[] = useMemo(() => {
    if (!transcriptContent) return [];
    
    const words = transcriptContent.split(' ');
    const totalWords = words.length;
    
    return emotions.map((emotion, index) => {
      const emotionPosition = transcriptContent.toLowerCase().indexOf(emotion.toLowerCase());
      const relativePosition = emotionPosition > -1 ? 
        (emotionPosition / transcriptContent.length) * 100 : 
        (index / emotions.length) * 100;
      
      const relatedThemes = themes.filter(theme => 
        Math.abs(transcriptContent.toLowerCase().indexOf(theme.toLowerCase()) - emotionPosition) < 500
      );
      
      // Use deterministic intensity based on emotion index to avoid hydration mismatch
      const intensities = [75, 65, 80, 70, 85, 60, 90, 55];
      
      return {
        emotion,
        intensity: intensities[index % intensities.length] || 70,
        position: Math.max(5, Math.min(95, relativePosition)),
        relatedThemes
      };
    }).sort((a, b) => a.position - b.position);
  }, [emotions, themes, transcriptContent]);

  const radarData = useMemo(() => {
    const categories = ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Trust'];
    return categories.map(category => {
      const matchingEmotions = emotions.filter(emotion => {
        const lower = emotion.toLowerCase();
        switch(category.toLowerCase()) {
          case 'joy': return ['joy', 'happy', 'excited', 'grateful'].some(e => lower.includes(e));
          case 'sadness': return ['sad', 'disappointed', 'melancholy'].some(e => lower.includes(e));
          case 'anger': return ['angry', 'frustrated', 'annoyed'].some(e => lower.includes(e));
          case 'fear': return ['afraid', 'worried', 'anxious', 'nervous'].some(e => lower.includes(e));
          case 'surprise': return ['surprised', 'amazed', 'shocked'].some(e => lower.includes(e));
          case 'trust': return ['trust', 'confident', 'secure', 'hopeful'].some(e => lower.includes(e));
          default: return false;
        }
      });
      
      return {
        category,
        value: Math.min(100, (matchingEmotions.length / emotions.length) * 100 * 3),
        count: matchingEmotions.length
      };
    });
  }, [emotions]);

  if (emotions.length === 0) return null;

  return (
    <section className={styles.emotionalJourneySection}>
      <div className={styles.container}>
        <div className={styles.journeyHeader}>
          <h2>Emotional Journey</h2>
          <p>Visual exploration of emotional patterns and progression throughout the story</p>
          
          <div className={styles.viewModeSelector}>
            <button
              className={`${styles.modeButton} ${viewMode === 'chart' ? styles.active : ''}`}
              onClick={() => setViewMode('chart')}
            >
              📊 Categories
            </button>
            <button
              className={`${styles.modeButton} ${viewMode === 'timeline' ? styles.active : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              📈 Timeline
            </button>
            <button
              className={`${styles.modeButton} ${viewMode === 'radar' ? styles.active : ''}`}
              onClick={() => setViewMode('radar')}
            >
              🎯 Profile
            </button>
          </div>
        </div>

        {viewMode === 'chart' && (
          <div className={styles.emotionChart}>
            <div className={styles.chartHeader}>
              <h3>Emotional Categories</h3>
              <p>{emotionCategories.length} distinct emotional themes identified</p>
            </div>
            
            <div className={styles.categoriesGrid}>
              {emotionCategories.map((category, index) => (
                <div 
                  key={category.name}
                  className={styles.categoryCard}
                  style={{ borderTopColor: category.color }}
                >
                  <div className={styles.categoryHeader}>
                    <h4>{category.name}</h4>
                    <div className={styles.categoryCount}>{category.emotions.length}</div>
                  </div>
                  
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryFill}
                      style={{ 
                        width: `${(category.emotions.length / emotions.length) * 100}%`,
                        backgroundColor: category.color
                      }}
                    ></div>
                  </div>
                  
                  <div className={styles.categoryEmotions}>
                    {category.emotions.slice(0, 3).map((emotion, i) => (
                      <span key={i} className={styles.emotionTag} style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                        {emotion}
                      </span>
                    ))}
                    {category.emotions.length > 3 && (
                      <span className={styles.moreEmotions}>+{category.emotions.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className={styles.emotionTimeline}>
            <div className={styles.timelineHeader}>
              <h3>Emotional Timeline</h3>
              <p>How emotions unfold throughout the narrative journey</p>
            </div>
            
            <div className={styles.timelineContainer}>
              <div className={styles.timelineTrack}>
                {emotionTimeline.map((point, index) => (
                  <div
                    key={index}
                    className={styles.timelinePoint}
                    style={{ left: `${point.position}%` }}
                    onClick={() => setSelectedEmotion(selectedEmotion === point.emotion ? null : point.emotion)}
                  >
                    <div 
                      className={styles.timelineMarker}
                      style={{ 
                        height: `${point.intensity * 0.6}px`,
                        backgroundColor: emotionCategories.find(cat => 
                          cat.emotions.includes(point.emotion)
                        )?.color || '#6b7280'
                      }}
                    ></div>
                    <div className={styles.timelineLabel}>{point.emotion}</div>
                    
                    {selectedEmotion === point.emotion && (
                      <div className={styles.timelineTooltip}>
                        <strong>{point.emotion}</strong>
                        <div>Position: {Math.round(point.position)}% through story</div>
                        {point.relatedThemes.length > 0 && (
                          <div>
                            Related themes: {point.relatedThemes.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className={styles.timelineAxis}>
                <span>Story Beginning</span>
                <span>Story End</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'radar' && (
          <div className={styles.emotionRadar}>
            <div className={styles.radarHeader}>
              <h3>Emotional Profile</h3>
              <p>Distribution across fundamental emotional dimensions</p>
            </div>
            
            <div className={styles.radarChart}>
              <svg viewBox="0 0 300 300" className={styles.radarSvg}>
                {/* Grid circles */}
                {[20, 40, 60, 80, 100].map(radius => (
                  <circle
                    key={radius}
                    cx="150"
                    cy="150"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Axis lines */}
                {radarData.map((_, index) => {
                  const angle = (index * 360 / radarData.length) * (Math.PI / 180);
                  const x = 150 + Math.cos(angle - Math.PI / 2) * 100;
                  const y = 150 + Math.sin(angle - Math.PI / 2) * 100;
                  
                  return (
                    <line
                      key={index}
                      x1="150"
                      y1="150"
                      x2={x}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* Data polygon */}
                <polygon
                  points={radarData.map((item, index) => {
                    const angle = (index * 360 / radarData.length) * (Math.PI / 180);
                    const radius = item.value;
                    const x = 150 + Math.cos(angle - Math.PI / 2) * radius;
                    const y = 150 + Math.sin(angle - Math.PI / 2) * radius;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {radarData.map((item, index) => {
                  const angle = (index * 360 / radarData.length) * (Math.PI / 180);
                  const radius = item.value;
                  const x = 150 + Math.cos(angle - Math.PI / 2) * radius;
                  const y = 150 + Math.sin(angle - Math.PI / 2) * radius;
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
                
                {/* Labels */}
                {radarData.map((item, index) => {
                  const angle = (index * 360 / radarData.length) * (Math.PI / 180);
                  const x = 150 + Math.cos(angle - Math.PI / 2) * 120;
                  const y = 150 + Math.sin(angle - Math.PI / 2) * 120;
                  
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={styles.radarLabel}
                    >
                      {item.category}
                    </text>
                  );
                })}
              </svg>
            </div>
            
            <div className={styles.radarLegend}>
              {radarData.map((item, index) => (
                <div key={index} className={styles.radarLegendItem}>
                  <span className={styles.legendDot}></span>
                  <span>{item.category}: {item.count} emotions ({Math.round(item.value)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.emotionSummary}>
          <h3>Emotional Summary</h3>
          <div className={styles.summaryStats}>
            <div className={styles.summaryStat}>
              <div className={styles.statNumber}>{emotions.length}</div>
              <div className={styles.statLabel}>Total Emotions</div>
            </div>
            <div className={styles.summaryStat}>
              <div className={styles.statNumber}>{emotionCategories.length}</div>
              <div className={styles.statLabel}>Categories</div>
            </div>
            <div className={styles.summaryStat}>
              <div className={styles.statNumber}>{emotionTimeline.length > 0 ? Math.round(emotionTimeline.reduce((sum, point) => sum + point.intensity, 0) / emotionTimeline.length) : 0}%</div>
              <div className={styles.statLabel}>Avg Intensity</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}