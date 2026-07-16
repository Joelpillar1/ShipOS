import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { hasPendingAuthCallback } from '@/lib/authCallback';

/**
 * Dedicated Google / email OAuth landing page.
 *
 * Must NOT be wrapped in ProtectedRoute — otherwise a race redirects to
 * /login?redirect=/create-post?code=... and burns the one-time PKCE code.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;

    const finish = (fallback = '/create-post') => {
      if (cancelled) return;
      const dest = sessionStorage.getItem('shipos_oauth_redirect') || fallback;
      sessionStorage.removeItem('shipos_oauth_redirect');
      window.history.replaceState(null, '', '/auth/callback');
      navigate(dest, { replace: true });
    };

    const fail = (msg: string) => {
      if (cancelled) return;
      setMessage(msg);
      setTimeout(() => {
        if (!cancelled) navigate('/login', { replace: true });
      }, 2500);
    };

    const run = async () => {
      if (!supabase) {
        finish();
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get('error_description') || params.get('error');
      if (oauthError) {
        fail(oauthError);
        return;
      }

      // createClient({ detectSessionInUrl: true }) owns the PKCE exchange.
      // Poll its result instead of exchanging the same one-time code twice
      // (React StrictMode mounts effects twice in development).
      for (let i = 0; i < 80; i++) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) {
          console.error('[AuthCallback] session exchange failed:', error.message);
          fail(error.message || 'Sign-in failed. Please try again.');
          return;
        }
        if (session) {
          finish();
          return;
        }
        await new Promise((r) => setTimeout(r, 150));
      }

      if (hasPendingAuthCallback()) {
        fail('Sign-in timed out. Please try again.');
        return;
      }

      fail('Sign-in link expired. Redirecting to login…');
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
