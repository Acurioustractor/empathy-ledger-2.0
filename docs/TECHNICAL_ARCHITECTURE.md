# Technical Architecture Guide

**Comprehensive system design for Empathy Ledger CMS**

## 🏗️ System Overview

Empathy Ledger is built as a modern, scalable web application with data sovereignty and cultural sensitivity at its core. The architecture supports community storytelling while respecting Indigenous protocols and ensuring storytellers maintain control over their narratives.

### Technology Stack

```
Frontend Layer:     Next.js 15.4.1 + TypeScript + Tailwind CSS
API Layer:          Next.js API Routes + Supabase Client
Database:           Supabase (PostgreSQL with Row Level Security)
Authentication:     Supabase Auth
File Storage:       Supabase Storage
Real-time:          Supabase Realtime subscriptions
Deployment:         Vercel (recommended)
```

## 📊 Database Architecture

### Core Tables and Relationships

```sql
-- Storytellers (users table)
users (storytellers)
├── stories (storyteller_id → users.id)
├── media_content (storyteller_id → users.id)  
├── story_quotes (via stories)
├── locations (primary_location_id → locations.id)
└── projects (project → projects.id)

-- Stories and content
stories
├── storyteller (storyteller_id → users.id)
├── story_media (story_id → stories.id)
├── story_quotes (story_id → stories.id)
├── story_themes (story_id → stories.id)
├── story_analysis (story_id → stories.id)
└── story_project_links (story_id → stories.id)

-- CMS and content management
cms_pages
├── cms_content_blocks (page_id → cms_pages.id)
├── cms_media_library (used in content blocks)
└── cms_navigation_menus (site navigation)
```

### Key Data Relationships

1. **Storytellers to Stories**: One-to-many via `storyteller_id`
2. **Stories to Media**: One-to-many via `story_id`
3. **Stories to Quotes**: One-to-many via `story_id`
4. **Stories to Themes**: Many-to-many via `story_themes` table
5. **Stories to Projects**: Many-to-many via `story_project_links`
6. **Users to Locations**: Many-to-one via `primary_location_id`

### Privacy and Security Schema

```sql
-- Every story has privacy controls
stories: {
  privacy_level: 'public' | 'community' | 'organization' | 'private'
  cultural_protocols: jsonb -- Indigenous-specific restrictions
  consent_settings: jsonb   -- Granular sharing permissions
  requires_elder_review: boolean
}

-- User data sovereignty
users: {
  sharing_boundaries: jsonb
  cultural_background: text[]
  consent_settings: jsonb
  verification_status: text
}
```

## 🔧 Application Structure

### Frontend Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── admin/cms/         # CMS admin interface
│   ├── case-studies/     # Public case study pages
│   ├── api/              # API routes
│   └── ...               # Other public pages
├── components/
│   ├── storytellers/     # Storyteller display components
│   ├── cms/              # CMS-specific components
│   ├── story/           # Story submission and display
│   └── ui/              # Reusable UI components
├── lib/
│   ├── supabase-storytellers.ts  # Storyteller data functions
│   ├── supabase-stories.ts       # Story management
│   ├── supabase-cms.ts           # Legacy CMS functions
│   ├── cms/                      # Modern CMS service
│   └── ...                       # Other utilities
└── docs/                  # Documentation
```

### Key Libraries and Functions

#### Storyteller Management (`/src/lib/supabase-storytellers.ts`)
```typescript
// Core functions for storyteller data
getStorytellers(options?)          // List storytellers with pagination
getStorytellerById(id)            // Get individual storyteller with stories
getFeaturedStorytellers(limit)    // Get featured storytellers
searchStorytellers(term, options) // Search by name/location/expertise
getStorytellerStats(projectId?)   // Analytics and engagement metrics
```

#### CMS Service (`/src/lib/cms/cms-service.ts`)
```typescript
// Page and content management
createPage(pageData)              // Create new CMS page
updatePage(pageId, updates)       // Update existing page
getPage(pageId, options)          // Retrieve page with content blocks
getPages(query)                   // List pages with filtering

// Content blocks
addContentBlock(pageId, blockData)    // Add content block to page
updateContentBlock(blockId, updates) // Update content block
deleteContentBlock(blockId)          // Remove content block

// Media management
uploadMedia(upload)               // Upload and process media files
getMediaLibrary(query)           // Browse media library
```

## 🔐 Security and Privacy Implementation

### Row Level Security (RLS)

Supabase RLS policies enforce privacy at the database level:

```sql
-- Stories privacy policy
CREATE POLICY "Users can read public stories" 
ON stories FOR SELECT 
USING (privacy_level = 'public');

CREATE POLICY "Users can read own stories"
ON stories FOR SELECT
USING (auth.uid() = storyteller_id);

-- Cultural protocol enforcement
CREATE POLICY "Sacred content requires elder review"
ON stories FOR SELECT
USING (
  cultural_sensitivity != 'sacred' OR 
  EXISTS (
    SELECT 1 FROM elder_approvals 
    WHERE story_id = stories.id 
    AND approved = true
  )
);
```

### PII Protection

Automatic sanitization of personally identifiable information:

```typescript
// Privacy-safe name display
function sanitizeDisplayName(name: string): string {
  // Remove email patterns, phone numbers, etc.
  let safeName = name.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[Contact Removed]');
  safeName = safeName.replace(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[Phone Removed]');
  
  // Default to safe fallback if PII detected
  if (safeName.includes('[Contact Removed]') || safeName.includes('[Phone Removed]')) {
    return 'Community Member';
  }
  
  return safeName.trim() || 'Community Member';
}
```

### Cultural Protocol Enforcement

```typescript
// Cultural sensitivity checks
async function validateCulturalProtocols(pageData: Partial<CMSPageInsert>) {
  if (pageData.cultural_sensitivity === 'sacred' || pageData.cultural_sensitivity === 'ceremonial') {
    if (!pageData.requires_elder_review) {
      throw new Error('Sacred or ceremonial content requires elder review');
    }
  }
}
```

## ⚡ Performance and Scalability

### Database Optimization

1. **Proper Indexing**: All foreign keys and frequently queried fields are indexed
2. **Query Optimization**: Selective field loading and efficient joins
3. **Pagination**: All list functions support limit/offset parameters
4. **Connection Pooling**: Supabase handles connection management automatically

### Frontend Performance

1. **Server-Side Rendering**: Critical content rendered on server
2. **Client-Side Caching**: React Query for intelligent data caching
3. **Code Splitting**: Dynamic imports for large components
4. **Image Optimization**: Next.js Image component with lazy loading

### Scaling Strategies

```typescript
// Efficient data loading with pagination
const { storytellers, total } = await getStorytellers({
  limit: 20,
  offset: page * 20,
  includeStories: false // Only load when needed
});

// Concurrent data fetching
const [storytellers, stats, featured] = await Promise.all([
  getStorytellers({ limit: 10 }),
  getStorytellerStats(),
  getFeaturedStorytellers(3)
]);
```

## 🔄 Real-time Features

### Live Updates

Supabase Realtime subscriptions for collaborative features:

```typescript
// Subscribe to story updates
const subscription = supabase
  .channel('stories')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'stories'
  }, (payload) => {
    // Update UI with new story data
    handleStoryUpdate(payload);
  })
  .subscribe();
```

### Community Collaboration

- **Story Co-creation**: Multiple storytellers can contribute to shared narratives
- **Community Feedback**: Real-time comments and suggestions
- **Elder Review Process**: Live workflow for cultural protocol validation
- **Admin Notifications**: Instant alerts for content requiring attention

## 🌐 API Architecture

### RESTful Endpoints

```typescript
// Storyteller API
GET    /api/storytellers           // List storytellers
GET    /api/storytellers/[id]      // Get storyteller details
POST   /api/storytellers           // Create storyteller (admin)
PUT    /api/storytellers/[id]      // Update storyteller
DELETE /api/storytellers/[id]      // Archive storyteller

// Stories API
GET    /api/stories                // List stories (filtered by privacy)
POST   /api/stories                // Submit new story
PUT    /api/stories/[id]           // Update story (author only)
DELETE /api/stories/[id]           // Delete story (author/admin)

// Analytics API
GET    /api/analytics/storytellers // Storyteller engagement metrics
GET    /api/analytics/stories      // Story performance data
GET    /api/analytics/community    // Community insights
```

### GraphQL-style Queries

Using Supabase's query builder for flexible data retrieval:

```typescript
// Complex storyteller query with relationships
const { data } = await supabase
  .from('users')
  .select(`
    *,
    stories:stories!storyteller_id(
      id, title, status, privacy_level, created_at
    ),
    media:media_content!storyteller_id(
      id, title, type, media_url
    ),
    location:locations!primary_location_id(
      name, country
    )
  `)
  .eq('role', 'storyteller')
  .limit(20);
```

## 🧪 Testing Architecture

### Automated Testing Framework

```typescript
// Database connection testing
npm run test:connections  // Test all table relationships

// CMS functionality testing  
npm run test:cms         // Test data functions and performance

// Full system testing
npm run test:system      // Run both connection and CMS tests
```

### Test Categories

1. **Unit Tests**: Individual function testing
2. **Integration Tests**: Database relationship validation
3. **Performance Tests**: Query speed and scalability
4. **Security Tests**: Privacy and access control validation
5. **Cultural Safety Tests**: Protocol enforcement verification

## 📱 Multi-tenant Architecture

### Organization and Project Support

```typescript
// Filter data by organization
const orgStorytellers = await getStorytellers({ 
  organizationId: "org-123" 
});

// Project-specific storytellers
const projectStorytellers = await getStorytellers({ 
  projectId: "project-456" 
});

// Cross-project analytics
const crossProjectStats = await getStorytellerStats(); // All projects
const projectStats = await getStorytellerStats("project-456"); // Specific project
```

### Data Isolation

- **Row Level Security**: Ensures data isolation at database level
- **API Filtering**: All queries respect organization/project boundaries
- **UI Context**: Admin interfaces show only relevant data
- **Privacy Inheritance**: Project privacy settings cascade to stories

## 🔧 Development Patterns

### Component Architecture

```typescript
// Reusable storyteller display
<StorytellerProfile 
  storyteller={storyteller}
  size="medium"
  showBio={true}
  showStoryCount={true}
/>

// Grid display with real data
<StorytellerGrid 
  limit={12}
  projectId={projectId}
  includeStories={false}
/>

// Dynamic testimonials
<StorytellerTestimonials 
  projectId="a-curious-tractor"
  limit={3}
  theme="innovation"
/>
```

### Error Handling

```typescript
// Graceful error handling with fallbacks
try {
  const storytellers = await getStorytellers();
  return storytellers;
} catch (error) {
  console.error('Failed to load storytellers:', error);
  // Return empty state with error message
  return { storytellers: [], error: error.message };
}
```

### Loading States

```typescript
// Progressive loading with skeletons
if (loading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
      ))}
    </div>
  );
}
```

## 🚀 Deployment Architecture

### Production Environment

```bash
# Environment variables
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Build and deploy
npm run build
npm run start
```

### Monitoring and Observability

- **Error Tracking**: Console logging with structured error reporting
- **Performance Monitoring**: Query timing and response metrics
- **Usage Analytics**: Community engagement without privacy invasion
- **Security Auditing**: Access logs and permission changes

This technical architecture provides a solid foundation for building the entire Empathy Ledger website while maintaining the highest standards for data sovereignty, cultural sensitivity, and system performance.