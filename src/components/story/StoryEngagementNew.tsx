'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

interface StoryEngagementProps {
  storyId: string;
  currentUser?: string;
}

interface Reaction {
  id: string;
  reaction_type: string;
  user_id: string;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  like_count: number;
}

export default function StoryEngagement({ storyId, currentUser }: StoryEngagementProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const reactionTypes = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'heart', emoji: '❤️', label: 'Love' },
    { type: 'inspire', emoji: '✨', label: 'Inspiring' },
    { type: 'support', emoji: '🤝', label: 'Support' },
    { type: 'empathy', emoji: '🫂', label: 'Empathy' }
  ];

  useEffect(() => {
    fetchEngagementData();
  }, [storyId]);

  const fetchEngagementData = async () => {
    const supabase = await createClient();
    
    // Fetch reactions
    const { data: reactionsData } = await supabase
      .from('story_reactions')
      .select('*')
      .eq('story_id', storyId);

    // Fetch comments  
    const { data: commentsData } = await supabase
      .from('story_comments')
      .select('*')
      .eq('story_id', storyId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    setReactions(reactionsData || []);
    setComments(commentsData || []);
    setLoading(false);
  };

  const addReaction = async (reactionType: string) => {
    if (!currentUser) return;
    
    const supabase = await createClient();
    
    // Check if user already reacted with this type
    const existingReaction = reactions.find(r => 
      r.user_id === currentUser && r.reaction_type === reactionType
    );

    if (existingReaction) {
      // Remove reaction
      await supabase
        .from('story_reactions')
        .delete()
        .eq('id', existingReaction.id);
    } else {
      // Add reaction
      await supabase
        .from('story_reactions')
        .insert({
          story_id: storyId,
          user_id: currentUser,
          reaction_type: reactionType
        });
    }

    fetchEngagementData();
  };

  const addComment = async () => {
    if (!currentUser || !newComment.trim()) return;
    
    const supabase = await createClient();
    
    await supabase
      .from('story_comments')
      .insert({
        story_id: storyId,
        user_id: currentUser,
        content: newComment.trim(),
        is_approved: true // Auto-approve for now
      });

    setNewComment('');
    fetchEngagementData();
  };

  const getReactionCount = (reactionType: string) => {
    return reactions.filter(r => r.reaction_type === reactionType).length;
  };

  const hasUserReacted = (reactionType: string) => {
    return reactions.some(r => r.user_id === currentUser && r.reaction_type === reactionType);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>Loading engagement...</p>
      </div>
    );
  }

  return (
    <div style={{ margin: '2rem 0', padding: '2rem', border: '1px solid #e1e5e9', borderRadius: '12px', background: '#fafbfc' }}>
      {/* Reactions */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#2d3748', marginBottom: '1rem', fontSize: '1.2rem' }}>Community Response</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {reactionTypes.map(({ type, emoji, label }) => (
            <button
              key={type}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.75rem',
                border: `2px solid ${hasUserReacted(type) ? '#4299e1' : '#e1e5e9'}`,
                borderRadius: '8px',
                background: hasUserReacted(type) ? '#ebf8ff' : 'white',
                cursor: currentUser ? 'pointer' : 'not-allowed',
                opacity: currentUser ? 1 : 0.6,
                minWidth: '60px',
                transition: 'all 0.2s'
              }}
              onClick={() => addReaction(type)}
              disabled={!currentUser}
            >
              <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{emoji}</span>
              <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.9rem' }}>
                {getReactionCount(type)}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div>
        <h3 style={{ color: '#2d3748', marginBottom: '1rem', fontSize: '1.2rem' }}>
          Community Discussion ({comments.length})
        </h3>
        
        {currentUser && (
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts respectfully..."
              rows={3}
              maxLength={1000}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                resize: 'vertical',
                marginBottom: '0.5rem'
              }}
            />
            <button 
              onClick={addComment}
              disabled={!newComment.trim()}
              style={{
                background: newComment.trim() ? '#4299e1' : '#e1e5e9',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                cursor: newComment.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Add Comment
            </button>
          </div>
        )}

        <div>
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              style={{
                padding: '1rem',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                background: 'white',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{ color: '#2d3748', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                {comment.content}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                {new Date(comment.created_at).toLocaleDateString()}
                {comment.like_count > 0 && ` • ${comment.like_count} likes`}
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <p style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic', padding: '2rem' }}>
              Be the first to share your thoughts on this story.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}