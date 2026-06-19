-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Team Invitation Flow & Auto-claiming
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Update handle_new_user to claim pending invites on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_workspace_id uuid;
  v_name text;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Upsert profile row
  INSERT INTO public.profiles (id, name, username, email, plan, ai_credits, max_workspaces, max_connections, max_bulk_posts, max_monthly_posts, max_slideshow_slides)
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

  -- Create default workspace named "Main"
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (NEW.id, 'Main')
  RETURNING id INTO v_workspace_id;

  -- Add user as workspace owner with active status
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status, invited_by)
  VALUES (v_workspace_id, NEW.id, 'owner', 'active', NEW.id);

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

-- 2. Clean up previous webhook trigger function if it exists to avoid dependency on pg_net / app.supabase_url
DROP TRIGGER IF EXISTS on_workspace_member_invited ON public.workspace_members;
DROP FUNCTION IF EXISTS public.handle_workspace_member_invite_webhook();

