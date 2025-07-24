# Empathy Ledger CMS Testing Guide

## Quick Start Testing

### 1. Install Dependencies
```bash
# Make sure you have tsx installed for TypeScript execution
npm install
```

### 2. Run System Tests
```bash
# Test database connections and relationships
npm run test:connections

# Test CMS functionality
npm run test:cms

# Run both system tests
npm run test:system
```

### 3. Manual UI Testing
```bash
# Start the development server
npm run dev

# Navigate to test pages:
# - http://localhost:3005/admin/cms/storytellers
# - http://localhost:3005/case-studies/a-curious-tractor
# - http://localhost:3005/admin/cms
```

## Test Categories

### Database Connection Tests (`npm run test:connections`)

**What it tests:**
- Storyteller to stories relationships
- Media content associations
- Quote extraction and linking
- Theme connections
- Project associations
- Location data integrity
- Profile completeness

**Expected Output:**
```
🔍 Starting Storyteller Database Connection Tests...

[1/5] 👤 Testing: Sarah Mitchell
    ID: abc123-def456-ghi789
─────────────────────────────────────────────────────────────
  📚 Testing stories connection...
    ✅ 3 stories found
      - "My Healthcare Journey" (Published, public)
      - "Community Support Story" (Published, public)
      - "Education Access" (Draft, private)
  🖼️  Testing media connection...
    ✅ 2 media items found
      - "Profile Photo" image (45KB)
      - "Story Video" video (2048KB)
  💬 Testing quotes connection...
    ✅ 5 quotes found
      - "The healthcare system finally listened to our voices..."
      - "Education should be accessible to everyone, regardless..."
  🚀 Testing project connections...
    ✅ 2 projects connected
      - Healthcare Access Initiative, Community Education Project
  📍 Testing location data...
    ✅ Location: Melbourne, Victoria
      - Structured: Melbourne, Australia
  👤 Testing profile completeness...
    ✅ Profile 80% complete (4/5 fields)
  📊 Summary:
    Stories: 3, Media: 2, Quotes: 5
    Themes: 4, Projects: 2
─────────────────────────────────────────────────────────────
```

### CMS Functionality Tests (`npm run test:cms`)

**What it tests:**
- Supabase connection
- Data retrieval functions
- Search functionality
- Statistics calculation
- Data quality metrics
- Pagination
- Performance benchmarks

**Expected Output:**
```
🧪 Starting CMS Functionality Tests...

📋 Basic Functionality Tests:
✅ Supabase Connection: Database connection established successfully (156ms)
✅ Get Storytellers: Retrieved 10 storytellers successfully (234ms)
✅ Get Featured Storytellers: Retrieved 3 featured storytellers (187ms)
✅ Search Storytellers: Search completed, found 5 results for "community" (145ms)
✅ Get Storyteller Stats: Stats retrieved successfully (203ms)

🔍 Data Quality Tests:
✅ Data Quality Check: Data quality score: 75.2% (423ms)
✅ Pagination Test: Pagination working correctly (167ms)

🚀 Running Performance Tests...
✅ Large Query Performance: Excellent (789ms)
✅ Concurrent Queries: Excellent (1.2s)

📊 CMS FUNCTIONALITY TEST REPORT
============================================================
Overall Results:
✅ Passed: 9/9 (100.0%)
❌ Failed: 0/9 (0.0%)
⚠️  Warnings: 0/9 (0.0%)

🎯 System Status: 🟢 EXCELLENT - All tests passed!
```

## Manual Testing Checklist

### Admin Interface Testing

#### 1. CMS Dashboard (`/admin/cms`)
- [ ] Dashboard loads without errors
- [ ] Statistics cards display correct numbers
- [ ] All navigation links work
- [ ] Quick action cards link to correct pages
- [ ] Responsive design works on mobile

#### 2. Storyteller Management (`/admin/cms/storytellers`)
- [ ] Storyteller list loads
- [ ] Search functionality works
- [ ] Profile images display or show fallback initials
- [ ] Story counts are accurate
- [ ] Location information displays correctly
- [ ] Theme badges show relevant themes
- [ ] Action buttons (View Profile, View Stories, Edit) work

### Frontend Integration Testing

#### 3. Case Study Page (`/case-studies/a-curious-tractor`)
- [ ] Page loads without errors
- [ ] Real testimonials display instead of mock data
- [ ] Storyteller names and photos show correctly
- [ ] Quotes are relevant and properly formatted
- [ ] Location information is accurate
- [ ] No "Community Member" fallback names appear
- [ ] Images load with proper fallbacks

#### 4. Storyteller Components
- [ ] StorytellerProfile component renders correctly
- [ ] StorytellerGrid displays multiple storytellers
- [ ] StorytellerTestimonials loads real data
- [ ] Loading states display during data fetch
- [ ] Error states handle gracefully

## Performance Testing

### Database Query Performance
```bash
# Test large datasets
npm run test:cms

# Look for:
# - Query times under 500ms for normal operations
# - Large queries (100+ items) under 2 seconds
# - Concurrent operations under 3 seconds
```

### Frontend Performance
```bash
# Start development server
npm run dev

# Test pages:
# 1. Open browser dev tools
# 2. Navigate to Network tab
# 3. Load each page and check:
#    - Initial page load under 3 seconds
#    - API calls complete under 1 second
#    - Images load progressively
```

## Data Quality Validation

### Storyteller Data Completeness
The system checks for:
- [ ] **Profile Information**: Name, bio, image
- [ ] **Location Data**: Geographic information
- [ ] **Story Content**: Published stories with proper status
- [ ] **Media Assets**: Images, videos, audio files
- [ ] **Theme Classification**: Relevant topic tags
- [ ] **Project Associations**: Connected initiatives

### Data Integrity Checks
- [ ] **Foreign Key Relationships**: All references resolve correctly
- [ ] **Privacy Levels**: Respect storyteller consent settings
- [ ] **Cultural Protocols**: Sacred content properly protected
- [ ] **Attribution**: Proper credit for storytellers and content

## Scalability Testing

### Load Testing Scenarios

#### 1. High User Load
```bash
# Simulate multiple concurrent users
# Use browser dev tools or testing tools to:
# - Open 10+ tabs to storyteller pages
# - Refresh pages simultaneously
# - Check for:
#   - No database connection errors
#   - Consistent response times
#   - No memory leaks
```

#### 2. Large Dataset Queries
```bash
# Test with growing dataset
npm run test:connections

# Verify performance with:
# - 100+ storytellers
# - 1000+ stories
# - 10000+ media items
```

## Error Handling Testing

### Network Failures
- [ ] Test with offline network
- [ ] Test with slow connections
- [ ] Verify graceful degradation
- [ ] Check error message clarity

### Data Corruption
- [ ] Test with missing required fields
- [ ] Test with invalid data types
- [ ] Verify validation messages
- [ ] Check fallback behaviors

## Security and Privacy Testing

### PII Protection
- [ ] Email addresses don't appear in displays
- [ ] Phone numbers are sanitized
- [ ] Sensitive information is filtered
- [ ] Default to safe names when data is unsafe

### Cultural Protocol Compliance
- [ ] Sacred content requires proper permissions
- [ ] Community-specific sharing rules respected
- [ ] Elder review processes work
- [ ] Attribution requirements met

## Troubleshooting Common Issues

### "No storytellers found"
```bash
# Check database connection
npm run test:connections

# If database is empty, seed with test data:
npm run db:seed

# Or check your environment variables:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### "Connection errors"
```bash
# Verify Supabase configuration
# Check .env.local file has correct values
# Test direct database connection

# Run health check
npm run health:check
```

### "Tests failing"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npm run type-check

# Run individual test suites
npm run test:cms
npm run test:connections
```

## Success Criteria

### Minimum Viable System ✅
- [ ] Database connections work
- [ ] Basic CMS functions operate
- [ ] Frontend displays real data
- [ ] No critical errors in console

### Production Ready 🚀
- [ ] All automated tests pass
- [ ] Performance meets benchmarks (<2s page loads)
- [ ] Error handling works properly
- [ ] Security measures in place
- [ ] Data integrity maintained

### Scale Ready 📈
- [ ] Handles 1000+ storytellers
- [ ] Database queries optimized
- [ ] Caching strategies implemented
- [ ] Monitoring and alerting configured

## Reporting Issues

When you find issues, please document:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser and environment details**
5. **Console errors (if any)**
6. **Database query logs (if relevant)**

Example issue report:
```
Title: Storyteller search returns no results

Steps to reproduce:
1. Navigate to /admin/cms/storytellers
2. Enter "healthcare" in search box
3. Click Search button

Expected: Should show storytellers with healthcare themes
Actual: Shows "No storytellers found"
Environment: Chrome 120, macOS, localhost:3005
Console errors: None
Test output: npm run test:cms shows 5 results for "community" search
```

This comprehensive testing approach ensures your CMS system is robust, scalable, and ready for production use while maintaining data sovereignty and cultural sensitivity.