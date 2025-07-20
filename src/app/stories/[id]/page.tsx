import React from 'react';
import StoryDetailView from '@/components/stories/StoryDetailView';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export default function StoryPage({ params }: StoryPageProps) {
  return <StoryDetailView storyId={params.id} />;
}