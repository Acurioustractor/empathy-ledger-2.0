// Simple test page to verify platform admin routes work
export const dynamic = 'force-dynamic';

export default function PlatformTestPage() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Platform Admin Test
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Platform admin functionality is working!
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Platform Features Implemented
          </h3>
          <div className="mt-4">
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Database migration for platform admin features
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Platform admin dashboard layout
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Project overview with health metrics
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Module registry and management system
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Platform audit logging system
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Next Steps
          </h3>
          <div className="mt-4">
            <ol className="space-y-2 list-decimal list-inside">
              <li className="text-sm text-gray-700">
                Set up Supabase connection to test database features
              </li>
              <li className="text-sm text-gray-700">
                Run database migrations to create platform tables
              </li>
              <li className="text-sm text-gray-700">
                Create a super admin user to test the interface
              </li>
              <li className="text-sm text-gray-700">
                Test module enable/disable functionality
              </li>
              <li className="text-sm text-gray-700">
                Verify audit logging captures admin actions
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Platform Admin Ready!
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The platform admin system has been successfully built and is
                ready for database integration. Once Supabase is connected,
                you'll have full god-mode control over the Empathy Ledger
                platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
