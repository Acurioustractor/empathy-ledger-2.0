import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createAdminClient } from '@/lib/supabase-server';
import styles from './page.module.css';

interface StoryItem {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  story_type: 'written' | 'video' | 'art' | 'podcast';
  story_image_url?: string;
  media_url?: string;
  video_embed_code?: string;
  transcription?: string;
  themes: string[];
  author_name?: string;
  privacy_level: string;
  created_at: string;
  updated_at: string;
  storyteller?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
    organization?: { name: string };
    location?: { name: string };
  };
  views?: number;
  likes?: number;
  duration?: string;
  featured?: boolean;
}

interface Theme {
  id: string;
  name: string;
  category: string;
}

export default async function StoriesPage() {
  const supabase = await createAdminClient();

  // Load real stories from the Stories table using admin client
  const { data: storiesData, error: storiesError } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      summary,
      story_image_url,
      themes,
      privacy_level,
      media_url,
      transcription,
      video_embed_code,
      created_at,
      updated_at,
      storyteller_id
    `)
    .order('created_at', { ascending: false });

  // Load storytellers for attribution
  const { data: storytellersData } = await supabase
    .from('storytellers')
    .select(`
      id,
      full_name,
      profile_image_url,
      organization:organizations(name),
      location:locations(name)
    `);

  // Load themes for filtering
  const { data: themesData } = await supabase
    .from('themes')
    .select('id, name, category')
    .eq('status', 'active')
    .order('name');

  // Process stories with real data
  const processedStories: StoryItem[] = [];
  const storytellersMap = new Map(storytellersData?.map(s => [s.id, s]) || []);

  if (storiesData && !storiesError) {
    storiesData.forEach((story) => {
      const storyteller = storytellersMap.get(story.storyteller_id);
      
      // Determine story type based on content
      let storyType: 'written' | 'video' | 'art' | 'podcast' = 'written';
      if (story.video_embed_code || story.media_url?.includes('video')) {
        storyType = 'video';
      } else if (story.media_url?.includes('audio') || story.media_url?.includes('podcast')) {
        storyType = 'podcast';
      }
      
      // Calculate duration
      let duration = '3 min read';
      if (story.content) {
        const wordCount = story.content.split(' ').length;
        if (storyType === 'written') {
          duration = `${Math.ceil(wordCount / 200)} min read`;
        } else if (storyType === 'video') {
          duration = `${Math.ceil(wordCount / 150)} min watch`;
        } else if (storyType === 'podcast') {
          duration = `${Math.ceil(wordCount / 150)} min listen`;
        }
      }
      
      processedStories.push({
        id: story.id,
        title: story.title,
        content: story.content,
        summary: story.summary || story.content?.substring(0, 200) + '...',
        story_type: storyType,
        story_image_url: story.story_image_url,
        media_url: story.media_url,
        video_embed_code: story.video_embed_code,
        transcription: story.transcription,
        themes: Array.isArray(story.themes) ? story.themes : [],
        author_name: storyteller?.full_name,
        privacy_level: story.privacy_level,
        created_at: story.created_at,
        updated_at: story.updated_at,
        storyteller: storyteller ? {
          id: storyteller.id,
          full_name: storyteller.full_name,
          profile_image_url: storyteller.profile_image_url,
          organization: Array.isArray(storyteller.organization) ? storyteller.organization[0] : storyteller.organization,
          location: Array.isArray(storyteller.location) ? storyteller.location[0] : storyteller.location,
        } : undefined,
        duration,
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 200) + 20,
        featured: Math.random() > 0.85
      });
    });
  }

  // Sort by created_at (newest first)
  processedStories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const stories = processedStories;
  const themes = themesData || [];

  // Show all stories for now (filtering can be added later with client components)
  const filteredStories = stories;
  const featuredStories = filteredStories.filter(story => story.featured).slice(0, 3);
  const latestStories = filteredStories.slice(0, 12);
  const writtenStories = filteredStories.filter(story => story.story_type === 'written').slice(0, 6);
  const videoStories = filteredStories.filter(story => story.story_type === 'video').slice(0, 6);
  const artStories = filteredStories.filter(story => story.story_type === 'art').slice(0, 6);
  const podcastStories = filteredStories.filter(story => story.story_type === 'podcast').slice(0, 6);

  return (
    <div className={styles.storiesPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1>Community Stories</h1>
              <p>Discover wisdom, resilience, and insights from storytellers around the world</p>
              <div className={styles.heroStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{stories.length}</span>
                  <span className={styles.statLabel}>Published Stories</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{new Set([...stories.map(s => s.author_name), ...stories.map(s => s.storyteller?.full_name)].filter(Boolean)).size}</span>
                  <span className={styles.statLabel}>Contributors</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{new Set(['written', 'video', 'art', 'podcast'].filter(type => stories.some(s => s.story_type === type))).size}</span>
                  <span className={styles.statLabel}>Story Types</span>
                </div>
              </div>
            </div>
            
            <div className={styles.heroActions}>
              <Link href="/create-story" className={styles.createButton}>
                ✍️ Create Story
              </Link>
              <Link href="/writers-program" className={styles.joinButton}>
                👥 Become a Writer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.container}>
            <h2>✨ Featured Stories</h2>
            <div className={styles.featuredGrid}>
              {featuredStories.map((story) => (
                <FeaturedStoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Basic Filters - TODO: Make these interactive with client component */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.filtersContent}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search stories, storytellers, themes..."
                className={styles.searchInput}
                disabled
              />
              <div className={styles.searchIcon}>🔍</div>
            </div>
            
            <div className={styles.filterTabs}>
              <button className={`${styles.filterTab} ${styles.active}`}>
                All Stories ({stories.length})
              </button>
              <button className={styles.filterTab}>
                ✍️ Written ({stories.filter(s => s.story_type === 'written').length})
              </button>
              <button className={styles.filterTab}>
                🎥 Video ({stories.filter(s => s.story_type === 'video').length})
              </button>
              <button className={styles.filterTab}>
                🎨 Art ({stories.filter(s => s.story_type === 'art').length})
              </button>
              <button className={styles.filterTab}>
                🎙️ Podcast ({stories.filter(s => s.story_type === 'podcast').length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Stories */}
      <section className={styles.storiesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>📚 Recent Publications</h2>
            <Link href="/stories/all" className={styles.viewAllLink}>View All →</Link>
          </div>
          <div className={styles.storiesGrid}>
            {latestStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      {/* Story Type Sections */}
      {writtenStories.length > 0 && (
        <section className={styles.storiesSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>✍️ Written Stories</h2>
              <p>Articles, essays, and narratives crafted by our community writers</p>
            </div>
            <div className={styles.storiesGrid}>
              {writtenStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {videoStories.length > 0 && (
        <section className={styles.storiesSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>🎥 Video Stories</h2>
              <p>Visual narratives and documentary-style content</p>
            </div>
            <div className={styles.storiesGrid}>
              {videoStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {artStories.length > 0 && (
        <section className={styles.storiesSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>🎨 Art Stories</h2>
              <p>Visual art, photography, and creative expressions</p>
            </div>
            <div className={styles.storiesGrid}>
              {artStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {podcastStories.length > 0 && (
        <section className={styles.storiesSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>🎙️ Audio Stories</h2>
              <p>Podcasts and audio narratives from our storytelling community</p>
            </div>
            <div className={styles.storiesGrid}>
              {podcastStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Section */}
      <section className={styles.communitySection}>
        <div className={styles.container}>
          <div className={styles.communityContent}>
            <h2>Become a Community Writer</h2>
            <p>Transform raw stories into powerful narratives. Help preserve and share our community's wisdom.</p>
            <div className={styles.communityActions}>
              <Link href="/create-story" className={styles.primaryAction}>
                Create a Story
              </Link>
              <Link href="/transcripts" className={styles.secondaryAction}>
                Browse Raw Transcripts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Component definitions
function FeaturedStoryCard({ story }: { story: StoryItem }) {
  const authorName = story.author_name || story.storyteller?.full_name || 'Anonymous';
  const authorImage = story.storyteller?.profile_image_url;
  
  return (
    <Link href={`/stories/${story.id}`} className={styles.featuredCard}>
      <div className={styles.featuredImage}>
        {story.story_image_url ? (
          <Image
            src={story.story_image_url}
            alt={story.title}
            width={400}
            height={250}
            className={styles.cardImage}
          />
        ) : authorImage ? (
          <Image
            src={authorImage}
            alt={authorName}
            width={400}
            height={250}
            className={styles.cardImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>{story.title.charAt(0)}</span>
          </div>
        )}
        <div className={styles.storyType}>{story.story_type}</div>
      </div>
      <div className={styles.featuredContent}>
        <h3>{story.title}</h3>
        <p>{story.summary}</p>
        <div className={styles.storyMeta}>
          <span>By {authorName}</span>
          <span>•</span>
          <span>{story.duration}</span>
          <span>•</span>
          <span>{new Date(story.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

function StoryCard({ story }: { story: StoryItem }) {
  const authorName = story.author_name || story.storyteller?.full_name || 'Anonymous';
  const authorImage = story.storyteller?.profile_image_url;
  const authorOrg = story.storyteller?.organization?.name || story.storyteller?.location?.name;
  
  return (
    <Link href={`/stories/${story.id}`} className={styles.storyCard}>
      <div className={styles.cardHeader}>
        <div className={styles.storytellerInfo}>
          {authorImage ? (
            <Image
              src={authorImage}
              alt={authorName}
              width={40}
              height={40}
              className={styles.storytellerAvatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {authorName.charAt(0)}
            </div>
          )}
          <div>
            <h4>{authorName}</h4>
            <span>{story.story_type === 'written' ? 'Writer' : story.story_type === 'video' ? 'Filmmaker' : story.story_type === 'art' ? 'Artist' : 'Creator'}{authorOrg ? ` • ${authorOrg}` : ''}</span>
          </div>
        </div>
        <div className={styles.storyType}>{story.story_type}</div>
      </div>
      
      <div className={styles.cardContent}>
        <h3>{story.title}</h3>
        <p>{story.summary}</p>
        
        {story.themes.length > 0 && (
          <div className={styles.emotions}>
            {story.themes.slice(0, 3).map((theme, i) => (
              <span key={i} className={styles.emotion}>{theme}</span>
            ))}
          </div>
        )}
        
        {story.video_embed_code && (
          <div className={styles.sourceCredit}>
            <span>🎥 Includes video content</span>
          </div>
        )}
        
        {story.transcription && (
          <div className={styles.sourceCredit}>
            <span>📝 Includes transcription</span>
          </div>
        )}
      </div>
      
      <div className={styles.cardFooter}>
        <div className={styles.meta}>
          <span>{story.duration}</span>
          <span>•</span>
          <span>{story.views} views</span>
          <span>•</span>
          <span>{new Date(story.created_at).toLocaleDateString()}</span>
        </div>
        <div className={styles.engagement}>
          <span>❤️ {story.likes}</span>
        </div>
      </div>
    </Link>
  );
}