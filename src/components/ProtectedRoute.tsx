/**
 * Protected Route Component for Community Authentication
 *
 * Philosophy: Access control should feel like community membership, not corporate gatekeeping.
 * This component ensures users feel welcomed while maintaining appropriate access controls.
 */

'use client';

import { useCommunityMember } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CommunityProfileSetup from './CommunityProfileSetup';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireCompletedProfile?: boolean;
  allowedRoles?: string[];
}

function CommunityProtectedRoute({
  children,
  requireAuth = true,
  requireCompletedProfile = false,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { isSignedIn, hasCompletedProfile, needsProfileSetup, role } =
    useCommunityMember();
  const router = useRouter();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    // Redirect to sign-in if authentication is required but user is not signed in
    if (requireAuth && !isSignedIn) {
      router.push('/auth/sign-in');
      return;
    }

    // Show profile setup if user is signed in but needs to complete profile
    if (
      isSignedIn &&
      needsProfileSetup &&
      (requireCompletedProfile || requireAuth)
    ) {
      setShowProfileSetup(true);
      return;
    }

    // Check role permissions
    if (allowedRoles.length > 0 && isSignedIn && hasCompletedProfile) {
      if (!allowedRoles.includes(role)) {
        router.push('/unauthorized');
        return;
      }
    }

    // Hide profile setup if all conditions are met
    setShowProfileSetup(false);
  }, [
    isSignedIn,
    hasCompletedProfile,
    needsProfileSetup,
    role,
    requireAuth,
    requireCompletedProfile,
    allowedRoles,
    router,
  ]);

  // Loading state
  if (isSignedIn === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-xl animate-pulse"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            🌱
          </div>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Connecting to community...
          </p>
        </div>
      </div>
    );
  }

  // Redirecting to sign-in
  if (requireAuth && !isSignedIn) {
    return null;
  }

  // Show profile setup
  if (showProfileSetup) {
    return (
      <CommunityProfileSetup
        onComplete={() => {
          setShowProfileSetup(false);
          // Refresh the page to update user data
          window.location.reload();
        }}
      />
    );
  }

  // Check role permissions (after profile is complete)
  if (
    allowedRoles.length > 0 &&
    isSignedIn &&
    hasCompletedProfile &&
    !allowedRoles.includes(role)
  ) {
    return null; // Redirecting
  }

  return <>{children}</>;
}

// Default export with full features
export default CommunityProtectedRoute;

// Simple community protected route for legacy compatibility
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <CommunityProtectedRoute requireAuth={true} requireCompletedProfile={true}>
      {children}
    </CommunityProtectedRoute>
  );
}
