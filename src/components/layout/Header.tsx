'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Stories',
      dropdown: true,
      items: [
        { name: 'Browse Stories', href: '/stories', description: 'Explore community narratives with AI insights' },
        { name: 'Community Gallery', href: '/community-gallery', description: 'Visual storytelling showcase' },
        { name: 'Submit Your Story', href: '/submit', description: 'Share your narrative', highlight: true },
      ]
    },
    {
      name: 'Insights',
      dropdown: true,
      items: [
        { name: 'Community Analytics', href: '/analytics', description: 'AI-powered theme and emotion insights' },
        { name: 'How It Works', href: '/how-it-works', description: 'Learn about our approach' },
        { name: 'Case Studies', href: '/case-studies', description: 'Success stories & impact' },
        { name: 'Modules', href: '/modules', description: 'Platform capabilities' },
      ]
    },
    {
      name: 'Platform',
      dropdown: true,
      items: [
        { name: 'For Organisations', href: '/organisation', description: 'Partner with communities' },
        { name: 'Visualisations', href: '/visualisations', description: 'Data insights & patterns' },
        { name: 'Trust & Security', href: '/trust-security', description: 'Our security practices' },
      ]
    },
    {
      name: 'About',
      href: '/about',
      dropdown: false
    },
    {
      name: 'Trust',
      dropdown: true,
      items: [
        { name: 'Privacy Policy', href: '/privacy', description: 'How we protect your data' },
        { name: 'Trust & Security', href: '/trust-security', description: 'Our security practices' },
        { name: 'Contact Us', href: '/contact', description: 'Get in touch' },
      ]
    }
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'CMS', href: '/cms' },
    { name: 'Analytics', href: '/admin/analytics' },
    { name: 'Platform', href: '/admin/platform' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="nav-header">
        <nav className="nav-container" aria-label="Global">
          <div className="nav-inner">
            {/* Logo */}
            <div className="nav-logo">
              <Link href="/" className="logo-link">
                <div className="logo-mark">E</div>
                <div className="logo-text">
                  <div className="logo-name">Empathy Ledger</div>
                  <div className="logo-tagline">Community Stories Platform</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-desktop">
              <div className="nav-links">
                {navigation.map((item) => (
                  <div key={item.name} className="nav-item">
                    {item.dropdown ? (
                      <div
                        className="dropdown-container"
                        onMouseEnter={() => setActiveDropdown(item.name)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <button className="nav-link dropdown-trigger">
                          {item.name}
                          <svg className="dropdown-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {activeDropdown === item.name && (
                          <div className="dropdown-menu">
                            {item.items?.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`dropdown-item ${subItem.highlight ? 'dropdown-item-highlight' : ''}`}
                              >
                                <div className="dropdown-item-name">{subItem.name}</div>
                                <div className="dropdown-item-desc">{subItem.description}</div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href!}
                        className={`nav-link ${isActive(item.href!) ? 'nav-link-active' : ''}`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <div className="nav-actions">
                <Link href="/submit" className="btn btn-primary">
                  Share Your Story
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="nav-mobile-toggle">
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Toggle menu</span>
                {mobileMenuOpen ? (
                  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="logo-text">
                <div className="logo-name">Empathy Ledger</div>
              </div>
              <button
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mobile-menu-content">
              {navigation.map((item) => (
                <div key={item.name} className="mobile-menu-section">
                  {item.dropdown ? (
                    <>
                      <div className="mobile-menu-label">{item.name}</div>
                      {item.items?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="mobile-menu-link"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      className="mobile-menu-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="mobile-menu-cta">
                <Link
                  href="/submit"
                  className="btn btn-primary btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Share Your Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;