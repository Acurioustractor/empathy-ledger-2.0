'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { StoryBeautifier } from '@/lib/story-beautifier';
import styles from './page.module.css';

const supabase = createClient();

interface Story {
  id: string;
  title: string;
  content: string;
  summary?: string;
  storyteller_id: string;
}

export default function BeautifyStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [beautifiedPreview, setBeautifiedPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load stories with formatting issues
  const loadStories = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('stories')
        .select('id, title, content, summary, storyteller_id')
        .not('content', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      setStories(data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preview beautification for selected story
  const previewBeautification = async (story: Story) => {
    setProcessing(true);
    setSelectedStory(story);
    
    try {
      const beautified = await StoryBeautifier.beautifyStory({
        raw_content: story.content,
        title: story.title,
        storyteller_name: `Storyteller ${story.storyteller_id}`
      });
      
      setBeautifiedPreview(beautified);
    } catch (error) {
      console.error('Error beautifying story:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Apply beautification to database
  const applyBeautification = async () => {
    if (!selectedStory || !beautifiedPreview) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          title: beautifiedPreview.title,
          content: beautifiedPreview.content,
          summary: beautifiedPreview.summary,
          themes: beautifiedPreview.themes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedStory.id);

      if (error) throw error;
      
      alert('Story beautified successfully!');
      setSelectedStory(null);
      setBeautifiedPreview(null);
      loadStories(); // Reload to see changes
      
    } catch (error) {
      console.error('Error saving beautified story:', error);
      alert('Error saving story');
    } finally {
      setProcessing(false);
    }
  };

  // Check if story has formatting issues
  const hasFormattingIssues = (content: string): string[] => {
    const issues = [];
    if (content.includes('\\#')) issues.push('Escaped headers');
    if (content.includes('[00:')) issues.push('Timestamps');
    if (content.includes('~~')) issues.push('Strikethrough');
    if (content.includes('\n\n\n')) issues.push('Extra line breaks');
    if (content.includes('[SPEAKER_')) issues.push('Speaker labels');
    return issues;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Story Beautification System</h1>
        <p>Transform raw Descript transcripts into elegant, readable stories</p>
        <button onClick={loadStories} disabled={loading} className={styles.loadButton}>
          {loading ? 'Loading...' : 'Load Stories'}
        </button>
      </div>

      <div className={styles.layout}>
        {/* Stories List */}
        <div className={styles.storiesList}>
          <h2>Stories ({stories.length})</h2>
          {stories.map((story) => {
            const issues = hasFormattingIssues(story.content);
            return (
              <div 
                key={story.id} 
                className={`${styles.storyCard} ${selectedStory?.id === story.id ? styles.selected : ''}`}
                onClick={() => previewBeautification(story)}
              >
                <h3>{story.title}</h3>
                <div className={styles.storyMeta}>
                  <span>{story.content?.length || 0} chars</span>
                  <span>•</span>
                  <span>{Math.ceil((story.content?.split(' ').length || 0) / 200)} min read</span>
                </div>
                
                {issues.length > 0 && (
                  <div className={styles.issues}>
                    <strong>Issues:</strong> {issues.join(', ')}
                  </div>
                )}
                
                <div className={styles.preview}>
                  {story.content?.substring(0, 150)}...
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Panel */}
        {selectedStory && (
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <h2>Beautification Preview</h2>
              {processing && <div className={styles.spinner}>Processing...</div>}
            </div>

            {beautifiedPreview && (
              <>
                <div className={styles.comparison}>
                  {/* Before */}
                  <div className={styles.before}>
                    <h3>Before (Raw)</h3>
                    <div className={styles.content}>
                      <h4>{selectedStory.title}</h4>
                      <div className={styles.rawContent}>
                        {selectedStory.content.substring(0, 500)}...
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  <div className={styles.after}>
                    <h3>After (Beautified)</h3>
                    <div className={styles.content}>
                      <h4>{beautifiedPreview.title}</h4>
                      
                      <div className={styles.summary}>
                        <strong>Summary:</strong> {beautifiedPreview.summary}
                      </div>
                      
                      <div className={styles.beautifiedContent}>
                        {beautifiedPreview.content.substring(0, 500)}...
                      </div>
                      
                      <div className={styles.metadata}>
                        <div className={styles.themes}>
                          <strong>Themes:</strong> {beautifiedPreview.themes.join(', ')}
                        </div>
                        <div className={styles.emotions}>
                          <strong>Emotions:</strong> {beautifiedPreview.emotions.join(', ')}
                        </div>
                        <div className={styles.quotes}>
                          <strong>Key Quotes:</strong> {beautifiedPreview.key_quotes.length}
                        </div>
                        <div className={styles.quality}>
                          <strong>Quality Score:</strong> {Math.round(beautifiedPreview.quality_score * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button 
                    onClick={applyBeautification} 
                    disabled={processing}
                    className={styles.applyButton}
                  >
                    {processing ? 'Applying...' : 'Apply Beautification'}
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedStory(null);
                      setBeautifiedPreview(null);
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}