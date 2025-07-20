import React from 'react';
import SupabaseHealthCheck from '@/components/admin/SupabaseHealthCheck';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="section-spacing bg-gray-50">
        <div className="content-container">
          <h1 className="text-4xl md:text-5xl font-extralight text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl">
            Monitor and manage your Empathy Ledger platform infrastructure.
          </p>
        </div>
      </section>

      {/* Dashboard */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Supabase Status */}
            <SupabaseHealthCheck />

            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-normal text-gray-900 mb-4">Platform Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-light">Environment</span>
                  <span className="font-light">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-light">Database</span>
                  <span className="font-light">Supabase PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-light">Storage</span>
                  <span className="font-light">Supabase Storage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-light">Authentication</span>
                  <span className="font-light">Supabase Auth</span>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-normal text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-light text-gray-900">Website Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-light text-gray-900">Story Submission Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-light text-gray-900">Authentication Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-light text-gray-900">AI Analysis (Mock)</span>
                </div>
              </div>
            </div>

            {/* Useful Links */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-normal text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-600 hover:text-gray-900 font-light smooth-transition no-underline"
                >
                  → Supabase Dashboard
                </a>
                <a
                  href="/submit"
                  className="block text-gray-600 hover:text-gray-900 font-light smooth-transition no-underline"
                >
                  → Test Story Submission
                </a>
                <a
                  href="/dashboard"
                  className="block text-gray-600 hover:text-gray-900 font-light smooth-transition no-underline"
                >
                  → Storyteller Dashboard
                </a>
                <a
                  href="/auth/signin"
                  className="block text-gray-600 hover:text-gray-900 font-light smooth-transition no-underline"
                >
                  → Authentication Test
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}