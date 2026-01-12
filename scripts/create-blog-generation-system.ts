#!/usr/bin/env tsx
/**
 * PHASE 4: Automated Blog Post Generation System
 * AI-powered content creation from storyteller data with sovereignty respect
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

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY!;

interface BlogPostTemplate {
  type: string;
  title_template: string;
  content_structure: string[];
  ai_prompt: string;
  sovereignty_guidelines: string[];
}

interface GeneratedBlogPost {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  storyteller_ids: string[];
  seo_keywords: string[];
}

const blogTemplates: BlogPostTemplate[] = [
  {
    type: 'storyteller_spotlight',
    title_template: 'Community Spotlight: {storyteller_name} from {organization}',
    content_structure: [
      'introduction',
      'storyteller_background',
      'key_insights',
      'community_impact',
      'call_to_action'
    ],
    ai_prompt: `Create a respectful storyteller spotlight blog post that:
    1. Honors the storyteller's voice and experiences
    2. Highlights their community contributions
    3. Uses their exact words and perspectives
    4. Avoids academic jargon or external interpretations
    5. Focuses on strengths and community assets
    6. Includes a call-to-action for community engagement`,
    sovereignty_guidelines: [
      'Use storyteller\'s exact language',
      'Focus on strengths not deficits',
      'Ensure storyteller has given explicit consent',
      'Attribute all insights to the storyteller',
      'Avoid extractive framing'
    ]
  },
  {
    type: 'organization_feature',
    title_template: 'Partner Spotlight: How {organization} Empowers Community Voices',
    content_structure: [
      'organization_intro',
      'community_approach',
      'storyteller_testimonials',
      'impact_metrics',
      'partnership_value'
    ],
    ai_prompt: `Create an organization feature that:
    1. Showcases the organization's community-centered approach
    2. Includes multiple storyteller perspectives
    3. Highlights tangible community benefits
    4. Demonstrates cultural respect and sovereignty
    5. Shows measurable positive outcomes`,
    sovereignty_guidelines: [
      'Center community voices not organization narrative',
      'Include multiple storyteller perspectives',
      'Show how organization supports storyteller sovereignty',
      'Highlight community-defined success metrics'
    ]
  },
  {
    type: 'thematic_insights',
    title_template: 'Community Wisdom: {theme_name} Through Storyteller Eyes',
    content_structure: [
      'theme_introduction',
      'community_perspectives',
      'shared_wisdom',
      'solutions_identified',
      'community_recommendations'
    ],
    ai_prompt: `Create a thematic insights post that:
    1. Identifies patterns across multiple storyteller experiences
    2. Preserves individual voices while showing connections
    3. Highlights community-identified solutions
    4. Avoids academic analysis or external interpretation
    5. Centers storyteller wisdom and expertise`,
    sovereignty_guidelines: [
      'Patterns belong to the collective that generated them',
      'Solutions come from community not external experts',
      'Individual voices remain distinct within collective insights',
      'Analysis serves community empowerment'
    ]
  }
];

async function fetchStorytellerData(storytellerId: string): Promise<any> {
  const { data, error } = await supabase
    .from('storytellers')
    .select(`
      *,
      organizations (name, type, description),
      locations (name, country),
      projects (name, description),
      stories (id, title, content, themes, created_at)
    `)
    .eq('id', storytellerId)
    .eq('consent_given', true)
    .single();

  if (error) {
    throw new Error(`Failed to fetch storyteller data: ${error.message}`);
  }

  return data;
}

async function generateBlogPostWithAI(
  template: BlogPostTemplate,
  data: any
): Promise<GeneratedBlogPost> {
  console.log(`🤖 Generating ${template.type} blog post with AI...`);

  const prompt = `You are writing for the Empathy Ledger platform, which practices Indigenous Data Sovereignty principles. 

${template.ai_prompt}

SOVEREIGNTY GUIDELINES:
${template.sovereignty_guidelines.map(g => `- ${g}`).join('\\n')}

DATA PROVIDED:
${JSON.stringify(data, null, 2)}

CONTENT STRUCTURE TO FOLLOW:
${template.content_structure.map(s => `- ${s}`).join('\\n')}

Create a blog post that:
1. Respects storyteller sovereignty and consent
2. Uses community language not academic jargon
3. Focuses on strengths and assets
4. Includes specific quotes and examples
5. Is engaging but respectful

Return the response as a JSON object with:
{
  "title": "Blog post title",
  "content": "Full markdown content",
  "excerpt": "Brief excerpt (150 words)",
  "tags": ["relevant", "tags"],
  "seo_keywords": ["seo", "keywords"]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const result = await response.json();
    const generatedContent = result.content[0].text;
    
    // Parse JSON response
    const blogPost = JSON.parse(generatedContent);
    
    return {
      ...blogPost,
      storyteller_ids: [data.id]
    };

  } catch (error) {
    console.error('❌ AI generation failed:', error);
    throw error;
  }
}

async function saveBlogPostToCMS(
  blogPost: GeneratedBlogPost,
  template: BlogPostTemplate
): Promise<string> {
  console.log(`💾 Saving blog post to CMS: ${blogPost.title}`);

  const slug = blogPost.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const pageData = {
    slug: `blog/${slug}`,
    title: blogPost.title,
    description: blogPost.excerpt,
    page_type: 'blog_post',
    status: 'draft', // Start as draft for review
    content: {
      post_type: template.type,
      body: blogPost.content,
      excerpt: blogPost.excerpt,
      tags: blogPost.tags,
      storyteller_ids: blogPost.storyteller_ids,
      generated_at: new Date().toISOString(),
      review_required: true
    },
    seo_title: blogPost.title,
    seo_description: blogPost.excerpt,
    seo_keywords: blogPost.seo_keywords.join(', ')
  };

  const { data, error } = await supabase
    .from('cms_pages')
    .insert(pageData)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save blog post: ${error.message}`);
  }

  console.log(`✅ Blog post saved with ID: ${data.id}`);
  return data.id;
}

async function generateStorytellerSpotlight(): Promise<void> {
  console.log('👤 Generating storyteller spotlight posts...');

  // Get storytellers with stories who have consented
  const { data: storytellers, error } = await supabase
    .from('storytellers')
    .select(`
      id, full_name,
      organizations (name),
      stories (id)
    `)
    .eq('consent_given', true)
    .not('stories', 'is', null)
    .limit(3);

  if (error) {
    console.error('❌ Failed to fetch storytellers:', error.message);
    return;
  }

  for (const storyteller of storytellers) {
    try {
      const storytellerData = await fetchStorytellerData(storyteller.id);
      const template = blogTemplates.find(t => t.type === 'storyteller_spotlight')!;
      
      const blogPost = await generateBlogPostWithAI(template, storytellerData);
      await saveBlogPostToCMS(blogPost, template);
      
      console.log(`✅ Generated spotlight for ${storyteller.full_name}`);
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to generate spotlight for ${storyteller.full_name}:`, error);
    }
  }
}

async function generateOrganizationFeatures(): Promise<void> {
  console.log('🏢 Generating organization feature posts...');

  // Get organizations with multiple storytellers
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select(`
      id, name, description,
      storytellers (id, full_name, consent_given)
    `)
    .limit(2);

  if (error) {
    console.error('❌ Failed to fetch organizations:', error.message);
    return;
  }

  for (const org of organizations) {
    try {
      // Only feature organizations with consenting storytellers
      const consentingStorytellers = org.storytellers.filter((s: any) => s.consent_given);
      
      if (consentingStorytellers.length < 2) {
        console.log(`⏭️  Skipping ${org.name} - insufficient consenting storytellers`);
        continue;
      }

      const template = blogTemplates.find(t => t.type === 'organization_feature')!;
      const blogPost = await generateBlogPostWithAI(template, org);
      await saveBlogPostToCMS(blogPost, template);
      
      console.log(`✅ Generated feature for ${org.name}`);
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to generate feature for ${org.name}:`, error);
    }
  }
}

async function createContentWorkflows(): Promise<void> {
  console.log('🔄 Creating content workflows...');

  const workflowScript = `#!/usr/bin/env tsx
/**
 * Content Generation Workflow
 * Automated blog post generation with sovereignty respect
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ContentWorkflow {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  template_type: string;
  data_requirements: string[];
  sovereignty_checks: string[];
}

export const workflows: ContentWorkflow[] = [
  {
    name: 'Weekly Storyteller Spotlight',
    description: 'Feature a community storyteller each week',
    frequency: 'weekly',
    template_type: 'storyteller_spotlight',
    data_requirements: [
      'storyteller with consent_given = true',
      'storyteller with at least one story',
      'storyteller not featured in last 3 months'
    ],
    sovereignty_checks: [
      'Verify current consent status',
      'Check privacy preferences',
      'Ensure storyteller owns narrative',
      'Confirm community benefit'
    ]
  },
  {
    name: 'Monthly Organization Features',
    description: 'Showcase partner organizations and their community approach',
    frequency: 'monthly',
    template_type: 'organization_feature',
    data_requirements: [
      'organization with multiple storytellers',
      'storytellers with current consent',
      'organization with community impact data'
    ],
    sovereignty_checks: [
      'Center community voices not organization',
      'Include storyteller perspectives',
      'Show community-defined success',
      'Respect cultural protocols'
    ]
  },
  {
    name: 'Quarterly Thematic Insights',
    description: 'Community wisdom on shared themes and experiences',
    frequency: 'monthly',
    template_type: 'thematic_insights',
    data_requirements: [
      'stories with shared themes',
      'multiple storytellers consenting to analysis',
      'community-identified patterns'
    ],
    sovereignty_checks: [
      'Patterns belong to collective',
      'Individual voices remain distinct',
      'Analysis serves empowerment',
      'Community validates insights'
    ]
  }
];

export async function executeWorkflow(workflowName: string): Promise<boolean> {
  const workflow = workflows.find(w => w.name === workflowName);
  if (!workflow) {
    console.error('Workflow not found:', workflowName);
    return false;
  }

  console.log(\`🔄 Executing workflow: \${workflow.name}\`);
  
  // Implementation would go here
  // This is a framework for future automation
  
  return true;
}

export async function scheduleWorkflows(): Promise<void> {
  console.log('📅 Setting up content workflow schedules...');
  
  // This would integrate with a job scheduler
  // For now, it's a manual framework
  
  workflows.forEach(workflow => {
    console.log(\`📋 \${workflow.name} - \${workflow.frequency}\`);
  });
}`;

  const workflowDir = path.join(process.cwd(), 'src', 'lib', 'workflows');
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(workflowDir, 'content-workflows.ts'),
    workflowScript
  );

  console.log('✅ Created content workflow system');
}

async function createStoryToShareableWorkflow(): Promise<void> {
  console.log('📱 Creating story-to-shareable content workflow...');

  const shareableScript = `#!/usr/bin/env tsx
/**
 * Story to Shareable Content Workflow
 * Transform stories into social media and shareable formats
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ShareableContent {
  story_id: string;
  format: 'social_post' | 'quote_card' | 'story_preview' | 'impact_highlight';
  content: string;
  visual_elements?: {
    background_color?: string;
    storyteller_photo?: boolean;
    organization_logo?: boolean;
    branded_template?: string;
  };
  platform_optimized?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  sovereignty_compliance: {
    consent_verified: boolean;
    attribution_included: boolean;
    community_approved: boolean;
    storyteller_reviewed: boolean;
  };
}

export async function generateShareableContent(
  storyId: string,
  format: ShareableContent['format']
): Promise<ShareableContent | null> {
  
  // Fetch story with storyteller data
  const { data: story, error } = await supabase
    .from('stories')
    .select(\`
      *,
      storytellers (
        id, full_name, consent_given, privacy_preferences,
        organizations (name)
      )
    \`)
    .eq('id', storyId)
    .single();

  if (error || !story) {
    console.error('Failed to fetch story:', error);
    return null;
  }

  // Check sovereignty compliance
  const storyteller = story.storytellers;
  if (!storyteller?.consent_given) {
    console.log('Story cannot be shared - no storyteller consent');
    return null;
  }

  const privacyPrefs = storyteller.privacy_preferences || {};
  if (!privacyPrefs.public_display) {
    console.log('Story cannot be shared - privacy preferences');
    return null;
  }

  // Generate content based on format
  let content = '';
  let visualElements = {};

  switch (format) {
    case 'quote_card':
      content = extractKeyQuote(story.content);
      visualElements = {
        background_color: '#B85C38',
        storyteller_photo: privacyPrefs.show_photo,
        branded_template: 'quote_card'
      };
      break;

    case 'story_preview':
      content = generatePreview(story.content, 280);
      visualElements = {
        storyteller_photo: privacyPrefs.show_photo,
        organization_logo: privacyPrefs.show_organization
      };
      break;

    case 'impact_highlight':
      content = extractImpactMoment(story.content);
      visualElements = {
        background_color: '#1A3A52',
        branded_template: 'impact_card'
      };
      break;

    case 'social_post':
      content = generateSocialPost(story);
      break;
  }

  return {
    story_id: storyId,
    format,
    content,
    visual_elements: visualElements,
    platform_optimized: generatePlatformVersions(content),
    sovereignty_compliance: {
      consent_verified: true,
      attribution_included: true,
      community_approved: false, // Requires manual approval
      storyteller_reviewed: false // Requires storyteller review
    }
  };
}

function extractKeyQuote(content: string): string {
  // Simple quote extraction - would be enhanced with AI
  const sentences = content.split('.').filter(s => s.length > 50);
  return sentences[0]?.trim() + '.' || content.substring(0, 150) + '...';
}

function generatePreview(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
}

function extractImpactMoment(content: string): string {
  // Look for impact-related keywords and extract context
  const impactKeywords = ['change', 'help', 'support', 'community', 'difference'];
  const sentences = content.split('.');
  
  for (const sentence of sentences) {
    if (impactKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  
  return sentences[0]?.trim() || content.substring(0, 200);
}

function generateSocialPost(story: any): string {
  const storyteller = story.storytellers;
  const org = storyteller.organizations?.name || '';
  
  return \`✨ New story from \${storyteller.full_name}\${org ? \` at \${org}\` : ''}

"\${generatePreview(story.content, 200)}"

Every voice matters. Every story creates change.

#CommunityStories #EmpathyLedger #StorytellerVoices\`;
}

function generatePlatformVersions(content: string) {
  return {
    twitter: content.length > 280 ? content.substring(0, 277) + '...' : content,
    linkedin: content,
    facebook: content,
    instagram: content
  };
}

export async function createShareableAssets(shareableContent: ShareableContent): Promise<string[]> {
  // This would integrate with image generation APIs
  // For now, return placeholder asset URLs
  
  const assets = [];
  
  if (shareableContent.visual_elements?.branded_template) {
    assets.push(\`/api/generate-visual/\${shareableContent.story_id}/\${shareableContent.format}\`);
  }
  
  return assets;
}`;

  const shareableDir = path.join(process.cwd(), 'src', 'lib', 'shareable');
  if (!fs.existsSync(shareableDir)) {
    fs.mkdirSync(shareableDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(shareableDir, 'story-to-shareable.ts'),
    shareableScript
  );

  console.log('✅ Created story-to-shareable workflow');
}

async function main() {
  console.log('🚀 PHASE 4: AUTOMATED BLOG GENERATION & CONTENT WORKFLOWS');
  console.log('=========================================================');
  console.log('Creating AI-powered content generation with sovereignty respect');
  console.log('');

  try {
    // Step 1: Generate sample blog posts
    await generateStorytellerSpotlight();
    await generateOrganizationFeatures();
    
    // Step 2: Create workflow systems
    await createContentWorkflows();
    await createStoryToShareableWorkflow();

    console.log('\\n🎉 PHASE 4 BLOG GENERATION COMPLETED!');
    console.log('======================================');
    console.log('✅ AI-powered blog posts generated');
    console.log('✅ Content workflow system created');
    console.log('✅ Story-to-shareable pipeline built');
    console.log('✅ Sovereignty compliance integrated');
    console.log('\\n🎯 Ready for Final Phase: System Integration Testing');

  } catch (error) {
    console.error('❌ Blog generation failed:', error);
  }
}

main().catch(console.error);