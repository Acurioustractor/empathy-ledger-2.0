import React from 'react';
import OrganizationDashboard from '@/components/organization/OrganizationDashboard';

export default function OrganizationPage() {
  // In a real app, this would be dynamic based on the user's organization
  // For demo purposes, using a fixed organization ID
  const organizationId = 'demo-org-1';

  return <OrganizationDashboard organizationId={organizationId} />;
}