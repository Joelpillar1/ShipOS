import { useEffect, useRef } from "react";
import { getExternalId } from "@/lib/platforms";

/**
 * Auto-save & restore for in-progress, unpublished content on a page.
 *
 * Why: pages like Create Post / Bulk Schedule / Content Studio / Slideshow Studio keep the
 * user's work in volatile React state. Navigating away unmounts the page and the work is lost.
 * This hook mirrors a serializable snapshot of that work to localStorage so it can be restored
 * when the user returns, and clears it once the work is published/scheduled.
 *
 * Behaviour:
 *  - On mount: if a saved draft exists for the current user+workspace and `enabled` is true,
 *    `onRestore(saved)` is called exactly once so the page can hydrate its state.
 *  - On change: `data` is serialized (debounced) and written; when `isEmpty(data)` is true the
 *    key is removed instead, so an emptied page doesn't leave a stale draft behind.
 *  - `clearDraft()` removes the saved draft immediately — call it right after a successful
 *    publish/schedule so returning to the page starts fresh.
 *
 * Namespacing: keys are scoped per user + workspace via getExternalId(), matching the rest of
 * the app's localStorage conventions, so drafts never leak across accounts/workspaces.
 *
 * Media caveat: only JSON-serializable values survive. File objects and transient blob: URLs
 * cannot be persisted — pages should snapshot base64/data-URL previews only and accept that raw
 * File handles (needed for re-upload) won't be restored across a full reload.
 */
export interface UseAutosaveDraftOptions<T> {
  /** Stable identifier for the page, e.g. "create-post". Combined with user+workspace id. */
  pageKey: string;
  /** The current serializable snapshot of the page's in-progress content. */
  data: T;
  /** Called once on mount with a previously-saved snapshot, when one exists and enabled is true. */
  onRestore: (saved: T) => void;
  /** Whether autosave (writing) is active. Set false e.g. when editing an existing saved item. */
  enabled?: boolean;
  /**
   * Whether restoring a saved draft on mount is allowed. Defaults to `enabled`. Set false (while
   * keeping `enabled` true) when the page was opened with fresh hand-off content that should take
   * precedence over any previously-saved draft.
   */
  restoreEnabled?: boolean;
  /** Returns true when `data` holds nothing worth saving (so the key is removed instead). */
  isEmpty: (data: T) => boolean;
  /** Debounce window for writes, in ms. */
  debounceMs?: number;
}

export interface UseAutosaveDraftResult {
  /** Remove the saved draft for this page immediately. Call after a successful publish/schedule. */
  clearDraft: () => void;
}

const KEY_PREFIX = "shipos_autosave_";

export function useAutosaveDraft<T>(
  options: UseAutosaveDraftOptions<T>,
): UseAutosaveDraftResult {
  const { pageKey, data, onRestore, enabled = true, isEmpty, debounceMs = 600 } = options;
  const restoreEnabled = options.restoreEnabled ?? enabled;

  // Resolve the storage key lazily so it reflects the active user/workspace at mount.
  const storageKey = `${KEY_PREFIX}${pageKey}_${getExternalId()}`;
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  // Keep the latest onRestore without making the mount effect depend on it.
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  const hasRestoredRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  // Set by clearDraft() to stop the unmount/beforeunload flush from re-writing content we just
  // removed (publish flows call clearDraft() then navigate → unmount, often before the page's
  // state reset has re-rendered). Reset on the next genuine content change so editing persists again.
  const suppressFlushRef = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDraft = () => {
    suppressFlushRef.current = true;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    try {
      localStorage.removeItem(storageKeyRef.current);
    } catch {
      /* ignore */
    }
  };

  // Snapshot of everything writeNow() needs, refreshed every render so an unmount/beforeunload
  // flush always writes the LATEST state — not a stale closure.
  const serialized = (() => {
    try {
      return JSON.stringify(data);
    } catch {
      return "";
    }
  })();
  const latestRef = useRef({ serialized, empty: isEmpty(data), enabled, storageKey });
  latestRef.current = { serialized, empty: isEmpty(data), enabled, storageKey };

  // Write the current snapshot immediately (no debounce). Used by the debounce timer, by the
  // unmount flush, and by beforeunload — so the last edits survive even when the user navigates
  // away within the debounce window (the common "type then leave" case).
  const writeNow = () => {
    if (suppressFlushRef.current) return;
    const { serialized: s, empty, enabled: on, storageKey: key } = latestRef.current;
    if (!on) return;
    try {
      if (empty) {
        localStorage.removeItem(key);
      } else if (s) {
        localStorage.setItem(key, s);
      }
    } catch {
      // Likely a quota error from large base64 media — drop the write rather than throw.
    }
  };
  const writeNowRef = useRef(writeNow);
  writeNowRef.current = writeNow;

  // ── Restore once on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    if (!restoreEnabled) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as T;
      // The restore triggers a state update → a save effect run we must not let clobber the
      // draft with the still-empty initial data. Skip that one save.
      skipNextSaveRef.current = true;
      onRestoreRef.current(saved);
    } catch {
      /* corrupt draft — ignore and let it be overwritten */
    }
    // Intentionally mount-only: we restore a single time for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist on change (debounced) ──────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    // A real content change means the user is editing again after a clear — re-enable flushing.
    suppressFlushRef.current = false;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => writeNowRef.current(), debounceMs);

    // NOTE: deliberately no clearTimeout in cleanup here — the unmount flush below performs the
    // final write, so cancelling the timer on unmount would not lose data. We only clear the
    // timer when scheduling a newer one (above), which naturally supersedes the previous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, enabled, storageKey]);

  // ── Flush on unmount and on tab close/refresh ──────────────────────────────
  useEffect(() => {
    const onBeforeUnload = () => writeNowRef.current();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      // Persist the latest snapshot synchronously as the page unmounts (in-app navigation),
      // so edits made within the debounce window aren't lost.
      writeNowRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { clearDraft };
}
