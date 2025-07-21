'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

interface Module {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'analytics' | 'community' | 'governance' | 'integration';
  status: 'live' | 'beta' | 'coming-soon';
  icon: string;
  features: string[];
  useCases: string[];
  privacyLevel: 'public' | 'aggregate' | 'encrypted';
  image?: string;
  demoUrl?: string;
  documentationUrl?: string;
}

interface PlatformModulesProps {
  className?: string;
  showCategories?: boolean;
  layout?: 'grid' | 'list' | 'featured';
}

const modules: Module[] = [
  {
    id: 'story-collection',
    name: 'Story Collection Engine',
    description:
      'Secure, user-friendly story submission with multimedia support and privacy controls.',
    category: 'core',
    status: 'live',
    icon: '📖',
    features: [
      'Multi-format story input (text, audio, video)',
      'Progressive disclosure privacy controls',
      'Real-time encryption before submission',
      'Cultural protocol integration',
      'Offline submission capability',
    ],
    useCases: [
      'Individual story sharing',
      'Community listening sessions',
      'Research data collection',
      'Crisis response gathering',
    ],
    privacyLevel: 'encrypted',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/demo/story-collection',
    documentationUrl: '/docs/story-collection',
  },
  {
    id: 'privacy-engine',
    name: 'Privacy Preservation Engine',
    description:
      'Advanced cryptographic protection ensuring individual privacy while enabling community insights.',
    category: 'core',
    status: 'live',
    icon: '🔒',
    features: [
      'End-to-end encryption with client-side keys',
      'Differential privacy for aggregations',
      'Zero-knowledge proof generation',
      'Homomorphic encryption support',
      'GDPR compliance automation',
    ],
    useCases: [
      'Sensitive data protection',
      'Research ethics compliance',
      'Legal requirement adherence',
      'Community trust building',
    ],
    privacyLevel: 'encrypted',
    image:
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/demo/privacy-engine',
    documentationUrl: '/docs/privacy-engine',
  },
  {
    id: 'insight-generator',
    name: 'Community Insight Generator',
    description:
      'AI-powered pattern recognition that reveals community themes without compromising privacy.',
    category: 'analytics',
    status: 'live',
    icon: '🧠',
    features: [
      'Privacy-preserving NLP analysis',
      'Theme identification and clustering',
      'Sentiment trend analysis',
      'Geographic pattern mapping',
      'Impact correlation detection',
    ],
    useCases: [
      'Policy development insights',
      'Service delivery optimization',
      'Community needs assessment',
      'Research hypothesis generation',
    ],
    privacyLevel: 'aggregate',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/demo/insight-generator',
    documentationUrl: '/docs/insight-generator',
  },
  {
    id: 'story-galaxy',
    name: 'Story Galaxy Visualization',
    description:
      'Interactive 3D network visualization showing story connections and community patterns.',
    category: 'analytics',
    status: 'live',
    icon: '🌌',
    features: [
      '3D network visualization',
      'Interactive exploration tools',
      'Theme-based filtering',
      'Geographic clustering',
      'Impact level mapping',
    ],
    useCases: [
      'Community pattern exploration',
      'Research data visualization',
      'Stakeholder presentations',
      'Public engagement tools',
    ],
    privacyLevel: 'aggregate',
    image:
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/story-galaxy',
    documentationUrl: '/docs/story-galaxy',
  },
  {
    id: 'community-governance',
    name: 'Community Governance Portal',
    description:
      'Democratic tools for community decision-making and platform governance.',
    category: 'governance',
    status: 'beta',
    icon: '🏛️',
    features: [
      'Transparent voting systems',
      'Proposal submission and review',
      'Community moderation tools',
      'Cultural protocol enforcement',
      'Consensus-building mechanisms',
    ],
    useCases: [
      'Platform policy decisions',
      'Community rule setting',
      'Resource allocation votes',
      'Cultural protocol updates',
    ],
    privacyLevel: 'public',
    image:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/demo/governance',
    documentationUrl: '/docs/governance',
  },
  {
    id: 'impact-tracking',
    name: 'Impact Measurement System',
    description:
      'Track real-world outcomes and policy changes driven by community stories.',
    category: 'analytics',
    status: 'beta',
    icon: '📊',
    features: [
      'Outcome correlation analysis',
      'Policy change tracking',
      'Service improvement measurement',
      'Community benefit calculation',
      'Long-term trend analysis',
    ],
    useCases: [
      'Grant reporting',
      'Policy impact assessment',
      'Community value demonstration',
      'Research outcome tracking',
    ],
    privacyLevel: 'aggregate',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/demo/impact-tracking',
    documentationUrl: '/docs/impact-tracking',
  },
  {
    id: 'researcher-toolkit',
    name: 'Ethical Research Toolkit',
    description:
      'Tools for researchers to access community insights while maintaining ethical standards.',
    category: 'integration',
    status: 'beta',
    icon: '🔬',
    features: [
      'Ethics review workflow',
      'Consent management system',
      'Anonymous data export',
      'Research protocol templates',
      'Impact sharing requirements',
    ],
    useCases: [
      'Academic research projects',
      'Policy development studies',
      'Community health research',
      'Social impact assessment',
    ],
    privacyLevel: 'aggregate',
    image:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/demo/research-toolkit',
    documentationUrl: '/docs/research-toolkit',
  },
  {
    id: 'api-gateway',
    name: 'Developer API Gateway',
    description:
      'Secure APIs for third-party integrations and custom applications.',
    category: 'integration',
    status: 'live',
    icon: '🔌',
    features: [
      'RESTful API endpoints',
      'GraphQL query interface',
      'Webhook event system',
      'Rate limiting and security',
      'SDK libraries for major languages',
    ],
    useCases: [
      'Custom application development',
      'Third-party service integration',
      'Data pipeline automation',
      'Real-time event processing',
    ],
    privacyLevel: 'aggregate',
    image:
      'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    demoUrl: '/demo/api-gateway',
    documentationUrl: '/docs/api-gateway',
  },
  {
    id: 'indigenous-protocols',
    name: 'Indigenous Data Protocols',
    description:
      'Specialized tools ensuring Indigenous data sovereignty and cultural protocols.',
    category: 'governance',
    status: 'coming-soon',
    icon: '🪃',
    features: [
      'Cultural protocol enforcement',
      'Indigenous data sovereignty',
      'Elder approval workflows',
      'Sacred knowledge protection',
      'Community benefit sharing',
    ],
    useCases: [
      'Indigenous community research',
      'Cultural knowledge preservation',
      'Traditional story collection',
      'Land rights documentation',
    ],
    privacyLevel: 'encrypted',
    image:
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    documentationUrl: '/docs/indigenous-protocols',
  },
];

const PlatformModules: React.FC<PlatformModulesProps> = ({
  className = '',
  showCategories = true,
  layout = 'grid',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const categories = [
    { key: 'all', name: 'All Modules', count: modules.length },
    {
      key: 'core',
      name: 'Core Platform',
      count: modules.filter(m => m.category === 'core').length,
    },
    {
      key: 'analytics',
      name: 'Analytics',
      count: modules.filter(m => m.category === 'analytics').length,
    },
    {
      key: 'community',
      name: 'Community',
      count: modules.filter(m => m.category === 'community').length,
    },
    {
      key: 'governance',
      name: 'Governance',
      count: modules.filter(m => m.category === 'governance').length,
    },
    {
      key: 'integration',
      name: 'Integration',
      count: modules.filter(m => m.category === 'integration').length,
    },
  ];

  const filteredModules =
    selectedCategory === 'all'
      ? modules
      : modules.filter(module => module.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'green';
      case 'beta':
        return 'yellow';
      case 'coming-soon':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'Live';
      case 'beta':
        return 'Beta';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return status;
    }
  };

  const getPrivacyBadgeVariant = (privacyLevel: string) => {
    switch (privacyLevel) {
      case 'encrypted':
        return 'encryption';
      case 'aggregate':
        return 'privacy';
      case 'public':
        return 'certification';
      default:
        return 'privacy';
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Category Filter */}
      {showCategories && (
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      )}

      {/* Modules Grid */}
      <div
        className={`
        ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : ''}
        ${layout === 'list' ? 'space-y-6' : ''}
        ${layout === 'featured' ? 'space-y-12' : ''}
      `}
      >
        {filteredModules.map(module => (
          <div
            key={module.id}
            className={`
              bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300
              border border-gray-100 hover:border-primary-200
              ${layout === 'featured' ? 'grid lg:grid-cols-2 gap-0' : ''}
            `}
          >
            {/* Module Image */}
            <div className="relative overflow-hidden">
              <img
                src={module.image}
                alt={`${module.name} interface preview`}
                className={`
                  w-full object-cover
                  ${layout === 'featured' ? 'h-64 lg:h-full' : 'h-48'}
                `}
              />
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span
                  className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    module.status === 'live'
                      ? 'bg-green-100 text-green-800'
                      : module.status === 'beta'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }
                `}
                >
                  {getStatusText(module.status)}
                </span>
                <SecurityBadge
                  variant={getPrivacyBadgeVariant(module.privacyLevel)}
                  showBackground={true}
                  className="scale-75"
                />
              </div>
              <div className="absolute top-4 right-4 text-3xl">
                {module.icon}
              </div>
            </div>

            {/* Module Content */}
            <div className="p-6 flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {module.name}
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {module.description}
                </p>

                {/* Key Features */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Key Features
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {module.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {module.features.length > 3 && (
                    <button
                      onClick={() => setSelectedModule(module)}
                      className="text-primary-600 text-sm font-medium mt-2 hover:text-primary-700"
                    >
                      +{module.features.length - 3} more features
                    </button>
                  )}
                </div>

                {/* Use Cases */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Use Cases
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {module.useCases.slice(0, 2).map((useCase, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {useCase}
                      </span>
                    ))}
                    {module.useCases.length > 2 && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        +{module.useCases.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {module.demoUrl && module.status !== 'coming-soon' && (
                  <Button variant="primary" size="sm" href={module.demoUrl}>
                    Try Demo
                  </Button>
                )}
                {module.documentationUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    href={module.documentationUrl}
                  >
                    Documentation
                  </Button>
                )}
                <button
                  onClick={() => setSelectedModule(module)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <svg
                    className="w-5 h-5"
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
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedModule.icon} {selectedModule.name}
                  </h2>
                  <p className="text-lg text-gray-700">
                    {selectedModule.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    All Features
                  </h3>
                  <ul className="space-y-2">
                    {selectedModule.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700"
                      >
                        <span className="text-primary-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Use Cases
                  </h3>
                  <ul className="space-y-2">
                    {selectedModule.useCases.map((useCase, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700"
                      >
                        <span className="text-teal-500 mr-2">•</span>
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${
                        selectedModule.status === 'live'
                          ? 'bg-green-100 text-green-800'
                          : selectedModule.status === 'beta'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }
                    `}
                    >
                      {getStatusText(selectedModule.status)}
                    </span>
                    <SecurityBadge
                      variant={getPrivacyBadgeVariant(
                        selectedModule.privacyLevel
                      )}
                      text={`${selectedModule.privacyLevel} data`}
                    />
                  </div>
                  <div className="flex gap-3">
                    {selectedModule.demoUrl &&
                      selectedModule.status !== 'coming-soon' && (
                        <Button variant="primary" href={selectedModule.demoUrl}>
                          Try Demo
                        </Button>
                      )}
                    {selectedModule.documentationUrl && (
                      <Button
                        variant="secondary"
                        href={selectedModule.documentationUrl}
                      >
                        View Documentation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformModules;
