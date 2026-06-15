-- Security hardening: fix a privilege-escalation hole in the workspace_members
-- UPDATE policy found in the pre-launch audit.
--
-- The original policy (20260608135902_remote_schema.sql:475) was:
--
--   create policy "workspace_members_update" on public.workspace_members
--     for UPDATE
--     using (is_workspace_admin_or_owner(auth.uid(), workspace_id));
--
-- It had a USING clause but NO WITH CHECK, and the USING clause did not exclude
-- the owner's row. That allowed a workspace *admin* (not just the owner) to:
--   1. Promote themselves or any member to role = 'owner' via a raw UPDATE,
--      bypassing the transfer_workspace_ownership() SECURITY DEFINER guard, so a
--      workspace could end up with two owners or a hijacked owner.
--   2. Demote the existing owner (set the owner's row to a lower role), since the
--      USING clause let an admin target the owner's row (unlike the DELETE policy,
--      which already excludes owner rows).
--   3. Move a member row into a different workspace by changing workspace_id
--      (the new workspace_id was never validated).
--
-- Fix: rewrite the policy to mirror the (correct) DELETE policy and add a
-- WITH CHECK on the resulting row.
--   USING       — owners may target any row; admins may target only non-owner rows
--                 (protects the owner's row from admin tampering).
--   WITH CHECK  — the resulting row must still belong to a workspace the caller
--                 admins (blocks moving rows into a foreign workspace) AND the new
--                 role may never be 'owner' (ownership transfers must go through
--                 transfer_workspace_ownership, which runs SECURITY DEFINER and
--                 therefore bypasses this policy).
--
-- Legitimate client flows are unaffected:
--   * TeamContext.updateMemberRole() promotes to owner ONLY via the
--     transfer_workspace_ownership RPC (RLS-bypassing), never a raw UPDATE.
--   * All other role changes set admin/editor/viewer (never 'owner') and keep the
--     same workspace_id.

drop policy if exists "workspace_members_update" on public.workspace_members;

create policy "workspace_members_update" on public.workspace_members
  as PERMISSIVE
  for UPDATE
  to public
  using (
    is_workspace_owner(auth.uid(), workspace_id)
    OR (is_workspace_admin_or_owner(auth.uid(), workspace_id) AND role <> 'owner'::text)
  )
  with check (
    is_workspace_admin_or_owner(auth.uid(), workspace_id)
    AND role <> 'owner'::text
  );
