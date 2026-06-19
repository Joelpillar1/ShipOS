-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add claim_pending_invitations RPC function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.claim_pending_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Link any pending invitations matching the current authenticated user's email
  UPDATE public.workspace_members
  SET user_id = auth.uid(),
      status = 'active'
  WHERE invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending';
END;
$$;

-- Grant execute access to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_pending_invitations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pending_invitations() TO service_role;
