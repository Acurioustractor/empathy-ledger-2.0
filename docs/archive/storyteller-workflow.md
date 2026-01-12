# Storyteller & Transcript Management Workflow

## Quick Reference

### Adding a New Storyteller

```sql
-- In Supabase SQL Editor
SELECT add_new_storyteller(
    'email@example.com',
    'Full Name',
    'Community Name',
    'Brief bio here'
);
```

### Adding a New Story with Transcript

1. **Create the story**:
```javascript
const { data: story } = await supabase
  .from('stories')
  .insert({
    storyteller_id: 'user-uuid-here',
    title: 'Story Title',
    privacy_level: 'public',
    status: 'published',
    tags: ['theme1', 'theme2'],
    location: 'City, State'
  })
  .select()
  .single();
```

2. **Add the transcript**:
```javascript
const { data: transcript } = await supabase
  .rpc('process_new_transcript', {
    p_story_id: story.id,
    p_transcript_text: 'Full transcript text here...',
    p_source: 'manual' // or 'ai_generated'
  });
```

## Detailed Workflows

### 1. New Storyteller Onboarding

1. **Add to database**:
   - Use the `add_new_storyteller` function
   - This creates user record + onboarding tracking

2. **Complete profile**:
   ```javascript
   await supabase
     .from('users')
     .update({
       storyteller_profile: {
         interests: ['healthcare', 'education'],
         preferred_contact: 'email',
         interview_availability: 'weekends'
       }
     })
     .eq('id', userId);
   ```

3. **Track onboarding**:
   ```javascript
   await supabase
     .from('storyteller_onboarding')
     .update({
       profile_completed: true,
       consent_form_signed: true
     })
     .eq('user_id', userId);
   ```

### 2. Story Submission Process

1. **Initial submission**:
   ```javascript
   // Create story
   const { data: story } = await supabase
     .from('stories')
     .insert({
       storyteller_id: userId,
       title: title,
       status: 'draft',
       privacy_level: 'private',
       submission_method: 'web'
     })
     .select()
     .single();
   ```

2. **Add media** (if video/audio):
   ```javascript
   // Queue for processing
   await supabase
     .from('media_processing_queue')
     .insert({
       story_id: story.id,
       media_type: 'video',
       source_url: videoUrl,
       priority: 5
     });
   ```

3. **Process transcript**:
   ```javascript
   // For AI transcription
   const transcript = await processWithAssemblyAI(videoUrl);
   
   // Save transcript
   await supabase.rpc('process_new_transcript', {
     p_story_id: story.id,
     p_transcript_text: transcript.text,
     p_source: 'ai_generated'
   });
   ```

### 3. Transcript Management

#### Adding Manual Transcript
```javascript
await supabase.rpc('process_new_transcript', {
  p_story_id: storyId,
  p_transcript_text: manualText,
  p_source: 'manual'
});
```

#### Editing Existing Transcript
```javascript
// Get current transcript
const { data: current } = await supabase
  .from('transcripts')
  .select('*')
  .eq('story_id', storyId)
  .eq('is_current', true)
  .single();

// Create new version
await supabase
  .from('transcripts')
  .insert({
    story_id: storyId,
    version: current.version + 1,
    raw_transcript: current.raw_transcript,
    edited_transcript: editedText,
    source: current.source
  });
```

#### Searching Transcripts
```javascript
// Full-text search
const { data: results } = await supabase
  .from('transcripts')
  .select(`
    *,
    stories (
      title,
      storyteller_id,
      users (full_name)
    )
  `)
  .textSearch('search_vector', 'search terms here')
  .eq('is_current', true);
```

### 4. Theme Management

#### Add themes to story
```javascript
// Add multiple themes
const themes = ['resilience', 'community', 'healthcare'];
for (const themeName of themes) {
  // Get or create theme
  let { data: theme } = await supabase
    .from('themes')
    .select('id')
    .eq('name', themeName)
    .single();
  
  if (!theme) {
    const { data: newTheme } = await supabase
      .from('themes')
      .insert({ name: themeName })
      .select()
      .single();
    theme = newTheme;
  }
  
  // Link to story
  await supabase
    .from('story_themes')
    .insert({
      story_id: storyId,
      theme_id: theme.id,
      assigned_by: 'storyteller'
    });
}
```

### 5. Batch Import Process

```javascript
// For importing multiple stories/transcripts
async function batchImport(stories) {
  for (const story of stories) {
    // 1. Create storyteller if needed
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', story.email)
      .single();
    
    if (!user) {
      const { data: newUser } = await supabase
        .rpc('add_new_storyteller', {
          p_email: story.email,
          p_full_name: story.name,
          p_community: story.community
        });
      user = { id: newUser };
    }
    
    // 2. Create story
    const { data: newStory } = await supabase
      .from('stories')
      .insert({
        storyteller_id: user.id,
        title: story.title,
        video_url: story.video_url,
        status: 'published',
        privacy_level: 'public'
      })
      .select()
      .single();
    
    // 3. Add transcript
    if (story.transcript) {
      await supabase.rpc('process_new_transcript', {
        p_story_id: newStory.id,
        p_transcript_text: story.transcript,
        p_source: 'imported'
      });
    }
  }
}
```

## Dashboard Queries

### Storyteller Overview
```javascript
const { data: stats } = await supabase
  .from('storyteller_dashboard')
  .select('*')
  .eq('id', userId)
  .single();
```

### Recent Stories with Transcripts
```javascript
const { data: stories } = await supabase
  .from('stories_with_transcripts')
  .select('*')
  .order('submitted_at', { ascending: false })
  .limit(10);
```

### Processing Queue Status
```javascript
const { data: queue } = await supabase
  .from('media_processing_queue')
  .select('*')
  .in('status', ['pending', 'processing'])
  .order('priority', { ascending: false });
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Version transcripts** instead of overwriting
3. **Queue media processing** to avoid timeouts
4. **Use full-text search** for transcript queries
5. **Track onboarding progress** for better UX
6. **Batch operations** when importing multiple items
7. **Set appropriate privacy levels** by default

## Error Handling

```javascript
try {
  const result = await supabase.rpc('process_new_transcript', {
    p_story_id: storyId,
    p_transcript_text: text,
    p_source: source
  });
  
  if (result.error) {
    console.error('Transcript error:', result.error);
    // Handle specific errors
    if (result.error.code === '23505') {
      // Duplicate key - transcript already exists
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}