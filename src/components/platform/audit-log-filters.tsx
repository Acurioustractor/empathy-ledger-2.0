'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuditLogFiltersProps {
  currentFilters: {
    action?: string;
    target_type?: string;
    target_id?: string;
    start_date?: string;
    end_date?: string;
  };
}

export function AuditLogFilters({ currentFilters }: AuditLogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    action: currentFilters.action || '',
    target_type: currentFilters.target_type || '',
    target_id: currentFilters.target_id || '',
    start_date: currentFilters.start_date || '',
    end_date: currentFilters.end_date || '',
  });

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'project_created', label: 'Project Created' },
    { value: 'project_updated', label: 'Project Updated' },
    { value: 'project_suspended', label: 'Project Suspended' },
    { value: 'project_activated', label: 'Project Activated' },
    { value: 'module_enabled', label: 'Module Enabled' },
    { value: 'module_disabled', label: 'Module Disabled' },
    { value: 'user_invited', label: 'User Invited' },
    { value: 'user_removed', label: 'User Removed' },
    { value: 'user_role_changed', label: 'User Role Changed' },
    { value: 'impersonation_started', label: 'Impersonation Started' },
    { value: 'impersonation_ended', label: 'Impersonation Ended' },
  ];

  const targetTypeOptions = [
    { value: '', label: 'All Targets' },
    { value: 'project', label: 'Project' },
    { value: 'user', label: 'User' },
    { value: 'module', label: 'Module' },
    { value: 'system', label: 'System' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove existing filter params
    [
      'action',
      'target_type',
      'target_id',
      'start_date',
      'end_date',
      'page',
    ].forEach(key => {
      params.delete(key);
    });

    // Add new filter params (only non-empty values)
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value);
      }
    });

    // Reset to page 1 when applying filters
    params.delete('page');

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      target_type: '',
      target_id: '',
      start_date: '',
      end_date: '',
    });

    const params = new URLSearchParams();
    router.push(`?${params.toString()}`);
  };

  const setQuickTimeFilter = (period: '1h' | '24h' | '7d' | '30d') => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    setFilters(prev => ({
      ...prev,
      start_date: startDate.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    }));
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value.trim() !== ''
  );

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Filter Audit Log
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Action Filter */}
          <div>
            <label
              htmlFor="action"
              className="block text-sm font-medium text-gray-700"
            >
              Action
            </label>
            <select
              id="action"
              name="action"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.action}
              onChange={e => handleFilterChange('action', e.target.value)}
            >
              {actionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Type Filter */}
          <div>
            <label
              htmlFor="target_type"
              className="block text-sm font-medium text-gray-700"
            >
              Target Type
            </label>
            <select
              id="target_type"
              name="target_type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filters.target_type}
              onChange={e => handleFilterChange('target_type', e.target.value)}
            >
              {targetTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target ID Filter */}
          <div>
            <label
              htmlFor="target_id"
              className="block text-sm font-medium text-gray-700"
            >
              Target ID
            </label>
            <input
              type="text"
              name="target_id"
              id="target_id"
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter target ID..."
              value={filters.target_id}
              onChange={e => handleFilterChange('target_id', e.target.value)}
            />
          </div>

          {/* Start Date Filter */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              id="start_date"
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={filters.start_date}
              onChange={e => handleFilterChange('start_date', e.target.value)}
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              id="end_date"
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={filters.end_date}
              onChange={e => handleFilterChange('end_date', e.target.value)}
            />
          </div>
        </div>

        {/* Quick Time Filters */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Time Filters
          </label>
          <div className="flex space-x-2">
            {[
              { period: '1h' as const, label: 'Last Hour' },
              { period: '24h' as const, label: 'Last 24 Hours' },
              { period: '7d' as const, label: 'Last 7 Days' },
              { period: '30d' as const, label: 'Last 30 Days' },
            ].map(({ period, label }) => (
              <button
                key={period}
                type="button"
                onClick={() => setQuickTimeFilter(period)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear All
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <span className="text-sm text-gray-500">
              {Object.values(filters).filter(v => v.trim()).length} filter(s)
              active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
