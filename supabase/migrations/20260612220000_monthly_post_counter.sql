-- Add a posts_this_month counter to profiles so plan usage can be read instantly
-- from the profile row, instead of running a COUNT(*) over the posts table on
-- every limit check.
--
-- The counter is:
--   • Incremented by the trg_sync_monthly_post_count trigger on posts INSERT when
--     the new row is not a draft, and on status transitions draft → non-draft.
--   • Decremented on non-draft → draft transitions and on DELETE of non-draft rows.
--   • Reset to 0 by _renew_credits_if_due when the billing cycle rolls over.
--   • Backfilled from the existing posts table for current-cycle rows.
--   • Protected by protect_profile_privileged_columns (clients cannot set it directly).
--   • Used by enforce_monthly_post_limit (replaces the slow COUNT(*) query).

-- ── 1. Add the column ─────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists posts_this_month integer not null default 0;

-- ── 2. Trigger function: keep posts_this_month in sync ────────────────────────
create or replace function public.sync_monthly_post_count()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if tg_op = 'INSERT' then
    -- Only count non-draft posts against the monthly quota.
    if new.status <> 'draft' then
      update public.profiles
         set posts_this_month = greatest(0, posts_this_month + 1),
             updated_at = now()
       where id = new.user_id;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- draft → scheduled/posted: user consumed a slot
    if old.status = 'draft' and new.status <> 'draft' then
      update public.profiles
         set posts_this_month = greatest(0, posts_this_month + 1),
             updated_at = now()
       where id = new.user_id;
    -- scheduled/posted → draft: release the slot
    elsif old.status <> 'draft' and new.status = 'draft' then
      update public.profiles
         set posts_this_month = greatest(0, posts_this_month - 1),
             updated_at = now()
       where id = new.user_id;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    -- Deleting a scheduled/posted row frees the slot.
    if old.status <> 'draft' then
      update public.profiles
         set posts_this_month = greatest(0, posts_this_month - 1),
             updated_at = now()
       where id = old.user_id;
    end if;
    return old;
  end if;

  return null;
end;
$$;

-- Attach AFTER trigger (safe to read current committed state from profiles).
drop trigger if exists trg_sync_monthly_post_count on public.posts;
create trigger trg_sync_monthly_post_count
  after insert or update of status or delete on public.posts
  for each row
  execute function public.sync_monthly_post_count();


-- ── 3. Protect the column against direct client writes ────────────────────────
-- Rebuild protect_profile_privileged_columns to include posts_this_month.
-- This replaces the version from 20260612200000_security_hardening.sql.
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
    new.max_slideshow_slides       := 0;
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
    new.max_slideshow_slides       := old.max_slideshow_slides;
    new.posts_this_month          := old.posts_this_month;
  end if;

  return new;
end;
$$;


-- ── 4. Reset counter on billing cycle rollover ────────────────────────────────
-- Replace _renew_credits_if_due to also zero out posts_this_month when a new
-- billing period starts.  All other behaviour is identical to the original.
create or replace function public._renew_credits_if_due(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_plan   text;
  v_renews timestamptz;
  v_next   timestamptz;
begin
  select plan, credits_renews_at into v_plan, v_renews
    from public.profiles where id = p_user_id for update;

  if v_plan is null or lower(v_plan) = 'free' then
    return;
  end if;

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  if v_renews is null then
    -- Backfill: anchor the cycle without altering the existing balance.
    update public.profiles
       set credits_renews_at = now() + interval '1 month'
     where id = p_user_id;
    return;
  end if;

  if now() >= v_renews then
    v_next := v_renews;
    while v_next <= now() loop
      v_next := v_next + interval '1 month';
    end loop;

    update public.profiles
       set ai_credits       = plan_allowance(v_plan),
           credits_renews_at = v_next,
           posts_this_month  = 0,          -- ← reset counter for the new cycle
           updated_at        = now()
     where id = p_user_id;
  end if;
end;
$$;


-- ── 5. Upgrade enforce_monthly_post_limit to use the counter ──────────────────
-- Replaces the version from 20260612210000_server_side_limit_triggers.sql.
-- Reading a single column is O(1); the old COUNT(*) was O(n posts this month).
create or replace function public.enforce_monthly_post_limit()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_profile public.profiles;
  v_limit   integer;
begin
  -- Drafts do not consume the monthly quota.
  if new.status = 'draft' then
    return new;
  end if;

  -- service_role (webhooks, admin functions) bypasses the limit check.
  if auth.role() = 'service_role' then
    return new;
  end if;

  select * into v_profile from public.profiles where id = new.user_id;

  if not found then
    return new;
  end if;

  v_limit := coalesce(v_profile.max_monthly_posts, 200);

  -- Unlimited plans (Pro / Creator) have a sentinel value >= 999999.
  if v_limit >= 999999 then
    return new;
  end if;

  -- Use the pre-computed counter — no COUNT(*) needed.
  if v_profile.posts_this_month >= v_limit then
    raise exception
      'Monthly post limit reached: your % plan allows % posts per billing cycle '
      'and you have already used %. Upgrade your plan in Settings to continue.',
      v_profile.plan, v_limit, v_profile.posts_this_month
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;


-- ── 6. Backfill posts_this_month from existing data ───────────────────────────
-- Count non-draft posts in the current billing cycle for each user.
-- For users with credits_renews_at we use the window [renews_at - 1 month, now()].
-- For Free-tier users without an anchor we use the current calendar month.
do $$
declare
  v_rec record;
  v_cycle_start timestamptz;
  v_count integer;
begin
  perform set_config('app.allow_privileged_profile_write', 'on', true);

  for v_rec in select id, credits_renews_at from public.profiles loop
    if v_rec.credits_renews_at is not null then
      v_cycle_start := v_rec.credits_renews_at - interval '1 month';
    else
      v_cycle_start := date_trunc('month', now());
    end if;

    select count(*) into v_count
      from public.posts
     where user_id  = v_rec.id
       and status  <> 'draft'
       and created_at >= v_cycle_start;

    update public.profiles
       set posts_this_month = greatest(0, coalesce(v_count, 0))
     where id = v_rec.id;
  end loop;
end;
$$;


-- ── 7. Lock down the new trigger function ─────────────────────────────────────
revoke execute on function public.sync_monthly_post_count() from public;
revoke execute on function public.sync_monthly_post_count() from authenticated;
grant  execute on function public.sync_monthly_post_count() to service_role;
