import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import InteractiveTranscript from '@/components/storyteller/InteractiveTranscript';
import EmotionalJourney from '@/components/storyteller/EmotionalJourney';
import AIInsightsDashboard from '@/components/storyteller/AIInsightsDashboard';
import PrivacyDashboard from '@/components/storyteller/PrivacyDashboard';
import CommunityConnections from '@/components/storyteller/CommunityConnections';
import StoryTimeline from '@/components/storyteller/StoryTimeline';
import QuoteCarousel from '@/components/storyteller/QuoteCarousel';
import TopicWordCloud from '@/components/storyteller/TopicWordCloud';

interface StorytellerPageProps {
  params: Promise<{ id: string }>;
}

export default async function StorytellerPage({ params }: StorytellerPageProps) {
  const { id } = await params;
  const supabase = await createAdminClient();

  // Fetch storyteller with their transcript and analysis
  const { data: storyteller, error } = await supabase
    .from('storytellers')
    .select(`
      id,
      full_name,
      bio,
      profile_image_url,
      created_at,
      organization:organizations(name),
      location:locations(name),
      transcripts(
        id,
        transcript_content,
        created_at,
        story_analysis(
          id,
          themes_identified,
          key_quotes,
          primary_emotions,
          summary,
          confidence_score,
          results,
          created_at
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !storyteller) {
    notFound();
  }

  // Get themes for mapping IDs to names
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name')
    .eq('status', 'active');

  // Get the story analysis (handle both array and single object responses)
  const transcriptData = Array.isArray(storyteller.transcripts) 
    ? storyteller.transcripts[0] 
    : storyteller.transcripts;
  const analysis = transcriptData?.story_analysis?.[0];
  const transcript = transcriptData;
  
  // Map theme IDs to names (handle both string and number IDs)
  const storyThemes = analysis?.themes_identified?.map((themeId: string | number) => {
    const theme = themes?.find(t => t.id === themeId || t.id === String(themeId));
    return theme?.name;
  }).filter(Boolean) || [];
  
  // Fallback: if no themes found via ID mapping, use themes from results
  const fallbackThemes = storyThemes.length === 0 && analysisResults.themes ? 
    analysisResults.themes.map((t: string) => t.replace(/\s*\([^)]*\)\s*/, '')) : [];
  
  const finalThemes = storyThemes.length > 0 ? storyThemes : fallbackThemes;

  // Get quotes and clean emotions
  const storyQuotes = analysis?.key_quotes || [];
  const rawEmotions = analysis?.primary_emotions || [];
  const emotions = rawEmotions.map((emotion: string) => 
    emotion.replace(/\s*\([^)]*\)\s*/, '').trim()
  );

  // Analysis insights
  const analysisDate = analysis?.created_at ? new Date(analysis.created_at).toLocaleDateString() : null;
  const memberSince = storyteller.created_at ? new Date(storyteller.created_at).toLocaleDateString() : null;

  // Enhanced analysis data
  const analysisResults = analysis?.results || {};
  const aiInsights = analysisResults.insights || [];
  const topicCategories = analysisResults.topic_categories || [];
  const qualityScore = analysisResults.quality_score || 0;
  const transcriptContent = transcript?.transcript_content || '';
  
  // Privacy and consent data (mock for now)
  const privacySettings = {
    profile_public: true,
    story_public: true,
    quotes_shareable: true,
    consent_date: storyteller.created_at,
    data_export_available: true
  };

  return (
    <div className={styles.storytellerProfile}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.profileAvatar}>
              {storyteller.profile_image_url ? (
                <Image
                  src={storyteller.profile_image_url}
                  alt={storyteller.full_name}
                  width={200}
                  height={200}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {storyteller.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            <div className={styles.profileInfo}>
              <div className={styles.profileHeader}>
                <div className={styles.sovereigntyBadge}>Data Sovereignty Respected</div>
                <h1 className={styles.profileName}>{storyteller.full_name}</h1>
                <p className={styles.profileSubtitle}>
                  {storyteller.organization && `${(storyteller.organization as any).name} • `}
                  {storyteller.location && `${(storyteller.location as any).name} • `}
                  Community Storyteller
                </p>
              </div>
              
              <div className={styles.profileDetails}>
                {storyteller.organization && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🏢</span>
                    <span>{(storyteller.organization as any).name}</span>
                  </div>
                )}
                {storyteller.location && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🌏</span>
                    <span>{(storyteller.location as any).name}</span>
                  </div>
                )}
                {memberSince && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>⭐</span>
                    <span>Since {memberSince}</span>
                  </div>
                )}
                {analysis && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🤖</span>
                    <span>{Math.round((analysis.confidence_score || 0) * 100)}% Analysis Confidence</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Hero Quote */}
            {storyQuotes.length > 0 && (
              <div className={styles.heroQuote}>
                <p className={styles.heroQuoteText}>
                  {storyQuotes[0]}
                </p>
                <div className={styles.heroQuoteAttribution}>
                  — {storyteller.full_name}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Data Sovereignty Notice */}
      <section className={styles.sovereigntySection}>
        <div className={styles.container}>
          <div className={styles.sovereigntyNotice}>
            <div className={styles.sovereigntyIcon}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className={styles.sovereigntyContent}>
              <h3>This storyteller maintains complete control over their narrative</h3>
              <p>Following Indigenous data sovereignty principles, this profile displays only information the storyteller has explicitly chosen to share publicly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Story Overview */}
      {analysis && (
        <section className={styles.storyOverviewSection}>
          <div className={styles.container}>
            <div className={styles.storyOverview}>
              <div className={styles.overviewHeader}>
                <h2>Story Overview</h2>
                {analysis.summary && (
                  <div className={styles.aiSummary}>
                    <div className={styles.summaryIcon}>🤖</div>
                    <div className={styles.summaryContent}>
                      <h3>AI-Generated Summary</h3>
                      <p>{analysis.summary}</p>
                    </div>
                  </div>
                )}
                {transcript && (
                  <div className={styles.storyMeta}>
                    <span>Interview Date: {new Date(transcript.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Story Length: {Math.ceil(transcriptContent.split(' ').length / 200)} min read</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AI Insights Dashboard */}
      {analysis && (
        <AIInsightsDashboard 
          analysis={analysis}
          confidence={analysis.confidence_score}
          quality={qualityScore}
          insights={aiInsights}
          analysisDate={analysisDate}
        />
      )}

      {/* Emotional Journey Visualization */}
      {emotions.length > 0 && (
        <EmotionalJourney 
          emotions={emotions}
          themes={finalThemes}
          transcriptContent={transcriptContent}
        />
      )}

      {/* Interactive Quote Carousel */}
      {storyQuotes.length > 0 && (
        <QuoteCarousel 
          quotes={storyQuotes}
          storytellerName={storyteller.full_name}
          shareEnabled={privacySettings.quotes_shareable}
        />
      )}

      {/* Topic Word Cloud */}
      {topicCategories.length > 0 && (
        <TopicWordCloud 
          topics={topicCategories}
          themes={finalThemes}
        />
      )}

      {/* Story Timeline */}
      {transcriptContent && (
        <StoryTimeline 
          transcriptContent={transcriptContent}
          themes={finalThemes}
          emotions={emotions}
        />
      )}

      {/* Interactive Transcript Viewer */}
      {transcript && (
        <InteractiveTranscript 
          transcript={transcriptContent}
          themes={finalThemes}
          quotes={storyQuotes}
          emotions={emotions}
          storytellerName={storyteller.full_name}
        />
      )}

      {/* Legacy Story Content (keeping for compatibility) */}
      {analysis && (
        <section className={styles.storySection}>
          <div className={styles.container}>
            <div className={styles.storyContent}>
              <div className={styles.storyHeader}>
                <h2>Story Journey & AI Insights</h2>
                {analysis.summary && (
                  <p className={styles.storySummary}>{analysis.summary}</p>
                )}
                {analysis.confidence_score && (
                  <div className={styles.analysisMeta}>
                    AI Analysis Confidence: {Math.round(analysis.confidence_score * 100)}% 
                    {analysisDate && ` • Analyzed on ${analysisDate}`}
                  </div>
                )}
              </div>

              {/* Analysis Insights Cards */}
              <div className={styles.analysisInsights}>
                <div className={styles.insightsHeader}>
                  <h3>Story Analysis Overview</h3>
                  <p>AI-powered analysis of narrative themes, emotions, and key insights</p>
                </div>
                <div className={styles.insightsGrid}>
                  <div className={styles.insightCard}>
                    <div className={styles.insightNumber}>{storyThemes.length}</div>
                    <div className={styles.insightLabel}>Key Themes</div>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightNumber}>{storyQuotes.length}</div>
                    <div className={styles.insightLabel}>Notable Quotes</div>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightNumber}>{emotions.length}</div>
                    <div className={styles.insightLabel}>Emotions Identified</div>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightNumber}>{Math.round((analysis.confidence_score || 0) * 100)}%</div>
                    <div className={styles.insightLabel}>Analysis Confidence</div>
                  </div>
                </div>
              </div>

              {/* Themes and Emotions Grid */}
              <div className={styles.storyGrid}>
                {/* Themes */}
                {finalThemes.length > 0 && (
                  <div className={styles.storyThemes}>
                    <h3>Key Themes</h3>
                    <div className={styles.themesGrid}>
                      {finalThemes.map((theme, index) => (
                        <span key={index} className={styles.themeTag}>{theme}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emotions */}
                {emotions.length > 0 && (
                  <div className={styles.storyEmotions}>
                    <h3>Emotional Journey</h3>
                    <div className={styles.emotionsGrid}>
                      {emotions.slice(0, 6).map((emotion: string, index: number) => (
                        <span key={index} className={styles.emotionTag}>{emotion}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Quotes */}
              {storyQuotes.length > 0 && (
                <div className={styles.storyQuotes}>
                  <h3>Meaningful Moments</h3>
                  <div className={styles.quotesGrid}>
                    {storyQuotes.slice(0, 4).map((quote, index) => (
                      <blockquote key={index} className={styles.storyQuote}>
                        {quote}
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Privacy Dashboard */}
      <PrivacyDashboard 
        storyteller={storyteller}
        privacySettings={privacySettings}
        consentDate={privacySettings.consent_date}
      />

      {/* Community Connections */}
      <CommunityConnections 
        storyteller={storyteller}
        themes={finalThemes}
        location={(storyteller.location as any)?.name}
        organization={(storyteller.organization as any)?.name}
      />

      {/* Enhanced Bio Section */}
      {storyteller.bio && (
        <section className={styles.enhancedBioSection}>
          <div className={styles.container}>
            <div className={styles.bioGrid}>
              <div className={styles.bioMain}>
                <h3>About {storyteller.full_name?.split(' ')[0]}</h3>
                <p>{storyteller.bio}</p>
                
                <div className={styles.bioStats}>
                  <div className={styles.bioStat}>
                    <div className={styles.bioStatNumber}>{finalThemes.length}</div>
                    <div className={styles.bioStatLabel}>Themes Explored</div>
                  </div>
                  <div className={styles.bioStat}>
                    <div className={styles.bioStatNumber}>{emotions.length}</div>
                    <div className={styles.bioStatLabel}>Emotions Shared</div>
                  </div>
                  <div className={styles.bioStat}>
                    <div className={styles.bioStatNumber}>{storyQuotes.length}</div>
                    <div className={styles.bioStatLabel}>Memorable Quotes</div>
                  </div>
                </div>
              </div>
              
              <div className={styles.bioSidebar}>
                <div className={styles.bioMetaCard}>
                  <h4>Profile Details</h4>
                  <div className={styles.bioMeta}>
                    {storyteller.location && (
                      <div className={styles.bioMetaItem}>
                        <div className={styles.bioMetaIcon}>🌍</div>
                        <div>
                          <div className={styles.bioMetaLabel}>Location</div>
                          <div className={styles.bioMetaValue}>{(storyteller.location as any).name}</div>
                        </div>
                      </div>
                    )}
                    {storyteller.organization && (
                      <div className={styles.bioMetaItem}>
                        <div className={styles.bioMetaIcon}>🏢</div>
                        <div>
                          <div className={styles.bioMetaLabel}>Organization</div>
                          <div className={styles.bioMetaValue}>{(storyteller.organization as any).name}</div>
                        </div>
                      </div>
                    )}
                    {transcript && (
                      <div className={styles.bioMetaItem}>
                        <div className={styles.bioMetaIcon}>📅</div>
                        <div>
                          <div className={styles.bioMetaLabel}>Story Shared</div>
                          <div className={styles.bioMetaValue}>
                            {new Date(transcript.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    {memberSince && (
                      <div className={styles.bioMetaItem}>
                        <div className={styles.bioMetaIcon}>⭐</div>
                        <div>
                          <div className={styles.bioMetaLabel}>Member Since</div>
                          <div className={styles.bioMetaValue}>{memberSince}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {analysis && (
                  <div className={styles.bioMetaCard}>
                    <h4>Analysis Quality</h4>
                    <div className={styles.qualityMeter}>
                      <div className={styles.qualityBar}>
                        <div 
                          className={styles.qualityFill}
                          style={{ width: `${Math.round((analysis.confidence_score || 0) * 100)}%` }}
                        ></div>
                      </div>
                      <div className={styles.qualityText}>
                        {Math.round((analysis.confidence_score || 0) * 100)}% Confidence
                      </div>
                    </div>
                    {qualityScore > 0 && (
                      <div className={styles.qualityMeter}>
                        <div className={styles.qualityBar}>
                          <div 
                            className={styles.qualityFill}
                            style={{ width: `${Math.round(qualityScore * 100)}%` }}
                          ></div>
                        </div>
                        <div className={styles.qualityText}>
                          {Math.round(qualityScore * 100)}% Quality Score
                        </div>
                      </div>
                    )}
                    <div className={styles.analysisCredit}>
                      Analyzed by GPT-4 {analysisDate && `on ${analysisDate}`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Actions */}
      <section className={styles.actionsSection}>
        <div className={styles.container}>
          <div className={styles.actionsContent}>
            <h2>Continue Exploring</h2>
            <p>Discover more voices and stories from our community</p>
            <div className={styles.actionsButtons}>
              <Link href="/storytellers" className={`${styles.btn} ${styles.btnPrimary}`}>
                Meet Other Storytellers
              </Link>
              <Link href="/stories" className={`${styles.btn} ${styles.btnSecondary}`}>
                Browse All Stories
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}