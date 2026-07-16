import { createClient } from '@supabase/supabase-js';
import { clearSupabaseAuthStorage } from '@/lib/authCallback';

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
 * Bookmarked Google OAuth URLs look like:
 *   /create-post#access_token=...&expires_at=...
 * Those get re-ingested on every load → refresh 429 → "Not authenticated".
 *
 * Password reset / invite / magic-link emails use the same hash shape but with
 * type=recovery (etc). Those links are meant to be opened minutes later — do
 * NOT apply the "issued > 120s ago" OAuth heuristic to them or updateUser()
 * fails with "Auth session missing".
 */
function purgeStaleOAuthHashBeforeInit() {
  if (typeof window === 'undefined') return;

  const { hash, search, pathname } = window.location;
  const fromHash = hash && (hash.includes('access_token') || hash.includes('refresh_token'));
  // PKCE uses ?code= — leave that alone for gotrue to exchange.
  if (!fromHash) return;

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const type = (params.get('type') || '').toLowerCase();
  const expiresAt = Number(params.get('expires_at') || 0);
  const expiresIn = Number(params.get('expires_in') || 0);
  const now = Math.floor(Date.now() / 1000);

  const isEmailAuthFlow =
    type === 'recovery' ||
    type === 'invite' ||
    type === 'magiclink' ||
    type === 'email_change' ||
    type === 'signup' ||
    pathname.startsWith('/reset-password');

  const isActuallyExpired = expiresAt > 0 ? expiresAt < now - 60 : false;

  if (isEmailAuthFlow) {
    // Recovery links are valid until expires_at (often ~1h). Only drop them
    // when they're truly expired — never because they were issued >2 minutes ago.
    if (!isActuallyExpired) return;

    console.warn('[supabase] Dropping expired recovery/email auth hash', { type, expiresAt, now });
    clearSupabaseAuthStorage();
    window.history.replaceState(null, '', pathname + search);
    return;
  }

  // Implicit-flow OAuth fragments (no type / type absent): drop if expired OR
  // issued more than ~2 minutes ago (Chrome history restore of old login URLs).
  const isExpired = expiresAt > 0 ? isActuallyExpired : true;
  const issuedAt = expiresAt > 0 && expiresIn > 0 ? expiresAt - expiresIn : 0;
  const isOldIssue = issuedAt > 0 && now - issuedAt > 120;

  if (!isExpired && !isOldIssue) return;

  console.warn('[supabase] Dropping stale OAuth hash from URL before auth init', {
    expiresAt,
    now,
    issuedAt,
  });

  clearSupabaseAuthStorage();
  window.history.replaceState(null, '', pathname + search);
}

if (typeof window !== 'undefined') {
  // Never clear storage when ?code= is present: that storage contains the
  // PKCE verifier required to exchange the one-time authorization code.
  purgeStaleOAuthHashBeforeInit();
}

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
