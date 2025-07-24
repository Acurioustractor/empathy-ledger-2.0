# 🚀 COMPLETE MIGRATION PLAN - STORYTELLER-CENTRIC ARCHITECTURE

## CORE PRINCIPLE: EVERYTHING FLOWS FROM STORYTELLERS

**Every piece of data must trace back to a real person who gave consent to share their story.**

## ARCHITECTURE: STORYTELLER AT THE CENTER

```
                    STORYTELLER (Real Person)
                           |
                    ┌──────┼──────┐
                    │      │      │
               CONSENT  PROFILE  TRANSCRIPT
                    │      │      │
                    │      │   ┌──┴──┐
                    │      │   │     │
                    │   LOCATION  QUOTES
                    │      │      │
                    │      │   THEMES
                    │      │      │
                    └──────┼──────┘
                           │
                       STORIES
```

## PHASE 1: FOUNDATION SETUP

### 1.1 Nuke Current Database
```sql
-- Delete all data (DANGEROUS - backup first)
TRUNCATE users, stories, quotes, themes, locations, projects CASCADE;
```

### 1.2 Create Core Tables (Storyteller-Centric)
```sql
-- 1. STORYTELLERS (the center of everything)
CREATE TABLE storytellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  
  -- Profile
  profile_image_url TEXT,
  bio TEXT,
  community_affiliation TEXT,
  
  -- Consent & Privacy
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP,
  sharing_preferences JSONB,
  cultural_protocols TEXT[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. LOCATIONS (where storytellers are)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL,
  coordinates POINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. TRANSCRIPTS (source of all content)
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Source
  title TEXT,
  transcript_url TEXT,
  transcript_text TEXT,
  audio_url TEXT,
  
  -- Context
  interview_date DATE,
  interviewer TEXT,
  location_id UUID REFERENCES locations(id),
  
  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processing_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. QUOTES (extracted FROM transcripts BY storytellers)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Content
  quote_text TEXT NOT NULL,
  context TEXT,
  
  -- Metadata
  timestamp_start INTEGER, -- seconds into transcript
  timestamp_end INTEGER,
  extracted_by TEXT DEFAULT 'migration',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. THEMES (derived FROM transcripts BY storytellers)
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Content
  name TEXT NOT NULL,
  description TEXT,
  
  -- Metadata
  confidence_score FLOAT,
  derived_by TEXT DEFAULT 'migration',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. STORIES (collections of storyteller content)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  story_content TEXT,
  
  -- Publishing
  published BOOLEAN DEFAULT FALSE,
  published_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

## PHASE 2: MIGRATION EXECUTION

### 2.1 Pre-Migration Validation
```typescript
async function validateAirtableData() {
  // 1. Ensure every record has a real person
  // 2. Verify consent documentation exists
  // 3. Check transcript accessibility
  // 4. Validate data integrity
  // 5. Create migration manifest
}
```

### 2.2 Step-by-Step Migration (IN ORDER)

#### Step 1: Migrate STORYTELLERS
```typescript
async function migrateStorytellers() {
  console.log('🧑 Migrating Storytellers (FOUNDATION)...');
  
  const airtableStorytellers = await getAirtableRecords('Storytellers');
  
  for (const person of airtableStorytellers) {
    // CRITICAL: Only migrate if consent exists
    if (!person.consent_given) {
      console.warn(`⚠️  Skipping ${person.full_name} - no consent`);
      continue;
    }
    
    const storyteller = await supabase
      .from('storytellers')
      .insert({
        full_name: person.full_name,
        email: person.email,
        profile_image_url: person.profile_image,
        bio: person.bio,
        community_affiliation: person.organization,
        consent_given: true,
        consent_date: person.consent_date,
        sharing_preferences: person.sharing_prefs
      })
      .select()
      .single();
    
    console.log(`✅ Migrated: ${storyteller.full_name}`);
  }
}
```

#### Step 2: Migrate LOCATIONS
```typescript
async function migrateLocations() {
  console.log('📍 Migrating Locations...');
  
  const airtableLocations = await getAirtableRecords('Locations');
  
  for (const location of airtableLocations) {
    await supabase
      .from('locations') 
      .insert({
        name: location.name,
        city: location.city,
        state: location.state,
        country: location.country,
        coordinates: location.coordinates
      });
  }
}
```

#### Step 3: Link STORYTELLERS to LOCATIONS
```typescript
async function linkStorytellersToLocations() {
  console.log('🔗 Linking Storytellers to Locations...');
  
  // Add location_id to storytellers table
  // This ensures every storyteller has a place
}
```

#### Step 4: Migrate TRANSCRIPTS
```typescript
async function migrateTranscripts() {
  console.log('📝 Migrating Transcripts...');
  
  const airtableTranscripts = await getAirtableRecords('Transcripts');
  
  for (const transcript of airtableTranscripts) {
    // CRITICAL: Must link to existing storyteller
    const storyteller = await findStorytellerByName(transcript.storyteller_name);
    
    if (!storyteller) {
      console.error(`❌ No storyteller found for transcript: ${transcript.title}`);
      continue;
    }
    
    await supabase
      .from('transcripts')
      .insert({
        storyteller_id: storyteller.id, // CRITICAL LINK
        title: transcript.title,
        transcript_url: transcript.url,
        transcript_text: transcript.text,
        interview_date: transcript.date,
        location_id: transcript.location_id
      });
    
    console.log(`✅ Linked transcript "${transcript.title}" to ${storyteller.full_name}`);
  }
}
```

#### Step 5: Extract QUOTES from TRANSCRIPTS
```typescript
async function extractQuotes() {
  console.log('💬 Extracting Quotes from Transcripts...');
  
  const transcripts = await supabase
    .from('transcripts')
    .select('*, storytellers(full_name)')
    .eq('processed', false);
  
  for (const transcript of transcripts) {
    const quotes = await extractQuotesFromText(transcript.transcript_text);
    
    for (const quote of quotes) {
      await supabase
        .from('quotes')
        .insert({
          storyteller_id: transcript.storyteller_id, // CRITICAL LINK
          transcript_id: transcript.id,              // CRITICAL LINK
          quote_text: quote.text,
          context: quote.context,
          timestamp_start: quote.start_time
        });
    }
    
    // Mark as processed
    await supabase
      .from('transcripts')
      .update({ processed: true })
      .eq('id', transcript.id);
    
    console.log(`✅ Extracted quotes from ${transcript.storytellers.full_name}'s transcript`);
  }
}
```

#### Step 6: Generate THEMES from TRANSCRIPTS
```typescript
async function generateThemes() {
  console.log('🏷️  Generating Themes from Transcripts...');
  
  const transcripts = await supabase
    .from('transcripts')
    .select('*, storytellers(full_name)')
    .eq('processed', true);
  
  for (const transcript of transcripts) {
    const themes = await analyzeTranscriptForThemes(transcript.transcript_text);
    
    for (const theme of themes) {
      await supabase
        .from('themes')
        .insert({
          storyteller_id: transcript.storyteller_id, // CRITICAL LINK
          transcript_id: transcript.id,              // CRITICAL LINK
          name: theme.name,
          description: theme.description,
          confidence_score: theme.confidence
        });
    }
    
    console.log(`✅ Generated themes for ${transcript.storytellers.full_name}`);
  }
}
```

#### Step 7: Create STORIES (Collections)
```typescript
async function createStories() {
  console.log('📖 Creating Stories...');
  
  const storytellers = await supabase
    .from('storytellers')
    .select('*');
  
  for (const storyteller of storytellers) {
    // Get their content
    const quotes = await supabase
      .from('quotes')
      .select('*')
      .eq('storyteller_id', storyteller.id);
    
    const themes = await supabase
      .from('themes')
      .select('*')
      .eq('storyteller_id', storyteller.id);
    
    if (quotes.length > 0 || themes.length > 0) {
      await supabase
        .from('stories')
        .insert({
          storyteller_id: storyteller.id, // CRITICAL LINK
          title: `${storyteller.full_name}'s Story`,
          story_content: generateStoryContent(quotes, themes),
          published: storyteller.consent_given
        });
      
      console.log(`✅ Created story for ${storyteller.full_name}`);
    }
  }
}
```

## PHASE 3: VALIDATION & TESTING

### 3.1 Data Integrity Checks
```typescript
async function validateMigration() {
  console.log('✅ Validating Migration...');
  
  // 1. Every quote has a storyteller
  const orphanedQuotes = await supabase
    .from('quotes')
    .select('id')
    .is('storyteller_id', null);
  
  if (orphanedQuotes.length > 0) {
    throw new Error(`❌ Found ${orphanedQuotes.length} orphaned quotes`);
  }
  
  // 2. Every theme has a storyteller
  const orphanedThemes = await supabase
    .from('themes')
    .select('id')
    .is('storyteller_id', null);
  
  if (orphanedThemes.length > 0) {
    throw new Error(`❌ Found ${orphanedThemes.length} orphaned themes`);
  }
  
  // 3. Every storyteller has content or is marked as pending
  const storytellersWithoutContent = await supabase
    .from('storytellers')
    .select(`
      id, full_name,
      quotes:quotes(count),
      themes:themes(count)
    `)
    .having('quotes.count = 0 AND themes.count = 0');
  
  console.log(`⚠️  ${storytellersWithoutContent.length} storytellers have no content yet`);
  
  console.log('✅ Migration validation complete');
}
```

### 3.2 Website Component Testing
```typescript
// Update StorytellerCards to use new architecture
async function getStorytellerData(storytellerId: string) {
  const { data } = await supabase
    .from('storytellers')
    .select(`
      *,
      location:locations(*),
      quotes(*),
      themes(*),
      stories(*)
    `)
    .eq('id', storytellerId)
    .eq('consent_given', true)
    .single();
  
  return data; // Everything traces back to this one person
}
```

## PHASE 4: ROLLBACK PLAN

### 4.1 Backup Strategy
```bash
# Before migration
pg_dump empathy_ledger > pre_migration_backup.sql

# After each phase
pg_dump empathy_ledger > phase_${PHASE}_backup.sql
```

### 4.2 Rollback Procedure
```typescript
async function rollbackMigration(toPhase: number) {
  console.log(`🔄 Rolling back to Phase ${toPhase}...`);
  
  // Restore from backup
  await restoreFromBackup(`phase_${toPhase}_backup.sql`);
  
  // Verify rollback
  await validateMigrationState(toPhase);
  
  console.log('✅ Rollback complete');
}
```

## SUCCESS CRITERIA

### ✅ Every piece of data traces to a storyteller
### ✅ No orphaned quotes, themes, or stories
### ✅ Consent tracking works perfectly
### ✅ Website displays authentic data only
### ✅ Data sovereignty maintained
### ✅ Cultural protocols respected

## EXECUTION TIMELINE

1. **Day 1**: Setup new database schema
2. **Day 2**: Migrate storytellers & locations
3. **Day 3**: Migrate transcripts & validate links
4. **Day 4**: Extract quotes & generate themes
5. **Day 5**: Create stories & validate complete migration
6. **Day 6**: Update website components & test
7. **Day 7**: Go live with clean, authentic data

## THE GUARANTEE

**After this migration, every quote, theme, and story on the website will trace back to a real person who gave consent to share their story. No exceptions.**