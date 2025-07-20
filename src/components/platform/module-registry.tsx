'use client';

import { useState } from 'react';

interface Module {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'core' | 'standard' | 'specialized' | 'experimental';
  version: string;
  is_active: boolean;
  is_beta: boolean;
  minimum_tier: 'community' | 'organization' | 'enterprise';
  requires_modules: string[];
  project_modules: Array<{
    project_id: string;
    enabled: boolean;
    first_activated: string;
    last_used: string;
    usage_count: number;
  }>;
}

interface ModuleRegistryProps {
  modules: Module[];
}

export function ModuleRegistry({ modules }: ModuleRegistryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: 'All Modules', count: modules.length },
    { value: 'core', label: 'Core', count: modules.filter(m => m.category === 'core').length },
    { value: 'standard', label: 'Standard', count: modules.filter(m => m.category === 'standard').length },
    { value: 'specialized', label: 'Specialized', count: modules.filter(m => m.category === 'specialized').length },
    { value: 'experimental', label: 'Experimental', count: modules.filter(m => m.category === 'experimental').length },
  ];

  const filteredModules = modules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-red-100 text-red-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'specialized': return 'bg-purple-100 text-purple-800';
      case 'experimental': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'organization': return 'bg-blue-100 text-blue-800';
      case 'community': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageCount = (module: Module) => {
    return module.project_modules.filter(pm => pm.enabled).length;
  };

  const getTotalProjects = () => {
    const allProjectIds = new Set();
    modules.forEach(module => {
      module.project_modules.forEach(pm => {
        allProjectIds.add(pm.project_id);
      });
    });
    return allProjectIds.size;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Module Registry
          </h3>
          
          {/* Search */}
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <div className="max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search modules
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search modules..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6">
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedCategory === category.value
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.label}
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {category.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Module List */}
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {filteredModules.map((module) => (
            <li key={module.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      module.is_active ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <span className={`text-lg font-semibold ${
                        module.is_active ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {module.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {module.name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                          module.category
                        )}`}
                      >
                        {module.category}
                      </span>
                      {module.is_beta && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Beta
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(
                          module.minimum_tier
                        )}`}
                      >
                        {module.minimum_tier}+
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-500">
                      {module.description}
                    </p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Version {module.version}</span>
                      <span>•</span>
                      <span>
                        {getUsageCount(module)} of {getTotalProjects()} projects using
                      </span>
                      {module.requires_modules.length > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            Requires: {module.requires_modules.join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {getUsageCount(module)} projects
                    </div>
                    <div className="text-sm text-gray-500">
                      {module.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      View Usage
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`text-sm font-medium ${
                        module.is_active
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {module.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredModules.length === 0 && (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No modules found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}