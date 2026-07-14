import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/postStorage';
import { onboardingUrlForPlanIntent, resolveSignupPlanIntent } from '@/lib/billing';
import { CheckoutIntentRedirect } from '@/components/CheckoutIntentRedirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ─── Onboarding helpers ───────────────────────────────────────────────────────

/**
 * Returns the localStorage key used to track whether a specific user has
 * completed onboarding. Scoped per-user so different accounts are independent.
 */
export function getOnboardingKey(userId: string): string {
  return `shipos_onboarding_complete_${userId}`;
}

/**
 * Mark onboarding as done for the given user.
 *
 * Writes to BOTH the Supabase user_metadata (the durable, cross-device source of
 * truth) and localStorage (a fast local cache). localStorage alone is not enough:
 * it is wiped on every sign-out, so a returning user would be sent back through
 * onboarding without the server-side flag.
 */
export function markOnboardingComplete(user: User): void {
  try {
    localStorage.setItem(getOnboardingKey(user.id), 'true');
  } catch (e) {
    console.error('Could not save onboarding state', e);
  }
  // Persist on the user record so it survives sign-out and works on other devices.
  if (supabase && user.user_metadata?.onboarding_complete !== true) {
    supabase.auth.updateUser({ data: { onboarding_complete: true } }).then(({ error }) => {
      if (error) console.warn('Could not persist onboarding flag to user metadata:', error.message);
    });
  }
}

/**
 * Check whether the given user has already completed onboarding.
 *
 * The Supabase user_metadata flag is authoritative; the localStorage flag is a
 * local fallback (and the only source in mock mode, where there is no metadata).
 */
export function hasCompletedOnboarding(user: User): boolean {
  if (user.user_metadata?.onboarding_complete === true) return true;
  try {
    return localStorage.getItem(getOnboardingKey(user.id)) === 'true';
  } catch (e) {
    return false;
  }
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

/**
 * Wraps any route that requires authentication.
 *
 * Priority order:
 * 1. Still loading auth state → show spinner (prevents flicker)
 * 2. No user              → redirect to /login?redirect=<current path>
 * 3. User exists but hasn't completed onboarding → redirect to /onboarding
 * 4. All good             → render children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);

  // If the user is authenticated but the onboarding flag isn't set in their metadata,
  // check if they already have a paid plan (meaning they've already paid/onboarded).
  // This handles the edge case where onboarding_complete wasn't written to user metadata
  // (e.g., tab closed before BillingSuccess called markOnboardingComplete).
  useEffect(() => {
    if (!user || hasCompletedOnboarding(user)) {
      setProfileChecked(true);
      return;
    }
    let cancelled = false;
    getUserProfile({ force: true }).then((profile) => {
      if (cancelled) return;
      if (profile && profile.plan && profile.plan !== 'Free') {
        // User already has a paid plan — they've completed onboarding. Stamp the flag
        // so future page loads don't re-run this check.
        markOnboardingComplete(user);
      }
      setProfileChecked(true);
    }).catch(() => setProfileChecked(true));
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading || !profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the path the user was trying to reach so we can redirect back after login
    const redirectPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
        replace
      />
    );
  }

  const oauthRedirect = sessionStorage.getItem('shipos_oauth_redirect');
  if (oauthRedirect) {
    sessionStorage.removeItem('shipos_oauth_redirect');
    if (
      oauthRedirect &&
      !oauthRedirect.startsWith('/onboarding') &&
      oauthRedirect !== '/create-post'
    ) {
      markOnboardingComplete(user);
    }
    return <Navigate to={oauthRedirect} replace />;
  }

  // New users who haven't completed onboarding yet are sent there first.
  // We only do this when they're NOT already on /onboarding (to avoid a loop).
  // Preserve any stored plan intent (e.g. /founder → Google signup).
  if (!hasCompletedOnboarding(user) && location.pathname !== '/onboarding') {
    const intent = resolveSignupPlanIntent(location.search);
    if (intent) {
      return <Navigate to={onboardingUrlForPlanIntent(intent)} replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// ─── PublicOnlyRoute ──────────────────────────────────────────────────────────

/**
 * Wraps public-only routes (login, signup).
 * Redirects already-authenticated users to the dashboard so they
 * don't see the login page while logged in.
 * If they're authenticated but haven't done onboarding, sends them there instead.
 */
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get('redirect');
    const intent = resolveSignupPlanIntent(window.location.search);
    if (intent) {
      return <Navigate to={onboardingUrlForPlanIntent(intent)} replace />;
    }
    const destination = redirectParam
      ? decodeURIComponent(redirectParam)
      : (hasCompletedOnboarding(user) ? '/create-post' : '/onboarding');
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

// ─── AuthOnlyRoute ────────────────────────────────────────────────────────────

/**
 * Requires authentication but does NOT enforce the onboarding check.
 * Use this specifically for the /onboarding route itself — if we used
 * ProtectedRoute there we'd get an infinite redirect loop.
 *
 * If unauthenticated → redirect to /login.
 * If authenticated but onboarding already done → redirect to /create-post.
 * Otherwise → render children (i.e. the onboarding page).
 */
export const AuthOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnTo}`} replace />;
  }

  // Already onboarded but arriving with a plan intent (e.g. /founder via Sign in)
  // → start that checkout instead of bouncing straight to the dashboard.
  if (hasCompletedOnboarding(user)) {
    const intent = resolveSignupPlanIntent(location.search);
    if (intent) {
      return <CheckoutIntentRedirect intent={intent} />;
    }
    return <Navigate to="/create-post" replace />;
  }

  return <>{children}</>;
};

// ─── AdminRoute ───────────────────────────────────────────────────────────────

/**
 * Restricts a route to admin/founder accounts only.
 *
 * Admin emails are configured via the VITE_ADMIN_EMAILS environment variable
 * as a comma-separated list, e.g.:
 *   VITE_ADMIN_EMAILS=you@example.com,partner@example.com
 *
 * Access rules:
 *  - Still loading auth state → spinner
 *  - Not logged in            → redirect to /login
 *  - Logged in but NOT admin  → render <NotFound /> (route is invisible)
 *  - Logged in AND admin      → render children
 *
 * In mock mode (no Supabase), access is granted automatically so the
 * dashboard is still usable locally during development.
 */
export const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isMockMode } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const redirectPath = location.pathname + location.search;
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  // In mock/demo mode (no real Supabase) grant access so the dashboard works locally.
  if (isMockMode) {
    return <>{children}</>;
  }

  // Parse the comma-separated admin email list from the env variable.
  const rawAdminEmails = import.meta.env.VITE_ADMIN_EMAILS ?? '';
  const adminEmails: string[] = rawAdminEmails
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (user.email ?? '').toLowerCase();
  const isAdmin = adminEmails.length > 0 && adminEmails.includes(userEmail);

  if (!isAdmin) {
    // Render NotFound so the route appears non-existent to regular users.
    // We lazy-import to avoid a circular dep with the pages folder.
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};
