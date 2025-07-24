'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

interface StoryEngagementProps {
  storyId: string;
  className?: string;
}

interface Reaction {
  id: string;
  reaction_type: string;
  user_id: string;
  message?: string;
  created_at: string;
}

const REACTION_TYPES = [
  { type: 'heart', emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { type: 'inspire', emoji: '✨', label: 'Inspiring', color: 'text-yellow-500' },
  { type: 'relate', emoji: '🤝', label: 'Relate', color: 'text-blue-500' },
  { type: 'support', emoji: '🙏', label: 'Support', color: 'text-purple-500' },
  { type: 'grateful', emoji: '🌟', label: 'Grateful', color: 'text-green-500' },
  { type: 'like', emoji: '👍', label: 'Like', color: 'text-gray-600' }
];

export default function StoryEngagement({ storyId, className = '' }: StoryEngagementProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadReactions();
    checkAuth();
  }, [storyId]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  }

  async function loadReactions() {
    try {
      const { data, error } = await supabase
        .from('story_reactions')
        .select('reaction_type, user_id')
        .eq('story_id', storyId);

      if (error) {
        console.error('Error loading reactions:', error);
        return;
      }

      // Count reactions by type
      const reactionCounts: Record<string, number> = {};
      const userReactionSet = new Set<string>();
      
      data?.forEach(reaction => {
        reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
        // Note: In a real app, you'd check if user_id matches current user
        // For demo purposes, we'll simulate some user reactions
        if (Math.random() > 0.8) { // Simulate 20% chance user has reacted
          userReactionSet.add(reaction.reaction_type);
        }
      });

      setReactions(reactionCounts);
      setUserReactions(userReactionSet);
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReaction(reactionType: string) {
    if (!isAuthenticated) {
      // In a real app, prompt user to sign in
      alert('Please sign in to react to stories');
      return;
    }

    const hasReacted = userReactions.has(reactionType);
    
    try {
      if (hasReacted) {
        // Remove reaction (in real app, would delete from database)
        const newUserReactions = new Set(userReactions);
        newUserReactions.delete(reactionType);
        setUserReactions(newUserReactions);
        
        const newReactions = { ...reactions };
        newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 0) - 1);
        setReactions(newReactions);
      } else {
        // Add reaction (in real app, would insert to database)
        const newUserReactions = new Set(userReactions);
        newUserReactions.add(reactionType);
        setUserReactions(newUserReactions);
        
        const newReactions = { ...reactions };
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
        setReactions(newReactions);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  }

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex space-x-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-12 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Reaction Buttons */}
        <div className="flex space-x-1">
          {REACTION_TYPES.slice(0, 4).map(({ type, emoji, label, color }) => {
            const count = reactions[type] || 0;
            const hasReacted = userReactions.has(type);
            
            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`
                  flex items-center space-x-1 px-2 py-1 rounded-full text-sm
                  transition-all duration-200 hover:scale-105
                  ${hasReacted 
                    ? `${color} bg-opacity-20 border-2 border-current` 
                    : 'text-gray-500 hover:text-gray-700 border-2 border-transparent hover:border-gray-300'
                  }
                `}
                title={label}
              >
                <span className="text-lg">{emoji}</span>
                {count > 0 && (
                  <span className="font-medium text-xs">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* More Reactions Button */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="flex items-center space-x-1 px-2 py-1 text-gray-500 hover:text-gray-700 rounded-full border-2 border-transparent hover:border-gray-300 transition-all duration-200"
            title="More reactions"
          >
            <span className="text-lg">😊</span>
            <span className="text-xs">+</span>
          </button>

          {/* Reaction Picker Dropdown */}
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 z-10">
              <div className="grid grid-cols-3 gap-1">
                {REACTION_TYPES.map(({ type, emoji, label, color }) => {
                  const count = reactions[type] || 0;
                  const hasReacted = userReactions.has(type);
                  
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        handleReaction(type);
                        setShowReactionPicker(false);
                      }}
                      className={`
                        flex flex-col items-center p-2 rounded-lg text-xs
                        transition-all duration-200 hover:scale-105
                        ${hasReacted 
                          ? `${color} bg-opacity-20` 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      title={label}
                    >
                      <span className="text-lg mb-1">{emoji}</span>
                      <span className="font-medium">{label}</span>
                      {count > 0 && (
                        <span className="text-xs opacity-75">({count})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Total Count */}
        {totalReactions > 0 && (
          <span className="text-sm text-gray-500 ml-2">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </span>
        )}

        {/* Share Button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Community Story',
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
          className="flex items-center space-x-1 px-3 py-1 text-gray-500 hover:text-gray-700 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
          title="Share story"
        >
          <span className="text-sm">📤</span>
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Click outside to close picker */}
      {showReactionPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowReactionPicker(false)}
        />
      )}
    </div>
  );
}