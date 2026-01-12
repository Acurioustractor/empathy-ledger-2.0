'use client';

import React from 'react';

// MINIMAL PROVIDER - NO COMPLEX SYSTEMS
export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Just pass through children - no complex monitoring/factory/health systems
  return <>{children}</>;
}
