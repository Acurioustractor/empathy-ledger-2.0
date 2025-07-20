'use client';

import { useState, useEffect } from 'react';
import {
  getSupabaseHealthReport,
  quickHealthCheck,
} from '@/lib/supabase-health';
import { runFullTestSuite } from '@/lib/supabase-test';
import { getSupabaseHealth } from '@/lib/supabase-factory';

interface HealthData {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  browser: any;
  server: any;
  admin: any;
  recommendations: string[];
  metrics: any[];
  connectionMetrics: any;
  lastUpdate: Date;
}

export function SupabaseHealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      const [healthReport, connectionMetrics] = await Promise.all([
        getSupabaseHealthReport(),
        Promise.resolve(getSupabaseHealth()),
      ]);

      setHealthData({
        ...healthReport,
        connectionMetrics,
        lastUpdate: new Date(),
      });
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runFullTestSuite();
      setTestResults(results);
    } catch (error) {
      console.error('Tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'degraded':
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'unhealthy':
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Supabase Health Dashboard
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
              autoRefresh
                ? 'text-indigo-700 bg-indigo-100 border-indigo-300'
                : 'text-gray-700 bg-white'
            } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={fetchHealthData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
          <button
            onClick={runTests}
            disabled={isRunningTests}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isRunningTests ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>
      </div>

      {healthData && (
        <>
          {/* Overall Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(healthData.overall)}
                <div className="ml-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    Overall Status
                  </h4>
                  <p className="text-sm text-gray-500">
                    Last updated: {healthData.lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  healthData.overall
                )}`}
              >
                {healthData.overall.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Client Status Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Browser Client */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                {getStatusIcon(healthData.browser.status)}
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-gray-900">
                    Browser Client
                  </h5>
                  <p className="text-sm text-gray-500">
                    Client-side connections
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Response Time:</span>
                  <span className="font-medium">
                    {healthData.browser.responseTime}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">
                    {healthData.browser.uptime.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Errors:</span>
                  <span className="font-medium">
                    {healthData.browser.errorCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Server Client */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                {getStatusIcon(healthData.server.status)}
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-gray-900">
                    Server Client
                  </h5>
                  <p className="text-sm text-gray-500">
                    Server-side connections
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Response Time:</span>
                  <span className="font-medium">
                    {healthData.server.responseTime}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">
                    {healthData.server.uptime.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Errors:</span>
                  <span className="font-medium">
                    {healthData.server.errorCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Client */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                {getStatusIcon(healthData.admin.status)}
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-gray-900">
                    Admin Client
                  </h5>
                  <p className="text-sm text-gray-500">Admin operations</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Response Time:</span>
                  <span className="font-medium">
                    {healthData.admin.responseTime}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">
                    {healthData.admin.uptime.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Errors:</span>
                  <span className="font-medium">
                    {healthData.admin.errorCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Metrics */}
          {healthData.connectionMetrics && (
            <div className="bg-white shadow rounded-lg p-6">
              <h5 className="text-lg font-medium text-gray-900 mb-4">
                Connection Metrics
              </h5>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {healthData.connectionMetrics.totalConnections}
                  </div>
                  <div className="text-sm text-gray-500">Total Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {healthData.connectionMetrics.successfulConnections}
                  </div>
                  <div className="text-sm text-gray-500">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {healthData.connectionMetrics.failedConnections}
                  </div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {healthData.connectionMetrics.circuitBreakerTrips}
                  </div>
                  <div className="text-sm text-gray-500">
                    Circuit Breaker Trips
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {healthData.recommendations &&
            healthData.recommendations.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">
                  Recommendations
                </h5>
                <ul className="space-y-2">
                  {healthData.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-gray-700">
                        {recommendation}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Test Results */}
          {testResults && (
            <div className="bg-white shadow rounded-lg p-6">
              <h5 className="text-lg font-medium text-gray-900 mb-4">
                Test Results
              </h5>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      testResults.overallSuccess
                        ? 'text-green-800 bg-green-100'
                        : 'text-red-800 bg-red-100'
                    }`}
                  >
                    {testResults.overallSuccess
                      ? 'ALL TESTS PASSED'
                      : 'SOME TESTS FAILED'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {testResults.summary.passedTests}/
                    {testResults.summary.totalTests} passed (
                    {testResults.summary.successRate.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {testResults.suites.map((suite: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-900">
                        {suite.name}
                      </h6>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          suite.overallSuccess
                            ? 'text-green-800 bg-green-100'
                            : 'text-red-800 bg-red-100'
                        }`}
                      >
                        {suite.overallSuccess ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {suite.results.map((result: any, resultIndex: number) => (
                        <div
                          key={resultIndex}
                          className="flex items-center justify-between text-sm"
                        >
                          <span
                            className={
                              result.success ? 'text-gray-700' : 'text-red-700'
                            }
                          >
                            {result.success ? '✅' : '❌'} {result.name}
                          </span>
                          <span className="text-gray-500">
                            {result.duration}ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
