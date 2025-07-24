# 🎯 FINAL STORYTELLER-CENTRIC MIGRATION PLAN
## From Airtable to World-Class Supabase CMS

### CORE PHILOSOPHY REMINDER
> **"Every piece of data must trace back to a real person who gave consent to share their story."**

## 🏗️ ARCHITECTURE OVERVIEW

```
                    STORYTELLER (Real Person)
                           |
                    ┌──────┼──────┐
                    │      │      │
               ORGANISATION │   LOCATION
                    │      │      │
                 PROJECT  PROFILE  TRANSCRIPT
                    │      │      │
                    └──────┼──────┘
                           │
                        STORIES
                     (Published Content)
```

## 📊 PHASE 1: DATABASE SCHEMA DESIGN

### Core Tables Structure

```sql
-- 1. ORGANISATIONS (Foundation for storyteller affiliations)
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS (Groups stories and storytellers)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organisation_id UUID REFERENCES organisations(id),
  
  -- Project settings
  is_active BOOLEAN DEFAULT true,
  privacy_settings JSONB DEFAULT '{"public": false}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOCATIONS (Geographic context)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Australia',
  coordinates POINT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORYTELLERS (The heart of everything)
CREATE TABLE storytellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone_number TEXT,
  role TEXT, -- from Airtable
  
  -- Profile
  profile_image_url TEXT,
  bio TEXT,
  
  -- Affiliations (can be null)
  organisation_id UUID REFERENCES organisations(id),
  project_id UUID REFERENCES projects(id),
  location_id UUID REFERENCES locations(id),
  
  -- Consent & Privacy (CRITICAL)
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  privacy_preferences JSONB DEFAULT '{
    "public_display": false,
    "show_photo": false,
    "show_location": false,
    "show_organisation": false
  }'::jsonb,
  
  -- Airtable migration tracking
  airtable_record_id TEXT UNIQUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_storytellers_org (organisation_id),
  INDEX idx_storytellers_project (project_id),
  INDEX idx_storytellers_location (location_id)
);

-- 5. TRANSCRIPTS (Raw storyteller content)
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT,
  transcript_text TEXT,
  media_url TEXT, -- from Airtable Media field
  
  -- Processing
  processed BOOLEAN DEFAULT false,
  themes TEXT[] DEFAULT '{}',
  quotes_extracted INTEGER DEFAULT 0,
  
  -- Airtable tracking
  airtable_media_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_transcripts_storyteller (storyteller_id)
);

-- 6. STORIES (Published content from storytellers)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to storyteller (CRITICAL - never orphaned)
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Story content
  title TEXT NOT NULL,
  story_copy TEXT, -- formatted story text
  story_transcript TEXT, -- raw transcript if different
  
  -- Media
  story_image_url TEXT,
  video_story_link TEXT,
  video_embed_code TEXT,
  
  -- Publishing controls
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Privacy (inherits from storyteller but can override)
  privacy_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Themes and quotes (denormalized for performance)
  themes TEXT[] DEFAULT '{}',
  featured_quotes TEXT[] DEFAULT '{}',
  
  -- Airtable tracking
  airtable_story_id TEXT UNIQUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance indexes
  INDEX idx_stories_storyteller (storyteller_id),
  INDEX idx_stories_published (is_published, published_at DESC),
  INDEX idx_stories_themes USING GIN (themes)
);

-- 7. CMS_CACHE (For website performance)
CREATE TABLE cms_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_type TEXT NOT NULL, -- 'storyteller_card', 'story_preview', etc
  
  -- Cached data
  data JSONB NOT NULL,
  
  -- Related entities
  storyteller_id UUID REFERENCES storytellers(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  
  -- Cache management
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_cache_expires (expires_at),
  INDEX idx_cache_type_key (cache_type, cache_key)
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Public storytellers (with consent)
CREATE POLICY "Public storytellers viewable"
  ON storytellers FOR SELECT
  USING (
    consent_given = true 
    AND privacy_preferences->>'public_display' = 'true'
  );

-- Public stories (from consenting storytellers)
CREATE POLICY "Public stories viewable"
  ON stories FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM storytellers s
      WHERE s.id = stories.storyteller_id
      AND s.consent_given = true
      AND s.privacy_preferences->>'public_display' = 'true'
    )
  );

-- Admin access (for migration and management)
CREATE POLICY "Admin full access"
  ON storytellers FOR ALL
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');
```

## 🔄 PHASE 2: AIRTABLE MIGRATION SCRIPT

### Migration Architecture

```typescript
// migration-config.ts
export interface AirtableStoryteller {
  id: string
  fields: {
    Name: string
    Organisation?: string
    Project?: string
    Location?: string
    'Media'?: string[] // Transcript IDs
    'File Profile Image'?: Array<{url: string}>
    Role?: string
    'Phone Number'?: string
    Created: string
  }
}

export interface AirtableStory {
  id: string
  fields: {
    'Story ID': string
    Storytellers: string[] // Linked record IDs
    'Video Story Link'?: string
    'Video Embed Code'?: string
    Title: string
    'Story Transcript'?: string
    'Story Copy'?: string
    'Story Image'?: Array<{url: string}>
    Created: string
  }
}
```

### Migration Execution Plan

```typescript
// execute-migration.ts
import { createClient } from '@supabase/supabase-js'
import Airtable from 'airtable'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID!)

async function migrateFromAirtable() {
  console.log('🚀 STARTING STORYTELLER-CENTRIC MIGRATION')
  console.log('='.repeat(80))
  
  try {
    // Step 1: Migrate Organisations
    await migrateOrganisations()
    
    // Step 2: Migrate Projects
    await migrateProjects()
    
    // Step 3: Migrate Locations
    await migrateLocations()
    
    // Step 4: Migrate Storytellers (CRITICAL)
    await migrateStorytellers()
    
    // Step 5: Migrate Transcripts
    await migrateTranscripts()
    
    // Step 6: Migrate Stories
    await migrateStories()
    
    // Step 7: Extract themes and quotes
    await processTranscripts()
    
    // Step 8: Build CMS cache
    await buildCmsCache()
    
    // Step 9: Validate migration
    await validateMigration()
    
    console.log('✅ MIGRATION COMPLETE!')
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error)
    throw error
  }
}

// STEP 4: Migrate Storytellers (Most Important)
async function migrateStorytellers() {
  console.log('\n👥 MIGRATING STORYTELLERS')
  console.log('-'.repeat(50))
  
  const storytellers = await base('Storytellers').select().all()
  
  for (const record of storytellers) {
    const { fields } = record
    
    // Find or create organisation
    let orgId = null
    if (fields.Organisation) {
      const { data: org } = await supabase
        .from('organisations')
        .select('id')
        .eq('name', fields.Organisation)
        .single()
      
      orgId = org?.id
    }
    
    // Find or create location
    let locationId = null
    if (fields.Location) {
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('name', fields.Location)
        .single()
      
      locationId = location?.id
    }
    
    // Create storyteller
    const { data: storyteller, error } = await supabase
      .from('storytellers')
      .insert({
        full_name: fields.Name,
        email: fields.Email || null,
        phone_number: fields['Phone Number'] || null,
        role: fields.Role || null,
        profile_image_url: fields['File Profile Image']?.[0]?.url || null,
        organisation_id: orgId,
        location_id: locationId,
        airtable_record_id: record.id,
        consent_given: true, // Assuming consent if in Airtable
        consent_date: fields.Created,
        privacy_preferences: {
          public_display: true,
          show_photo: !!fields['File Profile Image'],
          show_location: !!fields.Location,
          show_organisation: !!fields.Organisation
        },
        created_at: fields.Created
      })
      .select()
      .single()
    
    if (error) {
      console.error(`❌ Failed to migrate ${fields.Name}:`, error)
      continue
    }
    
    console.log(`✅ Migrated storyteller: ${fields.Name}`)
    
    // Track for transcript migration
    storytellerMap.set(record.id, storyteller.id)
  }
  
  console.log(`✅ Migrated ${storytellerMap.size} storytellers`)
}

// STEP 6: Migrate Stories (Linked to Storytellers)
async function migrateStories() {
  console.log('\n📖 MIGRATING STORIES')
  console.log('-'.repeat(50))
  
  const stories = await base('Stories').select().all()
  
  for (const record of stories) {
    const { fields } = record
    
    // CRITICAL: Must have a storyteller
    if (!fields.Storytellers || fields.Storytellers.length === 0) {
      console.warn(`⚠️  Skipping story "${fields.Title}" - no storyteller linked`)
      continue
    }
    
    // Get the primary storyteller (first one)
    const airtableStorytellerId = fields.Storytellers[0]
    const storytellerId = storytellerMap.get(airtableStorytellerId)
    
    if (!storytellerId) {
      console.error(`❌ No storyteller found for story "${fields.Title}"`)
      continue
    }
    
    // Create story
    const { error } = await supabase
      .from('stories')
      .insert({
        storyteller_id: storytellerId, // CRITICAL LINK
        title: fields.Title,
        story_copy: fields['Story Copy'],
        story_transcript: fields['Story Transcript'],
        story_image_url: fields['Story Image']?.[0]?.url || null,
        video_story_link: fields['Video Story Link'],
        video_embed_code: fields['Video Embed Code'],
        is_published: true, // Assuming published if in Airtable
        published_at: fields.Created,
        airtable_story_id: fields['Story ID'],
        created_at: fields.Created
      })
    
    if (error) {
      console.error(`❌ Failed to migrate story "${fields.Title}":`, error)
      continue
    }
    
    console.log(`✅ Migrated story: "${fields.Title}" → ${storytellerMap.get(airtableStorytellerId)}`)
  }
}
```

## 🚀 PHASE 3: CMS INTEGRATION

### CMS Service Layer

```typescript
// src/lib/cms-service.ts
export class StorytellerCmsService {
  private supabase: SupabaseClient
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  /**
   * Get storytellers for display with all related data
   * Uses cache for performance
   */
  async getStorytellerCards(options: {
    project?: string
    organisation?: string
    limit?: number
  }) {
    const cacheKey = `storyteller_cards_${JSON.stringify(options)}`
    
    // Check cache first
    const { data: cached } = await this.supabase
      .from('cms_cache')
      .select('data')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (cached) {
      return cached.data
    }
    
    // Build query
    let query = this.supabase
      .from('storytellers')
      .select(`
        id,
        full_name,
        profile_image_url,
        bio,
        role,
        privacy_preferences,
        organisation:organisations(name),
        location:locations(name, state),
        stories!storyteller_id(
          id,
          title,
          themes,
          featured_quotes,
          is_published
        )
      `)
      .eq('consent_given', true)
      .eq('privacy_preferences->public_display', 'true')
    
    if (options.project) {
      const { data: project } = await this.supabase
        .from('projects')
        .select('id')
        .eq('name', options.project)
        .single()
      
      if (project) {
        query = query.eq('project_id', project.id)
      }
    }
    
    if (options.organisation) {
      const { data: org } = await this.supabase
        .from('organisations')
        .select('id')
        .eq('name', options.organisation)
        .single()
      
      if (org) {
        query = query.eq('organisation_id', org.id)
      }
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    const { data: storytellers, error } = await query
    
    if (error) throw error
    
    // Transform data for cards
    const cards = storytellers?.map(storyteller => ({
      id: storyteller.id,
      name: storyteller.full_name,
      photo: storyteller.privacy_preferences?.show_photo ? storyteller.profile_image_url : null,
      role: storyteller.role,
      organisation: storyteller.privacy_preferences?.show_organisation ? storyteller.organisation?.name : null,
      location: storyteller.privacy_preferences?.show_location 
        ? `${storyteller.location?.name}, ${storyteller.location?.state}`
        : null,
      themes: storyteller.stories
        ?.filter(s => s.is_published)
        ?.flatMap(s => s.themes)
        ?.filter((v, i, a) => a.indexOf(v) === i) // unique
        ?.slice(0, 3) || [],
      quote: storyteller.stories
        ?.filter(s => s.is_published && s.featured_quotes?.length > 0)
        ?.[0]?.featured_quotes?.[0] || null
    }))
    
    // Cache the result
    await this.supabase
      .from('cms_cache')
      .upsert({
        cache_key: cacheKey,
        cache_type: 'storyteller_cards',
        data: cards,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min cache
      })
    
    return cards
  }
  
  /**
   * Get full story with storyteller info
   */
  async getStoryWithStoryteller(storyId: string) {
    const { data, error } = await this.supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers!storyteller_id(
          full_name,
          profile_image_url,
          bio,
          organisation:organisations(name),
          location:locations(name, state),
          privacy_preferences
        )
      `)
      .eq('id', storyId)
      .eq('is_published', true)
      .single()
    
    if (error) throw error
    
    // Respect privacy preferences
    if (data.storyteller.privacy_preferences) {
      if (!data.storyteller.privacy_preferences.show_photo) {
        data.storyteller.profile_image_url = null
      }
      if (!data.storyteller.privacy_preferences.show_organisation) {
        data.storyteller.organisation = null
      }
      if (!data.storyteller.privacy_preferences.show_location) {
        data.storyteller.location = null
      }
    }
    
    return data
  }
}
```

### React Component Integration

```tsx
// src/components/cms/StorytellerCards.tsx
'use client'

import { useEffect, useState } from 'react'
import { StorytellerCmsService } from '@/lib/cms-service'

interface StorytellerCardsProps {
  project?: string
  organisation?: string
  limit?: number
}

export default function StorytellerCards({ 
  project, 
  organisation, 
  limit = 3 
}: StorytellerCardsProps) {
  const [storytellers, setStorytellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const cms = new StorytellerCmsService()
    
    cms.getStorytellerCards({ project, organisation, limit })
      .then(setStorytellers)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [project, organisation, limit])
  
  if (loading) return <StorytellerCardsSkeleton />
  if (error) return <StorytellerCardsError error={error} />
  if (!storytellers.length) return <NoStorytellersMessage />
  
  return (
    <div className="storyteller-cards-grid">
      {storytellers.map(storyteller => (
        <StorytellerCard key={storyteller.id} {...storyteller} />
      ))}
    </div>
  )
}

function StorytellerCard({ name, photo, role, organisation, location, themes, quote }) {
  return (
    <article className="storyteller-card">
      {/* Always show name - it's public with consent */}
      <h3>{name}</h3>
      
      {/* Conditionally show based on privacy preferences */}
      {photo && <img src={photo} alt={name} />}
      {role && <p className="role">{role}</p>}
      {organisation && <p className="org">{organisation}</p>}
      {location && <p className="location">{location}</p>}
      
      {/* Themes from their stories */}
      {themes.length > 0 && (
        <div className="themes">
          {themes.map(theme => (
            <span key={theme} className="theme-tag">{theme}</span>
          ))}
        </div>
      )}
      
      {/* Featured quote */}
      {quote && (
        <blockquote className="featured-quote">
          "{quote}"
        </blockquote>
      )}
    </article>
  )
}
```

## ✅ PHASE 4: VALIDATION & BEST PRACTICES

### Data Integrity Validation

```typescript
async function validateMigration() {
  console.log('\n🔍 VALIDATING MIGRATION')
  console.log('-'.repeat(50))
  
  // 1. No orphaned stories
  const { count: orphanedStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact' })
    .is('storyteller_id', null)
  
  if (orphanedStories > 0) {
    throw new Error(`❌ Found ${orphanedStories} orphaned stories!`)
  }
  
  // 2. All storytellers have consent
  const { count: noConsent } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact' })
    .eq('consent_given', false)
  
  console.log(`⚠️  ${noConsent} storytellers without explicit consent (won't be displayed)`)
  
  // 3. Privacy preferences respected
  const { data: publicStorytellers } = await supabase
    .from('storytellers')
    .select('full_name, privacy_preferences')
    .eq('consent_given', true)
    .eq('privacy_preferences->public_display', 'true')
  
  console.log(`✅ ${publicStorytellers.length} storytellers with public display consent`)
  
  // 4. All Airtable records migrated
  const { count: totalStorytellers } = await supabase
    .from('storytellers')
    .select('*', { count: 'exact' })
    .not('airtable_record_id', 'is', null)
  
  console.log(`✅ ${totalStorytellers} storytellers migrated from Airtable`)
  
  console.log('\n✅ VALIDATION COMPLETE')
}
```

### Performance Optimization

```sql
-- Create materialized view for fast CMS queries
CREATE MATERIALIZED VIEW storyteller_cms_view AS
SELECT 
  s.id,
  s.full_name,
  s.profile_image_url,
  s.role,
  s.privacy_preferences,
  o.name as organisation_name,
  l.name as location_name,
  l.state as location_state,
  array_agg(DISTINCT st.themes) as all_themes,
  array_agg(DISTINCT st.featured_quotes) as all_quotes
FROM storytellers s
LEFT JOIN organisations o ON s.organisation_id = o.id
LEFT JOIN locations l ON s.location_id = l.id
LEFT JOIN stories st ON s.id = st.storyteller_id AND st.is_published = true
WHERE s.consent_given = true
  AND s.privacy_preferences->>'public_display' = 'true'
GROUP BY s.id, s.full_name, s.profile_image_url, s.role, s.privacy_preferences, o.name, l.name, l.state;

-- Refresh every hour
CREATE OR REPLACE FUNCTION refresh_storyteller_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY storyteller_cms_view;
END;
$$ LANGUAGE plpgsql;
```

## 🎯 SUCCESS CRITERIA

### ✅ Technical Success
- [ ] All Airtable data migrated without loss
- [ ] No orphaned records in database
- [ ] All relationships properly linked
- [ ] RLS policies enforcing privacy
- [ ] CMS queries under 100ms

### ✅ Philosophy Success
- [ ] Every story traces to a consenting storyteller
- [ ] Privacy preferences respected throughout
- [ ] No fabricated or orphaned content
- [ ] Cultural protocols enforceable
- [ ] Data sovereignty maintained

### ✅ CMS Success
- [ ] Website displays only consented content
- [ ] Fast page loads with caching
- [ ] Real-time updates when needed
- [ ] Graceful handling of missing data
- [ ] Clear attribution to storytellers

## 🚨 CRITICAL RULES

1. **NEVER CREATE ORPHANED DATA**
   - Every story MUST have a storyteller
   - Every quote MUST trace to a transcript
   - Every theme MUST come from real content

2. **ALWAYS RESPECT CONSENT**
   - Check consent_given before display
   - Honor privacy_preferences granularly
   - Default to private if uncertain

3. **MAINTAIN DATA LINEAGE**
   - Track Airtable IDs for audit trail
   - Log all transformations
   - Enable full data export for sovereignty

## 🎉 FINAL OUTCOME

After this migration, Empathy Ledger will have:

1. **A clean, storyteller-centric database** where every piece of content traces back to a real person
2. **Robust privacy controls** that respect individual and cultural preferences
3. **A performant CMS** that serves authentic stories quickly and reliably
4. **Complete data sovereignty** with full export capabilities
5. **A foundation for growth** that maintains integrity at scale

**This is not just a migration - it's building a world-class platform for community storytelling with dignity, respect, and technical excellence.**