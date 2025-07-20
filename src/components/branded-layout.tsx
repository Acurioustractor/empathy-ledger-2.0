/**
 * Branded Layout Component
 *
 * Philosophy: Dynamic layout that respects organization branding while
 * maintaining accessibility and sovereignty principles.
 */

'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import {
  brandingManager,
  BrandingConfig,
  WhiteLabelConfig,
} from '@/lib/branding';

interface BrandedLayoutProps {
  projectId: string;
  children: ReactNode;
  className?: string;
}

interface BrandingState {
  branding?: BrandingConfig;
  whitelabel?: WhiteLabelConfig;
  css?: string;
  loading: boolean;
  error?: string;
}

export function BrandedLayout({
  projectId,
  children,
  className = '',
}: BrandedLayoutProps) {
  const [brandingState, setBrandingState] = useState<BrandingState>({
    loading: true,
  });

  useEffect(() => {
    loadBranding();
  }, [projectId]);

  const loadBranding = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/branding?include_css=true`
      );

      if (!response.ok) {
        throw new Error('Failed to load branding');
      }

      const data = await response.json();

      setBrandingState({
        branding: data.branding,
        whitelabel: data.whitelabel,
        css: data.generated_css,
        loading: false,
      });

      // Inject branding CSS into document head
      if (data.generated_css) {
        injectBrandingCSS(data.generated_css);
      }
    } catch (error: any) {
      setBrandingState({
        loading: false,
        error: error.message,
      });
    }
  };

  const injectBrandingCSS = (css: string) => {
    // Remove existing branding CSS
    const existingStyle = document.getElementById('project-branding-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Inject new branding CSS
    const styleElement = document.createElement('style');
    styleElement.id = 'project-branding-css';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
  };

  const getFaviconUrl = () => {
    return brandingState.branding?.favicon_url || '/favicon.ico';
  };

  const getLayoutClasses = () => {
    const layout_style = brandingState.branding?.layout_style || 'modern';
    const base_classes = 'min-h-screen font-brand';

    switch (layout_style) {
      case 'traditional':
        return `${base_classes} layout-traditional`;
      case 'minimal':
        return `${base_classes} layout-minimal`;
      case 'community-focused':
        return `${base_classes} layout-community`;
      default:
        return base_classes;
    }
  };

  // Update document title and favicon
  useEffect(() => {
    if (brandingState.whitelabel?.platform_name) {
      document.title = brandingState.whitelabel.platform_name;
    }

    // Update favicon
    const favicon = document.querySelector(
      'link[rel="icon"]'
    ) as HTMLLinkElement;
    if (favicon) {
      favicon.href = getFaviconUrl();
    }
  }, [brandingState.whitelabel, brandingState.branding]);

  if (brandingState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project branding...</p>
        </div>
      </div>
    );
  }

  if (brandingState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Branding Load Error
          </h2>
          <p className="text-gray-600 mb-4">{brandingState.error}</p>
          <button
            onClick={loadBranding}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${getLayoutClasses()} ${className}`}
      style={{
        backgroundColor: brandingState.branding?.background_color || '#ffffff',
        color: brandingState.branding?.text_color || '#1a1a1a',
      }}
    >
      {/* Cultural Pattern Background */}
      {brandingState.branding?.cultural_patterns?.enabled &&
        brandingState.branding.cultural_patterns.pattern_url && (
          <div
            className="cultural-pattern fixed inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url(${brandingState.branding.cultural_patterns.pattern_url})`,
              backgroundRepeat: 'repeat',
              backgroundSize: 'auto',
            }}
          />
        )}

      {/* Header */}
      <BrandedHeader
        branding={brandingState.branding}
        whitelabel={brandingState.whitelabel}
        projectId={projectId}
      />

      {/* Main Content */}
      <main className="relative z-10">{children}</main>

      {/* Footer */}
      <BrandedFooter
        branding={brandingState.branding}
        whitelabel={brandingState.whitelabel}
        projectId={projectId}
      />
    </div>
  );
}

interface BrandedHeaderProps {
  branding?: BrandingConfig;
  whitelabel?: WhiteLabelConfig;
  projectId: string;
}

function BrandedHeader({
  branding,
  whitelabel,
  projectId,
}: BrandedHeaderProps) {
  const navigation_style = branding?.navigation_style || 'horizontal';

  const headerClasses =
    navigation_style === 'sidebar'
      ? 'fixed left-0 top-0 h-full w-64 bg-brand-primary text-white shadow-lg z-20'
      : 'bg-brand-primary text-white shadow-lg';

  return (
    <header className={headerClasses}>
      <div
        className={
          navigation_style === 'sidebar' ? 'p-6' : 'container mx-auto px-4 py-6'
        }
      >
        <div
          className={
            navigation_style === 'sidebar'
              ? 'space-y-6'
              : 'flex items-center justify-between'
          }
        >
          {/* Logo/Title */}
          <div
            className={
              navigation_style === 'sidebar'
                ? 'text-center'
                : 'flex items-center space-x-4'
            }
          >
            {branding?.logo_url ? (
              <img
                src={branding.logo_url}
                alt={whitelabel?.platform_name}
                className={
                  navigation_style === 'sidebar'
                    ? 'h-16 w-auto mx-auto mb-4'
                    : 'h-10 w-auto'
                }
              />
            ) : (
              <h1
                className={`font-bold font-brand-heading ${navigation_style === 'sidebar' ? 'text-xl' : 'text-2xl'}`}
              >
                {whitelabel?.platform_name || 'Community Stories'}
              </h1>
            )}

            {whitelabel?.tagline && navigation_style !== 'sidebar' && (
              <p className="text-sm opacity-90 hidden md:block">
                {whitelabel.tagline}
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav
            className={
              navigation_style === 'sidebar'
                ? 'space-y-4'
                : 'hidden md:flex space-x-6'
            }
          >
            <NavLink href={`/projects/${projectId}`}>Home</NavLink>
            <NavLink href={`/projects/${projectId}/stories`}>Stories</NavLink>
            <NavLink href={`/projects/${projectId}/insights`}>Insights</NavLink>
            <NavLink href={`/projects/${projectId}/submit`}>
              Share Story
            </NavLink>
          </nav>

          {/* Mobile Menu Button (for horizontal nav) */}
          {navigation_style === 'horizontal' && (
            <button className="md:hidden text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
        </div>

        {whitelabel?.tagline && navigation_style === 'sidebar' && (
          <p className="text-sm opacity-90 text-center mt-2">
            {whitelabel.tagline}
          </p>
        )}
      </div>
    </header>
  );
}

interface BrandedFooterProps {
  branding?: BrandingConfig;
  whitelabel?: WhiteLabelConfig;
  projectId: string;
}

function BrandedFooter({
  branding,
  whitelabel,
  projectId,
}: BrandedFooterProps) {
  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3 font-brand-heading">
              {whitelabel?.platform_name || 'Community Stories'}
            </h3>
            {whitelabel?.about_text && (
              <p className="text-sm text-gray-600 mb-3">
                {whitelabel.about_text}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Powered by{' '}
              <span className="brand-primary font-semibold">
                Empathy Ledger
              </span>
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            {whitelabel?.contact_email && (
              <p className="text-sm text-gray-600 mb-2">
                <a
                  href={`mailto:${whitelabel.contact_email}`}
                  className="brand-primary hover:underline"
                >
                  {whitelabel.contact_email}
                </a>
              </p>
            )}
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex space-x-4">
              {whitelabel?.social_links?.website && (
                <SocialLink href={whitelabel.social_links.website}>
                  Website
                </SocialLink>
              )}
              {whitelabel?.social_links?.facebook && (
                <SocialLink href={whitelabel.social_links.facebook}>
                  Facebook
                </SocialLink>
              )}
              {whitelabel?.social_links?.twitter && (
                <SocialLink href={whitelabel.social_links.twitter}>
                  Twitter
                </SocialLink>
              )}
              {whitelabel?.social_links?.instagram && (
                <SocialLink href={whitelabel.social_links.instagram}>
                  Instagram
                </SocialLink>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p>
              {whitelabel?.footer_text ||
                `© ${new Date().getFullYear()} ${whitelabel?.platform_name}. All rights reserved.`}
            </p>
            <div className="flex space-x-4">
              {whitelabel?.privacy_policy_url && (
                <a
                  href={whitelabel.privacy_policy_url}
                  className="hover:underline"
                >
                  Privacy Policy
                </a>
              )}
              {whitelabel?.terms_of_service_url && (
                <a
                  href={whitelabel.terms_of_service_url}
                  className="hover:underline"
                >
                  Terms of Service
                </a>
              )}
              <a href="/sovereignty" className="hover:underline">
                Data Sovereignty
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper Components

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className="text-white hover:text-opacity-80 transition-colors duration-200 font-medium"
    >
      {children}
    </a>
  );
}

interface SocialLinkProps {
  href: string;
  children: ReactNode;
}

function SocialLink({ href, children }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm brand-primary hover:underline"
    >
      {children}
    </a>
  );
}
