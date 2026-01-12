# Supabase Query Error Analysis & Fixes

## Summary of Issues Found

### 1. Users Table Query (500 Error)
**Problem**: RLS (Row Level Security) policy causing infinite recursion
**Error**: `infinite recursion detected in policy for relation "users"`

**Root Cause**: The RLS policy on the users table likely references itself or creates a circular dependency.

### 2. Quotes Table Query (400 Error) 
**Problem**: Column name mismatch
**Error**: `column quotes.quote does not exist`

**Root Cause**: The query is looking for a column named `quote` but the actual column name is `quote_text`.

## Database Schema Analysis

### Users Table Structure
✅ **Available Columns**:
- `id`, `email`, `full_name`, `community_affiliation`, `cultural_protocols`
- `preferred_pronouns`, `contact_preferences`, `role`, `profile_image_url`
- `bio`, `languages_spoken`, `created_at`, `updated_at`, `platform_role`
- `is_platform_team`, `storyteller_profile`, `preferred_interview_method`
- `availability`, `total_stories`, `total_transcript_minutes`, `projects`
- `summary`, `linked_media`, `linked_stories`, `linked_quotes`, `linked_themes`
- `linked_transcripts`, `community_id`, `primary_location_id`
- `public_story_count`, `shared_themes`, `contribution_score`
- `project_id`, `organization_id`

### Quotes Table Structure
✅ **Available Columns**:
- `id`, `quote_text` (not `quote`), `context`, `themes`, `emotion`
- `impact_score`, `story_id`, `transcript_id`, `extracted_by`
- `created_at`, `updated_at`

### Locations Table Structure
✅ **Available Columns**:
- `id`, `name`, `city`, `state`, `country`, `region`
- `coordinates`, `timezone`, `active`, `created_at`, `country_code`

## Fixed Queries

### 1. Working Users Query
```javascript
// Original failing query:
// users?select=id,full_name,profile_image_url,bio,community_affiliation,primary_location_id,project_id,locations!primary_location_id(id,name,state,country)&role=eq.storyteller&profile_image_url=not.is.null&limit=3

// Fixed query (needs admin privileges or RLS policy fix):
const { data } = await supabase
  .from('users')
  .select(`
    id,
    full_name,
    profile_image_url,
    bio,
    community_affiliation,
    primary_location_id,
    project_id,
    locations!primary_location_id(
      id,
      name,
      state,
      country
    )
  `)
  .eq('role', 'storyteller')
  .not('profile_image_url', 'is', null)
  .limit(3);
```

### 2. Working Quotes Query
```javascript
// Original failing query:
// quotes?select=id,quote,context,themes&limit=3&themes=ov.{innovation}

// Fixed query:
const { data } = await supabase
  .from('quotes')
  .select('id, quote_text, context, themes')  // Changed 'quote' to 'quote_text'
  .overlaps('themes', ['Innovation'])         // Case-sensitive theme matching
  .limit(3);
```

## Required Fixes

### 1. Fix RLS Policy on Users Table
The users table has an RLS policy causing infinite recursion. This needs to be addressed in the database:

```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Likely need to drop and recreate the problematic policy
-- This should be done carefully with proper access controls
```

### 2. Update Frontend Code
Update all references to `quotes.quote` to use `quotes.quote_text` instead.

### 3. Theme Matching Case Sensitivity
The themes are stored with proper case (e.g., 'Innovation' not 'innovation').

## Testing Results

✅ **Quotes Query**: Fixed and working
- Changed `quote` to `quote_text`
- Updated theme matching to use proper case
- Successfully returned 3 records

❌ **Users Query**: Still blocked by RLS policy
- Admin access bypasses the issue
- Regular user access triggers infinite recursion
- RLS policy needs database-level fix

## Recommendations

1. **Immediate Frontend Fix**: Update column references from `quote` to `quote_text`
2. **Database Admin Task**: Fix the RLS policy on users table
3. **Code Review**: Audit all Supabase queries for correct column names
4. **Testing**: Implement proper error handling for RLS policy issues
5. **Documentation**: Update API documentation with correct column names

## Files That Need Updates

Based on the column name fix needed:
- Any component or API route querying the quotes table
- CMS integration files
- Story-related components
- Analytics dashboards that use quotes data