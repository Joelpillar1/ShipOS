import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { clearProfileCache } from '@/lib/postStorage';
import { resetSlideshowPrefetchCache } from '@/lib/prefetchSlideshowData';
import { clearSupabaseAuthStorage, hasPendingAuthCallback } from '@/lib/authCallback';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isMockMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ success: boolean; error?: string; redirecting?: boolean }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Remove OAuth tokens from the URL hash so a refresh cannot re-ingest a stale session. */
function stripAuthHashFromUrl() {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  if (!hash) return;
  if (
    hash.includes('access_token') ||
    hash.includes('refresh_token') ||
    hash.includes('error=') ||
    hash.includes('error_description')
  ) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

function isMissingSessionError(error: { message?: string; name?: string; status?: number } | null) {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('auth session missing') ||
    error.name === 'AuthSessionMissingError' ||
    // gotrue sometimes surfaces this as 400 with no session — not a deleted-user case
    (error.status === 400 && msg.includes('session'))
  );
}

/**
 * Wipe every ShipOS key from localStorage so no data bleeds
 * between different users or browser sessions.
 */
function clearAllAppData() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('shipos_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isMockMode = !supabase;

  useEffect(() => {
    if (isMockMode) {
      // Mock Auth Mode Initialization
      const storedMockUser = localStorage.getItem('shipos_mock_user');
      if (storedMockUser) {
        try {
          const parsed = JSON.parse(storedMockUser);
          setUser(parsed);
          // Create a mock session object
          setSession({
            access_token: 'mock_token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock_refresh',
            user: parsed
          } as Session);
        } catch (e) {
          localStorage.removeItem('shipos_mock_user');
        }
      }
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        // getSession recovers OAuth hash tokens and reads localStorage.
        // Do NOT call getUser() first — with no session yet it returns
        // "Auth session missing" (400) and the old code force-signed users out
        // during the Google redirect race (common on desktop).
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (cancelled) return;

        if (sessionError) {
          console.warn('[AuthProvider] getSession error:', sessionError.message);
          const msg = (sessionError.message || '').toLowerCase();
          if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many')) {
            clearSupabaseAuthStorage();
            if (!hasPendingAuthCallback()) {
              setSession(null);
              setUser(null);
              setLoading(false);
              return;
            }
          }
        }

        // Always strip auth fragments after Supabase has had a chance to consume them.
        // On /reset-password, only strip once a session exists — otherwise we can
        // wipe the recovery hash before gotrue finishes and updateUser fails.
        if (initialSession || !window.location.pathname.startsWith('/reset-password')) {
          stripAuthHashFromUrl();
        }

        if (!initialSession) {
          // PKCE code still exchanging — keep loading true until SIGNED_IN
          // (or until onAuthStateChange settles). Prevents ProtectedRoute from
          // bouncing to /login?redirect=...%3Fcode%3D... and burning the code.
          if (hasPendingAuthCallback()) {
            // Safety valve so we never hang on the spinner forever
            setTimeout(() => {
              if (!cancelled) setLoading(false);
            }, 12000);
            return;
          }
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Only validate with the server when we already have a local session.
        const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();

        if (cancelled) return;

        if (userError) {
          console.error('[AuthProvider] Supabase user check failed:', userError.message);

          // Missing session / network / rate-limit: keep local session if present.
          // Only hard-logout when the JWT is rejected or the user was deleted.
          if (
            !isMissingSessionError(userError) &&
            (userError.status === 403 || userError.status === 401)
          ) {
            await supabase.auth.signOut();
            clearAllAppData();
            if (!cancelled) {
              setSession(null);
              setUser(null);
              setLoading(false);
            }
            return;
          }

          setSession(initialSession);
          setUser(initialSession.user);
          setLoading(false);
          return;
        }

        setSession(initialSession);
        setUser(verifiedUser ?? initialSession.user);
        setLoading(false);
      } catch (err) {
        console.error('[AuthProvider] Error in auth init:', err);
        stripAuthHashFromUrl();
        if (!cancelled) setLoading(false);
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // When a session ends (sign-out, token expiry, etc.), wipe all local app data
      // so no user data is visible in the unauthenticated state.
      if (event === 'SIGNED_OUT') {
        clearProfileCache();
        resetSlideshowPrefetchCache();
        clearAllAppData();
        stripAuthHashFromUrl();
      }

      // Keep recovery hash until PASSWORD_RECOVERY so ResetPassword can detect it.
      // Stripping too early races updateUser() → "Auth session missing".
      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION' ||
        event === 'PASSWORD_RECOVERY'
      ) {
        stripAuthHashFromUrl();
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isMockMode]);

  const signInWithEmail = async (email: string, password: string) => {
    if (isMockMode) {
      // Mock Sign In
      if (email && password.length >= 6) {
        const mockUser: User = {
          id: 'mock-uuid-1234',
          email,
          user_metadata: { full_name: email.split('@')[0] },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('shipos_mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setSession({
          access_token: 'mock_token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock_refresh',
          user: mockUser
        } as Session);
        toast.info('Logged in with Demo Mode');
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials or password too short (min 6 chars).' };
    } else {
      // Supabase Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    if (isMockMode) {
      // Mock Sign Up
      if (email && password.length >= 6) {
        const mockUser: User = {
          id: 'mock-uuid-1234',
          email,
          user_metadata: { full_name: fullName || email.split('@')[0] },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('shipos_mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setSession({
          access_token: 'mock_token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock_refresh',
          user: mockUser
        } as Session);
        toast.info('Signed up and logged in with Demo Mode');
        return { success: true, requiresConfirmation: false };
      }
      return { success: false, error: 'Password must be at least 6 characters.' };
    } else {
      // Supabase Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0]
          }
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session) {
        return { success: true, requiresConfirmation: false };
      } else {
        // Confirmation email might be enabled
        toast.success('Registration successful! Please check your email for confirmation link.');
        return { success: true, requiresConfirmation: true };
      }
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    // Always land on /auth/callback so ProtectedRoute never races the PKCE code exchange.
    const callbackUrl = `${window.location.origin}/auth/callback`;
    if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
      sessionStorage.setItem('shipos_oauth_redirect', redirectTo);
    } else if (redirectTo?.includes(window.location.origin)) {
      try {
        const path = new URL(redirectTo).pathname + new URL(redirectTo).search;
        if (path && path !== '/auth/callback') {
          sessionStorage.setItem('shipos_oauth_redirect', path);
        }
      } catch {
        /* ignore */
      }
    }
    if (isMockMode) {
      // Mock Google Sign In
      const mockUser: User = {
        id: 'mock-uuid-google',
        email: 'google.user@example.com',
        user_metadata: { full_name: 'Google User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('shipos_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({
        access_token: 'mock_token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock_refresh',
        user: mockUser
      } as Session);
      toast.info('Logged in with Demo Mode (Google OAuth)');
      return { success: true, redirecting: false };
    } else {
      // Supabase Google Sign In (PKCE — redirect URL must stay on this origin)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            prompt: 'select_account',
          },
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, redirecting: true };
    }
  };

  const signOut = async () => {
    if (isMockMode) {
      clearAllAppData();
      setUser(null);
      setSession(null);
      toast.info('Logged out from Demo Mode');
    } else {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(`Sign out error: ${error.message}`);
      } else {
        clearAllAppData();
        setUser(null);
        setSession(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isMockMode,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
