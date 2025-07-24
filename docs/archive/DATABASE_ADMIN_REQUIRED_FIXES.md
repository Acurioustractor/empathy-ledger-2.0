# Database Admin Required Fixes

## Critical Issue: RLS Policy Infinite Recursion

### Error Message
```
❌ Error fetching storytellers: infinite recursion detected in policy for relation "users"
HTTP Status: 500 Internal Server Error
```

### Affected Query
```sql
SELECT id, full_name, profile_image_url, bio, community_affiliation, 
       primary_location_id, project_id, 
       locations!primary_location_id(id, name, state, country)
FROM users 
WHERE role = 'storyteller' 
AND profile_image_url IS NOT NULL 
LIMIT 3;
```

### Root Cause
The Row Level Security (RLS) policy on the `users` table contains a recursive reference that causes infinite recursion when querying user data.

### Impact
- **User Experience**: ✅ **NOT BROKEN** - Fallback data displays correctly
- **Functionality**: ✅ **WORKING** - Storyteller cards show community members
- **Performance**: ❌ **DEGRADED** - Unnecessary failed requests to database

### Database Admin Action Required

**Priority**: Medium (functionality not broken, but needs fixing)

**Required Fix**: Review and update the RLS policy on the `users` table to remove recursive references.

**Typical Fix Pattern**:
```sql
-- Current problematic policy (example):
CREATE POLICY "users_select_policy" ON users
  FOR SELECT TO anon
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() -- ❌ This causes recursion
  ));

-- Fixed policy (example):
CREATE POLICY "users_select_policy" ON users
  FOR SELECT TO anon
  USING (auth.uid() = id OR role = 'storyteller'); -- ✅ No recursion
```

### Verification Steps
1. Fix the RLS policy
2. Test the query: `SELECT * FROM users WHERE role = 'storyteller' LIMIT 1;`
3. Verify no 500 errors in application logs
4. Confirm storyteller cards load real data instead of fallback

### Temporary Workaround
The application currently handles this gracefully with fallback data, so this is not a blocking issue for users.

---

## Additional Cleanup Items

### Image URL Validation
**Issue**: Some profile_image_url entries return 404 errors
**Priority**: Low
**Fix**: Validate image URLs before storing, or implement automatic fallback

### Performance Optimization
**Issue**: Multiple failed 500 requests on each page load
**Priority**: Low  
**Fix**: Once RLS policy is fixed, consider adding query caching

---

**Created**: 2025-01-23  
**Status**: Reported to Database Admin  
**Application Impact**: Minimal (fallback system working correctly)