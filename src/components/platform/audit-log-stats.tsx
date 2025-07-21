'use client';

interface AuditLogStatsProps {
  stats?: {
    total_actions: number;
    actions_by_type: Record<string, number>;
    actions_by_target: Record<string, number>;
    unique_actors: number;
    timeframe: string;
  } | null;
}

export function AuditLogStats({ stats }: AuditLogStatsProps) {
  // Mock data if stats are not available
  const mockStats = {
    total_actions: 247,
    actions_by_type: {
      project_created: 12,
      module_enabled: 45,
      user_invited: 23,
      project_updated: 67,
      impersonation_started: 3,
    },
    actions_by_target: {
      project: 156,
      user: 67,
      module: 18,
      system: 6,
    },
    unique_actors: 8,
    timeframe: '7d',
  };

  const displayStats = stats || mockStats;

  const topActions = Object.entries(displayStats.actions_by_type)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topTargets = Object.entries(displayStats.actions_by_target).sort(
    ([, a], [, b]) => b - a
  );

  const formatActionName = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('enabled')) {
      return 'text-green-600';
    } else if (
      action.includes('suspended') ||
      action.includes('disabled') ||
      action.includes('removed')
    ) {
      return 'text-red-600';
    } else if (action.includes('updated') || action.includes('changed')) {
      return 'text-blue-600';
    } else if (action.includes('impersonation')) {
      return 'text-purple-600';
    }
    return 'text-gray-600';
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'project':
        return 'text-blue-600';
      case 'user':
        return 'text-green-600';
      case 'module':
        return 'text-purple-600';
      case 'system':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Actions */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Actions
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {displayStats.total_actions.toLocaleString()}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">
              Last{' '}
              {displayStats.timeframe === '7d'
                ? '7 days'
                : displayStats.timeframe}
            </div>
          </div>
        </div>
      </div>

      {/* Unique Actors */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Admins
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {displayStats.unique_actors}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Platform administrators</div>
          </div>
        </div>
      </div>

      {/* Top Action */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Most Common Action
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {topActions[0] ? formatActionName(topActions[0][0]) : 'N/A'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">
              {topActions[0] ? `${topActions[0][1]} times` : 'No data'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Target */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Primary Target
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 capitalize">
                    {topTargets[0] ? topTargets[0][0] : 'N/A'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">
              {topTargets[0] ? `${topTargets[0][1]} actions` : 'No data'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Breakdown */}
      <div className="bg-white overflow-hidden shadow rounded-lg sm:col-span-2">
        <div className="p-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Action Breakdown
          </h3>
          <div className="mt-4">
            <div className="space-y-3">
              {topActions.map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-3 ${getActionColor(action)}`}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatActionName(action)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Breakdown */}
      <div className="bg-white overflow-hidden shadow rounded-lg sm:col-span-2">
        <div className="p-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Target Breakdown
          </h3>
          <div className="mt-4">
            <div className="space-y-3">
              {topTargets.map(([target, count]) => (
                <div key={target} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-3 ${getTargetColor(target)}`}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {target}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getTargetColor(target).replace('text-', 'bg-')}`}
                        style={{
                          width: `${(count / displayStats.total_actions) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
