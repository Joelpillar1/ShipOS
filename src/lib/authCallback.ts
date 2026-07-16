/**
 * Helpers for OAuth / PKCE / recovery URL handling.
 */

export function clearSupabaseAuthStorage() {
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
}

/** True when the current URL still has a one-time auth code or token fragment to consume. */
export function hasPendingAuthCallback(search = window.location.search, hash = window.location.hash): boolean {
  const params = new URLSearchParams(search);
  if (params.has('code')) return true;
  if (params.get('error') && (params.has('error_description') || params.has('error_code'))) {
    // OAuth error response — still "pending" so we don't bounce away before showing it
    return true;
  }
  const h = hash || '';
  return h.includes('access_token') || h.includes('refresh_token') || h.includes('type=recovery');
}

/** Strip PKCE/OAuth query params so redirects never bury `code` inside ?redirect=. */
export function pathWithoutAuthParams(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.delete('code');
  params.delete('state');
  ['error', 'error_code', 'error_description'].forEach((k) => params.delete(k));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
