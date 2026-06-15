-- Add the missing `color` column to workspaces.
--
-- The frontend (WorkspaceContext) selects `color` and the UI renders workspace
-- icons with it, but the column was never created and create_workspace ignored
-- its p_color argument. The result: `select id,name,logo_url,color` returned a
-- 400 ("column workspaces.color does not exist"), the whole workspace fetch
-- failed, and creating a new workspace made the existing "Main" workspace
-- appear to vanish (state was never repopulated).

-- 1. Add the column (idempotent).
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS color text;

-- 2. Persist p_color in create_workspace so new workspaces store their color.
CREATE OR REPLACE FUNCTION public.create_workspace(p_name text, p_color text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_logo_url text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_workspace_id UUID;
  v_workspace public.workspaces;
BEGIN
  -- Insert name, logo_url and color into workspaces
  INSERT INTO public.workspaces (owner_id, name, logo_url, color)
  VALUES (auth.uid(), p_name, p_logo_url, p_color)
  RETURNING id INTO v_workspace_id;

  -- Add creator as Owner in workspace_members with active status
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (v_workspace_id, auth.uid(), 'owner', 'active')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Return the created workspace row as JSON
  SELECT * INTO v_workspace FROM public.workspaces WHERE id = v_workspace_id;

  RETURN row_to_json(v_workspace);
END;
$function$
;
