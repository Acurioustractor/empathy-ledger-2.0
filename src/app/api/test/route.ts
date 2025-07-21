/**
 * Simple Test API - No Auth Required
 *
 * Philosophy: Basic health check to verify the platform is running
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Empathy Ledger API is running!',
    timestamp: new Date().toISOString(),
    platform: 'Multi-tenant storytelling platform',
    version: '2.0',
    sovereignty_principles: {
      community_ownership: true,
      storyteller_control: true,
      cultural_protocols: true,
      value_sharing: true,
    },
    features_ready: [
      'Multi-tenant projects',
      'Custom branding system',
      'Analytics dashboard',
      'Embeddable widgets',
      'Sovereignty compliance',
    ],
  });
}
