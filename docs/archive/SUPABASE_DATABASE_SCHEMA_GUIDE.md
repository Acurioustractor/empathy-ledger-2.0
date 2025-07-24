# Supabase Database Schema & Error Prevention Guide

## Overview

This document captures critical lessons learned from database query errors and provides standardized patterns for consistent database interactions across the Empathy Ledger platform.

## Database Schema Reference

### Core Tables and Correct Column Names

#### `users` Table
```sql
- id (uuid, primary key)
- full_name (text)
- profile_image_url (text, nullable)
- bio (text, nullable)
- community_affiliation (text, nullable)
- role (text) -- Values: 'storyteller', 'admin', etc.
- primary_location_id (uuid, foreign key to locations)
- project_id (uuid, foreign key to projects)
- created_at (timestamp)
```

#### `quotes` Table
```sql
- id (uuid, primary key)
- quote_text (text) -- ⚠️ NOT 'quote' - this was the source of 400 errors
- context (text, nullable)
- themes (text[], array of theme names)
- linked_storytellers (uuid[], array of user IDs)
- created_at (timestamp)
```

#### `projects` Table
```sql
- id (uuid, primary key)
- name (text)
- project_type (text, nullable)
- description (text, nullable)
- status (text, nullable)
- created_at (timestamp)
```

#### `locations` Table
```sql
- id (uuid, primary key)
- name (text)
- state (text, nullable)
- country (text, nullable)
- coordinates (point, nullable)
```

#### `themes` Table
```sql
- id (uuid, primary key)
- name (text)
- description (text, nullable)
- linked_storytellers (uuid[], array of user IDs)
```

## Critical Errors Encountered & Solutions

### Error Type 1: Column Name Mismatches (400 Errors)

**Problem**: Using incorrect column names in queries
- ❌ Used `quote` instead of `quote_text`
- ❌ Used `theme` instead of `themes`

**Solution**: Always verify actual database schema before writing queries

**Prevention Rules**:
1. Never assume column names - always check the actual database
2. Use the debug scripts to verify schema before implementing
3. Update TypeScript interfaces to match actual database columns

### Error Type 2: RLS Policy Issues (500 Errors)

**Problem**: Row Level Security policies causing infinite recursion
- Users table has RLS policy that references itself
- Causes 500 internal server errors

**Solutions**:
1. **Immediate**: Use fallback data when queries fail
2. **Long-term**: Database admin needs to fix RLS policies
3. **Workaround**: Use service role key for admin operations

### Error Type 3: Foreign Key Relationship Issues

**Problem**: Incorrect JOIN syntax or missing relationships
- Using wrong foreign key column names
- Incorrect Supabase query syntax for joins

**Prevention**: Use standardized query patterns (see below)

## Standardized Query Patterns

### 1. Users with Location Data
```typescript
// ✅ CORRECT
const { data, error } = await client
  .from('users')
  .select(`
    id,
    full_name,
    profile_image_url,
    bio,
    community_affiliation,
    primary_location_id,
    project_id,
    locations!primary_location_id(id, name, state, country)
  `)
  .eq('role', 'storyteller');
```

### 2. Quotes with Theme Filtering
```typescript
// ✅ CORRECT
const { data, error } = await client
  .from('quotes')
  .select('id, quote_text, context, themes')
  .overlaps('themes', ['Innovation', 'Community'])
  .limit(10);
```

### 3. Array Column Queries
```typescript
// ✅ CORRECT - for array columns
.overlaps('linked_storytellers', [userId])
.overlaps('themes', ['theme1', 'theme2'])

// ❌ WRONG - don't use contains for arrays
.contains('themes', 'Innovation')
```

## TypeScript Interface Standards

### Correct Interfaces
```typescript
export interface CMSStoryteller {
  id: string;
  full_name: string;
  profile_image_url?: string;
  bio?: string;
  community_affiliation?: string;
  location?: {
    id: string;
    name: string;
    state?: string;
    country?: string;
  };
  themes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  quotes: Array<{
    id: string;
    quote_text: string; // ⚠️ NOT 'quote'
    context?: string;
  }>;
}

export interface CMSQuote {
  id: string;
  quote_text: string; // ⚠️ NOT 'quote'
  context?: string;
  themes?: string[];
}
```

## Error Handling Best Practices

### 1. Always Use Fallback Data
```typescript
export const FALLBACK_STORYTELLERS: CMSStoryteller[] = [
  {
    id: 'fallback-1',
    full_name: 'Community Member',
    profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&q=80',
    community_affiliation: 'Community Network',
    location: {
      id: 'fallback-location',
      name: 'Australia',
    },
    themes: [
      { id: 'community', name: 'Community Impact', description: 'Making a difference in local communities' },
    ],
    quotes: [
      {
        id: 'fallback-quote',
        quote_text: 'Through community storytelling, we create connections that bridge understanding and inspire positive change.',
        context: 'Community impact',
      },
    ],
  },
];
```

### 2. Graceful Error Handling
```typescript
export async function getStorytellers(options = {}) {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('users').select('...');
    
    if (error) {
      console.error('❌ Error fetching storytellers:', error);
      return useFallback ? FALLBACK_STORYTELLERS : [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ CMS getStorytellers error:', error);
    return useFallback ? FALLBACK_STORYTELLERS : [];
  }
}
```

### 3. Loading States and User Feedback
```typescript
const [state, setState] = useState({
  data: null,
  loading: true,
  error: null,
});

// Always provide loading states in components
if (loading) {
  return <SkeletonLoader />;
}

if (error && !data) {
  return <ErrorFallback message={error} />;
}
```

## Database Testing & Validation

### Pre-Implementation Checklist
1. **Schema Verification**: Run debug script to confirm table structure
2. **Column Name Check**: Verify exact column names match code
3. **RLS Policy Test**: Test queries with regular user permissions
4. **Relationship Validation**: Confirm foreign key relationships work
5. **Array Column Testing**: Test array operations (overlaps, contains)

### Debug Script Template
```typescript
// debug-database-schema.ts
import { createClient } from '@supabase/supabase-js';

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function debugDatabaseSchema() {
  console.log('🔍 Testing database schema...');
  
  // Test each table
  const tables = ['users', 'quotes', 'projects', 'locations', 'themes'];
  
  for (const table of tables) {
    try {
      const { data, error } = await client
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.error(`❌ ${table} table error:`, error);
      } else {
        console.log(`✅ ${table} table columns:`, Object.keys(data?.[0] || {}));
      }
    } catch (err) {
      console.error(`💥 ${table} table failed:`, err);
    }
  }
}
```

## Component Integration Rules

### 1. Use Centralized CMS Hooks
```typescript
// ✅ CORRECT - use centralized hooks
import { useStorytellerCards } from '@/hooks/useCMS';

function MyComponent() {
  const { data: storytellers, loading, error } = useStorytellerCards({
    projectName: "A Curious Tractor",
    limit: 3,
  });
}

// ❌ WRONG - don't create direct Supabase clients in components
```

### 2. Consistent Error Display
```typescript
// ✅ Always handle all three states
if (loading) return <LoadingSkeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data || data.length === 0) return <EmptyState />;
```

### 3. Fallback Data Usage
```typescript
// ✅ CORRECT - graceful degradation
const displayData = data && data.length > 0 ? data : FALLBACK_DATA;
```

## Site-Wide Implementation Standards

### File Organization
```
src/
├── lib/
│   ├── cms-core.ts          // Single source of truth for database
│   └── database.types.ts    // Generated types (if available)
├── hooks/
│   └── useCMS.ts           // React hooks for all CMS operations
├── components/
│   └── cms/                // All CMS-related components
└── docs/
    └── SUPABASE_DATABASE_SCHEMA_GUIDE.md // This file
```

### Environment Variables
```bash
# Required for all database operations
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Optional for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Action Items for Site-Wide Implementation

### Immediate (High Priority)
1. **Audit all existing database queries** for column name mismatches
2. **Update all TypeScript interfaces** to match actual database schema
3. **Implement fallback data** for all CMS components
4. **Test all database queries** with debug scripts

### Short-term (Medium Priority)
1. **Standardize error handling** across all CMS components
2. **Create loading skeletons** for all data-dependent components
3. **Implement health monitoring** for database connections
4. **Add query performance monitoring**

### Long-term (Database Admin Required)
1. **Fix RLS policies** causing infinite recursion
2. **Optimize database indexes** for common queries
3. **Set up database migration system** for schema changes
4. **Implement automated schema validation**

## Prevention Checklist

Before implementing any new database feature:

- [ ] Verify table and column names with debug script
- [ ] Create TypeScript interfaces matching exact schema
- [ ] Implement error handling with fallback data
- [ ] Test queries with both admin and user permissions
- [ ] Add loading states to components
- [ ] Update this documentation if schema changes
- [ ] Run full site test to ensure no regressions

## Emergency Rollback Plan

If database errors occur site-wide:

1. **Immediate**: Enable fallback data for all affected components
2. **Short-term**: Revert to last known working query patterns
3. **Investigation**: Use debug scripts to identify schema changes
4. **Resolution**: Update code to match current database schema
5. **Testing**: Validate fixes across all affected pages

---

**Last Updated**: 2025-01-23  
**Next Review**: After any database schema changes