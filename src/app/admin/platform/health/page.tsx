import { SupabaseHealthDashboard } from '@/components/platform/supabase-health-dashboard';

export default function SupabaseHealthPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Supabase Health Monitor
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Real-time monitoring of Supabase connection health and performance
          </p>
        </div>
      </div>

      {/* Health Dashboard */}
      <SupabaseHealthDashboard />

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Bulletproof Supabase Infrastructure
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This dashboard monitors our bulletproof Supabase infrastructure featuring:
                connection pooling, retry logic with exponential backoff, circuit breaker patterns,
                comprehensive error handling, and real-time health monitoring. Never fucking breaks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}