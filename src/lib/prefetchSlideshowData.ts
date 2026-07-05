import type { QueryClient } from "@tanstack/react-query";
import { getSavedSlideshowSummaries, getSlideshowFolders } from "@/lib/postStorage";

const SLIDESHOW_STALE_TIME = 5 * 60 * 1000;
const prefetchedWorkspaces = new Set<string>();

/**
 * Warm the React Query cache for Slideshow Studio before navigation.
 * Safe to call repeatedly — deduped per workspace per session.
 */
export function prefetchSlideshowStudioData(
  queryClient: QueryClient,
  workspaceId: string
): void {
  const key = workspaceId || "personal";
  if (prefetchedWorkspaces.has(key)) return;
  prefetchedWorkspaces.add(key);

  void queryClient.prefetchQuery({
    queryKey: ["saved-slideshows", key],
    queryFn: () => getSavedSlideshowSummaries(key),
    staleTime: SLIDESHOW_STALE_TIME,
  });

  void queryClient.prefetchQuery({
    queryKey: ["slideshow-folders", key],
    queryFn: () => getSlideshowFolders(key),
    staleTime: SLIDESHOW_STALE_TIME,
  });
}

/** Clear dedupe state when switching accounts (AuthProvider sign-out). */
export function resetSlideshowPrefetchCache(): void {
  prefetchedWorkspaces.clear();
}

export { SLIDESHOW_STALE_TIME };
