-- Enforce the per-plan workspace cap inside create_workspace (server-side).
--
-- Previously the max_workspaces limit was only checked in the client (WorkspaceContext.createWorkspace).
-- Because create_workspace is a SECURITY DEFINER RPC any signed-in user could call it directly
-- (e.g. supabase.rpc('create_workspace', ...)) and create unlimited workspaces, bypassing their
-- plan. This redefines the function to count the caller's OWNED workspaces and reject creation once
-- they reach profiles.max_workspaces — the authoritative, client-write-protected limit that is kept
-- in sync with the user's plan (Pro = unlimited, Creator = 5, Free/Starter = 1).
--
-- Owned-count semantics: the cap governs how many workspaces a user may create, so we count rows
-- where owner_id = auth.uid(). Workspaces the user merely belongs to as a team member don't count
-- against their own cap. The very first ("Main") workspace still succeeds because the count is 0.

CREATE OR REPLACE FUNCTION public.create_workspace(
  p_name text,
  p_color text DEFAULT NULL::text,
  p_description text DEFAULT NULL::text,
  p_logo_url text DEFAULT NULL::text
)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_workspace_id uuid;
  v_workspace public.workspaces;
  v_max integer;
  v_owned integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Authoritative per-plan limit (defaults to 1 if the profile row is somehow missing).
  SELECT COALESCE(max_workspaces, 1) INTO v_max
  FROM public.profiles
  WHERE id = v_uid;
  v_max := COALESCE(v_max, 1);

  -- How many workspaces this user already owns.
  SELECT count(*) INTO v_owned
  FROM public.workspaces
  WHERE owner_id = v_uid;

  IF v_owned >= v_max THEN
    RAISE EXCEPTION 'Workspace limit reached: your plan allows up to % workspace(s). Upgrade your plan to create more.', v_max
      USING ERRCODE = 'check_violation';
  END IF;

  -- Insert name, logo_url and color into workspaces
  INSERT INTO public.workspaces (owner_id, name, logo_url, color)
  VALUES (v_uid, p_name, p_logo_url, p_color)
  RETURNING id INTO v_workspace_id;

  -- Add creator as Owner in workspace_members with active status
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (v_workspace_id, v_uid, 'owner', 'active')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Return the created workspace row as JSON
  SELECT * INTO v_workspace FROM public.workspaces WHERE id = v_workspace_id;

  RETURN row_to_json(v_workspace);
END;
$function$
;
