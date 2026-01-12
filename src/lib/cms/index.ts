/**
 * CMS Module Entry Point
 * 
 * Exports all CMS functionality for Empathy Ledger
 * Integrated with existing Supabase patterns for consistency
 */

import { createClient } from '../supabase'
import { CMSService } from './cms-service'

// Use existing Supabase client patterns for consistency
function getCMSClient() {
  const client = createClient()
  if (!client) {
    console.warn('CMS: Supabase client not available - check environment variables')
    return null
  }
  return client
}

// Client-only CMS service for now (server support can be added later)
async function getCMSServerClient() {
  // For now, use the same client pattern
  return getCMSClient()
}

// Initialize CMS service with existing patterns
export const cmsService = new CMSService(getCMSClient, getCMSServerClient)

// Re-export types
export * from './types'
export { CMSService } from './cms-service'

// Export client getters for direct access if needed
export { getCMSClient, getCMSServerClient }