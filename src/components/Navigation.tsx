/**
 * Community Navigation for Empathy Ledger
 *
 * Philosophy: Navigation should feel like entering a sacred space where stories
 * are honored and communities are empowered. Every link should use language that
 * respects the wisdom being shared.
 */

'use client';

import Link from 'next/link';
import { useAuth, useCommunityMember } from '@/lib/auth-context';
import { useState } from 'react';

export function Navigation() {
  const { signOut } = useAuth();
  const { isSignedIn, fullName, communityAffiliation } = useCommunityMember();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--color-elder)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand - Community Identity */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Logo/Icon placeholder */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                🌱
              </div>
              <span
                className="text-xl font-semibold transition-colors duration-200"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Empathy Ledger
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/stories"
              className="nav-link"
              style={{ color: 'var(--color-storm)' }}
            >
              Community Wisdom
            </Link>

            {isSignedIn ? (
              <>
                <Link
                  href="/submit"
                  className="nav-link"
                  style={{ color: 'var(--color-storm)' }}
                >
                  Share Your Experience
                </Link>

                <Link
                  href="/profile"
                  className="nav-link"
                  style={{ color: 'var(--color-storm)' }}
                >
                  Your Journey
                </Link>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div
                      className="text-sm font-medium"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {fullName || 'Community Member'}
                    </div>
                    {communityAffiliation && (
                      <div
                        className="text-xs"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {communityAffiliation}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => signOut()}
                    className="text-sm hover:underline transition-colors duration-200"
                    style={{ color: 'var(--color-storm)' }}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/sign-in"
                  className="nav-link"
                  style={{ color: 'var(--color-storm)' }}
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/sign-in"
                  className="btn-primary px-4 py-2 text-sm font-medium"
                >
                  Begin Your Journey
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{
                color: 'var(--color-storm)',
                backgroundColor: isMenuOpen ? 'var(--muted)' : 'transparent',
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-elder)',
          }}
        >
          <div className="px-4 pt-2 pb-3 space-y-3">
            <Link
              href="/stories"
              className="block py-2 text-base font-medium transition-colors duration-200"
              style={{ color: 'var(--color-storm)' }}
              onClick={() => setIsMenuOpen(false)}
            >
              Community Wisdom
            </Link>

            {isSignedIn ? (
              <>
                <Link
                  href="/submit"
                  className="block py-2 text-base font-medium transition-colors duration-200"
                  style={{ color: 'var(--color-storm)' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Share Your Experience
                </Link>

                <Link
                  href="/profile"
                  className="block py-2 text-base font-medium transition-colors duration-200"
                  style={{ color: 'var(--color-storm)' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Journey
                </Link>

                <div
                  className="pt-3 border-t"
                  style={{ borderColor: 'var(--color-elder)' }}
                >
                  <div
                    className="text-sm mb-1 font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {fullName || 'Community Member'}
                  </div>
                  {communityAffiliation && (
                    <div
                      className="text-xs mb-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {communityAffiliation}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--color-storm)' }}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/auth/sign-in"
                  className="block py-2 text-base font-medium transition-colors duration-200"
                  style={{ color: 'var(--color-storm)' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/sign-in"
                  className="btn-primary inline-block px-4 py-2 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Begin Your Journey
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .nav-link {
          position: relative;
          font-weight: 500;
          transition: all 0.2s ease;
          padding: 0.5rem 0;
        }

        .nav-link:hover {
          color: var(--primary) !important;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: var(--primary);
          transition: width 0.2s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </nav>
  );
}
