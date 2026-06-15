// Warms a route's lazy-loaded code chunk before the user clicks, so the page mounts
// instantly on navigation instead of waiting on a chunk download. Each importer must
// match the dynamic import in App.tsx so Vite/Rollup reuses the same chunk (the `@/`
// alias resolves to the same module as App.tsx's `./pages/...`, so no duplicate bundle).
const routeImporters: Record<string, () => Promise<unknown>> = {
  "/create-post": () => import("@/pages/CreatePost"),
  "/content-studio": () => import("@/pages/ContentStudio"),
  "/slideshow-studio": () => import("@/pages/SlideshowStudio"),
  "/bulk-schedule": () => import("@/pages/BulkSchedule"),
  "/calendar": () => import("@/pages/Calendar"),
  "/scheduled": () => import("@/pages/Scheduled"),
  "/posted": () => import("@/pages/Posted"),
  "/drafts": () => import("@/pages/Drafts"),
  "/analytics": () => import("@/pages/Analytics"),
  "/connect-accounts": () => import("@/pages/ConnectAccounts"),
  "/posting-queue": () => import("@/pages/PostingQueue"),
  "/team": () => import("@/pages/Team"),
  "/workspaces": () => import("@/pages/Workspaces"),
  "/settings": () => import("@/pages/Settings"),
  "/help": () => import("@/pages/Help"),
};

const prefetched = new Set<string>();

/**
 * Prefetch the code chunk for a route. Safe to call repeatedly (deduped) and on any
 * URL — unknown paths are ignored. Fire-and-forget; a failed prefetch just falls back
 * to a normal load on click.
 */
export function prefetchRoute(url: string): void {
  const path = url.split("?")[0]; // strip query (e.g. /help?tab=feedback → /help)
  if (prefetched.has(path)) return;
  const importer = routeImporters[path];
  if (!importer) return;
  prefetched.add(path);
  importer().catch(() => prefetched.delete(path));
}
