# Empathy Ledger CMS Testing Plan

## Overview
Comprehensive testing plan to validate the CMS system functionality, data connections, scalability, and user experience.

## Phase 1: Core Functionality Tests

### 1.1 Storyteller Data Management
**Test ID: ST-001**
```bash
# Test storyteller data fetching
npm run dev
# Navigate to: http://localhost:3005/admin/cms/storytellers
```

**Expected Results:**
- [ ] Storytellers load successfully
- [ ] Profile images display or show initials fallback
- [ ] Story counts are accurate
- [ ] Search functionality works
- [ ] Pagination works (if >50 storytellers)
- [ ] Loading states display properly
- [ ] Empty states handle gracefully

**Test ID: ST-002 - Individual Storyteller Pages**
```bash
# Test individual storyteller views
# Navigate to: http://localhost:3005/storytellers/[storyteller-id]
```

**Expected Results:**
- [ ] Storyteller profile loads completely
- [ ] All stories by storyteller display
- [ ] Media content shows properly
- [ ] Privacy levels are respected
- [ ] Cultural protocols are enforced

### 1.2 Story Collection and Display
**Test ID: SR-001**
```bash
# Test story submission
# Navigate to: http://localhost:3005/submit
```

**Expected Results:**
- [ ] Form submits successfully
- [ ] Story links to correct storyteller
- [ ] Privacy settings are applied
- [ ] Cultural protocol checks work
- [ ] Media uploads function

**Test ID: SR-002 - Story Display**
```bash
# Test story display across site
# Navigate to various pages with story content
```

**Expected Results:**
- [ ] Stories display with correct formatting
- [ ] Storyteller attribution is accurate
- [ ] Privacy levels filter correctly
- [ ] Themes and tags display properly

### 1.3 CMS Admin Interface
**Test ID: CMS-001**
```bash
# Test CMS dashboard
# Navigate to: http://localhost:3005/admin/cms
```

**Expected Results:**
- [ ] Dashboard loads with correct stats
- [ ] All navigation links work
- [ ] Quick actions are functional
- [ ] Recent pages display correctly

**Test ID: CMS-002 - Page Management**
```bash
# Test page creation and editing
# Navigate to: http://localhost:3005/admin/cms/pages
```

**Expected Results:**
- [ ] Pages list loads correctly
- [ ] Create new page works
- [ ] Page editing functions properly
- [ ] Content blocks can be added/removed
- [ ] Publishing workflow works

## Phase 2: Database Connection Testing

### 2.1 Storyteller Relationship Validation

**Test Script: Check Storyteller Connections**
Create this file: `/scripts/test-storyteller-connections.ts`

```typescript
import { createClient } from '../src/lib/supabase-client';

async function testStorytellerConnections() {
  const supabase = await createClient();
  
  console.log('🔍 Testing storyteller database connections...\n');
  
  // Get first 5 storytellers for testing
  const { data: storytellers, error } = await supabase
    .from('users')
    .select('id, full_name, preferred_name')
    .eq('role', 'storyteller')
    .limit(5);
    
  if (error) {
    console.error('❌ Error fetching storytellers:', error);
    return;
  }
  
  if (!storytellers || storytellers.length === 0) {
    console.log('⚠️ No storytellers found in database');
    return;
  }
  
  console.log(`✅ Found ${storytellers.length} storytellers to test\n`);
  
  for (const storyteller of storytellers) {
    console.log(`\n📖 Testing connections for: ${storyteller.preferred_name || storyteller.full_name} (ID: ${storyteller.id})`);
    console.log('─'.repeat(80));
    
    // Test 1: Stories connection
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, status, privacy_level, created_at')
      .eq('storyteller_id', storyteller.id);
      
    if (storiesError) {
      console.log('❌ Stories query error:', storiesError.message);
    } else {
      console.log(`📚 Stories: ${stories?.length || 0} found`);
      stories?.forEach(story => {
        console.log(`  - "${story.title}" (${story.status}, ${story.privacy_level})`);
      });
    }
    
    // Test 2: Media content connection
    const { data: media, error: mediaError } = await supabase
      .from('media_content')
      .select('id, title, type, media_url')
      .eq('storyteller_id', storyteller.id);
      
    if (mediaError) {
      console.log('❌ Media query error:', mediaError.message);
    } else {
      console.log(`🖼️ Media: ${media?.length || 0} found`);
      media?.forEach(item => {
        console.log(`  - "${item.title}" (${item.type})`);
      });
    }
    
    // Test 3: Quotes connection (via stories)
    const { data: quotes, error: quotesError } = await supabase
      .from('story_quotes')
      .select(`
        id, quote_text, themes,
        stories!inner(storyteller_id)
      `)
      .eq('stories.storyteller_id', storyteller.id);
      
    if (quotesError) {
      console.log('❌ Quotes query error:', quotesError.message);
    } else {
      console.log(`💬 Quotes: ${quotes?.length || 0} found`);
      quotes?.forEach(quote => {
        console.log(`  - "${quote.quote_text.substring(0, 50)}..."`);
      });
    }
    
    // Test 4: Themes connection
    const { data: themes, error: themesError } = await supabase
      .from('story_themes')
      .select(`
        theme, relevance_score,
        stories!inner(storyteller_id)
      `)
      .eq('stories.storyteller_id', storyteller.id);
      
    if (themesError) {
      console.log('❌ Themes query error:', themesError.message);
    } else {
      const uniqueThemes = [...new Set(themes?.map(t => t.theme) || [])];
      console.log(`🏷️ Themes: ${uniqueThemes.length} unique themes`);
      console.log(`  - ${uniqueThemes.join(', ')}`);
    }
    
    // Test 5: Project connections
    const { data: projectLinks, error: projectError } = await supabase
      .from('story_project_links')
      .select(`
        relevance_score,
        projects!inner(name),
        stories!inner(storyteller_id)
      `)
      .eq('stories.storyteller_id', storyteller.id);
      
    if (projectError) {
      console.log('❌ Projects query error:', projectError.message);
    } else {
      const uniqueProjects = [...new Set(projectLinks?.map(p => (p as any).projects?.name) || [])];
      console.log(`🚀 Projects: ${uniqueProjects.length} connected`);
      console.log(`  - ${uniqueProjects.join(', ')}`);
    }
    
    // Test 6: Location connection
    const { data: userDetail, error: locationError } = await supabase
      .from('users')
      .select(`
        location,
        primary_location_id,
        locations(name, country)
      `)
      .eq('id', storyteller.id)
      .single();
      
    if (locationError) {
      console.log('❌ Location query error:', locationError.message);
    } else {
      console.log(`📍 Location: ${userDetail?.location || 'Not specified'}`);
      if (userDetail?.locations) {
        console.log(`  - Structured: ${(userDetail.locations as any)?.name}, ${(userDetail.locations as any)?.country}`);
      }
    }
    
    console.log('─'.repeat(80));
  }
  
  console.log('\n✅ Connection testing complete!');
}

// Run the test
testStorytellerConnections().catch(console.error);
```

**Test ID: DB-001 - Run Connection Test**
```bash
# Create and run the connection test
npx tsx scripts/test-storyteller-connections.ts
```

**Expected Results:**
- [ ] All storytellers load successfully
- [ ] Stories are properly linked to storytellers
- [ ] Media content shows correct associations
- [ ] Quotes are connected through stories
- [ ] Themes are properly extracted and linked
- [ ] Project connections are established
- [ ] Location data is accessible

### 2.2 Data Integrity Tests

**Test ID: DI-001 - Cross-Reference Validation**
```typescript
// Add to test script: Validate data consistency
async function validateDataIntegrity() {
  // Check for orphaned records
  // Verify foreign key relationships
  // Validate required fields
  // Check for data corruption
}
```

## Phase 3: Frontend Integration Tests

### 3.1 Component Rendering Tests
**Test ID: FR-001**
```bash
# Test component rendering
npm run test -- --testPathPattern=components
```

**Expected Results:**
- [ ] StorytellerProfile renders correctly
- [ ] StorytellerGrid displays multiple storytellers
- [ ] StorytellerTestimonials loads real data
- [ ] Loading states display properly
- [ ] Error states handle gracefully

### 3.2 Page Integration Tests
**Test ID: FR-002 - Case Study Integration**
```bash
# Navigate to: http://localhost:3005/case-studies/a-curious-tractor
```

**Expected Results:**
- [ ] Real testimonials load instead of mock data
- [ ] Storyteller profiles display correctly
- [ ] Images load with proper fallbacks
- [ ] Page performance is acceptable (<3s load)

**Test ID: FR-003 - Admin Interface**
```bash
# Navigate to: http://localhost:3005/admin/cms/storytellers
```

**Expected Results:**
- [ ] Storyteller list loads completely
- [ ] Search functionality works
- [ ] Individual storyteller actions work
- [ ] Statistics are calculated correctly

## Phase 4: Performance and Scalability Tests

### 4.1 Load Testing
**Test ID: PERF-001**
```bash
# Install testing tools
npm install --save-dev @playwright/test autocannon

# Create load test script
npx playwright test --headed
```

**Test Scenarios:**
- [ ] 100 concurrent users browsing storytellers
- [ ] 50 concurrent story submissions
- [ ] Large dataset queries (1000+ storytellers)
- [ ] Image loading performance
- [ ] Database query optimization

### 4.2 Database Performance Tests
**Test ID: PERF-002**
```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE role = 'storyteller';
EXPLAIN ANALYZE SELECT * FROM stories WHERE storyteller_id = 'specific-id';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename IN ('users', 'stories', 'media_content');
```

**Expected Results:**
- [ ] Queries execute in <100ms
- [ ] Proper indexes are in place
- [ ] No full table scans on large tables
- [ ] Connection pooling works effectively

## Phase 5: User Experience Tests

### 5.1 Accessibility Tests
**Test ID: UX-001**
```bash
# Install accessibility testing
npm install --save-dev @axe-core/playwright

# Run accessibility tests
npm run test:a11y
```

**Expected Results:**
- [ ] All components pass WCAG 2.1 AA standards
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets requirements

### 5.2 Mobile Responsiveness
**Test ID: UX-002**
```bash
# Test on different screen sizes
# Use browser dev tools or physical devices
```

**Expected Results:**
- [ ] Mobile layout works correctly
- [ ] Touch interactions are responsive
- [ ] Images scale appropriately
- [ ] Navigation is accessible on mobile

## Phase 6: Security and Privacy Tests

### 6.1 Data Privacy Tests
**Test ID: SEC-001**
```bash
# Test privacy controls
# Verify PII sanitization
# Check access controls
```

**Expected Results:**
- [ ] PII is properly sanitized in displays
- [ ] Privacy levels are enforced
- [ ] Unauthorized access is blocked
- [ ] Cultural protocols are respected

### 6.2 Cultural Protocol Tests
**Test ID: SEC-002**
```bash
# Test cultural sensitivity features
# Verify elder review processes
# Check consent mechanisms
```

**Expected Results:**
- [ ] Sacred content requires proper permissions
- [ ] Community protocols are enforced
- [ ] Consent settings are respected
- [ ] Attribution requirements are met

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Database is seeded with test data
- [ ] Environment variables are configured
- [ ] Test accounts are created
- [ ] Backup of production data (if testing on prod)

### During Testing
- [ ] Document all issues found
- [ ] Record performance metrics
- [ ] Take screenshots of UI issues
- [ ] Log database query performance

### Post-Testing
- [ ] Compile test results report
- [ ] Prioritize issues by severity
- [ ] Create GitHub issues for bugs
- [ ] Update documentation based on findings

## Automated Testing Setup

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:all
      - name: Run database tests
        run: npx tsx scripts/test-storyteller-connections.ts
```

## Success Criteria

### Minimum Viable Product (MVP)
- [ ] All core functionality tests pass
- [ ] Database connections work correctly
- [ ] Frontend renders without errors
- [ ] Basic performance benchmarks met
- [ ] Security requirements satisfied

### Production Ready
- [ ] All automated tests pass
- [ ] Performance meets scalability requirements
- [ ] Accessibility standards compliance
- [ ] Cultural protocol enforcement working
- [ ] Documentation is complete

### Scale Ready
- [ ] System handles 10,000+ storytellers
- [ ] Response times under 2 seconds
- [ ] Database can handle 1M+ stories
- [ ] CDN optimization implemented
- [ ] Monitoring and alerting configured

This comprehensive testing plan ensures the CMS system is robust, scalable, and ready for production use while maintaining the highest standards for data sovereignty and cultural sensitivity.