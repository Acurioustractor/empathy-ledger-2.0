import { createServerClient } from '@/lib/supabase-client';
import { PlatformMetrics } from '@/components/platform/platform-metrics';
import { ProjectHealthOverview } from '@/components/platform/project-health-overview';
import { SystemHealth } from '@/components/platform/system-health';
import { QuickActions } from '@/components/platform/quick-actions';
import { RecentActivity } from '@/components/platform/recent-activity';

export const dynamic = 'force-dynamic';

export default async function PlatformAdminDashboard() {
  // Initialize with empty data for build-time
  let platformStats = null;
  let recentProjects: any[] = [];
  let recentActivity: any[] = [];

  try {
    const supabase = await createServerClient();

    // Get platform metrics
    let stats = null;
    let projects: any[] = [];
    let activity: any[] = [];

    // Basic platform statistics (may not exist during build)
    try {
      const { data } = await supabase.rpc('get_platform_stats');
      stats = data;
    } catch (error) {
      console.log('Platform stats RPC not available');
      stats = null;
    }

    // Recent projects
    try {
      const { data } = await supabase
        .from('projects')
        .select(
          `
          id,
          name,
          subscription_tier,
          subscription_status,
          created_at,
          updated_at
        `
        )
        .order('created_at', { ascending: false })
        .limit(5);
      
      projects = data || [];
    } catch (error) {
      console.log('Error fetching projects:', error);
      projects = [];
    }

    // Recent audit activity
    try {
      const { data } = await supabase
        .from('platform_audit_log')
        .select(
          `
          id,
          action,
          target_type,
          details,
          created_at,
          actor:profiles(display_name, email)
        `
        )
        .order('created_at', { ascending: false })
        .limit(10);
      
      activity = data || [];
    } catch (error) {
      console.log('Error fetching audit log:', error);
      activity = [];
    }

    platformStats = stats;
    recentProjects = projects || [];
    recentActivity = activity || [];
  } catch (error) {
    console.error('Error in platform dashboard:', error);
    // Continue with empty data for build
  }

  const metrics = {
    totalProjects: recentProjects?.length || 0,
    activeProjects:
      recentProjects?.filter(p => p.subscription_status === 'active').length ||
      0,
    totalStories: 0, // Will be populated by RPC
    totalUsers: 0, // Will be populated by RPC
    ...platformStats,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Platform Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage the Empathy Ledger platform
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <QuickActions />
        </div>
      </div>

      {/* Platform Metrics */}
      <PlatformMetrics metrics={metrics} />

      {/* System Health & Project Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealth />
        <ProjectHealthOverview projects={recentProjects || []} />
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivity || []} />
        </div>

        <div className="space-y-6">
          {/* Quick Project Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create New Project
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Invite Organization
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  System Settings
                </button>
              </div>
            </div>
          </div>

          {/* Platform Health Summary */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Platform Health
              </h3>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-green-600 font-semibold">
                    Healthy
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Uptime</dt>
                  <dd className="text-sm text-gray-900">99.9%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Response Time
                  </dt>
                  <dd className="text-sm text-gray-900">145ms</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Error Rate
                  </dt>
                  <dd className="text-sm text-gray-900">0.01%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
