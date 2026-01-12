# Empathy Ledger CMS System - Complete Guide

## Overview
The Empathy Ledger CMS system is built on Supabase and provides a comprehensive platform for managing storytellers, stories, and content with full data sovereignty and cultural protocol support.

## System Architecture

### Core Components

#### 1. Data Layer (`/src/lib/`)
- **`supabase-storytellers.ts`** - Storyteller management functions
- **`supabase-stories.ts`** - Story management and submission
- **`supabase-cms.ts`** - Legacy CMS integration
- **`cms/`** - Modern CMS service with types

#### 2. Components (`/src/components/`)
- **`storytellers/`** - Storyteller display components
- **`cms/`** - CMS-specific components
- **`story/`** - Story submission and display

#### 3. Admin Interface (`/src/app/admin/cms/`)
- **Dashboard** - Main CMS overview
- **Pages** - Content page management
- **Storytellers** - Storyteller management
- **Media** - File and image management

#### 4. Public Pages
- **Case Studies** - Showcase real storyteller data
- **Storyteller Profiles** - Individual storyteller pages
- **Story Submission** - Public story collection

## How the System Supports the Whole Website

### 1. Homepage Integration
```typescript
// Homepage can show featured storytellers
import { getFeaturedStorytellers } from '@/lib/supabase-storytellers'

const featured = await getFeaturedStorytellers(3)
// Display in hero section or testimonials
```

### 2. Case Study Pages
```typescript
// Any case study can include real testimonials
import StorytellerTestimonials from '@/components/cms/StorytellerTestimonials'

<StorytellerTestimonials 
  projectId="project-name"
  limit={3}
  theme="healthcare" // or any theme
/>
```

### 3. Story Collection
```typescript
// Story submission with storyteller linking
import { submitStory } from '@/lib/community-operations'

await submitStory(supabase, storytellerId, {
  title: "My Healthcare Journey",
  story_copy: "...",
  privacy_level: "public",
  themes: ["healthcare", "accessibility"]
})
```

### 4. Community Pages
```typescript
// Show storytellers by location or theme
import { searchStorytellers } from '@/lib/supabase-storytellers'

const healthcareStorytellers = await searchStorytellers("healthcare")
const melbourneStorytellers = await searchStorytellers("Melbourne")
```

### 5. Analytics and Insights
```typescript
// Generate community insights from storyteller data
import { getStorytellerStats } from '@/lib/supabase-storytellers'

const stats = await getStorytellerStats()
// Use for dashboard metrics and community reports
```

## Database Relationships and Connections

### Core Tables and Relationships

```sql
-- Main storyteller table
users (storytellers)
├── stories (storyteller_id → users.id)
├── media_content (storyteller_id → users.id)
├── quotes (via stories)
├── locations (primary_location_id → locations.id)
└── projects (project → projects.id)

-- Stories and related data
stories
├── storyteller (storyteller_id → users.id)
├── media (story_id → stories.id)
├── quotes (story_id → stories.id)
├── themes (story_id → stories.id)
├── analysis (story_id → stories.id)
└── projects (project_id → projects.id)

-- Content and media
media_content
├── storyteller (storyteller_id → users.id)
├── story (story_id → stories.id)
└── quotes (extracted from content)
```

## Scalability Features

### 1. Database Optimization
- **Indexes**: All foreign keys are indexed
- **Pagination**: All list functions support limit/offset
- **Caching**: Client-side caching for frequently accessed data
- **RLS**: Row Level Security for data protection

### 2. Performance Patterns
```typescript
// Efficient storyteller loading with pagination
const { storytellers, total } = await getStorytellers({
  limit: 20,
  offset: page * 20,
  includeStories: false // Only load when needed
})

// Lazy loading for detailed views
const storyteller = await getStorytellerById(id) // Includes stories
```

### 3. Component Architecture
- **Modular**: Each component handles one responsibility
- **Reusable**: Components work across different pages
- **Cacheable**: Server components cache automatically
- **Progressive**: Client components load data as needed

### 4. Data Flow
```
User Request → Next.js Route → Supabase Query → Type-safe Response → Component Render
```

## Cultural Protocol and Privacy Features

### 1. Data Sovereignty
- Stories marked with privacy levels: `public`, `community`, `private`
- Cultural sensitivity flags: `general`, `restricted`, `ceremonial`, `sacred`
- Consent settings for sharing and research use

### 2. PII Protection
```typescript
// Automatic PII sanitization in display components
function sanitizeDisplayName(name: string): string {
  // Removes emails, phone numbers, sensitive data
  return safeName || 'Community Member'
}
```

### 3. Cultural Protocols
- Elder review requirements for sacred content
- Community-specific sharing rules
- Attribution and consent tracking

## Integration Points

### 1. External Systems
```typescript
// API endpoints for external integrations
/api/storytellers - Public storyteller directory
/api/stories - Story collection endpoint  
/api/analytics - Community insights data
/api/projects - Project-specific data
```

### 2. Third-party Services
- **Media Storage**: Supabase Storage for images/videos
- **Authentication**: Supabase Auth for user management
- **Real-time**: Supabase Realtime for live updates
- **Search**: Full-text search across stories and profiles

### 3. Frontend Framework
- **Next.js 15**: App Router for optimal performance
- **TypeScript**: Full type safety across the system
- **Responsive**: Mobile-first design principles
- **Accessible**: WCAG compliance for all components

## Content Management Workflow

### 1. Storyteller Onboarding
```
Registration → Profile Creation → Story Submission → Review → Publication
```

### 2. Story Lifecycle
```
Draft → Pending → Review → Approved → Published → Featured (optional)
```

### 3. Content Moderation
- Automated cultural protocol checks
- Manual review for sensitive content
- Community feedback integration
- Version control for edits

## Multi-tenant Support

### 1. Organization Level
```typescript
// Filter by organization
const orgStorytellers = await getStorytellers({ 
  organizationId: "org-123" 
})
```

### 2. Project Level
```typescript
// Project-specific storytellers
const projectStorytellers = await getStorytellers({ 
  projectId: "project-456" 
})
```

### 3. Community Level
```typescript
// Community-based filtering
const communityData = await getCommunityInsights("community-789")
```

## Real-time Features

### 1. Live Updates
- New story notifications
- Storyteller activity feeds
- Community engagement metrics
- Admin dashboard updates

### 2. Collaboration
- Story co-creation workflows
- Community feedback systems
- Elder review processes
- Cultural protocol validation

## Security and Compliance

### 1. Data Protection
- End-to-end encryption for sensitive stories
- Granular privacy controls
- Audit trails for all data access
- GDPR compliance features

### 2. Access Control
- Role-based permissions (storyteller, admin, elder, community)
- Organization-level access controls
- Project-specific permissions
- Cultural protocol enforcement

## Monitoring and Analytics

### 1. System Health
- Database performance metrics
- API response times
- Error tracking and alerting
- User engagement analytics

### 2. Community Insights
- Story submission trends
- Storyteller engagement patterns
- Theme and topic analysis
- Geographic distribution data

## Deployment and Scaling

### 1. Infrastructure
- **Database**: Supabase PostgreSQL with automatic scaling
- **CDN**: Global content delivery for media files
- **Caching**: Redis for session and query caching
- **Monitoring**: Real-time performance tracking

### 2. Scaling Strategies
- Horizontal scaling via Supabase clustering
- Read replicas for improved performance
- CDN optimization for global reach
- Progressive web app features for offline access

This system provides a solid foundation that can scale from hundreds to millions of storytellers while maintaining data sovereignty, cultural sensitivity, and high performance.