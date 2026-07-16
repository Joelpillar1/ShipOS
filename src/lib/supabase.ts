import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file. Running in Mock/Demo Mode.'
  );
}

/**
 * Must run BEFORE createClient().
 *
 * Bookmarked / restored Google OAuth URLs look like:
 *   /create-post#access_token=...&expires_at=...
 * Supabase tries to ingest those tokens on init. If they're hours old it
 * attempts a refresh → 429 → every API call looks "Not authenticated".
 * Stripping an expired hash here prevents that loop entirely.
 */
function purgeStaleOAuthHashBeforeInit() {
  if (typeof window === 'undefined') return;

  const { hash, search } = window.location;
  const fromHash = hash && (hash.includes('access_token') || hash.includes('refresh_token'));
  // Legacy implicit-flow fragments only; PKCE uses ?code= which is single-use.
  if (!fromHash) return;

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const expiresAt = Number(params.get('expires_at') || 0);
  const expiresIn = Number(params.get('expires_in') || 0);
  const now = Math.floor(Date.now() / 1000);

  // Treat as stale if already expired (with a small clock-skew buffer) or
  // if expires_at is missing but the fragment is clearly an auth dump.
  const isExpired = expiresAt > 0 ? expiresAt < now - 60 : true;
  // Also stale if issued more than ~2 minutes ago (token lifetime 3600).
  const issuedAt = expiresAt > 0 && expiresIn > 0 ? expiresAt - expiresIn : 0;
  const isOldIssue = issuedAt > 0 && now - issuedAt > 120;

  if (!isExpired && !isOldIssue) return;

  console.warn(
    '[supabase] Dropping stale OAuth hash from URL before auth init',
    { expiresAt, now, issuedAt }
  );

  // Drop any poisoned local session that was saved from a previous failed ingest.
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.includes('auth-token')) {
        doomed.push(key);
      }
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }

  window.history.replaceState(null, '', window.location.pathname + search);
}

purgeStaleOAuthHashBeforeInit();

// Initialize the Supabase client if keys are present, otherwise return null for Mock/Demo mode
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // PKCE puts a one-time ?code= in the URL instead of reusable #access_token=
        // fragments that browsers restore from history and re-ingest forever.
        flowType: 'pkce',
      },
    })
  : null;
