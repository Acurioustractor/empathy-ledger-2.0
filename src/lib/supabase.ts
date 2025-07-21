/**
 * Supabase client configuration for Empathy Ledger
 *
 * Philosophy: Every database interaction should respect community sovereignty,
 * honor cultural protocols, and ensure storytellers maintain control over their narratives.
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database-types';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
    console.warn(
      'Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );

    // Return null for missing environment variables during build
    return null;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Custom storage for community-specific auth preferences
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    // Global settings that respect community sovereignty
    global: {
      headers: {
        'X-Community-Platform': 'empathy-ledger',
        'X-Philosophy': 'community-sovereignty',
      },
    },
  });
}
