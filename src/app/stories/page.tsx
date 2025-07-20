/**
 * Community Stories Page
 *
 * Philosophy: This page honors the wisdom shared by community members,
 * displaying stories with respect and cultural sensitivity.
 */

'use client';

import { useState, useEffect } from 'react';

// Prevent static generation for auth-protected pages
export const dynamic = 'force-dynamic';
import Link from 'next/link';

export default function StoriesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Community Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every story shared here is a gift to our community. Each narrative
            carries wisdom, experience, and the power to connect us.
          </p>
        </div>

        <div className="text-center py-20">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold mb-4">Stories Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              We're preparing a beautiful space to showcase community stories
              with the respect and dignity they deserve.
            </p>
            <Link
              href="/submit"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Share Your Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
