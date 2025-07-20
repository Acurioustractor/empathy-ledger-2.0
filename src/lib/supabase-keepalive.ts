/**
 * SUPABASE KEEP-ALIVE SYSTEM
 * Prevents free tier project from auto-pausing
 */

import { supabase } from './supabase-auth';

/**
 * Simple health check to keep Supabase active
 */
export async function healthCheck(): Promise<{ success: boolean; timestamp: string }> {
  try {
    // Simple query to keep database active
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Health check failed:', error);
      return { success: false, timestamp: new Date().toISOString() };
    }

    console.log('Supabase health check successful');
    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Health check error:', error);
    return { success: false, timestamp: new Date().toISOString() };
  }
}

/**
 * Keep-alive function to call periodically
 */
export async function keepAlive(): Promise<void> {
  try {
    await healthCheck();
    
    // Store last keep-alive in localStorage for tracking
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_last_keepalive', new Date().toISOString());
    }
  } catch (error) {
    console.error('Keep-alive failed:', error);
  }
}

/**
 * Set up automatic keep-alive (call this in your app)
 */
export function setupKeepAlive(): () => void {
  // Keep alive every 6 hours (free tier pauses after ~1 week)
  const interval = setInterval(keepAlive, 6 * 60 * 60 * 1000);
  
  // Initial keep-alive
  keepAlive();
  
  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Check if Supabase is responsive
 */
export async function checkSupabaseStatus(): Promise<{
  isActive: boolean;
  lastKeepAlive?: string;
  error?: string;
}> {
  try {
    const result = await healthCheck();
    
    const lastKeepAlive = typeof window !== 'undefined' 
      ? localStorage.getItem('supabase_last_keepalive') 
      : null;

    return {
      isActive: result.success,
      lastKeepAlive: lastKeepAlive || undefined,
      error: result.success ? undefined : 'Health check failed'
    };
  } catch (error) {
    return {
      isActive: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}