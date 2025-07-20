'use client';

export function SystemHealth() {
  // Mock system health data - in real implementation, this would come from monitoring services
  const systemMetrics = [
    {
      name: 'Database',
      status: 'healthy',
      responseTime: '12ms',
      uptime: '99.99%',
      lastCheck: '2 minutes ago'
    },
    {
      name: 'API Gateway',
      status: 'healthy',
      responseTime: '145ms',
      uptime: '99.95%',
      lastCheck: '1 minute ago'
    },
    {
      name: 'File Storage',
      status: 'healthy',
      responseTime: '89ms',
      uptime: '100%',
      lastCheck: '30 seconds ago'
    },
    {
      name: 'Email Service',
      status: 'warning',
      responseTime: '2.1s',
      uptime: '99.80%',
      lastCheck: '5 minutes ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const overallStatus = systemMetrics.every(m => m.status === 'healthy') 
    ? 'healthy' 
    : systemMetrics.some(m => m.status === 'critical') 
    ? 'critical' 
    : 'warning';

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            System Health
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
              overallStatus
            )}`}
          >
            {overallStatus}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Real-time monitoring of platform services
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {systemMetrics.map((metric) => (
            <li key={metric.name} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {metric.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last checked {metric.lastCheck}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-gray-500">Response:</span>
                      <span className="ml-1 font-medium">{metric.responseTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Uptime:</span>
                      <span className="ml-1 font-medium">{metric.uptime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-50 px-6 py-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {systemMetrics.filter(m => m.status === 'healthy').length} of {systemMetrics.length} services healthy
          </span>
          <button
            type="button"
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            View detailed metrics →
          </button>
        </div>
      </div>
    </div>
  );
}