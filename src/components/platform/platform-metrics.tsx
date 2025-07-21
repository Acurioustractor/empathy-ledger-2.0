'use client';

interface PlatformMetricsProps {
  metrics: {
    totalProjects: number;
    activeProjects: number;
    totalStories: number;
    totalUsers: number;
  };
}

export function PlatformMetrics({ metrics }: PlatformMetricsProps) {
  const stats = [
    {
      name: 'Active Projects',
      stat: metrics.activeProjects,
      previousStat: metrics.totalProjects,
      change: '12%',
      changeType: 'increase',
      description: 'Organizations using the platform',
    },
    {
      name: 'Total Stories',
      stat: metrics.totalStories,
      previousStat: metrics.totalStories - 145,
      change: '5.4%',
      changeType: 'increase',
      description: 'Stories collected this month',
    },
    {
      name: 'Community Members',
      stat: metrics.totalUsers,
      previousStat: metrics.totalUsers - 32,
      change: '3.2%',
      changeType: 'increase',
      description: 'Active storytellers and staff',
    },
    {
      name: 'Sovereignty Score',
      stat: '98.5%',
      previousStat: '98.1%',
      change: '0.4%',
      changeType: 'increase',
      description: 'Platform sovereignty compliance',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(item => (
        <div
          key={item.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {item.stat}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span
                  className={`flex items-center text-sm font-medium ${
                    item.changeType === 'increase'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {item.changeType === 'increase' ? (
                    <svg
                      className="flex-shrink-0 -ml-1 mr-0.5 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 17l9.2-9.2M17 17V7H7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="flex-shrink-0 -ml-1 mr-0.5 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 7l-9.2 9.2M7 7v10h10"
                      />
                    </svg>
                  )}
                  {item.change}
                </span>
                <span className="ml-2 text-gray-500">from last month</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
