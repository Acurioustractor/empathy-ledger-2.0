# JusticeHub Integration with Empathy Ledger

## Quick Start

Add these to your JusticeHub `.env` file:

```bash
# Empathy Ledger API Access
EMPATHY_LEDGER_URL=https://tednluwflfhxyucgwigh.supabase.co
EMPATHY_LEDGER_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5sdXdmbGZoeHl1Y2d3aWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDYyMjksImV4cCI6MjA2NzkyMjIyOX0.PG0iGZQR2d8yo4y3q1e2tEIMa3J0AdFkI1Q6P7IDgrg
```

## Usage in JusticeHub

### 1. Create Empathy Ledger Client

```javascript
// lib/empathy-ledger.js
import { createClient } from '@supabase/supabase-js';

const empathyLedger = createClient(
  process.env.EMPATHY_LEDGER_URL,
  process.env.EMPATHY_LEDGER_ANON_KEY
);

export default empathyLedger;
```

### 2. Fetch Public Stories

```javascript
// Get all public stories
const { data: stories, error } = await empathyLedger
  .from('stories')
  .select(`
    id,
    title,
    transcript,
    video_url,
    location,
    tags,
    submitted_at,
    storyteller_id
  `)
  .eq('privacy_level', 'public')
  .eq('status', 'published')
  .order('submitted_at', { ascending: false });

// Get stories with storyteller info
const { data: enrichedStories } = await empathyLedger
  .from('stories')
  .select(`
    *,
    users!storyteller_id (
      full_name,
      community_affiliation
    )
  `)
  .eq('privacy_level', 'public');
```

### 3. Search Stories by Theme

```javascript
// Search by theme
const { data: themedStories } = await empathyLedger
  .from('stories')
  .select('*')
  .contains('story_themes', ['justice', 'community'])
  .eq('privacy_level', 'public');
```

### 4. Get Storyteller Profiles

```javascript
// Get public storyteller profiles
const { data: storytellers } = await empathyLedger
  .from('users')
  .select('id, full_name, bio, community_affiliation')
  .eq('role', 'storyteller');
```

### 5. Real-time Updates (Optional)

```javascript
// Subscribe to new stories
const subscription = empathyLedger
  .channel('public-stories')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'stories',
      filter: 'privacy_level=eq.public'
    },
    (payload) => {
      console.log('New story:', payload.new);
    }
  )
  .subscribe();
```

## Available Tables

- `stories` - Story content and metadata
- `users` - Storyteller profiles
- `quotes` - Extracted quotes from stories
- `themes` - Story themes and topics

## Security Notes

1. The anon key is safe for client-side use
2. Only public stories are accessible
3. RLS policies protect private data
4. Never share the service role key

## Rate Limits

- 100 requests per minute per IP
- Use caching to reduce API calls
- Batch requests when possible