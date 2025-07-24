# Database Error Monitoring & Response Rules

## Current Error Status Summary

Based on browser console logs from the A Curious Tractor case study page:

### ✅ RESOLVED ERRORS
- **400 Errors (Quotes Table)**: Fixed by updating `quote` → `quote_text`
- **Column Name Mismatches**: All interfaces and queries updated

### ❌ ONGOING ERRORS  
- **500 Errors (Users Table)**: RLS policy infinite recursion - requires database admin
- **404 Errors (Images)**: Profile image URLs returning 404 - need image validation

## Error Monitoring Rules

### Rule 1: Immediate Fallback Activation
**When**: Any 500 error from database queries  
**Action**: Automatically use fallback data, never show broken UI  
**Evidence**: Storyteller cards should display fallback community members

### Rule 2: Column Name Validation
**When**: Any 400 error mentioning column names  
**Action**: Check database schema immediately, update all references  
**Prevention**: Always verify schema before deploying query changes

### Rule 3: Image URL Validation
**When**: 404 errors on profile images  
**Action**: Use placeholder images, validate URLs before storage  
**Implementation**: Default to Unsplash placeholder if profile_image_url fails

### Rule 4: RLS Policy Detection
**When**: 500 errors with authentication/policy messages  
**Action**: Document for database admin, implement service role bypass for critical queries  
**Note**: This is a database infrastructure issue, not application code

## Browser Console Error Patterns

### Pattern 1: Successful Initialization
```
cms-core.ts:38 ✅ Supabase CMS client initialized
```
**Status**: ✅ Working correctly

### Pattern 2: Storyteller Query Failure (RLS Infinite Recursion)
```
tednluwflfhxyucgwigh.supabase.co/rest/v1/users?select=...&role=eq.storyteller Failed to load resource: 500
❌ Error fetching storytellers: infinite recursion detected in policy for relation "users"
```
**Status**: ❌ **CONFIRMED DATABASE ISSUE** - RLS policy has infinite recursion, requires database admin to fix
**Expected Behavior**: Fallback data should display instead of broken UI

### Pattern 3: Image Loading Failure
```
image:1 Failed to load resource: the server responded with a status of 404 (Not Found)
```
**Status**: ❌ Need image URL validation and fallback images

## Site-Wide Implementation Rules

### For ALL Database Queries:
1. **Always implement try/catch with fallback data**
2. **Log errors for monitoring but never break UI**  
3. **Use loading states while fetching**
4. **Provide meaningful error messages to users**

### For ALL Image Loading:
1. **Validate URLs before displaying**
2. **Use placeholder images for 404s**
3. **Implement lazy loading with error handling**

### For ALL Components:
1. **Test with network disabled (fallback mode)**
2. **Test with invalid data (error handling)**
3. **Ensure graceful degradation in all scenarios**

## Error Response Protocol

### Immediate Response (< 1 minute)
1. Check if fallback data is displaying correctly
2. Verify user experience isn't broken
3. Log error details for investigation

### Short-term Response (< 1 hour)  
1. Investigate root cause (database vs. code)
2. Implement temporary workaround if needed
3. Update monitoring if new error pattern

### Long-term Response (< 1 day)
1. Fix root cause if possible at application level
2. Document for database admin if infrastructure issue
3. Update prevention rules to avoid recurrence

## Success Criteria

### The application is working correctly when:
- ✅ Storyteller cards display (either real data or fallback)
- ✅ No broken UI elements from failed queries  
- ✅ Loading states show during data fetching
- ✅ Error messages are user-friendly, not raw error objects
- ✅ Images display (either real photos or placeholders)

### Current Status: PARTIALLY WORKING
- ✅ CMS system properly initialized
- ✅ Fallback data prevents broken UI
- ❌ Real storyteller data blocked by RLS policy (database admin needed)
- ❌ Some profile images showing 404 (need image validation)

## Monitoring Commands

### Check Current Error Status:
```bash
# In browser console, look for these patterns:
✅ "Supabase CMS client initialized" - System working
❌ "Failed to load resource: 500" - Database policy issue  
❌ "Failed to load resource: 404" - Image URL invalid
```

### Debug Individual Queries:
```javascript
// In browser console:
// Test CMS connection
console.log(await window.__cms_debug?.testConnection?.());

// Test specific query
console.log(await window.__cms_debug?.testQuery?.('users'));
```

---

**Key Insight**: The current 500 errors are expected due to database RLS policy issues. The fallback system is working correctly to prevent broken UI. This is a database infrastructure issue, not an application bug.