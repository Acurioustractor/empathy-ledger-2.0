'use client';

import React, { useState, useEffect } from 'react';
import { checkSupabaseStatus, setupKeepAlive } from '@/lib/supabase-keepalive';

export default function SupabaseHealthCheck() {
  const [status, setStatus] = useState<{
    isActive: boolean;
    lastKeepAlive?: string;
    error?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Set up automatic keep-alive
    const cleanup = setupKeepAlive();

    // Initial status check
    checkStatus();

    return cleanup;
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const result = await checkSupabaseStatus();
      setStatus(result);
    } catch (error) {
      setStatus({
        isActive: false,
        error: 'Failed to check status',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-normal text-gray-900">Supabase Status</h3>
        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full font-light smooth-transition disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      {status && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                status.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="font-light text-gray-900">
              {status.isActive ? 'Active' : 'Inactive/Paused'}
            </span>
          </div>

          {status.lastKeepAlive && (
            <div className="text-sm text-gray-600 font-light">
              Last keep-alive: {formatDate(status.lastKeepAlive)}
            </div>
          )}

          {status.error && (
            <div className="text-sm text-red-600 font-light">
              Error: {status.error}
            </div>
          )}

          {!status.isActive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
              <h4 className="font-normal text-yellow-800 mb-2">
                Project Paused
              </h4>
              <p className="text-sm text-yellow-700 font-light mb-3">
                Your Supabase project has been paused. Go to your Supabase
                dashboard to restart it.
              </p>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-light hover:bg-yellow-700 smooth-transition no-underline"
              >
                Open Supabase Dashboard
              </a>
            </div>
          )}

          {status.isActive && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-4">
              <h4 className="font-normal text-green-800 mb-2">
                Auto Keep-Alive Active
              </h4>
              <p className="text-sm text-green-700 font-light">
                Automatic health checks every 6 hours will keep your project
                active.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
