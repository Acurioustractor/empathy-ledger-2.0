/**
 * Project Branding and White-Label System
 *
 * Philosophy: Organizations maintain visual sovereignty and cultural identity
 * while building on the empathy ledger foundation.
 */

import { createClient } from './supabase';

export interface BrandingConfig {
  // Core visual identity
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;

  // Typography
  font_family: string;
  heading_font?: string;
  body_font?: string;

  // Logo and imagery
  logo_url?: string;
  favicon_url?: string;
  hero_image_url?: string;
  background_pattern?: string;

  // Custom styling
  custom_css?: string;
  border_radius?: string;
  shadow_style?: string;

  // Cultural design elements
  cultural_patterns?: {
    enabled: boolean;
    pattern_type?: string;
    pattern_url?: string;
    cultural_significance?: string;
  };

  // Layout preferences
  layout_style?: 'modern' | 'traditional' | 'minimal' | 'community-focused';
  navigation_style?: 'horizontal' | 'sidebar' | 'mobile-first';

  // Content presentation
  story_card_style?: 'card' | 'list' | 'masonry' | 'traditional';
  insight_presentation?: 'dashboard' | 'narrative' | 'visual';
}

export interface DomainConfig {
  custom_domain?: string;
  subdomain?: string;
  domain_verified: boolean;
  ssl_configured: boolean;
  dns_configured: boolean;
}

export interface WhiteLabelConfig {
  platform_name: string;
  tagline?: string;
  about_text?: string;
  contact_email: string;
  social_links?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  footer_text?: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
}

export class BrandingManager {
  private supabase = createClient();

  /**
   * Get project branding configuration
   */
  async getProjectBranding(project_id: string): Promise<{
    branding?: BrandingConfig;
    domain?: DomainConfig;
    whitelabel?: WhiteLabelConfig;
    error?: string;
  }> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .select('branding_config, custom_domain, domain_verified, settings')
        .eq('id', project_id)
        .single();

      if (error || !project) {
        return { error: 'Project not found' };
      }

      // Extract branding configuration
      const branding_config =
        project.branding_config || this.getDefaultBranding();

      // Extract domain configuration
      const domain_config: DomainConfig = {
        custom_domain: project.custom_domain,
        subdomain: this.generateSubdomain(project_id),
        domain_verified: project.domain_verified || false,
        ssl_configured: project.domain_verified || false, // SSL follows domain verification
        dns_configured: project.domain_verified || false,
      };

      // Extract white-label configuration
      const whitelabel_config: WhiteLabelConfig = {
        platform_name: project.settings?.platform_name || 'Community Stories',
        tagline: project.settings?.tagline,
        about_text: project.settings?.about_text,
        contact_email:
          project.settings?.contact_email || 'stories@organization.org',
        social_links: project.settings?.social_links || {},
        footer_text: project.settings?.footer_text,
        privacy_policy_url: project.settings?.privacy_policy_url,
        terms_of_service_url: project.settings?.terms_of_service_url,
      };

      return {
        branding: branding_config,
        domain: domain_config,
        whitelabel: whitelabel_config,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Update project branding with sovereignty validation
   */
  async updateProjectBranding(
    project_id: string,
    user_id: string,
    updates: {
      branding?: Partial<BrandingConfig>;
      whitelabel?: Partial<WhiteLabelConfig>;
      domain?: Partial<DomainConfig>;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify user permissions
      const { data: membership } = await this.supabase
        .from('project_members')
        .select('role, permissions')
        .eq('project_id', project_id)
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single();

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return {
          success: false,
          error: 'Insufficient permissions to update branding',
        };
      }

      // Get current configuration
      const { data: current_project } = await this.supabase
        .from('projects')
        .select('branding_config, settings, custom_domain')
        .eq('id', project_id)
        .single();

      if (!current_project) {
        return { success: false, error: 'Project not found' };
      }

      // Prepare updates
      const project_updates: any = {};

      // Update branding configuration
      if (updates.branding) {
        const validated_branding = this.validateBrandingConfig(
          updates.branding
        );
        project_updates.branding_config = {
          ...current_project.branding_config,
          ...validated_branding,
        };
      }

      // Update white-label configuration
      if (updates.whitelabel) {
        project_updates.settings = {
          ...current_project.settings,
          ...updates.whitelabel,
        };
      }

      // Update domain configuration
      if (updates.domain && updates.domain.custom_domain) {
        // Validate domain format
        if (!this.isValidDomain(updates.domain.custom_domain)) {
          return { success: false, error: 'Invalid domain format' };
        }

        // Check domain availability
        const { data: existing_domain } = await this.supabase
          .from('projects')
          .select('id')
          .eq('custom_domain', updates.domain.custom_domain)
          .neq('id', project_id)
          .single();

        if (existing_domain) {
          return {
            success: false,
            error: 'Domain already in use by another project',
          };
        }

        project_updates.custom_domain = updates.domain.custom_domain;
        project_updates.domain_verified = false; // Reset verification status
      }

      // Apply updates
      const { error: update_error } = await this.supabase
        .from('projects')
        .update({
          ...project_updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project_id);

      if (update_error) {
        return { success: false, error: update_error.message };
      }

      // If custom domain was updated, initiate verification process
      if (updates.domain?.custom_domain) {
        await this.initiateDomainVerification(
          project_id,
          updates.domain.custom_domain
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate CSS variables from branding configuration
   */
  generateBrandingCSS(branding: BrandingConfig): string {
    const css_variables = `
      :root {
        /* Brand Colors */
        --brand-primary: ${branding.primary_color};
        --brand-secondary: ${branding.secondary_color};
        --brand-accent: ${branding.accent_color || branding.primary_color};
        --brand-background: ${branding.background_color || '#ffffff'};
        --brand-text: ${branding.text_color || '#1a1a1a'};
        
        /* Typography */
        --brand-font-family: ${branding.font_family}, system-ui, sans-serif;
        --brand-heading-font: ${branding.heading_font || branding.font_family}, system-ui, sans-serif;
        --brand-body-font: ${branding.body_font || branding.font_family}, system-ui, sans-serif;
        
        /* Layout */
        --brand-border-radius: ${branding.border_radius || '0.5rem'};
        --brand-shadow: ${branding.shadow_style || '0 1px 3px rgba(0, 0, 0, 0.1)'};
        
        /* Cultural Elements */
        --cultural-pattern: ${branding.cultural_patterns?.pattern_url ? `url(${branding.cultural_patterns.pattern_url})` : 'none'};
      }
      
      /* Base Brand Styling */
      .brand-primary { color: var(--brand-primary) !important; }
      .brand-secondary { color: var(--brand-secondary) !important; }
      .brand-accent { color: var(--brand-accent) !important; }
      
      .bg-brand-primary { background-color: var(--brand-primary) !important; }
      .bg-brand-secondary { background-color: var(--brand-secondary) !important; }
      .bg-brand-accent { background-color: var(--brand-accent) !important; }
      
      .font-brand { font-family: var(--brand-font-family) !important; }
      .font-brand-heading { font-family: var(--brand-heading-font) !important; }
      
      /* Cultural Pattern Support */
      .cultural-pattern {
        background-image: var(--cultural-pattern);
        background-repeat: repeat;
        background-size: auto;
      }
      
      /* Layout Variations */
      ${this.generateLayoutCSS(branding.layout_style)}
      
      /* Custom CSS */
      ${branding.custom_css || ''}
    `;

    return css_variables;
  }

  /**
   * Generate complete branded HTML template
   */
  generateBrandedTemplate(
    branding: BrandingConfig,
    whitelabel: WhiteLabelConfig,
    content: string
  ): string {
    const branded_css = this.generateBrandingCSS(branding);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${whitelabel.platform_name}</title>
      ${branding.favicon_url ? `<link rel="icon" href="${branding.favicon_url}">` : ''}
      
      <!-- Brand Fonts -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=${branding.font_family.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      
      <!-- Tailwind CSS -->
      <script src="https://cdn.tailwindcss.com"></script>
      
      <!-- Brand Styling -->
      <style>
        ${branded_css}
      </style>
    </head>
    <body class="font-brand" style="background-color: var(--brand-background); color: var(--brand-text);">
      <!-- Header -->
      <header class="bg-brand-primary text-white shadow-lg">
        <div class="container mx-auto px-4 py-6 flex items-center justify-between">
          ${
            branding.logo_url
              ? `<img src="${branding.logo_url}" alt="${whitelabel.platform_name}" class="h-10 w-auto">`
              : `<h1 class="text-2xl font-bold font-brand-heading">${whitelabel.platform_name}</h1>`
          }
          ${whitelabel.tagline ? `<p class="text-sm opacity-90">${whitelabel.tagline}</p>` : ''}
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="min-h-screen">
        ${content}
      </main>
      
      <!-- Footer -->
      <footer class="bg-gray-100 border-t mt-12">
        <div class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 class="font-semibold mb-3">${whitelabel.platform_name}</h3>
              ${whitelabel.about_text ? `<p class="text-sm text-gray-600">${whitelabel.about_text}</p>` : ''}
            </div>
            <div>
              <h4 class="font-semibold mb-3">Contact</h4>
              <p class="text-sm text-gray-600">${whitelabel.contact_email}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-3">Connect</h4>
              <div class="flex space-x-4">
                ${this.generateSocialLinks(whitelabel.social_links || {})}
              </div>
            </div>
          </div>
          <div class="border-t mt-8 pt-8 text-center text-sm text-gray-500">
            ${whitelabel.footer_text || `© ${new Date().getFullYear()} ${whitelabel.platform_name}. Powered by Empathy Ledger.`}
          </div>
        </div>
      </footer>
    </body>
    </html>
    `;
  }

  // Private helper methods

  private getDefaultBranding(): BrandingConfig {
    return {
      primary_color: '#B85C38',
      secondary_color: '#7A9B76',
      accent_color: '#D4A574',
      background_color: '#ffffff',
      text_color: '#1a1a1a',
      font_family: 'Inter',
      border_radius: '0.5rem',
      shadow_style: '0 1px 3px rgba(0, 0, 0, 0.1)',
      layout_style: 'modern',
      navigation_style: 'horizontal',
      story_card_style: 'card',
      insight_presentation: 'dashboard',
    };
  }

  private generateSubdomain(project_id: string): string {
    // Generate a subdomain from project ID
    return `project-${project_id.slice(0, 8)}`;
  }

  private validateBrandingConfig(
    branding: Partial<BrandingConfig>
  ): Partial<BrandingConfig> {
    const validated: Partial<BrandingConfig> = {};

    // Validate colors (ensure they're valid hex/rgb/hsl)
    if (branding.primary_color && this.isValidColor(branding.primary_color)) {
      validated.primary_color = branding.primary_color;
    }
    if (
      branding.secondary_color &&
      this.isValidColor(branding.secondary_color)
    ) {
      validated.secondary_color = branding.secondary_color;
    }

    // Validate fonts (basic validation)
    if (branding.font_family && typeof branding.font_family === 'string') {
      validated.font_family = branding.font_family;
    }

    // Validate URLs
    if (branding.logo_url && this.isValidUrl(branding.logo_url)) {
      validated.logo_url = branding.logo_url;
    }

    // Copy other safe properties
    [
      'accent_color',
      'background_color',
      'text_color',
      'heading_font',
      'body_font',
      'favicon_url',
      'hero_image_url',
      'border_radius',
      'shadow_style',
      'layout_style',
      'navigation_style',
      'story_card_style',
      'insight_presentation',
    ].forEach(prop => {
      if (branding[prop as keyof BrandingConfig]) {
        (validated as any)[prop] = branding[prop as keyof BrandingConfig];
      }
    });

    // Validate cultural patterns
    if (branding.cultural_patterns) {
      validated.cultural_patterns = {
        enabled: !!branding.cultural_patterns.enabled,
        pattern_type: branding.cultural_patterns.pattern_type,
        pattern_url: this.isValidUrl(
          branding.cultural_patterns.pattern_url || ''
        )
          ? branding.cultural_patterns.pattern_url
          : undefined,
        cultural_significance: branding.cultural_patterns.cultural_significance,
      };
    }

    // Sanitize custom CSS (basic sanitization)
    if (branding.custom_css) {
      validated.custom_css = this.sanitizeCSS(branding.custom_css);
    }

    return validated;
  }

  private isValidColor(color: string): boolean {
    // Basic color validation for hex, rgb, hsl
    const colorRegex =
      /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\(.*\)|rgba\(.*\)|hsl\(.*\)|hsla\(.*\))$/;
    return colorRegex.test(color);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  private sanitizeCSS(css: string): string {
    // Basic CSS sanitization - remove dangerous properties
    const dangerous_properties = [
      'expression',
      'javascript:',
      'vbscript:',
      '@import',
      'behavior',
    ];
    let sanitized = css;

    dangerous_properties.forEach(prop => {
      const regex = new RegExp(prop, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  private generateLayoutCSS(layout_style?: string): string {
    switch (layout_style) {
      case 'traditional':
        return `
          .layout-traditional {
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.8;
          }
          .layout-traditional h1, .layout-traditional h2 {
            text-align: center;
            margin: 2rem 0;
          }
        `;
      case 'minimal':
        return `
          .layout-minimal {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          .layout-minimal * {
            border: none !important;
            box-shadow: none !important;
          }
        `;
      case 'community-focused':
        return `
          .layout-community {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
          }
          @media (max-width: 768px) {
            .layout-community {
              grid-template-columns: 1fr;
            }
          }
        `;
      default:
        return '';
    }
  }

  private generateSocialLinks(social_links: Record<string, string>): string {
    const links = [];

    if (social_links.website) {
      links.push(
        `<a href="${social_links.website}" class="text-brand-primary hover:underline">Website</a>`
      );
    }
    if (social_links.facebook) {
      links.push(
        `<a href="${social_links.facebook}" class="text-brand-primary hover:underline">Facebook</a>`
      );
    }
    if (social_links.twitter) {
      links.push(
        `<a href="${social_links.twitter}" class="text-brand-primary hover:underline">Twitter</a>`
      );
    }
    if (social_links.instagram) {
      links.push(
        `<a href="${social_links.instagram}" class="text-brand-primary hover:underline">Instagram</a>`
      );
    }

    return links.join('');
  }

  private async initiateDomainVerification(
    project_id: string,
    domain: string
  ): Promise<void> {
    // This would integrate with a domain verification service
    // For now, we'll log the verification request
    console.log(
      `Domain verification initiated for ${domain} on project ${project_id}`
    );

    // In a real implementation, this would:
    // 1. Generate DNS records for verification
    // 2. Create SSL certificates
    // 3. Configure CDN/proxy settings
    // 4. Monitor verification status
  }
}

// Export singleton instance
export const brandingManager = new BrandingManager();
