import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/components/AuthProvider';
import { refreshConnectedAccounts } from '@/lib/platforms';

export interface Workspace {
  id: string;
  name: string;
  logoUrl?: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  loading: boolean;
  isSwitching: boolean;
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (name: string, logoUrl?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  refetchWorkspaces: () => Promise<void>;
}

const FALLBACK_WORKSPACE: Workspace = {
  id: 'personal',
  name: 'Main',
  logoUrl: 'home',
};

const DEFAULT_WORKSPACES: Workspace[] = [
  FALLBACK_WORKSPACE,
  {
    id: 'shipos_growth',
    name: 'ShipOS Growth',
    logoUrl: 'rocket',
  },
];

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Build a localStorage key that is scoped to both the authenticated user and
 * the workspace, so data never bleeds between different users sharing the
 * same browser.
 */
function wsKey(userId: string, suffix: string): string {
  return `shipos_${userId}_${suffix}`;
}

/**
 * Derive a stable user-id string from the AuthContext user object.
 * Falls back to 'anon' if no user is present (should never happen inside
 * a ProtectedRoute, but defensive).
 */
function getUserKey(user: { id: string } | null): string {
  return user?.id || 'anon';
}

// ──────────────────────────────────────────────────────────────────────────────

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const isMockMode = auth?.isMockMode ?? true;
  const authLoading = auth?.loading ?? true;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  // Brief flag set during workspace switch so the UI can render a smooth
  // transition instead of a jarring flash.
  const [isSwitching, setIsSwitching] = useState(false);

  // Derive the storage key prefix once per render so every read/write uses the
  // same user-scoped bucket.
  const uid = getUserKey(user);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    () => localStorage.getItem(wsKey(uid, 'active_workspace_id')) || 'personal'
  );

  const [prevUid, setPrevUid] = useState(uid);

  if (uid !== prevUid) {
    setPrevUid(uid);
    const savedId = localStorage.getItem(wsKey(uid, 'active_workspace_id')) || 'personal';
    setActiveWorkspaceId(savedId);
    localStorage.setItem('shipos_active_workspace_id', savedId);
  }

  useEffect(() => {
    localStorage.setItem(wsKey(uid, 'active_workspace_id'), activeWorkspaceId);
    localStorage.setItem('shipos_active_workspace_id', activeWorkspaceId);
  }, [activeWorkspaceId, uid]);

  // ─── FETCH ──────────────────────────────────────────────────────────────────
  const fetchWorkspaces = useCallback(async () => {
    // Don't run until auth has resolved — otherwise user is null and we
    // incorrectly hit the mock path and load DEFAULT_WORKSPACES.
    if (authLoading) return;

    // Mock / unauthenticated — use localStorage namespaced by user ID
    if (isMockMode || !user || !supabase) {
      const stored = localStorage.getItem(wsKey(uid, 'workspaces'));
      // Only use DEFAULT_WORKSPACES in true mock mode (no Supabase configured)
      const ws: Workspace[] = stored
        ? JSON.parse(stored)
        : isMockMode
          ? DEFAULT_WORKSPACES
          : [];
      
      // Auto-upgrade first workspace to Main/home if it doesn't match
      if (ws.length > 0 && (ws[0].name !== 'Main' || ws[0].logoUrl !== 'home')) {
        ws[0].name = 'Main';
        ws[0].logoUrl = 'home';
        localStorage.setItem(wsKey(uid, 'workspaces'), JSON.stringify(ws));
      }

      setWorkspaces(ws);
      const currentActiveId = localStorage.getItem(wsKey(uid, 'active_workspace_id')) || 'personal';
      if (!ws.find(w => w.id === currentActiveId)) {
        const fallbackId = ws[0]?.id || 'personal';
        localStorage.setItem(wsKey(uid, 'active_workspace_id'), fallbackId);
        localStorage.setItem('shipos_active_workspace_id', fallbackId);
        setActiveWorkspaceId(fallbackId);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch workspace memberships for current user
    const { data: memberRows, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id);

    if (memberError) {
      console.error('[WorkspaceContext] fetch memberships error:', memberError.message);
      setLoading(false);
      return;
    }

    const workspaceIds = (memberRows || []).map(m => m.workspace_id);
    if (workspaceIds.length === 0) {
      try {
        const { data, error: createError } = await supabase.rpc('create_workspace', {
          p_name: 'Main',
          p_color: '#d75a34',
          p_description: 'My main creator workspace',
          p_logo_url: 'home',
        });

        if (createError) throw createError;

        const newWs: Workspace = {
          id: data.id,
          name: data.name,
          logoUrl: data.logo_url ?? undefined,
        };

        localStorage.setItem(wsKey(uid, 'active_workspace_id'), newWs.id);
        localStorage.setItem('shipos_active_workspace_id', newWs.id);
        setActiveWorkspaceId(newWs.id);
        setWorkspaces([newWs]);
      } catch (err: any) {
        console.error('[WorkspaceContext] failed to auto-create workspace:', err.message);
        setWorkspaces([]);
      }
      setLoading(false);
      return;
    }

    // Fetch workspaces that the user is a member of
    const { data, error } = await supabase
      .from('workspaces')
      .select('id, name, logo_url')
      .in('id', workspaceIds)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[WorkspaceContext] fetch error:', error.message);
      setLoading(false);
      return;
    }

    const mapped: Workspace[] = (data || []).map(w => ({
      id: w.id,
      name: w.name,
      logoUrl: w.logo_url ?? undefined,
    }));

    if (mapped.length > 0 && (mapped[0].name !== 'Main' || mapped[0].logoUrl !== 'home')) {
      try {
        await supabase
          .from('workspaces')
          .update({ name: 'Main', logo_url: 'home' })
          .eq('id', mapped[0].id);
        mapped[0].name = 'Main';
        mapped[0].logoUrl = 'home';
      } catch (err: any) {
        console.error('[WorkspaceContext] failed to auto-upgrade default workspace to Main/home:', err.message);
      }
    }

    setWorkspaces(mapped);

    // Ensure activeWorkspaceId points to a valid workspace
    const currentActiveId = localStorage.getItem(wsKey(uid, 'active_workspace_id')) || 'personal';
    if (mapped.length > 0 && !mapped.find(w => w.id === currentActiveId)) {
      const firstId = mapped[0].id;
      localStorage.setItem(wsKey(uid, 'active_workspace_id'), firstId);
      localStorage.setItem('shipos_active_workspace_id', firstId);
      setActiveWorkspaceId(firstId);
    }

    setLoading(false);
  }, [user, isMockMode, uid, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // ─── DERIVED ────────────────────────────────────────────────────────────────
  // Note: we intentionally do NOT fall back to FALLBACK_WORKSPACE while the
  // workspaces array is still loading — that would cause a name/icon flash.
  // Instead we find the workspace in the current list; when the list is empty
  // (loading) we hold the previous value via the isSwitching gate below.
  const activeWorkspace =
    workspaces.find(w => w.id === activeWorkspaceId) ||
    workspaces[0] ||
    FALLBACK_WORKSPACE;

  // ─── SET ACTIVE ─────────────────────────────────────────────────────────────
  /**
   * Switch the active workspace. No page reload needed — `activeWorkspace` is
   * derived reactively from `workspaces` + `activeWorkspaceId`. We just flip
   * the state and let React re-render. `isSwitching` is set for 200 ms to let
   * the UI show a smooth transition.
   */
  const setActiveWorkspace = (id: string) => {
    if (id === activeWorkspaceId) return; // already active — no-op
    localStorage.setItem(wsKey(uid, 'active_workspace_id'), id);
    localStorage.setItem('shipos_active_workspace_id', id);
    refreshConnectedAccounts();
    setIsSwitching(true);
    setActiveWorkspaceId(id);
    // Hold the switching flag for 5 seconds so the skeleton loader remains visible.
    setTimeout(() => setIsSwitching(false), 5000);
  };

  // ─── CREATE ─────────────────────────────────────────────────────────────────
  const createWorkspace = async (
    name: string,
    logoUrl?: string
  ): Promise<Workspace> => {
    // Mock fallback
    if (isMockMode || !user || !supabase) {
      const newWs: Workspace = {
        id: 'ws_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name,
        logoUrl,
      };
      const updated = [...workspaces, newWs];
      setWorkspaces(updated);
      localStorage.setItem(wsKey(uid, 'workspaces'), JSON.stringify(updated));
      localStorage.setItem(wsKey(uid, 'active_workspace_id'), newWs.id);
      localStorage.setItem('shipos_active_workspace_id', newWs.id);
      setActiveWorkspaceId(newWs.id);
      return newWs;
    }

    // Supabase: use SECURITY DEFINER RPC that atomically creates workspace + owner row
    const { data, error } = await supabase.rpc('create_workspace', {
      p_name: name,
      p_color: '#d75a34',
      p_description: null,
      p_logo_url: logoUrl ?? null,
    });

    if (error) throw new Error(error.message);

    const newWs: Workspace = {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url ?? undefined,
    };

    localStorage.setItem(wsKey(uid, 'active_workspace_id'), newWs.id);
    localStorage.setItem('shipos_active_workspace_id', newWs.id);
    setActiveWorkspaceId(newWs.id);
    setWorkspaces(prev => [...prev, newWs]);
    return newWs;
  };

  // ─── UPDATE ─────────────────────────────────────────────────────────────────
  const updateWorkspace = async (id: string, updates: Partial<Workspace>): Promise<void> => {
    const isMain = workspaces.length > 0 && workspaces[0].id === id;
    const finalUpdates = { ...updates };
    if (isMain) {
      if (finalUpdates.name !== undefined) finalUpdates.name = 'Main';
      if (finalUpdates.logoUrl !== undefined) finalUpdates.logoUrl = 'home';
    }

    if (isMockMode || !supabase) {
      const updated = workspaces.map(w => (w.id === id ? { ...w, ...finalUpdates } : w));
      setWorkspaces(updated);
      localStorage.setItem(wsKey(uid, 'workspaces'), JSON.stringify(updated));
      return;
    }

    const dbUpdates: Record<string, unknown> = {};
    if (finalUpdates.name        !== undefined) dbUpdates.name        = finalUpdates.name;
    if (finalUpdates.logoUrl     !== undefined) dbUpdates.logo_url    = finalUpdates.logoUrl;

    const { error } = await supabase.from('workspaces').update(dbUpdates).eq('id', id);
    if (error) throw new Error(error.message);

    setWorkspaces(prev => prev.map(w => (w.id === id ? { ...w, ...finalUpdates } : w)));
  };

  // ─── DELETE ─────────────────────────────────────────────────────────────────
  const deleteWorkspace = async (id: string): Promise<void> => {
    if (workspaces.length <= 1) return; // Never delete the last workspace

    const isMain = workspaces.length > 0 && workspaces[0].id === id;
    if (isMain) {
      throw new Error("The default workspace 'Main' cannot be deleted.");
    }

    if (isMockMode || !supabase) {
      const remaining = workspaces.filter(w => w.id !== id);
      setWorkspaces(remaining);
      localStorage.setItem(wsKey(uid, 'workspaces'), JSON.stringify(remaining));
      if (activeWorkspaceId === id) {
        const fallback = remaining[0]?.id || 'personal';
        localStorage.setItem(wsKey(uid, 'active_workspace_id'), fallback);
        localStorage.setItem('shipos_active_workspace_id', fallback);
        setActiveWorkspaceId(fallback);
        // No reload — state update is sufficient
      }
      return;
    }

    const { error } = await supabase.from('workspaces').delete().eq('id', id);
    if (error) throw new Error(error.message);

    const remaining = workspaces.filter(w => w.id !== id);
    setWorkspaces(remaining);

    if (activeWorkspaceId === id) {
      const fallback = remaining[0]?.id || '';
      localStorage.setItem(wsKey(uid, 'active_workspace_id'), fallback);
      localStorage.setItem('shipos_active_workspace_id', fallback);
      window.location.reload();
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        isSwitching,
        setActiveWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        refetchWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
