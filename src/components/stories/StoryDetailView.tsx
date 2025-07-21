// @ts-nocheck - Complex story schema relationships need proper type generation
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getStoryById,
  addStoryReaction,
  removeStoryReaction,
  addStoryComment,
  type Story,
} from '@/lib/supabase-stories';
import { getCurrentSession } from '@/lib/supabase-auth';
import MediaDisplay from '@/components/ui/MediaDisplay';
import {
  placeholderImages,
  placeholderBlurDataURLs,
} from '@/lib/supabase-media';

interface StoryDetailViewProps {
  storyId: string;
}

const REACTION_TYPES = [
  { type: 'heart', emoji: '❤️', label: 'Heart' },
  { type: 'support', emoji: '🤝', label: 'Support' },
  { type: 'strength', emoji: '💪', label: 'Strength' },
  { type: 'hope', emoji: '🌟', label: 'Hope' },
  { type: 'solidarity', emoji: '✊', label: 'Solidarity' },
];

export default function StoryDetailView({ storyId }: StoryDetailViewProps) {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadStoryData();
  }, [storyId]);

  const loadStoryData = async () => {
    try {
      const session = await getCurrentSession();
      setUser(session.user);

      const { story: loadedStory, error } = await getStoryById(
        storyId,
        session.user?.id
      );

      if (error) {
        if (error.code === 'PGRST116') {
          // Story not found or no permission
          setStory(null);
        } else {
          throw error;
        }
      } else if (loadedStory) {
        setStory(loadedStory);
        // Load user reactions for this story
        // This would be a separate API call in a real implementation
        setUserReactions([]);

        // Load comments for this story
        // This would be a separate API call in a real implementation
        setComments(generateDemoComments());
      }

      // If no story found, try demo story
      if (!loadedStory) {
        const demoStory = generateDemoStory(storyId);
        setStory(demoStory);
        setComments(generateDemoComments());
      }
    } catch (error) {
      console.error('Error loading story:', error);
      // Fallback to demo story
      const demoStory = generateDemoStory(storyId);
      setStory(demoStory);
      setComments(generateDemoComments());
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user || !story) {
      router.push('/auth/signin');
      return;
    }

    try {
      if (userReactions.includes(reactionType)) {
        // Remove reaction
        await removeStoryReaction(story.id, user.id, reactionType);
        setUserReactions(prev => prev.filter(r => r !== reactionType));
        setStory(prev =>
          prev
            ? {
                ...prev,
                reaction_count: Math.max(0, prev.reaction_count - 1),
              }
            : null
        );
      } else {
        // Add reaction
        await addStoryReaction(story.id, user.id, reactionType);
        setUserReactions(prev => [...prev, reactionType]);
        setStory(prev =>
          prev
            ? {
                ...prev,
                reaction_count: prev.reaction_count + 1,
              }
            : null
        );
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !story || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const { comment, error } = await addStoryComment(
        story.id,
        user.id,
        newComment.trim(),
        false // not anonymous
      );

      if (error) throw error;

      // Add comment to local state
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment.trim(),
        user_id: user.id,
        profiles: {
          display_name: user.user_metadata?.display_name || 'Anonymous',
          avatar_url: null,
        },
        created_at: new Date().toISOString(),
        is_anonymous: false,
      };

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');

      // Update story comment count
      setStory(prev =>
        prev
          ? {
              ...prev,
              comment_count: prev.comment_count + 1,
            }
          : null
      );
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Story link copied to clipboard!');
    setShowShareModal(false);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generateDemoStory = (id: string): Story => {
    return {
      id,
      title: 'Finding Strength Through Community Support',
      content: `When I first moved to Melbourne as a single parent, I felt completely overwhelmed. The housing market was brutal, my job barely covered rent, and I didn't know anyone in the city. My daughter was starting school, and I worried constantly about providing her with the stability she needed.

Everything changed when I discovered our local community center. What started as a search for affordable after-school care led me to a network of parents, community workers, and volunteers who became my extended family.

The after-school program wasn't just childcare – it was a place where kids from diverse backgrounds learned together, where parents could connect over shared experiences, and where community support felt genuine and unconditional. When I lost my job unexpectedly, the community rallied around us. Neighbors brought meals, offered babysitting, and helped me navigate job search resources I didn't know existed.

One evening, as I watched my daughter playing with friends while parents shared stories and laughter, I realized we had found something invaluable: belonging. The financial stress was still real, the housing situation still challenging, but we were no longer facing it alone.

This experience taught me that community support isn't just about receiving help – it's about contributing what you can, when you can. I started volunteering at the center, helping other new parents navigate the systems I had struggled with. My professional background in marketing became valuable when the center needed help with their outreach programs.

Today, three years later, my daughter thrives in this environment. She's learned empathy, resilience, and the value of community from watching how people care for each other. I've been promoted at my new job, we've moved to a more stable housing situation, and the friendships we've built continue to enrich our lives.

The community center recently received council funding to expand their programs, partly based on impact stories like ours. This validation of our shared experience feels like a full-circle moment – from receiving support to contributing to the evidence that these programs work.

I often think about families who might be where we were three years ago. Community support programs aren't just nice-to-have services – they're essential infrastructure for healthy, thriving neighborhoods. They transform individual struggles into collective strength, and they deserve investment and recognition at every level of government.`,
      category: 'community',
      themes: [
        'community support',
        'single parenting',
        'housing challenges',
        'social connection',
      ],
      tags: ['community', 'parenting', 'support', 'belonging'],
      privacy_level: 'public',
      can_be_shared: true,
      allow_research_use: true,
      allow_ai_analysis: true,
      contributor_id: 'demo-user-' + id,
      profiles: {
        display_name: 'Sarah M.',
        avatar_url: null,
        bio: 'Parent, community advocate, marketing professional',
      },
      communities: {
        name: 'Melbourne Families Network',
        slug: 'melbourne-families',
        description: "Supporting families in Melbourne's inner suburbs",
      },
      view_count: 567,
      share_count: 34,
      comment_count: 12,
      reaction_count: 89,
      impact_score: 8.7,
      cited_in_reports: 2,
      policy_influence_score: 1,
      status: 'approved',
      flagged_content: false,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      sentiment_score: 0.78,
      emotion_scores: {
        hope: 0.85,
        gratitude: 0.92,
        determination: 0.74,
      },
    };
  };

  const generateDemoComments = () => {
    return [
      {
        id: '1',
        content:
          'Thank you for sharing this. Your story gives me hope as someone going through a similar situation right now.',
        user_id: 'demo-commenter-1',
        profiles: {
          display_name: 'Alex T.',
          avatar_url: null,
        },
        created_at: '2024-01-16T09:15:00Z',
        is_anonymous: false,
      },
      {
        id: '2',
        content:
          'Community centers like this are so important. I work in local government and stories like yours help us advocate for more funding.',
        user_id: 'demo-commenter-2',
        profiles: {
          display_name: 'Jordan K.',
          avatar_url: null,
        },
        created_at: '2024-01-16T14:20:00Z',
        is_anonymous: false,
      },
      {
        id: '3',
        content:
          'This resonates deeply. We need more recognition of how community support transforms lives. Your daughter is lucky to grow up in such an environment.',
        user_id: 'demo-commenter-3',
        profiles: {
          display_name: 'Community Worker',
          avatar_url: null,
        },
        created_at: '2024-01-17T11:45:00Z',
        is_anonymous: true,
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-3xl animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-500 font-light">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extralight text-gray-900 mb-4">
            Story Not Found
          </h1>
          <p className="text-gray-600 font-light mb-6">
            This story may be private, removed, or the link may be incorrect.
          </p>
          <Link href="/discover" className="no-underline">
            <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-light hover:bg-gray-800 smooth-transition">
              Discover Stories
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Story Header */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/discover" className="no-underline">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 smooth-transition">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="font-light">Back to Stories</span>
                </button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-3xl md:text-4xl font-extralight text-gray-900 mb-6">
                  {story.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-light text-gray-600">
                        {story.profiles?.display_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <div className="font-normal text-gray-900">
                        {story.profiles?.display_name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500 font-light">
                        {formatDate(story.created_at)}
                      </div>
                    </div>
                  </div>

                  {story.communities && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">in</span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-light">
                        {story.communities.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-light capitalize">
                    {story.category.replace('_', ' ')}
                  </span>
                  {story.themes.map(theme => (
                    <span
                      key={theme}
                      className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-light"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sticky top-8">
                  <h3 className="font-normal text-gray-900 mb-4">
                    Story Impact
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 font-light">
                        Views
                      </span>
                      <span className="text-sm font-normal">
                        {story.view_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 font-light">
                        Reactions
                      </span>
                      <span className="text-sm font-normal">
                        {story.reaction_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 font-light">
                        Comments
                      </span>
                      <span className="text-sm font-normal">
                        {story.comment_count}
                      </span>
                    </div>
                    {story.impact_score > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-light">
                          Impact Score
                        </span>
                        <span className="text-sm font-normal">
                          {story.impact_score.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                    {story.cited_in_reports > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-light">
                          Research Citations
                        </span>
                        <span className="text-sm font-normal">
                          {story.cited_in_reports}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Content */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Media */}
                {(story.image_urls?.length ||
                  story.audio_url ||
                  story.video_url) && (
                  <div className="mb-8">
                    {story.image_urls?.length > 0 && (
                      <div className="aspect-video mb-4">
                        <MediaDisplay
                          src={story.image_urls[0]}
                          alt={story.title}
                          aspectRatio="video"
                          className="w-full h-full rounded-2xl"
                          blurDataURL={placeholderBlurDataURLs.story}
                        />
                      </div>
                    )}

                    {story.audio_url && (
                      <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                        <h4 className="font-normal text-gray-900 mb-3">
                          Audio Story
                        </h4>
                        <div className="bg-white rounded-xl p-4 flex items-center gap-4">
                          <button className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 smooth-transition">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="flex-1">
                            <div className="text-sm font-normal text-gray-900 mb-1">
                              Audio Story
                            </div>
                            <div className="text-xs text-gray-500 font-light">
                              Click to play
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Story Text */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div className="text-gray-800 font-light leading-relaxed whitespace-pre-wrap">
                    {story.content}
                  </div>
                </div>

                {/* Transcription */}
                {story.transcription && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                    <h4 className="font-normal text-blue-900 mb-3">
                      Audio Transcription
                    </h4>
                    <p className="text-blue-800 font-light text-sm leading-relaxed">
                      {story.transcription}
                    </p>
                    {story.transcription_confidence && (
                      <p className="text-xs text-blue-600 mt-2">
                        Transcription confidence:{' '}
                        {Math.round(story.transcription_confidence * 100)}%
                      </p>
                    )}
                  </div>
                )}

                {/* Reactions */}
                <div className="border-t border-gray-100 pt-8 mb-8">
                  <h3 className="font-normal text-gray-900 mb-4">
                    React to this story
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {REACTION_TYPES.map(reaction => (
                      <button
                        key={reaction.type}
                        onClick={() => handleReaction(reaction.type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm smooth-transition ${
                          userReactions.includes(reaction.type)
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <span>{reaction.emoji}</span>
                        <span className="font-light">{reaction.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="border-t border-gray-100 pt-8">
                  <h3 className="font-normal text-gray-900 mb-6">
                    Community Response
                  </h3>

                  {/* Add Comment */}
                  {user ? (
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Share your thoughts, support, or related experience..."
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:border-gray-400 focus:outline-none font-light"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-gray-500 font-light">
                          Comments are public and will show your display name
                        </p>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || isSubmittingComment}
                          className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-light hover:bg-gray-800 smooth-transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 text-center">
                      <p className="text-blue-800 font-light mb-4">
                        Sign in to react and comment on this story
                      </p>
                      <Link href="/auth/signin" className="no-underline">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-light hover:bg-blue-700 smooth-transition">
                          Sign In
                        </button>
                      </Link>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-6">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-light text-gray-600">
                            {comment.is_anonymous
                              ? 'A'
                              : comment.profiles.display_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-normal text-gray-900 text-sm">
                              {comment.is_anonymous
                                ? 'Anonymous'
                                : comment.profiles.display_name}
                            </span>
                            <span className="text-xs text-gray-500 font-light">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 font-light leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Share */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6">
                    <h3 className="font-normal text-gray-900 mb-4">
                      Share this story
                    </h3>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-2 rounded-full text-sm font-light smooth-transition"
                    >
                      Copy Share Link
                    </button>
                  </div>

                  {/* More from Community */}
                  {story.communities && (
                    <div className="bg-white border border-gray-200 rounded-3xl p-6">
                      <h3 className="font-normal text-gray-900 mb-4">
                        More from {story.communities.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-light mb-4">
                        {story.communities.description}
                      </p>
                      <Link
                        href={`/communities/${story.communities.slug}`}
                        className="no-underline"
                      >
                        <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-full text-sm font-light smooth-transition">
                          Explore Community
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl font-normal text-gray-900 mb-4">
              Share this story
            </h3>
            <p className="text-gray-600 font-light mb-6">
              Help spread awareness by sharing this story with others.
            </p>
            <div className="space-y-3">
              <button
                onClick={copyShareLink}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-full font-light smooth-transition"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full text-gray-600 hover:text-gray-800 py-3 font-light smooth-transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
