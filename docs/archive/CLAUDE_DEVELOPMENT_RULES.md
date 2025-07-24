# Claude Development Rules for Empathy Ledger

## Database Schema Verification Rules

### Rule 1: Never Assume Column Names
**ALWAYS** verify actual database schema before writing any query code.

```typescript
// ❌ WRONG - assuming column names
const query = `SELECT quote FROM quotes`; 

// ✅ CORRECT - verify first, then code
// Step 1: Run schema check
// Step 2: Confirm actual column is 'quote_text'  
const query = `SELECT quote_text FROM quotes`;
```

### Rule 2: Create Debug Scripts First
Before implementing any database feature, create a debug script to test the actual schema:

```typescript
// ALWAYS create this type of script first:
export async function debugTableSchema(tableName: string) {
  const { data, error } = await client.from(tableName).select('*').limit(1);
  if (data?.[0]) {
    console.log(`${tableName} columns:`, Object.keys(data[0]));
  }
  return { data, error };
}
```

### Rule 3: TypeScript Interfaces Must Match Database
**Never** create TypeScript interfaces based on assumptions. Always match the actual database:

```typescript
// ❌ WRONG - assumed interface
interface Quote {
  quote: string; // This column doesn't exist!
}

// ✅ CORRECT - verified interface  
interface Quote {
  quote_text: string; // Confirmed this exists in database
}
```

## Error Handling Standards

### Rule 4: Always Implement Fallback Data
Every database query must have fallback data for when queries fail:

```typescript
// ✅ REQUIRED pattern for all database functions
export async function getData() {
  try {
    const { data, error } = await query;
    if (error) return FALLBACK_DATA;
    return data?.length > 0 ? data : FALLBACK_DATA;
  } catch (error) {
    return FALLBACK_DATA;
  }
}
```

### Rule 5: Graceful Degradation in UI
Components must work even when database is completely unavailable:

```typescript
// ✅ REQUIRED pattern for all CMS components
function Component() {
  const { data, loading, error } = useCMSHook();
  
  if (loading) return <Skeleton />;
  if (error && !data) return <ErrorFallback />;
  
  // Always provide fallback display data
  const displayData = data?.length > 0 ? data : FALLBACK_DATA;
  
  return <UI data={displayData} />;
}
```

## Database Query Standards

### Rule 6: Use Centralized CMS System
**Never** create individual Supabase clients. Always use the centralized system:

```typescript
// ❌ WRONG - individual client
const supabase = createClient(url, key);

// ✅ CORRECT - centralized system
import { getSupabaseClient } from '@/lib/cms-core';
const client = getSupabaseClient();
```

### Rule 7: Test Queries in Multiple Environments
Every query must be tested with:
1. **Admin permissions** (service role)
2. **User permissions** (anon key) 
3. **No permissions** (simulate RLS failures)
4. **Empty database** (test fallbacks)

### Rule 8: Handle RLS Policy Failures
Row Level Security policies can cause 500 errors. Always plan for this:

```typescript
// ✅ REQUIRED pattern for RLS-protected tables
async function getUsers() {
  try {
    const { data, error } = await client.from('users').select('*');
    
    // RLS policy failures often return 500 errors
    if (error?.message?.includes('policy') || error?.code === '500') {
      console.warn('RLS policy blocking query, using fallback');
      return FALLBACK_USERS;
    }
    
    return data || FALLBACK_USERS;
  } catch (error) {
    return FALLBACK_USERS;
  }
}
```

## Implementation Process Rules

### Rule 9: Schema-First Development
1. **First**: Run debug script to understand actual database structure
2. **Second**: Create/update TypeScript interfaces to match reality  
3. **Third**: Write queries using verified column names
4. **Fourth**: Implement UI with fallback data
5. **Last**: Test in browser and verify no console errors

### Rule 10: Component Error States
Every CMS component must handle these 4 states:
1. **Loading**: Show skeleton/spinner
2. **Success**: Display real data
3. **Error with fallback**: Display fallback data  
4. **Complete failure**: Show error message

```typescript
// ✅ REQUIRED component pattern
function CMSComponent() {
  const { data, loading, error } = useCMSData();
  
  // State 1: Loading
  if (loading) return <LoadingSkeleton />;
  
  // State 2: Success
  if (data && data.length > 0) {
    return <SuccessUI data={data} />;
  }
  
  // State 3: Error with fallback
  if (error && FALLBACK_DATA) {
    return <SuccessUI data={FALLBACK_DATA} />;
  }
  
  // State 4: Complete failure
  return <ErrorMessage message="Unable to load content" />;
}
```

## Testing Requirements

### Rule 11: Browser Console Monitoring
After implementing any database feature:
1. Check browser console for any red errors
2. Verify no 400/500 HTTP errors in Network tab
3. Confirm fallback data displays when database unavailable
4. Test with slow network to verify loading states

### Rule 12: Cross-Page Testing  
Database changes affect multiple pages. Always test:
1. The specific page you're working on
2. Other pages using the same database tables
3. Admin pages that might use different permissions
4. Public pages that rely on the same data

## Prevention Checklist

Before committing any database-related code:

- [ ] Verified actual database schema with debug script
- [ ] Updated TypeScript interfaces to match reality
- [ ] Tested queries with user-level permissions  
- [ ] Implemented fallback data for query failures
- [ ] Added loading states to UI components
- [ ] Tested in browser with network throttling
- [ ] Checked console for any database errors
- [ ] Verified other pages still work correctly

## Error Pattern Recognition

### 400 Errors = Column Name Issues
```
❌ column "quote" does not exist
✅ Fix: Use correct column name "quote_text"
```

### 500 Errors = RLS Policy Issues  
```
❌ Failed to load resource: 500 (Internal Server Error)
✅ Fix: Implement fallback data, document for database admin
```

### 404 Errors = Missing Resources
```  
❌ image:1 Failed to load resource: 404 (Not Found)
✅ Fix: Validate URLs, use placeholder images
```

## Documentation Standards

### Rule 13: Update Documentation
When encountering any database issue:
1. Document the specific error in this file
2. Document the solution that worked
3. Update schema reference with correct column names
4. Add prevention rules to avoid recurrence

### Rule 14: Learning Integration
Each database error should result in:
1. Immediate fix for the specific issue
2. Pattern recognition for similar issues
3. Prevention rule to avoid in future
4. Documentation update for team knowledge

---

**Key Principle**: The database should never break the user interface. Always implement graceful degradation with fallback data, proper loading states, and meaningful error handling.

**Last Updated**: 2025-01-23 after resolving quote_text column name issues and RLS policy problems.