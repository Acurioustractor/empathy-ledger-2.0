'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface MentorshipProgram {
  id: string;
  program_type: 'professional_development' | 'cultural_competency' | 'storytelling_skills' | 'platform_navigation' | 'community_engagement';
  program_status: 'active' | 'completed' | 'paused' | 'cancelled';
  mentor?: {
    id: string;
    name: string;
    expertise_areas: string[];
    cultural_competency_level: string;
  };
  mentee?: {
    id: string;
    name: string;
    learning_objectives: string[];
  };
  focus_areas: string[];
  meeting_frequency: string;
  completed_sessions: number;
  total_planned_sessions: number;
  mentor_feedback_rating?: number;
  mentee_feedback_rating?: number;
  cultural_protocols_included: boolean;
  aboriginal_mentor_involvement: boolean;
}

interface ReferralOpportunity {
  id: string;
  referral_type: 'professional_opportunity' | 'speaking_engagement' | 'consulting_project' | 'collaboration_opportunity' | 'mentorship_connection';
  opportunity_title: string;
  opportunity_description: string;
  organization_name: string;
  estimated_value: number;
  referral_fee_percentage: number;
  cultural_competency_required: boolean;
  deadline_date: string;
  skill_requirements: string[];
}

interface CollectiveProject {
  id: string;
  project_title: string;
  project_description: string;
  project_type: 'story_collection' | 'community_research' | 'cultural_documentation' | 'platform_enhancement' | 'advocacy_campaign' | 'educational_resource';
  project_lead: {
    id: string;
    name: string;
  };
  current_participants: number;
  max_participants: number;
  aboriginal_community_involvement: boolean;
  cultural_protocols_required: boolean;
  required_skills: string[];
  project_status: string;
  expected_community_impact: string[];
  revenue_sharing_model: {
    model: string;
    community_contribution_percentage: number;
  };
}

interface CommunityConnectionsProps {
  storytellerId: string;
  userRole: 'mentor' | 'mentee' | 'peer' | 'all';
}

export default function CommunityConnections({ storytellerId, userRole }: CommunityConnectionsProps) {
  const [activeSection, setActiveSection] = useState<'mentorship' | 'referrals' | 'projects' | 'networking'>('mentorship');
  const [mentorshipPrograms, setMentorshipPrograms] = useState<MentorshipProgram[]>([]);
  const [referralOpportunities, setReferralOpportunities] = useState<ReferralOpportunity[]>([]);
  const [collectiveProjects, setCollectiveProjects] = useState<CollectiveProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, [storytellerId]);

  const fetchCommunityData = async () => {
    try {
      // Mock data - in production these would be API calls
      const mockMentorshipPrograms: MentorshipProgram[] = [
        {
          id: 'mentorship-1',
          program_type: 'cultural_competency',
          program_status: 'active',
          mentor: userRole !== 'mentee' ? undefined : {
            id: 'mentor-1',
            name: 'Ben Knight',
            expertise_areas: ['Aboriginal Protocol Integration', 'Community-Centered Technology', 'Ethical Platform Development'],
            cultural_competency_level: 'expert'
          },
          mentee: userRole !== 'mentor' ? undefined : {
            id: 'mentee-1',
            name: 'Alexandra Rivera',
            learning_objectives: [
              'Learn Aboriginal community engagement protocols',
              'Develop cultural competency in technology development',
              'Understand community-centered business models'
            ]
          },
          focus_areas: [
            'Aboriginal Protocol Integration',
            'Community Engagement Methods',
            'Cultural Sensitivity in Technology',
            'Ethical Business Development'
          ],
          meeting_frequency: 'bi_weekly',
          completed_sessions: 6,
          total_planned_sessions: 12,
          mentor_feedback_rating: 4.8,
          mentee_feedback_rating: 4.9,
          cultural_protocols_included: true,
          aboriginal_mentor_involvement: true
        },
        {
          id: 'mentorship-2',
          program_type: 'professional_development',
          program_status: 'active',
          mentor: userRole !== 'mentee' ? undefined : {
            id: 'mentor-2',
            name: 'Dr. Sarah Mitchell',
            expertise_areas: ['Professional Storytelling', 'Network Development', 'Career Advancement'],
            cultural_competency_level: 'advanced'
          },
          mentee: userRole !== 'mentor' ? undefined : {
            id: 'mentee-2',
            name: 'James Park',
            learning_objectives: [
              'Develop professional storytelling skills',
              'Build authentic professional network',
              'Create compelling professional narrative'
            ]
          },
          focus_areas: [
            'Professional Storytelling',
            'Network Building',
            'Personal Branding',
            'Career Strategy'
          ],
          meeting_frequency: 'weekly',
          completed_sessions: 4,
          total_planned_sessions: 10,
          mentor_feedback_rating: 4.6,
          cultural_protocols_included: true,
          aboriginal_mentor_involvement: false
        }
      ];

      const mockReferralOpportunities: ReferralOpportunity[] = [
        {
          id: 'referral-1',
          referral_type: 'consulting_project',
          opportunity_title: 'Aboriginal Community Technology Integration Consultant',
          opportunity_description: 'Leading healthcare technology company seeks consultant to guide Aboriginal protocol integration in their community health platform development.',
          organization_name: 'HealthConnect Systems',
          estimated_value: 45000,
          referral_fee_percentage: 10,
          cultural_competency_required: true,
          deadline_date: '2024-02-15',
          skill_requirements: [
            'Aboriginal Community Engagement',
            'Technology Platform Development',
            'Healthcare System Integration',
            'Cultural Protocol Implementation'
          ]
        },
        {
          id: 'referral-2',
          referral_type: 'speaking_engagement',
          opportunity_title: 'Keynote: Future of Ethical Technology Development',
          opportunity_description: 'International technology conference keynote on building community-centered platforms with Aboriginal protocol integration.',
          organization_name: 'TechEthics Global Conference',
          estimated_value: 15000,
          referral_fee_percentage: 8,
          cultural_competency_required: true,
          deadline_date: '2024-01-30',
          skill_requirements: [
            'Public Speaking',
            'Technology Ethics',
            'Community-Centered Development',
            'Aboriginal Protocol Knowledge'
          ]
        }
      ];

      const mockCollectiveProjects: CollectiveProject[] = [
        {
          id: 'project-1',
          project_title: 'Aboriginal Technology Protocol Documentation',
          project_description: 'Collaborative project to create comprehensive documentation of Aboriginal protocols for technology development, guided by Aboriginal Advisory Council.',
          project_type: 'cultural_documentation',
          project_lead: {
            id: 'lead-1',
            name: 'Elder Mary Wilson'
          },
          current_participants: 7,
          max_participants: 12,
          aboriginal_community_involvement: true,
          cultural_protocols_required: true,
          required_skills: [
            'Cultural Research',
            'Documentation',
            'Community Engagement',
            'Technology Understanding'
          ],
          project_status: 'active',
          expected_community_impact: [
            'Standardized Aboriginal protocols for technology developers',
            'Increased cultural competency in technology sector',
            'Community ownership of cultural knowledge sharing',
            'Educational resource for future technology projects'
          ],
          revenue_sharing_model: {
            model: 'community_focused',
            community_contribution_percentage: 80
          }
        },
        {
          id: 'project-2',
          project_title: 'Community Storytelling Platform Enhancement',
          project_description: 'Collaborative development of new features for the Empathy Ledger platform, focused on improving storyteller experience and community value generation.',
          project_type: 'platform_enhancement',
          project_lead: {
            id: 'lead-2',
            name: 'Ben Knight'
          },
          current_participants: 5,
          max_participants: 8,
          aboriginal_community_involvement: true,
          cultural_protocols_required: true,
          required_skills: [
            'Platform Development',
            'User Experience Design',
            'Community Feedback Analysis',
            'Aboriginal Protocol Integration'
          ],
          project_status: 'recruiting',
          expected_community_impact: [
            'Enhanced storyteller tools and analytics',
            'Improved community collaboration features',
            'Better cultural protocol integration',
            'Increased platform accessibility and usability'
          ],
          revenue_sharing_model: {
            model: 'equal_participation',
            community_contribution_percentage: 15
          }
        }
      ];

      setMentorshipPrograms(mockMentorshipPrograms);
      setReferralOpportunities(mockReferralOpportunities);
      setCollectiveProjects(mockCollectiveProjects);
    } catch (error) {
      console.error('Failed to fetch community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMentorshipSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          🎓 Mentorship Programs
        </h3>
        <Button className="bg-purple-600 hover:bg-purple-700">
          {userRole === 'mentor' ? '+ Offer Mentorship' : '+ Find Mentor'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mentorshipPrograms.map((program) => (
          <div key={program.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {program.program_type.replace('_', ' ')} Mentorship
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    program.program_status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {program.program_status}
                  </span>
                  {program.cultural_protocols_included && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      🏛️ Cultural Protocols
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-purple-600">
                  {program.completed_sessions}/{program.total_planned_sessions}
                </div>
                <div className="text-xs text-gray-500">Sessions</div>
              </div>
            </div>

            {program.mentor && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-900 mb-1">Your Mentor</h5>
                <p className="text-purple-800">{program.mentor.name}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {program.mentor.expertise_areas.slice(0, 2).map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {program.mentee && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-1">Your Mentee</h5>
                <p className="text-blue-800">{program.mentee.name}</p>
                <div className="mt-2">
                  <h6 className="text-xs font-medium text-blue-700 mb-1">Learning Goals:</h6>
                  <ul className="text-xs text-blue-600 space-y-1">
                    {program.mentee.learning_objectives.slice(0, 2).map((objective, index) => (
                      <li key={index}>• {objective}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Focus Areas</h5>
              <div className="flex flex-wrap gap-1">
                {program.focus_areas.map((area, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {(program.mentor_feedback_rating || program.mentee_feedback_rating) && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Feedback Ratings</h5>
                <div className="flex space-x-4">
                  {program.mentor_feedback_rating && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">
                        ⭐ {program.mentor_feedback_rating}
                      </div>
                      <div className="text-xs text-gray-500">Mentor</div>
                    </div>
                  )}
                  {program.mentee_feedback_rating && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">
                        ⭐ {program.mentee_feedback_rating}
                      </div>
                      <div className="text-xs text-gray-500">Mentee</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                📅 Schedule Session
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                💬 Message
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReferralsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          🔄 Professional Referral Network
        </h3>
        <Button className="bg-green-600 hover:bg-green-700">
          + Submit Referral
        </Button>
      </div>

      <div className="space-y-4">
        {referralOpportunities.map((opportunity) => (
          <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{opportunity.opportunity_title}</h4>
                <p className="text-gray-600">{opportunity.organization_name}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {opportunity.referral_type.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  ${opportunity.estimated_value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {opportunity.referral_fee_percentage}% referral fee
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{opportunity.opportunity_description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Required Skills</h5>
                <div className="flex flex-wrap gap-1">
                  {opportunity.skill_requirements.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Deadline</h5>
                <p className="text-gray-600">{new Date(opportunity.deadline_date).toLocaleDateString()}</p>
                {opportunity.cultural_competency_required && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      🌏 Cultural Competency Required
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                📤 Refer Someone
              </Button>
              <Button variant="outline" size="sm">
                💼 Apply Yourself
              </Button>
              <Button variant="outline" size="sm">
                📋 Save for Later
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          👥 Collective Community Projects
        </h3>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + Propose Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {collectiveProjects.map((project) => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{project.project_title}</h4>
                <p className="text-sm text-gray-600">Led by {project.project_lead.name}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                  {project.project_type.replace('_', ' ')}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  {project.current_participants}/{project.max_participants}
                </div>
                <div className="text-xs text-gray-500">Participants</div>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{project.project_description}</p>

            <div className="space-y-3 mb-4">
              {project.aboriginal_community_involvement && (
                <div className="flex items-center text-sm text-orange-700">
                  <span className="mr-2">🏛️</span>
                  Aboriginal Community Involvement
                </div>
              )}
              {project.cultural_protocols_required && (
                <div className="flex items-center text-sm text-green-700">
                  <span className="mr-2">✅</span>
                  Cultural Protocols Required
                </div>
              )}
            </div>

            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Required Skills</h5>
              <div className="flex flex-wrap gap-1">
                {project.required_skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Expected Community Impact</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {project.expected_community_impact.slice(0, 2).map((impact, index) => (
                  <li key={index}>• {impact}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-1">Revenue Sharing</h5>
              <p className="text-sm text-blue-700">
                {project.revenue_sharing_model.model.replace('_', ' ')} • 
                {project.revenue_sharing_model.community_contribution_percentage}% to community
              </p>
            </div>

            <div className="flex space-x-2">
              <Button className="bg-blue-600 hover:bg-blue-700 flex-1" size="sm">
                🤝 Join Project
              </Button>
              <Button variant="outline" size="sm">
                📧 Contact Lead
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-green-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Community Connections</h1>
        <p className="text-purple-100">
          Build meaningful professional relationships through mentorship, referrals, and collective projects
        </p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'mentorship', label: '🎓 Mentorship', count: mentorshipPrograms.length },
            { key: 'referrals', label: '🔄 Referrals', count: referralOpportunities.length },
            { key: 'projects', label: '👥 Projects', count: collectiveProjects.length },
            { key: 'networking', label: '🤝 Networking', count: '12' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeSection === 'mentorship' && renderMentorshipSection()}
      {activeSection === 'referrals' && renderReferralsSection()}
      {activeSection === 'projects' && renderProjectsSection()}
      {activeSection === 'networking' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Professional Networking Events</h3>
          <p className="text-gray-600">Coming in Sprint 3 Week 2 full implementation</p>
        </div>
      )}
    </div>
  );
}