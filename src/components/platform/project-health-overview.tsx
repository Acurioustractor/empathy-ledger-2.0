'use client';

interface Project {
  id: string;
  name: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectHealthOverviewProps {
  projects: Project[];
}

export function ProjectHealthOverview({ projects }: ProjectHealthOverviewProps) {
  const getHealthStatus = (project: Project) => {
    // Mock health calculation - in real implementation, this would use actual metrics
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (project.subscription_status !== 'active') return 'critical';
    if (daysSinceUpdate > 30) return 'warning';
    if (daysSinceUpdate > 7) return 'moderate';
    return 'healthy';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'organization': return 'bg-blue-100 text-blue-800';
      case 'community': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Project Health Overview
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Recent projects and their current status
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {projects.map((project) => {
            const healthStatus = getHealthStatus(project);
            return (
              <li key={project.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {project.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(
                            project.subscription_tier
                          )}`}
                        >
                          {project.subscription_tier}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getHealthColor(
                        healthStatus
                      )}`}
                    >
                      {healthStatus}
                    </span>
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      {projects.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500">No projects found</p>
        </div>
      )}
      
      <div className="bg-gray-50 px-6 py-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            Showing {projects.length} of {projects.length} projects
          </span>
          <a
            href="/admin/platform/projects"
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            View all projects →
          </a>
        </div>
      </div>
    </div>
  );
}