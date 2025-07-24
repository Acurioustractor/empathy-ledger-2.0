/**
 * Direct Supabase Client - Temporary fix for RLS issues
 * Server-side queries to bypass client RLS problems
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Regular client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (only works on server)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not available');
  }
  return createClient<Database>(supabaseUrl, serviceKey);
}