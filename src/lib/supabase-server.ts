/**
 * Server-side Supabase client for Empathy Ledger
 * 
 * Philosophy: Server-side operations must maintain the same respect for
 * community sovereignty and cultural protocols as client-side interactions.
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      // Server-side settings that respect community sovereignty
      global: {
        headers: {
          'X-Community-Platform': 'empathy-ledger',
          'X-Philosophy': 'community-sovereignty',
          'X-Client-Type': 'server'
        }
      }
    }
  )
}

/**
 * Get server-side Supabase client for admin operations
 * Only use when community consent and cultural protocols have been verified
 */
export async function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_KEY for admin operations')
  }

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Admin client doesn't need to set cookies
        },
      },
      global: {
        headers: {
          'X-Community-Platform': 'empathy-ledger',
          'X-Philosophy': 'community-sovereignty',
          'X-Client-Type': 'admin'
        }
      }
    }
  )
}