import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext } from '@/components/AuthProvider';
import { useWorkspace } from './WorkspaceContext';

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  userId?: string;       // auth.users id — undefined for pending invites
  name: string;
  email: string;
  role: TeamRole;
  status: 'active' | 'pending';
  avatarUrl?: string;
}

interface TeamContextType {
  members: TeamMember[];
  currentUserRole: TeamRole;
  currentUserId: string | null;  // the real authenticated user id
  loading: boolean;
  setCurrentUserRole: (role: TeamRole) => void;
  inviteMember: (name: string, email: string, role: TeamRole) => Promise<void>;
  updateMemberRole: (id: string, role: TeamRole) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  refetchMembers: () => Promise<void>;
}

// ─── Mock seed data (used when isMockMode = true) ─────────────────────────────
const DEFAULT_MEMBERS = (workspaceId: string): TeamMember[] => [
  {
    id: 'owner_' + workspaceId,
    name: 'Joel Pillar',
    email: 'joel@example.com',
    role: 'owner',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  },
  {
    id: 'admin_' + workspaceId,
    name: 'Alex Rivera',
    email: 'alex@example.com',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  },
  {
    id: 'editor_' + workspaceId,
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'editor',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 'viewer_' + workspaceId,
    name: 'Dave K.',
    email: 'dave@example.com',
    role: 'viewer',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
];

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const isMockMode = auth?.isMockMode ?? true;

  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace.id;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRoleState] = useState<TeamRole>('owner');

  // ─── HELPERS ────────────────────────────────────────────────────────────────
  const saveToLocalStorage = (newMembers: TeamMember[]) => {
    localStorage.setItem(`shipos_team_members_${workspaceId}`, JSON.stringify(newMembers));
  };

  const saveMembers = (newMembers: TeamMember[]) => {
    setMembers(newMembers);
    saveToLocalStorage(newMembers);
  };

  // ─── FETCH ──────────────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId);

    // Mock / unauthenticated fallback or non-UUID workspace (like 'personal')
    if (isMockMode || !user || !supabase || !isUuid) {
      const stored = localStorage.getItem(`shipos_team_members_${workspaceId}`);
      if (stored) {
        try { setMembers(JSON.parse(stored)); }
        catch { setMembers(DEFAULT_MEMBERS(workspaceId)); }
      } else {
        const initial = DEFAULT_MEMBERS(workspaceId);
        setMembers(initial);
        saveToLocalStorage(initial);
      }
      const storedRole = localStorage.getItem(`shipos_simulated_role_${workspaceId}`) as TeamRole;
      setCurrentUserRoleState(storedRole || 'owner');
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Fetch workspace_members rows for this workspace
    const { data: memberRows, error: memberError } = await supabase
      .from('workspace_members')
      .select('id, user_id, invited_email, role, status')
      .eq('workspace_id', workspaceId);

    if (memberError) {
      console.error('[TeamContext] fetch members error:', memberError.message);
      setLoading(false);
      return;
    }

    // 2. Fetch profiles for active members (has user_id)
    const userIds = (memberRows || [])
      .filter(m => m.user_id)
      .map(m => m.user_id as string);

    let profileMap: Record<string, { name: string; email: string }> = {};
    if (userIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      (profileRows || []).forEach(p => {
        profileMap[p.id] = { name: p.name || '', email: p.email || '' };
      });
    }

    // 3. Map to TeamMember shape
    const mapped: TeamMember[] = (memberRows || []).map(m => {
      const profile = m.user_id ? profileMap[m.user_id] : null;
      const displayName = profile?.name
        || (m.invited_email ? m.invited_email.split('@')[0] : 'Unknown');
      const displayEmail = profile?.email || m.invited_email || '';

      return {
        id: m.id,
        userId: m.user_id ?? undefined,
        name: displayName,
        email: displayEmail,
        role: m.role as TeamRole,
        status: m.status as 'active' | 'pending',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      };
    });

    setMembers(mapped);

    // 4. Derive current user's role from their own membership row
    //    But respect a locally overridden simulated role if set
    const myRow = memberRows?.find(m => m.user_id === user.id);
    if (myRow) {
      const simRole = localStorage.getItem(`shipos_simulated_role_${workspaceId}`) as TeamRole;
      // Use simulated role if it exists (allows owner to demo other role perspectives)
      setCurrentUserRoleState(simRole || (myRow.role as TeamRole));
    }

    setLoading(false);
  }, [user, isMockMode, workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ─── SET ROLE (simulator — affects UI only, not DB) ──────────────────────────
  const setCurrentUserRole = (role: TeamRole) => {
    setCurrentUserRoleState(role);
    localStorage.setItem(`shipos_simulated_role_${workspaceId}`, role);
  };

  // ─── INVITE ─────────────────────────────────────────────────────────────────
  const inviteMember = async (name: string, email: string, role: TeamRole): Promise<void> => {
    if (isMockMode || !user || !supabase) {
      saveMembers([
        ...members,
        {
          id: 'member_' + Date.now(),
          name,
          email,
          role,
          status: 'pending',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        },
      ]);
      return;
    }

    const { error } = await supabase.from('workspace_members').insert({
      workspace_id: workspaceId,
      invited_email: email,
      role,
      status: 'pending',
      invited_by: user.id,
    });

    if (error) throw new Error(error.message);
    await fetchMembers();
  };

  // ─── UPDATE ROLE ────────────────────────────────────────────────────────────
  const updateMemberRole = async (id: string, role: TeamRole): Promise<void> => {
    if (isMockMode || !supabase) {
      let updated: TeamMember[];
      if (role === 'owner') {
        // Transfer ownership: downgrade current owner → admin
        updated = members.map(m => {
          if (m.role === 'owner') return { ...m, role: 'admin' as TeamRole };
          if (m.id === id)       return { ...m, role: 'owner' as TeamRole };
          return m;
        });
        setCurrentUserRole('admin');
      } else {
        updated = members.map(m => (m.id === id ? { ...m, role } : m));
      }
      saveMembers(updated);
      return;
    }

    if (role === 'owner') {
      // Atomically transfer ownership using SECURITY DEFINER function
      const { error } = await supabase.rpc('transfer_workspace_ownership', {
        p_workspace_id: workspaceId,
        p_new_owner_member_id: id,
      });
      if (error) throw new Error(error.message);
      setCurrentUserRole('admin');
    } else {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', id)
        .eq('workspace_id', workspaceId);
      if (error) throw new Error(error.message);
    }

    await fetchMembers();
  };

  // ─── REMOVE MEMBER ──────────────────────────────────────────────────────────
  const removeMember = async (id: string): Promise<void> => {
    if (isMockMode || !supabase) {
      saveMembers(members.filter(m => m.id !== id));
      return;
    }

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) throw new Error(error.message);
    await fetchMembers();
  };

  return (
    <TeamContext.Provider
      value={{
        members,
        currentUserRole,
        currentUserId: user?.id ?? null,
        loading,
        setCurrentUserRole,
        inviteMember,
        updateMemberRole,
        removeMember,
        refetchMembers: fetchMembers,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within a TeamProvider');
  return context;
};
