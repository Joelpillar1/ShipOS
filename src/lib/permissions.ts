import { useMemo } from 'react';
import { useTeam, TeamRole } from '@/context/TeamContext';

/**
 * Canonical role → capability matrix for workspace team members.
 *
 * This is the single source of truth the UI uses to enable/disable features.
 * The authoritative backstop is server-side: Row Level Security on
 * workspace_members / workspaces / posts and the edge functions. These flags
 * only decide what the UI *offers* — they are not a security boundary on their
 * own, but they must agree with the server so members never see actions that
 * will just fail.
 *
 * Roles (highest → lowest privilege):
 *   owner  — full control incl. billing, workspace deletion, ownership transfer
 *   admin  — manage connections, team, workspace settings; create & publish
 *   editor — create/edit/publish content and use AI; cannot manage the workspace
 *   viewer — read-only: view content, no create/AI/publish/management
 */
export interface Permissions {
  /** View posts, calendar, analytics, connected accounts (read-only). */
  canViewContent: boolean;
  /** Compose/edit posts and use AI (Create Post, Content Studio, Slideshow, Bulk). */
  canCreateContent: boolean;
  /** Save drafts, schedule, publish, delete, and "post now". */
  canPublishContent: boolean;
  /** Connect/disconnect social accounts and manage account groups. */
  canManageConnections: boolean;
  /** Invite/remove members and change member roles. */
  canManageTeam: boolean;
  /** Create and edit workspaces (name, logo, color). */
  canManageWorkspaceSettings: boolean;
  /** Delete a workspace / transfer ownership. */
  canDeleteWorkspace: boolean;
  /** View/change billing & plans. */
  canManageBilling: boolean;
}

export function getPermissions(role: TeamRole): Permissions {
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const isEditor = role === 'editor';

  const canCreate = isOwner || isAdmin || isEditor; // everyone except viewer
  const canManage = isOwner || isAdmin;             // owner + admin

  return {
    canViewContent: true,
    canCreateContent: canCreate,
    canPublishContent: canCreate,
    canManageConnections: canManage,
    canManageTeam: canManage,
    canManageWorkspaceSettings: canManage,
    canDeleteWorkspace: isOwner,
    canManageBilling: isOwner,
  };
}

/**
 * Permissions for the current user's *effective* role in the active workspace.
 * Effective role == real DB role, except an owner may preview a lower role
 * (see TeamContext); it can never grant more than the real role.
 */
export function usePermissions(): Permissions {
  const { currentUserRole } = useTeam();
  return useMemo(() => getPermissions(currentUserRole), [currentUserRole]);
}
