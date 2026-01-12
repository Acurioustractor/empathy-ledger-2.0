import React from 'react';
import Link from 'next/link';
import ConstellationWrapper from '@/components/constellation/ConstellationWrapper';
import { createAdminClient } from '@/lib/supabase-server';

export default async function HomePage() {
  // Get REAL storytellers from your database - they're in the storytellers table
  const supabase = await createAdminClient();
  
  // Step 1: Find transcripts with story analysis to get storyteller IDs
  const { data: transcriptsWithAnalysis } = await supabase
    .from('transcripts')
    .select(`
      id,
      storyteller_id,
      story_analysis(
        id,
        themes_identified,
        key_quotes,
        primary_emotions,
        summary,
        confidence_score
      )
    `);

  // Filter to get storyteller IDs that have analysis with themes
  const validChains = transcriptsWithAnalysis?.filter(t => 
    t.story_analysis && 
    t.story_analysis.length > 0 && 
    t.story_analysis[0].themes_identified && 
    t.story_analysis[0].themes_identified.length > 0
  ) || [];

  // Sort by confidence score and get top storytellers
  const sortedChains = validChains
    .sort((a, b) => (b.story_analysis?.[0]?.confidence_score || 0) - (a.story_analysis?.[0]?.confidence_score || 0))
    .slice(0, 6);

  const storytellerIds = sortedChains.map(t => t.storyteller_id);

  // Step 2: Get storyteller details for those IDs
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select(`
      id,
      full_name,
      bio,
      profile_image_url,
      organization:organizations(name),
      location:locations(name)
    `)
    .in('id', storytellerIds)
    .not('bio', 'is', null);

  // Step 3: Merge the analysis data back with storytellers
  const storytellersWithAnalysis = storytellers?.map(storyteller => {
    const chain = sortedChains.find(c => c.storyteller_id === storyteller.id);
    return {
      ...storyteller,
      transcripts: chain ? [{
        id: chain.id,
        story_analysis: chain.story_analysis
      }] : []
    };
  }) || [];
    
  // Get themes for mapping IDs to names
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name')
    .eq('status', 'active');

  console.log('Storytellers with AI analysis loaded:', storytellersWithAnalysis?.length, error);
  console.log('Themes loaded:', themes?.length);
  
  // Debug: Show what AI data we have
  if (storytellersWithAnalysis && storytellersWithAnalysis.length > 0) {
    console.log('Sample storyteller with AI data:', {
      name: storytellersWithAnalysis[0].full_name,
      hasAnalysis: !!storytellersWithAnalysis[0].transcripts?.[0]?.story_analysis?.[0],
      themes: storytellersWithAnalysis[0].transcripts?.[0]?.story_analysis?.[0]?.themes_identified,
      quotes: storytellersWithAnalysis[0].transcripts?.[0]?.story_analysis?.[0]?.key_quotes?.length,
      confidence: storytellersWithAnalysis[0].transcripts?.[0]?.story_analysis?.[0]?.confidence_score
    });
  }

  return (
    <div>
      {/* Hero with Constellation Visual */}
      <section className="hero-constellation">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">COMMUNITY OWNED PLATFORM</div>
              <h1 className="hero-title">
                Stories That Connect Communities
              </h1>
              <p className="hero-description">
                A platform where storytellers maintain ownership of their narratives, 
                communities control their cultural data, and every voice strengthens 
                the collective wisdom.
              </p>
              <div className="hero-actions">
                <Link href="/submit" className="btn btn-primary">
                  Share Your Story
                </Link>
                <Link href="/simple-stories" className="btn btn-secondary">
                  Explore Stories
                </Link>
              </div>
            </div>
            
            {/* Constellation Visual */}
            <div className="constellation-container">
              <ConstellationWrapper />
              <div className="constellation-label">
                Every story connects to strengthen our collective understanding
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Values */}
      <section className="section values-section">
        <div className="container">
          <div className="grid-3">
            <div className="value-card">
              <div className="icon icon-red">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3>Community First</h3>
              <p>Stories belong to storytellers, not tech companies.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-blue">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3>Data Sovereignty</h3>
              <p>Following Indigenous data sovereignty principles.</p>
            </div>
            
            <div className="value-card">
              <div className="icon icon-green">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3>Ethical Technology</h3>
              <p>AI serves storytellers, not shareholders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Storytellers Grid - Real Supabase Data */}
      <section className="section storytellers-section">
        <div className="container">
          <div className="section-header">
            <h2>Community Storytellers</h2>
            <p>Voices that shape our collective narrative ({storytellers?.length || 0} storytellers)</p>
            <div className="connection-note">
              <svg className="connection-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p>Each storyteller's narrative has been analyzed by AI to identify themes, emotions, and key insights that connect us across communities</p>
            </div>
          </div>
          
          <div className="storytellers-grid">
            {storytellersWithAnalysis && storytellersWithAnalysis.length > 0 ? storytellersWithAnalysis.map((person) => (
              <Link key={person.id} href={`/storytellers/${person.id}`} className="storyteller-card-link">
                <div className="storyteller-card">
                  <div className="storyteller-header">
                    <div className="storyteller-avatar">
                      {person.profile_image_url ? (
                        <img 
                          src={person.profile_image_url} 
                          alt={person.full_name}
                          className="avatar-image"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {person.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="storyteller-info">
                      <h3 className="storyteller-name">{person.full_name}</h3>
                      <p className="storyteller-community">
                        {(person.organization as any)?.name || (person.location as any)?.name || 'Community Member'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="storyteller-quote">
                    "{person.transcripts?.[0]?.story_analysis?.[0]?.key_quotes?.[0] || person.bio?.substring(0, 120) || 'Every story connects us to something larger than ourselves'}..."
                  </div>
                  
                  <div className="storyteller-themes">
                    {(person.transcripts?.[0]?.story_analysis?.[0]?.themes_identified?.slice(0, 4).map((themeId: number) => {
                      const theme = themes?.find(t => t.id === themeId);
                      return theme ? (
                        <span key={themeId} className="theme-pill">{theme.name}</span>
                      ) : null;
                    }) || ['Resilience', 'Community', 'Voice'].map(theme => (
                      <span key={theme} className="theme-pill">{theme}</span>
                    )))}
                  </div>
                  
                  <div className="storyteller-footer">
                    <span className="view-more">View Profile →</span>
                  </div>
                </div>
              </Link>
            )) : (
              // Demo data if no Supabase data
              Array.from({ length: 6 }).map((_, i) => (
                <Link key={i} href={`/storytellers/${i}`} className="storyteller-card-link">
                  <div className="storyteller-card">
                    <div className="storyteller-header">
                      <div className="storyteller-avatar">
                        <img 
                          src={`https://i.pravatar.cc/150?img=${[3, 5, 9, 12, 25, 32][i]}`}
                          alt={['Anna Chen', 'Marcus Williams', 'Sarah Johnson', 'James Miller', 'Lisa Brown', 'Robert Davis'][i]}
                          className="avatar-image"
                        />
                      </div>
                      <div className="storyteller-info">
                        <h3 className="storyteller-name">
                          {['Anna Chen', 'Marcus Williams', 'Sarah Johnson', 'James Miller', 'Lisa Brown', 'Robert Davis'][i]}
                        </h3>
                        <p className="storyteller-community">
                          {['Gadigal Country', 'Wiradjuri Nation', 'Bundjalung Country', 'Kaurna Land', 'Wurundjeri Country', 'Larrakia Nation'][i]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="storyteller-quote">
                      {[
                        '"In sharing our stories, we find our strength"',
                        '"Each voice adds to the tapestry of truth"', 
                        '"Connection begins with understanding"',
                        '"Our narratives shape tomorrow"',
                        '"Culture lives through our words"',
                        '"Together, we write history"'
                      ][i]}
                    </div>
                    
                    <div className="storyteller-themes">
                      {[
                        ['Resilience', 'Family', 'Heritage'],
                        ['Community', 'Leadership', 'Change'], 
                        ['Culture', 'Identity', 'Growth'],
                        ['Justice', 'Voice', 'Hope'],
                        ['Tradition', 'Innovation', 'Future'],
                        ['Land', 'Belonging', 'Wisdom']
                      ][i].map(theme => (
                        <span key={theme} className="theme-pill">{theme}</span>
                      ))}
                    </div>
                    
                    <div className="storyteller-footer">
                      <span className="view-more">View Profile →</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          <div className="section-footer">
            <Link href="/storytellers" className="btn btn-secondary">
              Meet All Storytellers
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Your Story Matters</h2>
            <p>Join a community where your voice is valued and your narrative remains yours</p>
            <Link href="/submit" className="btn btn-primary btn-large">
              Share Your Story
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}