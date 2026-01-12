// @ts-nocheck - Component prop interfaces need proper type definitions
/**
 * Project Embed Management Page
 *
 * Philosophy: Organizations control how their stories are shared
 * beyond the platform while maintaining sovereignty principles.
 */

import React from 'react';
// import ProjectEmbedClient from './ProjectEmbedClient';

interface ProjectEmbedPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectEmbedPage({ params }: ProjectEmbedPageProps) {
  const { projectId } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Project Embed (Coming Soon)</h1>
      <p>Embed configuration for project: {projectId}</p>
    </div>
  );
}
