/**
 * Community Sign-In Page for Empathy Ledger
 *
 * Philosophy: Authentication should feel like joining a trusted community where
 * stories are sacred and every voice matters. This page invites participation
 * while communicating our commitment to sovereignty and respect.
 */

'use client';

// Prevent static generation for auth-protected pages
export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--muted)' }}
    >
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Welcome to Our Community
          </h1>
          <p className="mt-4 text-lg" style={{ color: 'var(--color-storm)' }}>
            Join a platform where your stories matter and your wisdom is valued
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Sign In Coming Soon
          </h2>
          <p className="text-gray-600 text-center mb-6">
            We're building a secure and respectful authentication system that
            honors community protocols and individual sovereignty.
          </p>
          <div className="text-center">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
