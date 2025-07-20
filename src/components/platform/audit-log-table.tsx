'use client';

import Link from 'next/link';

interface AuditEntry {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor: {
    id: string;
    display_name: string | null;
    email: string;
    platform_role: string;
  } | null;
}

interface AuditLogTableProps {
  entries: AuditEntry[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function AuditLogTable({
  entries,
  currentPage,
  totalPages,
  totalCount,
}: AuditLogTableProps) {
  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('enabled')) {
      return 'bg-green-100 text-green-800';
    } else if (
      action.includes('suspended') ||
      action.includes('disabled') ||
      action.includes('removed')
    ) {
      return 'bg-red-100 text-red-800';
    } else if (action.includes('updated') || action.includes('changed')) {
      return 'bg-blue-100 text-blue-800';
    } else if (action.includes('impersonation')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderDetails = (details: any, action: string) => {
    if (!details || Object.keys(details).length === 0) return null;

    const key = Object.keys(details)[0];
    const value = details[key];

    if (typeof value === 'string') {
      return (
        <span className="text-xs text-gray-500">
          {key}: {value}
        </span>
      );
    }

    return (
      <span className="text-xs text-gray-500">
        {Object.keys(details).length} detail
        {Object.keys(details).length > 1 ? 's' : ''}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Audit Entries
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Showing {entries.length} of {totalCount} entries
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                        entry.action
                      )}`}
                    >
                      {formatAction(entry.action)}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {entry.actor?.display_name?.charAt(0).toUpperCase() ||
                            entry.actor?.email?.charAt(0).toUpperCase() ||
                            '?'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.actor?.display_name ||
                          entry.actor?.email ||
                          'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.actor?.platform_role || 'user'}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.target_type && (
                    <div>
                      <div className="font-medium">{entry.target_type}</div>
                      {entry.target_id && (
                        <div className="text-xs text-gray-500 font-mono">
                          {entry.target_id.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="font-medium">
                      {formatTimeAgo(entry.created_at)}
                    </div>
                    <div className="text-xs">
                      {formatTime(entry.created_at)}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    {renderDetails(entry.details, entry.action)}
                    {entry.ip_address && (
                      <div className="text-xs text-gray-400">
                        IP: {entry.ip_address}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No audit entries found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No platform administration actions match your current filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>

            <div className="flex space-x-2">
              {currentPage > 1 && (
                <Link
                  href={`?page=${currentPage - 1}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}

              {currentPage < totalPages && (
                <Link
                  href={`?page=${currentPage + 1}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
