import { createServerClient } from '@/lib/supabase-client';
import { ModuleRegistry } from '@/components/platform/module-registry';
import { ModuleUsageStats } from '@/components/platform/module-usage-stats';

export default async function ModulesPage() {
  // Initialize with empty data for build-time
  let modules: any[] = [];
  let usageStats = null;

  try {
    const supabase = createServerClient();

    // Get all platform modules
    const { data: moduleData } = await supabase
      .from('platform_modules')
      .select(`
        *,
        project_modules(
          project_id,
          enabled,
          first_activated,
          last_used,
          usage_count
        )
      `)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .catch(() => ({ data: [] }));

    modules = moduleData || [];

    // Get module usage statistics (may not exist during build)
    try {
      const { data: stats } = await supabase.rpc('get_module_usage_stats');
      usageStats = stats;
    } catch (error) {
      console.log('Module usage stats RPC not available');
    }
  } catch (error) {
    console.error('Error in modules page:', error);
    // Continue with empty data for build
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Module Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage platform modules and monitor usage across projects
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export Usage Report
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Module
          </button>
        </div>
      </div>

      {/* Module Usage Overview */}
      <ModuleUsageStats stats={usageStats} />

      {/* Module Registry */}
      <ModuleRegistry modules={modules} />
    </div>
  );
}