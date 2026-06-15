-- Add limit configuration columns to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_workspaces INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_connections INTEGER DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_bulk_posts INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_monthly_posts INTEGER DEFAULT 200;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_slideshow_slides INTEGER DEFAULT 0;

-- Backfill existing profiles with their tier limits
UPDATE public.profiles
SET max_workspaces = CASE WHEN lower(plan) = 'pro' THEN 999999 WHEN lower(plan) = 'creator' THEN 5 ELSE 1 END,
    max_connections = CASE WHEN lower(plan) = 'pro' THEN 999999 WHEN lower(plan) = 'creator' THEN 15 ELSE 5 END,
    max_bulk_posts = CASE WHEN lower(plan) = 'pro' THEN 50 WHEN lower(plan) = 'creator' THEN 25 ELSE 10 END,
    max_monthly_posts = CASE WHEN lower(plan) = 'pro' OR lower(plan) = 'creator' THEN 999999 ELSE 200 END,
    max_slideshow_slides = CASE WHEN lower(plan) = 'pro' THEN 10 WHEN lower(plan) = 'creator' THEN 5 ELSE 0 END;

-- Update trigger function for new users to initialize limits
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

  RETURN NEW;
END;
$function$
;

-- Update trigger function to protect columns from client writes
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_privileged boolean;
begin
  v_privileged :=
    auth.role() = 'service_role'
    or coalesce(current_setting('app.allow_privileged_profile_write', true), '') = 'on';

  if v_privileged then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Clients may never self-provision a paid plan or credits or custom limits.
    new.plan := 'Free';
    new.ai_credits := 0;
    new.max_workspaces := 1;
    new.max_connections := 5;
    new.max_bulk_posts := 10;
    new.max_monthly_posts := 200;
    new.max_slideshow_slides := 0;
  else -- UPDATE
    new.plan := old.plan;
    new.ai_credits := old.ai_credits;
    new.max_workspaces := old.max_workspaces;
    new.max_connections := old.max_connections;
    new.max_bulk_posts := old.max_bulk_posts;
    new.max_monthly_posts := old.max_monthly_posts;
    new.max_slideshow_slides := old.max_slideshow_slides;
  end if;

  return new;
END;
$function$
;

-- Update the set_user_plan function to provision correct limits
CREATE OR REPLACE FUNCTION public.set_user_plan(p_plan text)
 RETURNS public.profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_norm text;
  v_current text;
  v_is_upgrade boolean;
  v_row public.profiles;
  
  v_max_workspaces integer;
  v_max_connections integer;
  v_max_bulk_posts integer;
  v_max_monthly_posts integer;
  v_max_slideshow_slides integer;
BEGIN
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Normalise to the canonical capitalisation we store.
  v_norm := case lower(coalesce(p_plan, ''))
    when 'pro' then 'Pro'
    when 'creator' then 'Creator'
    when 'starter' then 'Starter'
    when 'free' then 'Free'
    else null
  end;

  if v_norm is null then
    raise exception 'Invalid plan: %', p_plan;
  end if;

  select plan into v_current from public.profiles where id = v_uid;

  -- Upgrade (or first-time provisioning from Free/NULL) grants the new allowance.
  v_is_upgrade := plan_rank(v_norm) > plan_rank(v_current);

  -- Determine limits dynamically based on plan
  v_max_workspaces := case lower(v_norm)
    when 'pro' then 999999
    when 'creator' then 5
    else 1
  end;

  v_max_connections := case lower(v_norm)
    when 'pro' then 999999
    when 'creator' then 15
    else 5
  end;

  v_max_bulk_posts := case lower(v_norm)
    when 'pro' then 50
    when 'creator' then 25
    else 10
  end;

  v_max_monthly_posts := case lower(v_norm)
    when 'pro' then 999999
    when 'creator' then 999999
    else 200
  end;

  v_max_slideshow_slides := case lower(v_norm)
    when 'pro' then 10
    when 'creator' then 5
    else 0
  end;

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  if v_is_upgrade then
    -- Grant the new allowance and start a fresh monthly billing cycle.
    update public.profiles
       set plan = v_norm,
           ai_credits = plan_allowance(v_norm),
           credits_renews_at = now() + interval '1 month',
           max_workspaces = v_max_workspaces,
           max_connections = v_max_connections,
           max_bulk_posts = v_max_bulk_posts,
           max_monthly_posts = v_max_monthly_posts,
           max_slideshow_slides = v_max_slideshow_slides,
           updated_at = now()
     where id = v_uid
    returning * into v_row;
  else
    -- Same plan or downgrade: change the label and limits, never refill credits or reset the cycle.
    update public.profiles
       set plan = v_norm,
           max_workspaces = v_max_workspaces,
           max_connections = v_max_connections,
           max_bulk_posts = v_max_bulk_posts,
           max_monthly_posts = v_max_monthly_posts,
           max_slideshow_slides = v_max_slideshow_slides,
           updated_at = now()
     where id = v_uid
    returning * into v_row;
  end if;

  return v_row;
END;
$function$
;
