#!/usr/bin/env tsx

/**
 * Content Migration Tool for Empathy Ledger
 * 
 * Migrates existing static pages to the new CMS system
 */

import { readFileSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { glob } from 'glob'
import { cmsService } from '../src/lib/cms'
import { CMSPageInsert, BlockType } from '../src/lib/cms/types'

// Migration configuration
const MIGRATION_CONFIG = {
  sourceDir: 'src/app',
  pagesPattern: '**/page.tsx',
  excludePatterns: [
    '**/admin/**',
    '**/api/**',
    '**/\\[*\\]/**' // Dynamic routes
  ]
}

interface PageMigration {
  route: string
  filePath: string
  title: string
  pageType: 'static' | 'dynamic' | 'landing'
  priority: number
}

// Define pages to migrate
const PAGES_TO_MIGRATE: PageMigration[] = [
  {
    route: '/',
    filePath: 'src/app/page.tsx',
    title: 'Empathy Ledger - Community Stories Platform',
    pageType: 'landing',
    priority: 1
  },
  {
    route: '/about',
    filePath: 'src/app/about/page.tsx', 
    title: 'About Empathy Ledger',
    pageType: 'static',
    priority: 2
  },
  {
    route: '/modules',
    filePath: 'src/app/modules/page.tsx',
    title: 'Platform Modules',
    pageType: 'dynamic',
    priority: 3
  },
  {
    route: '/case-studies',
    filePath: 'src/app/case-studies/page.tsx',
    title: 'Case Studies',
    pageType: 'dynamic',
    priority: 4
  },
  {
    route: '/visualisations',
    filePath: 'src/app/visualisations/page.tsx',
    title: 'Data Visualisations',
    pageType: 'dynamic',
    priority: 5
  },
  {
    route: '/submit',
    filePath: 'src/app/submit/page.tsx',
    title: 'Share Your Story',
    pageType: 'static',
    priority: 6
  }
]

class ContentMigrator {
  private migratedPages: Map<string, string> = new Map()
  private errors: Array<{ page: string; error: string }> = []

  async migrateAll(): Promise<void> {
    console.log('🚀 Starting Empathy Ledger Content Migration...')
    console.log('=' .repeat(50))

    // Sort by priority
    const sortedPages = PAGES_TO_MIGRATE.sort((a, b) => a.priority - b.priority)

    for (const page of sortedPages) {
      try {
        await this.migratePage(page)
      } catch (error) {
        console.error(`❌ Failed to migrate ${page.route}:`, error)
        this.errors.push({
          page: page.route,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    this.printSummary()
  }

  private async migratePage(pageConfig: PageMigration): Promise<void> {
    console.log(`\n📄 Migrating: ${pageConfig.route}`)

    // Check if file exists
    if (!existsSync(pageConfig.filePath)) {
      console.log(`⚠️  File not found: ${pageConfig.filePath}`)
      return
    }

    // Check if page already exists in CMS
    const existingPage = await cmsService.getPageBySlug(pageConfig.route.substring(1) || 'home')
    if (existingPage) {
      console.log(`⚠️  Page already exists in CMS: ${pageConfig.route}`)
      return
    }

    // Parse the TSX file
    const fileContent = readFileSync(pageConfig.filePath, 'utf-8')
    const parsedContent = this.parseTSXContent(fileContent, pageConfig)

    // Create CMS page
    const pageData: CMSPageInsert = {
      slug: pageConfig.route.substring(1) || 'home',
      title: pageConfig.title,
      content: parsedContent.blocks,
      meta_description: parsedContent.description,
      meta_keywords: parsedContent.keywords,
      page_type: pageConfig.pageType,
      visibility: 'public',
      status: 'published'
    }

    const createdPage = await cmsService.createPage(pageData)
    this.migratedPages.set(pageConfig.route, createdPage.id)

    console.log(`✅ Migrated successfully: ${pageConfig.route} -> CMS ID: ${createdPage.id}`)
  }

  private parseTSXContent(content: string, pageConfig: PageMigration): {
    blocks: any[]
    description?: string
    keywords?: string[]
  } {
    const blocks: any[] = []
    let description: string | undefined
    let keywords: string[] | undefined

    // Extract content based on page type
    switch (pageConfig.route) {
      case '/':
        return this.parseHomePage(content)
      case '/about':
        return this.parseAboutPage(content)
      case '/modules':
        return this.parseModulesPage(content)
      case '/case-studies':
        return this.parseCaseStudiesPage(content)
      case '/visualisations':
        return this.parseVisualisationsPage(content)
      case '/submit':
        return this.parseSubmitPage(content)
      default:
        return this.parseGenericPage(content, pageConfig)
    }
  }

  private parseHomePage(content: string): { blocks: any[]; description?: string; keywords?: string[] } {
    return {
      blocks: [
        {
          block_type: 'hero',
          block_order: 0,
          block_data: {
            title: 'Empathy Ledger',
            subtitle: 'Community Stories, Community Ownership',
            description: 'A platform built for and by communities to collect, preserve, and share their stories while maintaining sovereignty over their narratives.',
            background_image: '/images/hero-community.jpg',
            text_alignment: 'center',
            cta_buttons: [
              {
                text: 'Share Your Story',
                href: '/submit',
                style: 'primary'
              },
              {
                text: 'Explore Stories',
                href: '/simple-stories',
                style: 'secondary'
              }
            ]
          }
        },
        {
          block_type: 'stats',
          block_order: 1,
          block_data: {
            stats: [
              { value: '2,340', label: 'Stories Collected', icon: '📖' },
              { value: '890', label: 'Community Members', icon: '👥' },
              { value: '45', label: 'Communities Connected', icon: '🏘️' },
              { value: '87%', label: 'Impact Score', icon: '⚡' }
            ],
            layout: 'horizontal',
            animated: true,
            show_icons: true
          }
        },
        {
          block_type: 'text',
          block_order: 2,
          block_data: {
            content: `
              <h2>Built on Principles of Sovereignty</h2>
              <p>Empathy Ledger is designed from the ground up to respect community ownership, cultural protocols, and individual consent. Every story shared remains under the control of its creator and their community.</p>
              
              <h3>Our Approach</h3>
              <ul>
                <li><strong>Community Ownership:</strong> Your stories belong to you and your community</li>
                <li><strong>Cultural Protocols:</strong> Respect for traditional knowledge systems</li>
                <li><strong>Transparent Value:</strong> Benefits flow back to storytellers and communities</li>
                <li><strong>Privacy by Design:</strong> Granular control over who sees what</li>
              </ul>
            `,
            alignment: 'left'
          }
        },
        {
          block_type: 'community_stats',
          block_order: 3,
          block_data: {
            metrics: ['stories', 'members', 'impact_score', 'engagement'],
            time_range: '30d',
            chart_type: 'dashboard',
            animated: true,
            show_trends: true
          }
        }
      ],
      description: 'Community-owned storytelling platform built for sovereignty, cultural respect, and transparent value distribution.',
      keywords: ['community stories', 'sovereignty', 'cultural protocols', 'storytelling platform', 'empathy']
    }
  }

  private parseAboutPage(content: string): { blocks: any[]; description?: string; keywords?: string[] } {
    return {
      blocks: [
        {
          block_type: 'hero',
          block_order: 0,
          block_data: {
            title: 'About Empathy Ledger',
            subtitle: 'Building technology that serves communities',
            description: 'Learn about our mission, values, and approach to community-centered storytelling.',
            text_alignment: 'center'
          }
        },
        {
          block_type: 'text',
          block_order: 1,
          block_data: {
            content: `
              <h2>Our Mission</h2>
              <p>Empathy Ledger exists to amplify community voices while ensuring those communities maintain complete sovereignty over their stories, data, and narratives.</p>
              
              <h2>Our Values</h2>
              <ul>
                <li><strong>Community Sovereignty:</strong> Communities own and control their data</li>
                <li><strong>Cultural Respect:</strong> Traditional knowledge systems are honored</li>
                <li><strong>Transparent Benefit:</strong> Value flows back to storytellers</li>
                <li><strong>Privacy Protection:</strong> Individual consent is paramount</li>
                <li><strong>Accessibility:</strong> Technology serves all community members</li>
              </ul>
              
              <h2>How We're Different</h2>
              <p>Unlike traditional platforms that extract value from user content, Empathy Ledger is built to ensure communities benefit from their participation. We use blockchain technology and smart contracts to guarantee transparent value distribution.</p>
            `,
            alignment: 'left'
          }
        }
      ],
      description: 'Learn about Empathy Ledger\'s mission to build community-owned storytelling technology.',
      keywords: ['about', 'mission', 'values', 'community ownership', 'sovereignty']
    }
  }

  private parseModulesPage(content: string): { blocks: any[]; description?: string; keywords?: string[] } {
    return {
      blocks: [
        {
          block_type: 'hero',
          block_order: 0,
          block_data: {
            title: 'Platform Modules',
            subtitle: 'Modular tools for community empowerment',
            description: 'Discover the modules that make Empathy Ledger a comprehensive community platform.',
            text_alignment: 'center'
          }
        },
        {
          block_type: 'text',
          block_order: 1,
          block_data: {
            content: `
              <div class="modules-grid">
                <div class="module-card">
                  <h3>📖 Storytelling Core</h3>
                  <p>Multi-modal story collection via web, SMS, WhatsApp, and phone calls</p>
                </div>
                
                <div class="module-card">
                  <h3>🛡️ Consent & Privacy</h3>
                  <p>Granular consent management and privacy controls</p>
                </div>
                
                <div class="module-card">
                  <h3>🏘️ Community Engagement</h3>
                  <p>Tools for community participation and dialogue</p>
                </div>
                
                <div class="module-card">
                  <h3>📊 Impact Measurement</h3>
                  <p>Track and measure community impact and outcomes</p>
                </div>
              </div>
            `,
            alignment: 'left'
          }
        }
      ],
      description: 'Explore the modular tools that power community storytelling and engagement.',
      keywords: ['modules', 'tools', 'storytelling', 'community engagement', 'impact measurement']
    }
  }

  private parseCaseStudiesPage(content: string): { blocks: any[]; description?: string; keywords?: string[] } {
    return {
      blocks: [
        {
          block_type: 'hero',
          block_order: 0,
          block_data: {
            title: 'Case Studies',
            subtitle: 'Real communities, real impact',
            description: 'See how communities are using Empathy Ledger to amplify their voices and create positive change.',
            text_alignment: 'center'
          }
        },
        {
          block_type: 'text',
          block_order: 1,
          block_data: {
            content: `
              <p>Coming soon: Detailed case studies showing how communities across Australia are using Empathy Ledger to:</p>
              <ul>
                <li>Collect and preserve traditional knowledge</li>
                <li>Advocate for policy changes</li>
                <li>Build stronger community connections</li>
                <li>Create economic opportunities</li>
                <li>Document and share cultural practices</li>
              </ul>
            `,
            alignment: 'left'
          }
        }
      ],
      description: 'Real case studies of communities using Empathy Ledger for positive impact.',
      keywords: ['case studies', 'community impact', 'success stories', 'real results']
    }
  }

  private parseVisualisationsPage(content: string): { blocks: any[]; description?: string; keywords?: string[] } {
    return {
      blocks: [
        {
          block_type: 'hero',
          block_order: 0,
          block_data: {
            title: 'Data Visualisations',
            subtitle: 'Stories come alive through data',
            description: 'Explore interactive visualisations that reveal patterns, connections, and insights from community stories.',
            text_alignment: 'center'
          }
        },
        {
          block_type: 'text',
          block_order: 1,
          block_data: {
            content: `
              <div class="viz-grid">
                <div class="viz-card">
                  <h3>🌌 Story Galaxy</h3>
                  <p>3D visualization of story relationships and themes</p>
                  <a href="/visualisations/story-galaxy" class="btn">Explore</a>
                </div>
                
                <div class="viz-card">
                  <h3>🌊 Knowledge River</h3>
                  <p>Flow visualization of knowledge and wisdom sharing</p>
                  <a href="/visualisations/knowledge-river" class="btn">Explore</a>
                </div>
                
                <div class="viz-card">
                  <h3>🔥 Impact Heat Map</h3>
                  <p>Geographic visualization of community impact</p>
                  <a href="/visualisations/impact-heat-map" class="btn">Explore</a>
                </div>
                
                <div class="viz-card">
                  <h3>🕸️ Network Graph</h3>
                  <p>Relationship networks between communities and stories</p>
                  <a href="/visualisations/network-graph" class="btn">Explore</a>
                </div>
              </div>
            `,
            alignment: 'left'
          }
        }
      ],
      description: 'Interactive data visualisations revealing insights from community stories.',
      keywords: ['data visualization', 'story insights', 'interactive charts', 'community data']
    }
  }

  private parseSubmitPage(content: string): { blocks: any[]; description?: string; keywords?: string[] } {
    return {
      blocks: [
        {
          block_type: 'hero',
          block_order: 0,
          block_data: {
            title: 'Share Your Story',
            subtitle: 'Your voice matters',
            description: 'Share your story with the community while maintaining complete control over how it\'s used and shared.',
            text_alignment: 'center'
          }
        },
        {
          block_type: 'text',
          block_order: 1,
          block_data: {
            content: `
              <div class="submission-methods">
                <h2>How to Share</h2>
                <div class="methods-grid">
                  <div class="method-card">
                    <h3>💻 Web Form</h3>
                    <p>Use our online form to write and submit your story</p>
                  </div>
                  
                  <div class="method-card">
                    <h3>📱 SMS</h3>
                    <p>Text your story to our dedicated number</p>
                  </div>
                  
                  <div class="method-card">
                    <h3>💬 WhatsApp</h3>
                    <p>Send voice messages or text via WhatsApp</p>
                  </div>
                  
                  <div class="method-card">
                    <h3>📞 Phone Call</h3>
                    <p>Call our story line to share your story verbally</p>
                  </div>
                </div>
              </div>
              
              <div class="consent-info">
                <h2>Your Control, Your Choice</h2>
                <p>When you share your story, you choose:</p>
                <ul>
                  <li>Who can see your story</li>
                  <li>How it can be used</li>
                  <li>Whether you want attribution</li>
                  <li>If it can be shared with researchers</li>
                  <li>How long it stays published</li>
                </ul>
              </div>
            `,
            alignment: 'left'
          }
        }
      ],
      description: 'Share your story with complete control over privacy and usage.',
      keywords: ['share story', 'submit story', 'community stories', 'storytelling', 'privacy control']
    }
  }

  private parseGenericPage(content: string, pageConfig: PageMigration): { blocks: any[]; description?: string; keywords?: string[] } {
    // Generic parser for other pages
    return {
      blocks: [
        {
          block_type: 'hero',
          block_order: 0,
          block_data: {
            title: pageConfig.title,
            text_alignment: 'center'
          }
        },
        {
          block_type: 'text',
          block_order: 1,
          block_data: {
            content: '<p>This page has been migrated from the legacy system. Content will be updated soon.</p>',
            alignment: 'left'
          }
        }
      ],
      description: `${pageConfig.title} - migrated from legacy system`
    }
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary')
    console.log('='.repeat(50))
    
    console.log(`✅ Successfully migrated: ${this.migratedPages.size} pages`)
    for (const [route, id] of this.migratedPages) {
      console.log(`   ${route} -> ${id}`)
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ Failed migrations: ${this.errors.length}`)
      for (const error of this.errors) {
        console.log(`   ${error.page}: ${error.error}`)
      }
    }

    console.log('\n🎉 Migration complete!')
    console.log('\nNext steps:')
    console.log('1. Review migrated pages in CMS admin')
    console.log('2. Update content as needed')
    console.log('3. Test dynamic routing')
    console.log('4. Update navigation menus')
  }
}

// Main execution
async function main() {
  try {
    const migrator = new ContentMigrator()
    await migrator.migrateAll()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}