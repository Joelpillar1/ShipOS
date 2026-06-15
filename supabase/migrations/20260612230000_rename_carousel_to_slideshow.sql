-- Rename the per-plan slide-limit column max_carousel_slides → max_slideshow_slides.
--
-- The earlier limit migrations (20260612150000 … 20260612220000) were edited in place to use
-- the new name, which is correct for any fresh `supabase db reset`. This migration handles
-- databases where those migrations were ALREADY applied (e.g. the hosted Supabase project):
-- it renames the existing column and re-creates every SECURITY DEFINER function that
-- referenced the old name, because a bare column rename does NOT rewrite plpgsql bodies and
-- they would fail at runtime ("record new has no field max_carousel_slides").
--
-- Everything is guarded / idempotent, so running it on a freshly reset database (where the
-- column is already max_slideshow_slides and the functions already match) is a harmless no-op.

-- ── 1. Rename the column if it still has the old name ─────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'profiles'
       and column_name  = 'max_carousel_slides'
  ) and not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'profiles'
       and column_name  = 'max_slideshow_slides'
  ) then
    alter table public.profiles rename column max_carousel_slides to max_slideshow_slides;
  end if;
end$$;


-- ── 2. Re-create the functions that referenced the column ─────────────────────
-- These are the latest versions of each function across all prior migrations, with the
-- column reference updated to max_slideshow_slides.

-- handle_new_user (latest: 20260612150000_profile_limits)
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


-- protect_profile_privileged_columns (latest: 20260612220000_monthly_post_counter)
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_privileged boolean;
begin
  v_privileged :=
    auth.role() = 'service_role'
    or coalesce(current_setting('app.allow_privileged_profile_write', true), '') = 'on';

  if v_privileged then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.plan                      := 'Free';
    new.ai_credits                := 0;
    new.plan_status               := 'inactive';
    new.dodo_customer_id          := null;
    new.dodo_subscription_id      := null;
    new.has_used_trial            := false;
    new.pending_plan              := null;
    new.pending_plan_effective_at := null;
    new.max_workspaces            := 1;
    new.max_connections           := 5;
    new.max_bulk_posts            := 10;
    new.max_monthly_posts         := 200;
    new.max_slideshow_slides      := 0;
    new.posts_this_month          := 0;
  else -- UPDATE: revert every privileged column to its stored value
    new.plan                      := old.plan;
    new.ai_credits                := old.ai_credits;
    new.plan_status               := old.plan_status;
    new.dodo_customer_id          := old.dodo_customer_id;
    new.dodo_subscription_id      := old.dodo_subscription_id;
    new.has_used_trial            := old.has_used_trial;
    new.pending_plan              := old.pending_plan;
    new.pending_plan_effective_at := old.pending_plan_effective_at;
    new.max_workspaces            := old.max_workspaces;
    new.max_connections           := old.max_connections;
    new.max_bulk_posts            := old.max_bulk_posts;
    new.max_monthly_posts         := old.max_monthly_posts;
    new.max_slideshow_slides      := old.max_slideshow_slides;
    new.posts_this_month          := old.posts_this_month;
  end if;

  return new;
end;
$$;


-- _apply_pending_downgrade_if_due (latest: 20260612160000_pending_downgrades_self_healing)
create or replace function public._apply_pending_downgrade_if_due(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_plan text;
  v_pending_plan text;
  v_pending_at timestamp with time zone;

  v_max_workspaces integer;
  v_max_connections integer;
  v_max_bulk_posts integer;
  v_max_monthly_posts integer;
  v_max_slideshow_slides integer;
  v_allowance integer;
begin
  -- Fetch current plan info
  select plan, pending_plan, pending_plan_effective_at
    into v_plan, v_pending_plan, v_pending_at
    from public.profiles
   where id = p_user_id;

  -- If a pending plan exists and its effective date has passed, apply it
  if v_pending_plan is not null and v_pending_at is not null and now() >= v_pending_at then
    -- Normalise to canonical capitalisation
    v_pending_plan := case lower(coalesce(v_pending_plan, ''))
      when 'pro' then 'Pro'
      when 'creator' then 'Creator'
      when 'starter' then 'Starter'
      else 'Free'
    end;

    -- Determine limits dynamically based on the pending plan
    v_max_workspaces := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 5
      else 1
    end;

    v_max_connections := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 15
      else 5
    end;

    v_max_bulk_posts := case lower(v_pending_plan)
      when 'pro' then 50
      when 'creator' then 25
      else 10
    end;

    v_max_monthly_posts := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 999999
      else 200
    end;

    v_max_slideshow_slides := case lower(v_pending_plan)
      when 'pro' then 10
      when 'creator' then 5
      else 0
    end;

    -- Determine credit allowance for the new plan
    v_allowance := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 400
      when 'starter' then 100
      else 0
    end;

    -- Bypass client protection using transaction session local settings
    perform set_config('app.allow_privileged_profile_write', 'on', true);

    -- Apply the plan downgrade, update corresponding limits and allowances, and clear scheduled metadata
    update public.profiles
       set plan = v_pending_plan,
           ai_credits = v_allowance,
           credits_renews_at = now() + interval '1 month',
           max_workspaces = v_max_workspaces,
           max_connections = v_max_connections,
           max_bulk_posts = v_max_bulk_posts,
           max_monthly_posts = v_max_monthly_posts,
           max_slideshow_slides = v_max_slideshow_slides,
           pending_plan = null,
           pending_plan_effective_at = null,
           updated_at = now()
     where id = p_user_id;
  end if;
end;
$$;


-- admin_apply_subscription (latest: 20260612170000_admin_apply_subscription_limits)
create or replace function public.admin_apply_subscription(
  p_user_id uuid,
  p_plan text,
  p_status text,
  p_subscription_id text default null,
  p_customer_id text default null,
  p_pending_plan text default null,
  p_pending_plan_effective_at timestamp with time zone default null
)
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_norm text;
  v_status text := lower(coalesce(p_status, ''));
  v_row public.profiles;

  v_max_workspaces integer;
  v_max_connections integer;
  v_max_bulk_posts integer;
  v_max_monthly_posts integer;
  v_max_slideshow_slides integer;
begin
  if p_user_id is null then
    raise exception 'admin_apply_subscription: p_user_id is required';
  end if;

  v_norm := case lower(coalesce(p_plan, ''))
    when 'pro' then 'Pro'
    when 'creator' then 'Creator'
    when 'starter' then 'Starter'
    when 'free' then 'Free'
    else null
  end;

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  if v_status in ('active', 'trialing') then
    if v_norm is null or v_norm = 'Free' then
      raise exception 'admin_apply_subscription: active subscription requires a paid plan, got %', p_plan;
    end if;

    -- Determine limits dynamically based on the plan being applied
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

    -- Grant the plan. Refill credits + reset the cycle ONLY when the plan actually changes
    -- (v_norm <> existing plan: new subscription, upgrade, or downgrade). Same-plan events
    -- (card/address updates, renewals, recovered payments) preserve the current balance; renewals
    -- refill on read via _renew_credits_if_due.
    update public.profiles
       set plan = v_norm,
           plan_status = v_status,
           ai_credits = case when v_norm <> plan then plan_allowance(v_norm) else ai_credits end,
           credits_renews_at = case when v_norm <> plan then now() + interval '1 month' else credits_renews_at end,
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           pending_plan = p_pending_plan,
           pending_plan_effective_at = p_pending_plan_effective_at,
           max_workspaces = v_max_workspaces,
           max_connections = v_max_connections,
           max_bulk_posts = v_max_bulk_posts,
           max_monthly_posts = v_max_monthly_posts,
           max_slideshow_slides = v_max_slideshow_slides,
           has_used_trial = true,
           updated_at = now()
     where id = p_user_id
    returning * into v_row;

  elsif v_status in ('past_due', 'on_hold', 'failed') then
    update public.profiles
       set plan_status = 'past_due',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           updated_at = now()
     where id = p_user_id
    returning * into v_row;

  elsif v_status = 'cancelled' then
    -- Cancellation scheduled: keep the plan and credits until the subscription actually ends.
    -- Flag the status only, so the user retains the access they have paid for.
    update public.profiles
       set plan_status = 'cancelled',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           pending_plan = p_pending_plan,
           pending_plan_effective_at = p_pending_plan_effective_at,
           updated_at = now()
     where id = p_user_id
    returning * into v_row;

  else -- 'expired' / 'ended' / any terminal status → the subscription has truly ended: downgrade.
    update public.profiles
       set plan = 'Free',
           ai_credits = 0,
           plan_status = 'inactive',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           pending_plan = null,
           pending_plan_effective_at = null,
           max_workspaces = 1,
           max_connections = 5,
           max_bulk_posts = 10,
           max_monthly_posts = 200,
           max_slideshow_slides = 0,
           updated_at = now()
     where id = p_user_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;
