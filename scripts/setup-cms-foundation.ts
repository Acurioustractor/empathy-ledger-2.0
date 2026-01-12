#!/usr/bin/env tsx

/**
 * Set Up CMS Foundation
 * 
 * Creates the core CMS data structure for world-class content management
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing admin credentials')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function setupCMSFoundation() {
  console.log('🚀 SETTING UP CMS FOUNDATION...')
  console.log('=' .repeat(60))
  
  try {
    const supabase = await createAdminClient()
    console.log('✅ Admin client connected')
    
    // 1. Set up core pages
    console.log('\n📄 SETTING UP CORE PAGES:')
    await setupCorePages(supabase)
    
    // 2. Create content blocks for modular design
    console.log('\n🧩 SETTING UP CONTENT BLOCKS:')
    await setupContentBlocks(supabase)
    
    // 3. Set up navigation structure
    console.log('\n🧭 SETTING UP NAVIGATION:')
    await setupNavigation(supabase)
    
    // 4. Configure CMS settings
    console.log('\n⚙️ CONFIGURING CMS SETTINGS:')
    await setupCMSSettings(supabase)
    
    // 5. Set up media library foundation
    console.log('\n🖼️ SETTING UP MEDIA LIBRARY:')
    await setupMediaLibrary(supabase)
    
    console.log('\n🎉 CMS FOUNDATION COMPLETE!')
    console.log('🎯 Ready for:')
    console.log('   • Content creation and editing')
    console.log('   • Dynamic page rendering')
    console.log('   • A Curious Tractor case study setup')
    console.log('   • Multi-tenant content management')
    
  } catch (error) {
    console.error('❌ CMS foundation setup failed:', error)
    throw error
  }
}

async function setupCorePages(supabase: any) {
  const corePages = [
    {
      slug: 'home',
      title: 'Empathy Ledger - Community Storytelling Platform',
      description: 'A secure, sovereignty-first platform for sharing and preserving community stories.',
      page_type: 'landing',
      status: 'published',
      seo_title: 'Empathy Ledger | Community Stories That Matter',
      seo_description: 'Share your story securely. Build understanding. Create change. The sovereignty-first platform for community storytelling.',
      seo_keywords: 'community stories, empathy, sovereignty, storytelling platform, secure sharing',
      meta_data: {
        hero_title: 'Your Stories Matter',
        hero_subtitle: 'A secure platform for sharing experiences that build understanding and create positive change',
        hero_cta: 'Share Your Story',
        features_enabled: ['hero', 'featured_stories', 'statistics', 'how_it_works', 'testimonials']
      }
    },
    {
      slug: 'about',
      title: 'About Empathy Ledger',
      description: 'Learn about our mission to create safe spaces for community storytelling.',
      page_type: 'content',
      status: 'published',
      seo_title: 'About Us | Empathy Ledger',
      seo_description: 'Discover how Empathy Ledger creates safe, secure spaces for community storytelling and social change.',
      seo_keywords: 'about empathy ledger, community storytelling, social change, platform mission',
      meta_data: {
        sections_enabled: ['mission', 'values', 'team', 'impact', 'partners']
      }
    },
    {
      slug: 'modules',
      title: 'Platform Modules',
      description: 'Explore our comprehensive suite of storytelling and engagement tools.',
      page_type: 'showcase',
      status: 'published',
      seo_title: 'Platform Modules | Empathy Ledger Features',
      seo_description: 'Discover powerful modules for story collection, visualization, and community engagement.',
      seo_keywords: 'platform modules, storytelling tools, data visualization, community engagement',
      meta_data: {
        layout: 'grid',
        modules_featured: ['story_collection', 'data_visualization', 'community_dashboard', 'impact_reporting']
      }
    },
    {
      slug: 'visualisations',
      title: 'Data Visualizations',
      description: 'Interactive visualizations that bring community stories to life.',
      page_type: 'showcase',
      status: 'published',
      seo_title: 'Story Visualizations | Empathy Ledger',
      seo_description: 'Explore interactive visualizations that reveal patterns and insights in community stories.',
      seo_keywords: 'data visualization, story patterns, community insights, interactive charts',
      meta_data: {
        visualizations: ['impact_heatmap', 'network_graph', 'knowledge_river', 'timeline_flow']
      }
    },
    {
      slug: 'case-studies',
      title: 'Case Studies',
      description: 'Real-world examples of community impact through storytelling.',
      page_type: 'showcase',
      status: 'published',
      seo_title: 'Case Studies | Community Impact Stories',
      seo_description: 'See how organizations use Empathy Ledger to create meaningful community change.',
      seo_keywords: 'case studies, community impact, success stories, platform results',
      meta_data: {
        featured_case_study: 'a-curious-tractor',
        layout: 'cards',
        filters_enabled: ['industry', 'location', 'impact_type']
      }
    }
  ]

  for (const page of corePages) {
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .upsert(page, { onConflict: 'slug' })
        .select()

      if (error) throw error
      console.log(`   ✅ Created/updated page: ${page.slug}`)
    } catch (error) {
      console.log(`   ❌ Failed to create page ${page.slug}:`, error)
    }
  }
}

async function setupContentBlocks(supabase: any) {
  const contentBlocks = [
    {
      name: 'Hero Section',
      block_type: 'hero',
      category: 'layout',
      description: 'Main hero section with title, subtitle, and call-to-action',
      schema: {
        title: 'string',
        subtitle: 'string',
        background_image: 'media',
        cta_text: 'string',
        cta_link: 'string',
        overlay_opacity: 'number'
      },
      default_content: {
        title: 'Your Stories Matter',
        subtitle: 'A secure platform for sharing experiences that build understanding',
        cta_text: 'Share Your Story',
        cta_link: '/submit',
        overlay_opacity: 0.6
      }
    },
    {
      name: 'Feature Grid',
      block_type: 'feature_grid',
      category: 'content',
      description: 'Grid of platform features with icons and descriptions',
      schema: {
        title: 'string',
        features: 'array',
        columns: 'number',
        style: 'select'
      },
      default_content: {
        title: 'Platform Features',
        columns: 3,
        style: 'cards',
        features: [
          {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'End-to-end encryption ensures your stories stay safe'
          },
          {
            icon: '🌏',
            title: 'Community Focused',
            description: 'Built for organizations serving their communities'
          },
          {
            icon: '📊',
            title: 'Insights & Impact',
            description: 'Visualize patterns and measure community change'
          }
        ]
      }
    },
    {
      name: 'Statistics Bar',
      block_type: 'statistics',
      category: 'data',
      description: 'Animated statistics showing platform impact',
      schema: {
        title: 'string',
        stats: 'array',
        animation: 'boolean'
      },
      default_content: {
        title: 'Platform Impact',
        animation: true,
        stats: [
          { label: 'Stories Shared', value: '500+', icon: '📖' },
          { label: 'Communities Served', value: '12+', icon: '🏘️' },
          { label: 'Countries Reached', value: '4', icon: '🌍' },
          { label: 'Lives Impacted', value: '2000+', icon: '❤️' }
        ]
      }
    },
    {
      name: 'Testimonial',
      block_type: 'testimonial',
      category: 'social_proof',
      description: 'Community testimonial with quote and attribution',
      schema: {
        quote: 'rich_text',
        author: 'string',
        role: 'string',
        organization: 'string',
        avatar: 'media',
        rating: 'number'
      },
      default_content: {
        quote: 'Empathy Ledger has transformed how we collect and share community stories. The platform respects our sovereignty while providing powerful insights.',
        author: 'Community Leader',
        organization: 'Sample Organization',
        rating: 5
      }
    }
  ]

  for (const block of contentBlocks) {
    try {
      const { data, error } = await supabase
        .from('cms_content_blocks')
        .upsert(block, { onConflict: 'name' })
        .select()

      if (error) throw error
      console.log(`   ✅ Created content block: ${block.name}`)
    } catch (error) {
      console.log(`   ❌ Failed to create block ${block.name}:`, error)
    }
  }
}

async function setupNavigation(supabase: any) {
  const navigationItems = [
    {
      name: 'main_navigation',
      type: 'header',
      items: [
        { label: 'Home', href: '/', order: 1, visible: true },
        { label: 'About', href: '/about', order: 2, visible: true },
        { label: 'Modules', href: '/modules', order: 3, visible: true },
        { label: 'Visualizations', href: '/visualisations', order: 4, visible: true },
        { label: 'Case Studies', href: '/case-studies', order: 5, visible: true },
        { label: 'Share Story', href: '/submit', order: 6, visible: true, highlight: true }
      ]
    },
    {
      name: 'footer_navigation',
      type: 'footer',
      items: [
        { label: 'Platform', href: '/modules', order: 1, visible: true },
        { label: 'Privacy', href: '/privacy', order: 2, visible: true },
        { label: 'Security', href: '/security', order: 3, visible: true },
        { label: 'Support', href: '/support', order: 4, visible: true }
      ]
    },
    {
      name: 'admin_navigation',
      type: 'admin',
      items: [
        { label: 'Dashboard', href: '/admin', order: 1, visible: true },
        { label: 'Stories', href: '/admin/stories', order: 2, visible: true },
        { label: 'Organizations', href: '/admin/organizations', order: 3, visible: true },
        { label: 'Analytics', href: '/admin/analytics', order: 4, visible: true },
        { label: 'Settings', href: '/admin/settings', order: 5, visible: true }
      ]
    }
  ]

  for (const nav of navigationItems) {
    try {
      const { data, error } = await supabase
        .from('cms_navigation')
        .upsert(nav, { onConflict: 'name' })
        .select()

      if (error) throw error
      console.log(`   ✅ Created navigation: ${nav.name}`)
    } catch (error) {
      console.log(`   ❌ Failed to create navigation ${nav.name}:`, error)
    }
  }
}

async function setupCMSSettings(supabase: any) {
  const settings = [
    {
      key: 'site_title',
      value: 'Empathy Ledger',
      category: 'general',
      description: 'Main site title'
    },
    {
      key: 'site_tagline',
      value: 'Community Stories That Matter',
      category: 'general',
      description: 'Site tagline/subtitle'
    },
    {
      key: 'default_theme',
      value: 'empathy-ledger',
      category: 'appearance',
      description: 'Default theme for the platform'
    },
    {
      key: 'enable_story_submission',
      value: 'true',
      category: 'features',
      description: 'Enable public story submission'
    },
    {
      key: 'enable_visualizations',
      value: 'true',
      category: 'features',
      description: 'Enable data visualization pages'
    },
    {
      key: 'contact_email',
      value: 'hello@empathyledger.com',
      category: 'contact',
      description: 'Main contact email'
    },
    {
      key: 'privacy_policy_url',
      value: '/privacy',
      category: 'legal',
      description: 'Privacy policy page URL'
    },
    {
      key: 'terms_of_service_url',
      value: '/terms',
      category: 'legal',
      description: 'Terms of service page URL'
    }
  ]

  for (const setting of settings) {
    try {
      const { data, error } = await supabase
        .from('cms_settings')
        .upsert(setting, { onConflict: 'key' })
        .select()

      if (error) throw error
      console.log(`   ✅ Created setting: ${setting.key}`)
    } catch (error) {
      console.log(`   ❌ Failed to create setting ${setting.key}:`, error)
    }
  }
}

async function setupMediaLibrary(supabase: any) {
  const mediaItems = [
    {
      name: 'hero-background',
      file_name: 'hero-bg.jpg',
      mime_type: 'image/jpeg',
      file_size: null,
      url: '/images/hero-background.jpg',
      alt_text: 'Community gathering sharing stories',
      category: 'backgrounds',
      tags: ['hero', 'community', 'storytelling'],
      usage: 'Hero section background image'
    },
    {
      name: 'platform-logo',
      file_name: 'logo.svg',
      mime_type: 'image/svg+xml',
      file_size: null,
      url: '/images/logo.svg',
      alt_text: 'Empathy Ledger logo',
      category: 'branding',
      tags: ['logo', 'branding'],
      usage: 'Main platform logo'
    },
    {
      name: 'security-icon',
      file_name: 'security.svg',
      mime_type: 'image/svg+xml',
      file_size: null,
      url: '/icons/security.svg',
      alt_text: 'Security and privacy icon',
      category: 'icons',
      tags: ['security', 'privacy', 'feature'],
      usage: 'Security feature illustration'
    }
  ]

  for (const media of mediaItems) {
    try {
      const { data, error } = await supabase
        .from('cms_media')
        .upsert(media, { onConflict: 'name' })
        .select()

      if (error) throw error
      console.log(`   ✅ Added media item: ${media.name}`)
    } catch (error) {
      console.log(`   ❌ Failed to add media ${media.name}:`, error)
    }
  }
}

// Run the setup
setupCMSFoundation().catch(console.error)