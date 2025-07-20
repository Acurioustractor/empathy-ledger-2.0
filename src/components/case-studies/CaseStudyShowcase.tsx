'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import SecurityBadge from '@/components/trust/SecurityBadge';

interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: 'healthcare' | 'education' | 'community' | 'policy' | 'research';
  location: string;
  timeframe: string;
  participants: number;
  impact: {
    metric: string;
    value: string;
    description: string;
  }[];
  challenge: string;
  solution: string;
  outcomes: string[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
  image: string;
  modules: string[];
  status: 'ongoing' | 'completed' | 'pilot';
  featured?: boolean;
}

interface CaseStudyShowcaseProps {
  className?: string;
  showFilters?: boolean;
  layout?: 'grid' | 'featured' | 'list';
  featuredOnly?: boolean;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'mental-health-brisbane',
    title: 'Transforming Mental Health Services in Brisbane',
    subtitle: 'Community stories drive systemic change in healthcare access',
    category: 'healthcare',
    location: 'Brisbane, Queensland',
    timeframe: '18 months',
    participants: 847,
    impact: [
      {
        metric: 'Service Improvements',
        value: '23',
        description: 'New initiatives launched based on community insights'
      },
      {
        metric: 'Wait Time Reduction',
        value: '67%',
        description: 'Average reduction in mental health service wait times'
      },
      {
        metric: 'Community Satisfaction',
        value: '89%',
        description: 'Increased satisfaction with mental health services'
      }
    ],
    challenge: 'Mental health services in Brisbane were overwhelmed, with long wait times and services that didn\'t meet community needs. Traditional feedback mechanisms weren\'t capturing the full picture of community experiences.',
    solution: 'Empathy Ledger\'s Story Collection Engine enabled safe, anonymous sharing of mental health experiences. The Community Insight Generator identified patterns in access barriers, service gaps, and community needs while protecting individual privacy.',
    outcomes: [
      'Redesigned intake processes based on community feedback',
      'New peer support programs launched in identified high-need areas',
      'Policy changes to reduce administrative barriers',
      'Training programs for healthcare workers on community-identified issues'
    ],
    quote: {
      text: 'For the first time, we could hear our community\'s real experiences without anyone having to expose their personal struggles. The insights transformed how we deliver mental health support.',
      author: 'Dr. Sarah Chen',
      role: 'Director, Brisbane Community Health Network'
    },
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: ['Story Collection Engine', 'Privacy Preservation Engine', 'Community Insight Generator', 'Impact Measurement System'],
    status: 'completed',
    featured: true
  },
  {
    id: 'education-equity-sydney',
    title: 'Special Needs Education Advocacy in Sydney',
    subtitle: 'Parent stories unite to improve inclusive education policies',
    category: 'education',
    location: 'Sydney, New South Wales',
    timeframe: '12 months',
    participants: 234,
    impact: [
      {
        metric: 'Policy Changes',
        value: '8',
        description: 'New inclusive education policies implemented'
      },
      {
        metric: 'Schools Engaged',
        value: '45',
        description: 'Schools that improved their inclusive practices'
      },
      {
        metric: 'Support Network Growth',
        value: '340%',
        description: 'Increase in parent support network participation'
      }
    ],
    challenge: 'Parents of children with special needs were isolated and struggling to navigate complex education systems. Individual advocacy efforts were ineffective against systemic barriers.',
    solution: 'The Community Governance Portal enabled parents to safely share experiences and collectively identify the most critical issues. Anonymous story clustering revealed patterns that informed targeted advocacy efforts.',
    outcomes: [
      'State-wide policy changes for inclusive education funding',
      'New teacher training requirements for inclusive practices',
      'Streamlined assessment processes for special needs students',
      'Parent advisory council established with formal government recognition'
    ],
    quote: {
      text: 'Our individual voices became powerful when we could safely share our stories together. The platform helped us move from feeling isolated to creating real change for our children.',
      author: 'Maria Rodriguez',
      role: 'Parent Advocate & Community Organizer'
    },
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: ['Story Collection Engine', 'Community Governance Portal', 'Privacy Preservation Engine', 'Impact Tracking'],
    status: 'completed'
  },
  {
    id: 'youth-engagement-perth',
    title: 'Youth Voice in Community Planning',
    subtitle: 'Young people shape the future of their neighborhoods',
    category: 'community',
    location: 'Perth, Western Australia',
    timeframe: '24 months',
    participants: 156,
    impact: [
      {
        metric: 'New Programs',
        value: '12',
        description: 'Youth-designed community programs launched'
      },
      {
        metric: 'Council Representation',
        value: '100%',
        description: 'Youth council seats filled for first time'
      },
      {
        metric: 'Engagement Increase',
        value: '280%',
        description: 'Growth in youth participation in civic activities'
      }
    ],
    challenge: 'Young people in Perth felt unheard in community planning decisions. Traditional consultation methods failed to engage youth meaningfully, leading to services and spaces that didn\'t meet their needs.',
    solution: 'Using multimedia story collection tools, young people shared their visions for community spaces through video, audio, and text. The Story Galaxy visualization helped community leaders understand youth perspectives and priorities.',
    outcomes: [
      'Three new youth-designed community spaces opened',
      'Youth council established with real decision-making power',
      'Annual youth-led community planning process implemented',
      'Mentorship programs connecting youth with community leaders'
    ],
    quote: {
      text: 'Finally, adults could see our ideas as more than just complaints. The platform showed them we have real solutions and deserve a seat at the table.',
      author: 'James Nakamura',
      role: 'Youth Council Representative'
    },
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: ['Story Collection Engine', 'Story Galaxy Visualization', 'Community Governance Portal', 'Impact Measurement System'],
    status: 'ongoing'
  },
  {
    id: 'housing-crisis-melbourne',
    title: 'Housing Security Research Project',
    subtitle: 'Academic study reveals hidden impacts of housing insecurity',
    category: 'research',
    location: 'Melbourne, Victoria',
    timeframe: '36 months',
    participants: 612,
    impact: [
      {
        metric: 'Research Papers',
        value: '7',
        description: 'Peer-reviewed publications from community insights'
      },
      {
        metric: 'Policy Recommendations',
        value: '15',
        description: 'Evidence-based recommendations to government'
      },
      {
        metric: 'Community Benefit',
        value: '$47K',
        description: 'Payments to story contributors'
      }
    ],
    challenge: 'Traditional housing research missed the lived experience of housing insecurity. Vulnerable populations were often excluded from studies due to privacy concerns and institutional barriers.',
    solution: 'The Ethical Research Toolkit enabled a major university study while maintaining complete anonymity. Zero-knowledge proofs allowed researchers to verify insights without accessing individual stories.',
    outcomes: [
      'First comprehensive study of hidden homelessness patterns',
      'New understanding of family housing insecurity impacts',
      'Evidence for targeted support program development',
      'Model for ethical community-academic partnerships'
    ],
    quote: {
      text: 'This platform allowed us to conduct rigorous research while ensuring community members maintained complete control over their stories. It\'s the future of ethical research.',
      author: 'Prof. Elena Vasquez',
      role: 'Director, Social Policy Research Institute'
    },
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: ['Ethical Research Toolkit', 'Privacy Preservation Engine', 'Community Insight Generator', 'Developer API Gateway'],
    status: 'ongoing'
  },
  {
    id: 'indigenous-data-sovereignty',
    title: 'Cultural Knowledge Preservation',
    subtitle: 'Indigenous community maintains control over traditional knowledge',
    category: 'community',
    location: 'Remote Northern Territory',
    timeframe: 'Ongoing',
    participants: 89,
    impact: [
      {
        metric: 'Stories Preserved',
        value: '127',
        description: 'Traditional stories safely documented'
      },
      {
        metric: 'Elder Approval Rate',
        value: '100%',
        description: 'All stories approved by cultural authorities'
      },
      {
        metric: 'Youth Engagement',
        value: '78%',
        description: 'Young community members actively participating'
      }
    ],
    challenge: 'An Indigenous community wanted to preserve traditional knowledge while maintaining complete cultural control. Existing digital platforms didn\'t respect Indigenous data sovereignty principles.',
    solution: 'Custom implementation of Indigenous Data Protocols module ensured Elder approval workflows, cultural protocol enforcement, and community benefit sharing. All data remains under community ownership.',
    outcomes: [
      'Digital archive of traditional stories under community control',
      'New cultural education programs for youth',
      'Model for Indigenous data sovereignty implementation',
      'Ongoing revenue stream for community through ethical research partnerships'
    ],
    quote: {
      text: 'This is the first time we\'ve seen technology that truly respects our protocols. Our stories remain ours, and our community benefits from sharing our knowledge on our terms.',
      author: 'Elder Mary Namatjira',
      role: 'Cultural Authority & Community Leader'
    },
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    modules: ['Indigenous Data Protocols', 'Community Governance Portal', 'Story Collection Engine', 'Privacy Preservation Engine'],
    status: 'pilot',
    featured: true
  }
];

const CaseStudyShowcase: React.FC<CaseStudyShowcaseProps> = ({
  className = '',
  showFilters = true,
  layout = 'grid',
  featuredOnly = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  const categories = [
    { key: 'all', name: 'All Studies', count: caseStudies.length },
    { key: 'healthcare', name: 'Healthcare', count: caseStudies.filter(cs => cs.category === 'healthcare').length },
    { key: 'education', name: 'Education', count: caseStudies.filter(cs => cs.category === 'education').length },
    { key: 'community', name: 'Community', count: caseStudies.filter(cs => cs.category === 'community').length },
    { key: 'policy', name: 'Policy', count: caseStudies.filter(cs => cs.category === 'policy').length },
    { key: 'research', name: 'Research', count: caseStudies.filter(cs => cs.category === 'research').length }
  ];

  let filteredStudies = featuredOnly 
    ? caseStudies.filter(cs => cs.featured)
    : caseStudies;

  if (selectedCategory !== 'all') {
    filteredStudies = filteredStudies.filter(cs => cs.category === selectedCategory);
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      healthcare: 'teal',
      education: 'primary',
      community: 'coral',
      policy: 'yellow',
      research: 'purple'
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'ongoing': return 'blue';
      case 'pilot': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Category Filter */}
      {showFilters && !featuredOnly && (
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
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

      {/* Case Studies */}
      <div className={`
        ${layout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''}
        ${layout === 'featured' ? 'space-y-16' : ''}
        ${layout === 'list' ? 'space-y-6' : ''}
      `}>
        {filteredStudies.map((study) => {
          const categoryColor = getCategoryColor(study.category);
          
          return (
            <div
              key={study.id}
              className={`
                bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300
                ${layout === 'featured' ? 'grid lg:grid-cols-2 gap-0' : ''}
                ${study.featured ? 'ring-2 ring-primary-200' : ''}
              `}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={study.image}
                  alt={study.title}
                  className={`
                    w-full object-cover
                    ${layout === 'featured' ? 'h-64 lg:h-full' : 'h-48'}
                  `}
                />
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium capitalize
                    bg-${categoryColor}-100 text-${categoryColor}-800
                  `}>
                    {study.category}
                  </span>
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${study.status === 'completed' ? 'bg-green-100 text-green-800' :
                      study.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}
                  `}>
                    {study.status}
                  </span>
                  {study.featured && (
                    <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                    {study.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{study.subtitle}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <span>📍 {study.location}</span>
                    <span>⏱️ {study.timeframe}</span>
                    <span>👥 {study.participants} participants</span>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {study.impact.slice(0, 3).map((metric, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-primary-600 mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-600">
                          {metric.metric}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  {layout === 'featured' && (
                    <blockquote className="border-l-4 border-primary-300 pl-4 mb-6">
                      <p className="text-gray-700 italic mb-2">"{study.quote.text}"</p>
                      <footer className="text-sm text-gray-600">
                        <strong>{study.quote.author}</strong>, {study.quote.role}
                      </footer>
                    </blockquote>
                  )}

                  {/* Modules Used */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Modules Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {study.modules.slice(0, 2).map((module, index) => (
                        <SecurityBadge 
                          key={index}
                          variant="privacy" 
                          text={module}
                          showBackground={false}
                          className="scale-75"
                        />
                      ))}
                      {study.modules.length > 2 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{study.modules.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => setSelectedCaseStudy(study)}
                  >
                    View Full Study
                  </Button>
                  <Button variant="secondary" size="sm" href="/contact">
                    Similar Project?
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Case Study Modal */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedCaseStudy.title}
                  </h2>
                  <p className="text-lg text-gray-600">{selectedCaseStudy.subtitle}</p>
                </div>
                <button
                  onClick={() => setSelectedCaseStudy(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">The Challenge</h3>
                    <p className="text-gray-700">{selectedCaseStudy.challenge}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Solution</h3>
                    <p className="text-gray-700">{selectedCaseStudy.solution}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Outcomes</h3>
                    <ul className="space-y-2">
                      {selectedCaseStudy.outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <blockquote className="border-l-4 border-primary-300 pl-6 py-4 bg-primary-50 rounded-r-lg">
                    <p className="text-gray-700 italic mb-3">"{selectedCaseStudy.quote.text}"</p>
                    <footer className="text-sm text-gray-600">
                      <strong>{selectedCaseStudy.quote.author}</strong><br />
                      {selectedCaseStudy.quote.role}
                    </footer>
                  </blockquote>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Metrics</h3>
                    <div className="space-y-4">
                      {selectedCaseStudy.impact.map((metric, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-primary-600 mb-1">
                            {metric.value}
                          </div>
                          <div className="font-medium text-gray-900 mb-1">
                            {metric.metric}
                          </div>
                          <div className="text-sm text-gray-600">
                            {metric.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Modules</h3>
                    <div className="space-y-2">
                      {selectedCaseStudy.modules.map((module, index) => (
                        <div key={index} className="bg-primary-50 p-3 rounded-lg text-sm font-medium text-primary-800">
                          {module}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="cta" fullWidth href="/contact">
                      Start Similar Project
                    </Button>
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

export default CaseStudyShowcase;