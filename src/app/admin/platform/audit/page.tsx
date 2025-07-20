import { createServerClient } from '@/lib/supabase-client';
import { AuditLogTable } from '@/components/platform/audit-log-table';
import { AuditLogFilters } from '@/components/platform/audit-log-filters';
import { AuditLogStats } from '@/components/platform/audit-log-stats';

interface SearchParams {
  action?: string;
  target_type?: string;
  target_id?: string;
  start_date?: string;
  end_date?: string;
  page?: string;
}

export default async function AuditLogPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build filter conditions
  const filters = {
    action: searchParams.action,
    target_type: searchParams.target_type,
    target_id: searchParams.target_id,
    start_date: searchParams.start_date,
    end_date: searchParams.end_date,
    limit,
    offset
  };

  // Initialize with empty data for build-time
  let auditEntries: any[] = [];
  let totalCount = 0;
  let statsData = null;
  let totalPages = 1;

  try {
    const supabase = createServerClient();
    
    // Get audit log entries
    const { data: entries, error } = await supabase
      .from('platform_audit_log')
      .select(`
        id,
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent,
        created_at,
        actor:profiles!platform_audit_log_actor_id_fkey(
          id,
          display_name,
          email,
          platform_role
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!error && entries) {
      auditEntries = entries;
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('platform_audit_log')
      .select('*', { count: 'exact', head: true });

    if (count) {
      totalCount = count;
      totalPages = Math.ceil(count / limit);
    }

    // Get audit statistics (may not exist during build)
    try {
      const { data: stats } = await supabase.rpc('get_audit_stats', {
        timeframe: '7d'
      });
      statsData = stats;
    } catch (error) {
      // RPC function may not exist yet
      console.log('Audit stats RPC not available');
    }

    if (error) {
      console.error('Failed to fetch audit log:', error);
    }
  } catch (error) {
    console.error('Error in audit log page:', error);
    // Continue with empty data for build
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Platform Audit Log
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Complete history of platform administration actions
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
            Export Log
          </button>
        </div>
      </div>

      {/* Audit Statistics */}
      <AuditLogStats stats={statsData} />

      {/* Filters */}
      <AuditLogFilters currentFilters={filters} />

      {/* Audit Log Table */}
      <AuditLogTable 
        entries={auditEntries || []}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount || 0}
      />
    </div>
  );
}