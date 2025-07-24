# CMS User Guide

**Complete guide for managing content and storytellers in Empathy Ledger**

## 🎯 Quick Start

### Accessing the CMS
```bash
# Start the development server
npm run dev

# Navigate to admin interface
open http://localhost:3005/admin/cms
```

### Main Dashboard
The CMS dashboard provides:
- **Overview Statistics**: Total pages, storytellers, and recent activity
- **Quick Actions**: Create content, manage storytellers, upload media
- **Recent Activity**: Latest pages and storyteller updates

## 👥 Storyteller Management

### Viewing Storytellers

**Location**: `/admin/cms/storytellers`

The storyteller management interface shows:
- **Profile Information**: Name, bio, profile image
- **Activity Stats**: Story count, engagement metrics
- **Location Data**: Geographic information
- **Themes**: Primary topics from their stories
- **Action Buttons**: View profile, view stories, edit details

### Storyteller Search and Filtering

```typescript
// Search functionality includes:
- Name search (full name or preferred name)
- Location-based filtering
- Expertise area matching
- Theme-based discovery
```

### Storyteller Actions

1. **View Profile**: See complete storyteller information
2. **View Stories**: List all stories by this storyteller
3. **Edit Details**: Update profile information (respect privacy)
4. **Manage Permissions**: Set privacy and cultural protocol settings

### Privacy and Cultural Protocols

**Important**: All storyteller data respects privacy settings:
- Names are automatically sanitized to remove PII
- Profile images have fallback to initials
- Bios are checked for sensitive information
- Cultural protocols are enforced for Indigenous content

## 📄 Page Management

### Creating New Pages

**Location**: `/admin/cms/pages/new`

1. **Basic Information**:
   - Title and slug
   - Meta description for SEO
   - Page type (static, dynamic, community, etc.)

2. **Visibility Settings**:
   - Public: Available to all visitors
   - Community: Requires community membership
   - Members: Registered users only
   - Admin: Administrative access only

3. **Cultural Sensitivity**:
   - General: Standard content
   - Restricted: Limited sharing
   - Ceremonial: Requires elder review
   - Sacred: Highest protection level

### Content Blocks

Pages are built using content blocks:

#### Available Block Types
- **Hero**: Large banner with title, subtitle, and call-to-action
- **Text**: Formatted text content with alignment options
- **Image**: Single images with captions and linking
- **Video**: Embedded video content with controls
- **Testimonial**: Storyteller quotes and profiles
- **Stats**: Numerical displays with icons and descriptions
- **Story Showcase**: Dynamic storyteller content
- **Community Stats**: Real-time community metrics
- **Form**: Contact and submission forms
- **Gallery**: Image collections and carousels

#### Working with Content Blocks

1. **Adding Blocks**: Click "Add Content Block" and choose type
2. **Editing Blocks**: Click on any block to edit content
3. **Reordering**: Drag and drop blocks to change order
4. **Deleting**: Use the delete button (careful - no undo!)

### Publishing Workflow

1. **Draft**: Work in progress, not visible to public
2. **Review**: Ready for approval (if elder review required)
3. **Published**: Live on the website
4. **Archived**: Removed from public view but preserved

## 🖼️ Media Management

### Uploading Media

**Location**: `/admin/cms/media`

1. **File Upload**: Drag and drop or browse for files
2. **Metadata Entry**:
   - Title and description
   - Alt text for accessibility
   - Attribution information
   - Cultural protocols if applicable

3. **Organization**:
   - Folder structure for organization
   - Tags for easy discovery
   - Categories for content types

### Consent and Attribution

**Critical**: All media must have proper consent:
- **Public Display**: Can be shown publicly
- **Commercial Use**: Can be used for commercial purposes
- **Attribution Required**: Credit must be given
- **Cultural Protocols**: Special handling requirements

### Media Types Supported
- **Images**: JPG, PNG, WebP, SVG
- **Videos**: MP4, WebM, MOV
- **Audio**: MP3, WAV, OGG
- **Documents**: PDF, DOC, TXT

## 🧩 Using Storyteller Components

### StorytellerProfile Component

Display individual storyteller information:

```typescript
<StorytellerProfile 
  storyteller={{
    id: "storyteller-id",
    full_name: "Sarah Mitchell",
    profile_image_url: "https://...",
    community_affiliation: "Community Leader",
    bio: "Bio text..."
  }}
  size="medium"           // small, medium, large
  showBio={true}         // Show biography
  showStoryCount={true}  // Show number of stories
/>
```

### StorytellerGrid Component

Display multiple storytellers in a grid:

```typescript
<StorytellerGrid 
  limit={12}                    // Number to display
  projectId="project-id"        // Filter by project
  includeStories={false}        // Load story details
/>
```

### StorytellerTestimonials Component

Show testimonials on pages like case studies:

```typescript
<StorytellerTestimonials 
  projectId="a-curious-tractor"  // Project context
  limit={3}                      // Number of testimonials
  theme="innovation"             // Theme filter
/>
```

## 🔍 Content Discovery

### Using Real Data

The CMS automatically pulls real storyteller data from the database:

1. **Featured Storytellers**: Those with featured stories
2. **Active Storytellers**: Recent story contributions
3. **Thematic Connections**: Stories grouped by themes
4. **Geographic Distribution**: Location-based storyteller discovery

### Search and Filtering

```typescript
// Available search parameters:
- Name or preferred name
- Location (city, region, country)
- Expertise areas
- Cultural background
- Story themes
- Project associations
```

## 📊 Analytics and Insights

### Storyteller Metrics

**Available Statistics**:
- Total storytellers
- Active contributors (last 30 days)
- Engagement rate
- Geographic distribution
- Theme popularity
- Story completion rates

### Content Performance

Track page and content performance:
- Page views and engagement
- Storyteller profile visits
- Story read rates
- Media usage statistics
- Search query analysis

## 🛡️ Privacy and Security

### Data Protection

**Automatic Protections**:
- PII sanitization in displays
- Email and phone number filtering
- Consent requirement enforcement
- Cultural protocol validation

### Access Controls

**Role-Based Permissions**:
- **Admin**: Full access to all content and storytellers
- **Editor**: Can create and edit content, limited storyteller access
- **Community Moderator**: Can review and approve community content
- **Elder**: Can review culturally sensitive content

### Cultural Protocol Enforcement

**Built-in Safeguards**:
- Sacred content requires elder approval
- Ceremonial content has restricted sharing
- Community-specific protocols are respected
- Attribution requirements are enforced

## 🔧 Troubleshooting

### Common Issues

#### "No storytellers found"
- Check database connection: `npm run test:connections`
- Verify environment variables are set
- Ensure storytellers exist in database

#### "Images not loading"
- Check Supabase Storage configuration
- Verify file permissions and access
- Test media upload functionality

#### "Search not working"
- Check search terms for special characters
- Verify database indexes are in place
- Test with simpler search terms

#### "Permission denied"
- Verify user role and permissions
- Check Row Level Security policies
- Ensure proper authentication state

### Testing Your Changes

```bash
# Test CMS functionality
npm run test:cms

# Test database connections
npm run test:connections

# Run all system tests
npm run test:system
```

### Getting Help

1. **Check the console**: Look for error messages
2. **Review logs**: Check server and database logs
3. **Test components**: Use individual component tests
4. **Verify data**: Ensure database contains expected information

## 📝 Best Practices

### Content Creation

1. **Respect Cultural Protocols**: Always check sensitivity settings
2. **Use Real Data**: Connect to actual storyteller information
3. **Maintain Privacy**: Never expose PII or sensitive information
4. **Provide Context**: Include proper attribution and background
5. **Test Thoroughly**: Verify content displays correctly across devices

### Storyteller Management

1. **Honor Consent**: Respect storyteller preferences and boundaries
2. **Maintain Accuracy**: Keep profile information up to date
3. **Protect Privacy**: Use privacy-safe display functions
4. **Encourage Participation**: Make storytelling accessible and rewarding
5. **Build Community**: Connect storytellers with shared interests

### Technical Excellence

1. **Performance**: Optimize images and minimize load times
2. **Accessibility**: Ensure content is usable by all community members
3. **Mobile-First**: Design for mobile devices primarily
4. **SEO**: Use proper meta descriptions and structured data
5. **Security**: Regular security reviews and updates

This CMS system provides powerful tools for community storytelling while maintaining the highest standards for privacy, cultural sensitivity, and data sovereignty.