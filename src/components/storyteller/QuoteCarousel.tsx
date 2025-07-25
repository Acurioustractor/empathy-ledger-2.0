'use client';

import React, { useState } from 'react';
import styles from './QuoteCarousel.module.css';

interface QuoteCarouselProps {
  quotes: string[];
  storytellerName: string;
  shareEnabled: boolean;
}

export default function QuoteCarousel({ quotes, storytellerName, shareEnabled }: QuoteCarouselProps) {
  const [currentQuote, setCurrentQuote] = useState(0);

  if (quotes.length === 0) return null;

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const shareQuote = () => {
    if (shareEnabled && navigator.share) {
      navigator.share({
        title: `Quote from ${storytellerName}`,
        text: quotes[currentQuote]
      });
    }
  };

  return (
    <section className={styles.carouselSection}>
      <div className={styles.container}>
        <div className={styles.carouselHeader}>
          <h2>Meaningful Quotes</h2>
          <p>Powerful moments from {storytellerName}'s narrative</p>
        </div>

        <div className={styles.carousel}>
          <button className={styles.navButton} onClick={prevQuote}>
            ←
          </button>
          
          <div className={styles.quoteDisplay}>
            <blockquote className={styles.quote}>
              {quotes[currentQuote]}
            </blockquote>
            
            <div className={styles.quoteActions}>
              <div className={styles.pagination}>
                {quotes.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.dot} ${index === currentQuote ? styles.active : ''}`}
                    onClick={() => setCurrentQuote(index)}
                  />
                ))}
              </div>
              
              {shareEnabled && (
                <button className={styles.shareButton} onClick={shareQuote}>
                  📤 Share Quote
                </button>
              )}
            </div>
          </div>
          
          <button className={styles.navButton} onClick={nextQuote}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}