#!/usr/bin/env tsx
/**
 * PHASE 3: CMS Integration Implementation
 * Integrate storyteller data with site-wide content management
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CMSPage {
  slug: string;
  title: string;
  description: string;
  content: any;
  page_type: string;
}

async function createCMSPages(): Promise<void> {
  console.log('📄 Creating CMS pages with storyteller integration...');
  
  const pages: CMSPage[] = [
    {
      slug: 'storytellers',
      title: 'Our Storytellers',
      description: 'Meet the community voices behind Empathy Ledger',
      page_type: 'dynamic',
      content: {
        hero: {
          title: 'Meet Our Storytellers',
          subtitle: 'Every story matters. Every voice counts. Meet the community members who share their experiences to create positive change.',
          background_type: 'gradient'
        },
        sections: [
          {
            type: 'storyteller_grid',
            title: 'Community Voices',
            description: 'Storytellers from across Australia and beyond',
            data_source: 'storytellers',
            filters: ['organization', 'location', 'project'],
            display_options: {
              show_photos: true,
              show_bios: true,
              show_organizations: true,
              cards_per_row: 3,
              pagination: true
            }
          }
        ]
      }
    },
    {
      slug: 'organizations',
      title: 'Partner Organizations',
      description: 'The organizations empowering storytellers and communities',
      page_type: 'dynamic',
      content: {
        hero: {
          title: 'Our Partners',
          subtitle: 'Working with organizations across Australia to amplify community voices',
          background_type: 'solid'
        },
        sections: [
          {
            type: 'organization_showcase',
            title: 'Community Partners',
            data_source: 'organizations',
            display_options: {
              show_storyteller_count: true,
              show_locations: true,
              show_contact_info: false,
              layout: 'card_grid'
            }
          }
        ]
      }
    },
    {
      slug: 'stories',
      title: 'Community Stories',
      description: 'Real stories from real people creating real change',
      page_type: 'dynamic',
      content: {
        hero: {
          title: 'Stories That Matter',
          subtitle: 'Authentic voices sharing experiences that create understanding and drive positive change',
          background_type: 'image'
        },
        sections: [
          {
            type: 'story_showcase',
            title: 'Featured Stories',
            data_source: 'stories',
            filters: ['theme', 'organization', 'location'],
            display_options: {
              show_transcripts: true,
              show_storyteller_info: true,
              show_media: true,
              featured_count: 6
            }
          }
        ]
      }
    },
    {
      slug: 'impact',
      title: 'Our Impact',
      description: 'See how storyteller voices are creating change',
      page_type: 'analytics',
      content: {
        hero: {
          title: 'Creating Real Impact',
          subtitle: 'Measuring the difference storyteller voices make in communities',
          background_type: 'gradient'
        },
        sections: [
          {
            type: 'impact_metrics',
            title: 'By the Numbers',
            metrics: [
              { source: 'storytellers', type: 'count', label: 'Community Voices' },
              { source: 'organizations', type: 'count', label: 'Partner Organizations' },
              { source: 'locations', type: 'count', label: 'Locations Reached' },
              { source: 'stories', type: 'count', label: 'Stories Shared' }
            ]
          },
          {
            type: 'geographic_distribution',
            title: 'Reaching Communities',
            data_source: 'locations',
            display_options: {
              map_view: true,
              show_storyteller_density: true
            }
          }
        ]
      }
    }
  ];
  
  for (const page of pages) {
    try {
      // Check if page already exists
      const { data: existing } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', page.slug)
        .single();
        
      if (existing) {
        console.log(`⏭️  Page ${page.slug} already exists`);
        continue;
      }
      
      // Create the page
      const { data, error } = await supabase
        .from('cms_pages')
        .insert({
          slug: page.slug,
          title: page.title,
          description: page.description,
          page_type: page.page_type,
          content: page.content,
          status: 'published',
          seo_title: page.title,
          seo_description: page.description
        })
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to create page ${page.slug}:`, error.message);
      } else {
        console.log(`✅ Created CMS page: ${page.slug}`);
      }
      
    } catch (err) {
      console.error(`❌ Error creating page ${page.slug}:`, err);
    }
  }
}

async function createContentBlocks(): Promise<void> {
  console.log('🧱 Creating reusable content blocks...');
  
  const blocks = [
    {
      name: 'storyteller_card',
      block_type: 'component',
      category: 'storyteller',
      description: 'Individual storyteller profile card',
      schema: {
        fields: [
          { name: 'storyteller_id', type: 'uuid', required: true },
          { name: 'show_photo', type: 'boolean', default: true },
          { name: 'show_bio', type: 'boolean', default: true },
          { name: 'show_organization', type: 'boolean', default: true },
          { name: 'show_location', type: 'boolean', default: false },
          { name: 'card_style', type: 'select', options: ['minimal', 'detailed', 'featured'] }
        ]
      },
      default_content: {
        show_photo: true,
        show_bio: true,
        show_organization: true,
        show_location: false,
        card_style: 'detailed'
      }
    },
    {
      name: 'story_preview',
      block_type: 'component',
      category: 'story',
      description: 'Story preview card with storyteller info',
      schema: {
        fields: [
          { name: 'story_id', type: 'uuid', required: true },
          { name: 'show_transcript_preview', type: 'boolean', default: true },
          { name: 'show_storyteller', type: 'boolean', default: true },
          { name: 'show_media', type: 'boolean', default: true },
          { name: 'preview_length', type: 'number', default: 150 }
        ]
      },
      default_content: {
        show_transcript_preview: true,
        show_storyteller: true,
        show_media: true,
        preview_length: 150
      }
    },
    {
      name: 'organization_showcase',
      block_type: 'component',
      category: 'organization',
      description: 'Organization display with storyteller count',
      schema: {
        fields: [
          { name: 'organization_id', type: 'uuid', required: true },
          { name: 'show_storyteller_count', type: 'boolean', default: true },
          { name: 'show_description', type: 'boolean', default: true },
          { name: 'show_contact', type: 'boolean', default: false }
        ]
      },
      default_content: {
        show_storyteller_count: true,
        show_description: true,
        show_contact: false
      }
    },
    {
      name: 'impact_metric',
      block_type: 'component',
      category: 'analytics',
      description: 'Live metric counter from database',
      schema: {
        fields: [
          { name: 'data_source', type: 'select', options: ['storytellers', 'stories', 'organizations', 'locations'], required: true },
          { name: 'metric_type', type: 'select', options: ['count', 'sum', 'average'], default: 'count' },
          { name: 'label', type: 'text', required: true },
          { name: 'suffix', type: 'text', default: '' },
          { name: 'color_theme', type: 'select', options: ['primary', 'secondary', 'accent'] }
        ]
      },
      default_content: {
        metric_type: 'count',
        color_theme: 'primary'
      }
    }
  ];
  
  for (const block of blocks) {
    try {
      // Check if block already exists
      const { data: existing } = await supabase
        .from('cms_content_blocks')
        .select('id')
        .eq('name', block.name)
        .single();
        
      if (existing) {
        console.log(`⏭️  Block ${block.name} already exists`);
        continue;
      }
      
      // Create the block
      const { data, error } = await supabase
        .from('cms_content_blocks')
        .insert(block)
        .select('id')
        .single();
        
      if (error) {
        console.error(`❌ Failed to create block ${block.name}:`, error.message);
      } else {
        console.log(`✅ Created content block: ${block.name}`);
      }
      
    } catch (err) {
      console.error(`❌ Error creating block ${block.name}:`, err);
    }
  }
}

async function createDynamicComponents(): Promise<void> {
  console.log('⚛️  Creating dynamic React components...');
  
  // Create storyteller components
  const storytellerCardComponent = `import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

interface StoryellerCardProps {
  storytellerId: string;
  showPhoto?: boolean;
  showBio?: boolean;
  showOrganization?: boolean;
  showLocation?: boolean;
  cardStyle?: 'minimal' | 'detailed' | 'featured';
}

export default function StorytellerCard({
  storytellerId,
  showPhoto = true,
  showBio = true,
  showOrganization = true,
  showLocation = false,
  cardStyle = 'detailed'
}: StoryellerCardProps) {
  const [storyteller, setStoryteller] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStoryteller() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('storytellers')
        .select(\`
          *,
          organizations (name, type),
          locations (name, country),
          projects (name)
        \`)
        .eq('id', storytellerId)
        .eq('consent_given', true)
        .single();

      if (data && !error) {
        setStoryteller(data);
      }
      setLoading(false);
    }

    fetchStoryteller();
  }, [storytellerId]);

  if (loading) {
    return <div className="storyteller-card loading">Loading...</div>;
  }

  if (!storyteller) {
    return null;
  }

  const cardClasses = \`storyteller-card \${cardStyle}\`;

  return (
    <div className={cardClasses}>
      {showPhoto && storyteller.profile_image_url && (
        <div className="storyteller-photo">
          <Image
            src={storyteller.profile_image_url}
            alt={\`\${storyteller.full_name} profile photo\`}
            width={100}
            height={100}
            className="profile-image"
          />
        </div>
      )}
      
      <div className="storyteller-info">
        <h3 className="storyteller-name">{storyteller.full_name}</h3>
        
        {storyteller.role && (
          <p className="storyteller-role">{storyteller.role}</p>
        )}
        
        {showOrganization && storyteller.organizations && (
          <p className="storyteller-organization">
            {storyteller.organizations.name}
          </p>
        )}
        
        {showLocation && storyteller.locations && (
          <p className="storyteller-location">
            {storyteller.locations.name}
          </p>
        )}
        
        {showBio && storyteller.bio && (
          <p className="storyteller-bio">{storyteller.bio}</p>
        )}
      </div>

      <style jsx>{\`
        .storyteller-card {
          background: var(--card-background, #ffffff);
          border: 1px solid var(--card-border, #e0e0e0);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .storyteller-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .storyteller-card.minimal {
          padding: 1rem;
        }
        
        .storyteller-card.featured {
          padding: 2rem;
          border-color: var(--primary-color, #B85C38);
          border-width: 2px;
        }
        
        .storyteller-photo {
          text-align: center;
          margin-bottom: 1rem;
        }
        
        .profile-image {
          border-radius: 50%;
          object-fit: cover;
        }
        
        .storyteller-name {
          color: var(--primary-color, #B85C38);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .storyteller-role {
          color: var(--secondary-color, #1A3A52);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .storyteller-organization,
        .storyteller-location {
          color: var(--text-muted, #6B7280);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .storyteller-bio {
          color: var(--text-color, #2D2D2D);
          line-height: 1.5;
          margin-top: 1rem;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-muted, #6B7280);
        }
      \`}</style>
    </div>
  );
}`;

  // Create component directory
  const componentsDir = path.join(process.cwd(), 'src', 'components', 'cms');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  // Write storyteller card component
  fs.writeFileSync(
    path.join(componentsDir, 'StorytellerCard.tsx'),
    storytellerCardComponent
  );

  console.log('✅ Created StorytellerCard component');

  // Create impact metrics component
  const impactMetricsComponent = `import React from 'react';
import { createClient } from '@supabase/supabase-js';

interface ImpactMetricProps {
  dataSource: 'storytellers' | 'stories' | 'organizations' | 'locations';
  metricType?: 'count' | 'sum' | 'average';
  label: string;
  suffix?: string;
  colorTheme?: 'primary' | 'secondary' | 'accent';
}

export default function ImpactMetric({
  dataSource,
  metricType = 'count',
  label,
  suffix = '',
  colorTheme = 'primary'
}: ImpactMetricProps) {
  const [value, setValue] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMetric() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase.from(dataSource).select('*');
      
      // Add privacy filters
      if (dataSource === 'storytellers') {
        query = query.eq('consent_given', true);
      } else if (dataSource === 'stories') {
        query = query.eq('privacy_level', 'public');
      }

      const { data, error } = await query;

      if (!error && data) {
        setValue(data.length);
      }
      setLoading(false);
    }

    fetchMetric();
  }, [dataSource, metricType]);

  const themeClasses = \`impact-metric \${colorTheme}\`;

  return (
    <div className={themeClasses}>
      <div className="metric-value">
        {loading ? '...' : value.toLocaleString()}
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      <div className="metric-label">{label}</div>

      <style jsx>{\`
        .impact-metric {
          text-align: center;
          padding: 2rem 1rem;
          background: var(--card-background, #ffffff);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }
        
        .impact-metric:hover {
          transform: translateY(-2px);
        }
        
        .impact-metric.primary {
          border-top: 4px solid var(--primary-color, #B85C38);
        }
        
        .impact-metric.secondary {
          border-top: 4px solid var(--secondary-color, #1A3A52);
        }
        
        .impact-metric.accent {
          border-top: 4px solid var(--accent-color, #7A9B76);
        }
        
        .metric-value {
          font-size: 3rem;
          font-weight: 800;
          color: var(--primary-color, #B85C38);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        
        .suffix {
          font-size: 1.5rem;
          margin-left: 0.25rem;
        }
        
        .metric-label {
          font-size: 1.1rem;
          color: var(--text-color, #2D2D2D);
          font-weight: 500;
        }
      \`}</style>
    </div>
  );
}`;

  fs.writeFileSync(
    path.join(componentsDir, 'ImpactMetric.tsx'),
    impactMetricsComponent
  );

  console.log('✅ Created ImpactMetric component');
}

async function updateExistingPages(): Promise<void> {
  console.log('🔄 Updating existing pages with storyteller integration...');
  
  // Update home page to feature storytellers
  const homePageContent = {
    hero: {
      title: 'Community Stories That Create Change',
      subtitle: 'Real voices from real people building stronger, more connected communities',
      cta_primary: {
        text: 'Meet Our Storytellers',
        link: '/storytellers'
      },
      cta_secondary: {
        text: 'Share Your Story',
        link: '/submit'
      },
      background_type: 'gradient',
      featured_storytellers: 6
    },
    sections: [
      {
        type: 'featured_storytellers',
        title: 'Voices From Our Community',
        description: 'Meet some of the inspiring individuals sharing their stories',
        display_options: {
          count: 6,
          show_photos: true,
          show_organizations: true,
          randomize: true
        }
      },
      {
        type: 'impact_metrics',
        title: 'Creating Real Impact',
        metrics: [
          { source: 'storytellers', label: 'Community Voices' },
          { source: 'organizations', label: 'Partner Organizations' },
          { source: 'locations', label: 'Communities Reached' }
        ]
      },
      {
        type: 'recent_stories',
        title: 'Latest Stories',
        description: 'Fresh perspectives and experiences from our community',
        display_options: {
          count: 3,
          show_previews: true,
          show_storytellers: true
        }
      }
    ]
  };

  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .update({
        content: homePageContent,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'home')
      .select('id');

    if (error) {
      console.error('❌ Failed to update home page:', error.message);
    } else {
      console.log('✅ Updated home page with storyteller integration');
    }
  } catch (err) {
    console.error('❌ Error updating home page:', err);
  }
}

async function main() {
  console.log('🚀 PHASE 3: CMS INTEGRATION');
  console.log('===========================');
  console.log('Integrating storyteller data with site-wide content management');
  console.log('');

  try {
    // Step 1: Create CMS pages
    await createCMSPages();
    
    // Step 2: Create content blocks
    await createContentBlocks();
    
    // Step 3: Create dynamic components
    await createDynamicComponents();
    
    // Step 4: Update existing pages
    await updateExistingPages();

    console.log('\\n🎉 PHASE 3 CMS INTEGRATION COMPLETED!');
    console.log('=====================================');
    console.log('✅ Dynamic CMS pages created');
    console.log('✅ Reusable content blocks ready');
    console.log('✅ React components generated');
    console.log('✅ Storyteller data integrated');
    console.log('\\n🎯 Ready for Phase 4: Blog Generation & Content Workflows');

  } catch (error) {
    console.error('❌ CMS integration failed:', error);
  }
}

main().catch(console.error);