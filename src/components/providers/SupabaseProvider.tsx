'use client';

import React, { useEffect } from 'react';
import { setupKeepAlive } from '@/lib/supabase-keepalive';

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Set up automatic keep-alive for Supabase
    const cleanup = setupKeepAlive();

    return cleanup;
  }, []);

  return <>{children}</>;
}
