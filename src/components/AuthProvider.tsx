import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
    } else {
      // Real Supabase Auth Mode Initialization
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((err) => {
        console.error('Error fetching Supabase session:', err);
        setLoading(false);
      });

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // When a session ends (sign-out, token expiry, etc.), wipe all local app data
        // so no user data is visible in the unauthenticated state.
        if (event === 'SIGNED_OUT') {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('shipos_')) keysToRemove.push(key);
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
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
    const targetUrl = redirectTo || (window.location.origin + '/create-post');
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
      // Supabase Google Sign In
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetUrl
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, redirecting: true };
    }
  };

  /**
   * Wipe every ShipOS key from localStorage so no data bleeds
   * between different users or browser sessions.
   */
  const clearAllAppData = () => {
    // Collect all shipos_* keys first, then remove them
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('shipos_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
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
