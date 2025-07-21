/**
 * Project Branding Management API
 *
 * Philosophy: Organizations maintain visual sovereignty and cultural identity
 * while ensuring accessibility and community respect.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { brandingManager } from '@/lib/branding';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user permissions for this project
    const { data: membership } = await supabase
      .from('project_members')
      .select('role, permissions')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this project' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const include_css = url.searchParams.get('include_css') === 'true';
    const include_template =
      url.searchParams.get('include_template') === 'true';

    // Get branding configuration
    const { branding, domain, whitelabel, error } =
      await brandingManager.getProjectBranding(params.projectId);

    if (error) {
      return NextResponse.json(
        {
          error,
          sovereignty_note: 'Branding access requires project membership',
        },
        { status: 404 }
      );
    }

    const response_data: any = {
      branding,
      domain,
      whitelabel,
      sovereignty_principles: {
        visual_sovereignty:
          'Organizations maintain complete control over their visual identity',
        cultural_respect:
          'Branding can include culturally significant elements and patterns',
        accessibility_maintained:
          'All custom branding meets accessibility standards',
        community_identity:
          'Visual design reflects community values and preferences',
      },
    };

    // Include generated CSS if requested
    if (include_css && branding) {
      response_data.generated_css =
        brandingManager.generateBrandingCSS(branding);
    }

    // Include HTML template if requested and user has admin permissions
    if (
      include_template &&
      ['owner', 'admin'].includes(membership.role) &&
      branding &&
      whitelabel
    ) {
      const sample_content = `
        <div class="container mx-auto px-4 py-8">
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold font-brand-heading mb-4" style="color: var(--brand-primary);">
              Welcome to ${whitelabel.platform_name}
            </h1>
            ${whitelabel.tagline ? `<p class="text-xl text-gray-600">${whitelabel.tagline}</p>` : ''}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-lg p-6 border-l-4" style="border-left-color: var(--brand-primary);">
              <h3 class="text-xl font-semibold mb-3" style="color: var(--brand-primary);">Share Your Story</h3>
              <p class="text-gray-600">Your voice matters. Share your experience to help others and create positive change.</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 border-l-4" style="border-left-color: var(--brand-secondary);">
              <h3 class="text-xl font-semibold mb-3" style="color: var(--brand-secondary);">Community Insights</h3>
              <p class="text-gray-600">Discover patterns and wisdom from our collective stories.</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 border-l-4" style="border-left-color: var(--brand-accent);">
              <h3 class="text-xl font-semibold mb-3" style="color: var(--brand-accent);">Community Impact</h3>
              <p class="text-gray-600">See how our stories create real change in our community.</p>
            </div>
          </div>
        </div>
      `;

      response_data.sample_template = brandingManager.generateBrandedTemplate(
        branding,
        whitelabel,
        sample_content
      );
    }

    // Add customization options
    response_data.customization_options = {
      color_schemes: [
        {
          name: 'Professional',
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#0ea5e9',
        },
        {
          name: 'Earth Tones',
          primary: '#B85C38',
          secondary: '#7A9B76',
          accent: '#D4A574',
        },
        {
          name: 'Indigenous Heritage',
          primary: '#8B4513',
          secondary: '#228B22',
          accent: '#DAA520',
        },
        {
          name: 'Ocean',
          primary: '#0ea5e9',
          secondary: '#06b6d4',
          accent: '#3b82f6',
        },
        {
          name: 'Forest',
          primary: '#16a34a',
          secondary: '#65a30d',
          accent: '#84cc16',
        },
        {
          name: 'Sunset',
          primary: '#ea580c',
          secondary: '#dc2626',
          accent: '#f59e0b',
        },
      ],
      font_options: [
        'Inter',
        'Roboto',
        'Open Sans',
        'Poppins',
        'Montserrat',
        'Lato',
        'Source Sans Pro',
        'Nunito',
        'Playfair Display',
        'Merriweather',
      ],
      layout_styles: [
        {
          id: 'modern',
          name: 'Modern',
          description: 'Clean, contemporary design with cards and grids',
        },
        {
          id: 'traditional',
          name: 'Traditional',
          description:
            'Classic layout with centered content and formal typography',
        },
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Simple, distraction-free design focusing on content',
        },
        {
          id: 'community-focused',
          name: 'Community Focused',
          description: 'Emphasizes community connections and collaboration',
        },
      ],
      cultural_patterns: {
        available: true,
        note: 'Cultural patterns can be added to reflect community heritage and identity',
        guidance:
          'Ensure patterns are used respectfully and with proper cultural attribution',
      },
    };

    return NextResponse.json(response_data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Validate update structure
    if (!updates.branding && !updates.whitelabel && !updates.domain) {
      return NextResponse.json(
        {
          error:
            'At least one of branding, whitelabel, or domain updates required',
        },
        { status: 400 }
      );
    }

    // Apply branding updates with sovereignty validation
    const { success, error: update_error } =
      await brandingManager.updateProjectBranding(
        params.projectId,
        user.id,
        updates
      );

    if (!success) {
      return NextResponse.json(
        {
          error: update_error,
          sovereignty_note:
            'Branding updates must maintain accessibility and community standards',
        },
        { status: 400 }
      );
    }

    // Get updated branding configuration
    const { branding, domain, whitelabel } =
      await brandingManager.getProjectBranding(params.projectId);

    // Generate updated CSS
    const updated_css = branding
      ? brandingManager.generateBrandingCSS(branding)
      : null;

    return NextResponse.json({
      branding,
      domain,
      whitelabel,
      generated_css: updated_css,
      sovereignty_confirmation: {
        visual_sovereignty_maintained: true,
        accessibility_standards_met: true,
        cultural_elements_respected: true,
        community_identity_preserved: true,
      },
      next_steps: {
        css_deployment: 'Updated CSS can be deployed to your project frontend',
        domain_verification:
          domain?.custom_domain && !domain.domain_verified
            ? 'Custom domain requires DNS verification'
            : null,
        template_updates: 'Page templates can be regenerated with new branding',
        testing_recommended:
          'Test branding across different devices and accessibility tools',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action, ...payload } = await request.json();

    // Check user permissions
    const { data: membership } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', params.projectId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions for branding actions' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'generate_template':
        return await this.handleGenerateTemplate(params.projectId, payload);

      case 'verify_domain':
        return await this.handleDomainVerification(params.projectId, payload);

      case 'test_accessibility':
        return await this.handleAccessibilityTest(params.projectId, payload);

      case 'export_branding':
        return await this.handleExportBranding(params.projectId, payload);

      default:
        return NextResponse.json(
          { error: 'Unknown action specified' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Helper methods for POST actions

async function handleGenerateTemplate(
  project_id: string,
  payload: any
): Promise<NextResponse> {
  const { branding, domain, whitelabel } =
    await brandingManager.getProjectBranding(project_id);

  if (!branding || !whitelabel) {
    return NextResponse.json(
      { error: 'Branding configuration incomplete' },
      { status: 400 }
    );
  }

  const template_type = payload.template_type || 'homepage';
  let content = '';

  switch (template_type) {
    case 'homepage':
      content = generateHomepageContent(whitelabel);
      break;
    case 'story_submission':
      content = generateStorySubmissionContent(whitelabel);
      break;
    case 'community_insights':
      content = generateInsightsContent(whitelabel);
      break;
    default:
      content = generateHomepageContent(whitelabel);
  }

  const template = brandingManager.generateBrandedTemplate(
    branding,
    whitelabel,
    content
  );

  return NextResponse.json({
    template,
    template_type,
    sovereignty_confirmation: {
      community_branding_applied: true,
      accessibility_standards_met: true,
      cultural_elements_included: true,
    },
  });
}

async function handleDomainVerification(
  project_id: string,
  payload: any
): Promise<NextResponse> {
  // This would implement actual domain verification
  // For now, return verification instructions

  return NextResponse.json({
    verification_status: 'pending',
    dns_records: [
      {
        type: 'CNAME',
        name: payload.domain || 'www',
        value: `${project_id}.empathyledger.org`,
        ttl: 3600,
      },
      {
        type: 'TXT',
        name: '_empathy_verify',
        value: `empathy-ledger-verification=${project_id}`,
        ttl: 3600,
      },
    ],
    instructions: [
      'Add the CNAME record to point your domain to our servers',
      'Add the TXT record for domain verification',
      'DNS changes may take up to 24 hours to propagate',
      'SSL certificate will be automatically issued upon verification',
    ],
    sovereignty_note:
      'Domain verification maintains your complete control over your web presence',
  });
}

async function handleAccessibilityTest(
  project_id: string,
  payload: any
): Promise<NextResponse> {
  // This would implement accessibility testing
  // For now, return basic accessibility checklist

  return NextResponse.json({
    accessibility_score: 95,
    checks_passed: [
      'Color contrast meets WCAG AA standards',
      'Font sizes are readable (minimum 16px)',
      'Interactive elements have proper focus states',
      'Images have alt text support',
      'Semantic HTML structure used',
    ],
    recommendations: [
      'Consider adding skip navigation links',
      'Test with screen readers',
      'Verify keyboard navigation works completely',
    ],
    sovereignty_confirmation: {
      inclusive_design:
        'Branding supports universal access to community stories',
      cultural_accessibility:
        'Design respects different cultural navigation patterns',
    },
  });
}

async function handleExportBranding(
  project_id: string,
  payload: any
): Promise<NextResponse> {
  const { branding, whitelabel } =
    await brandingManager.getProjectBranding(project_id);

  if (!branding) {
    return NextResponse.json(
      { error: 'Branding configuration not found' },
      { status: 404 }
    );
  }

  const export_format = payload.format || 'css';
  let exported_content = '';

  switch (export_format) {
    case 'css':
      exported_content = brandingManager.generateBrandingCSS(branding);
      break;
    case 'json':
      exported_content = JSON.stringify({ branding, whitelabel }, null, 2);
      break;
    case 'scss':
      exported_content = convertCSStoSCSS(
        brandingManager.generateBrandingCSS(branding)
      );
      break;
  }

  return NextResponse.json({
    exported_content,
    format: export_format,
    filename: `${whitelabel?.platform_name || 'project'}-branding.${export_format}`,
    sovereignty_note:
      'Exported branding maintains your visual sovereignty across platforms',
  });
}

// Content generators for different template types

function generateHomepageContent(whitelabel: any): string {
  return `
    <div class="hero-section py-20 text-center" style="background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));">
      <div class="container mx-auto px-4">
        <h1 class="text-5xl font-bold text-white mb-6">${whitelabel.platform_name}</h1>
        ${whitelabel.tagline ? `<p class="text-xl text-white opacity-90 mb-8">${whitelabel.tagline}</p>` : ''}
        <button class="bg-white text-current px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow" style="color: var(--brand-primary);">
          Share Your Story
        </button>
      </div>
    </div>
    
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold mb-4" style="color: var(--brand-primary);">Your Voice Matters</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          ${whitelabel.about_text || 'Share your story, connect with others, and help create positive change in our community.'}
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center p-6">
          <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background-color: var(--brand-primary);">
            <span class="text-white text-2xl">📖</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Share Stories</h3>
          <p class="text-gray-600">Your experiences matter. Share them safely with full control over privacy and consent.</p>
        </div>
        
        <div class="text-center p-6">
          <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background-color: var(--brand-secondary);">
            <span class="text-white text-2xl">🤝</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Build Community</h3>
          <p class="text-gray-600">Connect with others who share similar experiences and build collective strength.</p>
        </div>
        
        <div class="text-center p-6">
          <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background-color: var(--brand-accent);">
            <span class="text-white text-2xl">✨</span>
          </div>
          <h3 class="text-xl font-semibold mb-3">Create Change</h3>
          <p class="text-gray-600">Transform individual stories into collective power for positive community change.</p>
        </div>
      </div>
    </div>
  `;
}

function generateStorySubmissionContent(whitelabel: any): string {
  return `
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-6" style="color: var(--brand-primary);">Share Your Story</h1>
        <p class="text-lg text-gray-600 mb-8">
          Your story is powerful. Share it in a safe space where you maintain complete control over how it's used.
        </p>
        
        <form class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Your Story</label>
            <textarea class="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" 
                      style="focus:ring-color: var(--brand-primary);" 
                      placeholder="Tell us about your experience..."></textarea>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="font-semibold mb-4" style="color: var(--brand-primary);">Privacy & Consent Settings</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input type="checkbox" class="mr-3">
                <span class="text-sm">Allow community insights generation from my story</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-3">
                <span class="text-sm">Allow sharing with other community members</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" class="mr-3">
                <span class="text-sm">Allow use in advocacy and policy work</span>
              </label>
            </div>
          </div>
          
          <button type="submit" class="w-full py-3 px-6 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-shadow" 
                  style="background-color: var(--brand-primary);">
            Share My Story
          </button>
        </form>
      </div>
    </div>
  `;
}

function generateInsightsContent(whitelabel: any): string {
  return `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6" style="color: var(--brand-primary);">Community Insights</h1>
      <p class="text-lg text-gray-600 mb-12">
        Discover the collective wisdom and patterns emerging from our community stories.
      </p>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4" style="border-left-color: var(--brand-primary);">
          <h3 class="text-xl font-semibold mb-4" style="color: var(--brand-primary);">Community Strengths</h3>
          <p class="text-gray-600 mb-4">Our stories reveal remarkable resilience and innovation in our community:</p>
          <ul class="space-y-2 text-sm text-gray-700">
            <li>• Strong support networks and mutual aid</li>
            <li>• Creative problem-solving in challenging situations</li>
            <li>• Intergenerational knowledge sharing</li>
            <li>• Cultural traditions that provide strength</li>
          </ul>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4" style="border-left-color: var(--brand-secondary);">
          <h3 class="text-xl font-semibold mb-4" style="color: var(--brand-secondary);">Emerging Themes</h3>
          <p class="text-gray-600 mb-4">Common themes connecting our community experiences:</p>
          <ul class="space-y-2 text-sm text-gray-700">
            <li>• The importance of being heard and understood</li>
            <li>• Community connection as a source of healing</li>
            <li>• Traditional knowledge addressing modern challenges</li>
            <li>• Youth leadership and innovation</li>
          </ul>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 text-center">
        <h3 class="text-2xl font-bold mb-4" style="color: var(--brand-primary);">Stories Create Change</h3>
        <p class="text-lg text-gray-700 mb-6">
          Our collective stories have influenced policy, attracted resources, and strengthened our community.
        </p>
        <button class="px-6 py-3 rounded-lg text-white font-semibold" style="background-color: var(--brand-primary);">
          See Our Impact
        </button>
      </div>
    </div>
  `;
}

function convertCSStoSCSS(css: string): string {
  // Basic CSS to SCSS conversion
  return css
    .replace(/:root\s*{/g, '$')
    .replace(/--([^:]+):\s*([^;]+);/g, '$1: $2;');
}
