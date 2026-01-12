'use client';

import dynamic from 'next/dynamic';

const StoryConstellation = dynamic(
  () => import('./StoryConstellation'),
  { ssr: false }
);

export default function ConstellationWrapper() {
  return <StoryConstellation />;
}