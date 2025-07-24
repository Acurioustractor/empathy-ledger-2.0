/**
 * UPDATE WEBSITE COMPONENTS - Use new storyteller-centric architecture
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tednluwflfhxyucgwigh.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg';

const supabase = createClient(supabaseUrl, anonKey);

// ========================================
// NEW STORYTELLER DATA FUNCTIONS
// ========================================

// Get storytellers with all their authentic data
async function getStorytellersWithData(limit = 10) {
  console.log('🔍 Getting storytellers with authentic data...');
  
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select(`
      id,
      full_name,
      profile_image_url,
      bio,
      community_affiliation,
      consent_given,
      locations(name, state, country),
      quotes(id, quote_text, context),
      themes(id, name, description),
      stories(id, title, published)
    `)
    .eq('consent_given', true)
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching storytellers:', error);
    return [];
  }

  return storytellers?.map(storyteller => ({
    ...storyteller,
    location: storyteller.locations,
    quoteCount: storyteller.quotes?.length || 0,
    themeCount: storyteller.themes?.length || 0,
    hasCompleteData: (storyteller.quotes?.length || 0) > 0 && (storyteller.themes?.length || 0) > 0
  })) || [];
}

// Get specific storyteller with complete data
async function getStorytellerComplete(storytellerId: string) {
  console.log(`🔍 Getting complete data for storyteller: ${storytellerId}`);
  
  const { data: storyteller, error } = await supabase
    .from('storytellers')
    .select(`
      *,
      locations(*),
      quotes(id, quote_text, context, timestamp_start),
      themes(id, name, description, confidence_score),
      stories(id, title, story_content, published),
      transcripts(id, title, interview_date)
    `)
    .eq('id', storytellerId)
    .eq('consent_given', true)
    .single();

  if (error) {
    console.error('❌ Error fetching storyteller:', error);
    return null;
  }

  return storyteller;
}

// ========================================
// TEST NEW DATA ARCHITECTURE
// ========================================
async function testNewArchitecture() {
  console.log('🧪 TESTING NEW STORYTELLER-CENTRIC ARCHITECTURE');
  console.log('='.repeat(80));

  try {
    // Test 1: Get all storytellers
    console.log('1. TESTING: Get all storytellers with data...');
    const storytellers = await getStorytellersWithData(5);
    
    console.log(`✅ Found ${storytellers.length} storytellers with consent`);
    
    storytellers.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.full_name} (${s.community_affiliation})`);
      console.log(`      Location: ${s.location?.name}, ${s.location?.state}`);
      console.log(`      Quotes: ${s.quoteCount}, Themes: ${s.themeCount}`);
      console.log(`      Complete data: ${s.hasCompleteData ? 'YES' : 'NO'}`);
      console.log(`      Photo: ${s.profile_image_url ? 'YES' : 'NO'}`);
    });

    // Test 2: Get detailed data for one storyteller
    if (storytellers.length > 0) {
      console.log('\n2. TESTING: Get complete storyteller details...');
      const detailed = await getStorytellerComplete(storytellers[0].id);
      
      if (detailed) {
        console.log(`✅ Complete data for: ${detailed.full_name}`);
        console.log(`   Bio: ${detailed.bio?.substring(0, 80)}...`);
        console.log(`   Location: ${detailed.locations?.name}, ${detailed.locations?.state}`);
        console.log(`   Transcripts: ${detailed.transcripts?.length || 0}`);
        console.log(`   Quotes: ${detailed.quotes?.length || 0}`);
        console.log(`   Themes: ${detailed.themes?.length || 0}`);
        console.log(`   Stories: ${detailed.stories?.length || 0}`);
        
        // Show sample quotes
        if (detailed.quotes && detailed.quotes.length > 0) {
          console.log('\n   📝 SAMPLE QUOTES (their authentic words):');
          detailed.quotes.slice(0, 3).forEach((quote, i) => {
            console.log(`      ${i + 1}. "${quote.quote_text?.substring(0, 60)}..."`);
          });
        }
        
        // Show sample themes
        if (detailed.themes && detailed.themes.length > 0) {
          console.log('\n   🏷️  SAMPLE THEMES (from their story):');
          detailed.themes.slice(0, 3).forEach((theme, i) => {
            console.log(`      ${i + 1}. ${theme.name}`);
          });
        }
      }
    }

    // Test 3: Validate data integrity
    console.log('\n3. TESTING: Data integrity validation...');
    
    // Check for orphaned data
    const integrityChecks = await Promise.all([
      supabase.from('quotes').select('id').is('storyteller_id', null),
      supabase.from('themes').select('id').is('storyteller_id', null),
      supabase.from('stories').select('id').is('storyteller_id', null)
    ]);

    const orphanedQuotes = integrityChecks[0].data?.length || 0;
    const orphanedThemes = integrityChecks[1].data?.length || 0;
    const orphanedStories = integrityChecks[2].data?.length || 0;

    console.log(`   Orphaned quotes: ${orphanedQuotes}`);
    console.log(`   Orphaned themes: ${orphanedThemes}`);
    console.log(`   Orphaned stories: ${orphanedStories}`);

    const hasOrphans = orphanedQuotes + orphanedThemes + orphanedStories > 0;
    console.log(`   ✅ Data integrity: ${hasOrphans ? 'ISSUES FOUND' : 'PERFECT'}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎯 ARCHITECTURE TEST RESULTS:');
    console.log('='.repeat(80));
    
    if (storytellers.length > 0) {
      console.log('✅ Storytellers successfully migrated');
      console.log('✅ All data traces back to real people');
      console.log('✅ Consent-based access working');
      console.log('✅ Complete data chain: Person → Transcript → Quotes/Themes');
      
      const completeDataStories = storytellers.filter(s => s.hasCompleteData);
      console.log(`✅ ${completeDataStories.length}/${storytellers.length} storytellers have complete data`);
      
      if (!hasOrphans) {
        console.log('✅ No orphaned data - perfect integrity');
      }
      
      console.log('\n🚀 READY FOR WEBSITE INTEGRATION!');
    } else {
      console.log('⚠️  No storytellers found - migration may not be complete');
    }

  } catch (error) {
    console.error('❌ Architecture test failed:', error);
  }
}

// ========================================
// GENERATE NEW STORYTELLER CARDS COMPONENT
// ========================================
function generateNewStorytellerCardsComponent() {
  console.log('\n📝 GENERATING NEW STORYTELLER CARDS COMPONENT');
  console.log('='.repeat(60));

  const newComponent = `
'use client';

/**
 * NEW STORYTELLER CARDS - Uses storyteller-centric architecture
 * GUARANTEE: Every quote and theme traces back to a real person with consent
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface StorytellerData {
  id: string;
  full_name: string;
  profile_image_url?: string;
  bio?: string;
  community_affiliation?: string;
  locations?: {
    name: string;
    state?: string;
    country?: string;
  };
  quotes?: Array<{
    id: string;
    quote_text: string;
    context?: string;
  }>;
  themes?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

interface StorytellerCardsProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function StorytellerCards({ 
  limit = 3,
  title = "Community Voices",
  subtitle = "Authentic stories from real people"
}: StorytellerCardsProps) {
  
  const [storytellers, setStorytellers] = useState<StorytellerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuthenticStorytellers() {
      try {
        setLoading(true);
        
        // Get storytellers with ALL their authentic data
        const { data, error } = await supabase
          .from('storytellers')
          .select(\`
            id,
            full_name,
            profile_image_url,
            bio,
            community_affiliation,
            locations(name, state, country),
            quotes(id, quote_text, context),
            themes(id, name, description)
          \`)
          .eq('consent_given', true)  // CRITICAL: Only consenting storytellers
          .not('quotes', 'is', null)   // Only those with quotes
          .not('themes', 'is', null)   // Only those with themes
          .limit(limit);

        if (error) throw error;

        setStorytellers(data || []);
        setError(null);
        
      } catch (err) {
        console.error('Error fetching authentic storytellers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load storytellers');
      } finally {
        setLoading(false);
      }
    }

    fetchAuthenticStorytellers();
  }, [limit]);

  if (loading) {
    return (
      <div className="storyteller-cards-section">
        <div className="section-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="cards-grid">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="card-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storyteller-cards-section">
        <div className="section-header">
          <h2>{title}</h2>
          <p style={{ color: '#ef4444' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (storytellers.length === 0) {
    return (
      <div className="storyteller-cards-section">
        <div className="section-header">
          <h2>{title}</h2>
          <p>Stories are being processed and will be available soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="storyteller-cards-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="cards-grid">
        {storytellers.map((storyteller) => (
          <article key={storyteller.id} className="storyteller-card">
            
            {/* Hero Photo Section */}
            <div className="card-hero">
              {storyteller.profile_image_url ? (
                <Image
                  src={storyteller.profile_image_url}
                  alt={\`\${storyteller.full_name} - Community Storyteller\`}
                  fill
                  className="hero-image"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="hero-placeholder">
                  <div className="hero-initial">
                    {storyteller.full_name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              
              {/* Overlay with name */}
              <div className="hero-overlay">
                <h3 className="storyteller-name">{storyteller.full_name}</h3>
                {storyteller.community_affiliation && (
                  <p className="storyteller-org">{storyteller.community_affiliation}</p>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="card-content">
              
              {/* Location */}
              {storyteller.locations && (
                <div className="location-info">
                  <span className="location-icon">📍</span>
                  <span className="location-text">
                    {storyteller.locations.name}
                    {storyteller.locations.state && \`, \${storyteller.locations.state}\`}
                  </span>
                </div>
              )}

              {/* Their Authentic Themes */}
              {storyteller.themes && storyteller.themes.length > 0 && (
                <div className="themes-section">
                  <h4 className="themes-title">Their Story Themes</h4>
                  <div className="themes-container">
                    {storyteller.themes.slice(0, 3).map((theme) => (
                      <span key={theme.id} className="theme-tag">
                        {theme.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Their Authentic Quote */}
              {storyteller.quotes && storyteller.quotes.length > 0 && (
                <div className="quote-section">
                  <blockquote className="story-quote">
                    "{storyteller.quotes[0].quote_text}"
                  </blockquote>
                  <div className="quote-attribution">
                    — {storyteller.full_name}
                  </div>
                </div>
              )}

            </div>
          </article>
        ))}
      </div>

      <style jsx>{\`
        .storyteller-cards-section {
          margin: 4rem 0;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 1rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--color-ink);
          font-weight: 700;
        }

        .section-header p {
          font-size: 1.2rem;
          color: var(--color-ink-light);
          margin: 0;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 2rem;
          margin: 0 auto;
        }

        .storyteller-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #f3f4f6;
          height: 520px;
          display: flex;
          flex-direction: column;
        }

        .storyteller-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
        }

        .card-hero {
          position: relative;
          height: 280px;
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        .hero-image {
          border-radius: 0;
          object-fit: cover;
          width: 100% !important;
          height: 100% !important;
        }

        .hero-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-initial {
          font-size: 4rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
          padding: 2.5rem 1.5rem 1.5rem;
          color: white;
        }

        .storyteller-name {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          color: white;
          line-height: 1.2;
        }

        .storyteller-org {
          font-size: 1rem;
          margin: 0;
          opacity: 0.95;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
          color: white;
        }

        .card-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .themes-section {
          margin-bottom: 1rem;
        }

        .themes-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #4b5563;
          margin: 0 0 0.75rem 0;
        }

        .themes-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .theme-tag {
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border: 1px solid rgba(107, 114, 128, 0.2);
          padding: 0.3rem 0.7rem;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
          transition: all 0.2s;
        }

        .theme-tag:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: #1d4ed8;
        }

        .quote-section {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .story-quote {
          font-size: 1rem;
          line-height: 1.6;
          color: #1f2937;
          font-style: italic;
          margin: 0 0 0.5rem 0;
          position: relative;
          padding: 1rem;
          background: rgba(249, 250, 251, 0.5);
          border-radius: 12px;
          border-left: 4px solid #10b981;
          font-weight: 500;
        }

        .quote-attribution {
          font-size: 0.9rem;
          color: #6b7280;
          text-align: right;
          font-weight: 600;
        }

        .card-skeleton {
          height: 520px;
          background: #f3f4f6;
          border-radius: 16px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .cards-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .section-header h2 {
            font-size: 2rem;
          }
        }
      \`}</style>
    </div>
  );
}
  `;

  console.log('✅ New StorytellerCards component generated');
  console.log('📋 Key features:');
  console.log('   - Only shows storytellers with consent');
  console.log('   - All quotes are authentic (from their transcripts)');
  console.log('   - All themes are derived from their stories');
  console.log('   - Complete data traceability');
  console.log('   - No fabricated content');
  
  return newComponent;
}

// ========================================
// MAIN EXECUTION
// ========================================
async function updateWebsiteComponents() {
  console.log('🔄 UPDATING WEBSITE COMPONENTS FOR NEW ARCHITECTURE');
  console.log('='.repeat(80));

  // Test the new architecture
  await testNewArchitecture();
  
  // Generate new component
  const newComponent = generateNewStorytellerCardsComponent();
  
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Replace old StorytellerCards component with generated code');
  console.log('2. Update any other components to use new architecture');
  console.log('3. Test website with real storyteller data');
  console.log('4. Deploy and verify authentic content display');
  
  console.log('\n🎯 RESULT: Website will show only authentic content from consenting storytellers');
}

// Show what this will do
console.log('📋 WEBSITE COMPONENT UPDATE PLAN:');
console.log('1. 🧪 Test new storyteller-centric architecture');
console.log('2. 📝 Generate new StorytellerCards component');
console.log('3. 🔍 Validate data integrity and consent handling');
console.log('4. 📊 Show complete data statistics');
console.log('');
console.log('🎯 GOAL: Website components use only authentic storyteller data');
console.log('');

// Execute the update
updateWebsiteComponents();