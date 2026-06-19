-- 1. Create a SELECT policy on public.profiles to allow active members of shared workspaces to read each other's profiles
DROP POLICY IF EXISTS "profiles_select_workspace_members" ON public.profiles;
CREATE POLICY "profiles_select_workspace_members" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    profiles.id = auth.uid() OR
    EXISTS (
      SELECT 1 
      FROM public.workspace_members wm1
      JOIN public.workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid() 
        AND wm1.status = 'active'
        AND wm2.user_id = profiles.id
        AND wm2.status = 'active'
    )
  );

-- 2. Redefine handle_new_user to skip onboarding and personal workspace creation for users joining via pending invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_workspace_id uuid;
  v_name text;
  v_has_pending_invites boolean;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Check if there are any pending invitations for this email
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE invited_email = NEW.email 
      AND status = 'pending'
  ) INTO v_has_pending_invites;

  -- Upsert profile row.
  -- If they have pending invites, we set onboarding_complete to true in metadata
  -- in the backend so they skip the onboarding wizard on first login.
  IF v_has_pending_invites THEN
    NEW.raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('onboarding_complete', true);
  END IF;

  INSERT INTO public.profiles (
    id, name, username, email, plan, ai_credits, 
    max_workspaces, max_connections, max_bulk_posts, 
    max_monthly_posts, max_slideshow_slides
  )
  VALUES (
    NEW.id,
    v_name,
    COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'Free',
    0,
    1,
    5,
    10,
    200,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = COALESCE(EXCLUDED.name, profiles.name);

  -- ONLY create default "Main" workspace and owner membership if they are NOT joining via an invitation.
  IF NOT v_has_pending_invites THEN
    INSERT INTO public.workspaces (owner_id, name)
    VALUES (NEW.id, 'Main')
    RETURNING id INTO v_workspace_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, role, status, invited_by)
    VALUES (v_workspace_id, NEW.id, 'owner', 'active', NEW.id);
  END IF;

  -- Claim any pending workspace invitations
  UPDATE public.workspace_members
  SET user_id = NEW.id,
      status = 'active'
  WHERE invited_email = NEW.email
    AND status = 'pending';

  RETURN NEW;
END;
$function$
;
