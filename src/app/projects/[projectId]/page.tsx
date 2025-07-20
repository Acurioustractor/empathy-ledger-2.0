/**
 * Project Homepage - Dynamic White-Label Interface
 * 
 * Philosophy: Each organization gets a fully branded experience that reflects
 * their identity while maintaining sovereignty principles.
 */

import React from 'react';
import { BrandedLayout } from '@/components/branded-layout';
import { ProjectStoryCards } from '@/components/project-story-cards';
import { ProjectInsightsSummary } from '@/components/project-insights-summary';
import { ProjectCommunityStats } from '@/components/project-community-stats';

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params;

  return (
    <BrandedLayout projectId={projectId}>
      <div className="space-y-12">
        {/* Hero Section */}
        <ProjectHeroSection projectId={projectId} />
        
        {/* Community Stats */}
        <section className="container mx-auto px-4">
          <ProjectCommunityStats projectId={projectId} />
        </section>

        {/* Recent Stories Preview */}
        <section className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 brand-primary font-brand-heading">
              Recent Community Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the experiences and wisdom shared by our community members.
            </p>
          </div>
          <ProjectStoryCards projectId={projectId} limit={6} />
          <div className="text-center mt-8">
            <a 
              href={`/projects/${projectId}/stories`}
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              View All Stories
            </a>
          </div>
        </section>

        {/* Community Insights */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 brand-primary font-brand-heading">
                Community Insights
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Patterns and wisdom emerging from our collective stories.
              </p>
            </div>
            <ProjectInsightsSummary projectId={projectId} />
            <div className="text-center mt-8">
              <a 
                href={`/projects/${projectId}/insights`}
                className="inline-block px-6 py-3 bg-brand-secondary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Explore All Insights
              </a>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <ProjectCallToAction projectId={projectId} />
      </div>
    </BrandedLayout>
  );
}

interface ProjectHeroSectionProps {
  projectId: string;
}

function ProjectHeroSection({ projectId }: ProjectHeroSectionProps) {
  return (
    <section className="hero-section py-20 text-center bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-brand-heading">
            Your Voice Creates Change
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
            Share your story, connect with others, and help build a stronger community together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`/projects/${projectId}/submit`}
              className="inline-block px-8 py-4 bg-white text-brand-primary rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow"
            >
              Share Your Story
            </a>
            <a 
              href={`/projects/${projectId}/stories`}
              className="inline-block px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-brand-primary transition-colors"
            >
              Read Stories
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ProjectCallToActionProps {
  projectId: string;
}

function ProjectCallToAction({ projectId }: ProjectCallToActionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-brand-accent to-brand-primary rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-brand-heading">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Your experience matters. Join our community and help create positive change through the power of storytelling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`/projects/${projectId}/submit`}
              className="inline-block px-8 py-4 bg-white text-brand-primary rounded-lg font-semibold text-lg hover:shadow-xl transition-shadow"
            >
              Get Started
            </a>
            <a 
              href={`/projects/${projectId}/about`}
              className="inline-block px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-brand-primary transition-colors"
            >
              Learn More
            </a>
          </div>
          
          {/* Sovereignty Notice */}
          <div className="mt-8 pt-8 border-t border-white border-opacity-20">
            <p className="text-sm opacity-75 max-w-2xl mx-auto">
              <strong>Your Data, Your Choice:</strong> You maintain complete control over your story. 
              Choose how it's shared, who can see it, and how it's used. Community sovereignty and 
              storyteller empowerment are at the heart of everything we do.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}