# Developer Reference Guide

**Complete reference for building with the Empathy Ledger CMS system**

## 🚀 Quick Reference

### Essential Commands
```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run type-check            # TypeScript validation

# Testing
npm run test:system           # Database + CMS functionality tests
npm run test:connections      # Test storyteller relationships
npm run test:cms              # Test CMS functions and performance
npm run test                  # Unit tests

# Quality
npm run lint                  # Code linting
npm run format               # Code formatting
```

### Key File Locations
```
src/lib/supabase-storytellers.ts   # Storyteller data functions
src/lib/cms/cms-service.ts         # CMS management service
src/components/storytellers/       # Storyteller display components
src/components/cms/               # CMS-specific components
src/app/admin/cms/               # Admin interface pages
docs/                           # Documentation (this file)
scripts/test-*.ts              # Testing scripts
```

## 📚 API Reference

### Storyteller Data Functions

#### `getStorytellers(options?)`
Retrieve storytellers with pagination and filtering.

```typescript
import { getStorytellers } from '@/lib/supabase-storytellers';

// Basic usage
const { storytellers, total } = await getStorytellers();

// With options
const result = await getStorytellers({
  limit: 20,           // Number of storytellers to return
  offset: 0,           // Pagination offset
  projectId: "proj-1", // Filter by project
  organizationId: "org-1", // Filter by organization
  includeStories: true // Include story details
});

// Response structure
{
  storytellers: StorytellerWithStories[],
  total: number,
  limit: number,
  offset: number,
  error?: any
}
```

#### `getStorytellerById(storytellerId)`
Get detailed storyteller information with all related data.

```typescript
const storyteller = await getStorytellerById("storyteller-123");

// Returns storyteller with:
// - Profile information
// - All public stories
// - Impact metrics
// - Story count and latest activity
```

#### `getFeaturedStorytellers(limit)`
Get storytellers who have featured stories.

```typescript
const featured = await getFeaturedStorytellers(3);
// Returns array of storytellers with featured content
```

#### `searchStorytellers(searchTerm, options?)`
Search storytellers by name, location, or expertise.

```typescript
const results = await searchStorytellers("healthcare", {
  limit: 10,
  projectId: "project-id"
});
```

#### `getStorytellerStats(projectId?)`
Get analytics and engagement metrics.

```typescript
const stats = await getStorytellerStats();

// Returns:
{
  total_storytellers: number,
  active_storytellers: number,
  location_distribution: Record<string, number>,
  engagement_rate: number
}
```

### CMS Service Functions

#### Page Management

```typescript
import { cmsService } from '@/lib/cms';

// Create new page
const page = await cmsService.createPage({
  slug: 'new-page',
  title: 'New Page Title',
  content: [],
  page_type: 'static',
  visibility: 'public',
  cultural_sensitivity: 'general'
});

// Get page by slug
const page = await cmsService.getPageBySlug('page-slug', {
  includeBlocks: true,
  includeAuthor: true,
  published: true
});

// Update page
const updated = await cmsService.updatePage(pageId, {
  title: 'Updated Title',
  status: 'published'
});
```

#### Content Block Management

```typescript
// Add content block to page
const block = await cmsService.addContentBlock(pageId, {
  block_type: 'testimonial',
  block_order: 1,
  block_data: {
    quote: "Amazing platform for storytelling!",
    author_name: "Sarah Mitchell",
    author_image: "https://...",
    layout: 'card'
  }
});

// Update content block
const updated = await cmsService.updateContentBlock(blockId, {
  block_data: { ...updatedData }
});
```

#### Media Management

```typescript
// Upload media file
const mediaFile = await cmsService.uploadMedia({
  file: fileObject,
  title: 'Profile Photo',
  alt_text: 'Storyteller profile picture',
  folder_path: '/storytellers',
  consent_settings: {
    public_display: true,
    attribution_required: true
  }
});

// Get media library
const { media, total } = await cmsService.getMediaLibrary({
  file_type: ['image'],
  limit: 20,
  search: 'profile'
});
```

## 🧩 Component Reference

### StorytellerProfile

Display individual storyteller information with privacy protection.

```typescript
import StorytellerProfile from '@/components/storytellers/StorytellerProfile';

<StorytellerProfile 
  storyteller={{
    id: string,
    full_name: string,
    profile_image_url?: string,
    community_affiliation?: string,
    bio?: string,
    public_story_count?: number
  }}
  size="small" | "medium" | "large"    // Default: "medium"
  showBio={boolean}                     // Default: false
  showStoryCount={boolean}              // Default: false
  className={string}                    // Additional CSS classes
/>
```

**Features:**
- Automatic PII sanitization
- Profile image with initials fallback
- Responsive design
- Privacy-safe display

### StorytellerGrid

Display multiple storytellers in a responsive grid layout.

```typescript
import StorytellerGrid from '@/components/storytellers/StorytellerGrid';

<StorytellerGrid />
```

**Features:**
- Real-time data fetching
- Loading states with skeletons
- Error handling
- Responsive grid layout
- Story count and theme display

### StorytellerTestimonials

Dynamic testimonials component with multiple data sources.

```typescript
import StorytellerTestimonials from '@/components/cms/StorytellerTestimonials';

<StorytellerTestimonials 
  projectId="project-identifier"       // Optional: filter by project
  limit={3}                           // Number of testimonials
  theme="innovation"                  // Optional: theme filter
/>
```

**Features:**
- Multiple fallback strategies for data
- Real quotes with realistic personas
- Responsive testimonial cards
- Loading states

## 🎨 Styling and Design

### CSS Variables

The system uses CSS custom properties for consistent theming:

```css
:root {
  --color-ink: #1a1a1a;
  --color-ink-light: #6b7280;
  --color-brand-blue: #2563eb;
  --color-brand-green: #059669;
  --color-gray-lighter: #f9fafb;
  --color-gray-light: #e5e7eb;
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
}
```

### Component Styling

Components use CSS-in-JS with styled-jsx for scoped styles:

```typescript
export default function MyComponent() {
  return (
    <div className="container">
      <h1>Title</h1>
      
      <style jsx>{`
        .container {
          padding: var(--space-lg);
          background: var(--color-white);
          border-radius: 12px;
        }
        
        h1 {
          color: var(--color-ink);
          font-size: 2rem;
          margin-bottom: var(--space-md);
        }
      `}</style>
    </div>
  );
}
```

## 🔐 Authentication and Security

### Supabase Auth Integration

```typescript
import { createClient } from '@/lib/supabase-client';

// Get current user
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// Check user role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();
```

### Row Level Security (RLS)

Database policies automatically enforce privacy:

```sql
-- Example: Users can only see public or their own stories
CREATE POLICY "story_access_policy" ON stories
  FOR SELECT USING (
    privacy_level = 'public' OR 
    auth.uid() = storyteller_id
  );
```

### Privacy Protection Functions

```typescript
// Automatic PII sanitization
function sanitizeDisplayName(name: string): string {
  // Removes emails, phone numbers, sensitive data
  // Returns safe display name or 'Community Member'
}

// Cultural protocol validation
async function validateCulturalProtocols(content: any) {
  // Checks cultural sensitivity settings
  // Enforces elder review requirements
}
```

## 📊 Database Schema Reference

### Key Tables

#### `users` (Storytellers)
```sql
users: {
  id: uuid PRIMARY KEY,
  full_name: text,
  preferred_name: text,
  profile_image_url: text,
  bio: text,
  location: text,
  community_affiliation: text,
  cultural_background: text[],
  expertise_areas: text[],
  role: user_role DEFAULT 'storyteller',
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `stories`
```sql
stories: {
  id: uuid PRIMARY KEY,
  storyteller_id: uuid REFERENCES users(id),
  title: text,
  story_copy: text,
  story_transcript: text,
  story_image_url: text,
  video_story_link: text,
  linked_themes: text[],
  status: text DEFAULT 'Draft',
  privacy_level: text DEFAULT 'private',
  featured: boolean DEFAULT false,
  created_at: timestamp,
  updated_at: timestamp
}
```

#### `cms_pages`
```sql
cms_pages: {
  id: uuid PRIMARY KEY,
  slug: text UNIQUE,
  title: text,
  content: jsonb,
  page_type: text,
  visibility: text DEFAULT 'public',
  cultural_sensitivity: text DEFAULT 'general',
  status: text DEFAULT 'draft',
  author_id: uuid,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Relationships

```
users (storytellers)
├── stories (storyteller_id)
├── media_content (storyteller_id)
├── story_quotes (via stories)
└── locations (primary_location_id)

stories
├── story_media (story_id)
├── story_quotes (story_id)
├── story_themes (story_id)
└── story_project_links (story_id)
```

## ⚡ Performance Optimization

### Database Query Optimization

```typescript
// Efficient storyteller loading
const storytellers = await supabase
  .from('users')
  .select(`
    id, full_name, preferred_name, profile_image_url,
    stories:stories!storyteller_id(count)
  `)
  .eq('role', 'storyteller')
  .range(0, 19);  // Pagination

// Avoid N+1 queries with joins
const storytellersWithStories = await supabase
  .from('users')
  .select(`
    *,
    stories:stories!storyteller_id(id, title, status)
  `)
  .eq('role', 'storyteller');
```

### Client-Side Optimization

```typescript
// React Query for caching
import { useQuery } from '@tanstack/react-query';

function useStorytellers(options = {}) {
  return useQuery({
    queryKey: ['storytellers', options],
    queryFn: () => getStorytellers(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Progressive loading
const [storytellers, setStorytellers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadStorytellers();
}, []);
```

### Image Optimization

```typescript
// Next.js Image component with optimization
import Image from 'next/image';

<Image
  src={storyteller.profile_image_url}
  alt={`Profile of ${storyteller.full_name}`}
  width={200}
  height={200}
  className="rounded-full"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## 🧪 Testing Patterns

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import StorytellerProfile from '@/components/storytellers/StorytellerProfile';

test('displays storyteller name', () => {
  const storyteller = {
    id: '123',
    full_name: 'Sarah Mitchell',
    profile_image_url: 'https://example.com/image.jpg'
  };
  
  render(<StorytellerProfile storyteller={storyteller} />);
  
  expect(screen.getByText('Sarah Mitchell')).toBeInTheDocument();
});
```

### Database Testing

```typescript
// Test storyteller relationships
const { storytellers } = await getStorytellers({ limit: 1 });
const storyteller = storytellers[0];

// Verify data structure
expect(storyteller).toHaveProperty('id');
expect(storyteller).toHaveProperty('full_name');
expect(storyteller.story_count).toBeGreaterThanOrEqual(0);
```

### Integration Testing

```bash
# Test database connections
npm run test:connections

# Test CMS functionality
npm run test:cms

# Test complete system
npm run test:system
```

## 🚨 Error Handling

### Graceful Degradation

```typescript
// Handle missing data gracefully
function StorytellerCard({ storyteller }) {
  const displayName = storyteller.preferred_name || 
                     storyteller.full_name || 
                     'Community Member';
                     
  const storyCount = storyteller.story_count || 0;
  
  return (
    <div className="storyteller-card">
      <h3>{displayName}</h3>
      <p>{storyCount} {storyCount === 1 ? 'story' : 'stories'}</p>
    </div>
  );
}
```

### Error Boundaries

```typescript
// Error boundary for component failures
class StorytellerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <p>Unable to load storyteller information.</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 🎯 Best Practices

### Code Organization

1. **Separation of Concerns**: Keep data fetching separate from UI components
2. **Type Safety**: Use TypeScript interfaces for all data structures
3. **Error Handling**: Always handle potential failures gracefully
4. **Performance**: Implement loading states and optimize queries
5. **Accessibility**: Ensure all components work with screen readers

### Data Privacy

1. **PII Protection**: Always sanitize display names and sensitive data
2. **Consent Verification**: Check user permissions before displaying content
3. **Cultural Sensitivity**: Respect Indigenous protocols and community guidelines
4. **Audit Trails**: Log access to sensitive information

### Development Workflow

1. **Test First**: Write tests before implementing features
2. **Document Changes**: Update documentation with new features
3. **Code Review**: Have cultural sensitivity reviews for community features
4. **Performance Testing**: Verify system performance under load
5. **User Testing**: Validate with community members before deployment

This developer reference provides everything needed to build upon the Empathy Ledger CMS system while maintaining its core values of data sovereignty, cultural sensitivity, and community empowerment.