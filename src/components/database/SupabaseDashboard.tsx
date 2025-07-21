'use client';

import React, { useState, useEffect } from 'react';
import SecurityBadge from '@/components/trust/SecurityBadge';
import Button from '@/components/ui/Button';

interface DatabaseTable {
  name: string;
  description: string;
  rowCount: number;
  privacyLevel: 'public' | 'aggregated' | 'encrypted';
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'error';
}

interface DatabaseMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  trendValue?: string;
  description: string;
}

interface SupabaseDashboardProps {
  className?: string;
  showTechnicalDetails?: boolean;
}

// Mock Supabase database structure (privacy-aware)
const mockTables: DatabaseTable[] = [
  {
    name: 'stories_encrypted',
    description: 'End-to-end encrypted story content',
    rowCount: 15247,
    privacyLevel: 'encrypted',
    lastUpdated: '2 minutes ago',
    status: 'healthy',
  },
  {
    name: 'community_insights',
    description: 'Aggregated patterns and themes',
    rowCount: 342,
    privacyLevel: 'aggregated',
    lastUpdated: '15 minutes ago',
    status: 'healthy',
  },
  {
    name: 'privacy_logs',
    description: 'Access and consent audit trail',
    rowCount: 89421,
    privacyLevel: 'public',
    lastUpdated: '1 minute ago',
    status: 'healthy',
  },
  {
    name: 'anonymous_profiles',
    description: 'De-identified user metadata',
    rowCount: 2847,
    privacyLevel: 'aggregated',
    lastUpdated: '5 minutes ago',
    status: 'healthy',
  },
  {
    name: 'geographic_clusters',
    description: 'State-level geographic patterns',
    rowCount: 8,
    privacyLevel: 'aggregated',
    lastUpdated: '1 hour ago',
    status: 'healthy',
  },
  {
    name: 'impact_measurements',
    description: 'Policy and outcome correlations',
    rowCount: 156,
    privacyLevel: 'aggregated',
    lastUpdated: '30 minutes ago',
    status: 'warning',
  },
];

const mockMetrics: DatabaseMetric[] = [
  {
    label: 'Total Encrypted Records',
    value: '15,247',
    trend: 'up',
    trendValue: '+23%',
    description: 'Stories with end-to-end encryption',
  },
  {
    label: 'Privacy Compliance Score',
    value: '99.8%',
    trend: 'stable',
    description: 'Automated privacy compliance checks',
  },
  {
    label: 'Zero-Knowledge Proofs',
    value: '1,247',
    trend: 'up',
    trendValue: '+45%',
    description: 'Verified insights without data exposure',
  },
  {
    label: 'Consent Updates',
    value: '342',
    trend: 'up',
    trendValue: '+12%',
    description: 'User privacy preference changes today',
  },
];

const SupabaseDashboard: React.FC<SupabaseDashboardProps> = ({
  className = '',
  showTechnicalDetails = true,
}) => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [metrics, setMetrics] = useState<DatabaseMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(
    null
  );

  useEffect(() => {
    const fetchDatabaseStatus = async () => {
      setIsLoading(true);
      // Simulate API call to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTables(mockTables);
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    fetchDatabaseStatus();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPrivacyBadgeVariant = (privacyLevel: string) => {
    switch (privacyLevel) {
      case 'encrypted':
        return 'encryption';
      case 'aggregated':
        return 'privacy';
      case 'public':
        return 'certification';
      default:
        return 'privacy';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      case 'down':
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
        );
      case 'stable':
        return (
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Database Health Overview */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Supabase Database Health
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Connection</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {metric.label}
                </span>
                {metric.trend && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    {metric.trendValue && (
                      <span
                        className={`text-xs font-medium ${
                          metric.trend === 'up'
                            ? 'text-green-600'
                            : metric.trend === 'down'
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {metric.trendValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Tables */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Database Tables
        </h3>

        <div className="grid gap-4">
          {tables.map(table => (
            <div
              key={table.name}
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                selectedTable?.name === table.name
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() =>
                setSelectedTable(
                  selectedTable?.name === table.name ? null : table
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {table.name}
                    </h4>
                    <SecurityBadge
                      variant={getPrivacyBadgeVariant(table.privacyLevel)}
                      showBackground={false}
                      className="scale-75"
                    />
                    <div
                      className={`w-2 h-2 rounded-full bg-${getStatusColor(table.status)}-500`}
                    ></div>
                  </div>
                  <p className="text-gray-600 mb-2">{table.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{table.rowCount.toLocaleString()} rows</span>
                    <span>Updated {table.lastUpdated}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      selectedTable?.name === table.name ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTable?.name === table.name && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">
                        Privacy Protection
                      </h5>
                      <div className="space-y-2 text-sm">
                        {table.privacyLevel === 'encrypted' && (
                          <>
                            <div className="flex items-center text-green-700">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              End-to-end encryption enabled
                            </div>
                            <div className="flex items-center text-green-700">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Content never visible to platform
                            </div>
                          </>
                        )}
                        {table.privacyLevel === 'aggregated' && (
                          <>
                            <div className="flex items-center text-blue-700">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Aggregated data only (1000+ minimum)
                            </div>
                            <div className="flex items-center text-blue-700">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Differential privacy applied
                            </div>
                          </>
                        )}
                        {table.privacyLevel === 'public' && (
                          <div className="flex items-center text-gray-700">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Public audit data - no personal info
                          </div>
                        )}
                      </div>
                    </div>

                    {showTechnicalDetails && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">
                          Technical Details
                        </h5>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div>Encryption: AES-256-GCM</div>
                          <div>Replication: 3 nodes (AU regions)</div>
                          <div>Backup: Daily encrypted snapshots</div>
                          <div>Compliance: GDPR, Privacy Act 1988</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {table.privacyLevel === 'aggregated' && (
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        href={`/visualizations?table=${table.name}`}
                      >
                        View Safe Visualizations →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Compliance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl border border-green-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Privacy-First Database Architecture
            </h4>
            <p className="text-gray-700 mb-4">
              Our Supabase implementation ensures that sensitive data is
              encrypted at rest and in transit. Individual stories are never
              accessible to the platform, while aggregated insights help
              communities understand patterns and needs.
            </p>
            <div className="flex flex-wrap gap-3">
              <SecurityBadge variant="encryption" text="256-bit encryption" />
              <SecurityBadge variant="privacy" text="Australian servers" />
              <SecurityBadge variant="certification" text="GDPR compliant" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDashboard;
