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
  currentUserRole: TeamRole;     // effective role used by the UI (see realUserRole)
  realUserRole: TeamRole;        // the user's true, DB-authoritative role — never escalatable
  currentUserId: string | null;  // the real authenticated user id
  loading: boolean;
  setCurrentUserRole: (role: TeamRole) => void;
  inviteMember: (name: string, email: string, role: TeamRole) => Promise<void>;
  updateMemberRole: (id: string, role: TeamRole) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  resendInvite: (id: string) => Promise<void>;
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
  // The user's real, DB-authoritative role in this workspace. Governs enforcement
  // and can never be raised from the client.
  const [realUserRole, setRealUserRole] = useState<TeamRole>('owner');
  // The effective role used by the UI. Equals realUserRole, EXCEPT an owner may
  // "simulate" another role to preview what their team sees. Because only an
  // owner can simulate, this can never grant more access than realUserRole.
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
      // In mock/demo mode the local persona is always the workspace owner, so
      // simulating any role is allowed (this is the demo of the role simulator).
      const storedRole = localStorage.getItem(`shipos_simulated_role_${workspaceId}`) as TeamRole;
      setRealUserRole('owner');
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

    // 4. Derive the user's REAL role from their own membership row. This is the
    //    authoritative value — never trust a client-set simulated role to raise it.
    //    Default to the most-restrictive 'viewer' if no membership row is found.
    const myRow = memberRows?.find(m => m.user_id === user.id);
    const dbRole = (myRow?.role as TeamRole) || 'viewer';
    setRealUserRole(dbRole);

    if (dbRole === 'owner') {
      // Only an owner may preview other roles. Simulation is downgrade-only
      // (owner outranks everything) and affects this browser's UI only — never
      // the DB, which RLS protects regardless.
      const simRole = localStorage.getItem(`shipos_simulated_role_${workspaceId}`) as TeamRole | null;
      setCurrentUserRoleState(simRole || 'owner');
    } else {
      // Non-owners always see their true role. Clear any stale simulated value so
      // it can never linger and mislead the UI into showing forbidden actions.
      localStorage.removeItem(`shipos_simulated_role_${workspaceId}`);
      setCurrentUserRoleState(dbRole);
    }

    setLoading(false);
  }, [user, isMockMode, workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // ─── SET ROLE (simulator — affects UI only, not DB) ──────────────────────────
  // Only an owner may simulate a different perspective. This prevents a
  // viewer/editor/admin from escalating their own UI access by writing to
  // localStorage. RLS is the real backstop; here we refuse to even pretend.
  const setCurrentUserRole = (role: TeamRole) => {
    if (realUserRole !== 'owner') return;
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

    const { data: newMember, error } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        invited_email: email,
        role,
        status: 'pending',
        invited_by: user.id,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    // Call the Edge Function to send the invitation email
    const { error: inviteError } = await supabase.functions.invoke('send-invite', {
      body: {
        record: {
          id: newMember.id,
          workspace_id: workspaceId,
          invited_email: email,
          role,
          invited_by: user.id,
          status: 'pending',
        }
      }
    });

    if (inviteError) {
      console.error('[TeamContext] failed to send email invite:', inviteError);
      throw new Error(inviteError.message || 'Failed to send invitation email');
    }

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

  // ─── RESEND INVITATION ──────────────────────────────────────────────────────
  const resendInvite = async (id: string): Promise<void> => {
    if (isMockMode || !supabase) {
      return;
    }

    // Fetch the invitation details first
    const { data: member, error: fetchErr } = await supabase
      .from('workspace_members')
      .select('invited_email, role, invited_by')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (fetchErr || !member) {
      throw new Error(fetchErr?.message || 'Invitation not found');
    }

    // Update updated_at to trigger local state/timestamps
    const { error: updateErr } = await supabase
      .from('workspace_members')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (updateErr) throw new Error(updateErr.message);

    // Call the Edge Function to resend the invitation email
    const { error: inviteError } = await supabase.functions.invoke('send-invite', {
      body: {
        record: {
          id,
          workspace_id: workspaceId,
          invited_email: member.invited_email,
          role: member.role,
          invited_by: member.invited_by || user?.id,
          status: 'pending',
        }
      }
    });

    if (inviteError) {
      throw new Error(inviteError?.message || 'Failed to resend invitation email');
    }
  };

  return (
    <TeamContext.Provider
      value={{
        members,
        currentUserRole,
        realUserRole,
        currentUserId: user?.id ?? null,
        loading,
        setCurrentUserRole,
        inviteMember,
        updateMemberRole,
        removeMember,
        resendInvite,
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
